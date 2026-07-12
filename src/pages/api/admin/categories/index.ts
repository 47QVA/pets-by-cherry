import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { createCategory } from '../../../../lib/db';
import { slugify } from '../../../../lib/slug';
import { resolvePhotoUrl } from '../../../../lib/upload';

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const name = String(form.get('name') ?? '').trim();
  const rawSlug = String(form.get('slug') ?? '').trim();
  const sortOrder = Number(form.get('sort_order') ?? 0);

  if (!name) {
    return redirect('/admin/categories/new?error=' + encodeURIComponent('Name is required.'));
  }

  const photo = await resolvePhotoUrl(env.DB, form, null);
  if ('error' in photo) {
    return redirect('/admin/categories/new?error=' + encodeURIComponent(photo.error));
  }

  try {
    await createCategory(env.DB, {
      name,
      slug: rawSlug || slugify(name),
      iconUrl: photo.url,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0
    });
  } catch {
    return redirect('/admin/categories/new?error=' + encodeURIComponent('That slug is already taken.'));
  }

  return redirect('/admin/categories');
};
