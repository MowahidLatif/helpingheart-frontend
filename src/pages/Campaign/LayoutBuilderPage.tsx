import { useState, useCallback, ChangeEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import React from "react";
import { getErrorMessage } from "@/lib/api";
import { uploadMediaToS3, inferMediaType } from "@/lib/mediaUpload";

/* ------------------------------------------------------ */
/*  Types                                                 */
/* ------------------------------------------------------ */
type UploadStatus = "idle" | "uploading" | "success" | "error";

interface MediaItem {
  name: string;
  url: string;
  type: string;
  description: string;
  status: UploadStatus;
  error?: string;
  id?: string;
  file?: File;
}

type Accept = "image/*" | "video/*" | ".pdf";

/* ------------------------------------------------------ */
/*  Reusable uploader component                          */
/* ------------------------------------------------------ */
interface UploaderProps {
  title: string;
  accept: Accept;
  items: MediaItem[];
  onFiles: (files: File[]) => void;
  isUploading: boolean;
  render: (item: MediaItem, idx: number) => React.ReactElement;
}

function SectionUploader({
  title,
  accept,
  items,
  onFiles,
  isUploading,
  render,
}: UploaderProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) onFiles(files);
    e.target.value = "";
  };

  return (
    <section style={{ marginBottom: "2rem" }}>
      <h2>{title}</h2>

      <input
        type="file"
        multiple
        accept={accept}
        onChange={handleChange}
        disabled={isUploading}
      />
      {isUploading && (
        <span style={{ marginLeft: "0.5rem", color: "#666" }}>
          Uploading...
        </span>
      )}

      {items.length ? (
        <div
          style={{
            marginTop: "1rem",
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          {items.map(render)}
        </div>
      ) : (
        <p style={{ marginTop: "0.5rem" }}>
          No {title.toLowerCase()} uploaded.
        </p>
      )}
    </section>
  );
}

/* ------------------------------------------------------ */
/*  Main component                                       */
/* ------------------------------------------------------ */
export default function LayoutBuilderPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();

  const [images, setImages] = useState<MediaItem[]>([]);
  const [videos, setVideos] = useState<MediaItem[]>([]);
  const [docs, setDocs] = useState<MediaItem[]>([]);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const uploadFiles = useCallback(
    async (
      files: File[],
      setter: React.Dispatch<React.SetStateAction<MediaItem[]>>
    ) => {
      if (!campaignId) {
        setGlobalError("No campaign selected.");
        return;
      }
      setGlobalError(null);

      for (const file of files) {
        const description = prompt(`Description for ${file.name}?`, "") ?? "";
        const mtype = inferMediaType(file);

        const tempItem: MediaItem = {
          name: file.name,
          url: URL.createObjectURL(file),
          type: file.type,
          description,
          status: "uploading",
          file,
        };
        setter((prev) => [...prev, tempItem]);

        try {
          const persisted = await uploadMediaToS3(campaignId, file, mtype, {
            description: description || undefined,
          });
          setter((prev) =>
            prev.map((item) =>
              item.name === file.name && item.status === "uploading"
                ? {
                    ...item,
                    status: "success" as const,
                    url: persisted.url ?? item.url,
                    id: persisted.id,
                  }
                : item
            )
          );
        } catch (err) {
          const msg = getErrorMessage(err);
          setter((prev) =>
            prev.map((item) =>
              item.name === file.name && item.status === "uploading"
                ? { ...item, status: "error" as const, error: msg }
                : item
            )
          );
        }
      }
    },
    [campaignId]
  );

  const addImages = useCallback(
    (files: File[]) => uploadFiles(files, setImages),
    [uploadFiles]
  );
  const addVideos = useCallback(
    (files: File[]) => uploadFiles(files, setVideos),
    [uploadFiles]
  );
  const addDocs = useCallback(
    (files: File[]) => uploadFiles(files, setDocs),
    [uploadFiles]
  );

  const retryUpload = useCallback(
    async (item: MediaItem, setter: React.Dispatch<React.SetStateAction<MediaItem[]>>) => {
      if (!item.file || !campaignId) return;
      const mtype = inferMediaType(item.file);
      setter((prev) =>
        prev.map((i) =>
          i === item ? { ...i, status: "uploading" as const, error: undefined } : i
        )
      );
      try {
        const persisted = await uploadMediaToS3(campaignId, item.file, mtype, {
          description: item.description || undefined,
        });
        setter((prev) =>
          prev.map((i) =>
            i === item
              ? {
                  ...i,
                  status: "success" as const,
                  url: persisted.url ?? i.url,
                  id: persisted.id,
                  error: undefined,
                  file: undefined,
                }
              : i
          )
        );
      } catch (err) {
        const msg = getErrorMessage(err);
        setter((prev) =>
          prev.map((i) =>
            i === item ? { ...i, status: "error" as const, error: msg } : i
          )
        );
      }
    },
    [campaignId]
  );

  const dismissError = useCallback(
    (item: MediaItem, setter: React.Dispatch<React.SetStateAction<MediaItem[]>>) => {
      setter((prev) => prev.filter((i) => i !== item));
    },
    []
  );

  const renderImage = (item: MediaItem, idx: number) => (
    <figure key={item.id ?? idx} style={{ textAlign: "center" }}>
      {item.status === "uploading" && (
        <div
          style={{
            width: 150,
            height: 150,
            background: "#f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span>Uploading...</span>
        </div>
      )}
      {item.status !== "uploading" && (
        <img
          src={item.url}
          alt={item.name}
          style={{ width: 150, height: 150, objectFit: "cover" }}
        />
      )}
      <figcaption style={{ maxWidth: 150 }}>
        {item.description}
        {item.status === "success" && " ✓ Uploaded"}
        {item.status === "error" && (
          <span style={{ color: "red", display: "block" }}>
            Upload failed: {item.error}
            <button
              type="button"
              onClick={() => retryUpload(item, setImages)}
              style={{ marginLeft: 4 }}
            >
              Retry
            </button>
            <button
              type="button"
              onClick={() => dismissError(item, setImages)}
              style={{ marginLeft: 4 }}
            >
              Dismiss
            </button>
          </span>
        )}
      </figcaption>
    </figure>
  );

  const renderVideo = (item: MediaItem, idx: number) => (
    <figure key={item.id ?? idx} style={{ textAlign: "center" }}>
      {item.status === "uploading" && (
        <div
          style={{
            width: 200,
            height: 120,
            background: "#f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span>Uploading...</span>
        </div>
      )}
      {item.status !== "uploading" && (
        <video src={item.url} width={200} controls />
      )}
      <figcaption style={{ maxWidth: 200 }}>
        {item.description}
        {item.status === "success" && " ✓ Uploaded"}
        {item.status === "error" && (
          <span style={{ color: "red", display: "block" }}>
            Upload failed: {item.error}
            <button
              type="button"
              onClick={() => retryUpload(item, setVideos)}
              style={{ marginLeft: 4 }}
            >
              Retry
            </button>
            <button
              type="button"
              onClick={() => dismissError(item, setVideos)}
              style={{ marginLeft: 4 }}
            >
              Dismiss
            </button>
          </span>
        )}
      </figcaption>
    </figure>
  );

  const renderDoc = (item: MediaItem, idx: number) => (
    <div key={item.id ?? idx} style={{ display: "flex", flexDirection: "column" }}>
      {item.status === "uploading" && <span>Uploading {item.name}...</span>}
      {item.status !== "uploading" && (
        <a href={item.url} target="_blank" rel="noopener noreferrer">
          {item.name}
        </a>
      )}
      <small>{item.description}</small>
      {item.status === "success" && <small>✓ Uploaded</small>}
      {item.status === "error" && (
        <span style={{ color: "red" }}>
          Upload failed: {item.error}
          <button
            type="button"
            onClick={() => retryUpload(item, setDocs)}
            style={{ marginLeft: 4 }}
          >
            Retry
          </button>
          <button
            type="button"
            onClick={() => dismissError(item, setDocs)}
            style={{ marginLeft: 4 }}
          >
            Dismiss
          </button>
        </span>
      )}
    </div>
  );

  const isUploading =
    images.some((i) => i.status === "uploading") ||
    videos.some((i) => i.status === "uploading") ||
    docs.some((i) => i.status === "uploading");

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Layout Builder</h1>
      <p>
        Editing layout for campaign ID: <strong>{campaignId}</strong>
      </p>
      {!campaignId && (
        <p style={{ color: "red" }}>No campaign selected. Please go back and select a campaign.</p>
      )}
      {globalError && <p style={{ color: "red" }}>{globalError}</p>}

      <SectionUploader
        title="Images"
        accept="image/*"
        items={images}
        onFiles={addImages}
        isUploading={isUploading}
        render={renderImage}
      />

      <SectionUploader
        title="Videos"
        accept="video/*"
        items={videos}
        onFiles={addVideos}
        isUploading={isUploading}
        render={renderVideo}
      />

      <SectionUploader
        title="Documents"
        accept=".pdf"
        items={docs}
        onFiles={addDocs}
        isUploading={isUploading}
        render={renderDoc}
      />
      <button onClick={() => navigate(`/campaign/page-layout/${campaignId}`)}>
        Done — Back to Page Builder
      </button>
    </div>
  );
}
