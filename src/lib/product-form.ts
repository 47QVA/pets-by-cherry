import { getProductTypeById, type ProductInput } from './db';
import { resolvePhotoUrl } from './upload';

export async function parseProductForm(
  db: D1Database,
  form: FormData,
  existingPhotoUrl: string | null = null
): Promise<ProductInput | { error: string }> {
  const name = String(form.get('name') ?? '').trim();
  const productTypeId = Number(form.get('product_type_id'));
  const priceNaira = Number(form.get('price'));
  const stockCount = Number(form.get('stock_count'));

  if (!name || !productTypeId) {
    return { error: 'Name and type are required.' };
  }

  if (!Number.isFinite(priceNaira) || priceNaira < 0) {
    return { error: 'Enter a valid price.' };
  }

  if (!Number.isFinite(stockCount) || stockCount < 0) {
    return { error: 'Enter a valid stock count.' };
  }

  const productType = await getProductTypeById(db, productTypeId);
  if (!productType) {
    return { error: 'Select a valid product type.' };
  }

  const photo = await resolvePhotoUrl(db, form, existingPhotoUrl);
  if ('error' in photo) {
    return photo;
  }

  return {
    name,
    categoryId: productType.category_id,
    productTypeId,
    priceCents: Math.round(priceNaira * 100),
    description: String(form.get('description') ?? '').trim() || null,
    photoUrl: photo.url,
    stockCount,
    featured: form.get('featured') === '1',
    inStock: form.get('in_stock') === '1'
  };
}
