import Horse from '../figures/horse'
import Queen from '../figures/queen'
import Bishop from '../figures/bishop'
import Rook from '../figures/rook'
import King from '../figures/king'
import Pawn from '../figures/pawn'
import HistoryGame from '../core/history.game'
import { cloneDeep } from 'lodash'

export default class BoardModel {
    // startPosition  = [
    //     [[Rook, 'black'], [Horse, 'black'], [Bishop, 'black'], [Queen, 'black'], [King, 'black'], [Bishop, 'black'], [Horse, 'black'], [Rook, 'black']],
    //     [[Pawn, 'black'], [Pawn, 'black'], [Pawn, 'black'], [Pawn, 'black'], [Pawn, 'black'], [Pawn, 'black'], [Pawn, 'black'], [Pawn, 'black']],
    //     [0, 0, 0, 0, 0, 0, 0, 0],
    //     [0, 0, 0, 0, 0, 0, 0, 0],
    //     [0, 0, 0, 0, 0, 0, 0, 0],
    //     [0, 0, 0, 0, 0, 0, 0, 0],
    //     [[Pawn, 'white'], [Pawn, 'white'], [Pawn, 'white'], [Pawn, 'white'], [Pawn, 'white'], [Pawn, 'white'], [Pawn, 'white'], [Pawn, 'white']],
    //     [[Rook, 'white'], [Horse, 'white'], [Bishop, 'white'], [Queen, 'white'], [King, 'white'], [Bishop, 'white'], [Horse, 'white'], [Rook, 'white']]
    // ]

    startPosition = [
        [[Rook, 'black'], [Horse, 'black'], [Bishop, 'black'], [Queen, 'black'], [King, 'black'], [Bishop, 'black'], [Horse, 'black'], [Rook, 'black']],
        [[Pawn, 'black'], [Pawn, 'black'], 0, 0, 0, 0, [Pawn, 'black'], [Pawn, 'black']],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [[Pawn, 'white'], [Pawn, 'white'], 0, 0, 0, 0, [Pawn, 'white'], [Pawn, 'white']],
        [[Rook, 'white'], 0, 0, 0, [King, 'white'], [Bishop, 'white'], [Horse, 'white'], [Rook, 'white']]
    ]

    constructor() {
        this.cells = new Array(8).fill(0).map(() => new Array(8).fill(0))
        this.history = new HistoryGame()
        this.figures = this.parseBoard(this.startPosition)

        this.isCheck = false
        window.model = this
    }

    clearCells(arg = []) {
        this.cells = this.cells.map((column) => column.map((cell) => arg.includes(cell) ? cell : 0))
    }

    parseBoard(startPosition) {
        return startPosition.map((row, y) => {
            return row.map((figure, x) => {
                if (!figure) return 0
                const [type, color] = figure
                return new type({ color, x, y })
            })
        })
    }

    showPrevStep({ from, to }) {
        this.clearCells(['check'])
        this.setCellState([from.x, from.y], 'movement')
        this.setCellState([to.x, to.y], 'movement')
    }

    changeFigurePos(sourceX, sourceY, targetX, targetY, insteadCell = 0) {
        const movingFigure = this.figures[sourceY][sourceX]
        const replacedCell = this.figures[targetY][targetX]

        movingFigure.position = { x: targetX, y: targetY }
        this.figures[targetY][targetX] = movingFigure
        this.figures[sourceY][sourceX] = insteadCell

        return replacedCell
    }

    simulateStep(figure, [cellPosX, cellPosY]) {
        const { x: figurePosX, y: figurePosY } = figure.position
        const replacedCell = this.changeFigurePos(figurePosX, figurePosY, cellPosX, cellPosY)
        const checkedKings = this.getCheckState()
        console.log(checkedKings)
        this.changeFigurePos(cellPosX, cellPosY, figurePosX, figurePosY, replacedCell)
        return !(checkedKings[0] && checkedKings[0].color === figure.color )
    }

    getPossibleMovement(figure, data) {
        data.moves = data.moves.filter(cell => this.simulateStep(figure, cell))
        data.kills = data.kills.filter(cell => this.simulateStep(figure, cell))
        if (data.castling) data.castling = data.castling.filter(castlingStep => {
            return this.simulateStep(castlingStep.king.figure, castlingStep.king.newPosition)
                && this.simulateStep(castlingStep.rook.figure, castlingStep.rook.newPosition)
        })
        return data
    }

    setCellState(cell, state) {
        const [x, y] = cell
        this.cells[y][x] = state
    }

    parseMovementCells(figure) {
        const { x, y } = figure.position
        const allMovement = figure.getPossibleSteps(this.figures)
        const possibleMovement = this.getPossibleMovement(figure, allMovement)

        if (!this.isCheck || this.figures[y][x].type !== 'king') {
            this.setCellState([x, y], 'selected')
        }

        possibleMovement.moves.map(cell => {
            const [_, cellPosY] = cell
            if (figure.type === 'pawn' && figure.movement.swap === cellPosY) {
                this.setCellState(cell, 'swap')
            } else {
                this.setCellState(cell, 'active')
            }
        })
        possibleMovement.kills.map(cell => {
            const [_, cellPosY] = cell

            if (figure.type === 'pawn' && figure.movement.swap === cellPosY) {
                this.setCellState(cell, 'swap')
            } else {
                this.setCellState(cell, 'danger')
            }
        })
        if (possibleMovement.castling) {
            possibleMovement.castling.map(({ king }) => {
                this.setCellState([king.newPosition[0], king.newPosition[1]], 'castling')
            })
        }
    }

    setCheckCell(pos) {
        this.setCellState([pos.x, pos.y], 'check')
    }

    filterFiguresByColors(color) {
        const colorsFigures = []
        for ( let y = 0; y < this.figures.length; y++ ) {
            for ( let x = 0; x < this.figures[y].length; x++ ) {
                let figure = this.figures[y][x]
                if (figure) {
                    if (figure.color === color) {
                        colorsFigures.push(figure)
                    }
                }
            }
        }
        return colorsFigures
    }

    hasAnyMovement(figures) {
        for ( const figure of figures ) {
            const movement = figure.getPossibleSteps(this.figures)
            const possibleMovement = this.getPossibleMovement(figure, movement)
            if (possibleMovement.moves.length > 0 || possibleMovement.kills.length > 0) {
                return false
            }
        }
        return true
    }

    getStaleMateState() {
        const figuresFilteredWhite = this.filterFiguresByColors('white')
        const figuresFilteredBlack = this.filterFiguresByColors('black')

        const stalemateWhite = this.hasAnyMovement(figuresFilteredWhite)
        const stalemateBlack = this.hasAnyMovement(figuresFilteredBlack)

        if (stalemateBlack || stalemateWhite) {
            return true
        }
    }

    getCheckState() {
        let res = []
        for ( let y = 0; y < this.figures.length; y++ ) {
            for ( let x = 0; x < this.figures[y].length; x++ ) {
                const item = this.figures[y][x]
                if (item) {
                    const kills = item.getPossibleSteps(this.figures).kills
                    kills.forEach(([x, y]) => {
                        if (this.figures[y][x].type === 'king') {
                            res.push(this.figures[y][x])
                        }
                    })
                }
            }
        }
        return res
    }

    getMateState(color) {
        for ( let y = 0; y < this.figures.length; y++ ) {
            for ( let x = 0; x < this.figures[y].length; x++ ) {
                const figure = this.figures[y][x]
                if (figure && figure.color === color) {
                    const allMovement = figure.getPossibleSteps(this.figures)
                    const possibleMovement = this.getPossibleMovement(figure, allMovement)
                    if (possibleMovement.moves.length > 0 || possibleMovement.kills.length > 0) {
                        return false
                    }
                }
            }
        }
        return true
    }

    setState({ figures, cells }) {
        this.figures = cloneDeep(figures)
        this.cells = cloneDeep(cells)
    }
}

