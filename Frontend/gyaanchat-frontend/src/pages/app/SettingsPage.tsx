export default function SettingsPage() {
    return (
        <div className="page">
            <header className="pageHeader">
                <div>
                    <h1 className="pageTitle">Settings</h1>
                    <p className="muted">Configure your AI assistant behavior and appearance.</p>
                </div>
            </header>

            <div className="card">
                <h2 style={{ fontSize: "1.1rem", marginBottom: 20 }}>Assistant Configuration</h2>

                <div className="label">System Prompt</div>
                <textarea
                    className="input"
                    style={{ minHeight: 120, resize: 'vertical' }}
                    placeholder="e.g. You are a helpful assistant for GyaanChat..."
                    defaultValue="You are a helpful assistant that answers questions based on the provided documents. If the answer is not in the documents, say you don't know."
                />

                <div className="label">Creativity (Temperature)</div>
                <input type="range" min="0" max="1" step="0.1" defaultValue="0.7" style={{ width: '100%', marginTop: 8 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>
                    <span>Precise (0)</span>
                    <span>Creative (1)</span>
                </div>

                <button className="button" onClick={() => alert("Settings saved (demo)")}>
                    Save Settings
                </button>
            </div>
        </div>
    );
}
