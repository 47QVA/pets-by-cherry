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

-- Simulated orders, for the admin "orders" view -- not tied to real payment
CREATE TABLE demo_orders (
  id INTEGER PRIMARY KEY,
  items_json TEXT NOT NULL,     -- snapshot of cart at "checkout"
  total_cents INTEGER NOT NULL,
  fake_delivery_address TEXT,
  fake_receipt_ref TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
