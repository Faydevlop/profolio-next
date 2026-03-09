"use client";

import { useState } from "react";

type Step = "database" | "cloudinary" | "identity" | "success";

export default function SetupWizard() {
    const [step, setStep] = useState<Step>("database");
    const [mongoUri, setMongoUri] = useState("");
    const [cloudinaryCloudName, setCloudinaryCloudName] = useState("");
    const [cloudinaryApiKey, setCloudinaryApiKey] = useState("");
    const [cloudinaryApiSecret, setCloudinaryApiSecret] = useState("");
    const [name, setName] = useState("");
    const [adminEmail, setAdminEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
    const [error, setError] = useState("");

    async function testConnection() {
        if (!mongoUri) return;
        setTestStatus("testing");
        setError("");
        try {
            const res = await fetch("/api/setup/test-db", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mongoUri }),
            });
            const data = await res.json();
            if (data.ok) {
                setTestStatus("success");
            } else {
                setTestStatus("error");
                setError(data.error || "Failed to connect to MongoDB.");
            }
        } catch {
            setTestStatus("error");
            setError("Network error testing connection.");
        }
    }

    async function completeSetup() {
        if (!name || !adminEmail || !password || !cloudinaryCloudName || !cloudinaryApiKey || !cloudinaryApiSecret) {
            setError("Please fill in all fields.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/setup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    mongoUri,
                    name,
                    adminEmail,
                    adminPassword: password,
                    cloudinaryCloudName,
                    cloudinaryApiKey,
                    cloudinaryApiSecret
                }),
            });
            const data = await res.json();
            if (data.ok) {
                setStep("success");
            } else {
                setError(data.error || "Setup failed. Please try again.");
            }
        } catch {
            setError("Network error during setup.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="setup-container">
            <div className="setup-wrapper">
                <header className="setup-navbar">
                    <p className="setup-brand">Onboarding ✦</p>
                    <div className="setup-progress">
                        <div className={`progress-segment ${step === 'database' ? 'active' : step !== 'success' ? 'done' : ''}`} />
                        <div className={`progress-segment ${step === 'cloudinary' ? 'active' : step !== 'database' && step !== 'success' ? 'done' : ''}`} />
                        <div className={`progress-segment ${step === 'identity' ? 'active' : step === 'success' ? 'done' : ''}`} />
                    </div>
                </header>

                <main className="setup-main">
                    {step === "database" && (
                        <section className="setup-step">
                            <h1 className="setup-h1">Connect your database.</h1>
                            <p className="setup-p">Paste your MongoDB connection string below. We will test the connection before moving forward.</p>

                            <div className="setup-input-group mt-large">
                                <label className="setup-label">MongoDB URL (Atlas or Local)</label>
                                <input
                                    type="text"
                                    className="setup-field-input"
                                    placeholder="mongodb+srv://..."
                                    value={mongoUri}
                                    onChange={(e) => {
                                        setMongoUri(e.target.value);
                                        setTestStatus("idle");
                                        setError("");
                                    }}
                                />
                            </div>

                            {error && <p className="setup-error-text">{error}</p>}

                            <div className="setup-footer">
                                <button
                                    className={`setup-action-btn ${testStatus === 'testing' ? 'loading' : ''}`}
                                    onClick={testConnection}
                                    disabled={!mongoUri || testStatus === 'testing'}
                                >
                                    {testStatus === 'testing' ? "Testing..." : testStatus === 'success' ? "Connection Success ✅" : "Test Connection"}
                                </button>
                                {testStatus === "success" && (
                                    <button className="setup-next-btn" onClick={() => setStep("cloudinary")}>
                                        Continue →
                                    </button>
                                )}
                            </div>
                        </section>
                    )}

                    {step === "cloudinary" && (
                        <section className="setup-step">
                            <h1 className="setup-h1">Media Storage.</h1>
                            <p className="setup-p">Enter your Cloudinary details to enable image uploads for your projects.</p>

                            <div className="setup-input-group mt-large">
                                <label className="setup-label">Cloud Name</label>
                                <input
                                    type="text"
                                    className="setup-field-input"
                                    placeholder="Cloud Name"
                                    value={cloudinaryCloudName}
                                    onChange={(e) => setCloudinaryCloudName(e.target.value)}
                                />
                            </div>
                            <div className="setup-input-group">
                                <label className="setup-label">API Key</label>
                                <input
                                    type="text"
                                    className="setup-field-input"
                                    placeholder="API Key"
                                    value={cloudinaryApiKey}
                                    onChange={(e) => setCloudinaryApiKey(e.target.value)}
                                />
                            </div>
                            <div className="setup-input-group">
                                <label className="setup-label">API Secret</label>
                                <input
                                    type="password"
                                    className="setup-field-input"
                                    placeholder="API Secret"
                                    value={cloudinaryApiSecret}
                                    onChange={(e) => setCloudinaryApiSecret(e.target.value)}
                                />
                            </div>

                            {error && <p className="setup-error-text">{error}</p>}

                            <div className="setup-footer">
                                <button className="setup-back-btn" onClick={() => setStep("database")}>
                                    ← Back
                                </button>
                                <button
                                    className="setup-next-btn"
                                    onClick={() => setStep("identity")}
                                    disabled={!cloudinaryCloudName || !cloudinaryApiKey || !cloudinaryApiSecret}
                                >
                                    Continue →
                                </button>
                            </div>
                        </section>
                    )}

                    {step === "identity" && (
                        <section className="setup-step">
                            <h1 className="setup-h1">Personalize & Secure.</h1>
                            <p className="setup-p">Set your name for the portfolio and create your admin account.</p>

                            <div className="setup-input-grid mt-large">
                                <div className="setup-input-group">
                                    <label className="setup-label">Your Name</label>
                                    <input
                                        type="text"
                                        className="setup-field-input"
                                        placeholder="e.g. Alex Johnson"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                                <div className="setup-input-group">
                                    <label className="setup-label">Admin Email</label>
                                    <input
                                        type="email"
                                        className="setup-field-input"
                                        placeholder="you@example.com"
                                        value={adminEmail}
                                        onChange={(e) => setAdminEmail(e.target.value)}
                                    />
                                </div>
                                <div className="setup-input-group full-width">
                                    <label className="setup-label">Admin Password</label>
                                    <input
                                        type="password"
                                        className="setup-field-input"
                                        placeholder="Minimum 8 characters"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            {error && <p className="setup-error-text">{error}</p>}

                            <div className="setup-footer mt-large">
                                <button className="setup-back-btn" onClick={() => setStep("cloudinary")}>
                                    ← Back
                                </button>
                                <button
                                    className={`setup-next-btn primary ${loading ? 'loading' : ''}`}
                                    onClick={completeSetup}
                                    disabled={loading || !name || !adminEmail || !password}
                                >
                                    {loading ? "Finalizing..." : "Complete Setup"}
                                </button>
                            </div>
                        </section>
                    )}

                    {step === "success" && (
                        <section className="setup-step text-center">
                            <h1 className="setup-h1">You&apos;re all set!</h1>
                            <p className="setup-p">Everything is configured. Your details are securely stored in your database.</p>

                            <div className="setup-success-actions mt-large">
                                <button className="setup-next-btn primary" onClick={() => window.location.reload()}>
                                    Launch Portfolio
                                </button>
                                <a href="/admin/login" className="setup-link-btn">
                                    Go to Admin Panel →
                                </a>
                            </div>
                        </section>
                    )}
                </main>
            </div>
        </div>
    );
}
