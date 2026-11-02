import { describe, it, expect, beforeAll } from "vitest";
import { encrypt, decrypt } from "./crypto";

beforeAll(() => {
  process.env.ENCRYPTION_KEY = "b5816153d1a9d5bc40fc89d933233a4f06befc47aed2bc077413ae50e500fbc1";
});

describe("crypto", () => {
  it("round-trips plaintext", () => {
    const plain = "hello secret token 123";
    expect(decrypt(encrypt(plain))).toBe(plain);
  });

  it("handles empty string", () => {
    expect(decrypt(encrypt(""))).toBe("");
  });

  it("handles unicode", () => {
    const plain = "tökën 🔐";
    expect(decrypt(encrypt(plain))).toBe(plain);
  });

  it("produces different ciphertexts for same plaintext (random IV)", () => {
    const a = encrypt("same");
    const b = encrypt("same");
    expect(a).not.toBe(b);
    expect(decrypt(a)).toBe("same");
    expect(decrypt(b)).toBe("same");
  });

  it("throws on tampered ciphertext", () => {
    const enc = encrypt("data");
    const buf = Buffer.from(enc, "base64");
    buf[buf.length - 1] ^= 0xff;
    expect(() => decrypt(buf.toString("base64"))).toThrow();
  });

  it("throws on invalid base64", () => {
    expect(() => decrypt("not-base64!!!")).toThrow();
  });

  it("throws in production without key", () => {
    const prev = process.env.NODE_ENV;
    const prevKey = process.env.ENCRYPTION_KEY;
    (process.env as any).NODE_ENV = "production";
    delete process.env.ENCRYPTION_KEY;
    expect(() => encrypt("x")).toThrow(/ENCRYPTION_KEY/);
    (process.env as any).NODE_ENV = prev;
    process.env.ENCRYPTION_KEY = prevKey;
  });
});