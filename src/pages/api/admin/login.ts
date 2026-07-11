import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { SESSION_COOKIE, createSessionToken, passwordMatches } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies, redirect, url }) => {
  const form = await request.formData();
  const password = String(form.get('password') ?? '');

  if (!passwordMatches(password, env.ADMIN_PASSWORD)) {
    return redirect('/admin/login?error=1');
  }

  const token = await createSessionToken(env.ADMIN_SESSION_SECRET);

  cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: url.protocol === 'https:',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8
  });

  return redirect('/admin');
};
