import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { deleteCategory, countPetTypesInCategory, countPetsInCategory } from '../../../../../lib/db';

export const POST: APIRoute = async ({ params, redirect }) => {
  const id = Number(params.id);

  const [petTypeCount, petCount] = await Promise.all([
    countPetTypesInCategory(env.DB, id),
    countPetsInCategory(env.DB, id)
  ]);

  if (petTypeCount > 0 || petCount > 0) {
    return redirect(
      `/admin/categories/${id}/edit?error=` +
        encodeURIComponent('Remove pet types and pets in this category first.')
    );
  }

  await deleteCategory(env.DB, id);
  return redirect('/admin/categories');
};
