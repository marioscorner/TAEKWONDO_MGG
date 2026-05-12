export type DocumentResource = {
  id: number;
  name: string;
  description: string | null;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedBy: number;
  visibility: "PUBLIC" | "INSTRUCTOR_ONLY";
  createdAt: string;
  updatedAt: string;
  uploader: {
    id: number;
    username: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
  };
};

export type DocumentsPage = {
  results: DocumentResource[];
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
};
