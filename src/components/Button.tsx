import { splitProps, JSX } from 'solid-js'
import cxx from '../cxx'
import Icon from './Icon'

type Props = JSX.CustomAttributes<HTMLElement> & JSX.DOMAttributes<HTMLElement> & {
  class?: string,
  type?: 'button' | 'reset' | 'submit',
  icon?: string,
  iconAfter?: string,
  loading?: boolean,
  variant?: string,
  size?: string,
  role?: string,
  disabled?: boolean,
  children?: any,
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
export default function Button(allProps: Props) {
  const [props, rest] = splitProps(allProps, buttonProps)
  return (
    <button
      class={buttonClass(props)}
      disabled={props.disabled}
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

// Helpers

export function buttonClass(props: Props) {
  const size = props.size ?? 'medium'
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
