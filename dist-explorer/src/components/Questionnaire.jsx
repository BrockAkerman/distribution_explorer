import { useState, useMemo } from 'react';

// Measure questionnaire depth for progress bar
function getMaxDepth(tree, nodeId = 'q_type', visited = new Set()) {
  if (visited.has(nodeId)) return 0;
  visited.add(nodeId);
  const node = tree[nodeId];
  if (!node || node.recommended) return 0;
  const childDepths = (node.options || []).map(o => 1 + getMaxDepth(tree, o.next, new Set(visited)));
  return Math.max(0, ...childDepths);
}

export default function Questionnaire({ tree, distributions, onOpenDist }) {
  const [path, setPath]         = useState(['q_type']);
  const [hoveredOpt, setHover]  = useState(null);

  const currentId   = path[path.length - 1];
  const currentNode = tree[currentId];
  const isLeaf      = currentNode?.recommended != null;

  const maxDepth = useMemo(() => getMaxDepth(tree), []);
  const progress = Math.min(100, ((path.length - 1) / Math.max(maxDepth, 1)) * 100);

  const choose  = nextId => { setPath([...path, nextId]); setHover(null); };
  const goBack  = ()    => { setPath(path.slice(0, -1)); setHover(null); };
  const restart = ()    => { setPath(['q_type']); setHover(null); };
  const goTo    = idx   => { setPath(path.slice(0, idx + 1)); setHover(null); };

  if (!currentNode) return (
    <div className="q-wrap">
      <p style={{ color: '#f87171' }}>Navigation error — node not found: {currentId}</p>
      <button className="q-back" onClick={restart}>↺ Start over</button>
    </div>
  );

  return (
    <div className="q-wrap">

      {/* Progress bar */}
      <div className="q-progress-bar">
        <div className="q-progress-fill" style={{ width: `${isLeaf ? 100 : progress}%` }} />
      </div>

      {/* Breadcrumb */}
      <div className="q-crumb">
        {path.map((id, idx) => {
          const n = tree[id];
          const isLast = idx === path.length - 1;
          const label = idx === 0
            ? 'Data Type'
            : n?.recommended
              ? '✦ Result'
              : (n?.question || '').split(' ').slice(0, 4).join(' ') + '…';
          return (
            <span key={id} className="crumb-item">
              {idx > 0 && <span className="crumb-sep">›</span>}
              <span
                className={`crumb-label ${isLast ? 'current' : 'link'}`}
                onClick={() => !isLast && goTo(idx)}
              >{label}</span>
            </span>
          );
        })}
      </div>

      {/* Question */}
      {!isLeaf && (
        <div className="q-question-wrap">
          <div className="q-step-label">
            Step {path.length} · {currentNode.options?.length} options
          </div>
          <h2 className="q-question">{currentNode.question}</h2>

          <div className="q-options">
            {currentNode.options.map((opt, i) => (
              <button
                key={i}
                className={`q-option ${hoveredOpt === i ? 'hovered' : ''}`}
                onClick={() => choose(opt.next)}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              >
                <span className="q-opt-icon">{opt.icon}</span>
                <span className="q-opt-label">{opt.label}</span>
                <span className="q-opt-arrow">›</span>
              </button>
            ))}
          </div>

          {path.length > 1 && (
            <button className="q-back" onClick={goBack}>← Back</button>
          )}
        </div>
      )}

      {/* Result */}
      {isLeaf && (
        <div className="q-result-wrap">
          <div className="q-result-badge">✦ Recommendation</div>
          <h2 className="q-result-title">
            {currentNode.recommended.length === 1 ? 'Best Match' : 'Suggested Distributions'}
          </h2>
          <p className="q-result-sub">
            Based on your answers, {currentNode.recommended.length === 1
              ? 'this distribution fits your scenario.'
              : 'these distributions are worth considering, roughly in order of fit.'}
          </p>

          <div className="q-result-cards">
            {currentNode.recommended.map((id, i) => {
              const d = distributions.find(d => d.id === id);
              if (!d) return null;
              return (
                <button
                  key={id}
                  className={`q-result-card ${i === 0 ? 'primary' : 'secondary'}`}
                  onClick={() => onOpenDist(id)}
                >
                  <div className="qrc-rank">
                    {i === 0 ? '★ Best match' : `Also consider (#${i + 1})`}
                  </div>
                  <div className="qrc-name">{d.name}</div>
                  <div className="qrc-tagline">{d.tagline}</div>
                  <div className="qrc-stats">
                    <span>Support: {d.support}</span>
                    <span>·</span>
                    <span style={{ textTransform: 'capitalize' }}>{d.type}</span>
                  </div>
                  <div className="qrc-cta">Open full card with interactive curve →</div>
                </button>
              );
            })}
          </div>

          <div className="q-result-actions">
            <button className="q-back" onClick={goBack}>← Refine answers</button>
            <button className="q-restart" onClick={restart}>↺ Start over</button>
          </div>
        </div>
      )}
    </div>
  );
}
