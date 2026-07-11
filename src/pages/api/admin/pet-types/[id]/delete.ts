import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { deletePetType, countPetsOfType } from '../../../../../lib/db';

export const POST: APIRoute = async ({ params, redirect }) => {
  const id = Number(params.id);
  const petCount = await countPetsOfType(env.DB, id);

  if (petCount > 0) {
    return redirect(`/admin/pet-types/${id}/edit?error=` + encodeURIComponent('Remove pets of this type first.'));
  }

  await deletePetType(env.DB, id);
  return redirect('/admin/pet-types');
};
