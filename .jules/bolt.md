## 2025-05-24 - DocumentFragment for DOM Animations
**Learning:** The codebase features custom particle animations (e.g. explosion, confetti). Previously, these animations created performance bottlenecks because they appended elements (like spans or divs) directly into the DOM inside a `for` loop, causing numerous layout thrashing/reflows.
**Action:** When implementing new DOM-based animations or reviewing existing ones (like `triggerStarConfetti` and `triggerConfetti`), always batch DOM node insertions using `document.createDocumentFragment()`. Append all generated particles to the fragment first, and then append the fragment to the DOM in a single operation.

## 2025-05-24 - High-Frequency Event Throttling (mousemove)
**Learning:** Found an anti-pattern in the codebase where DOM style recalculations and layout queries (`getBoundingClientRect()`) were executing on every `mousemove` event in real-time. This caused excessive reflows and layout thrashing, leading to choppy scrolling and interaction performance due to the main thread being constantly blocked.
**Action:** Always wrap style/attribute updates driven by high-frequency events (like `mousemove` or `scroll`) in `requestAnimationFrame()`. This ensures DOM updates execute exactly once per animation frame, decoupling the event frequency from the render cycle.
