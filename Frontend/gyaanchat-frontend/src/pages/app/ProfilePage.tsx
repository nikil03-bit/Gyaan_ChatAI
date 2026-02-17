export default function ProfilePage() {
    const tenantId = localStorage.getItem("gyaanchat_tenant_id") || "tenantA";

    return (
        <div className="page">
            <header className="pageHeader">
                <div>
                    <h1 className="pageTitle">Profile</h1>
                    <p className="muted">Manage your account and organization details.</p>
                </div>
            </header>

            <div className="card">
                <h2 style={{ fontSize: "1.1rem", marginBottom: 20 }}>Organization Details</h2>

                <div className="label">Tenant ID</div>
                <div style={{
                    padding: "10px 12px",
                    background: "#f1f5f9",
                    borderRadius: "8px",
                    fontSize: "0.875rem",
                    color: "#475569",
                    fontWeight: 600
                }}>
                    {tenantId}
                </div>

                <div className="label">Organization Name</div>
                <input className="input" defaultValue="My GyaanChat Org" />

                <div className="label">Contact Email</div>
                <input className="input" defaultValue="admin@example.com" />

                <button className="button" onClick={() => alert("Profile updated (demo)")}>
                    Update Profile
                </button>
            </div>

            <div className="card" style={{ marginTop: 24, borderColor: '#fee2e2' }}>
                <h2 style={{ fontSize: "1.1rem", marginBottom: 12, color: '#b91c1c' }}>Danger Zone</h2>
                <p className="muted" style={{ marginBottom: 16 }}>Once you delete your organization, there is no going back.</p>
                <button className="button" style={{ background: '#dc2626', margin: 0, width: 'auto' }}>
                    Delete Organization
                </button>
            </div>
        </div>
    );
}
