-- Placeholder dev seed data. Brand-colored placehold.co images stand in for
-- real Pexels+R2 photos until a Pexels API key is available (CLAUDE.md §7).
-- Swapping in real photo_url values later needs no schema or code change.

INSERT INTO categories (name, slug, icon_url, sort_order) VALUES
  ('Dogs', 'dogs', 'https://placehold.co/480x600/A9C98E/22301D?text=Dogs', 1),
  ('Cats', 'cats', 'https://placehold.co/480x600/8B5E3C/FBF9F3?text=Cats', 2),
  ('Birds', 'birds', 'https://placehold.co/480x600/F0824A/22301D?text=Birds', 3);

INSERT INTO pet_types (category_id, name, slug) VALUES
  ((SELECT id FROM categories WHERE slug = 'dogs'), 'Golden Retriever', 'golden-retriever'),
  ((SELECT id FROM categories WHERE slug = 'dogs'), 'Beagle', 'beagle'),
  ((SELECT id FROM categories WHERE slug = 'cats'), 'Persian', 'persian'),
  ((SELECT id FROM categories WHERE slug = 'cats'), 'Siamese', 'siamese'),
  ((SELECT id FROM categories WHERE slug = 'birds'), 'African Grey Parrot', 'african-grey-parrot'),
  ((SELECT id FROM categories WHERE slug = 'birds'), 'Cockatiel', 'cockatiel');

INSERT INTO pets (
  name, category_id, pet_type_id, breed, sex, age_label, weight_label,
  vaccinated, price_cents, description, photo_url, featured, in_stock
) VALUES
  (
    'Luna',
    (SELECT id FROM categories WHERE slug = 'dogs'),
    (SELECT id FROM pet_types WHERE slug = 'golden-retriever'),
    'Golden Retriever', 'Female', '2 years', '28 kg', 1, 35000000,
    'Luna loves long walks and greets everyone like an old friend. Great with kids.',
    'https://placehold.co/600x600/A9C98E/22301D?text=Luna', 1, 1
  ),
  (
    'Max',
    (SELECT id FROM categories WHERE slug = 'dogs'),
    (SELECT id FROM pet_types WHERE slug = 'beagle'),
    'Beagle', 'Male', '1 year', '12 kg', 1, 18000000,
    'Max is curious, food-motivated, and always ready for the next adventure.',
    'https://placehold.co/600x600/6F9A55/FBF9F3?text=Max', 0, 1
  ),
  (
    'Coco',
    (SELECT id FROM categories WHERE slug = 'cats'),
    (SELECT id FROM pet_types WHERE slug = 'persian'),
    'Persian', 'Female', '3 years', '4 kg', 1, 15000000,
    'Coco is calm and affectionate, happiest curled up in a warm sunbeam.',
    'https://placehold.co/600x600/8B5E3C/FBF9F3?text=Coco', 0, 1
  ),
  (
    'Simba',
    (SELECT id FROM categories WHERE slug = 'cats'),
    (SELECT id FROM pet_types WHERE slug = 'siamese'),
    'Siamese', 'Male', '8 months', '3 kg', 0, 12000000,
    'Simba is playful and vocal, always the first to greet you at the door.',
    'https://placehold.co/600x600/A9C98E/22301D?text=Simba', 0, 1
  ),
  (
    'Kiki',
    (SELECT id FROM categories WHERE slug = 'birds'),
    (SELECT id FROM pet_types WHERE slug = 'african-grey-parrot'),
    'African Grey Parrot', 'Female', '1 year', '450 g', 1, 28000000,
    'Kiki is sharp and social, already picking up new words every week.',
    'https://placehold.co/600x600/F0824A/22301D?text=Kiki', 1, 1
  ),
  (
    'Sunny',
    (SELECT id FROM categories WHERE slug = 'birds'),
    (SELECT id FROM pet_types WHERE slug = 'cockatiel'),
    'Cockatiel', 'Male', '6 months', '90 g', 0, 4500000,
    'Sunny whistles along to music and loves company on your shoulder.',
    'https://placehold.co/600x600/8B5E3C/FBF9F3?text=Sunny', 0, 1
  );
