import { JSX, splitProps } from 'solid-js'
import cxx from '../cxx'
import callHandler from '../helpers/callHandler'
import Icon from './Icon'


type InputProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'onChange'>
type OwnProps = {
  ref?: any,
  value?: string,
  class?: string,
  status?: string,
  icon?: string,
  iconAfter?: string,
  loading?: boolean,
  disabled?: boolean,
  onChange?: (value: string, ev?: Event) => void,
}
type Props = InputProps & OwnProps

const PROPS = [
  'ref',
  'class',
  'status',
  'icon',
  'iconAfter',
  'loading',
  'disabled',
  'onChange',
] as const

/**
 * Input: an input element
 */
export default function Input(allProps: Props) {
  const [props, rest] = splitProps(allProps, PROPS)
  const disabled = () => props.loading || props.disabled
  const onChange = (ev: InputEvent) => {
    const target = ev.target as HTMLInputElement
    callHandler(props.onChange, target.value, ev)
    if (rest.value !== undefined && target.value !== rest.value)
      target.value = rest.value
  }

  return (
    <span
      ref={props.ref}
      class={cxx(`Input Input--${props.status}`, { disabled: disabled() }, props.class)}
    >
      {props.icon && <Icon name={props.icon} />}
      <input
        {...rest}
        disabled={disabled()}
        onInput={onChange}
      />
      {props.iconAfter && <Icon name={props.iconAfter} />}
      {props.loading && <Icon name='sync' spin />}
    </span>
  )
}
