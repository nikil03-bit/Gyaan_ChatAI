import { useState } from "react";
import { Link } from "react-router-dom";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    function onRegister(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (!email || !password) {
            setError("Please fill in all fields.");
            return;
        }

        // Standardize auth keys
        localStorage.setItem("gc_token", "demo-token");
        localStorage.setItem("gyaanchat_tenant_id", "tenantA");
        localStorage.setItem("gyaanchat_widget_key", "default_key");

        window.location.href = "/app";
    }

    return (
        <div className="centerPage">
            <form className="card formCard" onSubmit={onRegister}>
                <h1 className="pageTitle">Register</h1>
                <p className="muted">Create your GyaanChat account.</p>

                <label className="label">Email</label>
                <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />

                <label className="label">Password</label>
                <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" />

                {error && <div className="alert">{error}</div>}

                <button className="button" type="submit">Create Account</button>

                <p className="muted" style={{ marginTop: 16, textAlign: 'center' }}>
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </form>
        </div>
    );
}
