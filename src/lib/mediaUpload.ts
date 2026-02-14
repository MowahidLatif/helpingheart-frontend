import api from "./api";
import { API_ENDPOINTS } from "./constants";

export type MediaType = "image" | "video" | "doc";

export interface PersistedMedia {
  id: string;
  org_id: string;
  campaign_id: string;
  type: string;
  s3_key: string;
  content_type: string | null;
  size_bytes: number | null;
  url: string | null;
  description: string | null;
  sort: number;
  created_at: string;
  updated_at: string;
}

function inferMediaType(file: File): MediaType {
  const t = file.type?.toLowerCase() ?? "";
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (
    t.startsWith("image/") ||
    [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(`.${ext}`)
  ) {
    return "image";
  }
  if (
    t.startsWith("video/") ||
    [".mp4", ".webm", ".mov"].includes(`.${ext}`)
  ) {
    return "video";
  }
  if (t === "application/pdf" || ext === "pdf") {
    return "doc";
  }
  return "image";
}

/**
 * Upload a file via backend proxy (no direct S3 / CORS).
 * Backend uploads to S3 and persists metadata.
 * Throws on error with a user-friendly message.
 */
export async function uploadMediaToS3(
  campaignId: string,
  file: File,
  _type: MediaType,
  options?: { description?: string; sort?: number }
): Promise<PersistedMedia> {
  const form = new FormData();
  form.append("file", file);
  form.append("campaign_id", campaignId);
  if (options?.description) {
    form.append("description", options.description);
  }
  if (options?.sort != null) {
    form.append("sort", String(options.sort));
  }

  const resp = await api.post(API_ENDPOINTS.media.upload, form);

  return resp.data as PersistedMedia;
}

export { inferMediaType };
