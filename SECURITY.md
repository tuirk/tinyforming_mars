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

## Secrets

Never commit `.env`, `.env.local`, Firebase Admin keys, or `GOOGLE_GENAI_API_KEY`.
Use `.env.example` as the template only.

Firebase **web** config (`NEXT_PUBLIC_FIREBASE_*`) is client-side by design. Restrict it in the Firebase console (HTTP referrers / authorized domains), and keep Firestore / Auth rules tight. Do not treat the web API key as a server secret.

If a secret ever lands in git history, rotate it even after the file is removed.
