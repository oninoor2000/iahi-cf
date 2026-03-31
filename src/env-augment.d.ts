declare namespace NodeJS {
  interface ProcessEnv {
    SMTP_HOST?: string;
    SMTP_PORT?: string;
    SMTP_USER?: string;
    SMTP_PASS?: string;
    SMTP_FROM_NAME?: string;
    VITE_APP_URL?: string;
    VITE_BETTER_AUTH_URL?: string;
  }
}

export {};
