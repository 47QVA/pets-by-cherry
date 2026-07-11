import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { createPet } from '../../../../lib/db';
import { parsePetForm } from '../../../../lib/pet-form';

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const input = await parsePetForm(env.DB, form);

  if ('error' in input) {
    return redirect('/admin/pets/new?error=' + encodeURIComponent(input.error));
  }

  await createPet(env.DB, input);
  return redirect('/admin/pets');
};
