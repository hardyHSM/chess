import Figure from '../core/figure'
import imgBlack from '../../assets/pawn-black.svg'
import imgWhite from '../../assets/pawn-white.svg'
import { cloneDeep } from 'lodash'

export default class Pawn extends Figure {
    constructor({ x, y, color }) {
        super({
            x, y, color,
            type: 'pawn',
            movement: {
                kills: color === 'white' ? [[-1, -1], [1, -1]] : [[1, 1], [-1, 1]],
                steps: color === 'white' ? [[0, -1], [0, -2]] : [[0, 1], [0, 2]],
                startPos: color === 'white' ? 6 : 1,
                swap: color === 'white' ? 0 : 7
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
            const movement = cloneDeep(this.movement)
            const [pawnPosX, pawnPosY] = [this.position.x, this.position.y]

            if (pawnPosY !== movement.startPos) {
                movement.steps.length = 1
            }

            for ( const moveOffset of movement.steps ) {
                const [moveOffsetX, moveOffsetY] = moveOffset
                const [cellPosX, cellPosY] = [pawnPosX + moveOffsetX, pawnPosY + moveOffsetY]

                const cellStatus = this.getCellStatus(cellPosX, cellPosY, model)

                if (cellStatus === 'stop' || cellStatus === 'kill') {
                    break
                }
                if (cellStatus !== 'outsideBoard' && cellStatus !== 'kill') {
                    result.moves.push([cellPosX, cellPosY])
                }
            }

            movement.kills.map(item => {
                const [x, y] = item
                const cellStatus = this.getCellStatus(pawnPosX + x, pawnPosY + y, model)

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
        if (!figure) {
            return 'free'
        } else if (figure.color !== this.color) {
            return 'kill'
        } else if (figure.color === this.color) {
            return 'stop'
        }
    }
}