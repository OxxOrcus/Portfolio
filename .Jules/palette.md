## Palette's Journal

## 2024-05-15 - Add aria-labels to form inputs without visual labels

**Learning:** In simple horizontal forms like newsletter signups and chat boxes, visual labels are often omitted for design reasons. However, relying solely on placeholders degrades accessibility.
**Action:** Always add `aria-label` attributes to inputs that lack a visible `<label>` element to ensure screen readers provide context.

## 2025-02-17 - Add loading state to async forms

**Learning:** During async operations like fetching API endpoints, forms with generic `type="submit"` buttons will not give any default browser feedback to users that their request is being processed. In an environment like this portfolio relying heavily on client-side JS and serverless functions without full page reloads, this lack of feedback can lead to multiple clicks and confusion.
**Action:** When intercepting forms via `e.preventDefault()`, always immediately disable the submit button and provide clear visual feedback (e.g. text change + spinner icon) before executing the async fetch. Ensure the button's visual and enabled state is restored within the `catch` or `finally` block to allow retry in case of error.

## 2025-02-18 - Keep success UI states strictly in try blocks

**Learning:** In async JS form submissions, placing success state updates (like confetti or "success" messages) after the try/catch block will cause them to execute unconditionally, even if the API request fails and an error is logged. This provides a misleading success signal to the user when their data wasn't actually saved.
**Action:** Always place success UI feedback strictly within the `try` block, immediately after verifying `response.ok`, and ensure error feedback is clearly provided in the `catch` block.

## 2025-05-18 - Improve newsletter modal readability
 **Learning:** Sometimes modals with high transparency on both the overlay and the content layer can hinder text legibility, specially against a complex background.
 **Action:** Removed `bg-opacity` on the modal content to make it opaque and increased the opacity and blur of the backdrop to distinguish the modal from the background content.

## 2025-05-19 - Ensure screen readers announce dynamic feedback
**Learning:** Client-side form submissions (like newsletter signups) and dynamic content updates (like AI chat messages) that modify DOM text without a full page reload will be visually apparent to sighted users but completely missed by screen reader users, leading to confusion about whether an action succeeded or failed.
**Action:** Always add `aria-live="polite"` (or `"assertive"` if critical) to the container elements (e.g., success message paragraphs or chat message containers) that will dynamically receive text updates to ensure assistive technologies announce the changes.

## 2025-05-20 - Set user expectations for mailto forms
**Learning:** Client-side forms that trigger `mailto:` links often appear to do nothing when the submit button is clicked, especially if the user's default mail client takes a few seconds to load or if it fails entirely. This lack of feedback causes confusion and multiple clicks.
**Action:** Always provide clear visual feedback (e.g., changing the button text to 'Opening Mail Client...' and disabling it) immediately upon submission of a `mailto:` form to properly set expectations, and restore the button state after a short delay so the user can try again if needed.
## 2024-05-23 - Avoid redundant inline scripts for dynamic UI state
**Learning:** Hardcoded, stripped-down inline scripts intended to recreate simple UI functionality (like the mobile menu in `digital-service.html`) often silently fall out of sync with the global JS (like `js/script.js`), resulting in missing ARIA states and inconsistent behaviors across pages.
**Action:** Always verify if a site-wide script can be refactored to handle a shared component across multiple routes, instead of re-implementing isolated and brittle inline logic. Injected components should exist in raw HTML whenever possible to improve initial load accessibility and CLS.

## 2025-05-25 - Add focus visible styles for keyboard navigation
**Learning:** Because Tailwind CSS resets default browser focus outlines, interactive elements (like navigation links and buttons) lack visible focus states. This makes keyboard navigation almost impossible for accessibility users, as they cannot see which element is currently focused.
**Action:** Always add explicit focus styles (e.g., `focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded-sm`) to all interactive elements (`<a>`, `<button>`, `.btn-primary`, `.btn-secondary`) to maintain keyboard navigation accessibility and provide a clear visual indicator.
