import { useState, useRef } from 'react';

// Node positions for the relationship graph (x, y as % of viewBox)
const NODES = [
  // Discrete
  { id: 'bernoulli',         x: 100,  y: 80,  label: 'Bernoulli',       family: 'discrete_bounded' },
  { id: 'binomial',          x: 220,  y: 80,  label: 'Binomial',        family: 'discrete_bounded' },
  { id: 'hypergeometric',    x: 340,  y: 80,  label: 'Hypergeometric',  family: 'discrete_bounded' },
  { id: 'beta_binomial',     x: 220,  y: 180, label: 'Beta-Binomial',   family: 'discrete_bounded' },
  { id: 'poisson_binomial',  x: 340,  y: 180, label: 'Poisson Binomial',family: 'discrete_bounded' },
  { id: 'discrete_uniform',  x: 100,  y: 180, label: 'Discrete Uniform',family: 'discrete_bounded' },
  { id: 'poisson',           x: 100,  y: 300, label: 'Poisson',         family: 'discrete_count' },
  { id: 'negative_binomial', x: 240,  y: 300, label: 'Neg. Binomial',   family: 'discrete_count' },
  { id: 'geometric',         x: 380,  y: 300, label: 'Geometric',       family: 'discrete_count' },
  { id: 'zero_inflated_poisson',x:100,y: 400, label: 'ZIP',             family: 'discrete_count' },
  { id: 'multinomial',       x: 240,  y: 400, label: 'Multinomial',     family: 'multivariate' },
  // Continuous positive
  { id: 'exponential',       x: 580,  y: 80,  label: 'Exponential',     family: 'continuous_positive' },
  { id: 'gamma',             x: 700,  y: 80,  label: 'Gamma',           family: 'continuous_positive' },
  { id: 'erlang',            x: 820,  y: 80,  label: 'Erlang',          family: 'continuous_positive' },
  { id: 'chi_squared',       x: 700,  y: 180, label: 'Chi-Squared',     family: 'continuous_positive' },
  { id: 'inverse_gamma',     x: 820,  y: 180, label: 'Inv. Gamma',      family: 'continuous_positive' },
  { id: 'log_normal',        x: 580,  y: 300, label: 'Log-Normal',      family: 'continuous_positive' },
  { id: 'rayleigh',          x: 700,  y: 300, label: 'Rayleigh',        family: 'continuous_positive' },
  { id: 'inverse_gaussian',  x: 820,  y: 300, label: 'Inv. Gaussian',   family: 'continuous_positive' },
  { id: 'beta_prime',        x: 580,  y: 180, label: 'Beta Prime',      family: 'continuous_positive' },
  // Bounded
  { id: 'beta',              x: 460,  y: 300, label: 'Beta',            family: 'continuous_bounded' },
  { id: 'uniform_cont',      x: 460,  y: 180, label: 'Uniform',         family: 'continuous_bounded' },
  { id: 'triangular',        x: 460,  y: 400, label: 'Triangular',      family: 'continuous_bounded' },
  // Real line
  { id: 'normal',            x: 580,  y: 480, label: 'Normal',          family: 'continuous_real' },
  { id: 'student_t',         x: 700,  y: 480, label: "Student's t",     family: 'continuous_real' },
  { id: 'cauchy',            x: 820,  y: 480, label: 'Cauchy',          family: 'continuous_real' },
  { id: 'laplace',           x: 460,  y: 480, label: 'Laplace',         family: 'continuous_real' },
  { id: 'logistic',          x: 580,  y: 560, label: 'Logistic',        family: 'continuous_real' },
  { id: 'skew_normal',       x: 700,  y: 560, label: 'Skew-Normal',     family: 'continuous_real' },
  { id: 'f_distribution',    x: 820,  y: 560, label: 'F-Dist',          family: 'continuous_positive' },
  // Survival
  { id: 'weibull',           x: 200,  y: 500, label: 'Weibull',         family: 'survival' },
  { id: 'pareto',            x: 340,  y: 500, label: 'Pareto',          family: 'survival' },
  { id: 'log_logistic',      x: 200,  y: 590, label: 'Log-Logistic',    family: 'survival' },
  { id: 'half_normal',       x: 340,  y: 590, label: 'Half-Normal',     family: 'survival' },
  // Extreme value
  { id: 'gumbel',            x: 100,  y: 500, label: 'Gumbel',          family: 'extreme_value' },
  { id: 'gev',               x: 100,  y: 590, label: 'GEV',             family: 'extreme_value' },
  // Multivariate
  { id: 'multivariate_normal',x: 460, y: 560, label: 'MVN',             family: 'multivariate' },
  { id: 'dirichlet',         x: 460,  y: 650, label: 'Dirichlet',       family: 'multivariate' },
];

// Edges: [from, to, label]
const EDGES = [
  ['bernoulli',    'binomial',           'n trials'],
  ['bernoulli',    'geometric',          'trials to 1st success'],
  ['bernoulli',    'poisson_binomial',   'vary p'],
  ['binomial',     'beta_binomial',      'random p'],
  ['binomial',     'hypergeometric',     'no replacement'],
  ['binomial',     'poisson',            'n→∞, p→0'],
  ['binomial',     'multinomial',        'k categories'],
  ['binomial',     'normal',             'n→∞ CLT'],
  ['poisson',      'negative_binomial',  'add dispersion'],
  ['poisson',      'zero_inflated_poisson','add struct. zeros'],
  ['poisson',      'gamma',              'conjugate prior'],
  ['geometric',    'negative_binomial',  'k successes'],
  ['geometric',    'exponential',        'continuous limit'],
  ['exponential',  'gamma',              'sum of k'],
  ['exponential',  'weibull',            'vary hazard'],
  ['gamma',        'erlang',             'integer k'],
  ['gamma',        'chi_squared',        'k/2, scale=2'],
  ['gamma',        'inverse_gamma',      '1/X'],
  ['gamma',        'log_normal',         'many products'],
  ['gamma',        'normal',             'k→∞ CLT'],
  ['chi_squared',  'f_distribution',     'ratio/df'],
  ['chi_squared',  'student_t',          'ratio to normal'],
  ['beta',         'beta_binomial',      'prior on p'],
  ['beta',         'uniform_cont',       'α=β=1'],
  ['beta',         'beta_prime',         'X/(1-X)'],
  ['beta',         'dirichlet',          'K categories'],
  ['normal',       'student_t',          'unknown σ'],
  ['normal',       'cauchy',             'ν=1'],
  ['normal',       'log_normal',         'exp(X)'],
  ['normal',       'skew_normal',        'add skew α'],
  ['normal',       'half_normal',        '|X|'],
  ['normal',       'laplace',            'double exp.'],
  ['normal',       'multivariate_normal','vector form'],
  ['student_t',    'cauchy',             'ν=1'],
  ['weibull',      'exponential',        'k=1'],
  ['weibull',      'rayleigh',           'k=2'],
  ['weibull',      'log_logistic',       'vary hazard shape'],
  ['weibull',      'gumbel',             'log transform'],
  ['gumbel',       'gev',                'special case'],
  ['pareto',       'log_normal',         'bounded tail'],
  ['multivariate_normal', 'dirichlet',   'simplex'],
];

const FAMILY_COLORS = {
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

export default function RelationshipMap({ onOpenDist }) {
  const [hovered, setHovered] = useState(null);
  const [tooltip, setTooltip] = useState(null);
  const svgRef = useRef(null);

  const nodeMap = Object.fromEntries(NODES.map(n => [n.id, n]));

  const getHighlightedIds = () => {
    if (!hovered) return new Set();
    const connected = new Set([hovered]);
    EDGES.forEach(([a, b]) => {
      if (a === hovered) connected.add(b);
      if (b === hovered) connected.add(a);
    });
    return connected;
  };

  const highlighted = getHighlightedIds();

  return (
    <div className="rel-map">
      <div className="rel-map-header">
        <h2 className="rel-map-title">Distribution Relationship Map</h2>
        <p className="rel-map-sub">
          Hover a node to see connections. Click to open the distribution card.
          Edges show how distributions relate — special cases, limits, transformations.
        </p>
        <div className="rel-legend">
          {Object.entries(FAMILY_COLORS).map(([id, color]) => (
            <div key={id} className="legend-item">
              <span className="legend-dot" style={{ background: color }} />
              <span className="legend-label">{FAMILY_LABELS[id]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rel-svg-wrap">
        <svg
          ref={svgRef}
          viewBox="0 40 940 660"
          className="rel-svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill="#252d42" />
            </marker>
            <marker id="arrow-hi" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill="#4fffb0" />
            </marker>
          </defs>

          {/* EDGES */}
          {EDGES.map(([a, b, label], i) => {
            const na = nodeMap[a], nb = nodeMap[b];
            if (!na || !nb) return null;
            const isHi = hovered && (highlighted.has(a) && highlighted.has(b));
            const isGray = hovered && !isHi;
            const mx = (na.x + nb.x) / 2;
            const my = (na.y + nb.y) / 2;

            // Shorten line to not overlap node circles
            const dx = nb.x - na.x, dy = nb.y - na.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const r = 26;
            const sx = na.x + (dx / dist) * r;
            const sy = na.y + (dy / dist) * r;
            const ex = nb.x - (dx / dist) * r;
            const ey = nb.y - (dy / dist) * r;

            return (
              <g key={i}>
                <line
                  x1={sx} y1={sy} x2={ex} y2={ey}
                  stroke={isHi ? '#4fffb0' : '#1a2035'}
                  strokeWidth={isHi ? 1.5 : 0.8}
                  strokeDasharray={isHi ? 'none' : '3,4'}
                  opacity={isGray ? 0.12 : isHi ? 0.9 : 0.5}
                  markerEnd={isHi ? 'url(#arrow-hi)' : 'url(#arrow)'}
                />
                {isHi && label && (
                  <text x={mx} y={my - 4} textAnchor="middle"
                    fill="#4fffb0" fontSize="8" opacity={0.9}
                    style={{ pointerEvents: 'none', fontFamily: 'JetBrains Mono, monospace' }}>
                    {label}
                  </text>
                )}
              </g>
            );
          })}

          {/* NODES */}
          {NODES.map(node => {
            const color = FAMILY_COLORS[node.family] || '#4fffb0';
            const isHi = !hovered || highlighted.has(node.id);
            const isActive = hovered === node.id;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x},${node.y})`}
                style={{ cursor: 'pointer' }}
                onClick={() => onOpenDist(node.id)}
                onMouseEnter={() => setHovered(node.id)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Glow for active */}
                {isActive && (
                  <circle r={30} fill={color} opacity={0.12} />
                )}
                {/* Node circle */}
                <circle
                  r={22}
                  fill={isHi ? `${color}18` : '#0c0f18'}
                  stroke={isHi ? color : '#1a2035'}
                  strokeWidth={isActive ? 2 : 1}
                  opacity={isHi ? 1 : 0.25}
                />
                {/* Label */}
                <text
                  textAnchor="middle" dominantBaseline="middle"
                  fill={isHi ? (isActive ? color : '#d8e0f0') : '#3a4460'}
                  fontSize={node.label.length > 10 ? '7' : '8'}
                  fontWeight={isActive ? '700' : '400'}
                  style={{ fontFamily: 'JetBrains Mono, monospace', pointerEvents: 'none' }}
                >
                  {node.label.split(' ').map((word, wi) => (
                    <tspan key={wi} x={0} dy={wi === 0 ? (node.label.includes(' ') ? '-5' : '0') : '10'}>
                      {word}
                    </tspan>
                  ))}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
