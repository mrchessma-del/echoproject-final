'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Settings() {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('groq_api_key') || '';
    setApiKey(stored);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('groq_api_key', apiKey.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleClear = () => {
    setApiKey('');
    localStorage.removeItem('groq_api_key');
  };

  const hasKey = apiKey.trim().length > 0;

  return (
    <>
      <style>{`
        .settings-input:focus { outline: none; box-shadow: 0 0 0 3px rgba(37,99,235,0.15); }
        .save-btn:hover:not(:disabled) { background: #1d4ed8 !important; transform: translateY(-1px); }
        .save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        {/* Header */}
        <header style={{ background: '#0f172a', borderBottom: '1px solid #1e293b' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #2563eb, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </div>
              <div>
                <h1 style={{ color: 'white', fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>
                  EchoChamber
                </h1>
                <p style={{ color: '#64748b', fontSize: '11px', margin: 0, letterSpacing: '0.04em' }}>Media Bias Explorer</p>
              </div>
            </Link>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', textDecoration: 'none', fontSize: '13px', fontWeight: 500, padding: '6px 12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back to Explorer
            </Link>
          </div>
        </header>

        <main style={{ maxWidth: '640px', margin: '0 auto', padding: '48px 24px' }}>
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: 700, color: '#111827', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
              Settings
            </h2>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0, lineHeight: 1.6 }}>
              Configure your API keys and preferences for EchoChamber.
            </p>
          </div>

          {/* API Key Card */}
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden', animation: 'fadeIn 0.3s ease', marginBottom: '20px' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: 0 }}>Groq API Key</h3>
                <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>Required to analyze media bias</p>
              </div>
              {hasKey && (
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '20px', padding: '3px 10px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }} />
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#15803d' }}>Configured</span>
                </div>
              )}
            </div>
            <form onSubmit={handleSave} style={{ padding: '24px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '8px' }}>
                API Key
              </label>
              <div style={{ position: 'relative', marginBottom: '16px' }}>
                <input
                  className="settings-input"
                  type={revealed ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="gsk_..."
                  style={{
                    width: '100%',
                    padding: '10px 44px 10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    color: '#111827',
                    background: '#fafafa',
                    boxSizing: 'border-box',
                    transition: 'box-shadow 0.2s, border-color 0.2s',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setRevealed(!revealed)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px', display: 'flex', alignItems: 'center' }}
                >
                  {revealed ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '20px', lineHeight: 1.6 }}>
                Your API key is stored only in your browser's localStorage and is never sent to our servers.
                Get a free key from{' '}
                <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'none' }}>
                  Groq Console
                </a>.
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  disabled={!apiKey.trim()}
                  className="save-btn"
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: saved ? '#16a34a' : '#2563eb',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  {saved ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Saved
                    </>
                  ) : 'Save API Key'}
                </button>
                {hasKey && (
                  <button
                    type="button"
                    onClick={handleClear}
                    style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', background: 'white', color: '#6b7280', fontSize: '14px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    Clear
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Info card */}
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '16px 20px', display: 'flex', gap: '12px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#92400e', margin: '0 0 4px' }}>Privacy note</p>
              <p style={{ fontSize: '12px', color: '#a16207', margin: 0, lineHeight: 1.6 }}>
                EchoChamber uses the Llama 3.3 70B model via Groq to simulate how different outlets might cover a topic. Results are AI-generated and should not be taken as factual reporting from any outlet.
              </p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
