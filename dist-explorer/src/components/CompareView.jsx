import { useState, useMemo } from 'react';
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { MathInline, MathBlock } from '../utils/math';

const STAT_ROWS = [
  { key: 'mean',     label: 'Mean',          formulaKey: 'mean' },
  { key: 'variance', label: 'Variance',       formulaKey: 'var'  },
  { key: 'skewness', label: 'Skewness',       formulaKey: 'skew' },
  { key: 'kurtosis', label: 'Exc. Kurtosis',  formulaKey: null   },
  { key: 'support',  label: 'Support',        formulaKey: null   },
];

export default function CompareView({ distributions, families, onOpenDist }) {
  const [distA_id, setDistA_id] = useState('normal');
  const [distB_id, setDistB_id] = useState('student_t');

  const distA = distributions.find(d => d.id === distA_id);
  const distB = distributions.find(d => d.id === distB_id);

  const famA = families.find(f => f.id === distA?.family);
  const famB = families.find(f => f.id === distB?.family);

  const paramsA_init = useMemo(() => {
    const p = {}; (distA?.params || []).forEach(pm => { p[pm.name] = pm.default; }); return p;
  }, [distA_id]);
  const paramsB_init = useMemo(() => {
    const p = {}; (distB?.params || []).forEach(pm => { p[pm.name] = pm.default; }); return p;
  }, [distB_id]);

  const [paramsA, setParamsA] = useState(paramsA_init);
  const [paramsB, setParamsB] = useState(paramsB_init);

  // Reset params when dist changes
  const handleSelectA = (id) => {
    setDistA_id(id);
    const d = distributions.find(x => x.id === id);
    const p = {}; (d?.params || []).forEach(pm => { p[pm.name] = pm.default; });
    setParamsA(p);
  };
  const handleSelectB = (id) => {
    setDistB_id(id);
    const d = distributions.find(x => x.id === id);
    const p = {}; (d?.params || []).forEach(pm => { p[pm.name] = pm.default; });
    setParamsB(p);
  };

  const colorA = famA?.color || '#4fffb0';
  const colorB = famB?.color || '#60a5fa';

  // Build overlaid chart data
  const overlaidData = useMemo(() => {
    if (!distA || !distB) return [];
    try {
      const ptsA = distA.pdfPoints?.(paramsA) || [];
      const ptsB = distB.pdfPoints?.(paramsB) || [];
      if (!ptsA.length || !ptsB.length) return [];

      // Find common x range
      const allX = new Set([
        ...ptsA.map(p => p.x),
        ...ptsB.map(p => p.x),
      ]);

      // For continuous dists, re-sample on a common domain
      const isContinuousA = distA.type === 'continuous';
      const isContinuousB = distB.type === 'continuous';

      if (isContinuousA && isContinuousB) {
        const minX = Math.max(ptsA[0].x, ptsB[0].x);
        const maxX = Math.min(ptsA[ptsA.length - 1].x, ptsB[ptsB.length - 1].x);
        if (maxX <= minX) return [];
        return Array.from({ length: 150 }, (_, i) => {
          const x = minX + i * (maxX - minX) / 149;
          const yA = distA.pdf?.(x, paramsA) ?? 0;
          const yB = distB.pdf?.(x, paramsB) ?? 0;
          return { x: parseFloat(x.toFixed(3)), a: isFinite(yA) ? yA : 0, b: isFinite(yB) ? yB : 0 };
        });
      }

      // Discrete or mixed: use union of x values
      const mapA = Object.fromEntries(ptsA.map(p => [p.x, p.y]));
      const mapB = Object.fromEntries(ptsB.map(p => [p.x, p.y]));
      const xs = [...allX].sort((a, b) => a - b).slice(0, 40);
      return xs.map(x => ({
        x,
        a: mapA[x] ?? 0,
        b: mapB[x] ?? 0,
      }));
    } catch { return []; }
  }, [distA_id, distB_id, paramsA, paramsB]);

  const computeStat = (dist, params, key) => {
    if (key === 'support') return dist.support;
    const fn = dist.stats?.[key];
    if (!fn) return '—';
    try {
      const v = fn(params);
      if (typeof v === 'string') return v;
      if (!isFinite(v) || isNaN(v)) return '∞ / undef.';
      return parseFloat(v.toFixed(5)).toString();
    } catch { return '—'; }
  };

  const isBothDiscrete = distA?.type === 'discrete' && distB?.type === 'discrete';

  return (
    <div className="compare-view">
      <div className="compare-header">
        <h2 className="compare-title">Compare Distributions</h2>
        <p className="compare-sub">Select two distributions and adjust their parameters to compare shapes, statistics, and properties side by side.</p>
      </div>

      {/* Selectors */}
      <div className="compare-selectors">
        <DistSelector
          label="Distribution A" color={colorA}
          value={distA_id} distributions={distributions} families={families}
          onChange={handleSelectA}
        />
        <div className="compare-vs">vs</div>
        <DistSelector
          label="Distribution B" color={colorB}
          value={distB_id} distributions={distributions} families={families}
          onChange={handleSelectB}
        />
      </div>

      {/* Overlaid chart */}
      {overlaidData.length > 0 && (
        <div className="compare-chart-section">
          <div className="section-label">Overlaid {isBothDiscrete ? 'PMF' : 'PDF'}</div>
          <div className="compare-chart-wrap">
            <ResponsiveContainer width="100%" height={220}>
              {isBothDiscrete ? (
                <LineChart data={overlaidData} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
                  <XAxis dataKey="x" tick={{ fontSize: 10, fill: '#6b7280' }} tickLine={false} axisLine={{ stroke: '#1a2035' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} tickLine={false} axisLine={false} width={38} />
                  <Tooltip
                    contentStyle={{ background: '#0c0f18', border: '1px solid #1a2035', fontSize: 12 }}
                    formatter={(v, name) => [v.toFixed(5), name === 'a' ? distA.name : distB.name]}
                  />
                  <Line type="monotone" dataKey="a" stroke={colorA} strokeWidth={2} dot={{ r: 3, fill: colorA }} name="a" />
                  <Line type="monotone" dataKey="b" stroke={colorB} strokeWidth={2} dot={{ r: 3, fill: colorB }} name="b" />
                </LineChart>
              ) : (
                <AreaChart data={overlaidData} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
                  <defs>
                    <linearGradient id="gradA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colorA} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={colorA} stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="gradB" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colorB} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={colorB} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="x" tick={{ fontSize: 10, fill: '#6b7280' }} tickLine={false} axisLine={{ stroke: '#1a2035' }} tickCount={7} />
                  <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} tickLine={false} axisLine={false} width={38} />
                  <Tooltip
                    contentStyle={{ background: '#0c0f18', border: '1px solid #1a2035', fontSize: 12 }}
                    formatter={(v, name) => [v.toFixed(5), name === 'a' ? distA.name : distB.name]}
                    labelFormatter={v => `x = ${v}`}
                  />
                  <Area type="monotone" dataKey="a" stroke={colorA} strokeWidth={2.5} fill="url(#gradA)" dot={false} name="a" />
                  <Area type="monotone" dataKey="b" stroke={colorB} strokeWidth={2.5} fill="url(#gradB)" dot={false} name="b" />
                </AreaChart>
              )}
            </ResponsiveContainer>
            <div className="compare-chart-legend">
              <span style={{ color: colorA }}>— {distA?.name}</span>
              <span style={{ color: colorB }}>— {distB?.name}</span>
            </div>
          </div>
        </div>
      )}

      {/* Side by side panels */}
      <div className="compare-panels">
        {[
          { dist: distA, params: paramsA, setParams: setParamsA, color: colorA, label: 'A' },
          { dist: distB, params: paramsB, setParams: setParamsB, color: colorB, label: 'B' },
        ].map(({ dist, params, setParams, color, label }) => dist && (
          <div key={label} className="compare-panel" style={{ '--fc': color }}>
            <div className="cp-header">
              <div className="cp-label-badge">Distribution {label}</div>
              <button className="cp-open-btn" onClick={() => onOpenDist(dist.id)}>
                Open full card →
              </button>
            </div>
            <div className="cp-name">{dist.name}</div>
            <div className="cp-tagline">{dist.tagline}</div>

            {/* Sliders */}
            {dist.params && dist.params.length > 0 && (
              <div className="cp-sliders">
                {dist.params.map(pm => (
                  <div key={pm.name} className="cp-slider-row">
                    <div className="cp-slider-header">
                      <span className="cp-slider-label">{pm.label}</span>
                      <span className="cp-slider-val" style={{ color }}>{params[pm.name]}</span>
                    </div>
                    <input type="range" min={pm.min} max={pm.max} step={pm.step}
                      value={params[pm.name]}
                      onChange={e => setParams(p => ({ ...p, [pm.name]: parseFloat(e.target.value) }))}
                      className="slider" style={{ '--fc': color }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Stats comparison table */}
      <div className="compare-stats-section">
        <div className="section-label">Statistics Comparison</div>
        <div className="compare-stats-table-wrap">
          <table className="compare-stats-table">
            <thead>
              <tr>
                <th>Statistic</th>
                <th style={{ color: colorA }}>{distA?.name}</th>
                <th style={{ color: colorB }}>{distB?.name}</th>
              </tr>
            </thead>
            <tbody>
              {STAT_ROWS.map(row => (
                <tr key={row.key}>
                  <td className="cst-label">{row.label}</td>
                  <td className="cst-val" style={{ color: colorA }}>
                    {distA ? computeStat(distA, paramsA, row.key) : '—'}
                  </td>
                  <td className="cst-val" style={{ color: colorB }}>
                    {distB ? computeStat(distB, paramsB, row.key) : '—'}
                  </td>
                </tr>
              ))}
              <tr>
                <td className="cst-label">Type</td>
                <td className="cst-val">{distA?.type || '—'}</td>
                <td className="cst-val">{distB?.type || '—'}</td>
              </tr>
              <tr>
                <td className="cst-label">Family</td>
                <td className="cst-val">{famA?.label || '—'}</td>
                <td className="cst-val">{famB?.label || '—'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Use case comparison */}
      {distA && distB && (
        <div className="compare-usecases">
          {[{ dist: distA, color: colorA }, { dist: distB, color: colorB }].map(({ dist, color }) => (
            <div key={dist.id} className="compare-uc-panel">
              <div className="section-label" style={{ color }}>{dist.name} — Use Cases</div>
              <ul className="usecase-list">
                {dist.useCases?.slice(0, 4).map((u, i) => (
                  <li key={i} className="usecase-item">
                    <span className="usecase-dot" style={{ color }}>◆</span>
                    <span>{u}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DistSelector({ label, color, value, distributions, families, onChange }) {
  const familyGroups = families.map(f => ({
    family: f,
    dists: distributions.filter(d => d.family === f.id),
  }));
  return (
    <div className="dist-selector" style={{ '--fc': color }}>
      <div className="ds-label">{label}</div>
      <select className="ds-select" value={value} onChange={e => onChange(e.target.value)}>
        {familyGroups.map(({ family, dists }) => (
          <optgroup key={family.id} label={family.label}>
            {dists.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </optgroup>
        ))}
      </select>
      <div className="ds-tagline">
        {distributions.find(d => d.id === value)?.tagline}
      </div>
    </div>
  );
}
