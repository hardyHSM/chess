export default class BoardView {
    COUNT_X = 8
    COUNT_Y = 8
    SIZE_W = 710
    SIZE_H = 710
    CELL_W = this.SIZE_W / this.COUNT_X
    CELL_H = this.SIZE_H / this.COUNT_Y
    WHITE = '#f2c89a'
    BLACK = '#4D3A3A'
    ACTIVE = '#ffc760'
    ACTIVE_BORDER = '#ffffff'
    SELECTED = 'orange'
    DANGER = '#ff7777'
    CHECK = '#e10000'
    SWAP = '#5b79c2'

    constructor(root) {
        this.root = document.querySelector(root)
        this.createNodes()
    }

    showBoardFigures(board) {
        board.render(this.ACTIVE)
    }

    createNodes() {
        this.gameRoot = document.createElement('div')
        this.gameRoot.className = 'board-row'
        this.root.appendChild(this.gameRoot)


        this.gameWrapper = document.createElement('div')
        this.gameWrapper.className = 'wrapper-board'

        this.gameRoot.appendChild(this.gameWrapper)

        this.canvasCells = document.createElement('canvas')
        this.canvasFigure = document.createElement('canvas')
        this.contextCells = this.canvasCells.getContext('2d')
        this.contextFigure = this.canvasFigure.getContext('2d')

        this.canvasFigure.classList.add('board-figure-canvas')

        this.canvasCells.width = this.SIZE_W
        this.canvasCells.height = this.SIZE_H
        this.canvasFigure.height = this.SIZE_H
        this.canvasFigure.width = this.SIZE_W

        this.root.classList.add('board')
        this.gameWrapper.appendChild(this.canvasCells)
        this.gameWrapper.appendChild(this.canvasFigure)

        this.createInfoBoard()
    }

    createSideBoards(left, right) {
        this.gameRoot.insertAdjacentElement('afterbegin', left.sideBoard)
        this.gameRoot.insertAdjacentElement('beforeend', right.sideBoard)
        left.render()
        right.render()
    }

    get infoData() {
        return this.boardInfo.innerHTML
    }

    renderTimer(text) {
        this.timer.innerHTML = text
    }

    renderInfoSwap() {
        this.renderInfoBoard(`Выберите фигуру для замены!`)
    }

    renderInfoEnd(value) {
        this.renderInfoBoard(`Шах и мат! Победили ${value} !`)
    }

    renderInfoBoard(value) {
        this.boardInfo.innerHTML = value
    }

    renderInfoStalemate() {
        this.renderInfoBoard(`Ничья !`)
    }

    renderInfoStep(value) {
        this.renderInfoBoard(`Ходят ${value} !`)
    }

    renderInfoCheck(value) {
        this.renderInfoBoard(`Шах! Ходят ${value}`)
    }

    createInfoBoard() {
        this.boardInfo = document.createElement('div')
        this.timer = document.createElement('div')
        this.boardInfo.className = 'info-board-game'
        this.timer.className = 'info-timer'
        this.timer.innerHTML = '00:00:00'

        this.wrapperInfo = document.createElement('div')
        this.wrapperInfo.className = 'wrapper-info'
        this.wrapperInfo.appendChild(this.timer)
        this.wrapperInfo.appendChild(this.boardInfo)
        this.root.insertAdjacentElement('afterbegin', this.wrapperInfo)
    }

    renderFigures(figures) {
        this.clearFigures()
        figures.forEach((row, y) => {
            row.forEach((figure, x) => {
                if (!figure) return
                if (!figure.pic) {
                    figure.prepareImages().then(() => {
                        this.contextFigure.drawImage(figure.pic, x * this.CELL_W, y * this.CELL_H, this.CELL_W, this.CELL_H)
                    })
                } else {
                    this.contextFigure.drawImage(figure.pic, x * this.CELL_W, y * this.CELL_H, this.CELL_W, this.CELL_H)
                }
            })
        })
    }

    renderFigureMoving(figure, x, y) {
        this.contextFigure.drawImage(
            figure.pic,
            x * this.CELL_W,
            y * this.CELL_H,
            this.CELL_W,
            this.CELL_H)
    }

    clearFigures() {
        this.contextFigure.clearRect(0, 0, this.SIZE_W, this.SIZE_H)
    }

    clearBoard() {
        this.contextCells.clearRect(0, 0, this.SIZE_W, this.SIZE_H)
    }

    renderCells(data) {
        this.clearBoard()
        let w = 0
        for ( let y = 0; y < data.length; y++ ) {
            for ( let x = 0; x < data[y].length; x++ ) {
                let colorCell = w % 2 === 0 ? this.WHITE : this.BLACK
                let colorBoard = null
                let lineWidth = null
                if (data[y][x] === 'active') {
                    colorCell = this.ACTIVE
                    colorBoard = this.ACTIVE_BORDER
                }
                if (data[y][x] === 'selected') {
                    colorCell = this.SELECTED
                    colorBoard = this.ACTIVE_BORDER
                }
                if (data[y][x] === 'danger') {
                    colorCell = this.DANGER
                    colorBoard = this.ACTIVE_BORDER
                }
                if (data[y][x] === 'movement') {
                    lineWidth = 4
                    colorBoard = this.SWAP
                }
                if (data[y][x] === 'check') {
                    colorCell = this.CHECK
                    colorBoard = this.ACTIVE_BORDER
                }
                if (data[y][x] === 'swap') {
                    colorCell = this.SWAP
                    colorBoard = this.ACTIVE_BORDER
                }
                if (data[y][x] === 'castling') {
                    colorCell = this.SWAP
                    colorBoard = this.ACTIVE_BORDER
                }
                this.renderCell(x, y, colorCell, colorBoard, lineWidth)
                w++
            }
            w++
        }
    }

    renderCell(x, y, colorCell, colorBoard, line_width) {
        this.contextCells.fillStyle = colorCell
        this.contextCells.fillRect(x * this.CELL_W, y * this.CELL_H, this.CELL_W, this.CELL_H)
        if (colorBoard) {
            this.contextCells.lineWidth = line_width || 4
            this.contextCells.strokeStyle = colorBoard
            this.contextCells.strokeRect(x * this.CELL_W, y * this.CELL_H, this.CELL_W - 2, this.CELL_H - 2)
        }
    }
}