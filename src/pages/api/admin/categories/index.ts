import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { createCategory } from '../../../../lib/db';
import { slugify } from '../../../../lib/slug';

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const name = String(form.get('name') ?? '').trim();
  const rawSlug = String(form.get('slug') ?? '').trim();
  const iconUrl = String(form.get('icon_url') ?? '').trim();
  const sortOrder = Number(form.get('sort_order') ?? 0);

  if (!name) {
    return redirect('/admin/categories/new?error=' + encodeURIComponent('Name is required.'));
  }

  try {
    await createCategory(env.DB, {
      name,
      slug: rawSlug || slugify(name),
      iconUrl: iconUrl || null,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0
    });
  } catch {
    return redirect('/admin/categories/new?error=' + encodeURIComponent('That slug is already taken.'));
  }

  return redirect('/admin/categories');
};
