import assert from "node:assert/strict";
import { test } from "node:test";
import { createResendPublicationEmailSender } from "../src/infrastructure/publication-email/resend-publication-email";
import { createPublicationEmailService } from "../src/application/publication-email/publication-email.service";
import type {
  PublicationEmail,
  PublicationEmailHistory,
  PublicationEmailRepository,
  PublicationEmailSender,
} from "../src/application/publication-email/publication-email.types";

function setup(send: PublicationEmailSender, kind: "published" | "invalid-link" = "published") {
  const records = new Map<string, PublicationEmailHistory & { authorId: number }>();
  const publication = { title: "Minha zine", slug: "minha-zine", sourceUrl: "https://example.org/old.pdf", authors: [{ id: 2, name: "Jo" }] };
  const repository: PublicationEmailRepository = {
    async publication() { return publication; },
    async history() { return [...records.values()].reverse(); },
    async reserve(_, authorId, message, attemptKey) {
      if (records.has(attemptKey) || [...records.values()].some((record) => !record.rejection)) {
        throw new Error("Já existe um envio");
      }
      records.set(attemptKey, { authorId, recipient: message.to, sentAt: null, message });
    },
    async reject(attemptKey, reason) {
      const record = records.get(attemptKey);
      assert.ok(record);
      record.rejection = reason;
    },
    async complete(attemptKey) {
      const record = records.get(attemptKey);
      assert.ok(record);
      record.sentAt = "2026-11-22T12:00:00Z";
      return record.sentAt;
    },
  };
  const service = createPublicationEmailService(repository, send, {
    from: "Biblioteca <zines@example.org>",
    replyTo: "reply@example.org",
    siteUrl: "https://example.org",
    signingKey: "test-key",
    adminId: "test-admin",
    kind,
  });
  return { service, publication };
}

test("requires the previewed recipient and content and reserves only one concurrent send", async () => {
  const messages: PublicationEmail[] = [];
  const { service, publication } = setup(async (message) => {
    messages.push(message);
    return { status: "accepted", id: "email-1" };
  });
  const address = "jo@example.org";
  const preview = await service.preview(1, 2, address);
  await assert.rejects(service.confirm(1, 2, "other@example.org", preview.token), /mensagem mudou/);
  publication.title = "Título corrigido";
  await assert.rejects(service.confirm(1, 2, address, preview.token), /mensagem mudou/);
  assert.equal(messages.length, 0);

  const current = await service.preview(1, 2, address);
  const results = await Promise.allSettled([
    service.confirm(1, 2, address, current.token),
    service.confirm(1, 2, address, current.token),
  ]);
  assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
  assert.deepEqual(messages, [current.message]);
  assert.deepEqual((await service.recipients(1)).authors[0].history, {
    recipient: address, sentAt: "2026-11-22T12:00:00Z", message: current.message, rejection: undefined,
  });
});

test("allows a retry after rejection and keeps a reservation after uncertain acceptance", async () => {
  let calls = 0;
  const { service } = setup(async () => {
    calls++;
    if (calls === 1) return { status: "rejected", reason: "recipient" };
    throw new Error("timeout");
  });
  const address = "jo@example.org";
  const { token } = await service.preview(1, 2, address);
  await assert.rejects(service.confirm(1, 2, address, token), /recusou/);
  assert.equal((await service.recipients(1)).authors[0].history?.rejection, "recipient");
  await assert.rejects(service.confirm(1, 2, address, token), /Já existe um envio/);
  const retry = await service.preview(1, 2, address);
  await assert.rejects(service.confirm(1, 2, address, retry.token), /sem confirmação/);
  const again = await service.preview(1, 2, address);
  await assert.rejects(service.confirm(1, 2, address, again.token), /Já existe um envio/);
  assert.equal(calls, 2);
  assert.equal((await service.recipients(1)).authors[0].history?.sentAt, null);
});

test("previews the submitted link and requires a fresh preview if that link changes", async () => {
  const messages: PublicationEmail[] = [];
  const { service, publication } = setup(async (message) => {
    messages.push(message);
    return { status: "accepted", id: "review-1" };
  }, "invalid-link");

  const address = "jo@example.org";
  const first = await service.preview(1, 2, address);
  assert.match(first.message.subject, /novo link/);
  assert.ok(first.message.text.includes(publication.sourceUrl));
  assert.equal(messages.length, 0);

  publication.sourceUrl = "https://example.org/replacement.pdf";
  await assert.rejects(service.confirm(1, 2, address, first.token), /mensagem mudou/);
  assert.equal(messages.length, 0);

  const current = await service.preview(1, 2, address);
  await service.confirm(1, 2, address, current.token);
  assert.deepEqual(messages, [current.message]);
});

test("never contacts Resend with an expired confirmation", async (t) => {
  const originalNow = Date.now();
  t.mock.method(Date, "now", () => originalNow);
  const send = t.mock.fn<PublicationEmailSender>();
  const { service } = setup(send);
  const address = "jo@example.org";
  const { token } = await service.preview(1, 2, address);
  t.mock.method(Date, "now", () => originalNow + 10 * 60_000);
  await assert.rejects(service.confirm(1, 2, address, token), /expirou/);
  assert.equal(send.mock.callCount(), 0);
});

test("passes the attempt key to Resend and leaves ambiguous responses for manual review", async (t) => {
  const attemptKey = "00000000-0000-0000-0000-000000000001";
  const message = {
    from: "zines@example.org", replyTo: "reply@example.org", to: "jo@example.org",
    subject: "Sua zine", text: "Olá!",
  };
  let status = 429;
  const fetchMock = t.mock.method(globalThis, "fetch", async (_url: Parameters<typeof fetch>[0], options?: RequestInit) => {
    assert.equal(new Headers(options?.headers).get("Idempotency-Key"), `biblioteca-publication/${attemptKey}`);
    return new Response(null, { status });
  });

  const send = createResendPublicationEmailSender("test-key");
  assert.deepEqual(await send(message, attemptKey), { status: "rejected", reason: "rate-limit" });
  status = 409;
  await assert.rejects(send(message, attemptKey), /não confirmou/);
  status = 503;
  await assert.rejects(send(message, attemptKey), /não confirmou/);
  assert.equal(fetchMock.mock.callCount(), 3);
});
