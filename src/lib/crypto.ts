import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALG = "aes-256-gcm";

function getKey(): Buffer {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    // fallback dev key (NOT for production)
    return Buffer.from("0".repeat(64), "hex");
  }
  return Buffer.from(hex, "hex");
}

export function encrypt(text: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALG, getKey(), iv);
  const enc = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

export function decrypt(b64: string): string {
  const buf = Buffer.from(b64, "base64");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const enc = buf.subarray(28);
  const decipher = createDecipheriv(ALG, getKey(), iv);
  decipher.setAuthTag(tag);
  return decipher.update(enc) + decipher.final("utf8");
}