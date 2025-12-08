import React, { useState } from 'react';
import { QuizQuestion } from '../types';

interface QuizComponentProps {
  questions: QuizQuestion[];
}

const QuizComponent: React.FC<QuizComponentProps> = ({ questions }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [showResults, setShowResults] = useState<{ [key: number]: boolean }>({});

  const handleSelect = (questionIndex: number, optionIndex: number) => {
    if (showResults[questionIndex]) return; // Prevent changing after revealing
    setSelectedAnswers(prev => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const handleCheck = (questionIndex: number) => {
    setShowResults(prev => ({ ...prev, [questionIndex]: true }));
  };

  const allAnswered = questions.length > 0 && Object.keys(showResults).length === questions.length;
  const correctCount = questions.reduce((acc, q, idx) => {
    return selectedAnswers[idx] === q.correctAnswerIndex ? acc + 1 : acc;
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-800">Knowledge Check</h3>
          <span className="text-sm text-slate-500">{questions.length} Questions</span>
      </div>

      {allAnswered && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white text-center shadow-lg animate-fade-in">
           <p className="text-sm uppercase tracking-wide opacity-80 mb-1">Quiz Completed</p>
           <p className="text-3xl font-extrabold">{correctCount} / {questions.length}</p>
           <p className="text-sm mt-2 opacity-90">
             {correctCount === questions.length ? "Perfect Score! Masterful." : 
              correctCount > questions.length / 2 ? "Great job! You're learning fast." : "Good effort! Keep exploring."}
           </p>
        </div>
      )}
      
      {questions.map((q, qIdx) => {
        const isAnswered = showResults[qIdx];
        const isCorrect = selectedAnswers[qIdx] === q.correctAnswerIndex;
        
        return (
          <div key={qIdx} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 transition-all duration-300">
            <h4 className="font-semibold text-slate-800 mb-4 flex gap-3">
               <span className={`flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${isAnswered ? (isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700') : 'bg-blue-100 text-blue-600'}`}>{qIdx + 1}</span>
               {q.question}
            </h4>
            
            <div className="space-y-2 pl-9">
              {q.options.map((option, oIdx) => {
                let btnClass = "w-full text-left p-3 rounded-lg border transition-colors flex items-center justify-between ";
                
                if (isAnswered) {
                  if (oIdx === q.correctAnswerIndex) {
                    btnClass += "bg-green-50 border-green-500 text-green-700 font-medium";
                  } else if (selectedAnswers[qIdx] === oIdx) {
                    btnClass += "bg-red-50 border-red-300 text-red-700";
                  } else {
                    btnClass += "bg-slate-50 border-slate-200 text-slate-400 opacity-60";
                  }
                } else {
                  if (selectedAnswers[qIdx] === oIdx) {
                    btnClass += "bg-blue-50 border-blue-400 text-blue-800";
                  } else {
                    btnClass += "bg-white border-slate-200 hover:bg-slate-50 text-slate-700";
                  }
                }

                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelect(qIdx, oIdx)}
                    disabled={isAnswered}
                    className={btnClass}
                  >
                    <span>{option}</span>
                    {isAnswered && oIdx === q.correctAnswerIndex && (
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    )}
                     {isAnswered && selectedAnswers[qIdx] === oIdx && oIdx !== q.correctAnswerIndex && (
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    )}
                  </button>
                );
              })}
            </div>

            {!isAnswered && selectedAnswers[qIdx] !== undefined && (
              <div className="mt-4 pl-9">
                <button
                  onClick={() => handleCheck(qIdx)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Check Answer
                </button>
              </div>
            )}

            {isAnswered && (
              <div className={`mt-4 ml-9 p-3 rounded-lg text-sm ${isCorrect ? 'bg-green-50 text-green-800 border border-green-100' : 'bg-orange-50 text-orange-800 border border-orange-100'}`}>
                <p className="font-bold mb-1">{isCorrect ? 'Correct!' : 'Incorrect'}</p>
                <p>{q.explanation}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default QuizComponent;