import { splitProps } from 'solid-js'
import cxx from '../cxx'
import eventHandler from '../event-handler'

let nextId = 1

type Props = {
  id?: string,
  value?: boolean,
  class?: string,
  size?: string,
  children?: any,
  disabled?: boolean,
  onChange?: (value: boolean, ev: Event) => void,
}
const PROPS: (keyof Props)[] = [
  'id',
  'value',
  'class',
  'size',
  'children',
  'disabled',
  'onChange',
]

export default function Checkbox(allProps: Props) {
  const [props, rest] = splitProps(allProps, PROPS)
  const id = props.id || `checkbox-${nextId++}`

  const onChange = (ev: Event) => {
    const target = ev.target as HTMLInputElement
    eventHandler(props.onChange, target.checked, ev)
    if (props.value !== undefined && props.value !== target.checked)
      target.checked = props.value
  }

  return (
    <span
      class={cxx(
        'Checkbox',
        `Checkbox--${props.size ?? 'medium'}`,
        {
          disabled: props.disabled,
        },
        props.class
      )}
    >
      <input
        {...rest}
        type='checkbox'
        id={id}
        checked={props.value}
        onChange={onChange}
        disabled={props.disabled}
      />
      <label for={id}>{props.children}</label>
    </span>
  )
}
