import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { deletePet } from '../../../../../lib/db';

export const POST: APIRoute = async ({ params, redirect }) => {
  await deletePet(env.DB, Number(params.id));
  return redirect('/admin/pets');
};
