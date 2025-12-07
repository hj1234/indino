'use client';

import { useState, useEffect, useRef } from 'react';

// REPLACE THESE WITH YOUR KEYS 
const UPSTASH_URL = process.env.NEXT_PUBLIC_UPSTASH_URL;
const UPSTASH_TOKEN = process.env.NEXT_PUBLIC_UPSTASH_TOKEN;

// --- ANIMATED COUNTER COMPONENT ---
// This handles the smooth "rolling up" animation
const Counter = ({ end, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Easing function for smooth deceleration (easeOutExpo)
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setCount(Math.floor(easeProgress * end));
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return count;
};

export default function Home() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${UPSTASH_URL}/get/flight_data`, {
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` }
    })
    .then(res => res.json())
    .then(json => {
      if (json.result) {
        // Handle both stringified JSON or direct object
        const parsedData = typeof json.result === 'string' 
          ? JSON.parse(json.result) 
          : json.result;
        setData(parsedData);
      }
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-slate-900 text-white p-4 overflow-hidden">
      
      {/* --- BRANDING HEADER --- */}
      <div className="absolute top-12 animate-bounce-slow">
        <h1 className="text-6xl font-black tracking-tighter transform -rotate-3 select-none">
          <span className="text-indigo-400">Indi</span>
          <span className="text-rose-500">no</span>
          <span className="text-4xl align-top ml-2">✈️</span>
        </h1>
        <p className="text-xs font-mono text-center text-indigo-300/60 mt-2 tracking-widest uppercase">
          The Unofficial Tracker
        </p>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="text-center space-y-6 mt-10">
        <h2 className="text-sm font-semibold text-indigo-200 uppercase tracking-widest bg-indigo-950/50 py-2 px-4 rounded-full border border-indigo-500/30">
          Indigo Daily Flight Cancellations
        </h2>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse text-indigo-400 font-mono">Loading stats...</div>
          </div>
        ) : data ? (
          <div className="animate-in fade-in zoom-in duration-700 py-8">
            
            {/* The Count (Animated) */}
            <div className="relative">
              <span className="text-[10rem] leading-none font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-indigo-300 to-indigo-600 drop-shadow-2xl font-mono tabular-nums">
                {/* We use the Counter component here */}
                <Counter end={data.count} />
              </span>
              
              {/* Decorative background blur */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl -z-10"></div>
            </div>

            {/* The Date */}
            <div className="text-3xl font-medium text-white mt-2">
              {data.date}
            </div>
            
            <div className="text-xs text-slate-500 mt-12 font-mono">
               Last Update: {new Date(data.updated_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </div>
          </div>
        ) : (
          <div className="text-xl text-rose-300 py-10">
            No data found yet.
          </div>
        )}
      </div>

      {/* Footer / Disclaimer */}
      <div className="fixed bottom-4 text-[10px] text-slate-600 max-w-xs text-center">
        Not affiliated with IndiGo. Data based on public records.
      </div>
    </main>
  );
}