import React, { useState } from 'react';
import { Check, X, AlertCircle, Lightbulb, BookOpen } from 'lucide-react';
import { trackLevelStarted, trackLevelCompleted } from '../analytics';

export default function Level3({ data, onComplete }) {
  const [studentText, setStudentText] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [showHints, setShowHints] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showModelAnswer, setShowModelAnswer] = useState(false);

  const wordCount = studentText.trim().split(/\s+/).filter(w => w).length;
  const minWords = data.task.min_words;

  const evaluateText = () => {
    const textLower = studentText.toLowerCase();
    let totalPoints = 0;
    const foundConcepts = [];
    const evaluation = data.task.evaluation;

    // Check required concepts
    evaluation.required_concepts.forEach(concept => {
      const matchedKeywords = concept.keywords.filter(kw =>
        textLower.includes(kw.toLowerCase())
      );

      if (matchedKeywords.length >= (concept.min_keywords_match || 1)) {
        totalPoints += concept.points;
        foundConcepts.push({
          name: concept.concept_name,
          feedback: concept.feedback
        });
      }
    });

    // Check anti-patterns
    const antiPatternWarnings = [];
    if (evaluation.anti_patterns) { 
     evaluation.anti_patterns.forEach(pattern => {
      const foundAntiPattern = pattern.phrases.find(phrase =>
        textLower.includes(phrase.toLowerCase())
      );
      if (foundAntiPattern) {
        antiPatternWarnings.push({
          phrase: foundAntiPattern,
          warning: pattern.warning
        });
      }
    });
  }

    const feedbackLevel = evaluation.feedback_levels[totalPoints.toString()] || evaluation.feedback_levels.needs_improvement;

    setFeedback({
      points: totalPoints,
      maxPoints: evaluation.required_concepts.length,
      foundConcepts,
      antiPatternWarnings,
      feedbackLevel,
      isSuccess: totalPoints >= (evaluation.min_concepts_match || 3)
    });

    setAttempts(attempts + 1);
  };

  const nextHint = () => {
    if (hintIndex < data.task.hints.length - 1) {
      setHintIndex(hintIndex + 1);
    }
    setShowHints(true);
  };

  const reset = () => {
    setFeedback(null);
    setShowHints(false);
  };

  // Dynamisk källhantering - stödjer 2+ källor
  const sources = Object.entries(data.source_comparison || {})
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB)); // Sortera: source_a, source_b, source_c

  // Färger för olika källor (cyklar om det finns fler än 4)
  const sourceColors = [
    { bg: 'bg-amber-50', border: 'border-amber-200', title: 'text-amber-900' },
    { bg: 'bg-blue-50', border: 'border-blue-200', title: 'text-blue-900' },
    { bg: 'bg-purple-50', border: 'border-purple-200', title: 'text-purple-900' },
    { bg: 'bg-green-50', border: 'border-green-200', title: 'text-green-900' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-amber-900">{data.title}</h2>
        <p className="mt-2 text-amber-700">{data.instruction}</p>
      </div>

      {/* Dynamisk visning av alla källor */}
      <div className="space-y-4 mb-6">
        {sources.map(([key, source], index) => {
          const colors = sourceColors[index % sourceColors.length];
          
          return (
            <div key={key} className={`${colors.bg} border ${colors.border} rounded-lg p-4`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className={`text-sm font-bold ${colors.title} mb-1`}>
                    {source.year && <span className="text-lg mr-2">📅 {source.year}</span>}
                    {source.title}
                  </h4>
                  <p className="text-xs text-gray-600 italic">
                    {source.type} • {source.perspective}
                  </p>
                </div>
              </div>
              
              <p className="text-xs text-gray-700 leading-relaxed mt-3 whitespace-pre-line">
                {source.text}
              </p>
              
              {source.summary && (
                <div className={`mt-3 p-2 bg-white rounded border-l-4 ${colors.border}`}>
                  <p className="text-xs font-medium text-gray-800">
                    {source.summary}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-white border-2 border-amber-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-amber-900 mb-4">{data.task.question}</h3>
        
        {/* Template guide - visar strukturmall */}
        {data.task.template_guide && (
          <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4 mb-4">
            <p className="text-sm font-bold text-purple-900 mb-2">📝 Använd denna mall:</p>
            <p className="text-sm text-purple-800 font-mono whitespace-pre-line">
              {data.task.template_guide}
            </p>
          </div>
        )}
        
        {/* Helper text - påminner om nyckelord */}
        {data.task.helper_text && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-900">{data.task.helper_text}</p>
          </div>
        )}
        
        <textarea
          value={studentText}
          onChange={(e) => setStudentText(e.target.value)}
          placeholder={data.task.placeholder || "Skriv din jämförande analys här... Var SPECIFIK och ge KONKRETA exempel!"}
          className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:border-amber-500 focus:outline-none min-h-[200px] text-lg"
        />

        <div className="flex items-center justify-between mt-3">
          <p className="text-sm text-gray-600">
            {wordCount} / {minWords} ord (minimum)
          </p>
          {wordCount < minWords && (
            <p className="text-sm text-orange-600 font-medium">
              Du behöver skriva minst {minWords - wordCount} ord till
            </p>
          )}
        </div>
      </div>

      {/* Hints */}
      {showHints && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-5">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h4 className="font-bold text-blue-900 mb-2">Tips {hintIndex + 1} av {data.task.hints.length}:</h4>
              <p className="text-blue-800">{data.task.hints[hintIndex]}</p>
              {hintIndex < data.task.hints.length - 1 && (
                <button
                  onClick={nextHint}
                  className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  → Nästa tips
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <div className={`border-2 rounded-lg p-6 ${feedback.isSuccess
            ? 'bg-green-50 border-green-300'
            : 'bg-orange-50 border-orange-300'
          }`}>
          <div className="flex items-center gap-2 mb-4">
            {feedback.isSuccess ? (
              <Check className="w-6 h-6 text-green-600" />
            ) : (
              <X className="w-6 h-6 text-orange-600" />
            )}
            <h3 className="text-lg font-bold">
              Din analys: {feedback.points} av {feedback.maxPoints} begrepp
            </h3>
          </div>

          {/* Found concepts */}
          {feedback.foundConcepts.length > 0 && (
            <div className="space-y-2 mb-4">
              {feedback.foundConcepts.map((concept, index) => (
                <div key={index} className="flex items-start gap-2 bg-white rounded p-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-800">{concept.feedback}</p>
                </div>
              ))}
            </div>
          )}

          {/* Anti-pattern warnings */}
          {feedback.antiPatternWarnings.length > 0 && (
            <div className="mb-4">
              {feedback.antiPatternWarnings.map((warning, index) => (
                <div key={index} className="flex items-start gap-2 bg-white rounded p-3 border-l-4 border-orange-400">
                  <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-orange-900">
                      Du skrev: "{warning.phrase}"
                    </p>
                    <p className="text-sm text-gray-700 mt-1">{warning.warning}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Main feedback */}
          <div className="bg-white rounded p-4 mb-4">
            <p className="text-gray-800">{feedback.feedbackLevel}</p>
          </div>

          {/* Missing concepts */}
          {!feedback.isSuccess && (
            <div className="bg-white rounded p-4">
              <p className="font-medium text-orange-900 mb-2">För att nå C-nivå, lägg till:</p>
              <ul className="space-y-3 text-sm text-gray-700">
                {data.task.evaluation.required_concepts
                  .filter(concept => !feedback.foundConcepts.find(f => f.name === concept.concept_name))
                  .map((concept, index) => (
                    <li key={index} className="bg-orange-50 rounded p-3 border-l-4 border-orange-400">
                      <div className="font-semibold text-orange-900 mb-1">
                        {concept.concept_name}
                      </div>
                      <div className="text-xs text-gray-600">
                        Leta efter ord som: <span className="font-medium text-orange-700">"{concept.keywords.slice(0, 5).join('", "')}"</span>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Model answer */}
      {showModelAnswer && (
        <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
          <h3 className="text-lg font-bold text-purple-900 mb-4">Exempel på A-nivå-svar:</h3>

          <div className="bg-white rounded-lg p-5 mb-4">
            <p className="text-gray-800 leading-relaxed whitespace-pre-line">
              {data.task.model_answer.text}
            </p>
          </div>

          <div className="bg-purple-100 rounded-lg p-4">
            <p className="text-sm font-medium text-purple-900 mb-2">Analys av svaret:</p>
            <p className="text-sm text-purple-800 whitespace-pre-line">
              {data.task.model_answer.analysis}
            </p>
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={evaluateText}
          disabled={wordCount < minWords}
          className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
        >
          Få feedback
        </button>

        {feedback && !feedback.isSuccess && (
          <>
            <button
              onClick={() => {
                if (!showHints) {
                  setShowHints(true);
                } else {
                  nextHint();
                }
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
            >
              <Lightbulb className="w-5 h-5" />
              {showHints ? 'Nästa tips' : 'Få tips'}
            </button>

            <button
              onClick={reset}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Försök igen
            </button>

            {attempts >= 2 && (
              <button
                onClick={() => setShowModelAnswer(!showModelAnswer)}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                {showModelAnswer ? 'Dölj' : 'Se'} modellsvar
              </button>
            )}
          </>
        )}

        {feedback && feedback.isSuccess && (
          <button
            onClick={() => {
              trackLevelCompleted(3, null, attempts, true);
              onComplete();
            }}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            ✓ Klart! Du har klarat alla nivåer
          </button>
        )}
      </div>
    </div>
  );
}