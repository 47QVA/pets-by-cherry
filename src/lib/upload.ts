const MAX_UPLOAD_BYTES = 1_000_000; // 1MB — D1 row-size friendly

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

/**
 * Resolves the photo for a category/pet/product form submission, in priority order:
 * 1. An uploaded file (`photo_file`) -> stored in `uploaded_images`, served via /api/images/{id}.
 * 2. A pasted URL or path (`photo_url`) -> used verbatim (any string, not just http(s) URLs).
 * 3. Neither provided -> falls back to the existing photo (edit) or null (create).
 */
export async function resolvePhotoUrl(
  db: D1Database,
  form: FormData,
  existingUrl: string | null
): Promise<{ url: string | null } | { error: string }> {
  const file = form.get('photo_file');

  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_UPLOAD_BYTES) {
      return { error: 'Image file is too large (max 1MB).' };
    }
    if (!file.type.startsWith('image/')) {
      return { error: 'Uploaded file must be an image.' };
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const result = await db
      .prepare('INSERT INTO uploaded_images (mime, data) VALUES (?, ?)')
      .bind(file.type, bytesToBase64(bytes))
      .run();

    return { url: `/api/images/${result.meta.last_row_id}` };
  }

  const url = String(form.get('photo_url') ?? '').trim();
  if (url) return { url };

  return { url: existingUrl };
}
