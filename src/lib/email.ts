import { waitUntil } from "cloudflare:workers";
import nodemailer from "nodemailer";

export type TransactionalEmailInput = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeHtmlAttr(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

function createTransport() {
  const host = process.env.SMTP_HOST ?? "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS?.replace(/\s/g, "");

  if (!user || !pass) {
    throw new Error("SMTP_USER and SMTP_PASS must be set to send email");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    connectionTimeout: 20_000,
    greetingTimeout: 20_000,
  });
}

function formatFromHeader(): string {
  const name = process.env.SMTP_FROM_NAME ?? "IAHI";
  const address = process.env.SMTP_USER ?? "";
  return `"${name}" <${address}>`;
}

export async function sendTransactionalEmail(
  input: TransactionalEmailInput,
): Promise<void> {
  const transport = createTransport();
  await transport.sendMail({
    from: formatFromHeader(),
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
  });
}

/**
 * Runs the send without blocking the auth response; keeps SMTP work alive on Workers via waitUntil.
 */
export function scheduleTransactionalEmail(task: () => Promise<void>): void {
  const promise = task().catch((err: unknown) => {
    console.error("[email] Transactional send failed:", err);
  });
  try {
    waitUntil(promise);
  } catch {
    void promise;
  }
}

export function buildVerifyEmailContent(args: {
  name: string;
  verifyUrl: string;
}): { text: string; html: string } {
  const safeName = escapeHtml(args.name);
  const text = `Hi ${args.name},

Please verify your email address for IAHI by opening this link:

${args.verifyUrl}

If you did not create an account, you can ignore this message.`;

  const html = `<p>Hi ${safeName},</p>
<p>Please verify your email address by clicking the link below:</p>
<p><a href="${escapeHtmlAttr(args.verifyUrl)}">Verify email</a></p>
<p style="color:#666;font-size:12px;">If you did not create an account, you can ignore this message.</p>`;

  return { text, html };
}
