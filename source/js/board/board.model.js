import Horse from '../figures/horse'
import Queen from '../figures/queen'
import Bishop from '../figures/bishop'
import Rook from '../figures/rook'
import King from '../figures/king'
import Pawn from '../figures/pawn'
import HistoryGame from '../core/history.game'
import { cloneDeep } from 'lodash'

export default class BoardModel {
    startPosition = [
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
    }

    clearCells(args = []) {
        this.cells = this.cells.map((column) => column.map((cell) => args.includes(cell) ? cell : 0))
    }

    parseBoard(startPosition) {
        return startPosition.map((row, y) => {
            return row.map((figure, x) => {
                try {
                    const [type, color] = figure
                    return new type({ color, x, y })
                } catch (e) {
                    return 0
                }
            })
        })
    }

    setPrevStep({ from, to }) {
        this.clearCells(['check'])
        this.setCellState([from.x, from.y], 'movement')
        this.setCellState([to.x, to.y], 'movement')
    }

    changeFigurePos(sourceX, sourceY, targetX, targetY, insteadCell = 0) {
        const figure = this.figures[sourceY][sourceX]
        const replacedFigure = this.figures[targetY][targetX]
        figure.setPosition(targetX, targetY)

        this.figures[targetY][targetX] = figure
        this.figures[sourceY][sourceX] = insteadCell

        return replacedFigure
    }

    setFigureOnBoard(figure, [x, y]) {
        figure.setPosition(x, y)
        this.figures[y][x] = figure
    }


    simulateStep(figure, [cellPosX, cellPosY]) {
        const { x: figurePosX, y: figurePosY } = figure.position
        const replacedCell = this.changeFigurePos(figurePosX, figurePosY, cellPosX, cellPosY)
        const checkedKing = this.getCheckState(figure.color === 'white' ? 'black' : 'white')
        this.changeFigurePos(cellPosX, cellPosY, figurePosX, figurePosY, replacedCell)
        return !(checkedKing && checkedKing.color === figure.color)
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

    setCellState([x, y], state) {
        this.cells[y][x] = state
    }

    setMovementsOnCells(figure) {
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
                this.setCellState(king.newPosition, 'castling')
            })
        }
    }

    getAllFigures() {
        return this.figures.flat().filter(Boolean)
    }

    filterFiguresByColors(color) {
        return this.getAllFigures().filter(figure => figure.color === color)
    }

    hasAnyMovement(figures) {
        return !figures.some(figure => {
            const movement = figure.getPossibleSteps(this.figures)
            const possibleMovement = this.getPossibleMovement(figure, movement)
            return possibleMovement.moves.length > 0 || possibleMovement.kills.length > 0
        })
    }

    getStaleMateState() {
        const whiteFigures = this.filterFiguresByColors('white')
        const blackFigures = this.filterFiguresByColors('black')
        return this.hasAnyMovement(whiteFigures) || this.hasAnyMovement(blackFigures)
    }


    getCheckState(color = 'all') {
        const figures = color === 'all' ? this.getAllFigures() : this.filterFiguresByColors(color)

        for ( const figure of figures ) {
            const kills = figure.getPossibleSteps(this.figures).kills
            for ( const cell of kills ) {
                const [cellPosX, cellPosY] = cell
                if (this.figures[cellPosY][cellPosX].type === 'king') {
                    return this.figures[cellPosY][cellPosX]
                }
            }
        }
        return false
    }

    getMateState(color) {
        const figures = this.filterFiguresByColors(color)
        for ( const figure of figures ) {
            const allMovement = figure.getPossibleSteps(this.figures)
            const possibleMovement = this.getPossibleMovement(figure, allMovement)
            if (possibleMovement.moves.length > 0 || possibleMovement.kills.length > 0 || possibleMovement?.castling?.length > 0) {
                return false
            }
        }
        return true
    }

    setState({ figures, cells }) {
        this.figures = cloneDeep(figures)
        this.cells = cloneDeep(cells)
    }
}

