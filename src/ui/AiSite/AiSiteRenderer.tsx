/**
 * Renders `ai_site_recipe` DSL v1 only.
 * Contract: docs/AI_SITE_DSL_V1.md — bump `recipe.version` and add a renderer branch before changing v1 semantics.
 */
import { createContext, useContext } from "react";
import type { Campaign } from "@/ui/DonateBlocks/BlockRenderer";
import {
  type AiNode,
  type AiSiteRecipeV1,
  type RecipeTheme,
  getDonateStickyLabelFromRecipe,
} from "@/lib/aiSiteRecipe";
import { isAllowedRecipeMediaUrl } from "@/lib/mediaRecipeUrlAllowlist";
import { CampaignInfoBlock } from "@/ui/DonateBlocks/CampaignInfoBlock";
import { DonateButtonBlock } from "@/ui/DonateBlocks/DonateButtonBlock";
import { FooterBlock } from "@/ui/DonateBlocks/FooterBlock";
import { HeroBlock } from "@/ui/DonateBlocks/HeroBlock";
import { TextBlock } from "@/ui/DonateBlocks/TextBlock";
import type { Block } from "@/ui/DonateBlocks/BlockRenderer";

import "./AiSiteRenderer.scss";

type AiEditContextValue = {
  editMode: boolean;
  onTextEdit: (nodeId: string, field: string, value: string) => void;
};
const AiEditContext = createContext<AiEditContextValue>({
  editMode: false,
  onTextEdit: () => {},
});

type Props = {
  campaign: Campaign;
  recipe: AiSiteRecipeV1;
  onDonateClick: () => void;
  /** When true, show a fixed bottom primary CTA (public donate). Dashboard previews should set false. */
  stickyDonate?: boolean;
  /** When true, text nodes become contentEditable inline. */
  editMode?: boolean;
  /** Called on blur when a text field is edited. */
  onTextEdit?: (nodeId: string, field: string, value: string) => void;
};

type EditableTag = "span" | "p" | "h1";

function EditableText({
  nodeId,
  field,
  value,
  tag: Tag = "span",
  className,
  style,
}: {
  nodeId: string;
  field: string;
  value: string;
  tag?: EditableTag;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { editMode, onTextEdit } = useContext(AiEditContext);
  if (!editMode) return <Tag className={className} style={style}>{value}</Tag>;
  return (
    <Tag
      className={className}
      style={{ ...style, outline: "2px dashed rgba(37,99,235,0.4)", cursor: "text", minWidth: 40 }}
      contentEditable
      suppressContentEditableWarning
      onBlur={(e: React.FocusEvent<HTMLElement>) =>
        onTextEdit(nodeId, field, e.currentTarget.textContent ?? "")
      }
    >
      {value}
    </Tag>
  );
}

function HeroAi({ node, campaign }: { node: AiNode; campaign: Campaign }) {
  const title = String(node.props.title ?? campaign.title ?? "Campaign");
  const subtitle = node.props.subtitle != null ? String(node.props.subtitle) : "";
  const bgRaw = node.props.background_image_url != null ? String(node.props.background_image_url) : "";
  const bg = bgRaw && isAllowedRecipeMediaUrl(bgRaw) ? bgRaw : "";
  const { editMode } = useContext(AiEditContext);
  if (editMode) {
    return (
      <div className="donate-block donate-block-hero" style={{ position: "relative" }}>
        {bg ? <img src={bg} alt="" style={{ width: "100%", maxHeight: 320, objectFit: "cover", display: "block" }} /> : null}
        <div style={{ padding: "1.5rem" }}>
          <EditableText nodeId={node.id} field="title" value={title} tag="h1" style={{ display: "block", marginBottom: "0.5rem" }} />
          {subtitle ? <EditableText nodeId={node.id} field="subtitle" value={subtitle} tag="p" style={{ display: "block" }} /> : null}
        </div>
      </div>
    );
  }
  const block: Block = {
    id: node.id,
    type: "hero",
    props: { title, subtitle, image_url: bg || undefined },
  };
  return <HeroBlock block={block} campaign={campaign} />;
}

function TextAi({ node }: { node: AiNode }) {
  const body = String(node.props.body ?? "");
  const align = (node.props.align as string) || "left";
  const { editMode } = useContext(AiEditContext);
  if (editMode) {
    return (
      <div className="donate-block donate-block-text" style={{ textAlign: align as React.CSSProperties["textAlign"], padding: "1rem" }}>
        <EditableText nodeId={node.id} field="body" value={body} tag="p" style={{ display: "block", whiteSpace: "pre-wrap" }} />
      </div>
    );
  }
  const block: Block = {
    id: node.id,
    type: "text",
    props: { body, align },
  };
  return <TextBlock block={block} />;
}

function ImageAi({ node }: { node: AiNode }) {
  const url = String(node.props.url ?? "");
  const alt = node.props.alt != null ? String(node.props.alt) : "";
  if (!url || !isAllowedRecipeMediaUrl(url)) return null;
  return (
    <figure key={node.id} className="ai-site-image">
      <img src={url} alt={alt} />
      {alt ? <figcaption>{alt}</figcaption> : null}
    </figure>
  );
}

function VideoAi({ node }: { node: AiNode }) {
  const url = String(node.props.url ?? "");
  if (!url || !isAllowedRecipeMediaUrl(url)) return null;
  const isEmbed = url.includes("youtube.com") || url.includes("youtu.be") || url.includes("vimeo.com");
  if (isEmbed) {
    return (
      <div key={node.id} className="ai-site-video ai-site-video--embed">
        <iframe src={url} title="Video" allowFullScreen />
      </div>
    );
  }
  return (
    <div key={node.id} className="ai-site-video">
      <video src={url} controls playsInline />
    </div>
  );
}

function GalleryAi({ node }: { node: AiNode }) {
  const items = node.props.items;
  if (!Array.isArray(items)) return null;
  const urls: { url: string; alt: string }[] = [];
  for (const it of items) {
    if (!it || typeof it !== "object") continue;
    const o = it as Record<string, unknown>;
    if (typeof o.url !== "string" || !o.url || !isAllowedRecipeMediaUrl(o.url)) continue;
    urls.push({
      url: o.url,
      alt: typeof o.alt === "string" ? o.alt : "",
    });
  }
  if (!urls.length) return null;
  return (
    <div key={node.id} className="donate-block donate-block-media-gallery ai-site-gallery">
      <div className="donate-block-media-grid">
        {urls.map((it, i) => (
          <div key={`${node.id}-${i}`} className="donate-block-media-item">
            <img src={it.url} alt={it.alt} />
          </div>
        ))}
      </div>
    </div>
  );
}

function DonateSectionAi({
  node,
  onDonateClick,
}: {
  node: AiNode;
  onDonateClick: () => void;
}) {
  const label = node.props.label != null ? String(node.props.label) : "Donate";
  const presets = node.props.preset_amounts;
  const block: Block = {
    id: node.id,
    type: "donate_button",
    props: {
      label,
      preset_amounts: Array.isArray(presets) ? presets : [5, 10, 25, 50, 100],
    },
  };
  return <DonateButtonBlock key={node.id} block={block} onDonateClick={onDonateClick} />;
}

function ProgressSectionAi({ node, campaign }: { node: AiNode; campaign: Campaign }) {
  const block: Block = {
    id: node.id,
    type: "campaign_info",
    props: {
      show_goal: node.props.show_goal !== false,
      show_progress_bar: node.props.show_progress_bar !== false,
      show_donations_count: node.props.show_count !== false,
      show_winner: true,
    },
  };
  return <CampaignInfoBlock key={node.id} block={block} campaign={campaign} />;
}

function FooterAi({ node }: { node: AiNode }) {
  const text = node.props.text != null ? String(node.props.text) : "";
  const { editMode } = useContext(AiEditContext);
  if (editMode && text) {
    return (
      <div className="donate-block donate-block-footer" style={{ padding: "1rem", textAlign: "center" }}>
        <EditableText nodeId={node.id} field="text" value={text} tag="p" />
      </div>
    );
  }
  const block: Block = {
    id: node.id,
    type: "footer",
    props: { text: text || undefined, show_org_name: true },
  };
  return <FooterBlock key={node.id} block={block} />;
}

function SpacerAi({ node }: { node: AiNode }) {
  const h = typeof node.props.height_px === "number" ? node.props.height_px : 24;
  return <div key={node.id} className="ai-site-spacer" style={{ height: Math.min(400, Math.max(0, h)) }} />;
}

export function AiSiteRenderer({
  campaign,
  recipe,
  onDonateClick,
  stickyDonate = true,
  editMode = false,
  onTextEdit,
}: Props) {
  if (recipe.version !== "1") {
    return (
      <div className="ai-site-renderer donate-page-blocks">
        <p className="donation-error" role="alert">
          Unsupported AI site recipe version: {String(recipe.version)}. Expected v1.
        </p>
      </div>
    );
  }
  const theme = recipe.theme as RecipeTheme | undefined;
  const themeLines = [
    theme?.primary_color ? `--hhf-accent: ${theme.primary_color};` : "",
    theme?.secondary_color ? `--hhf-secondary: ${theme.secondary_color};` : "",
    theme?.font_family ? `--hhf-font: '${theme.font_family}', sans-serif;` : "",
    theme?.border_radius ? `--hhf-radius: ${theme.border_radius};` : "",
  ].filter(Boolean);
  const themeStyle = themeLines.length > 0 ? `:root { ${themeLines.join(" ")} }` : null;
  const stickyLabel = getDonateStickyLabelFromRecipe(recipe);
  const editContextValue: AiEditContextValue = {
    editMode,
    onTextEdit: onTextEdit ?? (() => {}),
  };
  return (
    <AiEditContext.Provider value={editContextValue}>
    <div className="ai-site-renderer donate-page-blocks">
      {themeStyle ? <style>{themeStyle}</style> : null}
      {recipe.nodes.map((node) => {
        switch (node.type) {
          case "hero":
            return <HeroAi key={node.id} node={node} campaign={campaign} />;
          case "text":
            return <TextAi key={node.id} node={node} />;
          case "image":
            return <ImageAi key={node.id} node={node} />;
          case "video":
            return <VideoAi key={node.id} node={node} />;
          case "gallery":
            return <GalleryAi key={node.id} node={node} />;
          case "donate_section":
            return <DonateSectionAi key={node.id} node={node} onDonateClick={onDonateClick} />;
          case "progress_section":
            return <ProgressSectionAi key={node.id} node={node} campaign={campaign} />;
          case "footer":
            return <FooterAi key={node.id} node={node} />;
          case "spacer":
            return <SpacerAi key={node.id} node={node} />;
          default:
            return null;
        }
      })}
      {stickyDonate ? (
        <div className="ai-site-sticky-donate">
          <button type="button" className="ai-site-sticky-donate__btn" onClick={onDonateClick}>
            {stickyLabel}
          </button>
        </div>
      ) : null}
    </div>
    </AiEditContext.Provider>
  );
}
