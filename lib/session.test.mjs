// Run with: npm test
import assert from "node:assert/strict";
import { test } from "node:test";

process.env.SESSION_SECRET = "test-secret";
const { seal, unseal } = await import("./session.ts");

test("seal/unseal round-trips credentials", async () => {
  const creds = { username: "max", password: "pä$$:wort" };

  assert.deepEqual(await unseal(await seal(creds)), creds);
});

test("tampered, foreign or missing tokens are rejected", async () => {
  const token = await seal({ username: "max", password: "x" });
  const flipped = token.slice(0, -2) + (token.at(-2) === "A" ? "B" : "A");

  assert.equal(await unseal(flipped), null);
  assert.equal(await unseal("garbage"), null);
  assert.equal(await unseal(undefined), null);

  process.env.SESSION_SECRET = "other-secret";
  assert.equal(await unseal(token), null);
});
