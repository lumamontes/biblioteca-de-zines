import assert from "node:assert/strict";
import { test } from "node:test";
import { createPublicationEmailService } from "../src/application/publication-email/publication-email.service";
import type {
  PublicationEmail,
  PublicationEmailRepository,
  PublicationEmailSender,
} from "../src/application/publication-email/publication-email.types";

function setup(send: PublicationEmailSender, kind: "published" | "invalid-link" = "published") {
  let record: { author_id: number; recipient: string; sent_at: string | null } | undefined;
  const publication = { title: "Minha zine", slug: "minha-zine", sourceUrl: "https://example.org/old.pdf", authors: [{ id: 2, name: "Jo" }] };
  const repository: PublicationEmailRepository = {
    async publication() { return publication; },
    async history() { return record ? [record] : []; },
    async reserve(_, authorId, recipient) {
      if (record) throw new Error("Já existe um envio");
      record = { author_id: authorId, recipient, sent_at: null };
    },
    async release() { record = undefined; },
    async complete() {
      assert.ok(record);
      record.sent_at = "2026-11-22T12:00:00Z";
      return record.sent_at;
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
    recipient: address, sentAt: "2026-11-22T12:00:00Z",
  });
});

test("allows a retry after rejection and keeps a reservation after uncertain acceptance", async () => {
  let calls = 0;
  const { service } = setup(async () => {
    calls++;
    if (calls === 1) return { status: "rejected" };
    throw new Error("timeout");
  });
  const address = "jo@example.org";
  const { token } = await service.preview(1, 2, address);
  await assert.rejects(service.confirm(1, 2, address, token), /recusou/);
  assert.equal((await service.recipients(1)).authors[0].history, undefined);
  await assert.rejects(service.confirm(1, 2, address, token), /sem confirmação/);
  await assert.rejects(service.confirm(1, 2, address, token), /Já existe um envio/);
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
