import React, { useState } from 'react';
import { Check, X, AlertCircle, Lightbulb } from 'lucide-react';

function Level1({ data, progress, onComplete }) {
  const [currentStep, setCurrentStep] = useState(
    progress.level1_step1 === 'completed' ? 
      (progress.level1_step2 === 'completed' ? 3 : 2) : 1
  );
  const [selectedWords, setSelectedWords] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [showAnswers, setShowAnswers] = useState(false);

  const stepData = data[`step${currentStep}`];

  const handleWordClick = (word) => {
    if (selectedWords.includes(word)) {
      setSelectedWords(selectedWords.filter(w => w !== word));
    } else {
      setSelectedWords([...selectedWords, word]);
    }
    setShowFeedback(false);
    setShowAnswers(false);
  };

  const checkAnswer = () => {
    setAttempts(attempts + 1);
    
    const correctWords = stepData.correct_words;
    const foundCorrect = selectedWords.filter(w => 
      correctWords.some(correct => w.toLowerCase().includes(correct.toLowerCase()))
    );
    
    const isSuccess = foundCorrect.length >= stepData.success_threshold;
    
    // För step 1 och 2 - vanlig feedback
    if (currentStep < 3) {
      const feedbackMessages = foundCorrect.map(word => {
        const correctWord = correctWords.find(c => word.toLowerCase().includes(c.toLowerCase()));
        return {
          word,
          message: stepData.feedback[correctWord] || 'Bra valt ord!',
          correct: true
        };
      });

      const missed = correctWords.filter(correct => 
        !selectedWords.some(w => w.toLowerCase().includes(correct.toLowerCase()))
      );

      setFeedback({
        isSuccess,
        foundCorrect: foundCorrect.length,
        total: correctWords.length,
        messages: feedbackMessages,
        missed: missed,
        missingFeedback: stepData.missing_feedback
      });
    } 
    // För step 3 - Fungerar för BÅDE Himmler OCH andra källor
else {
  const isHimmler = stepData.correct_words.includes('ärofullt');
  let adaptiveMessage = "";

  if (isHimmler) {
    // Himmlers specifika logik
    const defenseWords = ['ärofullt', 'anständiga', 'moraliska', 'rätten', 'plikten'];
    const warningWords = ['straffas', 'död', 'brutit', 'förbarmande', 'berika', 'felat'];
    
    const hasDefense = foundCorrect.some(w => defenseWords.some(d => w.toLowerCase().includes(d.toLowerCase())));
    const hasWarning = foundCorrect.some(w => warningWords.some(wr => w.toLowerCase().includes(wr.toLowerCase())));
    
    if (hasDefense && hasWarning) adaptiveMessage = stepData.adaptive_feedback.has_both_types;
    else if (hasDefense) adaptiveMessage = stepData.adaptive_feedback.only_defense;
    else if (hasWarning) adaptiveMessage = stepData.adaptive_feedback.only_warning;
    else adaptiveMessage = stepData.adaptive_feedback.too_few;
  } 
  // 🆕 NY KOD: Stöd för andra källors adaptive_feedback
  else if (stepData.adaptive_feedback) {
    // Om källan HAR adaptive_feedback (som Ida), använd den
    if (isSuccess) {
      adaptiveMessage = stepData.adaptive_feedback.has_both_types || 
                       "Utmärkt! Du har hittat de viktigaste nyckelorden.";
    } else {
      // Försök hitta mer specifik feedback baserat på vad som hittades
      const allWords = stepData.correct_words;
      const foundRatio = foundCorrect.length / allWords.length;
      
      if (foundRatio >= 0.5) {
        adaptiveMessage = stepData.adaptive_feedback.only_work || 
                         stepData.adaptive_feedback.only_social || 
                         "Du är på rätt väg! Hitta några fler ord.";
      } else {
        adaptiveMessage = stepData.adaptive_feedback.too_few || 
                         "Du behöver hitta fler ord för att förstå källans kärna.";
      }
    }
  }
  // Fallback om ingen adaptive_feedback finns
  else {
    adaptiveMessage = isSuccess 
      ? "Utmärkt! Du har hittat de viktigaste nyckelorden i källan." 
      : "Du behöver hitta några fler ord för att förstå källans kärna.";
  }

   // Sätt feedback för step 3
  setFeedback({
    isSuccess,
    foundCorrect: foundCorrect.length,
    total: correctWords.length,
    adaptiveMessage: adaptiveMessage
  });
} 

  setShowFeedback(true);
};

  const nextStep = () => {
    const stepKey = `level1_step${currentStep}`;
    onComplete(stepKey);
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
    
    setSelectedWords([]);
    setShowFeedback(false);
    setFeedback(null);
    setAttempts(0);
    setShowAnswers(false);
  };

  const renderClickableText = () => {
    const words = stepData.text_highlight.split(/(\s+)/);
    return words.map((word, index) => {
      const cleanWord = word.trim();
      if (!cleanWord) return <span key={index}>{word}</span>;
      
      const isSelected = selectedWords.includes(cleanWord);
      return (
        <span
  key={index}
  onClick={() => handleWordClick(cleanWord)}
  className={`clickable-word ${isSelected ? 'selected' : ''}`}
>
  {word}
</span>
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-amber-900">{stepData.title}</h2>
        <p className="mt-2 text-amber-700">{stepData.instruction}</p>
        {stepData.hint && (
          <div className="mt-3 flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-900"><strong>Tips:</strong> {stepData.hint}</p>
          </div>
        )}
      </div>

      {/* Visual hint */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <p className="text-sm text-yellow-900">
          <strong>💡 Så här gör du:</strong> Klicka på ord i texten nedan. Orden du klickar på blir gula. När du hittat minst {stepData.success_threshold} ord, klicka "Kolla mina val".
        </p>
      </div>

      {/* Text */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
        <p className="text-lg leading-relaxed text-gray-800">
          {renderClickableText()}
        </p>
      </div>

      {/* Selected words */}
      {selectedWords.length > 0 && (
        <div className="bg-white border border-amber-200 rounded-lg p-4">
          <p className="text-sm font-medium text-amber-900 mb-2">Dina valda ord ({selectedWords.length}):</p>
          <div className="flex flex-wrap gap-2">
            {selectedWords.map((word, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-yellow-200 text-amber-900 rounded-full text-sm font-medium"
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Feedback */}
      {showFeedback && feedback && (
        <div className={`border-2 rounded-lg p-6 ${
          feedback.isSuccess 
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
              {feedback.isSuccess 
                ? `Bra jobbat! Du hittade ${feedback.foundCorrect} av ${feedback.total} viktiga ord.`
                : `Du hittade ${feedback.foundCorrect} av ${feedback.total} ord. Försök igen!`}
            </h3>
          </div>

          {/* Correct selections */}
          {feedback.messages && feedback.messages.length > 0 && (
            <div className="space-y-2 mb-4">
              {feedback.messages.map((msg, index) => (
                <div key={index} className="flex items-start gap-2 bg-white rounded p-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900">"{msg.word}"</p>
                    <p className="text-sm text-gray-700">{msg.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Adaptive message for step 3 */}
          {feedback.adaptiveMessage && (
            <div className="bg-white rounded p-4 mb-4">
              <p className="text-gray-800">{feedback.adaptiveMessage}</p>
            </div>
          )}

          {/* Missed words */}
          {!feedback.isSuccess && feedback.missed && feedback.missed.length > 0 && (
            <div className="bg-white rounded p-4">
              <p className="font-medium text-orange-900 mb-2">Du missade dessa viktiga ord:</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {feedback.missed.map((word, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-orange-200 text-orange-900 rounded-full text-sm"
                  >
                    {word}
                  </span>
                ))}
              </div>
              {feedback.missingFeedback && (
                <p className="text-sm text-gray-700">{feedback.missingFeedback}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Show answers button (after 2 attempts) */}
      {showFeedback && !feedback?.isSuccess && attempts >= 2 && (
        <button
          onClick={() => setShowAnswers(!showAnswers)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
        >
          <Lightbulb className="w-5 h-5" />
          {showAnswers ? 'Dölj rätt svar' : 'Visa rätt svar'}
        </button>
      )}

      {/* Show answers */}
      {showAnswers && (
        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
          <h4 className="font-bold text-blue-900 mb-3">Rätt svar - så här ska det se ut:</h4>
          <p className="text-sm text-blue-800 mb-4">
            Här är alla nyckelord markerade i texten. Studera dem och försök igen!
          </p>
          <div className="bg-white rounded-lg p-4">
            {stepData.text_highlight.split(/(\s+)/).map((word, index) => {
              const cleanWord = word.trim();
              const isCorrect = stepData.correct_words.some(correct => 
                cleanWord.toLowerCase().includes(correct.toLowerCase())
              );
              return (
                <span
                  key={index}
                  className={isCorrect ? 'bg-green-300 font-bold px-1 rounded' : ''}
                >
                  {word}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={checkAnswer}
          disabled={selectedWords.length === 0}
          className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
        >
          Kolla mina val
        </button>
        
        {showFeedback && feedback?.isSuccess && (
          <button
            onClick={nextStep}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            {currentStep < 3 ? 'Nästa steg →' : 'Gå till Nivå 2 →'}
          </button>
        )}
        
        {showFeedback && !feedback?.isSuccess && (
          <button
            onClick={() => {
              setShowFeedback(false);
              setSelectedWords([]);
              setShowAnswers(false);
            }}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
          >
            Försök igen
          </button>
        )}
      </div>
    </div>
    );
  }

export default Level1;