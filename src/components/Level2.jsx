import React, { useState } from 'react';
import { Check, AlertCircle, ArrowRight } from 'lucide-react';
import { trackLevelStarted, trackLevelCompleted } from '../analytics';

export default function Level2({ data, onComplete }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState({
    step1: '',
    step2: '',
    step3: '',
    step4: ''
  });
  const [stepFeedback, setStepFeedback] = useState({});
  const [showFinalAnalysis, setShowFinalAnalysis] = useState(false);

  const template = data.template;
  const currentStepData = template[`step${currentStep}`];

  // Säkerhetskoll
if (!currentStepData && !showFinalAnalysis) {
  return <div>Laddar...</div>;
}

  const handleStep1Change = (value) => {
    setAnswers({ ...answers, step1: value });
    const selected = currentStepData.options.find(opt => opt.text === value);
    if (selected) {
      setStepFeedback({
        ...stepFeedback,
        step1: {
          correct: selected.correct,
          feedback: selected.feedback
        }
      });
    }
  };

  const handleTextInput = (step, value) => {
    setAnswers({ ...answers, [step]: value });
  };

  const validateStep2 = () => {
  const answer = answers.step2.trim();
  const minLength = currentStepData.min_length || 10;
  
  if (answer.length < minLength) {
    setStepFeedback({
      type: 'error',
      message: currentStepData.feedback?.too_short || 'Citatet är för kort. Skriv minst 10 tecken.'
    });
    return false;
  }
  
  // Kolla om MINST ETT nyckelord finns
  const keywords = currentStepData.required_keywords || [];
  const hasKeyword = keywords.some(keyword => 
    answer.toLowerCase().includes(keyword.toLowerCase())
  );
  
  if (hasKeyword) {
    setStepFeedback({
      type: 'success',
      message: currentStepData.feedback?.has_keyword || 'Bra! Du citerar från texten.'
    });
    return true;
  } else {
    setStepFeedback({
      type: 'warning',
      message: currentStepData.feedback?.too_vague || 'Lägg till mer specifika ord från Himmlers text.'
    });
    return false;
  }
};

  const validateStep3 = () => {
  const text = answers.step3.trim();
  const textLower = text.toLowerCase();
  
  // Kolla om det finns required_concepts i JSON
  const hasConcepts = currentStepData.required_concepts && 
                     currentStepData.required_concepts.length > 0;
  
  if (hasConcepts) {
    // Räkna bara de som har "required_keywords"
    const requiredConcepts = currentStepData.required_concepts.filter(
      concept => concept.required_keywords
    );
    
    let matchedConcepts = 0;
    
    requiredConcepts.forEach(concept => {
      const hasKeyword = concept.required_keywords.some(kw => 
        textLower.includes(kw.toLowerCase())
      );
      if (hasKeyword) matchedConcepts++;
    });
    
    // Kolla om vi matchade tillräckligt många REQUIRED concepts
    const isValid = matchedConcepts >= requiredConcepts.length && 
               text.length >= currentStepData.min_length;

setStepFeedback({
  ...stepFeedback,
  step3: {
    correct: isValid,
    feedback: isValid 
      ? (currentStepData.feedback?.success || "Bra! Du förklarar källans betydelse.")
      : (currentStepData.feedback?.needs_improvement || "Du behöver utveckla ditt svar mer.")
  }
});
    return isValid;
  } else {
    // Fallback: bara längdkontroll (som Himmler)
    if (text.length >= 50) {
      setStepFeedback({
        ...stepFeedback,
        step3: {
          correct: true,
          feedback: "Bra! Du förklarar vad orden avslöjar om verkligheten."
        }
      });
      return true;
    } else {
      setStepFeedback({
        ...stepFeedback,
        step3: {
          correct: false,
          feedback: "Skriv minst 50 tecken."
        }
      });
      return false;
    }
  }
};

  const validateStep4 = () => {
    const text = answers.step4.toLowerCase();
    const hasExample = currentStepData.required_keywords.some(kw => 
      text.includes(kw.toLowerCase())
    );

    const feedback = hasExample 
      ? currentStepData.feedback.has_example
      : currentStepData.feedback.no_example;

    setStepFeedback({
      ...stepFeedback,
      step4: {
        correct: hasExample && text.length >= currentStepData.min_length,
        feedback
      }
    });

    return hasExample && text.length >= currentStepData.min_length;
  };

  const nextStep = () => {
    let isValid = false;

    if (currentStep === 1) {
      isValid = stepFeedback.step1?.correct;
    } else if (currentStep === 2) {
      isValid = validateStep2();
    } else if (currentStep === 3) {
      isValid = validateStep3();
    } else if (currentStep === 4) {
      isValid = validateStep4();
    }

    if (isValid) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      } else {
        setShowFinalAnalysis(true);
      }
    }
  };

  const assembleAnalysis = () => {
    const parts = [
      `I texten finns problemet ${answers.step1}.`,
      `Detta ser jag i orden "${answers.step2}".`,
      `Detta visar att ${answers.step3}.`,
      `Till exempel nämns ${answers.step4}.`
    ];
    return parts.join(' ');
  };

  const completedSteps = Object.values(stepFeedback).filter(f => f?.correct).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-amber-900">{data.title}</h2>
        <p className="mt-2 text-amber-700">{data.instruction}</p>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4].map(step => (
          <div
            key={step}
            className={`flex-1 h-2 rounded-full transition-all ${
              step < currentStep 
                ? 'bg-green-500' 
                : step === currentStep 
                ? 'bg-amber-500' 
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {!showFinalAnalysis ? (
        <>
{/* Visa texten för ALLA steg i Nivå 2 */}
<div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
  <h4 className="text-sm font-bold text-amber-900 mb-2">📜 {data.source_title || "Källtext"}:</h4>
  <p className="text-sm text-gray-700 leading-relaxed italic">
    {data.source_text}
  </p>
</div>
          {/* Current Step */}
          <div className="bg-white border-2 border-amber-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-amber-900 mb-4">
              Steg {currentStep} av 4: {currentStepData.question}
            </h3>

            {/* Step 1: Dropdown */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <select
                  value={answers.step1}
                  onChange={(e) => handleStep1Change(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:border-amber-500 focus:outline-none text-lg"
                >
                  <option value="">Välj ett alternativ...</option>
                  {currentStepData.options.map((option, index) => (
                    <option key={index} value={option.text}>
                      {option.text}
                    </option>
                  ))}
                </select>

                {stepFeedback.step1 && (
                  <div className={`p-4 rounded-lg ${
                    stepFeedback.step1.correct 
                      ? 'bg-green-50 border border-green-300' 
                      : 'bg-red-50 border border-red-300'
                  }`}>
                    <p className="text-sm">{stepFeedback.step1.feedback}</p>
                  </div>
                )}

                {answers.step1 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-amber-900 mb-1">Din text hittills:</p>
                    <p className="text-gray-800">{currentStepData.template_output.replace('[VALT SVAR]', answers.step1)}</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 2, 3, 4: Text input */}
            {currentStep >= 2 && currentStep <= 4 && (
              <div className="space-y-4">
                {currentStepData.example && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-900"><strong>Exempel:</strong> {currentStepData.example}</p>
                  </div>
                )}

                <textarea
                  value={answers[`step${currentStep}`]}
                  onChange={(e) => handleTextInput(`step${currentStep}`, e.target.value)}
                  placeholder={`Skriv minst ${currentStepData.min_length} tecken...`}
                  className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:border-amber-500 focus:outline-none min-h-[120px] text-lg"
                />

                <p className="text-sm text-gray-600">
                  {answers[`step${currentStep}`].length} / {currentStepData.min_length} tecken (minimum)
                </p>

                {stepFeedback[`step${currentStep}`] && (
                  <div className={`p-4 rounded-lg ${
                    stepFeedback[`step${currentStep}`].correct 
                      ? 'bg-green-50 border border-green-300' 
                      : 'bg-orange-50 border border-orange-300'
                  }`}>
                    <p className="text-sm">{stepFeedback[`step${currentStep}`].feedback}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Preview of full text */}
          {currentStep > 1 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <h4 className="text-sm font-bold text-amber-900 mb-3">Din analys hittills:</h4>
              <div className="space-y-2 text-gray-800">
                {currentStep >= 1 && answers.step1 && (
                  <p>I texten finns problemet <strong>{answers.step1}</strong>.</p>
                )}
                {currentStep >= 2 && answers.step2 && (
                  <p>Detta ser jag i orden "<strong>{answers.step2}</strong>".</p>
                )}
                {currentStep >= 3 && answers.step3 && (
                  <p>Detta visar att <strong>{answers.step3}</strong>.</p>
                )}
                {currentStep >= 4 && answers.step4 && (
                  <p>Till exempel nämns <strong>{answers.step4}</strong>.</p>
                )}
              </div>
            </div>
          )}

          {/* Next button */}
          <button
            onClick={nextStep}
            disabled={
              currentStep === 1 ? !answers.step1 : 
              answers[`step${currentStep}`].length < currentStepData.min_length
            }
            className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium flex items-center gap-2"
          >
            {currentStep < 4 ? 'Nästa steg' : 'Se min kompletta analys'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </>
      ) : (
        <>
          {/* Final Analysis */}
          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Check className="w-6 h-6 text-green-600" />
              <h3 className="text-xl font-bold text-green-900">Din kompletta analys</h3>
            </div>

            <div className="bg-white rounded-lg p-6 mb-4">
              <p className="text-lg leading-relaxed text-gray-800">
                {assembleAnalysis()}
              </p>
            </div>

            <div className="bg-white rounded-lg p-6">
              <h4 className="font-bold text-green-900 mb-3">Bedömning:</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-sm">✓ Du identifierade ett SPECIFIKT problem (inte "vissa problem")</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-sm">✓ Du CITERADE konkreta ord från texten</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-sm">✓ Du FÖRKLARADE vad orden betyder</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-sm">✓ Du gav ett KONKRET exempel</span>
                </div>
              </div>

              <div className="mt-4 p-4 bg-green-100 rounded-lg">
                <p className="text-sm font-medium text-green-900">
                  {template.final_assembly.evaluation["4_parts"]}
                </p>
              </div>
            </div>
          </div>

          {/* Continue button */}
          <button
            onClick={() => {
              trackLevelStarted(3);
              onComplete();
            }}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
          >
            Gå till Nivå 3: Källjämförelse
            <ArrowRight className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );
}