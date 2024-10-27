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
    prevMovement = null
    swapState = false

    constructor(root) {
        this.createBoards(root)
        this.start()
    }

    createBoards(root) {
        this.view = new BoardView(root)

        const boardConfig = {
            x: 0,
            y: 0,
            width: this.view.CELL_W * 2,
            height: this.view.SIZE_H,
            color: this.view.WHITE
        }

        this.leftBoard = new SideBoard({ ...boardConfig, classes: 'left-board' })
        this.rightBoard = new SideBoard({ ...boardConfig, classes: 'right-board' })
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
        this.timer.start((time) => this.view.renderTimer(time))
    }
d
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

        if (!cell || ['movement', 'selected', 'check'].includes(cell)) {
            this.clickHandlerFigures(position)
        } else {
            this.clickHandlerCells(position)
        }
    }


    clickHandlerFigures(position) {
        let figure = this.model.figures[position.y][position.x]
        if (!figure || this.game.currentSide !== figure.color) return
        this.parsePrevStep()
        this.toggleActiveFigure(figure)
    }

    async clickHandlerCells(position) {
        const cell = this.model.cells[position.y][position.x]
        this.currentFigure.isActive = false
        this.parsePrevStep()
        this.addHistoryState()

        if (cell === 'danger' || cell === 'swap') {
            this.removeFigure(position)
            this.swapState = cell === 'swap'
        }
        if (cell === 'castling') {
            await this.doCastling(position)
            this.view.renderInfoStep(this.game.currentSide)
            return
        }
        await this.moveFigure(this.currentFigure, position)
        this.processBoardAfterStep()
    }


    toggleActiveFigure(figure) {
        figure.isActive = figure !== this.currentFigure
        this.currentFigure = figure.isActive ? figure : null
        if (figure.isActive) this.model.setMovementsOnCells(figure)
        this.view.renderCells(this.model.cells)
    }

    removeFigure(position) {
        const figure = this.model.figures[position.y][position.x]
        const board = figure.color === 'white' ? this.leftBoard : this.rightBoard

        board.addItem(figure)
        board.render()
    }

    async doCastling(newKingPosition) {
        const { rook, offsetPositionRook } = this.currentFigure.pinnedRooks.get(JSON.stringify(newKingPosition))
        await Promise.all([
            this.moveFigure(rook, { x: offsetPositionRook[0], y: offsetPositionRook[1] }, true),
            this.moveFigure(this.currentFigure, newKingPosition)
        ])
        this.processBoardAfterStep()
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
            boardInfo: this.view.infoData,
            isCheck: this.model.isCheck
        })
    }

    parsePrevStep() {
        this.model.clearCells(['check'])
        if (this.prevMovement) {
            this.model.setPrevStep(this.prevMovement)
        }
    }

    async moveFigure(figure, position) {
        this.prevMovement = {
            from: { ...figure.position },
            to: position
        }
        this.parsePrevStep()
        const { x: fromX, y: fromY } = figure.position
        const { x: toX, y: toY } = position

        await this.animateMoving(fromX, fromY, toX, toY)

        this.view.renderFigures(this.model.figures)
        this.view.renderCells(this.model.cells)
    }

    animateMoving(fromX, fromY, toX, toY) {
        const speed_x = 0.25
        const speed_y = 0.25
        let currentX = fromX
        let currentY = fromY

        const figure = this.model.figures[fromY][fromX]
        this.model.figures[fromY][fromX] = 0

        return new Promise((resolve) => {
            const animateStep = () => {
                currentX += Math.sign(toX - currentX) * speed_x
                currentY += Math.sign(toY - currentY) * speed_y

                this.view.renderFigures(this.model.figures)
                this.view.renderFigureMoving(figure, currentX, currentY)

                if (Math.abs(currentX - toX) > 0.01 || Math.abs(currentY - toY) > 0.01) {
                    requestAnimationFrame(animateStep)
                } else {
                    this.model.setFigureOnBoard(figure, [toX, toY])
                    return resolve(figure)
                }
            }
            requestAnimationFrame(animateStep)

        })
    }

    handlerClickSideBoard = (e) => {
        let { x, y } = this.getPositionClick(e)
        let figure = this.currentBoard.model[y][x]

        if (!figure) return

        this.model.setFigureOnBoard(figure, [this.currentFigure.position.x, this.currentFigure.position.y])
        this.currentBoard.removeItem({ x, y })
        this.currentBoard.render()
        this.swapState = false
        this.view.renderFigures(this.model.figures)
        this.game.changeStep()
        this.processBoardAfterStep()
    }
    checkMate(figure) {
        const isMate = this.model.getMateState(figure.color)
        if (!isMate) return false
        this.game.isEnd = true
        this.game.changeStep()
        this.view.renderInfoEnd(this.game.currentSide)
        this.model.cells[figure.position.y][figure.position.x] = 'check'
        this.view.renderCells(this.model.cells)
        return true
    }

    setCheckState(king) {
        this.model.isCheck = true
        this.model.setCellState([king.position.x, king.position.y], 'check')
        this.view.renderInfoCheck(this.game.currentSide)
    }

    processBoardAfterStep() {
        this.game.changeStep()
        const checkedKing = this.model.getCheckState()
        this.model.clearCells(['check', 'movement'])

        if (checkedKing) {
            const isMate = this.checkMate(checkedKing)
            if (isMate) return
            this.setCheckState(checkedKing)
        } else {
            this.model.clearCells(['movement'])
            this.view.renderInfoStep(this.game.currentSide)
            this.model.isCheck = false
        }
        const stalemate = this.model.getStaleMateState()
        if (stalemate) {
            this.view.renderInfoStalemate()
            this.game.isEnd = true
        }
        if (this.swapState) {
            this.parseSwapBoard()
        }

        this.view.renderCells(this.model.cells)
    }

    setPrevState() {
        this.game.isEnd = false
        this.swapState = false
        this.prevMovement = null
        this.currentFigure = null
        let lastState = this.model.history.getLast()
        if (!lastState) return
        this.model.setState({
            figures: lastState.figures,
            cells: lastState.cells
        })

        this.leftBoard.setState(lastState.leftBoard)
        this.rightBoard.setState(lastState.rightBoard)
        this.model.isCheck = lastState.isCheck
        this.leftBoard.render()
        this.rightBoard.render()
        this.view.renderInfoBoard(lastState.boardInfo)
        this.game.setSide(lastState.currentSide)
        this.model.clearCells(['check', 'movement'])
        this.view.renderCells(this.model.cells)
        this.view.renderFigures(this.model.figures, null)
    }
}