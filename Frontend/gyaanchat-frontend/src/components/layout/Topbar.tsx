import "../../styles/layout.css";

export default function Topbar() {
  const tenantId = localStorage.getItem("gyaanchat_tenant_id") || "—";
  return (
    <header className="topbar">
      <div className="topbarTitle">Dashboard</div>
      <div className="topbarMeta">Tenant: {tenantId}</div>
    </header>
  );
}
