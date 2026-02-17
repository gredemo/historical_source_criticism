import React, { useState, useEffect } from 'react';
import { Check, AlertCircle, ArrowRight } from 'lucide-react';
import { trackLevelStarted, trackLevelCompleted } from '../analytics';

export default function Level2({ data, onComplete }) {
  const template = data.template;

  // Dynamiskt räkna antal steg
  const stepKeys = Object.keys(template)
    .filter(key => key.startsWith('step'))
    .sort((a, b) => {
      const numA = parseInt(a.replace('step', ''));
      const numB = parseInt(b.replace('step', ''));
      return numA - numB;
    });
  const totalSteps = stepKeys.length;

  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState(() => {
    const initial = {};
    stepKeys.forEach(key => { initial[key] = ''; });
    return initial;
  });
  const [stepFeedback, setStepFeedback] = useState({});
  const [showFinalAnalysis, setShowFinalAnalysis] = useState(false);

  const currentStepKey = `step${currentStep}`;
  const currentStepData = template[currentStepKey];

  // Säkerhetskoll
  if (!currentStepData && !showFinalAnalysis) {
    return <div>Laddar...</div>;
  }

  // Bestäm typ för nuvarande steg
  const getStepType = (stepData) => {
    if (stepData.type === 'dropdown' || stepData.options) return 'dropdown';
    if (stepData.type === 'text_input') return 'text_input';
    // Fallback: om det finns required_keywords men ingen explicit type
    if (stepData.required_keywords) return 'text_input';
    return 'text_input';
  };

  const handleDropdownChange = (stepKey, value) => {
    setAnswers({ ...answers, [stepKey]: value });
    const stepData = template[stepKey];
    const selected = stepData.options.find(opt => opt.text === value);
    if (selected) {
      setStepFeedback({
        ...stepFeedback,
        [stepKey]: {
          correct: selected.correct,
          feedback: selected.feedback
        }
      });
    }
  };

  const handleTextInput = (stepKey, value) => {
    setAnswers({ ...answers, [stepKey]: value });
  };

  const validateTextStep = (stepKey) => {
    const stepData = template[stepKey];
    const text = answers[stepKey].trim();
    const textLower = text.toLowerCase();
    const minLength = stepData.min_length || 10;

    // Kontrollera minlängd
    if (text.length < minLength) {
      setStepFeedback({
        ...stepFeedback,
        [stepKey]: {
          correct: false,
          feedback: stepData.feedback?.too_short || `Skriv minst ${minLength} tecken.`
        }
      });
      return false;
    }

    // Kolla anti_patterns först
    if (stepData.anti_patterns) {
      for (const pattern of stepData.anti_patterns) {
        const hasAntiPattern = pattern.phrases.some(phrase =>
          textLower.includes(phrase.toLowerCase())
        );
        if (hasAntiPattern) {
          setStepFeedback({
            ...stepFeedback,
            [stepKey]: {
              correct: false,
              feedback: pattern.warning
            }
          });
          return false;
        }
      }
    }

    // Kolla required_concepts om de finns
    if (stepData.required_concepts && stepData.required_concepts.length > 0) {
      const requiredConcepts = stepData.required_concepts.filter(
        concept => concept.required_keywords
      );

      let matchedConcepts = 0;
      let lastMatchedFeedback = '';

      requiredConcepts.forEach(concept => {
        const minMatch = concept.min_keywords_match || 1;
        let keywordMatches = 0;
        concept.required_keywords.forEach(kw => {
          if (textLower.includes(kw.toLowerCase())) keywordMatches++;
        });
        if (keywordMatches >= minMatch) {
          matchedConcepts++;
          lastMatchedFeedback = concept.feedback || '';
        }
      });

      const isValid = matchedConcepts >= requiredConcepts.length;

      setStepFeedback({
        ...stepFeedback,
        [stepKey]: {
          correct: isValid,
          feedback: isValid
            ? (stepData.feedback?.success || lastMatchedFeedback || 'Bra!')
            : (stepData.feedback?.needs_improvement || 'Du behöver utveckla ditt svar mer.')
        }
      });
      return isValid;
    }

    // Kolla required_keywords (enklare format)
    if (stepData.required_keywords && stepData.required_keywords.length > 0) {
      const minMatch = stepData.min_keywords_match || 1;
      let keywordMatches = 0;
      stepData.required_keywords.forEach(kw => {
        if (textLower.includes(kw.toLowerCase())) keywordMatches++;
      });

      const hasKeyword = keywordMatches >= minMatch;

      setStepFeedback({
        ...stepFeedback,
        [stepKey]: {
          correct: hasKeyword,
          feedback: hasKeyword
            ? (stepData.feedback?.has_keyword || stepData.feedback?.success || 'Bra!')
            : (stepData.feedback?.too_vague || stepData.feedback?.needs_improvement || 'Lägg till mer specifika ord.')
        }
      });
      return hasKeyword;
    }

    // Fallback: bara längdkontroll
    const isValid = text.length >= minLength;
    setStepFeedback({
      ...stepFeedback,
      [stepKey]: {
        correct: isValid,
        feedback: isValid
          ? (stepData.feedback?.success || 'Bra!')
          : `Skriv minst ${minLength} tecken.`
      }
    });
    return isValid;
  };

  const nextStep = () => {
    const stepKey = `step${currentStep}`;
    const stepData = template[stepKey];
    const stepType = getStepType(stepData);
    let isValid = false;

    if (stepType === 'dropdown') {
      isValid = stepFeedback[stepKey]?.correct;
    } else {
      isValid = validateTextStep(stepKey);
    }

    if (isValid) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      } else {
        trackLevelCompleted(2, null, null, true);
        setShowFinalAnalysis(true);
      }
    }
  };

  const assembleAnalysis = () => {
    if (template.final_assembly?.template) {
      let result = template.final_assembly.template;
      stepKeys.forEach((key, index) => {
        const stepNum = index + 1;
        const answer = answers[key] || '';
        result = result.replace(`[STEG${stepNum}]`, answer);
      });
      return result;
    }
    // Fallback
    return stepKeys.map(key => {
      const stepData = template[key];
      const answer = answers[key] || '';
      if (stepData.template_output) {
        return stepData.template_output
          .replace('[VALT SVAR]', answer)
          .replace('[ELEVENS FÖRKLARING]', answer)
          .replace('[ELEVENS CITAT]', answer)
          .replace('[ELEVENS EXEMPEL]', answer);
      }
      return answer;
    }).filter(Boolean).join(' ');
  };

  // Hitta rätt evaluation-nyckel
  const getEvaluation = () => {
    const fa = template.final_assembly?.evaluation;
    if (!fa) return '';
    // Kolla t.ex. "4_parts", "5_parts" etc.
    return fa[`${totalSteps}_parts`] || fa['4_parts'] || fa['5_parts'] || Object.values(fa)[0] || '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">{data.title}</h2>
        <p className="mt-2 text-slate-600">{data.instruction}</p>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center gap-2">
        {stepKeys.map((key, index) => (
          <div
            key={key}
            className={`flex-1 h-2 rounded-full transition-all ${
              index + 1 < currentStep
                ? 'bg-[#1a1a2e]'
                : index + 1 === currentStep
                ? 'bg-[#eab308]'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {!showFinalAnalysis ? (
        <>
          {/* Bakgrundskälla om den finns */}
          {data.background_source && (
            <div className="bg-[#f0ebe3] border border-[#d4cdbf] rounded-lg p-4 mb-2">
              <h4 className="text-sm font-bold text-slate-800 mb-2">📜 Bakgrund – {data.background_source.title}:</h4>
              <p className="text-sm text-gray-700 leading-relaxed italic">
                {data.background_source.text}
              </p>
            </div>
          )}

          {/* Källtext */}
          <div className="bg-[#fdfbf7] border border-[#e5e0d5] rounded-lg p-4 mb-6">
            <h4 className="text-sm font-bold text-slate-800 mb-2">📜 {data.source_title || "Källtext"}:</h4>
            <p className="text-sm text-gray-700 leading-relaxed italic">
              {data.source_text}
            </p>
          </div>

          {/* Current Step */}
          <div className="bg-white border-2 border-[#e5e0d5] rounded-lg p-6">
            {/* Brygga från föregående steg */}
            {currentStepData.intro_from_previous && currentStep > 1 && (
              <div className="bg-[#f0ebe3] border border-[#d4cdbf] rounded-lg p-3 mb-4">
                <p className="text-sm text-slate-700 italic">
                  {stepKeys.reduce((text, key, index) => {
                    const stepNum = index + 1;
                    const answer = answers[key] || '';
                    return text.replace(`[STEG${stepNum}]`, answer.trim());
                  }, currentStepData.intro_from_previous)}
                </p>
              </div>
            )}

            <h3 className="text-lg font-bold text-slate-800 mb-4">
              Steg {currentStep} av {totalSteps}: {currentStepData.question}
            </h3>

            {/* Help text om det finns */}
            {currentStepData.help_text && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-900">💡 {currentStepData.help_text}</p>
              </div>
            )}

            {/* Dropdown-typ */}
            {getStepType(currentStepData) === 'dropdown' && (
              <div className="space-y-4">
                <select
                  value={answers[currentStepKey]}
                  onChange={(e) => handleDropdownChange(currentStepKey, e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#e5e0d5] rounded-lg focus:border-[#1a1a2e] focus:outline-none text-lg text-slate-800"
                >
                  <option value="">Välj ett alternativ...</option>
                  {currentStepData.options.map((option, index) => (
                    <option key={index} value={option.text}>
                      {option.text}
                    </option>
                  ))}
                </select>

                {stepFeedback[currentStepKey] && (
                  <div className={`p-4 rounded-lg ${
                    stepFeedback[currentStepKey].correct
                      ? 'bg-[#fefce8] border border-[#eab308]'
                      : 'bg-red-50 border border-red-300'
                  }`}>
                    <p className="text-sm">{stepFeedback[currentStepKey].feedback}</p>
                  </div>
                )}

                {answers[currentStepKey] && currentStepData.template_output && (
                  <div className="bg-[#fdfbf7] border border-[#e5e0d5] rounded-lg p-4">
                    <p className="text-sm font-medium text-slate-800 mb-1">Din text hittills:</p>
                    <p className="text-gray-800">{currentStepData.template_output.replace('[VALT SVAR]', answers[currentStepKey])}</p>
                  </div>
                )}
              </div>
            )}

            {/* Text input-typ */}
            {getStepType(currentStepData) === 'text_input' && (
              <div className="space-y-4">
                {/* Template guide / skrivmall */}
                {currentStepData.template_guide && (
                  <div className="bg-[#fefce8] border border-[#eab308] rounded-lg p-3">
                    <p className="text-sm text-slate-800 whitespace-pre-line">📝 {currentStepData.template_guide}</p>
                  </div>
                )}

                {/* Markerade ord */}
                {currentStepData.highlighted_words && currentStepData.highlighted_words.length > 0 && (
                  <div className="bg-[#fdfbf7] border border-[#e5e0d5] rounded-lg p-3">
                    <p className="text-sm text-slate-800">
                      🔑 Nyckelord att använda:{' '}
                      {currentStepData.highlighted_words.map((word, i) => (
                        <span key={i} className="inline-block bg-[#eab308] text-slate-800 px-2 py-0.5 rounded font-medium mx-1">
                          {word}
                        </span>
                      ))}
                    </p>
                  </div>
                )}

                {/* Exempel */}
                {currentStepData.example && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-900"><strong>Exempel:</strong> {currentStepData.example}</p>
                  </div>
                )}

                <textarea
                  value={answers[currentStepKey]}
                  onChange={(e) => handleTextInput(currentStepKey, e.target.value)}
                  placeholder={currentStepData.placeholder || `Skriv minst ${currentStepData.min_length || 10} tecken...`}
                  className="w-full px-4 py-3 border-2 border-[#e5e0d5] rounded-lg focus:border-[#1a1a2e] focus:outline-none min-h-[120px] text-lg text-slate-800"
                />

                <p className="text-sm text-gray-600">
                  {answers[currentStepKey].length} / {currentStepData.min_length || 10} tecken (minimum)
                </p>

                {stepFeedback[currentStepKey] && (
                  <div className={`p-4 rounded-lg ${
                    stepFeedback[currentStepKey].correct
                      ? 'bg-[#fefce8] border border-[#eab308]'
                      : 'bg-orange-50 border border-orange-300'
                  }`}>
                    <p className="text-sm">{stepFeedback[currentStepKey].feedback}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Next button */}
          <button
            onClick={nextStep}
            disabled={
              getStepType(currentStepData) === 'dropdown'
                ? !answers[currentStepKey]
                : answers[currentStepKey].length < (currentStepData.min_length || 10)
            }
            className="px-6 py-3 bg-[#1a1a2e] text-[#eab308] rounded-lg hover:bg-[#16213e] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium flex items-center gap-2"
          >
            {currentStep < totalSteps ? 'Nästa steg' : 'Se min kompletta analys'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </>
      ) : (
        <>
          {/* Final Analysis */}
          <div className="bg-[#fefce8] border-2 border-[#eab308] rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Check className="w-6 h-6 text-[#eab308]" />
              <h3 className="text-xl font-bold text-slate-800">Din kompletta analys</h3>
            </div>

            <div className="bg-white rounded-lg p-6 mb-4">
              <p className="text-lg leading-relaxed text-gray-800">
                {assembleAnalysis()}
              </p>
            </div>

            <div className="bg-white rounded-lg p-6">
              <h4 className="font-bold text-slate-800 mb-3">Bedömning:</h4>
              <div className="space-y-2">
                {stepKeys.map((key, index) => (
                  <div key={key} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-[#1a1a2e]" />
                    <span className="text-sm">✓ Steg {index + 1} genomfört</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-4 bg-[#fefce8] rounded-lg">
                <p className="text-sm font-medium text-slate-800">
                  {getEvaluation()}
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
            className="px-6 py-3 bg-[#1a1a2e] text-white rounded-lg hover:bg-[#16213e] transition-colors font-medium flex items-center gap-2"
          >
            Gå till Nivå 3: Källjämförelse
            <ArrowRight className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );
}