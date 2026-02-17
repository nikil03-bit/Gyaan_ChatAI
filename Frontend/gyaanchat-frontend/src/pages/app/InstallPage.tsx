import { useState } from "react";
import "../../styles/install.css";

export default function InstallPage() {
    const [widgetKey] = useState(localStorage.getItem("gyaanchat_widget_key") || "");
    const [activeTab, setActiveTab] = useState<"html" | "react">("html");
    const [showKeyFeedback, setShowKeyFeedback] = useState(false);
    const [showSnippetFeedback, setShowSnippetFeedback] = useState(false);

    const snippet = `<!-- GyaanChat Widget Start -->
<script>
  window.GYAANCHAT_WIDGET_KEY = "${widgetKey}";
</script>
<script src="http://127.0.0.1:8000/widget.js" async></script>
<!-- GyaanChat Widget End -->`;

    const reactExample = `import { useEffect } from 'react';

function GyaanChatWidget() {
  useEffect(() => {
    window.GYAANCHAT_WIDGET_KEY = "${widgetKey}";
    const script = document.createElement('script');
    script.src = "http://127.0.0.1:8000/widget.js";
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null;
}

export default GyaanChatWidget;`;

    const copyToClipboard = (text: string, setFeedback: (show: boolean) => void) => {
        navigator.clipboard.writeText(text);
        setFeedback(true);
        setTimeout(() => setFeedback(false), 1500);
    };

    if (!widgetKey) {
        return (
            <div className="page">
                <header className="pageHeader">
                    <h1 className="pageTitle">Install GyaanChat Widget</h1>
                </header>
                <div className="errorMessage">
                    <span>⚠️</span> No widget key found. Please login again.
                </div>
            </div>
        );
    }

    return (
        <div className="page installContainer">
            <header className="pageHeader">
                <div>
                    <h1 className="pageTitle">Install GyaanChat Widget</h1>
                    <p className="muted">Copy and paste this snippet into your website</p>
                </div>
            </header>

            {/* A) Your Widget Key Section */}
            <div className="card installSection">
                <h2 style={{ fontSize: "1.1rem", fontWeight: 600 }}>Your Widget Key</h2>
                <p className="muted">Use this key to identify your widget in custom integrations.</p>
                <div className="copyGroup">
                    <input
                        className="input copyInput"
                        readOnly
                        value={widgetKey}
                    />
                    <button
                        className="button"
                        style={{ margin: 0, width: "auto" }}
                        onClick={() => copyToClipboard(widgetKey, setShowKeyFeedback)}
                    >
                        Copy
                    </button>
                </div>
                <div className={`copyFeedback ${showKeyFeedback ? "show" : ""}`}>Copied!</div>
            </div>

            {/* B) Embed Script Section */}
            <div className="card installSection">
                <h2 style={{ fontSize: "1.1rem", fontWeight: 600 }}>Embed Script</h2>
                <p className="muted">Add this code snippet to your website's HTML to enable the chat widget.</p>

                <div className="codeBlockWrapper">
                    <button
                        className="copySnippetBtn"
                        onClick={() => copyToClipboard(snippet, setShowSnippetFeedback)}
                    >
                        {showSnippetFeedback ? "Copied!" : "Copy Snippet"}
                    </button>
                    <pre className="codeBlock">
                        <code>{snippet}</code>
                    </pre>
                </div>
            </div>

            {/* C) Where to paste it Section */}
            <div className="card installSection">
                <h2 style={{ fontSize: "1.1rem", fontWeight: 600 }}>Where to paste it</h2>

                <div className="tabGroup">
                    <button
                        className={`tabBtn ${activeTab === "html" ? "active" : ""}`}
                        onClick={() => setActiveTab("html")}
                    >
                        HTML Website
                    </button>
                    <button
                        className={`tabBtn ${activeTab === "react" ? "active" : ""}`}
                        onClick={() => setActiveTab("react")}
                    >
                        React Website
                    </button>
                </div>

                {activeTab === "html" ? (
                    <div>
                        <ol className="instructionList">
                            <li className="instructionItem">Open your website's <code>index.html</code> or layout file.</li>
                            <li className="instructionItem">Scroll to the bottom and find the <code>&lt;/body&gt;</code> tag.</li>
                            <li className="instructionItem">Paste the GyaanChat snippet just before the closing <code>&lt;/body&gt;</code> tag.</li>
                            <li className="instructionItem">Save and refresh your website.</li>
                        </ol>
                        <div className="codeBlockWrapper" style={{ marginTop: 20 }}>
                            <pre className="codeBlock">
                                <code>{`<!DOCTYPE html>
<html>
  <head>...</head>
  <body>
    <!-- Your content -->
    
    <!-- Paste here -->
    ${snippet}
  </body>
</html>`}</code>
                            </pre>
                        </div>
                    </div>
                ) : (
                    <div>
                        <ol className="instructionList">
                            <li className="instructionItem">Create a new component (e.g., <code>GyaanChatWidget.tsx</code>).</li>
                            <li className="instructionItem">Paste the following code into the component.</li>
                            <li className="instructionItem">Import and include this component in your <code>App.tsx</code> or main layout.</li>
                        </ol>
                        <div className="codeBlockWrapper" style={{ marginTop: 20 }}>
                            <pre className="codeBlock">
                                <code>{reactExample}</code>
                            </pre>
                        </div>
                    </div>
                )}
            </div>

            {/* D) Widget Preview Section */}
            <div className="card installSection">
                <h2 style={{ fontSize: "1.1rem", fontWeight: 600 }}>Widget Preview</h2>
                <p className="muted">This is a placeholder for your widget's appearance on your site.</p>
                <div className="previewContainer">
                    Widget preview will appear here once configured...
                </div>
            </div>
        </div>
    );
}
