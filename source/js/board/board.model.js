import Horse from '../figures/horse'
import Queen from '../figures/queen'
import Bishop from '../figures/bishop'
import Rook from '../figures/rook'
import King from '../figures/king'
import Pawn from '../figures/pawn'
import HistoryGame from '../core/history.game'
import { cloneDeep } from 'lodash'

export default class BoardModel {
    constructor() {
        this.figures = this.createFigures()
        this.cells = new Array(8).fill(0).map(() => new Array(8).fill(0))
        this.isCheck = false
        this.history = new HistoryGame()
        window.model = this
    }

    clearCells(arg = []) {
        this.cells = this.cells.map((column) => column.map((item) => arg.includes(item) ? item : 0))
    }

    createFigures() {
        // const startPosition = [
        //     [[Rook, 'black'], [Horse, 'black'], [Bishop, 'black'], [Queen, 'black'], [King, 'black'], [Bishop, 'black'], [Horse, 'black'], [Rook, 'black']],
        //     [[Pawn, 'black'], [Pawn, 'black'], [Pawn, 'black'], [Pawn, 'black'], [Pawn, 'black'], [Pawn, 'black'], [Pawn, 'black'], [Pawn, 'black']],
        //     [0, 0, 0, 0, 0, 0, 0, 0],
        //     [0, 0, 0, 0, 0, 0, 0, 0],
        //     [0, 0, 0, 0, 0, 0, 0, 0],
        //     [0, 0, 0, 0, 0, 0, 0, 0],
        //     [[Pawn, 'white'], [Pawn, 'white'], [Pawn, 'white'], [Pawn, 'white'], [Pawn, 'white'], [Pawn, 'white'], [Pawn, 'white'], [Pawn, 'white']],
        //     [[Rook, 'white'], [Horse, 'white'], [Bishop, 'white'], [Queen, 'white'], [King, 'white'], [Bishop, 'white'], [Horse, 'white'], [Rook, 'white']]
        // ]

        const startPosition = [
            [[Rook, 'black'], [Horse, 'black'], [Bishop, 'black'], [King, 'black'], 0, [Bishop, 'black'], [Horse, 'black'], [Rook, 'black']],
            [[Pawn, 'black'], [Pawn, 'black'], [Pawn, 'black'], 0, [Pawn, 'black'], [Pawn, 'black'], [Pawn, 'black'], [Pawn, 'black']],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [[Pawn, 'white'], [Pawn, 'white'], 0, 0, [Pawn, 'white'], [Pawn, 'white'], [Pawn, 'white'], [Pawn, 'white']],
            [[Rook, 'white'], 0, 0, 0, [King, 'white'], [Bishop, 'white'], [Horse, 'white'], [Rook, 'white']]
        ]


        return this.parseBoard(startPosition)
    }

    parseBoard(startPosition) {
        return startPosition.map((row, y) => {
            return row.map((item, x) => {
                if (!item) return item
                const [type, color] = item
                return new type({ color, x, y })
            })
        })
    }

    showMovementCells({ from, to }) {
        this.clearCells(['check'])
        this.cells[from.y][from.x] = 'movement'
        this.cells[to.y][to.x] = 'movement'
    }

    checkDanger(figure, cell) {
        const [x, y] = cell
        let [figurePosX, figurePosY] = [figure.position.x, figure.position.y]
        let res = this.figures[y][x]

        this.figures[figurePosY][figurePosX] = 0
        this.figures[y][x] = figure

        let checkedItem = this.getIsCheck()


        this.figures[figurePosY][figurePosX] = figure
        this.figures[y][x] = res

        return !(checkedItem && checkedItem.color === figure.color)
    }

    parsePossibleMovement(figure, data) {
        data.moves = data.moves.filter(item => this.checkDanger(figure, item))
        data.kills = data.kills.filter(item => this.checkDanger(figure, item))
        if (data.castling) data.castling = data.castling.filter(item => this.checkDanger(figure, item.movement))
        return data
    }

    parseMovement(figure) {
        let { x, y } = figure.position
        const allMovement = figure.showMovement(this.figures)
        const possibleMovement = this.parsePossibleMovement(figure, allMovement)

        if (!this.isCheck || this.figures[y][x].type !== 'king') this.cells[y][x] = 'selected'

        possibleMovement.moves.map(item => {
            const [x, y] = item
            if (figure.type === 'pawn' && figure.movement[figure.color].swap === y) {
                this.cells[y][x] = 'swap'
            } else {
                this.cells[y][x] = 'active'
            }
        })
        possibleMovement.kills.map(item => {
            const [x, y] = item

            if (figure.type === 'pawn' && figure.movement[figure.color].swap === y) {
                this.cells[y][x] = 'swap'
            } else {
                this.cells[y][x] = 'danger'
            }
        })
        if (possibleMovement.castling) {
            figure.castlingVariants.clear()
            possibleMovement.castling.map(({ movement, rook }) => {
                this.cells[movement[1]][movement[0]] = 'castling'
                figure.castlingVariants.set(JSON.stringify({ x: movement[0], y: movement[1] }), rook)
            })
        }
    }

    parseCheck(pos) {
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
            let movement = figure.showMovement(this.figures)
            let possibleMovement = this.parsePossibleMovement(figure, movement)
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
                    let kills = item.showMovement(this.figures).kills
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
                    const allMovement = figure.showMovement(this.figures)
                    const possibleMovement = this.parsePossibleMovement(figure, allMovement)
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

