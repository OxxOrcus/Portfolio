## 2026-03-18 - [HIGH] Fix tabnabbing vulnerability in window.open
 **Vulnerability:** The script previously opened external links using `window.open(url, "_blank", "noopener")`. This is insecure because omitting `noreferrer` allows the opened page to potentially access the `window.opener` object and change its location.
 **Learning:** I learned that while `rel="noopener noreferrer"` is consistently applied in anchor tags in this codebase, the same protection was not applied to JavaScript-initiated `window.open` calls.
 **Prevention:** For `window.open` calls, always pass `"noopener,noreferrer"` as the third parameter to ensure that `window.opener` is set to null, providing the necessary defense in depth against tabnabbing.
## 2024-05-24 - [MEDIUM] Missing input type and length validation (DoS risk)
 **Vulnerability:** Serverless API endpoints (like `api/newsletter.js`) executed regular expressions directly on parsed JSON request bodies without validating the input type or length, creating a risk for ReDoS or memory exhaustion attacks.
 **Learning:** I learned that in this serverless architecture, input from `request.json()` can be of any type (e.g., objects, arrays) and arbitrary length. Relying solely on regex for validation is insufficient and dangerous.
 **Prevention:** Always enforce strict type checking (e.g., `typeof input === "string"`) and maximum length limits (e.g., `input.length > 254` for emails) on all user-supplied data *before* performing regular expression evaluations or further processing.
## 2025-05-18 - Prevent Tabnabbing Vulnerability
**Vulnerability:** Numerous external links across `index.html` and `digital-service.html` utilized `target="_blank"` without the corresponding `rel="noopener noreferrer"` attributes.
**Learning:** Omission of `rel="noopener noreferrer"` exposes users to reverse tabnabbing attacks, where the newly opened tab can manipulate the original tab's location object to redirect the user to a malicious site.
**Prevention:** Establish a project-wide convention to ensure all newly created anchor tags with `target="_blank"` include `rel="noopener noreferrer"`.
## 2026-03-26 - [MEDIUM] Missing input type and length validation on Name and Message (DoS risk)
 **Vulnerability:** Serverless API endpoint `api/contact.js` executed regular expressions directly on parsed JSON request bodies and lacked validation for the type and length of the `name` and `message` parameters.
 **Learning:** I learned that in this serverless architecture, all inputs from `request.body` need explicit validation. Leaving string parameters unchecked leaves the application vulnerable to memory exhaustion attacks (DoS) and potentially type-confusion errors.
 **Prevention:** Always enforce strict type checking (e.g., `typeof input === "string"`) and maximum length limits on all user-supplied data *before* performing regular expression evaluations or further processing.
