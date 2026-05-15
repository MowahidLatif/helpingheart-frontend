import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback, FormEvent } from "react";
import { Progress, Input, Button, Upload, List, Typography, Alert, Steps, Space, Spin } from "antd";
import type { UploadFile } from "antd";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import api, { getErrorMessage } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import {
  MAX_CAMPAIGN_DOCS,
  MAX_CAMPAIGN_IMAGES,
  MAX_CAMPAIGN_VIDEOS,
} from "@/lib/campaignMediaLimits";
import { uploadMediaToS3, inferMediaType, type PersistedMedia } from "@/lib/mediaUpload";
import { AiSiteRenderer } from "@/ui/AiSite/AiSiteRenderer";
import { DonationModal } from "@/components/DonationModal/DonationModal";
import type { Campaign } from "@/ui/DonateBlocks/BlockRenderer";
import { getDonatePresetsFromRecipe, parseAiSiteRecipeFromDb } from "@/lib/aiSiteRecipe";
import { notifyError } from "@/lib/notifications";
import GenericTextInput from "@/components/Form/GenericTextInput";

const { TextArea } = Input;
const { Text } = Typography;

const stripePk = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePk?.startsWith("pk_") ? loadStripe(stripePk) : null;

const requirePlatformPay =
  import.meta.env.VITE_REQUIRE_PLATFORM_PAYMENT_FOR_AI === "true" ||
  import.meta.env.VITE_REQUIRE_PLATFORM_PAYMENT_FOR_AI === "1";

const STEP_DETAILS = 0;
const STEP_ASSETS = 1;
const STEP_DESCRIBE = 2;
const STEP_GENERATING = 3;
const STEP_PREVIEW = 4;

const STEP_ITEMS = [
  { title: "Details" },
  { title: "Assets" },
  { title: "Describe" },
  { title: "Generating" },
  { title: "Preview" },
];

const PUBLIC_POLL_MS = 12_000;

type JobRow = {
  id: string;
  status: string;
  step: string | null;
  progress_percent: number;
  error_message: string | null;
};

export type CampaignAiWizardMode = "new" | "resume";

type Props = {
  mode: CampaignAiWizardMode;
  /** Set when mode is "resume" (from route :campaignId) */
  initialCampaignId?: string;
};

function PlatformPaymentForm({
  amountCents,
  onSucceeded,
  onError,
}: {
  amountCents: number;
  onSucceeded: (paymentIntentId: string) => void;
  onError: (msg: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    onError("");
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });
      if (error) {
        const msg = error.message ?? "Payment failed";
        onError(msg);
        notifyError(msg);
        return;
      }
      if (paymentIntent?.status === "succeeded" && paymentIntent.id) {
        onSucceeded(paymentIntent.id);
      } else {
        const msg = "Payment not completed";
        onError(msg);
        notifyError(msg);
      }
    } catch (err) {
      const msg = getErrorMessage(err);
      onError(msg);
      notifyError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 12 }}>
      <Text type="secondary">
        Platform fee: ${(amountCents / 100).toFixed(2)} — supports AI site generation.
      </Text>
      <div style={{ marginTop: 12 }}>
        <PaymentElement />
      </div>
      <Button type="primary" htmlType="submit" disabled={loading} style={{ marginTop: 12 }}>
        {loading ? "Processing…" : "Pay and continue"}
      </Button>
    </form>
  );
}

const DEFAULT_PRESETS = [5, 10, 25, 50, 100];

function mediaCountsByType(items: PersistedMedia[]) {
  return {
    image: items.filter((m) => m.type === "image").length,
    video: items.filter((m) => m.type === "video").length,
    doc: items.filter((m) => m.type === "doc").length,
  };
}

function getPresetAmounts(campaign: Campaign | null): number[] {
  const recipe = parseAiSiteRecipeFromDb(campaign?.ai_site_recipe);
  if (recipe) return getDonatePresetsFromRecipe(recipe);
  return DEFAULT_PRESETS;
}

export default function CampaignAiWizardPage({ mode, initialCampaignId }: Props) {
  const navigate = useNavigate();
  const [resumeLoading, setResumeLoading] = useState(mode === "resume");

  const [step, setStep] = useState(mode === "new" ? STEP_DETAILS : STEP_ASSETS);
  const [campaignId, setCampaignId] = useState<string | null>(
    mode === "resume" && initialCampaignId ? initialCampaignId : null
  );

  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [status, setStatus] = useState("draft");
  const [feeOption, setFeeOption] = useState<"donor_pays" | "platform_absorbs">(
    "donor_pays"
  );
  const [giveawayPrize, setGiveawayPrize] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  const [campaignTitle, setCampaignTitle] = useState("");
  const [media, setMedia] = useState<PersistedMedia[]>([]);
  const [prompt, setPrompt] = useState("");
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [error, setError] = useState("");
  const [job, setJob] = useState<JobRow | null>(null);
  const [platformPiId, setPlatformPiId] = useState<string | null>(null);
  const [platformClientSecret, setPlatformClientSecret] = useState<string | null>(null);
  const [platformAmountCents, setPlatformAmountCents] = useState(0);
  const [platformDevMode, setPlatformDevMode] = useState(false);

  const [previewCampaign, setPreviewCampaign] = useState<Campaign | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const loadMedia = useCallback(async () => {
    if (!campaignId) return;
    setLoadingMedia(true);
    try {
      const res = await api.get(API_ENDPOINTS.campaigns.media(campaignId));
      setMedia(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoadingMedia(false);
    }
  }, [campaignId]);

  const fetchPublicCampaign = useCallback(async () => {
    if (!campaignId) return;
    try {
      const res = await api.get(API_ENDPOINTS.campaigns.public(campaignId));
      setPreviewCampaign(res.data);
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }, [campaignId]);

  useEffect(() => {
    if (mode !== "resume" || !initialCampaignId) {
      setResumeLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get(API_ENDPOINTS.campaigns.get(initialCampaignId));
        if (cancelled) return;
        setCampaignId(initialCampaignId);
        setCampaignTitle(res.data?.title || "");
        const recipe = parseAiSiteRecipeFromDb(res.data?.ai_site_recipe);
        if (recipe) {
          setStep(STEP_PREVIEW);
          setPreviewLoading(true);
          try {
            const pub = await api.get(API_ENDPOINTS.campaigns.public(initialCampaignId));
            if (!cancelled) setPreviewCampaign(pub.data);
          } finally {
            if (!cancelled) setPreviewLoading(false);
          }
        } else {
          setStep(STEP_ASSETS);
        }
      } catch {
        if (!cancelled) {
          setError("Could not load campaign");
          setStep(STEP_ASSETS);
        }
      } finally {
        if (!cancelled) setResumeLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mode, initialCampaignId]);

  useEffect(() => {
    if (!campaignId || step < STEP_ASSETS) return;
    loadMedia();
  }, [campaignId, step, loadMedia]);

  useEffect(() => {
    if (!requirePlatformPay || !campaignId || step !== STEP_DESCRIBE) return;
    (async () => {
      try {
        const res = await api.post(API_ENDPOINTS.platform.aiGenerationCheckout, {});
        setPlatformClientSecret(res.data.clientSecret ?? null);
        setPlatformAmountCents(Number(res.data.amount_cents) || 0);
        setPlatformDevMode(!!res.data.dev_mode);
        if (res.data.dev_mode && res.data.paymentIntentId) {
          setPlatformPiId(res.data.paymentIntentId);
        }
      } catch (e) {
        const msg = getErrorMessage(e);
        setError(msg);
        notifyError(msg);
      }
    })();
  }, [campaignId, step]);

  useEffect(() => {
    if (!job || !campaignId || step !== STEP_GENERATING) return;
    if (job.status === "failed") {
      setError(job.error_message || "Generation failed");
      setGenerateLoading(false);
      setStep(STEP_DESCRIBE);
      return;
    }
    if (job.status === "completed") {
      setGenerateLoading(false);
      setStep(STEP_PREVIEW);
      setPreviewLoading(true);
      fetchPublicCampaign().finally(() => setPreviewLoading(false));
      return;
    }
    if (job.status !== "pending" && job.status !== "running") {
      return;
    }
    const t = window.setInterval(async () => {
      try {
        const res = await api.get(API_ENDPOINTS.aiSite.job(campaignId, job.id));
        const j = res.data?.job as JobRow;
        if (j) {
          setJob(j);
          if (j.status === "failed") {
            setError(j.error_message || "Generation failed");
            setGenerateLoading(false);
            setStep(STEP_DESCRIBE);
          }
          if (j.status === "completed") {
            setGenerateLoading(false);
            setStep(STEP_PREVIEW);
            setPreviewLoading(true);
            fetchPublicCampaign().finally(() => setPreviewLoading(false));
          }
        }
      } catch {
        /* ignore */
      }
    }, 1500);
    return () => window.clearInterval(t);
  }, [job, campaignId, step, fetchPublicCampaign]);

  useEffect(() => {
    if (step !== STEP_PREVIEW || !campaignId) return;
    fetchPublicCampaign();
    const interval = window.setInterval(fetchPublicCampaign, PUBLIC_POLL_MS);
    return () => window.clearInterval(interval);
  }, [step, campaignId, fetchPublicCampaign]);

  const handleCreateNext = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    setCreateLoading(true);
    try {
      const payload: {
        title: string;
        goal: number;
        status: string;
        fee_option: "donor_pays" | "platform_absorbs";
        giveaway_prize_cents?: number;
      } = {
        title: title.trim(),
        goal: parseFloat(goal) || 0,
        status,
        fee_option: feeOption,
      };
      if (giveawayPrize) {
        payload.giveaway_prize_cents = Math.round(parseFloat(giveawayPrize) * 100);
      }
      if (campaignId) {
        await api.patch(API_ENDPOINTS.campaigns.patch(campaignId), payload);
        setCampaignTitle(title.trim());
      } else {
        const response = await api.post(API_ENDPOINTS.campaigns.create, payload);
        const id = response.data.id as string;
        setCampaignId(id);
        setCampaignTitle(title.trim());
      }
      setStep(STEP_ASSETS);
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      notifyError(msg);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpload = async (file: UploadFile) => {
    if (!campaignId || !file.originFileObj) return false;
    setError("");
    const inferred = inferMediaType(file.originFileObj);
    const counts = mediaCountsByType(media);
    if (inferred === "image" && counts.image >= MAX_CAMPAIGN_IMAGES) {
      setError(`Campaign media limit reached for type image (max ${MAX_CAMPAIGN_IMAGES}).`);
      return false;
    }
    if (inferred === "video" && counts.video >= MAX_CAMPAIGN_VIDEOS) {
      setError(`Campaign media limit reached for type video (max ${MAX_CAMPAIGN_VIDEOS}).`);
      return false;
    }
    if (inferred === "doc" && counts.doc >= MAX_CAMPAIGN_DOCS) {
      setError(`Campaign media limit reached for type doc (max ${MAX_CAMPAIGN_DOCS}).`);
      return false;
    }
    try {
      const row = await uploadMediaToS3(
        campaignId,
        file.originFileObj,
        inferMediaType(file.originFileObj)
      );
      setMedia((m) => [...m, row]);
    } catch (e) {
      const msg = getErrorMessage(e);
      setError(msg);
      notifyError(msg);
    }
    return false;
  };

  const handleGenerate = async () => {
    if (!campaignId) return;
    const p = prompt.trim();
    if (!p) {
      setError("Describe your page in the prompt field.");
      return;
    }
    if (requirePlatformPay && !platformPiId) {
      setError("Complete platform payment first, or disable VITE_REQUIRE_PLATFORM_PAYMENT_FOR_AI.");
      return;
    }
    setError("");
    setGenerateLoading(true);
    setJob(null);
    try {
      const body: Record<string, string> = { prompt: p };
      if (requirePlatformPay && platformPiId) {
        body.platform_payment_intent_id = platformPiId;
      }
      const res = await api.post(API_ENDPOINTS.aiSite.generate(campaignId), body);
      const j = res.data?.job as JobRow;
      if (j?.id) {
        setJob(j);
        setStep(STEP_GENERATING);
      } else {
        const msg = "Unexpected response from server";
        setError(msg);
        notifyError(msg);
        setGenerateLoading(false);
      }
    } catch (e) {
      const msg = getErrorMessage(e);
      setError(msg);
      notifyError(msg);
      setGenerateLoading(false);
    }
  };

  const platformPayOk = !requirePlatformPay || !!platformPiId;
  const showStripePlatform =
    requirePlatformPay && stripePromise && platformClientSecret && !platformDevMode;
  const feeOptionLockedInWizard = !!campaignId && status !== "draft";

  const aiRecipe = parseAiSiteRecipeFromDb(previewCampaign?.ai_site_recipe);
  const presets = getPresetAmounts(previewCampaign);
  const assetQuota = mediaCountsByType(media);
  const stripeConfigured = stripePk && stripePk.startsWith("pk_");

  if (resumeLoading) {
    return (
      <div style={{ padding: "3rem", textAlign: "center" }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>Loading campaign…</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: 960, margin: "0 auto" }}>
      <h1 style={{ marginTop: 0 }}>{mode === "new" ? "Create campaign" : "AI site builder"}</h1>

      <Steps current={step} items={STEP_ITEMS} style={{ marginBottom: 32 }} />

      {error ? (
        <Alert type="error" message={error} style={{ marginBottom: 16 }} showIcon closable onClose={() => setError("")} />
      ) : null}

      {step === STEP_DETAILS && mode === "new" && (
        <div>
          <p>Start with the basics for your fundraiser.</p>
          <form onSubmit={handleCreateNext}>
            <GenericTextInput
              labelTitle="Campaign title"
              value={title}
              setValue={(value) => setTitle(String(value ?? ""))}
              placeholder="e.g. Save the Rainforest"
              required
              wrapperStyle={{ display: "block", marginBottom: 12 }}
              inputStyle={{ display: "block", width: "100%", maxWidth: 400, marginTop: 4 }}
            />
            <GenericTextInput
              labelTitle="Goal amount ($)"
              valueType="number"
              value={goal}
              setValue={(value) => setGoal(String(value ?? ""))}
              placeholder="e.g. 5000"
              min="0"
              step="0.01"
              wrapperStyle={{ display: "block", marginBottom: 12 }}
              inputStyle={{ display: "block", width: "100%", maxWidth: 400, marginTop: 4 }}
            />
            <GenericTextInput
              labelTitle="Giveaway prize (optional, $)"
              valueType="number"
              value={giveawayPrize}
              setValue={(value) => setGiveawayPrize(String(value ?? ""))}
              placeholder="e.g. 1000"
              min="0"
              step="0.01"
              wrapperStyle={{ display: "block", marginBottom: 12 }}
              inputStyle={{ display: "block", width: "100%", maxWidth: 400, marginTop: 4 }}
            />
            <label style={{ display: "block", marginBottom: 16 }}>
              Status
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{ display: "block", marginTop: 4 }}
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
              </select>
            </label>
            <label style={{ display: "block", marginBottom: 16 }}>
              Payment model
              <select
                value={feeOption}
                onChange={(e) =>
                  setFeeOption(e.target.value as "donor_pays" | "platform_absorbs")
                }
                disabled={feeOptionLockedInWizard}
                style={{ display: "block", marginTop: 4 }}
              >
                <option value="donor_pays">Donor pays fees (default)</option>
                <option value="platform_absorbs">Platform absorbs fees</option>
              </select>
              <Text type="secondary">
                {feeOptionLockedInWizard
                  ? "Payment model is locked because this campaign is no longer draft."
                  : "You can change this while the campaign is in draft. It locks after publish."}
              </Text>
            </label>
            <Button type="primary" htmlType="submit" loading={createLoading} disabled={!title.trim()}>
              Next
            </Button>
          </form>
        </div>
      )}

      {step === STEP_ASSETS && campaignId && (
        <div>
          <p>
            Campaign: <strong>{campaignTitle || campaignId}</strong>
          </p>
          <p>Upload images, videos, or PDFs the AI can use on your page. This step is optional.</p>
          <Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
            Remaining slots: {Math.max(0, MAX_CAMPAIGN_IMAGES - assetQuota.image)} images,{" "}
            {Math.max(0, MAX_CAMPAIGN_VIDEOS - assetQuota.video)} videos,{" "}
            {Math.max(0, MAX_CAMPAIGN_DOCS - assetQuota.doc)} documents (per campaign).
          </Text>
          <Space style={{ marginBottom: 16 }}>
            <Upload beforeUpload={handleUpload} showUploadList={false} accept="image/*,video/*,.pdf">
              <Button type="default">Upload file</Button>
            </Upload>
            <Button onClick={loadMedia} loading={loadingMedia} type="link">
              Refresh list
            </Button>
          </Space>
          <List
            size="small"
            style={{ marginBottom: 24 }}
            dataSource={media}
            locale={{ emptyText: "No files yet — you can skip and add more later from the dashboard." }}
            renderItem={(item) => (
              <List.Item>
                <a href={item.url || "#"} target="_blank" rel="noreferrer">
                  {item.type}
                </a>
                {item.description ? ` — ${item.description}` : null}
              </List.Item>
            )}
          />
          <Space>
            {mode === "new" ? (
              <Button type="default" onClick={() => setStep(STEP_DETAILS)}>
                Back
              </Button>
            ) : (
              <Button type="default" onClick={() => navigate("/dashboard")}>
                Back to dashboard
              </Button>
            )}
            <Button type="primary" onClick={() => setStep(STEP_DESCRIBE)}>
              Next
            </Button>
          </Space>
        </div>
      )}

      {step === STEP_DESCRIBE && campaignId && (
        <div>
          <p>
            Campaign: <strong>{campaignTitle || campaignId}</strong>
          </p>
          <p>Describe the website you want. Assets you uploaded will be included in the AI context.</p>

          {requirePlatformPay ? (
            <div style={{ marginBottom: 24, padding: 16, border: "1px solid #eee", borderRadius: 8 }}>
              <Text strong>Platform payment</Text>
              {platformDevMode && platformPiId ? (
                <p style={{ marginTop: 8 }}>
                  <Text type="success">Dev mode: payment check bypassed with test intent.</Text>
                </p>
              ) : showStripePlatform ? (
                <Elements stripe={stripePromise} options={{ clientSecret: platformClientSecret! }}>
                  <PlatformPaymentForm
                    amountCents={platformAmountCents}
                    onSucceeded={(id) => setPlatformPiId(id)}
                    onError={(msg) => setError(msg)}
                  />
                </Elements>
              ) : (
                <p style={{ marginTop: 8 }}>
                  <Text type="warning">
                    Enable Stripe keys and set REQUIRE_PLATFORM_PAYMENT_FOR_AI=1 on the API, or turn off
                    VITE_REQUIRE_PLATFORM_PAYMENT_FOR_AI for local testing.
                  </Text>
                </p>
              )}
            </div>
          ) : null}

          <Text strong>Prompt</Text>
          <TextArea
            rows={6}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder='e.g. "A warm landing page for our equipment fundraiser with a hero, story section, gallery from our uploads, and clear donate button."'
            style={{ marginTop: 8, marginBottom: 16 }}
          />
          <Space>
            <Button type="default" onClick={() => setStep(STEP_ASSETS)}>
              Back
            </Button>
            <Button
              type="primary"
              onClick={handleGenerate}
              disabled={generateLoading || !platformPayOk}
              loading={generateLoading}
            >
              Generate site
            </Button>
          </Space>
        </div>
      )}

      {step === STEP_GENERATING && campaignId && (
        <div style={{ textAlign: "center", padding: "2rem 0" }}>
          <h2 style={{ fontWeight: 600 }}>Building your page</h2>
          <p style={{ maxWidth: 480, margin: "0 auto 24px", color: "#666" }}>
            Our AI is generating your donation page using your prompt and assets. This usually takes a short
            while.
          </p>
          {job ? (
            <>
              <Progress
                percent={job.progress_percent}
                style={{ maxWidth: 400, margin: "0 auto" }}
                status={
                  job.status === "failed"
                    ? "exception"
                    : job.status === "completed"
                      ? "success"
                      : "active"
                }
              />
              <p style={{ marginTop: 12 }}>{job.step}</p>
            </>
          ) : (
            <Spin size="large" />
          )}
          <div style={{ marginTop: 24 }}>
            <Button
              type="default"
              onClick={() => {
                setStep(STEP_DESCRIBE);
                setGenerateLoading(false);
                setJob(null);
              }}
            >
              Cancel and edit prompt
            </Button>
          </div>
        </div>
      )}

      {step === STEP_PREVIEW && campaignId && (
        <div>
          <Space style={{ marginBottom: 16 }} wrap>
            <Button type="default" onClick={() => navigate("/dashboard")}>
              Back to dashboard
            </Button>
            <Button
              type="default"
              onClick={() => {
                setStep(STEP_DESCRIBE);
                setJob(null);
              }}
            >
              Change prompt and regenerate
            </Button>
            <a href={`/donate/${campaignId}`} target="_blank" rel="noopener noreferrer">
              Open live page
            </a>
          </Space>

          {previewLoading && !previewCampaign ? (
            <Spin />
          ) : !stripeConfigured ? (
            <Alert
              type="warning"
              message="Add VITE_STRIPE_PUBLISHABLE_KEY to test donations from this preview."
              showIcon
            />
          ) : !previewCampaign ? (
            <Alert type="info" message="Could not load campaign preview." showIcon />
          ) : !aiRecipe ? (
            <Alert
              type="warning"
              message="No AI site generated yet. Go back to the prompt step and click Generate."
              showIcon
            />
          ) : (
            <div
              className="donate-page donate-page-blocks"
              style={{ border: "1px solid #eee", borderRadius: 8, padding: 16 }}
            >
              <AiSiteRenderer
                campaign={previewCampaign}
                recipe={aiRecipe}
                onDonateClick={() => setModalOpen(true)}
                stickyDonate={false}
              />
              <DonationModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                campaignId={campaignId}
                campaignTitle={previewCampaign?.title || campaignTitle || "Campaign"}
                presetAmounts={presets}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
