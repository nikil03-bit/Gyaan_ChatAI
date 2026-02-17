import { useState, useEffect, useRef } from "react";
import {
    uploadDocument,
    getDocStatus,
    listDocuments,
    deleteDocument
} from "../../api/endpoints";
import type { DocItem } from "../../api/types";
import "../../styles/documents.css";

export default function DocumentsPage() {
    const tenantId = localStorage.getItem("gyaanchat_tenant_id") || "tenantA";

    const [docs, setDocs] = useState<DocItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [alert, setAlert] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initial Load
    useEffect(() => {
        fetchDocs();
    }, [tenantId]);

    const fetchDocs = async () => {
        try {
            setLoading(true);
            const data = await listDocuments(tenantId);
            if (Array.isArray(data)) {
                setDocs(data.sort((a, b) => (b.updated_at || 0) - (a.updated_at || 0)));
            } else {
                setDocs([]);
            }
        } catch (err) {
            console.error("Failed to list documents", err);
            setDocs([]);
        } finally {
            setLoading(false);
        }
    };

    // Status Polling for processing documents
    useEffect(() => {
        const activePolling = docs.some(d => d.status === "processing" || d.status === "uploaded");
        if (!activePolling) return;

        const interval = setInterval(async () => {
            let hasUpdates = false;
            const updatedList = await Promise.all(docs.map(async (doc) => {
                if (doc.status === "processing" || doc.status === "uploaded") {
                    try {
                        const status = await getDocStatus(tenantId, doc.doc_id);
                        if (status.status !== doc.status) {
                            hasUpdates = true;
                            return status;
                        }
                    } catch (e) {
                        console.error("Polling error for", doc.doc_id, e);
                    }
                }
                return doc;
            }));

            if (hasUpdates) {
                setDocs(updatedList);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [docs, tenantId]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.name.endsWith(".pdf") || file.name.endsWith(".txt")) {
                setSelectedFile(file);
                setAlert(null);
            } else {
                setAlert({ type: 'error', msg: "Only .pdf and .txt files are supported." });
                setSelectedFile(null);
            }
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || uploading) return;

        setUploading(true);
        setProgress(20);
        setAlert(null);

        try {
            const res = await uploadDocument(tenantId, selectedFile);
            setProgress(60);

            const newDoc: DocItem = {
                doc_id: res.doc_id,
                tenant_id: tenantId,
                filename: selectedFile.name,
                status: "uploaded",
                updated_at: Date.now() / 1000
            };

            setDocs([newDoc, ...docs]);
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";

            setAlert({ type: 'success', msg: "Upload started successfully!" });
        } catch (err: any) {
            setAlert({ type: 'error', msg: err?.response?.data?.detail || "Upload failed. Please try again." });
        } finally {
            setUploading(false);
            setTimeout(() => setProgress(0), 1000);
        }
    };

    const handleDelete = async (docId: string) => {
        if (!window.confirm("Are you sure you want to delete this document? This will remove it from the AI's knowledge base.")) return;

        try {
            await deleteDocument(tenantId, docId);
            setDocs(docs.filter(d => d.doc_id !== docId));
            setAlert({ type: 'success', msg: "Document deleted." });
        } catch (err) {
            setAlert({ type: 'error', msg: "Delete API failed. Root cause: list of documents is UI-only if backend is not ready." });
            // Fallback: local delete if API fails for some reason
            setDocs(docs.filter(d => d.doc_id !== docId));
        }
    };

    const formatTime = (ts?: number) => {
        if (!ts) return "—";
        return new Date(ts * 1000).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
    };

    useEffect(() => {
        // If we have a doc that just finished, set progress to 100
        if (docs.some(d => d.status === 'ready' && progress > 0)) {
            setProgress(100);
            setTimeout(() => setProgress(0), 2000);
        }
    }, [docs]);

    return (
        <div className="docsContainer">
            <header className="pageHeader">
                <div>
                    <h1 className="pageTitle">Documents</h1>
                    <p className="muted">Upload PDFs/TXT to train your chatbot</p>
                </div>
                <button
                    className="button"
                    style={{ width: 'auto', padding: '10px 24px', margin: 0 }}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                >
                    Upload Document
                </button>
            </header>

            {/* Upload Progress / Card Area */}
            {(selectedFile || uploading || progress > 0) && (
                <div className="uploadCard">
                    <h2 style={{ fontSize: '1rem', marginBottom: 16 }}>
                        {uploading ? "Uploading..." : selectedFile ? "Ready to upload" : "Processing..."}
                    </h2>

                    {selectedFile && (
                        <div className="selectedFile">
                            <span>{selectedFile.name}</span>
                            {!uploading && (
                                <button className="button" style={{ width: 'auto', margin: 0 }} onClick={handleUpload}>
                                    Start Upload
                                </button>
                            )}
                        </div>
                    )}

                    {progress > 0 && (
                        <div className="progressBar">
                            <div className="progressFill" style={{ width: `${progress}%` }}></div>
                        </div>
                    )}
                </div>
            )}

            {alert && (
                <div className={`alert ${alert.type === 'error' ? '' : 'badge-ready'}`} style={{ marginTop: 0, marginBottom: 16, backgroundColor: alert.type === 'success' ? '#f0fdf4' : undefined }}>
                    {alert.msg}
                </div>
            )}

            {/* Documents Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div className="emptyState">Loading documents...</div>
                ) : docs.length === 0 ? (
                    <div className="emptyState">
                        <div className="emptyIcon">📄</div>
                        <h2 style={{ fontSize: '1.25rem' }}>No documents yet</h2>
                        <p className="muted">Upload your first PDF or TXT to start training your assistant.</p>
                        <button className="button" style={{ width: 'auto', marginTop: 8 }} onClick={() => fileInputRef.current?.click()}>
                            Upload Now
                        </button>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="docsTable">
                            <thead>
                                <tr>
                                    <th>Filename</th>
                                    <th>Doc ID</th>
                                    <th>Status</th>
                                    <th>Uploaded At</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {docs.map((doc) => (
                                    <tr key={doc.doc_id || Math.random()}>
                                        <td style={{ fontWeight: 500 }}>{doc.filename || "Unnamed"}</td>
                                        <td className="mono" style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                            {doc.doc_id ? doc.doc_id.slice(0, 8) : "—"}...
                                        </td>
                                        <td>
                                            <span className={`badge badge-${doc.status === 'ready' ? 'ready' : doc.status === 'failed' ? 'failed' : 'processing'}`}>
                                                {(doc.status === 'processing' || doc.status === 'uploaded') && <div className="spinner"></div>}
                                                {doc.status || "uploaded"}
                                            </span>
                                        </td>
                                        <td className="muted">{formatTime(doc.updated_at)}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button className="deleteBtn" title="Delete Document" onClick={() => doc.doc_id && handleDelete(doc.doc_id)}>
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".pdf,.txt"
                onChange={handleFileChange}
            />
        </div>
    );
}
