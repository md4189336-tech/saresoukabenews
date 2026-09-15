import { supabase } from "@/integrations/supabase/client";

import politique from "@/assets/politique-pistes.jpg";
import culture from "@/assets/culture-tambours.jpg";
import sport from "@/assets/sport-navetanes.jpg";
import sante from "@/assets/sante-vaccination.jpg";
import economie from "@/assets/economie-louma.jpg";
import multimedia from "@/assets/multimedia-marche.jpg";

export const SECTIONS = [
  { slug: "politique", name: "Politique" },
  { slug: "culture", name: "Culture" },
  { slug: "sport", name: "Sport" },
  { slug: "sante", name: "Santé" },
  { slug: "economie", name: "Économie" },
  { slug: "multimedia", name: "Multimédia" },
] as const;

const FALLBACKS: Record<string, string> = {
  politique,
  culture,
  sport,
  sante,
  economie,
  multimedia,
};

export type Article = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featured_image_url: string | null;
  category_id: string | null;
  author_id: string | null;
  author_name: string | null;
  views_count: number;
  is_featured: boolean;
  is_breaking: boolean;
  created_at: string;
  categories?: { name: string; slug: string } | null;
};

const SELECT = "*, categories ( name, slug )";

export function coverImage(article: Pick<Article, "featured_image_url" | "categories">) {
  if (article.featured_image_url) return article.featured_image_url;
  return FALLBACKS[article.categories?.slug ?? "multimedia"] ?? multimedia;
}

export function sectionName(slug?: string | null) {
  return SECTIONS.find((s) => s.slug === slug)?.name ?? "Actualité";
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function readTime(content: string) {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

export async function fetchCategories() {
  const { data, error } = await supabase.from("categories").select("id, name, slug").order("name");
  if (error) throw error;
  return data ?? [];
}

export async function fetchLatest(limit = 12) {
  const { data, error } = await supabase
    .from("articles")
    .select(SELECT)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Article[];
}

export async function fetchFeatured() {
  const { data, error } = await supabase
    .from("articles")
    .select(SELECT)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(5);
  if (error) throw error;
  return (data ?? []) as Article[];
}

export async function fetchBreaking() {
  const { data, error } = await supabase
    .from("articles")
    .select("title, slug, is_breaking, created_at")
    .order("created_at", { ascending: false })
    .limit(8);
  if (error) throw error;
  return data ?? [];
}

export async function fetchBySection(slug: string, limit = 4) {
  const { data, error } = await supabase
    .from("articles")
    .select(SELECT)
    .eq("categories.slug", slug)
    .not("category_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return ((data ?? []) as Article[]).filter((a) => a.categories?.slug === slug);
}

export async function fetchMostRead(limit = 5) {
  const { data, error } = await supabase
    .from("articles")
    .select(SELECT)
    .order("views_count", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Article[];
}

export async function fetchArticle(slug: string) {
  const { data, error } = await supabase.from("articles").select(SELECT).eq("slug", slug).maybeSingle();
  if (error) throw error;
  return (data as Article) ?? null;
}

export async function fetchRelated(categoryId: string | null, excludeId: string) {
  if (!categoryId) return [];
  const { data, error } = await supabase
    .from("articles")
    .select(SELECT)
    .eq("category_id", categoryId)
    .neq("id", excludeId)
    .order("created_at", { ascending: false })
    .limit(3);
  if (error) throw error;
  return (data ?? []) as Article[];
}

export async function searchArticles(term: string) {
  if (!term.trim()) return [];
  const { data, error } = await supabase
    .from("articles")
    .select(SELECT)
    .or(`title.ilike.%${term}%,excerpt.ilike.%${term}%,content.ilike.%${term}%`)
    .order("created_at", { ascending: false })
    .limit(30);
  if (error) throw error;
  return (data ?? []) as Article[];
}
