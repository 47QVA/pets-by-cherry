import { useEffect, useState } from 'preact/hooks';
import { clearCart, getCart, getCartTotal, type CartItem } from '../lib/cart';
import { formatPrice } from '../lib/format';
import { NIGERIA_STATES } from '../lib/nigeria-states';

type Step = 'delivery' | 'payment' | 'paying';

interface Delivery {
  name: string;
  phone: string;
  state: string;
  address: string;
}

const EMPTY_DELIVERY: Delivery = { name: '', phone: '', state: '', address: '' };

export default function CheckoutForm() {
  const [ready, setReady] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [step, setStep] = useState<Step>('delivery');
  const [delivery, setDelivery] = useState<Delivery>(EMPTY_DELIVERY);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setItems(getCart());
    setReady(true);
  }, []);

  if (!ready) return null;

  if (items.length === 0) {
    return (
      <div class="bg-white border border-black/10 p-8 text-center">
        <p class="text-gray">Your cart is empty, so there's nothing to check out.</p>
        <a href="/" class="mt-4 inline-block bg-blue px-6 py-3 font-medium text-white">
          Browse pets
        </a>
      </div>
    );
  }

  const total = getCartTotal(items);

  function handleDeliverySubmit(e: Event) {
    e.preventDefault();
    if (!delivery.name || !delivery.phone || !delivery.state || !delivery.address) {
      setError('Please fill in every field.');
      return;
    }
    setError(null);
    setStep('payment');
  }

  async function handlePay() {
    setStep('paying');
    setError(null);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, delivery })
      });

      if (!response.ok) throw new Error('checkout failed');

      const { receiptRef } = (await response.json()) as { receiptRef: string };
      clearCart();
      window.location.href = `/receipt/${receiptRef}`;
    } catch {
      setError("Couldn't complete checkout. Try again.");
      setStep('payment');
    }
  }

  if (step === 'delivery') {
    return (
      <form onSubmit={handleDeliverySubmit} class="space-y-4">
        <div>
          <label class="mb-1 block text-sm text-gray" for="name">
            Full name
          </label>
          <input
            id="name"
            type="text"
            required
            value={delivery.name}
            onInput={(e) => setDelivery({ ...delivery, name: (e.target as HTMLInputElement).value })}
            class="w-full bg-white px-4 py-3 border border-black/10 focus:outline-none focus:ring-2 focus:ring-blue"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm text-gray" for="phone">
            Phone number
          </label>
          <input
            id="phone"
            type="tel"
            required
            value={delivery.phone}
            onInput={(e) => setDelivery({ ...delivery, phone: (e.target as HTMLInputElement).value })}
            class="w-full bg-white px-4 py-3 border border-black/10 focus:outline-none focus:ring-2 focus:ring-blue"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm text-gray" for="state">
            State
          </label>
          <select
            id="state"
            required
            value={delivery.state}
            onChange={(e) => setDelivery({ ...delivery, state: (e.target as HTMLSelectElement).value })}
            class="w-full bg-white px-4 py-3 border border-black/10 focus:outline-none focus:ring-2 focus:ring-blue"
          >
            <option value="" disabled>
              Select a state
            </option>
            {NIGERIA_STATES.map((state) => (
              <option value={state}>{state}</option>
            ))}
          </select>
        </div>

        <div>
          <label class="mb-1 block text-sm text-gray" for="address">
            Delivery address
          </label>
          <textarea
            id="address"
            required
            rows={3}
            value={delivery.address}
            onInput={(e) => setDelivery({ ...delivery, address: (e.target as HTMLTextAreaElement).value })}
            class="w-full bg-white px-4 py-3 border border-black/10 focus:outline-none focus:ring-2 focus:ring-blue"
          />
        </div>

        {error && <p class="text-sm text-accent">{error}</p>}

        <button
          type="submit"
          class="w-full bg-blue px-6 py-4 font-display text-lg text-white"
        >
          Continue to payment
        </button>
      </form>
    );
  }

  return (
    <div>
      <div class="mb-6 bg-white border border-black/10 p-4">
        <p class="text-sm text-gray">Delivering to</p>
        <p class="text-ink">
          {delivery.name} · {delivery.phone}
        </p>
        <p class="text-gray">
          {delivery.address}, {delivery.state}
        </p>
        <button type="button" onClick={() => setStep('delivery')} class="mt-2 text-sm text-blue underline">
          Edit
        </button>
      </div>

      <div class="bg-white p-6 border border-black/10">
        <p class="font-display text-lg text-ink">Pay with card</p>
        <p class="mt-1 text-sm text-gray">
          Demo checkout — no real payment is processed.
        </p>

        <div class="mt-4 flex items-center justify-between border-t border-black/10 pt-4">
          <span class="text-gray">Total</span>
          <span class="font-display text-xl text-accent">{formatPrice(total)}</span>
        </div>

        {error && <p class="mt-3 text-sm text-accent">{error}</p>}

        <button
          type="button"
          disabled={step === 'paying'}
          onClick={handlePay}
          class="mt-4 w-full bg-accent px-6 py-4 font-display text-lg text-white disabled:opacity-60"
        >
          {step === 'paying' ? 'Processing…' : `Pay ${formatPrice(total)}`}
        </button>
      </div>
    </div>
  );
}
