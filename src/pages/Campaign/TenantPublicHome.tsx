/**
 * Shown at / on org tenant hosts (e.g. client-name.helpinghands.ca).
 * Public donation pages live at /{campaign-slug}.
 */
export default function TenantPublicHome() {
  return (
    <div style={{ padding: "2rem", maxWidth: 560, margin: "0 auto" }}>
      <h1 style={{ marginTop: 0 }}>Welcome</h1>
      <p>
        Open your fundraiser page by adding the campaign slug to this site&apos;s URL, for example:{" "}
        <code style={{ wordBreak: "break-all" }}>/your-campaign-slug</code>
      </p>
    </div>
  );
}
