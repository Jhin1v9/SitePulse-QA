import { NextResponse } from "next/server";

interface ContactPayload {
  name: string;
  email: string;
  company: string;
  message: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parsePayload(body: unknown): ContactPayload | null {
  if (!isRecord(body)) return null;

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const company = typeof body.company === "string" ? body.company.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (name.length < 2) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  if (company.length < 2) return null;
  if (message.length < 30) return null;

  return { name, email, company, message };
}

async function forwardToWebhook(payload: ContactPayload) {
  const webhookUrl = process.env.CONTACT_WEBHOOK_URL;
  if (!webhookUrl) return;

  await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      source: "sitepulse-web-contact",
      submittedAt: new Date().toISOString(),
      payload,
    }),
    cache: "no-store",
  });
}

export async function POST(request: Request) {
  try {
    const payload = parsePayload(await request.json());
    if (!payload) {
      return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
    }

    try {
      await forwardToWebhook(payload);
    } catch {
      return NextResponse.json({ ok: false, error: "webhook_failed" }, { status: 502 });
    }

    return NextResponse.json({ ok: true, id: `${Date.now()}` }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }
}
