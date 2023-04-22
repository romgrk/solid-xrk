export default function cxx(baseName: string, ...args: any[]): string {
  let result = baseName

  for (let arg of args) {
    if (typeof arg === 'string') {
      result += ' ' + arg
    }
    else if (typeof arg === 'object' && arg !== null) {
      for (const key in arg) {
        if (arg[key]) {
          result += ` ${baseName}--${key}`
        }
      }
    }
  }

  return result
}
