import React, { useState, useEffect } from 'react';
import { getWordSelectionStats, getLevelSuccessRates, getSourcePopularity } from '../analytics';

export default function Dashboard() {
  const [sourceStats, setSourceStats] = useState(null);
  const [levelStats, setLevelStats] = useState(null);
  const [popularSources, setPopularSources] = useState(null);
  const [loading, setLoading] = useState(true);

  // Inställningar
  const [selectedSource, setSelectedSource] = useState('Steg 1: Identifiera nyckelord');
  const [selectedStep, setSelectedStep] = useState('step1');

  const sourceOptions = [
    'Steg 1: Identifiera nyckelord',
    'Steg 2: Hitta språkliga ledtrådar',
    'Steg 3: En ny tradition',
  ];

  const stepOptions = [
    { value: 'step1', label: 'Steg 1' },
    { value: 'step2', label: 'Steg 2' },
    { value: 'step3', label: 'Steg 3' },
  ];

  useEffect(() => {
    loadAllStats();
  }, [selectedSource, selectedStep]);

  const loadAllStats = async () => {
    setLoading(true);

    const [words, levels, popular] = await Promise.all([
      getWordSelectionStats(selectedSource, selectedStep),
      getLevelSuccessRates(),
      getSourcePopularity(),
    ]);

    setSourceStats(words);
    setLevelStats(levels);
    setPopularSources(popular);
    setLoading(false);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
        <p style={{ fontSize: '1.2rem', color: '#666' }}>Laddar analytics...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '2rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>📊 Analytics Dashboard</h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>Översikt av elevernas användning</p>

        {/* === POPULÄRASTE KÄLLORNA === */}
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>📚 Populäraste källorna</h2>
          {popularSources && popularSources.length > 0 ? (
            <div>
              {popularSources.map((source, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 'bold', color: '#059669', fontSize: '1.5rem', width: '2rem' }}>
                    {i + 1}.
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '500' }}>{source.title}</span>
                      <span style={{ color: '#666' }}>{source.count} val</span>
                    </div>
                    <div style={{ background: '#e5e7eb', borderRadius: '9999px', height: '8px' }}>
                      <div style={{
                        background: '#059669',
                        borderRadius: '9999px',
                        height: '8px',
                        width: `${(source.count / popularSources[0].count) * 100}%`,
                      }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#999' }}>Ingen data ännu.</p>
          )}
        </div>

        {/* === SUCCESS RATES PER NIVÅ === */}
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>📈 Resultat per nivå</h2>
          {levelStats && Object.keys(levelStats).length > 0 ? (
            <div>
              {Object.entries(levelStats).map(([level, stats]) => {
                const total = stats.completed + stats.failed;
                const rate = total > 0 ? Math.round((stats.completed / total) * 100) : 0;
                return (
                  <div key={level} style={{ marginBottom: '1.25rem', paddingBottom: '1.25rem', borderBottom: '1px solid #eee' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: '600' }}>{level}</span>
                      <span style={{ fontWeight: 'bold', color: rate >= 70 ? '#059669' : rate >= 40 ? '#d97706' : '#dc2626' }}>
                        {rate}% klarade
                      </span>
                    </div>
                    <div style={{ background: '#e5e7eb', borderRadius: '9999px', height: '10px', marginBottom: '0.5rem' }}>
                      <div style={{
                        background: rate >= 70 ? '#059669' : rate >= 40 ? '#d97706' : '#dc2626',
                        borderRadius: '9999px',
                        height: '10px',
                        width: `${rate}%`,
                      }} />
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem', color: '#666' }}>
                      <span>✅ {stats.completed} klarade</span>
                      <span>❌ {stats.failed} misslyckades</span>
                      {stats.avgDuration && <span>⏱ ~{stats.avgDuration}s snitt</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: '#999' }}>Ingen data ännu.</p>
          )}
        </div>

        {/* === ORDVAL I LEVEL 1 === */}
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>🔤 Ordval i Level 1</h2>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '4px' }}>Källa:</label>
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                style={selectStyle}
              >
                {sourceOptions.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '4px' }}>Steg:</label>
              <select
                value={selectedStep}
                onChange={(e) => setSelectedStep(e.target.value)}
                style={selectStyle}
              >
                {stepOptions.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {sourceStats ? (
            <div>
              <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem' }}>
                <div style={statBoxStyle}>
                  <p style={{ color: '#666', fontSize: '0.875rem' }}>Totalt antal försök</p>
                  <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{sourceStats.totalAttempts}</p>
                </div>
                <div style={statBoxStyle}>
                  <p style={{ color: '#666', fontSize: '0.875rem' }}>Success rate</p>
                  <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#059669' }}>{sourceStats.successRate}%</p>
                </div>
              </div>

              <h3 style={{ fontWeight: '600', marginBottom: '0.75rem' }}>Vanligast valda ord:</h3>
              <div>
                {Object.entries(sourceStats.wordFrequency)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 15)
                  .map(([word, count]) => {
                    const isCorrect = sourceStats.correctWords.some(cw =>
                      word.toLowerCase().includes(cw.toLowerCase())
                    );
                    return (
                      <div key={word} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '9999px',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          background: isCorrect ? '#d1fae5' : '#fee2e2',
                          color: isCorrect ? '#065f46' : '#991b1b',
                          minWidth: '100px',
                          textAlign: 'center',
                        }}>
                          {word}
                        </span>
                        <div style={{ flex: 1, background: '#e5e7eb', borderRadius: '9999px', height: '8px' }}>
                          <div style={{
                            background: isCorrect ? '#059669' : '#dc2626',
                            borderRadius: '9999px',
                            height: '8px',
                            width: `${(count / sourceStats.totalAttempts) * 100}%`,
                          }} />
                        </div>
                        <span style={{ fontSize: '0.875rem', color: '#666', minWidth: '70px' }}>
                          {count} ({Math.round((count / sourceStats.totalAttempts) * 100)}%)
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          ) : (
            <p style={{ color: '#999' }}>Ingen orddata för denna källa/steg ännu. Testa appen för att generera data!</p>
          )}
        </div>

      </div>
    </div>
  );
}

// Styles
const cardStyle = {
  background: 'white',
  borderRadius: '12px',
  padding: '1.5rem',
  marginBottom: '1.5rem',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
};

const cardTitleStyle = {
  fontSize: '1.25rem',
  fontWeight: 'bold',
  marginBottom: '1rem',
};

const selectStyle = {
  padding: '8px 12px',
  border: '2px solid #d1d5db',
  borderRadius: '8px',
  fontSize: '0.95rem',
};

const statBoxStyle = {
  background: '#f9fafb',
  borderRadius: '8px',
  padding: '1rem',
  flex: 1,
  textAlign: 'center',
};