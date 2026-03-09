import React, { useState } from 'react';
import { Sparkles, Search, Mic2, ArrowRight, Copy, Check, ExternalLink, AlertCircle, BrainCircuit, Zap, BookOpen } from 'lucide-react'; // <--- Added BookOpen
import { getSpeechAssistantResponse, getSalesCoachAdvice, SpeechResult } from '../geminiService.ts';
import { useProjects } from '../hooks/useProjects.ts';
import { WageSummary } from '../types.ts';

const COMMON_HURDLES = [
  "Enginn tími", "Enginn peningur", "Bara ekki áhuga", "Er þegar að styrkja", "Hringdu aftur", "Treysti ekki í síma"
];

export default function SpeechAssistant({ summary }: { summary: WageSummary }) {
  const { projects } = useProjects();
  const [project, setProject] = useState('');
  const [mode, setMode] = useState<'create' | 'search'>('create');
  const [selectedHurdles, setSelectedHurdles] = useState<string[]>([]);
  const [result, setResult] = useState<SpeechResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleScriptAction = async () => {
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await getSpeechAssistantResponse(mode, project);
      setResult(res);
    } catch (e: any) { setError('Villa við gagnaflutning.'); } finally { setLoading(false); }
  };

  const handleCoachAction = async () => {
    if (selectedHurdles.length === 0) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const text = await getSalesCoachAdvice(selectedHurdles);
      setResult({ text, sources: [] });
    } catch (e: any) { setError('MorriAI náði ekki sambandi.'); } finally { setLoading(false); }
  };

  const toggleHurdle = (hurdle: string) => {
    if (selectedHurdles.includes(hurdle)) setSelectedHurdles(selectedHurdles.filter(h => h !== hurdle));
    else setSelectedHurdles([...selectedHurdles, hurdle]);
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isMobile = window.innerWidth < 1024;

  return (
    <div className={`max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-500 pb-32`}>

      {/* --- MOBILE: TAB SWITCHER --- */}
      {isMobile && (
        <div className="flex bg-white/5 p-1 rounded-2xl mb-4">
          <button onClick={() => setResult(null)} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase ${!result ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>Verkfæri</button>
          <button onClick={() => { }} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase ${result ? 'bg-indigo-600 text-white' : 'text-slate-500 opacity-50'}`}>Svar</button>
        </div>
      )}

      {/* CONTROLS (Hidden on Mobile if Result exists) */}
      <div className={`lg:col-span-4 space-y-6 ${isMobile && result ? 'hidden' : 'block'}`}>

        {/* CARD 1: Script Generator */}
        <div className="glass p-6 md:p-8 rounded-[40px] border-white/10 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400"><Mic2 size={20} /></div>
            <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">Ræðuhjálp</h3>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
              {projects.map(p => (
                <button key={p} onClick={() => setProject(p)} className={`flex-shrink-0 px-4 py-2 rounded-xl text-[10px] font-black border transition-all ${project === p ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white/5 border-white/10 text-slate-500'}`}>{p}</button>
              ))}
            </div>

            <div className="flex gap-2">
              <button onClick={() => setMode('create')} className={`flex-1 p-3 rounded-2xl border text-xs font-bold text-center transition-all ${mode === 'create' ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400' : 'bg-white/5 border-white/5 text-slate-600'}`}>Söluræða</button>
              <button onClick={() => setMode('search')} className={`flex-1 p-3 rounded-2xl border text-xs font-bold text-center transition-all ${mode === 'search' ? 'bg-violet-500/20 border-violet-500/50 text-violet-400' : 'bg-white/5 border-white/5 text-slate-600'}`}>Upplýsingar</button>
            </div>

            <button onClick={handleScriptAction} disabled={loading} className="w-full py-4 gradient-bg rounded-[24px] text-white font-black text-sm shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all">
              {loading ? "Vinn..." : "Sækja"} <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* CARD 2: Daily Hurdles Coach */}
        <div className="glass p-6 md:p-8 rounded-[40px] border-amber-500/20 shadow-xl relative overflow-hidden">
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400"><BrainCircuit size={20} /></div>
            <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">Þjálfari</h3>
          </div>

          <div className="space-y-4 relative z-10">
            <div className="flex flex-wrap gap-2">
              {COMMON_HURDLES.map(hurdle => (
                <button key={hurdle} onClick={() => toggleHurdle(hurdle)} className={`px-3 py-2 rounded-xl text-[10px] font-bold border transition-all ${selectedHurdles.includes(hurdle) ? 'bg-amber-500 text-slate-900 border-amber-500' : 'bg-white/5 border-white/10 text-slate-500'}`}>{hurdle}</button>
              ))}
            </div>
            <button onClick={handleCoachAction} disabled={loading || selectedHurdles.length === 0} className="w-full py-4 bg-amber-500 text-slate-900 rounded-[24px] font-black text-sm shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all">
              <Zap size={16} fill="currentColor" /> Fá Ráð
            </button>
          </div>
        </div>
      </div>

      {/* RESULTS (Only visible if result exists on mobile) */}
      <div className={`lg:col-span-8 ${isMobile && !result ? 'hidden' : 'block'}`}>
        <div className="glass h-full min-h-[400px] rounded-[48px] border-white/10 p-8 flex flex-col relative overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl ${selectedHurdles.length > 0 && result && !result.sources ? 'bg-amber-500/20 text-amber-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                {selectedHurdles.length > 0 && result && !result.sources ? <BrainCircuit size={20} /> : <Sparkles size={20} />}
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase italic">Svar</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase">{project}</p>
              </div>
            </div>
            {result && <button onClick={handleCopy} className="p-3 bg-white/5 rounded-xl text-white"><Copy size={18} /></button>}
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {error && <div className="p-4 bg-rose-500/10 rounded-2xl text-rose-400 text-xs font-bold">{error}</div>}

            {result ? (
              <div className="space-y-4">
                {result.text.split('\n').map((line, i) => {
                  if (!line.trim()) return null;
                  return <div key={i} className="text-slate-200 text-sm leading-relaxed p-4 rounded-2xl bg-white/5 border border-white/5">{line}</div>;
                })}
                {result.sources && result.sources.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-white/5">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase mb-3">Heimildir</h4>
                    <div className="grid gap-2">
                      {result.sources.map((src, idx) => (
                        <a key={idx} href={src.uri} target="_blank" className="flex items-center justify-between p-3 rounded-xl bg-white/5 text-[10px] font-bold text-slate-400"><span className="truncate">{src.title}</span><ExternalLink size={12} /></a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : !loading && (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                <BookOpen size={48} className="mb-4 text-white" />
                <p className="text-xs font-bold text-white uppercase">Veldu aðgerð</p>
              </div>
            )}

            {loading && <div className="h-full flex items-center justify-center"><div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" /></div>}
          </div>
        </div>
      </div>
    </div>
  );
}
