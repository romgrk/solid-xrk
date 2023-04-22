import { onCleanup } from 'solid-js'

export default class Disposer {
  effects: Function[] = []

  push(fn: Function) {
    this.effects.push(fn)
  }

  run = () => {
    this.effects.forEach(fn => { fn() })
    this.effects.length = 0
  }
}

export function createDisposer() {
  const disposer = new Disposer()

  onCleanup(disposer.run)

  return disposer
}
