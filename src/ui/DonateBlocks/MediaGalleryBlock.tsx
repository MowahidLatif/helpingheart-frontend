import { useState, useEffect } from "react";
import api, { getErrorMessage } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";

type MediaGalleryBlockProps = {
  block: { id: string; type: string; props?: Record<string, unknown> };
  campaignId: string;
};

type MediaItem = { id: string; url?: string; s3_key?: string };

export function MediaGalleryBlock({ block, campaignId }: MediaGalleryBlockProps) {
  const p = block.props || {};
  const columns = Math.min(4, Math.max(1, (p.columns as number) || 2));
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(API_ENDPOINTS.campaigns.media(campaignId))
      .then((res) => setMedia(Array.isArray(res.data) ? res.data : []))
      .catch((err) => setError(getErrorMessage(err)));
  }, [campaignId]);

  if (error) {
    return (
      <div className="donate-block donate-block-media-gallery">
        <p className="donation-error">{error}</p>
      </div>
    );
  }

  if (media.length === 0) {
    return (
      <div className="donate-block donate-block-media-gallery">
        <p className="donate-block-media-empty">No media yet.</p>
      </div>
    );
  }

  return (
    <div
      className="donate-block donate-block-media-gallery"
      style={{ ["--media-cols" as string]: columns }}
    >
      <div className="donate-block-media-grid">
        {media.map((item) => {
          const src = typeof item === "object" && "url" in item ? item.url : null;
          if (!src) return null;
          return (
            <div key={item.id} className="donate-block-media-item">
              <img src={src} alt="" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
