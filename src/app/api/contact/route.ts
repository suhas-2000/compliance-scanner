import { NextRequest, NextResponse } from "next/server";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: { name?: string; email?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = (body.name || "").trim();
  const email = (body.email || "").trim();
  const message = (body.message || "").trim();

  if (!name) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
  }
  if (!message) {
    return NextResponse.json({ error: "Please enter a message." }, { status: 400 });
  }

  // NOTE: stub for the prototype. Wire this up to a real inbox
  // (e.g. forward via SendGrid/Postmark, or write to a support ticket system)
  // before relying on it in production.
  console.log(`[stub] Contact message from ${name} <${email}>: ${message}`);

  return NextResponse.json({
    ok: true,
    message: "Thanks for reaching out — this demo doesn't send messages yet, but in production this would reach our team directly.",
  });
}
