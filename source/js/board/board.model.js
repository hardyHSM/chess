import Horse from '../figures/horse'
import Queen from '../figures/queen'
import Bishop from '../figures/bishop'
import Rook from '../figures/rook'
import King from '../figures/king'
import Pawn from '../figures/pawn'
import HistoryGame from '../core/history.game'
import { cloneDeep } from 'lodash'

export default class BoardModel {
    startPosition  = [
        [[Rook, 'black'], [Horse, 'black'], [Bishop, 'black'], [Queen, 'black'], [King, 'black'], [Bishop, 'black'], [Horse, 'black'], [Rook, 'black']],
        [[Pawn, 'black'], [Pawn, 'black'], [Pawn, 'black'], [Pawn, 'black'], [Pawn, 'black'], [Pawn, 'black'], [Pawn, 'black'], [Pawn, 'black']],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [[Pawn, 'white'], [Pawn, 'white'], [Pawn, 'white'], [Pawn, 'white'], [Pawn, 'white'], [Pawn, 'white'], [Pawn, 'white'], [Pawn, 'white']],
        [[Rook, 'white'], [Horse, 'white'], [Bishop, 'white'], [Queen, 'white'], [King, 'white'], [Bishop, 'white'], [Horse, 'white'], [Rook, 'white']]
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
        this.cells[from.y][from.x] = 'movement'
        this.cells[to.y][to.x] = 'movement'
    }

    changeFigurePos(sourceX, sourceY, targetX, targetY, insteadCell = 0) {
        const replaceCell = this.figures[targetY][targetX]
        this.figures[targetY][targetX] = this.figures[sourceY][sourceX]
        this.figures[sourceY][sourceX] = insteadCell
        return replaceCell
    }


    simulateStep(figure, [cellPosX, cellPosY]) {
        const { x: figurePosX, y: figurePosY } = figure.position;
        const replacedCell = this.changeFigurePos(figurePosX, figurePosY, cellPosX, cellPosY)
        const isCheckKing = this.getIsCheck()
        this.changeFigurePos(cellPosX, cellPosY, figurePosX, figurePosY, replacedCell)
        return !(isCheckKing && isCheckKing.color === figure.color)
    }

    getPossibleMovement(figure, data) {
        data.moves = data.moves.filter(cell => this.simulateStep(figure, cell))
        data.kills = data.kills.filter(cell => this.simulateStep(figure, cell))
        if (data.castling) data.castling = data.castling.filter(castlingStep => {
            console.log(castlingStep)
            return this.simulateStep(castlingStep.king.figure, castlingStep.king.newPosition)
                && this.simulateStep(castlingStep.rook.figure, castlingStep.rook.newPosition)
        })
        return data
    }

    parseMovement(figure) {
        let { x, y } = figure.position
        const allMovement = figure.getPossibleSteps(this.figures)
        const possibleMovement = this.getPossibleMovement(figure, allMovement)

        if (!this.isCheck || this.figures[y][x].type !== 'king') this.cells[y][x] = 'selected'

        possibleMovement.moves.map(item => {
            const [x, y] = item
            if (figure.type === 'pawn' && figure.movement.swap === y) {
                this.cells[y][x] = 'swap'
            } else {
                this.cells[y][x] = 'active'
            }
        })
        possibleMovement.kills.map(item => {
            const [x, y] = item

            if (figure.type === 'pawn' && figure.movement.swap === y) {
                this.cells[y][x] = 'swap'
            } else {
                this.cells[y][x] = 'danger'
            }
        })
        if (possibleMovement.castling) {
            possibleMovement.castling.map(({ king}) => {
                this.cells[king.newPosition[1]][king.newPosition[0]] = 'castling'
            })
        }
    }

    showCheck(pos) {
        this.cells[pos.y][pos.x] = 'check'
    }

    filterFiguresByColors(color) {
        let colorsFigures = []
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

    hasAnyMovement(figuresFiltered) {
        for ( const figure of figuresFiltered ) {
            let movement = figure.getPossibleSteps(this.figures)
            let possibleMovement = this.getPossibleMovement(figure, movement)
            if (possibleMovement.moves.length > 0 || possibleMovement.kills.length > 0) {
                return false
            }
        }
        return true
    }

    getIsStalemate() {
        let figuresFilteredWhite = this.filterFiguresByColors('white')
        let figuresFilteredBlack = this.filterFiguresByColors('black')

        let stalemateWhite = this.hasAnyMovement(figuresFilteredWhite)
        let stalemateBlack = this.hasAnyMovement(figuresFilteredBlack)

        if (stalemateBlack || stalemateWhite) {
            return true
        }
    }

    getIsCheck() {
        let res = null
        for ( let y = 0; y < this.figures.length; y++ ) {
            for ( let x = 0; x < this.figures[y].length; x++ ) {
                let item = this.figures[y][x]
                if(item) {
                    let kills = item.getPossibleSteps(this.figures).kills
                    kills.forEach(kill => {
                        if (this.figures[kill[1]][kill[0]].type === 'king') {
                            res = this.figures[kill[1]][kill[0]]
                        }
                    })
                }
            }
        }
        return res
    }

    checkMate(color) {
        let mate = true
        for ( let y = 0; y < this.figures.length; y++ ) {
            for ( let x = 0; x < this.figures[y].length; x++ ) {
                let figure = this.figures[y][x]
                if (figure && figure.color === color) {
                    const allMovement = figure.getPossibleSteps(this.figures)
                    const possibleMovement = this.getPossibleMovement(figure, allMovement)
                    if (possibleMovement.moves.length > 0 || possibleMovement.kills.length > 0) {
                        return false
                    }
                }
            }
        }
        return mate
    }

    setState({ figures, cells }) {
        this.figures = cloneDeep(figures)
        this.cells = cloneDeep(cells)
    }
}

