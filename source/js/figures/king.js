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
        this.castlingOffsets = [[-1, -2, -3, -4, -5, -6, -7], [1, 2, 3, 4, 5, 6, 7]]
    }

    getPossibleSteps(model) {
        const res = super.getPossibleSteps(model)
        const castling = []

        this.castlingOffsets.forEach(offsetCells => {
            for ( const offsetX of offsetCells ) {
                const { x: kingPosX, y: kingPosY } = this.position

                const cellStatus = this.getCellStatus(kingPosX + offsetX, kingPosY, model)
                if (cellStatus === 'outsideBoard' ||  cellStatus === 'stop') {
                    break
                }
                if (cellStatus === 'rook') {
                    const rook = model[kingPosY][kingPosX + offsetX]
                    if (Math.abs(offsetX) <= 2) break

                    const offsetPositionKing = [kingPosX + offsetCells[1], kingPosY]
                    const offsetPositionRook = [
                        offsetX > 0 ? (offsetPositionKing[0] - 1) : (offsetPositionKing[0] + 1),
                        kingPosY
                    ]
                    castling.push({
                        king: {
                            figure: this,
                            newPosition: offsetPositionKing,
                        },
                        rook: {
                            figure: rook,
                            newPosition: offsetPositionRook
                        }
                    })
                    break
                }
            }
        })
        res.castling = castling
        return res
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
        } else if (figure.color === this.color && figure.type === 'rook') {
            return 'rook'
        } else {
            return 'stop'
        }
    }
}