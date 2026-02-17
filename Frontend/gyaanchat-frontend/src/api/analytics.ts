import { api } from "./client";

export type AnalyticsSummary = {
    total_queries: number;
    avg_response_ms: number;
    documents_indexed: number;
    success_rate: number;
};

export type TimeSeriesPoint = {
    label: string;
    value: number;
};

export type TopQuestion = {
    question: string;
    count: number;
};

export async function getAnalyticsSummary(tenantId: string): Promise<AnalyticsSummary | null> {
    try {
        const { data } = await api.get(`/analytics/summary?tenant_id=${encodeURIComponent(tenantId)}`);
        return data;
    } catch (err) {
        console.warn("Analytics summary endpoint not found or failed, using fallback.");
        return null;
    }
}

export async function getAnalyticsTimeseries(tenantId: string, days: number = 7): Promise<TimeSeriesPoint[]> {
    try {
        const { data } = await api.get(`/analytics/timeseries?tenant_id=${encodeURIComponent(tenantId)}&days=${days}`);
        return data;
    } catch (err) {
        console.warn("Analytics timeseries endpoint not found or failed.");
        return [];
    }
}

export async function getTopQuestions(tenantId: string): Promise<TopQuestion[]> {
    try {
        const { data } = await api.get(`/analytics/top-questions?tenant_id=${encodeURIComponent(tenantId)}`);
        return data;
    } catch (err) {
        console.warn("Analytics top-questions endpoint not found or failed.");
        return [];
    }
}
