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
    choseSwap = false

    constructor(root) {
        this.view = new BoardView(root)

        this.leftBoard = new SideBoard({
            x: 0,
            y: 0,
            width: this.view.CELL_W * 2,
            height: this.view.SIZE_H,
            classes: 'left-board',
            color: this.view.WHITE
        })
        this.rightBoard = new SideBoard({
            x: 0,
            y: 0,
            width: this.view.CELL_W * 2,
            height: this.view.SIZE_H,
            classes: 'right-board',
            color: this.view.WHITE
        })

        this.start()
    }

    start() {
        this.view.createSideBoards(this.leftBoard, this.rightBoard)
        this.view.renderCells(this.model.cells)
        this.view.renderFigures(this.model.figures)
        this.view.renderInfoStep(this.game.currentSide)
        this.leftBoard.render(this.view.WHITE)
        this.rightBoard.render(this.view.WHITE)
        this.view.canvasFigure.addEventListener('click', (e) => this.clickHandlerField(e))
        document.addEventListener('keydown', (event) => {
            if ((event.ctrlKey && event.key === 'z') || (event.ctrlKey && event.key === 'я')) {
                this.setPrevState()
            }
        })
        this.model.history.addItem({
            figures: this.model.figures,
            cells: this.model.cells,
            currentSide: this.game.currentSide,
            leftBoard: this.leftBoard.model,
            rightBoard: this.rightBoard.model,
            boardInfo: this.view.infoData
        })
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
        if (this.game.isEnd || this.choseSwap) return

        let coords = this.getPositionClick(e)
        let cell = this.model.cells[coords.y][coords.x]

        if (!cell || cell === 'movement' || cell === 'selected' || cell === 'check') {
            this.clickHandlerFigures(coords)
        } else {
            this.clickHandlerCells(coords)
        }
    }

    clickHandlerCells(coords) {
        let cell = this.model.cells[coords.y][coords.x]
        if (!cell) return

        this.currentFigure.isActive = false
        if (this.prevMovement) this.model.showMovementCells(this.prevMovement)

        this.model.history.addItem({
            figures: this.model.figures,
            cells: this.model.cells,
            currentSide: this.game.currentSide,
            leftBoard: this.leftBoard.model,
            rightBoard: this.rightBoard.model,
            boardInfo: this.view.infoData
        })

        if (cell === 'danger') {
            const killedItem = this.model.figures[coords.y][coords.x]
            if (killedItem.color === 'white') {
                this.leftBoard.addItem(killedItem)
                this.leftBoard.render()
            } else {
                this.rightBoard.addItem(killedItem)
                this.rightBoard.render()
            }
        }
        if (cell === 'swap') {
            const killedItem = this.model.figures[coords.y][coords.x]
            if (killedItem && killedItem.color === 'white') {
                this.leftBoard.addItem(killedItem)
                this.leftBoard.render()
            }
            if (killedItem && killedItem.color === 'black') {
                this.rightBoard.addItem(killedItem)
                this.rightBoard.render()
            }
            this.choseSwap = true
        }
        if (cell === 'castling') {
            this.doCastling(coords)
            this.view.renderInfoStep(this.game.currentSide)
        }
        this.moveFigure(this.currentFigure, coords)
        this.view.renderInfoStep(this.game.currentSide)
    }

    clickHandlerFigures(coords) {
        let figure = this.model.figures[coords.y][coords.x]
        if (!figure || this.movingFigure || this.game.currentSide !== figure.color) return

        this.model.clearCells(['movement', 'check'])
        if (this.prevMovement) this.model.showMovementCells(this.prevMovement)
        if (!figure.isActive) {
            this.currentFigure && (this.currentFigure.isActive = false)
            this.currentFigure = figure
            this.model.parseMovement(figure)
        }

        this.currentFigure.isActive = !this.currentFigure.isActive
        this.view.renderCells(this.model.cells)
    }

    moveFigure(figure, coords, printMovement = true) {
        this.model.clearCells(['movement', 'check'])

        this.model.figures[figure.position.y][figure.position.x] = 0
        const movingFigure = {
            figure: figure,
            current: Object.assign({}, figure.position),
            from: figure.position,
            to: coords
        }

        this.animationMovingFigure(movingFigure, printMovement)
    }

    doCastling(coords) {
        let rook = this.currentFigure.castlingVariants.get(JSON.stringify(coords))

        this.moveFigure(this.currentFigure, coords, true)
        this.moveFigure(rook.figure, { x: rook.movement[0], y: rook.movement[1] }, true)
    }

    parseSwapBoard() {
        this.currentBoard = this.currentFigure.color === 'white' ? this.leftBoard : this.rightBoard
        if (!this.currentBoard.hasAnyItem()) {
            this.choseSwap = false
            return
        }
        this.view.renderInfoSwap()
        this.view.showBoardFigures(this.currentBoard)
        this.currentBoard.sideBoard.addEventListener('click', this.handlerClickSideBoard)
    }

    animationMovingFigure(movingFigure, printMovement) {
        this.movingFigure = true
        let speed_x = 0.25
        let speed_y = 0.25
        let { x: x_from, y: y_from } = movingFigure.from
        let { x: x_to, y: y_to } = movingFigure.to
        let { x: x_curr, y: y_curr } = movingFigure.current


        if (x_curr === x_to && y_curr === y_to) {
            console.log('animation end')
            this.model.figures[y_to][x_to] = 0
            this.movingFigure = null
            this.model.figures[y_to][x_to] = movingFigure.figure
            movingFigure.isActive = false
            this.model.figures[y_to][x_to].position = {
                x: x_to, y: y_to
            }

            this.view.renderFigures(this.model.figures, movingFigure)
            if (printMovement) {
                this.afterStep()
            }
            if (this.choseSwap) {
                this.parseSwapBoard()
            }
            if (printMovement) {
                this.prevMovement = {
                    from: movingFigure.from,
                    to: movingFigure.to
                }
                this.model.showMovementCells(this.prevMovement)
            }
            this.view.renderCells(this.model.cells)
            return
        }

        if (this.currentFigure.type === 'horse') {
            if (Math.abs(x_to - x_from) < Math.abs(y_to - y_from)) {
                speed_x = 0.25
                speed_y = 0.50
            } else {
                speed_y = 0.25
                speed_x = 0.50
            }
        }

        if (y_curr > y_to) movingFigure.current.y -= speed_y
        if (y_curr < y_to) movingFigure.current.y += speed_y
        if (x_curr > x_to) movingFigure.current.x -= speed_x
        if (x_curr < x_to) movingFigure.current.x += speed_x


        this.view.renderFigures(this.model.figures, movingFigure)
        requestAnimationFrame(() => {
            this.animationMovingFigure(movingFigure, printMovement)
        })
    }

    handlerClickSideBoard = (e) => {
        let coords = this.getPositionClick(e)
        let figure = this.currentBoard.model[coords.y][coords.x]

        if (!figure) return

        figure.position = {
            x: this.currentFigure.position.x,
            y: this.currentFigure.position.y
        }
        this.model.figures[this.currentFigure.position.y][this.currentFigure.position.x] = figure
        this.currentBoard.removeItem({
            x: coords.x,
            y: coords.y
        })
        this.currentBoard.render()
        this.choseSwap = false
        this.view.renderFigures(this.model.figures)
        this.game.changeStep()
        this.afterStep()
    }

    findKingLoser() {
        let king = null
        this.model.figures.forEach(row => {
            row.forEach(figure => {
                if(figure.type === 'king' && figure.color === this.game.getOtherSide()) {
                    king = figure
                }
            })
        })
        return king
    }

    checkMate(figure) {
        let isMate = this.model.checkMate(figure.color)
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
        console.log('after step')
        this.game.changeStep()
        let isCheck = this.model.getIsCheck()
        this.model.clearCells(['movement'])
        if (isCheck) {
            let mate = this.checkMate(isCheck)
            if (mate) return
            this.model.isCheck = true
            this.model.parseCheck(isCheck.position)
            this.view.renderInfoCheck(this.game.currentSide)
        } else {
            this.model.clearCells()
            this.view.renderInfoStep(this.game.currentSide)
            this.model.isCheck = false
        }
        let stalemate = this.model.getIsStalemate()
        if (stalemate) {
            this.view.renderInfoStalemate()
            this.game.isEnd = true
        }
    }

    setPrevState() {
        this.game.isEnd = false
        this.choseSwap = false
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