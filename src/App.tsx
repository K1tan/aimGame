/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Play, RotateCcw, Settings, Target, MousePointer2, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

let audioCtx: AudioContext | null = null;
const playHitSound = () => {
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.1);

    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
  } catch (e) {
    console.error("Audio play failed", e);
  }
};

type GameState = 'menu' | 'playing' | 'results';

interface GameSettings {
  targetCount: number;
  targetSize: number;
  cursorSize: number;
  soundEnabled: boolean;
  trailEnabled: boolean;
}

const Menu = ({ settings, setSettings, onStart }: { settings: GameSettings, setSettings: (s: GameSettings) => void, onStart: () => void }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-slate-950 text-slate-200 p-4">
      <div className="max-w-md w-full p-6 md:p-8 bg-slate-900 rounded-2xl shadow-xl border border-slate-800 max-h-full overflow-y-auto custom-scrollbar">
        <h1 className="text-3xl md:text-4xl font-black text-center mb-6 md:mb-8 text-emerald-400 tracking-tight">AIM TRAINER</h1>
        
        <div className="space-y-5 md:space-y-6">
          <div>
            <div className="flex justify-between mb-2 md:mb-3">
              <label className="text-xs md:text-sm font-semibold text-slate-400 flex items-center gap-2 uppercase tracking-wider">
                <Target size={16} /> Targets
              </label>
              <span className="text-xs md:text-sm font-bold text-emerald-400">{settings.targetCount}</span>
            </div>
            <input 
              type="range" 
              min="10" max="100" step="5"
              value={settings.targetCount}
              onChange={(e) => setSettings({...settings, targetCount: parseInt(e.target.value)})}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2 md:mb-3">
              <label className="text-xs md:text-sm font-semibold text-slate-400 flex items-center gap-2 uppercase tracking-wider">
                <Settings size={16} /> Target Size
              </label>
              <span className="text-xs md:text-sm font-bold text-emerald-400">{settings.targetSize}px</span>
            </div>
            <input 
              type="range" 
              min="20" max="100" step="5"
              value={settings.targetSize}
              onChange={(e) => setSettings({...settings, targetSize: parseInt(e.target.value)})}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2 md:mb-3">
              <label className="text-xs md:text-sm font-semibold text-slate-400 flex items-center gap-2 uppercase tracking-wider">
                <MousePointer2 size={16} /> Cursor Size
              </label>
              <span className="text-xs md:text-sm font-bold text-emerald-400">{settings.cursorSize}px</span>
            </div>
            <input 
              type="range" 
              min="10" max="50" step="2"
              value={settings.cursorSize}
              onChange={(e) => setSettings({...settings, cursorSize: parseInt(e.target.value)})}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          <div className="flex gap-3 md:gap-4 pt-2">
            <button 
              onClick={() => setSettings({...settings, soundEnabled: !settings.soundEnabled})}
              className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold text-xs md:text-sm transition-all ${settings.soundEnabled ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-slate-800/50 text-slate-500 border border-slate-700'}`}
            >
              {settings.soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />} Sound
            </button>
            <button 
              onClick={() => setSettings({...settings, trailEnabled: !settings.trailEnabled})}
              className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold text-xs md:text-sm transition-all ${settings.trailEnabled ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-slate-800/50 text-slate-500 border border-slate-700'}`}
            >
              <Sparkles size={16} className={!settings.trailEnabled ? 'opacity-50' : ''} /> Trail
            </button>
          </div>
        </div>

        <button 
          onClick={onStart}
          className="w-full mt-6 md:mt-8 py-3 md:py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-base md:text-lg rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(16,185,129,0.3)]"
        >
          <Play size={20} fill="currentColor" /> START TRAINING
        </button>

        <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-slate-800 text-center space-y-3">
          <p className="text-[10px] md:text-xs font-semibold text-slate-500 uppercase tracking-widest">Hotkeys</p>
          <div className="flex justify-center gap-4 md:gap-6 text-xs md:text-sm text-slate-400">
            <span className="flex items-center gap-2"><kbd className="px-2 py-1 bg-slate-950 rounded-md border border-slate-800 font-mono text-emerald-400 shadow-inner text-xs">R</kbd> Restart</span>
            <span className="flex items-center gap-2"><kbd className="px-2 py-1 bg-slate-950 rounded-md border border-slate-800 font-mono text-emerald-400 shadow-inner text-xs">ESC</kbd> Menu</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Game = ({ settings, onFinish }: { settings: GameSettings, onFinish: (times: number[]) => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<{x: number, y: number, t: number}[]>([]);
  const rafRef = useRef<number>(0);
  const [targetPos, setTargetPos] = useState<{ x: number, y: number } | null>(null);
  const targetPosRef = useRef<{ x: number, y: number } | null>(null);
  const [times, setTimes] = useState<number[]>([]);
  const [lastSpawnTime, setLastSpawnTime] = useState<number>(0);
  
  const lastMousePos = useRef<{x: number, y: number}>({ x: -1000, y: -1000 });
  const timesRef = useRef<number[]>([]);

  const checkCollision = useCallback((mouseX: number, mouseY: number, targetX: number, targetY: number) => {
    const dx = mouseX - targetX;
    const dy = mouseY - targetY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const hitRadius = (settings.targetSize / 2) + (settings.cursorSize / 2);
    return distance <= hitRadius;
  }, [settings.targetSize, settings.cursorSize]);

  const spawnTarget = useCallback(() => {
    if (!containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    const padding = settings.targetSize;
    
    let newX = 0;
    let newY = 0;
    let isColliding = true;
    
    let attempts = 0;
    while (isColliding && attempts < 50) {
      newX = Math.random() * (width - padding * 2) + padding;
      newY = Math.random() * (height - padding * 2) + padding;
      isColliding = checkCollision(lastMousePos.current.x, lastMousePos.current.y, newX, newY);
      attempts++;
    }

    const newPos = { x: newX, y: newY };
    targetPosRef.current = newPos;
    setTargetPos(newPos);
    setLastSpawnTime(performance.now());
  }, [settings.targetSize, checkCollision]);

  useEffect(() => {
    spawnTarget();
  }, [spawnTarget]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const updateSize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const now = performance.now();
      // Keep points from the last 250ms
      pointsRef.current = pointsRef.current.filter(p => now - p.t < 250);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (settings.trailEnabled && pointsRef.current.length > 1) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        for (let i = 1; i < pointsRef.current.length; i++) {
          const p0 = pointsRef.current[i - 1];
          const p1 = pointsRef.current[i];
          const age = now - p1.t;
          const progress = Math.max(0, 1 - (age / 250));

          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.strokeStyle = `rgba(244, 63, 94, ${progress * 0.5})`; // rose-500 with fading opacity
          ctx.lineWidth = settings.cursorSize * 0.6 * progress; // shrinks as it fades
          ctx.stroke();
        }
      }
      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', updateSize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [settings.cursorSize]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    lastMousePos.current = { x, y };
    pointsRef.current.push({ x, y, t: performance.now() });

    // Update cursor visually immediately (bypasses React state for 0 lag)
    if (cursorRef.current) {
      cursorRef.current.style.transform = `translate(${x - settings.cursorSize / 2}px, ${y - settings.cursorSize / 2}px)`;
    }

    // Check collision using the ref to avoid stale state / double hits
    const currentTarget = targetPosRef.current;
    if (currentTarget) {
      if (checkCollision(x, y, currentTarget.x, currentTarget.y)) {
        targetPosRef.current = null; // Immediately invalidate to prevent double hits
        if (settings.soundEnabled) playHitSound();
        const reactionTime = performance.now() - lastSpawnTime;
        const newTimes = [...timesRef.current, reactionTime];
        timesRef.current = newTimes;
        setTimes(newTimes);
        
        if (newTimes.length >= settings.targetCount) {
          onFinish(newTimes);
        } else {
          setTargetPos(null);
          spawnTarget();
        }
      }
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-slate-900 overflow-hidden cursor-none"
      onMouseMove={handleMouseMove}
    >
      <canvas 
        ref={canvasRef} 
        className="absolute top-0 left-0 w-full h-full pointer-events-none z-40"
      />

      <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-800/50 z-10">
        <div 
          className="h-full bg-emerald-500 transition-all duration-200 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]"
          style={{ width: `${(times.length / settings.targetCount) * 100}%` }}
        />
      </div>

      <div className="absolute top-4 right-4 text-slate-500 font-mono text-sm z-10 select-none">
        {times.length} / {settings.targetCount}
      </div>

      {targetPos && (
        <div 
          className="absolute rounded-full bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.4)] flex items-center justify-center"
          style={{
            width: settings.targetSize,
            height: settings.targetSize,
            left: targetPos.x - settings.targetSize / 2,
            top: targetPos.y - settings.targetSize / 2,
          }}
        >
          <div className="w-1/3 h-1/3 rounded-full bg-emerald-200/50" />
        </div>
      )}

      <div 
        ref={cursorRef}
        className="absolute top-0 left-0 rounded-full bg-rose-500 pointer-events-none z-50 shadow-[0_0_15px_rgba(244,63,94,0.6)] border-2 border-rose-300 flex items-center justify-center will-change-transform"
        style={{
          width: settings.cursorSize,
          height: settings.cursorSize,
          transform: 'translate(-1000px, -1000px)'
        }}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-white" />
      </div>
    </div>
  );
};

const Results = ({ times, onRestart }: { times: number[], onRestart: () => void }) => {
  const average = times.reduce((a, b) => a + b, 0) / times.length;
  const best = Math.min(...times);
  
  const chartData = times.map((time, index) => ({
    target: index + 1,
    time: Math.round(time)
  }));

  return (
    <div className="flex flex-col items-center justify-center h-full bg-slate-950 text-slate-200 p-4">
      <div className="max-w-4xl w-full p-6 md:p-8 bg-slate-900 rounded-2xl shadow-xl border border-slate-800 max-h-full overflow-y-auto custom-scrollbar">
        <h2 className="text-3xl md:text-4xl font-black text-center mb-2 text-emerald-400 tracking-tight uppercase">Training Complete</h2>
        <p className="text-center text-slate-400 mb-6 md:mb-10 font-medium text-sm md:text-base">Here is how you performed</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-10">
          <div className="bg-slate-800/40 p-4 md:p-6 rounded-2xl border border-slate-700/50 flex flex-col items-center justify-center">
            <span className="text-xs md:text-sm font-semibold text-slate-400 mb-1 md:mb-2 uppercase tracking-wider">Average</span>
            <span className="text-3xl md:text-4xl font-black text-emerald-400">{Math.round(average)}<span className="text-lg md:text-xl text-emerald-400/50 ml-1">ms</span></span>
          </div>
          <div className="bg-slate-800/40 p-4 md:p-6 rounded-2xl border border-slate-700/50 flex flex-col items-center justify-center">
            <span className="text-xs md:text-sm font-semibold text-slate-400 mb-1 md:mb-2 uppercase tracking-wider">Best</span>
            <span className="text-3xl md:text-4xl font-black text-emerald-400">{Math.round(best)}<span className="text-lg md:text-xl text-emerald-400/50 ml-1">ms</span></span>
          </div>
          <div className="bg-slate-800/40 p-4 md:p-6 rounded-2xl border border-slate-700/50 flex flex-col items-center justify-center">
            <span className="text-xs md:text-sm font-semibold text-slate-400 mb-1 md:mb-2 uppercase tracking-wider">Targets</span>
            <span className="text-3xl md:text-4xl font-black text-emerald-400">{times.length}</span>
          </div>
        </div>

        <div className="h-48 sm:h-64 md:h-72 w-full mb-6 md:mb-10 bg-slate-800/20 p-2 md:p-4 rounded-2xl border border-slate-800">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis 
                dataKey="target" 
                stroke="#64748b" 
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickLine={{ stroke: '#334155' }}
                axisLine={{ stroke: '#334155' }}
                tickMargin={10}
              />
              <YAxis 
                stroke="#64748b" 
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickLine={{ stroke: '#334155' }}
                axisLine={{ stroke: '#334155' }}
                unit="ms"
                tickMargin={10}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.75rem', color: '#f8fafc', padding: '12px' }}
                itemStyle={{ color: '#34d399', fontWeight: 'bold' }}
                labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
              />
              <Line 
                type="monotone" 
                dataKey="time" 
                name="Reaction Time"
                stroke="#34d399" 
                strokeWidth={3}
                dot={{ fill: '#0f172a', stroke: '#34d399', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#34d399', stroke: '#0f172a', strokeWidth: 2 }}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <button 
          onClick={onRestart}
          className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-lg rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] border border-slate-700"
        >
          <RotateCcw size={20} /> PLAY AGAIN
        </button>
      </div>
    </div>
  );
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [gameId, setGameId] = useState(0);
  const [settings, setSettings] = useState<GameSettings>({
    targetCount: 30,
    targetSize: 50,
    cursorSize: 20,
    soundEnabled: true,
    trailEnabled: true,
  });
  const [times, setTimes] = useState<number[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setGameState('menu');
      } else if (e.key.toLowerCase() === 'r') {
        if (gameState !== 'menu') {
          setGameId(prev => prev + 1);
          setGameState('playing');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  const handleStart = () => {
    setGameId(prev => prev + 1);
    setGameState('playing');
  };

  return (
    <div className="w-full h-screen bg-slate-950 overflow-hidden font-sans">
      <AnimatePresence mode="wait">
        {gameState === 'menu' && (
          <motion.div 
            key="menu"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <Menu 
              settings={settings} 
              setSettings={setSettings} 
              onStart={handleStart} 
            />
          </motion.div>
        )}
        
        {gameState === 'playing' && (
          <motion.div 
            key={`playing-${gameId}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <Game 
              settings={settings} 
              onFinish={(results) => {
                setTimes(results);
                setGameState('results');
              }} 
            />
          </motion.div>
        )}

        {gameState === 'results' && (
          <motion.div 
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <Results 
              times={times} 
              onRestart={handleStart} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
