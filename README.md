# CarbonWise AI — Global Carbon Intelligence & Sustainability OS

CarbonWise AI is a premium, hackathon-winning Carbon Intelligence Operating System designed to help users analyze, simulate, predict, and reduce carbon emissions. Built on Next.js 15, TypeScript (strict mode), and Tailwind CSS.

---

## 🚀 Key Engines & Architecture

### 1. Core Carbon Engine (`src/engine/carbonEngine.ts`)
The single source of truth for all mathematical modeling, footprint calculations, and sustainability analysis:
* `calculateCarbonFootprint()`: Computes category-specific annual emissions (Transport, Energy, Food, Waste) using EPA & DEFRA factors.
* `computeSustainabilityScore()`: Calculates a normalized 0-100 score and badge grade relative to national baselines.
* `predictFutureEmissions()`: Forecasts monthly emissions comparison timelines under Business-As-Usual (BAU) and Eco Paths.
* `generateReductionPlan()`: Compiles a custom 4-week task plan with estimated savings per task.

### 2. Global Impact Engine
Scales individual user reductions to visualize community, city, or national offsets in real time:
* CO₂ Saved (Tons)
* Trees Equivalent (Saplings grown for 10 years)
* Cars Removed (Passenger vehicles removed from road per year based on EPA average of 4.6 tons CO₂e)
* Homes Powered (Offsighted annual home electricity consumption)

### 3. Benchmarking Engine
Performs relative carbon analysis to contextualize daily footprints:
* India Average baseline comparison (1,900 kg CO₂e / Year)
* Global Average baseline comparison (4,000 kg CO₂e / Year)
* US Average baseline comparison (16,000 kg CO₂e / Year)
* Percentile rank calculation showing global relative standing.

### 4. Net Zero Forecast Engine
Estimates target deadlines for carbon neutrality:
* Projected Net-Zero Year calculation based on active savings trajectories.
* Confidence Score projection (15%-99%) tracking target goals.
* Monthly reduction cut targets.

### 5. Multi-Mode AI Sustainability Coach
Features five specialized interactive coaching profiles powered by Google Gemini 1.5 Flash:
* 🌿 **Lifestyle Coach**: Circular economy, composting, and waste reduction.
* 🍎 **Food Coach**: Plant-based transitions, dairy alternatives, and organic diets.
* ⚡ **Energy Coach**: Standing load audits, smart thermostats, and appliance upgrades.
* 🚗 **Travel Coach**: EV conversions, flight offsets, and public transit scheduling.
* 🎯 **Net Zero Coach**: Systemic home upgrades and strict annual trajectories.
* **Offline Fallback**: Automatic fail-over to local, structured recommendation templates when network drops or keys are missing.

---

## 🔒 Security Hardening
* **Rate Limiting**: Custom sliding-window in-memory rate limiter on `/api/gemini` restricting requests to 20 calls/min per IP.
* **Input Validation**: Strict Zod schemas validating API payloads, query parameters, and calculator fields.
* **CSP Headers**: Tight Content Security Policy restricting third-party frame inheritance (`frame-ancestors 'none'`) and origin boundaries.

---

## ⚡ Performance & Loading
* **Dynamic Imports (`next/dynamic`)**: Heavy resource-intensive modules (such as Google Maps API inside Eco Resource Map) are isolated and lazy-loaded on-demand with fallback skeletons.
* **Computation Memoization**: `useMemo` and `useCallback` on mathematical sliders, circular gauges, and forecast charts.
* **WebVitals Integration**: Tracks and reports LCP, CLS, FID, INP, and TTFB directly in console logs for runtime performance monitoring.

---

## ♿ Accessibility (WCAG AA Compliance)
* Skip navigation links (`Skip to main content`) integrated in root layout routing.
* Keyboard-navigable page anchors and interactive tab arrays.
* Fully linked `<label htmlFor="...">` elements for sliders and form inputs.
* Live-region announcers (`aria-live`) notifying screen readers of dynamic simulations and loading states.
* Screen reader hints (`aria-describedby` and `aria-invalid`) linking validation errors.

---

## 🧪 Comprehensive Test Suite
The platform includes **124 unit and integration tests** in Jest verifying:
* Core mathematical formulas & zero boundary checks.
* Comparative benchmarking calculations (Global vs India per capita footprints).
* Net-Zero year estimates and confidence scores.
* State management (Zustand) and API route controllers.

---

## ☁️ Google Services Integration
* **Google Gemini 1.5 Flash API**: Powers the structured JSON plan generations and coaching responses.
* **Google Maps API**: Visualizes regional EV charging ports, transit hubs, and recycling depots inside the Eco Map page.
* **Google Cloud Run**: Serves the containerized Next.js standalone application.
* **Firebase (Firestore & Auth)**: Synchronizes secure user profiles, calculator history, and gamified achievements.
