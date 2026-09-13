/* ===== api.js — every read/write call to the backend =====
   The only file that talks to Supabase (or whatever backend you use).
   Cache network responses here (e.g. localStorage + TTL) to protect free-tier
   egress limits — don't scatter fetch() calls across other files. */
