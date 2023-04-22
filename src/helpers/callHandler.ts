export default function callHandler(
  callback: undefined | Function | [Function, any],
  ...args: any[]
) {
  if (Array.isArray(callback))
    callback[0](callback[1], ...args)
  else if (typeof callback === 'function')
    callback(...args)
}
