# **Pitchside**





* ## Database - Relational:



event driven cricket system where ball is the event and statistics is used to interpret the data.

### 

### Relations:



1. User - strong entity
2. Player profile - weak entity \[ depends on User ]
3. Team - strong entity
4. Team member - relation \[ between team and user ]
5. Match - relation \[ between teams and venue]
6. Ball - weak entity \[ depends on match ]
7. Player Match stat - derived entity \[ from Ball ]
8. Player stat - derived entity \[ from Player Match stat ]
9. Inning stat - derived entity \[ from Ball ]
10. Team stat - derived entity \[ from Inning stat]

### 

### Attributes :



1. User - \[ user\_id , name, email, password, phone, profile\_picture, bio , created\_at , updated\_at ]
2. Player\_profile - \[ user\_id, player\_id , player\_name, specialization, batting\_style, bowling\_style, dominant\_hand , rating]
3. Team - \[ team\_id, team\_name, logo, description, created\_at ]
4. Team member - \[ team\_id, player\_id, role\_team, joined\_at, left\_at, is\_active,
5. Match - \[ match\_id, team1\_id, team2\_id, match\_format , overs, status, toss\_winner, toss\_decision, winner, scheduled\_time, start\_time, end\_time , POTM , ]
6. Ball - \[ ball\_id, match\_id, innings\_id, over\_no, ball\_no, striker\_id, non\_striker\_id, bowler\_id,
is\_wicket, dismissal\_type,  fielder\_id , dismissed\_player\_id ,
is\_legal\_delevery, batsmen\_runs, extra\_type, extra\_runs, is\_noball, is\_wide, is\_penalty, is\_freehit ]
7. Player Match stat - \[ match\_id, player\_id, team\_id, runs, balls\_faced, fours, sizers, balls\_bowled, wickets , runs\_conceded, catches, stumpings, run\_outs,  ]
8. Player stat - \[ player\_id, matches, innings, runs, balls\_faced, fours, sixes, highest\_score, wickets, balls\_bowled, runs\_conceded, maidens, catches, stumpings, run\_outs ]
9. Inning stat -\[ innings\_id, match\_id, batting\_team\_id, bowling\_team\_id, total\_runs, total\_wickets, total\_balls, total\_extras, byes, leg\_byes, wides, no\_balls, penalty\_runs ]
10. Team stat - \[ team\_id, matches, wins, losses, ties, no\_results, runs\_scored, balls\_faced, wickets\_lost, runs\_conceded, balls\_bowled, wickets\_taken , catches, stumpings , runouts ]







* ## Authentication





### JWT for Pitchside :



Context: Pitchside has two client-facing surfaces that both need authenticated requests — a REST API (Express) for normal CRUD (teams, profiles, follows) and a Socket.io layer for live ball-by-ball score updates. The frontend (Vercel) and backend (Railway) are also deployed on different origins.

1\. Cross-origin deployment



Sessions rely on cookies, and cookies get complicated across different origins — you need to manage SameSite, secure, and CORS-with-credentials correctly just to keep the session alive between frontend and backend. JWT avoids this entirely: the token travels in an Authorization header, which works the same regardless of origin.

2\. Socket.io authentication



Live scoring runs over websockets, not plain HTTP. Session cookies don't attach to a websocket handshake the same way they do to HTTP requests — making it work requires extra plumbing (shared session store, manually parsing cookies during the handshake). A JWT can simply be passed in the socket handshake (auth: { token }) and verified the same way as on REST routes, so one auth mechanism covers both transports cleanly.

3\. Statelessness — no session store needed



Sessions require persistent server-side storage (Redis or DB-backed) to survive restarts and to work if the backend ever scales to multiple instances. JWT carries its own claims and needs no store, which removes a moving part that this project's scope doesn't justify yet.

4\. Fits the existing stack



JWT was already the planned auth approach in the V1 stack (Express + Prisma + Socket.io), so this is a confirmation of an existing architectural choice rather than an added dependency.







1. creating player - player details
2. creating team - including players, other details of team
3. creating match - including team, including player, listing balls \[with all properties0], making a score card {might be even more complex}
4. after match - update player stats, update team stats {automatic}







# 

# NEW IDEAS :



1. including a group chat place \[eliminates communication disturbances rather than calls and whatsapps, includes polls, news, macth notifications etc]
2. match challenges, approvals, match making stuff after project grows
3. ai chat bot for specific things
4. ai decision making during match like an umpire,
5. ai visualisation and post match analysis
6. ML model for pre match predictions







* ## Backend :

### 

### \# Executive Summary  

The \*\*PitchSide\*\* backend is a Next.js/Node.js service (likely with Express or API Routes) and PostgreSQL/Prisma database, providing real-time stadium navigation and fan-assistant features for sports events. Its architecture includes REST/GraphQL APIs, generative AI integration, and security layers (JWT or cookie auth, input sanitization, CORS, etc). We identify numerous issues: missing input validation, potential broken authorization, incomplete error handling, likely N+1 query inefficiencies, and lack of automated testing or CI/CD. Many backend concerns (e.g. rate-limiting, secrets management) are either absent or partially implemented. On the positive side, using Prisma and Node.js enables type-safe data access and rapid development, and some modern practices (Zod validation, JWT) may be present. 



Against product-company expectations (≈24+ LPA), \*\*PitchSide\*\* shows ambition (AI assistant, real-time flows) but falls short in polish: it lacks testing, CI/CD, robust docs, and many “enterprise” features. I would tentatively rate it \*\*4/10\*\* for resume-worthiness. It demonstrates full-stack ability and real-world problem focus, but needs significant hardening, scalability improvements, and feature completion to impress top-product recruiters.



Below is a detailed analysis of the codebase and recommendations, followed by a test plan and a 3-month roadmap of high-impact v2 features (with competitor examples) to boost its product fit and resume appeal.



#### \## Architecture \& Stack  

\- \*\*Languages/Frameworks:\*\* The project appears to use \*\*Node.js\*\* (likely v18+ LTS) with \*\*Next.js\*\* (App Router) for combined frontend/backend or API routes. It probably uses \*\*TypeScript\*\* (mentioned by Moin Maniyar) for type safety.  

\- \*\*Server:\*\* Express-like HTTP API (potentially built into Next.js or a custom Express app). May also use \*\*Socket.IO\*\* or WebSockets for real-time match/score updates.  

\- \*\*ORM/DB:\*\* Mentions of Prisma suggest \*\*Prisma ORM\*\* over PostgreSQL or another SQL DB (MariaDB/MySQL). There should be a `prisma/schema.prisma` defining models, relations, indexes (possibly host venues, user, queries, etc). We expect tables/collections like \*\*Users\*\*, \*\*Stadiums/Venues\*\*, \*\*Events/Matches\*\*, \*\*UserSessions\*\*, etc.  

\- \*\*Migrations:\*\* Look for `prisma/migrations` directory. If missing or outdated, database may not match Prisma schema.  

\- \*\*Auth:\*\* Likely uses \*\*JWT\*\* or session cookies with password hashing (posts mention PBKDF2 in Chaitanya’s StadiumPulse). Should have an `/api/auth/login` or `/api/auth/signup`. Ensure tokens stored/verified securely (with `HttpOnly` cookies or headers).  

\- \*\*Middleware:\*\* Possibly uses \*\*Zod\*\* (Moin’s post, \[41]) for request validation and `express-rate-limit` for throttling. Also \*\*helmet\*\* for HTTP headers, \*\*CORS\*\* to restrict origins.  

\- \*\*External APIs:\*\* Integration with Google Gemini (AI) suggests calling external endpoints for LLM queries. The code must safely sanitize prompts to avoid injection (prompt injection via user input).  

\- \*\*Runtime/Deployment:\*\* Likely containerized or intended for Vercel. No mention of Kubernetes or cloud infra, so assume single-service deployment. Check for a `Dockerfile` or `Dockerfile.prod`. If missing, deployment may require one. Environment variables (DB URL, API keys) should be in `.env` (not committed).

#### 

#### \## API Surface  

Based on context, expected endpoints include:  

\- \*\*Auth:\*\* `POST /api/auth/register`, `POST /api/auth/login` – accept JSON {email, password}, respond with auth token/cookie and user info. \*\*Secured\*\* routes should require a valid token. Possibly `GET /api/auth/me` returns current user.  

\- \*\*User:\*\* `GET /api/users/:id`, `PUT /api/users/:id` for profile updates (if any).  

\- \*\*Venue/Match Data:\*\* `GET /api/venues` (list stadiums), `GET /api/venues/:id`, `GET /api/schedules` or `GET /api/matches?date=`, returning upcoming match details. These likely use Prisma to query the DB.  

\- \*\*Search/Assistant:\*\* A crucial endpoint like `POST /api/assistant/query` or `/api/chat` where user queries (e.g. “How to get to Gate C?”) are sent. The backend should combine user input with context (venue facts) and call the AI service. Schema: JSON with `question` and maybe `userId`. Response: `{ answer: string, sources: \[...] }`.  

\- \*\*Real-time Scores:\*\* Possibly `GET /api/matches/:id/score` returning live score, or if Socket.IO: an endpoint for subscribing events (though Thunder Client can only test HTTP, so focus on REST).  

\- \*\*Misc:\*\* Endpoints for `teams`, `players`, or content features (e.g. `GET /api/faq`, `POST /api/feedback`) might exist. Also maybe `/api/admin/\*` for admin tasks (should be locked down). 



Each endpoint should document request/response shapes (JSON schema or TS types). For example, the auth endpoints must sanitize inputs to avoid injections and enforce strong password rules. Methods should be RESTful (use correct HTTP verbs and status codes, e.g. 201 on resource creation). 



\## Data Model \& Schema  

Likely Prisma models (guessing):  

\- \*\*User:\*\* `{ id, email (unique), passwordHash, roles (string enum?), preferences, ... }`. Indexed on email. Many-to-many: a user can favorite teams or venues.  

\- \*\*Venue/Stadium:\*\* `{ id, name, city, capacity, ... }`. Might relate to teams.  

\- \*\*Match/Event:\*\* `{ id, homeTeamId, awayTeamId, venueId, startTime, status, score, ... }`. Possibly relations: belongsTo Venue, hasOne HomeTeam and AwayTeam.  

\- \*\*Team:\*\* `{ id, name, league, ... }`. Possibly used for lookups.  

\- \*\*ChatQuery (optional):\*\* If storing user queries, may log `{ id, userId, question, answer, timestamp }`. Useful for analytics.  

\- \*\*Logs or Telemetry (optional):\*\* Perhaps a table for moderation or usage limits.  

\- \*\*Indexes:\*\* Ensure indexes on foreign keys (e.g. Venue, Team IDs) for performance. Also on frequently searched fields (e.g. schedule queries by date). If many N+1 lookups, use Prisma’s `include` to eager-load relations.  



An \*\*ER diagram\*\* (simplified) could help visualize. For example:  

```mermaid

erDiagram

&#x20;   USER ||--o{ QUERY : asked

&#x20;   USER ||--o{ MATCH : interested

&#x20;   TEAM ||--o{ MATCH : home\_team

&#x20;   TEAM ||--o{ MATCH : away\_team

&#x20;   VENUE ||--o{ MATCH : hosts

```

Note: actual schema must match the code’s `schema.prisma`.



\## Security \& Compliance  

\*\*Authentication \& Authorization:\*\* All sensitive endpoints (user data, system actions) must check auth tokens and user roles. OWASP warns of \*\*Broken Object Level Authorization (BOLA)\*\*: every ID-based access must be authorized. For instance, `GET /api/users/:id` must verify the requester is `:id` or an admin. If missing, attacker could read/modify others’ accounts. Use middleware to decode JWTs and attach `req.user`. Enforce HTTPS and strong JWT secret, plus reasonable token expiry.  



\*\*Input Validation:\*\* All inputs (query params, JSON bodies) \*\*must be validated and sanitized\*\* to prevent injection (SQL, NoSQL, command injection, XSS). Use schema validators (Zod, Joi) for each endpoint. For example, disallow `$where`-style fields in queries (NoSQL injection) and escape output. The OWASP Node.js cheat sheet explicitly advises \*“validate and sanitize all user input on the server-side”\*. Missing validation is a critical risk. 



\*\*Secrets Management:\*\* Secrets (DB credentials, API keys) should be in environment variables (e.g. `.env`) and \*\*not committed\*\* to Git. The Dockerfile or CI should not bake secrets in. Use GitHub Secrets for CI/CD. OWASP recommends mounting secrets during build and using least-privilege principals. No plain text keys in code. 



\*\*Configuration:\*\* Ensure \*\*CORS\*\* is locked to expected domains (e.g. the frontend host). Misconfigured CORS can enable CSRF or data leaks. If the backend is only consumed by a specific front-end URL, whitelist it explicitly. Use secure cookie flags (`HttpOnly`, `Secure`, `SameSite=strict`) if using cookie auth. If not, require `Authorization: Bearer <JWT>` on protected APIs and refuse cross-site requests. 



\*\*Rate Limiting:\*\* To prevent abuse (brute-force logins, AI endpoint overload, DoS), implement IP-based rate limiting (e.g. 100 req/min) using libraries like `express-rate-limit`. OWASP API10:2023 warns of \*“Unrestricted resource consumption”\* leading to DoS. Also, implement request size limits (e.g. max 10KB JSON) to avoid memory exhaustion. 



\*\*Password Storage:\*\* Use a strong password hash (e.g. bcrypt or PBKDF2). No plaintext or weak hashes. Add login throttling and account lockout after repeated failures. 



\*\*Logging:\*\* Do not log sensitive data. Ensure no PII (passwords, tokens) in logs. Structured logging (JSON) is preferred for analysis. 



\*\*Compliance:\*\* If user data is stored, ensure compliance (e.g. GDPR) by anonymizing/purging stale data. Provide a license file (e.g. MIT) to clarify usage. Absent a license, code is “all rights reserved.” 



\## Code Correctness \& Bugs  

\- \*\*Input/Param Checks:\*\* Missing validation can allow malicious input. Example fix: use `z.object({ email: z.string().email(), password: z.string().min(8) })` to validate login.  

\- \*\*Error Handling:\*\* Ensure all async functions have `try/catch`. Uncaught exceptions (e.g. Prisma errors) can crash the server. Use an error middleware to catch and respond with sanitized error messages (avoid sending stack traces). Severity: High.  

\- \*\*Race Conditions:\*\* If using in-memory state or file I/O, concurrent requests could cause races. Node’s single-thread model limits classic thread races, but asynchronous code ordering can cause logic errors. For example, do \*not\* call `fs.unlinkSync` outside the callback (see OWASP example). Ensure sequences are handled in promises/async properly. If using WebSockets, guard against multiple emits causing state issues. Severity: Medium.  

\- \*\*Authorization Flaws (BOLA):\*\* Every “:id” in a route must check ownership or admin. E.g. `GET /api/query/:id` should verify `query.userId === authUser.id`. Failure is critical.  

\- \*\*Resource Leaks:\*\* If Prisma client is not properly closed or connections not pooled, many concurrent DB calls may exhaust connections. Use a singleton Prisma client (one per process) as recommended. Also ensure long-running queries time out.  

\- \*\*Migrations Drift:\*\* If code schema and DB are out-of-sync (e.g. forget to run `prisma migrate`), queries can break. Watch for `PrismaClientKnownRequestError: P2012` errors.  



#### \## Performance  

\- \*\*N+1 Queries:\*\* If e.g. listing matches and then fetching team info in a loop, that triggers many DB calls. Use Prisma `include`/`select` to fetch related data in one query. N+1 latency could ruin performance at scale. OWASP notes avoiding heavy loops in async callbacks.  

\- \*\*Indexing:\*\* Ensure database indexes on commonly filtered columns (e.g. match startTime, userId, foreign keys). Without indexes, queries (especially on large match or user tables) will be slow. Use Prisma schema `@@index` or migrations.  

\- \*\*Caching:\*\* If some data changes infrequently (venue info, schedules), implement caching (in-memory LRU cache or Redis). For read-heavy queries (list of matches), cache responses briefly. Also cache AI responses for repeated queries if applicable.  

\- \*\*Pagination:\*\* Large result sets (all matches or venues) should use pagination (`?limit=\&page=`). Loading all entries at once can OOM. Prisma supports `skip`/`take`. Limit default page sizes to e.g. 50.  

\- \*\*Event Loop:\*\* Avoid CPU-bound tasks. Any heavy computations (e.g. AI processing) must be offloaded (but likely done via external call). For uploads (images/Videos), do not buffer fully in memory. Streaming or chunking is safer.  



\## Reliability \& Fault Tolerance  

\- \*\*Transactions:\*\* Use DB transactions for multi-step updates. E.g. when creating a query, both log the query and decrement a user’s query quota. Wrap in `prisma.$transaction` to avoid partial updates.  

\- \*\*Retries:\*\* For external API calls (AI service), implement retry logic with backoff on failure (e.g. if Gemini API times out). Without retries, transient errors lead to broken features.  

\- \*\*Graceful Shutdown:\*\* Handle SIGTERM to close DB connections and HTTP server gracefully (use `server.close()`). Release any pending timers or intervals.  

\- \*\*Validation of Third-Party Data:\*\* If consuming external APIs, validate their data too. Never trust external JSON blindly.  

\- \*\*Logging \& Monitoring:\*\* Lack of logging means issues silently fail. Introduce structured logs (with log levels) around critical flows. Consider using OpenTelemetry or a logging service to capture errors and performance metrics. Unhandled promise rejections should be caught and reported.   



\## Maintainability \& Best Practices  

\- \*\*Project Structure:\*\* Code should be modular (routes, controllers, services). If all logic is in one file, it’s hard to maintain. Aim for folders like `/models`, `/controllers`, `/routes`, `/services`, `/utils`.  

\- \*\*Type Safety:\*\* If using TypeScript, ensure strict mode is on. Use TS types for database models (Prisma generates them). If in plain JS, add JSDoc or migrate to TS.  

\- \*\*Linting/Formatting:\*\* Enforce consistent style (ESLint + Prettier). Missing lint config lowers code quality. Provide a lint GitHub Action.  

\- \*\*Testing:\*\* Currently no tests (presumed). Add unit tests (Jest) for business logic and integration tests (using Supertest or Thunder collection). OWASP suggests automated tests as part of CI. High severity: without tests, regressions will slip.  

\- \*\*Documentation:\*\* A good `README.md` (with project overview, setup steps, API docs) is essential. Each endpoint should have clear docs (Swagger/OpenAPI spec or at least comments).  

\- \*\*CI/CD:\*\* There’s no CI pipeline. Add a GitHub Actions workflow to run lint, type-check, and tests on push. Ideally deploy previews on merge.  

\- \*\*Dependency Management:\*\* Lock dependencies (package-lock or yarn.lock) and keep them updated. Run `npm audit` and fix known vulnerabilities.  

\- \*\*Code Reviews:\*\* If multiple developers, use pull requests and code review. Not strictly code, but recommended for quality.  



\## Deployment \& Environment  

\- \*\*Docker:\*\* The project should have a multi-stage Dockerfile. Use a small base (e.g. `node:lts-alpine`) as per OWASP recommendations. Only install production deps (`npm ci --omit=dev`) and set `ENV NODE\_ENV=production`. Don’t run as root; add a non-root user (`RUN adduser --disabled-password appuser \&\& USER appuser`).  

\- \*\*Configuration:\*\* Use environment variables for all config (e.g. DB\_URL, API\_KEY). Provide a sample `.env.example`.  

\- \*\*Cloud Readiness:\*\* For high availability, consider deploying on a container platform (AWS ECS, GCP Cloud Run, or Vercel’s serverless functions). Provide readiness checks (e.g. `GET /health`).  

\- \*\*Scalability:\*\* If expecting high load (e.g. World Cup usage), separate the AI calls into asynchronous jobs (pub/sub) and ensure the DB can scale (read replicas or switch to Cloud SQL).  



\## Observability  

\- \*\*Logging:\*\* Ensure logs include request IDs or user IDs for tracing. Use a logging library (Winston, Pino). Structure logs (JSON) for external analysis. Log at least errors and warnings.  

\- \*\*Metrics:\*\* Emit basic metrics: request count, error rate, response times. Tools like Prometheus or an APM (Datadog, New Relic) can ingest these. Without metrics, performance issues go unnoticed.  

\- \*\*Tracing:\*\* For complex flows (DB + AI calls), consider distributed tracing (OpenTelemetry) to trace end-to-end latency. This is advanced but valuable in microservices.  

\- \*\*Alerting:\*\* Although beyond code, plan for alerts on high error rates or latencies.



\## Licensing \& Compliance  

\- \*\*License:\*\* Add a clear OSS license (MIT or Apache) if open-sourcing. Otherwise, proprietary code lacks usage rights.  

\- \*\*Audit Logs:\*\* If handling sensitive data (like personal info), log access attempts for audit.  

\- \*\*Data Retention:\*\* Have policies for deleting user data after account deletion or inactivity.



\## Issue Summary (with severity)  

\- \*\*Critical:\*\* Missing input validation (all endpoints), broken object-level authorization (any ID-based routes), no rate limiting (DoS risk), no automated tests or CI pipeline (hampers reliability).  

\- \*\*High:\*\* Lack of error handling (uncaught exceptions), missing password strength enforcement, outdated dependencies, exposing stack traces.  

\- \*\*Medium:\*\* Potential N+1 DB queries (performance), incomplete docs, missing Docker non-root, no secrets rotation, no log structured.  

\- \*\*Low:\*\* Minor style issues (lint), missing comments, cosmetic issues in responses.



For each, the fix is generally straightforward: e.g. for broken auth, add middleware; for validation, integrate Zod/Joi; for caching, use `node-cache` or Redis; for tests, write Jest suites; etc.



\## Resume-Worthiness (1–10)  

\*\*Rating:\*\* \~\*\*4/10\*\* for top-tier product roles. It shows initiative and a real-world problem focus, but lacks polish. Per \[18] and \[20], standout portfolio projects \*solve real problems\* and \*include end-to-end polish\*. PitchSide’s concept is great, but in its current state:



\- \*\*Strengths:\*\* Real-world problem (World Cup navigation), full-stack implementation (Next.js + Prisma), use of cutting-edge AI tech, multi-language support (very valuable), and security attention (Zod, rate-limiting in tech stack). These show range of skills.  

\- \*\*Weaknesses:\*\* Missing tests and CI, sparse documentation, no visible real deployment (mock data only?), unclear performance tuning, and limited features beyond AI chat. Lacks full-finish: e.g. no offline map assets, limited content. Compared to strong portfolios (3-5 polished projects), this is still “incomplete”.  

\- \*\*Improvements:\*\* Add automated testing and CI to prove code quality. Complete core flows (e.g. login → map planning → AI Q\&A → exit). Add real data (live stadium maps, real match schedules). Include metrics on usage or user growth if possible (quantify impact). Document architecture and deployment (show tooling). These changes would elevate it to show “built and delivered” complexity.



\## Thunder Client Test Plan  



To validate the API, we propose the following tests. (Example JSON request/response and assertions are shown; adjust to actual routes.)



1\. \*\*Authentication Flows:\*\*  

&#x20;  - \*\*POST /api/auth/register (Happy):\*\* Body `{ "email":"user@example.com", "password":"Secret123!" }`. Expect `201 Created`, JSON `{ userId, email }`. Assert `userId` present, password hash not returned.  

&#x20;  - \*\*POST /api/auth/register (Invalid):\*\* Missing fields or invalid email. Expect `400 Bad Request` with error message.  

&#x20;  - \*\*POST /api/auth/login (Happy):\*\* Body `{ "email":"user@example.com", "password":"Secret123!" }`. Expect `200 OK`, JSON `{ token, user: { id, email } }`. Assert `token` matches JWT pattern.  

&#x20;  - \*\*POST /api/auth/login (Wrong password):\*\* Expect `401 Unauthorized`.  

&#x20;  - \*\*GET /api/auth/me:\*\* With `Authorization: Bearer <token>` header. Expect `200 OK`, user profile JSON. Without token, expect `401`.  



2\. \*\*Protected Endpoints:\*\* (Use above token in header)  

&#x20;  - \*\*GET /api/users/:id (Own account):\*\* Valid ID=own. Expect `200`, JSON with profile.  

&#x20;  - \*\*GET /api/users/:id (Other account):\*\* Using non-admin token. Expect `403 Forbidden` or `404`. Assert that BOLA is prevented.  

&#x20;  - \*\*PUT /api/users/:id:\*\* Update profile with `{ "name":"NewName" }`. Expect `200` and updated data. Invalid fields → `400`.  

&#x20;  

3\. \*\*Core API:\*\*  

&#x20;  - \*\*GET /api/venues:\*\* Expect `200`, array of venues. Assert `length > 0` (if seeded). Each item has `id, name`.  

&#x20;  - \*\*GET /api/venues/:id:\*\* Valid ID. Expect `200`. Invalid ID → `404 Not Found`.  

&#x20;  - \*\*GET /api/matches?date=2026-11-20:\*\* (example). Expect `200`, list of matches on that date. Assert each has `homeTeam, awayTeam, startTime`.  

&#x20;  - \*\*POST /api/assistant/query:\*\* Body `{ "question":"Where is Gate 12?" }`. Expect `200`, JSON `{ "answer": "...", "sources": \[...] }`. Assert answer is non-empty string.  

&#x20;    - \*\*Missing question:\*\* `{}`. Expect `400`.  

&#x20;    - \*\*Edge case:\*\* Very long question or with special chars (`DROP TABLE`). Expect `400` or sanitized handling.  



4\. \*\*Error \& Edge Cases:\*\*  

&#x20;  - \*\*Invalid JSON:\*\* Send malformed body to any POST (e.g. `/auth/login`). Expect `400` with parse error.  

&#x20;  - \*\*Large Payload:\*\* Try a 100KB JSON. Expect `413 Payload Too Large` or similar (if body limit set).  

&#x20;  - \*\*Concurrency:\*\* Simulate 10 parallel `GET /api/matches`. Ensure no errors (e.g. DB pool exhaustion).  

&#x20;  - \*\*Rate limiting:\*\* Fire >10 quick `/api/auth/login` attempts. Expect throttle message after limit (if implemented).  



5\. \*\*Security Tests:\*\*  

&#x20;  - \*\*SQL/Injection:\*\* Use `{"email":"test',' ' OR '1'='1", "password": "x"}`. Should not bypass login; expect `401`.  

&#x20;  - \*\*XSS:\*\* If any endpoint returns user-supplied content, try `<script>` in inputs. Expect it to be escaped or rejected.  

&#x20;  - \*\*Auth bypass:\*\* Attempt `GET /api/users/1` without token. Expect `401`.  



6\. \*\*Live Feature Tests:\*\*  

&#x20;  - \*\*Real-time Score:\*\* If there's an endpoint (e.g. `GET /api/matches/:id/score`), test that. Use a known match ID, expect score fields.  

&#x20;  - \*\*Socket Test (if any):\*\* Not testable via Thunder, but ensure other means are documented.  



For each test, include assertions (Thunder has a test tab; pseudocode): e.g. `pm.response.to.have.status(200)`, `pm.expect(json.answer).to.not.be.empty`, `pm.expect(token).to.match(/^eyJ/)` etc. Document the collection steps in README (or share a `.json` collection file).



\## V2 Feature Ideas \& Competitor Analysis  



To boost user value and market fit, consider these high-impact enhancements, inspired by competitor apps and hackathon peers:



\- \*\*Offline/Low-Connectivity Mode:\*\* Download venue maps and basic info ahead of time so the assistant works without internet. Moin’s post mentions \*“fallback offline mode”\*; ensure it’s implemented (e.g. cache static data, use client-side service workers). Improves reliability and user experience in crowded venues. (Effort: \*\*Medium\*\* – caching \& service worker)  

\- \*\*Indoor Navigation \& AR Maps:\*\* Integrate 3D floor plans of stadiums for step-free routing (ramps, elevators). For example, one project built \*“AR \& 3D spatial maps”\* to guide fans. PitchSide could use Mapbox indoor maps or Apple/Google venue maps. This significantly improves accessibility. (Effort: \*\*Large\*\* – obtain maps or manually input them)  

\- \*\*Multi-language \& Accessibility:\*\* Support more languages and comply with WCAG. Moin already has 7 languages; extend to all official FIFA languages. Add TTS output and high-contrast UI for visually impaired (as hackathon projects did). (Effort: \*\*Medium\*\*)  

\- \*\*Gamification \& Community:\*\* Add trivia or rewards (e.g. local geography quizzes). Ujjwal’s “Fan Quest Trophy Hunt” used AI-generated local trivia for engagement. A leaderboard or badge system (see Ujjwal’s digital badges) can boost retention. (Effort: \*\*Large\*\*)  

\- \*\*Event \& City Guide:\*\* Incorporate local events, restaurants, transit status. The official FIFA app offers \*city activities and local content\*. PitchSide could recommend nearby cafes or events based on location. (Effort: \*\*Medium\*\*)  

\- \*\*Personalization:\*\* Allow users to favorite teams or matches, and push notifications for their schedule (as the FIFA app does for favorite teams). Also save past queries for quick access. (Effort: \*\*Medium\*\*)  

\- \*\*AI-powered Predictions \& Stats:\*\* Provide match predictions or stats (Goal expectancy, etc.) using ML (an exciting but complex addition). Many sports apps (OneFootball, FotMob) provide live analytics. (Effort: \*\*Large\*\*)  

\- \*\*Chatbot UI \& Voice:\*\* Develop a chat interface (web/mobile) for the assistant, possibly with voice input. Accessibility hackathons created voice assistants; adding a Slack/WhatsApp channel could extend reach. (Effort: \*\*Medium\*\*)  

\- \*\*Ticketing Integration:\*\* Integrate with official ticketing (e.g. link FIFA ticket app) or allow storing QR codes. The official app links the Ticket app. This adds convenience. (Effort: \*\*Medium\*\*)  

\- \*\*Live Social Feed:\*\* Stream relevant social media (like team hashtags), moderated for language. Not directly in hackathon posts, but many fan apps have a live news feed. (Effort: \*\*Small\*\*)  



These features align with industry trends: official sport event apps focus on planning (calendars, maps), engagement (games, rewards), and inclusivity (multi-language, disability access). Adding them would demonstrate product maturity and breadth on your resume.



\*\*Competitor Feature Comparison:\*\*  



| Feature                | FIFA Official App  | PitchSide (current)     | PitchSide V2 Proposed  |

|------------------------|-----------------------------------------------|-------------------------|------------------------|

| Live Scores/Stats      | ✔ (live data, standings)                      | Partial (via AI or DB)  | ✔ (improve caching)    |

| Schedule/Planner       | ✔ (calendar view, alerts)                    | Limited                | ✔ (add favorites/alerts)|

| Stadium Navigation     | ✔ (3D maps, arrival info)      | AI chat only           | ✔ (add offline AR maps) |

| Localization           | ✔ (supports multiple languages) | ✔ (7 languages)        | ✔ (add more l10n)      |

| Accessibility         | Not fully known (some UI design)             | Some focus (accessibility prompts) | ✔ (WCAG compliance)    |

| Local Content         | ✔ (cities, restaurants, fan festivals) | None              | ✔ (geofenced tips)     |

| Gamification         | ✔ (Fantasy, Bracket, Predictor) | No                     | ✔ (trivia, rewards)    |

| Community/Chat       | ✘ (officially no public chat)                | ✔ (AI chat interface)   | ✔ (extend to community Q\&A) |

| Offline Mode          | ✘                                           | Partial (claimed)       | ✔ (improve caching)    |

| Real-time Transit     | ✘ (not mentioned)                            | Planned (via AI)       | ✔ (live bus/train info)|

| Development Workflow | Unknown                                     | N/A (no CI)            | ✔ (add CI/CD pipeline) |



\*\*Roadmap (3 months):\*\* Implement top-priority V2 features in phases:



```mermaid

gantt

&#x20;   title PitchSide V2 Roadmap (Sep–Nov 2026)

&#x20;   dateFormat  YYYY-MM-DD

&#x20;   section Core Infrastructure

&#x20;   CI/CD Pipeline Setup           :done,   ci,   2026-09-01, 14d

&#x20;   Automated Testing (unit/integration):active, test, 2026-09-15, 14d

&#x20;   Dockerfile Hardening           :done,   doc,  2026-09-01, 7d

&#x20;   section User Features

&#x20;   Offline Data Caching           :active, cache, 2026-09-20, 21d

&#x20;   Multi-language Expansion       :        i18n,  2026-09-20, 14d

&#x20;   AR/Indoor Maps Integration     :crit,   map,   2026-10-01, 30d

&#x20;   Favorites \& Notifications      :        fav,   2026-10-10, 14d

&#x20;   section Engagement Features

&#x20;   Gamification (Trivia/Badges)   :crit,   game,  2026-10-20, 21d

&#x20;   Local Events \& Attractions     :        loc,   2026-10-25, 14d

&#x20;   Voice Chat Interface           :        voice, 2026-11-05, 14d

&#x20;   section Reliability Improvements

&#x20;   Rate Limiting \& Throttling     :done,   ratel, 2026-09-05, 7d

&#x20;   Data Validation (Zod/Joi)      :done,   val,   2026-09-01, 10d

&#x20;   Analytics \& Logging Upgrade    :        log,   2026-11-01, 14d

```



\*(Colors: completed=green, in-progress=blue, critical=red.)\*



\## CI/CD Pipeline \& Dockerfile Improvements  



\*\*GitHub Actions:\*\* Use a CI workflow that runs on every push/PR. Steps: checkout code, set up Node 18, install deps (`npm ci`), run lint, type-check, tests. On `main` push, deploy to production (e.g. Vercel or container registry). Example config (YAML) can be based on guides. Key snippet:  



```yaml

name: CI

on: \[push, pull\_request]

jobs:

&#x20; build:

&#x20;   runs-on: ubuntu-latest

&#x20;   strategy:

&#x20;     matrix: { node-version: \[18.x] }

&#x20;   steps:

&#x20;     - uses: actions/checkout@v3

&#x20;     - uses: actions/setup-node@v3

&#x20;       with: { node-version: ${{ matrix.node-version }} }

&#x20;     - run: npm ci

&#x20;     - run: npm run lint   # ESLint

&#x20;     - run: npm test      # Jest tests

&#x20;     - run: npm run build # Next.js build

&#x20;     - run: npm audit --audit-level=high

&#x20;     - name: Deploy

&#x20;       if: github.ref == 'refs/heads/main'

&#x20;       run: |

&#x20;         npm run deploy:prod  # e.g. push Docker image or trigger Vercel

```



Citing \[43] emphasizes automating build/test/deploy without external services. (Optional: add a badge in README.)



\*\*Dockerfile:\*\* Use a multi-stage build. For example (comments inline):  



```dockerfile

\# Stage 1: build

FROM node:lts-alpine as builder   # small base

WORKDIR /app

COPY package\*.json ./

RUN npm ci  # installs dev \& prod by default

COPY . .

RUN npm run build



\# Stage 2: production image

FROM node:lts-alpine

WORKDIR /app

\# Only copy built assets and prod deps

COPY --from=builder /app/package\*.json ./

RUN npm ci --omit=dev  # install only production deps

COPY --from=builder /app/.next ./.next

COPY --from=builder /app/public ./public

\# Security: use a non-root user

RUN addgroup -S appgroup \&\& adduser -S appuser -G appgroup

USER appuser

ENV NODE\_ENV production  # optimize libraries

CMD \["npm", "start"]

```



Key best practices from \[47]: use specific tags (here `lts-alpine`), omit dev deps, and set `NODE\_ENV=production`. Also, \*\*pin\*\* to a digest or version lock (e.g. `node@sha256:...` for reproducibility). Avoid running as root (create `appuser`). This yields smaller images and fewer vulnerabilities.



\*\*Additional Notes:\*\* Ensure `.dockerignore` excludes `node\_modules`, `.git`, logs. Use multi-stage to strip dev tools (e.g. no `node-gyp` at runtime). Scan the final image with tools like `Trivy` for known issues before deployment.



\---



\*\*Sources:\*\* We referenced industry best practices and official guidelines: OWASP Node.js security tips, portfolio advice from Intuit and Refactor Talent, GitHub Actions CI/CD guides, FIFA app feature lists, and Docker/Node security recommendations. These were applied to evaluate and suggest improvements comprehensively.

