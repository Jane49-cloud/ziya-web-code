import type {
  BlogAuthor,
  BlogBase,
  BlogCollectionResponse,
  BlogFormValues,
  BlogPayload,
  BlogStatus,
  BlogSummary,
} from "./types";
import { getUser } from "../utils";

export const BLOG_DEFAULT_COVER = "/media/logos/Ziya_logo_transparent_bg.png";

const pickFirstString = (
  value: unknown,
  fallback = ""
): string => {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    const found = value.find((item) => typeof item === "string");
    if (found) return found;
  }
  return fallback;
};

const readValue = (source: unknown, key: string): unknown => {
  if (!source || typeof source !== "object") return undefined;
  return (source as Record<string, unknown>)[key];
};

const stripHtml = (input: string): string =>
  input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const estimateReadTime = (html: string): number => {
  const clean = stripHtml(html);
  const words = clean.length > 0 ? clean.split(/\s+/).length : 0;
  return Math.max(1, Math.round(words / 190));
};

const toArray = <T,>(input: unknown, fallback: T[] = []): T[] => {
  if (Array.isArray(input)) return input as T[];
  if (typeof input === "string")
    return input
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean) as T[];
  return fallback;
};

const normalizeAuthor = (entry: unknown): BlogAuthor | undefined => {
  if (!entry || typeof entry !== "object") return undefined;
  const payload = entry as Record<string, unknown>;
  const idCandidate =
    payload.id ?? payload.user_id ?? payload.author_id ?? payload.staff_id;
  const nameCandidate =
    payload.name ??
    payload.fullName ??
    payload.fullname ??
    payload.displayName ??
    payload.email;
  const titleCandidate = payload.title ?? payload.role ?? payload.position;
  const avatarCandidate =
    payload.avatarUrl ?? payload.avatar ?? payload.photo ?? payload.image;

  if (!nameCandidate && !avatarCandidate) return undefined;

  return {
    id: idCandidate ? String(idCandidate) : undefined,
    name: pickFirstString(nameCandidate),
    title: pickFirstString(titleCandidate, undefined),
    avatarUrl: pickFirstString(avatarCandidate, undefined),
  };
};

const resolveStatus = (entry: Record<string, unknown>): BlogStatus => {
  const statusCandidate = pickFirstString(
    entry.status ?? entry.state ?? entry.stage ?? entry.isPublished,
    "published"
  ).toLowerCase();

  if (["draft", "published", "archived"].includes(statusCandidate)) {
    return statusCandidate as BlogStatus;
  }

  if (statusCandidate === "true" || statusCandidate === "1") return "published";
  if (statusCandidate === "false" || statusCandidate === "0") return "draft";

  return "published";
};

const resolveTags = (entry: Record<string, unknown>): string[] => {
  const candidates =
    entry.tags ?? entry.labels ?? entry.keywords ?? entry.categories ?? [];
  return toArray<string>(candidates, []);
};

const generateExcerpt = (entry: Record<string, unknown>, content: string): string => {
  const raw =
    pickFirstString(
      entry.excerpt ?? entry.summary ?? entry.description ?? entry.subtitle,
      ""
    ) || stripHtml(content).slice(0, 220);
  return raw.length > 260 ? `${raw.slice(0, 257)}…` : raw;
};

const pickContent = (entry: Record<string, unknown>): string => {
  return (
    pickFirstString(
      entry.content ?? entry.body ?? entry.html ?? entry.article ?? entry.description,
      ""
    ) ||
    ""
  );
};

const pickCover = (entry: Record<string, unknown>): string => {
  const cover =
    entry.coverImage ??
    entry.cover ??
    entry.heroImage ??
    entry.thumbnail ??
    entry.image ??
    entry.banner;
  const resolved = pickFirstString(cover, "");
  return resolved || BLOG_DEFAULT_COVER;
};

const slugify = (input: string): string =>
  input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export const normalizeBlog = (
  entry: Record<string, unknown>,
  fallbackId: string
): BlogBase => {
  const id =
    entry.id ??
    entry.blog_id ??
    entry._id ??
    entry.uuid ??
    entry.slug ??
    fallbackId;
  const title =
    pickFirstString(
      entry.title ?? entry.name ?? entry.heading ?? "Untitled blog"
    ) || "Untitled blog";
  const content = pickContent(entry);
  const slug = pickFirstString(entry.slug, slugify(title));
  const status = resolveStatus(entry);
  const tags = resolveTags(entry);
  const coverImage = pickCover(entry);
  const excerpt = generateExcerpt(
    {
      ...entry,
      excerpt: entry.excerpt ?? entry.subtitle ?? entry.summary,
    },
    content
  );
  const readTimeMinutes = estimateReadTime(content);
  const createdAt = pickFirstString(entry.createdAt ?? entry.created_at ?? "");
  const updatedAt = pickFirstString(entry.updatedAt ?? entry.updated_at ?? "");
  const publishedAt = pickFirstString(
    entry.publishedAt ?? entry.published_at ?? createdAt ?? ""
  );
  const author = normalizeAuthor(entry.author ?? entry.createdBy ?? entry.owner);

  return {
    id: String(id),
    title,
    slug,
    excerpt,
    coverImage,
    heroImage: pickFirstString(entry.heroImage ?? entry.bannerImage ?? coverImage, ""),
    content,
    status,
    tags,
    createdAt: createdAt || undefined,
    updatedAt: updatedAt || undefined,
    publishedAt: publishedAt || undefined,
    readTimeMinutes,
    author,
  };
};

export const normalizeBlogs = (
  payload: BlogCollectionResponse
): BlogBase[] => {
  if (!payload) return [];
  const collection =
    Array.isArray(payload) && payload.length
      ? payload
      : typeof payload === "object"
      ? extractFirstArray(payload)
      : [];

  return collection.map((entry, index) =>
    normalizeBlog((entry as Record<string, unknown>) ?? {}, `${index + 1}`)
  );
};

const extractFirstArray = (record: BlogCollectionResponse): unknown[] => {
  if (!record || typeof record !== "object") return [];
  const container = record as Record<string, unknown>;
  for (const key of [
    "blogs",
    "data",
    "items",
    "results",
    "records",
    "list",
  ]) {
    const value = container[key];
    if (Array.isArray(value)) return value;
  }
  return [];
};

export const extractSingleBlog = (
  payload: unknown,
  fallbackId = "1"
): BlogBase | null => {
  if (!payload) return null;
  if (Array.isArray(payload)) {
    const [first] = payload;
    if (first && typeof first === "object") {
      return normalizeBlog(first as Record<string, unknown>, fallbackId);
    }
    return null;
  }

  if (typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    for (const key of ["blog", "data", "item", "result", "entry"]) {
      const candidate = record[key];
      if (candidate && typeof candidate === "object") {
        return normalizeBlog(candidate as Record<string, unknown>, fallbackId);
      }
    }
    return normalizeBlog(record, fallbackId);
  }

  return null;
};

export const summarizeBlogs = (blogs: BlogBase[]): BlogSummary => {
  const total = blogs.length;
  const published = blogs.filter((blog) => blog.status === "published").length;
  const drafts = blogs.filter((blog) => blog.status === "draft").length;
  return { total, published, drafts };
};

export const buildBlogPayload = (values: BlogFormValues): BlogPayload => {
  const currentUser = getUser();
  const authorCandidate =
    currentUser?.id ??
    readValue(currentUser, "user_id") ??
    readValue(currentUser, "staff_id") ??
    readValue(currentUser, "userId") ??
    readValue(currentUser, "author_id");
  const authorId = authorCandidate !== undefined && authorCandidate !== null ? String(authorCandidate) : undefined;

  const basePayload: BlogPayload = {
    title: values.title.trim(),
    excerpt: values.excerpt.trim(),
    status: values.status,
    tags: values.tags,
    content: values.content,
    date_created: new Date().toISOString(),
  };

  return {
    ...basePayload,
    subtitle: values.excerpt,
    body: values.content,
    summary: values.excerpt,
    keywords: values.tags,
    tags: values.tags,
    ...(authorId ? { author_id: authorId } : {}),
  };
};

export const defaultBlogFormValues: BlogFormValues = {
  title: "",
  excerpt: "",
  tags: [],
  status: "draft",
  content: "",
};

export const tagPalette = [
  "volcano",
  "geekblue",
  "lime",
  "gold",
  "purple",
  "magenta",
  "cyan",
  "orange",
  "blue",
];
