import { useMemo } from 'react';

function MiniSparkline({ dist, color }) {
  const svgContent = useMemo(() => {
    try {
      const defaults = {};
      (dist.params || []).forEach(p => { defaults[p.name] = p.default; });
      const pts = dist.pdfPoints?.(defaults) || [];
      if (!pts.length) return '';
      const maxY = Math.max(...pts.map(p => p.y));
      if (!maxY || !isFinite(maxY)) return '';
      const W = 80, H = 30;
      const xs = pts.map(p => p.x);
      const minX = Math.min(...xs), maxX = Math.max(...xs);
      const range = maxX - minX || 1;
      if (dist.type === 'discrete') {
        const barWidth = Math.max(2, W / Math.max(pts.length, 1) - 1);
        return pts.slice(0, 25).map(p => {
          const x = (p.x - minX) / range * (W - 4) + 2;
          const h = Math.max(1, (p.y / maxY) * (H - 4));
          return `<rect x="${(x - barWidth/2).toFixed(1)}" y="${(H - h).toFixed(1)}" width="${barWidth.toFixed(1)}" height="${h.toFixed(1)}" fill="${color}" opacity="0.8"/>`;
        }).join('');
      } else {
        const pathPts = pts.map(p => {
          const px = (p.x - minX) / range * W;
          const py = H - (p.y / maxY) * (H - 4) - 2;
          return `${parseFloat(px.toFixed(1))},${parseFloat(py.toFixed(1))}`;
        });
        const firstX = pathPts[0].split(',')[0];
        const lastX = pathPts[pathPts.length - 1].split(',')[0];
        const area = `M${pathPts[0]} L${pathPts.join(' L')} L${lastX},${H} L${firstX},${H} Z`;
        const line = `M${pathPts.join(' L')}`;
        return `<path d="${area}" fill="${color}" opacity="0.12"/><path d="${line}" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.9"/>`;
      }
    } catch { return ''; }
  }, [dist.id]);

  if (!svgContent) return <div style={{width:80,height:30}}/>;
  return (
    <svg width="80" height="30" viewBox="0 0 80 30"
      className="mini-sparkline"
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}

export default function CatalogView({ distributions, allDistributions, families, selectedFamily, searchQuery, onFamilyChange, onSearchChange, onOpenDist }) {
  const grouped = families.map(f => ({
    family: f,
    dists: distributions.filter(d => d.family === f.id),
  })).filter(g => g.dists.length > 0);

  return (
    <div className="catalog">
      <div className="catalog-controls">
        <div className="catalog-controls-row">
          <div className="search-wrap">
            <span className="search-icon">⌕</span>
            <input className="search-input" placeholder="Search name, use case, or keyword…"
              value={searchQuery} onChange={e => onSearchChange(e.target.value)} />
            {searchQuery && <button className="search-clear" onClick={() => onSearchChange('')}>✕</button>}
          </div>
          <div className="catalog-count">{distributions.length} / {allDistributions.length} shown</div>
        </div>
        <div className="family-filters">
          <button className={`family-filter-btn ${!selectedFamily ? 'active' : ''}`} onClick={() => onFamilyChange(null)}>All</button>
          {families.map(f => (
            <button key={f.id} className={`family-filter-btn ${selectedFamily === f.id ? 'active' : ''}`}
              onClick={() => onFamilyChange(selectedFamily === f.id ? null : f.id)} style={{'--fc': f.color}}>
              <span>{f.icon}</span> {f.label}
            </button>
          ))}
        </div>
      </div>

      {distributions.length === 0 ? (
        <div className="no-results"><div style={{fontSize:32,marginBottom:12}}>∅</div>No matches for "{searchQuery}"</div>
      ) : (
        <div className="catalog-groups">
          {grouped.map(({ family, dists }) => (
            <div key={family.id} className="catalog-group">
              <div className="group-header" style={{'--fc': family.color}}>
                <span className="group-icon">{family.icon}</span>
                <span className="group-label">{family.label}</span>
                <span className="group-count">{dists.length}</span>
              </div>
              <div className="catalog-grid">
                {dists.map(d => (
                  <button key={d.id} className="catalog-card-v2" onClick={() => onOpenDist(d.id)} style={{'--fc': family.color}}>
                    <div className="ccv2-top">
                      <div className="ccv2-text">
                        <div className="ccv2-name">{d.name}</div>
                        <div className="ccv2-tagline">{d.tagline}</div>
                      </div>
                      <MiniSparkline dist={d} color={family.color} />
                    </div>
                    <div className="ccv2-bottom">
                      <span className="ccv2-type">{d.type}</span>
                      <span className="ccv2-support">{d.support}</span>
                      <span className="ccv2-arrow">→</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
