import { on, createEffect, createSignal } from 'solid-js'
import { Show, Portal } from 'solid-js/web'
import { createPopper } from '@popperjs/core'
import { createDisposer } from '../helpers/Disposer'
import createControlledValue from '../helpers/createControlledValue'
import cxx from '../cxx'
import './Popover.scss'

type Placement = 
  'top' |
  'top-start' |
  'top-end' |
  'bottom' |
  'bottom-start' |
  'bottom-end' |
  'right' |
  'right-start' |
  'right-end' |
  'left' |
  'left-start' |
  'left-end'

export type PopoverAPI = {
  ref: (node: HTMLElement) => void,
  open: () => void,
  close: () => void,
  toggle: () => void,
  isOpen: () => boolean,
}
export type TriggerFunc = (o: PopoverAPI) => void

export type Props = {
  trigger: TriggerFunc,
  class?: string,
  arrow?: boolean,
  placement?: Placement,
  children?: any,

  closeOnEsc?: boolean,
  closeOnBlur?: boolean,
  focusOnOpen?: boolean | string,

  open?: boolean,
  defaultOpen?: boolean,
  onChange?: (open: boolean) => void,
}

/**
 * Popover: a primitive to create popover elements such as tooltips or dropdown menus
 */
export default function Popover(props: Props) {
  let triggerNode: HTMLElement
  let arrowNode: HTMLDivElement
  let containerNode: HTMLDivElement
  let savedFocus: HTMLElement | undefined

  const mount = createMountHooks()
  const popper = createPopperHooks()
  const disposer = createDisposer()

  const [isOpen, setOpen] = createControlledValue({
    get value() { return props.open },
    defaultValue: props.defaultOpen,
    onChange: props.onChange,
  }, false)

  const placement = () => props.placement ?? 'bottom-start'

  const attach = () => {
    if (mount.node())
      return

    mount.attach()
    disposer.push(mount.detach)

    popper.attach(
      triggerNode,
      mount.node()!,
      getPopperOptions(placement(), arrowNode, isOpen())
    )
    disposer.push(popper.detach)

    if (props.closeOnBlur ?? true) {
      const onDocumentClick = (ev: MouseEvent) => {
        if (!isOpen())
          return
        if (!(triggerNode.contains(ev.target as Node | null) ||
              mount.node()?.contains(ev.target as Node | null)))
          close()
      }

      document.documentElement.addEventListener('click', onDocumentClick)
      disposer.push(() =>
        document.documentElement.removeEventListener('click', onDocumentClick)
      )
    }
  }

  const ref = (node: HTMLElement) => triggerNode = node
  const open = () => {
    if (props.focusOnOpen) {
      savedFocus = document.activeElement as HTMLElement
      setTimeout(() => {
        const element = (
          props.focusOnOpen === true ?
            containerNode :
            containerNode.querySelector(props.focusOnOpen as string) ?? containerNode
        ) as HTMLElement
        element.focus?.()
      })
    }
    attach()
    setOpen(true)
  }
  const close = () => {
    if (savedFocus) {
      savedFocus.focus()
      savedFocus = undefined
    }
    setOpen(false)
  }
  const toggle = () => isOpen() ? close() : open()

  const [triggerWidth, setTriggerWidth] = createSignal(100)
  createEffect(on(isOpen, () => {
    setTriggerWidth(triggerNode.getBoundingClientRect().width)
  }))

  const onKeyDown = (ev: KeyboardEvent) => {
    switch (ev.key) {
      case 'Escape': {
        if (props.closeOnEsc ?? true) {
          close()
          break
        }
        return
      }
      default: return
    }
    ev.preventDefault()
    ev.stopPropagation()
  }

  const popoverClass = () => cxx('Popover', { open: isOpen() }, props.class)
  const arrowClass = () => `Popover__arrow Popover__arrow--${getInversePlacement(placement())}`

  return (
    <>
      {props.trigger({ ref, open, close, toggle, isOpen })}
      <Show when={mount.node()}>
        <Portal mount={mount.node()}>
          <div
            ref={containerNode!}
            class={popoverClass()}
            tabIndex='-1'
            style={{ '--trigger-width': `${triggerWidth()}px` }}
            onKeyDown={onKeyDown}
          >
            { props.arrow &&
              <div class={arrowClass()} ref={arrowNode!} />
            }
            <div class='Popover__content'>
              {props.children}
            </div>
          </div>
        </Portal>
      </Show>
    </>
  )
}

function getPopperOptions(
  placement: Placement,
  arrowNode: HTMLElement,
  isOpen: boolean,
) {
  const hasArrow = Boolean(arrowNode)
  return {
    placement: placement,
    modifiers: [
      {
        name: 'arrow',
        enabled: hasArrow,
        options: {
          element: arrowNode,
          padding: 15,
        },
      },
      {
        /* Offset from the trigger */
        name: 'offset',
        options: {
          offset: [0, hasArrow ? 10 : 0],
        },
      },
      {
        /* Avoids touching the edge of the window */
        name: 'preventOverflow',
        options: {
          altAxis: true,
          padding: 10,
        },
      },
      {
        /* Custom modifier */
        name: 'eventListeners',
        enabled: isOpen,
      },
      // {
      //   /* Custom modifier */
      //   name: 'updateComponentState',
      //   enabled: true,
      //   phase: 'write' as const,
      //   fn: onUpdate as any,
      // },
    ],
  }
}

function createMountHooks() {
  const [mountNode, setMountNode] = createSignal<HTMLElement | undefined>(undefined)

  const mount = {
    node: mountNode,
    attach: () => {
      if (mountNode()) return
      const node = document.createElement('div')
      node.className = 'Popover__mountNode'
      document.body.append(node)
      setMountNode(node)
    },
    detach: () => {
      const node = mountNode()
      if (node)
        document.body.removeChild(node)
    },
  }

  return mount
}

function createPopperHooks() {
  const popper = {
    instance: null as ReturnType<typeof createPopper> | null,
    attach: (triggerNode: Element, popoverNode: HTMLElement, options: Parameters<typeof createPopper>[2]) => {
      popper.instance = createPopper(
        triggerNode,
        popoverNode,
        options,
      )
    },
    detach: () => {
      if (popper.instance) {
        popper.instance.destroy()
        popper.instance = null
      }
    },
  }

  return popper
}

function getInversePlacement(p: Placement) {
  if (p.startsWith('top')) return 'bottom'
  if (p.startsWith('bottom')) return 'top'
  if (p.startsWith('left')) return 'right'
  if (p.startsWith('right')) return 'left'
  return 'top'
}

