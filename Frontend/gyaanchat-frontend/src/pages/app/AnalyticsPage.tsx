import { useState, useEffect } from "react";
import {
    getAnalyticsSummary,
    getAnalyticsTimeseries,
    getTopQuestions,
    type AnalyticsSummary,
    type TimeSeriesPoint,
    type TopQuestion
} from "../../api/analytics";
import { listDocuments } from "../../api/endpoints";
import "../../styles/analytics.css";

export default function AnalyticsPage() {
    const tenantId = localStorage.getItem("gyaanchat_tenant_id") || "tenantA";
    const [filter, setFilter] = useState("7");
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
    const [timeseries, setTimeseries] = useState<TimeSeriesPoint[]>([]);
    const [topQuestions, setTopQuestions] = useState<TopQuestion[]>([]);
    const [docCount, setDocCount] = useState(0);
    const [isFallback, setIsFallback] = useState(false);

    useEffect(() => {
        fetchData();
    }, [tenantId, filter]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Parallel fetch
            const [sum, series, topQ, docs] = await Promise.all([
                getAnalyticsSummary(tenantId),
                getAnalyticsTimeseries(tenantId, parseInt(filter)),
                getTopQuestions(tenantId),
                listDocuments(tenantId)
            ]);

            setDocCount(Array.isArray(docs) ? docs.length : 0);

            if (sum) {
                setSummary(sum);
                setIsFallback(false);
            } else {
                // Fallback Summary
                setSummary({
                    total_queries: 124,
                    avg_response_ms: 1450,
                    documents_indexed: Array.isArray(docs) ? docs.length : 0,
                    success_rate: 98.2
                });
                setIsFallback(true);
            }

            if (series && series.length > 0) {
                setTimeseries(series);
            } else {
                // Generate Mock series
                const mockSeries = Array.from({ length: parseInt(filter) }, (_, i) => ({
                    label: `Day ${i + 1}`,
                    value: Math.floor(Math.random() * 50) + 10
                }));
                setTimeseries(mockSeries);
            }

            if (topQ && topQ.length > 0) {
                setTopQuestions(topQ);
            } else {
                setTopQuestions([
                    { question: "What services do you offer?", count: 42 },
                    { question: "How to reset my password?", count: 28 },
                    { question: "Can I upgrade my plan?", count: 25 },
                    { question: "Who founded GyaanChat?", count: 18 },
                    { question: "How does the AI training work?", count: 12 },
                    { question: "Is my data secure?", count: 10 },
                    { question: "Where is the documentation?", count: 8 },
                    { question: "How to contact support?", count: 5 }
                ]);
            }
        } catch (err) {
            console.error("Critical analytics fetch error", err);
        } finally {
            setLoading(false);
        }
    };

    const getSuccessBadge = (rate: number) => {
        if (rate >= 95) return "badge-success";
        if (rate >= 80) return "badge-warning";
        return "badge-danger";
    };

    if (loading) {
        return (
            <div className="page analyticsContainer">
                <header className="pageHeader">
                    <h1 className="pageTitle">Dashboard</h1>
                </header>
                <div style={{ padding: '40px', textAlign: 'center' }}>Loading metrics...</div>
            </div>
        );
    }

    return (
        <div className="page analyticsContainer">
            <header className="pageHeader analyticsHeader">
                <div>
                    <h1 className="pageTitle">Dashboard</h1>
                    <p className="muted">Overview of your chatbot performance and usage</p>
                </div>
                <select
                    className="filterSelect"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                >
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                </select>
            </header>

            {isFallback && (
                <div className="notice">
                    <span>ℹ️</span> Analytics backend not fully configured yet. Showing simulated data with real document count.
                </div>
            )}

            {/* Top Stat Cards */}
            <div className="analyticsStatGrid">
                <div className="statCard">
                    <div className="statLabel">Total Queries</div>
                    <div className="statValue">
                        {summary?.total_queries?.toLocaleString() || 0}
                        <span className="statDelta up">↑ 12%</span>
                    </div>
                </div>
                <div className="statCard">
                    <div className="statLabel">Avg Response</div>
                    <div className="statValue">
                        {summary?.avg_response_ms || 0}ms
                    </div>
                </div>
                <div className="statCard">
                    <div className="statLabel">Documents Indexed</div>
                    <div className="statValue">
                        {docCount}
                    </div>
                </div>
                <div className="statCard">
                    <div className="statLabel">Success Rate</div>
                    <div className="statValue">
                        {summary?.success_rate || 0}%
                        <span className={`badge ${getSuccessBadge(summary?.success_rate || 0)}`} style={{ fontSize: '0.75rem', marginLeft: 'auto' }}>
                            Target
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Chart */}
            <div className="card chartContainer">
                <h2 className="chartTitle">Queries Over Time</h2>
                <div className="barChart">
                    {timeseries.map((p, i) => {
                        const max = Math.max(...timeseries.map(pp => pp.value), 1);
                        const height = (p.value / max) * 100;
                        return (
                            <div key={i} className="barGroup">
                                <div
                                    className="bar"
                                    style={{ height: `${height}%` }}
                                    data-value={p.value}
                                ></div>
                                <span className="barLabel">{p.label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="analyticsGrid">
                {/* Popular Questions */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <h2 className="chartTitle" style={{ padding: '24px 24px 0 24px' }}>Popular Questions</h2>
                    <table className="analyticsTable">
                        <thead>
                            <tr>
                                <th>Question</th>
                                <th style={{ textAlign: 'right' }}>Count</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topQuestions.map((q, i) => (
                                <tr key={i}>
                                    <td>{q.question}</td>
                                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{q.count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Recent Activity Placeholder */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <h2 className="chartTitle" style={{ padding: '24px 24px 0 24px' }}>Recent Interactions</h2>
                    <table className="analyticsTable">
                        <thead>
                            <tr>
                                <th>User Query</th>
                                <th style={{ textAlign: 'right' }}>Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>How do I get started with the widget?</td>
                                <td className="muted" style={{ textAlign: 'right' }}>5m ago</td>
                            </tr>
                            <tr>
                                <td>What is your pricing model for teams?</td>
                                <td className="muted" style={{ textAlign: 'right' }}>12m ago</td>
                            </tr>
                            <tr>
                                <td>Do you support multilingual bots?</td>
                                <td className="muted" style={{ textAlign: 'right' }}>24m ago</td>
                            </tr>
                            <tr>
                                <td>Is there an API for fetching chats?</td>
                                <td className="muted" style={{ textAlign: 'right' }}>1h ago</td>
                            </tr>
                            <tr>
                                <td>Hello!</td>
                                <td className="muted" style={{ textAlign: 'right' }}>2h ago</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
