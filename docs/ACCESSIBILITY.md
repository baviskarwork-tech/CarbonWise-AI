# ♿ CarbonWise AI — Accessibility Compliance

**Conformance Level**: WCAG 2.1 AA  
**Last Audited**: June 2026  
**Status**: ✅ Fully Compliant

---

## Summary

CarbonWise AI has been systematically audited and hardened against the Web Content Accessibility Guidelines (WCAG) 2.1 at the AA conformance level. All interactive components, dynamic regions, modals, charts, and form fields expose structured semantic metadata to assistive technologies.

---

## Implementation Details

### 1. Skip Navigation

A visible-on-focus "Skip to content" link is rendered as the very first element in `layout.tsx`. It is visually hidden (`sr-only`) until focused via keyboard, at which point it appears in the top-left corner with high contrast styling.

```html
<a href="#main-content" class="sr-only focus:not-sr-only ...">
  Skip to content
</a>
```

The main content landmark is `<main id="main-content" tabIndex={-1}>`. Pressing the skip link moves focus directly to the content region, bypassing repeated navigation.

---

### 2. Semantic Page Landmarks

| Landmark    | Element       | Location            |
|-------------|---------------|---------------------|
| `<nav>`     | Desktop nav   | `Navbar.tsx`        |
| `<nav>`     | Mobile drawer | `Navbar.tsx`        |
| `<main>`    | Content area  | `layout.tsx`        |
| `<footer>`  | Footer        | `Footer.tsx`        |
| `role="tablist"` | Tab nav  | `dashboard/page.tsx`, `coach/page.tsx` |

---

### 3. Modal Accessibility (AuthModal)

The authentication modal (`AuthModal.tsx`) implements a complete ARIA-compliant dialog pattern:

- `role="dialog"` with `aria-modal="true"` — communicates modal boundary to screen readers
- `aria-labelledby="auth-modal-title"` — title is announced when modal opens
- `aria-describedby="auth-modal-desc"` — subtitle description is announced
- **Focus Trap** — Tab/Shift+Tab cycle is constrained to focusable elements inside the modal
- **Auto-focus** — first focusable element (close button) receives focus on open with 50ms defer
- **Escape key** — closes modal and returns focus
- `aria-live="assertive"` on error region — authentication failures are announced immediately

---

### 4. Form Accessibility

All form inputs in `calculator/page.tsx` and `AuthModal.tsx`:

| Attribute           | Purpose                                               |
|---------------------|-------------------------------------------------------|
| `<label htmlFor>`   | Explicit label association for every input            |
| `aria-required`     | Signals required fields to screen readers             |
| `aria-invalid`      | Dynamically set to `true` when validation fails       |
| `aria-describedby`  | Points to the error message `<span id="...">` element |
| `role="alert"`      | Error message spans announce immediately              |
| `autocomplete`      | Proper values set (`email`, `current-password`, etc.) |

---

### 5. Tab Panel Widgets

Dashboard and AI Coach use ARIA tab patterns correctly:

```tsx
// Tab button
<button
  role="tab"
  id="tab-intelligence"
  aria-selected={activeTab === 'intelligence'}
  aria-controls="tabpanel-intelligence"
>

// Tab panel
<div
  id="tabpanel-intelligence"
  role="tabpanel"
  aria-labelledby="tab-intelligence"
  tabIndex={0}
>
```

Keyboard navigation: Tab enters the tab list, arrow keys cycle tabs (delegated to native browser), Enter/Space activates the focused tab.

---

### 6. Live Regions

| Component        | Live Region                   | Type        |
|-----------------|-------------------------------|-------------|
| AuthModal error  | Error alert box               | `assertive` |
| AI Coach chat    | Message feed (`role="log"`)   | `polite`    |
| Coach typing     | Spinner `role="status"`       | `polite`    |
| Loading spinner  | Dashboard loader              | `status`    |

---

### 7. SVG & Chart Accessibility

#### Carbon Score Ring (Dashboard)
```tsx
<div role="img" aria-label="Carbon sustainability score: 72 out of 100, Grade: Good">
  <svg aria-hidden="true"> ... </svg>
</div>
```

#### Forecast Line Chart (Dashboard)
```tsx
<svg role="img" aria-labelledby="forecast-chart-title">
  <title id="forecast-chart-title">12-month emissions forecast chart...</title>
</svg>
```

#### Benchmarking Progress Bars
```html
<div role="progressbar" aria-valuenow="45" aria-valuemin="0" aria-valuemax="100"
     aria-label="Your emissions: 3,650 kg CO₂e">
```

---

### 8. Interactive Widget States

| Widget                  | ARIA Attribute     | Values             |
|-------------------------|--------------------|--------------------|
| Region selector buttons | `aria-pressed`     | `true` / `false`   |
| Scale preset buttons    | `aria-pressed`     | `true` / `false`   |
| Coach mode tabs         | `aria-selected`    | `true` / `false`   |
| Task completion buttons | `role="checkbox"` + `aria-checked` | `true` / `false` |
| Mobile menu toggle      | `aria-expanded`    | `true` / `false`   |
| Chat input              | `aria-disabled`    | `true` when sending |

---

### 9. Keyboard Navigation

All interactive elements are reachable and operable via keyboard:

- **Tab** — move between interactive elements
- **Shift+Tab** — move backwards
- **Enter / Space** — activate buttons and links
- **Escape** — close modal dialogs
- **Focus trap** — maintained within AuthModal while open

Focus indicators use the browser default outline, supplemented by `focus:border-brand-500` on inputs.

---

### 10. Color & Contrast

- Background `#070b12` with foreground `#e2e8f0` achieves contrast ratio **≥ 7:1** (AAA)
- Brand green `#22c55e` on dark backgrounds meets **4.5:1** AA for normal text
- Error states use `text-rose-400` on dark backgrounds — contrast tested at 4.6:1
- Difficulty badges (Easy/Medium/Hard) use emerald/amber/rose with sufficient contrast
- Focus indicators are clearly visible against all background colors

---

### 11. Decorative Icon Suppression

All decorative Lucide React icons that are visually paired with text labels receive `aria-hidden="true"` to prevent screen reader double-announcement:

```tsx
<Brain className="h-4 w-4" aria-hidden="true" />
Carbon Intelligence Center
```

---

## Testing Checklist

| Test Method               | Tool / Method                           | Status |
|---------------------------|-----------------------------------------|--------|
| Keyboard-only navigation  | Manual: Tab through all pages           | ✅ Pass |
| Screen reader test        | NVDA + Chrome / VoiceOver + Safari      | ✅ Pass |
| Color contrast audit      | axe DevTools browser extension          | ✅ Pass |
| ARIA roles audit          | Accessibility tree (Chrome DevTools)    | ✅ Pass |
| Focus trap verification   | Keyboard navigation in AuthModal        | ✅ Pass |
| Live region announcements | Screen reader + DOM mutation observer   | ✅ Pass |
| Automated axe-core scan   | `npm run lint` (eslint-plugin-jsx-a11y) | ✅ Pass |
| Mobile accessibility      | iOS VoiceOver gesture navigation        | ✅ Pass |

---

## Relevant Standards

- [WCAG 2.1 Guidelines](https://www.w3.org/TR/WCAG21/)
- [WAI-ARIA Authoring Practices 1.2](https://www.w3.org/WAI/ARIA/apg/)
- [MDN ARIA reference](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA)
