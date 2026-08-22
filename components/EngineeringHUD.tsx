'use client';

import { Activity, Code, GitCommit, Play, Cpu, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';

export function EngineeringHUD() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false }) + '.' + now.getMilliseconds().toString().padStart(3, '0'));
    }, 50);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 p-6 flex flex-col justify-between font-jetbrains">
      
      {/* Top HUD */}
      <div className="hidden 2xl:flex justify-between items-start">
        <div className="glass-panel p-4 w-64 pointer-events-auto transition-transform hover:scale-105">
          <div className="flex items-center gap-3 mb-4">
            <Cpu className="text-primary w-5 h-5 animate-pulse" />
            <h3 className="text-xs font-bold text-white uppercase tracking-widest">System Core</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted">OS</span>
              <span className="text-accent">HowardOS v2.0</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted">UPTIME</span>
              <span className="text-primary">{time}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted">STATUS</span>
              <span className="text-green-400">ONLINE</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-4 w-64 text-right pointer-events-auto transition-transform hover:scale-105">
           <div className="flex items-center justify-end gap-3 mb-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest">Live Activity</h3>
            <Activity className="text-accent w-5 h-5" />
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-end gap-2 text-white">
              <span className="text-muted">Focus:</span> Building 3D Portfolio
            </div>
            <div className="flex justify-end items-center gap-2 text-white mt-2">
              <Play className="w-3 h-3 text-green-500" /> 
              <span>Spotify: Interstellar OST</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom HUD */}
      <div className="flex justify-between items-end">
        <div className="glass-panel p-4 pointer-events-auto flex items-center gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">1.2k</p>
            <p className="text-[10px] uppercase tracking-widest text-muted mt-1 flex items-center gap-1 justify-center">
              <GitCommit className="w-3 h-3" /> Commits
            </p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <p className="text-2xl font-bold text-accent">15+</p>
            <p className="text-[10px] uppercase tracking-widest text-muted mt-1 flex items-center gap-1 justify-center">
              <Code className="w-3 h-3" /> Projects
            </p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <p className="text-2xl font-bold text-[#8B5CF6]">4</p>
            <p className="text-[10px] uppercase tracking-widest text-muted mt-1 flex items-center gap-1 justify-center">
              <Trophy className="w-3 h-3" /> Hackathons
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[10px] uppercase tracking-[0.5em] text-muted mb-2">Scroll to initialize</p>
          <div className="w-[1px] h-16 bg-gradient-to-b from-primary to-transparent ml-auto animate-pulse" />
        </div>
      </div>

    </div>
  );
}
