# Deep Research Prompt — VisKet Freelancer Marketplace

You are a senior software architect and engineering researcher. Conduct a deep, thorough analysis of the following topics as they apply to **VisKet**, a freelancer marketplace built with **Laravel 12 + Vue 3 + Inertia.js v2 + Tailwind CSS v4 + MySQL**.

Project context:
- Freelancers and clients post vacancies, apply, communicate via chat, complete work, rate each other
- Built-in escrow/balance system with YooKassa payments
- Real-time chat via Laravel Reverb (WebSocket)
- Application state machine: pending → accepted → in_progress → executor_marked_done → completed (with cancelled/disputed branches)
- Queue and cache both use `database` driver
- Test DB is MySQL, not SQLite
- No TypeScript, no ESLint/Prettier — only Laravel Pint for PHP style

---

## Research Topics

For each topic below, provide:
1. **Current state** — how VisKet likely handles this (based on the tech stack described)
2. **Problems & risks** — what could go wrong at scale or under load
3. **Best practices & alternatives** — modern approaches, trade-offs, migration paths
4. **Concrete recommendations** — specific actions for VisKet with estimated effort (low/medium/high)

### 1. SPA vs MPA vs PWA — Architecture Decision

- Inertia.js is a hybrid SPA-over-MPA approach. Compare with:
  - Full MPA (server-rendered Blade/Livewire)
  - Full SPA (Vue/React + REST/GraphQL API)
  - True PWA (service workers, offline support, manifest)
- How does Inertia's approach affect SEO, initial load time, memory usage, DX?
- Should VisKet add PWA capabilities (offline mode, push notifications, install prompt)?
- Implications of SSR via `@inertiajs/server` — when is it valuable?

### 2. ACID Transactions & Data Integrity

- Given MySQL + `database` queue driver: how to ensure transactional integrity when:
  - Creating a payment → updating balance → dispatching job
  - Accepting an application → transitioning state → sending notification
  - Handling concurrent bids/applications on the same vacancy
- Laravel database transactions (`DB::transaction`), pessimistic vs optimistic locking
- Queue job idempotency — what if a job runs twice?
- Handling failed jobs — retry strategies, dead-letter queues, `$attempts`
- The escrow/balance system: double-entry accounting, isolation levels, race conditions

### 3. Database Schema & Performance

- 18 Eloquent models (User, Post, Vacancy, Application, Chat, Message, Comment, Like, Skill, Transaction, Dispute, Report, Review, Payment, Notification, SocialAccount, Subscription, VerificationRejection)
- N+1 query risks — where should `with()`, `load()`, `cursor()` be used?
- Indexing strategy for: polymorphic relations (likes, comments), JSON columns (skills, metadata), full-text search on posts
- Pagination strategies: `paginate()` vs `cursorPaginate()` vs `simplePaginate()` for feeds/chat
- MySQL partitioning/archiving for old messages and notifications

### 4. Queue & Job Architecture

- `QUEUE_CONNECTION=database` — pros, cons, tipping point for switching to Redis/SQS
- Job batching & chaining for complex flows (e.g., accept application → notify both parties → update search index → send email)
- Job middleware: rate limiting, throttling, preventing duplicates
- Supervisor/systemd config for `queue:work` vs `queue:listen` — which for prod?

### 5. Real-time & Broadcasting

- Laravel Reverb on port 8081 — scaling considerations, sticky sessions, reverse proxy config
- Presence channels for chat — is the current approach correct?
- Echo client setup — reconnection strategy, optimistic UI updates
- Fallback when WebSocket fails: polling, SSE, or degrade gracefully?

### 6. Payment System (YooKassa)

- Webhook security: signature verification, idempotency key, retry handling
- Payment lifecycle: create → hold → confirm/cancel → refund
- Escrow release timing — what if webhook is delayed or lost?
- Double-spending prevention across the application state machine + payment system

### 7. Security

- Mass assignment vulnerabilities — are `$fillable` / `$guarded` properly set on all 18 models?
- Authorization: policy coverage for Application, Dispute — what about Post, Chat, Message?
- API (Sanctum) — token scopes, rate limiting, CORS
- OAuth (Google/GitHub via Socialite) — CSRF, state parameter validation
- XSS vectors in user-generated content, chat messages
- Admin middleware — is role-based or permission-based access control needed?

### 8. Testing Strategy

- Pest v4 with MySQL test DB — speed concerns vs SQLite
- Test organization: describe() blocks, shared `beforeEach()`, factory reuse
- Coverage gaps: which models/controllers/services lack tests?
- Integration testing of WebSocket broadcasting
- Testing the payment webhook (signing requests, simulating YooKassa callbacks)
- Test performance: should critical paths use `#[DataDriver]` or DB transactions?

### 9. AI Integration

- HuggingFace API with `SimpleAIService` fallback — what are the rate limits?
- Caching AI-generated content to avoid redundant API calls
- Prompt injection risks in user-facing AI features

### 10. Scalability & Deployment

- Current bottlenecks: database queue polling, MySQL single-db, Vite SSR memory
- Horizontal scaling: multiple app servers, shared Redis, read replicas
- Static asset strategy: CDN, Vite build cache, versioning
- Monitoring: Laravel Pulse, logs, error tracking (Sentry/Flare)

### 11. Frontend Performance

- Eager `import.meta.glob` — bundle size impact, code splitting alternatives
- Memory leaks: Echo listeners not cleaned up, Inertia component lifecycle
- Tailwind CSS v4 bundle size — purging unused styles
- Image optimization, lazy loading, virtual scrolling for chat

---

## Deliverable Format

Organize the response as a structured document with:

```markdown
# Research Report: VisKet Architecture & Technical Deep Dive

## Executive Summary
(2-3 paragraph overview of the most critical findings)

## Per-Topic Analysis
### 1. Topic Name
- **Current assessment**: ...
- **Risks**: ...
- **Recommendations**: ...
  - Short-term (quick wins): ...
  - Medium-term (weeks): ...
  - Long-term (months): ...

## Prioritized Action Plan
Rank all recommendations by impact/effort ratio.

## Key Metrics
What to measure to validate improvements.
```

Be specific, actionable, and pragmatic. Avoid vague advice. Reference actual Laravel/Vue/Inertia APIs by name. Assume the team is small (1-3 developers) so simpler solutions are preferred unless the risk is critical.
