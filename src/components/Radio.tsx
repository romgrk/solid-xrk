import { For, splitProps, JSX } from 'solid-js'
import type { Option } from '../types'
import cxx from '../cxx'
import callHandler from '../helpers/callHandler'

let nextId = 1
let nextName = 1

interface Props extends JSX.IntrinsicAttributes {
  id?: string;
  name?: string;
  class?: string;
  value?: any;
  checked?: boolean;
  disabled?: boolean;
  onChange?: any;
  children?: any;
}

/**
 * @param {string} props.icon
 * @param {string} props.iconAfter
 * @param {boolean} props.loading
 */
export default function Radio(allProps: Props) {
  const [props, rest] = splitProps(allProps, [
    'id',
    'class',
    'children',
    'disabled',
  ])
  const id = props.id || `radio-${nextId++}`
  const disabled = () => props.disabled

  return (
    <span class={cxx('Radio', {
      disabled: disabled(),
    }, props.class)}>
      <input
        {...rest}
        type='radio'
        id={id}
        disabled={disabled()}
      />
      <label for={id}>
        {props.children}
      </label>
    </span>
  )
}

interface GroupProps extends JSX.IntrinsicAttributes {
  value?: any;
  name?: string;
  class?: string;
  options: Option[];
  onChange?: (value: any, ev: Event, o: Option) => void;
}

export function Group(props: GroupProps) {
  const refs = {}
  const name = props.name || `radiogroup-${nextName++}`

  const onChange = (o: Option, ev) => {
    const previousValue = props.value
    callHandler(props.onChange, o.value, ev, o)
    const currentValue = props.value
    if (props.value !== undefined && previousValue === currentValue) {
      ev.target.checked = false
      refs[previousValue].checked = true
    }
  }

  const onRef = (o, node) => {
    refs[o.value] = node
  }

  return (
    <div class={cxx('RadioGroup', props.class)}>
      <For each={props.options}
        children={o =>
          <Radio
            name={name}
            checked={props.value !== undefined ? props.value === o.value : undefined}
            value={o.value}
            ref={n => onRef(o, n)}
            onChange={[onChange, o] as any}
          >
            {o.label}
          </Radio>
        }
      />
    </div>

  )
}

Radio.Group = Group
