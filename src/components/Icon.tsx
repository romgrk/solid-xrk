import { splitProps } from "solid-js"
import octicons from '@primer/octicons'
import './Icon.scss'

type Props = {
  name: string,
  spin?: boolean,
  width?: number,
  color?: string,
  info?: boolean,
  success?: boolean,
  warning?: boolean,
  danger?: boolean,
}

const PROPS = [
  'name',
  'spin',
  'width',
  'color',
  'info',
  'success',
  'warning',
  'danger',
] as const

const colors = {
  info: '#0366D6',
  success: '#22863A',
  warning: '#B08800',
  danger: '#D73A49',
}

type GetIcon = (name: string, props?: any) => string

let getIcon: GetIcon = (name: string, props?: any) => {
  const icon = octicons[name]
  if (!icon)
    throw new Error('Invalid icon name: ' + name)
  return icon.toSVG(props)
}

export function setIconFunction(fn: GetIcon) {
  getIcon = fn
}


/*
 * Example: 
 *
 * <Icon name='gear' />
 * <Icon name='gear' width={40} />
 * <Icon name='info' info />
 * <Icon name='check' success />
 * <Icon name='alert' warning />
 * <Icon name='x' danger />
 */

/**
 * @param {string} props.name
 */
export default function Icon(allProps: Props) {
  const [props, rest] = splitProps(allProps, PROPS)
  const getColor = () => 
    props.color ? props.color :
    props.info ? colors.info :
    props.success ? colors.success :
    props.warning ? colors.warning :
    props.danger ? colors.danger : undefined

  const size = () => props.width || 16

  return (
    <span
      class={'Icon ' + (props.spin ? ' Icon--spin' : '')}
      style={{ color: getColor(), width: `${size()}px`, height: `${size()}px` }}
      innerHTML={getIcon(props.name, rest)}
    />
  )
}
