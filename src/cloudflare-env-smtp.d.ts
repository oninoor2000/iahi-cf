/** Merges optional SMTP vars from wrangler when not present in generated worker types. */
declare namespace Cloudflare {
  interface Env {
    SMTP_HOST?: string;
    SMTP_PORT?: string;
  }
}

export {};
