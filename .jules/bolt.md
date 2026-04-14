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

## 2026-03-29 - Optimize High-Frequency `mousemove` Listeners
**Learning:** High-frequency event listeners (like `mousemove` on `.project-card` and `.magnetic-btn`) that synchronously perform DOM reads (`getBoundingClientRect()`) and writes (`style.transform`) cause significant layout thrashing and main-thread CPU lockups.
**Action:** Always throttle continuous mousemove style updates with `requestAnimationFrame`. Cache the latest mouse coordinates outside the callback so the frame always uses the freshest data, and perform DOM reads (`getBoundingClientRect()`) and writes inside the callback to safely decouple layout calculations from the event frequency.

## 2026-05-18 - Interleaved Layout Thrashing in Global Scroll Handler
**Learning:** Found a major performance bottleneck where a single throttled `scroll` event handler was calling multiple distinct functions (`updateScrollProgress`, `updateHeaderOnScroll`, `updateActiveNav`, `updateBackToTop`) in sequence. Although wrapped in `requestAnimationFrame`, each function independently performed its own DOM reads (e.g. `window.scrollY`, `element.offsetTop`) and writes (e.g. `style.width`, `classList.add`). Interleaving reads and writes across multiple function calls inside the same frame caused forced synchronous layouts (layout thrashing), degrading scroll performance.
**Action:** When handling a global high-frequency event like scrolling that updates multiple independent components, consolidate the logic into a single update function. Explicitly separate all DOM reads for all components into a first loop/block, and then perform all DOM writes in a second block. This guarantees that layout is only calculated once per frame before any styles are mutated.

## 2026-06-12 - Secure Rate Limiting with `x-real-ip`
**Learning:** Found a potential DoS vulnerability where rate limiting logic in Vercel serverless endpoints relied on `req.headers["x-forwarded-for"]`. Malicious actors can trivially spoof this header by appending comma-separated IPs, completely bypassing rate limits.
**Action:** When identifying client IP addresses in Vercel serverless environments (e.g., for rate limiting in `api/`), strictly use `req.headers["x-real-ip"]`. Vercel overwrites `x-real-ip` at the edge, guaranteeing its authenticity and preventing IP spoofing attacks.

## 2026-05-24 - Layout Cache for Scroll Handlers to Prevent Forced Synchronous Layouts
**Learning:** Found that separating DOM reads and writes inside a high-frequency `requestAnimationFrame` loop (like a scroll handler) is not always enough to prevent layout thrashing. If another continuous background animation (e.g., a typing effect updating text nodes) modifies the DOM in a separate process, any synchronous DOM layout query (like reading `element.offsetTop`, `document.documentElement.scrollHeight`, or `window.innerHeight`) within the scroll loop will trigger an expensive forced synchronous layout calculation.
**Action:** For dimensions that only change when the window resizes or when the document body grows (like scrollable height or section offsets), never query them synchronously inside a high-frequency event loop. Instead, store them in a passive `layoutCache` object, and update that cache asynchronously using `window.addEventListener('resize')` and `new ResizeObserver().observe(document.body)`. Use the cached values in the high-frequency loop to completely eliminate synchronous layout queries.

## 2026-05-24 - Transform-Induced Layout Thrashing in Mousemove Animations
**Learning:** Found a performance bottleneck where `.magnetic-btn` and `.project-card` elements executed `getBoundingClientRect()` inside a `requestAnimationFrame` loop on `mousemove`. Because `mousemove` continually applied a `transform` (tilt/translate) to the element, dynamically querying its bounding rect created a recursive feedback loop (jitter). Additionally, the browser was forced to perform a synchronous layout recalculation on every animation frame.
**Action:** When creating high-frequency `mousemove` interaction effects that apply CSS transforms to an element, never call `getBoundingClientRect()` within the event loop. Instead, cache the element's untransformed bounding box in page-space (using `e.pageX/pageY` and `window.scrollX/Y`) inside a `mouseenter` event listener, and use the cached coordinates for all subsequent calculations within the `mousemove` frame.

## 2026-04-02 - Optimize High-Frequency Scroll Loop with Local Variable Caching
**Learning:** Nested property lookups (like `layoutCache.sectionOffsets[i]`) in high-frequency loops (e.g. scroll handlers) introduce unnecessary JavaScript engine overhead per cycle. While modern JIT engines optimize this, manual caching into local variables ensures consistent performance across different browsers and reduces the work required by the engine in every animation frame.
**Action:** When iterating through arrays in a high-frequency event loop (like `scroll` or `mousemove`), always cache the array reference and the specific array element into local variables. This minimizes the number of property lookups and ensures the loop body is as lean as possible.

## 2026-06-14 - Redundant DOM Writes in Animation Frames
**Learning:** Found that unconditionally applying style/class updates in high-frequency event loops (like `processScrollUpdates` inside `requestAnimationFrame`) causes unnecessary style recalculations and layout overhead, even if DOM reads are separated from DOM writes. If the new value is identical to the current DOM state, the browser still performs work when the assignment occurs.
**Action:** Always maintain a `domWriteCache` object for properties updated in a high-frequency loop. Before applying any DOM write (like `element.style.width = '...'` or `element.classList.add(...)`), compare the new computed state against the cached state. Only execute the DOM mutation if the state has genuinely changed.

## 2026-06-16 - Eliminate Layout Thrashing in Mousemove DOM Reads
**Learning:** Querying `getBoundingClientRect()` inside `requestAnimationFrame` on a high-frequency `mousemove` loop (like the pupil tracking effect) causes synchronous layout recalculations and layout thrashing, even if separated from DOM writes.
**Action:** Always cache the results of `getBoundingClientRect()` outside the high-frequency loop (e.g. in an initialization function) and update the cache passively in response to `resize` or layout transition events (`transitionend`). This fully removes synchronous DOM reads from the animation frame loop.

## 2026-06-25 - Prevent GC Thrashing with globalAlpha
**Learning:** Found a performance bottleneck in `js/constellation.js` where dynamic template strings like ``rgba(138, 43, 226, ${opacity})`` were being created inside an O(N²) particle connection loop during `requestAnimationFrame`. These continuous string allocations caused severe garbage collection thrashing and frame drops.
**Action:** When adjusting opacity dynamically inside high-frequency Canvas rendering loops, strictly avoid dynamic string allocations (like `rgba()`). Instead, cache the static color string (e.g., `ctx.strokeStyle = "rgb(138, 43, 226)"`) once outside the loop and adjust the drawing opacity inside the loop using `ctx.globalAlpha = opacity`. Always reset `ctx.globalAlpha = 1.0` when returning to opaque rendering.


## 2026-06-25 - Redundant requestAnimationFrame Loops
**Learning:** Found a performance bottleneck where `animateCounters` spawned a separate `requestAnimationFrame` loop for every single counter on the page (e.g., 4 counters = 4 independent rAF loops). Running multiple identical animation loops per frame increases the number of callback executions on the main thread and can lead to micro-stutters.
**Action:** When animating multiple similar elements simultaneously (like stat counters), consolidate the update logic into a single `requestAnimationFrame` loop. Cache the element references and their initial static properties (like target numbers) in an array beforehand, and use one loop inside the `step` function to apply the computed progress to all elements at once.

## 2026-04-13 - Pre-compiling Regex in API Routes
 **Learning:** Moving regex definitions from inside a function handler to the module level avoids recompilation on every request. While modern engines like V8 have internal caches for regex literals, explicit pre-compilation at the module level provides a more reliable performance gain (measured ~5-11% improvement in micro-benchmarks) and is a best practice for performance-critical paths.
 **Action:** Lifted the email validation regex in `api/newsletter.js` to a top-level constant `EMAIL_REGEX`.
