import { api } from "./client";
import type { UploadResponse, DocStatusResponse, ChatResponse } from "./types";

export async function uploadDocument(tenantId: string, file: File): Promise<UploadResponse> {
  const form = new FormData();
  form.append("file", file);

  const { data } = await api.post(`/documents/upload?tenant_id=${encodeURIComponent(tenantId)}`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
}

export async function getDocStatus(tenantId: string, docId: string): Promise<DocStatusResponse> {
  const { data } = await api.get(
    `/documents/status?tenant_id=${encodeURIComponent(tenantId)}&doc_id=${encodeURIComponent(docId)}`
  );
  return data;
}

export async function listDocuments(tenantId: string): Promise<DocStatusResponse[]> {
  const { data } = await api.get(`/documents/list?tenant_id=${encodeURIComponent(tenantId)}`);
  return data;
}

export async function deleteDocument(tenantId: string, docId: string): Promise<{ message: string }> {
  const { data } = await api.delete(`/documents/delete?tenant_id=${encodeURIComponent(tenantId)}&doc_id=${encodeURIComponent(docId)}`);
  return data;
}

export async function chatTenant(tenantId: string, userText: string): Promise<ChatResponse> {
  // Support both common payload styles
  const payload1 = { tenant_id: tenantId, question: userText };
  const payload2 = { tenant_id: tenantId, message: userText };

  try {
    const { data } = await api.post("/chat/", payload1);
    return data;
  } catch {
    const { data } = await api.post("/chat/", payload2);
    return data;
  }
}
