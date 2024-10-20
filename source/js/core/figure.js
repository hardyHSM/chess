export default class Figure {
    constructor({ x, y, type, color, movement, img }) {
        this.position = {
            x: x,
            y: y
        }
        this.type = type
        this.color = color
        this.movement = movement
        this.isActive = false
        this.img = img || ''
        this.pic = null
    }

    showMovement(model) {
        const result = {
            moves: [],
            kills: []
        }
        if (Array.isArray(this.movement)) {
            this.movement.forEach(move => {
                for ( const item of move ) {
                    let [x, y] = item
                    let [figureX, figureY] = [this.position.x, this.position.y]
                    let resultCheckingCollision = this.checkCollision(
                        figureX + x,
                        figureY + y,
                        model
                    )
                    if (!resultCheckingCollision) {
                        result.moves.push([figureX + x, figureY + y])
                    } else if (resultCheckingCollision === 'kill') {
                        result.kills.push([figureX + x, figureY + y])
                        break
                    } else if (resultCheckingCollision === 'stop') {
                        break
                    }
                }
            })
        }
        return result
    }

    checkCollision(x, y, model) {
        const length = model.length
        if (y >= length || y < 0 || x >= length || x < 0) {
            return true
        }

        const cell = model[y][x]
        if (!cell) {
            return false
        } else if (cell.color !== this.color) {
            return 'kill'
        } else if (cell.color === this.color) {
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