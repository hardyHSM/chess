import Figure from '../core/figure'
import imgBlack from '../../assets/pawn-black.svg'
import imgWhite from '../../assets/pawn-white.svg'

export default class Pawn extends Figure {
    constructor({ x, y, color }) {
        super({
            x, y, color,
            type: 'pawn',
            movement: {
                black: {
                    firstStep: {
                        1: [[0, 1], [0, 2]]
                    },
                    steps: [[0, 1]],
                    kills: [[1, 1], [-1, 1]],
                    swap: 7
                },
                white: {
                    firstStep: {
                        6: [[0, -1], [0, -2]]
                    },
                    steps: [[0, -1]],
                    kills: [[-1, -1], [1, -1]],
                    swap: 0
                }
            },
            img: {
                white: imgWhite,
                black: imgBlack
            }
        })
    }

    getPossibleSteps(model) {
        const result = {
            moves: [],
            kills: [],
            swap: []
        }
        if (!Array.isArray(this.movement)) {
            let movement = this.movement[this.color]

            let [pawnPosX, pawnPosY] = [this.position.x, this.position.y]

            if (movement.firstStep[pawnPosY]) {
                movement.firstStep[pawnPosY].forEach(cell => {
                    let [x, y] = cell
                    let cellStatus = this.getCellStatus(pawnPosX + x, pawnPosY + y, model)

                    if (cellStatus !== 'outsideBoard' || cellStatus !== 'stop') {
                        result.moves.push([pawnPosX + x, pawnPosY + y])
                    }
                })
            } else {
                movement.steps.map(cell => {
                    let [x, y] = cell
                    let cellStatus = this.getCellStatus(pawnPosX + x, pawnPosY + y, model)
                    if (cellStatus !== 'outsideBoard') {
                        result.moves.push([pawnPosX + x, pawnPosY + y])
                    }
                })
            }
            movement.kills.map(item => {
                let [x, y] = item
                let cellStatus = this.getCellStatus(pawnPosX + x, pawnPosY + y, model)

                if (cellStatus === 'kill') {
                    result.kills.push([pawnPosX + x, pawnPosY + y])
                }
            })
        }
        return result
    }

    getCellStatus(x, y, model) {
        if (this.isOutsideBoard(x, y, model)) {
            return 'outsideBoard'
        }
        const figure = model[y][x]
        if (figure && figure.color !== this.color) {
            return 'kill'
        }
        if (figure && (figure.color !== this.color || figure.color === this.color)) {
            return 'stop'
        }

    }
}