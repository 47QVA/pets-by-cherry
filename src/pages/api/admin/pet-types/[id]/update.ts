import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { updatePetType } from '../../../../../lib/db';
import { slugify } from '../../../../../lib/slug';

export const POST: APIRoute = async ({ params, request, redirect }) => {
  const id = Number(params.id);
  const form = await request.formData();
  const name = String(form.get('name') ?? '').trim();
  const rawSlug = String(form.get('slug') ?? '').trim();
  const categoryId = Number(form.get('category_id'));

  if (!name || !categoryId) {
    return redirect(`/admin/pet-types/${id}/edit?error=` + encodeURIComponent('Category and name are required.'));
  }

  try {
    await updatePetType(env.DB, id, { categoryId, name, slug: rawSlug || slugify(name) });
  } catch {
    return redirect(`/admin/pet-types/${id}/edit?error=` + encodeURIComponent('That slug is already taken.'));
  }

  return redirect('/admin/pet-types');
};
