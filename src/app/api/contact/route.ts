import { NextResponse, type NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// In-memory rate limiting — 5 requests per IP per hour.
// Resets on server restart. For production scale, replace with Redis/Upstash.
// ---------------------------------------------------------------------------

interface RateLimitEntry {
  count: number;
  resetAt: number; // epoch ms
}

const rateLimitMap = new Map<string, RateLimitEntry>();

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now >= entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, retryAfter: 0 };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count += 1;
  return { allowed: true, retryAfter: 0 };
}

// Clean up expired entries hourly to prevent memory growth
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now >= entry.resetAt) rateLimitMap.delete(ip);
  }
}, RATE_LIMIT_WINDOW_MS);

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

interface ContactPayload {
  name: string;
  email: string;
  inquiryType: string;
  subject?: string;
  message: string;
}

const VALID_INQUIRY_TYPES = ["general", "tasting", "wholesale", "visit", "other"];

function validatePayload(
  body: unknown,
): { valid: true; data: ContactPayload } | { valid: false; errors: string[] } {
  const errors: string[] = [];

  if (!body || typeof body !== "object") {
    return { valid: false, errors: ["Invalid request body."] };
  }

  const b = body as Record<string, unknown>;
  const name = typeof b.name === "string" ? b.name.trim() : "";
  const email = typeof b.email === "string" ? b.email.trim() : "";
  const inquiryType = typeof b.inquiryType === "string" ? b.inquiryType.trim() : "";
  const subject = typeof b.subject === "string" ? b.subject.trim() : "";
  const message = typeof b.message === "string" ? b.message.trim() : "";

  if (!name || name.length > 100) errors.push("Name is required (max 100 chars).");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)
    errors.push("Valid email is required.");
  if (!VALID_INQUIRY_TYPES.includes(inquiryType)) errors.push("Invalid inquiry type.");
  if (subject.length > 200) errors.push("Subject max 200 chars.");
  if (!message || message.length < 10) errors.push("Message required (min 10 chars).");
  if (message.length > 5000) errors.push("Message max 5000 chars.");

  if (errors.length > 0) return { valid: false, errors };

  return {
    valid: true,
    data: { name, email, inquiryType, subject: subject || undefined, message },
  };
}

// ---------------------------------------------------------------------------
// POST /api/contact
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  // Resolve client IP from Vercel/standard proxy headers
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown";

  // Rate limit
  const rl = checkRateLimit(ip);
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  // Parse body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON." }, { status: 400 });
  }

  // Validate
  const result = validatePayload(body);
  if (!result.valid) {
    return NextResponse.json({ success: false, errors: result.errors }, { status: 422 });
  }

  const { name, email, inquiryType, subject, message } = result.data;

  // Log to server output (visible in Vercel Function logs and local dev)
  // TODO: replace with email service (Resend / SendGrid / Nodemailer + SMTP)
  console.log("[contact]", {
    name,
    email,
    inquiryType,
    subject,
    message: message.slice(0, 120),
  });

  return NextResponse.json({ success: true });
}
