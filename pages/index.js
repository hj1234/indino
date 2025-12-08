'use client';

import { useState, useEffect, useRef } from 'react'; // 1. Import useRef
import CancellationChart from '../components/CancellationChart';

const UPSTASH_URL = process.env.NEXT_PUBLIC_UPSTASH_URL;
const UPSTASH_TOKEN = process.env.NEXT_PUBLIC_UPSTASH_TOKEN;

const Counter = ({ end, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = null;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(ease * end));
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);
  return count;
};

export default function Home() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 2. Create a reference for the Chart Section
  const chartRef = useRef(null);

  // 3. The Scroll Function
  const scrollToChart = () => {
    chartRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!UPSTASH_URL) return;
    
    fetch(`${UPSTASH_URL}/get/flight_data`, {
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
      cache: 'no-store'
    })
    .then(res => res.json())
    .then(json => {
      if (json.result) {
        const parsed = typeof json.result === 'string' ? JSON.parse(json.result) : json.result;
        setData(parsed);
      }
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  return (
    <main className="h-[100dvh] w-full bg-slate-900 text-white flex flex-col overflow-hidden relative font-sans">
      {/* HEADER */}
      <header className="absolute top-0 left-0 w-full z-50 py-6 flex justify-center pointer-events-none">
        <div className="text-center animate-bounce-slow pointer-events-auto">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter transform -rotate-3 select-none drop-shadow-lg leading-none">
            <span className="text-indigo-400">Indi</span>
            <span className="text-rose-500">no</span>
            <span className="text-4xl align-top ml-2">✈️</span>
          </h1>
          <p className="text-[10px] md:text-xs font-mono text-indigo-300/60 -mt-1 tracking-[0.3em] uppercase">
            The Unofficial Tracker
          </p>
        </div>
      </header>

      {/* CONTENT */}
      <div className="flex-grow overflow-y-auto snap-y snap-mandatory scroll-smooth no-scrollbar">
        
        {/* SECTION 1: COUNTER */}
        <section className="h-[100dvh] w-full flex flex-col items-center justify-center snap-center relative p-4">
           <div className="text-center space-y-6 -mt-12">
            <h2 className="text-sm font-semibold text-indigo-200 uppercase tracking-widest bg-indigo-950/50 py-2 px-4 rounded-full border border-indigo-500/30">
              Indigo Daily Flight Cancellations
            </h2>

            {loading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="animate-pulse text-indigo-400 font-mono">Loading data...</div>
              </div>
            ) : data && data.current ? (
              <div className="animate-in fade-in zoom-in duration-700 py-4">
                <div className="relative">
                  <span className="text-[8rem] md:text-[12rem] leading-none font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-indigo-300 to-indigo-600 drop-shadow-2xl font-mono tabular-nums">
                    <Counter end={data.current.count} />
                  </span>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl -z-10"></div>
                </div>
                <div className="text-2xl md:text-3xl font-medium text-white mt-2">
                  {data.current.date}
                </div>
              </div>
            ) : (
              <div className="text-xl text-rose-300 py-10">No data available</div>
            )}
            
            {/* CLICKABLE CHEVRON */}
            <div 
              onClick={scrollToChart} 
              className="absolute bottom-24 left-0 w-full flex justify-center animate-bounce-4 cursor-pointer z-10 group"
            >
              <div className="w-12 h-12 rounded-full border border-indigo-500/30 bg-indigo-950/30 backdrop-blur-sm flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/10 transition-all duration-300 group-hover:bg-indigo-800 group-hover:border-indigo-400 group-hover:scale-110 group-active:scale-95">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: CHART (Target for scroll) */}
        <section 
          ref={chartRef}
          className="h-[100dvh] w-full flex flex-col items-center justify-center snap-center bg-slate-900/50 p-4 md:p-12 relative"
        >
          {data && data.history ? (
             <CancellationChart history={data.history} />
          ) : (
             <div className="text-slate-500">Loading chart data...</div>
          )}
        </section>

      </div>

      {/* FOOTER */}
      <footer className="absolute bottom-0 left-0 w-full py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] text-center pointer-events-none z-50">
        <div className="text-[10px] text-slate-600 max-w-md mx-auto px-4 pointer-events-auto bg-slate-900/80 backdrop-blur-md rounded-full py-1">
          Not affiliated with IndiGo. Data scraped from public records.
          <br/>
          {data && data.current ? `Last Update: ${new Date(data.current.updated_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : ''}
        </div>
      </footer>

    </main>
  );
}