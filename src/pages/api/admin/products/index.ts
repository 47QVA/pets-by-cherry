import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { createProduct } from '../../../../lib/db';
import { parseProductForm } from '../../../../lib/product-form';

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const input = await parseProductForm(env.DB, form);

  if ('error' in input) {
    return redirect('/admin/products/new?error=' + encodeURIComponent(input.error));
  }

  await createProduct(env.DB, input);
  return redirect('/admin/products');
};
