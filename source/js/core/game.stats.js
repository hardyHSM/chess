export default class Game {
    sides = ['white', 'black']
    currentStep = 0
    isEnd = false

    get currentSide() {
        return this.sides[this.currentStep]
    }

    getOtherSide() {
        return this.sides[this.currentStep ^ 1]
    }

    changeStep() {
        return (this.currentStep = this.currentStep ^ 1)
    }

    setSide(color) {
        this.currentStep = color === 'white' ? 0 : 1
    }
}