import React, { useState, useEffect } from "react";
import ProgressTracker from "./components/ProgressTracker.jsx";
import Level1 from "./components/Level1.jsx";
import Level2 from "./components/Level2.jsx";
import Level3 from "./components/Level3.jsx";

// Import - dessa fungerar nu!
import bremer1 from "./sources/bremer1.json";
import ida1 from "./sources/ida1.json";
import bremer2 from "./sources/bremer2.json";
import whitePlundring from "./sources/white-plundring.json";  // ← NYTT
import dagermanStraff from "./sources/dagerman-straff.json";

function App() {
  const sources = [bremer1, ida1, bremer2, whitePlundring, dagermanStraff].filter(s => s !== undefined);
  
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

  // VY 1: MENYN
  if (!selectedSource) {
    return (
      <div className="min-h-screen bg-amber-50 flex flex-col items-center p-12">
        <h1 className="text-4xl font-bold text-amber-900 mb-12">Källanalys-träning</h1>
        <div className="grid gap-6 w-full max-w-2xl">
          {sources.map((source) => (
            <button
              key={source.id}
              onClick={() => {
                setSelectedSource(source);
                setCurrentLevel(1); // Starta alltid på nivå 1 för en ny källa
              }}
              className="p-8 bg-white border-2 border-amber-200 rounded-2xl hover:border-amber-500 hover:shadow-xl transition-all text-left group"
            >
              <h2 className="text-2xl font-bold text-amber-900 group-hover:text-amber-600">{source.title}</h2>
              <p className="text-amber-700 mt-2 italic">Klicka för att påbörja analysen</p>
            </button>
          ))}
        </div>
        <button onClick={resetProgress} className="mt-12 text-sm text-amber-600 hover:underline">
          Nollställ alla framsteg
        </button>
      </div>
    );
  }

  // VY 2: ÖVNINGEN
  return (
    <div className="min-h-screen bg-white">
      {/* Mini-header inuti övningen */}
      <div className="bg-amber-900 text-white p-4 flex justify-between items-center shadow-md">
        <span className="font-medium opacity-80">Aktuell källa: {selectedSource.title}</span>
        <button 
          onClick={() => setSelectedSource(null)} 
          className="bg-amber-800 hover:bg-amber-700 px-4 py-1 rounded-lg text-sm transition-colors"
        >
          Avbryt / Till menyn
        </button>
      </div>

      <ProgressTracker progress={progress} currentLevel={currentLevel} />

      <main className="max-w-5xl mx-auto p-8">
        <div className="bg-white rounded-2xl shadow-2xl border border-amber-100 p-8">
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