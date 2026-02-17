import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("demo@gyaanchat.ai");
  const [password, setPassword] = useState("demo123");
  const [error, setError] = useState<string | null>(null);

  function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }
    // Standardize auth keys as per requirements
    localStorage.setItem("gc_token", "demo-token");
    localStorage.setItem("gyaanchat_tenant_id", "tenantA");
    localStorage.setItem("gyaanchat_widget_key", "default_key");

    window.location.href = "/app";
  }

  return (
    <div className="centerPage">
      <form className="card formCard" onSubmit={onLogin}>
        <h1 className="pageTitle">Login</h1>
        <p className="muted">Demo login for now. We’ll connect real auth later.</p>

        <label className="label">Email</label>
        <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />

        <label className="label">Password</label>
        <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

        {error && <div className="alert">{error}</div>}

        <button className="button" type="submit">Login</button>
      </form>
    </div>
  );
}
