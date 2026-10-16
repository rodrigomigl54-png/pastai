import type { APIRoute } from 'astro';
import { IS_PREVIEW, absoluteUrl } from '../lib/url';

export const GET: APIRoute = () =>
  new Response(
    IS_PREVIEW
      ? 'User-agent: *\nDisallow: /\n'
      : `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl('/sitemap-index.xml')}\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
