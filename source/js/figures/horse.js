import Figure from '../core/figure'
import imgWhite from '../../assets/horse-white.svg'
import imgBlack from '../../assets/horse-black.svg'


export default class Horse extends Figure {
    constructor({ x, y, color }) {
        super({
            x,
            y,
            type: 'horse',
            color: color,
            movement: [
                [[-1, -2]],
                [[1, -2]],
                [[-1, 2]],
                [[1, 2]],
                [[2, 1]],
                [[2, -1]],
                [[-2, 1]],
                [[-2, -1]]
            ],
            img: {
                white: imgWhite,
                black: imgBlack
            }
        })
    }
}