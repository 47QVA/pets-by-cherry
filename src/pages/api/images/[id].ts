import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

function base64ToBytes(base64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export const GET: APIRoute = async ({ params }) => {
  const row = await env.DB.prepare('SELECT mime, data FROM uploaded_images WHERE id = ?')
    .bind(Number(params.id))
    .first<{ mime: string; data: string }>();

  if (!row) {
    return new Response('Not found', { status: 404 });
  }

  return new Response(base64ToBytes(row.data), {
    headers: {
      'Content-Type': row.mime,
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  });
};
