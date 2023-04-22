import { splitProps, JSX } from 'solid-js'
import cxx from '../cxx'
import './Box.scss'

type DivProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'onChange'>
type Props = DivProps & {
  children?: any,

  class?: string,
  horizontal?: boolean,
  vertical?: boolean,

  fill?: boolean,
  wrap?: boolean,
  inline?: boolean,

  align?:   true | 'start' | 'end' | 'stretch',
  justify?: true | 'start' | 'end' | 'between',
}

const PROPS = [
  'class',
  'horizontal',
  'vertical',

  'fill',
  'wrap',
  'inline',

  'align',
  'justify',
] as (keyof Props)[]

/**
 * A box container, using flex layout
 */
export default function Box(allProps: Props) {
  const [props, rest] = splitProps(allProps, PROPS)

  return (
    <div
      class={
        cxx(
          'Box',
          {
            horizontal: props.horizontal ?? !props.vertical,
            vertical:   props.vertical,
            fill:   props.fill,
            wrap:   props.wrap,
            inline: props.inline,
          },
          alignClass(props.align),
          justifyClass(props.justify),
          props.class
        )
      }
      {...rest}
    />
  )
}

function alignClass(align?: true | 'start' | 'end' | 'stretch') {
  if (align === true)
    return 'Box--align'
  if (typeof align === 'string')
    return `Box--align-${align}`
  return undefined
}

function justifyClass(justify?: true | 'start' | 'end' | 'between') {
  if (justify === true)
    return 'Box--justify'
  if (typeof justify === 'string')
    return `Box--justify-${justify}`
  return undefined
}
