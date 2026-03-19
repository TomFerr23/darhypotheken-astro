import type { APIRoute } from "astro";

export const GET: APIRoute = () => {
  const content = `User-agent: *
Allow: /
Disallow: /studio

Sitemap: https://darhypotheken.nl/sitemap-index.xml
`;

  return new Response(content, {
    headers: { "Content-Type": "text/plain" },
  });
};
