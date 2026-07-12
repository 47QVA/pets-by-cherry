import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { getProductById, updateProduct } from '../../../../../lib/db';
import { parseProductForm } from '../../../../../lib/product-form';

export const POST: APIRoute = async ({ params, request, redirect }) => {
  const id = Number(params.id);
  const form = await request.formData();
  const existing = await getProductById(env.DB, id);
  const input = await parseProductForm(env.DB, form, existing?.photo_url ?? null);

  if ('error' in input) {
    return redirect(`/admin/products/${id}/edit?error=` + encodeURIComponent(input.error));
  }

  await updateProduct(env.DB, id, input);
  return redirect('/admin/products');
};
