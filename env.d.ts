/// <reference types="@cloudflare/workers-types" />

interface CloudflareEnv {
  DB: D1Database;
  ODDS_API_KEY?: string;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends CloudflareEnv {}
  }
}

export {};
