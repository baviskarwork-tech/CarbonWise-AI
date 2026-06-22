# Security Architecture — CarbonWise AI

This document details the security posture and technical controls built into the CarbonWise AI platform.

---

## 🛡️ Content Security Policy (CSP)
Strict Content Security Policy directives are enforced inside the middleware context on every client request:

* **default-src 'self'**: Restricts all resource fetches to the origin server by default.
* **script-src 'self' https://www.googletagmanager.com**: Restricts executable scripts strictly to local origin assets and verified Google Tag Manager resources. Removes unsafe-inline and unsafe-eval.
* **style-src 'self' 'unsafe-inline'**: Allows local stylesheets and inline styles required by styling engines.
* **img-src 'self' data: https:**: Restricts images to local origins, data URIs, and HTTPS assets.
* **connect-src 'self' https://*.googleapis.com https://*.firebaseio.com**: Whitelists connections for Google Maps API, Firebase Database, and Gemini AI Coach services.
* **frame-ancestors 'none'**: Prevents clickjacking attacks by forbidding external frame embedding.
* **base-uri 'self' / form-action 'self'**: Restricts base elements and form action targets to host origin.

---

## ⚡ Rate Limiting
An in-memory sliding-window IP rate limiter is implemented inside `/api/gemini/route.ts` to defend against automated request abuse:
* **Target Limit**: Maximum 20 requests per minute per client IP.
* **Graceful Response**: HTTP status code `429 Too Many Requests` returning exactly:
  ```json
  { "error": "Too many requests. Please try again later." }
  ```

---

## ✏️ Input Verification & Zod Validation
All incoming POST payloads for public endpoints are strictly parsed and validated against Zod schemas:
* **Strict Schema enforcement**: Checks all properties for typing, string length, and value boundary definitions.
* **Sanitized Error Responses**: On validation failure, the endpoint returns exactly `{ "error": "Invalid request" }` with status `400 Bad Request` to prevent exposing internals or Zod parsing details to potential attackers.

---

## 🌐 Secure HTTP Headers
The middleware automatically injects standard HTTP security headers on all page renders:
* **X-Frame-Options: DENY**: Forbids embedding pages inside frames to protect against clickjacking.
* **X-Content-Type-Options: nosniff**: Protects against MIME-sniffing and cross-site scripting (XSS).
* **Referrer-Policy: strict-origin-when-cross-origin**: Protects user referrer metadata during cross-origin requests.
* **Permissions-Policy**: Disables hardware sensor access entirely:
  ```http
  geolocation=(), camera=(), microphone=()
  ```
* **Strict-Transport-Security (HSTS)**: Enforces secure SSL connections:
  ```http
  max-age=31536000; includeSubDomains; preload
  ```

---

## 🔑 Secret & Credential Management
* **Zero Secrets in Repository**: No private keys or service accounts are committed to the codebase. All private configuration (e.g. `GEMINI_API_KEY`) is stored inside Environment variables (loaded via `.env.local` or Cloud Run secret mounts).
* **Client-side isolation**: Gemini API keys are isolated strictly on the server-side (`route.ts`). Client applications communicate via the host API and never have direct access to Gemini credentials.
* **No Unsafe eval or HTML injection**: No usage of `eval()`, `dangerouslySetInnerHTML`, or other unsafe evaluation patterns.

---

## 🔥 Firebase Security Rules
When running in production database connection mode, the Firestore Collections are protected with strict read/write security rules:
* **User isolation**: Users can only read and write their own footprint and plan documents (`request.auth.uid == resource.data.userId`).
* **Schema Validation**: Rules validate data boundaries before allowing writes.
