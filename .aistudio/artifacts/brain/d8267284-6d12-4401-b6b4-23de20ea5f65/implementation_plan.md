# SecureFlow — API Security Auditing & Hardening Platform

SecureFlow is an interactive application security (AppSec) auditing platform and interactive testing laboratory designed to detect, demonstrate, and remediate OWASP API Top 10 vulnerabilities (BOLA/IDOR, SQL injection, broken token/session authentication, and privilege escalation) across multi-role REST APIs.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were aligned during the initial consultation:

- **Execution Mode**: Interactive live testing playground with dual backend state engines (simulated vulnerable vs. hardened endpoints) running live HTTP and security assertions in real-time.
- **Vulnerability Suite**: Full OWASP API Top 10 coverage with interactive "Before vs After Hardening" toggles, side-by-side request/response inspections, and direct source-code patch diffs (Django REST Framework / ORM patterns).
- **Deliverables & Artifacts**: Built-in interactive STRIDE threat model viewer, interactive architecture diagram, exportable executive audit report (print-ready PDF and JSON/Markdown), automated pytest & Schemathesis test generator, and full `SECURITY.md` compliance documentation.

---

### 1. Overview & Core Concept

- **What It Does**: SecureFlow provides security engineers, auditors, and backend developers with a comprehensive testing cockpit. Users can switch between 3 persona roles (Administrator, Security Auditor, Standard User), run automated and manual security probe sequences against realistic project management REST API endpoints, observe BOLA/SQLi/Auth exploit payloads, inspect real status code behaviors (200 OK vs 403 Forbidden / 404 Not Found), and toggle endpoint hardening to observe immediate patch resolution.
- **Target Audience / Persona**:
  - *AppSec Engineers & Pen-testers*: Demonstrating repeatable API security findings and drafting executive audit reports.
  - *Backend Developers (Django / REST)*: Learning secure ORM querying, object-level authorization, and JWT claim validation.
  - *Security Auditors & Leads*: Assessing compliance against OWASP API Security Top 10 and STRIDE threat matrices.
- **Key Value**: Bridges the gap between theoretical security concepts and practical AppSec engineering by providing runnable test harnesses, concrete code remediations, and verifiable proof of vulnerability mitigation.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Persona & Workspace Switcher**: Select between `Admin (Roland)`, `Auditor (Sarah)`, and `User (Alex)` with distinct permission scopes.
2. **Security Suite Execution**:
   - Single-click automated scan of the 5 core API vulnerability vectors.
   - Interactive payload workbench allowing custom parameter manipulation (e.g. testing project ID tampering `/api/v1/projects/999`, SQL escape characters `' OR '1'='1`, and expired/unsigned JWT bearer tokens).
3. **Before vs. After Hardening Playground**:
   - Toggle **"Endpoint Hardening"** from *Vulnerable Mode* to *Hardened Mode*.
   - Re-run probes in real-time to watch test assertions transition from *Vulnerable (Critical/High)* to *Passed (Remediated)*.
   - View the exact Python / Django REST Framework code change (e.g., swapping raw SQL query for parameterized Django ORM `.filter(owner=request.user)`, adding `IsOwnerOrReadOnly` permissions).
4. **Threat Model & Architecture Visualizer**:
   - Interactive STRIDE matrix (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege) mapped to the API endpoints and mitigation controls.
   - High-contrast interactive system architecture diagram illustrating DMZ, API Gateway, JWT validator, Django REST service, and PostgreSQL data store.
5. **Audit Report & Artifacts Export**:
   - Executive Audit Report modal with severity breakdown (Critical, High, Medium, Low), verified vs unconfirmed test evidence, remediation checklist, and one-click PDF / Markdown download.
   - Ready-to-commit `SECURITY.md` and `test_api_security.py` (pytest suite) export tab.

#### Visual Identity & Theme
- **Aesthetic Direction**: High-precision AppSec developer console. Purposeful, technical, clean, and utilitarian; avoiding generic purple gradients and floating card slop.
- **Color Palette & Mood**:
  - Dominant Neutral Canvas: Deep dark slate (`#0B0F17`) with rich secondary surfaces (`#111827`, `#1F2937`) and subtle 1px border lines (`#374151`).
  - Semantic Status Tokens:
    - *Critical / High Risk*: Crimson red (`#EF4444` / `#DC2626`)
    - *Warning / Medium Risk*: Amber orange (`#F59E0B` / `#D97706`)
    - *Passed / Hardened*: Emerald green (`#10B981` / `#059669`)
    - *Auditor Accent*: Electric cyan (`#06B6D4` / `#0891B2`)
- **Typography & Hierarchy**:
  - Display & Headings: `Plus Jakarta Sans` (bold, tight tracking).
  - Body Prose: `DM Sans` / `Plus Jakarta Sans` (clean, high contrast, readable).
  - Code & Data Telemetry: Monospace tabular numerals (`JetBrains Mono` / `font-mono tabular-nums`).
- **Component Styling & Layout**:
  - Full-width desktop layout (1440px baseline) with a 260px collapsible sidebar navigation, top bar breadcrumbs, and high-density tabular audit logs.
  - Zero-pill metadata: clean inline text with subtle typographic separators (`·` and `/`).
  - Strict 60-30-10 color distribution.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Dual-State Security Simulation Engine (In-Memory + REST Endpoints)**
  - *Chosen Approach*: Implement a fully stateful, realistic API mock runtime inside the app that simulates genuine HTTP requests, JWT signing/verification, permission checks, and database records for both vulnerable and hardened implementations.
  - *Why*: Enables instant, responsive, sandboxed testing directly inside the AI Studio environment without requiring external Docker containers or network dependencies, while keeping exact HTTP status codes (200, 401, 403, 404, 500) and headers authentic.
  - *Alternatives Considered*: Requiring an external live Django server (would fail without external hosting/network access).
- **Decision 2: Clear Distinction Between Automated Test Results vs. Confirmed Vulnerabilities**
  - *Chosen Approach*: Explicit two-tier classification in the audit findings: "Test Probe Result" (Pass/Fail) and "Vulnerability Confirmation Status" (Confirmed BOLA, Confirmed SQLi, False Positive, or Remediated).
  - *Why*: Reflects realistic AppSec engineering practice where test failure does not automatically mean a viable exploit exists.
- **Decision 3: Interactive Python / Django Source Diff Viewer**
  - *Chosen Approach*: Provide side-by-side vulnerable vs. secured Django REST Framework code snippets for each vulnerability scenario.
  - *Why*: Directly satisfies the project goal of showing how Django ORM mechanisms, DRF permissions classes, and JWT handlers solve the vulnerabilities in production code.

---

### 4. Technical Architecture & Data Strategy (Technical Reference)

#### Architecture & Component Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                          SecureFlow Frontend                           │
│   (React 19 + TypeScript + Tailwind CSS + Lucide Icons + Motion)       │
├────────────────────────────────────────────────────────────────────────┤
│  Top Bar: Persona Role Switcher (Admin / Auditor / Standard User)      │
│  Nav Zones: Overview | Test Laboratory | Hardening Diff | Threat Model │
├──────────────────────────┬─────────────────────────────────────────────┤
│   Sidebar Navigation     │             Main Viewport Canvas            │
│  ─────────────────────── │  ─────────────────────────────────────────  │
│  • Security Dashboard    │  [Live Audit Metrics: Critical/High/Pass]   │
│  • OWASP Test Suite      │  [OWASP API Vulnerability Test Runner]      │
│  • BOLA / IDOR Lab       │  [Raw Request / Response HTTP Inspector]    │
│  • SQLi & ORM Lab        │  [Remediation Code Diff & Fix Toggle]       │
│  • Token & Auth Lab      │  [STRIDE Threat Matrix & Dataflow Graph]    │
│  • Audit Report & Export │  [Executive Report / SECURITY.md / pytest]  │
└────────────┬─────────────┴──────────────────────┬──────────────────────┘
             │                                    │
             ▼                                    ▼
┌──────────────────────────┐         ┌───────────────────────────────────┐
│     Security Engine      │         │     Simulated API Data Store      │
│  • BOLA Rule Evaluator   │◄───────►│  • Users & Role Permissions       │
│  • SQL Parameterizer     │         │  • Multi-Tenant Projects (Tenant  │
│  • JWT Claim Verifier    │         │    Isolation & Cross-User Checks) │
│  • RBAC Access Gate      │         │  • Session Tokens & Signatures    │
└──────────────────────────┘         └───────────────────────────────────┘
```

#### Core Data Models & State Entities
- **SecurityTest**: ID, OWASP category (API1:2023 BOLA, API2:2023 Broken Auth, API3:2023 BOPLA, API8:2023 Security Misconfig, API10:2023 Unsafe Consumption), title, description, payload, target endpoint, method, expected code, vulnerable code, status (`idle`, `running`, `passed`, `vulnerable`), severity (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`), remediation advice.
- **AuditLog**: Timestamp, test ID, executed by persona, HTTP request dump (method, headers, body), HTTP response dump (status, headers, body), confirmation status.
- **RemediationRecipe**: Vulnerable code snippet (Django/Python), hardened code snippet, explanation of defense-in-depth mechanisms (Django ORM query scoping, JWT exp verification, DRF `permission_classes`).
- **STRIDEThreat**: Category (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege), asset at risk, threat scenario, mitigation status.

#### Interactive Component & State Mapping
- `HardeningToggle`: Global or per-test switch triggering switch between vulnerable and patched logic.
- `RunProbeHandler`: Executes the simulated HTTP call with active persona's bearer token and inputs, captures network timing and status code, and appends to audit history.
- `ReportExportModal`: Renders formatted print-ready HTML/PDF layout and provides Markdown/JSON copy-to-clipboard.
- `SecurityDocExporter`: Generates `SECURITY.md`, `test_api_security.py` (pytest), and Semgrep rule yaml.
