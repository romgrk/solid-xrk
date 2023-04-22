import { on, createEffect, createSignal, onCleanup } from 'solid-js'
import { Show, Portal } from 'solid-js/web'
import { createPopper } from '@popperjs/core'
import eventHandler from '../event-handler'
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
export type TriggerFunc = (o: PopoverAPI) => void;

export type Props = {
  trigger: TriggerFunc;
  class?: string;
  closeOnClick?: boolean;
  arrow?: boolean;
  placement?: Placement;
  children?: any;
  onOpen?: () => void,
  onClose?: () => void,
}

/**
 * Popover: a primitive to create popover elements such as tooltips or dropdown menus
 */
export default function Popover(props: Props) {
  let triggerNode: HTMLElement
  let arrowNode: HTMLDivElement

  const mount = createMountHooks()
  const popper = createPopperHooks()
  const [isOpen, setOpen] = createSignal(false)
  const placement = () => props.placement ?? 'bottom-start'
  const closeOnClick = () => props.closeOnClick ?? true
  const popperOptions = () => getPopperOptions(placement(), arrowNode, isOpen(), console.log)

  onCleanup(() => {
    mount.detach()
    popper.detach()
    if (closeOnClick())
      document.documentElement.removeEventListener('click', onDocumentClick)
  })

  const attach = () => {
    if (mount.node())
      return
    mount.attach()
    popper.attach(triggerNode, mount.node()!, popperOptions())
    if (closeOnClick())
      document.documentElement.addEventListener('click', onDocumentClick)
  }

  const ref = (node: HTMLElement) => triggerNode = node
  const open = () => {
    attach()
    setOpen(true)
    // popper.instance.setOptions(popperOptions())
    eventHandler(props.onOpen)
  }
  const close = () => {
    setOpen(false)
    eventHandler(props.onClose)
  }
  const toggle = () => isOpen() ? close() : open()

  const onDocumentClick = (ev: MouseEvent) => {
    if (!isOpen())
      return
    if (!(triggerNode.contains(ev.target as Node | null) ||
          mount.node()?.contains(ev.target as Node | null)))
      close()
  }

  const popoverClass = () => cxx('Popover', { open: isOpen() }, props.class)
  const arrowClass = () => `Popover__arrow Popover__arrow--${getInversePlacement(placement())}`

  const [triggerWidth, setTriggerWidth] = createSignal(100)
  createEffect(on(isOpen, () => {
    if (!triggerNode) {
      console.warn('[Popover]: trigger node not defined! Set it with `popoverAPI.ref(node)`')
      return
    }
    setTriggerWidth(triggerNode.getBoundingClientRect().width)
  }))

  return (
    <>
      {props.trigger({ ref, open, close, toggle, isOpen })}
      <Show when={mount.node()}>
        <Portal mount={mount.node()}>
          <div class={popoverClass()} style={{ '--trigger-width': `${triggerWidth()}px` }}>
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
  onUpdate: Function
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
      {
        /* Custom modifier */
        name: 'updateComponentState',
        enabled: true,
        phase: 'write' as const,
        fn: onUpdate as any,
      },
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

