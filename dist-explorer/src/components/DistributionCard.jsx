import { useState, useCallback, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { MathBlock } from '../utils/math';
import MultivariateViz from './MultivariateViz';

export default function DistributionCard({ dist, allDists, onBack, onOpenDist, families }) {
  const defaultParams = useMemo(() => {
    const p = {};
    (dist.params || []).forEach(pm => { p[pm.name] = pm.default; });
    return p;
  }, [dist.id]);

  const [params, setParams]       = useState(defaultParams);
  const [activeTab, setActiveTab] = useState('formulae');
  const [activePreset, setActivePreset] = useState(null);

  const handleParamChange = useCallback((name, value) => {
    setParams(prev => ({ ...prev, [name]: parseFloat(value) }));
    setActivePreset(null);
  }, []);

  const applyPreset = (preset, idx) => {
    setParams(prev => ({ ...prev, ...preset.params }));
    setActivePreset(idx);
  };

  const resetParams = () => {
    setParams(defaultParams);
    setActivePreset(null);
  };

  const family   = families.find(f => f.id === dist.family);
  const fc       = family?.color || '#4fffb0';
  const isDisc   = dist.type === 'discrete';
  const isMult   = dist.type === 'multivariate';
  const hasChart = !isMult;

  const chartData = useMemo(() => {
    try { return dist.pdfPoints?.(params) || []; } catch { return []; }
  }, [dist, params]);

  const fmtStat = fn => {
    try {
      const v = fn(params);
      if (v === undefined || v === null) return '—';
      if (typeof v === 'string') return v;
      if (!isFinite(v) || isNaN(v)) return '∞ / undefined';
      return parseFloat(v.toFixed(6)).toString();
    } catch { return '—'; }
  };

  const stats = useMemo(() => ({
    mean:     fmtStat(dist.stats?.mean     || (() => null)),
    variance: fmtStat(dist.stats?.variance || (() => null)),
    skewness: fmtStat(dist.stats?.skewness || (() => null)),
    kurtosis: fmtStat(dist.stats?.kurtosis || (() => null)),
  }), [dist, params]);

  const TABS = [
    { id: 'formulae',    label: 'Formulae'       },
    { id: 'usecases',    label: 'Use Cases'       },
    { id: 'assumptions', label: 'Assumptions'     },
    { id: 'failures',    label: 'When It Breaks'  },
  ];

  const TooltipStyle = {
    contentStyle: { background: '#0c0f18', border: `1px solid ${fc}33`, fontSize: 12, borderRadius: 0 },
    labelStyle:   { color: '#8a94b0' },
    itemStyle:    { color: fc },
  };

  return (
    <div className="card-page">

      {/* ── HEADER ── */}
      <div className="card-header" style={{ '--fc': fc }}>
        <div className="card-header-top">
          <button className="card-back" onClick={onBack}>← Back</button>
          <a className="card-wiki-link"
            href={`https://en.wikipedia.org/wiki/${dist.wikiSlug}`}
            target="_blank" rel="noopener noreferrer">
            Wikipedia ↗
          </a>
        </div>
        <div className="card-header-body">
          <div className="card-family-badge" style={{ '--fc': fc }}>
            {family?.icon} {family?.label}
          </div>
          <h1 className="card-name">{dist.name}</h1>
          <p className="card-tagline">{dist.tagline}</p>
          <div className="card-support">
            Support: <code>{dist.support}</code>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="card-body">

        {/* LEFT */}
        <div className="card-left">

          {/* CHART */}
          {hasChart && chartData.length > 0 && (
            <div className="card-section">
              <div className="section-label">
                {isDisc ? 'PMF — Probability Mass Function' : 'PDF — Probability Density Function'}
              </div>
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height={190}>
                  {isDisc ? (
                    <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }} barCategoryGap="25%">
                      <XAxis dataKey="x" tick={{ fontSize: 10, fill: '#6b7280' }} tickLine={false} axisLine={{ stroke: '#1a2035' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} tickLine={false} axisLine={false} width={40} />
                      <Tooltip {...TooltipStyle} formatter={v => [v.toFixed(5), 'P(X=k)']} />
                      <Bar dataKey="y" fill={fc} opacity={0.82} radius={0} />
                    </BarChart>
                  ) : (
                    <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                      <defs>
                        <linearGradient id={`g-${dist.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor={fc} stopOpacity={0.35} />
                          <stop offset="95%" stopColor={fc} stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="x" tick={{ fontSize: 10, fill: '#6b7280' }} tickLine={false} axisLine={{ stroke: '#1a2035' }} tickCount={6} />
                      <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} tickLine={false} axisLine={false} width={40} />
                      <Tooltip {...TooltipStyle} formatter={v => [v.toFixed(5), 'f(x)']} labelFormatter={v => `x = ${v}`} />
                      <Area type="monotone" dataKey="y" stroke={fc} strokeWidth={2.5} fill={`url(#g-${dist.id})`} dot={false} activeDot={{ r: 3, fill: fc }} />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>

              {/* Presets */}
              {dist.presets && dist.presets.length > 0 && (
                <div className="presets-row">
                  <span className="presets-label">Presets:</span>
                  {dist.presets.map((preset, i) => (
                    <button
                      key={i}
                      className={`preset-btn ${activePreset === i ? 'active' : ''}`}
                      style={{ '--fc': fc }}
                      onClick={() => applyPreset(preset, i)}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Sliders */}
              {dist.params && dist.params.length > 0 && (
                <div className="sliders">
                  <div className="sliders-header">
                    <span className="sliders-title">Parameters</span>
                    <button className="reset-btn" onClick={resetParams} title="Reset to defaults">
                      ↺ Reset
                    </button>
                  </div>
                  {dist.params.map(pm => (
                    <div key={pm.name} className="slider-row">
                      <div className="slider-header">
                        <span className="slider-label">{pm.label}</span>
                        <span className="slider-value" style={{ color: fc }}>{params[pm.name]}</span>
                      </div>
                      <input type="range"
                        min={pm.min} max={pm.max} step={pm.step}
                        value={params[pm.name]}
                        onChange={e => handleParamChange(pm.name, e.target.value)}
                        className="slider" style={{ '--fc': fc }}
                      />
                      <div className="slider-range">
                        <span>{pm.min}</span>
                        <span className="slider-desc">{pm.desc}</span>
                        <span>{pm.max}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {isMult && (
            <div className="card-section">
              {dist.vizType && <MultivariateViz dist={dist} />}
              <div className="multivariate-note" style={{ marginTop: dist.vizType ? 12 : 0 }}>
                <span style={{ fontSize: 20 }}>⊞</span>
                <div style={{ fontSize: 12, color: 'var(--sub)' }}>
                  Multivariate distribution — interactive sliders not applicable. The visualisation above uses fixed illustrative parameters.
                </div>
              </div>
            </div>
          )}

          {/* STATS GRID */}
          <div className="card-section">
            <div className="section-label">
              Computed Statistics
              {dist.params?.length > 0 && (
                <span style={{ color: '#2a3450', fontSize: 10, marginLeft: 8, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                  updates with sliders
                </span>
              )}
            </div>
            <div className="stats-grid">
              {[
                { label: 'Mean',          val: stats.mean,     hi: true  },
                { label: 'Variance',      val: stats.variance, hi: false },
                { label: 'Skewness',      val: stats.skewness, hi: false },
                { label: 'Exc. Kurtosis', val: stats.kurtosis, hi: false },
              ].map(s => (
                <div key={s.label} className="stat-box">
                  <div className="stat-box-label">{s.label}</div>
                  <div className="stat-box-val" style={{ color: s.hi ? fc : undefined }}>
                    {s.val}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* INTUITION */}
          <div className="card-section">
            <div className="section-label">Intuition</div>
            <p className="story-text">{dist.story}</p>
          </div>

          {/* RELATED */}
          {dist.related?.length > 0 && (
            <div className="card-section">
              <div className="section-label">Related Distributions</div>
              <div className="related-chips">
                {dist.related.map(id => {
                  const rel = allDists.find(d => d.id === id);
                  if (!rel) return null;
                  const rf = families.find(f => f.id === rel.family);
                  return (
                    <button key={id} className="related-chip"
                      onClick={() => onOpenDist(id)} style={{ '--fc': rf?.color || '#4fffb0' }}>
                      {rel.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="card-right">
          <div className="tab-bar">
            {TABS.map(t => (
              <button key={t.id}
                className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
                style={{ '--fc': fc }}
                onClick={() => setActiveTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="tab-content">

            {/* FORMULAE */}
            {activeTab === 'formulae' && (
              <div>
                {dist.formulas && Object.entries(dist.formulas).map(([key, tex]) => {
                  if (!tex || tex.includes('N/A') || tex === '') return null;
                  const label = {
                    pdf: 'PDF', pmf: 'PMF', mean: 'Mean', var: 'Variance',
                    skew: 'Skewness', mgf: 'MGF', cf: 'Char. Fn', pgf: 'PGF',
                  }[key] || key;
                  return (
                    <div key={key} className="formula-row">
                      <div className="formula-key">{label}</div>
                      <div className="formula-val"><MathBlock tex={tex} /></div>
                    </div>
                  );
                })}
                <a className="wiki-full-link"
                  href={`https://en.wikipedia.org/wiki/${dist.wikiSlug}`}
                  target="_blank" rel="noopener noreferrer">
                  <span className="wiki-icon">𝒲</span>
                  <div>
                    <div className="wiki-link-title">Full derivations & proofs</div>
                    <div className="wiki-link-sub">Wikipedia — {dist.name} distribution</div>
                  </div>
                  <span className="wiki-link-arrow">↗</span>
                </a>
              </div>
            )}

            {/* USE CASES */}
            {activeTab === 'usecases' && (
              <div>
                <div className="tab-intro">
                  When would a practitioner reach for the {dist.name} distribution?
                </div>
                <ul className="usecase-list">
                  {dist.useCases?.map((u, i) => (
                    <li key={i} className="usecase-item">
                      <span className="usecase-dot" style={{ color: fc }}>◆</span>
                      <span>{u}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ASSUMPTIONS */}
            {activeTab === 'assumptions' && (
              <div>
                <div className="tab-intro">
                  These conditions should hold for the {dist.name} to be the right model.
                </div>
                <ul className="assumption-list">
                  {dist.assumptions?.map((a, i) => (
                    <li key={i} className="assumption-item">
                      <span className="assumption-check" style={{ color: fc }}>✓</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* FAILURES */}
            {activeTab === 'failures' && (
              <div>
                <div className="tab-intro">
                  When the {dist.name} is the wrong choice, and what to use instead.
                </div>
                {dist.failureModes?.length > 0 ? (
                  <div className="failure-list">
                    {dist.failureModes.map((fm, i) => {
                      const linked = allDists.find(d =>
                        fm.use.toLowerCase().includes(d.name.toLowerCase()) && d.name.length > 3
                      );
                      return (
                        <div key={i} className="failure-item">
                          <div className="failure-condition">
                            <span className="failure-if">If:</span> {fm.condition}
                          </div>
                          <div className="failure-use">
                            <span className="failure-arrow">→</span>
                            {linked ? (
                              <button className="failure-link" style={{ color: fc }}
                                onClick={() => onOpenDist(linked.id)}>
                                {fm.use} →
                              </button>
                            ) : (
                              <span>{fm.use}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="tab-empty">No documented failure modes.</div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
