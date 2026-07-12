-- Individual pets are unique animals, but admin still needs a visible number
-- (usually 1) that decrements to 0 and auto-hides the listing when sold.
ALTER TABLE pets ADD COLUMN stock_count INTEGER DEFAULT 1;

-- Non-pet inventory (food, treats, toys, accessories) -- mirrors the
-- categories/pet_types/pets pattern, but for consumable goods with real
-- quantities rather than unique named animals.
CREATE TABLE product_types (
  id INTEGER PRIMARY KEY,
  category_id INTEGER REFERENCES categories(id),
  name TEXT NOT NULL,          -- "Food", "Treats", "Toys", "Accessories"
  slug TEXT UNIQUE NOT NULL
);

CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  category_id INTEGER REFERENCES categories(id),
  product_type_id INTEGER REFERENCES product_types(id),
  price_cents INTEGER NOT NULL,
  description TEXT,
  photo_url TEXT,
  stock_count INTEGER DEFAULT 0,
  featured INTEGER DEFAULT 0,
  in_stock INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
