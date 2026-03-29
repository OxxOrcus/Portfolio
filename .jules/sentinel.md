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
## 2026-03-29 - [HIGH] Missing rate limiting on sensitive endpoints
 **Vulnerability:** Unauthenticated serverless API endpoints (`api/contact.js` and `api/chat.js`) lacked rate limiting. Without rate limiting, these endpoints were susceptible to denial-of-service (DoS) attacks and abuse, which could quickly exhaust third-party service quotas (Resend and Gemini API limits) and increase billing costs.
 **Learning:** In serverless environments, it is easy to forget rate limiting because the infrastructure scales automatically. However, scaling automatically against malicious traffic can be very expensive and quickly exceed external API quotas.
 **Prevention:** Implement rate-limiting logic on all sensitive endpoints. For simple applications, a basic in-memory map scoped to the function's execution lifecycle (with proper cleanup) can deter basic abuse, though more robust solutions (like Upstash/KV) should be used for distributed rate limiting across serverless invocations.
## 2026-03-29 - [MEDIUM] Outdated dependency with known vulnerability (nodemailer)
 **Vulnerability:** The project was using an outdated version of `nodemailer` (<8.0.4) which contains a known SMTP command injection vulnerability due to an unsanitized `envelope.size` parameter (GHSA-c7w3-x93f-qmm8).
 **Learning:** I learned that even widely used and trusted libraries can harbor serious security vulnerabilities like command injection. It is crucial to regularly audit dependencies, as these vulnerabilities can be exploited if malicious payloads are crafted.
 **Prevention:** Implement routine automated dependency scanning (e.g., using `pnpm audit` or tools like Dependabot/Snyk) in the CI pipeline. Keep dependencies up-to-date, prioritizing patches for known CVEs to minimize the application's attack surface.
