-- Lets admin uploads store the actual file bytes in D1 (base64) instead of
-- requiring a URL. Works without R2/Cloudflare account access; swapping to a
-- real R2 write path later only changes resolvePhotoUrl's upload branch, not
-- the pets/products/categories schema.
CREATE TABLE uploaded_images (
  id INTEGER PRIMARY KEY,
  mime TEXT NOT NULL,
  data TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
