# CLAUDE.md — Pets by Cherry

Project instructions for a **full-stack pet ecommerce demo** — dogs, cats, and a couple of exotics — with a real customer-facing store and a working admin backend. This file is the source of truth. Read it fully before writing code.

---

## 1. What we're building

A demo (not a real business) ecommerce site selling pets, built to show off full-stack skill: working storefront + working admin. Everything transactional — payment, receipt, delivery location — is **simulated**, but the CRUD, cart, and catalog are **real and functional**.

- **Brand name:** Pets by Cherry
- **Deploy target:** `pets.ebenezerafonja.com`, admin at `pets.ebenezerafonja.com/admin`
- **Repo suggestion:** `47QVA/pets-by-cherry` (private — see §10)
- **Infra:** Cloudflare end-to-end (Pages + Workers + D1 + R2), same publish flow (edit → `git push` → Cloudflare auto-build)
- **Cost constraint:** everything free-tier. No paid APIs, no real payment processor calls.

### Non-goals (v1)
- No real payments (Stripe/Paystack test-mode UI only, or a fully custom simulated flow — see §6).
- No persistent cart/orders across sessions — cart clears when the browser session ends, by design (no data hoarding for a demo).
- No real user accounts/auth for shoppers. Admin gets a simple password gate, not full auth infra.

---

## 2. Design direction

**Primary reference: "Pawsome" screenshot (strongest direction).** Soft, warm, organic pet-brand feel — sage green fields, big friendly pet photography, rounded cards, a clean category grid. Everything else takes cues only where it improves this, never competes with it.

### 2.1 Colour

```
--sage:        #A9C98E   /* primary brand green — Pawsome-derived      */
--sage-deep:   #6F9A55   /* darker green for text-on-light, CTAs       */
--cream:       #FBF9F3   /* card / page background                    */
--paw-brown:   #8B5E3C   /* warm accent — collars, price tags          */
--coral:       #F0824A   /* single high-energy accent — cart badge,    */
                          /* "Adopt/Buy" CTA — used sparingly           */
--ink:         #22301D   /* primary text                               */
--ink-soft:    #5C6B54   /* secondary text                             */
```

Backgrounds are soft and organic — never flat white. Use pale sage or cream fields with subtle blob/paw-print texture (low-opacity, decorative only, never busy).

### 2.2 Typography
- **Display / headings:** a rounded, friendly sans (e.g. **Fredoka** or **Baloo 2**) — echoes the reference wordmark's energy without being childish. Used for the "Pets by Cherry" logotype and with restraint elsewhere (headlines, section titles, price).
- **Body / UI:** a clean humanist sans (**Inter** or **Geist**) for everything else — readable, calm counterweight to the display face.
- Category cards, price tags: medium weight, generous corner radius (16–24px) matching the reference.

### 2.3 Layout cues taken from the other references
- **Pill-shaped category chips** (Dogs / Cats / Small Pets / Birds…) — from the filter-chip pattern across refs 3–4.
- **Rounded product cards** with photo bleeding to the card edge, price + heart/favourite icon overlay — consistent across all six refs, keep it.
- **Bottom tab bar** (Home / Categories / Search / Cart) for mobile — from ref 2.
- **Pet detail page**: hero photo, quick-fact pills (age, breed, weight, vaccinated), description, big CTA button at the bottom — synthesised from refs 3, 4, 5.

### 2.4 Motion
- Card entrance: gentle fade+rise, staggered.
- "Add to cart" — small bounce on the cart badge count (this is a *pet* store, a little playfulness earns its keep here, unlike a weather or finance app).
- Respect `prefers-reduced-motion`.

### 2.5 Signature element
**The category grid as a "meet the family" moment** — instead of generic icon tiles, each category (Dogs, Cats, Birds, Reptiles) is a big rounded photo card of a real animal, name overlaid, matching the Pawsome reference exactly. This *is* the personality of the site; keep everything else (checkout, admin) calm and functional by comparison.

---

## 3. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | **Astro** + Preact islands | Static shell, islands for cart/search/filter interactivity |
| Styling | Tailwind + small custom CSS for the organic/blob backgrounds | Speed + control where it matters |
| Backend | **Cloudflare Workers** (or Astro API routes deployed as Workers) | Serverless, free tier, same platform as frontend |
| Database | **Cloudflare D1** (SQLite) | Free, native to Workers, plenty for a demo catalog |
| Image storage | **Cloudflare R2** | Free tier; store the sourced pet photos here after import, don't hotlink forever |
| Admin auth | Single shared password → signed cookie/JWT checked in a Worker middleware | Enough for a demo; not multi-user auth |
| Cart/session | In-memory / `sessionStorage` only | No persistence by design — clears when the tab/session ends |

---

## 4. Data model (D1)

```sql
-- Dynamic taxonomy so admin can extend it without a redeploy
CREATE TABLE categories (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,          -- "Dogs", "Cats", "Birds", "Reptiles"
  slug TEXT UNIQUE NOT NULL,
  icon_url TEXT,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE pet_types (
  id INTEGER PRIMARY KEY,
  category_id INTEGER REFERENCES categories(id),
  name TEXT NOT NULL,          -- "Golden Retriever", "Persian", "African Grey"
  slug TEXT UNIQUE NOT NULL
);

CREATE TABLE pets (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,          -- individual pet's name, e.g. "Luna"
  category_id INTEGER REFERENCES categories(id),
  pet_type_id INTEGER REFERENCES pet_types(id),
  breed TEXT,
  sex TEXT,                    -- Male / Female
  age_label TEXT,               -- "3 years", "11 months"
  weight_label TEXT,
  vaccinated INTEGER DEFAULT 0, -- boolean
  price_cents INTEGER NOT NULL,
  description TEXT,
  photo_url TEXT,               -- R2 URL after import
  featured INTEGER DEFAULT 0,
  in_stock INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Simulated orders, for the admin "orders" view — not tied to real payment
CREATE TABLE demo_orders (
  id INTEGER PRIMARY KEY,
  items_json TEXT NOT NULL,     -- snapshot of cart at "checkout"
  total_cents INTEGER NOT NULL,
  fake_delivery_address TEXT,
  fake_receipt_ref TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

Admin can fully **create/edit/delete** rows in `categories`, `pet_types`, and `pets` — this is the "backend power" requirement. `demo_orders` is read-only in the admin (a log of simulated checkouts, useful to show the flow works end-to-end), and isn't shopper-identifying since there's no real account system.

---

## 5. Admin panel (`/admin`)

Password-gated (single shared password, env var, checked in Worker middleware — good enough for a demo, not production-grade auth).

**Screens:**
1. **Dashboard** — counts (pets, categories, simulated orders today), quick links.
2. **Categories** — list, create, edit, delete, reorder. Fields: name, slug (auto-generated, editable), icon/photo, sort order.
3. **Pet types** — list, create, edit, delete, scoped to a category. This is the "add new product type" power the client asked for.
4. **Pets** — full CRUD: name, category, type, breed, sex, age, weight, vaccinated toggle, price, description, photo (upload → R2, or paste URL), featured toggle, in-stock toggle.
5. **Simulated orders** — read-only feed of demo checkouts, so the client can demonstrate "yes, checkout actually writes to the database."

Admin UI reuses the same design tokens but is quieter/denser — a real back-office, tables + forms, not a pet-brand hero moment.

---

## 6. Simulated checkout flow

Fully functional UX, zero real money movement:

1. Cart (session-only) → **Checkout** page.
2. Fake delivery form: name, phone, a Nigerian address (state/LGA dropdowns using the same 36-states dataset pattern as Blue Sky Nigeria if useful) — not persisted beyond the order snapshot.
3. **Simulated payment step** — a clean "Pay with card" UI (styled like Paystack/Stripe's own checkout) that never touches a real gateway; on submit, wait ~1.5s (spinner), then succeed. Explicitly label it: *"Demo checkout — no real payment is processed."*
4. On success: write a row to `demo_orders`, show a **receipt** screen (order ref, items, fake delivery estimate), offer a "download receipt" (simple generated PDF or printable view is a nice full-stack touch, optional).
5. Cart clears. Session ends → nothing lingers.

No card details are ever collected in a real input — even fake ones — to avoid the appearance of asking for payment data (keeps this unambiguously a demo).

---

## 7. Image sourcing (free, no wasted quota)

Use the **Pexels API** — completely free, real search endpoint, no scraping, generous rate limits, no attribution required for use. Get a free API key at pexels.com/api and pull images at seed/import time rather than hand-picking URLs. This is more reliable than hotlinking specific stock pages by hand.

**10 demo pets — category, type, and a search query tuned for clean/plain-background results:**

| # | Category | Type / breed | Pexels search query |
|---|---|---|---|
| 1 | Dog | Golden Retriever | `golden retriever dog portrait` |
| 2 | Dog | Husky | `siberian husky portrait` |
| 3 | Dog | Poodle | `poodle dog portrait` |
| 4 | Dog | Beagle | `beagle dog portrait` |
| 5 | Dog | Shih Tzu | `shih tzu dog portrait` |
| 6 | Cat | Persian | `persian cat portrait` |
| 7 | Cat | British Shorthair | `british shorthair cat` |
| 8 | Cat | Siamese | `siamese cat portrait` |
| 9 | Bird | African Grey Parrot | `african grey parrot portrait` |
| 10 | Reptile | Ball Python | `ball python snake` |

**Import script approach:**
- Small Node/Worker script calls `GET https://api.pexels.com/v1/search?query=<query>&per_page=5&orientation=portrait`.
- Pick the top result with a plain/simple background (eyeball the first 2–3 candidates per query — Pexels ranks by relevance and often surfaces studio-style shots first for "portrait" queries).
- Download and re-upload into **R2** (don't hotlink Pexels URLs long-term — they can change/rate-limit; R2 makes it yours and fast via Cloudflare's edge).
- If a result still has a busy background, optionally run it through **remove.bg** — but only as a last resort per your instruction not to waste that quota, and only for the images that really need it.

This whole sourcing step happens once, at build/seed time — not a runtime dependency.

---

## 8. Feature scope (v1)

Must-have:
- [ ] Storefront: onboarding hero (Pawsome-style), category grid, category browse, pet detail page, cart, checkout, simulated payment, receipt.
- [ ] Admin: password gate, CRUD on categories, pet types, and pets; read-only simulated orders feed.
- [ ] 10 seeded demo pets across 4 categories (dogs, cats, birds, reptiles), sourced via Pexels + stored in R2.
- [ ] Session-only cart — verify it actually clears on session end.
- [ ] Mobile-first, responsive to desktop.
- [ ] Loading / empty / error states throughout (both storefront and admin).

Nice-to-have (defer):
- Search/filter by breed, price range, age.
- Downloadable PDF receipt.
- "Favourites" (heart icon) — session-only, matches the reference UI.

---

## 9. Suggested project structure

```
pets-ebenezerafonja/
├─ src/
│  ├─ pages/
│  │  ├─ index.astro
│  │  ├─ category/[slug].astro
│  │  ├─ pet/[id].astro
│  │  ├─ cart.astro
│  │  ├─ checkout.astro
│  │  └─ admin/
│  │     ├─ index.astro
│  │     ├─ categories.astro
│  │     ├─ pet-types.astro
│  │     ├─ pets.astro
│  │     └─ orders.astro
│  ├─ components/
│  │  ├─ CategoryCard.tsx
│  │  ├─ PetCard.tsx
│  │  ├─ CartDrawer.tsx
│  │  ├─ CheckoutForm.tsx
│  │  ├─ SimulatedPayment.tsx
│  │  └─ admin/ (Table, Form, AdminNav, etc.)
│  ├─ lib/
│  │  ├─ db.ts               # D1 query helpers
│  │  ├─ auth.ts              # admin password/session check
│  │  └─ cart.ts              # sessionStorage cart logic
│  └─ styles/tokens.css
├─ workers/
│  └─ api/                    # Worker routes: /api/pets, /api/categories, /api/checkout, /api/admin/*
├─ scripts/
│  └─ seed-images.ts          # Pexels import → R2, one-time seed script
├─ migrations/                # D1 schema (§4)
└─ astro.config.*
```

---

## 10. Repository policy (standing rule for all projects)

- **Main working repo is private** (`47QVA/pets-by-cherry`).
- Any version **shared publicly** (linked from the ebenezerafonja.com portfolio as a "built with AI" project) must **not** contain this `CLAUDE.md`, admin passwords/env values, or any personal data. Add `CLAUDE.md` and `.env*` to `.gitignore` on the public-facing copy, and audit before publishing that nothing internal leaked in.

---

## 11. Copy / voice

Warm but plain — this is a pet brand, not a hospital form. "Add to cart," "Buy now" (pick one verb and use it consistently — recommend **"Add to cart"** + **"Buy now"** since this is a store, not an adoption service, unless you want the adoption framing instead). Errors are still clear and blame-free even here: "Couldn't load pets. Try again." Sentence case, no filler.

---

## 12. Build order

1. D1 schema + migrations (§4).
2. Seed script: Pexels import → R2 → `pets`/`categories`/`pet_types` tables (§7).
3. Design tokens + one polished PetCard + CategoryCard before building breadth.
4. Storefront: home → category browse → pet detail.
5. Cart (session-only) + checkout form + simulated payment + receipt.
6. Admin: password gate, then Categories → Pet types → Pets CRUD, then Orders feed.
7. Mobile-first pass, then desktop re-flow.
8. A11y + reduced-motion + error/loading states pass.
9. Deploy to Cloudflare Pages/Workers on `pets.ebenezerafonja.com`.
10. Scrub + publish a public showcase copy per §10.

---

## 13. Definition of done
- Storefront feels like the Pawsome reference: warm, rounded, photo-forward, calm outside the category-grid signature moment.
- Admin can genuinely create a new category, a new pet type under it, and a new pet — end to end, no redeploy needed.
- Checkout flow is fully clickable and clearly labeled as simulated; nothing resembling a real payment field is collected.
- Cart/session data does not persist beyond the browser session.
- No API keys or secrets committed; public showcase repo is scrubbed per §10.
- Deployed and live on `pets.ebenezerafonja.com`.
