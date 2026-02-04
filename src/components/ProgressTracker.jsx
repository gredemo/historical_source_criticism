import React from 'react';
import { Check, Lock, Circle } from 'lucide-react';

export default function ProgressTracker({ progress, currentLevel }) {
  const steps = [
    { id: 'level1_step1', label: 'Nivå 1: Steg 1', level: 1 },
    { id: 'level1_step2', label: 'Nivå 1: Steg 2', level: 1 },
    { id: 'level1_step3', label: 'Nivå 1: Steg 3', level: 1 },
    { id: 'level2', label: 'Nivå 2: Mall', level: 2 },
    { id: 'level3', label: 'Nivå 3: Jämförelse', level: 3 }
  ];

  return (
    <div className="progress-tracker">
      {steps.map((step) => (
        <div key={step.id} className="progress-item">
          <div className={`progress-circle ${
            progress[step.id] === 'completed' ? 'completed' : 
            progress[step.id] === 'unlocked' ? 'unlocked' : ''
          }`}>
            {progress[step.id] === 'completed' && <Check size={16} />}
            {progress[step.id] === 'unlocked' && <Circle size={16} />}
            {progress[step.id] === 'locked' && <Lock size={14} />}
          </div>
          <span>{step.label}</span>
        </div>
      ))}
    </div>
  );
}