import BoardView from './board.view'
import BoardModel from './board.model'
import GameStats from '../core/game.stats'
import SideBoard from '../core/side.board'
import Timer from '../utils/timer'

export default class BoardController {
    model = new BoardModel()
    game = new GameStats()
    timer = new Timer()
    currentFigure = null
    currentBoard = null
    movingFigure = null
    prevMovement = null
    swapState = false

    constructor(root) {
        this.createBoards(root)
        this.start()
        window.controller = this
    }

    createBoards(root) {
        this.view = new BoardView(root)

        this.leftBoard = new SideBoard({
            x: 0, y: 0, width: this.view.CELL_W * 2, height: this.view.SIZE_H,
            classes: 'left-board',
            color: this.view.WHITE
        })
        this.rightBoard = new SideBoard({
            x: 0, y: 0, width: this.view.CELL_W * 2, height: this.view.SIZE_H,
            classes: 'right-board',
            color: this.view.WHITE
        })

        this.leftBoard.render(this.view.WHITE)
        this.rightBoard.render(this.view.WHITE)
    }

    initHandlers() {
        this.view.canvasFigure.addEventListener('click', (e) => this.clickHandlerField(e))
        document.addEventListener('keydown', (event) => {
            if ((event.ctrlKey && event.key === 'z') || (event.ctrlKey && event.key === 'я')) {
                this.setPrevState()
            }
        })
    }

    start() {
        this.view.createSideBoards(this.leftBoard, this.rightBoard)
        this.view.renderCells(this.model.cells)
        this.view.renderFigures(this.model.figures)
        this.view.renderInfoStep(this.game.currentSide)

        this.initHandlers()
        this.addHistoryState()

        this.timer.start((string) => {
            this.view.renderTimer(string)
        })
    }

    getPositionClick(e) {
        return {
            x: Math.floor(e.offsetX / this.view.CELL_W),
            y: Math.floor(e.offsetY / this.view.CELL_H)
        }
    }

    clickHandlerField(e) {
        if (this.game.isEnd || this.swapState) return

        const position = this.getPositionClick(e)
        const cell = this.model.cells[position.y][position.x]

        if (!cell || cell === 'movement' || cell === 'selected' || cell === 'check') {
            this.clickHandlerFigures(position)
        } else {
            this.clickHandlerCells(position)
        }
    }


    clickHandlerFigures(position) {
        let figure = this.model.figures[position.y][position.x]
        if (!figure || this.movingFigure || this.game.currentSide !== figure.color) return
        this.parsePrevStep()
        this.toggleActiveFigure(figure)
    }

    clickHandlerCells(position) {
        const cell = this.model.cells[position.y][position.x]
        this.currentFigure.isActive = false
        this.parsePrevStep()
        this.addHistoryState()

        if (cell === 'danger') {
            this.removeFigure(position)
        }
        if (cell === 'swap') {
            this.removeFigure(position)
            this.swapState = true
        }
        if (cell === 'castling') {
            this.doCastling(position)
            this.view.renderInfoStep(this.game.currentSide)
            return
        }
        this.moveFigure(this.currentFigure, position)
        this.afterStep()
    }


    moveFigure(figure, position) {
        this.prevMovement = {
            from: { ...figure.position },
            to: position
        }
        this.parsePrevStep()
        const { x: fromX, y: fromY } = figure.position
        const { x: toX, y: toY } = position

        this.model.changeFigurePos(fromX, fromY, toX, toY)

        this.view.renderCells(this.model.cells)
        this.view.renderFigures(this.model.figures)

    }

    toggleActiveFigure(figure) {
        if (figure === this.currentFigure) {
            this.currentFigure.isActive = false
            this.currentFigure = null
        } else {
            this.currentFigure = figure
            this.currentFigure.isActive = true
            this.model.parseMovementCells(figure)
        }
        this.view.renderCells(this.model.cells)
    }

    removeFigure(position) {
        const figure = this.model.figures[position.y][position.x]
        const board = figure.color === 'white' ? this.leftBoard : this.rightBoard

        board.addItem(figure)
        board.render()
    }

    doCastling(newKingPosition) {
        const { rook, offsetPositionRook } = this.currentFigure.pinnedRooks.get(JSON.stringify(newKingPosition))
        this.moveFigure(rook, { x: offsetPositionRook[0], y: offsetPositionRook[1] }, true)
        this.moveFigure(this.currentFigure, newKingPosition)
        this.afterStep()
    }

    parseSwapBoard() {
        this.currentBoard = this.currentFigure.color === 'white' ? this.leftBoard : this.rightBoard
        if (!this.currentBoard.hasAnyItem()) {
            this.swapState = false
            return
        }
        this.view.renderInfoSwap()
        this.view.showBoardFigures(this.currentBoard)
        this.currentBoard.sideBoard.addEventListener('click', this.handlerClickSideBoard)
    }

    addHistoryState() {
        this.model.history.addItem({
            figures: this.model.figures,
            cells: this.model.cells,
            currentSide: this.game.currentSide,
            leftBoard: this.leftBoard.model,
            rightBoard: this.rightBoard.model,
            boardInfo: this.view.infoData
        })
    }

    parsePrevStep() {
        this.model.clearCells(['check'])
        if (this.prevMovement) {
            this.model.showPrevStep(this.prevMovement)
        }
    }

    // animationMovingFigure(movingFigure, printMovement) {
    //     this.movingFigure = true
    //     let speed_x = 0.25
    //     let speed_y = 0.25
    //     let { x: x_from, y: y_from } = movingFigure.from
    //     let { x: x_to, y: y_to } = movingFigure.to
    //     let { x: x_curr, y: y_curr } = movingFigure.current
    //
    //
    //     if (x_curr === x_to && y_curr === y_to) {
    //         this.model.figures[y_to][x_to] = 0
    //         this.movingFigure = null
    //         this.model.figures[y_to][x_to] = movingFigure.figure
    //         movingFigure.isActive = false
    //         this.model.figures[y_to][x_to].position = {
    //             x: x_to, y: y_to
    //         }
    //
    //         this.view.renderFigures(this.model.figures, movingFigure)
    //         if (printMovement) {
    //             this.afterStep()
    //         }
    //         if (this.swapState) {
    //             this.parseSwapBoard()
    //         }
    //         if (printMovement) {
    //             this.prevMovement = {
    //                 from: movingFigure.from,
    //                 to: movingFigure.to
    //             }
    //             this.model.showPrevStep(this.prevMovement)
    //         }
    //         this.view.renderCells(this.model.cells)
    //         return
    //     }
    //
    //     if (this.currentFigure.type === 'horse') {
    //         if (Math.abs(x_to - x_from) < Math.abs(y_to - y_from)) {
    //             speed_x = 0.25
    //             speed_y = 0.50
    //         } else {
    //             speed_y = 0.25
    //             speed_x = 0.50
    //         }
    //     }
    //
    //     if (y_curr > y_to) movingFigure.current.y -= speed_y
    //     if (y_curr < y_to) movingFigure.current.y += speed_y
    //     if (x_curr > x_to) movingFigure.current.x -= speed_x
    //     if (x_curr < x_to) movingFigure.current.x += speed_x
    //
    //
    //     this.view.renderFigures(this.model.figures, movingFigure)
    //     requestAnimationFrame(() => {
    //         this.animationMovingFigure(movingFigure, printMovement)
    //     })
    // }

    handlerClickSideBoard = (e) => {
        let { x, y } = this.getPositionClick(e)
        let figure = this.currentBoard.model[y][x]

        if (!figure) return

        this.moveFigure(figure, this.currentFigure.position)
        this.currentBoard.removeItem({ x, y })
        this.currentBoard.render()
        this.swapState = false
        this.view.renderFigures(this.model.figures)
        this.game.changeStep()
        this.afterStep()
    }

    findKingLoser() {
        let king = null
        this.model.figures.forEach(row => {
            row.forEach(figure => {
                if (figure.type === 'king' && figure.color === this.game.getOtherSide()) {
                    king = figure
                }
            })
        })
        return king
    }

    checkMate(figure) {
        let isMate = this.model.getMateState(figure.color)
        if (isMate) {
            this.game.isEnd = true
            this.game.changeStep()
            this.view.renderInfoEnd(this.game.currentSide)
            const deadKing = this.findKingLoser()
            this.model.cells[deadKing.position.y][deadKing.position.x] = 'check'
            this.view.renderCells(this.model.cells)
            return true
        }
    }

    afterStep() {

        this.game.changeStep()
        let isCheck = this.model.getCheckState()[0]
        this.model.clearCells(['check', 'movement'])
        if (isCheck) {
            let mate = this.checkMate(isCheck)
            if (mate) return
            this.model.isCheck = true
            this.model.setCheckCell(isCheck.position)
            this.view.renderCells(this.model.cells)
            this.view.renderInfoCheck(this.game.currentSide)
        } else {

            this.model.clearCells()
            this.view.renderCells(this.model.cells)
            this.view.renderInfoStep(this.game.currentSide)
            this.model.isCheck = false
        }
        let stalemate = this.model.getStaleMateState()
        if (stalemate) {
            this.view.renderInfoStalemate()
            this.game.isEnd = true
        }
        if (this.swapState) {
            this.parseSwapBoard()
        }
    }

    setPrevState() {
        this.game.isEnd = false
        this.swapState = false
        this.prevMovement = null
        let lastState = this.model.history.getLast()
        if (!lastState) return
        this.model.setState({
            figures: lastState.figures,
            cells: lastState.cells
        })

        this.leftBoard.setState(lastState.leftBoard)
        this.rightBoard.setState(lastState.rightBoard)

        this.leftBoard.render()
        this.rightBoard.render()
        this.view.renderInfoBoard(lastState.boardInfo)
        this.game.setSide(lastState.currentSide)
        this.model.clearCells(['check', 'movement'])
        this.view.renderCells(this.model.cells)
        this.view.renderFigures(this.model.figures, null)
    }
}