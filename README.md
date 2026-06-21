# Go Business — Referral Dashboard

A responsive React single-page application for tracking referrals, earnings, and partner activity, built for the Go Business coding assessment.

## Overview

Users sign in with email and password, land on a protected referral dashboard, view overview metrics and service summary data pulled from an API, search/sort/paginate their referrals, share their referral link and code, and drill into individual referral detail pages.

## Tech Stack

- React 18 + Vite
- React Router (client-side routing)
- js-cookie (JWT session storage)
- Plain CSS (no UI framework)

The app consumes an existing hosted REST API for authentication and referral data — there is no custom backend or database in this repository.

## Getting Started

```bash
npm install
npm run dev      # starts local dev server
npm run build    # production build into dist/
npm run preview  # preview the production build
```

## Test Credentials

```
Email:    admin@example.com
Password: admin123
```

## Routes

| Route | Access | Description |
|---|---|---|
| `/login` | Public | Sign-in page; redirects to `/` if already authenticated |
| `/` | Protected | Referral dashboard (overview, service summary, share panel, referrals table) |
| `/referral/:id` | Protected | Detailed view of a single referral |
| `/dashboard/referrals` | Optional | Redirects to `/` |
| `*` | Public | 404 Not Found |

Protected routes redirect unauthenticated users to `/login`. The `*` route is intentionally not wrapped in the protected-route logic so it stays reachable without a token.

## Authentication Flow

1. **Sign in** — `POST` email and password to the sign-in endpoint. The JWT is read from `response.data.token`.
2. **Store the token** — saved in a `jwt_token` cookie via `Cookies.set('jwt_token', token)`.
3. **Reuse the token** — every referrals request reads the cookie via `Cookies.get('jwt_token')` and sends `Authorization: Bearer <jwt_token>`.
4. **Log out** — clears the `jwt_token` cookie and navigates back to `/login`.

On a failed login, the API's error message (e.g. "Invalid email or password") is shown on the login page; the Sign in button stays enabled regardless of field contents, so every click performs the request.

## Referrals API

All endpoints share one base URL with different query parameters, and all require the Bearer token:

| Purpose | Request |
|---|---|
| Full list (default) | `GET /api/referrals` |
| Search by name or service | `GET /api/referrals?search=<term>` (or `?q=<term>`) |
| Single referral by id | `GET /api/referrals?id=<id>` |
| Sort by date | `GET /api/referrals?sort=asc\|desc` (default `desc`) |

The API returns the full matching list for any given request — it does not paginate. Pagination (10 rows per page, Previous/Next, numbered pages) is handled entirely on the client from whatever array the API returns.

## Project Structure

```
src/
  api/client.js          # login + referrals API calls
  components/
    Navbar.jsx
    Footer.jsx
    ProtectedRoute.jsx
  pages/
    Login.jsx
    Dashboard.jsx
    ReferralDetail.jsx
    NotFound.jsx
  utils/format.js        # date (YYYY/MM/DD) and currency (USD) formatting
  App.jsx                # route definitions (BrowserRouter lives here)
  main.jsx                # renders <App /> only
  index.css               # global styles
```

## Accessibility

- Form labels wired to inputs via `htmlFor`/`id`
- Landmark `aria-label`s on the overview, service summary, and share sections
- Error/loading regions marked with `role="alert"` where appropriate
- Visible keyboard focus states throughout

## Notes

- Dates from the API (`YYYY-MM-DD`) are displayed as `YYYY/MM/DD`.
- Profit values are formatted as USD with no decimal digits (e.g. `$1,234`).
- If a referral id in the URL doesn't resolve to a row, the detail page falls back to a "Referral not found" state instead of crashing.