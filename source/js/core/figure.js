export default class Figure {
    constructor({ x, y, type, color, movement, img = '' }) {
        this.position = {
            x: x,
            y: y
        }
        this.type = type
        this.color = color
        this.movement = movement
        this.isActive = false
        this.img = img
        this.pic = null
    }

    getPossibleSteps(model) {
        const result = {
            moves: [],
            kills: []
        }
        if (Array.isArray(this.movement)) {
            this.movement.forEach(row => {
                for ( const moveOffset of row ) {
                    let [moveOffsetX, moveOffsetY] = moveOffset
                    let [figureX, figureY] = [this.position.x, this.position.y]

                    const [cellPosX, cellPosY] = [figureX + moveOffsetX, figureY + moveOffsetY]

                    let cellStatus = this.getCellStatus(cellPosX, cellPosY, model)


                    if (cellStatus === 'free') {
                        result.moves.push([cellPosX, cellPosY])
                    } else if (cellStatus === 'kill') {
                        result.kills.push([cellPosX, cellPosY])
                        break
                    } else if (cellStatus === 'stop') {
                        break
                    }
                }
            })
        }
        return result
    }

    isOutsideBoard(x, y, model) {
        const length = model.length
        if (y >= length || y < 0 || x >= length || x < 0) {
            return true
        }
    }

    getCellStatus(x, y, model) {
        if (this.isOutsideBoard(x, y, model)) {
            return 'outsideBoard'
        }

        const figure = model[y][x]
        if (!figure) {
            return 'free'
        } else if (figure.color !== this.color) {
            return 'kill'
        } else if (figure.color === this.color) {
            return 'stop'
        }
    }

    async prepareImages() {
        const img = new Image()
        img.src = this.img[this.color]

        await new Promise((resolve, reject) => {
            img.onload = () => {
                this.pic = img
                resolve()
            }
            img.onerror = reject
        })
    }
}