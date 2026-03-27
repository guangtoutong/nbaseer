/// <reference types="@cloudflare/workers-types" />

declare module "@cloudflare/next-on-pages" {
  export function getRequestContext(): {
    env: {
      DB: D1Database;
      ODDS_API_KEY?: string;
    };
    ctx: ExecutionContext;
    cf: IncomingRequestCfProperties;
  };
}
