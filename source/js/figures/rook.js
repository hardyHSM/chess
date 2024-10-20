import Figure from '../core/figure'
import imgBlack from '../../assets/rook-black.svg'
import imgWhite from '../../assets/rook-white.svg'


export default class Rook extends Figure {
    constructor({ x, y, color }) {
        super({
            x,
            y,
            type: 'rook',
            color: color,
            movement: [
                [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7]],
                [[0, -1], [0, -2], [0, -3], [0, -4], [0, -5], [0, -6], [0, -7]],
                [[1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0]],
                [[-1, 0], [-2, 0], [-3, 0], [-4, 0], [-5, 0], [-6, 0], [-7, 0]]
            ],
            img: {
                white: imgWhite,
                black: imgBlack
            }
        })
    }
}