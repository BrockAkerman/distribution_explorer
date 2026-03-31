import { useState, useCallback } from 'react';

const NODES = [
  // Discrete bounded row
  { id: 'bernoulli',          x: 80,   y: 80,  label: 'Bernoulli',        family: 'discrete_bounded'   },
  { id: 'discrete_uniform',   x: 200,  y: 80,  label: 'Discrete\nUniform',family: 'discrete_bounded'   },
  { id: 'binomial',           x: 320,  y: 80,  label: 'Binomial',         family: 'discrete_bounded'   },
  { id: 'hypergeometric',     x: 440,  y: 80,  label: 'Hypergeo-\nmetric', family: 'discrete_bounded'   },
  { id: 'beta_binomial',      x: 320,  y: 185, label: 'Beta-\nBinomial',  family: 'discrete_bounded'   },
  { id: 'poisson_binomial',   x: 200,  y: 185, label: 'Poisson\nBinomial', family: 'discrete_bounded'   },
  // Discrete count
  { id: 'poisson',            x: 80,   y: 290, label: 'Poisson',          family: 'discrete_count'     },
  { id: 'negative_binomial',  x: 220,  y: 290, label: 'Neg.\nBinomial',   family: 'discrete_count'     },
  { id: 'geometric',          x: 360,  y: 290, label: 'Geometric',        family: 'discrete_count'     },
  { id: 'zero_inflated_poisson',x:80,  y: 390, label: 'ZIP',              family: 'discrete_count'     },
  // Multivariate
  { id: 'multinomial',        x: 440,  y: 185, label: 'Multinomial',      family: 'multivariate'       },
  { id: 'dirichlet',          x: 440,  y: 390, label: 'Dirichlet',        family: 'multivariate'       },
  { id: 'multivariate_normal',x: 580,  y: 540, label: 'MVN',              family: 'multivariate'       },
  // Bounded continuous
  { id: 'beta',               x: 580,  y: 290, label: 'Beta',             family: 'continuous_bounded' },
  { id: 'uniform_cont',       x: 580,  y: 185, label: 'Uniform\n(cont.)', family: 'continuous_bounded' },
  { id: 'triangular',         x: 700,  y: 185, label: 'Triangular',       family: 'continuous_bounded' },
  // Continuous positive
  { id: 'exponential',        x: 700,  y: 80,  label: 'Exponential',      family: 'continuous_positive'},
  { id: 'gamma',              x: 820,  y: 80,  label: 'Gamma',            family: 'continuous_positive'},
  { id: 'erlang',             x: 940,  y: 80,  label: 'Erlang',           family: 'continuous_positive'},
  { id: 'chi_squared',        x: 820,  y: 185, label: 'Chi-\nSquared',    family: 'continuous_positive'},
  { id: 'inverse_gamma',      x: 940,  y: 185, label: 'Inv.\nGamma',      family: 'continuous_positive'},
  { id: 'f_distribution',     x: 940,  y: 290, label: 'F-Dist',           family: 'continuous_positive'},
  { id: 'log_normal',         x: 700,  y: 290, label: 'Log-\nNormal',     family: 'continuous_positive'},
  { id: 'rayleigh',           x: 820,  y: 290, label: 'Rayleigh',         family: 'continuous_positive'},
  { id: 'inverse_gaussian',   x: 940,  y: 390, label: 'Inv.\nGaussian',   family: 'continuous_positive'},
  { id: 'beta_prime',         x: 700,  y: 390, label: 'Beta\nPrime',      family: 'continuous_positive'},
  // Real line
  { id: 'normal',             x: 580,  y: 430, label: 'Normal',           family: 'continuous_real'    },
  { id: 'student_t',          x: 700,  y: 490, label: "Student's t",      family: 'continuous_real'    },
  { id: 'cauchy',             x: 820,  y: 490, label: 'Cauchy',           family: 'continuous_real'    },
  { id: 'laplace',            x: 580,  y: 540, label: 'Laplace',          family: 'continuous_real'    },
  { id: 'logistic',           x: 700,  y: 590, label: 'Logistic',         family: 'continuous_real'    },
  { id: 'skew_normal',        x: 820,  y: 590, label: 'Skew-\nNormal',    family: 'continuous_real'    },
  { id: 'half_normal',        x: 940,  y: 540, label: 'Half-\nNormal',    family: 'continuous_positive'},
  // Survival
  { id: 'weibull',            x: 220,  y: 490, label: 'Weibull',          family: 'survival'           },
  { id: 'pareto',             x: 360,  y: 490, label: 'Pareto',           family: 'survival'           },
  { id: 'log_logistic',       x: 220,  y: 590, label: 'Log-\nLogistic',   family: 'survival'           },
  // Extreme value
  { id: 'gumbel',             x: 80,   y: 490, label: 'Gumbel',           family: 'extreme_value'      },
  { id: 'gev',                x: 80,   y: 590, label: 'GEV',              family: 'extreme_value'      },
];

const EDGES = [
  ['bernoulli',    'binomial',          'n trials'],
  ['bernoulli',    'geometric',         'wait for 1st'],
  ['bernoulli',    'poisson_binomial',  'vary p per trial'],
  ['binomial',     'beta_binomial',     'random p ~ Beta'],
  ['binomial',     'hypergeometric',    'no replacement'],
  ['binomial',     'multinomial',       'k categories'],
  ['binomial',     'poisson',           'n→∞, p→0, np=λ'],
  ['binomial',     'normal',            'n→∞ CLT'],
  ['poisson',      'negative_binomial', 'add overdispersion'],
  ['poisson',      'zero_inflated_poisson','add struct. zeros'],
  ['poisson',      'gamma',             'conjugate prior'],
  ['geometric',    'negative_binomial', 'wait for k-th'],
  ['geometric',    'exponential',       'continuous limit'],
  ['exponential',  'gamma',             'sum of k'],
  ['exponential',  'weibull',           'vary hazard rate'],
  ['gamma',        'erlang',            'integer k only'],
  ['gamma',        'chi_squared',       'k=n/2, scale=2'],
  ['gamma',        'inverse_gamma',     'X → 1/X'],
  ['gamma',        'log_normal',        'many products'],
  ['gamma',        'normal',            'k→∞ CLT'],
  ['chi_squared',  'f_distribution',    'ratio / df'],
  ['chi_squared',  'student_t',         'ratio to Normal'],
  ['beta',         'beta_binomial',     'prior on p'],
  ['beta',         'uniform_cont',      'α=β=1'],
  ['beta',         'beta_prime',        'X/(1−X)'],
  ['beta',         'dirichlet',         'K-dim generalise'],
  ['normal',       'student_t',         'unknown σ'],
  ['normal',       'cauchy',            'ν=1'],
  ['normal',       'log_normal',        'exp(X)'],
  ['normal',       'skew_normal',       'add shape α'],
  ['normal',       'half_normal',       '|X|'],
  ['normal',       'laplace',           'double exp tails'],
  ['normal',       'multivariate_normal','vector form'],
  ['student_t',    'cauchy',            'ν→1'],
  ['weibull',      'exponential',       'k=1'],
  ['weibull',      'rayleigh',          'k=2'],
  ['weibull',      'log_logistic',      'unimodal hazard'],
  ['weibull',      'gumbel',            'log-transform'],
  ['gumbel',       'gev',               'ξ=0 special case'],
  ['pareto',       'log_normal',        'lighter tail'],
  ['multinomial',  'dirichlet',         'conjugate prior'],
  ['multivariate_normal','dirichlet',   'simplex form'],
  ['inverse_gamma','half_normal',       'scale prior alt.'],
  ['beta_prime',   'f_distribution',    'scaled ratio'],
];

const FC = {
  discrete_bounded:    '#4fffb0',
  discrete_count:      '#60a5fa',
  continuous_bounded:  '#f472b6',
  continuous_positive: '#fb923c',
  continuous_real:     '#a78bfa',
  survival:            '#34d399',
  extreme_value:       '#fbbf24',
  multivariate:        '#f87171',
};

const FAMILY_LABELS = {
  discrete_bounded:    'Discrete · Bounded',
  discrete_count:      'Discrete · Counts',
  continuous_bounded:  'Continuous · Bounded',
  continuous_positive: 'Continuous · Positive',
  continuous_real:     'Continuous · ℝ',
  survival:            'Survival',
  extreme_value:       'Extreme Value',
  multivariate:        'Multivariate',
};

const NODE_R = 24;

export default function RelationshipMap({ onOpenDist }) {
  const [selected, setSelected] = useState(null);  // works for both hover and tap

  const nodeMap = Object.fromEntries(NODES.map(n => [n.id, n]));

  const getConnected = useCallback((id) => {
    if (!id) return new Set();
    const s = new Set([id]);
    EDGES.forEach(([a, b]) => {
      if (a === id) s.add(b);
      if (b === id) s.add(a);
    });
    return s;
  }, []);

  const connected = getConnected(selected);

  const handleNodeClick = (id) => {
    if (selected === id) {
      // Second tap on same node → open the card
      onOpenDist(id);
    } else {
      setSelected(id);
    }
  };

  const handleBackgroundClick = () => setSelected(null);

  const selectedNode = selected ? NODES.find(n => n.id === selected) : null;

  return (
    <div className="rel-map">
      <div className="rel-map-header">
        <h2 className="rel-map-title">Distribution Relationship Map</h2>
        <p className="rel-map-sub">
          <strong>Desktop:</strong> hover a node to highlight connections, click to open its card.&nbsp;
          <strong>Tablet/mobile:</strong> tap once to select and see connections, tap again to open the card. Tap the background to deselect.
        </p>
        <div className="rel-legend">
          {Object.entries(FC).map(([id, color]) => (
            <div key={id} className="legend-item">
              <span className="legend-dot" style={{ background: color }} />
              <span className="legend-label">{FAMILY_LABELS[id]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected node info panel */}
      {selectedNode && (
        <div className="rel-selected-panel" style={{ '--fc': FC[selectedNode.family] }}>
          <div className="rel-selected-inner">
            <div className="rel-selected-name">{selectedNode.label.replace('\n', ' ')}</div>
            <div className="rel-selected-family">{FAMILY_LABELS[selectedNode.family]}</div>
            <div className="rel-selected-connections">
              {EDGES.filter(([a, b]) => a === selectedNode.id || b === selectedNode.id).map(([a, b, label], i) => {
                const otherId = a === selectedNode.id ? b : a;
                const direction = a === selectedNode.id ? '→' : '←';
                const other = NODES.find(n => n.id === otherId);
                return (
                  <div key={i} className="rel-conn-item">
                    <span className="rel-conn-arrow">{direction}</span>
                    <button className="rel-conn-name" onClick={() => setSelected(otherId)}>
                      {other?.label.replace('\n', ' ')}
                    </button>
                    <span className="rel-conn-label">{label}</span>
                  </div>
                );
              })}
            </div>
            <button className="rel-open-btn" onClick={() => onOpenDist(selectedNode.id)}>
              Open {selectedNode.label.replace('\n', ' ')} card →
            </button>
          </div>
          <button className="rel-close-btn" onClick={() => setSelected(null)}>✕</button>
        </div>
      )}

      <div className="rel-svg-wrap" onClick={handleBackgroundClick}>
        <svg
          viewBox="0 0 1010 660"
          className="rel-svg"
          xmlns="http://www.w3.org/2000/svg"
          style={{ userSelect: 'none' }}
        >
          <defs>
            {/* Arrow markers for each family color */}
            {Object.entries(FC).map(([fid, color]) => (
              <marker key={fid} id={`arr-${fid}`} markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
                <path d="M0,0.5 L0,6.5 L7,3.5 z" fill={color} opacity="0.7" />
              </marker>
            ))}
            <marker id="arr-dim" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
              <path d="M0,0.5 L0,4.5 L5,2.5 z" fill="#1e2433" />
            </marker>
            <marker id="arr-hi" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
              <path d="M0,0.5 L0,6.5 L7,3.5 z" fill="#ffffff" opacity="0.9" />
            </marker>
          </defs>

          {/* ── EDGES ── */}
          {EDGES.map(([a, b, label], i) => {
            const na = nodeMap[a], nb = nodeMap[b];
            if (!na || !nb) return null;
            const isHi = selected && connected.has(a) && connected.has(b);
            const isDim = selected && !isHi;
            const naFam = na.family;

            const dx = nb.x - na.x, dy = nb.y - na.y;
            const dist = Math.sqrt(dx*dx + dy*dy) || 1;
            const sx = na.x + dx/dist * (NODE_R + 2);
            const sy = na.y + dy/dist * (NODE_R + 2);
            const ex = nb.x - dx/dist * (NODE_R + 8);
            const ey = nb.y - dy/dist * (NODE_R + 8);
            const mx = (sx + ex) / 2;
            const my = (sy + ey) / 2;

            return (
              <g key={i}>
                <line
                  x1={sx} y1={sy} x2={ex} y2={ey}
                  stroke={isHi ? '#ffffff' : isDim ? '#0e1118' : FC[naFam]}
                  strokeWidth={isHi ? 2 : 0.7}
                  strokeDasharray={isHi ? 'none' : '3,5'}
                  opacity={isHi ? 0.95 : isDim ? 0.06 : 0.4}
                  markerEnd={isHi ? 'url(#arr-hi)' : isDim ? 'url(#arr-dim)' : `url(#arr-${naFam})`}
                />
                {isHi && label && (
                  <g>
                    {/* Label background pill */}
                    <rect
                      x={mx - label.length * 3.2}
                      y={my - 9}
                      width={label.length * 6.4}
                      height={14}
                      rx={3}
                      fill="#0e1118"
                      opacity={0.88}
                    />
                    <text
                      x={mx} y={my + 1.5}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="600"
                      fontFamily="'JetBrains Mono', monospace"
                      style={{ pointerEvents: 'none' }}
                    >
                      {label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* ── NODES ── */}
          {NODES.map(node => {
            const color = FC[node.family] || '#4fffb0';
            const isSelected = selected === node.id;
            const isConn = selected && connected.has(node.id) && !isSelected;
            const isDim = selected && !connected.has(node.id);

            const lines = node.label.split('\n');

            return (
              <g
                key={node.id}
                transform={`translate(${node.x},${node.y})`}
                style={{ cursor: 'pointer' }}
                onClick={e => { e.stopPropagation(); handleNodeClick(node.id); }}
                onMouseEnter={() => !selected && setSelected(node.id)}
                onMouseLeave={() => !selected && setSelected(null)}
              >
                {/* Glow ring for selected */}
                {isSelected && (
                  <circle r={NODE_R + 7} fill="none" stroke={color} strokeWidth={2} opacity={0.4} />
                )}

                {/* Node background */}
                <circle
                  r={NODE_R}
                  fill={isSelected ? color : isConn ? `${color}22` : isDim ? '#080b10' : `${color}14`}
                  stroke={isSelected ? color : isConn ? color : isDim ? '#111520' : color}
                  strokeWidth={isSelected ? 2 : isDim ? 0.4 : 1}
                  opacity={isDim ? 0.2 : 1}
                />

                {/* Label lines */}
                {lines.map((line, li) => (
                  <text
                    key={li}
                    textAnchor="middle"
                    y={li * 11 - (lines.length - 1) * 5.5}
                    fill={isSelected ? '#000' : isDim ? '#1e2433' : isConn ? color : '#d8e0f0'}
                    fontSize={line.length > 7 ? '7.5' : '8.5'}
                    fontWeight={isSelected ? '700' : '400'}
                    fontFamily="'JetBrains Mono', monospace"
                    style={{ pointerEvents: 'none' }}
                  >
                    {line}
                  </text>
                ))}
              </g>
            );
          })}
        </svg>
      </div>

      {!selected && (
        <div className="rel-hint">
          Tap or hover a distribution node to see its connections
        </div>
      )}
    </div>
  );
}
