export interface Document {
  id?: number;
  ID: number;

  author_id: number;
  title: string;
  content?: string;
  access_level?: "staff" | "management" | "admin" | "public";
  date_created: string;
  date_updated?: string;
  author_name?: string;
}

export interface CreateDocumentPayload {
  author_id: number;
  title: string;
  content: string;
  access_level: "staff" | "management" | "admin" | "public";
  date_created: string;
}

export interface UpdateDocumentPayload {
  id: number;
  author_id?: number;
  title?: string;
  content?: string;
  access_level?: "staff" | "management" | "admin" | "public";
}

export interface DocumentsState {
  documents: Document[];
  selectedDocument: Document | null;
  searchQuery: string;
  filterAccessLevel: string;
}
