## Palette's Journal

## 2024-05-15 - Add aria-labels to form inputs without visual labels

**Learning:** In simple horizontal forms like newsletter signups and chat boxes, visual labels are often omitted for design reasons. However, relying solely on placeholders degrades accessibility.
**Action:** Always add `aria-label` attributes to inputs that lack a visible `<label>` element to ensure screen readers provide context.

## 2025-02-17 - Add loading state to async forms

**Learning:** During async operations like fetching API endpoints, forms with generic `type="submit"` buttons will not give any default browser feedback to users that their request is being processed. In an environment like this portfolio relying heavily on client-side JS and serverless functions without full page reloads, this lack of feedback can lead to multiple clicks and confusion.
**Action:** When intercepting forms via `e.preventDefault()`, always immediately disable the submit button and provide clear visual feedback (e.g. text change + spinner icon) before executing the async fetch. Ensure the button's visual and enabled state is restored within the `catch` or `finally` block to allow retry in case of error.
