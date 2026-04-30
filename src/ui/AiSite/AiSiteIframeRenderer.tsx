import { useEffect, useMemo, useRef } from "react";
import type { AiIframeContentMap, AiSiteIframeBundleV1 } from "@/lib/aiSiteRecipe";

import "./AiSiteIframeRenderer.scss";

type Props = {
  bundle: AiSiteIframeBundleV1;
  content: AiIframeContentMap;
  onDonateClick: () => void;
  title?: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function interpolate(template: string, content: AiIframeContentMap): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_match, keyRaw: string) => {
    const key = keyRaw.trim();
    const value = content[key];
    return typeof value === "string" ? escapeHtml(value) : "";
  });
}

export function AiSiteIframeRenderer({
  bundle,
  content,
  onDonateClick,
  title = "AI campaign site",
}: Props) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const srcDoc = useMemo(() => {
    const html = interpolate(bundle.template.html, content);
    const css = interpolate(bundle.template.css ?? "", content);
    const js = interpolate(bundle.template.js ?? "", content);
    const bridgeScript = `
      (function(){
        function postDonate(){
          try {
            window.parent.postMessage({ source: "hhf-iframe", type: "donate.open" }, "*");
          } catch (_e) {}
        }
        document.addEventListener("click", function(event){
          var target = event.target;
          if (!target || !(target instanceof Element)) return;
          var actionNode = target.closest('[data-hhf-action="donate"]');
          if (actionNode) {
            event.preventDefault();
            postDonate();
            return;
          }
          var donateHrefNode = target.closest('a[href^="hhf:donate"]');
          if (donateHrefNode) {
            event.preventDefault();
            postDonate();
          }
        }, true);
      })();
    `;
    return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: data:; media-src https: data: blob:; script-src 'unsafe-inline'; style-src 'unsafe-inline'; font-src https: data:; connect-src https:;" />
    <style>${css}</style>
  </head>
  <body>
    ${html}
    ${js ? `<script>${js}</script>` : ""}
    <script>${bridgeScript}</script>
  </body>
</html>`;
  }, [bundle.template.css, bundle.template.html, bundle.template.js, content]);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const frameWin = iframeRef.current?.contentWindow;
      if (!frameWin || event.source !== frameWin) return;
      const data = event.data;
      if (!data || typeof data !== "object") return;
      const payload = data as { source?: unknown; type?: unknown };
      if (payload.source !== "hhf-iframe") return;
      if (payload.type === "donate.open") {
        onDonateClick();
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [onDonateClick]);

  return (
    <div className="ai-site-iframe-renderer">
      <iframe
        ref={iframeRef}
        title={title}
        srcDoc={srcDoc}
        sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
        loading="lazy"
      />
    </div>
  );
}
