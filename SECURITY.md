# Security policy

## Supported versions

This project is a personal, unofficial fan adaptation. Security reports are accepted against the default branch (`main`).

## Reporting a vulnerability

Do **not** open a public issue for a suspected vulnerability.

Preferred path:

1. GitHub **Security** tab → **Report a vulnerability** (private advisory), if that button is available on this repo.
2. Otherwise, contact the maintainer via GitHub: [@tuirk](https://github.com/tuirk).

Please include:

- What you found and how to reproduce it
- Affected files / endpoints if you know them
- Whether you have a suggested fix

You should get an acknowledgement within a few days. If the report is valid, we will work on a fix before any public write-up.

## What is in scope

- Auth bypass, account takeover, or data exposure in this app
- Secrets committed to the repo
- Dependency or supply-chain issues in this codebase
- XSS / injection in the Next.js app

## What is out of scope

- The physical TINYforming Mars game or BoardGameGeek
- Firebase / Google platform issues (report those to Google)
- Social engineering or physical attacks
- Automated scanner dumps with no demonstrated impact

## Known dependency advisories

`npm audit` does not come back clean here, and cannot be made to right now.
Every advisory that has an upstream patch is taken — see the `overrides`
block in `package.json`. Five remain. All five are transitive under Genkit,
and all five are accepted deliberately rather than overlooked.

**Four OpenTelemetry advisories** — `@opentelemetry/core` (moderate, unbounded
memory in W3C baggage propagation), `@opentelemetry/propagator-jaeger` (high,
DoS on a malformed header), `@opentelemetry/sdk-node` and
`@opentelemetry/auto-instrumentations-node` (high, Prometheus exporter crash).

`@genkit-ai/core` pins `@opentelemetry/core` at `~1.25.0` and
`@opentelemetry/sdk-node` at `^0.52.0`. The patched releases are `2.8.0` and
`0.217.0` — a major-version jump across an API break. Genkit `1.42.0`, the
latest release at the time of writing, still pins the same ranges, so there is
no Genkit to upgrade to. Forcing an override would put Genkit's core on an
OpenTelemetry API it was not written against, and Genkit is the AI opponent —
the feature most worth not breaking.

None of the vulnerable paths run in this app. `src/ai/genkit.ts` configures
the `googleAI()` plugin and nothing else; no code calls
`enableFirebaseTelemetry()` or `enableGoogleCloudTelemetry()`. Reaching these
bugs needs a live Prometheus exporter endpoint, an active `JaegerPropagator`
parsing `uber-trace-id` headers, or baggage-header processing. The app starts
none of them.

**`extract-zip` (high, symlink path traversal).** No patched version exists at
any release — the advisory range is `<= 2.0.1` with no fix published. It
arrives via `genkit-cli`, a devDependency used only by `npm run genkit:dev`,
so it never reaches a build. Exploiting it means feeding a hand-crafted zip to
your own local dev tooling.

Revisit when Genkit relaxes its OpenTelemetry pin, or when `extract-zip` ships
a fix. At that point drop the exception and take the upgrade.

## Secrets

Never commit `.env`, `.env.local`, Firebase Admin keys, or `GOOGLE_GENAI_API_KEY`.
Use `.env.example` as the template only.

Firebase **web** config (`NEXT_PUBLIC_FIREBASE_*`) is client-side by design. Restrict it in the Firebase console (HTTP referrers / authorized domains), and keep Firestore / Auth rules tight. Do not treat the web API key as a server secret.

Optional: set `NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY` and turn on App Check enforcement for Auth/Firestore in the Firebase console.

Gemini server actions require a verified Firebase ID token from a Google or email account (not guest).

If a secret ever lands in git history, rotate it even after the file is removed.
