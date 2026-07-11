import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { updatePet } from '../../../../../lib/db';
import { parsePetForm } from '../../../../../lib/pet-form';

export const POST: APIRoute = async ({ params, request, redirect }) => {
  const id = Number(params.id);
  const form = await request.formData();
  const input = await parsePetForm(env.DB, form);

  if ('error' in input) {
    return redirect(`/admin/pets/${id}/edit?error=` + encodeURIComponent(input.error));
  }

  await updatePet(env.DB, id, input);
  return redirect('/admin/pets');
};
