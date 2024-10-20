import { cloneDeep } from 'lodash'

export default class SideBoard {
    constructor({ x, y, width, height, classes, color }) {
        this.model = [
            [0, 0],
            [0, 0],
            [0, 0],
            [0, 0],
            [0, 0],
            [0, 0],
            [0, 0],
            [0, 0]
        ]
        this.sideBoard = document.createElement('canvas')
        this.sideBoard.className = classes
        this.context = this.sideBoard.getContext('2d')
        this.defaultColor = color
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.cellWidth = this.width / 2
        this.cellHeight = this.height / 8
        this.sideBoard.width = this.width
        this.sideBoard.height = this.height
    }

    render(color) {
        this.context.clearRect(0, 0, this.width, this.height)

        for ( let y = 0; y < this.model.length; y++ ) {
            for ( let x = 0; x < this.model.length; x++ ) {
                if (this.model[y][x]) {
                    this.context.fillStyle = color
                    this.context.fillRect(x * this.cellWidth, y * this.cellHeight, this.cellWidth, this.cellHeight)
                    this.context.drawImage(this.model[y][x].pic, x * this.cellWidth, y * this.cellHeight, this.cellWidth, this.cellHeight)
                } else {
                    this.context.fillStyle = this.defaultColor
                    this.context.fillRect(x * this.cellWidth, y * this.cellHeight, this.cellWidth, this.cellHeight)
                }
            }
        }
    }

    hasAnyItem() {
        return this.model.some(row => row.some(cell => cell !== 0))
    }

    addItem(figure) {
        for ( let y = 0; y < this.model.length; y++ ) {
            for ( let x = 0; x < this.model[y].length; x++ ) {
                if (!this.model[y][x]) {
                    this.model[y][x] = figure
                    return false
                }
            }
        }
    }

    removeItem(pos) {
        this.model[pos.y][pos.x] = 0
    }

    setState(data) {
        this.model = cloneDeep(data)
    }
}