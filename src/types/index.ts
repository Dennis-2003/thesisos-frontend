export interface User {
  id: string;
  email: string;
  fullName: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  type: string;
  userId: string;
  email: string;
  fullName: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  citationStyle: string;
  createdAt: string;
  documentCount: number;
  citationCount: number;
}

export interface Document {
  id: string;
  projectId: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
}

export interface Citation {
  id: string;
  documentId: string | null;
  rawData: string;
  formattedApa: string;
  formattedIeee: string;
}

export interface AiMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

export interface SearchResult {
  id: string;
  type: string;
  title: string;
  snippet: string;
  projectId: string | null;
  relevance: number;
}

export interface ThesisOutline {
  id: string;
  projectId: string;
  parentId: string | null;
  title: string;
  content: string;
  sortOrder: number;
  createdAt: string;
}

export interface ResearchQuestion {
  id: string;
  projectId: string;
  type: string;
  questionText: string;
  status: string;
  sortOrder: number;
  createdAt: string;
}

export interface BibliographyEntry {
  id: string;
  projectId: string;
  authors: string;
  year: string;
  title: string;
  journal: string;
  doi: string;
  url: string;
  volume: string;
  issue: string;
  pages: string;
  publisher: string;
  entryType: string;
  formattedApa: string;
  formattedIeee: string;
  createdAt: string;
}

export interface Collaborator {
  id: string;
  projectId: string;
  userId: string;
  userEmail: string;
  userFullName: string;
  role: string;
  permissions: string;
  createdAt: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  dueDate: string;
  status: string;
  completedAt: string | null;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  projectId: string;
  userId: string;
  userFullName: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  createdAt: string;
}
