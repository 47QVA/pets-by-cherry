import { getPetTypeById, type PetInput } from './db';
import { resolvePhotoUrl } from './upload';

export async function parsePetForm(
  db: D1Database,
  form: FormData,
  existingPhotoUrl: string | null = null
): Promise<PetInput | { error: string }> {
  const name = String(form.get('name') ?? '').trim();
  const petTypeId = Number(form.get('pet_type_id'));
  const priceNaira = Number(form.get('price'));

  if (!name || !petTypeId) {
    return { error: 'Name and pet type are required.' };
  }

  if (!Number.isFinite(priceNaira) || priceNaira < 0) {
    return { error: 'Enter a valid price.' };
  }

  const petType = await getPetTypeById(db, petTypeId);
  if (!petType) {
    return { error: 'Select a valid pet type.' };
  }

  const photo = await resolvePhotoUrl(db, form, existingPhotoUrl);
  if ('error' in photo) {
    return photo;
  }

  const stockCount = Number(form.get('stock_count') ?? 1);

  return {
    name,
    categoryId: petType.category_id,
    petTypeId,
    breed: String(form.get('breed') ?? '').trim() || null,
    sex: String(form.get('sex') ?? '').trim() || null,
    ageLabel: String(form.get('age_label') ?? '').trim() || null,
    weightLabel: String(form.get('weight_label') ?? '').trim() || null,
    vaccinated: form.get('vaccinated') === '1',
    priceCents: Math.round(priceNaira * 100),
    description: String(form.get('description') ?? '').trim() || null,
    photoUrl: photo.url,
    featured: form.get('featured') === '1',
    inStock: form.get('in_stock') === '1',
    stockCount: Number.isFinite(stockCount) && stockCount >= 0 ? stockCount : 1
  };
}
