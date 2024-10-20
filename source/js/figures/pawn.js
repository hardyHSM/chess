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

    showMovement(model) {
        const result = {
            moves: [],
            kills: [],
            swap: []
        }
        if (!Array.isArray(this.movement)) {
            let movement = this.movement[this.color]

            const pawnPosY = this.position.y
            const pawnPosX = this.position.x

            if (pawnPosY && movement.firstStep[pawnPosY]) {
                movement.firstStep[pawnPosY].forEach(item => {
                    let [x, y] = item
                    let collisionResult = this.checkCollision(pawnPosX + x, pawnPosY + y, model)

                    if (!collisionResult || collisionResult !== 'stop') {
                        result.moves.push([pawnPosX + x, pawnPosY + y])
                    }
                })
            } else {
                movement.steps.map(item => {
                    let [x, y] = item
                    let collisionResult = this.checkCollision(pawnPosX + x, pawnPosY + y, model)
                    if (!collisionResult) {
                        result.moves.push([pawnPosX + x, pawnPosY+ y])
                    }
                })
            }
            movement.kills.map(item => {
                let [x, y] = item
                let collisionResult = this.checkKills(pawnPosX + x, pawnPosY + y, model)

                if (collisionResult === 'kill') {
                    result.kills.push([pawnPosX + x, pawnPosY + y])
                }
            })
        }
        return result
    }

    checkKills(x, y, model) {
        const length = model.length
        if (y >= length || y < 0 || x >= length || x < 0) return false

        const cell = model[y][x]
        if (cell && cell.color !== this.color) return 'kill'
    }

    checkCollision(x, y, model) {
        const length = model.length
        if (y >= length || y < 0 || x >= length || x < 0) {
            return true
        }
        const cell = model[y][x]
        if (cell && (cell.color !== this.color || cell.color === this.color)) {
            return 'stop'
        }

    }
}