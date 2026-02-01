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
    <div className="bg-white border-b border-amber-200">
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all
                  ${progress[step.id] === 'completed' 
                    ? 'bg-green-500 border-green-500' 
                    : progress[step.id] === 'unlocked'
                    ? 'bg-amber-500 border-amber-500'
                    : 'bg-gray-100 border-gray-300'}
                `}>
                  {progress[step.id] === 'completed' && <Check className="w-6 h-6 text-white" />}
                  {progress[step.id] === 'unlocked' && <Circle className="w-6 h-6 text-white" />}
                  {progress[step.id] === 'locked' && <Lock className="w-5 h-5 text-gray-400" />}
                </div>
                <span className={`mt-2 text-xs font-medium ${
                  step.level === currentLevel ? 'text-amber-900' : 'text-gray-500'
                }`}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${
                  progress[steps[index + 1].id] !== 'locked' ? 'bg-amber-500' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}