import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { updateProduct } from '../../../../../lib/db';
import { parseProductForm } from '../../../../../lib/product-form';

export const POST: APIRoute = async ({ params, request, redirect }) => {
  const id = Number(params.id);
  const form = await request.formData();
  const input = await parseProductForm(env.DB, form);

  if ('error' in input) {
    return redirect(`/admin/products/${id}/edit?error=` + encodeURIComponent(input.error));
  }

  await updateProduct(env.DB, id, input);
  return redirect('/admin/products');
};
