import Figure from '../core/figure'
import imgBlack from '../../assets/king-black.svg'
import imgWhite from '../../assets/king-white.svg'


export default class King extends Figure {
    constructor({ x, y, color }) {
        super({
            x,
            y,
            type: 'king',
            color: color,
            movement: [
                [[0, 1]],
                [[1, 1]],
                [[1, 0]],
                [[-1, -1]],
                [[0, -1]],
                [[1, -1]],
                [[-1, 1]],
                [[-1, 0]]
            ],
            img: {
                white: imgWhite,
                black: imgBlack
            }
        })
        this.castlingVariants = new Map() // ???
        this.castling = [[-1, -2, -3, -4, -5, -6, -7], [1, 2, 3, 4, 5, 6, 7]]
    }

    showMovement(model) {
        const res = super.showMovement(model)
        const castling = []

        this.castling.forEach(offsetCells => {
            for ( const offsetX of offsetCells ) {
                let { x: kingPosX, y: kingPosY } = this.position


                const collisionResult = this.checkCollision(kingPosX + offsetX, kingPosY, model)
                if (collisionResult && collisionResult !== 'rook') {
                    break
                }
                if (collisionResult === 'rook') {
                    let rook = model[kingPosY][kingPosX + offsetX]
                    if (Math.abs(offsetX) <= 2) break

                    let offsetPositionKing = [kingPosX + offsetCells[1], kingPosY]
                    let offsetPositionRook = [
                        offsetX > 0 ? (offsetPositionKing[0] - 1) : (offsetPositionKing[0] + 1),
                        kingPosY
                    ]
                    castling.push({
                        movement: offsetPositionKing,
                        rook: {
                            figure: rook,
                            movement: offsetPositionRook
                        }
                    })
                    break
                }
            }
        })
        res.castling = castling
        return res
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
        } else if (cell.color === this.color && cell.type === 'rook') {
            return 'rook'
        } else {
            return 'stop'
        }
    }
}