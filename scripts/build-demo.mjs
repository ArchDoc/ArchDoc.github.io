// Builds the landing page's demo from a real run of ArchDoc on a small shop:
// the brief an agent gets before it edits (archdoc context), the PR comment
// when its change sends shoppers' emails to an analytics tool (archdoc
// report), and the explorer opened on that change (archdoc site). Writes
// src/data/demo.ts, which the landing page imports, and static/demo/.
//
//   npm run demo                                  # with the CLI from npm
//   ARCHDOC="node ../archdoc/packages/cli/dist/bin.js" npm run demo
import { execSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

const site = new URL("..", import.meta.url).pathname;
// The newest release; the demo in the repo was built with the CLI that names data rules in a brief (after 0.3.0).
const archdoc = process.env.ARCHDOC ?? "npx -y @archdoc/cli@latest";
const repo = mkdtempSync(join(tmpdir(), "archdoc-demo-"));
const sh = (cmd) =>
  execSync(cmd, { cwd: repo, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
const git = (args) => sh(`git -c user.name=Demo -c user.email=demo@example.com ${args}`);
const write = (path, text) => {
  mkdirSync(dirname(join(repo, path)), { recursive: true });
  writeFileSync(join(repo, path), `${text.trim()}\n`);
};

const model = (analytics) => `
archdoc: "2.0"
namespace: shop
name: Online shop
description: Sells things to shoppers on the web.

actors:
  shopper:
    kind: person
    description: Someone buying from the shop.
    uses:
      web: { description: Browses and checks out, sends: CheckoutRequest }

elements:
  shop:
    kind: system
    description: Everything the shop runs.
    elements:
      web:
        kind: container
        technology: Next.js
        description: The storefront, cart, and checkout pages.
        code: apps/web/**
        uses:
          orders: { description: Places the order, sends: CheckoutRequest }
      orders:
        kind: container
        technology: Node.js
        description: Takes orders and charges for them.
        code: services/orders/**
        uses:
          db: { description: Saves orders, sends: Order }
          payments: { description: Charges the card, sends: Charge }${
            analytics
              ? `
          analytics:
            description: Tracks conversions
            sends: Order
            provenance: { source: suggested, by: agent:claude-code }`
              : ""
          }
      db:
        kind: datastore
        technology: Postgres
        code: services/orders/migrations/**
        stores:
          orders: { entity: Order, key: id }
  payments:
    kind: external
    description: The card processor.${
      analytics
        ? `
  analytics:
    kind: external
    description: A third-party analytics tool.
    provenance: { source: suggested, by: agent:claude-code }`
        : ""
    }

data:
  CheckoutRequest:
    kind: message
    fields:
      email: { type: string, classification: pii }
      total_cents: { type: int }
  Order:
    kind: entity
    fields:
      id: { type: string }
      email: { type: string, classification: pii }
      total_cents: { type: int }
      status: { type: enum, values: [placed, paid] }
  Charge:
    kind: message
    description: What the card processor needs. No email.
    fields:
      order_id: { type: string, references: Order }
      amount_cents: { type: int }

journeys:
  check-out:
    actor: shopper
    goal: Buy what's in the cart
    importance: critical
    steps:
      - { from: shopper, to: web, action: Clicks "Place order", code: apps/web/app/checkout/page.tsx }
      - { from: web, to: orders, action: Sends the cart, code: services/orders/src/place-order.ts }
      - from: orders
        to: db
        action: Saves the order
        code: services/orders/src/place-order.ts
        creates: { Order: { id: order-1, status: placed } }
      - { from: orders, to: payments, action: Charges the card, code: services/orders/src/charge.ts }
      - from: orders
        to: db
        action: Marks it paid
        code: services/orders/src/place-order.ts
        changes: { Order.status: placed -> paid }

rules:
  - id: no-personal-data-out
    description: Shoppers' personal data stays in the shop.
    data: { classification: pii, not-sent-to: { kind: external } }
`;

try {
  git("init -q -b main");
  write(".archdoc/archdoc.yaml", model(false));
  write("package.json", JSON.stringify({ name: "shop", private: true, workspaces: ["apps/*", "services/*"] }));
  write("apps/web/package.json", JSON.stringify({ name: "@shop/web" }));
  write(
    "apps/web/app/checkout/page.tsx",
    `
export default function CheckoutPage() {
  return <form action="/api/orders">Place order</form>;
}`,
  );
  write("services/orders/package.json", JSON.stringify({ name: "@shop/orders" }));
  write(
    "services/orders/src/place-order.ts",
    `
import { chargeCard } from "./charge";
import { saveOrder, markPaid } from "./store";

export async function placeOrder(cart: { email: string; totalCents: number }) {
  const order = await saveOrder({ email: cart.email, totalCents: cart.totalCents, status: "placed" });
  await chargeCard(order.id, cart.totalCents);
  return markPaid(order.id);
}`,
  );
  write(
    "services/orders/src/charge.ts",
    `
export async function chargeCard(orderId: string, amountCents: number) {
  return fetch("https://payments.example.com/charges", {
    method: "POST",
    body: JSON.stringify({ order_id: orderId, amount_cents: amountCents }),
  });
}`,
  );
  write(
    "services/orders/src/store.ts",
    `
export async function saveOrder(order: { email: string; totalCents: number; status: string }) {
  return { id: "order-1", ...order };
}
export async function markPaid(id: string) {
  return { id, status: "paid" };
}`,
  );
  write("services/orders/migrations/001_orders.sql", "CREATE TABLE orders (id text primary key, email text, total_cents int, status text);");
  git("add -A");
  git("commit -q -m shop");

  const task = "send each placed order to our analytics tool to track conversions";
  const brief = sh(`${archdoc} context "${task}"`);

  // What the agent wrote: the call, and the model edited with the code.
  git("checkout -q -b track-conversions");
  write(
    "services/orders/src/analytics.ts",
    `
export async function trackConversion(order: { id: string; email: string; totalCents: number }) {
  await fetch("https://analytics.example.com/events", { method: "POST", body: JSON.stringify(order) });
}`,
  );
  write(
    "services/orders/src/place-order.ts",
    `
import { trackConversion } from "./analytics";
import { chargeCard } from "./charge";
import { saveOrder, markPaid } from "./store";

export async function placeOrder(cart: { email: string; totalCents: number }) {
  const order = await saveOrder({ email: cart.email, totalCents: cart.totalCents, status: "placed" });
  await chargeCard(order.id, cart.totalCents);
  await trackConversion(order);
  return markPaid(order.id);
}`,
  );
  write(".archdoc/archdoc.yaml", model(true));
  git("add -A");
  git('commit -q -m "Track conversions in analytics"');

  let comment;
  try {
    comment = sh(`${archdoc} report --base main`);
  } catch (e) {
    comment = e.stdout;
  }
  mkdirSync(join(site, "src/data"), { recursive: true });
  writeFileSync(
    join(site, "src/data/demo.ts"),
    `// Written by scripts/build-demo.mjs (npm run demo). Don't edit by hand.\nexport const brief = ${JSON.stringify(brief)};\nexport const comment = ${JSON.stringify(comment)};\n`,
  );

  const demo = join(site, "static/demo");
  rmSync(demo, { recursive: true, force: true });
  sh(`${archdoc} site --base main --out ${demo}`);
  console.log("Wrote src/data/demo.ts and static/demo/.");
} finally {
  rmSync(repo, { recursive: true, force: true });
}
