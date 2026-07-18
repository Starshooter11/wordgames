import React, { useState, useEffect } from 'react';
import { RotateCcw, ChevronDown } from 'lucide-react';

// Simple puzzle parser for txt content
function parsePuzzlesFromText(textContent) {
  const lines = textContent.split('\n').map(line => line.trim());
  const puzzles = [];
  let currentPuzzle = null;
  let puzzleId = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip empty lines
    if (!line) continue;

    // Puzzle separator
    if (line === '---') {
      if (currentPuzzle && currentPuzzle.words && currentPuzzle.words.length > 0) {
        currentPuzzle.id = ++puzzleId;
        puzzles.push(currentPuzzle);
      }
      currentPuzzle = null;
      continue;
    }

    // If no current puzzle, this is the theme
    if (!currentPuzzle) {
      currentPuzzle = {
        theme: line,
        author: null,
        date: null,
        startWord: null,
        words: [],
      };
      continue;
    }

    // Parse metadata (Author: or Date: prefix)
    if (line.startsWith('Author:')) {
      currentPuzzle.author = line.replace('Author:', '').trim();
      continue;
    }

    if (line.startsWith('Date:')) {
      currentPuzzle.date = line.replace('Date:', '').trim();
      continue;
    }

    // If no start word yet, this is it
    if (!currentPuzzle.startWord) {
      currentPuzzle.startWord = line.toUpperCase();
      continue;
    }

    // Parse word | clue pairs
    if (line.includes('|')) {
      const [word, clue] = line.split('|').map(part => part.trim());
      if (word && clue) {
        currentPuzzle.words.push({
          word: word.toUpperCase(),
          clue: clue,
        });
      }
    }
  }

  // Don't forget the last puzzle if file doesn't end with ---
  if (currentPuzzle && currentPuzzle.words && currentPuzzle.words.length > 0) {
    currentPuzzle.id = ++puzzleId;
    puzzles.push(currentPuzzle);
  }

  return puzzles;
}

const RaddleGame = () => {
  // Sample puzzle data as fallback
  const defaultPuzzles = [
    {
      id: 1,
      theme: 'Classic Words',
      author: 'Demo Author',
      date: 'March 8, 2026',
      startWord: 'THORN',
      words: [
        { word: 'HORN', clue: 'Remove a letter to make a noisy instrument' },
        { word: 'NORTH', clue: 'Rearrange to show a direction' },
        { word: 'MONTH', clue: 'Replace a letter with a different starting letter' },
        { word: 'MOTH', clue: 'Remove the time period' },
        { word: 'MATH', clue: 'Replace with a school subject' },
        { word: 'MATHS', clue: 'Add a letter for British English' },
      ],
    },
  ];

  const [puzzles, setPuzzles] = useState(defaultPuzzles);
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [randomizedClues, setRandomizedClues] = useState({});
  const [revealedClues, setRevealedClues] = useState({});
  const [completed, setCompleted] = useState(false);

  // Auto-load puzzles from puzzles.txt when component mounts
  useEffect(() => {
    const loadPuzzles = async () => {
      try {
        // Get the base path from window.location for GitHub Pages compatibility
        const basePath = window.location.pathname.split('/').slice(0, -1).join('/');
        const puzzleUrl = `${basePath}/puzzles.txt`;
        
        const response = await fetch(puzzleUrl);
        if (!response.ok) throw new Error('Failed to load puzzles.txt');
        const textContent = await response.text();
        const loadedPuzzles = parsePuzzlesFromText(textContent);
        
        if (loadedPuzzles.length > 0) {
          setPuzzles(loadedPuzzles);
        }
      } catch (error) {
        console.error('Error loading puzzles:', error);
        // Falls back to default puzzles automatically
      }
    };

    loadPuzzles();
  }, []);

  // Randomize clues when puzzle changes
  useEffect(() => {
    const currentPuzzle = puzzles[currentPuzzleIndex];
    const clueArray = currentPuzzle.words.map((step, idx) => ({ ...step, originalIdx: idx }));
    
    // Fisher-Yates shuffle
    for (let i = clueArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [clueArray[i], clueArray[j]] = [clueArray[j], clueArray[i]];
    }
    
    const clueMappings = {};
    clueArray.forEach((item, displayIdx) => {
      clueMappings[displayIdx] = item;
    });
    
    setRandomizedClues(clueMappings);
    setCurrentWordIndex(0);
    setUserInput('');
    setRevealedClues({});
    setCompleted(false);
  }, [currentPuzzleIndex, puzzles]);

  const currentPuzzle = puzzles[currentPuzzleIndex];
  const currentWord = currentPuzzle.words[currentWordIndex];

  const handleSubmitWord = () => {
    if (userInput.toUpperCase() === currentWord.word) {
      if (currentWordIndex === currentPuzzle.words.length - 1) {
        // Puzzle complete
        setCompleted(true);
      } else {
        // Move to next word
        setCurrentWordIndex(currentWordIndex + 1);
        setUserInput('');
        setRevealedClues({});
      }
    }
  };

  const toggleClueButton = (wordIndex) => {
    setRevealedClues({
      ...revealedClues,
      [wordIndex]: !revealedClues[wordIndex],
    });
  };

  const resetPuzzle = () => {
    setCurrentWordIndex(0);
    setUserInput('');
    setRevealedClues({});
    setCompleted(false);
  };

  const changePuzzle = (index) => {
    setCurrentPuzzleIndex(index);
    setShowDropdown(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Atmospheric background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-5"></div>
        <div className="absolute bottom-32 left-20 w-80 h-80 bg-indigo-500 rounded-full mix-blend-screen filter blur-3xl opacity-5"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-indigo-300 to-blue-200 mb-3 tracking-tighter">
            RADDLE
          </h1>
          <p className="text-slate-400 text-lg font-light">Match words to clues</p>
        </div>

        {/* Main Game Container */}
        <div className="w-full max-w-2xl">
          {/* Puzzle Selection */}
          <div className="mb-6 relative max-w-xs mx-auto">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 font-medium flex items-center justify-between hover:bg-slate-800/70 transition-colors"
            >
              <span>Puzzle {currentPuzzleIndex + 1}</span>
              <ChevronDown size={20} className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg overflow-hidden z-20 shadow-lg">
                {puzzles.map((puzzle, idx) => (
                  <button
                    key={puzzle.id}
                    onClick={() => changePuzzle(idx)}
                    className={`w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors ${
                      idx === currentPuzzleIndex ? 'bg-indigo-600/30 text-indigo-300' : 'text-slate-300'
                    } ${idx !== puzzles.length - 1 ? 'border-b border-slate-700' : ''}`}
                  >
                    Puzzle {idx + 1}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title Box - Theme, Date, Author */}
          <div className="mb-8 p-6 bg-slate-800/40 border border-slate-700 rounded-lg text-center">
            <h2 className="text-2xl font-bold text-slate-200 mb-2">
              {completed ? currentPuzzle.theme : '???'}
            </h2>
            <p className="text-slate-400 text-sm mb-2">{currentPuzzle.date}</p>
            <p className="text-slate-500 text-xs">by {currentPuzzle.author}</p>
          </div>

          {/* Progress */}
          <div className="mb-6 text-center">
            <p className="text-slate-400 text-sm">
              Word {currentWordIndex + 1} of {currentPuzzle.words.length}
            </p>
          </div>

          {/* Word Ladder + Clues Layout */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* LEFT - All Words Vertically */}
            <div className="space-y-3">
              {/* Start Word */}
              <div className="mb-6">
                <p className="text-slate-500 text-xs uppercase tracking-widest mb-2 font-semibold">Start</p>
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-3 text-center">
                  <p className="text-2xl font-black text-white tracking-wider">{currentPuzzle.startWord}</p>
                </div>
              </div>

              {currentPuzzle.words.map((word, wordIndex) => {
                const isAnswered = userInput.toUpperCase() === currentPuzzle.words[currentWordIndex].word && currentWordIndex === wordIndex && completed === false ? true : currentWordIndex > wordIndex;
                const isCurrent = currentWordIndex === wordIndex;

                return (
                  <div key={wordIndex} className="space-y-2">
                    {/* Connector line */}
                    <div className="flex justify-center py-1">
                      <div className="w-0.5 h-2 bg-gradient-to-b from-slate-600 to-transparent"></div>
                    </div>

                    {/* Word Display + Button */}
                    <div className="flex gap-3 items-center">
                      {/* Word Input/Display */}
                      {isCurrent ? (
                        <div className="flex-1 flex flex-col gap-1">
                          <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSubmitWord()}
                            placeholder={word.word.split('').map(c => c === ' ' ? ' ' : c.match(/[A-Z0-9]/) ? '_' : c).join('')}
                            className={`flex-1 px-3 py-2 rounded font-mono font-bold text-center text-lg tracking-widest uppercase transition-all bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500`}
                            autoFocus
                          />
                          <p className="text-xs text-slate-400 text-center">{word.word.replace(/[^A-Z0-9]/g, '').length} letters</p>
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col gap-1">
                          <div
                            className={`flex-1 px-3 py-2 rounded font-mono font-bold text-center text-lg tracking-widest uppercase transition-all ${
                              isAnswered
                                ? 'bg-green-500/20 border border-green-500 text-green-300'
                                : 'bg-slate-700/30 border border-slate-600 text-slate-500'
                            }`}
                          >
                            {isAnswered 
                              ? word.word 
                              : word.word.split('').map(c => c === ' ' ? ' ' : c.match(/[A-Z0-9]/) ? '_' : c).join('')
                            }
                          </div>
                          <p className="text-xs text-slate-400 text-center">{word.word.replace(/[^A-Z0-9]/g, '').length} letters</p>
                        </div>
                      )}

                      {/* Clue Button */}
                      <button
                        onClick={() => toggleClueButton(wordIndex)}
                        disabled={!isCurrent}
                        className={`flex-shrink-0 px-4 py-2 rounded font-semibold transition-all ${
                          !isCurrent
                            ? 'bg-slate-700/20 text-slate-600 cursor-not-allowed'
                            : revealedClues[wordIndex]
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                        }`}
                      >
                        {revealedClues[wordIndex] ? '✓' : '?'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RIGHT - All Clues Randomized */}
            <div className="space-y-3">
              {Object.entries(randomizedClues).map(([displayIdx, clueData]) => {
                const isUsed = currentWordIndex > clueData.originalIdx;
                const isRevealed = revealedClues[clueData.originalIdx];

                return (
                  <div
                    key={displayIdx}
                    className={`relative rounded-lg border-2 transition-all p-3 ${
                      isUsed
                        ? 'bg-green-500/20 border-green-500'
                        : isRevealed
                        ? 'bg-indigo-600/30 border-indigo-500'
                        : 'bg-slate-800/40 border-slate-700'
                    }`}
                  >
                    <p className={`text-sm ${isUsed ? 'text-green-300 line-through' : 'text-slate-300'}`}>
                      {clueData.clue}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Completion State */}
          {completed && (
            <div className="mb-8 p-5 bg-gradient-to-r from-green-900/40 to-emerald-900/40 border border-green-500/50 rounded-lg text-center">
              <p className="text-green-300 font-bold text-lg mb-2">🎉 Puzzle Complete!</p>
              <p className="text-green-200 text-sm">You've matched all the words!</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSubmitWord}
              className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition-colors"
            >
              Submit Word
            </button>
            <button
              onClick={resetPuzzle}
              className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded-lg transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-slate-500 text-sm">
          <p>Match each word to its clue</p>
        </div>
      </div>
    </div>
  );
};

export default RaddleGame;
