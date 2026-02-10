import React, { useState, useEffect } from "react";
import ProgressTracker from "./components/ProgressTracker.jsx";
import Level1 from "./components/Level1.jsx";
import Level2 from "./components/Level2.jsx";
import Level3 from "./components/Level3.jsx";
import { trackSourceSelected, trackLevelStarted } from './analytics';
import Dashboard from './components/Dashboard.jsx';

import bremer1 from "./sources/bremer1.json";
import ida1 from "./sources/ida1.json";
import bremer2 from "./sources/bremer2.json";
import munck_friarbrev_1896 from "./sources/munck_friarbrev_1896.json";  // ← NY RAD

function App() {
  const sources = [bremer1, ida1, bremer2, munck_friarbrev_1896].filter(s => s !== undefined);  // ← UPPDATERAD
  
  const [selectedSource, setSelectedSource] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(1);

  // Laddar framsteg från webbläsaren
  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem('kallanalys_progress');
    return saved ? JSON.parse(saved) : {
      level1_step1: 'unlocked',
      level1_step2: 'locked',
      level1_step3: 'locked',
      level2: 'locked',
      level3: 'locked'
    };
  });

  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    if (window.location.search.includes('admin')) {
      setShowDashboard(true);
    }
  }, []);

  // Sparar framsteg när de ändras
  useEffect(() => {
    localStorage.setItem('kallanalys_progress', JSON.stringify(progress));
  }, [progress]);

  // Logik för att låsa upp nästa steg
  const unlockNext = (completedStep) => {
    const steps = ['level1_step1', 'level1_step2', 'level1_step3', 'level2', 'level3'];
    const currentIndex = steps.indexOf(completedStep);
    
    if (currentIndex < steps.length - 1) {
      setProgress(prev => ({
        ...prev,
        [completedStep]: 'completed',
        [steps[currentIndex + 1]]: 'unlocked'
      }));
    } else {
      setProgress(prev => ({ ...prev, [completedStep]: 'completed' }));
    }
  };

  const resetProgress = () => {
    if(confirm("Vill du verkligen nollställa alla framsteg?")) {
      localStorage.removeItem('kallanalys_progress');
      window.location.reload();
    }
  };

  if (selectedSource === '__dashboard__') {
    return (
      <div>
        <button 
          onClick={() => setSelectedSource(null)}
          style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 50, padding: '8px 16px', background: '#1f2937', color: 'white', borderRadius: '8px', cursor: 'pointer' }}
        >
          ← Tillbaka
        </button>
        <Dashboard />
      </div>
    );
  }

  // VY 1: MENYN
  if (!selectedSource) {
    return (
      <div className="page-container">
        <div className="mb-6">
  <h1 className="page-title">Träna källanalys</h1>
  <img 
    src="/stenshuvud.jpg" 
    alt="Källkritik illustration" 
    style={{ 
      width: '100%',
      height: '200px',
      maxWidth: '900px',
      margin: '0 auto',
      display: 'block',
      objectFit: 'cover',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}
  />
</div>

  <div className="source-grid">

          {sources.map((source) => (
            <button
              key={source.id}
              onClick={() => {
  setSelectedSource(source);
  setCurrentLevel(1);
  trackSourceSelected(source.title);
  trackLevelStarted(1, 1);
}}
              className="p-8 bg-white border-2 border-emerald-200 rounded-2xl hover:border-emerald-500 hover:shadow-xl transition-all text-left group"
            >
              <h2 className="text-2xl font-bold text-emerald-900 group-hover:text-emerald-600">{source.title}</h2>
              <p className="text-emerald-700 mt-2 italic">Klicka för att påbörja analysen</p>
            </button>
          ))}
        </div>
        {showDashboard && (
  <button 
    onClick={() => setSelectedSource('__dashboard__')} 
    className="mt-8 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium"
  >
    📊 Visa Analytics
  </button>
)}
        <button onClick={resetProgress} className="mt-4 text-sm text-emerald-600 hover:underline">
          Nollställ alla framsteg
        </button>
      </div>
    );
  }

  // VY 2: ÖVNINGEN
  return (
    <div className="page-container">
  {/* Mini-header inuti övningen */}
  <div className="exercise-header">
    <span>Aktuell källa: {selectedSource.title}</span>
    <button 
      onClick={() => setSelectedSource(null)} 
      className="header-button"
    >
      Avbryt / Till menyn
    </button>
  </div>

  <ProgressTracker progress={progress} currentLevel={currentLevel} />

  <main className="exercise-content">
    <div className="exercise-box">
          {currentLevel === 1 && (
            <Level1 
              data={selectedSource.level1} 
              progress={progress}
              onComplete={(step) => {
                unlockNext(step);
                if (step === 'level1_step3') setCurrentLevel(2);
              }}
            />
          )}
          
          {currentLevel === 2 && (
            <Level2 
              data={selectedSource.level2}
              onComplete={() => {
                unlockNext('level2');
                setCurrentLevel(3);
              }}
            />
          )}
          
          {currentLevel === 3 && (
            <Level3 
              data={selectedSource.level3}
              onComplete={() => unlockNext('level3')}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;