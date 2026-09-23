# Ledgerly

Ledgerly is a production-style personal finance application for securely tracking income, expenses, monthly budgets, savings goals, and recurring commitments. It provides a responsive Obsidian & Warm Gold dashboard in full light and dark modes. All dashboard values are computed from each authenticated user's SQLite records—there is no seeded or hardcoded financial data.

## Features

- Email/password registration and login with bcrypt hashing
- Google Identity Services sign-in with server-side ID-token verification
- Bearer JWT authentication and protected React/API routes
- Strict per-user data isolation on every read, update, and delete
- Transaction CRUD, search, type/category/date filters, sorting, and notes
- Live totals, monthly cash flow, recent activity, and six-month Recharts chart
- Monthly category budgets with spent, remaining, percentage, and over-limit states
- Savings goals with progress and due dates
- Recurring bills, rent, subscriptions, and EMIs with active/inactive status
- Accessible responsive interface, validation, empty/loading/error states, and destructive-action confirmation
- Helmet, CORS allowlist, rate limiting, Zod validation, prepared SQL, and consistent errors
- Dockerized production builds, persistent SQLite storage, Nginx proxy/fallback, and GitHub Actions CI

## Stack and architecture

- **Client:** HTML5, React 18, Vite, Tailwind CSS, React Router, Recharts
- **API:** Node.js 20, Express, REST, Zod
- **Data:** SQLite with `better-sqlite3`; monetary values are stored as integer paise
- **Authentication:** bcrypt, signed JWTs, Google OAuth 2.0 / GIS ID tokens
- **Delivery:** Docker Compose, Nginx, GitHub Actions

```text
Browser → Nginx (:80/:443) → / static React SPA
                         └── /api → Express → persistent SQLite volume
```

The backend is not published to the host. Nginx is the only public application entry point.

## Repository layout

```text
ledgerly/
├── client/                 React/Vite application
├── server/                 Express API, schema, and tests
├── nginx/                  reverse proxy and SPA fallback
├── database/               ignored local database directory
├── .github/workflows/ci.yml
├── docker-compose.yml
├── Dockerfile              production client/Nginx image
├── .env.example
├── LICENSE
└── README.md
```

## Local installation

Requirements: Node.js 20+, npm, and native build tools required by `better-sqlite3`.

```bash
git clone https://github.com/ezzyAadii/Ledgerly.git
cd Ledgerly
cp .env.example .env
# Generate JWT_SECRET, then configure Google values as described below.
npm install
npm run dev
```

Client: `http://localhost:5173`; API: `http://localhost:3000`. Vite proxies `/api` in development. Create the local database directory if needed; the server creates its database and schema automatically.

Generate a secret without committing it:

```bash
openssl rand -base64 48
```

### Environment variables

| Variable | Required | Purpose |
|---|---:|---|
| `NODE_ENV` | Yes | `development`, `test`, or `production` |
| `PORT` | No | API port; defaults to `3000` |
| `DATABASE_PATH` | Yes | SQLite file path; Docker uses `/app/database/ledgerly.db` |
| `JWT_SECRET` | Yes | Random secret of at least 32 characters |
| `JWT_EXPIRES_IN` | No | JWT lifetime; defaults to `7d` |
| `CLIENT_URL` | Yes | Allowed CORS origin; comma-separate multiple origins |
| `GOOGLE_CLIENT_ID` | For Google | Google web OAuth client ID used for server verification |
| `GOOGLE_CLIENT_SECRET` | Reserved | Kept server-side for a future authorization-code flow; GIS ID-token login does not transmit or require it |
| `GOOGLE_CALLBACK_URL` | Documented | Approved application URL, e.g. local login page |
| `VITE_API_URL` | Local only | Browser API base; production uses `/api` |
| `VITE_GOOGLE_CLIENT_ID` | For Google | Same public client ID embedded into the client build |
| `DOMAIN` | Production | Your deployment domain for HTTPS setup |

Never put secrets in a `VITE_` variable. Vite variables are public browser configuration.

## Google OAuth setup

Ledgerly uses Google Identity Services to receive a signed ID token in the browser. The browser sends only that token to `POST /api/auth/google`; the server calls Google's verification library with the expected audience and validates the signature, audience, issuer, expiration, subject, and verified email. Existing accounts with the same verified email are safely linked instead of duplicated.

1. Open [Google Cloud Console](https://console.cloud.google.com/) and create/select a project.
2. Open **Google Auth Platform** (or **APIs & Services → OAuth consent screen**) and configure branding, audience, contact information, and test users when the app is in testing mode.
3. Open **Clients** (or **Credentials → Create credentials → OAuth client ID**).
4. Choose **Web application**.
5. Add local **Authorized JavaScript origins**: `http://localhost:5173`.
6. Add the production origin later: `https://your-domain.example`.
7. If Google requests redirect URIs, add the configured application location such as `http://localhost:5173/login` and the production equivalent. The GIS popup token flow primarily validates origins.
8. Copy the Client ID into both `GOOGLE_CLIENT_ID` and `VITE_GOOGLE_CLIENT_ID`. Keep any Client Secret only in the server-side `GOOGLE_CLIENT_SECRET`; do not expose it to React or commit it.
9. Restart/rebuild the application and test with a consent-screen test user.
10. Before production, update origins/URIs to the HTTPS domain and complete Google's publishing/verification requirements applicable to the chosen scopes. Ledgerly requests basic identity only.

## REST API

All responses use `{ "success": true, "data": ... }` or `{ "success": false, "error": { "code", "message", "details?" } }`. Private requests require `Authorization: Bearer <jwt>`. IDs supplied in URLs are always combined with the verified JWT user ID.

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Register with name, email, password |
| POST | `/api/auth/login` | Email/password login |
| POST | `/api/auth/google` | Verify Google credential and login/link |
| POST | `/api/auth/logout` | Client token-discard acknowledgement |
| GET | `/api/auth/me` | Current account |
| PUT | `/api/auth/profile` | Update display name |
| GET/POST | `/api/transactions` | Query/create transactions |
| GET/PUT/DELETE | `/api/transactions/:id` | Transaction detail/mutation |
| GET/POST | `/api/budgets` | List/create monthly budgets |
| PUT/DELETE | `/api/budgets/:id` | Update/delete budget |
| GET/POST | `/api/goals` | List/create savings goals |
| PUT/DELETE | `/api/goals/:id` | Update/delete goal |
| GET/POST | `/api/recurring` | List/create commitments |
| PUT/DELETE | `/api/recurring/:id` | Update/delete commitment |
| GET | `/api/dashboard` | Totals, chart, progress, and upcoming data |
| GET | `/api/health` | Health check |

Transaction queries support `search`, `type`, `category`, `startDate`, `endDate`, `sort`, and `order`. Budget queries support `month` and `year`.

## Testing and CI

```bash
npm run lint
npm test
npm run build
# or all checks:
npm run check
```

The Vitest/Supertest suite covers registration, login, JWT protection and tampering, duplicate accounts, CRUD, budgets, goals, commitments, dashboard arithmetic, and—critically—attempts by User B to read, modify, or delete User A's transaction. Google flow tests mock the provider boundary to verify safe account linking and rejection behavior without CI secrets; production tokens are verified by `google-auth-library`.

CI runs installation, lint, tests with coverage, the client build, Compose validation, and image builds without production credentials.

## Docker deployment

```bash
git clone https://github.com/ezzyAadii/Ledgerly.git
cd Ledgerly
cp .env.example .env
# Set a strong JWT_SECRET, CLIENT_URL, and Google IDs.
docker compose up -d --build
docker compose ps
curl http://localhost/api/health
```

SQLite lives in the named `ledgerly_data` volume and survives container recreation/restarts. Back it up before upgrades:

```bash
docker compose stop api
docker run --rm -v ledgerly_ledgerly_data:/data -v "$PWD":/backup alpine tar czf /backup/ledgerly-data.tgz -C /data .
docker compose start api
```

## HTTPS with Let's Encrypt

1. Point the domain's DNS A/AAAA records to the VPS and allow inbound ports 80 and 443.
2. Start the HTTP configuration and verify the domain reaches Ledgerly.
3. Mount `letsencrypt` at `/etc/letsencrypt` and `certbot_www` at `/var/www/certbot` on the `web` service, and expose `443:443`.
4. Obtain a certificate (replace placeholders):
   ```bash
   docker compose --profile https run --rm certbot certonly --webroot \
     --webroot-path /var/www/certbot -d YOUR_DOMAIN --email YOUR_EMAIL --agree-tos --no-eff-email
   ```
5. Replace `YOUR_DOMAIN` in `nginx/https.conf.example`, install it as `nginx/default.conf`, rebuild `web`, and set `CLIENT_URL=https://YOUR_DOMAIN` plus matching Google origins.
6. Schedule renewal, for example: `docker compose --profile https run --rm certbot renew && docker compose exec web nginx -s reload`.

Do not enable the HTTPS configuration before certificate files exist, or Nginx will fail safely at startup.

## Security notes

- Passwords use bcrypt cost 12 and never appear in logs or responses.
- JWTs use HS256 with an explicit algorithm and expiry. The selected bearer architecture stores the token in browser local storage; deploy a strict Content Security Policy and avoid third-party scripts beyond Google GIS. HttpOnly cookie sessions are preferable for higher-risk deployments.
- Google tokens are verified on the server; frontend identity fields are ignored.
- SQL uses prepared statements and whitelisted sort columns. SQLite foreign keys and indexes are enabled.
- Every financial query includes `user_id` from the verified JWT. Missing/inaccessible IDs return 404 to avoid record discovery.
- Helmet, request-size limits, an origin allowlist, auth rate limits, schema validation, generic production errors, and non-root API containers reduce attack surface.
- Run behind HTTPS, rotate exposed credentials, back up the database, update dependencies, and monitor logs without recording authorization headers.

## License

Public source, **All Rights Reserved**. See [LICENSE](LICENSE). Public visibility does not grant reuse, modification, or redistribution rights.
