-- Adds the Fish category (+ pets) and a starter products catalog (food,
-- treats, accessories) alongside the existing pets-only catalog from
-- scripts/seed.sql. Real Pexels photos, no placeholders.

INSERT INTO categories (name, slug, icon_url, sort_order) VALUES
  ('Fish', 'fish', '/images/categories/fish.jpg', 4);

INSERT INTO pet_types (category_id, name, slug) VALUES
  ((SELECT id FROM categories WHERE slug = 'fish'), 'Tropical Fish', 'tropical-fish'),
  ((SELECT id FROM categories WHERE slug = 'fish'), 'Koi Fish', 'koi-fish');

INSERT INTO pets (
  name, category_id, pet_type_id, breed, sex, age_label, weight_label,
  vaccinated, price_cents, description, photo_url, featured, in_stock, stock_count
) VALUES
  (
    'Bubbles',
    (SELECT id FROM categories WHERE slug = 'fish'),
    (SELECT id FROM pet_types WHERE slug = 'tropical-fish'),
    'Tropical Fish', NULL, '3 months', '10 g', 0, 650000,
    'Bubbles is a hardy, easygoing community fish, happiest in a planted tank.',
    '/images/pets/bubbles.jpg', 0, 1, 1
  ),
  (
    'Finn',
    (SELECT id FROM categories WHERE slug = 'fish'),
    (SELECT id FROM pet_types WHERE slug = 'koi-fish'),
    'Koi Fish', NULL, '1 year', '200 g', 0, 2500000,
    'Finn is a calm, colorful koi that thrives in a well-kept pond.',
    '/images/pets/finn.jpg', 1, 1, 1
  );

INSERT INTO product_types (category_id, name, slug) VALUES
  ((SELECT id FROM categories WHERE slug = 'dogs'), 'Accessories', 'dog-accessories'),
  ((SELECT id FROM categories WHERE slug = 'dogs'), 'Treats', 'dog-treats'),
  ((SELECT id FROM categories WHERE slug = 'cats'), 'Treats', 'cat-treats'),
  ((SELECT id FROM categories WHERE slug = 'birds'), 'Accessories', 'bird-accessories');

INSERT INTO products (
  name, category_id, product_type_id, price_cents, description, photo_url,
  stock_count, featured, in_stock
) VALUES
  (
    'Anti-Chew Deterrent Spray',
    (SELECT id FROM categories WHERE slug = 'dogs'),
    (SELECT id FROM product_types WHERE slug = 'dog-accessories'),
    450000,
    'Alcohol-free spray that helps stop dogs chewing furniture, crates and cords.',
    '/images/products/anti-chew-spray.jpg', 25, 1, 1
  ),
  (
    'Salmon Joint Support Chews',
    (SELECT id FROM categories WHERE slug = 'dogs'),
    (SELECT id FROM product_types WHERE slug = 'dog-treats'),
    600000,
    'Tasty daily chews with salmon oil to support hips and joints.',
    '/images/products/salmon-joint-chews.jpg', 40, 0, 1
  ),
  (
    'Feline Wellness Chews',
    (SELECT id FROM categories WHERE slug = 'cats'),
    (SELECT id FROM product_types WHERE slug = 'cat-treats'),
    550000,
    'Everyday wellness chews cats actually want to eat.',
    '/images/products/feline-wellness-chews.jpg', 30, 0, 1
  ),
  (
    'Wild Bird Feeder',
    (SELECT id FROM categories WHERE slug = 'birds'),
    (SELECT id FROM product_types WHERE slug = 'bird-accessories'),
    800000,
    'Weatherproof hanging feeder that keeps seed dry and easy to refill.',
    '/images/products/wild-bird-feeder.jpg', 15, 1, 1
  );
