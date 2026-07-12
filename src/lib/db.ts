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
  stock_count: number;
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
  stockCount: number;
}

export async function createPet(db: D1Database, input: PetInput): Promise<void> {
  await db
    .prepare(
      `INSERT INTO pets (
        name, category_id, pet_type_id, breed, sex, age_label, weight_label,
        vaccinated, price_cents, description, photo_url, featured, in_stock, stock_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
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
      input.stockCount
    )
    .run();
}

export async function updatePet(db: D1Database, id: number, input: PetInput): Promise<void> {
  await db
    .prepare(
      `UPDATE pets SET
        name = ?, category_id = ?, pet_type_id = ?, breed = ?, sex = ?,
        age_label = ?, weight_label = ?, vaccinated = ?, price_cents = ?,
        description = ?, photo_url = ?, featured = ?, in_stock = ?, stock_count = ?
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
      input.stockCount,
      id
    )
    .run();
}

export async function decrementPetStock(db: D1Database, id: number, quantity: number): Promise<void> {
  await db
    .prepare(
      `UPDATE pets SET
        stock_count = MAX(stock_count - ?, 0),
        in_stock = CASE WHEN stock_count - ? <= 0 THEN 0 ELSE in_stock END
       WHERE id = ?`
    )
    .bind(quantity, quantity, id)
    .run();
}

export async function deletePet(db: D1Database, id: number): Promise<void> {
  await db.prepare('DELETE FROM pets WHERE id = ?').bind(id).run();
}

export interface ProductType {
  id: number;
  category_id: number;
  name: string;
  slug: string;
}

export interface ProductTypeWithCategory extends ProductType {
  category_name: string;
}

export function getAllProductTypes(db: D1Database): Promise<ProductTypeWithCategory[]> {
  return db
    .prepare(
      `SELECT product_types.*, categories.name AS category_name
       FROM product_types
       JOIN categories ON categories.id = product_types.category_id
       ORDER BY categories.sort_order ASC, product_types.name ASC`
    )
    .all<ProductTypeWithCategory>()
    .then((result) => result.results);
}

export function getProductTypeById(db: D1Database, id: number): Promise<ProductType | null> {
  return db.prepare('SELECT * FROM product_types WHERE id = ?').bind(id).first<ProductType>();
}

export interface ProductTypeInput {
  categoryId: number;
  name: string;
  slug: string;
}

export async function createProductType(db: D1Database, input: ProductTypeInput): Promise<void> {
  await db
    .prepare('INSERT INTO product_types (category_id, name, slug) VALUES (?, ?, ?)')
    .bind(input.categoryId, input.name, input.slug)
    .run();
}

export async function updateProductType(db: D1Database, id: number, input: ProductTypeInput): Promise<void> {
  await db
    .prepare('UPDATE product_types SET category_id = ?, name = ?, slug = ? WHERE id = ?')
    .bind(input.categoryId, input.name, input.slug, id)
    .run();
}

export async function deleteProductType(db: D1Database, id: number): Promise<void> {
  await db.prepare('DELETE FROM product_types WHERE id = ?').bind(id).run();
}

export function countProductsOfType(db: D1Database, productTypeId: number): Promise<number> {
  return db
    .prepare('SELECT COUNT(*) AS count FROM products WHERE product_type_id = ?')
    .bind(productTypeId)
    .first<{ count: number }>()
    .then((row) => row?.count ?? 0);
}

export function countProductsInCategory(db: D1Database, categoryId: number): Promise<number> {
  return db
    .prepare('SELECT COUNT(*) AS count FROM products WHERE category_id = ?')
    .bind(categoryId)
    .first<{ count: number }>()
    .then((row) => row?.count ?? 0);
}

export interface Product {
  id: number;
  name: string;
  category_id: number;
  product_type_id: number;
  price_cents: number;
  description: string | null;
  photo_url: string | null;
  stock_count: number;
  featured: number;
  in_stock: number;
  created_at: string;
}

export function getAllProducts(db: D1Database): Promise<Product[]> {
  return db
    .prepare('SELECT * FROM products ORDER BY created_at DESC')
    .all<Product>()
    .then((result) => result.results);
}

export function getProductsByCategory(db: D1Database, categorySlug: string): Promise<Product[]> {
  return db
    .prepare(
      `SELECT products.* FROM products
       JOIN categories ON categories.id = products.category_id
       WHERE categories.slug = ? AND products.in_stock = 1
       ORDER BY products.featured DESC, products.created_at DESC`
    )
    .bind(categorySlug)
    .all<Product>()
    .then((result) => result.results);
}

export function getProductById(db: D1Database, id: number): Promise<Product | null> {
  return db.prepare('SELECT * FROM products WHERE id = ?').bind(id).first<Product>();
}

export interface ProductInput {
  name: string;
  categoryId: number;
  productTypeId: number;
  priceCents: number;
  description: string | null;
  photoUrl: string | null;
  stockCount: number;
  featured: boolean;
  inStock: boolean;
}

export async function createProduct(db: D1Database, input: ProductInput): Promise<void> {
  await db
    .prepare(
      `INSERT INTO products (
        name, category_id, product_type_id, price_cents, description, photo_url,
        stock_count, featured, in_stock
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      input.name,
      input.categoryId,
      input.productTypeId,
      input.priceCents,
      input.description,
      input.photoUrl,
      input.stockCount,
      input.featured ? 1 : 0,
      input.inStock ? 1 : 0
    )
    .run();
}

export async function updateProduct(db: D1Database, id: number, input: ProductInput): Promise<void> {
  await db
    .prepare(
      `UPDATE products SET
        name = ?, category_id = ?, product_type_id = ?, price_cents = ?, description = ?,
        photo_url = ?, stock_count = ?, featured = ?, in_stock = ?
       WHERE id = ?`
    )
    .bind(
      input.name,
      input.categoryId,
      input.productTypeId,
      input.priceCents,
      input.description,
      input.photoUrl,
      input.stockCount,
      input.featured ? 1 : 0,
      input.inStock ? 1 : 0,
      id
    )
    .run();
}

export async function deleteProduct(db: D1Database, id: number): Promise<void> {
  await db.prepare('DELETE FROM products WHERE id = ?').bind(id).run();
}

export async function decrementProductStock(db: D1Database, id: number, quantity: number): Promise<void> {
  await db
    .prepare(
      `UPDATE products SET
        stock_count = MAX(stock_count - ?, 0),
        in_stock = CASE WHEN stock_count - ? <= 0 THEN 0 ELSE in_stock END
       WHERE id = ?`
    )
    .bind(quantity, quantity, id)
    .run();
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
  products: number;
  ordersToday: number;
  lowStockCount: number;
}

export async function getAdminCounts(db: D1Database): Promise<AdminCounts> {
  const [categories, pets, products, ordersToday, lowStock] = await Promise.all([
    db.prepare('SELECT COUNT(*) AS count FROM categories').first<{ count: number }>(),
    db.prepare('SELECT COUNT(*) AS count FROM pets').first<{ count: number }>(),
    db.prepare('SELECT COUNT(*) AS count FROM products').first<{ count: number }>(),
    db
      .prepare("SELECT COUNT(*) AS count FROM demo_orders WHERE date(created_at) = date('now')")
      .first<{ count: number }>(),
    // Pets are unique individual animals (normally stock_count = 1), so a
    // low threshold isn't a meaningful signal for them the way it is for
    // products with real quantities -- only products are counted here.
    db
      .prepare('SELECT COUNT(*) AS count FROM products WHERE in_stock = 1 AND stock_count <= 2')
      .first<{ count: number }>()
  ]);

  return {
    categories: categories?.count ?? 0,
    pets: pets?.count ?? 0,
    products: products?.count ?? 0,
    ordersToday: ordersToday?.count ?? 0,
    lowStockCount: lowStock?.count ?? 0
  };
}
