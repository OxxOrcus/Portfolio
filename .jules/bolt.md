## 2025-05-24 - DocumentFragment for DOM Animations

**Learning:** The codebase features custom particle animations (e.g. explosion, confetti). Previously, these animations created performance bottlenecks because they appended elements (like spans or divs) directly into the DOM inside a `for` loop, causing numerous layout thrashing/reflows.
**Action:** When implementing new DOM-based animations or reviewing existing ones (like `triggerStarConfetti` and `triggerConfetti`), always batch DOM node insertions using `document.createDocumentFragment()`. Append all generated particles to the fragment first, and then append the fragment to the DOM in a single operation.

## 2025-05-24 - High-Frequency Event Throttling (mousemove)

**Learning:** Found an anti-pattern in the codebase where DOM style recalculations and layout queries (`getBoundingClientRect()`) were executing on every `mousemove` event in real-time. This caused excessive reflows and layout thrashing, leading to choppy scrolling and interaction performance due to the main thread being constantly blocked.
**Action:** Always wrap style/attribute updates driven by high-frequency events (like `mousemove` or `scroll`) in `requestAnimationFrame()`. This ensures DOM updates execute exactly once per animation frame, decoupling the event frequency from the render cycle.

## 2025-05-24 - Unbounded MutationObserver on Document Body

**Learning:** Found an open-ended `MutationObserver` on `document.body` with `subtree: true` that continually ran `querySelector` and `getElementById` on every single DOM mutation. This is exceptionally costly, especially since this codebase contains an aggressive text typing animation that modifies text nodes every ~30ms, causing massive CPU usage spikes and potential battery drain.
**Action:** When observing the DOM for a lazily-injected third-party element (like the Buy Me a Coffee widget), always disconnect the `MutationObserver` (`observer.disconnect()`) once the target element is found and attached. Also provide a fallback timeout to disconnect the observer if the target element never loads (e.g. blocked by an adblocker).

## 2025-05-24 - Layout Thrashing Inside requestAnimationFrame

**Learning:** `requestAnimationFrame` alone does not prevent layout thrashing if DOM reads (e.g. `getBoundingClientRect()`) and DOM writes (e.g. `setAttribute()` or `style` updates) are interleaved inside the frame loop. When multiple elements query layout and then immediately write to the DOM within the same frame, the browser is forced to synchronously recalculate layout multiple times per frame. Caching `getBoundingClientRect()` outside the loop is also dangerous because viewport-relative coordinates become stale when the user scrolls or layout shifts.
**Action:** When animating multiple elements on high-frequency events inside `requestAnimationFrame`, strictly separate DOM reads and DOM writes into two separate loops within the frame. First, loop through all elements to read their layout dimensions and calculate target states. Then, in a second loop, apply all the DOM writes.

## 2025-05-24 - Layout Thrashing with Continuous `left`/`top` Updates

**Learning:** Found that the custom cursor ball effect in the codebase was continually updating `style.left` and `style.top` inside `requestAnimationFrame` on every `mousemove`. Changing `left` and `top` properties forces the browser's rendering engine to recalculate layout and repaint on the main thread, resulting in layout thrashing.
**Action:** For continuous, high-frequency position updates, always use `style.transform = "translate3d(...)"` instead of modifying `top` and `left`. The `transform` property can be handled by the compositor thread (hardware acceleration), avoiding main-thread layout and paint calculations entirely. Also, ensure the element's CSS includes `will-change: transform`.

## 2025-05-24 - HTML Parsing Thrashing in Typing Animations

**Learning:** Found a performance bottleneck in `js/animations.js` where a continuous typing animation was updating the DOM via `element.innerHTML = ...` on every keystroke (~every 30ms). This approach forced the browser to continually parse an HTML string and recalculate the DOM structure, causing significant main-thread overhead and CPU spikes during the animation.
**Action:** When building custom typing or text-updating animations, avoid `innerHTML`. Instead, create a dedicated `TextNode` and update its `.nodeValue` directly. For visual elements like a blinking cursor, create a separate DOM element and append it once, ensuring updates only affect the text content without causing full DOM re-parsing.

## 2025-05-24 - Unnecessary Off-Screen Canvas Rendering

**Learning:** Found a performance bottleneck in `js/constellation.js` where the background constellation canvas animation was continually rendering via `requestAnimationFrame` even when the user had scrolled past the `#hero` section. This kept the GPU and CPU unnecessarily active, draining battery and reducing page scroll performance. Additionally, the particle connection logic computed `Math.sqrt()` on every particle pair regardless of their distance, creating unnecessary mathematical overhead in an O(N²) loop.
**Action:** When creating continuous canvas animations, always use an `IntersectionObserver` on the animation's container element to pause the `requestAnimationFrame() loop when the canvas is no longer visible in the viewport. Also, optimize distance calculations by comparing the squared distance (`distSq`) against the squared max distance before applying expensive operations like `Math.sqrt()`.

## 2026-03-26 - Uncached Module-Level Initializations in Serverless APIs

**Learning:** Initializing service clients (like Resend) inside a Vercel/Lambda handler forces the client to be recreated on every request, which is inefficient. Client SDKs often perform expensive setup (parsing configs, establishing connection pools) that should be reused across "warm" invocations.
**Action:** Always move service client initialization (e.g., `new Resend(apiKey)`) outside the exported handler function to the module level. This allows the execution environment to cache the instance, significantly reducing per-request overhead and cold start impact.

## 2026-03-26 - Canvas Resize Thrashing and Lockups

**Learning:** Found a performance bottleneck where canvas dimensions were updated synchronously inside `window.addEventListener("resize", ...)` (for `matrixCanvas` and `hero-canvas`). Because `resize` events fire continuously during browser resize, directly updating `canvas.width` and `canvas.height` forces the browser to re-allocate GPU buffers and synchronously recalculate layout on every tick, causing severe layout thrashing, main thread lockups, and garbage collection thrashing.
**Action:** Always wrap canvas dimension assignments (`canvas.width`, `canvas.height`) inside a debounced timeout (e.g., 150ms). This delays the dimension recalculation until the user finishes resizing the window, vastly reducing the number of expensive buffer allocations. Also, note that dimension updates must not be skipped conditionally (e.g. `if (active)`) to ensure the canvas is sized correctly when made visible again.
