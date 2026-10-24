# New Prime - AI intake upgrade

React, Vite, Motion, and Vercel serverless functions.

Open [AI-SETUP.md](AI-SETUP.md) for installation, environment variables, webhook delivery requirements, and launch checks.

## Verification in this environment

- Nine Node tests passed for recommendations, validation, consent, image inputs, API configuration, AI payloads and lead delivery.
- The complete local JSX/CSS dependency graph compiled successfully with esbuild (third-party packages external).
- A full Vite production build and browser layout review were not completed: required dependencies were not cached and external package downloads were unavailable.
- Live OpenAI calls and real lead delivery were not exercised. They require your API key and delivery endpoint.
- The existing Vercel deployment and GitHub repository have not been changed.

The code is prepared for integration; complete the configuration and launch checks before publishing it to customers.
