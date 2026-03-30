## 2024-05-14 - A11y Label in Name Compliance
**Learning:** When adding `aria-label` to existing links with text like "Repo", the accessible name should ideally contain the exact visible text to strictly adhere to WCAG 2.5.3 (Label in Name). For example, using "GitHub Repo for [Project]" instead of "GitHub Repository for [Project]".
**Action:** Always ensure the `aria-label` starts with or includes the exact visible text of the element it describes.
