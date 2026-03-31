// SVG visualisations for multivariate distributions

function MVNContours() {
  // Bivariate Normal: concentric ellipses showing PDF contour levels
  // rho controls correlation, sigma1/sigma2 control spread
  const W = 280, H = 200, cx = W/2, cy = H/2;
  const levels = [0.95, 0.75, 0.5, 0.3, 0.15, 0.06];
  const rho = 0.5; // moderate positive correlation

  return (
    <div className="mv-viz">
      <div className="mv-viz-label">Bivariate Normal — contour plot (ρ = 0.5)</div>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="mv-svg">
        {/* Axes */}
        <line x1={cx} y1={10} x2={cx} y2={H-10} stroke="#1e2433" strokeWidth="1"/>
        <line x1={10} y1={cy} x2={W-10} y2={cy} stroke="#1e2433" strokeWidth="1"/>
        <text x={W-15} y={cy-4} fill="#3a4460" fontSize="9" fontFamily="monospace">X₁</text>
        <text x={cx+4} y={16} fill="#3a4460" fontSize="9" fontFamily="monospace">X₂</text>

        {/* Elliptical contours — bivariate normal at rho=0.5 */}
        {levels.map((alpha, i) => {
          const scale = Math.sqrt(-2 * Math.log(alpha));
          const a = scale * 55 * 1;           // semi-major (along eigen vec)
          const b = scale * 55 * Math.sqrt(1 - rho);  // semi-minor
          const angle = 45;  // ellipse tilted 45° for rho > 0
          const opacity = 0.8 - i * 0.1;
          const stroke = `hsl(${160 - i * 18}, 80%, ${60 - i * 5}%)`;
          return (
            <ellipse
              key={i}
              cx={cx} cy={cy}
              rx={a} ry={b}
              transform={`rotate(${angle}, ${cx}, ${cy})`}
              fill="none"
              stroke={stroke}
              strokeWidth={i === 0 ? 1 : 1.5}
              opacity={opacity}
            />
          );
        })}

        {/* Center dot */}
        <circle cx={cx} cy={cy} r={3} fill="#4fffb0" opacity={0.9}/>

        {/* Labels */}
        <text x={cx + 4} y={cy - 4} fill="#4fffb0" fontSize="8" fontFamily="monospace">μ</text>
      </svg>
      <div className="mv-viz-caption">
        Ellipses show regions containing 6%, 15%, 30%, 50%, 75%, 95% of the probability mass. Tilt reflects the correlation ρ between X₁ and X₂.
      </div>
    </div>
  );
}

function DirichletSimplex() {
  // Ternary plot on an equilateral triangle showing Dirichlet density
  // Vertices: p₁ (top), p₂ (bottom-left), p₃ (bottom-right)
  const W = 280, H = 220;
  const margin = 30;
  const TH = H - margin * 2;
  const TW = TH * (2 / Math.sqrt(3));

  const v1 = [W/2, margin];                              // top (p₁)
  const v2 = [(W - TW)/2, H - margin];                  // bottom-left (p₂)
  const v3 = [(W + TW)/2, H - margin];                  // bottom-right (p₃)

  // Convert barycentric (p1,p2,p3) to Cartesian
  const bary2cart = (p1, p2, p3) => [
    p1 * v1[0] + p2 * v2[0] + p3 * v3[0],
    p1 * v1[1] + p2 * v2[1] + p3 * v3[1],
  ];

  // Show three Dirichlet presets as heatmap dots
  const alpha_presets = [
    { alpha: [2, 5, 2], color: '#4fffb0', label: 'α=(2,5,2)' },
    { alpha: [0.5, 0.5, 0.5], color: '#f472b6', label: 'α=(0.5,…): sparse' },
    { alpha: [5, 5, 5], color: '#60a5fa', label: 'α=(5,5,5): uniform' },
  ];

  // Generate dots for each preset by sampling from the Dirichlet distribution
  const presetDots = alpha_presets.map(({ alpha, color }) => {
    const dots = [];
    // Approximate the mode and surrounding region
    const sum = alpha.reduce((s, a) => s + a, 0);
    const mode = alpha.map(a => Math.max(0.01, (a - 1) / (sum - alpha.length)));
    const modeSum = mode.reduce((s, v) => s + v, 0);
    const normMode = modeSum > 0 ? mode.map(v => v/modeSum) : [1/3, 1/3, 1/3];

    // Create a few scattered dots for visual representation
    for (let i = 0; i < 30; i++) {
      const jitter = 0.12;
      const p = [
        normMode[0] + (Math.sin(i * 2.3) * jitter),
        normMode[1] + (Math.sin(i * 3.7) * jitter),
      ];
      p[2] = 1 - p[0] - p[1];
      if (p[0] > 0 && p[1] > 0 && p[2] > 0) {
        dots.push(bary2cart(p[0], p[1], p[2]));
      }
    }
    return { dots, color };
  });

  return (
    <div className="mv-viz">
      <div className="mv-viz-label">Dirichlet — simplex (ternary) plot</div>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="mv-svg">
        {/* Triangle */}
        <polygon
          points={`${v1[0]},${v1[1]} ${v2[0]},${v2[1]} ${v3[0]},${v3[1]}`}
          fill="#0e1118" stroke="#252d42" strokeWidth="1.5"
        />
        {/* Grid lines (ternary grid) */}
        {[0.25, 0.5, 0.75].map(t => {
          const ab = bary2cart(t, 1-t, 0);
          const ac = bary2cart(t, 0, 1-t);
          const bc = bary2cart(0, t, 1-t);
          const ca = bary2cart(0, 1-t, t);
          const ba = bary2cart(1-t, t, 0);
          const cb = bary2cart(1-t, 0, t);
          return (
            <g key={t} stroke="#1a2035" strokeWidth="0.5" opacity="0.8">
              <line x1={ab[0]} y1={ab[1]} x2={ac[0]} y2={ac[1]} />
              <line x1={bc[0]} y1={bc[1]} x2={ba[0]} y2={ba[1]} />
              <line x1={ca[0]} y1={ca[1]} x2={cb[0]} y2={cb[1]} />
            </g>
          );
        })}
        {/* Vertex labels */}
        <text x={v1[0]} y={v1[1]-6} textAnchor="middle" fill="#7a86a8" fontSize="9" fontFamily="monospace">p₁</text>
        <text x={v2[0]-6} y={v2[1]+4} textAnchor="end" fill="#7a86a8" fontSize="9" fontFamily="monospace">p₂</text>
        <text x={v3[0]+6} y={v3[1]+4} textAnchor="start" fill="#7a86a8" fontSize="9" fontFamily="monospace">p₃</text>
        {/* Preset dots */}
        {presetDots.map(({ dots, color }, pi) =>
          dots.map(([x, y], di) => (
            <circle key={`${pi}-${di}`} cx={x} cy={y} r={2.5} fill={color} opacity={0.55} />
          ))
        )}
        {/* Center reference */}
        {(() => { const [cx2, cy2] = bary2cart(1/3,1/3,1/3); return <circle cx={cx2} cy={cy2} r={3} fill="#4fffb0" opacity={0.9}/>; })()}
      </svg>
      <div className="mv-legend-row">
        {alpha_presets.map(({ color, label }) => (
          <span key={label} className="mv-legend-item">
            <span className="mv-legend-dot" style={{ background: color }} />
            <span>{label}</span>
          </span>
        ))}
      </div>
      <div className="mv-viz-caption">
        Each point is a probability vector (p₁, p₂, p₃) summing to 1. Concentration parameter α controls whether mass is sparse (corners) or spread (center).
      </div>
    </div>
  );
}

function MultinomialBars() {
  // Show PMF for k=3 categories as a grouped bar chart
  const W = 280, H = 180;
  const scenarios = [
    { p: [0.5, 0.3, 0.2], n: 10, label: 'p=(0.5, 0.3, 0.2)', color: '#4fffb0' },
    { p: [1/3, 1/3, 1/3], n: 10, label: 'Uniform p=(⅓, ⅓, ⅓)', color: '#60a5fa' },
  ];

  // Show expected counts (E[X_i] = n * p_i) as bars
  const barW = 30, gap = 8, groupGap = 24;
  const maxVal = Math.max(...scenarios.flatMap(s => s.p.map(p => p * s.n)));

  return (
    <div className="mv-viz">
      <div className="mv-viz-label">Multinomial — expected counts (n=10, k=3 categories)</div>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="mv-svg">
        {/* Y-axis */}
        <line x1={32} y1={10} x2={32} y2={H-30} stroke="#1e2433" strokeWidth="1"/>
        {/* X labels */}
        {['Cat 1', 'Cat 2', 'Cat 3'].map((label, ci) => {
          const gx = 40 + ci * (barW * 2 + gap + groupGap);
          return (
            <text key={ci} x={gx + barW} y={H-14} textAnchor="middle" fill="#5a6480" fontSize="8" fontFamily="monospace">{label}</text>
          );
        })}
        {/* Y label */}
        <text x={8} y={H/2} fill="#5a6480" fontSize="8" fontFamily="monospace" textAnchor="middle" transform={`rotate(-90, 8, ${H/2})`}>E[X]</text>

        {/* Bars */}
        {['Cat 1', 'Cat 2', 'Cat 3'].map((_, ci) => {
          const gx = 40 + ci * (barW * 2 + gap + groupGap);
          return scenarios.map((sc, si) => {
            const val = sc.p[ci] * sc.n;
            const barH = (val / maxVal) * (H - 50);
            const x = gx + si * (barW + gap);
            const y = H - 30 - barH;
            return (
              <g key={`${ci}-${si}`}>
                <rect x={x} y={y} width={barW} height={barH}
                  fill={sc.color} opacity={0.75} />
                <text x={x + barW/2} y={y - 3} textAnchor="middle"
                  fill={sc.color} fontSize="8" fontFamily="monospace">{val.toFixed(1)}</text>
              </g>
            );
          });
        })}

        {/* Y-axis ticks */}
        {[0, 2, 4, 6].map(v => {
          const y = H - 30 - (v / maxVal) * (H - 50);
          return (
            <g key={v}>
              <line x1={28} y1={y} x2={32} y2={y} stroke="#1e2433" strokeWidth="1"/>
              <text x={26} y={y+3} textAnchor="end" fill="#3a4460" fontSize="7" fontFamily="monospace">{v}</text>
            </g>
          );
        })}
      </svg>
      <div className="mv-legend-row">
        {scenarios.map(({ color, label }) => (
          <span key={label} className="mv-legend-item">
            <span className="mv-legend-dot" style={{ background: color }} />
            <span style={{ fontSize: 10 }}>{label}</span>
          </span>
        ))}
      </div>
      <div className="mv-viz-caption">
        Expected counts E[X_i] = n·p_i for two probability vectors. The Multinomial generalises the Binomial to k categories.
      </div>
    </div>
  );
}

export default function MultivariateViz({ dist }) {
  if (dist.vizType === 'mvn_contours')     return <MVNContours />;
  if (dist.vizType === 'dirichlet_simplex') return <DirichletSimplex />;
  if (dist.vizType === 'multinomial_bars')  return <MultinomialBars />;
  return null;
}
