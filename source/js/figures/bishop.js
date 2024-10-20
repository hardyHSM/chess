import Figure from '../core/figure'
import imgBlack from '../../assets/bishop-black.svg'
import imgWhite from '../../assets/bishop-white.svg'


export default class Bishop extends Figure {
    constructor({ x, y, color }) {
        super({
            x,
            y,
            type: 'bishop',
            color: color,
            movement: [
                [[1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7]],
                [[-1, -1], [-2, -2], [-3, -3], [-4, -4], [-5, -5], [-6, -6], [-7, -7]],
                [[-1, 1], [-2, 2], [-3, 3], [-4, 4], [-5, 5], [-6, 6], [-7, 7]],
                [[1, -1], [2, -2], [3, -3], [4, -4], [5, -5], [6, -6], [7, -7]]
            ],
            img: {
                white: imgWhite,
                black: imgBlack
            }
        })
    }
}