export interface Category {
  id: number;
  name: string;
  slug: string;
  icon_url: string | null;
  sort_order: number;
}

export interface PetType {
  id: number;
  category_id: number;
  name: string;
  slug: string;
}

export interface Pet {
  id: number;
  name: string;
  category_id: number;
  pet_type_id: number;
  breed: string | null;
  sex: string | null;
  age_label: string | null;
  weight_label: string | null;
  vaccinated: number;
  price_cents: number;
  description: string | null;
  photo_url: string | null;
  featured: number;
  in_stock: number;
  created_at: string;
}

export function getCategories(db: D1Database): Promise<Category[]> {
  return db
    .prepare('SELECT * FROM categories ORDER BY sort_order ASC, name ASC')
    .all<Category>()
    .then((result) => result.results);
}

export function getCategoryBySlug(db: D1Database, slug: string): Promise<Category | null> {
  return db.prepare('SELECT * FROM categories WHERE slug = ?').bind(slug).first<Category>();
}

export function getCategoryById(db: D1Database, id: number): Promise<Category | null> {
  return db.prepare('SELECT * FROM categories WHERE id = ?').bind(id).first<Category>();
}

export interface CategoryInput {
  name: string;
  slug: string;
  iconUrl: string | null;
  sortOrder: number;
}

export async function createCategory(db: D1Database, input: CategoryInput): Promise<void> {
  await db
    .prepare('INSERT INTO categories (name, slug, icon_url, sort_order) VALUES (?, ?, ?, ?)')
    .bind(input.name, input.slug, input.iconUrl, input.sortOrder)
    .run();
}

export async function updateCategory(db: D1Database, id: number, input: CategoryInput): Promise<void> {
  await db
    .prepare('UPDATE categories SET name = ?, slug = ?, icon_url = ?, sort_order = ? WHERE id = ?')
    .bind(input.name, input.slug, input.iconUrl, input.sortOrder, id)
    .run();
}

export async function deleteCategory(db: D1Database, id: number): Promise<void> {
  await db.prepare('DELETE FROM categories WHERE id = ?').bind(id).run();
}

export function getPetsByCategory(db: D1Database, categorySlug: string): Promise<Pet[]> {
  return db
    .prepare(
      `SELECT pets.* FROM pets
       JOIN categories ON categories.id = pets.category_id
       WHERE categories.slug = ? AND pets.in_stock = 1
       ORDER BY pets.featured DESC, pets.created_at DESC`
    )
    .bind(categorySlug)
    .all<Pet>()
    .then((result) => result.results);
}

export function getPetById(db: D1Database, id: number): Promise<Pet | null> {
  return db.prepare('SELECT * FROM pets WHERE id = ?').bind(id).first<Pet>();
}

export function getPetTypeById(db: D1Database, id: number): Promise<PetType | null> {
  return db.prepare('SELECT * FROM pet_types WHERE id = ?').bind(id).first<PetType>();
}

export interface PetTypeWithCategory extends PetType {
  category_name: string;
}

export function getAllPetTypes(db: D1Database): Promise<PetTypeWithCategory[]> {
  return db
    .prepare(
      `SELECT pet_types.*, categories.name AS category_name
       FROM pet_types
       JOIN categories ON categories.id = pet_types.category_id
       ORDER BY categories.sort_order ASC, pet_types.name ASC`
    )
    .all<PetTypeWithCategory>()
    .then((result) => result.results);
}

export interface PetTypeInput {
  categoryId: number;
  name: string;
  slug: string;
}

export async function createPetType(db: D1Database, input: PetTypeInput): Promise<void> {
  await db
    .prepare('INSERT INTO pet_types (category_id, name, slug) VALUES (?, ?, ?)')
    .bind(input.categoryId, input.name, input.slug)
    .run();
}

export async function updatePetType(db: D1Database, id: number, input: PetTypeInput): Promise<void> {
  await db
    .prepare('UPDATE pet_types SET category_id = ?, name = ?, slug = ? WHERE id = ?')
    .bind(input.categoryId, input.name, input.slug, id)
    .run();
}

export async function deletePetType(db: D1Database, id: number): Promise<void> {
  await db.prepare('DELETE FROM pet_types WHERE id = ?').bind(id).run();
}

export function countPetTypesInCategory(db: D1Database, categoryId: number): Promise<number> {
  return db
    .prepare('SELECT COUNT(*) AS count FROM pet_types WHERE category_id = ?')
    .bind(categoryId)
    .first<{ count: number }>()
    .then((row) => row?.count ?? 0);
}

export function countPetsInCategory(db: D1Database, categoryId: number): Promise<number> {
  return db
    .prepare('SELECT COUNT(*) AS count FROM pets WHERE category_id = ?')
    .bind(categoryId)
    .first<{ count: number }>()
    .then((row) => row?.count ?? 0);
}

export function countPetsOfType(db: D1Database, petTypeId: number): Promise<number> {
  return db
    .prepare('SELECT COUNT(*) AS count FROM pets WHERE pet_type_id = ?')
    .bind(petTypeId)
    .first<{ count: number }>()
    .then((row) => row?.count ?? 0);
}

export function getAllPets(db: D1Database): Promise<Pet[]> {
  return db
    .prepare('SELECT * FROM pets ORDER BY created_at DESC')
    .all<Pet>()
    .then((result) => result.results);
}

export interface PetInput {
  name: string;
  categoryId: number;
  petTypeId: number;
  breed: string | null;
  sex: string | null;
  ageLabel: string | null;
  weightLabel: string | null;
  vaccinated: boolean;
  priceCents: number;
  description: string | null;
  photoUrl: string | null;
  featured: boolean;
  inStock: boolean;
}

export async function createPet(db: D1Database, input: PetInput): Promise<void> {
  await db
    .prepare(
      `INSERT INTO pets (
        name, category_id, pet_type_id, breed, sex, age_label, weight_label,
        vaccinated, price_cents, description, photo_url, featured, in_stock
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      input.name,
      input.categoryId,
      input.petTypeId,
      input.breed,
      input.sex,
      input.ageLabel,
      input.weightLabel,
      input.vaccinated ? 1 : 0,
      input.priceCents,
      input.description,
      input.photoUrl,
      input.featured ? 1 : 0,
      input.inStock ? 1 : 0
    )
    .run();
}

export async function updatePet(db: D1Database, id: number, input: PetInput): Promise<void> {
  await db
    .prepare(
      `UPDATE pets SET
        name = ?, category_id = ?, pet_type_id = ?, breed = ?, sex = ?,
        age_label = ?, weight_label = ?, vaccinated = ?, price_cents = ?,
        description = ?, photo_url = ?, featured = ?, in_stock = ?
       WHERE id = ?`
    )
    .bind(
      input.name,
      input.categoryId,
      input.petTypeId,
      input.breed,
      input.sex,
      input.ageLabel,
      input.weightLabel,
      input.vaccinated ? 1 : 0,
      input.priceCents,
      input.description,
      input.photoUrl,
      input.featured ? 1 : 0,
      input.inStock ? 1 : 0,
      id
    )
    .run();
}

export async function deletePet(db: D1Database, id: number): Promise<void> {
  await db.prepare('DELETE FROM pets WHERE id = ?').bind(id).run();
}

export interface DemoOrder {
  id: number;
  items_json: string;
  total_cents: number;
  fake_delivery_address: string | null;
  fake_receipt_ref: string;
  created_at: string;
}

export async function createDemoOrder(
  db: D1Database,
  order: { itemsJson: string; totalCents: number; deliveryAddress: string; receiptRef: string }
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO demo_orders (items_json, total_cents, fake_delivery_address, fake_receipt_ref)
       VALUES (?, ?, ?, ?)`
    )
    .bind(order.itemsJson, order.totalCents, order.deliveryAddress, order.receiptRef)
    .run();
}

export function getOrderByRef(db: D1Database, ref: string): Promise<DemoOrder | null> {
  return db.prepare('SELECT * FROM demo_orders WHERE fake_receipt_ref = ?').bind(ref).first<DemoOrder>();
}

export function getAllOrders(db: D1Database): Promise<DemoOrder[]> {
  return db
    .prepare('SELECT * FROM demo_orders ORDER BY created_at DESC')
    .all<DemoOrder>()
    .then((result) => result.results);
}

export interface AdminCounts {
  categories: number;
  pets: number;
  ordersToday: number;
}

export async function getAdminCounts(db: D1Database): Promise<AdminCounts> {
  const [categories, pets, ordersToday] = await Promise.all([
    db.prepare('SELECT COUNT(*) AS count FROM categories').first<{ count: number }>(),
    db.prepare('SELECT COUNT(*) AS count FROM pets').first<{ count: number }>(),
    db
      .prepare("SELECT COUNT(*) AS count FROM demo_orders WHERE date(created_at) = date('now')")
      .first<{ count: number }>()
  ]);

  return {
    categories: categories?.count ?? 0,
    pets: pets?.count ?? 0,
    ordersToday: ordersToday?.count ?? 0
  };
}
