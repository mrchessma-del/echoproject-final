'use client';
import { useState, useCallback } from 'react';
import Link from 'next/link';
import type { OutletAnalysis, AnalyzeResponse } from './api/analyze';

const OUTLETS_CONFIG: Record<string, { color: string; bg: string; border: string; dot: string; position: number }> = {
  'Fox News':              { color: '#dc2626', bg: '#fff5f5', border: '#fecaca', dot: '#dc2626', position: 0.85 },
  'The Wall Street Journal': { color: '#ea580c', bg: '#fff7ed', border: '#fed7aa', dot: '#ea580c', position: 0.65 },
  'NPR':                   { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', dot: '#2563eb', position: 0.4  },
  'The New York Times':    { color: '#1e3a5f', bg: '#f0f4fa', border: '#bfcfe8', dot: '#1e3a5f', position: 0.3  },
  'The Guardian':          { color: '#0f2942', bg: '#eef3f8', border: '#9bb8d4', dot: '#0f2942', position: 0.15 },
};

const TONE_COLORS: Record<string, string> = {
  Alarmed:      '#dc2626',
  Critical:     '#d97706',
  Skeptical:    '#ca8a04',
  Neutral:      '#6b7280',
  Supportive:   '#16a34a',
  Celebratory:  '#059669',
  Investigative:'#0284c7',
};

const SAMPLE_TOPICS = [
  'Immigration policy at the southern border',
  'Climate change legislation',
  'Federal Reserve interest rate decision',
  'NATO military spending',
];

function SpectrumBar({ outlets }: { outlets: OutletAnalysis[]; onSelect?: (o: OutletAnalysis) => void }) {
  return (
    <div className="spectrum-bar">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: '#2563eb', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Left</span>
        <span style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Center</span>
        <span style={{ fontSize: '11px', fontWeight: 600, color: '#dc2626', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Right</span>
      </div>
      <div style={{ position: 'relative', height: '12px', borderRadius: '6px', background: 'linear-gradient(to right, #1d4ed8, #93c5fd, #f1f5f9, #fca5a5, #b91c1c)', marginBottom: '28px' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '2px', height: '20px', background: '#9ca3af', borderRadius: '1px' }} />
        {outlets.map((o) => {
          const cfg = OUTLETS_CONFIG[o.outlet];
          if (!cfg) return null;
          const lean = o.lean ?? cfg.position;
          return (
            <div
              key={o.outlet}
              title={o.outlet}
              style={{
                position: 'absolute',
                left: `${lean * 100}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: cfg.dot,
                border: '2px solid white',
                boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
                cursor: 'pointer',
                zIndex: 2,
              }}
            />
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
        {outlets.slice().sort((a, b) => (b.lean ?? 0) - (a.lean ?? 0)).map((o) => {
          const cfg = OUTLETS_CONFIG[o.outlet];
          if (!cfg) return null;
          return (
            <div key={o.outlet} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
              <span style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'Georgia, serif' }}>{o.outlet}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ToneBadge({ tone }: { tone: string }) {
  const color = TONE_COLORS[tone] || '#6b7280';
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: 700,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color: 'white',
      background: color,
    }}>
      {tone}
    </span>
  );
}

function OutletCard({ outlet, onClick, isSelected }: { outlet: OutletAnalysis; onClick: () => void; isSelected: boolean }) {
  const cfg = OUTLETS_CONFIG[outlet.outlet];
  return (
    <div
      onClick={onClick}
      style={{
        background: 'white',
        borderRadius: '12px',
        border: `2px solid ${isSelected ? (cfg?.color || '#374151') : '#e5e7eb'}`,
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: isSelected ? `0 4px 20px ${cfg?.color || '#374151'}22` : '0 1px 4px rgba(0,0,0,0.06)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: cfg?.color || '#374151', borderRadius: '10px 10px 0 0' }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px', gap: '8px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 700, color: cfg?.color || '#374151', margin: 0, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
          {outlet.outlet}
        </h3>
        <ToneBadge tone={outlet.tone} />
      </div>
      <p style={{ fontFamily: 'Georgia, serif', fontSize: '15px', fontWeight: 600, color: '#111827', lineHeight: 1.45, margin: '0 0 12px', fontStyle: 'italic' }}>
        "{outlet.headline}"
      </p>
      <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.6, margin: 0 }}>
        {outlet.summary}
      </p>
      {outlet.loadedWords.length > 0 && (
        <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {outlet.loadedWords.slice(0, 3).map((w, i) => (
            <span key={i} style={{ fontSize: '11px', background: `${cfg?.color || '#374151'}15`, color: cfg?.color || '#374151', padding: '2px 8px', borderRadius: '4px', fontWeight: 500 }}>
              {w}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function DetailPanel({ outlet, onClose }: { outlet: OutletAnalysis; onClose: () => void }) {
  const cfg = OUTLETS_CONFIG[outlet.outlet];
  const color = cfg?.color || '#374151';

  const Section = ({ title, items, icon }: { title: string; items: string[]; icon: string }) => (
    <div style={{ marginBottom: '20px' }}>
      <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span>{icon}</span> {title}
      </h4>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        {items.map((item, i) => (
          <li key={i} style={{ fontSize: '13px', color: '#374151', lineHeight: 1.6, padding: '4px 0', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <span style={{ color: color, flexShrink: 0, marginTop: '2px' }}>•</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end',
      padding: '16px',
      pointerEvents: 'none',
    }}>
      <div
        style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          border: `2px solid ${color}`,
          width: '100%',
          maxWidth: '420px',
          maxHeight: '80vh',
          overflowY: 'auto',
          pointerEvents: 'all',
          animation: 'slideUp 0.25s ease',
        }}
      >
        <div style={{ position: 'sticky', top: 0, background: 'white', zIndex: 1, padding: '16px 20px 12px', borderBottom: '1px solid #f3f4f6', borderRadius: '14px 14px 0 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{outlet.outlet}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <ToneBadge tone={outlet.tone} />
                <span style={{ fontSize: '11px', color: '#9ca3af' }}>Lean: {Math.round((outlet.lean) * 100)}% right</span>
              </div>
            </div>
            <button onClick={onClose} style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#f3f4f6', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: '#6b7280' }}>
              ×
            </button>
          </div>
        </div>
        <div style={{ padding: '20px' }}>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: '16px', fontWeight: 600, color: '#111827', lineHeight: 1.45, marginBottom: '16px', fontStyle: 'italic' }}>
            "{outlet.headline}"
          </p>
          <p style={{ fontSize: '13px', color: '#4b5563', lineHeight: 1.7, marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #f3f4f6' }}>
            {outlet.summary}
          </p>
          {outlet.factsIncluded.length > 0 && <Section title="Facts Emphasized" items={outlet.factsIncluded} icon="+" />}
          {outlet.factsOmitted.length > 0 && <Section title="Facts Downplayed / Omitted" items={outlet.factsOmitted} icon="−" />}
          {outlet.loadedWords.length > 0 && <Section title="Loaded Language" items={outlet.loadedWords} icon="✦" />}
          {outlet.blindSpots.length > 0 && <Section title="Blind Spots" items={outlet.blindSpots} icon="◎" />}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [selected, setSelected] = useState<OutletAnalysis | null>(null);

  const analyze = useCallback(async (topicToAnalyze: string) => {
    if (!topicToAnalyze.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    setSelected(null);

    const apiKey = typeof window !== 'undefined' ? localStorage.getItem('groq_api_key') || '' : '';

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topicToAnalyze, apiKey }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong');
      } else {
        setResult(data);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    analyze(topic);
  };

  const handleSample = (sample: string) => {
    setTopic(sample);
    analyze(sample);
  };

  return (
    <>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .outlet-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
          animation: fadeIn 0.4s ease;
        }
        @media (min-width: 1024px) {
          .outlet-grid { grid-template-columns: repeat(3, 1fr); }
        }
        .search-input:focus { outline: none; box-shadow: 0 0 0 3px rgba(37,99,235,0.15); }
        .analyze-btn:hover:not(:disabled) { background: #1d4ed8 !important; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(37,99,235,0.3) !important; }
        .analyze-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .sample-btn:hover { background: #f9fafb !important; border-color: #9ca3af !important; }
        .spectrum-bar { background: white; border-radius: 12px; border: 1px solid #e5e7eb; padding: 20px; margin-bottom: 24px; box-shadow: 0 1px 4px rgba(0,0,0,0.05); }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        {/* Header */}
        <header style={{ background: '#0f172a', borderBottom: '1px solid #1e293b' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
            </div>
            <Link href="/settings" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', textDecoration: 'none', fontSize: '13px', fontWeight: 500, padding: '6px 12px', borderRadius: '8px', border: '1px solid #1e293b', transition: 'all 0.2s' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
              </svg>
              Settings
            </Link>
          </div>
        </header>

        {/* Hero */}
        <div style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)', padding: '48px 24px 56px' }}>
          <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
            <p style={{ color: '#38bdf8', fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px' }}>
              See the full picture
            </p>
            <h2 style={{ color: 'white', fontFamily: 'Georgia, serif', fontSize: '36px', fontWeight: 700, lineHeight: 1.25, margin: '0 0 16px', letterSpacing: '-0.02em' }}>
              How does the media cover your topic?
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: 1.7, margin: '0 0 32px' }}>
              Enter any news topic to see how Fox News, WSJ, NPR, NYT, and The Guardian would each frame the story — and what each outlet emphasizes, omits, and distorts.
            </p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', maxWidth: '600px', margin: '0 auto 20px' }}>
              <input
                className="search-input"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. &quot;Climate change legislation&quot; or &quot;Immigration policy&quot;"
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid #334155',
                  background: '#1e293b',
                  color: 'white',
                  fontSize: '14px',
                  fontFamily: 'Georgia, serif',
                  transition: 'box-shadow 0.2s',
                }}
              />
              <button
                type="submit"
                disabled={loading || !topic.trim()}
                className="analyze-btn"
                style={{
                  padding: '12px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#2563eb',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {loading ? (
                  <>
                    <div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    Analyzing...
                  </>
                ) : 'Analyze'}
              </button>
            </form>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
              <span style={{ fontSize: '12px', color: '#64748b', alignSelf: 'center' }}>Try:</span>
              {SAMPLE_TOPICS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSample(s)}
                  disabled={loading}
                  className="sample-btn"
                  style={{
                    fontSize: '12px',
                    color: '#94a3b8',
                    background: 'transparent',
                    border: '1px solid #334155',
                    borderRadius: '20px',
                    padding: '4px 12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontFamily: 'Georgia, serif',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main content */}
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px 80px' }}>
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '14px 18px', marginBottom: '24px', color: '#991b1b', fontSize: '14px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: '1px' }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div>
                <strong>Error:</strong> {error}
                {error.includes('API key') && (
                  <> — <Link href="/settings" style={{ color: '#2563eb' }}>Go to Settings</Link></>
                )}
              </div>
            </div>
          )}

          {loading && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid #e5e7eb', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <div>
                  <p style={{ color: '#374151', fontFamily: 'Georgia, serif', fontSize: '16px', fontWeight: 600, margin: '0 0 4px' }}>Consulting 5 newsrooms...</p>
                  <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>Analyzing framing, tone, and bias patterns</p>
                </div>
              </div>
            </div>
          )}

          {result && !loading && (
            <>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>
                  "{result.topic}"
                </h2>
                <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>Coverage across the political spectrum — click any card for full analysis</p>
              </div>
              <SpectrumBar outlets={result.outlets} />
              <div className="outlet-grid">
                {result.outlets.slice().sort((a, b) => (b.lean ?? 0) - (a.lean ?? 0)).map((o) => (
                  <OutletCard
                    key={o.outlet}
                    outlet={o}
                    isSelected={selected?.outlet === o.outlet}
                    onClick={() => setSelected(selected?.outlet === o.outlet ? null : o)}
                  />
                ))}
              </div>
            </>
          )}

          {!result && !loading && !error && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '17px', color: '#374151', margin: '0 0 6px', fontWeight: 600 }}>
                No topic analyzed yet
              </p>
              <p style={{ fontSize: '14px', margin: 0 }}>Enter a topic above to see how 5 major outlets cover it</p>
            </div>
          )}
        </main>
      </div>

      {selected && <DetailPanel outlet={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
