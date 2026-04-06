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
## 2026-03-29 - [HIGH] Fix IP spoofing vulnerability in rate limiting
 **Vulnerability:** Serverless API endpoints were using `req.headers["x-forwarded-for"]` to identify client IP addresses for rate limiting. This header can be easily spoofed by attackers appending arbitrary IPs.
 **Learning:** I learned that in Vercel serverless environments, `x-forwarded-for` should not be trusted for security checks like rate limiting. Vercel provides a secure `x-real-ip` header that it overwrites at the edge, making it safe from client manipulation.
 **Prevention:** Always use `req.headers["x-real-ip"]` instead of `req.headers["x-forwarded-for"]` when identifying client IPs in Vercel serverless functions to ensure rate limiting cannot be bypassed via IP spoofing.
## 2026-03-29 - [MEDIUM] Outdated dependency with known vulnerability (nodemailer)
 **Vulnerability:** The project was using an outdated version of `nodemailer` (<8.0.4) which contains a known SMTP command injection vulnerability due to an unsanitized `envelope.size` parameter (GHSA-c7w3-x93f-qmm8).
 **Learning:** I learned that even widely used and trusted libraries can harbor serious security vulnerabilities like command injection. It is crucial to regularly audit dependencies, as these vulnerabilities can be exploited if malicious payloads are crafted.
 **Prevention:** Implement routine automated dependency scanning (e.g., using `pnpm audit` or tools like Dependabot/Snyk) in the CI pipeline. Keep dependencies up-to-date, prioritizing patches for known CVEs to minimize the application's attack surface.
## 2026-03-29 - [HIGH] IP spoofing vulnerability in rate limiting logic
 **Vulnerability:** The serverless API endpoints (`api/chat.js`, `api/newsletter.js`, `api/contact.js`) were using the `x-forwarded-for` header to identify client IP addresses for rate limiting. This header can be easily spoofed by a malicious client, allowing them to bypass rate limits and exhaust API quotas.
 **Learning:** In serverless environments behind reverse proxies (like Vercel), `x-forwarded-for` can contain a comma-separated list of IPs, including client-provided spoofed values. Trusting this header blindly for security controls like rate limiting is dangerous.
 **Prevention:** Always use `x-real-ip` (or the provider-specific equivalent that is guaranteed to be overwritten by the edge proxy) instead of `x-forwarded-for` when identifying the true client IP for rate limiting or other security measures. Verified and enforced in `api/newsletter.js` with automated tests in `tests/api_newsletter.test.js`.

## 2026-03-24 - [MEDIUM] Fix Email Header Injection vulnerability
 **Vulnerability:** The `api/contact.js` endpoint accepted `name` input without filtering newline characters (`\r`, `\n`) and directly injected it into the email `subject`. This introduced a risk of Email Header Injection (CRLF Injection) allowing attackers to manipulate email headers.
 **Learning:** I learned that user input that becomes part of an email structure (like Subject, To, From) requires strict sanitization beyond format or length checks, as newlines can act as control sequences.
 **Prevention:** For variables used within email structures, always sanitize them by stripping or replacing `\r` and `\n` prior to usage or validation.

## 2026-04-02 - [MEDIUM] Cross-Site Scripting (XSS) via innerHTML in Popup
 **Vulnerability:** The newsletter/contact popup success message was being rendered by directly assigning a string of HTML to the `innerHTML` property of the `popupContent` element. While the content was largely static in the current implementation, using `innerHTML` is a dangerous practice that can lead to DOM-based XSS if user-controlled data is ever interpolated into the string.
 **Learning:** I learned that even for seemingly safe, static UI updates, `innerHTML` should be avoided in favor of more explicit and secure DOM APIs. This "defense in depth" approach prevents future vulnerabilities if the code is later modified to include dynamic content.
 **Prevention:** Strictly avoid `innerHTML` for dynamic UI updates. Instead, use `document.createElement`, `textContent` for text, and `replaceChildren()` or `append()` to update the DOM tree safely.

## 2026-06-25 - [ENHANCEMENT] Add timeout to external API calls
 **Vulnerability:** The serverless endpoints `api/chat.js`, `api/newsletter.js`, and `api/contact.js` called external services (Resend and Gemini) without an explicit timeout mechanism. This could lead to hanging requests, consuming serverless function execution time and potentially leading to denial of service if the external API becomes unresponsive.
 **Learning:** In serverless architectures, external API requests can hang, causing the function to run until the provider's execution limit (e.g., 10 or 60 seconds) is reached. This is an inefficient use of resources and can quickly lead to exhaustion of concurrent execution limits and higher costs.
 **Prevention:** Always wrap external API calls with a timeout mechanism (such as `Promise.race` with a timeout promise) to ensure the function fails fast and releases resources promptly if the external service does not respond in a reasonable time.
## 2026-06-26 - [ENHANCEMENT] Client-side input length validation
**Vulnerability:** Client-side form elements (`<input>`, `<textarea>`) across the application lacked `maxlength` attributes. While backend validation was recently added, allowing users to submit arbitrarily large payloads from the frontend creates a poor user experience on failure and presents a minor risk of consuming unnecessary client resources or triggering network payload limits before backend rejection.
**Learning:** Defense-in-depth requires enforcing constraints at every layer. Implementing `maxlength` attributes that mirror backend limits provides immediate, zero-latency feedback to the user and prevents excessively large payloads from ever leaving the browser.
**Prevention:** Always define `maxlength` attributes on HTML input elements that align with the corresponding backend data schema or API constraints.
