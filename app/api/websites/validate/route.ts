
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/require-auth";

const websiteSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, "Website URL is required.")
    .max(2048, "Website URL is too long.")
    .transform((value) =>
      /^https?:\/\//i.test(value) ? value : `https://${value}`
    )
    .pipe(z.string().url("Enter a valid website URL.")),
});

function validatePublicWebsiteUrl(value: string) {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    return false;
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return false;
  }

  if (
    url.username ||
    url.password ||
    url.hostname === "localhost" ||
    url.hostname.endsWith(".localhost") ||
    url.hostname.endsWith(".local") ||
    url.hostname.endsWith(".internal") ||
    url.hostname.endsWith(".test")
  ) {
    return false;
  }

  const hostname = url.hostname.toLowerCase();

  if (
    hostname === "0.0.0.0" ||
    hostname === "::" ||
    hostname === "[::]" ||
    hostname.endsWith(".")
  ) {
    return false;
  }

  // Reject IP literals for now. DNS/IP-level protections will be
  // implemented before the server makes outbound requests.
  if (
    hostname.startsWith("[") ||
    /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname) ||
    /^[0-9.]+$/.test(hostname)
  ) {
    return false;
  }

  if (!hostname.includes(".")) {
    return false;
  }

  return true;
}

export async function POST(request: Request) {
  const session = await requireAuth();

  if (!session) {
    return NextResponse.json(
      { error: "You must sign in to use SiteFixer." },
      { status: 401 }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  const parsed = websiteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message ?? "Invalid website URL.",
      },
      { status: 400 }
    );
  }

  const url = new URL(parsed.data.url);

  if (!validatePublicWebsiteUrl(url.href)) {
    return NextResponse.json(
      {
        error:
          "Enter a public website hostname using HTTP or HTTPS. Local and IP-address targets are not allowed.",
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    valid: true,
    website: {
      url: url.origin,
      hostname: url.hostname,
    },
    message: "Website URL passed basic validation.",
  });
}
