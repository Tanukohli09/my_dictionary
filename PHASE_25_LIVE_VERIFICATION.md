# Phase 25 — Live staging verification

Date: 2026-10-02

Status: hosted dictionary smoke verification passed; authenticated release acceptance is incomplete.

Ran the existing beta smoke contract against https://my-dictionary-staging.onrender.com with expected provider datamuse. It passed health/readiness, security/CORS checks, owl, apply, sesquipedalian, and the zzzzzzzzzz not-found case. Protected metrics were skipped because no metrics token was supplied. The health response recorded a previous fallback-provider error; successful primary lookups do not prove live fallback availability.

Strict release preflight failed because the local environment lacks Supabase public configuration, provider approval, and the production origin. The hosted health endpoint separately reports provider approval true; local and hosted configurations are distinct.

The local changes have not been pushed or deployed. The live smoke validates the currently hosted version, not this local candidate.

To finish: configure the intended Supabase project, apply its schema and account-deletion function, enable Google OAuth, supply public client configuration to the actual build, and run the two-account sign-in/sync/deletion matrix from Phase 15. Never provide private keys or passwords in chat. No live authenticated pass is claimed.
