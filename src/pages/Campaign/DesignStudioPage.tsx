import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Spin, Progress, Input, Select } from "antd";
import api, { getErrorMessage } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import { parseAiSiteRecipeFromDb } from "@/lib/aiSiteRecipe";
import type { AiSiteRecipeV1, RecipeTheme } from "@/lib/aiSiteRecipe";
import type { Campaign } from "@/ui/DonateBlocks/BlockRenderer";
import { AiSiteRenderer } from "@/ui/AiSite/AiSiteRenderer";
import EmbedGenerator from "@/ui/Dashboard/EmbedGenerator";

type Step = "type" | "source" | "extracting" | "tokens" | "generating" | "edit" | "embed";
type ProductType = "full" | "widget";
type SourceMode = "url" | "description";

type Tokens = {
  primary_color: string;
  secondary_color: string;
  font_family: string;
  border_radius: string;
  source?: string;
};

type JobRow = {
  id: string;
  status: string;
  step: string | null;
  progress_percent: number;
  error_message: string | null;
};

const DEFAULT_PROMPT =
  "Generate a brand-matched donation website using the provided brand colors and font. " +
  "Make it warm, welcoming, and focused on community support.";

function ColorSwatch({ color }: { color: string }) {
  const safe = color.startsWith("#") ? color : "#" + color;
  return (
    <span
      style={{
        display: "inline-block",
        width: 20,
        height: 20,
        borderRadius: 4,
        background: safe,
        border: "1px solid #ddd",
        verticalAlign: "middle",
        marginRight: 6,
      }}
    />
  );
}

function StepIndicator({ step }: { step: Step }) {
  const steps: Step[] = ["type", "source", "tokens", "generating", "edit", "embed"];
  const labels: Record<string, string> = {
    type: "Choose",
    source: "Source",
    tokens: "Tokens",
    generating: "Generate",
    edit: "Edit",
    embed: "Embed",
  };
  const current = steps.indexOf(step === "extracting" ? "tokens" : step);
  return (
    <div style={{ display: "flex", gap: "0.25rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
      {steps.map((s, i) => (
        <div
          key={s}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
          }}
        >
          <span
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: i <= current ? "#1D9E75" : "#eee",
              color: i <= current ? "#fff" : "#999",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            {i + 1}
          </span>
          <span style={{ fontSize: 12, color: i <= current ? "#333" : "#aaa" }}>{labels[s]}</span>
          {i < steps.length - 1 && (
            <span style={{ color: "#ddd", margin: "0 0.15rem" }}>›</span>
          )}
        </div>
      ))}
    </div>
  );
}

export default function DesignStudioPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("type");
  const [productType, setProductType] = useState<ProductType>("full");
  const [sourceMode, setSourceMode] = useState<SourceMode>("url");
  const [urlInput, setUrlInput] = useState("");
  const [descInput, setDescInput] = useState("");
  const [extractError, setExtractError] = useState("");
  const [tokens, setTokens] = useState<Tokens>({
    primary_color: "#1D9E75",
    secondary_color: "#0F6B50",
    font_family: "Inter",
    border_radius: "8px",
  });
  const [job, setJob] = useState<JobRow | null>(null);
  const [genError, setGenError] = useState("");
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [localRecipe, setLocalRecipe] = useState<AiSiteRecipeV1 | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const handleExtract = async () => {
    if (!campaignId) return;
    setExtractError("");
    setStep("extracting");
    try {
      const body =
        sourceMode === "url"
          ? { url: urlInput.trim() }
          : { description: descInput.trim() };
      const res = await api.post<{ tokens: Tokens }>(
        API_ENDPOINTS.campaigns.designExtractTokens(campaignId),
        body,
      );
      setTokens(res.data.tokens);
      setStep("tokens");
    } catch (err) {
      setExtractError(getErrorMessage(err));
      setStep("source");
    }
  };

  const handleGenerate = async () => {
    if (!campaignId) return;
    setGenError("");
    setStep("generating");
    try {
      const theme: RecipeTheme = {
        primary_color: tokens.primary_color,
        secondary_color: tokens.secondary_color,
        font_family: tokens.font_family,
        border_radius: tokens.border_radius,
      };
      const res = await api.post<{ job: JobRow }>(
        API_ENDPOINTS.aiSite.generate(campaignId),
        { prompt: DEFAULT_PROMPT, theme },
      );
      const jobRow = res.data.job;
      setJob(jobRow);

      pollRef.current = setInterval(async () => {
        try {
          const pollRes = await api.get<{ job: JobRow }>(
            API_ENDPOINTS.aiSite.job(campaignId, jobRow.id),
          );
          const updated = pollRes.data.job;
          setJob(updated);
          if (updated.status === "completed") {
            if (pollRef.current) clearInterval(pollRef.current);
            await fetchCampaignForEdit();
          } else if (updated.status === "failed") {
            if (pollRef.current) clearInterval(pollRef.current);
            setGenError(updated.error_message || "Generation failed.");
            setStep("tokens");
          }
        } catch {
          // ignore poll errors
        }
      }, 1500);
    } catch (err) {
      setGenError(getErrorMessage(err));
      setStep("tokens");
    }
  };

  const fetchCampaignForEdit = async () => {
    if (!campaignId) return;
    try {
      const res = await api.get<Campaign>(API_ENDPOINTS.campaigns.public(campaignId));
      const camp = res.data;
      setCampaign(camp);
      const parsed = parseAiSiteRecipeFromDb(camp.ai_site_recipe);
      setLocalRecipe(parsed);
      setStep("edit");
    } catch {
      setStep("embed");
    }
  };

  const handleTextEdit = (nodeId: string, field: string, value: string) => {
    setLocalRecipe((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        nodes: prev.nodes.map((n) =>
          n.id === nodeId ? { ...n, props: { ...n.props, [field]: value } } : n,
        ),
      };
    });
  };

  const handleSaveEdits = async () => {
    if (!campaignId || !localRecipe) return;
    setSaveLoading(true);
    setSaveError("");
    try {
      await api.put(API_ENDPOINTS.campaigns.aiSiteRecipePut(campaignId), {
        recipe: localRecipe,
      });
      setStep("embed");
    } catch (err) {
      setSaveError(getErrorMessage(err));
    } finally {
      setSaveLoading(false);
    }
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: 800,
    margin: "2rem auto",
    padding: "0 1rem",
    fontFamily: "Inter, sans-serif",
  };

  const cardStyle: React.CSSProperties = {
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: 12,
    padding: "1.5rem",
  };

  // ── STEP: TYPE ───────────────────────────────────────────────
  if (step === "type") {
    return (
      <div style={containerStyle}>
        <StepIndicator step={step} />
        <div style={cardStyle}>
          <h2 style={{ margin: "0 0 0.5rem" }}>Design Studio</h2>
          <p style={{ color: "#666", marginBottom: "1.5rem" }}>
            Generate a brand-matched donation interface in minutes.
          </p>
          <p style={{ fontWeight: 600, marginBottom: "0.75rem" }}>What would you like to create?</p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
            {(["full", "widget"] as ProductType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setProductType(t)}
                style={{
                  flex: "1 1 200px",
                  maxWidth: 260,
                  padding: "1rem",
                  borderRadius: 8,
                  border: `2px solid ${productType === t ? "#1D9E75" : "#ddd"}`,
                  background: productType === t ? "#f0fdf8" : "#fafafa",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 15, color: productType === t ? "#1D9E75" : "#333" }}>
                  {t === "full" ? "Full Donation Website" : "Compact Widget"}
                </div>
                <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
                  {t === "full"
                    ? "Complete AI-generated page with hero, about, donate, and more"
                    : "Progress bar + live donations feed for sidebars and footers"}
                </div>
              </button>
            ))}
          </div>
          <Button type="primary" style={{ background: "#1D9E75", borderColor: "#1D9E75" }} onClick={() => setStep("source")}>
            Continue →
          </Button>
          <Button type="text" style={{ marginLeft: "0.5rem" }} onClick={() => navigate(`/dashboard`)}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  // ── STEP: SOURCE ─────────────────────────────────────────────
  if (step === "source") {
    const domainLabel = urlInput.trim() ? (() => { try { return new URL(urlInput.trim()).hostname; } catch { return urlInput.trim(); } })() : "";
    return (
      <div style={containerStyle}>
        <StepIndicator step={step} />
        <div style={cardStyle}>
          <h2 style={{ margin: "0 0 0.5rem" }}>Inspiration Source</h2>
          <p style={{ color: "#666", marginBottom: "1.25rem" }}>
            We'll extract your brand's colors and fonts to match your donation page.
          </p>

          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
            {(["url", "description"] as SourceMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setSourceMode(m)}
                style={{
                  padding: "0.4rem 1rem",
                  borderRadius: 6,
                  border: `1px solid ${sourceMode === m ? "#1D9E75" : "#ddd"}`,
                  background: sourceMode === m ? "#f0fdf8" : "#fff",
                  color: sourceMode === m ? "#1D9E75" : "#555",
                  cursor: "pointer",
                  fontWeight: sourceMode === m ? 600 : 400,
                  fontSize: 13,
                }}
              >
                {m === "url" ? "My website URL" : "Describe the look"}
              </button>
            ))}
          </div>

          {sourceMode === "url" ? (
            <div>
              <Input
                size="large"
                placeholder="https://yourcompany.com"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onPressEnter={handleExtract}
                style={{ marginBottom: "0.5rem" }}
              />
              {extractError && <p style={{ color: "#dc2626", fontSize: 13, marginBottom: "0.5rem" }}>{extractError}</p>}
            </div>
          ) : (
            <div>
              <Input.TextArea
                rows={4}
                placeholder="e.g. Modern tech company, blue and white, clean sans-serif, rounded buttons..."
                value={descInput}
                onChange={(e) => setDescInput(e.target.value)}
                style={{ marginBottom: "0.5rem" }}
              />
              {extractError && <p style={{ color: "#dc2626", fontSize: 13, marginBottom: "0.5rem" }}>{extractError}</p>}
            </div>
          )}

          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
            <Button
              type="primary"
              style={{ background: "#1D9E75", borderColor: "#1D9E75" }}
              onClick={handleExtract}
              disabled={sourceMode === "url" ? !urlInput.trim() : !descInput.trim()}
            >
              {sourceMode === "url" ? `Analyze ${domainLabel || "site"} →` : "Generate tokens →"}
            </Button>
            <Button type="text" onClick={() => setStep("type")}>← Back</Button>
          </div>
        </div>
      </div>
    );
  }

  // ── STEP: EXTRACTING ─────────────────────────────────────────
  if (step === "extracting") {
    const domainLabel = (() => { try { return new URL(urlInput.trim()).hostname; } catch { return ""; } })();
    return (
      <div style={containerStyle}>
        <StepIndicator step={step} />
        <div style={{ ...cardStyle, textAlign: "center", padding: "3rem 1.5rem" }}>
          <Spin size="large" />
          <p style={{ marginTop: "1rem", color: "#555" }}>
            {sourceMode === "url"
              ? `Analyzing ${domainLabel || urlInput}…`
              : "Generating design tokens from your description…"}
          </p>
        </div>
      </div>
    );
  }

  // ── STEP: TOKENS ─────────────────────────────────────────────
  if (step === "tokens") {
    return (
      <div style={containerStyle}>
        <StepIndicator step={step} />
        <div style={cardStyle}>
          <h2 style={{ margin: "0 0 0.5rem" }}>Extracted Design Tokens</h2>
          <p style={{ color: "#666", marginBottom: "1.25rem" }}>
            Review and adjust the brand tokens before generating your donation page.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
            <div>
              <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Primary color</label>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input
                  type="color"
                  value={tokens.primary_color.startsWith("#") ? tokens.primary_color : "#" + tokens.primary_color}
                  onChange={(e) => setTokens((t) => ({ ...t, primary_color: e.target.value }))}
                  style={{ width: 32, height: 32, border: "1px solid #ddd", borderRadius: 4, padding: 2, cursor: "pointer" }}
                />
                <Input
                  value={tokens.primary_color}
                  onChange={(e) => setTokens((t) => ({ ...t, primary_color: e.target.value }))}
                  style={{ fontFamily: "monospace", fontSize: 13 }}
                />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Secondary color</label>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input
                  type="color"
                  value={tokens.secondary_color.startsWith("#") ? tokens.secondary_color : "#" + tokens.secondary_color}
                  onChange={(e) => setTokens((t) => ({ ...t, secondary_color: e.target.value }))}
                  style={{ width: 32, height: 32, border: "1px solid #ddd", borderRadius: 4, padding: 2, cursor: "pointer" }}
                />
                <Input
                  value={tokens.secondary_color}
                  onChange={(e) => setTokens((t) => ({ ...t, secondary_color: e.target.value }))}
                  style={{ fontFamily: "monospace", fontSize: 13 }}
                />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Font family</label>
              <Select
                value={tokens.font_family}
                onChange={(v) => setTokens((t) => ({ ...t, font_family: v }))}
                style={{ width: "100%" }}
                options={["Inter", "Georgia", "Roboto", "Merriweather", "Lato", tokens.font_family]
                  .filter((v, i, a) => a.indexOf(v) === i)
                  .map((f) => ({ value: f, label: f }))}
                showSearch
                allowClear={false}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Border radius</label>
              <Input
                value={tokens.border_radius}
                onChange={(e) => setTokens((t) => ({ ...t, border_radius: e.target.value }))}
              />
            </div>
          </div>

          {/* Token preview bar */}
          <div
            style={{
              padding: "0.75rem 1rem",
              borderRadius: tokens.border_radius || "8px",
              background: tokens.primary_color,
              color: "#fff",
              fontFamily: `'${tokens.font_family}', sans-serif`,
              fontSize: 14,
              fontWeight: 600,
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <ColorSwatch color={tokens.primary_color} />
            Preview: Donate Now
          </div>

          {genError && <p style={{ color: "#dc2626", fontSize: 13, marginBottom: "1rem" }}>{genError}</p>}

          <div style={{ display: "flex", gap: "0.5rem" }}>
            {productType === "full" ? (
              <Button type="primary" style={{ background: "#1D9E75", borderColor: "#1D9E75" }} onClick={handleGenerate}>
                Generate website →
              </Button>
            ) : (
              <Button type="primary" style={{ background: "#1D9E75", borderColor: "#1D9E75" }} onClick={() => setStep("embed")}>
                Get embed code →
              </Button>
            )}
            <Button type="text" onClick={() => setStep("source")}>← Back</Button>
          </div>
        </div>
      </div>
    );
  }

  // ── STEP: GENERATING ─────────────────────────────────────────
  if (step === "generating") {
    const pct = job?.progress_percent ?? 0;
    const stepLabel = job?.step || "Starting…";
    return (
      <div style={containerStyle}>
        <StepIndicator step={step} />
        <div style={{ ...cardStyle, textAlign: "center", padding: "3rem 1.5rem" }}>
          <p style={{ fontWeight: 600, marginBottom: "1rem", fontSize: 16 }}>Generating your branded site…</p>
          <Progress
            percent={pct}
            status={job?.status === "failed" ? "exception" : "active"}
            strokeColor="#1D9E75"
            style={{ maxWidth: 400, margin: "0 auto 1rem" }}
          />
          <p style={{ color: "#555", fontSize: 13 }}>{stepLabel}</p>
        </div>
      </div>
    );
  }

  // ── STEP: EDIT ───────────────────────────────────────────────
  if (step === "edit") {
    return (
      <div style={{ maxWidth: "100%", padding: "0 1rem" }}>
        <div
          style={{
            maxWidth: 800,
            margin: "1.5rem auto 0",
            padding: "0.75rem 1rem",
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              background: "#fef9c3",
              color: "#854d0e",
              padding: "0.25rem 0.6rem",
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            ✏ Edit Mode ON — click any text to edit
          </span>
          {saveError && <span style={{ color: "#dc2626", fontSize: 12 }}>{saveError}</span>}
          <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem" }}>
            <Button
              type="primary"
              loading={saveLoading}
              style={{ background: "#1D9E75", borderColor: "#1D9E75" }}
              onClick={handleSaveEdits}
            >
              Save Changes
            </Button>
            <Button type="text" onClick={() => setStep("embed")}>
              Skip →
            </Button>
          </div>
        </div>
        {localRecipe && campaign ? (
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <AiSiteRenderer
              campaign={campaign}
              recipe={localRecipe}
              onDonateClick={() => {}}
              stickyDonate={false}
              editMode={true}
              onTextEdit={handleTextEdit}
            />
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <Spin />
          </div>
        )}
      </div>
    );
  }

  // ── STEP: EMBED ──────────────────────────────────────────────
  if (step === "embed") {
    const embedCampaign = campaign ?? { id: campaignId ?? "", title: undefined, slug: undefined };
    return (
      <div style={containerStyle}>
        <StepIndicator step={step} />
        <div style={cardStyle}>
          <h2 style={{ margin: "0 0 0.5rem" }}>Your embed is ready</h2>
          <p style={{ color: "#666", marginBottom: "0.5rem" }}>
            Copy the snippet below and paste it into any website.
          </p>
          <EmbedGenerator
            campaign={embedCampaign}
            initialType={productType === "full" ? "full" : "widget"}
            initialColor={tokens.primary_color.replace(/^#/, "")}
          />
          <div style={{ marginTop: "1.5rem", borderTop: "1px solid #eee", paddingTop: "1rem" }}>
            <Button type="text" onClick={() => navigate("/dashboard")}>
              ← Back to dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
