import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { deleteProduct } from '../../../../../lib/db';

export const POST: APIRoute = async ({ params, redirect }) => {
  await deleteProduct(env.DB, Number(params.id));
  return redirect('/admin/products');
};
