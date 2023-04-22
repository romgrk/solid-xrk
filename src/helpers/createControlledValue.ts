import { createSignal, Accessor } from 'solid-js'
import callHandler from './callHandler'

type SetterWithData<T, U> = (value: T, data?: U) => void

type Props<T, U> =
  | {
    value: T,
    onChange: SetterWithData<T, U>,
  }
  | {
    defaultValue?: T,
    onChange?: SetterWithData<T, U>,
  }

export default function createControlledValue<T, U>(
  props: Props<T, U>,
  defaultValue?: T
): [Accessor<T>, SetterWithData<T, U>]
{

  const isControlled = 'value' in props

  let value: Accessor<T>
  let setValue: SetterWithData<T, U>

  if (isControlled) {
    if (props.onChange === undefined)
      throw new Error('createControlledValue: missing onChange for controlled value')

    value = () => props.value
    setValue = (value: T, data?: U) => {
      props.onChange!(value, data)
    }
  } else {
    const realDefaultValue = props.defaultValue ?? defaultValue
    if (realDefaultValue === undefined)
      throw new Error('createControlledValue: missing default value for uncontrolled value')

    let [getValue, setValueDirect] = createSignal<T>(realDefaultValue)

    value = getValue
    setValue = (value: T, data?: U) => {
      setValueDirect(value as any)
      callHandler(props.onChange, value, data)
    }
  }

  return [value, setValue]
}
