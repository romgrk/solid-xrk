import { splitProps, createSignal, Accessor, Setter, JSX } from 'solid-js'
import { For, Show } from 'solid-js/web'
import type { Option } from '../types'
import cxx from '../cxx'
import uniqueId from '../helpers/uniqueId'
import callHandler from '../helpers/callHandler'
import Button from './Button'
import Input from './Input'
import Popover, { PopoverAPI } from './Popover'
import './Dropdown.scss'

type HTMLProps = Omit<JSX.DOMAttributes<HTMLInputElement>, 'onChange'>
type OwnProps = {
  options: Option[],
  id?: string,
  class?: string,
  value?: any,
  defaultValue?: any,
  size?: string,
  variant?: string,
  input?: boolean,
  loading?: boolean,
  disabled?: boolean,
  placeholder?: JSX.Element,
  emptyMessage?: JSX.Element,
  children?: any,
  onChange?: (value: string|number|null, ev: Event|undefined, o: Option) => void,
  onSearch?: (query: string, ev?: Event) => void,
}
type Props = HTMLProps & OwnProps

const PROPS = [
  'options',
  'id',
  'class',
  'value',
  'defaultValue',
  'size',
  'variant',
  'input',
  'loading',
  'disabled',
  'placeholder',
  'emptyMessage',
  'children',
  'onChange',
  'onSearch',
  'onBlur',
  'onFocus',
] as (keyof Props)[]

export default function Dropdown(allProps: Props) {
  const [props, rest] = splitProps(allProps, PROPS)

  // TODO: pass popover-props to popover

  let popover: PopoverAPI
  let popoverNode: HTMLDivElement
  let inputNode: HTMLElement

  const close = () => {
    popover.close()
    if (inputNode)
      (inputNode.children[0] as HTMLInputElement).value = ''
  }

  const id = props.id || uniqueId()
  const disabled = () => props.disabled || props.loading
  const placeholder = () => props.placeholder ?? '-'
  const [value, option, onChange] = createControlledValue(props, close)
  const [selected, setSelected] = createSignal(-1)

  const onKeyDown = (ev: KeyboardEvent) => {
    if (!popover.isOpen())
      popover.open()
    switch (ev.key) {
      case 'Enter': {
        let index = selected()
        if (index === -1 && props.input)
          index = 0
        const o = props.options[index]
        if (o)
          onChange(o, undefined)
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
      default: return
    }
    ev.preventDefault()
  }

  let previousActiveElement: HTMLElement | undefined
  const onOpen = () => {
    if (!props.input) {
      previousActiveElement = document.activeElement as HTMLElement
      popoverNode.focus()
    }
    const v = value()
    setSelected(props.options.findIndex(o => o.value === v) ?? -1)
  }
  const onClose = () => {
    if (previousActiveElement) {
      previousActiveElement.focus()
      previousActiveElement = undefined
    }
  }

  const triggerLabel = () => option()?.label ?? value() ?? placeholder()
  const triggerClass = () =>
    cxx('Dropdown', [props.size, props.variant], { disabled: disabled() }, props.class)
  const trigger = (popover_: PopoverAPI) => {
    popover = popover_
    return props.input ? triggerInput() : triggerButton()
  }
  const triggerButton = () =>
    <Button
      ref={popover.ref}
      class={triggerClass()}
      iconAfter='chevron-down'
      onClick={() => popover.open()}
      {...rest}
    >
      {triggerLabel()}
    </Button>

  const triggerInput = () => {
    const onBlur = (ev: FocusEvent) => {
      if (ev.relatedTarget === popoverNode || popoverNode.contains(ev.relatedTarget as any))
        return
      close()
      callHandler(props.onBlur)
    }
    const onFocus = () => {
      popover.open()
      callHandler(props.onFocus)
      props.onSearch?.('')
    }
    return (
      <Input
        ref={n => (inputNode = n) && popover.ref(n)}
        class={triggerClass()}
        iconAfter='chevron-down'
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={props.onSearch}
        onKeyDown={onKeyDown}
        placeholder={triggerLabel()}
        {...rest}
      />
    )
  }

  const popoverClass = () =>
    cxx('Dropdown__popover', props.class)

  const itemClass = (o: Option, index: number) =>
    cxx('Dropdown__item', { active: value() === o.value, selected: selected() === index }, 'sel-' + selected())

  return (
    <Popover
      trigger={trigger}
      onOpen={onOpen}
      onClose={onClose}
    >
      <div
        id={id}
        ref={popoverNode!}
        tabindex='-1'
        role='listbox'
        class={popoverClass()}
        aria-activedescendant={value() !== undefined ? `${id}--${value()}` : ''}
        onKeyDown={onKeyDown}
      >
        <For each={props.options}
          children={(o, index) =>
            <button
              id={`${id}--${o.value}`}
              role='option'
              aria-selected={value() === o.value ? 'true' : 'false'}
              class={itemClass(o, index())}
              onClick={[onChange, o]}
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
      </div>
    </Popover>
  )
}

function createControlledValue<T>(
  props: Props,
  close: () => void
): [() => any, Accessor<Option | undefined>, (o: Option, ev?: Event) => void] {
  const isControlled = props.value !== undefined

  let value = () => props.value
  let setValue: Setter<T>
  if (!isControlled) {
    [value, setValue] = createSignal<T>(props.defaultValue)
  }

  const findOption = () => props.options.find(o => o.value === value())
  const [option, setOption] = createSignal(findOption())

  const onChange = (o: Option, ev: Event) => {
    if (!isControlled)
      setValue(o.value)
    callHandler(props.onChange, o.value, ev, o)
    if (isControlled)
      setOption(findOption())
    else
      setOption(o)
    close()
  }

  return [value, option, onChange]
}
