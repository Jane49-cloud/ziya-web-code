export type BlogStatus = "draft" | "published" | "archived";

export interface BlogAuthor {
  id?: string;
  name?: string;
  title?: string;
  avatarUrl?: string;
}

export interface BlogBase {
  id: string;
  title: string;
  slug?: string;
  excerpt?: string;
  coverImage?: string;
  heroImage?: string;
  content: string;
  status: BlogStatus;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  readTimeMinutes?: number;
  author?: BlogAuthor;
}

export interface BlogFormValues {
  title: string;
  excerpt: string;
  tags: string[];
  status: BlogStatus;
  content: string;
}

export interface BlogPayload extends Partial<BlogBase> {
  content: string;
  summary?: string;
  body?: string;
  keywords?: string[] | string;
  date_created?: string;
  author_id?: string | number;
  [key: string]: unknown;
}

export type BlogCollectionResponse =
  | {
      data?: unknown;
      blogs?: unknown[];
      items?: unknown[];
      results?: unknown[];
    }
  | unknown[]
  | undefined;

export interface BlogSummary {
  total: number;
  published: number;
  drafts: number;
}
