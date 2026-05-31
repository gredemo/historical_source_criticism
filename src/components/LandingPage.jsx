import React, { useState } from 'react';

// Teman och vilka source-id:n som hör till varje tema
const themes = [
  {
    name: 'Amerikabrev',
    icon: '✉️',
    sourceIds: ['ida_lindgren_kansas_1871', 'per_nilsson_brev', 'bremer_vs_calhoun_bilingual_1850', 'bremer_boklin_1862', 'munck_friarbrev_1896'],
  },
  {
    name: 'Andra världskriget',
    icon: '⚔️',
    sourceIds: ['dagerman_straff_1946', 'himmler_posen_1943', 'white_plundring_1945'],
  },
];

export default function LandingPage({ sources, onSelectSource, onShowDashboard, showDashboard, onResetProgress }) {
  const [openTheme, setOpenTheme] = useState(null);

  const toggleTheme = (theme) => {
    setOpenTheme(openTheme === theme ? null : theme);
  };

  // Hitta rätt source-objekt utifrån id
  const getSource = (id) => sources.find(s => s.id === id);

  return (
    <div style={{ minHeight: '100vh', background: '#fdfbf7', fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif" }}>
      
      {/* Hero */}
      <header style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        color: '#fdfbf7',
        padding: '3.5rem 2rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(234,179,8,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(234,179,8,0.05) 0%, transparent 50%)',
        }} />
        <div style={{ position: 'relative', maxWidth: '700px', margin: '0 auto' }}>
          <p style={{ fontSize: '0.9rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#eab308', marginBottom: '0.75rem' }}>
            Gustafs Historia
          </p>
          <h1 style={{ fontSize: '2.6rem', fontWeight: '700', lineHeight: 1.2, marginBottom: '1.25rem' }}>
            Träna källanalys
          </h1>
          <div style={{ width: '60px', height: '3px', background: '#eab308', margin: '0 auto 1.25rem' }} />
          <p style={{ fontSize: '1.1rem', lineHeight: 1.7, color: 'rgba(253,251,247,0.85)', maxWidth: '520px', margin: '0 auto' }}>
            Lär dig att läsa historiska dokument som en historiker — identifiera nyckelord, analysera språk och jämför källor.
          </p>
        </div>
      </header>

      <div style={{ maxWidth: '750px', margin: '0 auto', padding: '0 2rem' }}>

        {/* Om appen */}
        <section style={{ padding: '3rem 0 2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1a1a2e', marginBottom: '1rem' }}>
            Varför källkritik?
          </h2>
          <p style={{ fontSize: '1.02rem', lineHeight: 1.8, color: '#444', marginBottom: '1.1rem' }}>
            Att kunna analysera historiska källor är en av de viktigaste färdigheterna du tränar 
            i gymnasiets historiekurs. Det handlar inte bara om att läsa — utan om att förstå 
            <em> vem</em> som skriver, <em>varför</em> de skriver och vad orden <em>egentligen</em> berättar 
            om sin tid.
          </p>
          <p style={{ fontSize: '1.02rem', lineHeight: 1.8, color: '#444' }}>
            Den här appen guidar dig genom tre nivåer av källanalys, inspirerade av historikern 
            Sam Wineburgs forskning om historiskt tänkande. Du börjar med att hitta nyckelord, 
            går vidare till att bygga en strukturerad analys och avslutar med att jämföra 
            olika källor mot varandra.
          </p>

          {/* Tre steg */}
          <div style={{ display: 'flex', gap: '1rem', margin: '2rem 0 0', flexWrap: 'wrap' }}>
            {[
              { num: '1', title: 'Identifiera', text: 'Hitta nyckelord och språkliga ledtrådar i källan' },
              { num: '2', title: 'Analysera', text: 'Bygg en strukturerad analys med stöd av mallar' },
              { num: '3', title: 'Jämför', text: 'Ställ flera källor mot varandra och dra slutsatser' },
            ].map((step) => (
              <div key={step.num} style={{
                flex: '1 1 200px',
                background: 'white',
                border: '1px solid #e5e0d5',
                borderRadius: '8px',
                padding: '1.25rem',
                textAlign: 'center',
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: '#1a1a2e', color: '#eab308',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '700', fontSize: '1rem', margin: '0 auto 0.75rem',
                }}>
                  {step.num}
                </div>
                <h3 style={{ fontWeight: '700', color: '#1a1a2e', marginBottom: '0.4rem', fontSize: '1.05rem' }}>{step.title}</h3>
                <p style={{ fontSize: '0.88rem', color: '#666', lineHeight: 1.5 }}>{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Teman / Källor */}
        <section style={{ padding: '1rem 0 2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1a1a2e', marginBottom: '0.5rem' }}>
            Välj tema
          </h2>
          <p style={{ color: '#666', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            Källorna är ordnade efter historiska teman. Klicka på ett tema för att se tillgängliga källor.
          </p>

          {themes.map((theme) => {
            const themeSources = theme.sourceIds.map(getSource).filter(Boolean);
            const isOpen = openTheme === theme.name;

            return (
              <div key={theme.name} style={{ marginBottom: '0.75rem' }}>
                {/* Dropdown header */}
                <button
                  onClick={() => toggleTheme(theme.name)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem 1.5rem',
                    background: isOpen ? '#1a1a2e' : 'white',
                    color: isOpen ? '#fdfbf7' : '#1a1a2e',
                    border: '2px solid #1a1a2e',
                    borderRadius: isOpen ? '8px 8px 0 0' : '8px',
                    cursor: 'pointer',
                    fontSize: '1.05rem',
                    fontWeight: '600',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span>
                    {theme.icon} {theme.name}
                    <span style={{
                      marginLeft: '0.75rem',
                      fontSize: '0.85rem',
                      fontWeight: '400',
                      opacity: 0.7,
                    }}>
                      {themeSources.length} {themeSources.length === 1 ? 'källa' : 'källor'}
                    </span>
                  </span>
                  <span style={{
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 0.2s ease',
                    fontSize: '1.2rem',
                  }}>
                    ▾
                  </span>
                </button>

                {/* Dropdown content */}
                {isOpen && (
                  <div style={{
                    border: '2px solid #1a1a2e',
                    borderTop: 'none',
                    borderRadius: '0 0 8px 8px',
                    overflow: 'hidden',
                  }}>
                    {themeSources.map((source, i) => (
                      <button
                        key={source.id}
                        onClick={() => onSelectSource(source)}
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '1rem 1.5rem',
                          background: i % 2 === 0 ? '#fdfbf7' : 'white',
                          border: 'none',
                          borderTop: i > 0 ? '1px solid #e5e0d5' : 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontFamily: 'inherit',
                          fontSize: '1rem',
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f0ebe0'}
                        onMouseLeave={(e) => e.currentTarget.style.background = i % 2 === 0 ? '#fdfbf7' : 'white'}
                      >
                        <h4 style={{ fontWeight: '600', color: '#1a1a2e', marginBottom: '0.25rem' }}>{source.title}</h4>
                        <p style={{ fontSize: '0.88rem', color: '#888', margin: 0 }}>Klicka för att påbörja analysen →</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </section>

        {/* Knappar längst ner */}
        <div style={{ padding: '0 0 3rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {showDashboard && (
            <button
              onClick={onShowDashboard}
              style={{
                padding: '0.7rem 1.5rem',
                background: '#1a1a2e',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '0.95rem',
                fontWeight: '600',
              }}
            >
              📊 Visa Analytics
            </button>
          )}
          <button
            onClick={onResetProgress}
            style={{
              padding: '0.7rem 1.5rem',
              background: 'transparent',
              color: '#888',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '0.85rem',
              textDecoration: 'underline',
            }}
          >
            Nollställ alla framsteg
          </button>
        </div>

      </div>

      {/* Footer */}
      <footer style={{
        background: '#1a1a2e',
        color: 'rgba(253,251,247,0.6)',
        textAlign: 'center',
        padding: '1.5rem 2rem',
        fontSize: '0.85rem',
      }}>
        <p style={{ margin: 0 }}>
          En del av{' '}
          <a href="https://www.gustafshistoria.se" style={{ color: '#eab308', textDecoration: 'none' }}>
            Gustafs Historia
          </a>
          {' '}· Skapad av Gustaf Redemo
        </p>
      </footer>
    </div>
  );
}