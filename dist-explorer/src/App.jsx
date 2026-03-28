import { useState, useMemo } from 'react';
import { DISTRIBUTIONS, FAMILIES, QUESTIONNAIRE } from './data/distributions';
import CatalogView from './components/CatalogView';
import DistributionCard from './components/DistributionCard';
import Questionnaire from './components/Questionnaire';
import RelationshipMap from './components/RelationshipMap';
import CompareView from './components/CompareView';
import './App.css';

export default function App() {
  const [view, setView] = useState('home');
  const [selectedDist, setSelectedDist] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [prevView, setPrevView] = useState('catalog');

  const openDist = (id, from) => {
    const d = DISTRIBUTIONS.find(d => d.id === id);
    if (d) { setPrevView(from || view); setSelectedDist(d); setView('dist'); window.scrollTo(0, 0); }
  };

  const filteredDists = useMemo(() => {
    let list = DISTRIBUTIONS;
    if (selectedFamily) list = list.filter(d => d.family === selectedFamily);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.tagline.toLowerCase().includes(q) ||
        (d.story && d.story.toLowerCase().includes(q)) ||
        (d.useCases && d.useCases.some(u => u.toLowerCase().includes(q)))
      );
    }
    return list;
  }, [selectedFamily, searchQuery]);

  const NAV = [
    { id: 'questionnaire', icon: '?',  label: 'Find Mine' },
    { id: 'catalog',       icon: '⊞', label: 'Catalog'   },
    { id: 'compare',       icon: '⇄', label: 'Compare'   },
    { id: 'map',           icon: '◎', label: 'Map'       },
  ];

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <button className="logo" onClick={() => setView('home')}>
            <span className="logo-mark">𝒟</span>
            <div>
              <div className="logo-title">Distribution Explorer</div>
              <div className="logo-sub">38 Distributions · 8 Families</div>
            </div>
          </button>
          <nav className="nav">
            {NAV.map(n => (
              <button key={n.id} className={`nav-btn ${view === n.id ? 'active' : ''}`}
                onClick={() => setView(n.id)}>
                <span className="nav-icon">{n.icon}</span>
                <span className="nav-label">{n.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="main">
        {view === 'home'          && <HomeView onQ={() => setView('questionnaire')} onBrowse={() => setView('catalog')} onMap={() => setView('map')} onCompare={() => setView('compare')} onOpenDist={openDist} />}
        {view === 'questionnaire' && <Questionnaire tree={QUESTIONNAIRE} distributions={DISTRIBUTIONS} onOpenDist={id => openDist(id, 'questionnaire')} />}
        {view === 'catalog'       && <CatalogView distributions={filteredDists} allDistributions={DISTRIBUTIONS} families={FAMILIES} selectedFamily={selectedFamily} searchQuery={searchQuery} onFamilyChange={setSelectedFamily} onSearchChange={setSearchQuery} onOpenDist={openDist} />}
        {view === 'compare'       && <CompareView distributions={DISTRIBUTIONS} families={FAMILIES} onOpenDist={id => openDist(id, 'compare')} />}
        {view === 'map'           && <RelationshipMap onOpenDist={id => openDist(id, 'map')} />}
        {view === 'dist' && selectedDist && <DistributionCard dist={selectedDist} allDists={DISTRIBUTIONS} onBack={() => setView(prevView)} onOpenDist={openDist} families={FAMILIES} />}
      </main>
    </div>
  );
}

function HomeView({ onQ, onBrowse, onMap, onCompare, onOpenDist }) {
  const featured = ['normal', 'poisson', 'beta', 'weibull', 'negative_binomial', 'student_t'];
  const featuredDists = featured.map(id => DISTRIBUTIONS.find(d => d.id === id)).filter(Boolean);

  return (
    <div className="home">
      <div className="hero">
        <div className="hero-grid-bg">{Array.from({length:80}).map((_,i) => <div key={i} className="grid-cell"/>)}</div>
        <div className="hero-content">
          <div className="hero-badge">38 Distributions · 8 Families · Interactive</div>
          <h1 className="hero-title">Which distribution<br/><span className="hero-accent">fits your data?</span></h1>
          <p className="hero-desc">
            A complete interactive reference for data scientists. Live PDF/PMF curves, full stat cards with typeset formulae, applied use cases, side-by-side comparison, and a visual relationship map connecting all 38 distributions.
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={onQ}><span>?</span> Answer Questions → Get Recommendations</button>
            <button className="btn-secondary" onClick={onBrowse}><span>⊞</span> Browse Catalog</button>
            <button className="btn-secondary" onClick={onCompare}><span>⇄</span> Compare Two</button>
            <button className="btn-secondary" onClick={onMap}><span>◎</span> Relationship Map</button>
          </div>
        </div>
      </div>

      <div className="families-strip">
        {FAMILIES.map(f => (
          <div key={f.id} className="family-chip" style={{'--fc': f.color}}>
            <span className="family-icon">{f.icon}</span>
            <span className="family-label">{f.label}</span>
          </div>
        ))}
      </div>

      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Essential Distributions</h2>
          <p className="section-sub">The six you'll reach for most often in applied data science</p>
        </div>
        <div className="featured-grid">
          {featuredDists.map(d => {
            const fam = FAMILIES.find(f => f.id === d.family);
            return (
              <button key={d.id} className="dist-tile" onClick={() => onOpenDist(d.id)} style={{'--tc': fam?.color || '#4fffb0'}}>
                <div className="tile-family">{fam?.label}</div>
                <div className="tile-name">{d.name}</div>
                <div className="tile-tagline">{d.tagline}</div>
                <div className="tile-arrow">Open card →</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="section" style={{paddingTop: 0}}>
        <div className="features-grid">
          {[
            {icon:'∿', title:'Live Curves', desc:'Drag parameter sliders to reshape PDF/PMF in real time. Watch how α and β reshape the Beta, or ν fattens the t-distribution tails.'},
            {icon:'⊞', title:'Full Stat Cards', desc:'Mean, variance, skewness, kurtosis, MGF, CF, PGF — all typeset with KaTeX. Statistics update live as you move the sliders.'},
            {icon:'⇄', title:'Side-by-Side Compare', desc:'Select any two distributions, overlay their curves on one chart, and compare statistics, use cases and properties.'},
            {icon:'◎', title:'Relationship Map', desc:'Navigate the full distribution family tree. See which are special cases of others, limit theorems, and transformations.'},
          ].map(f => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="section" style={{paddingTop: 0}}>
        <div className="section-header">
          <h2 className="section-title">Browse by Family</h2>
        </div>
        <div className="family-browse-grid">
          {FAMILIES.map(f => {
            const dists = DISTRIBUTIONS.filter(d => d.family === f.id);
            return (
              <div key={f.id} className="family-browse-card" style={{'--fc': f.color}}>
                <div className="fbc-header">
                  <span className="fbc-icon">{f.icon}</span>
                  <div>
                    <div className="fbc-label">{f.label}</div>
                    <div className="fbc-count">{dists.length} distribution{dists.length !== 1 ? 's' : ''}</div>
                  </div>
                </div>
                <div className="fbc-names">
                  {dists.slice(0, 5).map(d => (
                    <button key={d.id} className="fbc-name-btn" onClick={() => onOpenDist(d.id)}>{d.name}</button>
                  ))}
                  {dists.length > 5 && <span className="fbc-more">+{dists.length - 5} more</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
