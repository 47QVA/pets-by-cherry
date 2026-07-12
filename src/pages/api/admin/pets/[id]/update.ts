import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { getPetById, updatePet } from '../../../../../lib/db';
import { parsePetForm } from '../../../../../lib/pet-form';

export const POST: APIRoute = async ({ params, request, redirect }) => {
  const id = Number(params.id);
  const form = await request.formData();
  const existing = await getPetById(env.DB, id);
  const input = await parsePetForm(env.DB, form, existing?.photo_url ?? null);

  if ('error' in input) {
    return redirect(`/admin/pets/${id}/edit?error=` + encodeURIComponent(input.error));
  }

  await updatePet(env.DB, id, input);
  return redirect('/admin/pets');
};
