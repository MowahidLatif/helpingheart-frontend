import { useState, useEffect, ChangeEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import React from "react";
import api, { getErrorMessage } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";

/* ------------------------------------------------------ */
/*  Types                                                 */
/* ------------------------------------------------------ */
interface MediaItem {
  name: string;
  url: string;
  type: string;
  description: string;
}

type Accept = "image/*" | "video/*" | ".pdf,.doc,.docx,.ppt,.pptx";

const makePreview = (file: File, description = ""): MediaItem => ({
  name: file.name,
  url: URL.createObjectURL(file),
  type: file.type,
  description,
});

/* ------------------------------------------------------ */
/*  Reusable uploader component                          */
/* ------------------------------------------------------ */
interface UploaderProps {
  title: string;
  accept: Accept;
  items: MediaItem[];
  onFiles: (files: File[]) => void;
  render: (item: MediaItem, idx: number) => React.ReactElement;
}

function SectionUploader({
  title,
  accept,
  items,
  onFiles,
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

      <input type="file" multiple accept={accept} onChange={handleChange} />

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

  /* ---- local state ---- */
  const [images, setImages] = useState<MediaItem[]>([]);
  const [videos, setVideos] = useState<MediaItem[]>([]);
  const [docs, setDocs] = useState<MediaItem[]>([]);

  /* ---- handlers ---- */
  const addWithPrompt = (
    files: File[],
    setter: React.Dispatch<React.SetStateAction<MediaItem[]>>
  ) => {
    const items = files.map((f) =>
      makePreview(f, prompt(`Description for ${f.name}?`, "") ?? "")
    );
    setter((prev) => [...prev, ...items]);
  };

  const addImages = (files: File[]) => addWithPrompt(files, setImages);
  const addVideos = (files: File[]) => addWithPrompt(files, setVideos);
  const addDocs = (files: File[]) => addWithPrompt(files, setDocs);

  /* ---- render helpers ---- */
  const renderImage = (item: MediaItem, idx: number) => (
    <figure key={idx} style={{ textAlign: "center" }}>
      <img
        src={item.url}
        alt={item.name}
        style={{ width: 150, height: 150, objectFit: "cover" }}
      />
      <figcaption style={{ maxWidth: 150 }}>{item.description}</figcaption>
    </figure>
  );

  const renderVideo = (item: MediaItem, idx: number) => (
    <figure key={idx} style={{ textAlign: "center" }}>
      <video src={item.url} width={200} controls />
      <figcaption style={{ maxWidth: 200 }}>{item.description}</figcaption>
    </figure>
  );

  const renderDoc = (item: MediaItem, idx: number) => (
    <div key={idx} style={{ display: "flex", flexDirection: "column" }}>
      <a href={item.url} target="_blank" rel="noopener noreferrer">
        {item.name}
      </a>
      <small>{item.description}</small>
    </div>
  );

  /* ---- UI ---- */
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Layout Builder</h1>
      <p>
        Editing layout for campaign ID: <strong>{campaignId}</strong>
      </p>

      {/* IMAGES */}
      <SectionUploader
        title="Images"
        accept="image/*"
        items={images}
        onFiles={addImages}
        render={renderImage}
      />

      {/* VIDEOS */}
      <SectionUploader
        title="Videos"
        accept="video/*"
        items={videos}
        onFiles={addVideos}
        render={renderVideo}
      />

      {/* DOCUMENTS */}
      <SectionUploader
        title="Documents"
        accept=".pdf,.doc,.docx,.ppt,.pptx"
        items={docs}
        onFiles={addDocs}
        render={renderDoc}
      />
      <button onClick={() => alert("Content Saved")}>Save</button>
    </div>
  );
}
