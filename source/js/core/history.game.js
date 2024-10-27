import { cloneDeep } from 'lodash'

export default class HistoryGame {
    history = []

    addItem(data) {
        this.history.push({
            figures: cloneDeep(data.figures),
            cells: cloneDeep(data.cells),
            currentSide: data.currentSide,
            boardInfo: data.boardInfo,
            leftBoard: cloneDeep(data.leftBoard),
            rightBoard: cloneDeep(data.rightBoard),
            isCheck: data.isCheck
        })
    }

    getLast() {
        return this.history.pop()
    }
}