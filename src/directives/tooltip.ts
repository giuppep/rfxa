import type { Directive, DirectiveBinding } from "vue"

type TooltipPosition = "top" | "right" | "bottom" | "left"
type PointerKind = PointerEvent["pointerType"] | "keyboard" | undefined

type TooltipValue =
    | string
    | {
          content?: string
          position?: TooltipPosition
      }

type TooltipState = {
    arrow: HTMLSpanElement
    cleanups: (() => void)[]
    content: string
    describedBy: string | null
    id: string
    lastPointerType: PointerKind
    position: TooltipPosition
    restoreTabindex: () => void
    text: Text
    tooltip: HTMLSpanElement
    visible: boolean
}

const ARROW_BASE_CLASSES = [
    "absolute",
    "h-2",
    "w-2",
    "rotate-45",
    "bg-gray-900",
]
const GAP = 10
const MARGIN = 8
const TOOLTIP_CLASSES =
    "invisible fixed z-50 w-max max-w-48 rounded-lg bg-gray-900 px-2 py-2 text-xs font-normal text-white shadow-sm"

const arrowPositionClasses: Record<TooltipPosition, string[]> = {
    top: ["top-full", "-translate-x-1/2", "-mt-1"],
    right: ["right-full", "-translate-y-1/2", "-mr-1"],
    bottom: ["bottom-full", "-translate-x-1/2", "-mb-1"],
    left: ["left-full", "-translate-y-1/2", "-ml-1"],
}

const tooltipStates = new WeakMap<HTMLElement, TooltipState>()

const focusableSelector = [
    "a[href]",
    "button",
    "input",
    "select",
    "textarea",
    "[tabindex]",
].join(",")

const isTooltipPosition = (
    value: string | undefined
): value is TooltipPosition =>
    value === "top" ||
    value === "right" ||
    value === "bottom" ||
    value === "left"

const getTooltipOptions = (binding: DirectiveBinding<TooltipValue>) => {
    const position = isTooltipPosition(binding.arg) ? binding.arg : "top"

    if (typeof binding.value === "string") {
        return { content: binding.value, position }
    }

    return {
        content: binding.value?.content ?? "",
        position: binding.value?.position ?? position,
    }
}

const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max)

function listen<K extends keyof HTMLElementEventMap>(
    target: HTMLElement,
    type: K,
    listener: (event: HTMLElementEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions
): () => void
function listen<K extends keyof DocumentEventMap>(
    target: Document,
    type: K,
    listener: (event: DocumentEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions
): () => void
function listen<K extends keyof WindowEventMap>(
    target: Window,
    type: K,
    listener: (event: WindowEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions
): () => void
function listen(
    target: EventTarget,
    type: string,
    listener: EventListener,
    options?: boolean | AddEventListenerOptions
): () => void {
    target.addEventListener(type, listener, options)
    return () => target.removeEventListener(type, listener, options)
}

const getElementCenter = (rect: DOMRect) => ({
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
})

const setArrowPosition = (state: TooltipState) => {
    state.arrow.removeAttribute("style")
    state.arrow.className = [
        ...ARROW_BASE_CLASSES,
        ...arrowPositionClasses[state.position],
    ].join(" ")
}

const positionArrow = (
    hostRect: DOMRect,
    tooltipRect: DOMRect,
    state: TooltipState
) => {
    const hostCenter = getElementCenter(hostRect)

    if (state.position === "top" || state.position === "bottom") {
        state.arrow.style.left = `${hostCenter.x - tooltipRect.left}px`
        state.arrow.style.top = ""
    } else {
        state.arrow.style.left = ""
        state.arrow.style.top = `${hostCenter.y - tooltipRect.top}px`
    }
}

const positionTooltip = (element: HTMLElement, state: TooltipState) => {
    const hostRect = element.getBoundingClientRect()
    const tooltipRect = state.tooltip.getBoundingClientRect()
    const hostCenter = getElementCenter(hostRect)

    let left = hostCenter.x - tooltipRect.width / 2
    let top = hostRect.top - tooltipRect.height - GAP

    if (state.position === "right") {
        left = hostRect.right + GAP
        top = hostCenter.y - tooltipRect.height / 2
    } else if (state.position === "bottom") {
        top = hostRect.bottom + GAP
    } else if (state.position === "left") {
        left = hostRect.left - tooltipRect.width - GAP
        top = hostCenter.y - tooltipRect.height / 2
    }

    left = clamp(left, MARGIN, window.innerWidth - tooltipRect.width - MARGIN)
    top = clamp(top, MARGIN, window.innerHeight - tooltipRect.height - MARGIN)

    state.tooltip.style.left = `${left}px`
    state.tooltip.style.top = `${top}px`

    positionArrow(hostRect, state.tooltip.getBoundingClientRect(), state)
}

const setTooltipVisibility = (state: TooltipState, visible: boolean) => {
    state.visible = visible
    state.tooltip.classList.toggle("visible", visible)
    state.tooltip.classList.toggle("invisible", !visible)
}

const showTooltip = (element: HTMLElement, state: TooltipState) => {
    if (!state.content) return

    setTooltipVisibility(state, true)
    element.setAttribute("aria-describedby", state.id)
    requestAnimationFrame(() => positionTooltip(element, state))
}

const hideTooltip = (element: HTMLElement, state: TooltipState) => {
    setTooltipVisibility(state, false)

    if (state.describedBy) {
        element.setAttribute("aria-describedby", state.describedBy)
    } else {
        element.removeAttribute("aria-describedby")
    }
}

const createTooltipElement = (content: string) => {
    const tooltip = document.createElement("span")
    const arrow = document.createElement("span")
    const text = document.createTextNode(content)

    tooltip.id = `tooltip-${Math.random().toString(36).slice(2)}`
    tooltip.role = "tooltip"
    tooltip.className = TOOLTIP_CLASSES
    tooltip.append(text, arrow)
    document.body.append(tooltip)

    return { arrow, text, tooltip }
}

const getTabindexRestore = (element: HTMLElement) => {
    const tabindex = element.getAttribute("tabindex")

    if (!element.matches(focusableSelector)) {
        element.setAttribute("tabindex", "0")
    }

    return () => {
        if (tabindex === null) {
            element.removeAttribute("tabindex")
        } else {
            element.setAttribute("tabindex", tabindex)
        }
    }
}

const bindTooltipEvents = (element: HTMLElement, state: TooltipState) => {
    const hide = () => hideTooltip(element, state)
    const show = () => showTooltip(element, state)
    const toggle = () => (state.visible ? hide() : show())
    const reposition = () => {
        if (state.visible) positionTooltip(element, state)
    }

    state.cleanups.push(
        listen(element, "blur", hide),
        listen(element, "click", () => {
            if (state.lastPointerType === "mouse") {
                show()
            } else {
                toggle()
            }
        }),
        listen(element, "focus", () => {
            if (state.lastPointerType !== "touch") show()
        }),
        listen(element, "keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                state.lastPointerType = "keyboard"
            }
        }),
        listen(element, "pointerdown", (event) => {
            state.lastPointerType = event.pointerType
        }),
        listen(element, "pointerenter", show),
        listen(element, "pointerleave", () => {
            if (state.lastPointerType !== "touch") hide()
        }),
        listen(document, "keydown", (event) => {
            if (event.key === "Escape") hide()
        }),
        listen(document, "pointerdown", (event) => {
            const target = event.target as Node
            if (!element.contains(target) && !state.tooltip.contains(target)) {
                hide()
            }
        }),
        listen(window, "resize", reposition),
        listen(window, "scroll", reposition, true)
    )
}

const createTooltipState = (
    element: HTMLElement,
    binding: DirectiveBinding<TooltipValue>
) => {
    const { content, position } = getTooltipOptions(binding)
    const { arrow, text, tooltip } = createTooltipElement(content)

    const state: TooltipState = {
        arrow,
        cleanups: [],
        content,
        describedBy: element.getAttribute("aria-describedby"),
        id: tooltip.id,
        lastPointerType: undefined,
        position,
        restoreTabindex: getTabindexRestore(element),
        text,
        tooltip,
        visible: false,
    }

    setArrowPosition(state)
    tooltipStates.set(element, state)
    bindTooltipEvents(element, state)
}

const updateTooltipState = (
    element: HTMLElement,
    binding: DirectiveBinding<TooltipValue>
) => {
    const state = tooltipStates.get(element)
    if (!state) return

    const { content, position } = getTooltipOptions(binding)
    state.content = content
    state.position = position
    state.text.data = content
    setArrowPosition(state)

    if (state.visible && content) {
        positionTooltip(element, state)
    } else {
        hideTooltip(element, state)
    }
}

const destroyTooltipState = (element: HTMLElement) => {
    const state = tooltipStates.get(element)
    if (!state) return

    hideTooltip(element, state)
    state.cleanups.forEach((cleanup) => cleanup())
    state.tooltip.remove()
    state.restoreTabindex()

    tooltipStates.delete(element)
}

export const tooltip: Directive<HTMLElement, TooltipValue> = {
    mounted: createTooltipState,
    updated: updateTooltipState,
    beforeUnmount: destroyTooltipState,
}
