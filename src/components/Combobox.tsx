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
import './Combobox.scss'

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
  onQuery?: (query: string, ev?: Event) => void,
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
  'onQuery',
] as (keyof Props)[]

function Combobox(allProps: Props) {
  const [props, rest] = splitProps(allProps, PROPS)
  const isControlled = props.value !== undefined

  let popover: PopoverAPI
  let popoverNode: HTMLDivElement
  let inputNode: HTMLElement

  const id = props.id || uniqueId()
  const menuId = uniqueId()
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

  const close = () => {
    popover.close()
    if (inputNode)
      (inputNode.children[0] as HTMLInputElement).value = ''
  }

  const onChange = (o: Option | undefined) => {
    setValue(o?.value ?? null, o)
    if (!isControlled)
      setOption(o)
    close()
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
  const triggerClass = () => cxx('Combobox', [props.size, props.variant], { disabled: disabled() }, props.class)
  const trigger = (p: PopoverAPI) => {
    popover = p

    const onBlur = (ev: FocusEvent) => {
      if (ev.relatedTarget === popoverNode || popoverNode.contains(ev.relatedTarget as any))
        return
      close()
    }

    const onFocus = () => {
      popover.open()
      props.onQuery?.('')
    }

    return (
      <Input
        ref={(n: HTMLInputElement) => (inputNode = n) && popover.ref(n)}
        class={triggerClass()}
        iconAfter='chevron-down'
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={props.onQuery}
        onKeyDown={onKeyDown}
        placeholder={triggerLabel()}
        {...rest}
        role='combobox'
        aria-expanded={isOpen()}
        aria-controls={menuId}
        aria-autocomplete='list'
        aria-active-option={value() ? `${id}--${value}` : ''}
        aria-activedescendant={/* FIXME: selection id */ undefined}
      />
    )
  }

  const popoverClass = () =>
    cxx('Combobox__popover', props.class)
  const itemClass = (o: Option, i: number) =>
    cxx('Combobox__item', { active: value() === o.value, selected: selected() === i })

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
      >
        <For each={props.options}
          children={(o, index) =>
            <button
              id={`${id}--${o.value}`}
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
          <div class='Combobox__empty'>
            {props.emptyMessage ?? 'No options'}
          </div>
        </Show>
      </Box>
    </Popover>
  )
}
export default Combobox

async function queryUsers(q: string): Promise<Option[]> {
  const result = await fetch('https://jsonplaceholder.typicode.com/users')
  const users  = await result.json()
  return users
    .filter((u: any) => u.name.toLowerCase().includes(q.toLowerCase()))
    .map((u: any) => ({ value: u.id, label: u.name }))
}

export function ComboboxDemo() {
  const [options, setOptions] = createSignal<Option[]>([])

  const onQuery = (q: string) => {
    queryUsers(q).then(setOptions)
  }

  return (
    <Combobox
      value={null}
      onChange={(value, option) => {
        console.log([value, option])
      }}
      options={options()}
      onQuery={onQuery}
    />
  )
}
