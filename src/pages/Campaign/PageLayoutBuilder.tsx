import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { getErrorMessage } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import { BlockRenderer, Campaign } from "@/ui/DonateBlocks/BlockRenderer";
import { DonationModal } from "@/components/DonationModal/DonationModal";
import { validateLayout } from "@/lib/pageLayoutValidation";

const DEFAULT_PRESETS = [5, 10, 25, 50, 100];

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
  props: Record<string, any>;
}

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

  const availableBlockTypes = [
    "hero",
    "campaign_info",
    "donate_button",
    "media_gallery",
    "text",
    "embed",
    "footer",
  ];

  useEffect(() => {
    if (campaignId) {
      loadLayout();
    }
  }, [campaignId]);

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

  const loadLayout = async () => {
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
  };

  const addBlock = (type: string) => {
    const newBlock: Block = {
      id: `block-${Date.now()}`,
      type,
      props: {},
    };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlockProp = (blockId: string, key: string, value: any) => {
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
      alert("Layout saved successfully!");
    } catch (err) {
      setError(getErrorMessage(err));
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
          <button type="button" onClick={handlePreviewToggle}>
            Back to Edit
          </button>
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
          <button
            key={type}
            onClick={() => addBlock(type)}
            style={{
              display: "block",
              width: "100%",
              marginBottom: "0.5rem",
              padding: "0.5rem",
            }}
          >
            + {type}
          </button>
        ))}
      </div>

      {/* Center Panel - Canvas */}
      <div style={{ flex: 1, padding: "1rem", overflowY: "auto" }}>
        <div style={{ marginBottom: "1rem" }}>
          <h2>Page Layout Builder</h2>
          <p>Campaign ID: {campaignId}</p>
          {error && <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>}
          <button onClick={saveLayout} disabled={saving} style={{ marginRight: "0.5rem" }}>
            {saving ? "Saving..." : "Save Layout"}
          </button>
          <button type="button" onClick={handlePreviewToggle} style={{ marginRight: "0.5rem" }}>
            Preview
          </button>
          <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
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
                  <button onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}>
                    Remove
                  </button>
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
                  <input
                    type="text"
                    value={selectedBlock.props.title || ""}
                    onChange={(e) => updateBlockProp(selectedBlock.id, "title", e.target.value)}
                    style={{ width: "100%", marginBottom: "0.5rem" }}
                  />
                </label>
                <label>
                  Subtitle:
                  <input
                    type="text"
                    value={selectedBlock.props.subtitle || ""}
                    onChange={(e) => updateBlockProp(selectedBlock.id, "subtitle", e.target.value)}
                    style={{ width: "100%", marginBottom: "0.5rem" }}
                  />
                </label>
                <label>
                  Image URL:
                  <input
                    type="text"
                    value={selectedBlock.props.image_url || ""}
                    onChange={(e) => updateBlockProp(selectedBlock.id, "image_url", e.target.value)}
                    style={{ width: "100%", marginBottom: "0.5rem" }}
                  />
                </label>
                <label>
                  Background Color:
                  <input
                    type="text"
                    value={selectedBlock.props.background_color || ""}
                    onChange={(e) => updateBlockProp(selectedBlock.id, "background_color", e.target.value)}
                    style={{ width: "100%", marginBottom: "0.5rem" }}
                  />
                </label>
              </>
            )}
            {selectedBlock.type === "text" && (
              <>
                <label>
                  Content:
                  <textarea
                    value={selectedBlock.props.content || ""}
                    onChange={(e) => updateBlockProp(selectedBlock.id, "content", e.target.value)}
                    style={{ width: "100%", marginBottom: "0.5rem" }}
                    rows={5}
                  />
                </label>
                <label>
                  Align:
                  <select
                    value={selectedBlock.props.align || "left"}
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
                  <input
                    type="text"
                    value={selectedBlock.props.url || ""}
                    onChange={(e) => updateBlockProp(selectedBlock.id, "url", e.target.value)}
                    style={{ width: "100%", marginBottom: "0.5rem" }}
                  />
                </label>
                <label>
                  Height (px):
                  <input
                    type="number"
                    value={selectedBlock.props.height || 400}
                    onChange={(e) => updateBlockProp(selectedBlock.id, "height", parseInt(e.target.value))}
                    style={{ width: "100%", marginBottom: "0.5rem" }}
                  />
                </label>
              </>
            )}
            {selectedBlock.type === "donate_button" && (
              <>
                <label>
                  Label:
                  <input
                    type="text"
                    value={selectedBlock.props.label || "Donate Now"}
                    onChange={(e) => updateBlockProp(selectedBlock.id, "label", e.target.value)}
                    style={{ width: "100%", marginBottom: "0.5rem" }}
                  />
                </label>
                <label>
                  Min Amount:
                  <input
                    type="number"
                    value={selectedBlock.props.min_amount || 1}
                    onChange={(e) => updateBlockProp(selectedBlock.id, "min_amount", parseInt(e.target.value))}
                    style={{ width: "100%", marginBottom: "0.5rem" }}
                  />
                </label>
              </>
            )}
            {selectedBlock.type === "footer" && (
              <>
                <label>
                  Text:
                  <input
                    type="text"
                    value={selectedBlock.props.text || ""}
                    onChange={(e) => updateBlockProp(selectedBlock.id, "text", e.target.value)}
                    style={{ width: "100%", marginBottom: "0.5rem" }}
                  />
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedBlock.props.show_org_name || false}
                    onChange={(e) => updateBlockProp(selectedBlock.id, "show_org_name", e.target.checked)}
                  />
                  Show Organization Name
                </label>
              </>
            )}
            {selectedBlock.type === "campaign_info" && (
              <>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedBlock.props.show_goal !== false}
                    onChange={(e) => updateBlockProp(selectedBlock.id, "show_goal", e.target.checked)}
                  />
                  Show Goal
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedBlock.props.show_progress_bar !== false}
                    onChange={(e) => updateBlockProp(selectedBlock.id, "show_progress_bar", e.target.checked)}
                  />
                  Show Progress Bar
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedBlock.props.show_donations_count !== false}
                    onChange={(e) => updateBlockProp(selectedBlock.id, "show_donations_count", e.target.checked)}
                  />
                  Show Donations Count
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedBlock.props.show_winner === true}
                    onChange={(e) => updateBlockProp(selectedBlock.id, "show_winner", e.target.checked)}
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
                    value={selectedBlock.props.columns || 3}
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
                    value={selectedBlock.props.aspect_ratio || "auto"}
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
          </div>
        )}
      </div>
    </div>
  );
};

export default PageLayoutBuilder;
