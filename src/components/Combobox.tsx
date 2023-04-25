import {
  splitProps,
  createEffect,
  createSignal,
  JSX
} from 'solid-js'
import { For, Show } from 'solid-js/web'
import type { Primitive, Option } from '../types'
import cxx from '../cxx'
import uniqueId from '../helpers/uniqueId'
import callHandler from '../helpers/callHandler'
import createControlledValue from '../helpers/createControlledValue'
import Box from './Box'
import Button from './Button'
import Input from './Input'
import Popover, { PopoverAPI } from './Popover'
import './Dropdown.scss'

type HTMLProps = Omit<JSX.DOMAttributes<HTMLInputElement>, 'onChange'>
type OwnProps = {
  options: Option[],
  id?: string,
  class?: string,
  size?: string,
  variant?: string,
  loading?: boolean,
  disabled?: boolean,
  placeholder?: JSX.Element,
  emptyMessage?: JSX.Element,
  children?: any,

  value?: Primitive,
  defaultValue?: Primitive,
  onChange?: (value: Primitive, option?: Option) => void,
  onSearch?: (query: string, ev?: Event) => void,
}
type Props = HTMLProps & OwnProps

const PROPS = [
  'options',
  'id',
  'class',
  'size',
  'variant',
  'loading',
  'disabled',
  'placeholder',
  'emptyMessage',
  'children',
  'value',
  'defaultValue',
  'onChange',
  'onSearch',
] as (keyof Props)[]

export default function Dropdown(allProps: Props) {
  const [props, rest] = splitProps(allProps, PROPS)

  let popover: PopoverAPI
  let popoverNode: HTMLDivElement
  let inputNode: HTMLElement

  const close = () => {
    popover.close()
    if (inputNode)
      (inputNode.children[0] as HTMLInputElement).value = ''
  }

  const menuId = props.id || uniqueId()
  const disabled = () => props.disabled || props.loading
  const placeholder = () => props.placeholder ?? 'Select value'
  const [isOpen, setOpen] = createSignal(false)
  const [selected, setSelected] = createSignal(-1)

  const [value, setValue] = createControlledValue(props, null)

  const findOption = () => props.options.find(o => o.value === value())
  const [option, setOption] = createSignal(findOption())
  createEffect(() => {
    setOption(findOption())
  })

  const onChange = (o: Option | undefined) => {
    setValue(o ? o.value : null)
    setOption(o)
    close()
    callHandler(props.onChange, o ? o.value : null, o)
  }

  const onKeyDown = (ev: KeyboardEvent) => {
    if (!popover.isOpen())
      popover.open()
    switch (ev.key) {
      case 'Enter': {
        let index = selected()
        if (index === -1)
          index = 0
        const o = props.options[index]
        if (o)
          onChange(o)
        close()
        break
      }
      case 'ArrowDown': {
        let index = selected() + 1
        if (index >= props.options.length)
          index = -1
        setSelected(index)
        break
      }
      case 'ArrowUp': {
        let index = selected() - 1
        if (index <= -2)
          index = props.options.length - 1
        setSelected(index)
        break
      }
      case 'Escape': {
        close()
        break
      }
      default: return
    }
    ev.preventDefault()
  }

  const onChangeOpen = (open: boolean) => {
    setOpen(open)
    if (!open)
      return
    const v = value()
    setSelected(props.options.findIndex(o => o.value === v) ?? -1)
  }

  const triggerLabel = () => option()?.label ?? value() ?? placeholder()
  const triggerClass = () => cxx('Dropdown', [props.size, props.variant], { disabled: disabled() }, props.class)
  const trigger = (p: PopoverAPI) => {
    popover = p
    return triggerInput()
  }

  const triggerInput = () => {
    const onBlur = (ev: FocusEvent) => {
      if (ev.relatedTarget === popoverNode || popoverNode.contains(ev.relatedTarget as any))
        return
      close()
    }
    const onFocus = () => {
      popover.open()
      props.onSearch?.('')
    }
    return (
      <Input
        ref={(n: HTMLInputElement) => (inputNode = n) && popover.ref(n)}
        class={triggerClass()}
        iconAfter='chevron-down'
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={props.onSearch}
        onKeyDown={onKeyDown}
        placeholder={triggerLabel()}
        {...rest}
        aria-expanded={isOpen()}
      />
    )
  }

  const popoverClass = () =>
    cxx('Dropdown__popover', props.class)

  const itemClass = (o: Option, index: number) =>
    cxx('Dropdown__item', { active: value() === o.value, selected: selected() === index })

  return (
    <Popover
      trigger={trigger}
      open={isOpen()}
      onChange={onChangeOpen}
    >
      <Box
        vertical
        id={menuId}
        ref={popoverNode!}
        tabindex='-1'
        role='listbox'
        class={popoverClass()}
        onKeyDown={onKeyDown}
        aria-activedescendant={value() !== undefined ? `${menuId}--${value()}` : ''}
      >
        <For each={props.options}
          children={(o, index) =>
            <button
              id={`${menuId}--${o.value}`}
              role='option'
              class={itemClass(o, index())}
              onClick={[onChange, o]}
              aria-selected={value() === o.value ? 'true' : 'false'}
            >
              {o.label ?? o.value}
            </button>
          }
        />
        <Show when={props.options.length === 0}>
          <div class='Dropdown__empty'>
            {props.emptyMessage ?? 'No options'}
          </div>
        </Show>
      </Box>
    </Popover>
  )
}
