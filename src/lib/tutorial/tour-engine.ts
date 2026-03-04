import { driver, type DriveStep, type Driver } from "driver.js"
import "driver.js/dist/driver.css"
import type { TourDefinition, TourStop } from "./types"
import { validateStopValue } from "./validation"

export type NavigateToStepFn = (
  mode: "connector" | "solution",
  stepId: string,
) => void

interface TourEngineCallbacks {
  navigateToStep: NavigateToStepFn
  onDestroy: () => void
}

/** Create checkmark SVG template once, clone for each popover */
const checkmarkTemplate = (() => {
  if (typeof document === "undefined") return null
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
  svg.classList.add("tutorial-checkmark")
  svg.setAttribute("viewBox", "0 0 24 24")
  svg.setAttribute("width", "24")
  svg.setAttribute("height", "24")
  svg.setAttribute("fill", "none")
  svg.setAttribute("stroke", "currentColor")
  svg.setAttribute("stroke-width", "3")
  svg.setAttribute("stroke-linecap", "round")
  svg.setAttribute("stroke-linejoin", "round")

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
  path.classList.add("tutorial-checkmark-path")
  path.setAttribute("d", "M4 12l5 5L20 7")
  svg.appendChild(path)

  return svg
})()

/** Fire clickSelector if present on the given stop */
function fireClickSelector(stop: TourStop) {
  if (!stop.clickSelector) return
  const btn = document.querySelector(stop.clickSelector) as HTMLElement | null
  btn?.click()
}

export function createTourEngine(
  tour: TourDefinition,
  callbacks: TourEngineCallbacks,
): Driver {
  const { navigateToStep, onDestroy } = callbacks

  // Separate timeout tracking: one for field listener, one for navigation polling
  let activeCleanup: (() => void) | null = null
  let fieldTimeout: ReturnType<typeof setTimeout> | null = null
  let pollTimeout: ReturnType<typeof setTimeout> | null = null

  function clearFieldTimeout() {
    if (fieldTimeout !== null) {
      clearTimeout(fieldTimeout)
      fieldTimeout = null
    }
  }

  function clearPollTimeout() {
    if (pollTimeout !== null) {
      clearTimeout(pollTimeout)
      pollTimeout = null
    }
  }

  function cleanupAll() {
    clearFieldTimeout()
    clearPollTimeout()
    if (activeCleanup) {
      activeCleanup()
      activeCleanup = null
    }
  }

  function attachFieldListener(stop: TourStop) {
    clearFieldTimeout()
    if (activeCleanup) {
      activeCleanup()
      activeCleanup = null
    }

    if (stop.expectedValue === null) return

    const el = document.querySelector(stop.elementSelector) as HTMLInputElement | HTMLTextAreaElement | null
    if (!el) return

    // Cache DOM refs once instead of querying on every keystroke
    const footer = document.querySelector(".tutorial-custom-footer")
    if (!footer) return
    const badge = footer.querySelector(".tutorial-validation-badge") as HTMLElement | null
    const nextBtn = footer.querySelector(".driver-popover-next-btn") as HTMLElement | null

    const updateValidation = () => {
      const valid = validateStopValue(stop, el.value)
      if (badge) badge.style.display = valid ? "flex" : "none"
      if (nextBtn) nextBtn.style.display = valid ? "inline-flex" : "none"
    }

    el.focus()
    updateValidation()

    el.addEventListener("input", updateValidation)
    activeCleanup = () => {
      el.removeEventListener("input", updateValidation)
    }
  }

  /** Check if an element is rendered and has visible dimensions */
  function isElementReady(selector: string): boolean {
    const el = document.querySelector(selector)
    if (!el) return false
    const rect = el.getBoundingClientRect()
    return rect.width > 0 && rect.height > 0
  }

  /** Navigate to the wizard step for a stop, wait for the element to be visible, then move driver.js */
  function navigateAndMoveTo(stopIndex: number) {
    const nextStop = tour.stops[stopIndex]
    if (!nextStop) return

    // Cancel any previous polling loop
    clearPollTimeout()

    // Navigate the wizard to the correct tab/step first
    navigateToStep(nextStop.mode, nextStop.stepId)

    // Poll until the target element is rendered with visible dimensions
    let attempts = 0
    const maxAttempts = 50 // ~2.5s at 50ms intervals

    function tryMove() {
      attempts++
      if (isElementReady(nextStop.elementSelector)) {
        fireClickSelector(nextStop)

        // Scroll element into view before driver.js calculates overlay cutout
        const el = document.querySelector(nextStop.elementSelector)
        el?.scrollIntoView({ block: "center", behavior: "instant" })

        // Let click + scroll settle, then move driver.js to the step
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            driverInstance.moveTo(stopIndex)
            // Refresh after scroll/animation settles
            pollTimeout = setTimeout(() => {
              pollTimeout = null
              driverInstance.refresh()
            }, 400)
          })
        })
        return
      }
      if (attempts < maxAttempts) {
        pollTimeout = setTimeout(tryMove, 50)
      }
    }

    // Start after one frame to let React begin rendering
    requestAnimationFrame(tryMove)
  }

  const steps: DriveStep[] = tour.stops.map((stop, stopIndex) => ({
    element: stop.elementSelector,
    popover: {
      title: stop.title,
      description: stop.description,
      side: stop.side ?? "bottom",
      showButtons: ["close"],
      onPopoverRender: (popover) => {
        const wrapper = popover.wrapper
        if (!wrapper) return

        const customFooter = document.createElement("div")
        customFooter.className = "tutorial-custom-footer"

        // Validation badge (hidden by default)
        const badge = document.createElement("span")
        badge.className = "tutorial-validation-badge"
        if (checkmarkTemplate) {
          badge.appendChild(checkmarkTemplate.cloneNode(true))
        }
        const label = document.createElement("span")
        label.textContent = "Correct!"
        badge.appendChild(label)
        badge.style.display = "none"
        customFooter.appendChild(badge)

        // Next button (hidden if validation needed)
        const nextBtn = document.createElement("button")
        nextBtn.className = "driver-popover-next-btn"
        nextBtn.textContent = stopIndex === tour.stops.length - 1 ? "Finish" : "Next"
        nextBtn.style.display = stop.expectedValue === null ? "inline-flex" : "none"
        nextBtn.addEventListener("click", () => {
          cleanupAll()
          if (stopIndex < tour.stops.length - 1) {
            navigateAndMoveTo(stopIndex + 1)
          } else {
            driverInstance.destroy()
          }
        })
        customFooter.appendChild(nextBtn)

        wrapper.appendChild(customFooter)

        // Attach field listener after a short delay so the DOM is ready
        fieldTimeout = setTimeout(() => {
          fieldTimeout = null
          attachFieldListener(stop)
        }, 500)
      },
    },
  }))

  const driverInstance = driver({
    steps,
    animate: true,
    overlayColor: "rgba(0, 0, 0, 0.6)",
    stagePadding: 8,
    stageRadius: 12,
    allowClose: true,
    allowKeyboardControl: false,
    disableActiveInteraction: false,
    overlayClickBehavior: () => {},
    popoverClass: "tutorial-popover",
    onHighlightStarted: (_element, _step, { state }) => {
      cleanupAll()

      const stepIndex = state.activeIndex
      if (stepIndex === undefined) return

      const stop = tour.stops[stepIndex]
      if (!stop) return

      // Navigation + click are handled by navigateAndMoveTo for Next-button transitions.
      // This hook fires for the initial drive() call where navigateAndMoveTo isn't used.
      navigateToStep(stop.mode, stop.stepId)
      fireClickSelector(stop)
    },
    onHighlighted: () => {
      // Recalculate overlay cutout after highlight animation completes,
      // critical for elements on newly-navigated wizard steps
      driverInstance.refresh()
    },
    onDestroyed: () => {
      cleanupAll()
      onDestroy()
    },
  })

  return driverInstance
}
