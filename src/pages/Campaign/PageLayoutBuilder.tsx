import { useState, useEffect, useCallback } from "react";
import { Button } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import api, { getErrorMessage } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import { BlockRenderer, Campaign } from "@/ui/DonateBlocks/BlockRenderer";
import { DonationModal } from "@/components/DonationModal/DonationModal";
import { validateLayout, setBlockTypes } from "@/lib/pageLayoutValidation";
import { notifyError, notifySuccess, notifyWarn } from "@/lib/notifications";
import GenericTextInput from "@/components/Form/GenericTextInput";

const DEFAULT_PRESETS = [5, 10, 25, 50, 100];

const FALLBACK_BLOCK_TYPES = [
  "hero",
  "campaign_info",
  "donate_button",
  "media_gallery",
  "text",
  "embed",
  "footer",
  "progress_tube",
];

function getPresetAmountsFromBlocks(blocks: Block[]): number[] {
  const donateBlock = blocks.find((b) => b.type === "donate_button");
  const presets = donateBlock?.props?.preset_amounts;
  if (Array.isArray(presets) && presets.length > 0) {
    return presets.filter((n) => typeof n === "number" && n > 0);
  }
  return DEFAULT_PRESETS;
}

interface Block {
  id: string;
  type: string;
  props: Record<string, string | number | boolean | number[] | null | undefined>;
}

const propAsString = (
  value: string | number | boolean | number[] | null | undefined,
  fallback = ""
): string => {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return fallback;
};

const propAsNumber = (
  value: string | number | boolean | number[] | null | undefined,
  fallback: number
): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const propAsBoolean = (
  value: string | number | boolean | number[] | null | undefined,
  fallback: boolean
): boolean => {
  if (typeof value === "boolean") return value;
  return fallback;
};

const PageLayoutBuilder = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [campaignPreviewData, setCampaignPreviewData] = useState<{
    title?: string;
    goal?: number;
    total_raised?: number;
    latest_winner?: { donor: string; amount_cents: number; created_at: string };
  } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  const [availableBlockTypes, setAvailableBlockTypes] = useState<string[]>(FALLBACK_BLOCK_TYPES);

  const fetchSchema = useCallback(async () => {
    try {
      const res = await api.get<{ block_types: string[] }>(API_ENDPOINTS.pageLayout.schema);
      const types = res.data?.block_types;
      if (Array.isArray(types) && types.length > 0) {
        setAvailableBlockTypes(types);
        setBlockTypes(types);
      }
    } catch (err) {
      notifyWarn(getErrorMessage(err) || "Could not load block schema; using default blocks.");
    }
  }, []);

  useEffect(() => {
    if (isPreviewMode && campaignId) {
      setPreviewLoading(true);
      api
        .get(API_ENDPOINTS.campaigns.public(campaignId))
        .then((res) => {
          setCampaignPreviewData({
            title: res.data.title,
            goal: res.data.goal,
            total_raised: res.data.total_raised,
            latest_winner: res.data.latest_winner,
          });
        })
        .catch(() => setCampaignPreviewData(null))
        .finally(() => setPreviewLoading(false));
    } else {
      setCampaignPreviewData(null);
    }
  }, [isPreviewMode, campaignId]);

  const loadLayout = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get(API_ENDPOINTS.pageLayout.get(campaignId!));
      const raw = response.data.page_layout;
      if (raw != null) {
        const blocksArray = Array.isArray(raw) ? raw : (raw?.blocks && Array.isArray(raw.blocks) ? raw.blocks : []);
        setBlocks(blocksArray);
      }
    } catch (err) {
      const errMsg = getErrorMessage(err);
      if (!errMsg.includes("not found")) {
        setError(errMsg);
      }
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    fetchSchema();
    if (campaignId) {
      loadLayout();
    }
  }, [campaignId, fetchSchema, loadLayout]);

  const addBlock = (type: string) => {
    const newBlock: Block = {
      id: `block-${Date.now()}`,
      type,
      props: {},
    };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlockProp = (
    blockId: string,
    key: string,
    value: string | number | boolean | number[] | null | undefined
  ) => {
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId ? { ...b, props: { ...b.props, [key]: value } } : b
      )
    );
  };

  const removeBlock = (blockId: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
    if (selectedBlock?.id === blockId) {
      setSelectedBlock(null);
    }
  };

  const saveLayout = async () => {
    setSaving(true);
    setError("");
    try {
      await api.put(API_ENDPOINTS.pageLayout.put(campaignId!), {
        page_layout: { blocks },
      });
      notifySuccess("Layout saved successfully!");
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      notifyError(msg || "Failed to save layout");
    } finally {
      setSaving(false);
    }
  };

  const handlePreviewToggle = () => {
    if (!isPreviewMode) {
      const result = validateLayout(blocks);
      if (!result.valid) {
        setError(result.error);
        return;
      }
      setError("");
    }
    setIsPreviewMode((prev) => !prev);
  };

  const campaignForPreview: Campaign = {
    id: campaignId!,
    title: campaignPreviewData?.title,
    goal: campaignPreviewData?.goal,
    total_raised: campaignPreviewData?.total_raised,
    latest_winner: campaignPreviewData?.latest_winner,
    page_layout: { blocks },
  };
  const presetAmounts = getPresetAmountsFromBlocks(blocks);

  if (loading) {
    return <div style={{ padding: "2rem" }}>Loading layout...</div>;
  }

  if (isPreviewMode) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        <div
          style={{
            padding: "0.75rem 1rem",
            borderBottom: "1px solid #ddd",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Button type="default" onClick={handlePreviewToggle}>
            Back to Edit
          </Button>
          <span style={{ color: "#666", fontSize: "0.9rem" }}>
            Preview: how donors will see this campaign
          </span>
        </div>
        <div style={{ flex: 1, overflow: "auto" }}>
          {previewLoading ? (
            <div className="donate-page" style={{ padding: "2rem" }}>
              <p>Loading preview…</p>
            </div>
          ) : (
            <div className="donate-page donate-page-blocks">
              <BlockRenderer
                campaign={campaignForPreview}
                onDonateClick={() => setPreviewModalOpen(true)}
              />
            </div>
          )}
        </div>
        <DonationModal
          open={previewModalOpen}
          onClose={() => setPreviewModalOpen(false)}
          campaignId={campaignId!}
          campaignTitle={campaignPreviewData?.title || "Campaign"}
          presetAmounts={presetAmounts}
        />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Left Panel - Block List */}
      <div style={{ width: "250px", borderRight: "1px solid #ddd", padding: "1rem", overflowY: "auto" }}>
        <h3>Add Blocks</h3>
        {availableBlockTypes.map((type) => (
          <Button
            key={type}
            onClick={() => addBlock(type)}
            style={{
              display: "block",
              width: "100%",
              marginBottom: "0.5rem",
            }}
          >
            + {type}
          </Button>
        ))}
      </div>

      {/* Center Panel - Canvas */}
      <div style={{ flex: 1, padding: "1rem", overflowY: "auto" }}>
        <div style={{ marginBottom: "1rem" }}>
          <h2>Page Layout Builder</h2>
          <p>Campaign ID: {campaignId}</p>
          {error && <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>}
          <Button type="primary" onClick={saveLayout} loading={saving} style={{ marginRight: "0.5rem" }}>
            {saving ? "Saving..." : "Save Layout"}
          </Button>
          <Button type="default" onClick={handlePreviewToggle} style={{ marginRight: "0.5rem" }}>
            Preview
          </Button>
          <Button
            type="default"
            onClick={() => navigate(`/campaign/layout-builder/${campaignId}`)}
            style={{ marginRight: "0.5rem" }}
          >
            Upload Media
          </Button>
          <Button type="default" onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
        </div>

        {blocks.length === 0 ? (
          <p>No blocks yet. Add blocks from the left panel.</p>
        ) : (
          <div>
            {blocks.map((block) => (
              <div
                key={block.id}
                onClick={() => setSelectedBlock(block)}
                style={{
                  border: selectedBlock?.id === block.id ? "2px solid blue" : "1px solid #ddd",
                  padding: "1rem",
                  marginBottom: "1rem",
                  cursor: "pointer",
                  borderRadius: "4px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong>{block.type}</strong>
                  <Button
                    type="default"
                    danger
                    onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}
                  >
                    Remove
                  </Button>
                </div>
                <pre style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>
                  {JSON.stringify(block.props, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Panel - Properties */}
      <div style={{ width: "300px", borderLeft: "1px solid #ddd", padding: "1rem", overflowY: "auto" }}>
        <h3>Properties</h3>
        {!selectedBlock ? (
          <p>Select a block to edit its properties.</p>
        ) : (
          <div>
            <h4>{selectedBlock.type}</h4>
            {selectedBlock.type === "hero" && (
              <>
                <label>
                  Title:
                  <GenericTextInput
                    value={propAsString(selectedBlock.props.title)}
                    setValue={(value) => updateBlockProp(selectedBlock.id, "title", String(value ?? ""))}
                    hideLabel
                    wrapperStyle={{ marginBottom: "0.5rem" }}
                    inputStyle={{ width: "100%" }}
                  />
                </label>
                <label>
                  Subtitle:
                  <GenericTextInput
                    value={propAsString(selectedBlock.props.subtitle)}
                    setValue={(value) => updateBlockProp(selectedBlock.id, "subtitle", String(value ?? ""))}
                    hideLabel
                    wrapperStyle={{ marginBottom: "0.5rem" }}
                    inputStyle={{ width: "100%" }}
                  />
                </label>
                <label>
                  Image URL:
                  <GenericTextInput
                    value={propAsString(selectedBlock.props.image_url)}
                    setValue={(value) => updateBlockProp(selectedBlock.id, "image_url", String(value ?? ""))}
                    hideLabel
                    wrapperStyle={{ marginBottom: "0.5rem" }}
                    inputStyle={{ width: "100%" }}
                  />
                </label>
                <label>
                  Background Color:
                  <GenericTextInput
                    value={propAsString(selectedBlock.props.background_color)}
                    setValue={(value) =>
                      updateBlockProp(selectedBlock.id, "background_color", String(value ?? ""))
                    }
                    hideLabel
                    wrapperStyle={{ marginBottom: "0.5rem" }}
                    inputStyle={{ width: "100%" }}
                  />
                </label>
              </>
            )}
            {selectedBlock.type === "text" && (
              <>
                <label>
                  Content:
                  <textarea
                    value={propAsString(selectedBlock.props.content)}
                    onChange={(e) => updateBlockProp(selectedBlock.id, "content", e.target.value)}
                    style={{ width: "100%", marginBottom: "0.5rem" }}
                    rows={5}
                  />
                </label>
                <label>
                  Align:
                  <select
                    value={propAsString(selectedBlock.props.align, "left")}
                    onChange={(e) => updateBlockProp(selectedBlock.id, "align", e.target.value)}
                    style={{ width: "100%", marginBottom: "0.5rem" }}
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </label>
              </>
            )}
            {selectedBlock.type === "embed" && (
              <>
                <label>
                  URL:
                  <GenericTextInput
                    value={propAsString(selectedBlock.props.url)}
                    setValue={(value) => updateBlockProp(selectedBlock.id, "url", String(value ?? ""))}
                    hideLabel
                    wrapperStyle={{ marginBottom: "0.5rem" }}
                    inputStyle={{ width: "100%" }}
                  />
                </label>
                <label>
                  Height (px):
                  <GenericTextInput
                    valueType="number"
                    value={propAsNumber(selectedBlock.props.height, 400)}
                    transformValue={(raw) => parseInt(raw, 10)}
                    setValue={(value) =>
                      updateBlockProp(selectedBlock.id, "height", Number(value))
                    }
                    hideLabel
                    wrapperStyle={{ marginBottom: "0.5rem" }}
                    inputStyle={{ width: "100%" }}
                  />
                </label>
              </>
            )}
            {selectedBlock.type === "donate_button" && (
              <>
                <label>
                  Label:
                  <GenericTextInput
                    value={propAsString(selectedBlock.props.label, "Donate Now")}
                    setValue={(value) => updateBlockProp(selectedBlock.id, "label", String(value ?? ""))}
                    hideLabel
                    wrapperStyle={{ marginBottom: "0.5rem" }}
                    inputStyle={{ width: "100%" }}
                  />
                </label>
                <label>
                  Min Amount:
                  <GenericTextInput
                    valueType="number"
                    value={propAsNumber(selectedBlock.props.min_amount, 1)}
                    transformValue={(raw) => parseInt(raw, 10)}
                    setValue={(value) =>
                      updateBlockProp(selectedBlock.id, "min_amount", Number(value))
                    }
                    hideLabel
                    wrapperStyle={{ marginBottom: "0.5rem" }}
                    inputStyle={{ width: "100%" }}
                  />
                </label>
              </>
            )}
            {selectedBlock.type === "footer" && (
              <>
                <label>
                  Text:
                  <GenericTextInput
                    value={propAsString(selectedBlock.props.text)}
                    setValue={(value) => updateBlockProp(selectedBlock.id, "text", String(value ?? ""))}
                    hideLabel
                    wrapperStyle={{ marginBottom: "0.5rem" }}
                    inputStyle={{ width: "100%" }}
                  />
                </label>
                <label>
                  <GenericTextInput
                    valueType="checkbox"
                    value={propAsBoolean(selectedBlock.props.show_org_name, false)}
                    setValue={(value) => updateBlockProp(selectedBlock.id, "show_org_name", Boolean(value))}
                    hideLabel
                    wrapperStyle={{ marginBottom: 0, display: "inline-block" }}
                  />
                  Show Organization Name
                </label>
              </>
            )}
            {selectedBlock.type === "campaign_info" && (
              <>
                <label>
                  <GenericTextInput
                    valueType="checkbox"
                    value={selectedBlock.props.show_goal !== false}
                    setValue={(value) => updateBlockProp(selectedBlock.id, "show_goal", Boolean(value))}
                    hideLabel
                    wrapperStyle={{ marginBottom: 0, display: "inline-block" }}
                  />
                  Show Goal
                </label>
                <label>
                  <GenericTextInput
                    valueType="checkbox"
                    value={selectedBlock.props.show_progress_bar !== false}
                    setValue={(value) =>
                      updateBlockProp(selectedBlock.id, "show_progress_bar", Boolean(value))
                    }
                    hideLabel
                    wrapperStyle={{ marginBottom: 0, display: "inline-block" }}
                  />
                  Show Progress Bar
                </label>
                <label>
                  <GenericTextInput
                    valueType="checkbox"
                    value={selectedBlock.props.show_donations_count !== false}
                    setValue={(value) =>
                      updateBlockProp(selectedBlock.id, "show_donations_count", Boolean(value))
                    }
                    hideLabel
                    wrapperStyle={{ marginBottom: 0, display: "inline-block" }}
                  />
                  Show Donations Count
                </label>
                <label>
                  <GenericTextInput
                    valueType="checkbox"
                    value={selectedBlock.props.show_winner === true}
                    setValue={(value) => updateBlockProp(selectedBlock.id, "show_winner", Boolean(value))}
                    hideLabel
                    wrapperStyle={{ marginBottom: 0, display: "inline-block" }}
                  />
                  Show Giveaway Winner
                </label>
              </>
            )}
            {selectedBlock.type === "media_gallery" && (
              <>
                <label>
                  Columns:
                  <select
                    value={propAsNumber(selectedBlock.props.columns, 3)}
                    onChange={(e) => updateBlockProp(selectedBlock.id, "columns", parseInt(e.target.value))}
                    style={{ width: "100%", marginBottom: "0.5rem" }}
                  >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                  </select>
                </label>
                <label>
                  Aspect Ratio:
                  <select
                    value={propAsString(selectedBlock.props.aspect_ratio, "auto")}
                    onChange={(e) => updateBlockProp(selectedBlock.id, "aspect_ratio", e.target.value)}
                    style={{ width: "100%", marginBottom: "0.5rem" }}
                  >
                    <option value="square">Square</option>
                    <option value="landscape">Landscape</option>
                    <option value="portrait">Portrait</option>
                    <option value="auto">Auto</option>
                  </select>
                </label>
              </>
            )}
            {selectedBlock.type === "progress_tube" && (
              <>
                <label>
                  Label (optional heading):
                  <GenericTextInput
                    value={propAsString(selectedBlock.props.label)}
                    setValue={(value) => updateBlockProp(selectedBlock.id, "label", String(value ?? ""))}
                    placeholder="e.g. Our Progress"
                    hideLabel
                    wrapperStyle={{ marginBottom: "0.5rem" }}
                    inputStyle={{ width: "100%" }}
                  />
                </label>
                <label>
                  <GenericTextInput
                    valueType="checkbox"
                    value={selectedBlock.props.show_percent === true}
                    setValue={(value) => updateBlockProp(selectedBlock.id, "show_percent", Boolean(value))}
                    hideLabel
                    wrapperStyle={{ marginBottom: 0, display: "inline-block" }}
                  />
                  {" "}Show Percentage
                </label>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageLayoutBuilder;
