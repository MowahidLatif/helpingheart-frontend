import { useState, useCallback } from "react";
import { Select, Tabs, Button } from "antd";

const FONTS = ["Inter", "Georgia", "Roboto", "Merriweather", "Lato"];
const WIDGET_HEIGHT = 400;
const FULL_HEIGHT = 700;
const DEFAULT_ACCENT = "1D9E75";

type EmbedType = "widget" | "full";
type ExportFormat = "html" | "wordpress" | "react";

type Props = {
  campaign: { id: string; slug?: string; title?: string };
};

function buildSnippets(
  origin: string,
  campaignId: string,
  type: EmbedType,
  color: string,
  font: string,
): Record<ExportFormat, string> {
  const path = type === "widget" ? "progress" : "full";
  const height = type === "widget" ? WIDGET_HEIGHT : FULL_HEIGHT;
  const url = `${origin}/embed/${path}/${campaignId}?color=${color}&font=${font}`;
  return {
    html: `<iframe\n  src="${url}"\n  width="100%"\n  height="${height}"\n  frameborder="0"\n  style="border-radius:12px;overflow:hidden;"\n  allow="payment"\n></iframe>`,
    wordpress: `[helpinghandsfund campaign="${campaignId}" type="${type}" color="${color}" font="${font}" height="${height}"]`,
    react: `import { HHFEmbed } from "@helpinghandsfund/embed-react";\n\n<HHFEmbed\n  campaign="${campaignId}"\n  type="${type}"\n  color="${color}"\n  font="${font}"\n  height={${height}}\n/>`,
  };
}

export default function EmbedGenerator({ campaign }: Props) {
  const [type, setType] = useState<EmbedType>("widget");
  const [color, setColor] = useState(DEFAULT_ACCENT);
  const [font, setFont] = useState("Inter");
  const [format, setFormat] = useState<ExportFormat>("html");
  const [copied, setCopied] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const snippets = buildSnippets(origin, campaign.id, type, color, font);
  const previewPath = type === "widget" ? "progress" : "full";
  const previewUrl = `${origin}/embed/${previewPath}/${campaign.id}?color=${color}&font=${font}`;

  const copy = useCallback(() => {
    navigator.clipboard.writeText(snippets[format]).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [snippets, format]);

  const handleColorText = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9a-fA-F]/g, "").slice(0, 6);
    setColor(val);
  };

  const handleColorPicker = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value.replace(/^#/, ""));
  };

  const accentHex = color.length === 6 ? `#${color}` : `#${DEFAULT_ACCENT}`;

  return (
    <div style={{ marginTop: "2rem", borderTop: "1px solid #eee", paddingTop: "1.5rem" }}>
      <h3 style={{ margin: "0 0 0.4rem" }}>Add to your website</h3>
      <p style={{ color: "#666", marginBottom: "1.25rem", maxWidth: 560, fontSize: 14 }}>
        Embed your campaign on any external site. Choose a style and copy the snippet.
      </p>

      {/* Type selector */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        {(["widget", "full"] as EmbedType[]).map((t) => {
          const active = type === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              style={{
                flex: "1 1 180px",
                maxWidth: 240,
                padding: "0.75rem 1rem",
                borderRadius: 8,
                border: `2px solid ${active ? accentHex : "#ddd"}`,
                background: active ? "#f0fdf8" : "#fafafa",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 14, color: active ? accentHex : "#333" }}>
                {t === "widget" ? "Compact Widget" : "Full Campaign Site"}
              </div>
              <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                {t === "widget"
                  ? "Progress bar + live donations feed"
                  : "Complete campaign page with all sections"}
              </div>
            </button>
          );
        })}
      </div>

      {/* Customization */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.25rem", flexWrap: "wrap", alignItems: "flex-end" }}>
        <div>
          <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>
            Accent color
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input
              type="color"
              value={accentHex}
              onChange={handleColorPicker}
              style={{
                width: 32,
                height: 32,
                border: "1px solid #ddd",
                borderRadius: 4,
                padding: 2,
                cursor: "pointer",
                background: "none",
              }}
            />
            <input
              type="text"
              value={color}
              onChange={handleColorText}
              maxLength={6}
              placeholder={DEFAULT_ACCENT}
              style={{
                width: 90,
                padding: "4px 8px",
                border: "1px solid #ddd",
                borderRadius: 4,
                fontSize: 13,
                fontFamily: "monospace",
              }}
            />
          </div>
        </div>
        <div>
          <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>
            Font
          </label>
          <Select
            value={font}
            onChange={setFont}
            style={{ width: 160 }}
            options={FONTS.map((f) => ({ value: f, label: f }))}
          />
        </div>
      </div>

      {/* Code snippet */}
      <Tabs
        activeKey={format}
        onChange={(k) => setFormat(k as ExportFormat)}
        size="small"
        style={{ marginBottom: 0 }}
        items={[
          { key: "html", label: "HTML" },
          { key: "wordpress", label: "WordPress" },
          { key: "react", label: "React" },
        ]}
      />
      <div style={{ position: "relative" }}>
        <pre
          style={{
            margin: 0,
            padding: "0.75rem",
            paddingRight: "5rem",
            background: "#f5f5f5",
            borderRadius: "0 0 6px 6px",
            fontSize: 12,
            overflow: "auto",
            maxWidth: "100%",
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
            lineHeight: 1.5,
          }}
        >
          {snippets[format]}
        </pre>
        <Button
          type="primary"
          size="small"
          onClick={copy}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: accentHex,
            borderColor: accentHex,
          }}
        >
          {copied ? "Copied!" : "Copy"}
        </Button>
      </div>

      {/* Live preview */}
      <p style={{ fontSize: 13, color: "#666", marginTop: "1.25rem", marginBottom: "0.5rem" }}>
        Preview:
      </p>
      <iframe
        key={previewUrl}
        src={previewUrl}
        title="Embed preview"
        width="100%"
        height={type === "widget" ? 160 : 500}
        frameBorder={0}
        style={{ border: "1px solid #ddd", borderRadius: 8, display: "block" }}
      />
    </div>
  );
}
