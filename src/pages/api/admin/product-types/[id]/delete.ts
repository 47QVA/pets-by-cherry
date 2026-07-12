import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { deleteProductType, countProductsOfType } from '../../../../../lib/db';

export const POST: APIRoute = async ({ params, redirect }) => {
  const id = Number(params.id);
  const productCount = await countProductsOfType(env.DB, id);

  if (productCount > 0) {
    return redirect(
      `/admin/product-types/${id}/edit?error=` + encodeURIComponent('Remove products of this type first.')
    );
  }

  await deleteProductType(env.DB, id);
  return redirect('/admin/product-types');
};
