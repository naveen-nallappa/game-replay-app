import React, { useState, useEffect, useCallback, useRef } from 'react';

// Static game data - a classic comeback game
const STATIC_GAME_DATA = {
  homeTeam: {
    name: "Yankees",
    abbreviation: "NYY",
    color: "#003087",
    record: "92-70"
  },
  awayTeam: {
    name: "Red Sox",
    abbreviation: "BOS",
    color: "#BD3039",
    record: "88-74"
  },
  date: "October 5, 2024",
  venue: "Yankee Stadium",
  // Inning-by-inning scores [away, home]
  innings: [
    [2, 0], // 1st
    [0, 1], // 2nd
    [1, 0], // 3rd
    [0, 2], // 4th
    [0, 0], // 5th
    [3, 1], // 6th
    [0, 0], // 7th
    [0, 3], // 8th
    [0, 2], // 9th - walk-off!
  ],
  // Play-by-play events with timestamps
  plays: [
    { inning: 1, half: "top", event: "2-run HR by Martinez", awayScore: 2, homeScore: 0 },
    { inning: 2, half: "bottom", event: "RBI single by Judge", awayScore: 2, homeScore: 1 },
    { inning: 3, half: "top", event: "Solo HR by Devers", awayScore: 3, homeScore: 1 },
    { inning: 4, half: "bottom", event: "2-run double by Stanton", awayScore: 3, homeScore: 3 },
    { inning: 6, half: "top", event: "RBI single by Verdugo", awayScore: 4, homeScore: 3 },
    { inning: 6, half: "top", event: "2-run HR by Bogaerts", awayScore: 6, homeScore: 3 },
    { inning: 6, half: "bottom", event: "Solo HR by Torres", awayScore: 6, homeScore: 4 },
    { inning: 8, half: "bottom", event: "2-run HR by Rizzo", awayScore: 6, homeScore: 6 },
    { inning: 8, half: "bottom", event: "RBI triple by Volpe", awayScore: 6, homeScore: 7 },
    { inning: 9, half: "bottom", event: "Walk-off 2-run HR by Judge!", awayScore: 6, homeScore: 9 },
  ]
};

// Flip digit component for retro scoreboard effect
const FlipDigit = ({ value, size = "large" }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isFlipping, setIsFlipping] = useState(false);
  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue.current !== value) {
      setIsFlipping(true);
      const timer = setTimeout(() => {
        setDisplayValue(value);
        setIsFlipping(false);
      }, 150);
      prevValue.current = value;
      return () => clearTimeout(timer);
    }
  }, [value]);

  const sizeClasses = size === "large"
    ? "w-12 h-16 text-4xl"
    : size === "medium"
    ? "w-8 h-12 text-2xl"
    : "w-6 h-8 text-lg";

  return (
    <div
      className={`${sizeClasses} bg-gray-900 rounded-sm flex items-center justify-center font-mono font-bold text-amber-400 relative overflow-hidden border border-gray-700 shadow-inner`}
      style={{
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.3)',
        transform: isFlipping ? 'rotateX(90deg)' : 'rotateX(0deg)',
        transition: 'transform 0.15s ease-in-out'
      }}
    >
      <div className="absolute inset-x-0 top-1/2 h-px bg-gray-800 opacity-50"></div>
      {displayValue}
    </div>
  );
};

// Score display with flip animation
const ScoreDisplay = ({ score, size = "large" }) => {
  const digits = String(score).padStart(2, ' ').split('');
  return (
    <div className="flex gap-1">
      {digits.map((digit, i) => (
        <FlipDigit key={i} value={digit === ' ' ? '' : digit} size={size} />
      ))}
    </div>
  );
};

// Inning cell component
const InningCell = ({ value, revealed, isCurrentInning }) => (
  <div
    className={`w-10 h-10 flex items-center justify-center font-mono text-lg border-r border-gray-700 transition-all duration-300 ${
      isCurrentInning ? 'bg-amber-900/30' : ''
    }`}
  >
    {revealed ? (
      <span className={`${value > 0 ? 'text-amber-400 font-bold' : 'text-gray-500'}`}>
        {value}
      </span>
    ) : (
      <span className="text-gray-700">-</span>
    )}
  </div>
);

// Team row component
const TeamRow = ({ team, innings, totalScore, revealedInnings, currentInning, isWinning }) => (
  <div className={`flex items-center border-b border-gray-700 ${isWinning ? 'bg-green-900/20' : ''}`}>
    <div
      className="w-20 h-12 flex items-center justify-center font-bold text-lg border-r border-gray-700"
      style={{ backgroundColor: team.color + '40', color: team.color }}
    >
      {team.abbreviation}
    </div>
    <div className="flex">
      {innings.map((score, i) => (
        <InningCell
          key={i}
          value={score}
          revealed={i < revealedInnings}
          isCurrentInning={i === currentInning}
        />
      ))}
    </div>
    <div className="w-16 h-12 flex items-center justify-center border-l-2 border-amber-600 bg-gray-800">
      <ScoreDisplay score={totalScore} size="small" />
    </div>
  </div>
);

// Play-by-play event card
const PlayCard = ({ play, homeTeam, awayTeam, isNew }) => {
  const isHomePlay = play.half === "bottom";
  const team = isHomePlay ? homeTeam : awayTeam;

  return (
    <div
      className={`p-3 rounded-lg border-l-4 mb-2 transition-all duration-500 ${
        isNew ? 'animate-pulse bg-amber-900/30' : 'bg-gray-800/50'
      }`}
      style={{ borderLeftColor: team.color }}
    >
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs text-gray-400">
            {play.half === "top" ? "▲" : "▼"} {play.inning}{getOrdinalSuffix(play.inning)}
          </span>
          <p className="text-white font-medium mt-1">{play.event}</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-400">{awayTeam.abbreviation} - {homeTeam.abbreviation}</div>
          <div className="font-mono text-amber-400 font-bold">
            {play.awayScore} - {play.homeScore}
          </div>
        </div>
      </div>
    </div>
  );
};

function getOrdinalSuffix(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

// Speed control button
const SpeedButton = ({ speed, currentSpeed, onClick, label }) => (
  <button
    onClick={() => onClick(speed)}
    className={`px-4 py-2 rounded-lg font-medium transition-all ${
      currentSpeed === speed
        ? 'bg-amber-600 text-white shadow-lg'
        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
    }`}
  >
    {label}
  </button>
);

// Main component
export default function GameReplay() {
  const [gameData] = useState(STATIC_GAME_DATA);
  const [mode, setMode] = useState('inning'); // 'inning' or 'play'
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(2000); // ms between updates
  const [currentStep, setCurrentStep] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [showSpoilerWarning, setShowSpoilerWarning] = useState(true);

  const maxSteps = mode === 'inning' ? gameData.innings.length : gameData.plays.length;

  // Calculate current scores based on mode and step
  const getCurrentScores = useCallback(() => {
    if (mode === 'inning') {
      let away = 0, home = 0;
      for (let i = 0; i < currentStep; i++) {
        away += gameData.innings[i][0];
        home += gameData.innings[i][1];
      }
      return { away, home };
    } else {
      if (currentStep === 0) return { away: 0, home: 0 };
      const lastPlay = gameData.plays[currentStep - 1];
      return { away: lastPlay.awayScore, home: lastPlay.homeScore };
    }
  }, [mode, currentStep, gameData]);

  const scores = getCurrentScores();

  // Auto-advance timer
  useEffect(() => {
    if (!isPlaying || currentStep >= maxSteps) {
      if (currentStep >= maxSteps) setIsPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      setCurrentStep(prev => prev + 1);
    }, speed);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, speed, maxSteps]);

  const handleStart = () => {
    setShowSpoilerWarning(false);
    setHasStarted(true);
  };

  const handlePlayPause = () => {
    if (currentStep >= maxSteps) {
      setCurrentStep(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  const handleSkipToEnd = () => {
    setIsPlaying(false);
    setCurrentStep(maxSteps);
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  // Spoiler warning screen
  if (showSpoilerWarning) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-900 rounded-2xl p-8 text-center border border-gray-800 shadow-2xl">
          <div className="text-6xl mb-4">⚾</div>
          <h1 className="text-3xl font-bold text-white mb-2">Game Replay</h1>
          <div className="text-amber-400 font-semibold mb-6">Spoiler-Free Experience</div>

          <div className="bg-gray-800/50 rounded-xl p-4 mb-6 text-left">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: gameData.awayTeam.color }}
              >
                {gameData.awayTeam.abbreviation.charAt(0)}
              </div>
              <div>
                <div className="text-white font-semibold">{gameData.awayTeam.name}</div>
                <div className="text-gray-400 text-sm">{gameData.awayTeam.record}</div>
              </div>
            </div>
            <div className="text-center text-gray-500 text-sm mb-3">@ </div>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: gameData.homeTeam.color }}
              >
                {gameData.homeTeam.abbreviation.charAt(0)}
              </div>
              <div>
                <div className="text-white font-semibold">{gameData.homeTeam.name}</div>
                <div className="text-gray-400 text-sm">{gameData.homeTeam.record}</div>
              </div>
            </div>
          </div>

          <div className="text-gray-400 text-sm mb-6">
            {gameData.date} • {gameData.venue}
          </div>

          <button
            onClick={handleStart}
            className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg"
          >
            Experience the Game
          </button>

          <p className="text-gray-500 text-xs mt-4">
            Watch the score unfold without spoilers
          </p>
        </div>
      </div>
    );
  }

  const isGameOver = currentStep >= maxSteps;
  const winner = scores.home > scores.away ? 'home' : scores.away > scores.home ? 'away' : null;

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-amber-400 text-sm font-medium tracking-wider mb-1">
            {gameData.date}
          </div>
          <div className="text-gray-400 text-sm">{gameData.venue}</div>
        </div>

        {/* Main Scoreboard */}
        <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-800 mb-6">
          {/* Scoreboard Header */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 flex items-center justify-between border-b border-gray-700">
            <h2 className="text-white font-bold tracking-wider">SCOREBOARD</h2>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
              <span className="text-gray-400 text-sm">
                {isGameOver ? 'FINAL' : isPlaying ? 'LIVE' : 'PAUSED'}
              </span>
            </div>
          </div>

          {/* Big Score Display */}
          <div className="p-6 bg-gradient-to-b from-gray-900 to-gray-950">
            <div className="flex items-center justify-center gap-8">
              {/* Away Team */}
              <div className="text-center">
                <div
                  className="text-2xl font-bold mb-2"
                  style={{ color: gameData.awayTeam.color }}
                >
                  {gameData.awayTeam.abbreviation}
                </div>
                <ScoreDisplay score={scores.away} />
                {isGameOver && winner === 'away' && (
                  <div className="mt-2 text-green-400 text-sm font-bold">WINNER</div>
                )}
              </div>

              {/* VS / Inning */}
              <div className="text-center">
                <div className="text-gray-600 text-4xl font-light">-</div>
                {hasStarted && !isGameOver && currentStep > 0 && (
                  <div className="text-amber-400 text-sm mt-2">
                    {mode === 'inning'
                      ? `After ${currentStep} inning${currentStep > 1 ? 's' : ''}`
                      : `${gameData.plays[currentStep - 1]?.half === 'top' ? '▲' : '▼'} ${gameData.plays[currentStep - 1]?.inning}`
                    }
                  </div>
                )}
              </div>

              {/* Home Team */}
              <div className="text-center">
                <div
                  className="text-2xl font-bold mb-2"
                  style={{ color: gameData.homeTeam.color }}
                >
                  {gameData.homeTeam.abbreviation}
                </div>
                <ScoreDisplay score={scores.home} />
                {isGameOver && winner === 'home' && (
                  <div className="mt-2 text-green-400 text-sm font-bold">WINNER</div>
                )}
              </div>
            </div>
          </div>

          {/* Inning-by-Inning Grid (only in inning mode) */}
          {mode === 'inning' && (
            <div className="border-t border-gray-700">
              {/* Inning Headers */}
              <div className="flex bg-gray-800">
                <div className="w-20 h-8 flex items-center justify-center text-gray-400 text-sm font-medium border-r border-gray-700">
                  TEAM
                </div>
                <div className="flex">
                  {gameData.innings.map((_, i) => (
                    <div
                      key={i}
                      className={`w-10 h-8 flex items-center justify-center text-sm border-r border-gray-700 ${
                        i === currentStep - 1 ? 'bg-amber-900/30 text-amber-400' : 'text-gray-400'
                      }`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
                <div className="w-16 h-8 flex items-center justify-center text-amber-400 text-sm font-bold border-l-2 border-amber-600">
                  R
                </div>
              </div>

              {/* Away Team Row */}
              <TeamRow
                team={gameData.awayTeam}
                innings={gameData.innings.map(i => i[0])}
                totalScore={scores.away}
                revealedInnings={currentStep}
                currentInning={currentStep - 1}
                isWinning={isGameOver && winner === 'away'}
              />

              {/* Home Team Row */}
              <TeamRow
                team={gameData.homeTeam}
                innings={gameData.innings.map(i => i[1])}
                totalScore={scores.home}
                revealedInnings={currentStep}
                currentInning={currentStep - 1}
                isWinning={isGameOver && winner === 'home'}
              />
            </div>
          )}
        </div>

        {/* Play-by-Play Panel (only in play mode) */}
        {mode === 'play' && currentStep > 0 && (
          <div className="bg-gray-900 rounded-2xl p-4 mb-6 border border-gray-800 max-h-64 overflow-y-auto">
            <h3 className="text-gray-400 text-sm font-medium mb-3">SCORING PLAYS</h3>
            <div>
              {gameData.plays.slice(0, currentStep).reverse().map((play, i) => (
                <PlayCard
                  key={i}
                  play={play}
                  homeTeam={gameData.homeTeam}
                  awayTeam={gameData.awayTeam}
                  isNew={i === 0 && isPlaying}
                />
              ))}
            </div>
          </div>
        )}

        {/* Mode Toggle */}
        <div className="flex justify-center gap-2 mb-4">
          <button
            onClick={() => handleModeChange('inning')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              mode === 'inning'
                ? 'bg-amber-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Inning-by-Inning
          </button>
          <button
            onClick={() => handleModeChange('play')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              mode === 'play'
                ? 'bg-amber-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Play-by-Play
          </button>
        </div>

        {/* Controls */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          {/* Speed Controls */}
          <div className="mb-6">
            <div className="text-gray-400 text-sm mb-3 text-center">PLAYBACK SPEED</div>
            <div className="flex justify-center gap-2">
              <SpeedButton speed={4000} currentSpeed={speed} onClick={setSpeed} label="🐢 Slow" />
              <SpeedButton speed={2000} currentSpeed={speed} onClick={setSpeed} label="Normal" />
              <SpeedButton speed={800} currentSpeed={speed} onClick={setSpeed} label="🐇 Fast" />
              <SpeedButton speed={200} currentSpeed={speed} onClick={setSpeed} label="⚡ Rapid" />
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex justify-center gap-3">
            <button
              onClick={handleReset}
              className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all"
              title="Reset"
            >
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            <button
              onClick={() => currentStep > 0 && setCurrentStep(prev => prev - 1)}
              disabled={currentStep === 0}
              className="p-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all"
              title="Previous"
            >
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={handlePlayPause}
              className="p-4 bg-amber-600 hover:bg-amber-500 rounded-xl transition-all shadow-lg"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </button>

            <button
              onClick={() => currentStep < maxSteps && setCurrentStep(prev => prev + 1)}
              disabled={currentStep >= maxSteps}
              className="p-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all"
              title="Next"
            >
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button
              onClick={handleSkipToEnd}
              className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all"
              title="Skip to End"
            >
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>{mode === 'inning' ? 'Innings' : 'Scoring Plays'}</span>
              <span>{currentStep} / {maxSteps}</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-300"
                style={{ width: `${(currentStep / maxSteps) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-600 text-sm">
          ⚾ Game Replay • Experience the drama without spoilers
        </div>
      </div>
    </div>
  );
}
