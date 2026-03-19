import { client } from "./client";

const postFields = `
  _id,
  title,
  titleEn,
  slug,
  excerpt,
  excerptEn,
  mainImage,
  author,
  publishedAt,
  categories,
  seoTitle,
  seoTitleEn,
  seoDescription,
  seoDescriptionEn
`;

export async function getAllPosts() {
  return client.fetch(
    `*[_type == "post"] | order(publishedAt desc) {
      ${postFields}
    }`
  );
}

export async function getPostBySlug(slug: string) {
  return client.fetch(
    `*[_type == "post" && slug.current == $slug][0] {
      ${postFields},
      body,
      bodyEn
    }`,
    { slug }
  );
}

export async function getRecentPosts(limit = 3) {
  return client.fetch(
    `*[_type == "post"] | order(publishedAt desc) [0...$limit] {
      ${postFields}
    }`,
    { limit }
  );
}

export async function getAllSlugs() {
  return client.fetch(
    `*[_type == "post" && defined(slug.current)].slug.current`
  );
}
