import { NextResponse } from "next/server";

export const SESSION_COOKIE_NAME = "lectunote_session";

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const encoder = new TextEncoder();

function getSessionSecret(): string {
  const configuredSecret = process.env.SESSION_SECRET?.trim();
  const secret = configuredSecret || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!secret || /your-|placeholder/i.test(secret) || secret.length < 32) {
    throw new Error(
      "Session signing requires SESSION_SECRET (at least 32 characters) or a valid SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  if (configuredSecret && configuredSecret.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters long.");
  }

  return secret;
}

async function getSigningKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(getSessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function fromHex(value: string): ArrayBuffer | null {
  if (!/^[0-9a-f]{64}$/i.test(value)) {
    return null;
  }

  const buffer = new ArrayBuffer(value.length / 2);
  const bytes = new Uint8Array(buffer);
  for (let index = 0; index < bytes.length; index++) {
    bytes[index] = Number.parseInt(value.slice(index * 2, index * 2 + 2), 16);
  }
  return buffer;
}

export async function createSessionToken(profileId: string): Promise<string> {
  if (!UUID_REGEX.test(profileId)) {
    throw new Error("Cannot create a session for an invalid profile ID.");
  }

  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = `${profileId}.${expiresAt}`;
  const signature = await crypto.subtle.sign(
    "HMAC",
    await getSigningKey(),
    encoder.encode(payload),
  );

  return `${payload}.${toHex(new Uint8Array(signature))}`;
}

export async function getSessionProfileId(
  token: string | undefined,
): Promise<string | null> {
  if (!token) {
    return null;
  }

  const [profileId, expiresAtText, signatureHex, ...extraParts] = token.split(".");
  const expiresAt = Number(expiresAtText);
  const signature = fromHex(signatureHex ?? "");
  const now = Math.floor(Date.now() / 1000);

  if (
    extraParts.length > 0 ||
    !UUID_REGEX.test(profileId ?? "") ||
    !Number.isSafeInteger(expiresAt) ||
    expiresAt <= now ||
    expiresAt > now + SESSION_TTL_SECONDS + 60 ||
    !signature
  ) {
    return null;
  }

  const payload = `${profileId}.${expiresAt}`;
  const isValid = await crypto.subtle.verify(
    "HMAC",
    await getSigningKey(),
    signature,
    encoder.encode(payload),
  );

  return isValid ? profileId : null;
}

export async function setSessionCookie(
  response: NextResponse,
  profileId: string,
): Promise<void> {
  response.cookies.set(SESSION_COOKIE_NAME, await createSessionToken(profileId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
