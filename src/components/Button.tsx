import { splitProps, JSX } from 'solid-js'
import type { Size } from '../types'
import cxx from '../cxx'
import Icon from './Icon'
import './Button.scss'

type Props = JSX.CustomAttributes<HTMLElement> & JSX.DOMAttributes<HTMLElement> & {
  class?: string,
  size?: Size,
  variant?: string,

  type?: 'button' | 'reset' | 'submit',
  icon?: string,
  iconAfter?: string,
  loading?: boolean,
  disabled?: boolean,
}
type PropsKey = keyof Props

const buttonProps: PropsKey[] = [
  'class',
  'type',
  'icon',
  'iconAfter',
  'loading',
  'variant',
  'size',
  'disabled',
  'children',
]

/**
 * Button: a normal button
 */
function Button(allProps: Props) {
  const [props, rest] = splitProps(allProps, buttonProps)
  return (
    <button
      class={buttonClass(props)}
      disabled={props.disabled || props.loading}
      type={props.type ?? 'button'}
      {...rest}
    >
      {props.icon && <Icon name={props.icon} />}
      {props.children}
      {props.iconAfter && <Icon name={props.iconAfter} />}
      {props.loading && <Icon name='sync' spin />}
    </button>
  )
}

type DivProps = JSX.HTMLAttributes<HTMLDivElement>
Button.Group = function Group(props: DivProps) {
  return (
    <div
      {...props}
      class={cxx('ButtonGroup', props.class)}
    />
  )
}

export default Button

// Helpers

export function buttonClass(props: Props) {
  const size = props.size ?? 'md'
  const variant = props.variant ?? 'primary'

  return cxx(
    'Button',
    `Button--${size}`,
    `Button--${variant}`,
    {
      loading: props.loading,
      disabled: props.disabled,
    },
    props.class
  )
}
