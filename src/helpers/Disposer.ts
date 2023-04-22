export default class Disposer {
  effects: Function[] = []

  push(fn: Function) {
    this.effects.push(fn)
  }

  run() {
    this.effects.forEach(fn => { fn() })
    this.effects.length = 0
  }
}
