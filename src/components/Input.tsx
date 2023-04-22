import { JSX, splitProps } from 'solid-js'
import { Size, Status } from '../types'
import cxx from '../cxx'
import callHandler from '../helpers/callHandler'
import createControlledValue from '../helpers/createControlledValue'
import Icon from './Icon'
import './Input.scss'

type InputProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'onChange'>
type OwnProps = {
  ref?: any,
  class?: string,
  size?: Size,
  variant?: string,
  status?: Status,
  icon?: string,
  iconAfter?: string,
  loading?: boolean,
  disabled?: boolean,

  value?: string,
  defaultValue?: string,
  onChange?: (value: string, ev?: Event) => void,
}
type Props = InputProps & OwnProps

const PROPS = [
  'ref',
  'class',
  'size',
  'variant',
  'status',
  'icon',
  'iconAfter',
  'loading',
  'disabled',
  'value',
  'defaultValue',
  'onChange',
] as const

/**
 * Input: an input element
 */
export default function Input(allProps: Props) {
  const [props, rest] = splitProps(allProps, PROPS)
  const [value, setValue] = createControlledValue(props, '')

  const disabled = () => props.loading || props.disabled
  const onChange = (ev: InputEvent) => {
    const target = ev.target as HTMLInputElement
    setValue(target.value, ev)
  }

  return (
    <span
      ref={props.ref}
      class={
        cxx(
          'Input',
          `Input--${props.size ?? 'md'}`,
          `Input--${props.variant ?? 'primary'}`,
          `Input--${props.status}`,
          { disabled: disabled() },
          props.class
        )
      }
    >
      {props.icon && <Icon name={props.icon} />}
      <input
        {...rest}
        value={value()}
        disabled={disabled()}
        onInput={onChange}
      />
      {props.iconAfter && <Icon name={props.iconAfter} />}
      {props.loading && <Icon name='sync' spin />}
    </span>
  )
}
