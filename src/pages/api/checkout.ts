import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import {
  createDemoOrder,
  decrementPetStock,
  decrementProductStock,
  getPetById,
  getProductById
} from '../../lib/db';
import type { CartItem } from '../../lib/cart';

interface CheckoutPayload {
  items: CartItem[];
  delivery: {
    name: string;
    phone: string;
    state: string;
    address: string;
  };
}

function makeReceiptRef(): string {
  return `PBC-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

export const POST: APIRoute = async ({ request }) => {
  let payload: CheckoutPayload;

  try {
    payload = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body.' }), { status: 400 });
  }

  const { items, delivery } = payload;

  if (!Array.isArray(items) || items.length === 0) {
    return new Response(JSON.stringify({ error: 'Your cart is empty.' }), { status: 400 });
  }

  if (!delivery?.name || !delivery?.phone || !delivery?.state || !delivery?.address) {
    return new Response(JSON.stringify({ error: 'Delivery details are incomplete.' }), { status: 400 });
  }

  // Re-check stock against the database (not the client's cart snapshot) so two
  // shoppers can't both "win" the last unit of something.
  for (const item of items) {
    const record =
      item.kind === 'pet' ? await getPetById(env.DB, item.id) : await getProductById(env.DB, item.id);

    if (!record || !record.in_stock || record.stock_count < item.quantity) {
      return new Response(
        JSON.stringify({ error: `${item.name} no longer has enough stock. Update your cart and try again.` }),
        { status: 409 }
      );
    }
  }

  const totalCents = items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
  const receiptRef = makeReceiptRef();
  const deliveryAddress = `${delivery.name}, ${delivery.phone} — ${delivery.address}, ${delivery.state}`;

  try {
    await createDemoOrder(env.DB, {
      itemsJson: JSON.stringify(items),
      totalCents,
      deliveryAddress,
      receiptRef
    });

    for (const item of items) {
      if (item.kind === 'pet') {
        await decrementPetStock(env.DB, item.id, item.quantity);
      } else {
        await decrementProductStock(env.DB, item.id, item.quantity);
      }
    }
  } catch {
    return new Response(JSON.stringify({ error: "Couldn't complete checkout. Try again." }), { status: 500 });
  }

  return new Response(JSON.stringify({ receiptRef }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
