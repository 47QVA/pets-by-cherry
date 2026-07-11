import { defineMiddleware } from 'astro:middleware';
import { env } from 'cloudflare:workers';
import { SESSION_COOKIE, verifySessionToken } from './lib/auth';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  const isAdminPage = pathname.startsWith('/admin') && pathname !== '/admin/login';
  const isAdminApi = pathname.startsWith('/api/admin') && pathname !== '/api/admin/login';

  if (!isAdminPage && !isAdminApi) {
    return next();
  }

  const token = context.cookies.get(SESSION_COOKIE)?.value;
  const authed = await verifySessionToken(token, env.ADMIN_SESSION_SECRET);

  if (authed) {
    return next();
  }

  if (isAdminApi) {
    return new Response(JSON.stringify({ error: 'Not authenticated.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return context.redirect('/admin/login');
});
