export default function DashboardHome() {
  const stats = [
    { label: "Total Queries", value: "1,284" },
    { label: "Documents Uploaded", value: "12" },
    { label: "Avg Response Time", value: "1.4s" },
  ];

  const recentChats = [
    { id: 1, user: "Visitor #12", date: "2 mins ago", query: "How to reset password?" },
    { id: 2, user: "Visitor #05", date: "15 mins ago", query: "What is the return policy?" },
    { id: 3, user: "Visitor #09", date: "1 hour ago", query: "Pricing for enterprise" },
  ];

  return (
    <div className="page">
      <header className="pageHeader">
        <div>
          <h1 className="pageTitle">Welcome back!</h1>
          <p className="muted">Here is what's happening with your AI assistant.</p>
        </div>
      </header>

      <div className="statGrid">
        {stats.map((s, i) => (
          <div key={i} className="statCard">
            <div className="statLabel">{s.label}</div>
            <div className="statValue">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 style={{ fontSize: "1.1rem", marginBottom: 16 }}>Recent Queries</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>
                <th style={{ padding: "12px 0", fontSize: "0.875rem", color: "#64748b" }}>Visitor</th>
                <th style={{ padding: "12px 0", fontSize: "0.875rem", color: "#64748b" }}>Query</th>
                <th style={{ padding: "12px 0", fontSize: "0.875rem", color: "#64748b" }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {recentChats.map((c) => (
                <tr key={c.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px 0", fontSize: "0.875rem", fontWeight: 500 }}>{c.user}</td>
                  <td style={{ padding: "12px 0", fontSize: "0.875rem" }}>{c.query}</td>
                  <td style={{ padding: "12px 0", fontSize: "0.875rem", color: "#64748b" }}>{c.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
