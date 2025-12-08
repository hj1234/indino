'use client';


import { useState, useEffect} from 'react'; // 1. Import useRef
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend} from 'recharts';

// STATIC HISTORY (The old averages that never change)
const HISTORICAL_AVERAGES = [
  { label: '2022', count: 11, type: 'avg' },
  { label: '2023', count: 12, type: 'avg' },
  { label: '2024', count: 20, type: 'avg' },
  { label: 'Nov \'24', count: 40, type: 'avg' },
  { label: '', count: 0, type: 'spacer' }, // Gap
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 p-3 rounded shadow-xl text-xs z-50">
        <p className="text-slate-400 mb-1">{label}</p>
        <p className="text-white font-bold text-lg">
          {payload[0].value} <span className="text-xs font-normal text-slate-500">cancelled</span>
        </p>
      </div>
    );
  }
  return null;
};

const renderLegend = (props) => {
  return (
    <div className="flex justify-center gap-6 mt-2 text-xs text-slate-400 uppercase tracking-wider font-mono">
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 bg-slate-600 rounded-sm"></span> Historical Average
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 bg-rose-500 rounded-sm"></span> Recent Total
      </div>
    </div>
  );
};

export default function CancellationChart({ history = [] }) {
  const chartData = [...HISTORICAL_AVERAGES, ...history];
  
  // 1. Detect Mobile Screen
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Function to check width
    const checkScreen = () => setIsMobile(window.innerWidth < 768);
    
    // Check on load
    checkScreen();
    
    // Check on resize
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  return (
    <div className="w-full max-w-4xl h-[60vh] flex flex-col">
      <h3 className="text-xl md:text-2xl font-bold text-slate-200 mb-8 flex items-center gap-3">
        <span className="w-2 h-8 bg-rose-500 rounded-full block"></span>
        Recent Cancellations vs. Historical Averages
      </h3>
      
      <div className="flex-grow w-full bg-slate-800/30 rounded-2xl p-4 md:p-8 border border-slate-700/50 backdrop-blur-sm">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
            
            {/* 2. Modified XAxis with Conditional Logic */}
            <XAxis 
              dataKey="label" 
              axisLine={false} 
              tickLine={false} 
              interval={0} // Force all labels to show
              
              // If mobile: Rotate -90 degrees (vertical). If desktop: 0 degrees (horizontal)
              angle={isMobile ? -90 : 0} 
              
              // If mobile: Anchor text at the end so it aligns correctly when rotated
              textAnchor={isMobile ? 'end' : 'middle'} 
              
              // If mobile: Give it more height (60px) so the vertical text fits
              height={isMobile ? 60 : 30}
              
              // If mobile: Adjust Y position (dy) slightly
              dy={isMobile ? 5 : 10}
              
              tick={{ fill: '#64748b', fontSize: 10 }} 
            />
            
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 10 }} 
            />
            <Tooltip cursor={{ fill: 'transparent' }} content={<CustomTooltip />} />
            <Legend content={renderLegend} />

            <Bar dataKey="count" radius={[4, 4, 0, 0]} animationDuration={1500}>
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.type === 'avg' ? '#475569' : entry.type === 'spacer' ? 'transparent' : '#f43f5e'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}