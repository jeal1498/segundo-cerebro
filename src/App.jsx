import React, { useState, useEffect, useRef, memo, useMemo, useCallback } from "react";

// ===================== THEME =====================
const T = {
  bg: '#090e13', surface: '#0f1923', surface2: '#162030',
  border: '#1e2d3d', borderLight: '#243447',
  accent: '#00c896', accentHover: '#00e0a8',
  text: '#e2eaf4', muted: '#6b8299', dim: '#3a5068',
  green: '#00c896', red: '#ff5c5c', blue: '#4da6ff',
  purple: '#a78bfa', orange: '#ff8c42', yellow: '#ffd166', teal: '#00e0a8',
  userBubble: '#00c896', userText: '#000',
  areaColors: ['#4da6ff','#00c896','#ff8c42','#a78bfa','#ff5c5c','#00e0a8','#ffd166','#ff6b8a'],
};

// ===================== RESPONSIVE HOOK =====================
// App is mobile-only — always true, no window access needed
const useIsMobile = () => true;

// ===================== STORAGE =====================
// Uses localStorage as primary (works everywhere: Vercel, browsers, etc.)
// Also syncs to window.storage when available (Claude.ai artifact env)
const save = async (key, val) => {
  const str = JSON.stringify(val);
  try { localStorage.setItem(key, str); } catch(e) {}
  try { await window.storage?.set(key, str); } catch(e) {}
};
const load = async (key, def) => {
  try {
    const r = await window.storage?.get(key);
    if (r?.value) return JSON.parse(r.value);
  } catch(e) {}
  try {
    const item = localStorage.getItem(key);
    if (item) return JSON.parse(item);
  } catch(e) {}
  return def;
};

// ===================== ICONS =====================
const Icon = ({ name, size = 18, color, ariaLabel }) => {
  const icons = {
    brain: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color||'currentColor'} strokeWidth="1.8"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.44-4.44 2.5 2.5 0 0 1 0-3.1 2.5 2.5 0 0 1 2.44-4.5A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.44-4.44 2.5 2.5 0 0 0 0-3.1 2.5 2.5 0 0 0-2.44-4.5A2.5 2.5 0 0 0 14.5 2Z"/></svg>,
    grid: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color||'currentColor'} strokeWidth="1.8"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    target: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color||'currentColor'} strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
    folder: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color||'currentColor'} strokeWidth="1.8"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
    check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color||'currentColor'} strokeWidth="1.8"><polyline points="20 6 9 17 4 12"/></svg>,
    note: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color||'currentColor'} strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    inbox: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color||'currentColor'} strokeWidth="1.8"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>,
    habit: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color||'currentColor'} strokeWidth="1.8"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>,
    ai: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color||'currentColor'} strokeWidth="1.8"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    plus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color||'currentColor'} strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    trash: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color||'currentColor'} strokeWidth="1.8"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
    send: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color||'currentColor'} strokeWidth="1.8"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
    x: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color||'currentColor'} strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    back: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color||'currentColor'} strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>,
    home: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color||'currentColor'} strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    menu: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color||'currentColor'} strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
    mic: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color||'currentColor'} strokeWidth="1.8"><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>,
    micoff: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color||'currentColor'} strokeWidth="1.8"><line x1="2" y1="2" x2="22" y2="22"/><rect x="9" y="2" width="6" height="11" rx="3" clipPath="url(#cut)"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12"/><path d="M19 10a7 7 0 0 1-.32 2.09"/><path d="M5 10a7 7 0 0 0 11.95 5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>,
    image: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color||'currentColor'} strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
    cog: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color||'currentColor'} strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    key: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color||'currentColor'} strokeWidth="1.8"><circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2l-9.6 9.6"/><path d="M15.5 7.5l3 3L21 8l-3-3"/></svg>,
    checkCircle: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color||'currentColor'} strokeWidth="1.8"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
    journal: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color||'currentColor'} strokeWidth="1.8"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
    book: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color||'currentColor'} strokeWidth="1.8"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
    cart: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color||'currentColor'} strokeWidth="1.8"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
    graduation: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color||'currentColor'} strokeWidth="1.8"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
    star: <svg width={size} height={size} viewBox="0 0 24 24" fill={color||'currentColor'} stroke={color||'currentColor'} strokeWidth="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    starEmpty: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color||'currentColor'} strokeWidth="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    people: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color||'currentColor'} strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    health: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color||'currentColor'} strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
    money: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color||'currentColor'} strokeWidth="1.8"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
    rocket: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color||'currentColor'} strokeWidth="1.8"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>,
    car: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color||'currentColor'} strokeWidth="1.8"><path d="M5 17H3v-5l2-5h14l2 5v5h-2"/><path d="M5 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0z"/><path d="M15 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0z"/><path d="M5 12h14"/></svg>,
  };
  return <span style={{display:'inline-flex',alignItems:'center'}} aria-hidden={!ariaLabel} aria-label={ariaLabel||undefined} role={ariaLabel?'img':undefined}>{icons[name]||null}</span>;
};

// ===================== HELPERS =====================
const uid = () => Math.random().toString(36).slice(2,10);
const today = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
const fmt = (d) => d ? new Date(d).toLocaleDateString('es-ES',{day:'2-digit',month:'short'}) : '';

// ===================== MARKDOWN RENDERER =====================
const renderMd = (text='') => text
  .replace(/\[\[([^\]]+)\]\]/g,'<span class="backlink" data-backlink="$1" style="color:#a78bfa;cursor:pointer;text-decoration:underline;font-weight:500;border-radius:3px;padding:0 2px" title="Ir a: $1">$1</span>')
  .replace(/^### (.+)$/gm,'<h3 style="font-size:14px;font-weight:700;color:#e2eaf4;margin:10px 0 4px">$1</h3>')
  .replace(/^## (.+)$/gm,'<h2 style="font-size:16px;font-weight:700;color:#e2eaf4;margin:12px 0 6px">$1</h2>')
  .replace(/^# (.+)$/gm,'<h1 style="font-size:19px;font-weight:800;color:#e2eaf4;margin:0 0 8px">$1</h1>')
  .replace(/\*\*(.+?)\*\*/g,'<strong style="color:#e2eaf4;font-weight:700">$1</strong>')
  .replace(/\*(.+?)\*/g,'<em style="color:#a0b4c8;font-style:italic">$1</em>')
  .replace(/^- \[ \] (.+)$/gm,'<div style="display:flex;gap:8px;align-items:flex-start;margin:3px 0"><input type="checkbox" style="margin-top:3px;accent-color:#00c896"/><span style="color:#c4d4e3;font-size:14px">$1</span></div>')
  .replace(/^- \[x\] (.+)$/gm,'<div style="display:flex;gap:8px;align-items:flex-start;margin:3px 0"><input type="checkbox" checked style="margin-top:3px;accent-color:#00c896"/><span style="color:#6b8299;text-decoration:line-through;font-size:14px">$1</span></div>')
  .replace(/^- (.+)$/gm,'<div style="display:flex;gap:8px;margin:3px 0"><span style="color:#00c896;margin-top:2px">•</span><span style="color:#c4d4e3;font-size:14px">$1</span></div>')
  .replace(/^(\d+)\. (.+)$/gm,'<div style="display:flex;gap:8px;margin:3px 0"><span style="color:#6b8299;font-size:12px;min-width:16px;margin-top:2px">$1.</span><span style="color:#c4d4e3;font-size:14px">$2</span></div>')
  .replace(/\n/g,'<br/>');

// ===================== RING CHART =====================
const Ring = ({pct:p,color,size=52,stroke=5,label,sublabel}) => {
  const r=(size-stroke*2)/2;
  const circ=2*Math.PI*r;
  const dash=circ*((p||0)/100);
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
      <svg width={size} height={size} style={{transform:'rotate(-90deg)',flexShrink:0}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.border} strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{transition:'stroke-dasharray 0.6s ease'}}/>
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
          fill={T.text} fontSize={size<50?9:10} fontWeight="700"
          style={{transform:'rotate(90deg)',transformOrigin:'center'}}>
          {p||0}%
        </text>
      </svg>
      {label&&<div style={{fontSize:9,color:T.muted,textAlign:'center',maxWidth:54,lineHeight:1.2}}>{label}</div>}
      {sublabel&&<div style={{fontSize:9,color:color,fontWeight:700}}>{sublabel}</div>}
    </div>
  );
};

// ===================== BALANCE MINI-CHART =====================
const BalanceSparkline = ({transactions}) => {
  const months=[];
  const now=new Date();
  for(let i=5;i>=0;i--){
    const d=new Date(now.getFullYear(),now.getMonth()-i,1);
    const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    const label=d.toLocaleDateString('es-ES',{month:'short'});
    const month=(transactions||[]).filter(t=>t.date?.slice(0,7)===key);
    const income=month.filter(t=>t.type==='ingreso').reduce((s,t)=>s+(t.amount||0),0);
    const expense=month.filter(t=>t.type==='egreso').reduce((s,t)=>s+(t.amount||0),0);
    months.push({label,income,expense,key});
  }
  const max=Math.max(...months.flatMap(m=>[m.income,m.expense]),1);
  return (
    <div style={{display:'flex',gap:5,alignItems:'flex-end',height:52}}>
      {months.map((m,i)=>{
        const iH=Math.max((m.income/max)*44,m.income>0?3:0);
        const eH=Math.max((m.expense/max)*44,m.expense>0?3:0);
        const isCurrent=i===5;
        return (
          <div key={m.key} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
            <div style={{display:'flex',gap:1.5,alignItems:'flex-end',height:44}}>
              <div style={{width:5,height:iH,background:T.accent,borderRadius:'2px 2px 0 0',opacity:isCurrent?1:0.6,transition:'height 0.4s ease'}}/>
              <div style={{width:5,height:eH,background:T.red,borderRadius:'2px 2px 0 0',opacity:isCurrent?1:0.6,transition:'height 0.4s ease'}}/>
            </div>
            <div style={{fontSize:8,color:isCurrent?T.accent:T.dim,fontWeight:isCurrent?700:400}}>{m.label}</div>
          </div>
        );
      })}
    </div>
  );
};

// ===================== HABIT HEATMAP =====================
const HabitHeatmap = ({completions,color}) => {
  const days=Array.from({length:35},(_,i)=>{
    const d=new Date();d.setDate(d.getDate()-(34-i));
    const str=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    return {str,done:(completions||[]).includes(str)};
  });
  return (
    <div style={{display:'flex',flexWrap:'wrap',gap:3}}>
      {days.map((d,i)=>(
        <div key={i} title={d.str}
          style={{width:10,height:10,borderRadius:2,
            background:d.done?color:T.border,
            opacity:d.done?0.9:0.35,transition:'background 0.2s'}}/>
      ))}
    </div>
  );
};

// ===================== SPARKLINE =====================
const Sparkline = ({data,color,width=260,height=56,filled=false}) => {
  if(!data||data.length<2) return null;
  const vals=data.map(d=>typeof d==='object'?(d.value??d.v??0):d);
  const min=Math.min(...vals),max=Math.max(...vals);
  const range=max-min||1;
  const pts=vals.map((v,i)=>{
    const x=(i/(vals.length-1))*width;
    const y=height-((v-min)/range)*(height-8)-4;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const pathD=`M ${pts.join(' L ')}`;
  const fillD=`M 0,${height} L ${pts.join(' L ')} L ${width},${height} Z`;
  const lastPt=pts[pts.length-1].split(',');
  return (
    <svg width={width} height={height} style={{overflow:'visible',display:'block'}}>
      {filled&&<path d={fillD} fill={`${color}20`}/>}
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={lastPt[0]} cy={lastPt[1]} r="3" fill={color}/>
    </svg>
  );
};

// ===================== BALANCE BAR CHART =====================
const BalanceBarChart = ({months,height=90}) => {
  const max=Math.max(...months.flatMap(m=>[m.income||0,m.expense||0]),1);
  return (
    <div style={{display:'flex',gap:5,alignItems:'flex-end',height}}>
      {months.map((m,i)=>{
        const iH=Math.max(((m.income||0)/max)*(height-18),m.income>0?3:0);
        const eH=Math.max(((m.expense||0)/max)*(height-18),m.expense>0?3:0);
        const isCur=i===months.length-1;
        return (
          <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
            <div style={{display:'flex',gap:2,alignItems:'flex-end',height:height-18}}>
              <div style={{width:8,height:iH,background:T.accent,borderRadius:'3px 3px 0 0',opacity:isCur?1:0.55,transition:'height 0.5s'}} title={`Ingresos: $${(m.income||0).toLocaleString()}`}/>
              <div style={{width:8,height:eH,background:T.red,borderRadius:'3px 3px 0 0',opacity:isCur?1:0.55,transition:'height 0.5s'}} title={`Egresos: $${(m.expense||0).toLocaleString()}`}/>
            </div>
            <div style={{fontSize:9,color:isCur?T.accent:T.dim,fontWeight:isCur?700:400,textAlign:'center'}}>{m.label}</div>
          </div>
        );
      })}
    </div>
  );
};

// ===================== METRIC TREND CHART =====================
const MetricTrendChart = ({data:pts,color,goal,unit,width=340,height=130}) => {
  const [hoverIdx,setHoverIdx]=useState(null);
  if(!pts||pts.length<2) return null;
  const vals=pts.map(p=>p.value);
  const minV=Math.min(...vals);
  const maxV=Math.max(...vals,goal??-Infinity);
  const range=maxV-minV||1;
  const PAD={t:18,r:10,b:26,l:38};
  const W=width-PAD.l-PAD.r;
  const H=height-PAD.t-PAD.b;
  const xS=i=>PAD.l+(i/(pts.length-1))*W;
  const yS=v=>PAD.t+H-((v-minV)/range)*H;
  const pathD=pts.map((p,i)=>`${i===0?'M':'L'} ${xS(i).toFixed(1)} ${yS(p.value).toFixed(1)}`).join(' ');
  const fillD=`M ${xS(0).toFixed(1)} ${(PAD.t+H).toFixed(1)} ${pts.map((p,i)=>`L ${xS(i).toFixed(1)} ${yS(p.value).toFixed(1)}`).join(' ')} L ${xS(pts.length-1).toFixed(1)} ${(PAD.t+H).toFixed(1)} Z`;
  const goalY=goal!=null?yS(Math.min(Math.max(goal,minV),maxV)):null;
  const fmtV=v=>unit==='pasos'?Number(v).toLocaleString():Number(v).toFixed(unit==='h'?1:1);
  const xLabels=[0,Math.floor((pts.length-1)/2),pts.length-1].map(i=>({i,x:xS(i),label:pts[i]?.date?.slice(5)||''}));
  const yTicks=[minV,minV+(maxV-minV)/2,maxV];
  const hover=hoverIdx!=null?pts[hoverIdx]:null;
  return (
    <div style={{position:'relative',width,userSelect:'none'}}>
      <svg width={width} height={height} style={{overflow:'visible',display:'block'}}
        onMouseLeave={()=>setHoverIdx(null)}>
        {/* Area fill */}
        <path d={fillD} fill={`${color}12`}/>
        {/* Subtle grid lines */}
        {yTicks.map((v,i)=>(
          <line key={i} x1={PAD.l} y1={yS(v).toFixed(1)} x2={PAD.l+W} y2={yS(v).toFixed(1)}
            stroke={T.border} strokeWidth="0.8" strokeDasharray="3 4"/>
        ))}
        {/* Goal line */}
        {goalY!=null&&(
          <>
            <line x1={PAD.l} y1={goalY.toFixed(1)} x2={PAD.l+W} y2={goalY.toFixed(1)}
              stroke={color} strokeWidth="1.2" strokeDasharray="5 3" opacity="0.55"/>
            <text x={PAD.l+W} y={goalY-5} fill={color} fontSize="8" textAnchor="end" opacity="0.8" fontWeight="600">meta</text>
          </>
        )}
        {/* Main line */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        {/* Data points + invisible hover rects */}
        {pts.map((p,i)=>(
          <g key={i}>
            <circle cx={xS(i).toFixed(1)} cy={yS(p.value).toFixed(1)}
              r={hoverIdx===i?5:i===pts.length-1?3.5:2}
              fill={hoverIdx===i||i===pts.length-1?color:`${color}70`}
              style={{transition:'r 0.1s'}}/>
            <rect x={(xS(i)-10).toFixed(1)} y={PAD.t} width={20} height={H}
              fill="transparent" style={{cursor:'crosshair'}}
              onMouseEnter={()=>setHoverIdx(i)}/>
          </g>
        ))}
        {/* Y-axis labels */}
        {[{v:maxV,y:PAD.t+6},{v:minV,y:PAD.t+H+1}].map(({v,y},i)=>(
          <text key={i} x={PAD.l-5} y={y} fill={T.dim} fontSize="8.5" textAnchor="end">{fmtV(v)}</text>
        ))}
        {/* X-axis labels */}
        {xLabels.map(({x,label,i:idx})=>(
          <text key={idx} x={x.toFixed(1)} y={height-4} fill={T.dim} fontSize="8.5" textAnchor="middle">{label}</text>
        ))}
      </svg>
      {/* Hover tooltip */}
      {hover&&hoverIdx!=null&&(
        <div style={{
          position:'absolute',
          left:Math.min(xS(hoverIdx)+10,width-100),
          top:Math.max(yS(hover.value)-42,0),
          background:T.surface2,border:`1px solid ${color}50`,borderRadius:8,
          padding:'5px 10px',pointerEvents:'none',fontSize:11,
          boxShadow:'0 3px 14px rgba(0,0,0,0.45)',zIndex:10,whiteSpace:'nowrap',
        }}>
          <div style={{fontWeight:800,color,lineHeight:1.2}}>{fmtV(hover.value)} {unit}</div>
          <div style={{color:T.muted,fontSize:9,marginTop:2}}>{hover.date}</div>
        </div>
      )}
    </div>
  );
};

// ===================== HABIT WEEKLY BARS =====================
const HabitWeeklyBars = ({habit,color}) => {
  if((habit.frequency||'daily')!=='daily') return null;
  const weeks=Array.from({length:4},(_,wi)=>{
    const endDate=new Date();
    endDate.setDate(endDate.getDate()-wi*7);
    const days=Array.from({length:7},(_,di)=>{
      const d=new Date(endDate);
      d.setDate(endDate.getDate()-di);
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    });
    const done=days.filter(d=>habit.completions.includes(d)).length;
    const pct=Math.round(done/7*100);
    const endLabel=endDate.toLocaleDateString('es-ES',{month:'short',day:'numeric'});
    return {done,pct,label:`Sem ${4-wi}`,endLabel};
  }).reverse();

  return (
    <div style={{marginTop:14,paddingTop:12,borderTop:`1px solid ${T.border}`}}>
      <div style={{fontSize:10,color:T.muted,fontWeight:700,marginBottom:10,textTransform:'uppercase',letterSpacing:0.8}}>
        Rendimiento por semana
      </div>
      <div style={{display:'flex',gap:6,alignItems:'flex-end',height:72}}>
        {weeks.map((w,i)=>{
          const barH=Math.max(Math.round(w.pct/100*46),w.pct>0?3:0);
          const barColor=w.pct>=70?T.green:w.pct>=40?T.orange:w.pct>0?T.red:T.border;
          const isCur=i===weeks.length-1;
          return (
            <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
              <div style={{fontSize:11,fontWeight:700,color:w.pct>0?barColor:T.dim,lineHeight:1}}>
                {w.pct>0?`${w.pct}%`:'—'}
              </div>
              <div style={{
                width:'100%',height:barH||3,borderRadius:'4px 4px 0 0',
                background:barColor,opacity:isCur?1:0.7,
                transition:'height 0.45s ease',
              }}/>
              <div style={{height:1,width:'100%',background:T.border}}/>
              <div style={{fontSize:10,color:isCur?color:T.dim,fontWeight:isCur?700:400}}>{w.label}</div>
              <div style={{fontSize:9,color:T.dim}}>{w.done}/7d</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ===================== HORIZONTAL BAR =====================
const HBar = ({label,value,total,color,amount,fmtCurrency}) => {
  const pct=total>0?(value/total)*100:0;
  const fmt=fmtCurrency||(n=>`$${Number(n).toLocaleString('es-MX',{minimumFractionDigits:0,maximumFractionDigits:0})}`);
  return (
    <div style={{marginBottom:11}}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
        <span style={{fontSize:12,color:T.muted}}>{label}</span>
        <div style={{display:'flex',gap:10}}>
          <span style={{fontSize:11,color:T.dim}}>{pct.toFixed(0)}%</span>
          <span style={{fontSize:12,color,fontWeight:600}}>{fmt(amount)}</span>
        </div>
      </div>
      <div style={{height:6,background:T.border,borderRadius:3,overflow:'hidden'}}>
        <div style={{height:'100%',width:`${pct}%`,background:color,borderRadius:3,transition:'width 0.6s ease'}}/>
      </div>
    </div>
  );
};

// ===================== INITIAL DATA =====================
const initData = () => ({
  areas:[
    {id:uid(),name:'Salud',color:T.areaColors[1],icon:'💪'},
    {id:uid(),name:'Trabajo',color:T.areaColors[0],icon:'💼'},
    {id:uid(),name:'Finanzas',color:T.areaColors[2],icon:'💰'},
    {id:uid(),name:'Hogar',color:T.areaColors[3],icon:'🏠'},
    {id:uid(),name:'Desarrollo Personal',color:T.areaColors[4],icon:'🧠'},
    {id:uid(),name:'Relaciones',color:T.areaColors[5],icon:'👥'},
    {id:uid(),name:'Side Projects',color:T.areaColors[6],icon:'🚀'},
  ],
  objectives:[{id:uid(),title:'Correr una maratón',areaId:'',deadline:'2026-12-31',status:'active'}],
  projects:[],tasks:[],
  notes:[{id:uid(),title:'Cómo funciona el Segundo Cerebro',content:'El Segundo Cerebro es un sistema para externalizar nuestra memoria y liberar carga cognitiva. Basado en el método de Tiago Forte: Áreas → Objetivos → Proyectos → Tareas.',tags:['productividad','sistema'],areaId:'',createdAt:today()}],
  inbox:[{id:uid(),content:'Revisar el sistema de Segundo Cerebro',createdAt:today(),processed:false}],
  habits:[
    {id:uid(),name:'Meditar 10 min',frequency:'daily',completions:[]},
    {id:uid(),name:'Leer 30 min',frequency:'daily',completions:[]},
    {id:uid(),name:'Ejercicio',frequency:'daily',completions:[]},
  ],
  budget:[],
  transactions:[],
  healthMetrics:[],
  healthGoals:{peso:75,sueño:8,pasos:10000,agua:2,entrenosSem:4},
  medications:[],
  workouts:[],
  maintenances:[],
  homeDocs:[],
  homeContacts:[],
  learnings:[],
  retros:[],
  ideas:[],
  people:[],
  followUps:[],
  interactions:[],
  sideProjects:[],
  spTasks:[],
  milestones:[],
  spTimeLogs:[],
  journal:[],
  books:[],
  shopping:[{id:uid(),name:'Leche',qty:2,unit:'L',category:'Lácteos',done:false,createdAt:today()},{id:uid(),name:'Pan integral',qty:1,unit:'pza',category:'Panadería',done:false,createdAt:today()}],
  education:[],
  carMaintenances:[],
  carExpenses:[],
  carDocs:[],
  carReminders:[],
  carInfo:{brand:'',model:'',year:'',plate:'',km:'',fuelType:'gasolina',fuelType1:'',fuelType2:''},
  vehicles:[],
  activeVehicleId:null,
});

// ===================== BASE COMPONENTS =====================
const Modal = ({title,onClose,children}) => (
  <div role="dialog" aria-modal="true" aria-label={title} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',zIndex:200,display:'flex',alignItems:'flex-end',justifyContent:'center',backdropFilter:'blur(4px)'}}
    onClick={e=>e.target===e.currentTarget&&onClose()}>
    <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:'16px 16px 0 0',padding:24,width:'100%',maxWidth:520,boxShadow:'0 -8px 40px rgba(0,0,0,0.5)',maxHeight:'90vh',overflowY:'auto'}}>
      <div style={{width:36,height:4,background:T.border,borderRadius:2,margin:'0 auto 20px'}}/>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <h3 style={{margin:0,color:T.text,fontSize:16,fontWeight:600}}>{title}</h3>
        <button onClick={onClose} aria-label="Cerrar" style={{background:'none',border:'none',color:T.muted,cursor:'pointer',padding:4,display:'flex'}}><Icon name="x" size={18}/></button>
      </div>
      {children}
    </div>
  </div>
);

const Input = ({value,onChange,placeholder,style={},type='text',...p}) => (
  <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
    style={{width:'100%',background:T.bg,border:`1px solid ${T.border}`,color:T.text,padding:'10px 14px',borderRadius:10,fontSize:15,outline:'none',boxSizing:'border-box',...style}} {...p}/>
);

const Textarea = ({value,onChange,placeholder,rows=4}) => (
  <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows}
    style={{width:'100%',background:T.bg,border:`1px solid ${T.border}`,color:T.text,padding:'10px 14px',borderRadius:10,fontSize:15,outline:'none',resize:'vertical',fontFamily:'inherit',boxSizing:'border-box'}}/>
);

const Select = ({value,onChange,children,style={}}) => (
  <select value={value} onChange={e=>onChange(e.target.value)}
    style={{background:T.bg,border:`1px solid ${T.border}`,color:T.text,padding:'10px 14px',borderRadius:10,fontSize:15,outline:'none',width:'100%',...style}}>
    {children}
  </select>
);

const Btn = ({onClick,children,variant='primary',size='md',style={}}) => {
  const base={border:'none',cursor:'pointer',borderRadius:10,fontWeight:600,display:'inline-flex',alignItems:'center',gap:6,fontFamily:'inherit',...style};
  const v={
    primary:{background:T.accent,color:'#000',padding:size==='sm'?'6px 12px':'10px 18px',fontSize:size==='sm'?12:14},
    ghost:{background:'transparent',color:T.muted,padding:size==='sm'?'6px 12px':'10px 18px',fontSize:size==='sm'?12:14,border:`1px solid ${T.border}`},
    danger:{background:'rgba(248,81,73,0.15)',color:T.red,padding:size==='sm'?'6px 12px':'10px 18px',fontSize:size==='sm'?12:14,border:`1px solid rgba(248,81,73,0.3)`},
  };
  return <button onClick={onClick} style={{...base,...v[variant]}}>{children}</button>;
};

const Tag = ({text,color}) => (
  <span style={{background:`${color||T.accent}22`,color:color||T.accent,padding:'3px 10px',borderRadius:20,fontSize:12,fontWeight:500}}>{text}</span>
);

const Card = ({children,style={},onClick}) => (
  <div onClick={onClick} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:16,cursor:onClick?'pointer':'default',transition:'border-color 0.2s',...style}}
    onMouseEnter={e=>onClick&&(e.currentTarget.style.borderColor=T.accent)}
    onMouseLeave={e=>onClick&&(e.currentTarget.style.borderColor=T.border)}>
    {children}
  </div>
);

const PageHeader = ({title,subtitle,action,isMobile,onBack}) => (
  <div style={{marginBottom:20}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        {onBack&&(
          <button onClick={onBack} style={{background:'none',border:`1px solid ${T.border}`,borderRadius:10,padding:'6px 10px',cursor:'pointer',color:T.muted,display:'flex',alignItems:'center',gap:4,fontFamily:'inherit',fontSize:12}}>
            <Icon name="back" size={16}/><span style={{fontSize:12,fontWeight:500}}>Áreas</span>
          </button>
        )}
        <h2 style={{margin:0,color:T.text,fontSize:isMobile?18:20,fontWeight:700}}>{title}</h2>
      </div>
      {action}
    </div>
    {subtitle&&<p style={{color:T.muted,fontSize:13,marginTop:4,marginBottom:0}}>{subtitle}</p>}
  </div>
);

// ===================== GLOBAL SEARCH =====================
const GlobalSearch = ({data,onNavigate,onClose}) => {
  const [q,setQ]=useState('');
  const [activeType,setActiveType]=useState('all');
  const [expanded,setExpanded]=useState(null);
  const [recentSearches,setRecentSearches]=useState(()=>{try{return JSON.parse(localStorage.getItem('sb_recent_searches')||'[]');}catch{return [];}});
  const inputRef=useRef(null);
  useEffect(()=>inputRef.current?.focus(),[]);

  // ── Natural language date resolver ──
  const resolveDateRange=(q)=>{
    const s=q.toLowerCase().trim();
    const now=new Date(); const todayStr=today();
    const ymd=(d)=>d.toISOString().slice(0,10);
    const pad=(n)=>String(n).padStart(2,'0');
    const fmt2=(d)=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
    if(s==='hoy'||s==='today') return {from:todayStr,to:todayStr,label:'hoy'};
    if(s==='ayer'||s==='yesterday'){const d=new Date(now);d.setDate(d.getDate()-1);const s2=ymd(d);return{from:s2,to:s2,label:'ayer'};}
    if(s.match(/esta semana|this week/)){const d=new Date(now);d.setDate(d.getDate()-d.getDay());return{from:fmt2(d),to:todayStr,label:'esta semana'};}
    if(s.match(/semana pasada|last week/)){const d=new Date(now);d.setDate(d.getDate()-d.getDay()-7);const e=new Date(d);e.setDate(e.getDate()+6);return{from:fmt2(d),to:fmt2(e),label:'semana pasada'};}
    if(s.match(/este mes|this month/)){return{from:`${todayStr.slice(0,7)}-01`,to:todayStr,label:'este mes'};}
    if(s.match(/mes pasado|last month/)){const d=new Date(now.getFullYear(),now.getMonth()-1,1);const e=new Date(now.getFullYear(),now.getMonth(),0);return{from:fmt2(d),to:fmt2(e),label:'mes pasado'};}
    if(s.match(/últimos? (\d+) días?/)){const n=parseInt(s.match(/(\d+)/)[1]);const d=new Date(now);d.setDate(d.getDate()-n);return{from:fmt2(d),to:todayStr,label:`últimos ${n} días`};}
    if(s.match(/esta semana|hace \d|hoy|ayer|este mes/)) return null;
    return null;
  };

  const dateRange=resolveDateRange(q);
  const isDateQuery=!!dateRange;

  const addRecent=(term)=>{
    if(!term.trim())return;
    const upd=[term,...recentSearches.filter(r=>r!==term)].slice(0,6);
    setRecentSearches(upd);
    try{localStorage.setItem('sb_recent_searches',JSON.stringify(upd));}catch{}
  };

  const TYPE_META={
    nota:{label:'📝 Nota',color:'#00c896',nav:'notes'},
    tarea:{label:'✅ Tarea',color:'#4da6ff',nav:'projects'},
    objetivo:{label:'🎯 Objetivo',color:'#ff8c42',nav:'objectives'},
    proyecto:{label:'📁 Proyecto',color:'#4da6ff',nav:'projects'},
    habito:{label:'🔁 Hábito',color:'#ff5069',nav:'habits'},
    persona:{label:'👥 Persona',color:'#a78bfa',nav:'relaciones'},
    transaccion:{label:'💰 Transacción',color:'#ffd166',nav:'finance'},
    workout:{label:'🏃 Entreno',color:'#00c896',nav:'health'},
    libro:{label:'📚 Libro',color:'#00c896',nav:'books'},
    aprendizaje:{label:'🎓 Aprendizaje',color:'#a78bfa',nav:'desarrollo'},
    idea:{label:'💡 Idea',color:'#ffd166',nav:'desarrollo'},
    mantenimiento:{label:'🔧 Mantenimiento',color:'#4da6ff',nav:'hogar'},
    documento:{label:'📄 Documento',color:'#ff8c42',nav:'hogar'},
    contacto_hogar:{label:'📞 Contacto',color:'#00c896',nav:'hogar'},
    side_project:{label:'🚀 Side Project',color:'#ff5069',nav:'sideProjects'},
    sp_tarea:{label:'📌 SP Tarea',color:'#ff8c42',nav:'sideProjects'},
    compra:{label:'🛒 Compra',color:'#ffd166',nav:'shopping'},
    metrica_salud:{label:'📊 Métrica',color:'#00c896',nav:'health'},
    medicamento:{label:'💊 Medicamento',color:'#ff8c42',nav:'health'},
    diario:{label:'📔 Diario',color:'#a78bfa',nav:'journal'},
  };

  const ql=q.toLowerCase().trim();
  const buildResults=()=>{
    if(!ql)return[];
    // Date-range mode: filter items by date
    if(isDateQuery){
      const {from,to}=dateRange;
      const inRange=(d)=>d&&d>=from&&d<=to;
      const res=[];
      (data.notes||[]).filter(n=>inRange(n.createdAt)).forEach(n=>res.push({type:'nota',label:n.title,sub:n.createdAt,hint:'notes:'+n.id}));
      (data.tasks||[]).filter(t=>inRange(t.createdAt)||inRange(t.dueDate)).forEach(t=>res.push({type:'tarea',label:t.title,sub:t.dueDate||t.createdAt||'',hint:'projects'}));
      (data.transactions||[]).filter(t=>inRange(t.date)).forEach(t=>res.push({type:'transaccion',label:t.description,sub:`${t.type==='ingreso'?'+':'-'}$${t.amount} · ${t.date}`,hint:'finance'}));
      (data.workouts||[]).filter(w=>inRange(w.date)).forEach(w=>res.push({type:'workout',label:`${w.type} · ${w.date}`,sub:`${w.duration}min`,hint:'health'}));
      (data.journal||[]).filter(j=>inRange(j.date)).forEach(j=>res.push({type:'nota',label:`📔 Diario ${j.date}`,sub:j.content?.slice(0,60)||'',hint:'journal'}));
      return res;
    }
    const res=[];
    const push=(type,label,sub,hint,raw='',preview=null)=>{
      if(label.toLowerCase().includes(ql)||sub.toLowerCase().includes(ql)||raw.toLowerCase().includes(ql))
        res.push({type,label,sub,hint,preview});
    };
    (data.notes||[]).forEach(n=>push('nota',n.title,n.content.slice(0,80),'notes:'+n.id,n.tags?.join(' ')||'',{content:n.content?.slice(0,200),tags:n.tags,date:n.createdAt}));
    (data.tasks||[]).forEach(t=>push('tarea',t.title,t.status==='done'?'Completada':'Pendiente','projects','',{status:t.status,priority:t.priority,dueDate:t.dueDate,subtasks:(t.subtasks||[]).length}));
    (data.objectives||[]).forEach(o=>push('objetivo',o.title,o.status==='active'?'Activo':'Completado','objectives','',{status:o.status,deadline:o.deadline,milestones:(o.milestones||[]).length,completedAt:o.completedAt}));
    (data.projects||[]).forEach(p=>push('proyecto',p.title,'','projects','',{taskCount:(data.tasks||[]).filter(t=>t.projectId===p.id).length}));
    (data.habits||[]).forEach(h=>push('habito',h.name,h.frequency==='daily'?'Diario':h.frequency==='weekly'?'Semanal':'Mensual','habits','',{frequency:h.frequency,totalCompletions:h.completions?.length||0}));
    (data.people||[]).forEach(p=>push('persona',p.name,p.relation||'','relaciones','',{relation:p.relation,birthday:p.birthday,phone:p.phone}));
    (data.transactions||[]).forEach(t=>push('transaccion',t.description,`${t.type==='ingreso'?'+':'-'}$${t.amount} · ${t.date}`,'finance',t.category||'',{type:t.type,amount:t.amount,category:t.category,date:t.date}));
    (data.workouts||[]).forEach(w=>push('workout',`${w.type} · ${w.date}`,`${w.duration}min${w.calories?' · '+w.calories+'kcal':''}`,'health','',{duration:w.duration,calories:w.calories,distance:w.distance}));
    (data.books||[]).forEach(b=>push('libro',b.title,b.author||'','books','',{author:b.author,status:b.status,rating:b.rating}));
    (data.learnings||[]).forEach(l=>push('aprendizaje',l.title,l.platform||'','desarrollo','',{platform:l.platform,progress:l.progress,hoursSpent:l.hoursSpent}));
    (data.ideas||[]).forEach(i=>push('idea',i.content.slice(0,60),i.tag||'','desarrollo','',{content:i.content,tag:i.tag}));
    (data.maintenances||[]).forEach(m=>push('mantenimiento',m.name,m.category||'','hogar',m.notes||'',{category:m.category,lastDone:m.lastDone}));
    (data.homeDocs||[]).forEach(d=>push('documento',d.name,d.category||'','hogar',d.provider||'',{category:d.category,expiryDate:d.expiryDate,provider:d.provider}));
    (data.homeContacts||[]).forEach(c=>push('contacto_hogar',c.name,c.role||'','hogar',c.phone||'',{role:c.role,phone:c.phone}));
    (data.sideProjects||[]).forEach(p=>push('side_project',p.name,p.description?.slice(0,60)||p.stack||'','sideProjects',p.url||'',{stack:p.stack,status:p.status,url:p.url}));
    (data.spTasks||[]).forEach(t=>push('sp_tarea',t.title,t.projectName||'','sideProjects',t.status||''));
    (data.shopping||[]).forEach(s=>push('compra',s.name,s.category||'','shopping',s.notes||''));
    Object.entries(data.healthMetrics||{}).forEach(([metricType,entries])=>{
      (entries||[]).forEach(e=>push('metrica_salud',`${metricType}: ${e.value}`,`${e.date}`,'health',metricType));
    });
    (data.medications||[]).forEach(m=>push('medicamento',m.name,`${m.dose||''}${m.unit||''} · ${m.frequency||''}`,'health',m.notes||'',{dose:m.dose,unit:m.unit,frequency:m.frequency,time:m.time}));
    (data.journal||[]).forEach(j=>push('diario',`📔 ${j.date}`,j.content?.slice(0,80)||'','journal',j.mood||'',{content:j.content?.slice(0,200),mood:j.mood}));
    return res;
  };

  const results=buildResults();
  const types=[...new Set(results.map(r=>r.type))];
  const filtered=activeType==='all'?results:results.filter(r=>r.type===activeType);

  const handleSelect=(r)=>{
    addRecent(q);
    const meta=TYPE_META[r.type];
    const [view,hint]=(r.hint||'').includes(':')?[r.hint.split(':')[0],r.hint]:[(r.hint||meta?.nav||''),''];
    onNavigate(view,hint||null);
    onClose();
  };

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.72)',zIndex:300,display:'flex',alignItems:'flex-start',justifyContent:'center',paddingTop:56,backdropFilter:'blur(8px)'}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{width:'100%',maxWidth:560,padding:'0 16px',maxHeight:'80vh',display:'flex',flexDirection:'column',gap:0}} onClick={e=>e.stopPropagation()}>

        {/* Search input */}
        <div style={{position:'relative',marginBottom:8}}>
          <span style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',color:T.muted,fontSize:17,pointerEvents:'none'}}>🔍</span>
          <input ref={inputRef} value={q} onChange={e=>{setQ(e.target.value);setExpanded(null);setActiveType('all');}} autoComplete="off"
            onKeyDown={e=>e.key==='Escape'&&onClose()}
            placeholder="Buscar… o escribe 'esta semana', 'hoy', 'últimos 7 días'…"
            style={{width:'100%',background:T.surface,border:`2px solid ${q?T.accent:T.border}`,color:T.text,padding:'14px 44px 14px 44px',borderRadius:14,fontSize:15,outline:'none',boxSizing:'border-box',fontFamily:'inherit',transition:'border-color 0.15s'}}/>
          <button onClick={onClose} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:T.muted,cursor:'pointer',display:'flex',padding:4}}>
            <Icon name="x" size={18}/>
          </button>
        </div>

        {/* Content box */}
        <div style={{background:T.surface,borderRadius:12,border:`1px solid ${T.border}`,overflow:'hidden',maxHeight:'68vh',display:'flex',flexDirection:'column'}}>

          {/* No query: recent + hint */}
          {!ql&&(
            <div style={{padding:16}}>
              {recentSearches.length>0&&(
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:10,fontWeight:700,color:T.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:8}}>Recientes</div>
                  <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                    {recentSearches.map(s=>(
                      <button key={s} onClick={()=>setQ(s)}
                        style={{padding:'4px 12px',borderRadius:20,border:`1px solid ${T.border}`,background:T.surface2,color:T.muted,cursor:'pointer',fontSize:12,fontFamily:'inherit',display:'flex',alignItems:'center',gap:5}}>
                        <span style={{color:T.dim,fontSize:10}}>↩</span>{s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div style={{marginBottom:10}}>
                <div style={{fontSize:10,fontWeight:700,color:T.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:6}}>Búsqueda por fecha</div>
                <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                  {['hoy','ayer','esta semana','este mes','últimos 7 días','últimos 30 días'].map(s=>(
                    <button key={s} onClick={()=>setQ(s)}
                      style={{padding:'4px 11px',borderRadius:20,border:`1px solid ${T.purple}40`,background:`${T.purple}10`,color:T.purple,cursor:'pointer',fontSize:11,fontFamily:'inherit'}}>
                      🗓 {s}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{color:T.dim,fontSize:12,textAlign:'center',padding:'8px 0'}}>
                Busca por nombre, o presiona <kbd style={{background:T.surface2,border:`1px solid ${T.border}`,borderRadius:4,padding:'1px 6px',fontSize:10}}>Esc</kbd> para cerrar
              </div>
            </div>
          )}

          {/* Date range active banner */}
          {ql&&isDateQuery&&(
            <div style={{padding:'8px 14px',background:`${T.purple}12`,borderBottom:`1px solid ${T.purple}30`,display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
              <span style={{fontSize:13}}>🗓</span>
              <span style={{fontSize:12,color:T.purple,fontWeight:600}}>Mostrando registros de <strong>{dateRange.label}</strong></span>
              <span style={{fontSize:11,color:T.dim,marginLeft:'auto'}}>{dateRange.from} → {dateRange.to}</span>
            </div>
          )}

          {/* Type filters when there are results */}
          {ql&&results.length>0&&types.length>1&&(
            <div style={{padding:'8px 12px',borderBottom:`1px solid ${T.border}`,display:'flex',gap:5,flexWrap:'wrap',flexShrink:0}}>
              <button onClick={()=>setActiveType('all')}
                style={{padding:'3px 10px',borderRadius:8,border:`1px solid ${activeType==='all'?T.accent:T.border}`,background:activeType==='all'?`${T.accent}15`:'transparent',color:activeType==='all'?T.accent:T.muted,cursor:'pointer',fontSize:11,fontFamily:'inherit'}}>
                Todos ({results.length})
              </button>
              {types.map(t=>{
                const cnt=results.filter(r=>r.type===t).length;
                const meta=TYPE_META[t];
                return (
                  <button key={t} onClick={()=>setActiveType(t)}
                    style={{padding:'3px 10px',borderRadius:8,border:`1px solid ${activeType===t?meta.color:T.border}`,background:activeType===t?`${meta.color}15`:'transparent',color:activeType===t?meta.color:T.muted,cursor:'pointer',fontSize:11,fontFamily:'inherit'}}>
                    {meta.label.split(' ')[0]} {cnt}
                  </button>
                );
              })}
            </div>
          )}

          {/* Results */}
          {ql&&(
            <div style={{overflowY:'auto',flex:1}}>
              {filtered.length===0
                ?<div style={{padding:'28px 16px',textAlign:'center',color:T.dim,fontSize:13}}>
                   {isDateQuery
                     ?<>Sin registros para <span style={{color:T.purple}}>{dateRange.label}</span></>
                     :<>Sin resultados para "<span style={{color:T.accent}}>{q}</span>"</>
                   }
                 </div>
                :filtered.map((r,i)=>{
                  const meta=TYPE_META[r.type];
                  const isExp=expanded===i;
                  const hi=(text)=>{
                    const idx=text.toLowerCase().indexOf(ql);
                    if(idx<0)return text;
                    return <>{text.slice(0,idx)}<mark style={{background:`${T.accent}30`,color:T.accent,borderRadius:2,padding:'0 1px'}}>{text.slice(idx,idx+ql.length)}</mark>{text.slice(idx+ql.length)}</>;
                  };
                  return (
                    <div key={i}>
                      <div onClick={()=>setExpanded(isExp?null:i)}
                        style={{padding:'11px 16px',cursor:'pointer',borderBottom:`1px solid ${T.border}`,display:'flex',gap:10,alignItems:'center',background:isExp?T.surface2:'transparent',transition:'background 0.1s'}}
                        onMouseEnter={e=>{if(!isExp)e.currentTarget.style.background=T.surface2;}}
                        onMouseLeave={e=>{if(!isExp)e.currentTarget.style.background='transparent';}}>
                        <span style={{fontSize:11,color:meta.color,background:`${meta.color}18`,padding:'2px 8px',borderRadius:8,flexShrink:0,fontWeight:600,whiteSpace:'nowrap'}}>{meta.label}</span>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{color:T.text,fontSize:13,fontWeight:500}}>{hi(r.label)}</div>
                          {r.sub&&<div style={{color:T.muted,fontSize:11,marginTop:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{hi(r.sub)}</div>}
                        </div>
                        <span style={{color:T.dim,fontSize:11,flexShrink:0}}>{isExp?'▲':'▼'}</span>
                      </div>
                      {isExp&&(
                        <div style={{padding:'10px 16px 12px',borderBottom:`1px solid ${T.border}`,background:T.surface2}}>
                          {/* Preview content */}
                          {r.preview&&(
                            <div style={{marginBottom:10,display:'flex',flexWrap:'wrap',gap:6,fontSize:11,color:T.muted}}>
                              {r.preview.content&&<div style={{width:'100%',color:T.text,fontSize:12,lineHeight:1.5,marginBottom:4,borderLeft:`2px solid ${meta.color}`,paddingLeft:10}}>{r.preview.content}</div>}
                              {r.preview.tags&&r.preview.tags.length>0&&r.preview.tags.map(tag=><span key={tag} style={{background:`${T.purple}15`,color:T.purple,padding:'1px 7px',borderRadius:6,fontSize:10}}>#{tag}</span>)}
                              {r.preview.date&&<span>📅 {r.preview.date}</span>}
                              {r.preview.status&&<span style={{color:r.preview.status==='done'?T.green:T.orange,fontWeight:600}}>{r.preview.status==='done'?'✅ Hecha':'⏳ Pendiente'}</span>}
                              {r.preview.priority&&<span style={{color:r.preview.priority==='alta'?T.red:r.preview.priority==='media'?T.orange:T.accent}}>● {r.preview.priority}</span>}
                              {r.preview.dueDate&&<span>📅 Vence: {r.preview.dueDate}</span>}
                              {r.preview.subtasks>0&&<span>📋 {r.preview.subtasks} subtareas</span>}
                              {r.preview.deadline&&<span>🎯 Fecha límite: {r.preview.deadline}</span>}
                              {r.preview.milestones>0&&<span>🏁 {r.preview.milestones} milestones</span>}
                              {r.preview.completedAt&&<span style={{color:T.green}}>✅ Completado: {r.preview.completedAt}</span>}
                              {r.preview.taskCount!=null&&<span>📁 {r.preview.taskCount} tareas</span>}
                              {r.preview.totalCompletions>0&&<span>🔥 {r.preview.totalCompletions} días completados</span>}
                              {r.preview.relation&&<span>👤 {r.preview.relation}</span>}
                              {r.preview.birthday&&<span>🎂 {r.preview.birthday}</span>}
                              {r.preview.phone&&<span>📱 {r.preview.phone}</span>}
                              {r.preview.amount&&<span style={{color:r.preview.type==='ingreso'?T.green:T.red,fontWeight:700}}>{r.preview.type==='ingreso'?'+':'-'}${Number(r.preview.amount).toLocaleString()}</span>}
                              {r.preview.category&&<span>🏷 {r.preview.category}</span>}
                              {r.preview.duration&&<span>⏱ {r.preview.duration}min</span>}
                              {r.preview.calories>0&&<span>🔥 {r.preview.calories}kcal</span>}
                              {r.preview.distance&&<span>📏 {r.preview.distance}</span>}
                              {r.preview.author&&<span>✍️ {r.preview.author}</span>}
                              {r.preview.rating>0&&<span>{'⭐'.repeat(r.preview.rating)}</span>}
                              {r.preview.platform&&<span>📺 {r.preview.platform}</span>}
                              {r.preview.progress!=null&&<span>📊 {r.preview.progress}%</span>}
                              {r.preview.hoursSpent>0&&<span>⏱ {r.preview.hoursSpent}h</span>}
                              {r.preview.stack&&<span>🛠 {r.preview.stack}</span>}
                              {r.preview.url&&<span style={{color:T.blue}}>🔗 {r.preview.url.slice(0,30)}</span>}
                              {r.preview.expiryDate&&<span>📅 Vence: {r.preview.expiryDate}</span>}
                              {r.preview.provider&&<span>🏢 {r.preview.provider}</span>}
                              {r.preview.role&&<span>👷 {r.preview.role}</span>}
                              {r.preview.dose&&<span>💊 {r.preview.dose}{r.preview.unit} · {r.preview.frequency}</span>}
                              {r.preview.time&&<span>⏰ {r.preview.time}</span>}
                              {r.preview.mood&&<span>{r.preview.mood}</span>}
                              {r.preview.lastDone&&<span>🔧 Último: {r.preview.lastDone}</span>}
                            </div>
                          )}
                          <button onClick={()=>handleSelect(r)}
                            style={{padding:'6px 16px',borderRadius:9,border:`1px solid ${meta.color}`,background:`${meta.color}15`,color:meta.color,cursor:'pointer',fontSize:12,fontFamily:'inherit',fontWeight:600}}>
                            Abrir →
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              {ql&&<div style={{padding:'8px 16px',color:T.dim,fontSize:11,textAlign:'center',borderTop:`1px solid ${T.border}`}}>{filtered.length} resultado{filtered.length!==1?'s':''}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


// ===================== DASHBOARD =====================
const Dashboard = ({data,setData,isMobile,onNavigate}) => {
  const todayStr=today();
  const h=new Date().getHours();
  const greeting=h<12?'Buenos días 🌅':h<18?'Buenas tardes ☀️':'Buenas noches 🌙';

  // ── Habits interactive ──
  const dailyHabits=data.habits.filter(hb=>!hb.frequency||hb.frequency==='daily');
  const toggleHabit=(habitId)=>{
    const updated=data.habits.map(hb=>{
      if(hb.id!==habitId)return hb;
      const has=hb.completions.includes(todayStr);
      return {...hb,completions:has?hb.completions.filter(d=>d!==todayStr):[...hb.completions,todayStr]};
    });
    setData(d=>({...d,habits:updated}));save('habits',updated);
  };
  const todayDoneHabits=dailyHabits.filter(hb=>hb.completions.includes(todayStr));
  const habitPct=dailyHabits.length?Math.round(todayDoneHabits.length/dailyHabits.length*100):0;
  const HABIT_COLORS=['#4da6ff','#00c896','#ff8c42','#a78bfa','#ff5069','#ffd166'];
  const habitColor=(hb,idx)=>hb.color||(HABIT_COLORS[idx%HABIT_COLORS.length]);

  // ── Tasks interactive ──
  const urgentTasks=[...data.tasks.filter(t=>t.status!=='done')]
    .sort((a,b)=>{if(!a.dueDate&&!b.dueDate)return 0;if(!a.dueDate)return 1;if(!b.dueDate)return -1;return a.dueDate.localeCompare(b.dueDate);}).slice(0,4);
  const toggleTask=(taskId)=>{
    const updated=data.tasks.map(t=>t.id===taskId?{...t,status:t.status==='done'?'todo':'done'}:t);
    setData(d=>({...d,tasks:updated}));save('tasks',updated);
  };
  const daysUntil=(d)=>{
    if(!d)return{label:'Sin fecha',color:T.dim};
    const diff=Math.ceil((new Date(d)-new Date(todayStr))/86400000);
    if(diff<0)return{label:`${Math.abs(diff)}d vencida`,color:T.red};
    if(diff===0)return{label:'Hoy',color:T.red};
    if(diff===1)return{label:'Mañana',color:T.orange};
    return{label:`${diff}d`,color:T.muted};
  };
  const priorityColor=p=>p==='alta'?T.red:p==='media'?T.orange:T.accent;

  // ── Active objective ──
  const activeObj=(data.objectives||[]).filter(o=>o.status==='active');
  const topObj=activeObj[0]||null;
  const getObjPct=(o)=>{
    const ms=o.milestones||[];const relTasks=data.tasks.filter(t=>t.objectiveId===o.id);
    if(ms.length){const done=ms.filter(m=>m.done).reduce((s,m)=>s+(m.weight||1),0);const total=ms.reduce((s,m)=>s+(m.weight||1),0);return Math.round((done/total)*100);}
    if(relTasks.length){return Math.round(relTasks.filter(t=>t.status==='done').length/relTasks.length*100);}
    return 0;
  };
  const topObjPct=topObj?getObjPct(topObj):0;
  const topObjArea=topObj?data.areas.find(a=>a.id===topObj.areaId):null;

  // ── Finance snapshot ──
  const curMonth=todayStr.slice(0,7);
  const curMonthTxs=(data.transactions||[]).filter(t=>t.date?.slice(0,7)===curMonth);
  const prevMonthDate=new Date();prevMonthDate.setMonth(prevMonthDate.getMonth()-1);
  const prevMonth=`${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth()+1).padStart(2,'0')}`;
  const prevMonthTxs=(data.transactions||[]).filter(t=>t.date?.slice(0,7)===prevMonth);
  const totalIncome=curMonthTxs.filter(t=>t.type==='ingreso').reduce((s,t)=>s+(t.amount||0),0);
  const totalExpense=curMonthTxs.filter(t=>t.type==='egreso').reduce((s,t)=>s+(t.amount||0),0);
  const prevExpense=prevMonthTxs.filter(t=>t.type==='egreso').reduce((s,t)=>s+(t.amount||0),0);
  const balance=totalIncome-totalExpense;
  const expDelta=prevExpense>0?Math.round(((totalExpense-prevExpense)/prevExpense)*100):null;
  const fmtCur=(n)=>`$${Math.abs(n).toLocaleString('es-MX',{maximumFractionDigits:0})}`;

  // ── Upcoming birthdays ──
  const bday7=(data.people||[]).filter(p=>{
    if(!p.birthday)return false;
    const[,m,dd]=p.birthday.split('-');
    const thisYear=todayStr.slice(0,4);
    const bdayThis=`${thisYear}-${m}-${dd}`;
    const diff=Math.ceil((new Date(bdayThis)-new Date(todayStr))/86400000);
    return diff>=0&&diff<7;
  });

  // ── Stats ──
  const inboxUnread=data.inbox.filter(i=>!i.processed).length;
  const pendingTasks=data.tasks.filter(t=>t.status!=='done').length;
  const stats=[
    {label:'Objetivos',val:activeObj.length,icon:'🎯',color:T.accent,view:'objectives'},
    {label:'Tareas',val:pendingTasks,icon:'📋',color:T.orange,view:'projects'},
    {label:'Inbox',val:inboxUnread,icon:'📥',color:T.red,view:'inbox'},
    {label:'Hábitos',val:`${todayDoneHabits.length}/${dailyHabits.length}`,icon:'🔥',color:T.green,view:'habits'},
  ];

  return (
    <div>
      <h2 style={{color:T.text,marginTop:0,fontSize:isMobile?20:24,fontWeight:700,marginBottom:2}}>{greeting}</h2>
      <p style={{color:T.muted,marginBottom:18,fontSize:13}}>{new Date().toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'})}</p>

      {/* Stats row */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:14}}>
        {stats.map(s=>(
          <Card key={s.label} onClick={()=>onNavigate&&onNavigate(s.view,null)} style={{textAlign:'center',padding:isMobile?10:14,cursor:'pointer'}}>
            <div style={{fontSize:isMobile?18:20}}>{s.icon}</div>
            <div style={{fontSize:isMobile?18:24,fontWeight:800,color:s.color,lineHeight:1.1,marginTop:2}}>{s.val}</div>
            <div style={{fontSize:10,color:T.muted,marginTop:2}}>{s.label}</div>
          </Card>
        ))}
      </div>

      {/* ── Accesos directos a pilares ── */}
      <div style={{marginBottom:14}}>
        <div style={{fontSize:11,fontWeight:700,color:T.dim,letterSpacing:1,textTransform:'uppercase',marginBottom:8}}>Mis pilares</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
          {[
            {label:'Salud',      icon:'💪', route:'health',       color:'#4da6ff'},
            {label:'Finanzas',   icon:'💰', route:'finance',      color:'#00c896'},
            {label:'Hogar',      icon:'🏠', route:'hogar',        color:'#a78bfa'},
            {label:'Relaciones', icon:'👥', route:'relaciones',   color:'#ff8c42'},
            {label:'Desarrollo', icon:'🧠', route:'desarrollo',   color:'#ff5069'},
            {label:'S. Projects',icon:'🚀', route:'sideprojects', color:'#ffd166'},
            {label:'Trabajo',    icon:'💼', route:'trabajo',      color:'#4da6ff'},
            {label:'Objetivos',  icon:'🎯', route:'objectives',   color:'#00c896'},
          ].map(p=>(
            <div key={p.route} onClick={()=>onNavigate&&onNavigate(p.route,null)}
              style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:'10px 6px',textAlign:'center',cursor:'pointer',transition:'all 0.15s',borderTop:`3px solid ${p.color}`}}>
              <div style={{fontSize:20,marginBottom:4}}>{p.icon}</div>
              <div style={{fontSize:10,fontWeight:600,color:T.muted,lineHeight:1.2}}>{p.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{display:isMobile?'block':'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
        {/* LEFT COLUMN */}
        <div>
          {/* Habitos interactivos */}
          {dailyHabits.length>0&&(
            <Card style={{marginBottom:14,padding:16}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                <div style={{fontWeight:700,fontSize:13,color:T.text}}>🔥 Hábitos de hoy</div>
                <div style={{fontSize:13,fontWeight:700,color:habitPct>=80?T.accent:habitPct>=50?T.orange:T.muted}}>{habitPct}%</div>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                {dailyHabits.slice(0,6).map((hb,idx)=>{
                  const done=hb.completions.includes(todayStr);
                  const hc=habitColor(hb,idx);
                  return (
                    <div key={hb.id} onClick={()=>toggleHabit(hb.id)}
                      style={{display:'flex',alignItems:'center',gap:10,padding:'8px 10px',borderRadius:10,background:done?`${hc}12`:T.surface2,border:`1px solid ${done?hc:T.border}`,cursor:'pointer',transition:'all 0.15s'}}>
                      <div style={{width:20,height:20,borderRadius:6,border:`2px solid ${hc}`,background:done?hc:'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all 0.15s'}}>
                        {done&&<span style={{color:'#000',fontSize:11,fontWeight:900}}>&#10003;</span>}
                      </div>
                      <span style={{fontSize:13,color:done?T.muted:T.text,textDecoration:done?'line-through':'none',flex:1}}>{hb.name}</span>
                    </div>
                  );
                })}
              </div>
              {dailyHabits.length>6&&<button onClick={()=>onNavigate&&onNavigate('habits',null)} style={{marginTop:8,width:'100%',padding:'5px',background:'none',border:`1px solid ${T.border}`,borderRadius:8,color:T.muted,cursor:'pointer',fontSize:11,fontFamily:'inherit'}}>Ver todos ({dailyHabits.length}) →</button>}
            </Card>
          )}

          {/* Objetivo activo */}
          {topObj&&(
            <Card style={{marginBottom:14,padding:16,cursor:'pointer',borderLeft:`3px solid ${topObjArea?.color||T.accent}`}} onClick={()=>onNavigate&&onNavigate('objectives',null)}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:10,fontWeight:700,color:topObjArea?.color||T.accent,textTransform:'uppercase',letterSpacing:0.8,marginBottom:4}}>🎯 {topObjArea?`${topObjArea.icon} ${topObjArea.name}`:'Objetivo activo'}</div>
                  <div style={{color:T.text,fontWeight:600,fontSize:14,lineHeight:1.3}}>{topObj.title}</div>
                </div>
                <div style={{fontSize:20,fontWeight:800,color:topObjArea?.color||T.accent,marginLeft:10,flexShrink:0}}>{topObjPct}%</div>
              </div>
              <div style={{height:6,background:T.border,borderRadius:3,overflow:'hidden'}}>
                <div style={{height:'100%',width:`${topObjPct}%`,background:topObjArea?.color||T.accent,borderRadius:3,transition:'width 0.6s'}}/>
              </div>
              {activeObj.length>1&&<div style={{fontSize:11,color:T.dim,marginTop:6}}>+{activeObj.length-1} objetivos activos más</div>}
            </Card>
          )}

          {/* Finance snapshot */}
          <Card style={{marginBottom:isMobile?14:0,padding:16,cursor:'pointer'}} onClick={()=>onNavigate&&onNavigate('finance',null)}>
            <div style={{fontWeight:700,fontSize:13,color:T.text,marginBottom:10}}>💰 Finanzas este mes</div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end'}}>
              <div>
                <div style={{fontSize:10,color:T.muted}}>Balance</div>
                <div style={{fontSize:22,fontWeight:800,color:balance>=0?T.accent:T.red}}>{(data.transactions||[]).length>0?(balance>=0?'+':'')+fmtCur(balance):'—'}</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:11,color:T.green,fontWeight:600}}>{fmtCur(totalIncome)} ingresos</div>
                <div style={{display:'flex',alignItems:'center',gap:4,justifyContent:'flex-end'}}>
                  <div style={{fontSize:11,color:T.red,fontWeight:600}}>{fmtCur(totalExpense)} egresos</div>
                  {expDelta!==null&&<span style={{fontSize:10,padding:'1px 5px',borderRadius:5,background:expDelta>0?`${T.red}18`:`${T.green}18`,color:expDelta>0?T.red:T.green,fontWeight:700}}>{expDelta>0?'↑':'↓'}{Math.abs(expDelta)}%</span>}
                </div>
              </div>
            </div>
            {(data.transactions||[]).length===0&&<div style={{fontSize:12,color:T.dim,textAlign:'center',marginTop:8}}>Sin transacciones — Ir a Finanzas →</div>}
          </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div>
          {/* Tareas urgentes interactivas */}
          <Card style={{marginBottom:14,padding:16}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <div style={{fontWeight:700,fontSize:13,color:T.text}}>📋 Tareas urgentes</div>
              <button onClick={()=>onNavigate&&onNavigate('projects',null)} style={{background:'none',border:`1px solid ${T.border}`,borderRadius:8,padding:'3px 10px',cursor:'pointer',color:T.muted,fontSize:11,fontFamily:'inherit'}}>Ver todas</button>
            </div>
            {urgentTasks.length===0
              ?<div style={{textAlign:'center',padding:'12px 0',color:T.dim,fontSize:13}}>Sin tareas pendientes 🎉</div>
              :urgentTasks.map(t=>{
                const due=daysUntil(t.dueDate);
                return (
                  <div key={t.id} style={{display:'flex',alignItems:'center',gap:10,marginBottom:8,padding:'8px 10px',background:T.surface2,borderRadius:10,border:`1px solid ${T.border}`,borderLeft:`3px solid ${priorityColor(t.priority)}`}}>
                    <div onClick={e=>{e.stopPropagation();toggleTask(t.id);}}
                      style={{width:20,height:20,borderRadius:6,border:`2px solid ${T.border}`,background:'transparent',cursor:'pointer',flexShrink:0}}/>
                    <span onClick={()=>onNavigate&&onNavigate('projects','pending')} style={{color:T.text,fontSize:12,flex:1,lineHeight:1.3,cursor:'pointer'}}>{t.title}</span>
                    <span style={{fontSize:11,fontWeight:700,color:due.color,flexShrink:0}}>{due.label}</span>
                  </div>
                );
              })
            }
          </Card>

          {/* Cumpleaños proximos */}
          {bday7.length>0&&(
            <Card style={{marginBottom:14,padding:16,border:`1px solid ${T.purple}40`,background:`${T.purple}06`}}>
              <div style={{fontWeight:700,fontSize:13,color:T.purple,marginBottom:10}}>🎂 Cumpleaños esta semana</div>
              {bday7.slice(0,3).map(p=>{
                const[,m,dd]=p.birthday.split('-');
                const bdayThis=`${todayStr.slice(0,4)}-${m}-${dd}`;
                const diff=Math.ceil((new Date(bdayThis)-new Date(todayStr))/86400000);
                return (
                  <div key={p.id} onClick={()=>onNavigate&&onNavigate('relaciones',null)}
                    style={{display:'flex',alignItems:'center',gap:10,padding:'6px 0',borderBottom:`1px solid ${T.border}`,cursor:'pointer'}}>
                    <span style={{fontSize:20}}>{p.emoji||'👤'}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,color:T.text,fontWeight:600}}>{p.name}</div>
                      <div style={{fontSize:11,color:T.muted}}>{p.relation||'Contacto'}</div>
                    </div>
                    <span style={{fontSize:11,fontWeight:700,color:diff===0?T.red:T.purple,background:`${T.purple}18`,padding:'2px 8px',borderRadius:6}}>{diff===0?'Hoy!':diff===1?'Mañana':`en ${diff}d`}</span>
                  </div>
                );
              })}
            </Card>
          )}

          {/* Notas recientes */}
          <Card style={{padding:16}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <div style={{fontWeight:700,fontSize:13,color:T.text}}>📝 Notas recientes</div>
              <button onClick={()=>onNavigate&&onNavigate('notes',null)} style={{background:'none',border:`1px solid ${T.border}`,borderRadius:8,padding:'3px 10px',cursor:'pointer',color:T.muted,fontSize:11,fontFamily:'inherit'}}>Ver todas</button>
            </div>
            {[...data.notes].sort((a,b)=>b.createdAt>a.createdAt?1:-1).slice(0,3).map(n=>{
              const area=data.areas.find(a=>a.id===n.areaId);
              return (
                <div key={n.id} onClick={()=>onNavigate&&onNavigate('notes',n.id)}
                  style={{marginBottom:8,padding:'10px 12px',background:T.surface2,borderRadius:10,borderLeft:`3px solid ${area?.color||T.accent}`,cursor:'pointer'}}>
                  <div style={{color:T.text,fontSize:13,fontWeight:500,marginBottom:3}}>{n.title}</div>
                  <div style={{display:'flex',gap:6,alignItems:'center'}}>
                    {area&&<span style={{fontSize:10,color:area.color}}>{area.icon} {area.name}</span>}
                    <span style={{color:T.dim,fontSize:11}}>{fmt(n.createdAt)}</span>
                  </div>
                </div>
              );
            })}
            {data.notes.length===0&&<div style={{color:T.dim,fontSize:12,textAlign:'center',padding:'12px 0'}}>Sin notas aún</div>}
          </Card>

          {/* Revisión semanal */}
          {(()=>{
            const weekStart=new Date();weekStart.setDate(weekStart.getDate()-weekStart.getDay());
            const weekStr=weekStart.toISOString().slice(0,10);
            const weekTasks=data.tasks.filter(t=>t.createdAt>=weekStr||t.dueDate>=weekStr);
            const weekDone=weekTasks.filter(t=>t.status==='done');
            const weekHabits=data.habits.filter(h=>h.frequency==='daily');
            const weekHabitDays=weekHabits.length?weekHabits.reduce((s,h)=>{
              const d=Array.from({length:7},(_,i)=>{const dd=new Date(weekStart);dd.setDate(dd.getDate()+i);return dd.toISOString().slice(0,10);});
              return s+d.filter(d=>h.completions.includes(d)).length;
            },0):0;
            const weekHabitTotal=weekHabits.length*7;
            const habitPctWeek=weekHabitTotal>0?Math.round(weekHabitDays/weekHabitTotal*100):0;
            const overdueCount=data.tasks.filter(t=>t.status!=='done'&&t.dueDate&&t.dueDate<todayStr).length;
            return (
              <Card style={{marginTop:14,padding:16,borderLeft:`3px solid ${T.purple}`}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                  <div style={{fontWeight:700,fontSize:13,color:T.purple}}>📊 Revisión semanal</div>
                  <div style={{display:'flex',gap:6}}>
                    <button onClick={()=>onNavigate&&onNavigate('settings','revision')} style={{background:`${T.purple}15`,border:`1px solid ${T.purple}40`,borderRadius:8,padding:'3px 10px',cursor:'pointer',color:T.purple,fontSize:11,fontFamily:'inherit',fontWeight:600}}>Iniciar →</button>
                    <button onClick={()=>onNavigate&&onNavigate('desarrollo',null)} style={{background:'none',border:`1px solid ${T.border}`,borderRadius:8,padding:'3px 10px',cursor:'pointer',color:T.muted,fontSize:11,fontFamily:'inherit'}}>Retro →</button>
                  </div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                  {[
                    {label:'Tareas completadas',val:`${weekDone.length}/${weekTasks.length}`,color:T.accent,icon:'✅'},
                    {label:'Consistencia hábitos',val:`${habitPctWeek}%`,color:habitPctWeek>=70?T.green:habitPctWeek>=40?T.orange:T.red,icon:'🔥'},
                    {label:'Tareas vencidas',val:overdueCount,color:overdueCount===0?T.green:T.red,icon:'⚠️'},
                    {label:'Objetivos activos',val:activeObj.length,color:T.orange,icon:'🎯'},
                  ].map(s=>(
                    <div key={s.label} style={{background:T.surface2,borderRadius:10,padding:'10px 12px'}}>
                      <div style={{fontSize:15}}>{s.icon}</div>
                      <div style={{fontSize:17,fontWeight:800,color:s.color,marginTop:2}}>{s.val}</div>
                      <div style={{fontSize:10,color:T.dim,marginTop:1,lineHeight:1.2}}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

// ===================== AREAS =====================
const Areas = ({data,isMobile,onNavigate}) => {
  return (
    <div>
      <PageHeader title="Áreas de vida" subtitle="Los grandes pilares de tu vida." isMobile={isMobile}/>
      <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr 1fr':'repeat(auto-fill,minmax(180px,1fr))',gap:12}}>
        {data.areas.map(a=>{
          const objCount=data.objectives.filter(o=>o.areaId===a.id).length;
          const projCount=data.projects.filter(p=>p.areaId===a.id).length;
          return (
            <Card key={a.id} onClick={()=>onNavigate&&onNavigate('areaDetail',a.id)}
              style={{borderLeft:`4px solid ${a.color}`,position:'relative',cursor:'pointer'}}>
              <div style={{fontSize:isMobile?24:28,marginBottom:8}}>{a.icon}</div>
              <div style={{color:T.text,fontWeight:600,fontSize:14,marginBottom:4}}>{a.name}</div>
              <div style={{display:'flex',gap:8,marginBottom:6}}>
                <span style={{fontSize:11,color:T.muted,background:T.surface2,padding:'2px 8px',borderRadius:20}}>{objCount} obj</span>
                <span style={{fontSize:11,color:T.muted,background:T.surface2,padding:'2px 8px',borderRadius:20}}>{projCount} proy</span>
              </div>
              <div style={{fontSize:10,color:T.accent,fontWeight:500}}>Ver detalle →</div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// ===================== AREA DETAIL =====================
const AreaDetail = ({data,setData,isMobile,viewHint,onConsumeHint,onNavigate,onBack}) => {
  const [areaId,setAreaId]=useState(viewHint||'');


  useEffect(()=>{
    if(viewHint){setAreaId(viewHint);onConsumeHint?.();}
  },[viewHint]);

  const area=data.areas.find(a=>a.id===areaId);

  if(!area) return <div style={{textAlign:'center',padding:40,color:T.dim}}>Área no encontrada</div>;

  // Si el área es Finanzas, renderizar la vista dedicada
  if(area.name.toLowerCase().includes('finanz')||area.icon==='💰'){
    return <Finance data={data} setData={setData} isMobile={isMobile} onBack={onBack}/>;
  }

  // Si el área es Salud, renderizar la vista dedicada
  if(area.name.toLowerCase().includes('salud')||area.icon==='💪'){
    return <Health data={data} setData={setData} isMobile={isMobile} onBack={onBack}/>;
  }

  // Si el área es Hogar, renderizar la vista dedicada
  if(area.name.toLowerCase().includes('hogar')||area.name.toLowerCase().includes('casa')||area.icon==='🏠'){
    return <Hogar data={data} setData={setData} isMobile={isMobile} onBack={onBack}/>;
  }

  // Si el área es Desarrollo Personal, renderizar la vista dedicada
  if(area.name.toLowerCase().includes('desarrollo')||area.name.toLowerCase().includes('personal')||area.icon==='🧠'){
    return <DesarrolloPersonal data={data} setData={setData} isMobile={isMobile} onBack={onBack}/>;
  }

  // Si el área es Relaciones, renderizar la vista dedicada
  if(area.name.toLowerCase().includes('relacion')||area.icon==='👥'){
    return <Relaciones data={data} setData={setData} isMobile={isMobile} onBack={onBack}/>;
  }

  // Si el área es Side Projects, renderizar la vista dedicada
  if(area.name.toLowerCase().includes('side')||area.name.toLowerCase().includes('project')||area.icon==='🚀'){
    return <SideProjects data={data} setData={setData} isMobile={isMobile} onBack={onBack}/>;
  }

  // Si el área es Trabajo, embeber app externa
  if(area.name.toLowerCase().includes('trabajo')||area.name.toLowerCase().includes('work')||area.icon==='💼'){
    return <TrabajoEmbed isMobile={isMobile} onBack={onBack}/>;
  }

  const areaObjectives=data.objectives.filter(o=>o.areaId===areaId);
  const areaProjects=data.projects.filter(p=>p.areaId===areaId);
  const areaNotes=data.notes.filter(n=>n.areaId===areaId).sort((a,b)=>b.createdAt>a.createdAt?1:-1);
  const notesWithAmount=areaNotes.filter(n=>n.amount);
  const totalSpent=notesWithAmount.reduce((s,n)=>s+(n.amount||0),0);
  const areaBudget=(data.budget||[]).filter(b=>b.areaId===areaId);
  const totalBudget=areaBudget.reduce((s,b)=>s+(b.amount||0),0);

  const delBudget=(id)=>{const u=(data.budget||[]).filter(b=>b.id!==id);setData(d=>({...d,budget:u}));save('budget',u);};

  // Group spending by month
  const spendingByMonth={};
  notesWithAmount.forEach(n=>{
    const m=n.createdAt?.slice(0,7)||'sin-fecha';
    if(!spendingByMonth[m])spendingByMonth[m]={total:0,items:[]};
    spendingByMonth[m].total+=n.amount;
    spendingByMonth[m].items.push(n);
  });

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
        {onBack&&(
          <button onClick={onBack} style={{background:'none',border:`1px solid ${T.border}`,borderRadius:10,padding:'6px 10px',cursor:'pointer',color:T.muted,display:'flex',alignItems:'center',gap:4,fontFamily:'inherit',fontSize:12,flexShrink:0}}>
            <Icon name="back" size={16}/><span style={{fontSize:12,fontWeight:500}}>Áreas</span>
          </button>
        )}
        <div style={{width:44,height:44,borderRadius:12,background:`${area.color}22`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>{area.icon}</div>
        <div style={{flex:1}}>
          <h2 style={{margin:0,color:T.text,fontSize:isMobile?20:24,fontWeight:700}}>{area.name}</h2>
          <p style={{color:T.muted,fontSize:12,margin:0}}>{areaObjectives.length} objetivos · {areaProjects.length} proyectos · {areaNotes.length} notas</p>
        </div>
      </div>

      {/* Quick nav */}
      <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
        <Btn size="sm" onClick={()=>onNavigate&&onNavigate('objectives',`area:${areaId}`)}><Icon name="target" size={12}/>Objetivos ({areaObjectives.length})</Btn>
        <Btn size="sm" onClick={()=>onNavigate&&onNavigate('projects',areaProjects[0]?`obj:${areaProjects[0].objectiveId}`:null)}><Icon name="folder" size={12}/>Proyectos ({areaProjects.length})</Btn>
      </div>

      {/* Financial Summary — solo si hay registros de gasto en esta área */}
      {notesWithAmount.length>0&&(
        <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr 1fr':'repeat(3,1fr)',gap:10,marginBottom:20}}>
          <Card style={{textAlign:'center',padding:14}}>
            <div style={{fontSize:11,color:T.muted,marginBottom:4}}>Gastado total</div>
            <div style={{fontSize:22,fontWeight:700,color:T.red}}>${totalSpent.toLocaleString()}</div>
            <div style={{fontSize:10,color:T.dim}}>{notesWithAmount.length} registros</div>
          </Card>
          <Card style={{textAlign:'center',padding:14}}>
            <div style={{fontSize:11,color:T.muted,marginBottom:4}}>Este mes</div>
            <div style={{fontSize:22,fontWeight:700,color:T.text}}>${(spendingByMonth[today().slice(0,7)]?.total||0).toLocaleString()}</div>
            <div style={{fontSize:10,color:T.dim}}>{spendingByMonth[today().slice(0,7)]?.items?.length||0} gastos</div>
          </Card>
          {areaBudget.length>0&&<Card style={{textAlign:'center',padding:14}}>
            <div style={{fontSize:11,color:T.muted,marginBottom:4}}>Presupuesto/mes</div>
            <div style={{fontSize:22,fontWeight:700,color:T.accent}}>${totalBudget.toLocaleString()}</div>
            <div style={{fontSize:10,color:T.dim}}>{areaBudget.length} items fijos</div>
          </Card>}
        </div>
      )}

      {/* Budget items — solo si esta área ya tiene gastos fijos asignados */}
      {areaBudget.length>0&&(
        <div style={{marginBottom:24}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
            <h3 style={{color:T.text,fontSize:14,fontWeight:600,margin:0}}>💳 Presupuesto fijo</h3>
          </div>
          {areaBudget.map(b=>(
            <div key={b.id} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,marginBottom:8}}>
              <div style={{flex:1}}>
                <div style={{color:T.text,fontSize:14,fontWeight:500}}>{b.title}</div>
                <div style={{color:T.muted,fontSize:11}}>Día {b.dayOfMonth} de cada mes</div>
              </div>
              <div style={{color:T.accent,fontWeight:700,fontSize:15}}>${b.amount.toLocaleString()}</div>
              <button onClick={()=>delBudget(b.id)} style={{background:'none',border:'none',color:T.dim,cursor:'pointer',padding:4,display:'flex'}}><Icon name="trash" size={13}/></button>
            </div>
          ))}
        </div>
      )}

      {/* Spending history */}
      {notesWithAmount.length>0&&(
        <div style={{marginBottom:24}}>
          <h3 style={{color:T.text,fontSize:14,fontWeight:600,margin:'0 0 12px'}}>📊 Historial de gastos</h3>
          {Object.entries(spendingByMonth).sort(([a],[b])=>b.localeCompare(a)).map(([month,{total,items}])=>(
            <div key={month} style={{marginBottom:16}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                <span style={{color:T.muted,fontSize:12,fontWeight:600,textTransform:'uppercase'}}>{new Date(month+'-01').toLocaleDateString('es-ES',{month:'long',year:'numeric'})}</span>
                <span style={{color:T.red,fontSize:13,fontWeight:700}}>−${total.toLocaleString()}</span>
              </div>
              {items.map(n=>(
                <div key={n.id} onClick={()=>onNavigate&&onNavigate('notes',n.id)}
                  style={{display:'flex',alignItems:'center',gap:10,padding:'8px 12px',background:T.surface,borderRadius:8,marginBottom:4,cursor:'pointer',border:`1px solid ${T.border}`}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{color:T.text,fontSize:13,fontWeight:500}}>{n.title}</div>
                    <div style={{display:'flex',gap:4,marginTop:2}}>
                      {n.tags?.slice(0,3).map(t=><span key={t} style={{fontSize:9,color:T.accent,background:`${T.accent}15`,padding:'1px 5px',borderRadius:6}}>{t}</span>)}
                    </div>
                  </div>
                  <span style={{color:T.red,fontSize:13,fontWeight:600,flexShrink:0}}>−${n.amount.toLocaleString()}</span>
                  <span style={{color:T.dim,fontSize:10,flexShrink:0}}>{fmt(n.createdAt)}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Recent notes without amounts */}
      {areaNotes.filter(n=>!n.amount).length>0&&(
        <div>
          <h3 style={{color:T.text,fontSize:14,fontWeight:600,margin:'0 0 12px'}}>📝 Notas</h3>
          {areaNotes.filter(n=>!n.amount).slice(0,5).map(n=>(
            <div key={n.id} onClick={()=>onNavigate&&onNavigate('notes',n.id)}
              style={{padding:'10px 14px',background:T.surface,borderRadius:10,marginBottom:8,cursor:'pointer',border:`1px solid ${T.border}`,borderLeft:`3px solid ${area.color}`}}>
              <div style={{color:T.text,fontSize:13,fontWeight:500}}>{n.title}</div>
              <div style={{color:T.muted,fontSize:11,marginTop:3}}>{fmt(n.createdAt)}</div>
            </div>
          ))}
        </div>
      )}


    </div>
  );
};

// ===================== OBJECTIVES =====================
const Objectives = ({data,setData,isMobile,viewHint,onConsumeHint,onNavigate}) => {
  const [modal,setModal]=useState(false);
  const [form,setForm]=useState({title:'',areaId:'',deadline:'',status:'active'});
  const [view,setView]=useState('list');
  const [selected,setSelected]=useState(null);
  const [checkinModal,setCheckinModal]=useState(null);
  const [checkinForm,setCheckinForm]=useState({mood:'🟢',note:''});

  const [areaFilter,setAreaFilter]=useState(()=>viewHint?.startsWith('area:')?viewHint.slice(5):null);
  useEffect(()=>{
    if(viewHint?.startsWith('area:')){setAreaFilter(viewHint.slice(5));onConsumeHint?.();}
  },[viewHint]);

  const filteredArea=areaFilter?data.areas.find(a=>a.id===areaFilter):null;
  const allObj=areaFilter?data.objectives.filter(o=>o.areaId===areaFilter):data.objectives;

  const saveObj=()=>{
    if(!form.title.trim())return;
    const updated=[...data.objectives,{id:uid(),...form,milestones:[],checkins:[]}];
    setData(d=>({...d,objectives:updated}));save('objectives',updated);
    setModal(false);toast.success('Objetivo guardado');setForm({title:'',areaId:areaFilter||'',deadline:'',status:'active'});
  };
  const toggle=(id)=>{const u=data.objectives.map(o=>o.id===id?{...o,status:o.status==='active'?'done':'active',completedAt:o.status==='active'?today():null}:o);setData(d=>({...d,objectives:u}));save('objectives',u);};
  const del=(id)=>{const u=data.objectives.filter(o=>o.id!==id);setData(d=>({...d,objectives:u}));save('objectives',u);if(selected===id)setSelected(null);};

  // Milestones
  const [msForm,setMsForm]=useState({text:'',dueDate:'',weight:20});
  const addMilestone=(objId)=>{
    if(!msForm.text.trim())return;
    const m={id:uid(),text:msForm.text,dueDate:msForm.dueDate||'',weight:Number(msForm.weight)||20,done:false};
    const u=data.objectives.map(o=>o.id!==objId?o:{...o,milestones:[...(o.milestones||[]),m]});
    setData(d=>({...d,objectives:u}));save('objectives',u);
    setMsForm({text:'',dueDate:'',weight:20});
  };
  const toggleMilestone=(objId,msId)=>{
    const u=data.objectives.map(o=>o.id!==objId?o:{...o,milestones:(o.milestones||[]).map(m=>m.id!==msId?m:{...m,done:!m.done})});
    setData(d=>({...d,objectives:u}));save('objectives',u);
  };
  const delMilestone=(objId,msId)=>{
    const u=data.objectives.map(o=>o.id!==objId?o:{...o,milestones:(o.milestones||[]).filter(m=>m.id!==msId)});
    setData(d=>({...d,objectives:u}));save('objectives',u);
  };
  const updateMilestone=(objId,msId,patch)=>{
    const u=data.objectives.map(o=>o.id!==objId?o:{...o,milestones:(o.milestones||[]).map(m=>m.id!==msId?m:{...m,...patch})});
    setData(d=>({...d,objectives:u}));save('objectives',u);
  };

  // Check-ins
  const saveCheckin=(objId)=>{
    if(!checkinForm.note.trim())return;
    const ci={id:uid(),...checkinForm,date:today()};
    const u=data.objectives.map(o=>o.id!==objId?o:{...o,checkins:[ci,...(o.checkins||[])]});
    setData(d=>({...d,objectives:u}));save('objectives',u);
    setCheckinModal(null);setCheckinForm({mood:'🟢',note:''});
  };

  const getMsPct=(o)=>{
    const ms=o.milestones||[];
    if(!ms.length)return null;
    const totalWeight=ms.reduce((s,m)=>s+(m.weight||20),0);
    if(!totalWeight)return Math.round(ms.filter(m=>m.done).length/ms.length*100);
    const doneWeight=ms.filter(m=>m.done).reduce((s,m)=>s+(m.weight||20),0);
    return Math.round(doneWeight/totalWeight*100);
  };
  const getTaskPct=(o)=>{
    const relProj=data.projects.filter(p=>p.objectiveId===o.id);
    const projTasks=data.tasks.filter(t=>relProj.some(p=>p.id===t.projectId));
    const directTasks=data.tasks.filter(t=>t.objectiveId===o.id);
    const allTasks=[...projTasks,...directTasks.filter(dt=>!projTasks.some(pt=>pt.id===dt.id))];
    if(!allTasks.length)return null;
    return Math.round(allTasks.filter(t=>t.status==='done').length/allTasks.length*100);
  };
  const getPct=(o)=>{const a=getMsPct(o);const b=getTaskPct(o);return a!==null?a:b!==null?b:0;};

  const daysLeft=(dl)=>Math.ceil((new Date(dl)-new Date())/86400000);

  const selObj=selected?data.objectives.find(o=>o.id===selected):null;

  return (
    <div>
      {/* Header */}
      <div style={{marginBottom:16,display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
        <div>
          <h2 style={{margin:0,color:T.text,fontSize:isMobile?18:20,fontWeight:700}}>
            {filteredArea?`${filteredArea.icon} ${filteredArea.name}`:'🎯 Objetivos'}
          </h2>
          <p style={{color:T.muted,fontSize:13,marginTop:4,marginBottom:0}}>
            {filteredArea?<>Objetivos de esta área <button onClick={()=>setAreaFilter(null)} style={{marginLeft:6,background:'none',border:`1px solid ${T.border}`,borderRadius:6,padding:'1px 8px',cursor:'pointer',color:T.muted,fontSize:11,fontFamily:'inherit'}}>✕ Todos</button></>:'Metas concretas con milestones y check-ins.'}
          </p>
        </div>
        <div style={{display:'flex',gap:6,alignItems:'center'}}>
          <div style={{display:'flex',gap:3,background:T.surface2,borderRadius:9,padding:3}}>
            {[['list','☰'],['tree','🌳'],['done','✅']].map(([v,l])=>(
              <button key={v} onClick={()=>setView(v)}
                style={{padding:'4px 10px',borderRadius:6,border:'none',background:view===v?T.accent:'transparent',color:view===v?'#000':T.muted,cursor:'pointer',fontSize:12,fontFamily:'inherit',fontWeight:view===v?700:400}}>
                {l}
              </button>
            ))}
          </div>
          <Btn onClick={()=>setModal(true)} size="sm"><Icon name="plus" size={14}/>Nuevo</Btn>
        </div>
      </div>

      {/* LIST VIEW */}
      {view==='list'&&(
        <div>
          {['active','done'].map(status=>{
            const list=allObj.filter(o=>o.status===status);
            if(!list.length)return null;
            return (
              <div key={status} style={{marginBottom:24}}>
                <h3 style={{color:T.muted,fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:1,marginBottom:12}}>{status==='active'?'Activos':'Completados'}</h3>
                {list.map(o=>{
                  const area=data.areas.find(a=>a.id===o.areaId);
                  const pct=getPct(o);
                  const msPct=getMsPct(o);
                  const taskPct=getTaskPct(o);
                  const isOverdue=o.deadline&&o.deadline<today()&&status==='active';
                  const dl=o.deadline?daysLeft(o.deadline):null;
                  const isSel=selected===o.id;
                  return (
                    <div key={o.id} style={{marginBottom:8}}>
                      <Card style={{opacity:status==='done'?0.65:1,border:`1px solid ${isSel?T.accent:T.border}`}}>
                        <div style={{display:'flex',alignItems:'flex-start',gap:10}}>
                          <button onClick={e=>{e.stopPropagation();toggle(o.id);}}
                            style={{width:22,height:22,borderRadius:'50%',border:`2px solid ${status==='done'?T.green:T.border}`,background:status==='done'?T.green:'transparent',cursor:'pointer',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',marginTop:2}}>
                            {status==='done'&&<Icon name="check" size={11} color="#000"/>}
                          </button>
                          <div style={{flex:1,minWidth:0,cursor:'pointer'}} onClick={()=>setSelected(isSel?null:o.id)}>
                            <div style={{color:T.text,fontWeight:600,fontSize:14,textDecoration:status==='done'?'line-through':'none',marginBottom:5}}>{o.title}</div>
                            {/* Progress bars */}
                            {(msPct!==null||taskPct!==null)&&(
                              <div style={{display:'flex',flexDirection:'column',gap:4,marginBottom:6}}>
                                {msPct!==null&&(
                                  <div>
                                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:2}}>
                                      <span style={{color:T.dim,fontSize:10}}>🏁 Milestones</span>
                                      <span style={{color:T.accent,fontSize:10,fontWeight:600}}>{msPct}%</span>
                                    </div>
                                    <div style={{height:3,background:T.border,borderRadius:2}}>
                                      <div style={{height:'100%',width:`${msPct}%`,background:T.accent,borderRadius:2,transition:'width 0.4s'}}/>
                                    </div>
                                  </div>
                                )}
                                {taskPct!==null&&(
                                  <div>
                                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:2}}>
                                      <span style={{color:T.dim,fontSize:10}}>✅ Tareas</span>
                                      <span style={{color:T.muted,fontSize:10}}>{taskPct}%</span>
                                    </div>
                                    <div style={{height:3,background:T.border,borderRadius:2}}>
                                      <div style={{height:'100%',width:`${taskPct}%`,background:T.muted,borderRadius:2,transition:'width 0.4s'}}/>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                            <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
                              {area&&<Tag text={`${area.icon} ${area.name}`} color={area.color}/>}
                              {o.deadline&&<span style={{color:isOverdue?T.red:dl&&dl<=7?T.orange:T.muted,fontSize:12,fontWeight:isOverdue||dl<=7?600:400}}>{isOverdue?'⚠️ Vencido: ':dl&&dl<=7?`⏰ ${dl}d: `:'📅 '}{fmt(o.deadline)}</span>}
                              {status==='done'&&o.completedAt&&<span style={{color:T.green,fontSize:12,fontWeight:600}}>✅ Completado {fmt(o.completedAt)}</span>}
                              <span onClick={e=>{e.stopPropagation();onNavigate&&onNavigate('projects',`obj:${o.id}`);}}
                                style={{color:T.blue,fontSize:12,fontWeight:600,cursor:'pointer'}}>
                                📁 {data.projects.filter(p=>p.objectiveId===o.id).length} proyectos →
                              </span>
                            </div>
                          </div>
                          <div style={{display:'flex',gap:4,flexShrink:0}}>
                            <button onClick={e=>{e.stopPropagation();setCheckinModal(o.id);setCheckinForm({mood:'🟢',note:''});}}
                              style={{background:`${T.blue}15`,border:`1px solid ${T.blue}30`,borderRadius:7,color:T.blue,cursor:'pointer',padding:'3px 7px',fontSize:11,fontFamily:'inherit'}}>
                              ✍️
                            </button>
                            <button onClick={e=>{e.stopPropagation();del(o.id);}} style={{background:'none',border:'none',color:T.dim,cursor:'pointer',padding:4,display:'flex'}}><Icon name="trash" size={13}/></button>
                          </div>
                        </div>
                      </Card>

                      {/* Inline detail: milestones + checkins */}
                      {isSel&&(
                        <div style={{background:T.surface2,border:`1px solid ${T.border}`,borderTop:'none',borderRadius:'0 0 12px 12px',padding:'14px 16px'}}>
                          {/* Milestones */}
                          <div style={{marginBottom:14}}>
                            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                              <div style={{fontSize:12,fontWeight:700,color:T.text}}>🏁 Milestones</div>
                              {(o.milestones||[]).length>0&&(()=>{
                                const totalW=(o.milestones||[]).reduce((s,m)=>s+(m.weight||20),0);
                                const isBalanced=Math.abs(totalW-100)<=2;
                                return (
                                  <span style={{fontSize:10,color:isBalanced?T.accent:T.orange,fontWeight:600,background:isBalanced?`${T.accent}15`:`${T.orange}15`,padding:'2px 8px',borderRadius:8}}>
                                    {isBalanced?`✓ ${totalW}% balanceado`:`Σ ${totalW}% — ajustar pesos`}
                                  </span>
                                );
                              })()}
                            </div>

                            {(o.milestones||[]).map((m,mi)=>{
                              const msOverdue=m.dueDate&&m.dueDate<today()&&!m.done;
                              const msDue=m.dueDate?daysLeft(m.dueDate):null;
                              return (
                                <div key={m.id} style={{
                                  display:'flex',alignItems:'flex-start',gap:8,
                                  padding:'8px 10px',marginBottom:5,
                                  background:m.done?`${T.accent}06`:T.bg,
                                  borderRadius:9,
                                  border:`1px solid ${msOverdue?T.red+'40':m.done?T.accent+'30':T.border}`,
                                  transition:'all 0.15s',
                                }}>
                                  {/* Toggle */}
                                  <button onClick={()=>toggleMilestone(o.id,m.id)}
                                    style={{width:18,height:18,borderRadius:5,border:`2px solid ${m.done?T.accent:T.border}`,
                                      background:m.done?T.accent:'transparent',cursor:'pointer',flexShrink:0,
                                      display:'flex',alignItems:'center',justifyContent:'center',marginTop:1,transition:'all 0.15s'}}>
                                    {m.done&&<span style={{color:'#000',fontSize:10,fontWeight:900,lineHeight:1}}>✓</span>}
                                  </button>

                                  {/* Text + meta */}
                                  <div style={{flex:1,minWidth:0}}>
                                    <div style={{fontSize:12,color:m.done?T.muted:T.text,textDecoration:m.done?'line-through':'none',lineHeight:1.4}}>{m.text}</div>
                                    <div style={{display:'flex',gap:6,marginTop:4,flexWrap:'wrap',alignItems:'center'}}>
                                      {/* Weight badge */}
                                      <span style={{fontSize:10,fontWeight:700,
                                        color:m.done?T.accent:T.blue,
                                        background:m.done?`${T.accent}15`:`${T.blue}15`,
                                        padding:'1px 7px',borderRadius:6,cursor:'pointer'}}
                                        title="Click para editar peso"
                                        onClick={()=>{
                                          const v=window.prompt(`Peso de este milestone (1–100):`,m.weight||20);
                                          if(v&&!isNaN(v))updateMilestone(o.id,m.id,{weight:Math.min(100,Math.max(1,Number(v)))});
                                        }}>
                                        {m.weight||20}%
                                      </span>
                                      {/* Due date */}
                                      {m.dueDate?(
                                        <span style={{fontSize:10,color:msOverdue?T.red:msDue&&msDue<=3?T.orange:T.muted,
                                          fontWeight:msOverdue||msDue<=3?600:400,
                                          background:msOverdue?`${T.red}12`:msDue<=3&&!m.done?`${T.orange}12`:'transparent',
                                          padding:msOverdue||msDue<=3?'1px 6px':'0',borderRadius:5}}>
                                          {msOverdue?`⚠️ Vencido ${fmt(m.dueDate)}`:msDue<=0?'📅 Hoy':msDue===1?'📅 Mañana':`📅 ${fmt(m.dueDate)}`}
                                        </span>
                                      ):(
                                        <button onClick={()=>{
                                          const v=window.prompt('Fecha límite (YYYY-MM-DD):',today());
                                          if(v)updateMilestone(o.id,m.id,{dueDate:v});
                                        }} style={{fontSize:10,color:T.dim,background:'none',border:'none',cursor:'pointer',padding:0,fontFamily:'inherit'}}>
                                          + fecha
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {/* Delete */}
                                  <button onClick={()=>delMilestone(o.id,m.id)}
                                    style={{background:'none',border:'none',color:T.dim,cursor:'pointer',padding:2,flexShrink:0}}>
                                    <Icon name="trash" size={10}/>
                                  </button>
                                </div>
                              );
                            })}

                            {/* Weighted progress bar */}
                            {(o.milestones||[]).length>0&&(()=>{
                              const ms=o.milestones||[];
                              const totalW=ms.reduce((s,m)=>s+(m.weight||20),0)||1;
                              let cumX=0;
                              return (
                                <div style={{marginTop:10,marginBottom:12}}>
                                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                                    <span style={{fontSize:10,color:T.muted}}>Progreso ponderado</span>
                                    <span style={{fontSize:11,fontWeight:700,color:T.accent}}>{getMsPct(o)}%</span>
                                  </div>
                                  {/* Segmented bar */}
                                  <div style={{height:8,display:'flex',borderRadius:5,overflow:'hidden',gap:1,background:T.border}}>
                                    {ms.map((m,i)=>{
                                      const segW=(m.weight||20)/totalW*100;
                                      return (
                                        <div key={m.id} style={{
                                          width:`${segW}%`,height:'100%',flexShrink:0,
                                          background:m.done?T.accent:`${T.accent}25`,
                                          transition:'background 0.3s',
                                        }} title={`${m.text} (${m.weight||20}%)`}/>
                                      );
                                    })}
                                  </div>
                                  <div style={{display:'flex',gap:2,marginTop:3}}>
                                    {ms.map(m=>(
                                      <div key={m.id} style={{flex:`${m.weight||20}`,textAlign:'center',fontSize:8,color:m.done?T.accent:T.dim,overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis',minWidth:0}} title={m.text}>
                                        {m.text.slice(0,8)}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })()}

                            {/* Add milestone form */}
                            <div style={{display:'flex',flexDirection:'column',gap:6,marginTop:8,background:T.surface,border:`1px solid ${T.border}`,borderRadius:9,padding:'10px 12px'}}>
                              <input value={msForm.text} onChange={e=>setMsForm(f=>({...f,text:e.target.value}))}
                                onKeyDown={e=>{if(e.key==='Enter')addMilestone(o.id);}}
                                placeholder="Nombre del milestone…"
                                style={{background:'transparent',border:'none',borderBottom:`1px solid ${T.border}`,color:T.text,padding:'4px 0',fontSize:12,outline:'none',fontFamily:'inherit',width:'100%'}}/>
                              <div style={{display:'flex',gap:8,alignItems:'center'}}>
                                <div style={{flex:1}}>
                                  <label style={{fontSize:9,color:T.muted,display:'block',marginBottom:3}}>Fecha límite</label>
                                  <input type="date" value={msForm.dueDate} onChange={e=>setMsForm(f=>({...f,dueDate:e.target.value}))}
                                    style={{width:'100%',background:T.bg,border:`1px solid ${T.border}`,color:T.muted,padding:'4px 8px',borderRadius:6,fontSize:11,outline:'none',fontFamily:'inherit'}}/>
                                </div>
                                <div style={{width:72}}>
                                  <label style={{fontSize:9,color:T.muted,display:'block',marginBottom:3}}>Peso (%)</label>
                                  <input type="number" min="1" max="100" value={msForm.weight} onChange={e=>setMsForm(f=>({...f,weight:e.target.value}))}
                                    style={{width:'100%',background:T.bg,border:`1px solid ${T.border}`,color:T.text,padding:'4px 8px',borderRadius:6,fontSize:11,outline:'none',fontFamily:'inherit',textAlign:'center'}}/>
                                </div>
                                <button onClick={()=>addMilestone(o.id)}
                                  style={{marginTop:14,padding:'5px 14px',borderRadius:8,border:'none',background:T.accent,color:'#000',cursor:'pointer',fontSize:12,fontWeight:700,fontFamily:'inherit',flexShrink:0}}>+</button>
                              </div>
                            </div>
                          </div>

                          {/* Check-ins */}
                          {(o.checkins||[]).length>0&&(
                            <div>
                              <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:8}}>📝 Check-ins</div>
                              {(o.checkins||[]).slice(0,3).map((ci,i)=>(
                                <div key={ci.id||i} style={{display:'flex',gap:8,padding:'6px 0',borderBottom:`1px solid ${T.border}`}}>
                                  <span style={{fontSize:14,flexShrink:0}}>{ci.mood}</span>
                                  <div><div style={{fontSize:10,color:T.muted}}>{ci.date}</div><div style={{fontSize:12,color:T.text,marginTop:1}}>{ci.note}</div></div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
          {!allObj.length&&(
            <div style={{textAlign:'center',padding:'40px 0',color:T.dim}}>
              <Icon name="target" size={40}/><p style={{marginBottom:12}}>Sin objetivos aún</p>
              <Btn onClick={()=>setModal(true)} size="sm"><Icon name="plus" size={14}/>Crear primer objetivo</Btn>
            </div>
          )}
        </div>
      )}

      {/* TREE VIEW */}
      {view==='tree'&&(
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {data.areas.filter(a=>!areaFilter||a.id===areaFilter).map(area=>{
            const aObjs=data.objectives.filter(o=>o.areaId===area.id&&o.status==='active');
            if(!aObjs.length)return null;
            return (
              <Card key={area.id} style={{padding:14}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
                  <div style={{width:10,height:10,borderRadius:3,background:area.color,flexShrink:0}}/>
                  <span style={{fontSize:13,fontWeight:700,color:area.color}}>{area.icon} {area.name}</span>
                </div>
                {aObjs.map(o=>{
                  const pct=getPct(o);
                  const relProj=data.projects.filter(p=>p.objectiveId===o.id);
                  return (
                    <div key={o.id} style={{marginLeft:16,borderLeft:`2px solid ${area.color}40`,paddingLeft:12,marginBottom:10}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                        <span style={{fontSize:13,fontWeight:600,color:T.text,cursor:'pointer'}} onClick={()=>{setView('list');setSelected(o.id);}}>{o.title}</span>
                        <span style={{fontSize:12,fontWeight:700,color:T.accent}}>{pct}%</span>
                      </div>
                      <div style={{height:4,background:T.border,borderRadius:2,marginBottom:6,overflow:'hidden'}}>
                        <div style={{height:'100%',width:`${pct}%`,background:area.color,borderRadius:2,transition:'width 0.5s'}}/>
                      </div>
                      {relProj.map(p=>{
                        const pTasks=data.tasks.filter(t=>t.projectId===p.id);
                        const pp=pTasks.length?Math.round(pTasks.filter(t=>t.status==='done').length/pTasks.length*100):0;
                        return (
                          <div key={p.id} style={{marginLeft:16,borderLeft:`2px solid ${T.border}`,paddingLeft:10,marginBottom:5}}>
                            <div style={{display:'flex',justifyContent:'space-between',marginBottom:2}}>
                              <span style={{fontSize:11,color:T.muted}}>📁 {p.title}</span>
                              <span style={{fontSize:9,color:pp===100?T.accent:T.muted}}>{pTasks.filter(t=>t.status==='done').length}/{pTasks.length}</span>
                            </div>
                            <div style={{height:2,background:T.border,borderRadius:1,overflow:'hidden'}}>
                              <div style={{height:'100%',width:`${pp}%`,background:pp===100?T.accent:T.blue,borderRadius:1,opacity:0.6}}/>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </Card>
            );
          })}
        </div>
      )}

      {/* COMPLETED HISTORY VIEW */}
      {view==='done'&&(
        <div>
          {(()=>{
            const doneObjs=[...allObj.filter(o=>o.status==='done')].sort((a,b)=>(b.completedAt||'').localeCompare(a.completedAt||''));
            if(!doneObjs.length) return (
              <div style={{textAlign:'center',padding:'40px 0',color:T.dim}}>
                <div style={{fontSize:40,marginBottom:8}}>🏆</div>
                <p style={{fontSize:14,marginBottom:4}}>Sin objetivos completados aún</p>
                <p style={{fontSize:12,color:T.dim}}>Cuando completes un objetivo aparecerá aquí con su fecha y milestones.</p>
              </div>
            );
            // Group by month
            const byMonth={};
            doneObjs.forEach(o=>{
              const key=o.completedAt?o.completedAt.slice(0,7):'sin-fecha';
              if(!byMonth[key])byMonth[key]=[];
              byMonth[key].push(o);
            });
            return Object.entries(byMonth).map(([month,objs])=>(
              <div key={month} style={{marginBottom:20}}>
                <h3 style={{color:T.muted,fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:1,marginBottom:10}}>
                  {month==='sin-fecha'?'Sin fecha':new Date(month+'-01').toLocaleDateString('es-ES',{month:'long',year:'numeric'})}
                </h3>
                {objs.map(o=>{
                  const area=data.areas.find(a=>a.id===o.areaId);
                  const ms=o.milestones||[];
                  const checkins=o.checkins||[];
                  const pct=getPct(o);
                  const relProj=data.projects.filter(p=>p.objectiveId===o.id);
                  const directTasks=data.tasks.filter(t=>t.objectiveId===o.id);
                  const totalTasks=relProj.reduce((s,p)=>s+data.tasks.filter(t=>t.projectId===p.id).length,0)+directTasks.length;
                  return (
                    <Card key={o.id} style={{marginBottom:8,borderLeft:`3px solid ${area?.color||T.green}`}}>
                      <div style={{display:'flex',alignItems:'flex-start',gap:10}}>
                        <div style={{width:28,height:28,borderRadius:'50%',background:T.green,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                          <span style={{color:'#000',fontSize:13,fontWeight:900}}>✓</span>
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{color:T.text,fontWeight:600,fontSize:14,marginBottom:4}}>{o.title}</div>
                          <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center',fontSize:11}}>
                            {area&&<span style={{color:area.color,fontWeight:600}}>{area.icon} {area.name}</span>}
                            {o.completedAt&&<span style={{color:T.green,fontWeight:600}}>✅ {fmt(o.completedAt)}</span>}
                            {o.deadline&&<span style={{color:T.muted}}>📅 Meta: {fmt(o.deadline)}</span>}
                            {ms.length>0&&<span style={{color:T.accent}}>🏁 {ms.filter(m=>m.done).length}/{ms.length} milestones</span>}
                            {totalTasks>0&&<span style={{color:T.muted}}>📋 {totalTasks} tareas</span>}
                            {relProj.length>0&&<span style={{color:T.blue}}>📁 {relProj.length} proyectos</span>}
                            {checkins.length>0&&<span style={{color:T.muted}}>📝 {checkins.length} check-ins</span>}
                          </div>
                          {/* Show milestone list if any */}
                          {ms.length>0&&(
                            <div style={{marginTop:8,display:'flex',flexDirection:'column',gap:3}}>
                              {ms.slice(0,4).map(m=>(
                                <div key={m.id} style={{display:'flex',alignItems:'center',gap:6,fontSize:11}}>
                                  <span style={{color:m.done?T.accent:T.dim}}>{m.done?'✓':'○'}</span>
                                  <span style={{color:m.done?T.muted:T.dim,textDecoration:m.done?'line-through':'none'}}>{m.text}</span>
                                </div>
                              ))}
                              {ms.length>4&&<span style={{fontSize:10,color:T.dim}}>+{ms.length-4} más</span>}
                            </div>
                          )}
                        </div>
                        <button onClick={()=>toggle(o.id)} title="Reactivar objetivo"
                          style={{background:'none',border:`1px solid ${T.border}`,borderRadius:7,padding:'3px 8px',cursor:'pointer',color:T.muted,fontSize:10,fontFamily:'inherit',flexShrink:0}}>
                          ↩ Reactivar
                        </button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ));
          })()}
        </div>
      )}

      {/* New objective modal */}
      {modal&&(
        <Modal title="Nuevo objetivo" onClose={()=>setModal(false)}>
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <Input value={form.title} onChange={v=>setForm(f=>({...f,title:v}))} placeholder="¿Qué quieres lograr?"/>
            <Select value={form.areaId||areaFilter||''} onChange={v=>setForm(f=>({...f,areaId:v}))}>
              <option value="">Sin área</option>
              {data.areas.map(a=><option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
            </Select>
            <Input type="date" value={form.deadline} onChange={v=>setForm(f=>({...f,deadline:v}))}/>
            <Btn onClick={saveObj} style={{width:'100%',justifyContent:'center'}}>Crear objetivo</Btn>
          </div>
        </Modal>
      )}

      {/* Check-in modal */}
      {checkinModal&&(
        <Modal title="Check-in semanal" onClose={()=>setCheckinModal(null)}>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <div style={{fontSize:13,color:T.muted}}>¿Cómo va este objetivo?</div>
            <div style={{display:'flex',gap:6}}>
              {['🟢','🟡','🔴'].map(m=>(
                <button key={m} onClick={()=>setCheckinForm(f=>({...f,mood:m}))}
                  style={{flex:1,padding:'8px',borderRadius:10,border:`2px solid ${checkinForm.mood===m?T.accent:T.border}`,background:checkinForm.mood===m?`${T.accent}18`:'transparent',cursor:'pointer',fontSize:20}}>
                  {m}
                </button>
              ))}
            </div>
            <Textarea value={checkinForm.note} onChange={v=>setCheckinForm(f=>({...f,note:v}))} placeholder="¿Qué avanzaste? ¿Qué bloqueó?" rows={3}/>
            <Btn onClick={()=>saveCheckin(checkinModal)} style={{width:'100%',justifyContent:'center'}}>Guardar check-in</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};


// ===================== PROJECTS & TASKS =====================
const ProjectsAndTasks = ({data,setData,isMobile,viewHint,onConsumeHint,onNavigate}) => {
  const [selProject,setSelProject]=useState(null);
  const [showDetail,setShowDetail]=useState(false);
  const [projModal,setProjModal]=useState(false);
  const [taskModal,setTaskModal]=useState(false);
  const [projForm,setProjForm]=useState({title:'',objectiveId:'',areaId:'',status:'active'});
  const [taskForm,setTaskForm]=useState({title:'',priority:'media',dueDate:'',recurrence:'none'});
  const [objFilter,setObjFilter]=useState(null);
  const [kanbanView,setKanbanView]=useState(false);
  const [listView,setListView]=useState('list');
  const [filterPriority,setFilterPriority]=useState('all');
  const [filterArea,setFilterArea]=useState('all');
  const [filterDeadline,setFilterDeadline]=useState('all');
  const [selectedTasks,setSelectedTasks]=useState([]);
  const [dragTask,setDragTask]=useState(null);
  const [expandedTask,setExpandedTask]=useState(null);

  const UNASSIGNED={id:'__unassigned__',title:'📥 Sin proyecto'};
  const unassignedTasks=data.tasks.filter(t=>!t.projectId);

  useEffect(()=>{
    if(viewHint==='pending'){
      if(unassignedTasks.length>0){setSelProject(UNASSIGNED);if(isMobile)setShowDetail(true);}
      onConsumeHint?.();
    } else if(typeof viewHint==='string'&&viewHint.startsWith('obj:')){
      const oId=viewHint.slice(4);setObjFilter(oId);
      const firstProj=data.projects.find(p=>p.objectiveId===oId);
      if(firstProj){setSelProject(firstProj);if(isMobile)setShowDetail(true);}
      else{setSelProject(null);setShowDetail(false);}
      onConsumeHint?.();
    }
  },[viewHint]);

  const saveProj=()=>{
    if(!projForm.title.trim())return;
    const updated=[...data.projects,{id:uid(),...projForm}];
    setData(d=>({...d,projects:updated}));save('projects',updated);
    setProjModal(false);setProjForm({title:'',objectiveId:'',areaId:'',status:'active'});
  };
  const saveTask=()=>{
    if(!taskForm.title.trim()||!selProject)return;
    const pid=selProject.id==='__unassigned__'?'':selProject.id;
    const updated=[...data.tasks,{id:uid(),projectId:pid,status:'todo',subtasks:[],...taskForm}];
    setData(d=>({...d,tasks:updated}));save('tasks',updated);
    setTaskModal(false);setTaskForm({title:'',priority:'media',dueDate:'',recurrence:'none'});
  };
  const [editTask,setEditTask]=useState(null);
  const [editTaskForm,setEditTaskForm]=useState({title:'',priority:'media',dueDate:''});
  const nextRecurDate=(dueDate,recurrence)=>{
    if(!dueDate||recurrence==='none')return '';
    const d=new Date(dueDate+'T12:00:00');
    if(recurrence==='daily')  d.setDate(d.getDate()+1);
    if(recurrence==='weekly') d.setDate(d.getDate()+7);
    if(recurrence==='monthly')d.setMonth(d.getMonth()+1);
    return d.toISOString().slice(0,10);
  };
  const toggleTask=(id)=>{
    const task=data.tasks.find(t=>t.id===id);
    const nowDone=task?.status!=='done';
    let updated=data.tasks.map(t=>t.id===id?{...t,status:nowDone?'done':'todo'}:t);
    // Auto-create next occurrence when completing a recurring task
    if(nowDone&&task?.recurrence&&task.recurrence!=='none'){
      const nextDate=nextRecurDate(task.dueDate,task.recurrence);
      const clone={...task,id:uid(),status:'todo',dueDate:nextDate,createdAt:today()};
      updated=[...updated,clone];
      toast.info(`🔁 Tarea recurrente regenerada para ${nextDate||'la próxima vez'}`);
    }
    setData(d=>({...d,tasks:updated}));save('tasks',updated);
  };
  const delTask=(id)=>{if(!window.confirm('¿Eliminar esta tarea?'))return;const u=data.tasks.filter(t=>t.id!==id);setData(d=>({...d,tasks:u}));save('tasks',u);};
  const startEditTask=(t)=>{setEditTaskForm({title:t.title,priority:t.priority||'media',dueDate:t.dueDate||''});setEditTask(t.id);};
  const saveEditTask=()=>{const u=data.tasks.map(t=>t.id===editTask?{...t,...editTaskForm}:t);setData(d=>({...d,tasks:u}));save('tasks',u);setEditTask(null);};
  const delProj=(id)=>{
    const updP=data.projects.filter(p=>p.id!==id);
    const updT=data.tasks.filter(t=>t.projectId!==id);
    setData(d=>({...d,projects:updP,tasks:updT}));save('projects',updP);save('tasks',updT);
    if(selProject?.id===id){setSelProject(null);setShowDetail(false);}
  };
  const openProject=(p)=>{setSelProject(p);if(isMobile)setShowDetail(true);};
  const isUnassigned=selProject?.id==='__unassigned__';
  const pTasks=selProject?(isUnassigned?unassignedTasks:data.tasks.filter(t=>t.projectId===selProject.id)):[];
  const pColors={alta:T.red,media:T.accent,baja:T.green};

  // Subtask toggle
  const toggleSubtask=(taskId,subtaskId)=>{
    const u=data.tasks.map(t=>{
      if(t.id!==taskId)return t;
      return {...t,subtasks:(t.subtasks||[]).map(s=>s.id!==subtaskId?s:{...s,done:!s.done})};
    });
    setData(d=>({...d,tasks:u}));save('tasks',u);
  };

  // Bulk actions
  const bulkMarkDone=()=>{
    const u=data.tasks.map(t=>selectedTasks.includes(t.id)?{...t,status:'done'}:t);
    setData(d=>({...d,tasks:u}));save('tasks',u);
    toast.success(`✓ ${selectedTasks.length} tarea${selectedTasks.length!==1?'s':''} completada${selectedTasks.length!==1?'s':''}`);
    setSelectedTasks([]);
  };
  const bulkMoveToStatus=(status)=>{
    const u=data.tasks.map(t=>selectedTasks.includes(t.id)?{...t,status}:t);
    setData(d=>({...d,tasks:u}));save('tasks',u);
    const label=status==='todo'?'Pendiente':status==='in-progress'?'En progreso':'Completado';
    toast.success(`→ ${selectedTasks.length} tarea${selectedTasks.length!==1?'s':''} movida${selectedTasks.length!==1?'s':''} a ${label}`);
    setSelectedTasks([]);
  };
  const bulkDelete=()=>{
    if(!window.confirm(`¿Eliminar ${selectedTasks.length} tarea${selectedTasks.length!==1?'s':''}? Esta acción no se puede deshacer.`))return;
    const u=data.tasks.filter(t=>!selectedTasks.includes(t.id));
    setData(d=>({...d,tasks:u}));save('tasks',u);
    toast.info(`🗑 ${selectedTasks.length} tarea${selectedTasks.length!==1?'s':''} eliminada${selectedTasks.length!==1?'s':''}`);
    setSelectedTasks([]);
  };

  // Kanban move
  const moveToStatus=(taskId,newStatus)=>{
    const u=data.tasks.map(t=>t.id===taskId?{...t,status:newStatus}:t);
    setData(d=>({...d,tasks:u}));save('tasks',u);
  };

  const KANBAN_COLS=[
    {id:'todo',label:'Pendiente',color:T.muted},
    {id:'in-progress',label:'En progreso',color:T.blue},
    {id:'done',label:'Completado',color:T.accent},
  ];

  const filteredPTasks=pTasks.filter(t=>{
    if(filterPriority!=='all'&&t.priority!==filterPriority) return false;
    if(filterArea!=='all'){
      const proj=data.projects.find(p=>p.id===t.projectId);
      if((proj?.areaId||''  )!==filterArea) return false;
    }
    if(filterDeadline!=='all'){
      const td=today();
      if(filterDeadline==='overdue'  &&!(t.dueDate&&t.dueDate<td&&t.status!=='done'))  return false;
      if(filterDeadline==='today'    &&!(t.dueDate===td))                               return false;
      if(filterDeadline==='week'){
        const wEnd=new Date();wEnd.setDate(wEnd.getDate()+7);
        const we=wEnd.toISOString().slice(0,10);
        if(!(t.dueDate&&t.dueDate>=td&&t.dueDate<=we))                                 return false;
      }
      if(filterDeadline==='nodate'   &&t.dueDate)                                       return false;
    }
    return true;
  });
  const totalPTasks=pTasks.length;
  const donePTasks=pTasks.filter(t=>t.status==='done').length;
  const donePct=totalPTasks?Math.round(donePTasks/totalPTasks*100):0;
  const allVisibleIds=filteredPTasks.map(t=>t.id);
  const allSelected=allVisibleIds.length>0&&allVisibleIds.every(id=>selectedTasks.includes(id));
  const toggleSelectAll=()=>setSelectedTasks(allSelected?[]:allVisibleIds);

  const TaskRow=({t,showKanbanMove})=>{
    const isExpanded=expandedTask===t.id;
    const isSel=selectedTasks.includes(t.id);
    const doneSubs=(t.subtasks||[]).filter(s=>s.done).length;
    const totalSubs=(t.subtasks||[]).length;
    return (
      <div style={{marginBottom:8}}>
        <div style={{display:'flex',gap:8,alignItems:'flex-start',padding:'10px 12px',background:isSel?`${T.accent}08`:T.surface2,borderRadius:10,border:`1px solid ${isSel?T.accent:T.border}`,transition:'all 0.15s'}}>
          <input type="checkbox" checked={isSel} onChange={()=>setSelectedTasks(prev=>isSel?prev.filter(x=>x!==t.id):[...prev,t.id])}
            style={{marginTop:3,accentColor:T.accent,cursor:'pointer',flexShrink:0}}/>
          <div style={{flex:1,minWidth:0,cursor:'pointer'}} onClick={()=>setExpandedTask(isExpanded?null:t.id)}>
            <div style={{display:'flex',gap:8,alignItems:'flex-start'}}>
              <button onClick={e=>{e.stopPropagation();toggleTask(t.id);}}
                style={{width:18,height:18,borderRadius:4,border:`2px solid ${t.status==='done'?T.accent:T.border}`,background:t.status==='done'?T.accent:'transparent',cursor:'pointer',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',marginTop:1}}>
                {t.status==='done'&&<Icon name="check" size={10} color="#000"/>}
              </button>
              <span style={{color:t.status==='done'?T.muted:T.text,fontSize:13,flex:1,textDecoration:t.status==='done'?'line-through':'none',lineHeight:1.4}}>{t.title}</span>
            </div>
            <div style={{display:'flex',gap:6,marginTop:5,flexWrap:'wrap',alignItems:'center',paddingLeft:26}}>
              <span style={{fontSize:10,fontWeight:700,color:pColors[t.priority]||T.muted,background:`${pColors[t.priority]||T.muted}18`,padding:'1px 7px',borderRadius:5}}>{t.priority||'media'}</span>
              {t.dueDate&&<span style={{fontSize:10,color:T.dim}}>{fmt(t.dueDate)}</span>}
              {t.recurrence&&t.recurrence!=='none'&&<span style={{fontSize:10,color:T.blue,background:`${T.blue}15`,padding:'1px 6px',borderRadius:5}}>🔁 {t.recurrence==='daily'?'diaria':t.recurrence==='weekly'?'semanal':'mensual'}</span>}
              {totalSubs>0&&<span style={{fontSize:10,color:T.muted}}>{doneSubs}/{totalSubs} subtareas</span>}
            </div>
          </div>
          <div style={{display:'flex',gap:4,alignItems:'center',flexShrink:0}}>
            {editTask===t.id
              ?<Btn size="sm" onClick={saveEditTask}>✓</Btn>
              :<button onClick={()=>startEditTask(t)} style={{background:'none',border:'none',color:T.dim,cursor:'pointer',padding:3,display:'flex'}}><Icon name="pencil" size={12}/></button>
            }
            <button onClick={()=>delTask(t.id)} style={{background:'none',border:'none',color:T.dim,cursor:'pointer',padding:3,display:'flex'}}><Icon name="trash" size={12}/></button>
          </div>
        </div>
        {/* Subtask progress + expanded panel */}
        {totalSubs>0&&(
          <div style={{height:3,background:T.border,borderRadius:0,margin:'0 0 0 20px',overflow:'hidden'}}>
            <div style={{height:'100%',width:`${(doneSubs/totalSubs)*100}%`,background:T.accent,transition:'width 0.3s'}}/>
          </div>
        )}
        {isExpanded&&(
          <div style={{background:`${T.accent}05`,border:`1px solid ${T.border}`,borderTop:'none',borderRadius:'0 0 10px 10px',padding:'10px 14px 10px 40px'}}>
            {editTask===t.id?(
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                <Input value={editTaskForm.title} onChange={v=>setEditTaskForm(f=>({...f,title:v}))} placeholder="Título"/>
                <div style={{display:'flex',gap:8}}>
                  <Select value={editTaskForm.priority} onChange={v=>setEditTaskForm(f=>({...f,priority:v}))} style={{flex:1}}>
                    <option value="baja">🟢 Baja</option><option value="media">🟡 Media</option><option value="alta">🔴 Alta</option>
                  </Select>
                  <Input type="date" value={editTaskForm.dueDate} onChange={v=>setEditTaskForm(f=>({...f,dueDate:v}))} style={{flex:1}}/>
                </div>
              </div>
            ):(
              <>
                {(t.subtasks||[]).length>0&&(
                  <div style={{display:'flex',flexDirection:'column',gap:5,marginBottom:8}}>
                    {(t.subtasks||[]).map(s=>(
                      <div key={s.id} onClick={()=>toggleSubtask(t.id,s.id)}
                        style={{display:'flex',alignItems:'center',gap:7,cursor:'pointer',padding:'2px 0'}}>
                        <div style={{width:15,height:15,borderRadius:3,border:`1.5px solid ${s.done?T.accent:T.border}`,background:s.done?T.accent:'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                          {s.done&&<span style={{color:'#000',fontSize:9,fontWeight:900}}>✓</span>}
                        </div>
                        <span style={{fontSize:12,color:s.done?T.muted:T.text,textDecoration:s.done?'line-through':'none'}}>{s.text}</span>
                      </div>
                    ))}
                  </div>
                )}
                {showKanbanMove&&(
                  <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                    {KANBAN_COLS.filter(c=>c.id!==t.status).map(c=>(
                      <button key={c.id} onClick={()=>moveToStatus(t.id,c.id)}
                        style={{fontSize:10,padding:'3px 9px',borderRadius:6,border:`1px solid ${c.color}`,background:`${c.color}15`,color:c.color,cursor:'pointer',fontFamily:'inherit'}}>
                        → {c.label}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  const ProjModals=()=><>
    {projModal&&<Modal title="Nuevo proyecto" onClose={()=>setProjModal(false)}>
      <div style={{display:'flex',flexDirection:'column',gap:14}}>
        <Input value={projForm.title} onChange={v=>setProjForm(f=>({...f,title:v}))} placeholder="Nombre del proyecto"/>
        <Select value={projForm.areaId} onChange={v=>setProjForm(f=>({...f,areaId:v}))}>
          <option value="">Sin área</option>
          {data.areas.map(a=><option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
        </Select>
        <Select value={projForm.objectiveId} onChange={v=>setProjForm(f=>({...f,objectiveId:v}))}>
          <option value="">Sin objetivo</option>
          {data.objectives.map(o=><option key={o.id} value={o.id}>{o.title}</option>)}
        </Select>
        <Btn onClick={saveProj} style={{width:'100%',justifyContent:'center'}}>Crear proyecto</Btn>
      </div>
    </Modal>}
    {taskModal&&<Modal title="Nueva tarea" onClose={()=>setTaskModal(false)}>
      <div style={{display:'flex',flexDirection:'column',gap:14}}>
        <Input value={taskForm.title} onChange={v=>setTaskForm(f=>({...f,title:v}))} placeholder="¿Qué hay que hacer?"/>
        <Select value={taskForm.priority} onChange={v=>setTaskForm(f=>({...f,priority:v}))}>
          <option value="baja">🟢 Baja</option><option value="media">🟡 Media</option><option value="alta">🔴 Alta</option>
        </Select>
        <Input type="date" value={taskForm.dueDate} onChange={v=>setTaskForm(f=>({...f,dueDate:v}))}/>
        <Select value={taskForm.recurrence} onChange={v=>setTaskForm(f=>({...f,recurrence:v}))}>
          <option value="none">🔂 Sin repetición</option>
          <option value="daily">🔁 Diaria</option>
          <option value="weekly">📅 Semanal</option>
          <option value="monthly">🗓️ Mensual</option>
        </Select>
        <Btn onClick={saveTask} style={{width:'100%',justifyContent:'center'}}>Crear tarea</Btn>
      </div>
    </Modal>}
  </>;

  const ProjectList=()=>{
    const filteredObj=objFilter?data.objectives.find(o=>o.id===objFilter):null;
    const visibleProjects=objFilter?data.projects.filter(p=>p.objectiveId===objFilter):data.projects;
    return (
    <div>
      {filteredObj&&<div style={{background:`${T.purple}15`,border:`1px solid ${T.purple}30`,borderRadius:10,padding:'8px 14px',marginBottom:14,display:'flex',gap:8,alignItems:'center'}}>
        <span style={{color:T.purple,fontSize:12}}>🎯 Filtrando por: <strong>{filteredObj.title}</strong></span>
        <button onClick={()=>setObjFilter(null)} style={{background:'none',border:'none',color:T.dim,cursor:'pointer',fontSize:12}}>✕</button>
      </div>}
      <div style={{display:'flex',gap:8,marginBottom:14,flexWrap:'wrap'}}>
        <Btn onClick={()=>setProjModal(true)} size="sm" style={{flex:1,justifyContent:'center'}}><Icon name="plus" size={12}/>Proyecto</Btn>
        {selProject&&<Btn onClick={()=>setTaskModal(true)} size="sm" variant="ghost" style={{flex:1,justifyContent:'center'}}><Icon name="plus" size={12}/>Tarea</Btn>}
      </div>
      {[UNASSIGNED,...visibleProjects].map(p=>{
        const tasks=p.id==='__unassigned__'?unassignedTasks:data.tasks.filter(t=>t.projectId===p.id);
        const done=tasks.filter(t=>t.status==='done').length;
        const pct=tasks.length?Math.round(done/tasks.length*100):0;
        const area=data.areas.find(a=>a.id===p.areaId);
        const isActive=selProject?.id===p.id;
        return (
          <div key={p.id} onClick={()=>openProject(p)}
            style={{padding:'12px 14px',borderRadius:10,cursor:'pointer',marginBottom:8,background:isActive?T.surface2:T.surface,border:`1px solid ${isActive?T.accent:T.border}`,transition:'border-color 0.15s'}}
            onMouseEnter={e=>e.currentTarget.style.borderColor=T.accent}
            onMouseLeave={e=>e.currentTarget.style.borderColor=isActive?T.accent:T.border}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:4}}>
              <div style={{color:T.text,fontSize:14,fontWeight:500,flex:1}}>{p.title}</div>
              {p.id!=='__unassigned__'&&<button onClick={e=>{e.stopPropagation();if(window.confirm('¿Eliminar proyecto y sus tareas?'))delProj(p.id);}} style={{background:'none',border:'none',color:T.dim,cursor:'pointer',padding:2}}><Icon name="trash" size={12}/></button>}
            </div>
            <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:tasks.length?6:0}}>
              {area&&<span style={{fontSize:11,color:area.color}}>{area.icon} {area.name}</span>}
              <span style={{fontSize:11,color:T.dim}}>{tasks.length} tareas · {done} hechas</span>
            </div>
            {tasks.length>0&&<div style={{height:3,background:T.border,borderRadius:2}}><div style={{height:'100%',width:`${pct}%`,background:pct===100?T.green:T.accent,borderRadius:2,transition:'width 0.3s'}}/></div>}
          </div>
        );
      })}
      {!visibleProjects.length&&!unassignedTasks.length&&<div style={{textAlign:'center',padding:'30px 0',color:T.dim}}>
        <Icon name="grid" size={40}/><p style={{marginTop:8,fontSize:13}}>Sin proyectos aún</p>
        <Btn size="sm" onClick={()=>setProjModal(true)} style={{marginTop:8}}><Icon name="plus" size={12}/>Nuevo proyecto</Btn>
      </div>}
    </div>
  );};

  const TaskDetail=()=>{
    if(!selProject) return <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',color:T.dim,textAlign:'center'}}><Icon name="check" size={48}/><p style={{marginTop:8}}>Selecciona un proyecto</p></div>;

    return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <div>
          <h3 style={{color:T.text,fontSize:16,fontWeight:700,margin:0}}>{selProject.title}</h3>
          {totalPTasks>0&&<div style={{fontSize:11,color:T.muted,marginTop:2}}>{donePct}% completado</div>}
        </div>
        <div style={{display:'flex',gap:6}}>
          <button onClick={()=>setListView(listView==='list'?'kanban':'list')}
            style={{padding:'5px 10px',borderRadius:8,border:`1px solid ${T.border}`,background:'transparent',color:T.muted,cursor:'pointer',fontSize:11,fontFamily:'inherit'}}>
            {listView==='list'?'⬜ Kanban':'☰ Lista'}
          </button>
          <Btn size="sm" onClick={()=>setTaskModal(true)}><Icon name="plus" size={12}/>Tarea</Btn>
        </div>
      </div>

      {/* Progress + filters */}
      {totalPTasks>0&&<div style={{height:4,background:T.border,borderRadius:2,marginBottom:12,overflow:'hidden'}}><div style={{height:'100%',width:`${donePct}%`,background:T.accent,borderRadius:2,transition:'width 0.4s'}}/></div>}

      <div style={{display:'flex',gap:6,marginBottom:12,flexWrap:'wrap',alignItems:'center'}}>
        {/* Priority */}
        <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
          {[['all','Todos'],['alta','🔴 Alta'],['media','🟡 Media'],['baja','🟢 Baja']].map(([v,l])=>(
            <button key={v} onClick={()=>setFilterPriority(v)}
              style={{padding:'4px 10px',borderRadius:8,border:`1px solid ${filterPriority===v?(v==='alta'?T.red:v==='media'?T.accent:v==='baja'?T.green:T.accent):T.border}`,
                background:filterPriority===v?(v==='alta'?`${T.red}18`:v==='media'?`${T.accent}18`:v==='baja'?`${T.green}18`:`${T.accent}18`):'transparent',
                color:filterPriority===v?(v==='alta'?T.red:v==='media'?T.accent:v==='baja'?T.green:T.accent):T.muted,
                cursor:'pointer',fontSize:11,fontFamily:'inherit'}}>
              {l}
            </button>
          ))}
        </div>
        {/* Area */}
        {data.areas.length>0&&(
          <select value={filterArea} onChange={e=>setFilterArea(e.target.value)}
            style={{background:T.surface2,border:`1px solid ${filterArea!=='all'?T.purple:T.border}`,color:filterArea!=='all'?T.purple:T.muted,padding:'4px 8px',borderRadius:8,fontSize:11,outline:'none',fontFamily:'inherit',cursor:'pointer'}}>
            <option value="all">Todas las áreas</option>
            {data.areas.map(a=><option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
          </select>
        )}
        {/* Deadline */}
        <select value={filterDeadline} onChange={e=>setFilterDeadline(e.target.value)}
          style={{background:T.surface2,border:`1px solid ${filterDeadline!=='all'?T.orange:T.border}`,color:filterDeadline!=='all'?T.orange:T.muted,padding:'4px 8px',borderRadius:8,fontSize:11,outline:'none',fontFamily:'inherit',cursor:'pointer'}}>
          <option value="all">Cualquier fecha</option>
          <option value="overdue">⚠️ Vencidas</option>
          <option value="today">📅 Hoy</option>
          <option value="week">🗓 Esta semana</option>
          <option value="nodate">— Sin fecha</option>
        </select>
        {/* Active filter count + reset */}
        {(filterPriority!=='all'||filterArea!=='all'||filterDeadline!=='all')&&(
          <button onClick={()=>{setFilterPriority('all');setFilterArea('all');setFilterDeadline('all');}}
            style={{marginLeft:'auto',padding:'4px 10px',borderRadius:8,border:`1px solid ${T.border}`,background:'transparent',color:T.dim,cursor:'pointer',fontSize:11,fontFamily:'inherit'}}>
            ✕ Limpiar filtros
          </button>
        )}
        {/* Select all toggle */}
        {filteredPTasks.length>0&&(
          <button onClick={toggleSelectAll}
            style={{marginLeft:'auto',padding:'4px 10px',borderRadius:8,
              border:`1px solid ${allSelected?T.accent:T.border}`,
              background:allSelected?`${T.accent}15`:'transparent',
              color:allSelected?T.accent:T.muted,
              cursor:'pointer',fontSize:11,fontFamily:'inherit',display:'flex',alignItems:'center',gap:5}}>
            <span style={{width:13,height:13,borderRadius:3,border:`1.5px solid ${allSelected?T.accent:T.muted}`,
              background:allSelected?T.accent:'transparent',display:'inline-flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              {allSelected&&<span style={{color:'#000',fontSize:9,fontWeight:900,lineHeight:1}}>✓</span>}
            </span>
            {allSelected?'Deseleccionar todo':'Seleccionar todo'}
          </button>
        )}
      </div>
      {/* BULK ACTION BAR — floats above bottom nav when tasks are selected */}
      {selectedTasks.length>0&&(
        <div style={{
          position:'sticky', bottom: isMobile ? 80 : 16,
          zIndex:40, margin:'16px 0 0',
          background:T.surface2,
          border:`1.5px solid ${T.accent}60`,
          borderRadius:14,
          padding:'10px 14px',
          display:'flex', alignItems:'center', gap:8, flexWrap:'wrap',
          boxShadow:`0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px ${T.accent}20`,
          animation:'slideIn 0.18s ease',
        }}>
          {/* Count pill */}
          <div style={{
            background:`${T.accent}20`, border:`1px solid ${T.accent}40`,
            borderRadius:20, padding:'3px 12px',
            fontSize:12, fontWeight:800, color:T.accent, flexShrink:0,
          }}>
            {selectedTasks.length} seleccionada{selectedTasks.length!==1?'s':''}
          </div>

          <div style={{display:'flex',gap:6,flex:1,flexWrap:'wrap'}}>
            {/* Mark done */}
            <button onClick={bulkMarkDone} style={{
              padding:'5px 12px', borderRadius:9,
              border:`1px solid ${T.green}60`, background:`${T.green}15`,
              color:T.green, cursor:'pointer', fontSize:11, fontWeight:700, fontFamily:'inherit',
              display:'flex', alignItems:'center', gap:5,
            }}>
              <span style={{fontSize:13}}>✓</span> Completar
            </button>

            {/* Move to in-progress */}
            <button onClick={()=>bulkMoveToStatus('in-progress')} style={{
              padding:'5px 12px', borderRadius:9,
              border:`1px solid ${T.blue}60`, background:`${T.blue}15`,
              color:T.blue, cursor:'pointer', fontSize:11, fontWeight:700, fontFamily:'inherit',
              display:'flex', alignItems:'center', gap:5,
            }}>
              <span style={{fontSize:13}}>▶</span> En progreso
            </button>

            {/* Move to pending */}
            <button onClick={()=>bulkMoveToStatus('todo')} style={{
              padding:'5px 12px', borderRadius:9,
              border:`1px solid ${T.muted}40`, background:`${T.muted}10`,
              color:T.muted, cursor:'pointer', fontSize:11, fontWeight:600, fontFamily:'inherit',
              display:'flex', alignItems:'center', gap:5,
            }}>
              ↩ Pendiente
            </button>

            {/* Delete */}
            <button onClick={bulkDelete} style={{
              padding:'5px 12px', borderRadius:9,
              border:`1px solid ${T.red}50`, background:`${T.red}12`,
              color:T.red, cursor:'pointer', fontSize:11, fontWeight:700, fontFamily:'inherit',
              display:'flex', alignItems:'center', gap:5,
            }}>
              <span style={{fontSize:13}}>🗑</span> Eliminar
            </button>
          </div>

          {/* Dismiss */}
          <button onClick={()=>setSelectedTasks([])} style={{
            background:'none', border:`1px solid ${T.border}`,
            borderRadius:8, padding:'4px 8px',
            color:T.dim, cursor:'pointer', fontSize:13, flexShrink:0,
          }} title="Deseleccionar todo">✕</button>
        </div>
      )}
      {/* Active filters summary */}
      {(filterPriority!=='all'||filterArea!=='all'||filterDeadline!=='all')&&(
        <div style={{fontSize:11,color:T.dim,marginBottom:8}}>
          {filteredPTasks.length} tarea{filteredPTasks.length!==1?'s':''} con los filtros aplicados
        </div>
      )}

      {/* LIST VIEW */}
      {listView==='list'&&(
        <div>
          {['todo','in-progress','done'].map(status=>{
            const stTasks=filteredPTasks.filter(t=>t.status===status||(status==='todo'&&!t.status));
            const col=KANBAN_COLS.find(c=>c.id===status);
            if(!stTasks.length)return null;
            return (
              <div key={status} style={{marginBottom:16}}>
                <div style={{fontSize:11,fontWeight:700,color:col?.color||T.muted,textTransform:'uppercase',letterSpacing:1,marginBottom:8}}>{col?.label||status} ({stTasks.length})</div>
                {stTasks.map(t=><TaskRow key={t.id} t={t} showKanbanMove={true}/>)}
              </div>
            );
          })}
          {!filteredPTasks.length&&<div style={{textAlign:'center',padding:'24px 0',color:T.dim,fontSize:13}}>Sin tareas{filterPriority!=='all'?' con esta prioridad':''}</div>}
        </div>
      )}

      {/* KANBAN VIEW */}
      {listView==='kanban'&&(
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
          {KANBAN_COLS.map(col=>(
            <div key={col.id}
              onDragOver={e=>e.preventDefault()}
              onDrop={()=>{if(dragTask){moveToStatus(dragTask,col.id);setDragTask(null);}}}
              style={{background:T.surface2,borderRadius:10,padding:'8px 6px',border:`1px solid ${T.border}`,minHeight:120}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8,padding:'0 4px'}}>
                <span style={{fontSize:11,fontWeight:700,color:col.color,textTransform:'uppercase',letterSpacing:0.5}}>{col.label}</span>
                <span style={{fontSize:10,color:T.muted,background:T.border,borderRadius:8,padding:'1px 6px'}}>{filteredPTasks.filter(t=>(t.status||'todo')===col.id).length}</span>
              </div>
              {filteredPTasks.filter(t=>(t.status||'todo')===col.id).map(t=>(
                <div key={t.id} draggable onDragStart={()=>setDragTask(t.id)}
                  style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,padding:'9px 10px',marginBottom:6,cursor:'grab',opacity:dragTask===t.id?0.4:1}}>
                  <div style={{fontSize:12,color:T.text,lineHeight:1.4,marginBottom:5}}>{t.title}</div>
                  <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                    <span style={{fontSize:10,color:pColors[t.priority]||T.muted,fontWeight:600}}>{t.priority||'media'}</span>
                    {t.dueDate&&<span style={{fontSize:10,color:T.dim}}>{fmt(t.dueDate)}</span>}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );};

  if(isMobile) return (
    <div>
      {!showDetail&&<PageHeader title="Proyectos & Tareas" isMobile={isMobile}/>}
      {showDetail&&selProject&&<div style={{marginBottom:12}}><button onClick={()=>{setShowDetail(false);}} style={{display:'flex',alignItems:'center',gap:6,background:'none',border:'none',color:T.muted,cursor:'pointer',fontSize:14,padding:0}}><Icon name="back" size={18}/>Proyectos</button></div>}
      {showDetail&&selProject?<TaskDetail/>:<ProjectList/>}
      <ProjModals/>
    </div>
  );

  return (
    <div style={{display:'grid',gridTemplateColumns:'260px 1fr',gap:16,minHeight:400}}>
      <ProjectList/>
      <TaskDetail/>
      <ProjModals/>
    </div>
  );
};


// ===================== NOTES =====================
const NOTE_TEMPLATES=[
  {id:'tpl1',name:'Reunión',icon:'🤝',content:`# Reunión — [Título]\n**Fecha:** \n**Asistentes:** \n\n## Agenda\n- \n\n## Decisiones\n- \n\n## Próximos pasos\n- [ ] `},
  {id:'tpl2',name:'Reflexión',icon:'💭',content:`# Reflexión — [Fecha]\n\n## ¿Qué salió bien?\n\n## ¿Qué mejorar?\n\n## ¿Qué aprendí?\n\n## Intención para mañana\n`},
  {id:'tpl3',name:'Proyecto',icon:'🚀',content:`# [Nombre del proyecto]\n\n**Objetivo:** \n**Deadline:** \n**Área:** \n\n## Contexto\n\n## Tareas\n- [ ] \n- [ ] \n\n## Notas\n`},
  {id:'tpl4',name:'Receta',icon:'🍳',content:`# [Nombre del platillo]\n\n**Tiempo:** min | **Porciones:** \n\n## Ingredientes\n- \n\n## Preparación\n1. \n`},
  {id:'tpl5',name:'Libro',icon:'📚',content:`# [Título del libro]\n**Autor:** \n**Estado:** Leyendo\n\n## Ideas clave\n- \n\n## Citas destacadas\n> \n\n## Acciones a tomar\n- [ ] `},
];

const Notes = ({data,setData,isMobile,viewHint,onConsumeHint}) => {
  const [sel,setSel]=useState(null);
  const [showNote,setShowNote]=useState(false);
  const [modal,setModal]=useState(false);
  const [showTemplates,setShowTemplates]=useState(false);
  const [form,setForm]=useState({title:'',content:'',tags:'',areaId:''});
  const [search,setSearch]=useState('');
  const [editing,setEditing]=useState(false);
  const [editForm,setEditForm]=useState({title:'',content:'',tags:'',areaId:''});
  const [mdPreview,setMdPreview]=useState(true);
  const [filterArea,setFilterArea]=useState('all');
  const [filterTag,setFilterTag]=useState('all');
  const [sortBy,setSortBy]=useState('date');
  const [noteView,setNoteView]=useState('lista'); // 'lista' | 'tablero'

  useEffect(()=>{
    if(viewHint&&viewHint!=='null'){
      const found=data.notes.find(n=>n.id===viewHint);
      if(found){setSel(found);if(isMobile)setShowNote(true);}
      onConsumeHint?.();
    }
  },[viewHint]);

  const saveNote=()=>{
    if(!form.title.trim())return;
    const n={id:uid(),...form,tags:form.tags.split(',').map(t=>t.trim()).filter(Boolean),createdAt:today()};
    const updated=[n,...data.notes];
    setData(d=>({...d,notes:updated}));save('notes',updated);
    setModal(false);toast.success('Nota guardada');setForm({title:'',content:'',tags:'',areaId:''});
    setSel(n);if(isMobile)setShowNote(true);
  };
  const applyTemplate=(tpl)=>{setForm(f=>({...f,content:tpl.content}));setShowTemplates(false);setModal(true);};
  const startEdit=(n)=>{setEditForm({title:n.title,content:n.content,tags:(n.tags||[]).join(', '),areaId:n.areaId||''});setEditing(true);};
  const saveEdit=()=>{
    if(!editForm.title.trim())return;
    const updated=data.notes.map(n=>n.id===sel.id?{...n,...editForm,tags:editForm.tags.split(',').map(t=>t.trim()).filter(Boolean)}:n);
    setData(d=>({...d,notes:updated}));save('notes',updated);
    setSel(updated.find(n=>n.id===sel.id));setEditing(false);
  };
  const del=(id)=>{
    if(!window.confirm('Eliminar esta nota?'))return;
    const updated=data.notes.filter(n=>n.id!==id);
    setData(d=>({...d,notes:updated}));save('notes',updated);
    if(sel?.id===id){setSel(null);setShowNote(false);}
  };

  const allTags=[...new Set(data.notes.flatMap(n=>n.tags||[]))];
  let filtered=data.notes.filter(n=>{
    const q=search.toLowerCase();
    const matchQ=!q||n.title.toLowerCase().includes(q)||n.content.toLowerCase().includes(q)||(n.tags||[]).some(t=>t.toLowerCase().includes(q));
    const matchArea=filterArea==='all'||n.areaId===filterArea;
    const matchTag=filterTag==='all'||(n.tags||[]).includes(filterTag);
    return matchQ&&matchArea&&matchTag;
  });
  if(sortBy==='date')filtered=[...filtered].sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
  if(sortBy==='title')filtered=[...filtered].sort((a,b)=>a.title.localeCompare(b.title));
  if(sortBy==='area')filtered=[...filtered].sort((a,b)=>(a.areaId||'').localeCompare(b.areaId||''));

  const TEMPLATES=[
    {name:'Diaria',icon:'📅',content:'## Hoy\n\n### Prioridades\n- \n- \n\n### Notas\n\n### Mañana\n- '},
    {name:'Reunión',icon:'🤝',content:'## Reunión\n**Fecha:** \n**Participantes:** \n\n### Agenda\n- \n\n### Acuerdos\n- \n\n### Próximos pasos\n- '},
    {name:'Libro',icon:'📚',content:'## \n**Autor:** \n**Rating:** ⭐⭐⭐⭐⭐\n\n### Ideas clave\n1. \n2. \n\n### Cita favorita\n> \n\n### Acción a tomar\n- '},
    {name:'Idea',icon:'💡',content:'## Idea: \n\n**Problema que resuelve:** \n\n**Cómo funcionaría:** \n\n**Siguiente paso:** '},
    {name:'Reflexión',icon:'🧘',content:'## Reflexión\n\n**¿Qué salió bien?**\n\n**¿Qué mejoraría?**\n\n**¿Qué aprendí?**\n\n**Intención para mañana:** '},
  ];

  const renderMd=(text)=>text
    .replace(/\[\[([^\]]+)\]\]/g,'<span class="backlink" data-backlink="$1" style="color:#a78bfa;cursor:pointer;text-decoration:underline;font-weight:500;border-radius:3px;padding:0 2px" title="Ir a: $1">$1</span>')
    .replace(/^### (.+)$/gm,'<h4 style="color:#e2eaf4;margin:8px 0 4px;font-size:12px">$1</h4>')
    .replace(/^## (.+)$/gm,'<h3 style="color:#e2eaf4;margin:10px 0 6px;font-size:14px">$1</h3>')
    .replace(/^# (.+)$/gm,'<h2 style="color:#e2eaf4;margin:12px 0 8px;font-size:16px">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/^> (.+)$/gm,'<blockquote style="border-left:3px solid #00c896;margin:6px 0;padding:4px 10px;color:#6b8299;font-style:italic">$1</blockquote>')
    .replace(/^- (.+)$/gm,'<div style="display:flex;gap:6px;margin:2px 0"><span style="color:#00c896;flex-shrink:0">•</span><span>$1</span></div>')
    .replace(/^\d+\. (.+)$/gm,'<div style="margin:2px 0">$1</div>')
    .replace(/\n/g,'<br/>');

  const NoteCard=({n,compact=false})=>{
    const area=data.areas.find(a=>a.id===n.areaId);
    return (
      <div onClick={()=>{setSel(n);if(isMobile)setShowNote(true);}}
        style={{padding:compact?'10px 12px':'12px 14px',background:T.surface,border:`1px solid ${sel?.id===n.id?T.accent:T.border}`,borderLeft:`3px solid ${area?.color||T.accent}`,borderRadius:10,cursor:'pointer',marginBottom:compact?6:8,transition:'border-color 0.15s'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:6}}>
          <div style={{color:T.text,fontSize:compact?12:13,fontWeight:500,flex:1,lineHeight:1.3}}>{n.title}</div>
          {n.amount&&<span style={{color:T.green,fontSize:11,fontWeight:600,flexShrink:0}}>${n.amount}</span>}
        </div>
        <div style={{display:'flex',gap:5,marginTop:4,flexWrap:'wrap',alignItems:'center'}}>
          {area&&<span style={{fontSize:10,color:area.color}}>{area.icon} {area.name}</span>}
          {(n.tags||[]).slice(0,2).map(t=><span key={t} style={{fontSize:10,color:T.purple,background:`${T.purple}15`,padding:'1px 6px',borderRadius:6}}>#{t}</span>)}
          <span style={{fontSize:10,color:T.dim,marginLeft:'auto'}}>{fmt(n.createdAt)}</span>
        </div>
      </div>
    );
  };

  const TableroView=()=>{
    const cols=[
      {id:'none',label:'Sin área',color:T.accent,icon:'📝'},
      ...data.areas.map(a=>({id:a.id,label:a.name,color:a.color,icon:a.icon})),
    ];
    return (
      <div style={{display:'flex',gap:12,overflowX:'auto',paddingBottom:12,minHeight:200}}>
        {cols.map(col=>{
          const colNotes=filtered.filter(n=>col.id==='none'?!n.areaId||n.areaId==='':n.areaId===col.id);
          if(colNotes.length===0&&col.id!=='none')return null;
          return (
            <div key={col.id} style={{minWidth:240,flex:'0 0 240px',background:T.surface2,borderRadius:12,padding:10,border:`1px solid ${T.border}`,maxHeight:'70vh',overflowY:'auto'}}>
              <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:10,paddingBottom:8,borderBottom:`1px solid ${T.border}`}}>
                <span style={{fontSize:14}}>{col.icon}</span>
                <span style={{fontSize:12,fontWeight:700,color:col.color}}>{col.label}</span>
                <span style={{marginLeft:'auto',fontSize:11,color:T.dim,background:T.border,borderRadius:10,padding:'1px 6px'}}>{colNotes.length}</span>
              </div>
              {colNotes.map(n=><NoteCard key={n.id} n={n} compact/>)}
              {colNotes.length===0&&<div style={{color:T.dim,fontSize:12,textAlign:'center',padding:'20px 0'}}>Vacío</div>}
            </div>
          );
        })}
      </div>
    );
  };

  const NoteList=()=>(
    <div>
      <Input value={search} onChange={setSearch} placeholder="Buscar notas..." style={{marginBottom:10,fontSize:14}}/>
      <div style={{display:'flex',gap:6,marginBottom:10,flexWrap:'wrap'}}>
        <select value={filterArea} onChange={e=>setFilterArea(e.target.value)}
          style={{flex:1,minWidth:100,background:T.bg,border:`1px solid ${T.border}`,color:T.text,padding:'6px 10px',borderRadius:9,fontSize:12,outline:'none'}}>
          <option value="all">Todas las áreas</option>
          {data.areas.map(a=><option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
        </select>
        {allTags.length>0&&(
          <select value={filterTag} onChange={e=>setFilterTag(e.target.value)}
            style={{flex:1,minWidth:90,background:T.bg,border:`1px solid ${T.border}`,color:T.text,padding:'6px 10px',borderRadius:9,fontSize:12,outline:'none'}}>
            <option value="all">Todos los tags</option>
            {allTags.map(t=><option key={t} value={t}>#{t}</option>)}
          </select>
        )}
        <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
          style={{background:T.bg,border:`1px solid ${T.border}`,color:T.text,padding:'6px 10px',borderRadius:9,fontSize:12,outline:'none'}}>
          <option value="date">Reciente</option>
          <option value="title">A-Z</option>
          <option value="area">Área</option>
        </select>
      </div>
      <div style={{display:'flex',gap:8,marginBottom:14}}>
        <button onClick={()=>setShowTemplates(true)} style={{flex:1,padding:'7px',border:`1px solid ${T.border}`,borderRadius:9,background:'transparent',color:T.muted,cursor:'pointer',fontSize:12,fontFamily:'inherit'}}>📋 Plantilla</button>
        <Btn onClick={()=>setModal(true)} size="sm" style={{flex:1,justifyContent:'center'}}><Icon name="plus" size={12}/>Nueva nota</Btn>
      </div>
      {filtered.length===0
        ?<div style={{textAlign:'center',padding:'40px 0',color:T.dim}}>
           <div style={{fontSize:32,marginBottom:8}}>📝</div>
           <div style={{fontSize:14,marginBottom:12}}>{data.notes.length===0?'Sin notas aún':'Sin resultados'}</div>
           {data.notes.length===0&&<Btn size="sm" onClick={()=>setModal(true)}><Icon name="plus" size={12}/>Primera nota</Btn>}
         </div>
        :filtered.map(n=><NoteCard key={n.id} n={n}/>)
      }
    </div>
  );

  const NoteDetail=()=>{
    if(!sel)return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:300,color:T.dim,fontSize:14}}>Selecciona una nota</div>;
    const area=data.areas.find(a=>a.id===sel.areaId);
    return (
      <div>
        {isMobile&&<button onClick={()=>setShowNote(false)} style={{background:'none',border:'none',color:T.accent,cursor:'pointer',fontSize:13,fontFamily:'inherit',marginBottom:12,padding:0}}>← Volver</button>}
        {editing?(
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            <Input value={editForm.title} onChange={v=>setEditForm(f=>({...f,title:v}))} placeholder="Título"/>
            <textarea value={editForm.content} onChange={e=>setEditForm(f=>({...f,content:e.target.value}))} rows={12}
              style={{background:T.bg,border:`1px solid ${T.border}`,color:T.text,padding:'10px 12px',borderRadius:10,fontSize:13,fontFamily:'inherit',outline:'none',resize:'vertical',lineHeight:1.6}}/>
            <Input value={editForm.tags} onChange={v=>setEditForm(f=>({...f,tags:v}))} placeholder="tags, separados, por, comas"/>
            <select value={editForm.areaId} onChange={e=>setEditForm(f=>({...f,areaId:e.target.value}))}
              style={{background:T.bg,border:`1px solid ${T.border}`,color:T.text,padding:'8px 12px',borderRadius:9,fontSize:13,outline:'none'}}>
              <option value="">Sin área</option>
              {data.areas.map(a=><option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
            </select>
            <div style={{display:'flex',gap:8}}>
              <Btn onClick={saveEdit} style={{flex:1,justifyContent:'center'}}>Guardar</Btn>
              <Btn variant="ghost" onClick={()=>setEditing(false)}>Cancelar</Btn>
            </div>
          </div>
        ):(
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
              <div style={{flex:1,minWidth:0}}>
                <h2 style={{color:T.text,fontSize:18,fontWeight:700,margin:'0 0 6px',lineHeight:1.3}}>{sel.title}</h2>
                <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
                  {area&&<span style={{fontSize:11,color:area.color}}>{area.icon} {area.name}</span>}
                  <span style={{color:T.dim,fontSize:11}}>{fmt(sel.createdAt)}</span>
                  {sel.amount&&<span style={{color:T.green,fontSize:12,fontWeight:600}}>${sel.amount}</span>}
                </div>
              </div>
              <div style={{display:'flex',gap:6,marginLeft:10,flexShrink:0}}>
                <button onClick={()=>setMdPreview(p=>!p)} style={{background:'none',border:`1px solid ${T.border}`,borderRadius:8,padding:'4px 10px',cursor:'pointer',color:T.muted,fontSize:11,fontFamily:'inherit'}}>{mdPreview?'Raw':'Preview'}</button>
                <button onClick={()=>startEdit(sel)} style={{background:'none',border:`1px solid ${T.border}`,borderRadius:8,padding:'4px 10px',cursor:'pointer',color:T.muted,fontSize:11,fontFamily:'inherit'}}>✏️</button>
                <button onClick={()=>del(sel.id)} aria-label="Eliminar nota" style={{background:'none',border:'none',color:T.red,cursor:'pointer',padding:4}}><Icon name="trash" size={14}/></button>
              </div>
            </div>
            {(sel.tags||[]).length>0&&(
              <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:12}}>
                {sel.tags.map(t=><span key={t} style={{fontSize:11,color:T.purple,background:`${T.purple}15`,padding:'2px 8px',borderRadius:8}}>#{t}</span>)}
              </div>
            )}
            <div style={{background:T.surface2,borderRadius:10,padding:'14px 16px',minHeight:120,lineHeight:1.7,fontSize:13,color:T.text}}
              onClick={e=>{
                const bl=e.target.closest?.('[data-backlink]');
                if(bl){
                  const title=bl.getAttribute('data-backlink');
                  const target=data.notes.find(n=>n.title.toLowerCase()===title.toLowerCase());
                  if(target){setSel(target);if(isMobile)setShowNote(true);}
                  else{toast.info(`Nota "${title}" no encontrada`);}
                }
              }}>
              {mdPreview
                ?<div dangerouslySetInnerHTML={{__html:renderMd(sel.content||'')}}/>
                :<pre style={{margin:0,fontFamily:'inherit',whiteSpace:'pre-wrap',color:T.muted}}>{sel.content}</pre>
              }
            </div>
          </div>
        )}
      </div>
    );
  };

  if(isMobile){
    if(showNote)return(
      <div style={{padding:'0 2px'}}>
        <NoteDetail/>
      </div>
    );
    return (
      <div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
          <h2 style={{color:T.text,margin:0,fontSize:20,fontWeight:700}}>Notas</h2>
          <div style={{display:'flex',gap:6}}>
            <button onClick={()=>setNoteView(v=>v==='lista'?'tablero':'lista')} style={{padding:'6px 12px',borderRadius:9,border:`1px solid ${T.border}`,background:noteView==='tablero'?`${T.accent}18`:'transparent',color:noteView==='tablero'?T.accent:T.muted,cursor:'pointer',fontSize:12,fontFamily:'inherit'}}>{noteView==='lista'?'Tablero':'Lista'}</button>
          </div>
        </div>
        {noteView==='tablero'?<TableroView/>:<NoteList/>}
        {showTemplates&&(
          <Modal title="Plantillas" onClose={()=>setShowTemplates(false)}>
            {TEMPLATES.map(tpl=>(
              <div key={tpl.name} onClick={()=>applyTemplate(tpl)} style={{display:'flex',gap:12,padding:'12px 0',borderBottom:`1px solid ${T.border}`,cursor:'pointer'}}>
                <span style={{fontSize:24}}>{tpl.icon}</span>
                <div><div style={{color:T.text,fontWeight:600,fontSize:14}}>{tpl.name}</div><div style={{color:T.muted,fontSize:12,marginTop:2}}>Usar esta plantilla</div></div>
              </div>
            ))}
          </Modal>
        )}
        {modal&&(
          <Modal title="Nueva nota" onClose={()=>setModal(false)}>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              <Input value={form.title} onChange={v=>setForm(f=>({...f,title:v}))} placeholder="Título de la nota"/>
              <textarea value={form.content} onChange={e=>setForm(f=>({...f,content:e.target.value}))} rows={6} placeholder="Escribe aquí... (Markdown soportado)"
                style={{background:T.bg,border:`1px solid ${T.border}`,color:T.text,padding:'10px 12px',borderRadius:10,fontSize:13,fontFamily:'inherit',outline:'none',resize:'vertical',lineHeight:1.6}}/>
              <Input value={form.tags} onChange={v=>setForm(f=>({...f,tags:v}))} placeholder="Tags: trabajo, ideas, personal"/>
              <select value={form.areaId} onChange={e=>setForm(f=>({...f,areaId:e.target.value}))}
                style={{background:T.bg,border:`1px solid ${T.border}`,color:T.text,padding:'8px 12px',borderRadius:9,fontSize:13,outline:'none'}}>
                <option value="">Sin área</option>
                {data.areas.map(a=><option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
              </select>
              <Btn onClick={saveNote} style={{justifyContent:'center'}}>Guardar nota</Btn>
            </div>
          </Modal>
        )}
      </div>
    );
  }

  // Desktop: split panel
  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
        <h2 style={{color:T.text,margin:0,fontSize:22,fontWeight:700}}>Notas <span style={{color:T.dim,fontSize:14,fontWeight:400}}>({data.notes.length})</span></h2>
        <div style={{display:'flex',gap:8}}>
          <div style={{display:'flex',gap:0,border:`1px solid ${T.border}`,borderRadius:9,overflow:'hidden'}}>
            {['lista','tablero'].map(v=>(
              <button key={v} onClick={()=>setNoteView(v)} style={{padding:'6px 14px',border:'none',background:noteView===v?`${T.accent}20`:'transparent',color:noteView===v?T.accent:T.muted,cursor:'pointer',fontSize:12,fontFamily:'inherit',fontWeight:noteView===v?700:400}}>
                {v==='lista'?'Lista':'Tablero'}
              </button>
            ))}
          </div>
          <Btn size="sm" onClick={()=>setModal(true)}><Icon name="plus" size={13}/>Nueva</Btn>
        </div>
      </div>

      {noteView==='tablero'?(
        <TableroView/>
      ):(
        <div style={{display:'grid',gridTemplateColumns:'320px 1fr',gap:16,height:'calc(100vh - 140px)'}}>
          <div style={{overflowY:'auto'}}>
            <NoteList/>
          </div>
          <div style={{overflowY:'auto',background:T.surface,borderRadius:12,padding:'16px 20px',border:`1px solid ${T.border}`}}>
            <NoteDetail/>
          </div>
        </div>
      )}

      {showTemplates&&(
        <Modal title="Plantillas de notas" onClose={()=>setShowTemplates(false)}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            {TEMPLATES.map(tpl=>(
              <div key={tpl.name} onClick={()=>applyTemplate(tpl)} style={{display:'flex',gap:10,padding:'12px',background:T.surface2,borderRadius:10,border:`1px solid ${T.border}`,cursor:'pointer',transition:'border-color 0.15s'}}
                onMouseEnter={e=>e.currentTarget.style.borderColor=T.accent}
                onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
                <span style={{fontSize:24}}>{tpl.icon}</span>
                <div><div style={{color:T.text,fontWeight:600,fontSize:13}}>{tpl.name}</div><div style={{color:T.muted,fontSize:11,marginTop:2}}>Usar plantilla</div></div>
              </div>
            ))}
          </div>
        </Modal>
      )}
      {modal&&(
        <Modal title="Nueva nota" onClose={()=>setModal(false)}>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            <Input value={form.title} onChange={v=>setForm(f=>({...f,title:v}))} placeholder="Título de la nota"/>
            <textarea value={form.content} onChange={e=>setForm(f=>({...f,content:e.target.value}))} rows={8} placeholder="Escribe aquí... (Markdown soportado)"
              style={{background:T.bg,border:`1px solid ${T.border}`,color:T.text,padding:'10px 12px',borderRadius:10,fontSize:13,fontFamily:'inherit',outline:'none',resize:'vertical',lineHeight:1.6}}/>
            <Input value={form.tags} onChange={v=>setForm(f=>({...f,tags:v}))} placeholder="Tags: trabajo, ideas, personal"/>
            <select value={form.areaId} onChange={e=>setForm(f=>({...f,areaId:e.target.value}))}
              style={{background:T.bg,border:`1px solid ${T.border}`,color:T.text,padding:'8px 12px',borderRadius:9,fontSize:13,outline:'none'}}>
              <option value="">Sin área</option>
              {data.areas.map(a=><option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
            </select>
            <Btn onClick={saveNote} style={{justifyContent:'center'}}>Guardar nota</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ===================== INBOX =====================
const Inbox = ({data,setData,isMobile}) => {
  const [text,setText]=useState('');
  const [wizard,setWizard]=useState(null);
  const [wizardStep,setWizardStep]=useState(0);
  // Swipe state for mobile
  const swipeTouchX = useRef({});
  const [swipeOffsets, setSwipeOffsets] = useState({});   // { id: deltaX }
  const SWIPE_THRESHOLD = 72;

  const onSwipeStart=(id,e)=>{
    swipeTouchX.current[id]=e.touches[0].clientX;
  };
  const onSwipeMove=(id,e)=>{
    const start=swipeTouchX.current[id];
    if(start==null)return;
    const delta=e.touches[0].clientX-start;
    setSwipeOffsets(prev=>({...prev,[id]:delta}));
  };
  const onSwipeEnd=(id,item,e)=>{
    const delta=swipeOffsets[id]||0;
    setSwipeOffsets(prev=>{const n={...prev};delete n[id];return n;});
    delete swipeTouchX.current[id];
    if(delta>SWIPE_THRESHOLD){convertToNote(item);}
    else if(delta<-SWIPE_THRESHOLD){del(id);}
  };

  const add=()=>{
    if(!text.trim())return;
    const updated=[{id:uid(),content:text.trim(),createdAt:today(),processed:false},...data.inbox];
    setData(d=>({...d,inbox:updated}));save('inbox',updated);setText('');
  };
  const process=(id)=>{const u=data.inbox.map(i=>i.id===id?{...i,processed:!i.processed}:i);setData(d=>({...d,inbox:u}));save('inbox',u);};
  const del=(id)=>{const u=data.inbox.filter(i=>i.id!==id);setData(d=>({...d,inbox:u}));save('inbox',u);};
  const convertToNote=(item)=>{
    const n={id:uid(),title:item.content.slice(0,50),content:item.content,tags:['inbox'],areaId:'',createdAt:today()};
    const updN=[n,...data.notes];
    const updI=data.inbox.map(i=>i.id===item.id?{...i,processed:true}:i);
    setData(d=>({...d,notes:updN,inbox:updI}));save('notes',updN);save('inbox',updI);
  };
  const convertToTask=(item)=>{
    const t={id:uid(),title:item.content.slice(0,80),projectId:'',status:'todo',priority:'media',dueDate:'',createdAt:today()};
    const updT=[t,...data.tasks];
    const updI=data.inbox.map(i=>i.id===item.id?{...i,processed:true}:i);
    setData(d=>({...d,tasks:updT,inbox:updI}));save('tasks',updT);save('inbox',updI);
  };
  const convertToObjective=(item)=>{
    const o={id:uid(),title:item.content.slice(0,80),areaId:'',deadline:'',status:'active'};
    const updO=[o,...data.objectives];
    const updI=data.inbox.map(i=>i.id===item.id?{...i,processed:true}:i);
    setData(d=>({...d,objectives:updO,inbox:updI}));save('objectives',updO);save('inbox',updI);
  };

  // Compute days since item was created
  const daysAgo=(dateStr)=>{
    if(!dateStr)return 0;
    const diff=new Date(today())-new Date(dateStr);
    return Math.max(0,Math.floor(diff/86400000));
  };

  // Psicke suggestion heuristic
  const getSuggestion=(content)=>{
    const c=content.toLowerCase();
    if(c.includes('comprar')||c.includes('pagar')||c.includes('factura')||c.includes('gasto'))return{module:'Transacción',icon:'💰'};
    if(c.includes('llamar')||c.includes('hablar')||c.includes('reunión')||c.includes('email'))return{module:'Tarea',icon:'✅'};
    if(c.includes('aprender')||c.includes('curso')||c.includes('libro')||c.includes('leer'))return{module:'Aprendizaje',icon:'📚'};
    if(c.includes('médico')||c.includes('ejercicio')||c.includes('correr')||c.includes('salud'))return{module:'Salud',icon:'💪'};
    if(c.includes('proyecto')||c.includes('desarrollar')||c.includes('crear')||c.includes('construir'))return{module:'Proyecto',icon:'📁'};
    if(c.includes('idea')||c.includes('pensar')||c.includes('quizás')||c.includes('podría'))return{module:'Idea',icon:'💡'};
    return{module:'Nota',icon:'📝'};
  };

  // GTD wizard steps
  const WIZARD_STEPS=[
    {q:'¿Requiere acción de tu parte?',opts:['Sí, hay algo que hacer','No, es referencia o basura']},
    {q:'¿Cuánto tiempo toma?',opts:['Menos de 2 minutos → hacerlo ya','Más de 2 min → agendarlo o delegarlo']},
    {q:'¿A dónde va?',opts:['📝 Nota / Referencia','✅ Tarea','🎯 Objetivo','✓ Procesado / Descartar']},
  ];
  const stepColors=[T.accent,T.blue,T.purple];

  const handleWizardOpt=(optIdx)=>{
    if(wizardStep<WIZARD_STEPS.length-1){
      setWizardStep(s=>s+1);
    } else {
      // Last step — take action
      if(optIdx===0)convertToNote(wizard);
      else if(optIdx===1)convertToTask(wizard);
      else if(optIdx===2)convertToObjective(wizard);
      else process(wizard.id);
      setWizard(null);setWizardStep(0);
    }
  };

  const pending=data.inbox.filter(i=>!i.processed);
  const processed=data.inbox.filter(i=>i.processed);

  return (
    <div>
      <PageHeader title="Captura Rápida" subtitle="Vuelca ideas. Clasifícalas después." isMobile={isMobile}/>

      {/* Quick capture input */}
      <div style={{display:'flex',gap:10,marginBottom:20}}>
        <Input value={text} onChange={setText} placeholder="¿Qué tienes en mente?" style={{flex:1}} onKeyDown={e=>e.key==='Enter'&&add()}/>
        <button onClick={add} aria-label="Agregar al inbox" style={{background:T.accent,border:'none',borderRadius:10,padding:'0 16px',cursor:'pointer',display:'flex',alignItems:'center',flexShrink:0}}><Icon name="plus" size={20} color="#000"/></button>
      </div>

      {/* Pending items */}
      {pending.length>0&&(
        <div style={{marginBottom:20}}>
          <h3 style={{color:T.muted,fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:1,marginBottom:12}}>
            Por procesar ({pending.length})
          </h3>
          {pending.map(i=>{
            const days=daysAgo(i.createdAt);
            const isOld=days>=3;
            const suggestion=getSuggestion(i.content);
            const swipeDelta  = swipeOffsets[i.id] || 0;
            const swipeAbs    = Math.abs(swipeDelta);
            const swipeRight  = swipeDelta > 0;
            const swipeActive = swipeAbs > 8;
            const swipeReady  = swipeAbs >= SWIPE_THRESHOLD;
            return (
              <div key={i.id} style={{position:'relative',marginBottom:10,borderRadius:14,overflow:'hidden'}}>
                {/* Swipe hint bg — mobile only */}
                {isMobile&&swipeActive&&(
                  <div style={{
                    position:'absolute',inset:0,borderRadius:14,pointerEvents:'none',
                    background: swipeRight
                      ? `linear-gradient(90deg,${T.accent}${swipeReady?'44':'18'},${T.accent}${swipeReady?'28':'10'})`
                      : `linear-gradient(270deg,${T.red}${swipeReady?'44':'18'},${T.red}${swipeReady?'28':'10'})`,
                    display:'flex',alignItems:'center',
                    justifyContent:swipeRight?'flex-start':'flex-end',
                    padding:'0 22px',
                  }}>
                    <span style={{fontSize:22,opacity:swipeReady?1:0.45,transition:'opacity 0.12s'}}>
                      {swipeRight?'📝':'🗑️'}
                    </span>
                  </div>
                )}
                <Card
                  onTouchStart={isMobile?e=>onSwipeStart(i.id,e):undefined}
                  onTouchMove={isMobile?e=>onSwipeMove(i.id,e):undefined}
                  onTouchEnd={isMobile?e=>onSwipeEnd(i.id,i,e):undefined}
                  style={{
                    borderLeft:`3px solid ${isOld?T.orange:T.accent}`,
                    position:'relative',overflow:'hidden',
                    transform:isMobile&&swipeActive?`translateX(${Math.sign(swipeDelta)*Math.min(swipeAbs,110)}px)`:'translateX(0)',
                    transition:swipeActive?'none':'transform 0.22s ease',
                    touchAction:'pan-y',
                    userSelect:'none',
                  }}>
                  {/* Age badge */}
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                    <p style={{color:T.text,margin:0,fontSize:14,lineHeight:1.5,flex:1,paddingRight:8}}>{i.content}</p>
                    <div style={{flexShrink:0,fontSize:10,fontWeight:700,
                      color:isOld?T.orange:days===0?T.muted:T.dim,
                      background:isOld?`${T.orange}15`:'transparent',
                      border:isOld?`1px solid ${T.orange}30`:'none',
                      padding:isOld?'2px 8px':'0',borderRadius:6,whiteSpace:'nowrap'}}>
                      {days===0?'Hoy':days===1?'Ayer':`${days}d sin procesar`}
                    </div>
                  </div>

                  {/* AI suggestion */}
                  <div style={{display:'inline-flex',alignItems:'center',gap:5,marginBottom:10,
                    background:`${T.purple}10`,border:`1px solid ${T.purple}25`,
                    borderRadius:7,padding:'4px 10px'}}>
                    <span style={{fontSize:11}}>⚡</span>
                    <span style={{fontSize:11,color:T.purple,fontWeight:600}}>Psicke sugiere:</span>
                    <span style={{fontSize:11,color:T.muted}}>{suggestion.icon} {suggestion.module}</span>
                  </div>

                  {/* Swipe hint label — mobile, only when idle */}
                  {isMobile&&!swipeActive&&(
                    <div style={{fontSize:10,color:T.dim,marginBottom:8,letterSpacing:0.2}}>
                      ← eliminar &nbsp;·&nbsp; → guardar como nota
                    </div>
                  )}

                  {/* Action buttons */}
                  <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                    <button onClick={()=>{setWizard(i);setWizardStep(0);}}
                      style={{padding:'6px 12px',borderRadius:8,border:`1px solid ${T.accent}50`,
                        background:`${T.accent}12`,color:T.accent,cursor:'pointer',
                        fontSize:11,fontWeight:700,fontFamily:'inherit'}}>
                      🧭 Procesar con GTD
                    </button>
                    <Btn size="sm" variant="ghost" onClick={()=>convertToNote(i)}>📝 Nota</Btn>
                    <Btn size="sm" variant="ghost" onClick={()=>convertToTask(i)}>✅ Tarea</Btn>
                    <Btn size="sm" variant="ghost" onClick={()=>convertToObjective(i)}>🎯 Objetivo</Btn>
                    <Btn size="sm" variant="ghost" onClick={()=>process(i)}>✓ Listo</Btn>
                    <Btn size="sm" variant="danger" onClick={()=>del(i.id)} aria-label="Eliminar ítem"><Icon name="trash" size={11}/></Btn>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      )}

      {/* Processed */}
      {processed.length>0&&(
        <div style={{opacity:0.5}}>
          <h3 style={{color:T.muted,fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:1,marginBottom:12}}>Procesados</h3>
          {processed.slice(0,5).map(i=>(
            <div key={i.id} style={{display:'flex',gap:10,alignItems:'center',padding:'10px 0',borderBottom:`1px solid ${T.border}`}}>
              <Icon name="check" size={14} color={T.green}/>
              <span style={{color:T.muted,fontSize:14,flex:1}}>{i.content}</span>
              <button onClick={()=>del(i.id)} aria-label="Eliminar ítem procesado" style={{background:'none',border:'none',color:T.dim,cursor:'pointer',display:'flex',padding:4}}><Icon name="trash" size={14}/></button>
            </div>
          ))}
        </div>
      )}

      {/* GTD WIZARD MODAL */}
      {wizard&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:200,
          display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(6px)'}}>
          <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:20,
            padding:28,width:'100%',maxWidth:420,margin:'0 16px',boxShadow:'0 20px 60px rgba(0,0,0,0.6)'}}>

            {/* Progress bar */}
            <div style={{display:'flex',gap:5,marginBottom:24}}>
              {WIZARD_STEPS.map((_,i)=>(
                <div key={i} style={{flex:1,height:3,borderRadius:2,
                  background:i<=wizardStep?stepColors[i]:T.border,transition:'background 0.3s'}}/>
              ))}
            </div>

            <div style={{fontSize:10,color:T.muted,fontWeight:700,textTransform:'uppercase',letterSpacing:1,marginBottom:6}}>
              Paso {wizardStep+1} de {WIZARD_STEPS.length}
            </div>
            <h3 style={{color:T.text,fontSize:17,fontWeight:700,margin:'0 0 10px'}}>{WIZARD_STEPS[wizardStep].q}</h3>

            {/* Captured content */}
            <div style={{background:T.surface2,borderRadius:10,padding:'10px 14px',marginBottom:16,
              borderLeft:`3px solid ${stepColors[wizardStep]}`}}>
              <p style={{color:T.muted,fontSize:13,margin:0,lineHeight:1.5}}>{wizard.content}</p>
            </div>

            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {WIZARD_STEPS[wizardStep].opts.map((opt,i)=>(
                <button key={i} onClick={()=>handleWizardOpt(i)}
                  style={{padding:'12px 16px',borderRadius:12,border:`1px solid ${T.border}`,
                    background:T.surface2,color:T.text,cursor:'pointer',
                    textAlign:'left',fontSize:13,fontFamily:'inherit',transition:'all 0.15s'}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=stepColors[wizardStep];e.currentTarget.style.background=`${stepColors[wizardStep]}12`;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.background=T.surface2;}}>
                  {opt}
                </button>
              ))}
            </div>

            <button onClick={()=>{setWizard(null);setWizardStep(0);}}
              style={{marginTop:14,width:'100%',padding:'8px',background:'transparent',
                border:'none',color:T.dim,cursor:'pointer',fontSize:12,fontFamily:'inherit'}}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ===================== HABIT TRACKER =====================
const HabitTracker = ({data,setData,isMobile}) => {
  const [modal,setModal]=useState(false);
  const [form,setForm]=useState({name:'',frequency:'daily',objectiveId:''});
  const [selectedHabit,setSelectedHabit]=useState(null);
  const [freqFilter,setFreqFilter]=useState('all');
  const [dragIdx,setDragIdx]=useState(null);
  const [touchDrag,setTouchDrag]=useState(null); // {idx, startY, currentY, el}
  const habitListRef=useRef(null);
  const todayStr=today();

  const toggle=(habitId,date)=>{
    const updated=data.habits.map(h=>{
      if(h.id!==habitId)return h;
      const has=h.completions.includes(date);
      return {...h,completions:has?h.completions.filter(d=>d!==date):[...h.completions,date]};
    });
    setData(d=>({...d,habits:updated}));save('habits',updated);
    if(selectedHabit?.id===habitId)setSelectedHabit(updated.find(h=>h.id===habitId));
  };

  const add=()=>{
    if(!form.name.trim())return;
    const updated=[...data.habits,{id:uid(),...form,completions:[]}];
    setData(d=>({...d,habits:updated}));save('habits',updated);
    setModal(false);setForm({name:'',frequency:'daily',objectiveId:''});
  };
  const del=(id)=>{
    const u=data.habits.filter(h=>h.id!==id);
    setData(d=>({...d,habits:u}));save('habits',u);
    if(selectedHabit?.id===id)setSelectedHabit(null);
  };

  const computeStreak=(h)=>{
    const freq=h.frequency||'daily';
    const fd=(d)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    if(freq==='daily'){
      let s=0,d=new Date();
      while(h.completions.includes(fd(d))){s++;d.setDate(d.getDate()-1);}
      return s;
    }
    if(freq==='weekly'){
      let s=0,d=new Date();
      d.setDate(d.getDate()-d.getDay()); // start of current week (Sun)
      while(true){
        const wDates=Array.from({length:7},(_,i)=>{const dd=new Date(d);dd.setDate(dd.getDate()+i);return fd(dd);});
        if(wDates.some(wd=>h.completions.includes(wd)))s++;else break;
        d.setDate(d.getDate()-7);
      }
      return s;
    }
    // monthly
    let s=0,d=new Date();
    while(true){
      const mKey=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      if(h.completions.some(c=>c.slice(0,7)===mKey))s++;else break;
      d.setMonth(d.getMonth()-1);
    }
    return s;
  };
  const computeMaxStreak=(h)=>{
    if(!h.completions.length)return 0;
    const freq=h.frequency||'daily';
    if(freq==='daily'){
      const sorted=[...h.completions].sort();
      let maxS=1,cur=1;
      for(let i=1;i<sorted.length;i++){
        const diff=(new Date(sorted[i])-new Date(sorted[i-1]))/86400000;
        if(diff===1){cur++;maxS=Math.max(maxS,cur);}else cur=1;
      }
      return maxS;
    }
    if(freq==='weekly'){
      const weeks=new Set(h.completions.map(c=>{const d=new Date(c);const sun=new Date(d);sun.setDate(d.getDate()-d.getDay());return sun.toISOString().slice(0,10);}));
      const sorted=[...weeks].sort();
      let maxS=1,cur=1;
      for(let i=1;i<sorted.length;i++){
        const diff=(new Date(sorted[i])-new Date(sorted[i-1]))/86400000;
        if(diff===7){cur++;maxS=Math.max(maxS,cur);}else cur=1;
      }
      return maxS;
    }
    // monthly
    const months=new Set(h.completions.map(c=>c.slice(0,7)));
    const sorted=[...months].sort();
    let maxS=1,cur=1;
    for(let i=1;i<sorted.length;i++){
      const[y1,m1]=sorted[i-1].split('-').map(Number);
      const[y2,m2]=sorted[i].split('-').map(Number);
      if((y2*12+m2)-(y1*12+m1)===1){cur++;maxS=Math.max(maxS,cur);}else cur=1;
    }
    return maxS;
  };

  const last28=Array.from({length:28},(_,i)=>{const d=new Date();d.setDate(d.getDate()-i);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;});
  const weekDates=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-6+i);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;});

  const dailyHabits=data.habits.filter(h=>!h.frequency||h.frequency==='daily');
  const todayDone=dailyHabits.filter(h=>h.completions.includes(todayStr)).length;
  const todayTotal=dailyHabits.length;
  const todayPct=todayTotal?Math.round(todayDone/todayTotal*100):0;
  const weekTotal=data.habits.reduce((s,h)=>s+weekDates.filter(d=>h.completions.includes(d)).length,0);
  const weekPossible=dailyHabits.length*7;
  const weekPct=weekPossible?Math.round(weekTotal/weekPossible*100):0;
  // % últimas 4 semanas (28 días) — solo hábitos diarios
  const month28Total=dailyHabits.reduce((s,h)=>s+last28.filter(d=>h.completions.includes(d)).length,0);
  const month28Possible=dailyHabits.length*28;
  const month28Pct=month28Possible?Math.round(month28Total/month28Possible*100):0;
  const allStreaks=data.habits.map(h=>({id:h.id,streak:computeStreak(h),maxStreak:computeMaxStreak(h)}));
  const bestStreakData=(()=>{const best=allStreaks.reduce((max,s)=>s.streak>max.streak?s:max,{streak:0,id:''});const habit=data.habits.find(h=>h.id===best.id);const u=!habit||!habit.frequency||habit.frequency==='daily'?'d':habit.frequency==='weekly'?'sem':'m';return{val:best.streak,unit:u};})();

  const HABIT_COLORS=['#4da6ff','#00c896','#ff8c42','#a78bfa','#ff5069','#ffd166','#00e0a8','#ff6b8a'];
  const habitColor=(h,idx)=>h.color||(HABIT_COLORS[idx%HABIT_COLORS.length]);
  const filteredHabits=freqFilter==='all'?data.habits:data.habits.filter(h=>(h.frequency||'daily')===freqFilter);

  const onDragStart=(i)=>setDragIdx(i);
  const onDrop=(targetIdx)=>{
    if(dragIdx===null||dragIdx===targetIdx)return;
    const arr=[...data.habits];
    const [moved]=arr.splice(dragIdx,1);
    arr.splice(targetIdx,0,moved);
    setData(d=>({...d,habits:arr}));save('habits',arr);
    setDragIdx(null);
  };

  // ── Touch drag & drop (mobile) ──
  const touchTimerRef=useRef(null);
  const onTouchDragStart=(idx,e)=>{
    // Long-press to initiate drag on mobile
    const touch=e.touches[0];
    touchTimerRef.current=setTimeout(()=>{
      setTouchDrag({idx,startY:touch.clientY,currentY:touch.clientY});
      setDragIdx(idx);
    },300);
  };
  const onTouchDragMove=(e)=>{
    if(touchDrag===null){clearTimeout(touchTimerRef.current);return;}
    e.preventDefault(); // prevent scroll while dragging
    clearTimeout(touchTimerRef.current);
    const touch=e.touches[0];
    setTouchDrag(td=>td?{...td,currentY:touch.clientY}:null);
    // Find which habit card we're hovering over
    if(!habitListRef.current)return;
    const cards=habitListRef.current.querySelectorAll('[data-habit-idx]');
    for(const card of cards){
      const rect=card.getBoundingClientRect();
      if(touch.clientY>=rect.top&&touch.clientY<=rect.bottom){
        const hoverIdx=parseInt(card.getAttribute('data-habit-idx'));
        if(hoverIdx!==touchDrag.idx){
          // Reorder in real-time
          const arr=[...data.habits];
          const [moved]=arr.splice(touchDrag.idx,1);
          arr.splice(hoverIdx,0,moved);
          setData(d=>({...d,habits:arr}));save('habits',arr);
          setTouchDrag(td=>td?{...td,idx:hoverIdx}:null);
          setDragIdx(hoverIdx);
        }
        break;
      }
    }
  };
  const onTouchDragEnd=()=>{
    clearTimeout(touchTimerRef.current);
    setTouchDrag(null);
    setDragIdx(null);
  };

  return (
    <div>
      <PageHeader title="Habit Tracker" subtitle="Construye rachas diarias 🔥" isMobile={isMobile}
        action={<Btn onClick={()=>setModal(true)} size="sm"><Icon name="plus" size={14}/>Nuevo</Btn>}/>

      {/* ── Stats ── */}
      {data.habits.length>0&&(
        <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr 1fr':'repeat(4,1fr)',gap:10,marginBottom:16}}>
          <Card style={{textAlign:'center',padding:isMobile?10:14}}>
            <div style={{fontSize:10,color:T.muted,marginBottom:4}}>Hoy</div>
            <div style={{fontSize:isMobile?20:24,fontWeight:700,color:todayPct===100?T.green:todayPct>50?T.accent:T.text}}>{todayDone}/{todayTotal}</div>
            <div style={{height:3,background:T.border,borderRadius:2,marginTop:6}}>
              <div style={{height:'100%',width:`${todayPct}%`,background:todayPct===100?T.green:T.accent,borderRadius:2,transition:'width 0.3s'}}/>
            </div>
          </Card>
          <Card style={{textAlign:'center',padding:isMobile?10:14}}>
            <div style={{fontSize:10,color:T.muted,marginBottom:4}}>Mejor racha</div>
            <div style={{fontSize:isMobile?20:24,fontWeight:700,color:bestStreakData.val>=7?T.green:bestStreakData.val>=3?T.accent:T.text}}>🔥 {bestStreakData.val}{bestStreakData.unit}</div>
          </Card>
          <Card style={{textAlign:'center',padding:isMobile?10:14}}>
            <div style={{fontSize:10,color:T.muted,marginBottom:4}}>Esta semana</div>
            <div style={{fontSize:isMobile?20:24,fontWeight:700,color:weekPct>=80?T.green:weekPct>=50?T.accent:T.text}}>{weekPct}%</div>
            <div style={{height:3,background:T.border,borderRadius:2,marginTop:6}}>
              <div style={{height:'100%',width:`${weekPct}%`,background:weekPct>=80?T.green:T.accent,borderRadius:2,transition:'width 0.3s'}}/>
            </div>
          </Card>
          <Card style={{textAlign:'center',padding:isMobile?10:14}}>
            <div style={{fontSize:10,color:T.muted,marginBottom:4}}>Últimas 4 sem.</div>
            <div style={{fontSize:isMobile?20:24,fontWeight:700,color:month28Pct>=80?T.green:month28Pct>=50?T.accent:T.red}}>{month28Pct}%</div>
            <div style={{height:3,background:T.border,borderRadius:2,marginTop:6}}>
              <div style={{height:'100%',width:`${month28Pct}%`,background:month28Pct>=80?T.green:month28Pct>=50?T.accent:T.red,borderRadius:2,transition:'width 0.3s'}}/>
            </div>
          </Card>
        </div>
      )}

      {/* ── Frequency filter ── */}
      {data.habits.length>0&&(
        <div style={{display:'flex',gap:4,background:T.surface2,borderRadius:10,padding:3,marginBottom:14,width:'fit-content'}}>
          {['all','daily','weekly','monthly'].map(f=>(
            <button key={f} onClick={()=>setFreqFilter(f)}
              style={{padding:'5px 14px',borderRadius:7,border:'none',cursor:'pointer',fontSize:11,fontWeight:600,fontFamily:'inherit',
                background:freqFilter===f?T.accent:'transparent',color:freqFilter===f?'#000':T.muted,transition:'all 0.15s'}}>
              {f==='all'?'Todos':f==='daily'?'Diarios':f==='weekly'?'Semanales':'Mensuales'}
            </button>
          ))}
        </div>
      )}

      {/* ── Habit cards ── */}
      <div ref={habitListRef} onTouchMove={onTouchDragMove} onTouchEnd={onTouchDragEnd} onTouchCancel={onTouchDragEnd}
        style={{display:'flex',flexDirection:'column',gap:6}}>
        {filteredHabits.map((h,idx)=>{
          const realIdx=data.habits.indexOf(h);
          const color=habitColor(h,realIdx);
          const done=h.completions.includes(todayStr);
          const streak=allStreaks.find(s=>s.id===h.id)?.streak||0;
          const maxStreak=allStreaks.find(s=>s.id===h.id)?.maxStreak||0;
          const isSelected=selectedHabit?.id===h.id;
          const pct28=Math.round(last28.filter(d=>h.completions.includes(d)).length/28*100);
          const days28=last28.filter(d=>h.completions.includes(d)).length;
          return (
            <div key={h.id}>
              {/* ── Card row ── */}
              <div
                data-habit-idx={realIdx}
                draggable
                onDragStart={()=>onDragStart(realIdx)}
                onDragOver={e=>e.preventDefault()}
                onDrop={()=>onDrop(realIdx)}
                onTouchStart={e=>onTouchDragStart(realIdx,e)}
                style={{
                  background:T.surface,
                  border:`1.5px solid ${isSelected?color+'60':T.border}`,
                  borderLeft:`3px solid ${color}`,
                  borderRadius:12,
                  padding:'12px 14px',
                  display:'flex',
                  alignItems:'center',
                  gap:10,
                  transition:touchDrag?'none':'all 0.15s',
                  opacity:dragIdx===realIdx?0.45:1,
                  cursor:'default',
                  ...(touchDrag&&touchDrag.idx===realIdx?{zIndex:10,boxShadow:`0 4px 20px ${color}30`,transform:'scale(1.02)'}:{}),
                }}>

                {/* Drag handle */}
                <div style={{color:touchDrag&&touchDrag.idx===realIdx?T.accent:T.dim,fontSize:18,cursor:'grab',flexShrink:0,userSelect:'none',lineHeight:1,touchAction:'none',padding:'4px 0'}}>⠿</div>

                {/* Circular toggle */}
                <button
                  onClick={e=>{e.stopPropagation();toggle(h.id,todayStr);}}
                  style={{
                    width:30,height:30,borderRadius:'50%',flexShrink:0,
                    border:`2.5px solid ${done?color:T.border}`,
                    background:done?color:'transparent',
                    cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',
                    transition:'all 0.2s',
                  }}>
                  {done&&<Icon name="check" size={13} color="#000"/>}
                </button>

                {/* Name + frequency */}
                <div style={{flex:1,minWidth:0,cursor:'pointer'}} onClick={()=>setSelectedHabit(isSelected?null:h)}>
                  <div style={{fontSize:14,fontWeight:500,color:done?T.muted:T.text,
                    textDecoration:done?'line-through':'none',lineHeight:1.3}}>{h.name}</div>
                  <div style={{fontSize:10,color:T.dim,marginTop:2}}>
                    {(h.frequency||'daily')==='daily'?'Diario':(h.frequency==='weekly'?'Semanal':'Mensual')}
                    {h.objectiveId&&(()=>{const o=data.objectives?.find(x=>x.id===h.objectiveId);return o?<span style={{color:T.purple}}> · 🎯 {o.title.slice(0,20)}</span>:null;})()}
                  </div>
                </div>

                {/* Streak badge */}
                <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:2,flexShrink:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:3,background:`${color}18`,borderRadius:7,padding:'3px 9px'}}>
                    <span style={{fontSize:11}}>🔥</span>
                    <span style={{fontSize:12,fontWeight:700,color}}>{streak}{(h.frequency||'daily')==='daily'?'d':h.frequency==='weekly'?'sem':'m'}</span>
                  </div>
                  <span style={{fontSize:9,color:T.dim}}>máx {maxStreak}</span>
                </div>

                {/* Delete */}
                <button
                  onClick={e=>{e.stopPropagation();del(h.id);}}
                  style={{background:'none',border:'none',color:T.dim,cursor:'pointer',padding:'3px',display:'flex',flexShrink:0}}>
                  <Icon name="trash" size={12}/>
                </button>
              </div>

              {/* ── Inline detail panel ── */}
              {isSelected&&(
                <div style={{
                  background:`${color}06`,
                  border:`1.5px solid ${color}30`,
                  borderTop:'none',
                  borderRadius:'0 0 12px 12px',
                  padding:'14px 16px',
                }}>
                  {/* Header */}
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                    <span style={{fontWeight:700,fontSize:13,color:T.text}}>{h.name} — {(h.frequency||'daily')==='daily'?'últimas 5 semanas':h.frequency==='weekly'?'últimas semanas':'últimos meses'}</span>
                    <div style={{display:'flex',gap:10,alignItems:'center'}}>
                      <div style={{textAlign:'center'}}>
                        <div style={{fontSize:16,fontWeight:800,color}}>{days28}/28</div>
                        <div style={{fontSize:9,color:T.muted}}>últimos días</div>
                      </div>
                      <Ring pct={pct28} color={color} size={46} stroke={4}/>
                    </div>
                  </div>

                  {/* Heatmap */}
                  <HabitHeatmap completions={h.completions} color={color}/>

                  {/* Weekly performance bars */}
                  <HabitWeeklyBars habit={h} color={color}/>

                  {/* Stat pills */}
                  <div style={{display:'flex',gap:8,marginTop:12}}>
                    {[
                      {v:`🔥 ${streak}`,c:color,   l:(h.frequency||'daily')==='daily'?'Racha (días)':h.frequency==='weekly'?'Racha (sem.)':'Racha (meses)'},
                      {v:`⚡ ${maxStreak}`,c:T.orange,l:'Racha máxima'},
                      {v:h.completions.length,c:T.text,l:'Total completions'},
                    ].map(s=>(
                      <div key={s.l} style={{flex:1,background:T.surface2,borderRadius:9,padding:'9px 10px',textAlign:'center'}}>
                        <div style={{fontSize:15,fontWeight:800,color:s.c,lineHeight:1}}>{s.v}</div>
                        <div style={{fontSize:9,color:T.muted,marginTop:3}}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {!filteredHabits.length&&(
          <div style={{padding:'40px 20px',textAlign:'center',color:T.dim,background:T.surface,borderRadius:12,border:`1px solid ${T.border}`}}>
            <div style={{fontSize:40,marginBottom:8}}>🔥</div>
            <p style={{margin:'0 0 4px',fontSize:14}}>{data.habits.length?'Sin hábitos en este filtro':'Sin hábitos aún'}</p>
            <p style={{margin:'0 0 12px',fontSize:12,color:T.muted}}>Los hábitos se construyen un día a la vez.</p>
            <Btn size="sm" onClick={()=>setModal(true)}><Icon name="plus" size={12}/>Crear primer hábito</Btn>
          </div>
        )}
      </div>

      {modal&&(
        <Modal title="Nuevo hábito" onClose={()=>setModal(false)}>
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <Input value={form.name} onChange={v=>setForm(f=>({...f,name:v}))} placeholder="Nombre del hábito"/>
            <Select value={form.frequency} onChange={v=>setForm(f=>({...f,frequency:v}))}>
              <option value="daily">Diario</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensual</option>
            </Select>
            <Select value={form.objectiveId} onChange={v=>setForm(f=>({...f,objectiveId:v}))}>
              <option value="">Sin objetivo vinculado</option>
              {data.objectives.filter(o=>o.status==='active').map(o=><option key={o.id} value={o.id}>🎯 {o.title}</option>)}
            </Select>
            <Btn onClick={add} style={{width:'100%',justifyContent:'center'}}>Crear hábito</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};



// ===================== GEMINI CONFIG =====================
const GEMINI_MODEL='gemini-2.5-flash';


// ===================== SETTINGS =====================
const Settings = ({apiKey,setApiKey,isMobile,data,setData,viewHint,onConsumeHint,onOpenPsicke}) => {
  const [val,setVal]=useState(apiKey);
  const [show,setShow]=useState(false);
  const [saved,setSaved]=useState(false);
  const [sTab,setSTab]=useState('ia');
  const [reviewStep,setReviewStep]=useState(0);
  const [notifEnabled,setNotifEnabled]=useState(()=>{try{return localStorage.getItem('sb_notifs')==='true';}catch{return false;}});
  const [notifSettings,setNotifSettings]=useState(()=>{
    try{return JSON.parse(localStorage.getItem('sb_notif_cfg')||'{}');}catch{return {};}
  });

  // Navigate to revision tab if hinted from dashboard
  useEffect(()=>{
    if(viewHint==='revision'){setSTab('revision');setReviewStep(0);onConsumeHint?.();}
  },[viewHint]);

  const handleSave=()=>{
    const k=val.trim();
    localStorage.setItem('sb_gemini_key',k);
    setApiKey(k);setSaved(true);
    setTimeout(()=>setSaved(false),2500);
    toast.success('API Key guardada');
  };
  const handleClear=()=>{setVal('');setApiKey('');localStorage.removeItem('sb_gemini_key');toast.info('API Key eliminada');};

  // ── BACKUP ──
  const exportData=()=>{
    if(!data) return;
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url; a.download=`segundo-cerebro-${today()}.json`;
    a.click(); URL.revokeObjectURL(url);
    toast.success('Backup exportado','Guardado en tu carpeta de descargas');
  };

  const importData=(e)=>{
    const file=e.target.files[0]; if(!file) return;
    const reader=new FileReader();
    reader.onload=(ev)=>{
      try{
        const imported=JSON.parse(ev.target.result);
        if(!imported||typeof imported!=='object') throw new Error('Formato inválido');
        setData(d=>({...d,...imported}));
        Object.entries(imported).forEach(([k,v])=>save(k,v));
        toast.success('Datos importados correctamente','Todos los módulos actualizados');
      } catch(err){
        toast.error('Error al importar','El archivo no es un backup válido');
      }
    };
    reader.readAsText(file);
    e.target.value='';
  };

  // ── WEEKLY REVIEW ──
  const reviewSteps=[
    {icon:'📥',title:'Inbox',q:'¿Quedó algo sin procesar?',key:'inbox',count:data?data.inbox.filter(i=>!i.processed).length:0},
    {icon:'✅',title:'Tareas',q:'¿Completaste lo que planeabas?',key:'tasks',count:data?data.tasks.filter(t=>t.status!=='done').length:0},
    {icon:'🎯',title:'Objetivos',q:'¿Avanzaste en tus objetivos activos?',key:'objectives',count:data?data.objectives.filter(o=>o.status==='active').length:0},
    {icon:'🔥',title:'Hábitos',q:'¿Cómo fue tu constancia esta semana?',key:'habits',count:data?data.habits.length:0},
    {icon:'🧠',title:'Psicke',q:'Genera un resumen de la semana con IA',key:'psicke',psicke:true},
  ];

  // ── NOTIFICATIONS ──
  const requestNotifs=async()=>{
    if(!('Notification' in window)){toast.error('Notificaciones no soportadas en este navegador');return;}
    const perm=await Notification.requestPermission();
    if(perm==='granted'){
      setNotifEnabled(true);localStorage.setItem('sb_notifs','true');
      toast.success('Notificaciones activadas');
      new Notification('Segundo Cerebro',{body:'Las notificaciones están activas ✓'});
    } else {
      toast.warn('Notificaciones denegadas','Habilítalas en la configuración del navegador');
    }
  };
  const toggleNotif=(key)=>{
    const updated={...notifSettings,[key]:!notifSettings[key]};
    setNotifSettings(updated);
    localStorage.setItem('sb_notif_cfg',JSON.stringify(updated));
  };

  // ── Schedule real browser notifications ──
  const notifTimersRef=useRef({});
  useEffect(()=>{
    if(!notifEnabled||!data||Notification.permission!=='granted') return;
    // Clear previous timers
    Object.values(notifTimersRef.current).forEach(clearTimeout);
    notifTimersRef.current={};

    const msUntil=(hh,mm,extraDays=0)=>{
      const now=new Date();
      const t=new Date(now.getFullYear(),now.getMonth(),now.getDate()+extraDays,hh,mm,0,0);
      if(t<=now) t.setDate(t.getDate()+1);
      return t-now;
    };

    // Hábitos: recordatorio a las 20:00 si hay hábitos sin completar
    if(notifSettings.habits){
      const ms=msUntil(20,0);
      notifTimersRef.current['habits']=setTimeout(()=>{
        const pending=(data.habits||[]).filter(h=>!h.completions.includes(today())).length;
        if(pending>0){
          new Notification('🔥 Hábitos pendientes',{
            body:`Tienes ${pending} hábito${pending>1?'s':''} sin completar hoy.`,
            icon:'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><text y="28" font-size="28">🔥</text></svg>'
          });
        }
      },ms);
    }

    // Cumpleaños: recordatorio a las 09:00 del día del cumpleaños
    if(notifSettings.bdays && data.people){
      data.people.forEach(p=>{
        if(!p.birthday) return;
        const [,m,d]=p.birthday.split('-');
        const now=new Date();
        const bday=new Date(now.getFullYear(),Number(m)-1,Number(d),9,0,0,0);
        if(bday<now) bday.setFullYear(now.getFullYear()+1);
        const ms=bday-now;
        if(ms<86400000*2){ // sólo programar si es en menos de 2 días
          notifTimersRef.current[`bday_${p.id}`]=setTimeout(()=>{
            new Notification(`🎂 Cumpleaños de ${p.name}`,{
              body:`Hoy es el cumpleaños de ${p.emoji||'👤'} ${p.name}. ¡No olvides felicitarle!`,
              icon:'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><text y="28" font-size="28">🎂</text></svg>'
            });
          },ms);
        }
      });
    }

    // Documentos por vencer: aviso 30, 7 y 1 día antes a las 09:00
    if(notifSettings.docs && data.homeDocs){
      const todayStr=today();
      data.homeDocs.forEach(doc=>{
        if(!doc.expiresAt) return;
        [30,7,1].forEach(days=>{
          const d=new Date(doc.expiresAt+'T09:00:00');
          d.setDate(d.getDate()-days);
          const ms=d-new Date();
          if(ms>0 && ms<86400000*31){
            notifTimersRef.current[`doc_${doc.id}_${days}`]=setTimeout(()=>{
              new Notification(`📄 Documento por vencer`,{
                body:`"${doc.name}" vence en ${days} día${days>1?'s':''}.`,
                icon:'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><text y="28" font-size="28">📄</text></svg>'
              });
            },ms);
          }
        });
      });
    }

    // Medicamentos: recordatorio automático según hora configurada
    if(notifSettings.meds && data.medications){
      (data.medications||[]).forEach(med=>{
        if(!med.time) return;
        const [hh,mm]=(med.time).split(':').map(Number);
        const now=new Date();
        const next=new Date(now.getFullYear(),now.getMonth(),now.getDate(),hh,mm,0,0);
        if(next<=now) next.setDate(next.getDate()+1);
        const ms=next-now;
        // Only schedule if within 24h
        if(ms>0&&ms<86400000){
          notifTimersRef.current[`med_${med.id}`]=setTimeout(()=>{
            new Notification(`💊 Medicamento: ${med.name}`,{
              body:`${med.dose||''}${med.unit||''} — ${med.frequency||'Diaria'}`,
              icon:'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><text y="28" font-size="28">💊</text></svg>'
            });
          },ms);
        }
      });
    }

    return ()=>Object.values(notifTimersRef.current).forEach(clearTimeout);
  },[notifEnabled,notifSettings,data]);

  const NOTIF_OPTIONS=[
    {key:'habits',label:'Hábitos pendientes',time:'20:00 cada día'},
    {key:'meds',label:'Medicamentos',time:'Según horario configurado'},
    {key:'weekly',label:'Revisión semanal',time:'Domingos a las 19:00'},
    {key:'docs',label:'Documentos por vencer',time:'30, 7 y 1 día antes'},
    {key:'bdays',label:'Cumpleaños',time:'Día del cumpleaños, 09:00'},
  ];

  const STABS=[{id:'ia',label:'🤖 IA'},{id:'backup',label:'💾 Backup'},{id:'revision',label:'📋 Revisión semanal'},{id:'notifs',label:'🔔 Notificaciones'}];

  return (
    <div style={{maxWidth:560,margin:'0 auto',padding:isMobile?'0 0 80px':'0 0 40px'}}>
      <PageHeader title="Configuración" subtitle="Ajustes y herramientas del sistema" isMobile={isMobile}/>

      {/* Sub-tabs */}
      <div style={{display:'flex',gap:6,marginBottom:20,flexWrap:'wrap'}}>
        {STABS.map(t=>(
          <button key={t.id} onClick={()=>setSTab(t.id)}
            style={{padding:'7px 16px',borderRadius:10,border:`1px solid ${sTab===t.id?T.accent:T.border}`,background:sTab===t.id?`${T.accent}18`:'transparent',color:sTab===t.id?T.accent:T.muted,cursor:'pointer',fontSize:13,fontWeight:600,fontFamily:'inherit'}}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── IA ── */}
      {sTab==='ia'&&(
        <>
          <Card style={{marginBottom:16}}>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
              <div style={{width:40,height:40,background:`${T.accent}22`,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <Icon name="key" size={20} color={T.accent}/>
              </div>
              <div>
                <div style={{color:T.text,fontWeight:600,fontSize:15}}>Google Gemini API Key</div>
                <div style={{color:T.muted,fontSize:12,marginTop:2}}>Necesaria para el asistente IA</div>
              </div>
              <div style={{marginLeft:'auto',width:10,height:10,borderRadius:'50%',background:apiKey?T.green:T.dim}}/>
            </div>
            <div style={{position:'relative',marginBottom:12}}>
              <input type={show?'text':'password'} value={val} onChange={e=>setVal(e.target.value)}
                placeholder="AIza..." style={{width:'100%',background:T.bg,border:`1px solid ${T.border}`,color:T.text,padding:'10px 60px 10px 14px',borderRadius:10,fontSize:14,outline:'none',fontFamily:'inherit',boxSizing:'border-box'}}/>
              <button onClick={()=>setShow(s=>!s)} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:T.muted,cursor:'pointer',fontSize:12,fontFamily:'inherit'}}>{show?'Ocultar':'Ver'}</button>
            </div>
            <div style={{display:'flex',gap:10}}>
              <Btn onClick={handleSave} style={{flex:1,justifyContent:'center'}}>
                {saved?<><Icon name="checkCircle" size={15}/>Guardada</>:<><Icon name="key" size={15}/>Guardar</>}
              </Btn>
              {apiKey&&<Btn variant="danger" onClick={handleClear} size="md" style={{flexShrink:0}}>Limpiar</Btn>}
            </div>
          </Card>
          <Card>
            <div style={{color:T.muted,fontSize:13,lineHeight:1.7}}>
              <div style={{color:T.text,fontWeight:600,fontSize:14,marginBottom:10}}>¿Cómo obtener la API Key?</div>
              <ol style={{margin:0,paddingLeft:18,display:'flex',flexDirection:'column',gap:6}}>
                <li>Ve a <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{color:T.accent}}>aistudio.google.com</a></li>
                <li>Inicia sesión con tu cuenta de Google</li>
                <li>Haz clic en "Create API Key"</li>
                <li>Copia la clave y pégala arriba</li>
              </ol>
              <div style={{marginTop:12,padding:'10px 14px',background:`${T.green}12`,borderRadius:8,borderLeft:`3px solid ${T.green}`,fontSize:12}}>
                ✓ El plan gratuito de Gemini es suficiente para uso personal intensivo.
              </div>
            </div>
          </Card>
        </>
      )}

      {/* ── BACKUP ── */}
      {sTab==='backup'&&(
        <>
          <Card style={{marginBottom:14}}>
            <div style={{color:T.text,fontWeight:600,fontSize:14,marginBottom:6}}>Exportar datos</div>
            <div style={{color:T.muted,fontSize:12,marginBottom:14,lineHeight:1.6}}>Descarga todos tus datos como archivo JSON. Puedes restaurarlos en cualquier momento.</div>
            {data&&(
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:16}}>
                {[
                  {label:'Notas',val:data.notes?.length||0,color:T.blue},
                  {label:'Tareas',val:data.tasks?.length||0,color:T.accent},
                  {label:'Hábitos',val:data.habits?.length||0,color:T.orange},
                  {label:'Personas',val:data.people?.length||0,color:T.purple},
                  {label:'Finanzas',val:data.transactions?.length||0,color:T.green},
                  {label:'Objetivos',val:data.objectives?.length||0,color:T.red},
                ].map(s=>(
                  <div key={s.label} style={{background:T.surface2,borderRadius:8,padding:'8px 10px'}}>
                    <div style={{fontSize:10,color:T.muted}}>{s.label}</div>
                    <div style={{fontSize:16,fontWeight:800,color:s.color}}>{s.val}</div>
                  </div>
                ))}
              </div>
            )}
            <button onClick={exportData} style={{width:'100%',padding:'12px',borderRadius:10,border:'none',background:T.accent,color:'#000',cursor:'pointer',fontSize:14,fontWeight:700,fontFamily:'inherit'}}>
              ⬇️ Exportar todo como JSON
            </button>
          </Card>
          <Card>
            <div style={{color:T.text,fontWeight:600,fontSize:14,marginBottom:6}}>Importar datos</div>
            <div style={{color:T.muted,fontSize:12,marginBottom:14,lineHeight:1.6}}>Restaura desde un archivo JSON exportado anteriormente. Los datos actuales serán reemplazados.</div>
            <label style={{display:'block',border:`2px dashed ${T.border}`,borderRadius:10,padding:'24px',textAlign:'center',cursor:'pointer',transition:'border-color 0.2s'}}
              onMouseEnter={e=>e.currentTarget.style.borderColor=T.accent}
              onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
              <div style={{fontSize:30,marginBottom:8}}>📂</div>
              <div style={{fontSize:13,color:T.muted}}>Arrastra tu archivo backup.json aquí</div>
              <div style={{fontSize:11,color:T.dim,marginTop:4}}>o haz clic para seleccionar</div>
              <input type="file" accept=".json" onChange={importData} style={{display:'none'}}/>
            </label>
          </Card>
        </>
      )}

      {/* ── REVISIÓN SEMANAL ── */}
      {sTab==='revision'&&(
        <>
          <div style={{background:`${T.accent}08`,border:`1px solid ${T.accent}30`,borderRadius:12,padding:'14px 16px',marginBottom:16}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
              <div style={{fontSize:14,fontWeight:700,color:T.accent}}>📋 Revisión semanal</div>
            </div>
            <div style={{fontSize:12,color:T.muted}}>Revisa tu semana guiado paso a paso en 5 minutos.</div>
          </div>

          {/* Step progress */}
          <div style={{display:'flex',gap:6,marginBottom:16,overflowX:'auto',paddingBottom:4}}>
            {reviewSteps.map((s,i)=>(
              <button key={i} onClick={()=>setReviewStep(i)} style={{
                flexShrink:0,padding:'8px 14px',borderRadius:10,
                border:`2px solid ${reviewStep===i?T.accent:reviewStep>i?T.green:T.border}`,
                background:reviewStep===i?`${T.accent}15`:reviewStep>i?`${T.green}10`:'transparent',
                color:reviewStep===i?T.accent:reviewStep>i?T.green:T.muted,
                cursor:'pointer',fontSize:12,fontWeight:600,fontFamily:'inherit',
                display:'flex',flexDirection:'column',alignItems:'center',gap:3,
              }}>
                <span style={{fontSize:18}}>{s.icon}</span>
                <span>{s.title}</span>
                {reviewStep>i&&<span style={{fontSize:9,color:T.green}}>✓</span>}
              </button>
            ))}
          </div>

          <Card>
            {!reviewSteps[reviewStep].psicke?(
              <div>
                <div style={{fontSize:24,marginBottom:10}}>{reviewSteps[reviewStep].icon}</div>
                <div style={{fontSize:16,fontWeight:700,color:T.text,marginBottom:6}}>{reviewSteps[reviewStep].title}</div>
                <div style={{fontSize:13,color:T.muted,marginBottom:14}}>{reviewSteps[reviewStep].q}</div>
                <div style={{display:'inline-block',background:`${T.accent}12`,border:`1px solid ${T.accent}30`,borderRadius:8,padding:'6px 14px',fontSize:12,color:T.accent,fontWeight:700,marginBottom:14}}>
                  {reviewSteps[reviewStep].count} ítems
                </div>
                <textarea placeholder="Notas de esta sección..." rows={3} style={{
                  width:'100%',background:T.surface2,border:`1px solid ${T.border}`,borderRadius:10,
                  color:T.text,padding:'10px 12px',fontSize:12,outline:'none',resize:'none',
                  fontFamily:'inherit',boxSizing:'border-box',display:'block',
                }}/>
                <div style={{display:'flex',gap:8,marginTop:12}}>
                  <button onClick={()=>setReviewStep(Math.max(0,reviewStep-1))} style={{padding:'8px 14px',borderRadius:8,border:`1px solid ${T.border}`,background:'transparent',color:T.muted,cursor:'pointer',fontSize:12,fontFamily:'inherit'}}>← Atrás</button>
                  <button onClick={()=>setReviewStep(Math.min(reviewSteps.length-1,reviewStep+1))} style={{flex:1,padding:'8px',borderRadius:8,border:'none',background:T.accent,color:'#000',cursor:'pointer',fontSize:13,fontWeight:700,fontFamily:'inherit'}}>Siguiente →</button>
                </div>
              </div>
            ):(
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:36,marginBottom:10}}>🧠</div>
                <div style={{fontSize:15,fontWeight:700,color:T.text,marginBottom:8}}>Resumen con Psicke</div>
                <div style={{fontSize:12,color:T.muted,lineHeight:1.7,marginBottom:16,textAlign:'left',background:T.surface2,borderRadius:10,padding:'12px 14px'}}>
                  {data&&`Tienes ${data.inbox.filter(i=>!i.processed).length} ítems en inbox, ${data.tasks.filter(t=>t.status!=='done').length} tareas pendientes, ${data.objectives.filter(o=>o.status==='active').length} objetivos activos y ${data.habits.length} hábitos configurados.`}
                </div>
                <div style={{display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap'}}>
                  <button onClick={()=>setReviewStep(0)} style={{padding:'10px 20px',borderRadius:10,border:`1px solid ${T.border}`,background:'transparent',color:T.muted,cursor:'pointer',fontSize:13,fontFamily:'inherit'}}>Reiniciar</button>
                  {onOpenPsicke&&<button onClick={()=>{onOpenPsicke();toast.info('Pídele a Psicke un resumen de tu semana');}} style={{padding:'10px 24px',borderRadius:10,border:`1px solid ${T.purple}`,background:`${T.purple}18`,color:T.purple,cursor:'pointer',fontSize:13,fontWeight:700,fontFamily:'inherit'}}>🧠 Abrir Psicke</button>}
                  <button onClick={()=>toast.success('Revisión completada','¡Buen trabajo esta semana!')} style={{padding:'10px 24px',borderRadius:10,border:'none',background:T.accent,color:'#000',cursor:'pointer',fontSize:13,fontWeight:700,fontFamily:'inherit'}}>✅ Completar revisión</button>
                </div>
              </div>
            )}
          </Card>
        </>
      )}

      {/* ── NOTIFICACIONES ── */}
      {sTab==='notifs'&&(
        <>
          <Card style={{marginBottom:14}}>
            <div style={{color:T.text,fontWeight:600,fontSize:14,marginBottom:6}}>Notificaciones del navegador</div>
            <div style={{color:T.muted,fontSize:12,marginBottom:14,lineHeight:1.6}}>Recibe recordatorios aunque la app esté cerrada o en segundo plano.</div>
            {!notifEnabled
              ?<button onClick={requestNotifs} style={{width:'100%',padding:'11px',borderRadius:10,border:`1px solid ${T.accent}`,background:`${T.accent}15`,color:T.accent,cursor:'pointer',fontSize:14,fontWeight:700,fontFamily:'inherit'}}>
                 🔔 Activar notificaciones
               </button>
              :<div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',background:`${T.green}12`,border:`1px solid ${T.green}30`,borderRadius:10}}>
                 <span style={{fontSize:18}}>✅</span>
                 <div>
                   <div style={{fontSize:13,fontWeight:600,color:T.green}}>Notificaciones activas</div>
                   <div style={{fontSize:11,color:T.muted}}>Tu navegador enviará recordatorios</div>
                 </div>
               </div>
            }
          </Card>
          {notifEnabled&&(
            <Card>
              {NOTIF_OPTIONS.map((opt,i)=>(
                <div key={opt.key} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 0',borderBottom:i<NOTIF_OPTIONS.length-1?`1px solid ${T.border}`:'none'}}>
                  <div>
                    <div style={{fontSize:13,color:T.text,fontWeight:500}}>{opt.label}</div>
                    <div style={{fontSize:11,color:T.dim,marginTop:2}}>{opt.time}</div>
                  </div>
                  <button onClick={()=>toggleNotif(opt.key)} style={{width:40,height:22,borderRadius:11,background:notifSettings[opt.key]!==false?T.accent:T.border,border:'none',cursor:'pointer',position:'relative',transition:'background 0.2s',flexShrink:0}}>
                    <div style={{position:'absolute',top:3,left:notifSettings[opt.key]!==false?20:3,width:16,height:16,borderRadius:'50%',background:'#fff',transition:'left 0.2s'}}/>
                  </button>
                </div>
              ))}
            </Card>
          )}
        </>
      )}
    </div>
  );
};


// ===================== PSICKE — FLOATING BRAIN =====================
const buildPsickePrompt=(data)=>{
  const t=today();
  const notesSummary=(data.notes||[]).slice(0,8).map(n=>{
    let s=`• ${n.title.slice(0,40)}`;
    if(n.amount)s+=` $${n.amount}`;
    if(n.tags?.length)s+=` [${n.tags.slice(0,2).join(',')}]`;
    return s;
  }).join('\n');
  const tasksPending=(data.tasks||[]).filter(t=>t.status==='todo');
  const tasksSummary=tasksPending.slice(0,6).map(t=>`• ${t.title.slice(0,40)}${t.deadline?' ('+t.deadline+')':''}`).join('\n');
  const inboxPending=(data.inbox||[]).filter(i=>!i.processed);
  const habitNames=(data.habits||[]).map(h=>h.name).join(', ');
  const areaNames=(data.areas||[]).map(a=>`${a.icon} ${a.name}`).join(', ');
  const areaMap=(data.areas||[]).map(a=>`"${a.name}" → "${a.id}"`).join(', ');
  const objectives=(data.objectives||[]).filter(o=>o.status==='active').map(o=>`• ${o.title}`).join('\n');
  const allTags=[...new Set((data.notes||[]).flatMap(n=>n.tags||[]))].slice(0,15);
  const tagList=allTags.length?allTags.join(', '):'(sin tags aún)';

  // ── Finanzas ──
  const recentTx=(data.transactions||[]).slice(0,6).map(tx=>`• ${tx.type==='ingreso'?'↑':'↓'} $${tx.amount} ${tx.currency||'MXN'} — ${tx.category||''} ${tx.description||''}`).join('\n');
  const budgetSummary=(data.budget||[]).map(b=>`• ${b.title}: $${b.amount} ${b.currency||'MXN'}/mes día ${b.dayOfMonth}`).join('\n');

  // ── Salud ──
  const recentMetrics=(data.healthMetrics||[]).slice(0,5).map(m=>`• ${m.type}: ${m.value} ${m.unit||''} (${m.date})`).join('\n');
  const medications=(data.medications||[]).map(m=>`• ${m.name} ${m.dose||''} ${m.unit||''} — ${m.frequency||''}`).join('\n');
  const recentWorkouts=(data.workouts||[]).slice(0,4).map(w=>`• ${w.type} ${w.duration||''}min ${w.date}`).join('\n');
  const hg=data.healthGoals||{};
  const healthGoalsSummary=Object.entries(hg).map(([k,v])=>`${k}: ${v}`).join(', ');

  // ── Hogar ──
  const maintenances=(data.maintenances||[]).slice(0,5).map(m=>`• ${m.name} — cada ${m.frequencyDays}d, último: ${m.lastDone||'nunca'}`).join('\n');
  const homeDocs=(data.homeDocs||[]).slice(0,4).map(d=>`• ${d.name} vence: ${d.expiryDate||'—'}`).join('\n');

  // ── Desarrollo Personal ──
  const learnings=(data.learnings||[]).filter(l=>l.status==='active').map(l=>`• ${l.name} ${l.progress||0}% — ${l.platform||''}`).join('\n');
  const recentRetros=(data.retros||[]).slice(0,2).map(r=>`• Retro ${r.period} (${r.date})`).join('\n');
  const recentIdeas=(data.ideas||[]).slice(0,4).map(i=>`• [${i.tag||'Idea'}] ${i.content.slice(0,50)}`).join('\n');
  const booksSummary=(data.books||[]).filter(b=>b.status==='reading').map(b=>`• ${b.title}`).join('\n');

  // ── Relaciones ──
  const peopleSummary=(data.people||[]).map(p=>`• ${p.emoji||'👤'} ${p.name} (${p.relation||''})`).join('\n');
  const pendingFollowUps=(data.followUps||[]).filter(f=>!f.done).slice(0,5).map(f=>{
    const person=(data.people||[]).find(p=>p.id===f.personId);
    return `• ${f.task} → ${person?.name||'?'} ${f.dueDate?'('+f.dueDate+')':''}`;
  }).join('\n');

  // ── Side Projects ──
  const activeProjects=(data.sideProjects||[]).filter(p=>p.status==='progress').map(p=>`• ${p.name} — ${p.stack||''}`).join('\n');
  const spTasksPending=(data.spTasks||[]).filter(t=>!t.done).slice(0,5).map(t=>{
    const proj=(data.sideProjects||[]).find(p=>p.id===t.projectId);
    return `• ${t.title} [${proj?.name||'?'}]`;
  }).join('\n');

  // ── Coche ──
  const _carInfo=data.carInfo||{};
  const carInfoStr=_carInfo.brand?`${_carInfo.brand} ${_carInfo.model||''} ${_carInfo.year||''} · ${_carInfo.plate||''} · ${_carInfo.km||'?'} km`:'Sin datos del coche';
  const carMaintStr=(data.carMaintenances||[]).slice(0,5).map(m=>`• ${m.name} — último: ${m.lastDone||'nunca'}, cada ${m.frequencyDays||'?'}d / ${m.frequencyKm||'?'} km, costo: $${m.cost||0}`).join('\n');
  const carExpStr=(data.carExpenses||[]).slice(0,4).map(e=>`• ${e.concept}: $${e.amount} (${e.date||''})`).join('\n');
  const farmaciaStr=(data.farmaciaItems||[]).map(f=>`• ${f.name}: ${f.quantity} ${f.unit}${f.expiresAt?' vence '+f.expiresAt:''}`).join('\n');

  return `Eres Psicke — la IA que vive dentro del Segundo Cerebro del usuario. No eres un chatbot genérico; eres SU extensión mental.

HOY: ${t}

╔══════════════════════════════════════════════════════╗
║      FORMATO DE RESPUESTA — REGLA ABSOLUTA #1       ║
║                                                      ║
║  CADA respuesta DEBE tener esta estructura exacta:  ║
║                                                      ║
║  <pensamiento>                                       ║
║  [razonamiento interno: pasos I-IV completos]        ║
║  </pensamiento>                                      ║
║  [respuesta visible al usuario, máx 2-3 oraciones]  ║
║  [bloques JSON al final, UNO POR ACCIÓN]             ║
║                                                      ║
║  MULTI-ACCIÓN: Si la captura requiere guardar en     ║
║  más de un módulo, emite VARIOS bloques \`\`\`json\`\`\`   ║
║  consecutivos, uno por cada acción. El sistema los   ║
║  ejecuta TODOS. Ej: mantenimiento coche + gasto +    ║
║  actualizar km = 3 bloques JSON separados.           ║
║                                                      ║
║  JAMÁS escribas razonamiento fuera de <pensamiento>  ║
║  El usuario SOLO ve lo que va DESPUÉS de </pensam>   ║
╚══════════════════════════════════════════════════════╝

═══ TU PERSONALIDAD ═══
- Directa y sin relleno. Vas al punto.
- Empática cuando el momento lo amerita.
- Humor seco, subtle. No forzado.
- Hablas principalmente en español. Puedes usar anglicismos naturales.
- SIEMPRE tratas de USTED. Nunca tutees.
- NUNCA digas "como asistente de IA". Eres Psicke, punto.

═══ DATOS ACTUALES DEL USUARIO ═══
Áreas: ${areaNames||'Ninguna'}
Mapa de áreas: ${areaMap||'sin áreas'}

OBJETIVOS ACTIVOS:
${objectives||'(sin objetivos)'}

TAREAS PENDIENTES (${tasksPending.length}):
${tasksSummary||'(sin tareas)'}

NOTAS RECIENTES:
${notesSummary||'(sin notas)'}
Tags existentes: ${tagList}
Inbox sin procesar: ${inboxPending.length}
Hábitos: ${habitNames||'(sin hábitos)'}

── FINANZAS ──
Últimas transacciones:
${recentTx||'(sin transacciones)'}
Presupuesto fijo:
${budgetSummary||'(sin presupuesto)'}

── SALUD ──
Métricas recientes:
${recentMetrics||'(sin métricas)'}
Metas de salud: ${healthGoalsSummary||'(por defecto)'}
Medicamentos:
${medications||'(sin medicamentos)'}
Actividad reciente:
${recentWorkouts||'(sin entrenamientos)'}

── HOGAR ──
Mantenimientos:
${maintenances||'(sin mantenimientos)'}
Documentos:
${homeDocs||'(sin documentos)'}

── COCHE ──
Datos: ${carInfoStr}
Mantenimientos coche:
${carMaintStr||'(sin mantenimientos)'}
Gastos coche recientes:
${carExpStr||'(sin gastos)'}

── FARMACIA / BOTIQUÍN ──
${farmaciaStr||'(botiquín vacío)'}
── DESARROLLO PERSONAL ──
Aprendizajes activos:
${learnings||'(sin aprendizajes)'}
Libros leyendo:
${booksSummary||'(ninguno)'}
Retrospectivas recientes:
${recentRetros||'(sin retros)'}
Ideas recientes:
${recentIdeas||'(sin ideas)'}

── RELACIONES ──
Personas:
${peopleSummary||'(sin personas)'}
Seguimientos pendientes:
${pendingFollowUps||'(sin seguimientos)'}

── SIDE PROJECTS ──
En progreso:
${activeProjects||'(sin proyectos activos)'}
Tareas pendientes:
${spTasksPending||'(sin tareas de proyectos)'}

╔═══════════════════════════════════════════════════╗
║   PROTOCOLO DE RAZONAMIENTO INTERNO OBLIGATORIO   ║
╚═══════════════════════════════════════════════════╝

PASO I — TIPO DE ENTRADA
  A) CONSULTA → Ir a PASO V
  B) CAPTURA → Continuar a PASO II

PASO II — ÁREA
¿A qué área pertenece? Áreas: ${areaNames||'ninguna'}

PASO III — MÓDULO ESPECÍFICO
Identifica el módulo exacto donde guardar:

  GENERAL:
  1. Meta de vida medible → OBJETIVO → PASO IV-PLAN
  2. Conjunto de acciones con inicio/fin → PROYECTO → PASO IV-PLAN
  3. Acción única concreta → SAVE_TASK
  4. Acción recurrente → SAVE_HABIT
     (name, frequency: "daily"|"weekly"|"monthly")
  5. Gasto fijo mensual → SAVE_BUDGET
  6. Info, dato, referencia → SAVE_NOTE
  7. Ambiguo → SAVE_INBOX

  FINANZAS:
  8. Gasto/ingreso único → SAVE_TRANSACTION
     (type: "egreso"|"ingreso", amount, currency, category, description, date)
     Categorías egreso: Alimentación, Transporte, Salud, Educación, Entretenimiento, Hogar, Ropa, Servicios, Deuda, Otro
     Categorías ingreso: Salario, Freelance, Negocio, Inversión, Regalo, Otro

  SALUD:
  9. Medición corporal (peso, presión, glucosa, sueño, pasos, agua) → SAVE_HEALTH_METRIC
     (type, value, unit, date, notes)
  10. Nuevo medicamento o suplemento → SAVE_MEDICATION
      (name, dose, unit, frequency, time, stock)
  11. Ejercicio o actividad física → SAVE_WORKOUT
      (type, duration, calories, distance, date, notes)
      Tipos: Correr, Caminar, Ciclismo, Natación, Gym, Yoga, HIIT, Fútbol, Basquetbol, Otro

  HOGAR:
  12. Tarea de mantenimiento recurrente (hogar) → SAVE_MAINTENANCE
      (name, category, frequencyDays, lastDone, cost, notes)
      Categorías: General, Jardín, Plomería, Electricidad, Climatización, Electrodomésticos, Otro
  13. Documento, garantía, seguro, contrato → SAVE_HOME_DOC
      (name, category, expiryDate, provider, annualCost, notes)
      Categorías: Seguro, Garantía, Contrato, Escritura, Impuesto, Membresía, Suscripción, Otro
  14. Contacto de servicio (plomero, médico, etc.) → SAVE_HOME_CONTACT
      (name, role, phone, email, notes)
      Roles: Plomero, Electricista, Médico, Dentista, Veterinario, Mecánico, Abogado, Contador, Jardinero, Limpieza, Cerrajero, Otro
  14d. Medicamento en botiquín casero → SAVE_FARMACIA_ITEM
      (name, quantity, unit, expiresAt, location, notes)
      Unidades: unidades, tabletas, cápsulas, ml, mg, frascos, sobres, parches, gotas

  COCHE:
  14b. Mantenimiento del coche → SAVE_CAR_MAINTENANCE
      (name, category, lastDone, frequencyKm, frequencyDays, cost, notes)
      Categorías: Aceite, Filtros, Frenos, Neumáticos, Batería, Correa distribución, Bujías, Revisión general, Otro
      ⚠️ REGLA OBLIGATORIA: Si el mantenimiento tiene costo (cost > 0), SIEMPRE emitir TAMBIÉN un SAVE_TRANSACTION con type:"egreso", category:"Transporte", description igual al nombre del mantenimiento.
  14c. Actualizar datos/km del coche → SAVE_CAR_INFO
      Campos opcionales: brand, model, year, plate, km, fuelType
      ⚠️ REGLA: Cuando el usuario mencione el km actual del coche (ej: "a sus 73,000 km"), siempre emitir SAVE_CAR_INFO con ese km.

  DESARROLLO PERSONAL:
  15. Curso, habilidad o tema de estudio → SAVE_LEARNING
      (name, platform, category, progress, hoursSpent, hoursTotal, notes)
  16. Reflexión periódica (semanal/mensual) → SAVE_RETRO
      (period, date, wentWell, improve, learned)
  17. Idea, insight, cita, aprendizaje suelto → SAVE_IDEA
      (content, tag, date)
      Tags: Insight, Cita, Aprendizaje, Pregunta, Idea, Reflexión, Otro

  RELACIONES:
  18. Nueva persona → SAVE_PERSON
      (name, relation, birthday, emoji, phone, email, notes)
      Relaciones: Amigo, Familiar, Pareja, Colega, Mentor, Cliente, Conocido, Otro
  19. Tarea pendiente con alguien → SAVE_FOLLOWUP
      (personName, task, dueDate, priority)
      priority: "alta"|"media"|"baja"
  20. Registro de contacto/interacción → SAVE_INTERACTION
      (personName, type, date, notes)
      Tipos: Mensaje, Llamada, Videollamada, Comida, Café, Evento, Email, Visita, Otro

  SIDE PROJECTS:
  21. Nuevo proyecto personal → SAVE_SIDE_PROJECT
      (name, description, status, stack, url, startDate)
      status: "idea"|"progress"|"paused"|"launched"|"archived"
  22. Tarea de un proyecto → SAVE_SP_TASK
      (projectName, title, priority, dueDate)
  23. Logro o hito de un proyecto → SAVE_MILESTONE
      (projectName, title, date, notes)

═══════════════════════════════════════════════════════
REGLAS OBLIGATORIAS MULTI-MÓDULO — MEMORIZA ESTO
═══════════════════════════════════════════════════════
Estas situaciones SIEMPRE tocan más de un módulo. Nunca guardes solo uno:

COCHE:
• Mantenimiento con costo → SAVE_CAR_MAINTENANCE + SAVE_TRANSACTION(egreso, Transporte) + SAVE_CAR_INFO(km si se menciona)
• Gasto del coche (combustible, multa, parking) → SAVE_CAR_EXPENSE + SAVE_TRANSACTION(egreso, Transporte)
• Se mencionan km actuales → siempre SAVE_CAR_INFO con ese km

SALUD:
• Ejercicio → SAVE_WORKOUT (+ SAVE_HEALTH_METRIC si menciona peso/calorías)
• Compra de medicamento → SAVE_TRANSACTION(egreso, Salud) + si es para botiquín → SAVE_FARMACIA_ITEM
• Nuevo medicamento que toma → SAVE_MEDICATION + SAVE_FARMACIA_ITEM si tiene stock

RELACIONES:
• Conocer a alguien nuevo → SAVE_PERSON + SAVE_INTERACTION
• Reunión/llamada con alguien → SAVE_INTERACTION (+ SAVE_FOLLOWUP si quedaron en algo)

FINANZAS:
• Suscripción nueva → SAVE_BUDGET + SAVE_HOME_DOC si hay contrato
• Pago de servicio del hogar → SAVE_TRANSACTION + SAVE_MAINTENANCE si es mantenimiento

PROYECTOS:
• Nuevo proyecto personal → SAVE_SIDE_PROJECT + SAVE_TASK (primera acción)
• Logro en proyecto → SAVE_MILESTONE + actualizar SAVE_SP_TASK si era tarea pendiente

═══════════════════════════════════════════════════════

PASO IV-PLAN — Para OBJETIVO o PROYECTO grande
  A) ¿Tengo info suficiente? (meta concreta, plazo, cómo)
     SÍ → ETAPA C | NO → ETAPA B (1-2 preguntas)
  C) Confirmar plan con usuario. NO generar JSON todavía.
  D) Con confirmación → generar SAVE_PLAN

PASO IV-SIMPLE — Para todo lo demás
  ¿Tengo todos los datos? SÍ → JSON. NO → 1 pregunta puntual.
  - Montos: incluir amount + currency SIEMPRE
  - Fechas: usar formato YYYY-MM-DD
  - Para FOLLOWUP e INTERACTION: usar el nombre de la persona (no el id)

PASO V — RESPONDER
  </pensamiento>
  [respuesta conversacional, máx 2-3 oraciones]
  [JSON al final si aplica]

╔═══════════════════════════════════════════════════╗
║              FORMATOS DE GUARDADO                 ║
╚═══════════════════════════════════════════════════╝

Mantenimiento coche: \`\`\`json
{"action":"SAVE_CAR_MAINTENANCE","data":{"name":"Mantenimiento mayor","category":"Revisión general","lastDone":"2026-03-03","frequencyKm":"10000","frequencyDays":"180","cost":3400,"notes":"73,000 km"}}
\`\`\`

Actualizar km coche: \`\`\`json
{"action":"SAVE_CAR_INFO","data":{"km":"73000"}}
\`\`\`

Medicamento botiquín: \`\`\`json
{"action":"SAVE_FARMACIA_ITEM","data":{"name":"Ibuprofeno 400mg","quantity":20,"unit":"tabletas","expiresAt":"2027-06-01","location":"cajón baño","notes":""}}
\`\`\`

Transacción: \`\`\`json
{"action":"SAVE_TRANSACTION","data":{"type":"egreso","amount":30,"currency":"MXN","category":"Alimentación","description":"Sabritas","date":"${t}"}}
\`\`\`

Métrica salud: \`\`\`json
{"action":"SAVE_HEALTH_METRIC","data":{"type":"peso","value":"75.5","unit":"kg","date":"${t}","notes":""}}
\`\`\`

Workout: \`\`\`json
{"action":"SAVE_WORKOUT","data":{"type":"Correr","duration":30,"calories":280,"distance":4.5,"date":"${t}","notes":"En el parque"}}
\`\`\`

Medicamento: \`\`\`json
{"action":"SAVE_MEDICATION","data":{"name":"Vitamina D","dose":"1000","unit":"UI","frequency":"daily","time":"08:00","stock":30}}
\`\`\`

Mantenimiento hogar: \`\`\`json
{"action":"SAVE_MAINTENANCE","data":{"name":"Cambio de filtro agua","category":"General","frequencyDays":90,"lastDone":"${t}","cost":800,"notes":""}}
\`\`\`

Mantenimiento coche (SIEMPRE emitir los 3 bloques si hay costo y km): \`\`\`json
{"action":"SAVE_CAR_MAINTENANCE","data":{"name":"Mantenimiento mayor","category":"Revisión general","lastDone":"2026-03-03","frequencyDays":180,"frequencyKm":10000,"cost":3400,"notes":"A los 73,000 km"}}
\`\`\`
\`\`\`json
{"action":"SAVE_TRANSACTION","data":{"type":"egreso","amount":3400,"currency":"MXN","category":"Transporte","description":"Mantenimiento mayor coche","date":"2026-03-03"}}
\`\`\`
\`\`\`json
{"action":"SAVE_CAR_INFO","data":{"km":"73000"}}
\`\`\`

Actualizar datos del coche: \`\`\`json
{"action":"SAVE_CAR_INFO","data":{"brand":"Toyota","model":"Corolla","year":"2020","plate":"ABC1234","km":"73000","fuelType":"gasolina"}}
\`\`\`

Documento hogar: \`\`\`json
{"action":"SAVE_HOME_DOC","data":{"name":"Seguro del coche","category":"Seguro","expiryDate":"2026-12-01","provider":"GNP","annualCost":6500,"notes":""}}
\`\`\`

Contacto hogar: \`\`\`json
{"action":"SAVE_HOME_CONTACT","data":{"name":"Carlos Flores","role":"Plomero","phone":"5512345678","email":"","notes":"Trabaja fines de semana"}}
\`\`\`

Aprendizaje: \`\`\`json
{"action":"SAVE_LEARNING","data":{"name":"React avanzado","platform":"Udemy","category":"Programación","progress":30,"hoursSpent":8,"hoursTotal":40,"notes":""}}
\`\`\`

Retro: \`\`\`json
{"action":"SAVE_RETRO","data":{"period":"semanal","date":"${t}","wentWell":"Terminé el módulo 3","improve":"Procrastinar menos","learned":"Los hooks son más simples de lo que pensaba"}}
\`\`\`

Idea: \`\`\`json
{"action":"SAVE_IDEA","data":{"content":"El foco no es la motivación, es el sistema","tag":"Cita","date":"${t}"}}
\`\`\`

Persona: \`\`\`json
{"action":"SAVE_PERSON","data":{"name":"María López","relation":"Mentor","birthday":"1985-03-15","emoji":"👩","phone":"5598765432","email":"maria@mail.com","notes":"Experta en finanzas"}}
\`\`\`

Seguimiento: \`\`\`json
{"action":"SAVE_FOLLOWUP","data":{"personName":"María López","task":"Enviarle el reporte de avance","dueDate":"${t}","priority":"alta"}}
\`\`\`

Interacción: \`\`\`json
{"action":"SAVE_INTERACTION","data":{"personName":"María López","type":"Llamada","date":"${t}","notes":"Hablamos de la propuesta de inversión"}}
\`\`\`

Side project: \`\`\`json
{"action":"SAVE_SIDE_PROJECT","data":{"name":"App de hábitos","description":"Tracker minimalista para hábitos diarios","status":"progress","stack":"React Native","url":"","startDate":"${t}"}}
\`\`\`

Tarea de proyecto: \`\`\`json
{"action":"SAVE_SP_TASK","data":{"projectName":"App de hábitos","title":"Diseñar pantalla principal","priority":"alta","dueDate":""}}
\`\`\`

Hito: \`\`\`json
{"action":"SAVE_MILESTONE","data":{"projectName":"App de hábitos","title":"MVP funcional listo","date":"${t}","notes":"Primera versión con las 3 pantallas principales"}}
\`\`\`

Tarea general: \`\`\`json
{"action":"SAVE_TASK","data":{"title":"Llamar al mecánico","priority":"alta"}}
\`\`\`

Hábito: \`\`\`json
{"action":"SAVE_HABIT","data":{"name":"Caminar 30 min","frequency":"daily"}}
\`\`\`

Presupuesto fijo: \`\`\`json
{"action":"SAVE_BUDGET","data":{"title":"Netflix","amount":199,"currency":"MXN","dayOfMonth":15}}
\`\`\`

Nota: \`\`\`json
{"action":"SAVE_NOTE","data":{"title":"Reunión con cliente — puntos clave","content":"El cliente quiere entrega antes del viernes","tags":["clientes","trabajo"],"area":"Trabajo"}}
\`\`\`

Plan completo (solo tras confirmación): \`\`\`json
{"action":"SAVE_PLAN","data":{
  "area":"Salud",
  "objective":{"title":"Bajar 5kg","deadline":"2026-06-01"},
  "project":{"title":"Plan fitness"},
  "tasks":[{"title":"Inscribirme al gym","priority":"alta"}],
  "habits":[{"name":"Ejercicio 30 min","frequency":"daily"}]
}}
\`\`\`

═══ CONSULTAS SOBRE DATOS ═══
Si el usuario pregunta por gastos, salud, hábitos, proyectos, personas, etc:
- Responder con números concretos de los datos actuales.
- Sumar montos cuando sea relevante.
- Comparar períodos si hay historial.
- Agrupar por categoría/área cuando ayude.

⚠️ REGLA ABSOLUTA FINAL — LEE ESTO ANTES DE CADA RESPUESTA:
Si el usuario menciona algo que debe guardarse en la app (un gasto, tarea, hábito, mantenimiento, persona, workout, etc.), DEBES incluir el bloque \`\`\`json con la acción correspondiente.
NO basta con decir "lo guardé" o "registrado". Si no hay bloque JSON en tu respuesta, la acción NO se ejecuta en el sistema y el dato se pierde.
Decirle al usuario que guardaste algo sin haber emitido el JSON es mentirle. Nunca lo hagas.
Ante la duda, emite el JSON. Es mejor emitir uno de más que olvidar uno.`;
};

const parsePsickeAction=(text)=>{
  // Multi-action: collect ALL ```json blocks
  const blocks=[...text.matchAll(/```json\s*([\s\S]*?)\s*```/g)];
  const actions=[];
  for(const b of blocks){
    try{const p=JSON.parse(b[1]);if(p.action&&p.data)actions.push(p);}catch(e){}
  }
  if(actions.length>0) return actions;
  // Fallback: find raw JSON objects with "action" key
  const raw=[...text.matchAll(/(\{[\s\S]*?"action"\s*:\s*"[A-Z_]+"[\s\S]*?"data"\s*:[\s\S]*?\})/g)];
  for(const r of raw){
    try{const p=JSON.parse(r[1]);if(p.action&&p.data)actions.push(p);}catch(e){}
  }
  return actions.length>0?actions:null;
};
const stripPsickeJson=(text)=>{
  // 1. Strip <pensamiento> blocks (ideal case when Gemini follows instructions)
  let out=text.replace(/<pensamiento>[\s\S]*?<\/pensamiento>/gi,'');

  // 2. Fallback: Gemini sometimes writes reasoning as plain text using PASO/ETAPA labels.
  //    Detect the pattern and keep only what comes after the last reasoning label block.
  //    Strategy: find the last occurrence of a reasoning marker line, discard everything before it.
  const reasoningMarkers=[
    /^PASO\s+[IVX\d]+\s*[—\-]/m,
    /^ETAPA\s+[A-D]\s*[—\-]/m,
    /^TIPO DE ENTRADA:/m,
    /^NIVEL JERÁRQUICO:/m,
    /^ÁRBOL DE DECISIÓN:/m,
  ];
  // Find the last line that looks like a reasoning header
  const lines=out.split('\n');
  let lastReasoningLine=-1;
  lines.forEach((line,i)=>{
    if(reasoningMarkers.some(r=>r.test(line))) lastReasoningLine=i;
  });
  if(lastReasoningLine>=0){
    // Find the next non-empty line after the block that doesn't start with a reasoning pattern
    let cutAt=-1;
    for(let i=lastReasoningLine+1;i<lines.length;i++){
      const l=lines[i].trim();
      if(!l) continue;
      // If this line itself looks like reasoning, skip it and its content
      if(reasoningMarkers.some(r=>r.test(l))) continue;
      // Check it's not a sub-item of reasoning (starts with arrow, dash+space reasoning keyword)
      if(/^[→\-]\s*(PASO|ETAPA|Nivel:|Acción:|SÍ|NO\s)/.test(l)) continue;
      cutAt=i;
      break;
    }
    if(cutAt>=0) out=lines.slice(cutAt).join('\n');
  }

  // 3. Strip JSON blocks
  out=out.replace(/```json[\s\S]*?```/g,'');

  return out.trim();
};

const Psicke=({apiKey,onGoSettings,data,setData,openFromNav,onNavClose})=>{
  const INIT_MSG={role:'assistant',content:'Aquí Psicke. ¿En qué está pensando?'};
  const [open,setOpen]=useState(false);
  useEffect(()=>{if(openFromNav)setOpen(true);},[openFromNav]);
  const closePanel=()=>{setOpen(false);onNavClose&&onNavClose();};
  const [showSugg,setShowSugg]=useState(true);
  const [msgs,setMsgs]=useState([INIT_MSG]);
  const [input,setInput]=useState('');
  const [loading,setLoading]=useState(false);
  const [recording,setRecording]=useState(false);
  const [pulse,setPulse]=useState(false);
  const [msgMenu,setMsgMenu]=useState(null); // index of msg showing actions
  const [editingIdx,setEditingIdx]=useState(null);
  const [editVal,setEditVal]=useState('');
  const [copied,setCopied]=useState(null);
  const [slashMenu,setSlashMenu]=useState(false);
  const bottomRef=useRef(null);
  const recRef=useRef(null);
  const inputRef=useRef(null);

  // Persist and restore conversation
  useEffect(()=>{
    try {
      const local = localStorage.getItem('psicke_msgs');
      if(local){ const saved=JSON.parse(local); if(saved?.length) setMsgs(saved); return; }
    } catch(e) {}
    (async()=>{
      try {
        const r=await window.storage?.get('psicke_msgs');
        if(r?.value){ const saved=JSON.parse(r.value); if(saved?.length) setMsgs(saved); }
      } catch(e) {}
    })();
  },[]);
  const saveMsgs=(m)=>{
    setMsgs(m);
    try { localStorage.setItem('psicke_msgs', JSON.stringify(m)); } catch(e) {}
    try { window.storage?.set('psicke_msgs', JSON.stringify(m)); } catch(e) {}
  };
  const clearMsgs=()=>{saveMsgs([INIT_MSG]);};

  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:'smooth'});},[msgs,open]);
  useEffect(()=>{if(open)setTimeout(()=>inputRef.current?.focus(),300);},[open]);

  // ── Daily auto-summary — fires once per day when panel opens ──
  useEffect(()=>{
    if(!open||!apiKey) return;
    const key='psicke_daily_summary';
    const lastDate=localStorage.getItem(key);
    if(lastDate===today()) return;
    // Wait a beat so the panel animation finishes
    const timer=setTimeout(()=>{
      localStorage.setItem(key,today());
      send('Hazme un resumen breve de mi día: tareas pendientes, hábitos sin completar, finanzas del mes y objetivos activos. Máximo 4 puntos clave.');
    },900);
    return()=>clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[open]);

  // Subtle pulse every 8s to remind user Psicke exists
  useEffect(()=>{
    if(open)return;
    const t=setInterval(()=>{setPulse(true);setTimeout(()=>setPulse(false),1200);},8000);
    return()=>clearInterval(t);
  },[open]);


  // ── Proactive suggestions ──
  const buildSuggestions=()=>{
    const s=[];
    const urgentTasks=(data.tasks||[]).filter(t=>t.status!=='done'&&t.dueDate&&t.dueDate<=today()).length;
    if(urgentTasks>0) s.push({icon:'⚠️',text:`Tienes ${urgentTasks} tarea${urgentTasks>1?'s':''} vencida${urgentTasks>1?'s':''}. ¿Las revisamos?`,color:'#ff5069',q:`Tengo ${urgentTasks} tareas vencidas`});
    const activeObjs=(data.objectives||[]).filter(o=>o.status==='active');
    if(activeObjs.length>0){const o=activeObjs[0];s.push({icon:'🎯',text:`"${o.title.slice(0,40)}" — ¿cómo va ese objetivo?`,color:'#4da6ff',q:`¿Cómo voy con el objetivo: ${o.title}?`});}
    const todayHabits=(data.habits||[]).filter(h=>!h.completions?.includes(today()));
    if(todayHabits.length>0) s.push({icon:'🔥',text:`${todayHabits.length} hábito${todayHabits.length>1?'s':''} sin completar hoy.`,color:'#ff8c42',q:'¿Cuáles son mis hábitos de hoy?'});
    const bdays=(data.people||[]).filter(p=>{if(!p.birthday)return false;const[,m,d]=p.birthday.split('-');const next=new Date(new Date().getFullYear(),Number(m)-1,Number(d));if(next<new Date())next.setFullYear(new Date().getFullYear()+1);return Math.ceil((next-new Date())/86400000)<=7;});
    if(bdays.length>0) s.push({icon:'🎂',text:`${bdays[0].name} cumple años pronto. ¿Quieres anotarlo?`,color:'#a78bfa',q:`Recuérdame que ${bdays[0].name} cumple años pronto`});
    if(s.length===0) s.push({icon:'💡',text:'¿Qué tienes en mente hoy?',color:'#00c896',q:'Hazme un resumen del día'});
    return s.slice(0,4);
  };
  const suggestions=buildSuggestions();

  // ── Slash commands ──
  const SLASH_CMDS=[
    {cmd:'/nota',    icon:'📝', label:'Nueva nota',        tpl:'Guarda una nota: '},
    {cmd:'/tarea',   icon:'✅', label:'Nueva tarea',       tpl:'Crea una tarea: '},
    {cmd:'/gasto',   icon:'💸', label:'Registrar gasto',   tpl:'Registra un gasto de $'},
    {cmd:'/hábito',  icon:'🔁', label:'Nuevo hábito',      tpl:'Crea el hábito: '},
    {cmd:'/objetivo',icon:'🎯', label:'Nuevo objetivo',    tpl:'Agrega el objetivo: '},
    {cmd:'/resumen', icon:'📊', label:'Resumen del día',   tpl:'Hazme un resumen de hoy'},
  ];
  const filteredCmds=input.startsWith('/')
    ? SLASH_CMDS.filter(c=>c.cmd.startsWith(input.split(' ')[0]))
    : SLASH_CMDS;
  const handleInput=(val)=>{
    setInput(val);
    setSlashMenu(val.startsWith('/'));
  };
  const applySlashCmd=(cmd)=>{
    setInput(cmd.tpl);
    setSlashMenu(false);
    setTimeout(()=>inputRef.current?.focus(),50);
  };

  const send=async(textOverride=null)=>{
    const text=(textOverride??input).trim();
    if(!text||loading)return;
    setShowSugg(false);
    const key=(apiKey||'').trim().replace(/\s+/g,'');
    if(!key){setOpen(false);onGoSettings();return;}
    const userMsg={role:'user',content:text};
    const next=[...msgs,userMsg];
    saveMsgs(next);setInput('');setLoading(true);
    try{
      const sysPrompt=buildPsickePrompt(data);
      // Clean conversation for API: strip save labels, keep last 8 msgs
      const cleanMsgs=next.slice(-8).map(m=>({
        role:m.role==='assistant'?'model':'user',
        parts:[{text:(m.content||'').replace(/\n\n✅[^\n]*/g,'').trim()||' '}]
      }));
      const body={
        system_instruction:{role:'system',parts:[{text:sysPrompt}]},
        contents:[
          {role:'user',parts:[{text:'Hola Psicke, estoy listo.'}]},
          {role:'model',parts:[{text:'Aquí Psicke. ¿En qué está pensando?'}]},
          ...cleanMsgs
        ],
        generationConfig:{temperature:0.7,maxOutputTokens:3000},
      };

      // API call with one retry on 429
      const callApi=async(attempt=0)=>{
        const res=await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`,
          {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}
        );
        if(res.status===429&&attempt===0){
          await new Promise(r=>setTimeout(r,3000));
          return callApi(1);
        }
        if(!res.ok){
          const err=await res.json().catch(()=>({}));
          const emsg=err?.error?.message||`HTTP ${res.status}`;
          if(res.status===429||emsg.toLowerCase().includes('quota'))
            throw new Error('Cuota agotada. Espere unos segundos e intente de nuevo.');
          throw new Error(emsg);
        }
        return res.json();
      };

      const d=await callApi();
      const candidate=d.candidates?.[0];
      if(!candidate?.content?.parts?.[0]?.text){
        const reason=candidate?.finishReason||d.promptFeedback?.blockReason||'desconocido';
        const safetyRatings=candidate?.safetyRatings?.filter(r=>r.probability!=='NEGLIGIBLE').map(r=>`${r.category}:${r.probability}`).join(', ')||'';
        if(reason==='SAFETY')throw new Error('Respuesta bloqueada por filtros de seguridad. Intente reformular.');
        if(reason==='MAX_TOKENS')throw new Error('Respuesta cortada por límite de tokens. Intente un mensaje más corto.');
        throw new Error(`Sin respuesta (${reason}${safetyRatings?' · '+safetyRatings:''})`);
      }
      const raw=candidate.content.parts[0].text;

      // Parse and execute ALL save actions present
      const actions=parsePsickeAction(raw);
      const display=stripPsickeJson(raw);
      const savedLabels=[];

      if(actions&&setData){
        const td=today();
        // ── Helper: resolve personId by name ──
        const resolvePersonId=(name)=>{
          if(!name) return '';
          const p=(data.people||[]).find(p=>p.name.toLowerCase()===name.toLowerCase());
          return p?.id||'';
        };

        // Run all actions sequentially, accumulating state
        let updData={...data};
        const execAction=(action)=>{        // ── SAVE_PLAN ──
        if(action.action==='SAVE_PLAN'&&action.data.objective){
          const plan=action.data;
          const matchedArea=(data.areas||[]).find(a=>a.name.toLowerCase()===plan.area?.toLowerCase());
          const areaId=matchedArea?.id||'';
          const objId=uid();
          const newObj={id:objId,title:plan.objective.title,areaId,deadline:plan.objective.deadline||'',status:'active'};
          const projId=uid();
          const newProj={id:projId,title:plan.project?.title||plan.objective.title,objectiveId:objId,areaId,status:'active'};
          const newTasks=(plan.tasks||[]).map(t=>({id:uid(),title:t.title,projectId:projId,status:'todo',priority:t.priority||'media',dueDate:t.dueDate||''}));
          const newHabits=(plan.habits||[]).map(h=>({id:uid(),name:h.name,frequency:h.frequency||'daily',completions:[]}));
          const updObj=[newObj,...(updData.objectives||[])];
          const updProj=[newProj,...(updData.projects||[])];
          const updTasks=[...newTasks,...(updData.tasks||[])];
          const updHabits=[...(updData.habits||[]),...newHabits];
          updData={...updData,objectives:updObj,projects:updProj,tasks:updTasks,habits:updHabits};
          save('objectives',updObj);save('projects',updProj);save('tasks',updTasks);save('habits',updHabits);
          return `🗺️ Plan creado · 🎯 ${newObj.title} · 📋 ${newTasks.length} tareas${newHabits.length?' · 🔁 '+newHabits.length+' hábitos':''}`;

        // ── SAVE_TASK ──
        }else if(action.action==='SAVE_TASK'&&action.data.title){
          const t={id:uid(),title:action.data.title,projectId:'',status:'todo',priority:action.data.priority||'media',deadline:action.data.deadline||''};
          const upd=[t,...(updData.tasks||[])];
          updData={...updData,tasks:upd};save('tasks',upd);
          return '📋 Tarea guardada';

        // ── SAVE_NOTE ──
        }else if(action.action==='SAVE_NOTE'&&action.data.title){
          let resolvedAreaId=action.data.areaId||'';
          if(!resolvedAreaId&&action.data.area){
            const match=(data.areas||[]).find(a=>a.name.toLowerCase()===action.data.area?.toLowerCase());
            resolvedAreaId=match?.id||'';
          }
          const areaLabel=resolvedAreaId?(data.areas||[]).find(a=>a.id===resolvedAreaId):null;
          const n={id:uid(),title:action.data.title,content:action.data.content||'',tags:action.data.tags||[],areaId:resolvedAreaId,createdAt:td,
            ...(action.data.amount?{amount:Number(action.data.amount),currency:action.data.currency||'MXN'}:{})};
          const upd=[n,...(updData.notes||[])];
          updData={...updData,notes:upd};save('notes',upd);
          const noteLabel=`📝 Nota guardada${areaLabel?' · '+areaLabel.icon+' '+areaLabel.name:''}${n.amount?' · 💰 $'+n.amount+' '+n.currency:''}`;
          return noteLabel;
        // ── SAVE_INBOX ──
        }else if(action.action==='SAVE_INBOX'&&action.data.content){
          const i={id:uid(),content:action.data.content,createdAt:td,processed:false};
          const upd=[i,...(updData.inbox||[])];
          updData={...updData,inbox:upd};save('inbox',upd);
          return '📥 Agregado al inbox';

        // ── SAVE_BUDGET ──
        }else if(action.action==='SAVE_BUDGET'&&action.data.title){
          const b={id:uid(),title:action.data.title,amount:Number(action.data.amount)||0,currency:action.data.currency||'MXN',
            dayOfMonth:Number(action.data.dayOfMonth)||1,
            areaId:(()=>{if(action.data.areaId)return action.data.areaId;if(action.data.area){const m=(data.areas||[]).find(a=>a.name.toLowerCase()===action.data.area.toLowerCase());return m?.id||'';}return '';})(),
            createdAt:td};
          const upd=[b,...(updData.budget||[])];
          updData={...updData,budget:upd};save('budget',upd);
          return `💳 Presupuesto: ${b.title} — $${b.amount} ${b.currency}/mes (día ${b.dayOfMonth})`;

        // ── SAVE_HABIT ──
        }else if(action.action==='SAVE_HABIT'&&action.data.name){
          const h={id:uid(),name:action.data.name,frequency:action.data.frequency||'daily',completions:[]};
          const upd=[...(updData.habits||[]),h];
          updData={...updData,habits:upd};save('habits',upd);
          return `🔁 Hábito creado: ${h.name}`;

        // ── SAVE_TRANSACTION ──
        }else if(action.action==='SAVE_TRANSACTION'&&action.data.amount){
          const tx={id:uid(),type:action.data.type||'egreso',amount:Number(action.data.amount)||0,
            currency:action.data.currency||'MXN',category:action.data.category||'Otro',
            description:action.data.description||'',date:action.data.date||td,createdAt:td};
          const upd=[tx,...(updData.transactions||[])];
          updData={...updData,transactions:upd};save('transactions',upd);
          return `💸 ${tx.type==='ingreso'?'Ingreso':'Gasto'}: $${tx.amount} ${tx.currency} — ${tx.category}${tx.description?' ('+tx.description+')':''}`;

        // ── SAVE_HEALTH_METRIC ──
        }else if(action.action==='SAVE_HEALTH_METRIC'&&action.data.type){
          const m={id:uid(),type:action.data.type,value:action.data.value,unit:action.data.unit||'',
            date:action.data.date||td,notes:action.data.notes||'',createdAt:td};
          const upd=[m,...(updData.healthMetrics||[])];
          updData={...updData,healthMetrics:upd};save('healthMetrics',upd);
          return `📊 Métrica: ${m.type} — ${m.value} ${m.unit}`;

        // ── SAVE_WORKOUT ──
        }else if(action.action==='SAVE_WORKOUT'&&action.data.type){
          const w={id:uid(),type:action.data.type,duration:Number(action.data.duration)||0,
            calories:Number(action.data.calories)||0,distance:Number(action.data.distance)||0,
            date:action.data.date||td,notes:action.data.notes||'',createdAt:td};
          const upd=[w,...(updData.workouts||[])];
          updData={...updData,workouts:upd};save('workouts',upd);
          return `🏃 Workout: ${w.type} ${w.duration}min${w.calories?' · '+w.calories+'kcal':''}`;

        // ── SAVE_MEDICATION ──
        }else if(action.action==='SAVE_MEDICATION'&&action.data.name){
          const m={id:uid(),name:action.data.name,dose:action.data.dose||'',unit:action.data.unit||'',
            frequency:action.data.frequency||'daily',time:action.data.time||'',
            stock:Number(action.data.stock)||0,createdAt:td};
          const upd=[m,...(updData.medications||[])];
          updData={...updData,medications:upd};save('medications',upd);
          return `💊 Medicamento: ${m.name} ${m.dose} ${m.unit}`;

        // ── SAVE_MAINTENANCE ──
        }else if(action.action==='SAVE_MAINTENANCE'&&action.data.name){
          const m={id:uid(),name:action.data.name,category:action.data.category||'General',
            frequencyDays:Number(action.data.frequencyDays)||30,lastDone:action.data.lastDone||td,
            cost:Number(action.data.cost)||0,notes:action.data.notes||'',createdAt:td};
          const upd=[m,...(updData.maintenances||[])];
          updData={...updData,maintenances:upd};save('maintenances',upd);
          return `🔧 Mantenimiento: ${m.name} — cada ${m.frequencyDays}d`;

        // ── SAVE_HOME_DOC ──
        }else if(action.action==='SAVE_HOME_DOC'&&action.data.name){
          const d2={id:uid(),name:action.data.name,category:action.data.category||'Otro',
            expiryDate:action.data.expiryDate||'',provider:action.data.provider||'',
            annualCost:Number(action.data.annualCost)||0,notes:action.data.notes||'',createdAt:td};
          const upd=[d2,...(updData.homeDocs||[])];
          updData={...updData,homeDocs:upd};save('homeDocs',upd);
          return `📄 Documento: ${d2.name}${d2.expiryDate?' · vence '+d2.expiryDate:''}`;

        // ── SAVE_HOME_CONTACT ──
        }else if(action.action==='SAVE_HOME_CONTACT'&&action.data.name){
          const c={id:uid(),name:action.data.name,role:action.data.role||'Otro',
            phone:action.data.phone||'',email:action.data.email||'',
            notes:action.data.notes||'',createdAt:td};
          const upd=[c,...(updData.homeContacts||[])];
          updData={...updData,homeContacts:upd};save('homeContacts',upd);
          return `📞 Contacto: ${c.name} (${c.role})`;

        // ── SAVE_LEARNING ──
        }else if(action.action==='SAVE_LEARNING'&&action.data.name){
          const l={id:uid(),name:action.data.name,platform:action.data.platform||'',
            category:action.data.category||'',progress:Number(action.data.progress)||0,
            hoursSpent:Number(action.data.hoursSpent)||0,hoursTotal:Number(action.data.hoursTotal)||0,
            status:'active',notes:action.data.notes||'',createdAt:td};
          const upd=[l,...(updData.learnings||[])];
          updData={...updData,learnings:upd};save('learnings',upd);
          return `📖 Aprendizaje: ${l.name}${l.platform?' en '+l.platform:''} (${l.progress}%)`;

        // ── SAVE_RETRO ──
        }else if(action.action==='SAVE_RETRO'&&(action.data.wentWell||action.data.learned)){
          const r={id:uid(),period:action.data.period||'semanal',date:action.data.date||td,
            wentWell:action.data.wentWell||'',improve:action.data.improve||'',
            learned:action.data.learned||'',createdAt:td};
          const upd=[r,...(updData.retros||[])];
          updData={...updData,retros:upd};save('retros',upd);
          return `🔄 Retrospectiva ${r.period} guardada`;

        // ── SAVE_IDEA ──
        }else if(action.action==='SAVE_IDEA'&&action.data.content){
          const i={id:uid(),content:action.data.content,tag:action.data.tag||'Idea',
            date:action.data.date||td,createdAt:td};
          const upd=[i,...(updData.ideas||[])];
          updData={...updData,ideas:upd};save('ideas',upd);
          return `💡 Idea guardada: [${i.tag}]`;

        // ── SAVE_PERSON ──
        }else if(action.action==='SAVE_PERSON'&&action.data.name){
          const p={id:uid(),name:action.data.name,relation:action.data.relation||'',
            birthday:action.data.birthday||'',emoji:action.data.emoji||'👤',
            phone:action.data.phone||'',email:action.data.email||'',
            notes:action.data.notes||'',createdAt:td};
          const upd=[p,...(updData.people||[])];
          updData={...updData,people:upd};save('people',upd);
          return `👤 Persona: ${p.emoji} ${p.name}${p.relation?' ('+p.relation+')':''}`;

        // ── SAVE_FOLLOWUP ──
        }else if(action.action==='SAVE_FOLLOWUP'&&action.data.task){
          const personId=resolvePersonId(action.data.personName);
          const f={id:uid(),personId,task:action.data.task,
            dueDate:action.data.dueDate||'',priority:action.data.priority||'media',
            done:false,createdAt:td};
          const upd=[f,...(updData.followUps||[])];
          updData={...updData,followUps:upd};save('followUps',upd);
          return `📋 Seguimiento: "${f.task}"${action.data.personName?' con '+action.data.personName:''}`;

        // ── SAVE_INTERACTION ──
        }else if(action.action==='SAVE_INTERACTION'&&action.data.personName){
          const personId=resolvePersonId(action.data.personName);
          const i={id:uid(),personId,type:action.data.type||'Otro',
            date:action.data.date||td,notes:action.data.notes||'',createdAt:td};
          const upd=[i,...(updData.interactions||[])];
          updData={...updData,interactions:upd};save('interactions',upd);
          return `💬 Contacto: ${action.data.type||'Interacción'} con ${action.data.personName}`;

        // ── SAVE_SIDE_PROJECT ──
        }else if(action.action==='SAVE_SIDE_PROJECT'&&action.data.name){
          const p={id:uid(),name:action.data.name,description:action.data.description||'',
            status:action.data.status||'idea',stack:action.data.stack||'',
            url:action.data.url||'',startDate:action.data.startDate||td,
            color:T.areaColors[Math.floor(Math.random()*T.areaColors.length)],createdAt:td};
          const upd=[p,...(updData.sideProjects||[])];
          updData={...updData,sideProjects:upd};save('sideProjects',upd);
          return `🚀 Proyecto: ${p.name} [${p.status}]`;

        // ── SAVE_SP_TASK ──
        }else if(action.action==='SAVE_SP_TASK'&&action.data.title){
          const proj=(updData.sideProjects||[]).find(p=>p.name.toLowerCase()===action.data.projectName?.toLowerCase());
          const t={id:uid(),projectId:proj?.id||'',title:action.data.title,
            priority:action.data.priority||'media',dueDate:action.data.dueDate||'',
            done:false,createdAt:td};
          const upd=[t,...(updData.spTasks||[])];
          updData={...updData,spTasks:upd};save('spTasks',upd);
          return `✅ Tarea: "${t.title}"${proj?' en '+proj.name:''}`;

        // ── SAVE_MILESTONE ──
        }else if(action.action==='SAVE_MILESTONE'&&action.data.title){
          const proj=(updData.sideProjects||[]).find(p=>p.name.toLowerCase()===action.data.projectName?.toLowerCase());
          const m={id:uid(),projectId:proj?.id||'',title:action.data.title,
            date:action.data.date||td,notes:action.data.notes||'',createdAt:td};
          const upd=[m,...(updData.milestones||[])];
          updData={...updData,milestones:upd};save('milestones',upd);
          return `🏆 Hito: "${m.title}"${proj?' en '+proj.name:''}`;

        // ── SAVE_CAR_INFO ──
        }else if(action.action==='SAVE_CAR_INFO'){
          const current=updData.carInfo||{};
          const updated={...current,...action.data};
          updData={...updData,carInfo:updated};save('carInfo',updated);
          const parts=[];
          if(action.data.km) parts.push(`🛣 ${Number(action.data.km).toLocaleString()} km`);
          if(action.data.brand) parts.push(`${action.data.brand} ${action.data.model||''}`);
          if(action.data.plate) parts.push(action.data.plate);
          return `🚗 Coche actualizado${parts.length?' · '+parts.join(' · '):''}`;

        // ── SAVE_CAR_EXPENSE ──
        }else if(action.action==='SAVE_CAR_EXPENSE'&&action.data.concept){
          const e={id:uid(),concept:action.data.concept,category:action.data.category||'Otro',
            amount:Number(action.data.amount)||0,date:action.data.date||td,
            notes:action.data.notes||'',createdAt:td};
          const upd=[e,...(updData.carExpenses||[])];
          updData={...updData,carExpenses:upd};save('carExpenses',upd);
          return `🚗 Gasto coche: ${e.concept} · $${e.amount}`;

        // ── SAVE_CAR_MAINTENANCE ──
        }else if(action.action==='SAVE_CAR_MAINTENANCE'&&action.data.name){
          const m={id:uid(),name:action.data.name,category:action.data.category||'General',
            lastDone:action.data.lastDone||td,frequencyKm:action.data.frequencyKm||'',
            frequencyDays:action.data.frequencyDays||'',cost:Number(action.data.cost)||0,
            notes:action.data.notes||'',createdAt:td};
          const upd=[m,...(updData.carMaintenances||[])];
          updData={...updData,carMaintenances:upd};save('carMaintenances',upd);
          return `🔧 Mantenimiento coche: ${m.name}${m.cost?' · $'+m.cost:''}`;

        // ── SAVE_FARMACIA_ITEM ──
        }else if(action.action==='SAVE_FARMACIA_ITEM'&&action.data.name){
          const f={id:uid(),name:action.data.name,quantity:Number(action.data.quantity)||0,
            unit:action.data.unit||'unidades',expiresAt:action.data.expiresAt||'',
            location:action.data.location||'',notes:action.data.notes||'',createdAt:td};
          const upd=[f,...(updData.farmaciaItems||[])];
          updData={...updData,farmaciaItems:upd};save('farmaciaItems',upd);
          return `💊 Botiquín: ${f.name} · ${f.quantity} ${f.unit}${f.expiresAt?' vence '+f.expiresAt:''}`;
        }
        return null;
      };

        // ── AUTO-CASCADE: guaranteed cross-module propagation regardless of AI output ──
        // Helper: fuzzy check if a SAVE_TRANSACTION for this amount+context already exists in actions
        const hasTxForAmount=(amt,keyword)=>actions.some(a=>
          a.action==='SAVE_TRANSACTION'&&
          Number(a.data.amount)===Number(amt)&&
          (a.data.description||'').toLowerCase().includes((keyword||'').toLowerCase().split(' ')[0])
        );
        const hasCarExpForAmount=(amt)=>actions.some(a=>
          a.action==='SAVE_CAR_EXPENSE'&&Number(a.data.amount)===Number(amt)
        );

        const autoCascade=(action)=>{
          const d=action.data;const cascaded=[];
          // CAR MAINTENANCE with cost → auto TRANSACTION + CAR EXPENSE (only if AI didn't already send them)
          if(action.action==='SAVE_CAR_MAINTENANCE'&&Number(d.cost)>0){
            if(!hasTxForAmount(d.cost,d.name))
              cascaded.push({action:'SAVE_TRANSACTION',data:{type:'egreso',amount:d.cost,currency:d.currency||'MXN',category:'Transporte',description:d.name,date:d.lastDone||td}});
            if(!hasCarExpForAmount(d.cost))
              cascaded.push({action:'SAVE_CAR_EXPENSE',data:{concept:d.name,category:'Reparación',amount:d.cost,date:d.lastDone||td,notes:d.notes||''}});
          }
          // HOGAR MAINTENANCE with cost → auto TRANSACTION
          if(action.action==='SAVE_MAINTENANCE'&&Number(d.cost)>0){
            if(!hasTxForAmount(d.cost,d.name))
              cascaded.push({action:'SAVE_TRANSACTION',data:{type:'egreso',amount:d.cost,currency:d.currency||'MXN',category:'Hogar',description:d.name,date:d.lastDone||td}});
          }
          // WORKOUT → auto mark matching habit complete today
          if(action.action==='SAVE_WORKOUT'){
            const wType=(d.type||'').toLowerCase();
            const matchHabit=(updData.habits||[]).find(h=>{
              const n=h.name.toLowerCase();
              return n.includes(wType)||n.includes('ejercicio')||n.includes('gym')||n.includes('entreno')||n.includes('deporte');
            });
            if(matchHabit&&!matchHabit.completions?.includes(td)){
              const updHabits=(updData.habits||[]).map(h=>h.id===matchHabit.id?{...h,completions:[...(h.completions||[]),td]}:h);
              updData={...updData,habits:updHabits};save('habits',updHabits);
              savedLabels.push(`🔥 Hábito marcado: ${matchHabit.name}`);
            }
          }
          // MEDICATION with stock → auto add to farmacia if not already there
          if(action.action==='SAVE_MEDICATION'&&Number(d.stock)>0){
            const alreadyFarm=actions.some(a=>a.action==='SAVE_FARMACIA_ITEM');
            const existsInFarm=(updData.farmaciaItems||[]).some(f=>f.name.toLowerCase()===d.name.toLowerCase());
            if(!alreadyFarm&&!existsInFarm)
              cascaded.push({action:'SAVE_FARMACIA_ITEM',data:{name:d.name,quantity:d.stock,unit:d.unit||'unidades',notes:`Prescrito: ${d.dose||''} ${d.frequency||''}`}});
          }
          // TRANSACTION egreso Transporte → auto CAR EXPENSE only if carInfo exists AND no CAR_MAINTENANCE already handling it
          if(action.action==='SAVE_TRANSACTION'&&d.type==='egreso'&&d.category==='Transporte'){
            const maintHandled=actions.some(a=>a.action==='SAVE_CAR_MAINTENANCE');
            if(!maintHandled&&!hasCarExpForAmount(d.amount)&&updData.carInfo?.brand)
              cascaded.push({action:'SAVE_CAR_EXPENSE',data:{concept:d.description||d.category,category:'Combustible',amount:d.amount,date:d.date||td,notes:''}});
          }
          // SAVE_PERSON with birthday → auto SAVE_FOLLOWUP reminder
          if(action.action==='SAVE_PERSON'&&d.birthday){
            cascaded.push({action:'SAVE_FOLLOWUP',data:{personName:d.name,task:`Felicitar cumpleaños a ${d.name}`,dueDate:d.birthday.replace(/^\d{4}/,new Date().getFullYear()),priority:'media'}});
          }
          return cascaded;
        };

        // Execute all actions + their cascades
        const allActions=[...actions];
        for(const action of allActions){
          const label=execAction(action);
          if(label) savedLabels.push(label);
          const cascaded=autoCascade(action);
          for(const ca of cascaded){
            const cl=execAction(ca);
            if(cl) savedLabels.push('↳ '+cl);
          }
        }
        setData(updData);
      }
      const finalContent=display+(savedLabels.length?'\n\n✅ '+savedLabels.join('\n✅ '):'');
      saveMsgs([...next,{role:'assistant',content:finalContent}]);
    }catch(e){
      const msg=e.message==='Failed to fetch'
        ?'No se pudo conectar. Verifica su conexión o que la API key sea válida.'
        :e.message;
      saveMsgs([...next,{role:'assistant',content:`⚠️ ${msg}`}]);
    }
    setLoading(false);
  };

  const toggleMic=()=>{
    if(recording){recRef.current?.stop();setRecording(false);return;}
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR)return;
    const r=new SR();r.lang='es-MX';r.continuous=false;r.interimResults=false;
    r.onresult=e=>{setInput(e.results[0][0].transcript);setRecording(false);};
    r.onerror=r.onend=()=>setRecording(false);
    recRef.current=r;r.start();setRecording(true);
  };

  return(
    <>
      <style>{`
        @keyframes psicke-in{from{opacity:0;transform:translateY(32px) scale(0.96)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes psicke-pulse{0%,100%{box-shadow:0 0 0 0 rgba(0,200,150,0.5)}50%{box-shadow:0 0 0 12px rgba(0,200,150,0)}}
        @keyframes psicke-dot{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        @keyframes psicke-ring{0%{opacity:0.6;transform:scale(1)}100%{opacity:0;transform:scale(1.8)}}
        .psicke-bubble:active{transform:scale(0.93)!important;}
      `}</style>

      {/* CHAT PANEL */}
      {open&&(
        <div style={{position:'fixed',inset:0,zIndex:1000,display:'flex',flexDirection:'column',justifyContent:'flex-end'}}
          onClick={e=>e.target===e.currentTarget&&closePanel()}>
          {/* Backdrop */}
          <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.55)',backdropFilter:'blur(6px)'}} onClick={()=>closePanel()}/>

          {/* Panel */}
          <div style={{position:'relative',zIndex:1,background:T.surface,borderRadius:'20px 20px 0 0',border:`1px solid ${T.borderLight}`,borderBottom:'none',
            maxHeight:'78vh',display:'flex',flexDirection:'column',
            animation:'psicke-in 0.28s cubic-bezier(0.34,1.56,0.64,1) both',
            boxShadow:'0 -8px 48px rgba(0,0,0,0.6)'}}>

            {/* Handle + header */}
            <div style={{padding:'12px 20px 0',flexShrink:0}}>
              <div style={{width:36,height:4,background:T.border,borderRadius:2,margin:'0 auto 14px'}}/>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:34,height:34,borderRadius:10,background:`linear-gradient(135deg,${T.accent},${T.orange})`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:20}}>
                    🧠
                  </div>
                  <div>
                    <div style={{color:T.text,fontWeight:700,fontSize:15,fontFamily:"'Playfair Display',serif",lineHeight:1}}>Psicke</div>
                    <div style={{color:T.muted,fontSize:11,marginTop:2}}>Tu IA personal · siempre aquí</div>
                  </div>
                </div>
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  <button onClick={clearMsgs}
                    style={{background:'none',border:`1px solid ${T.border}`,borderRadius:8,padding:'4px 10px',cursor:'pointer',color:T.dim,fontSize:11,fontFamily:'inherit'}}>
                    Borrar
                  </button>
                  <button onClick={()=>closePanel()}
                    style={{background:'none',border:'none',cursor:'pointer',color:T.muted,display:'flex',padding:4}}>
                    <Icon name="x" size={20}/>
                  </button>
                </div>
              </div>
            </div>

            {/* Back arrow + Suggestions */}
            {!showSugg&&msgs.length>1&&(
              <div style={{padding:'0 16px 6px',flexShrink:0}}>
                <button onClick={()=>setShowSugg(true)}
                  style={{display:'flex',alignItems:'center',gap:5,background:'none',border:'none',color:T.muted,cursor:'pointer',padding:'4px 0',fontSize:12,fontFamily:'inherit',transition:'color 0.15s'}}
                  onMouseEnter={e=>e.currentTarget.style.color=T.accent}
                  onMouseLeave={e=>e.currentTarget.style.color=T.muted}>
                  ← Sugerencias
                </button>
              </div>
            )}
            {showSugg&&suggestions.length>0&&(
              <div style={{padding:'0 14px 10px',flexShrink:0}}>
                <div style={{fontSize:10,fontWeight:700,color:T.muted,textTransform:'uppercase',letterSpacing:0.8,marginBottom:7}}>Sugerencias</div>
                <div style={{display:'flex',flexDirection:'column',gap:5}}>
                  {suggestions.map((s,i)=>(
                    <div key={i} onClick={()=>{setInput(s.q);setShowSugg(false);setTimeout(()=>inputRef.current?.focus(),50);}}
                      style={{display:'flex',alignItems:'center',gap:9,padding:'8px 11px',background:T.surface2,border:`1px solid ${s.color}28`,borderLeft:`3px solid ${s.color}`,borderRadius:9,cursor:'pointer',transition:'all 0.15s'}}
                      onMouseEnter={e=>e.currentTarget.style.background='#162030'}
                      onMouseLeave={e=>e.currentTarget.style.background=T.surface2}>
                      <span style={{fontSize:15,flexShrink:0}}>{s.icon}</span>
                      <span style={{fontSize:12,color:T.text,flex:1,lineHeight:1.4}}>{s.text}</span>
                      <span style={{fontSize:10,color:s.color,fontWeight:700,flexShrink:0}}>→</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Messages */}
            <div style={{flex:1,overflowY:'auto',padding:'0 16px',display:'flex',flexDirection:'column',gap:10,minHeight:0}}
              onClick={()=>setMsgMenu(null)}>
              {msgs.map((m,i)=>{
                const isUser=m.role==='user';
                const showMenu=msgMenu===i;
                const isEditing=editingIdx===i;
                return(
                  <div key={i} style={{display:'flex',flexDirection:'column',alignItems:isUser?'flex-end':'flex-start'}}>
                    <div style={{display:'flex',justifyContent:isUser?'flex-end':'flex-start',alignItems:'flex-end',gap:6}}>
                      {!isUser&&<div style={{width:24,height:24,borderRadius:7,background:`${T.accent}22`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginBottom:2,fontSize:14}}>
                        🧠
                      </div>}
                      {isUser&&isEditing?(
                        <div style={{maxWidth:'82%',display:'flex',flexDirection:'column',gap:6}}>
                          <textarea value={editVal} onChange={e=>setEditVal(e.target.value)}
                            autoFocus rows={3}
                            style={{width:'100%',background:T.surface2,border:`1px solid ${T.accent}`,color:T.text,
                              padding:'8px 12px',borderRadius:12,fontSize:14,outline:'none',resize:'none',
                              fontFamily:'inherit',lineHeight:1.5,boxSizing:'border-box'}}/>
                          <div style={{display:'flex',gap:6,justifyContent:'flex-end'}}>
                            <button onClick={()=>{setEditingIdx(null);setEditVal('');}}
                              style={{background:'none',border:`1px solid ${T.border}`,borderRadius:8,padding:'4px 12px',
                                cursor:'pointer',color:T.muted,fontSize:12,fontFamily:'inherit'}}>
                              Cancelar
                            </button>
                            <button onClick={()=>{
                                if(!editVal.trim())return;
                                // Truncate history to this message and resend with edited content
                                const trimmed=msgs.slice(0,i);
                                saveMsgs(trimmed);
                                setEditingIdx(null);setEditVal('');setMsgMenu(null);
                                setTimeout(()=>send(editVal.trim()),50);
                              }}
                              style={{background:T.accent,border:'none',borderRadius:8,padding:'4px 14px',
                                cursor:'pointer',color:T.userText||'#000',fontSize:12,fontFamily:'inherit',fontWeight:600}}>
                              Enviar
                            </button>
                          </div>
                        </div>
                      ):(
                        <div
                          onClick={e=>{if(isUser){e.stopPropagation();setMsgMenu(showMenu?null:i);}}}
                          style={{maxWidth:'82%',padding:'9px 13px',borderRadius:13,fontSize:14,lineHeight:1.6,whiteSpace:'pre-wrap',
                            background:isUser?(T.userBubble||T.accent):T.surface2,
                            color:isUser?(T.userText||'#000'):T.text,
                            borderBottomRightRadius:isUser?2:13,
                            borderBottomLeftRadius:!isUser?2:13,
                            border:!isUser?`1px solid ${T.border}`:'none',
                            cursor:isUser?'pointer':'default',
                            transition:'opacity 0.15s',
                            opacity:isUser&&showMenu?0.85:1}}>
                          {m.content}
                        </div>
                      )}
                    </div>
                    {/* Action bar for user messages */}
                    {isUser&&showMenu&&!isEditing&&(
                      <div onClick={e=>e.stopPropagation()}
                        style={{display:'flex',gap:4,marginTop:4,marginRight:2,
                          animation:'psicke-in 0.15s ease-out both'}}>
                        {[
                          {label:copied===i?'✓ Copiado':'Copiar', action:()=>{
                            navigator.clipboard?.writeText(m.content).catch(()=>{});
                            setCopied(i);setTimeout(()=>setCopied(null),2000);
                          }},
                          {label:'Editar', action:()=>{
                            setEditVal(m.content);setEditingIdx(i);setMsgMenu(null);
                          }},
                          {label:'Reenviar', action:()=>{
                            // Trim history to just before this msg and resend it
                            const trimmed=msgs.slice(0,i);
                            saveMsgs(trimmed);setMsgMenu(null);
                            setTimeout(()=>send(m.content),50);
                          }},
                        ].map(btn=>(
                          <button key={btn.label} onClick={btn.action}
                            style={{background:T.surface2,border:`1px solid ${T.border}`,borderRadius:8,
                              padding:'4px 10px',cursor:'pointer',color:T.muted,fontSize:11,
                              fontFamily:'inherit',transition:'all 0.15s',fontWeight:500}}
                            onMouseEnter={e=>e.currentTarget.style.color=T.accent}
                            onMouseLeave={e=>e.currentTarget.style.color=T.muted}>
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              {loading&&(
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <div style={{width:24,height:24,borderRadius:7,background:`${T.accent}22`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:14}}>
                    🧠
                  </div>
                  <div style={{padding:'9px 14px',borderRadius:13,borderBottomLeftRadius:2,background:T.surface2,border:`1px solid ${T.border}`,display:'flex',gap:4,alignItems:'center'}}>
                    {[0,1,2].map(i=><span key={i} style={{width:6,height:6,borderRadius:'50%',background:T.accent,display:'inline-block',animation:`psicke-dot 0.9s ${i*0.18}s ease-in-out infinite`}}/>)}
                  </div>
                </div>
              )}
              <div ref={bottomRef}/>
            </div>

            {/* Input area */}
            <div style={{padding:'12px 16px 20px',flexShrink:0,borderTop:`1px solid ${T.border}`,marginTop:8}}>
              {recording&&<div style={{textAlign:'center',color:T.red,fontSize:11,fontWeight:600,marginBottom:6,letterSpacing:1}}>● ESCUCHANDO</div>}
              {/* Slash command menu */}
              {slashMenu&&filteredCmds.length>0&&(
                <div style={{background:T.surface2,border:`1px solid ${T.border}`,borderRadius:12,marginBottom:8,overflow:'hidden',boxShadow:'0 4px 20px rgba(0,0,0,0.4)'}}>
                  {filteredCmds.map(c=>(
                    <div key={c.cmd} onClick={()=>applySlashCmd(c)}
                      style={{display:'flex',alignItems:'center',gap:10,padding:'9px 14px',cursor:'pointer',borderBottom:`1px solid ${T.border}`}}
                      onMouseEnter={e=>e.currentTarget.style.background=`${T.accent}10`}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <span style={{fontSize:16}}>{c.icon}</span>
                      <div>
                        <span style={{fontSize:13,fontWeight:700,color:T.accent}}>{c.cmd}</span>
                        <span style={{fontSize:12,color:T.muted,marginLeft:8}}>{c.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div style={{display:'flex',gap:8,alignItems:'center'}}>
                <button onClick={toggleMic} aria-label={recording?'Detener grabación':'Iniciar grabación de voz'} style={{
                  width:38,height:38,borderRadius:'50%',border:`2px solid ${recording?T.red:T.border}`,
                  background:recording?`${T.red}22`:'transparent',cursor:'pointer',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  color:recording?T.red:T.muted,flexShrink:0,transition:'all 0.2s'}}>
                  <Icon name={recording?'micoff':'mic'} size={16} color={recording?T.red:undefined}/>
                </button>
                <input ref={inputRef} value={input} onChange={e=>{handleInput(e.target.value);}}
                  onKeyDown={e=>{
                    if(e.key==='Escape'){setSlashMenu(false);return;}
                    if(e.key==='Enter'&&!e.shiftKey){setSlashMenu(false);send();}
                  }}
                  autoComplete="off" autoCorrect="off" spellCheck="false"
                  placeholder="Pregunta, idea o escribe / para comandos..."
                  style={{flex:1,background:T.bg,border:`1px solid ${T.border}`,color:T.text,
                    padding:'10px 14px',borderRadius:12,fontSize:14,outline:'none',fontFamily:'inherit'}}/>
                <button onClick={()=>{setSlashMenu(false);send();}} disabled={!input.trim()||loading}
                  aria-label="Enviar mensaje"
                  style={{width:38,height:38,borderRadius:'50%',border:'none',flexShrink:0,
                    background:input.trim()&&!loading?T.accent:'transparent',
                    border:input.trim()&&!loading?'none':`1px solid ${T.border}`,
                    cursor:input.trim()&&!loading?'pointer':'not-allowed',
                    display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.2s'}}>
                  <Icon name="send" size={16} color={input.trim()&&!loading?'#000':T.dim}/>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

// ===================== JOURNAL =====================
const Journal = ({data,setData,isMobile}) => {
  const MOODS=[{e:'😄',l:'Genial'},{e:'🙂',l:'Bien'},{e:'😐',l:'Regular'},{e:'😔',l:'Mal'},{e:'😤',l:'Estresado'}];
  const PROMPTS=['¿Qué salió bien hoy?','¿Qué aprendí hoy?','¿Por qué estoy agradecido?','¿Qué haría diferente?','¿Cuál es mi intención para mañana?'];
  const [sel,setSel]=useState(null);
  const [writing,setWriting]=useState(false);
  const [form,setForm]=useState({mood:'',content:'',gratitude:'',intention:''});
  const todayStr=today();
  const todayEntry=(data.journal||[]).find(j=>j.date===todayStr);

  const save=()=>{
    if(!form.content.trim()&&!form.gratitude.trim())return;
    const entry={id:uid(),date:todayStr,mood:form.mood,content:form.content,gratitude:form.gratitude,intention:form.intention,createdAt:todayStr};
    const existing=(data.journal||[]).find(j=>j.date===todayStr);
    const upd=existing?(data.journal||[]).map(j=>j.date===todayStr?{...j,...form}:j):[entry,...(data.journal||[])];
    setData(d=>({...d,journal:upd}));
    import('react').then(()=>{});
    const s=JSON.stringify(upd);try{localStorage.setItem('journal',s);}catch(e){}
    try{window.storage?.set('journal',s);}catch(e){}
    setWriting(false);setSel(upd.find(j=>j.date===todayStr)||entry);
  };

  const del=(id)=>{
    if(!window.confirm('¿Eliminar esta entrada?'))return;
    const upd=(data.journal||[]).filter(j=>j.id!==id);
    setData(d=>({...d,journal:upd}));
    try{localStorage.setItem('journal',JSON.stringify(upd));}catch(e){}
    try{window.storage?.set('journal',JSON.stringify(upd));}catch(e){}
    if(sel?.id===id)setSel(null);
  };

  const openWrite=(entry)=>{
    if(entry){setForm({mood:entry.mood||'',content:entry.content||'',gratitude:entry.gratitude||'',intention:entry.intention||''});}
    else{setForm({mood:'',content:'',gratitude:'',intention:''});}
    setWriting(true);
  };

  const streak=(()=>{let s=0,d=new Date();while(true){const ds=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;if(!(data.journal||[]).find(j=>j.date===ds))break;s++;d.setDate(d.getDate()-1);}return s;})();

  return (
    <div>
      <PageHeader title="Journal" subtitle="Tu espacio de reflexión diaria." isMobile={isMobile}
        action={<Btn size="sm" onClick={()=>openWrite(todayEntry)}><Icon name="plus" size={14}/>{todayEntry?'Editar hoy':'Escribir hoy'}</Btn>}/>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:20}}>
        <Card style={{textAlign:'center',padding:14}}>
          <div style={{fontSize:22,fontWeight:700,color:T.accent}}>{streak}</div>
          <div style={{fontSize:11,color:T.muted,marginTop:2}}>🔥 Días seguidos</div>
        </Card>
        <Card style={{textAlign:'center',padding:14}}>
          <div style={{fontSize:22,fontWeight:700,color:T.purple}}>{(data.journal||[]).length}</div>
          <div style={{fontSize:11,color:T.muted,marginTop:2}}>📖 Entradas</div>
        </Card>
        <Card style={{textAlign:'center',padding:14}}>
          <div style={{fontSize:22}}>{todayEntry?.mood||'—'}</div>
          <div style={{fontSize:11,color:T.muted,marginTop:2}}>Hoy</div>
        </Card>
      </div>

      {/* Entry form */}
      {writing&&(
        <Card style={{marginBottom:20,border:`1px solid ${T.accent}40`}}>
          <div style={{color:T.text,fontWeight:600,fontSize:14,marginBottom:14}}>
            {todayEntry?'Editando entrada de hoy':'Nueva entrada · '+new Date().toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'})}
          </div>
          <div style={{marginBottom:12}}>
            <div style={{color:T.muted,fontSize:12,marginBottom:8}}>¿Cómo te sientes hoy?</div>
            <div style={{display:'flex',gap:8}}>
              {MOODS.map(m=><button key={m.e} onClick={()=>setForm(f=>({...f,mood:m.e}))}
                style={{padding:'6px 12px',borderRadius:10,border:`2px solid ${form.mood===m.e?T.accent:T.border}`,background:form.mood===m.e?`${T.accent}18`:'transparent',cursor:'pointer',fontSize:18,transition:'all 0.15s'}}>{m.e}</button>)}
            </div>
          </div>
          <div style={{marginBottom:12}}>
            <div style={{color:T.muted,fontSize:12,marginBottom:6}}>Reflexión libre</div>
            <Textarea value={form.content} onChange={v=>setForm(f=>({...f,content:v}))} placeholder="¿Qué pasó hoy? ¿Cómo te fue?..." rows={4}/>
          </div>
          <div style={{marginBottom:12}}>
            <div style={{color:T.muted,fontSize:12,marginBottom:6}}>Agradecimiento</div>
            <Input value={form.gratitude} onChange={v=>setForm(f=>({...f,gratitude:v}))} placeholder="Hoy estoy agradecido por..."/>
          </div>
          <div style={{marginBottom:14}}>
            <div style={{color:T.muted,fontSize:12,marginBottom:6}}>Intención para mañana</div>
            <Input value={form.intention} onChange={v=>setForm(f=>({...f,intention:v}))} placeholder="Mañana quiero..."/>
          </div>
          <div style={{display:'flex',gap:10}}>
            <Btn onClick={save} style={{flex:1,justifyContent:'center'}}>Guardar entrada</Btn>
            <Btn variant="ghost" onClick={()=>setWriting(false)} style={{flex:1,justifyContent:'center'}}>Cancelar</Btn>
          </div>
        </Card>
      )}

      {/* Entry detail */}
      {sel&&!writing&&(
        <Card style={{marginBottom:20,borderLeft:`3px solid ${T.purple}`}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
            <div>
              <span style={{fontSize:20,marginRight:8}}>{sel.mood}</span>
              <span style={{color:T.text,fontWeight:600}}>{new Date(sel.date+'T12:00').toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</span>
            </div>
            <div style={{display:'flex',gap:6}}>
              <button onClick={()=>openWrite(sel)} style={{background:'none',border:`1px solid ${T.border}`,borderRadius:8,padding:'4px 10px',cursor:'pointer',color:T.muted,fontSize:12,fontFamily:'inherit'}}>✏️ Editar</button>
              <button onClick={()=>del(sel.id)} style={{background:'none',border:'none',color:T.red,cursor:'pointer',display:'flex',padding:4}}><Icon name="trash" size={15}/></button>
            </div>
          </div>
          {sel.content&&<p style={{color:T.text,fontSize:14,lineHeight:1.7,margin:'0 0 10px',whiteSpace:'pre-wrap'}}>{sel.content}</p>}
          {sel.gratitude&&<div style={{padding:'8px 12px',background:`${T.green}12`,borderRadius:8,marginBottom:8,color:T.green,fontSize:13}}>🙏 {sel.gratitude}</div>}
          {sel.intention&&<div style={{padding:'8px 12px',background:`${T.blue}12`,borderRadius:8,color:T.blue,fontSize:13}}>🌅 {sel.intention}</div>}
        </Card>
      )}

      {/* Entries list */}
      <div>
        <div style={{color:T.muted,fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:1,marginBottom:12}}>Historial</div>
        {(data.journal||[]).length===0&&<p style={{color:T.dim,fontSize:13,textAlign:'center',padding:'20px 0'}}>Sin entradas aún. Empieza escribiendo hoy.</p>}
        {(data.journal||[]).map(j=>(
          <div key={j.id} onClick={()=>setSel(sel?.id===j.id?null:j)}
            style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',background:sel?.id===j.id?T.surface2:T.surface,border:`1px solid ${sel?.id===j.id?T.accent:T.border}`,borderRadius:10,marginBottom:8,cursor:'pointer',transition:'all 0.15s'}}>
            <div style={{fontSize:22,flexShrink:0}}>{j.mood||'📔'}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{color:T.text,fontSize:13,fontWeight:500}}>{new Date(j.date+'T12:00').toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'})}</div>
              {j.content&&<div style={{color:T.muted,fontSize:12,marginTop:2}}>{j.content.slice(0,70)}{j.content.length>70?'…':''}</div>}
            </div>
            <div style={{flexShrink:0,color:T.dim,fontSize:11}}>{fmt(j.date)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ===================== BOOKS =====================
const Books = ({data,setData,isMobile}) => {
  const STATUSES=[{id:'want',label:'Por leer',color:T.blue,emoji:'📚'},{id:'reading',label:'Leyendo',color:T.accent,emoji:'📖'},{id:'done',label:'Leído',color:T.green,emoji:'✅'},{id:'abandoned',label:'Abandonado',color:T.dim,emoji:'❌'}];
  const [modal,setModal]=useState(false);
  const [filter,setFilter]=useState('all');
  const [sel,setSel]=useState(null);
  const [editing,setEditing]=useState(false);
  const [form,setForm]=useState({title:'',author:'',status:'want',rating:0,review:'',genre:'',pages:''});

  const saveBook=(isEdit=false)=>{
    if(!form.title.trim())return;
    const b={...form,id:isEdit?sel.id:uid(),pages:Number(form.pages)||0,createdAt:isEdit?(sel.createdAt||today()):today()};
    const upd=isEdit?(data.books||[]).map(x=>x.id===b.id?b:x):[b,...(data.books||[])];
    setData(d=>({...d,books:upd}));
    const s=JSON.stringify(upd);try{localStorage.setItem('books',s);}catch(e){}try{window.storage?.set('books',s);}catch(e){}
    setModal(false);setEditing(false);setSel(b);setForm({title:'',author:'',status:'want',rating:0,review:'',genre:'',pages:''});
  };
  const del=(id)=>{
    if(!window.confirm('¿Eliminar este libro?'))return;
    const upd=(data.books||[]).filter(b=>b.id!==id);
    setData(d=>({...d,books:upd}));
    try{localStorage.setItem('books',JSON.stringify(upd));}catch(e){}try{window.storage?.set('books',JSON.stringify(upd));}catch(e){}
    if(sel?.id===id)setSel(null);
  };
  const openEdit=(b)=>{setForm({title:b.title,author:b.author||'',status:b.status,rating:b.rating||0,review:b.review||'',genre:b.genre||'',pages:b.pages||''});setEditing(true);setSel(b);setModal(true);};

  const books=data.books||[];
  const visible=filter==='all'?books:books.filter(b=>b.status===filter);
  const reading=books.filter(b=>b.status==='reading').length;
  const done=books.filter(b=>b.status==='done').length;

  const StarRating=({val,onChange})=>(
    <div style={{display:'flex',gap:4}}>
      {[1,2,3,4,5].map(i=><button key={i} onClick={()=>onChange&&onChange(i===val?0:i)}
        style={{background:'none',border:'none',cursor:onChange?'pointer':'default',padding:2,color:i<=val?T.accent:T.border}}>
        <Icon name={i<=val?'star':'starEmpty'} size={18} color={i<=val?T.accent:T.border}/>
      </button>)}
    </div>
  );

  return (
    <div>
      <PageHeader title="Biblioteca" subtitle="Libros que lees, leíste y quieres leer." isMobile={isMobile}
        action={<Btn size="sm" onClick={()=>{setEditing(false);setForm({title:'',author:'',status:'want',rating:0,review:'',genre:'',pages:''});setModal(true);}}><Icon name="plus" size={14}/>Agregar</Btn>}/>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:20}}>
        {STATUSES.map(s=>{
          const cnt=books.filter(b=>b.status===s.id).length;
          return <Card key={s.id} onClick={()=>setFilter(filter===s.id?'all':s.id)}
            style={{textAlign:'center',padding:10,border:`1px solid ${filter===s.id?s.color:T.border}`,cursor:'pointer'}}>
            <div style={{fontSize:18}}>{s.emoji}</div>
            <div style={{fontSize:20,fontWeight:700,color:s.color}}>{cnt}</div>
            <div style={{fontSize:10,color:T.muted,marginTop:1}}>{s.label}</div>
          </Card>;
        })}
      </div>

      {/* Book detail */}
      {sel&&(
        <Card style={{marginBottom:20,borderLeft:`3px solid ${T.accent}`}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
            <div style={{flex:1}}>
              <div style={{color:T.text,fontWeight:700,fontSize:16}}>{sel.title}</div>
              {sel.author&&<div style={{color:T.muted,fontSize:13,marginTop:2}}>por {sel.author}</div>}
            </div>
            <div style={{display:'flex',gap:6}}>
              <button onClick={()=>openEdit(sel)} style={{background:'none',border:`1px solid ${T.border}`,borderRadius:8,padding:'4px 10px',cursor:'pointer',color:T.muted,fontSize:12,fontFamily:'inherit'}}>✏️ Editar</button>
              <button onClick={()=>del(sel.id)} style={{background:'none',border:'none',color:T.red,cursor:'pointer',display:'flex',padding:4}}><Icon name="trash" size={15}/></button>
            </div>
          </div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:10,alignItems:'center'}}>
            {(()=>{const s=STATUSES.find(x=>x.id===sel.status);return s?<Tag text={`${s.emoji} ${s.label}`} color={s.color}/>:null;})()}
            {sel.genre&&<Tag text={sel.genre}/>}
            {sel.pages>0&&<span style={{color:T.muted,fontSize:12}}>{sel.pages} págs</span>}
          </div>
          {sel.rating>0&&<div style={{marginBottom:8}}><StarRating val={sel.rating}/></div>}
          {sel.review&&<p style={{color:T.text,fontSize:14,lineHeight:1.7,margin:0,fontStyle:'italic'}}>"{sel.review}"</p>}
        </Card>
      )}

      {/* Book list */}
      <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr 1fr':'repeat(auto-fill,minmax(160px,1fr))',gap:10}}>
        {visible.map(b=>{
          const st=STATUSES.find(s=>s.id===b.status);
          return <div key={b.id} onClick={()=>setSel(sel?.id===b.id?null:b)}
            style={{padding:'12px 14px',background:T.surface,border:`1px solid ${sel?.id===b.id?T.accent:T.border}`,borderRadius:10,cursor:'pointer',transition:'border-color 0.15s',borderTop:`3px solid ${st?.color||T.border}`}}>
            <div style={{color:T.text,fontSize:13,fontWeight:600,marginBottom:4,lineHeight:1.3}}>{b.title}</div>
            {b.author&&<div style={{color:T.muted,fontSize:11,marginBottom:6}}>{b.author}</div>}
            {b.rating>0&&<div style={{display:'flex',gap:1}}>{[1,2,3,4,5].map(i=><span key={i} style={{color:i<=b.rating?T.accent:T.border,fontSize:11}}>★</span>)}</div>}
          </div>;
        })}
        {!visible.length&&<div style={{gridColumn:'1/-1',textAlign:'center',padding:'30px 0',color:T.dim}}><Icon name="book" size={40}/><p>Sin libros{filter!=='all'?' en esta categoría':' aún'}.</p></div>}
      </div>

      {modal&&(
        <Modal title={editing?'Editar libro':'Nuevo libro'} onClose={()=>{setModal(false);setEditing(false);}}>
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <Input value={form.title} onChange={v=>setForm(f=>({...f,title:v}))} placeholder="Título del libro"/>
            <Input value={form.author} onChange={v=>setForm(f=>({...f,author:v}))} placeholder="Autor"/>
            <div style={{display:'flex',gap:10}}>
              <Input value={form.genre} onChange={v=>setForm(f=>({...f,genre:v}))} placeholder="Género" style={{flex:1}}/>
              <Input type="number" value={form.pages} onChange={v=>setForm(f=>({...f,pages:v}))} placeholder="Páginas" style={{flex:1}}/>
            </div>
            <Select value={form.status} onChange={v=>setForm(f=>({...f,status:v}))}>
              {STATUSES.map(s=><option key={s.id} value={s.id}>{s.emoji} {s.label}</option>)}
            </Select>
            <div>
              <div style={{color:T.muted,fontSize:12,marginBottom:6}}>Calificación</div>
              <StarRating val={form.rating} onChange={v=>setForm(f=>({...f,rating:v}))}/>
            </div>
            <Textarea value={form.review} onChange={v=>setForm(f=>({...f,review:v}))} placeholder="Reseña o notas del libro..." rows={3}/>
            <Btn onClick={()=>saveBook(editing)} style={{width:'100%',justifyContent:'center'}}>{editing?'Guardar cambios':'Agregar libro'}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ===================== SHOPPING =====================
const Shopping = ({data,setData,isMobile}) => {
  const [form,setForm]=useState({name:'',qty:'1',unit:'pza',category:''});
  const [editId,setEditId]=useState(null);
  const [editForm,setEditForm]=useState({});
  const [catFilter,setCatFilter]=useState('all');
  const UNITS=['pza','kg','g','L','mL','caja','bolsa','lata','frasco','paq'];

  const saveItem=()=>{
    if(!form.name.trim())return;
    const item={id:uid(),...form,qty:Number(form.qty)||1,done:false,createdAt:today()};
    const upd=[item,...(data.shopping||[])];
    setData(d=>({...d,shopping:upd}));
    const s=JSON.stringify(upd);try{localStorage.setItem('shopping',s);}catch(e){}try{window.storage?.set('shopping',s);}catch(e){}
    setForm({name:'',qty:'1',unit:'pza',category:form.category});
  };
  const toggle=(id)=>{const u=(data.shopping||[]).map(i=>i.id===id?{...i,done:!i.done}:i);setData(d=>({...d,shopping:u}));const s=JSON.stringify(u);try{localStorage.setItem('shopping',s);}catch(e){}try{window.storage?.set('shopping',s);}catch(e){}};
  const del=(id)=>{const u=(data.shopping||[]).filter(i=>i.id!==id);setData(d=>({...d,shopping:u}));const s=JSON.stringify(u);try{localStorage.setItem('shopping',s);}catch(e){}try{window.storage?.set('shopping',s);}catch(e){}};
  const clearDone=()=>{const u=(data.shopping||[]).filter(i=>!i.done);setData(d=>({...d,shopping:u}));const s=JSON.stringify(u);try{localStorage.setItem('shopping',s);}catch(e){}try{window.storage?.set('shopping',s);}catch(e){}};

  const items=data.shopping||[];
  const pending=items.filter(i=>!i.done);
  const done=items.filter(i=>i.done);
  const cats=[...new Set(items.map(i=>i.category).filter(Boolean))];
  const visible=(catFilter==='all'?items:items.filter(i=>i.category===catFilter));

  return (
    <div>
      <PageHeader title="Lista de Compras" subtitle={`${pending.length} pendientes · ${done.length} en carrito`} isMobile={isMobile}
        action={done.length>0&&<Btn size="sm" variant="ghost" onClick={clearDone}>Limpiar ✓</Btn>}/>

      {/* Add form */}
      <Card style={{marginBottom:20}}>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          <Input value={form.name} onChange={v=>setForm(f=>({...f,name:v}))} placeholder="Producto..."
            style={{flex:'2 1 120px'}} onKeyDown={e=>e.key==='Enter'&&saveItem()}/>
          <Input type="number" value={form.qty} onChange={v=>setForm(f=>({...f,qty:v}))} placeholder="Cant."
            style={{flex:'0 1 60px',padding:'10px 8px'}}/>
          <Select value={form.unit} onChange={v=>setForm(f=>({...f,unit:v}))} style={{flex:'0 1 70px',padding:'10px 8px',fontSize:13}}>
            {UNITS.map(u=><option key={u}>{u}</option>)}
          </Select>
          <Input value={form.category} onChange={v=>setForm(f=>({...f,category:v}))} placeholder="Categoría (ej: Frutas)"
            style={{flex:'1 1 100px'}}/>
          <button onClick={saveItem} style={{background:T.accent,border:'none',borderRadius:10,padding:'0 16px',cursor:'pointer',display:'flex',alignItems:'center',flexShrink:0}}>
            <Icon name="plus" size={20} color="#000"/>
          </button>
        </div>
      </Card>

      {/* Category filter */}
      {cats.length>0&&(
        <div style={{display:'flex',gap:6,marginBottom:16,flexWrap:'wrap'}}>
          <button onClick={()=>setCatFilter('all')} style={{padding:'4px 12px',borderRadius:20,border:`1px solid ${catFilter==='all'?T.accent:T.border}`,background:catFilter==='all'?`${T.accent}18`:'transparent',cursor:'pointer',color:catFilter==='all'?T.accent:T.muted,fontSize:12,fontFamily:'inherit'}}>Todos</button>
          {cats.map(c=><button key={c} onClick={()=>setCatFilter(c===catFilter?'all':c)}
            style={{padding:'4px 12px',borderRadius:20,border:`1px solid ${catFilter===c?T.accent:T.border}`,background:catFilter===c?`${T.accent}18`:'transparent',cursor:'pointer',color:catFilter===c?T.accent:T.muted,fontSize:12,fontFamily:'inherit'}}>{c}</button>)}
        </div>
      )}

      {/* Items */}
      {visible.filter(i=>!i.done).map(i=>(
        <div key={i.id} style={{display:'flex',alignItems:'center',gap:10,padding:'11px 14px',background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,marginBottom:8}}>
          <button onClick={()=>toggle(i.id)} style={{width:22,height:22,borderRadius:'50%',border:`2px solid ${T.border}`,background:'transparent',cursor:'pointer',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.15s'}}/>
          <div style={{flex:1,minWidth:0}}>
            <span style={{color:T.text,fontSize:14,fontWeight:500}}>{i.name}</span>
            {i.category&&<span style={{color:T.muted,fontSize:11,marginLeft:8}}>{i.category}</span>}
          </div>
          <span style={{color:T.accent,fontSize:13,fontWeight:600,flexShrink:0}}>{i.qty} {i.unit}</span>
          <button onClick={()=>del(i.id)} style={{background:'none',border:'none',color:T.dim,cursor:'pointer',display:'flex',padding:4}}><Icon name="trash" size={13}/></button>
        </div>
      ))}

      {visible.filter(i=>i.done).length>0&&(
        <div style={{marginTop:12,opacity:0.5}}>
          <div style={{color:T.muted,fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:1,marginBottom:8}}>En carrito ✓</div>
          {visible.filter(i=>i.done).map(i=>(
            <div key={i.id} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',borderBottom:`1px solid ${T.border}`}}>
              <button onClick={()=>toggle(i.id)} style={{width:22,height:22,borderRadius:'50%',border:`2px solid ${T.green}`,background:T.green,cursor:'pointer',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <Icon name="check" size={11} color="#000"/>
              </button>
              <span style={{color:T.muted,fontSize:14,flex:1,textDecoration:'line-through'}}>{i.name}</span>
              <span style={{color:T.dim,fontSize:12}}>{i.qty} {i.unit}</span>
              <button onClick={()=>del(i.id)} style={{background:'none',border:'none',color:T.dim,cursor:'pointer',display:'flex',padding:4}}><Icon name="trash" size={13}/></button>
            </div>
          ))}
        </div>
      )}

      {!visible.length&&<div style={{textAlign:'center',padding:'30px 0',color:T.dim}}><Icon name="cart" size={40}/><p>La lista está vacía.</p></div>}
    </div>
  );
};

// ===================== EDUCATION =====================
const Education = ({data,setData,isMobile}) => {
  const [modal,setModal]=useState(false);
  const [noteModal,setNoteModal]=useState(false);
  const [selSubject,setSelSubject]=useState(null);
  const [subjectForm,setSubjectForm]=useState({name:'',icon:'📚',color:T.areaColors[3]});
  const [noteForm,setNoteForm]=useState({title:'',content:'',tags:'',type:'apunte'});
  const [editNote,setEditNote]=useState(null);
  const [editNoteForm,setEditNoteForm]=useState({});
  const [selNote,setSelNote]=useState(null);

  const ICONS=['📚','🔬','💻','🧮','🎨','🏛️','🌍','⚗️','📐','🎵','📖','🧠'];
  const NOTE_TYPES=[{id:'apunte',label:'Apunte',color:T.blue},{id:'tarea',label:'Tarea',color:T.orange},{id:'examen',label:'Examen',color:T.red},{id:'resumen',label:'Resumen',color:T.green}];

  const edu=data.education||[];

  const saveSubject=()=>{
    if(!subjectForm.name.trim())return;
    const s={id:uid(),...subjectForm,notes:[],createdAt:today()};
    const upd=[...edu,s];
    setData(d=>({...d,education:upd}));
    const str=JSON.stringify(upd);try{localStorage.setItem('education',str);}catch(e){}try{window.storage?.set('education',str);}catch(e){}
    setModal(false);setSubjectForm({name:'',icon:'📚',color:T.areaColors[3]});
    setSelSubject(s);
  };
  const delSubject=(id)=>{
    if(!window.confirm('¿Eliminar esta materia y todas sus notas?'))return;
    const upd=edu.filter(s=>s.id!==id);
    setData(d=>({...d,education:upd}));
    const str=JSON.stringify(upd);try{localStorage.setItem('education',str);}catch(e){}try{window.storage?.set('education',str);}catch(e){}
    if(selSubject?.id===id){setSelSubject(null);setSelNote(null);}
  };
  const saveNote=()=>{
    if(!noteForm.title.trim()||!selSubject)return;
    const n={id:uid(),...noteForm,tags:noteForm.tags.split(',').map(t=>t.trim()).filter(Boolean),createdAt:today()};
    const upd=edu.map(s=>s.id===selSubject.id?{...s,notes:[n,...(s.notes||[])]}:s);
    setData(d=>({...d,education:upd}));
    const str=JSON.stringify(upd);try{localStorage.setItem('education',str);}catch(e){}try{window.storage?.set('education',str);}catch(e){}
    setNoteModal(false);setNoteForm({title:'',content:'',tags:'',type:'apunte'});
    setSelSubject(upd.find(s=>s.id===selSubject.id));
    setSelNote(n);
  };
  const saveEditNote=()=>{
    if(!editNoteForm.title?.trim())return;
    const upd=edu.map(s=>s.id===selSubject.id?{...s,notes:(s.notes||[]).map(n=>n.id===editNote?{...n,...editNoteForm,tags:(editNoteForm.tags||'').split(',').map(t=>t.trim()).filter(Boolean)}:n)}:s);
    setData(d=>({...d,education:upd}));
    const str=JSON.stringify(upd);try{localStorage.setItem('education',str);}catch(e){}try{window.storage?.set('education',str);}catch(e){}
    setSelSubject(upd.find(s=>s.id===selSubject.id));
    setSelNote(upd.find(s=>s.id===selSubject.id)?.notes?.find(n=>n.id===editNote));
    setEditNote(null);
  };
  const delNote=(nid)=>{
    if(!window.confirm('¿Eliminar esta nota?'))return;
    const upd=edu.map(s=>s.id===selSubject.id?{...s,notes:(s.notes||[]).filter(n=>n.id!==nid)}:s);
    setData(d=>({...d,education:upd}));
    const str=JSON.stringify(upd);try{localStorage.setItem('education',str);}catch(e){}try{window.storage?.set('education',str);}catch(e){}
    setSelSubject(upd.find(s=>s.id===selSubject.id));
    if(selNote?.id===nid)setSelNote(null);
  };

  const totalNotes=edu.reduce((s,sub)=>s+(sub.notes||[]).length,0);

  return (
    <div>
      <PageHeader title="Educación" subtitle="Materias, apuntes y tareas escolares." isMobile={isMobile}
        action={<Btn size="sm" onClick={()=>setModal(true)}><Icon name="plus" size={14}/>Materia</Btn>}/>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:20}}>
        <Card style={{textAlign:'center',padding:14}}>
          <div style={{fontSize:22,fontWeight:700,color:T.purple}}>{edu.length}</div>
          <div style={{fontSize:11,color:T.muted,marginTop:2}}>Materias</div>
        </Card>
        <Card style={{textAlign:'center',padding:14}}>
          <div style={{fontSize:22,fontWeight:700,color:T.blue}}>{totalNotes}</div>
          <div style={{fontSize:11,color:T.muted,marginTop:2}}>Notas totales</div>
        </Card>
        <Card style={{textAlign:'center',padding:14}}>
          <div style={{fontSize:22,fontWeight:700,color:T.orange}}>{edu.reduce((s,sub)=>(s+(sub.notes||[]).filter(n=>n.type==='tarea').length),0)}</div>
          <div style={{fontSize:11,color:T.muted,marginTop:2}}>Tareas</div>
        </Card>
      </div>

      <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':selSubject?'220px 1fr':'1fr',gap:16}}>
        {/* Subject list */}
        <div>
          {edu.length===0&&<div style={{textAlign:'center',padding:'40px 0',color:T.dim}}><Icon name="graduation" size={40}/><p style={{marginBottom:12}}>Sin materias aún.</p><Btn size="sm" onClick={()=>setModal(true)}><Icon name="plus" size={12}/>Agregar materia</Btn></div>}
          {edu.map(s=>{
            const notesCount=(s.notes||[]).length;
            const tareasCount=(s.notes||[]).filter(n=>n.type==='tarea').length;
            return <div key={s.id} onClick={()=>{setSelSubject(selSubject?.id===s.id?null:s);setSelNote(null);}}
              style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',background:selSubject?.id===s.id?T.surface2:T.surface,border:`1px solid ${selSubject?.id===s.id?T.accent:T.border}`,borderRadius:10,marginBottom:8,cursor:'pointer',borderLeft:`4px solid ${s.color}`,transition:'all 0.15s'}}>
              <div style={{fontSize:22,flexShrink:0}}>{s.icon}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{color:T.text,fontWeight:600,fontSize:14}}>{s.name}</div>
                <div style={{color:T.muted,fontSize:11,marginTop:2}}>{notesCount} notas{tareasCount>0?` · ${tareasCount} tareas`:''}</div>
              </div>
              <button onClick={e=>{e.stopPropagation();delSubject(s.id);}} style={{background:'none',border:'none',color:T.dim,cursor:'pointer',padding:4,display:'flex'}}><Icon name="trash" size={13}/></button>
            </div>;
          })}
        </div>

        {/* Notes panel */}
        {selSubject&&(
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:20}}>{selSubject.icon}</span>
                <span style={{color:T.text,fontWeight:700,fontSize:16}}>{selSubject.name}</span>
              </div>
              <Btn size="sm" onClick={()=>setNoteModal(true)}><Icon name="plus" size={12}/>Nueva nota</Btn>
            </div>

            {/* Note detail */}
            {selNote&&(
              <Card style={{marginBottom:16,borderLeft:`3px solid ${NOTE_TYPES.find(t=>t.id===selNote.type)?.color||T.accent}`}}>
                {editNote===selNote.id?(
                  <div style={{display:'flex',flexDirection:'column',gap:10}}>
                    <Input value={editNoteForm.title||''} onChange={v=>setEditNoteForm(f=>({...f,title:v}))} placeholder="Título"/>
                    <Select value={editNoteForm.type||'apunte'} onChange={v=>setEditNoteForm(f=>({...f,type:v}))}>
                      {NOTE_TYPES.map(t=><option key={t.id} value={t.id}>{t.label}</option>)}
                    </Select>
                    <Textarea value={editNoteForm.content||''} onChange={v=>setEditNoteForm(f=>({...f,content:v}))} rows={5} placeholder="Contenido..."/>
                    <Input value={editNoteForm.tags||''} onChange={v=>setEditNoteForm(f=>({...f,tags:v}))} placeholder="Tags"/>
                    <div style={{display:'flex',gap:8}}>
                      <Btn onClick={saveEditNote} size="sm" style={{flex:1,justifyContent:'center'}}>Guardar</Btn>
                      <Btn variant="ghost" onClick={()=>setEditNote(null)} size="sm" style={{flex:1,justifyContent:'center'}}>Cancelar</Btn>
                    </div>
                  </div>
                ):(
                  <>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                      <div>
                        <div style={{color:T.text,fontWeight:700,fontSize:15}}>{selNote.title}</div>
                        <div style={{display:'flex',gap:6,marginTop:4,flexWrap:'wrap'}}>
                          {(()=>{const t=NOTE_TYPES.find(x=>x.id===selNote.type);return t?<Tag text={t.label} color={t.color}/>:null;})()}
                          {selNote.tags?.map(t=><Tag key={t} text={t}/>)}
                          <span style={{color:T.dim,fontSize:11,alignSelf:'center'}}>{fmt(selNote.createdAt)}</span>
                        </div>
                      </div>
                      <div style={{display:'flex',gap:4}}>
                        <button onClick={()=>{setEditNoteForm({title:selNote.title,content:selNote.content||'',tags:(selNote.tags||[]).join(', '),type:selNote.type});setEditNote(selNote.id);}} style={{background:'none',border:`1px solid ${T.border}`,borderRadius:8,padding:'4px 10px',cursor:'pointer',color:T.muted,fontSize:12,fontFamily:'inherit'}}>✏️</button>
                        <button onClick={()=>delNote(selNote.id)} style={{background:'none',border:'none',color:T.red,cursor:'pointer',padding:4,display:'flex'}}><Icon name="trash" size={14}/></button>
                      </div>
                    </div>
                    {selNote.content&&<p style={{color:T.text,fontSize:14,lineHeight:1.8,margin:0,whiteSpace:'pre-wrap'}}>{selNote.content}</p>}
                  </>
                )}
              </Card>
            )}

            {/* Notes list */}
            {(selSubject.notes||[]).length===0&&<div style={{textAlign:'center',padding:'20px 0',color:T.dim,fontSize:13}}>Sin notas en esta materia.</div>}
            {(selSubject.notes||[]).map(n=>{
              const nt=NOTE_TYPES.find(t=>t.id===n.type);
              return <div key={n.id} onClick={()=>setSelNote(selNote?.id===n.id?null:n)}
                style={{padding:'10px 14px',background:selNote?.id===n.id?T.surface2:T.surface,border:`1px solid ${selNote?.id===n.id?T.accent:T.border}`,borderRadius:10,marginBottom:8,cursor:'pointer',transition:'all 0.15s',borderLeft:`3px solid ${nt?.color||T.border}`}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div style={{color:T.text,fontSize:13,fontWeight:500}}>{n.title}</div>
                  <span style={{color:nt?.color||T.muted,fontSize:10,background:`${nt?.color||T.muted}18`,padding:'2px 8px',borderRadius:8,fontWeight:600}}>{nt?.label||n.type}</span>
                </div>
                {n.content&&<div style={{color:T.muted,fontSize:12,marginTop:3}}>{n.content.slice(0,60)}{n.content.length>60?'…':''}</div>}
              </div>;
            })}
          </div>
        )}
      </div>

      {/* Subject modal */}
      {modal&&(
        <Modal title="Nueva materia" onClose={()=>setModal(false)}>
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <Input value={subjectForm.name} onChange={v=>setSubjectForm(f=>({...f,name:v}))} placeholder="Nombre de la materia"/>
            <div>
              <div style={{color:T.muted,fontSize:12,marginBottom:8}}>Icono</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                {ICONS.map(e=><button key={e} onClick={()=>setSubjectForm(f=>({...f,icon:e}))}
                  style={{width:38,height:38,borderRadius:9,border:`2px solid ${subjectForm.icon===e?T.accent:T.border}`,background:T.bg,cursor:'pointer',fontSize:18}}>{e}</button>)}
              </div>
            </div>
            <div>
              <div style={{color:T.muted,fontSize:12,marginBottom:8}}>Color</div>
              <div style={{display:'flex',gap:8}}>
                {T.areaColors.map(c=><button key={c} onClick={()=>setSubjectForm(f=>({...f,color:c}))}
                  style={{width:28,height:28,borderRadius:'50%',background:c,border:`3px solid ${subjectForm.color===c?T.text:'transparent'}`,cursor:'pointer'}}/>)}
              </div>
            </div>
            <Btn onClick={saveSubject} style={{width:'100%',justifyContent:'center'}}>Crear materia</Btn>
          </div>
        </Modal>
      )}

      {/* Note modal */}
      {noteModal&&(
        <Modal title="Nueva nota" onClose={()=>setNoteModal(false)}>
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <Input value={noteForm.title} onChange={v=>setNoteForm(f=>({...f,title:v}))} placeholder="Título de la nota"/>
            <Select value={noteForm.type} onChange={v=>setNoteForm(f=>({...f,type:v}))}>
              {NOTE_TYPES.map(t=><option key={t.id} value={t.id}>{t.label}</option>)}
            </Select>
            <Textarea value={noteForm.content} onChange={v=>setNoteForm(f=>({...f,content:v}))} placeholder="Contenido..." rows={5}/>
            <Input value={noteForm.tags} onChange={v=>setNoteForm(f=>({...f,tags:v}))} placeholder="Tags (separados por coma)"/>
            <Btn onClick={saveNote} style={{width:'100%',justifyContent:'center'}}>Guardar nota</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

const NAV_SECTIONS=[
  {label:'VIDA',items:[
    {id:'dashboard',label:'Inicio',icon:'home'},
    {id:'areas',label:'Áreas',icon:'grid'},
    {id:'objectives',label:'Objetivos',icon:'target'},
    {id:'relaciones',label:'Relaciones',icon:'people'},
    {id:'health',label:'Salud',icon:'health'},
    {id:'finance',label:'Finanzas',icon:'money'},
    {id:'coche',label:'Coche',icon:'car'},
  ]},
  {label:'TRABAJO',items:[
    {id:'projects',label:'Proyectos',icon:'folder'},
    {id:'notes',label:'Notas',icon:'note'},
    {id:'sideprojects',label:'Side Projects',icon:'rocket'},
    {id:'education',label:'Educación',icon:'graduation'},
    {id:'desarrollo',label:'Desarrollo',icon:'brain'},
  ]},
  {label:'CAPTURA',items:[
    {id:'inbox',label:'Inbox',icon:'inbox'},
    {id:'habits',label:'Hábitos',icon:'habit'},
    {id:'journal',label:'Journal',icon:'journal'},
    {id:'shopping',label:'Compras',icon:'cart'},
    {id:'books',label:'Libros',icon:'book'},
    {id:'hogar',label:'Hogar',icon:'home'},
  ]},
  {label:'SISTEMA',items:[
    {id:'settings',label:'Config',icon:'cog'},
  ]},
];
const NAV=NAV_SECTIONS.flatMap(s=>s.items);
const MOBILE_NAV=[
  {id:'dashboard',label:'Inicio',icon:'home'},
  {id:'__psicke__',label:'Psicke',icon:'brain'},
  {id:'notes',label:'Notas',icon:'note'},
  {id:'trabajo',label:'Trabajo',icon:'folder'},
  {id:'habits',label:'Hábitos',icon:'habit'},
];
const MORE_NAV=NAV.slice(5);

// ===================== TRABAJO EMBED =====================
const TrabajoEmbed = ({isMobile,onBack}) => {
  const [loaded,setLoaded]     = useState(false);
  const [error,setError]       = useState(false);
  const [fullscreen,setFullscreen] = useState(false);
  const URL = 'https://jeal1498.github.io/AppWeb-ControlCheck/index.html';

  // close fullscreen on Escape
  useEffect(()=>{
    const handler=(e)=>{ if(e.key==='Escape') setFullscreen(false); };
    window.addEventListener('keydown',handler);
    return ()=>window.removeEventListener('keydown',handler);
  },[]);

  const header = (
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:fullscreen?0:14,
      ...(fullscreen?{padding:'10px 16px',background:T.surface,borderBottom:`1px solid ${T.border}`,flexShrink:0}:{})}}>
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        {onBack&&!fullscreen&&(
          <button onClick={onBack} style={{background:'none',border:`1px solid ${T.border}`,borderRadius:10,padding:'6px 10px',cursor:'pointer',color:T.muted,display:'flex',alignItems:'center',gap:4,fontFamily:'inherit',fontSize:12}}>
            <Icon name="back" size={16}/><span style={{fontSize:12,fontWeight:500}}>Áreas</span>
          </button>
        )}
        <div>
          <h2 style={{margin:0,color:T.text,fontSize:isMobile?18:20,fontWeight:700}}>💼 Trabajo</h2>
          {!fullscreen&&<p style={{color:T.muted,fontSize:13,margin:'4px 0 0'}}>ControlCheck — tu app de trabajo</p>}
        </div>
      </div>
      <div style={{display:'flex',gap:8}}>
        <button onClick={()=>setFullscreen(f=>!f)}
          style={{display:'flex',alignItems:'center',gap:6,padding:'7px 14px',background:`${T.accent}15`,border:`1px solid ${T.accent}30`,borderRadius:10,color:T.accent,fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>
          {fullscreen?'⊙ Salir':'⛶ Pantalla completa'}
        </button>
        <a href={URL} target="_blank" rel="noreferrer"
          style={{display:'flex',alignItems:'center',gap:6,padding:'7px 14px',background:`${T.blue}15`,border:`1px solid ${T.blue}30`,borderRadius:10,color:T.blue,fontSize:12,fontWeight:600,textDecoration:'none'}}>
          🔗 Nueva pestaña
        </a>
      </div>
    </div>
  );

  const iframeEl = (
    <div style={{flex:1,borderRadius:fullscreen?0:14,overflow:'hidden',border:fullscreen?'none':`1px solid ${T.border}`,background:T.surface,position:'relative',minHeight:fullscreen?0:isMobile?'65vh':'70vh'}}>
      {!loaded&&!error&&(
        <div style={{position:'absolute',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:12,color:T.muted,fontSize:13,pointerEvents:'none',zIndex:1,left:'50%',top:'50%',transform:'translate(-50%,-50%)'}}>
          <div style={{fontSize:32}}>💼</div>
          <div>Cargando tu app...</div>
        </div>
      )}
      {error
        ?<div style={{textAlign:'center',padding:'40px 0',color:T.muted}}>
           <div style={{fontSize:36,marginBottom:8}}>⚠️</div>
           <div style={{fontSize:14,marginBottom:6}}>No se pudo cargar la app</div>
           <div style={{fontSize:12,color:T.dim,marginBottom:16}}>Puede que el sitio bloquee iframes</div>
           <a href={URL} target="_blank" rel="noreferrer"
             style={{display:'inline-flex',alignItems:'center',gap:6,padding:'9px 18px',background:T.accent,borderRadius:10,color:'#000',fontSize:13,fontWeight:700,textDecoration:'none'}}>
             🔗 Abrir en nueva pestaña
           </a>
         </div>
        :<iframe src={URL} title="ControlCheck — Trabajo"
           onLoad={()=>setLoaded(true)} onError={()=>setError(true)}
           style={{width:'100%',height:'100%',border:'none',display:'block',minHeight:fullscreen?'calc(100vh - 57px)':isMobile?'65vh':'70vh'}}
           allow="clipboard-read; clipboard-write"/>
      }
    </div>
  );

  if(fullscreen) return (
    <div style={{position:'fixed',inset:0,zIndex:500,background:T.bg,display:'flex',flexDirection:'column'}}>
      {header}
      {iframeEl}
    </div>
  );

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%'}}>
      {header}
      {iframeEl}
    </div>
  );
};

// ===================== SIDE PROJECTS =====================
const SideProjects = ({data,setData,isMobile,onBack}) => {
  const [tab,setTab]             = useState('proyectos');
  const [roadmapHover,setRoadmapHover] = useState(null);
  const [modalProj,setModalProj] = useState(false);
  const [modalTask,setModalTask] = useState(false);
  const [modalMile,setModalMile] = useState(false);
  const [modalTime,setModalTime] = useState(false);
  const [selProj,setSelProj]     = useState(null);
  const [editingProj,setEditingProj] = useState(null);
  const [projFilter,setProjFilter]   = useState('all');
  const [projForm,setProjForm]   = useState({name:'',description:'',status:'idea',stack:'',url:'',repoUrl:'',platform:'',revenue:0,costs:0,startDate:today(),color:''});
  const [taskForm,setTaskForm]   = useState({projectId:'',title:'',priority:'media',dueDate:'',done:false});
  const [mileForm,setMileForm]   = useState({projectId:'',title:'',date:today(),notes:''});
  const [timeForm,setTimeForm]   = useState({projectId:'',hours:'',note:'',date:today()});

  const sideProjects = data.sideProjects||[];
  const spTasks      = data.spTasks||[];
  const milestones   = data.milestones||[];
  const timeLogs     = data.spTimeLogs||[];

  const STATUSES=[
    {id:'idea',     label:'Idea',       color:T.muted,   emoji:'💡'},
    {id:'progress', label:'En progreso',color:T.accent,  emoji:'⚡'},
    {id:'paused',   label:'Pausado',    color:T.orange,  emoji:'⏸️'},
    {id:'launched', label:'Lanzado',    color:T.green,   emoji:'🚀'},
    {id:'archived', label:'Archivado',  color:T.dim,     emoji:'📦'},
  ];
  const statusInfo=(id)=>STATUSES.find(s=>s.id===id)||STATUSES[0];

  const activeProjs   = sideProjects.filter(p=>p.status==='progress');
  const launchedProjs = sideProjects.filter(p=>p.status==='launched');
  const pendingTasks  = spTasks.filter(t=>!t.done);
  const todayTasks    = pendingTasks.filter(t=>t.dueDate===today());
  const lastMile      = [...milestones].sort((a,b)=>b.date.localeCompare(a.date))[0];

  const fmtDate=(d)=>{ try{ return new Date(d+'T12:00:00').toLocaleDateString('es-ES',{day:'2-digit',month:'short'}); } catch{ return d; } };
  const priorityColor=(p)=>p==='alta'?T.red:p==='media'?T.orange:T.green;

  const COLORS=[T.areaColors[0],T.areaColors[1],T.areaColors[2],T.areaColors[3],T.areaColors[4],T.areaColors[5],T.areaColors[6]];

  // ── PROJECT actions ──
  const saveProj=()=>{
    if(!projForm.name.trim()) return;
    const p={id:editingProj?.id||uid(),...projForm,createdAt:editingProj?.createdAt||today()};
    const upd=editingProj?sideProjects.map(x=>x.id===p.id?p:x):[p,...sideProjects];
    setData(d=>({...d,sideProjects:upd})); save('sideProjects',upd);
    setModalProj(false); setEditingProj(null); setSelProj(p);
    setProjForm({name:'',description:'',status:'idea',stack:'',url:'',repoUrl:'',platform:'',revenue:0,costs:0,startDate:today(),color:''});
    toast.success(editingProj?'Proyecto actualizado':'Proyecto creado');
  };
  const openEditProj=(p)=>{ setProjForm({name:p.name,description:p.description||'',status:p.status,stack:p.stack||'',url:p.url||'',repoUrl:p.repoUrl||'',platform:p.platform||'',revenue:p.revenue||0,costs:p.costs||0,startDate:p.startDate||today(),color:p.color||''}); setEditingProj(p); setModalProj(true); };
  const delProj=(id)=>{
    if(!window.confirm('¿Eliminar este proyecto?')) return;
    const upd=sideProjects.filter(p=>p.id!==id); setData(d=>({...d,sideProjects:upd})); save('sideProjects',upd);
    if(selProj?.id===id) setSelProj(null);
    toast.warn('Proyecto eliminado');
  };
  const updateStatus=(id,status)=>{
    const upd=sideProjects.map(p=>p.id===id?{...p,status}:p);
    setData(d=>({...d,sideProjects:upd})); save('sideProjects',upd);
    setSelProj(p=>p?.id===id?{...p,status}:p);
    toast.success('Estado actualizado');
  };

  // ── TASK actions ──
  const saveTask=()=>{
    if(!taskForm.title.trim()) return;
    const t={id:uid(),...taskForm,createdAt:today()};
    const upd=[...spTasks,t]; setData(d=>({...d,spTasks:upd})); save('spTasks',upd);
    setModalTask(false); setTaskForm({projectId:selProj?.id||'',title:'',priority:'media',dueDate:'',done:false});
    toast.success('Tarea agregada');
  };
  const toggleTask=(id)=>{
    const upd=spTasks.map(t=>t.id===id?{...t,done:!t.done}:t);
    setData(d=>({...d,spTasks:upd})); save('spTasks',upd);
  };
  const delTask=(id)=>{
    const upd=spTasks.filter(t=>t.id!==id); setData(d=>({...d,spTasks:upd})); save('spTasks',upd);
  };

  // ── MILESTONE actions ──
  const saveMile=()=>{
    if(!mileForm.title.trim()) return;
    const m={id:uid(),...mileForm,done:false}; const upd=[...milestones,m];
    setData(d=>({...d,milestones:upd})); save('milestones',upd);
    setModalMile(false); setMileForm({projectId:selProj?.id||'',title:'',date:today(),notes:''});
    toast.success('Hito registrado');
  };
  const toggleMile=(id)=>{
    const upd=milestones.map(m=>m.id===id?{...m,done:!m.done}:m);
    setData(d=>({...d,milestones:upd})); save('milestones',upd);
  };
  const delMile=(id)=>{
    const upd=milestones.filter(m=>m.id!==id); setData(d=>({...d,milestones:upd})); save('milestones',upd);
  };

  // ── TIME LOG actions ──
  const saveTimeLog=()=>{
    if(!timeForm.hours||!timeForm.projectId) return;
    const log={id:uid(),...timeForm,hours:parseFloat(timeForm.hours)||0};
    const upd=[log,...timeLogs]; setData(d=>({...d,spTimeLogs:upd})); save('spTimeLogs',upd);
    setModalTime(false); setTimeForm({projectId:selProj?.id||'',hours:'',note:'',date:today()});
    toast.success(`${timeForm.hours}h registradas`);
  };
  const delTimeLog=(id)=>{
    const upd=timeLogs.filter(t=>t.id!==id); setData(d=>({...d,spTimeLogs:upd})); save('spTimeLogs',upd);
  };

  // ── COMPUTED ──
  const projHours=(projId)=>timeLogs.filter(t=>t.projectId===projId).reduce((s,t)=>s+(t.hours||0),0);
  const thisWeekHours=(projId)=>{
    const wkAgo=new Date(); wkAgo.setDate(wkAgo.getDate()-7);
    const wkStr=wkAgo.toISOString().slice(0,10);
    return timeLogs.filter(t=>t.projectId===projId&&t.date>=wkStr).reduce((s,t)=>s+(t.hours||0),0);
  };
  const projMilestones=(projId)=>milestones.filter(m=>m.projectId===projId).sort((a,b)=>a.date.localeCompare(b.date));
  const milestonePct=(projId)=>{
    const ms=projMilestones(projId); if(!ms.length) return null;
    return Math.round(ms.filter(m=>m.done).length/ms.length*100);
  };

  // ── FILTERED PROJECTS ──
  const filteredProjs = projFilter==='all' ? sideProjects : sideProjects.filter(p=>p.status===projFilter);

  return (
    <div style={{maxWidth:800,margin:'0 auto',padding:isMobile?'0 0 80px':'0 0 40px'}}>
      {/* Header */}
      <div style={{display:'flex',alignItems:'center',gap:12,padding:'16px 20px',borderBottom:`1px solid ${T.border}`}}>
        {isMobile&&<button onClick={onBack} style={{background:'none',border:'none',color:T.muted,cursor:'pointer',padding:4}}><Icon name="chevron-left" size={20}/></button>}
        <div style={{flex:1}}>
          <div style={{fontSize:18,fontWeight:700,color:T.text,letterSpacing:-0.5}}>🚀 Side Projects</div>
          <div style={{fontSize:12,color:T.muted,marginTop:2}}>{sideProjects.length} proyectos · {pendingTasks.length} tareas pendientes</div>
        </div>
        <Btn size="sm" onClick={()=>{setEditingProj(null);setProjForm({name:'',description:'',status:'idea',stack:'',url:'',repoUrl:'',platform:'',revenue:0,costs:0,startDate:today(),color:''});setModalProj(true);}}><Icon name="plus" size={13}/>Proyecto</Btn>
      </div>

      {/* Summary cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,padding:'16px 20px'}}>
        {[
          {label:'Activos',val:activeProjs.length,color:T.accent,icon:'⚡'},
          {label:'Lanzados',val:launchedProjs.length,color:T.green,icon:'🚀'},
          {label:'Pendientes',val:pendingTasks.length,color:T.orange,icon:'📋'},
          {label:'Hoy',val:todayTasks.length,color:T.red,icon:'🔥'},
        ].map(s=>(
          <Card key={s.label} style={{textAlign:'center',padding:12}}>
            <div style={{fontSize:16,marginBottom:4}}>{s.icon}</div>
            <div style={{fontSize:isMobile?20:24,fontWeight:700,color:s.color}}>{s.val}</div>
            <div style={{fontSize:11,color:T.muted,marginTop:2}}>{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:8,padding:'0 20px 16px',flexWrap:'wrap'}}>
        {[{id:'proyectos',label:'🗂️ Proyectos'},{id:'tareas',label:'✅ Tareas'},{id:'hitos',label:'🏆 Hitos'},{id:'tiempo',label:'⏱️ Tiempo'},{id:'roadmap',label:'🗺️ Roadmap'}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{padding:'7px 16px',borderRadius:10,border:`1px solid ${tab===t.id?T.accent:T.border}`,background:tab===t.id?`${T.accent}18`:'transparent',color:tab===t.id?T.accent:T.muted,cursor:'pointer',fontSize:13,fontWeight:600,fontFamily:'inherit'}}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{padding:'0 20px'}}>

      {/* ══════════ PROYECTOS ══════════ */}
      {tab==='proyectos'&&(
        <div>
          {/* Status filter */}
          <div style={{display:'flex',gap:6,marginBottom:12,flexWrap:'wrap'}}>
            {[{id:'all',label:'Todos'},...STATUSES].map(s=>(
              <button key={s.id} onClick={()=>setProjFilter(s.id)}
                style={{padding:'4px 12px',borderRadius:8,border:`1px solid ${projFilter===s.id?T.accent:T.border}`,background:projFilter===s.id?`${T.accent}18`:'transparent',color:projFilter===s.id?T.accent:T.muted,cursor:'pointer',fontSize:11,fontFamily:'inherit'}}>
                {s.emoji||''} {s.label}
              </button>
            ))}
          </div>

          {filteredProjs.length===0
            ?<div style={{textAlign:'center',padding:'40px 0',color:T.dim}}>
               <div style={{fontSize:36,marginBottom:8}}>🚀</div>
               <div style={{fontSize:14,marginBottom:12}}>Sin proyectos{projFilter!=='all'?' con este estado':''}</div>
               <Btn size="sm" onClick={()=>setModalProj(true)}><Icon name="plus" size={13}/>Crear proyecto</Btn>
             </div>
            :filteredProjs.map(p=>{
              const si=statusInfo(p.status);
              const hours=projHours(p.id);
              const weekH=thisWeekHours(p.id);
              const msPct=milestonePct(p.id);
              const isSel=selProj?.id===p.id;
              return (
                <div key={p.id} style={{marginBottom:10}}>
                  <Card style={{border:`1px solid ${isSel?p.color||T.accent:T.border}`,borderLeft:`3px solid ${p.color||T.accent}`,cursor:'pointer'}}
                    onClick={()=>setSelProj(isSel?null:p)}>
                    <div style={{display:'flex',alignItems:'flex-start',gap:10}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                          <span style={{color:T.text,fontWeight:700,fontSize:14}}>{p.name}</span>
                          <span style={{fontSize:11,fontWeight:600,color:si.color,background:`${si.color}18`,padding:'2px 8px',borderRadius:6}}>{si.emoji} {si.label}</span>
                        </div>
                        {p.description&&<div style={{color:T.muted,fontSize:12,marginTop:4,lineHeight:1.5}}>{p.description}</div>}
                        <div style={{display:'flex',gap:12,marginTop:6,flexWrap:'wrap'}}>
                          {hours>0&&<span style={{fontSize:11,color:T.muted}}>⏱️ {hours.toFixed(1)}h total</span>}
                          {weekH>0&&<span style={{fontSize:11,color:T.accent}}>🔥 {weekH.toFixed(1)}h esta semana</span>}
                          {p.revenue>0&&<span style={{fontSize:11,color:T.green}}>💰 ${Number(p.revenue).toLocaleString()}</span>}
                          {p.costs>0&&<span style={{fontSize:11,color:T.red}}>💸 -${Number(p.costs).toLocaleString()}</span>}
                          {p.stack&&<span style={{fontSize:11,color:T.muted}}>🛠️ {p.stack}</span>}
                        </div>
                        {msPct!==null&&(
                          <div style={{marginTop:8}}>
                            <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                              <span style={{fontSize:10,color:T.muted}}>Milestones</span>
                              <span style={{fontSize:10,fontWeight:700,color:p.color||T.accent}}>{msPct}%</span>
                            </div>
                            <div style={{height:3,background:T.border,borderRadius:2,overflow:'hidden'}}>
                              <div style={{height:'100%',width:`${msPct}%`,background:p.color||T.accent,borderRadius:2,transition:'width 0.5s'}}/>
                            </div>
                          </div>
                        )}
                      </div>
                      <div style={{display:'flex',gap:4,flexShrink:0}}>
                        <button onClick={e=>{e.stopPropagation();openEditProj(p);}} style={{background:'none',border:`1px solid ${T.border}`,borderRadius:7,padding:'3px 8px',cursor:'pointer',color:T.muted,fontSize:11,fontFamily:'inherit'}}>✏️</button>
                        <button onClick={e=>{e.stopPropagation();delProj(p.id);}} style={{background:'none',border:'none',color:T.dim,cursor:'pointer',padding:4,display:'flex'}}><Icon name="trash" size={13}/></button>
                      </div>
                    </div>
                  </Card>

                  {/* Expanded: deployment + milestone roadmap + quick actions */}
                  {isSel&&(
                    <div style={{background:T.surface2,border:`1px solid ${T.border}`,borderTop:'none',borderRadius:'0 0 12px 12px',padding:'14px 16px'}}>
                      {/* Deployment info */}
                      {(p.url||p.repoUrl||p.platform)&&(
                        <div style={{marginBottom:12}}>
                          <div style={{fontSize:10,fontWeight:700,color:T.muted,textTransform:'uppercase',letterSpacing:0.8,marginBottom:6}}>🚀 Despliegue</div>
                          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                            {p.url&&<a href={p.url.startsWith('http')?p.url:`https://${p.url}`} target="_blank" rel="noreferrer" style={{display:'flex',alignItems:'center',gap:5,padding:'5px 10px',background:`${T.accent}12`,border:`1px solid ${T.accent}30`,borderRadius:7,color:T.accent,fontSize:11,fontWeight:600,textDecoration:'none'}}>🌐 {p.url}</a>}
                            {p.repoUrl&&<a href={p.repoUrl.startsWith('http')?p.repoUrl:`https://${p.repoUrl}`} target="_blank" rel="noreferrer" style={{display:'flex',alignItems:'center',gap:5,padding:'5px 10px',background:`${T.purple}12`,border:`1px solid ${T.purple}30`,borderRadius:7,color:T.purple,fontSize:11,fontWeight:600,textDecoration:'none'}}>📦 {p.repoUrl.replace('https://','')}</a>}
                            {p.platform&&<span style={{display:'flex',alignItems:'center',gap:5,padding:'5px 10px',background:`${T.blue}12`,border:`1px solid ${T.blue}30`,borderRadius:7,color:T.blue,fontSize:11,fontWeight:600}}>☁️ {p.platform}</span>}
                          </div>
                        </div>
                      )}

                      {/* Milestone roadmap */}
                      {projMilestones(p.id).length>0&&(
                        <div style={{marginBottom:12}}>
                          <div style={{fontSize:10,fontWeight:700,color:T.muted,textTransform:'uppercase',letterSpacing:0.8,marginBottom:8}}>🗺️ Roadmap</div>
                          <div style={{position:'relative',paddingLeft:22}}>
                            <div style={{position:'absolute',left:8,top:6,bottom:6,width:2,background:T.border,borderRadius:1}}/>
                            {projMilestones(p.id).map((m,idx)=>(
                              <div key={m.id} style={{display:'flex',alignItems:'flex-start',gap:10,marginBottom:idx<projMilestones(p.id).length-1?10:0,position:'relative'}}>
                                <button onClick={()=>toggleMile(m.id)} style={{position:'absolute',left:-22,top:0,width:18,height:18,borderRadius:'50%',background:m.done?p.color||T.accent:T.surface2,border:`2px solid ${m.done?p.color||T.accent:T.border}`,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',padding:0,flexShrink:0}}>
                                  {m.done&&<span style={{color:'#000',fontSize:8,fontWeight:900}}>✓</span>}
                                </button>
                                <div style={{flex:1}}>
                                  <div style={{fontSize:12,color:m.done?T.muted:T.text,fontWeight:m.done?400:600,textDecoration:m.done?'line-through':'none'}}>{m.title}</div>
                                  <div style={{fontSize:10,color:T.dim,marginTop:1}}>{fmtDate(m.date)}</div>
                                </div>
                                <button onClick={()=>delMile(m.id)} style={{background:'none',border:'none',color:T.dim,cursor:'pointer',padding:2}}><Icon name="trash" size={10}/></button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Quick actions */}
                      <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                        <button onClick={()=>{setMileForm({projectId:p.id,title:'',date:today(),notes:''});setModalMile(true);}} style={{padding:'5px 11px',borderRadius:8,border:`1px solid ${T.border}`,background:'transparent',color:T.muted,cursor:'pointer',fontSize:11,fontFamily:'inherit'}}>+ Hito</button>
                        <button onClick={()=>{setTaskForm({projectId:p.id,title:'',priority:'media',dueDate:'',done:false});setModalTask(true);}} style={{padding:'5px 11px',borderRadius:8,border:`1px solid ${T.border}`,background:'transparent',color:T.muted,cursor:'pointer',fontSize:11,fontFamily:'inherit'}}>+ Tarea</button>
                        <button onClick={()=>{setTimeForm({projectId:p.id,hours:'',note:'',date:today()});setModalTime(true);}} style={{padding:'5px 11px',borderRadius:8,border:`1px solid ${T.accent}`,background:`${T.accent}12`,color:T.accent,cursor:'pointer',fontSize:11,fontWeight:700,fontFamily:'inherit'}}>⏱️ Registrar tiempo</button>
                        {STATUSES.map(s=>s.id!==p.status&&(
                          <button key={s.id} onClick={()=>updateStatus(p.id,s.id)} style={{padding:'5px 11px',borderRadius:8,border:`1px solid ${s.color}40`,background:`${s.color}10`,color:s.color,cursor:'pointer',fontSize:11,fontFamily:'inherit'}}>{s.emoji} {s.label}</button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          }
        </div>
      )}

      {/* ══════════ TAREAS ══════════ */}
      {tab==='tareas'&&(
        <div>
          <div style={{display:'flex',justifyContent:'flex-end',marginBottom:12}}>
            <Btn size="sm" onClick={()=>{setTaskForm({projectId:selProj?.id||'',title:'',priority:'media',dueDate:'',done:false});setModalTask(true);}}><Icon name="plus" size={13}/>Nueva tarea</Btn>
          </div>
          {spTasks.length===0
            ?<div style={{textAlign:'center',padding:'40px 0',color:T.dim}}>
               <div style={{fontSize:36,marginBottom:8}}>✅</div>
               <div style={{fontSize:14,marginBottom:12}}>Sin tareas registradas</div>
               <Btn size="sm" onClick={()=>setModalTask(true)}><Icon name="plus" size={13}/>Agregar tarea</Btn>
             </div>
            :[...spTasks].sort((a,b)=>(a.done?1:-1)||(a.dueDate||'z').localeCompare(b.dueDate||'z')).map(t=>{
              const proj=sideProjects.find(p=>p.id===t.projectId);
              return (
                <div key={t.id} style={{display:'flex',gap:10,padding:'12px 14px',background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,marginBottom:8,opacity:t.done?0.6:1}}>
                  <button onClick={()=>toggleTask(t.id)} style={{width:20,height:20,borderRadius:6,border:`2px solid ${priorityColor(t.priority)}`,background:t.done?priorityColor(t.priority):'transparent',cursor:'pointer',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',marginTop:2}}>
                    {t.done&&<Icon name="check" size={11} color="#000"/>}
                  </button>
                  <div style={{flex:1}}>
                    <div style={{color:T.text,fontSize:13,fontWeight:600,textDecoration:t.done?'line-through':'none'}}>{t.title}</div>
                    <div style={{display:'flex',gap:8,marginTop:3,flexWrap:'wrap'}}>
                      {proj&&<span style={{fontSize:10,color:proj.color||T.accent,background:`${proj.color||T.accent}15`,padding:'1px 7px',borderRadius:6}}>{proj.name}</span>}
                      {t.dueDate&&<span style={{fontSize:10,color:t.dueDate<today()?T.red:T.muted}}>📅 {fmtDate(t.dueDate)}</span>}
                    </div>
                  </div>
                  <button onClick={()=>delTask(t.id)} style={{background:'none',border:'none',color:T.dim,cursor:'pointer',padding:4,display:'flex',flexShrink:0}}><Icon name="trash" size={13}/></button>
                </div>
              );
            })
          }
        </div>
      )}

      {/* ══════════ HITOS ══════════ */}
      {tab==='hitos'&&(
        <div>
          {/* project filter */}
          {sideProjects.length>0&&(
            <div style={{display:'flex',gap:6,marginBottom:14,flexWrap:'wrap'}}>
              <button onClick={()=>setSelProj(null)}
                style={{padding:'5px 12px',borderRadius:8,border:`1px solid ${!selProj?T.accent:T.border}`,background:!selProj?`${T.accent}18`:'transparent',color:!selProj?T.accent:T.muted,cursor:'pointer',fontSize:12,fontFamily:'inherit'}}>
                Todos
              </button>
              {sideProjects.map(p=>(
                <button key={p.id} onClick={()=>setSelProj(selProj?.id===p.id?null:p)}
                  style={{padding:'5px 12px',borderRadius:8,border:`1px solid ${selProj?.id===p.id?p.color||T.accent:T.border}`,background:selProj?.id===p.id?`${p.color||T.accent}18`:'transparent',color:selProj?.id===p.id?p.color||T.accent:T.muted,cursor:'pointer',fontSize:12,fontFamily:'inherit'}}>
                  {p.name}
                </button>
              ))}
            </div>
          )}

          {(()=>{
            const filtered=selProj?milestones.filter(m=>m.projectId===selProj.id):milestones;
            if(filtered.length===0) return (
              <div style={{textAlign:'center',padding:'40px 0',color:T.dim}}>
                <div style={{fontSize:36,marginBottom:8}}>🏆</div>
                <div style={{fontSize:14,marginBottom:12}}>Sin hitos registrados</div>
                <Btn size="sm" onClick={()=>{setMileForm({projectId:selProj?.id||'',title:'',date:today(),notes:''});setModalMile(true);}}><Icon name="plus" size={13}/>Registrar hito</Btn>
              </div>
            );
            return [...filtered].sort((a,b)=>b.date.localeCompare(a.date)).map(m=>{
              const proj=sideProjects.find(p=>p.id===m.projectId);
              return (
                <div key={m.id} style={{display:'flex',gap:12,padding:'14px 16px',background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,marginBottom:10,borderLeft:`3px solid ${proj?.color||T.purple}`,opacity:m.done?0.7:1}}>
                  <button onClick={()=>toggleMile(m.id)} style={{width:22,height:22,borderRadius:'50%',border:`2px solid ${m.done?proj?.color||T.accent:T.border}`,background:m.done?proj?.color||T.accent:'transparent',cursor:'pointer',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',marginTop:2}}>
                    {m.done&&<Icon name="check" size={11} color="#000"/>}
                  </button>
                  <div style={{flex:1}}>
                    <div style={{color:T.text,fontSize:14,fontWeight:600,textDecoration:m.done?'line-through':'none'}}>{m.title}</div>
                    <div style={{display:'flex',gap:10,marginTop:4,flexWrap:'wrap'}}>
                      {proj&&<span style={{fontSize:11,color:proj.color||T.purple,background:`${proj.color||T.purple}15`,padding:'2px 8px',borderRadius:8}}>{proj.name}</span>}
                      <span style={{fontSize:11,color:T.muted}}>📅 {fmtDate(m.date)}</span>
                    </div>
                    {m.notes&&<div style={{color:T.muted,fontSize:12,marginTop:6,lineHeight:1.5}}>{m.notes}</div>}
                  </div>
                  <button onClick={()=>delMile(m.id)} style={{background:'none',border:'none',color:T.dim,cursor:'pointer',padding:4,display:'flex',flexShrink:0,alignSelf:'flex-start'}}><Icon name="trash" size={13}/></button>
                </div>
              );
            });
          })()}
        </div>
      )}

      {/* ══════════ TIEMPO ══════════ */}
      {tab==='tiempo'&&(
        <div>
          {/* per-project summary */}
          {sideProjects.length>0&&(
            <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:16}}>
              {sideProjects.map(p=>{
                const total=projHours(p.id);
                const week=thisWeekHours(p.id);
                const projLogs=timeLogs.filter(t=>t.projectId===p.id).slice(0,3);
                return (
                  <Card key={p.id} style={{borderLeft:`3px solid ${p.color||T.accent}`}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:projLogs.length?10:0}}>
                      <div>
                        <div style={{fontSize:13,fontWeight:700,color:T.text}}>{p.name}</div>
                        <div style={{display:'flex',gap:10,marginTop:3}}>
                          <span style={{fontSize:11,color:T.muted}}>⏱️ {total.toFixed(1)}h total</span>
                          {week>0&&<span style={{fontSize:11,color:T.accent}}>🔥 {week.toFixed(1)}h esta semana</span>}
                        </div>
                      </div>
                      <button onClick={()=>{setTimeForm({projectId:p.id,hours:'',note:'',date:today()});setModalTime(true);}} style={{padding:'6px 12px',borderRadius:8,border:`1px solid ${T.accent}`,background:`${T.accent}12`,color:T.accent,cursor:'pointer',fontSize:11,fontWeight:700,fontFamily:'inherit'}}>+ Tiempo</button>
                    </div>
                    {projLogs.map(log=>(
                      <div key={log.id} style={{display:'flex',gap:8,padding:'6px 0',borderTop:`1px solid ${T.border}`,alignItems:'flex-start'}}>
                        <span style={{fontSize:11,color:p.color||T.accent,fontWeight:700,minWidth:30}}>{log.hours}h</span>
                        <div style={{flex:1}}>
                          <div style={{fontSize:12,color:T.text}}>{log.note||'Sin nota'}</div>
                          <div style={{fontSize:10,color:T.dim,marginTop:1}}>{log.date}</div>
                        </div>
                        <button onClick={()=>delTimeLog(log.id)} style={{background:'none',border:'none',color:T.dim,cursor:'pointer',padding:2}}><Icon name="trash" size={11}/></button>
                      </div>
                    ))}
                  </Card>
                );
              })}
            </div>
          )}

          {timeLogs.length===0&&(
            <div style={{textAlign:'center',padding:'40px 0',color:T.dim}}>
              <div style={{fontSize:36,marginBottom:8}}>⏱️</div>
              <div style={{fontSize:14,marginBottom:12}}>Sin registros de tiempo aún</div>
              <Btn size="sm" onClick={()=>{setTimeForm({projectId:sideProjects[0]?.id||'',hours:'',note:'',date:today()});setModalTime(true);}}><Icon name="plus" size={13}/>Registrar tiempo</Btn>
            </div>
          )}
        </div>
      )}

      {/* ══════════ ROADMAP ══════════ */}
      {tab==='roadmap'&&(
        <div>
          {sideProjects.length===0
            ?<div style={{textAlign:'center',padding:'40px 0',color:T.dim}}>
               <div style={{fontSize:36,marginBottom:8}}>🗺️</div>
               <div style={{fontSize:14,marginBottom:12}}>Sin proyectos para mostrar</div>
               <Btn size="sm" onClick={()=>setModalProj(true)}><Icon name="plus" size={13}/>Crear proyecto</Btn>
             </div>
            :(()=>{
              // Build date range: from earliest startDate to today+1mo
              const allDates=[...sideProjects.map(p=>p.startDate).filter(Boolean),...milestones.map(m=>m.date).filter(Boolean)];
              const minDate=allDates.sort()[0]||today().slice(0,7)+'-01';
              const maxDateRaw=new Date(); maxDateRaw.setMonth(maxDateRaw.getMonth()+1);
              const maxDate=maxDateRaw.toISOString().slice(0,10);

              const msToNum=(d)=>new Date(d+'T00:00:00').getTime();
              const rangeMs=msToNum(maxDate)-msToNum(minDate)||1;
              const pct=(d)=>Math.max(0,Math.min(100,(msToNum(d)-msToNum(minDate))/rangeMs*100));

              // Build month axis labels
              const months=[];
              const cur=new Date(minDate+'T00:00:00');
              const end=new Date(maxDate+'T00:00:00');
              while(cur<=end){
                months.push({label:cur.toLocaleDateString('es-ES',{month:'short',year:'2-digit'}),pct:pct(cur.toISOString().slice(0,10))});
                cur.setMonth(cur.getMonth()+1);
              }

              const todayPct=pct(today());
              const STATUS_COLORS={idea:T.muted,progress:T.accent,paused:T.orange,launched:T.green,archived:T.dim};

              return (
                <div>
                  {/* Legend */}
                  <div style={{display:'flex',gap:12,marginBottom:16,flexWrap:'wrap'}}>
                    {Object.entries({idea:'💡 Idea',progress:'⚡ En progreso',paused:'⏸️ Pausado',launched:'🚀 Lanzado',archived:'📦 Archivado'}).map(([k,v])=>(
                      <div key={k} style={{display:'flex',alignItems:'center',gap:5,fontSize:11,color:T.muted}}>
                        <div style={{width:12,height:4,borderRadius:2,background:STATUS_COLORS[k]}}/>
                        {v}
                      </div>
                    ))}
                    <div style={{display:'flex',alignItems:'center',gap:5,fontSize:11,color:T.muted}}>
                      <div style={{width:8,height:8,borderRadius:'50%',background:T.yellow}}/>
                      Milestone
                    </div>
                  </div>

                  {/* Chart */}
                  <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,overflow:'hidden'}}>

                    {/* Month axis header */}
                    <div style={{position:'relative',height:28,borderBottom:`1px solid ${T.border}`,marginLeft:isMobile?100:140}}>
                      {months.map((m,i)=>(
                        <div key={i} style={{position:'absolute',left:`${m.pct}%`,top:0,bottom:0,display:'flex',alignItems:'center'}}>
                          <div style={{width:1,height:'100%',background:T.border,position:'absolute'}}/>
                          <span style={{fontSize:9,color:T.dim,position:'absolute',left:3,whiteSpace:'nowrap'}}>{m.label}</span>
                        </div>
                      ))}
                      {/* Today line header */}
                      <div style={{position:'absolute',left:`${todayPct}%`,top:0,bottom:0,borderLeft:`2px dashed ${T.accent}60`}}/>
                    </div>

                    {/* Project rows */}
                    {[...sideProjects].sort((a,b)=>(a.startDate||'9999').localeCompare(b.startDate||'9999')).map((p,pi)=>{
                      const color=p.color||STATUS_COLORS[p.status]||T.accent;
                      const start=p.startDate||today();
                      const end=p.status==='launched'&&p.launchDate?p.launchDate:today();
                      const startPct=pct(start);
                      const endPct=Math.max(startPct+1,pct(end));
                      const pMiles=milestones.filter(m=>m.projectId===p.id);
                      const isHov=roadmapHover===p.id;

                      return (
                        <div key={p.id}
                          style={{display:'flex',alignItems:'center',minHeight:44,borderBottom:pi<sideProjects.length-1?`1px solid ${T.border}`:'none',background:isHov?`${T.accent}05`:'transparent',transition:'background 0.15s',cursor:'pointer'}}
                          onClick={()=>setSelProj(selProj?.id===p.id?null:p)}
                          onMouseEnter={()=>setRoadmapHover(p.id)}
                          onMouseLeave={()=>setRoadmapHover(null)}>

                          {/* Project name */}
                          <div style={{width:isMobile?100:140,flexShrink:0,padding:'0 12px',display:'flex',alignItems:'center',gap:8,borderRight:`1px solid ${T.border}`}}>
                            <div style={{width:8,height:8,borderRadius:'50%',background:color,flexShrink:0}}/>
                            <span style={{fontSize:isMobile?10:12,color:T.text,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1}}>{p.name}</span>
                          </div>

                          {/* Bar area */}
                          <div style={{flex:1,position:'relative',height:44}}>
                            {/* Grid lines */}
                            {months.map((m,i)=>(
                              <div key={i} style={{position:'absolute',left:`${m.pct}%`,top:0,bottom:0,width:1,background:`${T.border}60`}}/>
                            ))}
                            {/* Today dashed line */}
                            <div style={{position:'absolute',left:`${todayPct}%`,top:0,bottom:0,borderLeft:`2px dashed ${T.accent}50`,zIndex:1}}/>

                            {/* Project bar */}
                            <div
                              style={{
                                position:'absolute',
                                left:`${startPct}%`,
                                width:`${Math.max(1,endPct-startPct)}%`,
                                top:'50%',transform:'translateY(-50%)',
                                height:isHov?20:16,borderRadius:5,
                                background:color,
                                opacity:p.status==='archived'?0.4:0.85,
                                zIndex:2,transition:'height 0.15s',
                              }}
                              title={`${p.name} · ${start} → ${end}`}/>

                            {/* Milestone dots */}
                            {pMiles.map(m=>{
                              const mp=pct(m.date);
                              return (
                                <div key={m.id}
                                  title={`${m.title} · ${m.date}`}
                                  style={{
                                    position:'absolute',left:`${mp}%`,
                                    top:'50%',transform:'translate(-50%,-50%)',
                                    width:10,height:10,borderRadius:'50%',
                                    background:m.done?T.yellow:T.surface,
                                    border:`2px solid ${T.yellow}`,
                                    zIndex:3,cursor:'default',
                                    boxShadow:m.done?`0 0 6px ${T.yellow}60`:'none',
                                  }}/>
                              );
                            })}

                            {/* Status badge at end of bar */}
                            {!isMobile&&(
                              <div style={{
                                position:'absolute',left:`${endPct}%`,
                                top:'50%',transform:'translateY(-50%)',
                                marginLeft:4,zIndex:3,
                                fontSize:10,color:color,fontWeight:600,whiteSpace:'nowrap',
                              }}>
                                {statusInfo(p.status).emoji}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Selected project detail */}
                  {selProj&&(
                    <Card style={{marginTop:14,borderLeft:`3px solid ${selProj.color||T.accent}`}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                        <div>
                          <div style={{color:T.text,fontWeight:700,fontSize:15}}>{selProj.name}</div>
                          <div style={{color:T.muted,fontSize:12,marginTop:3,display:'flex',gap:10,flexWrap:'wrap'}}>
                            {selProj.startDate&&<span>🗓 Inicio: {fmtDate(selProj.startDate)}</span>}
                            {selProj.stack&&<span>🛠 {selProj.stack}</span>}
                            <span style={{color:STATUS_COLORS[selProj.status],fontWeight:600}}>{statusInfo(selProj.status).emoji} {statusInfo(selProj.status).label}</span>
                          </div>
                        </div>
                        <button onClick={()=>setSelProj(null)} style={{background:'none',border:'none',color:T.dim,cursor:'pointer',fontSize:16,padding:2}}>✕</button>
                      </div>
                      {selProj.description&&<div style={{color:T.muted,fontSize:12,lineHeight:1.6,marginBottom:8}}>{selProj.description}</div>}
                      {milestones.filter(m=>m.projectId===selProj.id).length>0&&(
                        <div>
                          <div style={{fontSize:11,fontWeight:600,color:T.muted,marginBottom:6,textTransform:'uppercase',letterSpacing:0.5}}>Milestones</div>
                          {[...milestones.filter(m=>m.projectId===selProj.id)].sort((a,b)=>a.date.localeCompare(b.date)).map(m=>(
                            <div key={m.id} style={{display:'flex',alignItems:'center',gap:8,padding:'4px 0',borderBottom:`1px solid ${T.border}`}}>
                              <div style={{width:8,height:8,borderRadius:'50%',background:m.done?T.yellow:T.dim,flexShrink:0}}/>
                              <span style={{flex:1,fontSize:12,color:m.done?T.muted:T.text,textDecoration:m.done?'line-through':'none'}}>{m.title}</span>
                              <span style={{fontSize:10,color:T.dim}}>{fmtDate(m.date)}</span>
                              {m.done&&<span style={{fontSize:10,color:T.yellow}}>✓</span>}
                            </div>
                          ))}
                        </div>
                      )}
                      <div style={{display:'flex',gap:8,marginTop:12}}>
                        <Btn size="sm" onClick={()=>openEditProj(selProj)}>✏️ Editar</Btn>
                        {selProj.url&&<a href={selProj.url} target="_blank" rel="noreferrer" style={{display:'inline-flex',alignItems:'center',gap:5,padding:'5px 12px',background:`${T.green}15`,border:`1px solid ${T.green}30`,borderRadius:8,color:T.green,fontSize:11,fontWeight:600,textDecoration:'none'}}>🔗 Ver</a>}
                        <Btn size="sm" variant="ghost" onClick={()=>{setMileForm({projectId:selProj.id,title:'',date:today(),notes:''});setModalMile(true);}}>🏆 Hito</Btn>
                      </div>
                    </Card>
                  )}
                </div>
              );
            })()
          }
        </div>
      )}

      </div>{/* end padding wrapper */}

      {/* ══════════ MODALES ══════════ */}
      {modalProj&&(
        <Modal title={editingProj?'Editar proyecto':'Nuevo proyecto'} onClose={()=>{setModalProj(false);setEditingProj(null);}}>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <Input value={projForm.name} onChange={v=>setProjForm(f=>({...f,name:v}))} placeholder="Nombre del proyecto"/>
            <Textarea value={projForm.description} onChange={v=>setProjForm(f=>({...f,description:v}))} placeholder="¿De qué trata? ¿Qué problema resuelve?" rows={3}/>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <Select value={projForm.status} onChange={v=>setProjForm(f=>({...f,status:v}))}>
                {STATUSES.map(s=><option key={s.id} value={s.id}>{s.emoji} {s.label}</option>)}
              </Select>
              <Input value={projForm.startDate} onChange={v=>setProjForm(f=>({...f,startDate:v}))} type="date"/>
            </div>
            <Input value={projForm.stack} onChange={v=>setProjForm(f=>({...f,stack:v}))} placeholder="Stack / Herramientas (ej: React, Notion, Figma...)"/>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
              <Input value={projForm.url} onChange={v=>setProjForm(f=>({...f,url:v}))} placeholder="URL publicado"/>
              <Input value={projForm.repoUrl} onChange={v=>setProjForm(f=>({...f,repoUrl:v}))} placeholder="Repositorio"/>
              <Input value={projForm.platform} onChange={v=>setProjForm(f=>({...f,platform:v}))} placeholder="Plataforma"/>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <Input value={projForm.revenue} onChange={v=>setProjForm(f=>({...f,revenue:v}))} placeholder="Ingresos $" type="number"/>
              <Input value={projForm.costs} onChange={v=>setProjForm(f=>({...f,costs:v}))} placeholder="Costos $" type="number"/>
            </div>
            <div>
              <div style={{fontSize:12,color:T.muted,marginBottom:6}}>Color</div>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                {COLORS.map(c=>(
                  <button key={c} onClick={()=>setProjForm(f=>({...f,color:c}))}
                    style={{width:28,height:28,borderRadius:8,background:c,border:`3px solid ${projForm.color===c?T.text:'transparent'}`,cursor:'pointer'}}/>
                ))}
              </div>
            </div>
          </div>
          <div style={{display:'flex',gap:10,marginTop:20}}>
            <Btn onClick={saveProj} style={{flex:1,justifyContent:'center'}}>{editingProj?'Guardar cambios':'Crear proyecto'}</Btn>
            <Btn variant="ghost" onClick={()=>{setModalProj(false);setEditingProj(null);}}>Cancelar</Btn>
          </div>
        </Modal>
      )}

      {modalTask&&(
        <Modal title="Nueva tarea" onClose={()=>setModalTask(false)}>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <Select value={taskForm.projectId} onChange={v=>setTaskForm(f=>({...f,projectId:v}))}>
              <option value="">— Proyecto —</option>
              {sideProjects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
            <Input value={taskForm.title} onChange={v=>setTaskForm(f=>({...f,title:v}))} placeholder="¿Qué hay que hacer?"/>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <Select value={taskForm.priority} onChange={v=>setTaskForm(f=>({...f,priority:v}))}>
                <option value="baja">🟢 Baja</option>
                <option value="media">🟡 Media</option>
                <option value="alta">🔴 Alta</option>
              </Select>
              <Input value={taskForm.dueDate} onChange={v=>setTaskForm(f=>({...f,dueDate:v}))} type="date"/>
            </div>
          </div>
          <div style={{display:'flex',gap:10,marginTop:20}}>
            <Btn onClick={saveTask} style={{flex:1,justifyContent:'center'}}>Guardar</Btn>
            <Btn variant="ghost" onClick={()=>setModalTask(false)}>Cancelar</Btn>
          </div>
        </Modal>
      )}

      {modalMile&&(
        <Modal title="Registrar hito" onClose={()=>setModalMile(false)}>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <Select value={mileForm.projectId} onChange={v=>setMileForm(f=>({...f,projectId:v}))}>
              <option value="">— Proyecto —</option>
              {sideProjects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
            <Input value={mileForm.title} onChange={v=>setMileForm(f=>({...f,title:v}))} placeholder="¿Qué lograste? (ej: MVP listo, Primer usuario, $100 MRR...)"/>
            <Input value={mileForm.date} onChange={v=>setMileForm(f=>({...f,date:v}))} type="date"/>
            <Textarea value={mileForm.notes} onChange={v=>setMileForm(f=>({...f,notes:v}))} placeholder="Notas o contexto del hito..." rows={3}/>
          </div>
          <div style={{display:'flex',gap:10,marginTop:20}}>
            <Btn onClick={saveMile} style={{flex:1,justifyContent:'center'}}>Registrar</Btn>
            <Btn variant="ghost" onClick={()=>setModalMile(false)}>Cancelar</Btn>
          </div>
        </Modal>
      )}

      {modalTime&&(
        <Modal title="Registrar tiempo" onClose={()=>setModalTime(false)}>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <Select value={timeForm.projectId} onChange={v=>setTimeForm(f=>({...f,projectId:v}))}>
              <option value="">— Proyecto —</option>
              {sideProjects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <Input value={timeForm.hours} onChange={v=>setTimeForm(f=>({...f,hours:v}))} placeholder="Horas (ej: 1.5)" type="number" step="0.5"/>
              <Input value={timeForm.date} onChange={v=>setTimeForm(f=>({...f,date:v}))} type="date"/>
            </div>
            <Input value={timeForm.note} onChange={v=>setTimeForm(f=>({...f,note:v}))} placeholder="¿En qué trabajaste? (opcional)"/>
          </div>
          <div style={{display:'flex',gap:10,marginTop:20}}>
            <Btn onClick={saveTimeLog} style={{flex:1,justifyContent:'center'}}>Guardar</Btn>
            <Btn variant="ghost" onClick={()=>setModalTime(false)}>Cancelar</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};


// ===================== RELACIONES =====================
const Relaciones = ({data,setData,isMobile,onBack}) => {
  const [tab,setTab]               = useState('personas');
  const [modalPerson,setModalPerson]   = useState(false);
  const [modalFollowUp,setModalFollowUp] = useState(false);
  const [modalInteraction,setModalInteraction] = useState(false);
  const [selPerson,setSelPerson]       = useState(null);
  const [editingPerson,setEditingPerson] = useState(null);
  const [personForm,setPersonForm]     = useState({name:'',relation:'',birthday:'',emoji:'👤',phone:'',email:'',notes:''});
  const [followForm,setFollowForm]     = useState({personId:'',task:'',dueDate:'',priority:'media',done:false});
  const [interForm,setInterForm]       = useState({personId:'',type:'Mensaje',notes:'',date:today()});
  const [personSearch,setPersonSearch] = useState('');
  const [relationFilter,setRelationFilter] = useState('todas');
  const [tlPersonFilter,setTlPersonFilter] = useState('all');
  const [tlTypeFilter,setTlTypeFilter]     = useState('all');

  const people       = data.people||[];
  const followUps    = data.followUps||[];
  const interactions = data.interactions||[];

  // ── helpers ──
  const fmtDate=(d)=>{ try{ return new Date(d+'T12:00:00').toLocaleDateString('es-ES',{day:'2-digit',month:'short',year:'numeric'}); }catch{return d||'—';} };

  const birthdayDaysLeft=(bday)=>{
    if(!bday) return null;
    const now=new Date(); const [,m,d]=bday.split('-');
    const next=new Date(now.getFullYear(),Number(m)-1,Number(d));
    if(next<now) next.setFullYear(now.getFullYear()+1);
    return Math.ceil((next-now)/(1000*60*60*24));
  };

  // ── summary ──
  const upcomingBdays  = people.filter(p=>{ const dl=birthdayDaysLeft(p.birthday); return dl!==null&&dl<=7; });
  const pendingFollows = followUps.filter(f=>!f.done);
  const lastInter      = [...interactions].sort((a,b)=>b.date.localeCompare(a.date))[0];
  const lastInterDays  = lastInter ? Math.floor((new Date()-new Date(lastInter.date+'T12:00:00'))/(1000*60*60*24)) : null;

  // ── PERSON actions ──
  const RELATIONS=['Amigo','Familiar','Pareja','Colega','Mentor','Cliente','Conocido','Otro'];
  const EMOJIS=['👤','👨','👩','👦','👧','🧑','👴','👵','🧔','👨‍💼','👩‍💼','🧑‍💻','👨‍🏫','👩‍🏫'];
  const savePerson=()=>{
    if(!personForm.name.trim()) return;
    const p={id:editingPerson?.id||uid(),...personForm,createdAt:editingPerson?.createdAt||today()};
    const upd=editingPerson?people.map(x=>x.id===p.id?p:x):[p,...people];
    setData(d=>({...d,people:upd})); save('people',upd);
    setModalPerson(false); setEditingPerson(null);
    setPersonForm({name:'',relation:'',birthday:'',emoji:'👤',phone:'',email:'',notes:''});
  };
  const openEditPerson=(p)=>{ setPersonForm({name:p.name,relation:p.relation||'',birthday:p.birthday||'',emoji:p.emoji||'👤',phone:p.phone||'',email:p.email||'',notes:p.notes||''}); setEditingPerson(p); setModalPerson(true); };
  const delPerson=(id)=>{
    if(!window.confirm('¿Eliminar esta persona?')) return;
    const upd=people.filter(p=>p.id!==id); setData(d=>({...d,people:upd})); save('people',upd);
    if(selPerson?.id===id) setSelPerson(null);
  };

  // ── FOLLOWUP actions ──
  const saveFollowUp=()=>{
    if(!followForm.task.trim()) return;
    const f={id:uid(),...followForm,done:false,createdAt:today()};
    const upd=[f,...followUps]; setData(d=>({...d,followUps:upd})); save('followUps',upd);
    setModalFollowUp(false); setFollowForm({personId:selPerson?.id||'',task:'',dueDate:'',priority:'media',done:false});
  };
  const toggleFollowUp=(id)=>{
    const upd=followUps.map(f=>f.id===id?{...f,done:!f.done}:f);
    setData(d=>({...d,followUps:upd})); save('followUps',upd);
  };
  const delFollowUp=(id)=>{ const upd=followUps.filter(f=>f.id!==id); setData(d=>({...d,followUps:upd})); save('followUps',upd); };

  // ── INTERACTION actions ──
  const INTER_TYPES=['Mensaje','Llamada','Videollamada','Comida','Café','Evento','Email','Visita','Otro'];
  const saveInteraction=()=>{
    if(!interForm.personId) return;
    const i={id:uid(),...interForm,createdAt:today()};
    const upd=[i,...interactions]; setData(d=>({...d,interactions:upd})); save('interactions',upd);
    setModalInteraction(false); setInterForm({personId:selPerson?.id||'',type:'Mensaje',notes:'',date:today()});
  };
  const delInteraction=(id)=>{ const upd=interactions.filter(i=>i.id!==id); setData(d=>({...d,interactions:upd})); save('interactions',upd); };

  const personName=(id)=>people.find(p=>p.id===id)?.name||'Desconocido';
  const personEmoji=(id)=>people.find(p=>p.id===id)?.emoji||'👤';

  // ── Export contacts ──
  const exportContactsCSV=()=>{
    const rows=[['Nombre','Relación','Cumpleaños','Teléfono','Email','Notas'],
      ...people.map(p=>[p.name,p.relation||'',p.birthday||'',p.phone||'',p.email||'',(p.notes||'').replace(/,/g,';')])];
    const csv=rows.map(r=>r.map(c=>`"${c}"`).join(',')).join('\n');
    const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);
    a.download='contactos.csv';a.click();
    toast.success(`📥 ${people.length} contactos exportados`);
  };
  const exportContactsVCard=()=>{
    const vcf=people.map(p=>[
      'BEGIN:VCARD','VERSION:3.0',
      `FN:${p.name}`,
      p.phone?`TEL:${p.phone}`:'',
      p.email?`EMAIL:${p.email}`:'',
      p.birthday?`BDAY:${p.birthday.replace(/-/g,'')}`.slice(0,14):'',
      p.notes?`NOTE:${p.notes.replace(/\n/g,'\\n')}`:'',
      'END:VCARD'
    ].filter(Boolean).join('\r\n')).join('\r\n\r\n');
    const blob=new Blob([vcf],{type:'text/vcard;charset=utf-8;'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);
    a.download='contactos.vcf';a.click();
    toast.success(`📱 ${people.length} contactos exportados como vCard`);
  };

  // ── Temperature helpers ──
  const daysAgoFn=(date)=>{try{return Math.floor((new Date()-new Date(date+'T12:00:00'))/86400000);}catch{return 999;}};
  const lastContactDate=(p)=>{
    const pInter=[...interactions].filter(i=>i.personId===p.id).sort((a,b)=>b.date.localeCompare(a.date));
    return pInter[0]?.date||p.createdAt||null;
  };
  const tempColor=(days)=>days<=7?T.green:days<=21?T.orange:days<=60?T.yellow:T.red;
  const tempLabel=(days)=>days<=3?'🟢 Caliente':days<=14?'🟡 Tibio':days<=30?'🟠 Enfriando':'🔴 Frío';


  const priorityColor=(p)=>p==='alta'?T.red:p==='media'?T.orange:T.green;

  return (
    <div>
      <PageHeader isMobile={isMobile} title="👥 Relaciones" onBack={onBack}
        subtitle="CRM personal — personas, seguimientos e interacciones"
        action={
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            {tab==='personas'&&people.length>0&&(
              <div style={{display:'flex',gap:4}}>
                <button onClick={exportContactsCSV} title="Exportar CSV" style={{padding:'5px 10px',borderRadius:8,border:`1px solid ${T.border}`,background:'transparent',color:T.muted,cursor:'pointer',fontSize:11,fontFamily:'inherit'}}>↓ CSV</button>
                <button onClick={exportContactsVCard} title="Exportar vCard" style={{padding:'5px 10px',borderRadius:8,border:`1px solid ${T.border}`,background:'transparent',color:T.muted,cursor:'pointer',fontSize:11,fontFamily:'inherit'}}>↓ vCard</button>
              </div>
            )}
            {tab==='personas'     &&<Btn size="sm" onClick={()=>{setEditingPerson(null);setPersonForm({name:'',relation:'',birthday:'',emoji:'👤',phone:'',email:'',notes:''});setModalPerson(true);}}><Icon name="plus" size={14}/>Persona</Btn>}
            {tab==='seguimientos' &&<Btn size="sm" onClick={()=>{setFollowForm({personId:selPerson?.id||'',task:'',dueDate:'',priority:'media',done:false});setModalFollowUp(true);}}><Icon name="plus" size={14}/>Seguimiento</Btn>}
            {tab==='historial'    &&<Btn size="sm" onClick={()=>{setInterForm({personId:selPerson?.id||'',type:'Mensaje',notes:'',date:today()});setModalInteraction(true);}}><Icon name="plus" size={14}/>Contacto</Btn>}
          </div>
        }
      />

      {/* ── Summary cards ── */}
      <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr 1fr':'repeat(4,1fr)',gap:10,marginBottom:20}}>
        {[
          {label:'Cumpleaños próximos', val:upcomingBdays.length,  color:upcomingBdays.length>0?T.orange:T.muted, icon:'🎂'},
          {label:'Seguimientos pendientes', val:pendingFollows.length, color:pendingFollows.length>0?T.accent:T.muted, icon:'📋'},
          {label:'Personas',           val:people.length,          color:T.blue,  icon:'👥'},
          {label:'Último contacto',    val:lastInterDays===null?'—':`hace ${lastInterDays}d`, color:lastInterDays===null||lastInterDays>14?T.orange:T.green, icon:'💬'},
        ].map(s=>(
          <Card key={s.label} style={{textAlign:'center',padding:14}}>
            <div style={{fontSize:18,marginBottom:4}}>{s.icon}</div>
            <div style={{fontSize:isMobile?18:22,fontWeight:700,color:s.color}}>{s.val}</div>
            <div style={{fontSize:11,color:T.muted,marginTop:2}}>{s.label}</div>
          </Card>
        ))}
      </div>

      {/* ── Birthday banner ── */}
      {upcomingBdays.length>0&&(
        <div style={{padding:'12px 16px',background:`${T.orange}12`,border:`1px solid ${T.orange}30`,borderRadius:12,marginBottom:16,display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
          <span style={{fontSize:22}}>🎂</span>
          <div style={{flex:1}}>
            <div style={{color:T.text,fontSize:13,fontWeight:600}}>Cumpleaños próximos</div>
            <div style={{color:T.muted,fontSize:12,marginTop:2}}>
              {upcomingBdays.map(p=>{
                const dl=birthdayDaysLeft(p.birthday);
                return <span key={p.id} style={{marginRight:12}}>{p.emoji} {p.name} — {dl===0?'¡hoy!':dl===1?'mañana':`en ${dl}d`}</span>;
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Tabs ── */}
      <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
        {[{id:'personas',label:'🧑 Personas'},{id:'seguimientos',label:'📋 Seguimientos'},{id:'historial',label:'💬 Historial'}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{padding:'7px 16px',borderRadius:10,border:`1px solid ${tab===t.id?T.accent:T.border}`,background:tab===t.id?`${T.accent}18`:'transparent',color:tab===t.id?T.accent:T.muted,cursor:'pointer',fontSize:13,fontWeight:tab===t.id?600:400,fontFamily:'inherit'}}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ══════════ PERSONAS ══════════ */}
      {tab==='personas'&&(
        <div>
          {/* Person detail panel */}
          {selPerson&&(()=>{
            const personFollows=followUps.filter(f=>f.personId===selPerson.id&&!f.done);
            const personInters=[...interactions].filter(i=>i.personId===selPerson.id).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,3);
            const lcd=lastContactDate(selPerson);
            const days=lcd?daysAgoFn(lcd):999;
            const tc=tempColor(days);
            const tl=tempLabel(days);
            return (
              <Card style={{marginBottom:16,borderLeft:`3px solid ${tc}`}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                  <div style={{display:'flex',gap:12,alignItems:'center'}}>
                    <div style={{width:48,height:48,borderRadius:14,background:`${T.accent}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26}}>{selPerson.emoji}</div>
                    <div>
                      <div style={{color:T.text,fontWeight:700,fontSize:16}}>{selPerson.name}</div>
                      <div style={{color:T.muted,fontSize:12,marginTop:2,display:'flex',gap:10,flexWrap:'wrap'}}>
                        {selPerson.relation&&<span>{selPerson.relation}</span>}
                        {selPerson.birthday&&<span>🎂 {fmtDate(selPerson.birthday)} {birthdayDaysLeft(selPerson.birthday)!==null?`(en ${birthdayDaysLeft(selPerson.birthday)}d)`:''}</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{display:'flex',gap:6}}>
                    <button onClick={()=>openEditPerson(selPerson)} style={{background:'none',border:`1px solid ${T.border}`,borderRadius:8,padding:'4px 10px',cursor:'pointer',color:T.muted,fontSize:12,fontFamily:'inherit'}}>✏️</button>
                    <button onClick={()=>delPerson(selPerson.id)} style={{background:'none',border:'none',color:T.red,cursor:'pointer',padding:4,display:'flex'}}><Icon name="trash" size={15}/></button>
                  </div>
                </div>
                {/* contact buttons */}
                <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:selPerson.notes||personFollows.length>0||personInters.length>0?12:0}}>
                  {selPerson.phone&&<a href={`tel:${selPerson.phone}`} style={{display:'flex',alignItems:'center',gap:5,padding:'6px 12px',background:`${T.green}15`,border:`1px solid ${T.green}30`,borderRadius:8,color:T.green,fontSize:12,fontWeight:600,textDecoration:'none'}}>📞 {selPerson.phone}</a>}
                  {selPerson.email&&<a href={`mailto:${selPerson.email}`} style={{display:'flex',alignItems:'center',gap:5,padding:'6px 12px',background:`${T.blue}15`,border:`1px solid ${T.blue}30`,borderRadius:8,color:T.blue,fontSize:12,fontWeight:600,textDecoration:'none'}}>✉️ {selPerson.email}</a>}
                  <button onClick={()=>{setInterForm({personId:selPerson.id,type:'Mensaje',notes:'',date:today()});setModalInteraction(true);}} style={{padding:'6px 12px',background:`${T.purple}15`,border:`1px solid ${T.purple}30`,borderRadius:8,color:T.purple,fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>💬 Registrar contacto</button>
                  <button onClick={()=>{setFollowForm({personId:selPerson.id,task:'',dueDate:'',priority:'media',done:false});setModalFollowUp(true);}} style={{padding:'6px 12px',background:`${T.accent}15`,border:`1px solid ${T.accent}30`,borderRadius:8,color:T.accent,fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>📋 Agregar seguimiento</button>
                </div>
                {/* Temperature bar */}
                <div style={{marginBottom:12}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                    <span style={{fontSize:11,color:T.muted}}>Temperatura de relación</span>
                    <span style={{fontSize:11,fontWeight:700,color:tc}}>{tl} {days<999?`· hace ${days}d`:''}</span>
                  </div>
                  <div style={{height:5,background:T.border,borderRadius:3,overflow:'hidden'}}>
                    <div style={{height:'100%',width:`${Math.max(0,100-Math.min(days*1.5,100))}%`,background:tc,borderRadius:3,transition:'width 0.5s'}}/>
                  </div>
                </div>
                {selPerson.notes&&<div style={{color:T.muted,fontSize:12,lineHeight:1.6,marginBottom:personFollows.length>0||personInters.length>0?12:0}}>{selPerson.notes}</div>}
                {personFollows.length>0&&(
                  <div style={{marginBottom:personInters.length>0?10:0}}>
                    <div style={{fontSize:11,fontWeight:600,color:T.accent,marginBottom:6}}>Pendientes</div>
                    {personFollows.map(f=>(
                      <div key={f.id} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 0',borderBottom:`1px solid ${T.border}`}}>
                        <button onClick={()=>toggleFollowUp(f.id)} style={{width:18,height:18,borderRadius:5,border:`1.5px solid ${priorityColor(f.priority)}`,background:'transparent',cursor:'pointer',flexShrink:0}}/>
                        <span style={{color:T.text,fontSize:12,flex:1}}>{f.task}</span>
                        {f.dueDate&&<span style={{color:T.dim,fontSize:11}}>{fmtDate(f.dueDate)}</span>}
                      </div>
                    ))}
                  </div>
                )}
                {personInters.length>0&&(
                  <div>
                    <div style={{fontSize:11,fontWeight:600,color:T.muted,marginBottom:8,textTransform:'uppercase',letterSpacing:0.5}}>Últimos contactos</div>
                    <div style={{position:'relative',paddingLeft:28}}>
                      <div style={{position:'absolute',left:8,top:4,bottom:4,width:1.5,background:T.border,borderRadius:2}}/>
                      {personInters.map((i,idx)=>{
                        const TYPE_ICONS={'Mensaje':'💬','Llamada':'📞','Videollamada':'🎥','Comida':'🍽️','Café':'☕','Evento':'🎉','Email':'✉️','Visita':'🏠','Otro':'📌'};
                        return (
                          <div key={i.id} style={{position:'relative',marginBottom:idx===personInters.length-1?0:8}}>
                            <div style={{position:'absolute',left:-24,top:2,width:16,height:16,borderRadius:'50%',background:T.surface,border:`1.5px solid ${T.purple}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9}}>{TYPE_ICONS[i.type]||'•'}</div>
                            <div style={{fontSize:12,color:T.muted,lineHeight:1.4}}>
                              <span style={{color:T.accent,fontWeight:600,marginRight:5}}>{i.type}</span>
                              {i.notes&&<span style={{marginRight:6}}>{i.notes}</span>}
                              <span style={{color:T.dim,fontSize:10}}>{fmtDate(i.date)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Card>
            );
          })()}

          {people.length===0
            ?<div style={{textAlign:'center',padding:'40px 0',color:T.dim}}>
               <div style={{fontSize:36,marginBottom:8}}>👥</div>
               <div style={{fontSize:14,marginBottom:12}}>Sin personas registradas</div>
               <Btn size="sm" onClick={()=>setModalPerson(true)}><Icon name="plus" size={13}/>Agregar</Btn>
             </div>
            :<div>
               {/* Search + relation filter */}
               <div style={{display:'flex',gap:8,marginBottom:12,flexWrap:'wrap'}}>
                 <div style={{flex:1,minWidth:160,position:'relative'}}>
                   <span style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',fontSize:13,color:T.dim,pointerEvents:'none'}}>🔍</span>
                   <input value={personSearch} onChange={e=>setPersonSearch(e.target.value)}
                     placeholder="Buscar por nombre, relación…"
                     style={{width:'100%',background:T.surface2,border:`1px solid ${personSearch?T.accent:T.border}`,color:T.text,padding:'8px 10px 8px 30px',borderRadius:10,fontSize:13,outline:'none',fontFamily:'inherit',boxSizing:'border-box',transition:'border-color 0.15s'}}/>
                   {personSearch&&<button onClick={()=>setPersonSearch('')} style={{position:'absolute',right:8,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:T.dim,cursor:'pointer',fontSize:14,padding:2}}>✕</button>}
                 </div>
                 <select value={relationFilter} onChange={e=>setRelationFilter(e.target.value)}
                   style={{background:T.surface2,border:`1px solid ${relationFilter!=='todas'?T.accent:T.border}`,color:T.text,padding:'8px 10px',borderRadius:10,fontSize:13,outline:'none',fontFamily:'inherit',cursor:'pointer'}}>
                   <option value="todas">Todas las relaciones</option>
                   {[...new Set(people.map(p=>p.relation).filter(Boolean))].sort().map(r=><option key={r}>{r}</option>)}
                 </select>
               </div>
               {/* Results count when filtering */}
               {(personSearch||relationFilter!=='todas')&&(()=>{
                 const ps=s=>(s||'').toLowerCase();
                 const match=(p)=>{
                   const sq=ps(personSearch);
                   const textMatch=!sq||(ps(p.name).includes(sq)||ps(p.relation).includes(sq)||ps(p.notes).includes(sq)||ps(p.phone).includes(sq)||ps(p.email).includes(sq));
                   const relMatch=relationFilter==='todas'||p.relation===relationFilter;
                   return textMatch&&relMatch;
                 };
                 const cnt=people.filter(match).length;
                 return <div style={{fontSize:11,color:T.muted,marginBottom:8}}>{cnt} persona{cnt!==1?'s':''} encontrada{cnt!==1?'s':''}</div>;
               })()}
               <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr 1fr':'repeat(auto-fill,minmax(180px,1fr))',gap:10}}>
               {(()=>{
                 const ps=s=>(s||'').toLowerCase();
                 const match=(p)=>{
                   const sq=ps(personSearch);
                   const textMatch=!sq||(ps(p.name).includes(sq)||ps(p.relation).includes(sq)||ps(p.notes).includes(sq)||ps(p.phone).includes(sq)||ps(p.email).includes(sq));
                   const relMatch=relationFilter==='todas'||p.relation===relationFilter;
                   return textMatch&&relMatch;
                 };
                 const visible=people.filter(match);
                 if(!visible.length) return <div style={{gridColumn:'1/-1',textAlign:'center',padding:'28px 0',color:T.dim,fontSize:13}}>Sin resultados para "<span style={{color:T.accent}}>{personSearch}</span>"</div>;
                 return visible.map(p=>{
                 const dl=birthdayDaysLeft(p.birthday);
                 const pFollows=followUps.filter(f=>f.personId===p.id&&!f.done).length;
                 const lcd=lastContactDate(p);
                 const days=lcd?daysAgoFn(lcd):999;
                 const tc=tempColor(days);
                 const tl=tempLabel(days);
                 return (
                   <div key={p.id} onClick={()=>setSelPerson(selPerson?.id===p.id?null:p)}
                     style={{padding:'14px',background:T.surface,border:`1px solid ${selPerson?.id===p.id?T.accent:T.border}`,borderTop:`3px solid ${tc}`,borderRadius:12,cursor:'pointer',transition:'border-color 0.15s',position:'relative'}}>
                     {dl!==null&&dl<=7&&<span style={{position:'absolute',top:8,right:8,fontSize:14}}>🎂</span>}
                     <div style={{fontSize:30,marginBottom:6}}>{p.emoji}</div>
                     <div style={{color:T.text,fontSize:13,fontWeight:600}}>{p.name}</div>
                     {p.relation&&<div style={{fontSize:10,color:T.muted,marginTop:1}}>{p.relation}</div>}
                     <div style={{fontSize:10,color:tc,marginTop:4,fontWeight:600}}>{tl}</div>
                     {lcd&&<div style={{fontSize:9,color:T.dim,marginTop:1}}>hace {days}d</div>}
                     {pFollows>0&&<div style={{marginTop:5,fontSize:10,color:T.accent,background:`${T.accent}15`,padding:'1px 7px',borderRadius:7,display:'inline-block'}}>{pFollows} pendiente{pFollows>1?'s':''}</div>}
                   </div>
                 );
                 });
               })()}
               </div>
             </div>
          }
        </div>
      )}

      {/* ══════════ SEGUIMIENTOS ══════════ */}
      {tab==='seguimientos'&&(
        <div>
          {followUps.length===0
            ?<div style={{textAlign:'center',padding:'40px 0',color:T.dim}}>
               <div style={{fontSize:36,marginBottom:8}}>📋</div>
               <div style={{fontSize:14,marginBottom:12}}>Sin seguimientos pendientes</div>
               <Btn size="sm" onClick={()=>setModalFollowUp(true)}><Icon name="plus" size={13}/>Agregar</Btn>
             </div>
            :<div>
               {/* pending */}
               {pendingFollows.length>0&&(
                 <div style={{marginBottom:20}}>
                   <div style={{fontSize:12,fontWeight:600,color:T.muted,marginBottom:10}}>PENDIENTES</div>
                   {[...pendingFollows].sort((a,b)=>(a.dueDate||'9999').localeCompare(b.dueDate||'9999')).map(f=>(
                     <div key={f.id} style={{display:'flex',alignItems:'center',gap:10,padding:'12px 14px',background:T.surface,border:`1px solid ${T.border}`,borderRadius:11,marginBottom:8,borderLeft:`3px solid ${priorityColor(f.priority)}`}}>
                       <button onClick={()=>toggleFollowUp(f.id)} style={{width:22,height:22,borderRadius:6,border:`2px solid ${priorityColor(f.priority)}`,background:'transparent',cursor:'pointer',flexShrink:0}}/>
                       <div style={{flex:1}}>
                         <div style={{color:T.text,fontSize:13,fontWeight:500}}>{f.task}</div>
                         <div style={{color:T.muted,fontSize:11,marginTop:2,display:'flex',gap:8}}>
                           <span>{personEmoji(f.personId)} {personName(f.personId)}</span>
                           {f.dueDate&&<span>📅 {fmtDate(f.dueDate)}</span>}
                         </div>
                       </div>
                       <button onClick={()=>delFollowUp(f.id)} style={{background:'none',border:'none',color:T.dim,cursor:'pointer',padding:4,display:'flex'}}><Icon name="trash" size={13}/></button>
                     </div>
                   ))}
                 </div>
               )}
               {/* done */}
               {followUps.filter(f=>f.done).length>0&&(
                 <div style={{opacity:0.5}}>
                   <div style={{fontSize:12,fontWeight:600,color:T.muted,marginBottom:10}}>COMPLETADOS</div>
                   {followUps.filter(f=>f.done).map(f=>(
                     <div key={f.id} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',background:T.surface,borderRadius:10,marginBottom:6}}>
                       <button onClick={()=>toggleFollowUp(f.id)} style={{width:22,height:22,borderRadius:6,border:`2px solid ${T.green}`,background:`${T.green}30`,cursor:'pointer',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
                         <Icon name="check" size={12} color={T.green}/>
                       </button>
                       <div style={{flex:1}}>
                         <div style={{color:T.muted,fontSize:13,textDecoration:'line-through'}}>{f.task}</div>
                         <div style={{color:T.dim,fontSize:11}}>{personEmoji(f.personId)} {personName(f.personId)}</div>
                       </div>
                       <button onClick={()=>delFollowUp(f.id)} style={{background:'none',border:'none',color:T.dim,cursor:'pointer',padding:4,display:'flex'}}><Icon name="trash" size={12}/></button>
                     </div>
                   ))}
                 </div>
               )}
             </div>
          }
        </div>
      )}

      {/* ══════════ HISTORIAL (TIMELINE) ══════════ */}
      {tab==='historial'&&(
        <div>
          {/* Filters */}
          {interactions.length>0&&(
            <div style={{display:'flex',gap:8,marginBottom:14,flexWrap:'wrap',alignItems:'center'}}>
              <select value={tlPersonFilter} onChange={e=>setTlPersonFilter(e.target.value)}
                style={{background:T.surface2,border:`1px solid ${tlPersonFilter!=='all'?T.accent:T.border}`,color:tlPersonFilter!=='all'?T.accent:T.muted,padding:'6px 10px',borderRadius:9,fontSize:12,outline:'none',fontFamily:'inherit',cursor:'pointer'}}>
                <option value="all">Todas las personas</option>
                {people.map(p=><option key={p.id} value={p.id}>{p.emoji} {p.name}</option>)}
              </select>
              <select value={tlTypeFilter} onChange={e=>setTlTypeFilter(e.target.value)}
                style={{background:T.surface2,border:`1px solid ${tlTypeFilter!=='all'?T.accent:T.border}`,color:tlTypeFilter!=='all'?T.accent:T.muted,padding:'6px 10px',borderRadius:9,fontSize:12,outline:'none',fontFamily:'inherit',cursor:'pointer'}}>
                <option value="all">Todos los tipos</option>
                {INTER_TYPES.map(t=><option key={t}>{t}</option>)}
              </select>
              {(tlPersonFilter!=='all'||tlTypeFilter!=='all')&&(
                <button onClick={()=>{setTlPersonFilter('all');setTlTypeFilter('all');}}
                  style={{padding:'5px 10px',borderRadius:8,border:`1px solid ${T.border}`,background:'transparent',color:T.dim,cursor:'pointer',fontSize:11,fontFamily:'inherit'}}>
                  ✕ Limpiar
                </button>
              )}
            </div>
          )}

          {interactions.length===0
            ?<div style={{textAlign:'center',padding:'40px 0',color:T.dim}}>
               <div style={{fontSize:36,marginBottom:8}}>💬</div>
               <div style={{fontSize:14,marginBottom:12}}>Sin interacciones registradas</div>
               <Btn size="sm" onClick={()=>setModalInteraction(true)}><Icon name="plus" size={13}/>Registrar</Btn>
             </div>
            :(()=>{
              const TYPE_ICONS={'Mensaje':'💬','Llamada':'📞','Videollamada':'🎥','Comida':'🍽️','Café':'☕','Evento':'🎉','Email':'✉️','Visita':'🏠','Otro':'📌'};
              const filtered=[...interactions]
                .filter(i=>(tlPersonFilter==='all'||i.personId===tlPersonFilter)&&(tlTypeFilter==='all'||i.type===tlTypeFilter))
                .sort((a,b)=>b.date.localeCompare(a.date));
              if(!filtered.length) return <div style={{textAlign:'center',padding:'28px 0',color:T.dim,fontSize:13}}>Sin interacciones con estos filtros</div>;

              // Group by month
              const byMonth={};
              filtered.forEach(i=>{
                const key=i.date.slice(0,7);
                if(!byMonth[key])byMonth[key]=[];
                byMonth[key].push(i);
              });

              return Object.entries(byMonth).map(([month,items])=>(
                <div key={month} style={{marginBottom:28}}>
                  {/* Month header */}
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
                    <span style={{fontSize:12,fontWeight:700,color:T.muted,textTransform:'uppercase',letterSpacing:1,whiteSpace:'nowrap'}}>
                      {new Date(month+'-01').toLocaleDateString('es-ES',{month:'long',year:'numeric'})}
                    </span>
                    <div style={{flex:1,height:1,background:T.border}}/>
                    <span style={{fontSize:11,color:T.dim,whiteSpace:'nowrap'}}>{items.length} contacto{items.length!==1?'s':''}</span>
                  </div>

                  {/* Timeline entries */}
                  <div style={{position:'relative',paddingLeft:44}}>
                    {/* Vertical line */}
                    <div style={{position:'absolute',left:16,top:8,bottom:8,width:2,background:`${T.border}`,borderRadius:2}}/>

                    {items.map((i,idx)=>{
                      const person=people.find(p=>p.id===i.personId);
                      const typeIcon=TYPE_ICONS[i.type]||'📌';
                      const isLast=idx===items.length-1;
                      return (
                        <div key={i.id} style={{position:'relative',marginBottom:isLast?0:14}}>
                          {/* Node dot */}
                          <div style={{
                            position:'absolute',left:-36,top:6,
                            width:22,height:22,borderRadius:'50%',
                            background:T.surface2,border:`2px solid ${T.purple}`,
                            display:'flex',alignItems:'center',justifyContent:'center',
                            fontSize:11,zIndex:1,
                          }}>
                            {typeIcon}
                          </div>

                          {/* Card */}
                          <div style={{
                            background:T.surface,border:`1px solid ${T.border}`,
                            borderRadius:11,padding:'10px 14px',
                            transition:'border-color 0.15s',
                          }}
                          onMouseEnter={e=>e.currentTarget.style.borderColor=T.purple}
                          onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
                            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8}}>
                              <div style={{flex:1,minWidth:0}}>
                                <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap',marginBottom:i.notes?4:0}}>
                                  <span style={{fontSize:16,flexShrink:0}}>{person?.emoji||'👤'}</span>
                                  <span style={{color:T.text,fontSize:13,fontWeight:600}}>{person?.name||'—'}</span>
                                  <span style={{fontSize:11,color:T.purple,background:`${T.purple}15`,padding:'2px 8px',borderRadius:8,fontWeight:600}}>{i.type}</span>
                                  <span style={{fontSize:11,color:T.dim,marginLeft:'auto'}}>{new Date(i.date+'T12:00:00').toLocaleDateString('es-ES',{day:'2-digit',month:'short'})}</span>
                                </div>
                                {i.notes&&<div style={{color:T.muted,fontSize:12,lineHeight:1.5,paddingLeft:24}}>{i.notes}</div>}
                              </div>
                              <button onClick={()=>delInteraction(i.id)} style={{background:'none',border:'none',color:T.dim,cursor:'pointer',padding:2,flexShrink:0,opacity:0.6}}
                                onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=0.6}>
                                <Icon name="trash" size={12}/>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ));
            })()
          }
        </div>
      )}

      {/* ══════════ MODALES ══════════ */}
      {modalPerson&&(
        <Modal title={editingPerson?'Editar persona':'Nueva persona'} onClose={()=>{setModalPerson(false);setEditingPerson(null);}}>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <div>
              <div style={{fontSize:12,color:T.muted,marginBottom:6}}>Emoji / Avatar</div>
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                {EMOJIS.map(e=>(
                  <button key={e} onClick={()=>setPersonForm(f=>({...f,emoji:e}))}
                    style={{width:36,height:36,borderRadius:8,border:`2px solid ${personForm.emoji===e?T.accent:T.border}`,background:personForm.emoji===e?`${T.accent}18`:'transparent',cursor:'pointer',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center'}}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <Input value={personForm.name} onChange={v=>setPersonForm(f=>({...f,name:v}))} placeholder="Nombre"/>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <Select value={personForm.relation} onChange={v=>setPersonForm(f=>({...f,relation:v}))}>
                <option value="">— Relación —</option>
                {RELATIONS.map(r=><option key={r}>{r}</option>)}
              </Select>
              <div>
                <div style={{fontSize:12,color:T.muted,marginBottom:4}}>Cumpleaños</div>
                <Input value={personForm.birthday} onChange={v=>setPersonForm(f=>({...f,birthday:v}))} type="date"/>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <Input value={personForm.phone} onChange={v=>setPersonForm(f=>({...f,phone:v}))} placeholder="Teléfono" type="tel"/>
              <Input value={personForm.email} onChange={v=>setPersonForm(f=>({...f,email:v}))} placeholder="Email" type="email"/>
            </div>
            <Textarea value={personForm.notes} onChange={v=>setPersonForm(f=>({...f,notes:v}))} placeholder="Notas (temas de conversación, contexto, intereses...)" rows={3}/>
          </div>
          <div style={{display:'flex',gap:10,marginTop:20}}>
            <Btn onClick={savePerson} style={{flex:1,justifyContent:'center'}}>{editingPerson?'Guardar cambios':'Agregar'}</Btn>
            <Btn variant="ghost" onClick={()=>{setModalPerson(false);setEditingPerson(null);}}>Cancelar</Btn>
          </div>
        </Modal>
      )}

      {modalFollowUp&&(
        <Modal title="Nuevo seguimiento" onClose={()=>setModalFollowUp(false)}>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <Select value={followForm.personId} onChange={v=>setFollowForm(f=>({...f,personId:v}))}>
              <option value="">— ¿Con quién? —</option>
              {people.map(p=><option key={p.id} value={p.id}>{p.emoji} {p.name}</option>)}
            </Select>
            <Input value={followForm.task} onChange={v=>setFollowForm(f=>({...f,task:v}))} placeholder="¿Qué tienes que hacer? (ej: Llamar, Enviar info, Agradecer...)"/>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <div>
                <div style={{fontSize:12,color:T.muted,marginBottom:4}}>Fecha límite</div>
                <Input value={followForm.dueDate} onChange={v=>setFollowForm(f=>({...f,dueDate:v}))} type="date"/>
              </div>
              <Select value={followForm.priority} onChange={v=>setFollowForm(f=>({...f,priority:v}))}>
                <option value="baja">🟢 Baja</option>
                <option value="media">🟡 Media</option>
                <option value="alta">🔴 Alta</option>
              </Select>
            </div>
          </div>
          <div style={{display:'flex',gap:10,marginTop:20}}>
            <Btn onClick={saveFollowUp} style={{flex:1,justifyContent:'center'}}>Guardar</Btn>
            <Btn variant="ghost" onClick={()=>setModalFollowUp(false)}>Cancelar</Btn>
          </div>
        </Modal>
      )}

      {modalInteraction&&(
        <Modal title="Registrar contacto" onClose={()=>setModalInteraction(false)}>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <Select value={interForm.personId} onChange={v=>setInterForm(f=>({...f,personId:v}))}>
              <option value="">— ¿Con quién? —</option>
              {people.map(p=><option key={p.id} value={p.id}>{p.emoji} {p.name}</option>)}
            </Select>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <Select value={interForm.type} onChange={v=>setInterForm(f=>({...f,type:v}))}>
                {INTER_TYPES.map(t=><option key={t}>{t}</option>)}
              </Select>
              <Input value={interForm.date} onChange={v=>setInterForm(f=>({...f,date:v}))} type="date"/>
            </div>
            <Textarea value={interForm.notes} onChange={v=>setInterForm(f=>({...f,notes:v}))} placeholder="Notas de la conversación, temas tratados..." rows={3}/>
          </div>
          <div style={{display:'flex',gap:10,marginTop:20}}>
            <Btn onClick={saveInteraction} style={{flex:1,justifyContent:'center'}}>Registrar</Btn>
            <Btn variant="ghost" onClick={()=>setModalInteraction(false)}>Cancelar</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ===================== DESARROLLO PERSONAL =====================
const DesarrolloPersonal = ({data,setData,isMobile,onBack}) => {
  const [tab,setTab]=useState('learning');
  const [pomActive,setPomActive]=useState(false);
  const [pomSeconds,setPomSeconds]=useState(25*60);
  const [pomMode,setPomMode]=useState('focus');
  const [pomCycles,setPomCycles]=useState(0);
  const [studyMin,setStudyMin]=useState(0);
  const [selCourse,setSelCourse]=useState(null);
  const [ideaFilter,setIdeaFilter]=useState('all');
  const timerRef=useRef(null);

  const [modal,setModal]=useState(false);
  const [ideaModal,setIdeaModal]=useState(false);
  const [form,setForm]=useState({type:'learning',title:'',platform:'',category:'',hoursTotal:10,progress:0});
  const [ideaForm,setIdeaForm]=useState({content:'',tag:'💡 Idea'});

  const learnings=(data.learnings||[]);
  const ideas=(data.ideas||[]);

  const saveLearning=()=>{
    if(!form.title.trim())return;
    const upd=[...learnings,{id:uid(),...form,hoursSpent:0,streak:0,createdAt:today()}];
    setData(d=>({...d,learnings:upd}));save('learnings',upd);
    setModal(false);setForm({type:'learning',title:'',platform:'',category:'',hoursTotal:10,progress:0});
  };
  const saveIdea=()=>{
    if(!ideaForm.content.trim())return;
    const upd=[{id:uid(),...ideaForm,createdAt:today()},...ideas];
    setData(d=>({...d,ideas:upd}));save('ideas',upd);
    setIdeaModal(false);setIdeaForm({content:'',tag:'💡 Idea'});
  };
  const delLearning=(id)=>{const u=learnings.filter(l=>l.id!==id);setData(d=>({...d,learnings:u}));save('learnings',u);};
  const delIdea=(id)=>{const u=ideas.filter(i=>i.id!==id);setData(d=>({...d,ideas:u}));save('ideas',u);};
  const updateProgress=(id,pct)=>{const u=learnings.map(l=>l.id!==id?l:{...l,progress:Math.min(100,Math.max(0,pct))});setData(d=>({...d,learnings:u}));save('learnings',u);};
  const updateHoursSpent=(id,h)=>{
    const hrs=Math.max(0,Number(h)||0);
    const u=learnings.map(l=>l.id!==id?l:{...l,hoursSpent:hrs});
    setData(d=>({...d,learnings:u}));save('learnings',u);
  };

  // Pomodoro timer — al completar un ciclo de enfoque, acumula 25min al curso seleccionado
  const selCourseRef=useRef(selCourse);
  useEffect(()=>{selCourseRef.current=selCourse;},[selCourse]);
  useEffect(()=>{
    if(pomActive){
      timerRef.current=setInterval(()=>{
        setPomSeconds(s=>{
          if(s<=1){
            clearInterval(timerRef.current);setPomActive(false);
            if(pomMode==='focus'){
              setPomCycles(c=>c+1);setStudyMin(m=>m+25);setPomMode('break');
              // Acumular horas al curso seleccionado
              const cId=selCourseRef.current;
              if(cId){
                setData(d=>{
                  const upd=(d.learnings||[]).map(l=>{
                    if(l.id!==cId)return l;
                    const newH=Math.round(((l.hoursSpent||0)+25/60)*100)/100;
                    // streak: actualizar si último día de estudio no es hoy
                    const newStreak=(l.lastStudyDate===today())?(l.streak||1):((l.lastStudyDate)===new Date(Date.now()-86400000).toISOString().slice(0,10)?(l.streak||0)+1:1);
                    return {...l,hoursSpent:newH,lastStudyDate:today(),streak:newStreak};
                  });
                  save('learnings',upd);
                  return {...d,learnings:upd};
                });
                toast.success('🍅 ¡Pomodoro completado! +25 min registrados');
              }
              return 5*60;
            }
            else{setPomMode('focus');return 25*60;}
          }
          return s-1;
        });
      },1000);
    } else clearInterval(timerRef.current);
    return()=>clearInterval(timerRef.current);
  },[pomActive,pomMode]);

  const fmtTime=s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  const pomTotalSecs=pomMode==='focus'?25*60:5*60;
  const pomPct=(1-pomSeconds/pomTotalSecs)*100;

  const IDEA_TAGS=['💡 Idea','✍️ Escritura','🎓 Educación','📋 Plantilla','🚀 Proyecto','🔧 Herramienta'];
  const LEARNING_COLORS=[T.blue,T.purple,T.accent,T.orange,T.red,T.yellow];
  const lColor=(l,i)=>l.color||(LEARNING_COLORS[i%LEARNING_COLORS.length]);
  const maxHours=Math.max(...learnings.map(l=>l.hoursSpent||0),1);

  const uniqueTags=[...new Set(ideas.map(i=>i.tag))];
  const filteredIdeas=ideaFilter==='all'?ideas:ideas.filter(i=>i.tag===ideaFilter);

  // Retrospectives
  const [retros,setRetros]=useState(data.retros||[]);
  const [retroForm,setRetroForm]=useState({bien:'',mejorar:'',aprendi:'',intencion:''});
  const saveRetro=()=>{
    const upd=[{id:uid(),...retroForm,date:today()},...retros];
    setRetros(upd);setData(d=>({...d,retros:upd}));save('retros',upd);
    setRetroForm({bien:'',mejorar:'',aprendi:'',intencion:''});
  };

  return (
    <div>
      <PageHeader title="Desarrollo Personal" subtitle="Aprende, reflexiona, crece 🧠" isMobile={isMobile} onBack={onBack}/>

      {/* Tab nav */}
      <div style={{display:'flex',gap:6,marginBottom:16,flexWrap:'wrap'}}>
        {[['learning','📚 Aprendizajes'],['pomodoro','⏱ Pomodoro'],['ideas','💡 Ideas'],['retro','📋 Retro']].map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)}
            style={{padding:'6px 14px',borderRadius:10,border:`1px solid ${tab===id?T.purple:T.border}`,background:tab===id?`${T.purple}18`:'transparent',color:tab===id?T.purple:T.muted,cursor:'pointer',fontSize:12,fontWeight:tab===id?700:400,fontFamily:'inherit',whiteSpace:'nowrap'}}>
            {label}
          </button>
        ))}
      </div>

      {/* ── LEARNING ── */}
      {tab==='learning'&&(
        <div>
          <div style={{display:'flex',justifyContent:'flex-end',marginBottom:12}}>
            <Btn size="sm" onClick={()=>setModal(true)}><Icon name="plus" size={12}/>Agregar</Btn>
          </div>
          {/* Hours bar chart */}
          {learnings.length>0&&(
            <Card style={{marginBottom:14,padding:16}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                <div style={{fontSize:13,fontWeight:600,color:T.text}}>📊 Horas dedicadas por curso</div>
                <div style={{fontSize:11,color:T.muted}}>
                  Total: <strong style={{color:T.accent}}>{learnings.reduce((s,l)=>s+(l.hoursSpent||0),0).toFixed(1)}h</strong>
                  {' / '}{learnings.reduce((s,l)=>s+(l.hoursTotal||0),0)}h
                </div>
              </div>
              {/* Horizontal bars with labels */}
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {learnings.map((l,i)=>{
                  const color=lColor(l,i);
                  const spent=l.hoursSpent||0;
                  const total=l.hoursTotal||1;
                  const pct=Math.min(Math.round((spent/total)*100),100);
                  const barW=maxHours>0?Math.max((spent/maxHours)*100,spent>0?4:0):0;
                  return (
                    <div key={l.id} style={{cursor:'pointer'}} onClick={()=>setSelCourse(selCourse===l.id?null:l.id)}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:3}}>
                        <span style={{fontSize:12,color:selCourse===l.id?color:T.text,fontWeight:selCourse===l.id?700:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'60%'}}>{l.title}</span>
                        <div style={{display:'flex',gap:8,alignItems:'center',flexShrink:0}}>
                          <span style={{fontSize:11,color:T.muted}}>{spent.toFixed(1)}h / {total}h</span>
                          <span style={{fontSize:10,fontWeight:700,color:pct>=100?T.green:pct>=50?color:T.muted,background:pct>=100?`${T.green}15`:`${color}12`,padding:'1px 7px',borderRadius:6}}>{pct}%</span>
                        </div>
                      </div>
                      <div style={{height:8,background:T.border,borderRadius:4,overflow:'hidden'}}>
                        <div style={{height:'100%',width:`${barW}%`,background:selCourse===l.id?color:`${color}88`,borderRadius:4,transition:'all 0.4s'}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
          {learnings.map((l,i)=>{
            const color=lColor(l,i);
            const isSel=selCourse===l.id;
            return (
              <Card key={l.id} style={{marginBottom:10,border:`1.5px solid ${isSel?color:T.border}`}} onClick={()=>setSelCourse(isSel?null:l.id)}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:600,fontSize:14,color:T.text}}>{l.title}</div>
                    <div style={{fontSize:11,color:T.muted,marginTop:2}}>{l.platform&&`${l.platform} · `}{l.category}</div>
                  </div>
                  <div style={{display:'flex',gap:6,alignItems:'center'}}>
                    {(l.streak||0)>0&&<span style={{fontSize:11,color:T.orange,fontWeight:700}}>🔥{l.streak}d</span>}
                    <span style={{fontSize:14,fontWeight:800,color,fontFamily:'monospace'}}>{l.progress||0}%</span>
                    <button onClick={e=>{e.stopPropagation();delLearning(l.id);}} style={{background:'none',border:'none',color:T.dim,cursor:'pointer',padding:2}}><Icon name="trash" size={12}/></button>
                  </div>
                </div>
                <div style={{height:5,background:T.border,borderRadius:3,overflow:'hidden',marginBottom:4}}>
                  <div style={{height:'100%',width:`${l.progress||0}%`,background:color,borderRadius:3,transition:'width 0.5s'}}/>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:T.muted}}>
                  <span>{l.hoursSpent||0}h de {l.hoursTotal||0}h</span>
                  <span>{(l.hoursTotal||0)-(l.hoursSpent||0)}h restantes</span>
                </div>
                {isSel&&(
                  <div style={{marginTop:12,paddingTop:10,borderTop:`1px solid ${T.border}`,display:'flex',flexDirection:'column',gap:10}}>
                    <div style={{display:'flex',gap:8,alignItems:'center'}}>
                      <span style={{fontSize:12,color:T.muted,flexShrink:0}}>Progreso:</span>
                      <input type="range" min={0} max={100} value={l.progress||0}
                        onChange={e=>{e.stopPropagation();updateProgress(l.id,Number(e.target.value));}}
                        onClick={e=>e.stopPropagation()}
                        style={{flex:1,accentColor:color}}/>
                      <span style={{fontSize:12,fontWeight:700,color,flexShrink:0}}>{l.progress||0}%</span>
                    </div>
                    <div style={{display:'flex',gap:8,alignItems:'center'}} onClick={e=>e.stopPropagation()}>
                      <span style={{fontSize:12,color:T.muted,flexShrink:0}}>Horas reales:</span>
                      <input type="number" min={0} step={0.5} value={l.hoursSpent||0}
                        onChange={e=>updateHoursSpent(l.id,e.target.value)}
                        style={{width:80,background:T.bg,border:`1px solid ${T.border}`,color:T.text,padding:'4px 8px',borderRadius:8,fontSize:12,outline:'none',textAlign:'center'}}/>
                      <span style={{fontSize:11,color:T.muted}}>de {l.hoursTotal||0}h</span>
                      {(l.streak||0)>0&&<span style={{fontSize:11,color:T.orange,fontWeight:700,marginLeft:'auto'}}>🔥 racha {l.streak}d</span>}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
          {!learnings.length&&<div style={{textAlign:'center',padding:'30px 0',color:T.dim}}><p style={{fontSize:14}}>Sin cursos aún</p><Btn size="sm" onClick={()=>setModal(true)} style={{marginTop:8}}><Icon name="plus" size={12}/>Agregar curso</Btn></div>}
          {modal&&<Modal title="Nuevo aprendizaje" onClose={()=>setModal(false)}>
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              <Input value={form.title} onChange={v=>setForm(f=>({...f,title:v}))} placeholder="Nombre del curso/libro/skill"/>
              <Input value={form.platform} onChange={v=>setForm(f=>({...f,platform:v}))} placeholder="Plataforma (Udemy, Coursera...)"/>
              <Input value={form.category} onChange={v=>setForm(f=>({...f,category:v}))} placeholder="Categoría (Desarrollo, Diseño...)"/>
              <div style={{display:'flex',gap:8}}>
                <div style={{flex:1}}><label style={{fontSize:11,color:T.muted}}>Horas totales</label><Input type="number" value={form.hoursTotal} onChange={v=>setForm(f=>({...f,hoursTotal:Number(v)}))} placeholder="20"/></div>
                <div style={{flex:1}}><label style={{fontSize:11,color:T.muted}}>Progreso inicial %</label><Input type="number" value={form.progress} onChange={v=>setForm(f=>({...f,progress:Number(v)}))} placeholder="0"/></div>
              </div>
              <Btn onClick={saveLearning} style={{width:'100%',justifyContent:'center'}}>Agregar</Btn>
            </div>
          </Modal>}
        </div>
      )}

      {/* ── POMODORO ── */}
      {tab==='pomodoro'&&(
        <Card style={{padding:isMobile?20:28,textAlign:'center'}}>
          <div style={{fontSize:12,fontWeight:700,color:pomMode==='focus'?T.red:T.accent,textTransform:'uppercase',letterSpacing:2,marginBottom:16}}>
            {pomMode==='focus'?'🍅 Enfoque':'☕ Descanso'}
            {selCourse&&learnings.find(l=>l.id===selCourse)&&<span style={{color:T.muted,fontWeight:400,marginLeft:8,textTransform:'none'}}>— {learnings.find(l=>l.id===selCourse)?.title?.split(' ')[0]}</span>}
          </div>
          <div style={{position:'relative',display:'inline-flex',alignItems:'center',justifyContent:'center',marginBottom:24}}>
            <svg width={160} height={160} style={{transform:'rotate(-90deg)'}}>
              <circle cx={80} cy={80} r={68} fill="none" stroke={T.border} strokeWidth={10}/>
              <circle cx={80} cy={80} r={68} fill="none" stroke={pomMode==='focus'?T.red:T.accent} strokeWidth={10}
                strokeDasharray={`${2*Math.PI*68*(pomPct/100)} ${2*Math.PI*68}`} strokeLinecap="round"
                style={{transition:'stroke-dasharray 1s linear'}}/>
            </svg>
            <div style={{position:'absolute',textAlign:'center'}}>
              <div style={{fontSize:38,fontWeight:800,color:T.text,lineHeight:1}}>{fmtTime(pomSeconds)}</div>
              <div style={{fontSize:11,color:T.muted,marginTop:4}}>{pomCycles} ciclos · {studyMin}min hoy</div>
            </div>
          </div>
          <div style={{display:'flex',gap:10,justifyContent:'center',marginBottom:16}}>
            <Btn onClick={()=>setPomActive(!pomActive)} style={{padding:'10px 28px',fontSize:14}}>
              {pomActive?'⏸ Pausar':'▶ Iniciar'}
            </Btn>
            <button onClick={()=>{setPomActive(false);setPomSeconds(25*60);setPomMode('focus');}}
              style={{padding:'10px 16px',borderRadius:12,border:`1px solid ${T.border}`,background:'transparent',color:T.muted,cursor:'pointer',fontSize:16,fontFamily:'inherit'}}>↺</button>
          </div>
          {learnings.length>0&&(
            <div style={{borderTop:`1px solid ${T.border}`,paddingTop:14}}>
              <div style={{fontSize:11,color:T.muted,marginBottom:8}}>Estudiando:</div>
              <div style={{display:'flex',gap:6,flexWrap:'wrap',justifyContent:'center'}}>
                {learnings.map((l,i)=>{
                  const color=lColor(l,i);
                  const isSel=selCourse===l.id;
                  return (
                    <button key={l.id} onClick={()=>setSelCourse(isSel?null:l.id)}
                      style={{padding:'5px 12px',borderRadius:8,border:`1px solid ${isSel?color:T.border}`,background:isSel?`${color}20`:'transparent',color:isSel?color:T.muted,cursor:'pointer',fontSize:11,fontFamily:'inherit'}}>
                      {l.title.split(' ')[0]}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* ── IDEAS MOODBOARD ── */}
      {tab==='ideas'&&(
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
            <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
              <button onClick={()=>setIdeaFilter('all')}
                style={{padding:'4px 12px',borderRadius:8,border:`1px solid ${ideaFilter==='all'?T.purple:T.border}`,background:ideaFilter==='all'?`${T.purple}18`:'transparent',color:ideaFilter==='all'?T.purple:T.muted,cursor:'pointer',fontSize:11,fontFamily:'inherit'}}>
                Todas ({ideas.length})
              </button>
              {uniqueTags.map(t=>{
                const cnt=ideas.filter(i=>i.tag===t).length;
                return (
                  <button key={t} onClick={()=>setIdeaFilter(ideaFilter===t?'all':t)}
                    style={{padding:'4px 12px',borderRadius:8,border:`1px solid ${ideaFilter===t?T.purple:T.border}`,background:ideaFilter===t?`${T.purple}18`:'transparent',color:ideaFilter===t?T.purple:T.muted,cursor:'pointer',fontSize:11,fontFamily:'inherit'}}>
                    {t} ({cnt})
                  </button>
                );
              })}
            </div>
            <Btn size="sm" onClick={()=>setIdeaModal(true)}><Icon name="plus" size={12}/>Idea</Btn>
          </div>
          {/* Moodboard grid */}
          <div style={{columns:isMobile?1:2,gap:12,columnFill:'balance'}}>
            {filteredIdeas.map((idea,idx)=>{
              const tagColors={'💡 Idea':T.blue,'✍️ Escritura':T.purple,'🎓 Educación':T.orange,'📋 Plantilla':T.accent,'🚀 Proyecto':T.red,'🔧 Herramienta':T.yellow};
              const color=tagColors[idea.tag]||T.blue;
              const isLong=idea.content.length>120;
              const isShort=idea.content.length<40;
              const tagEmoji=idea.tag.split(' ')[0];
              return (
                <div key={idea.id} style={{
                  breakInside:'avoid',marginBottom:12,
                  background:`linear-gradient(135deg, ${color}08, ${color}04)`,
                  border:`1.5px solid ${color}30`,
                  borderRadius:16,
                  padding:isShort?'16px 18px':'18px 18px 14px',
                  position:'relative',
                  overflow:'hidden',
                }}>
                  {/* Decorative bg emoji */}
                  <div style={{position:'absolute',top:-8,right:-8,fontSize:isLong?64:48,opacity:0.06,pointerEvents:'none',lineHeight:1}}>{tagEmoji}</div>
                  {/* Tag + date header */}
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:isShort?6:10,position:'relative',zIndex:1}}>
                    <span style={{fontSize:11,fontWeight:700,color,background:`${color}18`,padding:'3px 10px',borderRadius:8}}>{idea.tag}</span>
                    <div style={{display:'flex',gap:6,alignItems:'center'}}>
                      {idea.createdAt&&<span style={{fontSize:9,color:T.dim}}>{fmt(idea.createdAt)}</span>}
                      <button onClick={()=>delIdea(idea.id)} style={{background:'none',border:'none',color:T.dim,cursor:'pointer',padding:2,display:'flex'}}><Icon name="trash" size={11}/></button>
                    </div>
                  </div>
                  {/* Content */}
                  <p style={{fontSize:isShort?15:13,color:T.text,margin:0,lineHeight:1.65,position:'relative',zIndex:1,fontWeight:isShort?600:400}}>{idea.content}</p>
                  {/* Bottom accent bar */}
                  <div style={{height:2,background:`linear-gradient(90deg, ${color}60, transparent)`,borderRadius:2,marginTop:isShort?8:12}}/>
                </div>
              );
            })}
          </div>
          {!filteredIdeas.length&&<div style={{textAlign:'center',padding:'30px 0',color:T.dim}}><div style={{fontSize:48,marginBottom:10}}>💡</div><p style={{fontSize:14,marginBottom:4}}>Sin ideas aún — ¡captura todo!</p><p style={{fontSize:12,color:T.dim}}>Las ideas son semillas: captura rápido, clasifica después.</p><Btn size="sm" onClick={()=>setIdeaModal(true)} style={{marginTop:12}}><Icon name="plus" size={12}/>Nueva idea</Btn></div>}
          {ideaModal&&<Modal title="Nueva idea" onClose={()=>setIdeaModal(false)}>
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              <Textarea value={ideaForm.content} onChange={v=>setIdeaForm(f=>({...f,content:v}))} placeholder="¿Qué tienes en mente?" rows={4}/>
              <Select value={ideaForm.tag} onChange={v=>setIdeaForm(f=>({...f,tag:v}))}>
                {IDEA_TAGS.map(t=><option key={t} value={t}>{t}</option>)}
              </Select>
              <Btn onClick={saveIdea} style={{width:'100%',justifyContent:'center'}}>Guardar idea</Btn>
            </div>
          </Modal>}
        </div>
      )}

      {/* ── RETROSPECTIVA ── */}
      {tab==='retro'&&(
        <div>
          <Card style={{padding:18,marginBottom:14}}>
            <div style={{fontWeight:700,fontSize:14,color:T.text,marginBottom:4}}>📋 Retrospectiva semanal</div>
            <div style={{fontSize:12,color:T.muted,marginBottom:14}}>{new Date().toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'})}</div>
            {[
              {key:'bien',q:'¿Qué salió bien esta semana?',color:T.accent,icon:'✅'},
              {key:'mejorar',q:'¿Qué mejorar la próxima semana?',color:T.orange,icon:'🔧'},
              {key:'aprendi',q:'¿Qué aprendí?',color:T.blue,icon:'💡'},
              {key:'intencion',q:'Intención para la próxima semana',color:T.purple,icon:'🎯'},
            ].map(s=>(
              <div key={s.key} style={{marginBottom:14}}>
                <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6}}>
                  <span>{s.icon}</span>
                  <span style={{fontSize:12,fontWeight:700,color:s.color}}>{s.q}</span>
                </div>
                <Textarea value={retroForm[s.key]} onChange={v=>setRetroForm(f=>({...f,[s.key]:v}))} placeholder="" rows={2}/>
              </div>
            ))}
            <Btn onClick={saveRetro} style={{width:'100%',justifyContent:'center'}}>Guardar retrospectiva</Btn>
          </Card>
          {retros.length>0&&(
            <div>
              <h3 style={{color:T.muted,fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:1,marginBottom:10}}>Retrospectivas anteriores</h3>
              {retros.slice(0,3).map(r=>(
                <Card key={r.id} style={{marginBottom:10,padding:14}}>
                  <div style={{fontSize:11,color:T.muted,marginBottom:8}}>{fmt(r.date)}</div>
                  {r.bien&&<p style={{fontSize:12,color:T.text,margin:'0 0 4px'}}><span style={{color:T.accent}}>✅</span> {r.bien}</p>}
                  {r.aprendi&&<p style={{fontSize:12,color:T.text,margin:0}}><span style={{color:T.blue}}>💡</span> {r.aprendi}</p>}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};


// ===================== HOGAR =====================
// ===================== COCHE =====================
const FUEL_OPTIONS=['gasolina','diésel','eléctrico','GLP','GNC'];
const FuelForm=({form,setForm})=>(
  <div style={{display:'flex',flexDirection:'column',gap:10}}>
    <div><label style={{fontSize:12,color:T.muted,display:'block',marginBottom:4}}>Tipo de energía</label>
      <Select value={form.fuelType||'gasolina'} onChange={v=>setForm(f=>({...f,fuelType:v}))}>
        {['gasolina','diésel','híbrido','eléctrico','GLP','GNC'].map(o=><option key={o} value={o}>{o.charAt(0).toUpperCase()+o.slice(1)}</option>)}
      </Select>
    </div>
    {form.fuelType==='híbrido'&&(
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        <div><label style={{fontSize:12,color:T.muted,display:'block',marginBottom:4}}>⚡ Energía 1</label>
          <Select value={form.fuelType1||'gasolina'} onChange={v=>setForm(f=>({...f,fuelType1:v}))}>
            {FUEL_OPTIONS.map(o=><option key={o} value={o}>{o.charAt(0).toUpperCase()+o.slice(1)}</option>)}
          </Select>
        </div>
        <div><label style={{fontSize:12,color:T.muted,display:'block',marginBottom:4}}>⚡ Energía 2</label>
          <Select value={form.fuelType2||'GLP'} onChange={v=>setForm(f=>({...f,fuelType2:v}))}>
            {FUEL_OPTIONS.map(o=><option key={o} value={o}>{o.charAt(0).toUpperCase()+o.slice(1)}</option>)}
          </Select>
        </div>
      </div>
    )}
  </div>
);

const Coche = ({data,setData,isMobile,onBack,embedded=false}) => {
  const [tab,setTab]     = useState('resumen');
  const [modalMaint,setModalMaint]   = useState(false);
  const [modalExp,setModalExp]       = useState(false);
  const [modalDoc,setModalDoc]       = useState(false);
  const [modalReminder,setModalReminder] = useState(false);
  const [modalInfo,setModalInfo]     = useState(false);
  const [modalNewVehicle,setModalNewVehicle] = useState(false);
  const [editItem,setEditItem]       = useState(null);
  const [editForm,setEditForm]       = useState({});

  const emptyMaint   = {name:'',category:'',lastDone:'',frequencyKm:'',frequencyDays:'',cost:'',notes:''};
  const emptyExp     = {concept:'',category:'Combustible',amount:'',date:today(),notes:''};
  const emptyDoc     = {name:'',category:'Seguro',expiresAt:'',provider:'',amount:'',notes:''};
  const emptyReminder= {title:'',dueDate:'',notes:'',done:false};
  const emptyVehicle = {brand:'',model:'',year:'',plate:'',km:'',fuelType:'gasolina',fuelType1:'',fuelType2:''};
  const [maintForm,setMaintForm]     = useState(emptyMaint);
  const [expForm,setExpForm]         = useState(emptyExp);
  const [docForm,setDocForm]         = useState(emptyDoc);
  const [reminderForm,setReminderForm] = useState(emptyReminder);
  const [infoForm,setInfoForm]       = useState({brand:'',model:'',year:'',plate:'',km:'',fuelType:'gasolina',fuelType1:'',fuelType2:''});
  const [newVehicleForm,setNewVehicleForm] = useState(emptyVehicle);

  const maints   = data.carMaintenances||[];
  const expenses = data.carExpenses||[];
  const docs     = data.carDocs||[];
  const reminders= data.carReminders||[];
  const carInfo  = data.carInfo||{brand:'',model:'',year:'',plate:'',km:'',fuelType:'gasolina',fuelType1:'',fuelType2:''};

  // ── Multi-vehicle ──
  const vehicles = data.vehicles||[];
  const activeVehicleId = data.activeVehicleId||null;

  const switchVehicle=(v)=>{
    setData(d=>({...d,carInfo:v,activeVehicleId:v.id}));
    save('carInfo',v); save('activeVehicleId',v.id);
  };
  const saveNewVehicle=()=>{
    if(!newVehicleForm.brand.trim()) return;
    const v={...newVehicleForm,id:uid(),createdAt:today()};
    const upd=[...vehicles,v];
    setData(d=>({...d,vehicles:upd}));
    save('vehicles',upd);
    setModalNewVehicle(false);
    setNewVehicleForm(emptyVehicle);
  };
  const deleteVehicle=(vid)=>{
    if(!window.confirm('¿Eliminar este vehículo?')) return;
    const upd=vehicles.filter(v=>v.id!==vid);
    setData(d=>({...d,vehicles:upd}));
    save('vehicles',upd);
  };

  // Helper: label de combustible
  const fuelLabel=(ci)=>{
    if(ci.fuelType==='híbrido'&&ci.fuelType1&&ci.fuelType2) return `Híbrido (${ci.fuelType1} + ${ci.fuelType2})`;
    return ci.fuelType||'—';
  };

  // ── helpers ──
  const diffDays=(dateStr)=>{ if(!dateStr) return null; return Math.ceil((new Date(dateStr)-new Date())/(1000*60*60*24)); };
  const fmtDate=(d)=>{ try{ return new Date(d+'T12:00:00').toLocaleDateString('es-ES',{day:'2-digit',month:'short',year:'numeric'}); }catch{return d||'—';} };
  const fmtMoney=(n)=>`$${Number(n||0).toLocaleString('es-MX',{minimumFractionDigits:0,maximumFractionDigits:0})}`;

  // ── status ──
  const maintStatus=(m)=>{
    if(!m.lastDone) return {label:'Sin registrar',color:T.muted};
    if(m.frequencyDays){
      const d=new Date(m.lastDone); d.setDate(d.getDate()+Number(m.frequencyDays));
      const diff=Math.ceil((d-new Date())/(1000*60*60*24));
      if(diff<=0)  return {label:`Vencido hace ${Math.abs(diff)}d`,color:T.red};
      if(diff<=14) return {label:`En ${diff} días`,color:T.orange};
      return {label:`En ${diff} días`,color:T.green};
    }
    return {label:'Ver fecha',color:T.muted};
  };
  const docStatus=(doc)=>{
    if(!doc.expiresAt) return {label:'Sin vencimiento',color:T.muted};
    const d=diffDays(doc.expiresAt);
    if(d<0)   return {label:`Vencido hace ${Math.abs(d)}d`,color:T.red};
    if(d<=30) return {label:`Vence en ${d}d`,color:T.orange};
    return {label:fmtDate(doc.expiresAt),color:T.green};
  };

  // ── alerts ──
  const alertMaints  = maints.filter(m=>{ const s=maintStatus(m); return s.color===T.red||s.color===T.orange; });
  const alertDocs    = docs.filter(d=>{ const s=docStatus(d); return s.color===T.red||s.color===T.orange; });
  const pendingRems  = reminders.filter(r=>!r.done);
  const overdueRems  = pendingRems.filter(r=>r.dueDate&&diffDays(r.dueDate)<=0);

  // ── this month expenses ──
  const thisMonth = today().slice(0,7);
  const monthTotal = expenses.filter(e=>e.date?.slice(0,7)===thisMonth).reduce((s,e)=>s+(Number(e.amount)||0),0);
  const totalExpenses = expenses.reduce((s,e)=>s+(Number(e.amount)||0),0);

  // ── MAINT actions ──
  const MAINT_CATS=['Aceite','Filtros','Frenos','Neumáticos','Batería','Correa distribución','Bujías','Climatización','Revisión general','Otro'];
  const saveMaint=()=>{
    if(!maintForm.name.trim()) return;
    const m={id:uid(),...maintForm,createdAt:today()};
    const upd=[m,...maints]; setData(d=>({...d,carMaintenances:upd})); save('carMaintenances',upd);
    setModalMaint(false); setMaintForm(emptyMaint); toast.success('Mantenimiento añadido');
  };
  const doneMaint=(id)=>{
    const upd=maints.map(m=>m.id===id?{...m,lastDone:today()}:m);
    setData(d=>({...d,carMaintenances:upd})); save('carMaintenances',upd); toast.success('Registrado ✓');
  };
  const delMaint=(id)=>{ const u=maints.filter(m=>m.id!==id); setData(d=>({...d,carMaintenances:u})); save('carMaintenances',u); };
  const updateMaint=()=>{
    const upd=maints.map(m=>m.id===editItem.id?{...m,...editForm}:m);
    setData(d=>({...d,carMaintenances:upd})); save('carMaintenances',upd); setEditItem(null);
  };

  // ── EXPENSE actions ──
  const EXP_CATS=['Combustible','Parking','Peaje','Multa','Lavado','Seguro','ITV','Reparación','Accesorios','Otro'];
  const saveExp=()=>{
    if(!expForm.concept.trim()||!expForm.amount) return;
    const e={id:uid(),...expForm,amount:Number(expForm.amount),createdAt:today()};
    const upd=[e,...expenses]; setData(d=>({...d,carExpenses:upd})); save('carExpenses',upd);
    setModalExp(false); setExpForm(emptyExp); toast.success('Gasto añadido');
  };
  const delExp=(id)=>{ const u=expenses.filter(e=>e.id!==id); setData(d=>({...d,carExpenses:u})); save('carExpenses',u); };
  const updateExp=()=>{
    const upd=expenses.map(e=>e.id===editItem.id?{...e,...editForm,amount:Number(editForm.amount)}:e);
    setData(d=>({...d,carExpenses:upd})); save('carExpenses',upd); setEditItem(null);
  };

  // ── DOC actions ──
  const DOC_CATS=['Seguro','ITV','Permiso de circulación','Garantía','Contrato compra','Ficha técnica','Otro'];
  const saveDoc=()=>{
    if(!docForm.name.trim()) return;
    const d={id:uid(),...docForm,createdAt:today()};
    const upd=[d,...docs]; setData(s=>({...s,carDocs:upd})); save('carDocs',upd);
    setModalDoc(false); setDocForm(emptyDoc); toast.success('Documento añadido');
  };
  const delDoc=(id)=>{ const u=docs.filter(d=>d.id!==id); setData(s=>({...s,carDocs:u})); save('carDocs',u); };
  const updateDoc=()=>{
    const upd=docs.map(d=>d.id===editItem.id?{...d,...editForm}:d);
    setData(s=>({...s,carDocs:upd})); save('carDocs',upd); setEditItem(null);
  };

  // ── REMINDER actions ──
  const saveReminder=()=>{
    if(!reminderForm.title.trim()) return;
    const r={id:uid(),...reminderForm,done:false,createdAt:today()};
    const upd=[r,...reminders]; setData(d=>({...d,carReminders:upd})); save('carReminders',upd);
    setModalReminder(false); setReminderForm(emptyReminder); toast.success('Recordatorio añadido');
  };
  const toggleReminder=(id)=>{
    const upd=reminders.map(r=>r.id===id?{...r,done:!r.done}:r);
    setData(d=>({...d,carReminders:upd})); save('carReminders',upd);
  };
  const delReminder=(id)=>{ const u=reminders.filter(r=>r.id!==id); setData(d=>({...d,carReminders:u})); save('carReminders',u); };

  // ── INFO actions ──
  const saveInfo=()=>{
    const updated={...infoForm,id:infoForm.id||uid()};
    // Also update in vehicles array if it's there
    const inVehicles=vehicles.some(v=>v.id===updated.id);
    if(inVehicles){
      const updVeh=vehicles.map(v=>v.id===updated.id?updated:v);
      setData(d=>({...d,carInfo:updated,vehicles:updVeh}));
      save('carInfo',updated); save('vehicles',updVeh);
    } else {
      setData(d=>({...d,carInfo:updated})); save('carInfo',updated);
    }
    setModalInfo(false); toast.success('Datos del coche guardados');
  };

  const TABS=[
    {id:'resumen',label:'Resumen',emoji:'🏁'},
    {id:'mantenimiento',label:'Manten.',emoji:'🔧'},
    {id:'gastos',label:'Gastos',emoji:'💸'},
    {id:'documentos',label:'Docs',emoji:'📄'},
    {id:'recordatorios',label:'Alertas',emoji:'🔔'},
  ];

  // ── FuelForm component (reusable in both modals) ──
  return (
    <div>
      {!embedded&&<PageHeader isMobile={isMobile} title="🚗 Mi Coche" onBack={onBack}
        subtitle={carInfo.brand?`${carInfo.brand} ${carInfo.model} ${carInfo.year} · ${carInfo.plate}`:'Gestión completa de tu vehículo'}
        action={
          <div style={{display:'flex',gap:8}}>
            <Btn size="sm" variant="ghost" onClick={()=>setModalNewVehicle(true)}>+ Vehículo</Btn>
            <Btn size="sm" variant="ghost" onClick={()=>{setInfoForm({...carInfo});setModalInfo(true);}}>⚙️ Datos</Btn>
            {tab==='mantenimiento'  &&<Btn size="sm" onClick={()=>setModalMaint(true)}><Icon name="plus" size={14}/>Mant.</Btn>}
            {tab==='gastos'        &&<Btn size="sm" onClick={()=>setModalExp(true)}><Icon name="plus" size={14}/>Gasto</Btn>}
            {tab==='documentos'    &&<Btn size="sm" onClick={()=>setModalDoc(true)}><Icon name="plus" size={14}/>Doc</Btn>}
            {tab==='recordatorios' &&<Btn size="sm" onClick={()=>setModalReminder(true)}><Icon name="plus" size={14}/>Alerta</Btn>}
          </div>
        }
      />}

      {/* embedded header substitute */}
      {embedded&&(
        <div style={{marginBottom:12}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
            <div style={{fontSize:13,color:T.muted}}>{carInfo.brand?`${carInfo.brand} ${carInfo.model} ${carInfo.year} · ${carInfo.plate}`:'Sin datos del vehículo'}</div>
            <div style={{display:'flex',gap:6}}>
              <Btn size="sm" variant="ghost" onClick={()=>setModalNewVehicle(true)}>🚙 +</Btn>
              <Btn size="sm" variant="ghost" onClick={()=>{setInfoForm({...carInfo});setModalInfo(true);}}>⚙️ Datos</Btn>
            </div>
          </div>
          {/* vehicle pills in embedded mode */}
          {vehicles.length>0&&(
            <div style={{display:'flex',gap:6,overflowX:'auto',paddingBottom:2}}>
              <button onClick={()=>{setData(d=>({...d,activeVehicleId:null}));save('activeVehicleId',null);}}
                style={{border:`2px solid ${!activeVehicleId?T.accent:T.border}`,borderRadius:20,padding:'4px 10px',cursor:'pointer',
                  background:!activeVehicleId?T.accent+'22':T.surface,color:!activeVehicleId?T.accent:T.muted,
                  fontFamily:'inherit',fontSize:11,fontWeight:600,whiteSpace:'nowrap'}}>
                🚗 {carInfo.brand||'Principal'}
              </button>
              {vehicles.map(v=>(
                <div key={v.id} style={{display:'flex',alignItems:'center',gap:3}}>
                  <button onClick={()=>switchVehicle(v)}
                    style={{border:`2px solid ${activeVehicleId===v.id?T.accent:T.border}`,borderRadius:20,padding:'4px 10px',cursor:'pointer',
                      background:activeVehicleId===v.id?T.accent+'22':T.surface,color:activeVehicleId===v.id?T.accent:T.muted,
                      fontFamily:'inherit',fontSize:11,fontWeight:600,whiteSpace:'nowrap'}}>
                    🚙 {v.brand} {v.model}
                  </button>
                  <button onClick={()=>deleteVehicle(v.id)} style={{background:'none',border:'none',cursor:'pointer',color:T.muted,fontSize:13,padding:2}}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tabs ── */}
      <div style={{display:'flex',gap:6,marginBottom:18,overflowX:'auto',paddingBottom:4}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{border:'none',borderRadius:10,padding:'7px 14px',cursor:'pointer',fontFamily:'inherit',fontSize:12,fontWeight:600,whiteSpace:'nowrap',
              background:tab===t.id?T.accent:T.surface,color:tab===t.id?'#000':T.muted,
              borderBottom:tab===t.id?`2px solid ${T.accent}`:'2px solid transparent'}}>
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {/* ── Vehicle switcher ── */}
      {vehicles.length>0&&(
        <div style={{display:'flex',gap:8,marginBottom:14,overflowX:'auto',paddingBottom:2,alignItems:'center'}}>
          <span style={{fontSize:11,color:T.muted,whiteSpace:'nowrap'}}>Vehículos:</span>
          {/* Primary vehicle */}
          <button onClick={()=>{setData(d=>({...d,activeVehicleId:null}));save('activeVehicleId',null);}}
            style={{border:`2px solid ${!activeVehicleId?T.accent:T.border}`,borderRadius:20,padding:'5px 12px',cursor:'pointer',
              background:!activeVehicleId?T.accent+'22':T.surface,color:!activeVehicleId?T.accent:T.muted,
              fontFamily:'inherit',fontSize:12,fontWeight:600,whiteSpace:'nowrap'}}>
            🚗 {carInfo.brand||'Principal'}
          </button>
          {vehicles.map(v=>(
            <div key={v.id} style={{display:'flex',alignItems:'center',gap:4}}>
              <button onClick={()=>switchVehicle(v)}
                style={{border:`2px solid ${activeVehicleId===v.id?T.accent:T.border}`,borderRadius:20,padding:'5px 12px',cursor:'pointer',
                  background:activeVehicleId===v.id?T.accent+'22':T.surface,color:activeVehicleId===v.id?T.accent:T.muted,
                  fontFamily:'inherit',fontSize:12,fontWeight:600,whiteSpace:'nowrap'}}>
                🚙 {v.brand} {v.model}
              </button>
              <button onClick={()=>deleteVehicle(v.id)}
                style={{background:'none',border:'none',cursor:'pointer',color:T.muted,fontSize:14,padding:2}}>×</button>
            </div>
          ))}
          <button onClick={()=>setModalNewVehicle(true)}
            style={{border:`2px dashed ${T.border}`,borderRadius:20,padding:'5px 12px',cursor:'pointer',
              background:'none',color:T.muted,fontFamily:'inherit',fontSize:12,whiteSpace:'nowrap'}}>
            + Añadir
          </button>
        </div>
      )}

      {/* ══════════ RESUMEN ══════════ */}
      {tab==='resumen'&&(
        <div>
          {/* summary cards */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
            {[
              {label:'Alertas mant.',val:alertMaints.length,color:alertMaints.length>0?T.red:T.green,icon:'🔧'},
              {label:'Docs por vencer',val:alertDocs.length,color:alertDocs.length>0?T.orange:T.green,icon:'📄'},
              {label:'Recordatorios',val:overdueRems.length,color:overdueRems.length>0?T.red:T.green,icon:'🔔'},
              {label:'Gasto este mes',val:fmtMoney(monthTotal),color:T.blue,icon:'💸'},
            ].map(s=>(
              <Card key={s.label} style={{textAlign:'center',padding:14}}>
                <div style={{fontSize:18,marginBottom:4}}>{s.icon}</div>
                <div style={{fontSize:20,fontWeight:700,color:s.color}}>{s.val}</div>
                <div style={{fontSize:11,color:T.muted,marginTop:2}}>{s.label}</div>
              </Card>
            ))}
          </div>

          {/* car info card */}
          {carInfo.brand?(
            <Card style={{marginBottom:14,padding:16}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                <div>
                  <div style={{fontSize:16,fontWeight:700,color:T.text}}>{carInfo.brand} {carInfo.model}</div>
                  <div style={{fontSize:13,color:T.muted,marginTop:3}}>{carInfo.year} · {carInfo.plate} · {fuelLabel(carInfo)}</div>
                  {carInfo.km&&<div style={{fontSize:13,color:T.accent,marginTop:3,fontWeight:600}}>🛣 {Number(carInfo.km).toLocaleString()} km</div>}
                </div>
                <div style={{fontSize:36}}>🚗</div>
              </div>
            </Card>
          ):(
            <Card style={{marginBottom:14,padding:20,textAlign:'center',cursor:'pointer'}} onClick={()=>{setInfoForm({...carInfo});setModalInfo(true);}}>
              <div style={{fontSize:28,marginBottom:8}}>🚗</div>
              <div style={{fontSize:14,color:T.muted}}>Añade los datos de tu coche</div>
              <div style={{fontSize:12,color:T.dim,marginTop:4}}>Marca, modelo, matrícula…</div>
            </Card>
          )}

          {/* next maintenance */}
          {maints.length>0&&(
            <Card style={{marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:600,color:T.muted,marginBottom:10}}>🔧 Próximos mantenimientos</div>
              {maints.slice(0,3).map(m=>{
                const st=maintStatus(m);
                return (
                  <div key={m.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:`1px solid ${T.border}`}}>
                    <div>
                      <div style={{fontSize:13,color:T.text,fontWeight:500}}>{m.name}</div>
                      {m.category&&<div style={{fontSize:11,color:T.dim}}>{m.category}</div>}
                    </div>
                    <span style={{fontSize:11,color:st.color,fontWeight:600}}>{st.label}</span>
                  </div>
                );
              })}
            </Card>
          )}

          {/* pending reminders */}
          {pendingRems.length>0&&(
            <Card>
              <div style={{fontSize:13,fontWeight:600,color:T.muted,marginBottom:10}}>🔔 Recordatorios pendientes</div>
              {pendingRems.slice(0,3).map(r=>(
                <div key={r.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:`1px solid ${T.border}`}}>
                  <span style={{fontSize:13,color:T.text}}>{r.title}</span>
                  {r.dueDate&&<span style={{fontSize:11,color:diffDays(r.dueDate)<=0?T.red:T.muted}}>{fmtDate(r.dueDate)}</span>}
                </div>
              ))}
            </Card>
          )}
        </div>
      )}

      {/* ══════════ MANTENIMIENTO ══════════ */}
      {tab==='mantenimiento'&&(
        <div>
          {maints.length===0&&(
            <Card style={{textAlign:'center',padding:32}}>
              <div style={{fontSize:32,marginBottom:8}}>🔧</div>
              <div style={{color:T.muted,fontSize:14}}>Sin mantenimientos registrados</div>
              <div style={{color:T.dim,fontSize:12,marginTop:4}}>Añade aceite, frenos, neumáticos…</div>
            </Card>
          )}
          {maints.map(m=>{
            const st=maintStatus(m);
            return (
              <Card key={m.id} style={{marginBottom:10}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8}}>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
                      <span style={{fontSize:14,fontWeight:600,color:T.text}}>{m.name}</span>
                      {m.category&&<Tag text={m.category} color={T.blue}/>}
                    </div>
                    {m.lastDone&&<div style={{fontSize:12,color:T.dim}}>Último: {fmtDate(m.lastDone)}</div>}
                    {m.frequencyDays&&<div style={{fontSize:12,color:T.dim}}>Cada {m.frequencyDays} días</div>}
                    {m.frequencyKm&&<div style={{fontSize:12,color:T.dim}}>Cada {Number(m.frequencyKm).toLocaleString()} km</div>}
                    {m.cost&&<div style={{fontSize:12,color:T.accent}}>Coste: {fmtMoney(m.cost)}</div>}
                    {m.notes&&<div style={{fontSize:12,color:T.muted,marginTop:3}}>{m.notes}</div>}
                    <div style={{marginTop:6}}>
                      <span style={{fontSize:11,fontWeight:700,color:st.color,background:`${st.color}18`,padding:'2px 8px',borderRadius:8}}>{st.label}</span>
                    </div>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:6,alignItems:'flex-end'}}>
                    <button onClick={()=>doneMaint(m.id)} style={{background:T.accent,border:'none',borderRadius:8,padding:'5px 10px',cursor:'pointer',color:'#000',fontSize:11,fontWeight:700}}>✓ Hecho</button>
                    <button onClick={()=>{setEditItem(m);setEditForm({...m});}} style={{background:'none',border:`1px solid ${T.border}`,borderRadius:8,padding:'4px 10px',cursor:'pointer',color:T.muted,fontSize:11}}>Editar</button>
                    <button onClick={()=>delMaint(m.id)} style={{background:'none',border:'none',cursor:'pointer',color:T.dim,padding:4}}><Icon name="trash" size={14}/></button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ══════════ GASTOS ══════════ */}
      {tab==='gastos'&&(
        <div>
          {/* monthly summary */}
          <Card style={{marginBottom:14,padding:14}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div style={{fontSize:13,color:T.muted}}>Este mes</div>
                <div style={{fontSize:22,fontWeight:700,color:T.accent}}>{fmtMoney(monthTotal)}</div>
              </div>
              <div>
                <div style={{fontSize:13,color:T.muted}}>Total acumulado</div>
                <div style={{fontSize:18,fontWeight:600,color:T.text}}>{fmtMoney(totalExpenses)}</div>
              </div>
            </div>
          </Card>

          {expenses.length===0&&(
            <Card style={{textAlign:'center',padding:32}}>
              <div style={{fontSize:32,marginBottom:8}}>💸</div>
              <div style={{color:T.muted,fontSize:14}}>Sin gastos registrados</div>
            </Card>
          )}

          {/* group by category for this month */}
          {expenses.length>0&&(()=>{
            const bycat={};
            expenses.filter(e=>e.date?.slice(0,7)===thisMonth).forEach(e=>{ bycat[e.category]=(bycat[e.category]||0)+Number(e.amount); });
            const cats=Object.entries(bycat).sort((a,b)=>b[1]-a[1]);
            const catColors={'Combustible':T.orange,'Parking':T.blue,'Peaje':T.purple,'Multa':T.red,'Lavado':T.teal,'Seguro':T.accent,'ITV':T.yellow,'Reparación':T.red,'Accesorios':T.blue,'Otro':T.muted};
            return cats.length>0&&(
              <Card style={{marginBottom:14}}>
                <div style={{fontSize:13,fontWeight:600,color:T.muted,marginBottom:10}}>Distribución este mes</div>
                {cats.map(([cat,amt])=>(
                  <HBar key={cat} label={cat} value={amt} total={monthTotal} color={catColors[cat]||T.muted} amount={amt}/>
                ))}
              </Card>
            );
          })()}

          {expenses.slice(0,30).map(e=>(
            <Card key={e.id} style={{marginBottom:8,padding:'12px 14px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <span style={{fontSize:13,fontWeight:600,color:T.text}}>{e.concept}</span>
                    <Tag text={e.category} color={T.blue}/>
                  </div>
                  {e.date&&<div style={{fontSize:11,color:T.dim,marginTop:2}}>{fmtDate(e.date)}</div>}
                  {e.notes&&<div style={{fontSize:12,color:T.muted,marginTop:2}}>{e.notes}</div>}
                </div>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <span style={{fontSize:15,fontWeight:700,color:T.red}}>{fmtMoney(e.amount)}</span>
                  <button onClick={()=>{setEditItem(e);setEditForm({...e});}} style={{background:'none',border:`1px solid ${T.border}`,borderRadius:8,padding:'3px 8px',cursor:'pointer',color:T.muted,fontSize:11}}>✏️</button>
                  <button onClick={()=>delExp(e.id)} style={{background:'none',border:'none',cursor:'pointer',color:T.dim}}><Icon name="trash" size={14}/></button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ══════════ DOCUMENTOS ══════════ */}
      {tab==='documentos'&&(
        <div>
          {docs.length===0&&(
            <Card style={{textAlign:'center',padding:32}}>
              <div style={{fontSize:32,marginBottom:8}}>📄</div>
              <div style={{color:T.muted,fontSize:14}}>Sin documentos registrados</div>
              <div style={{color:T.dim,fontSize:12,marginTop:4}}>Seguro, ITV, permiso de circulación…</div>
            </Card>
          )}
          {docs.map(d=>{
            const st=docStatus(d);
            return (
              <Card key={d.id} style={{marginBottom:10}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8}}>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
                      <span style={{fontSize:14,fontWeight:600,color:T.text}}>{d.name}</span>
                      <Tag text={d.category} color={T.purple}/>
                    </div>
                    {d.provider&&<div style={{fontSize:12,color:T.muted}}>Proveedor: {d.provider}</div>}
                    {d.amount&&<div style={{fontSize:12,color:T.accent}}>Importe: {fmtMoney(d.amount)}</div>}
                    {d.notes&&<div style={{fontSize:12,color:T.muted,marginTop:3}}>{d.notes}</div>}
                    <div style={{marginTop:6}}>
                      <span style={{fontSize:11,fontWeight:700,color:st.color,background:`${st.color}18`,padding:'2px 8px',borderRadius:8}}>{st.label}</span>
                    </div>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:6,alignItems:'flex-end'}}>
                    <button onClick={()=>{setEditItem(d);setEditForm({...d});}} style={{background:'none',border:`1px solid ${T.border}`,borderRadius:8,padding:'4px 10px',cursor:'pointer',color:T.muted,fontSize:11}}>Editar</button>
                    <button onClick={()=>delDoc(d.id)} style={{background:'none',border:'none',cursor:'pointer',color:T.dim,padding:4}}><Icon name="trash" size={14}/></button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ══════════ RECORDATORIOS ══════════ */}
      {tab==='recordatorios'&&(
        <div>
          {reminders.length===0&&(
            <Card style={{textAlign:'center',padding:32}}>
              <div style={{fontSize:32,marginBottom:8}}>🔔</div>
              <div style={{color:T.muted,fontSize:14}}>Sin recordatorios</div>
              <div style={{color:T.dim,fontSize:12,marginTop:4}}>ITV próxima, revisión anual…</div>
            </Card>
          )}
          {reminders.map(r=>{
            const overdue=r.dueDate&&diffDays(r.dueDate)<=0&&!r.done;
            return (
              <Card key={r.id} style={{marginBottom:10,opacity:r.done?0.5:1}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8}}>
                  <div style={{display:'flex',gap:10,flex:1}}>
                    <button onClick={()=>toggleReminder(r.id)} style={{background:r.done?T.accent:T.surface2,border:`2px solid ${r.done?T.accent:T.border}`,borderRadius:6,width:22,height:22,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:1}}>
                      {r.done&&<Icon name="check" size={13} color="#000"/>}
                    </button>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,fontWeight:600,color:r.done?T.dim:T.text,textDecoration:r.done?'line-through':'none'}}>{r.title}</div>
                      {r.dueDate&&<div style={{fontSize:12,marginTop:2,fontWeight:overdue?700:400,color:overdue?T.red:T.muted}}>{overdue?'⚠️ Vencido: ':''}{fmtDate(r.dueDate)}</div>}
                      {r.notes&&<div style={{fontSize:12,color:T.dim,marginTop:3}}>{r.notes}</div>}
                    </div>
                  </div>
                  <button onClick={()=>delReminder(r.id)} style={{background:'none',border:'none',cursor:'pointer',color:T.dim,padding:4}}><Icon name="trash" size={14}/></button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ══════════ MODALES ══════════ */}

      {/* Modal: Nuevo vehículo */}
      {modalNewVehicle&&(
        <Modal title="🚙 Añadir vehículo" onClose={()=>setModalNewVehicle(false)}>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <div><label style={{fontSize:12,color:T.muted,display:'block',marginBottom:4}}>Marca *</label><Input value={newVehicleForm.brand} onChange={v=>setNewVehicleForm(f=>({...f,brand:v}))} placeholder="Honda"/></div>
              <div><label style={{fontSize:12,color:T.muted,display:'block',marginBottom:4}}>Modelo</label><Input value={newVehicleForm.model} onChange={v=>setNewVehicleForm(f=>({...f,model:v}))} placeholder="Civic"/></div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <div><label style={{fontSize:12,color:T.muted,display:'block',marginBottom:4}}>Año</label><Input value={newVehicleForm.year} onChange={v=>setNewVehicleForm(f=>({...f,year:v}))} placeholder="2022"/></div>
              <div><label style={{fontSize:12,color:T.muted,display:'block',marginBottom:4}}>Matrícula</label><Input value={newVehicleForm.plate} onChange={v=>setNewVehicleForm(f=>({...f,plate:v.toUpperCase()}))} placeholder="XYZ 5678"/></div>
            </div>
            <div><label style={{fontSize:12,color:T.muted,display:'block',marginBottom:4}}>Kilómetros actuales</label><Input value={newVehicleForm.km} onChange={v=>setNewVehicleForm(f=>({...f,km:v}))} placeholder="0" type="number"/></div>
            <FuelForm form={newVehicleForm} setForm={setNewVehicleForm}/>
            <Btn onClick={saveNewVehicle}>Añadir vehículo</Btn>
          </div>
        </Modal>
      )}

      {/* Modal: Datos del coche */}
      {modalInfo&&(
        <Modal title="🚗 Datos del coche" onClose={()=>setModalInfo(false)}>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <div><label style={{fontSize:12,color:T.muted,display:'block',marginBottom:4}}>Marca</label><Input value={infoForm.brand} onChange={v=>setInfoForm(f=>({...f,brand:v}))} placeholder="Toyota"/></div>
              <div><label style={{fontSize:12,color:T.muted,display:'block',marginBottom:4}}>Modelo</label><Input value={infoForm.model} onChange={v=>setInfoForm(f=>({...f,model:v}))} placeholder="Corolla"/></div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <div><label style={{fontSize:12,color:T.muted,display:'block',marginBottom:4}}>Año</label><Input value={infoForm.year} onChange={v=>setInfoForm(f=>({...f,year:v}))} placeholder="2021"/></div>
              <div><label style={{fontSize:12,color:T.muted,display:'block',marginBottom:4}}>Matrícula</label><Input value={infoForm.plate} onChange={v=>setInfoForm(f=>({...f,plate:v.toUpperCase()}))} placeholder="1234 ABC"/></div>
            </div>
            <div><label style={{fontSize:12,color:T.muted,display:'block',marginBottom:4}}>Kilómetros actuales</label><Input value={infoForm.km} onChange={v=>setInfoForm(f=>({...f,km:v}))} placeholder="85000" type="number"/></div>
            <FuelForm form={infoForm} setForm={setInfoForm}/>
            <Btn onClick={saveInfo}>Guardar</Btn>
          </div>
        </Modal>
      )}

      {/* Modal: Nuevo mantenimiento */}
      {modalMaint&&(
        <Modal title="🔧 Nuevo mantenimiento" onClose={()=>setModalMaint(false)}>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <div><label style={{fontSize:12,color:T.muted,display:'block',marginBottom:4}}>Nombre *</label><Input value={maintForm.name} onChange={v=>setMaintForm(f=>({...f,name:v}))} placeholder="Cambio de aceite"/></div>
            <div><label style={{fontSize:12,color:T.muted,display:'block',marginBottom:4}}>Categoría</label>
              <Select value={maintForm.category} onChange={v=>setMaintForm(f=>({...f,category:v}))}>
                <option value="">Sin categoría</option>
                {MAINT_CATS.map(c=><option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <div><label style={{fontSize:12,color:T.muted,display:'block',marginBottom:4}}>Última vez</label><Input type="date" value={maintForm.lastDone} onChange={v=>setMaintForm(f=>({...f,lastDone:v}))}/></div>
              <div><label style={{fontSize:12,color:T.muted,display:'block',marginBottom:4}}>Cada (días)</label><Input type="number" value={maintForm.frequencyDays} onChange={v=>setMaintForm(f=>({...f,frequencyDays:v}))} placeholder="365"/></div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <div><label style={{fontSize:12,color:T.muted,display:'block',marginBottom:4}}>Cada (km)</label><Input type="number" value={maintForm.frequencyKm} onChange={v=>setMaintForm(f=>({...f,frequencyKm:v}))} placeholder="10000"/></div>
              <div><label style={{fontSize:12,color:T.muted,display:'block',marginBottom:4}}>Coste aprox.</label><Input type="number" value={maintForm.cost} onChange={v=>setMaintForm(f=>({...f,cost:v}))} placeholder="0"/></div>
            </div>
            <div><label style={{fontSize:12,color:T.muted,display:'block',marginBottom:4}}>Notas</label><Textarea value={maintForm.notes} onChange={v=>setMaintForm(f=>({...f,notes:v}))} placeholder="Notas opcionales" rows={2}/></div>
            <Btn onClick={saveMaint}>Guardar</Btn>
          </div>
        </Modal>
      )}

      {/* Modal: editar mantenimiento */}
      {editItem&&tab==='mantenimiento'&&(
        <Modal title="Editar mantenimiento" onClose={()=>setEditItem(null)}>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <div><label style={{fontSize:12,color:T.muted,display:'block',marginBottom:4}}>Nombre</label><Input value={editForm.name||''} onChange={v=>setEditForm(f=>({...f,name:v}))}/></div>
            <div><label style={{fontSize:12,color:T.muted,display:'block',marginBottom:4}}>Categoría</label>
              <Select value={editForm.category||''} onChange={v=>setEditForm(f=>({...f,category:v}))}>
                <option value="">Sin categoría</option>
                {MAINT_CATS.map(c=><option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <div><label style={{fontSize:12,color:T.muted,display:'block',marginBottom:4}}>Última vez</label><Input type="date" value={editForm.lastDone||''} onChange={v=>setEditForm(f=>({...f,lastDone:v}))}/></div>
              <div><label style={{fontSize:12,color:T.muted,display:'block',marginBottom:4}}>Cada (días)</label><Input type="number" value={editForm.frequencyDays||''} onChange={v=>setEditForm(f=>({...f,frequencyDays:v}))}/></div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <div><label style={{fontSize:12,color:T.muted,display:'block',marginBottom:4}}>Cada (km)</label><Input type="number" value={editForm.frequencyKm||''} onChange={v=>setEditForm(f=>({...f,frequencyKm:v}))}/></div>
              <div><label style={{fontSize:12,color:T.muted,display:'block',marginBottom:4}}>Coste aprox.</label><Input type="number" value={editForm.cost||''} onChange={v=>setEditForm(f=>({...f,cost:v}))}/></div>
            </div>
            <div><label style={{fontSize:12,color:T.muted,display:'block',marginBottom:4}}>Notas</label><Textarea value={editForm.notes||''} onChange={v=>setEditForm(f=>({...f,notes:v}))} rows={2}/></div>
            <div style={{display:'flex',gap:8}}>
              <Btn onClick={updateMaint}>Guardar</Btn>
              <Btn variant="ghost" onClick={()=>setEditItem(null)}>Cancelar</Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Nuevo gasto */}
      {modalExp&&(
        <Modal title="💸 Nuevo gasto" onClose={()=>setModalExp(false)}>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <div><label style={{fontSize:12,color:T.muted,display:'block',marginBottom:4}}>Concepto *</label><Input value={expForm.concept} onChange={v=>setExpForm(f=>({...f,concept:v}))} placeholder="Gasolina full tank"/></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <div><label style={{fontSize:12,color:T.muted,display:'block',marginBottom:4}}>Categoría</label>
                <Select value={expForm.category} onChange={v=>setExpForm(f=>({...f,category:v}))}>
                  {EXP_CATS.map(c=><option key={c} value={c}>{c}</option>)}
                </Select>
              </div>
              <div><label style={{fontSize:12,color:T.muted,display:'block',marginBottom:4}}>Importe *</label><Input type="number" value={expForm.amount} onChange={v=>setExpForm(f=>({...f,amount:v}))} placeholder="0"/></div>
            </div>
            <div><label style={{fontSize:12,color:T.muted,display:'block',marginBottom:4}}>Fecha</label><Input type="date" value={expForm.date} onChange={v=>setExpForm(f=>({...f,date:v}))}/></div>
            <div><label style={{fontSize:12,color:T.muted,display:'block',marginBottom:4}}>Notas</label><Textarea value={expForm.notes} onChange={v=>setExpForm(f=>({...f,notes:v}))} placeholder="Notas opcionales" rows={2}/></div>
            <Btn onClick={saveExp}>Guardar</Btn>
          </div>
        </Modal>
      )}

      {/* Modal: editar gasto */}
      {editItem&&tab==='gastos'&&(
        <Modal title="Editar gasto" onClose={()=>setEditItem(null)}>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <div><label style={{fontSize:12,color:T.muted,display:'block',marginBottom:4}}>Concepto</label><Input value={editForm.concept||''} onChange={v=>setEditForm(f=>({...f,concept:v}))}/></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <div><label style={{fontSize:12,color:T.muted,display:'block',marginBottom:4}}>Categoría</label>
                <Select value={editForm.category||''} onChange={v=>setEditForm(f=>({...f,category:v}))}>
                  {EXP_CATS.map(c=><option key={c} value={c}>{c}</option>)}
                </Select>
              </div>
              <div><label style={{fontSize:12,color:T.muted,display:'block',marginBottom:4}}>Importe</label><Input type="number" value={editForm.amount||''} onChange={v=>setEditForm(f=>({...f,amount:v}))}/></div>
            </div>
            <div><label style={{fontSize:12,color:T.muted,display:'block',marginBottom:4}}>Fecha</label><Input type="date" value={editForm.date||''} onChange={v=>setEditForm(f=>({...f,date:v}))}/></div>
            <div><label style={{fontSize:12,color:T.muted,display:'block',marginBottom:4}}>Notas</label><Textarea value={editForm.notes||''} onChange={v=>setEditForm(f=>({...f,notes:v}))} rows={2}/></div>
            <div style={{display:'flex',gap:8}}>
              <Btn onClick={updateExp}>Guardar</Btn>
              <Btn variant="ghost" onClick={()=>setEditItem(null)}>Cancelar</Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Nuevo documento */}
      {modalDoc&&(
        <Modal title="📄 Nuevo documento" onClose={()=>setModalDoc(false)}>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <div><label style={{fontSize:12,color:T.muted,display:'block',marginBottom:4}}>Nombre *</label><Input value={docForm.name} onChange={v=>setDocForm(f=>({...f,name:v}))} placeholder="Seguro todo riesgo"/></div>
            <div><label style={{fontSize:12,color:T.muted,display:'block',marginBottom:4}}>Categoría</label>
              <Select value={docForm.category} onChange={v=>setDocForm(f=>({...f,category:v}))}>
                {DOC_CATS.map(c=><option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <div><label style={{fontSize:12,color:T.muted,display:'block',marginBottom:4}}>Vence el</label><Input type="date" value={docForm.expiresAt} onChange={v=>setDocForm(f=>({...f,expiresAt:v}))}/></div>
              <div><label style={{fontSize:12,color:T.muted,display:'block',marginBottom:4}}>Importe</label><Input type="number" value={docForm.amount} onChange={v=>setDocForm(f=>({...f,amount:v}))} placeholder="0"/></div>
            </div>
            <div><label style={{fontSize:12,color:T.muted,display:'block',marginBottom:4}}>Proveedor / Aseguradora</label><Input value={docForm.provider} onChange={v=>setDocForm(f=>({...f,provider:v}))} placeholder="Mapfre…"/></div>
            <div><label style={{fontSize:12,color:T.muted,display:'block',marginBottom:4}}>Notas</label><Textarea value={docForm.notes} onChange={v=>setDocForm(f=>({...f,notes:v}))} placeholder="Notas opcionales" rows={2}/></div>
            <Btn onClick={saveDoc}>Guardar</Btn>
          </div>
        </Modal>
      )}

      {/* Modal: editar documento */}
      {editItem&&tab==='documentos'&&(
        <Modal title="Editar documento" onClose={()=>setEditItem(null)}>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <div><label style={{fontSize:12,color:T.muted,display:'block',marginBottom:4}}>Nombre</label><Input value={editForm.name||''} onChange={v=>setEditForm(f=>({...f,name:v}))}/></div>
            <div><label style={{fontSize:12,color:T.muted,display:'block',marginBottom:4}}>Categoría</label>
              <Select value={editForm.category||''} onChange={v=>setEditForm(f=>({...f,category:v}))}>
                {DOC_CATS.map(c=><option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <div><label style={{fontSize:12,color:T.muted,display:'block',marginBottom:4}}>Vence el</label><Input type="date" value={editForm.expiresAt||''} onChange={v=>setEditForm(f=>({...f,expiresAt:v}))}/></div>
              <div><label style={{fontSize:12,color:T.muted,display:'block',marginBottom:4}}>Importe</label><Input type="number" value={editForm.amount||''} onChange={v=>setEditForm(f=>({...f,amount:v}))}/></div>
            </div>
            <div><label style={{fontSize:12,color:T.muted,display:'block',marginBottom:4}}>Proveedor</label><Input value={editForm.provider||''} onChange={v=>setEditForm(f=>({...f,provider:v}))}/></div>
            <div><label style={{fontSize:12,color:T.muted,display:'block',marginBottom:4}}>Notas</label><Textarea value={editForm.notes||''} onChange={v=>setEditForm(f=>({...f,notes:v}))} rows={2}/></div>
            <div style={{display:'flex',gap:8}}>
              <Btn onClick={updateDoc}>Guardar</Btn>
              <Btn variant="ghost" onClick={()=>setEditItem(null)}>Cancelar</Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Nuevo recordatorio */}
      {modalReminder&&(
        <Modal title="🔔 Nuevo recordatorio" onClose={()=>setModalReminder(false)}>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <div><label style={{fontSize:12,color:T.muted,display:'block',marginBottom:4}}>Título *</label><Input value={reminderForm.title} onChange={v=>setReminderForm(f=>({...f,title:v}))} placeholder="ITV en julio…"/></div>
            <div><label style={{fontSize:12,color:T.muted,display:'block',marginBottom:4}}>Fecha límite</label><Input type="date" value={reminderForm.dueDate} onChange={v=>setReminderForm(f=>({...f,dueDate:v}))}/></div>
            <div><label style={{fontSize:12,color:T.muted,display:'block',marginBottom:4}}>Notas</label><Textarea value={reminderForm.notes} onChange={v=>setReminderForm(f=>({...f,notes:v}))} placeholder="Detalles…" rows={2}/></div>
            <Btn onClick={saveReminder}>Guardar</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ===================== HOGAR =====================
const Hogar = ({data,setData,isMobile,onBack}) => {
  const [tab,setTab]       = useState('mantenimientos');
  const [modalMaint,setModalMaint]   = useState(false);
  const [modalDoc,setModalDoc]       = useState(false);
  const [modalContact,setModalContact] = useState(false);
  const [editMaint,setEditMaint]     = useState(null);
  const [editDoc,setEditDoc]         = useState(null);
  const [editContact,setEditContact] = useState(null);
  const [editMaintForm,setEditMaintForm] = useState({});
  const [editDocForm,setEditDocForm]     = useState({});
  const [editContactForm,setEditContactForm] = useState({});
  const [maintForm,setMaintForm]     = useState({name:'',category:'',frequencyDays:90,lastDone:'',notes:'',cost:''});
  const [docForm,setDocForm]         = useState({name:'',category:'',expiresAt:'',provider:'',amount:'',notes:'',photoUrl:''});
  const [contactForm,setContactForm] = useState({name:'',role:'',phone:'',email:'',notes:''});
  const [contactSearch,setContactSearch] = useState('');
  const [modalFarmacia,setModalFarmacia] = useState(false);
  const [editFarmacia,setEditFarmacia]   = useState(null);
  const [editFarmaciaForm,setEditFarmaciaForm] = useState({});
  const [farmaciaForm,setFarmaciaForm]   = useState({name:'',quantity:'',unit:'unidades',expiresAt:'',location:'',notes:''});
  const [farmaciaSearch,setFarmaciaSearch] = useState('');

  const maints   = data.maintenances||[];
  const docs     = data.homeDocs||[];
  const contacts = data.homeContacts||[];

  // ── date helpers ──
  const diffDays=(dateStr)=>{
    if(!dateStr) return null;
    const diff=Math.ceil((new Date(dateStr)-new Date())/(1000*60*60*24));
    return diff;
  };
  const nextDate=(lastDone,freqDays)=>{
    if(!lastDone) return null;
    const d=new Date(lastDone); d.setDate(d.getDate()+Number(freqDays));
    return d.toISOString().slice(0,10);
  };
  const fmtDate=(d)=>{ try{ return new Date(d+'T12:00:00').toLocaleDateString('es-ES',{day:'2-digit',month:'short',year:'numeric'}); }catch{return d||'—';} };

  // ── summary counts ──
  const overdueMaints  = maints.filter(m=>{ const nd=nextDate(m.lastDone,m.frequencyDays); return nd&&diffDays(nd)<=0; });
  const soonMaints     = maints.filter(m=>{ const nd=nextDate(m.lastDone,m.frequencyDays); const d=diffDays(nd); return nd&&d>0&&d<=14; });
  const expiringDocs   = docs.filter(d=>{ const diff=diffDays(d.expiresAt); return diff!==null&&diff>=0&&diff<=30; });
  const expiredDocs    = docs.filter(d=>{ const diff=diffDays(d.expiresAt); return diff!==null&&diff<0; });

  // next upcoming maint
  const nextMaint = [...maints]
    .map(m=>({...m,_next:nextDate(m.lastDone,m.frequencyDays)}))
    .filter(m=>m._next&&diffDays(m._next)>0)
    .sort((a,b)=>a._next.localeCompare(b._next))[0];

  // ── MAINT actions ──
  const MAINT_CATS=['General','Coche','Jardín','Plomería','Electricidad','Climatización','Electrodomésticos','Otro'];
  const saveMaint=()=>{
    if(!maintForm.name.trim()) return;
    const m={id:uid(),...maintForm,frequencyDays:Number(maintForm.frequencyDays)||90,createdAt:today()};
    const upd=[m,...maints]; setData(d=>({...d,maintenances:upd})); save('maintenances',upd);
    setModalMaint(false); setMaintForm({name:'',category:'',frequencyDays:90,lastDone:'',notes:'',cost:''});
  };
  const doneMaint=(id)=>{
    const upd=maints.map(m=>m.id===id?{...m,lastDone:today()}:m);
    setData(d=>({...d,maintenances:upd})); save('maintenances',upd);
    toast.success('Mantenimiento registrado como hecho');
  };
  const delMaint=(id)=>{ const u=maints.filter(m=>m.id!==id); setData(d=>({...d,maintenances:u})); save('maintenances',u); };
  const updateMaint=()=>{
    if(!editMaintForm.name?.trim()) return;
    const upd=maints.map(m=>m.id===editMaint.id?{...m,...editMaintForm,frequencyDays:Number(editMaintForm.frequencyDays)||90}:m);
    setData(d=>({...d,maintenances:upd})); save('maintenances',upd); setEditMaint(null);
  };

  // ── DOC actions ──
  const DOC_CATS=['Seguro','Garantía','Contrato','Escritura','Impuesto','Membresía','Suscripción','Otro'];
  const saveDoc=()=>{
    if(!docForm.name.trim()) return;
    const d={id:uid(),...docForm,createdAt:today()};
    const upd=[d,...docs]; setData(s=>({...s,homeDocs:upd})); save('homeDocs',upd);
    setModalDoc(false); setDocForm({name:'',category:'',expiresAt:'',provider:'',amount:'',notes:'',photoUrl:''});
  };
  const delDoc=(id)=>{ const u=docs.filter(d=>d.id!==id); setData(s=>({...s,homeDocs:u})); save('homeDocs',u); };
  const updateDoc=()=>{
    if(!editDocForm.name?.trim()) return;
    const upd=docs.map(d=>d.id===editDoc.id?{...d,...editDocForm}:d);
    setData(s=>({...s,homeDocs:upd})); save('homeDocs',upd); setEditDoc(null);
  };

  // ── CONTACT actions ──
  const CONTACT_ROLES=['Plomero','Electricista','Médico','Dentista','Veterinario','Mecánico','Abogado','Contador','Jardinero','Limpieza','Cerrajero','Otro'];
  const saveContact=()=>{
    if(!contactForm.name.trim()) return;
    const c={id:uid(),...contactForm,createdAt:today()};
    const upd=[c,...contacts]; setData(d=>({...d,homeContacts:upd})); save('homeContacts',upd);
    setModalContact(false); setContactForm({name:'',role:'',phone:'',email:'',notes:''});
  };
  const delContact=(id)=>{ const u=contacts.filter(c=>c.id!==id); setData(d=>({...d,homeContacts:u})); save('homeContacts',u); };
  const updateContact=()=>{
    if(!editContactForm.name?.trim()) return;
    const upd=contacts.map(c=>c.id===editContact.id?{...c,...editContactForm}:c);
    setData(d=>({...d,homeContacts:upd})); save('homeContacts',upd); setEditContact(null);
  };
  const copyPhone=(phone)=>{ navigator.clipboard?.writeText(phone).catch(()=>{}); };

  // ── FARMACIA actions ──
  const farmaciaItems = data.farmaciaItems||[];
  const FARMACIA_UNITS=['unidades','tabletas','cápsulas','ml','mg','frascos','sobres','parches','gotas'];
  const saveFarmacia=()=>{
    if(!farmaciaForm.name.trim()) return;
    const item={id:uid(),...farmaciaForm,quantity:Number(farmaciaForm.quantity)||0,createdAt:today()};
    const upd=[item,...farmaciaItems]; setData(d=>({...d,farmaciaItems:upd})); save('farmaciaItems',upd);
    setModalFarmacia(false); setFarmaciaForm({name:'',quantity:'',unit:'unidades',expiresAt:'',location:'',notes:''});
    toast.success('Medicamento añadido al botiquín');
  };
  const delFarmacia=(id)=>{ const u=farmaciaItems.filter(i=>i.id!==id); setData(d=>({...d,farmaciaItems:u})); save('farmaciaItems',u); };
  const updateFarmacia=()=>{
    const upd=farmaciaItems.map(i=>i.id===editFarmacia.id?{...i,...editFarmaciaForm,quantity:Number(editFarmaciaForm.quantity)||0}:i);
    setData(d=>({...d,farmaciaItems:upd})); save('farmaciaItems',upd); setEditFarmacia(null);
  };
  // Conexión con Salud: nombres de medicamentos activos
  const activeMedNames=(data.medications||[]).map(m=>m.name.toLowerCase());
  const isActiveMed=(name)=>activeMedNames.some(n=>name.toLowerCase().includes(n)||n.includes(name.toLowerCase()));

  // ── status helpers ──
  const maintStatus=(m)=>{
    const nd=nextDate(m.lastDone,m.frequencyDays);
    if(!m.lastDone) return {label:'Sin registrar',color:T.muted,urgent:false};
    const d=diffDays(nd);
    if(d<=0)  return {label:`Vencido hace ${Math.abs(d)}d`,color:T.red,   urgent:true};
    if(d<=7)  return {label:`Vence en ${d}d`,             color:T.orange, urgent:true};
    if(d<=14) return {label:`En ${d} días`,               color:T.orange, urgent:false};
    return      {label:`En ${d} días`,                    color:T.green,  urgent:false};
  };
  const docStatus=(doc)=>{
    if(!doc.expiresAt) return {label:'Sin vencimiento',color:T.muted};
    const d=diffDays(doc.expiresAt);
    if(d<0)   return {label:`Vencido hace ${Math.abs(d)}d`, color:T.red};
    if(d<=7)  return {label:`Vence en ${d}d`,              color:T.red};
    if(d<=30) return {label:`Vence en ${d}d`,              color:T.orange};
    return      {label:fmtDate(doc.expiresAt),             color:T.green};
  };

  const FREQ_OPTS=[
    {label:'Semanal',days:7},{label:'Quincenal',days:15},{label:'Mensual',days:30},
    {label:'Bimestral',days:60},{label:'Trimestral',days:90},{label:'Semestral',days:180},
    {label:'Anual',days:365},{label:'Personalizado',days:0},
  ];

  return (
    <div>
      <PageHeader isMobile={isMobile} title="🏠 Hogar" onBack={onBack}
        subtitle="Mantenimientos, documentos y contactos de servicio"
        action={
          <div style={{display:'flex',gap:8}}>
            {tab==='mantenimientos'&&<Btn size="sm" onClick={()=>setModalMaint(true)}><Icon name="plus" size={14}/>Tarea</Btn>}
            {tab==='documentos'    &&<Btn size="sm" onClick={()=>setModalDoc(true)}><Icon name="plus" size={14}/>Doc</Btn>}
            {tab==='contactos'     &&<Btn size="sm" onClick={()=>setModalContact(true)}><Icon name="plus" size={14}/>Contacto</Btn>}
            {tab==='farmacia'      &&<Btn size="sm" onClick={()=>setModalFarmacia(true)}><Icon name="plus" size={14}/>Medicamento</Btn>}
          </div>
        }
      />

      {/* ── Summary cards ── */}
      <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr 1fr':'repeat(4,1fr)',gap:10,marginBottom:20}}>
        {[
          {label:'Vencidos',       val:overdueMaints.length, color:overdueMaints.length>0?T.red:T.green,   icon:'🔧'},
          {label:'Próx. 14 días',  val:soonMaints.length,    color:soonMaints.length>0?T.orange:T.muted,   icon:'⏰'},
          {label:'Docs por vencer',val:expiringDocs.length+expiredDocs.length, color:(expiringDocs.length+expiredDocs.length)>0?T.orange:T.muted, icon:'📄'},
          {label:'Contactos',      val:contacts.length,       color:T.blue,                                 icon:'📞'},
        ].map(s=>(
          <Card key={s.label} style={{textAlign:'center',padding:14}}>
            <div style={{fontSize:18,marginBottom:4}}>{s.icon}</div>
            <div style={{fontSize:isMobile?20:24,fontWeight:700,color:s.color}}>{s.val}</div>
            <div style={{fontSize:11,color:T.muted,marginTop:2}}>{s.label}</div>
          </Card>
        ))}
      </div>

      {/* ── Alertas críticas de documentos ── */}
      {(expiredDocs.length>0||expiringDocs.length>0)&&(
        <div style={{background:`${T.red}10`,border:`1px solid ${T.red}35`,borderRadius:12,padding:'12px 16px',display:'flex',gap:12,alignItems:'flex-start',marginBottom:12}}>
          <span style={{fontSize:22,flexShrink:0}}>🔔</span>
          <div style={{flex:1}}>
            <div style={{color:T.red,fontWeight:700,fontSize:13,marginBottom:4}}>
              {expiredDocs.length>0&&`${expiredDocs.length} documento${expiredDocs.length>1?'s':''} vencido${expiredDocs.length>1?'s':''}`}
              {expiredDocs.length>0&&expiringDocs.length>0&&' · '}
              {expiringDocs.length>0&&`${expiringDocs.length} por vencer pronto`}
            </div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              {[...expiredDocs,...expiringDocs].slice(0,4).map(d=>{
                const dd=diffDays(d.expiresAt);
                return <span key={d.id} style={{fontSize:11,color:dd<=0?T.red:dd<=7?T.orange:T.muted}}>{d.name} {dd<=0?'(vencido)':`(en ${dd}d)`}</span>;
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Costo acumulado por categoría ── */}
      {maints.filter(m=>m.cost).length>0&&(()=>{
        const byCategory={};
        maints.filter(m=>m.cost).forEach(m=>{
          const cat=m.category||'Sin categoría';
          byCategory[cat]=(byCategory[cat]||0)+Number(m.cost);
        });
        const cats=Object.entries(byCategory).sort((a,b)=>b[1]-a[1]);
        const total=cats.reduce((s,[,v])=>s+v,0);
        return (
          <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:'12px 16px',marginBottom:12}}>
            <div style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:'uppercase',letterSpacing:0.8,marginBottom:8}}>💰 Costos de mantenimiento por categoría</div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:6}}>
              {cats.map(([cat,cost])=>(
                <div key={cat} style={{background:T.surface2,borderRadius:8,padding:'6px 12px'}}>
                  <div style={{fontSize:10,color:T.muted}}>{cat}</div>
                  <div style={{fontSize:15,fontWeight:700,color:T.accent}}>${cost.toLocaleString()}</div>
                </div>
              ))}
            </div>
            <div style={{fontSize:12,color:T.muted}}>Total estimado: <span style={{fontWeight:700,color:T.text}}>${total.toLocaleString()}</span></div>
          </div>
        );
      })()}

      {/* ── Próximo mantenimiento banner ── */}
      {nextMaint&&(
        <div style={{padding:'12px 16px',background:`${T.blue}12`,border:`1px solid ${T.blue}30`,borderRadius:12,marginBottom:16,display:'flex',alignItems:'center',gap:12}}>
          <span style={{fontSize:22}}>📅</span>
          <div style={{flex:1}}>
            <div style={{color:T.text,fontSize:13,fontWeight:600}}>Próximo: {nextMaint.name}</div>
            <div style={{color:T.muted,fontSize:12}}>{fmtDate(nextMaint._next)} · en {diffDays(nextMaint._next)} días</div>
          </div>
        </div>
      )}

      {/* ── Tabs ── */}
      <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
        {[{id:'mantenimientos',label:'🔧 Mantenimientos'},{id:'documentos',label:'📄 Documentos'},{id:'contactos',label:'📞 Contactos'},{id:'farmacia',label:'💊 Farmacia'},{id:'coche',label:'🚗 Coche'}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{padding:'7px 16px',borderRadius:10,border:`1px solid ${tab===t.id?T.accent:T.border}`,background:tab===t.id?`${T.accent}18`:'transparent',color:tab===t.id?T.accent:T.muted,cursor:'pointer',fontSize:13,fontWeight:tab===t.id?600:400,fontFamily:'inherit'}}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ══════════ MANTENIMIENTOS ══════════ */}
      {tab==='mantenimientos'&&(
        <div>
          {maints.length===0
            ?<div style={{textAlign:'center',padding:'40px 0',color:T.dim}}>
               <div style={{fontSize:36,marginBottom:8}}>🔧</div>
               <div style={{fontSize:14,marginBottom:12}}>Sin tareas de mantenimiento</div>
               <Btn size="sm" onClick={()=>setModalMaint(true)}><Icon name="plus" size={13}/>Agregar</Btn>
             </div>
            :[...maints].sort((a,b)=>{
               const da=diffDays(nextDate(a.lastDone,a.frequencyDays))??999;
               const db=diffDays(nextDate(b.lastDone,b.frequencyDays))??999;
               return da-db;
             }).map(m=>{
               const st=maintStatus(m);
               const nd=nextDate(m.lastDone,m.frequencyDays);
               return (
                 <div key={m.id} style={{padding:'14px 16px',background:T.surface,border:`1px solid ${st.urgent?st.color:T.border}`,borderRadius:12,marginBottom:10,borderLeft:`3px solid ${st.color}`}}>
                   <div style={{display:'flex',alignItems:'flex-start',gap:10}}>
                     <div style={{flex:1}}>
                       <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                         <span style={{color:T.text,fontSize:14,fontWeight:600}}>{m.name}</span>
                         {m.category&&<span style={{fontSize:11,background:`${T.accent}15`,color:T.accent,padding:'2px 8px',borderRadius:8}}>{m.category}</span>}
                       </div>
                       <div style={{color:T.muted,fontSize:12,marginTop:4,display:'flex',gap:12,flexWrap:'wrap'}}>
                         {m.lastDone&&<span>✅ Último: {fmtDate(m.lastDone)}</span>}
                         {nd&&<span>📅 Próximo: {fmtDate(nd)}</span>}
                         {m.cost&&<span>💰 ${Number(m.cost).toLocaleString()}</span>}
                       </div>
                       {m.notes&&<div style={{color:T.dim,fontSize:11,marginTop:4}}>{m.notes}</div>}
                     </div>
                     <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:6,flexShrink:0}}>
                       <span style={{fontSize:11,fontWeight:600,color:st.color,background:`${st.color}15`,padding:'3px 10px',borderRadius:8,whiteSpace:'nowrap'}}>{st.label}</span>
                       <div style={{display:'flex',gap:6}}>
                         <button onClick={()=>{setEditMaint(m);setEditMaintForm({name:m.name,category:m.category||'',frequencyDays:m.frequencyDays||90,lastDone:m.lastDone||'',notes:m.notes||'',cost:m.cost||'',});}} style={{padding:'5px 8px',background:`${T.accent}15`,border:`1px solid ${T.accent}30`,borderRadius:8,cursor:'pointer',color:T.accent,fontSize:11,fontFamily:'inherit'}}>✏️</button>
                         <button onClick={()=>doneMaint(m.id)}
                           style={{padding:'5px 10px',background:`${T.green}18`,border:`1px solid ${T.green}40`,borderRadius:8,cursor:'pointer',color:T.green,fontSize:11,fontWeight:600,fontFamily:'inherit'}}>
                           ✓ Hecho hoy
                         </button>
                         <button onClick={()=>delMaint(m.id)} style={{background:'none',border:'none',color:T.dim,cursor:'pointer',padding:4,display:'flex'}}><Icon name="trash" size={13}/></button>
                       </div>
                     </div>
                   </div>
                 </div>
               );
             })
          }
        </div>
      )}

      {/* ══════════ DOCUMENTOS ══════════ */}
      {tab==='documentos'&&(
        <div>
          {docs.length===0
            ?<div style={{textAlign:'center',padding:'40px 0',color:T.dim}}>
               <div style={{fontSize:36,marginBottom:8}}>📄</div>
               <div style={{fontSize:14,marginBottom:12}}>Sin documentos registrados</div>
               <Btn size="sm" onClick={()=>setModalDoc(true)}><Icon name="plus" size={13}/>Agregar</Btn>
             </div>
            :[...docs].sort((a,b)=>{
               const da=diffDays(a.expiresAt)??9999;
               const db=diffDays(b.expiresAt)??9999;
               return da-db;
             }).map(doc=>{
               const st=docStatus(doc);
               return (
                 <div key={doc.id} style={{padding:'14px 16px',background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,marginBottom:10,borderLeft:`3px solid ${st.color}`}}>
                   <div style={{display:'flex',alignItems:'flex-start',gap:10}}>
                     <div style={{flex:1}}>
                       <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                         <span style={{color:T.text,fontSize:14,fontWeight:600}}>{doc.name}</span>
                         {doc.category&&<span style={{fontSize:11,background:`${T.blue}15`,color:T.blue,padding:'2px 8px',borderRadius:8}}>{doc.category}</span>}
                       </div>
                       <div style={{color:T.muted,fontSize:12,marginTop:4,display:'flex',gap:12,flexWrap:'wrap'}}>
                         {doc.provider&&<span>🏢 {doc.provider}</span>}
                         {doc.amount&&<span>💰 ${Number(doc.amount).toLocaleString()}/año</span>}
                       </div>
                       {doc.notes&&<div style={{color:T.dim,fontSize:11,marginTop:4}}>{doc.notes}</div>}
                       {doc.photoUrl&&(
                         <a href={doc.photoUrl} target="_blank" rel="noopener noreferrer" style={{display:'inline-flex',alignItems:'center',gap:4,marginTop:6,fontSize:11,color:T.blue,textDecoration:'none',background:`${T.blue}10`,padding:'3px 10px',borderRadius:6,border:`1px solid ${T.blue}25`}}
                           onClick={e=>e.stopPropagation()}>
                           📷 Ver foto / QR
                         </a>
                       )}
                     </div>
                     <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:6,flexShrink:0}}>
                       <span style={{fontSize:11,fontWeight:600,color:st.color,background:`${st.color}15`,padding:'3px 10px',borderRadius:8,whiteSpace:'nowrap'}}>{st.label}</span>
                       <div style={{display:'flex',gap:4}}>
                         <button onClick={()=>{setEditDoc(doc);setEditDocForm({name:doc.name,category:doc.category||'',expiresAt:doc.expiresAt||'',provider:doc.provider||'',amount:doc.amount||'',notes:doc.notes||'',photoUrl:doc.photoUrl||''});}} style={{background:`${T.blue}15`,border:`1px solid ${T.blue}30`,borderRadius:7,color:T.blue,cursor:'pointer',padding:'4px 7px',display:'flex',alignItems:'center',fontSize:11}}>✏️</button>
                         <button onClick={()=>delDoc(doc.id)} style={{background:'none',border:'none',color:T.dim,cursor:'pointer',padding:4,display:'flex'}}><Icon name="trash" size={13}/></button>
                       </div>
                     </div>
                   </div>
                 </div>
               );
             })
          }
        </div>
      )}

      {/* ══════════ CONTACTOS ══════════ */}
      {tab==='contactos'&&(
        <div>
          <Input value={contactSearch} onChange={setContactSearch} placeholder="Buscar contacto por nombre, rol, teléfono…" style={{marginBottom:12,fontSize:13}}/>
          {(()=>{
            const fc=contactSearch?contacts.filter(c=>
              [c.name,c.role,c.specialty,c.notes].join(' ').toLowerCase().includes(contactSearch.toLowerCase())
            ):contacts;
            if(contacts.length===0) return (
              <div style={{textAlign:'center',padding:'40px 0',color:T.dim}}>
               <div style={{fontSize:36,marginBottom:8}}>📞</div>
               <div style={{fontSize:14,marginBottom:12}}>Sin contactos de servicio</div>
               <Btn size="sm" onClick={()=>setModalContact(true)}><Icon name="plus" size={13}/>Agregar</Btn>
              </div>
            );
            if(fc.length===0) return <div style={{textAlign:'center',padding:'20px',color:T.dim,fontSize:12}}>Sin resultados para "{contactSearch}"</div>;
            return <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr',gap:10}}>
               {fc.map(c=>(
                 <div key={c.id} style={{padding:'14px 16px',background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,borderLeft:`3px solid ${T.purple}`}}>
                   <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8}}>
                     <div style={{flex:1,minWidth:0}}>
                       <div style={{color:T.text,fontSize:14,fontWeight:600}}>{c.name}</div>
                       {c.role&&<span style={{fontSize:11,background:`${T.purple}15`,color:T.purple,padding:'2px 8px',borderRadius:8,display:'inline-block',marginTop:4}}>{c.role}</span>}
                       {c.notes&&<div style={{color:T.dim,fontSize:11,marginTop:6}}>{c.notes}</div>}
                     </div>
                     <div style={{display:'flex',gap:4,flexShrink:0}}>
                       <button onClick={()=>{setEditContact(c);setEditContactForm({name:c.name,role:c.role||'',phone:c.phone||'',email:c.email||'',notes:c.notes||''});}} style={{background:`${T.purple}15`,border:`1px solid ${T.purple}30`,borderRadius:7,color:T.purple,cursor:'pointer',padding:'4px 7px',display:'flex',alignItems:'center',fontSize:11}}>✏️</button>
                       <button onClick={()=>delContact(c.id)} style={{background:'none',border:'none',color:T.dim,cursor:'pointer',padding:4,display:'flex'}}><Icon name="trash" size={13}/></button>
                     </div>
                   </div>
                   <div style={{display:'flex',gap:8,marginTop:10,flexWrap:'wrap'}}>
                     {c.phone&&(
                       <button onClick={()=>copyPhone(c.phone)}
                         style={{display:'flex',alignItems:'center',gap:6,padding:'6px 12px',background:`${T.accent}15`,border:`1px solid ${T.accent}30`,borderRadius:8,cursor:'pointer',color:T.accent,fontSize:12,fontWeight:600,fontFamily:'inherit'}}>
                         📞 {c.phone}
                       </button>
                     )}
                     {c.email&&(
                       <a href={`mailto:${c.email}`}
                         style={{display:'flex',alignItems:'center',gap:6,padding:'6px 12px',background:`${T.blue}15`,border:`1px solid ${T.blue}30`,borderRadius:8,cursor:'pointer',color:T.blue,fontSize:12,fontWeight:600,textDecoration:'none'}}>
                         ✉️ {c.email}
                       </a>
                     )}
                   </div>
                 </div>
               ))}
             </div>;
          })()}
        </div>
      )}

      {/* ══════════ MODALES ══════════ */}
      {modalMaint&&(
        <Modal title="Nueva tarea de mantenimiento" onClose={()=>setModalMaint(false)}>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <Input value={maintForm.name} onChange={v=>setMaintForm(f=>({...f,name:v}))} placeholder="Nombre (ej: Cambio de filtro de aire, Revisión coche...)"/>
            <Select value={maintForm.category} onChange={v=>setMaintForm(f=>({...f,category:v}))}>
              <option value="">— Categoría —</option>
              {MAINT_CATS.map(c=><option key={c}>{c}</option>)}
            </Select>
            <div>
              <div style={{fontSize:12,color:T.muted,marginBottom:6}}>Frecuencia</div>
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                {FREQ_OPTS.map(f=>(
                  <button key={f.label} onClick={()=>setMaintForm(m=>({...m,frequencyDays:f.days||m.frequencyDays}))}
                    style={{padding:'5px 12px',borderRadius:8,border:`1px solid ${maintForm.frequencyDays===f.days&&f.days!==0?T.accent:T.border}`,background:maintForm.frequencyDays===f.days&&f.days!==0?`${T.accent}18`:'transparent',color:maintForm.frequencyDays===f.days&&f.days!==0?T.accent:T.muted,cursor:'pointer',fontSize:12,fontFamily:'inherit'}}>
                    {f.label}
                  </button>
                ))}
              </div>
              <Input value={maintForm.frequencyDays} onChange={v=>setMaintForm(f=>({...f,frequencyDays:Number(v)}))} placeholder="Días entre cada mantenimiento" type="number" style={{marginTop:8}}/>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <div>
                <div style={{fontSize:12,color:T.muted,marginBottom:6}}>Último realizado</div>
                <Input value={maintForm.lastDone} onChange={v=>setMaintForm(f=>({...f,lastDone:v}))} type="date"/>
              </div>
              <div>
                <div style={{fontSize:12,color:T.muted,marginBottom:6}}>Costo aprox.</div>
                <Input value={maintForm.cost} onChange={v=>setMaintForm(f=>({...f,cost:v}))} placeholder="$" type="number"/>
              </div>
            </div>
            <Input value={maintForm.notes} onChange={v=>setMaintForm(f=>({...f,notes:v}))} placeholder="Notas (proveedor, observaciones...)"/>
          </div>
          <div style={{display:'flex',gap:10,marginTop:20}}>
            <Btn onClick={saveMaint} style={{flex:1,justifyContent:'center'}}>Guardar</Btn>
            <Btn variant="ghost" onClick={()=>setModalMaint(false)}>Cancelar</Btn>
          </div>
        </Modal>
      )}

      {modalDoc&&(
        <Modal title="Nuevo documento / garantía" onClose={()=>setModalDoc(false)}>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <Input value={docForm.name} onChange={v=>setDocForm(f=>({...f,name:v}))} placeholder="Nombre (ej: Seguro de coche, Garantía lavadora...)"/>
            <Select value={docForm.category} onChange={v=>setDocForm(f=>({...f,category:v}))}>
              <option value="">— Categoría —</option>
              {DOC_CATS.map(c=><option key={c}>{c}</option>)}
            </Select>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <div>
                <div style={{fontSize:12,color:T.muted,marginBottom:6}}>Fecha de vencimiento</div>
                <Input value={docForm.expiresAt} onChange={v=>setDocForm(f=>({...f,expiresAt:v}))} type="date"/>
              </div>
              <div>
                <div style={{fontSize:12,color:T.muted,marginBottom:6}}>Costo anual</div>
                <Input value={docForm.amount} onChange={v=>setDocForm(f=>({...f,amount:v}))} placeholder="$" type="number"/>
              </div>
            </div>
            <Input value={docForm.provider} onChange={v=>setDocForm(f=>({...f,provider:v}))} placeholder="Proveedor / Compañía"/>
            <Input value={docForm.photoUrl} onChange={v=>setDocForm(f=>({...f,photoUrl:v}))} placeholder="📷 URL de foto o QR del documento (opcional)"/>
            <Input value={docForm.notes} onChange={v=>setDocForm(f=>({...f,notes:v}))} placeholder="Notas (número de póliza, ubicación del documento...)"/>
          </div>
          <div style={{display:'flex',gap:10,marginTop:20}}>
            <Btn onClick={saveDoc} style={{flex:1,justifyContent:'center'}}>Guardar</Btn>
            <Btn variant="ghost" onClick={()=>setModalDoc(false)}>Cancelar</Btn>
          </div>
        </Modal>
      )}

      {modalContact&&(
        <Modal title="Nuevo contacto de servicio" onClose={()=>setModalContact(false)}>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <Input value={contactForm.name} onChange={v=>setContactForm(f=>({...f,name:v}))} placeholder="Nombre completo"/>
            <Select value={contactForm.role} onChange={v=>setContactForm(f=>({...f,role:v}))}>
              <option value="">— Especialidad —</option>
              {CONTACT_ROLES.map(r=><option key={r}>{r}</option>)}
            </Select>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <Input value={contactForm.phone} onChange={v=>setContactForm(f=>({...f,phone:v}))} placeholder="Teléfono" type="tel"/>
              <Input value={contactForm.email} onChange={v=>setContactForm(f=>({...f,email:v}))} placeholder="Email" type="email"/>
            </div>
            <Input value={contactForm.notes} onChange={v=>setContactForm(f=>({...f,notes:v}))} placeholder="Notas (zona que cubre, horario, precio aprox...)"/>
          </div>
          <div style={{display:'flex',gap:10,marginTop:20}}>
            <Btn onClick={saveContact} style={{flex:1,justifyContent:'center'}}>Guardar</Btn>
            <Btn variant="ghost" onClick={()=>setModalContact(false)}>Cancelar</Btn>
          </div>
        </Modal>
      )}

      {/* ── Edit: mantenimiento ── */}
      {editMaint&&(
        <Modal title="Editar mantenimiento" onClose={()=>setEditMaint(null)}>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <Input value={editMaintForm.name||''} onChange={v=>setEditMaintForm(f=>({...f,name:v}))} placeholder="Nombre"/>
            <Select value={editMaintForm.category||''} onChange={v=>setEditMaintForm(f=>({...f,category:v}))}>
              <option value="">— Categoría —</option>
              {MAINT_CATS.map(c=><option key={c}>{c}</option>)}
            </Select>
            <Input value={editMaintForm.frequencyDays||''} onChange={v=>setEditMaintForm(f=>({...f,frequencyDays:v}))} placeholder="Días entre mantenimientos" type="number"/>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <div>
                <div style={{fontSize:12,color:T.muted,marginBottom:6}}>Último realizado</div>
                <Input value={editMaintForm.lastDone||''} onChange={v=>setEditMaintForm(f=>({...f,lastDone:v}))} type="date"/>
              </div>
              <div>
                <div style={{fontSize:12,color:T.muted,marginBottom:6}}>Costo aprox.</div>
                <Input value={editMaintForm.cost||''} onChange={v=>setEditMaintForm(f=>({...f,cost:v}))} placeholder="$" type="number"/>
              </div>
            </div>
            <Input value={editMaintForm.notes||''} onChange={v=>setEditMaintForm(f=>({...f,notes:v}))} placeholder="Notas"/>
          </div>
          <div style={{display:'flex',gap:10,marginTop:20}}>
            <Btn onClick={updateMaint} style={{flex:1,justifyContent:'center'}}>Guardar cambios</Btn>
            <Btn variant="ghost" onClick={()=>setEditMaint(null)}>Cancelar</Btn>
          </div>
        </Modal>
      )}

      {/* ── Edit: documento ── */}
      {editDoc&&(
        <Modal title="Editar documento" onClose={()=>setEditDoc(null)}>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <Input value={editDocForm.name||''} onChange={v=>setEditDocForm(f=>({...f,name:v}))} placeholder="Nombre"/>
            <Select value={editDocForm.category||''} onChange={v=>setEditDocForm(f=>({...f,category:v}))}>
              <option value="">— Categoría —</option>
              {DOC_CATS.map(c=><option key={c}>{c}</option>)}
            </Select>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <div>
                <div style={{fontSize:12,color:T.muted,marginBottom:6}}>Vencimiento</div>
                <Input value={editDocForm.expiresAt||''} onChange={v=>setEditDocForm(f=>({...f,expiresAt:v}))} type="date"/>
              </div>
              <div>
                <div style={{fontSize:12,color:T.muted,marginBottom:6}}>Costo anual</div>
                <Input value={editDocForm.amount||''} onChange={v=>setEditDocForm(f=>({...f,amount:v}))} placeholder="$" type="number"/>
              </div>
            </div>
            <Input value={editDocForm.provider||''} onChange={v=>setEditDocForm(f=>({...f,provider:v}))} placeholder="Proveedor"/>
            <Input value={editDocForm.photoUrl||''} onChange={v=>setEditDocForm(f=>({...f,photoUrl:v}))} placeholder="📷 URL de foto o QR del documento"/>
            <Input value={editDocForm.notes||''} onChange={v=>setEditDocForm(f=>({...f,notes:v}))} placeholder="Notas"/>
          </div>
          <div style={{display:'flex',gap:10,marginTop:20}}>
            <Btn onClick={updateDoc} style={{flex:1,justifyContent:'center'}}>Guardar cambios</Btn>
            <Btn variant="ghost" onClick={()=>setEditDoc(null)}>Cancelar</Btn>
          </div>
        </Modal>
      )}

      {/* ── Edit: contacto ── */}
      {editContact&&(
        <Modal title="Editar contacto" onClose={()=>setEditContact(null)}>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <Input value={editContactForm.name||''} onChange={v=>setEditContactForm(f=>({...f,name:v}))} placeholder="Nombre"/>
            <Select value={editContactForm.role||''} onChange={v=>setEditContactForm(f=>({...f,role:v}))}>
              <option value="">— Rol —</option>
              {CONTACT_ROLES.map(r=><option key={r}>{r}</option>)}
            </Select>
            <Input value={editContactForm.phone||''} onChange={v=>setEditContactForm(f=>({...f,phone:v}))} placeholder="Teléfono"/>
            <Input value={editContactForm.email||''} onChange={v=>setEditContactForm(f=>({...f,email:v}))} placeholder="Email"/>
            <Input value={editContactForm.notes||''} onChange={v=>setEditContactForm(f=>({...f,notes:v}))} placeholder="Notas"/>
          </div>
          <div style={{display:'flex',gap:10,marginTop:20}}>
            <Btn onClick={updateContact} style={{flex:1,justifyContent:'center'}}>Guardar cambios</Btn>
            <Btn variant="ghost" onClick={()=>setEditContact(null)}>Cancelar</Btn>
          </div>
        </Modal>
      )}
      {/* ══════════ FARMACIA ══════════ */}
      {tab==='farmacia'&&(
        <div>
          {/* Conexión con Salud */}
          {activeMedNames.length>0&&(
            <div style={{background:`${T.green}12`,border:`1px solid ${T.green}30`,borderRadius:12,padding:'10px 14px',marginBottom:14,display:'flex',alignItems:'center',gap:10}}>
              <span style={{fontSize:18}}>💊</span>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:600,color:T.green}}>Medicamentos activos en Salud</div>
                <div style={{fontSize:11,color:T.muted}}>{(data.medications||[]).map(m=>m.name).join(' · ')||'—'}</div>
              </div>
            </div>
          )}
          <input value={farmaciaSearch} onChange={e=>setFarmaciaSearch(e.target.value)}
            placeholder="Buscar en botiquín…"
            style={{width:'100%',padding:'9px 14px',borderRadius:10,border:`1px solid ${T.border}`,background:T.surface2,color:T.text,fontSize:13,marginBottom:14,boxSizing:'border-box',fontFamily:'inherit'}}/>
          {farmaciaItems.length===0
            ?<div style={{textAlign:'center',padding:'40px 0',color:T.dim}}>
               <div style={{fontSize:36,marginBottom:8}}>💊</div>
               <div style={{fontSize:14,marginBottom:4}}>Botiquín vacío</div>
               <Btn size="sm" onClick={()=>setModalFarmacia(true)}>+ Agregar medicamento</Btn>
             </div>
            :<div style={{display:'flex',flexDirection:'column',gap:8}}>
              {farmaciaItems
                .filter(i=>!farmaciaSearch||i.name.toLowerCase().includes(farmaciaSearch.toLowerCase()))
                .map(item=>{
                  const active=isActiveMed(item.name);
                  const expDiff=item.expiresAt?Math.ceil((new Date(item.expiresAt)-new Date())/(1000*60*60*24)):null;
                  const expColor=expDiff===null?T.muted:expDiff<0?T.red:expDiff<=30?T.orange:T.green;
                  return (
                    <div key={item.id} style={{background:T.surface,border:`1px solid ${active?T.green:T.border}`,borderRadius:12,padding:'12px 14px',display:'flex',gap:12,alignItems:'flex-start',borderLeft:`4px solid ${active?T.green:T.border}`}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                          <span style={{fontWeight:600,fontSize:14,color:T.text}}>{item.name}</span>
                          {active&&<span style={{fontSize:10,background:`${T.green}20`,color:T.green,padding:'2px 7px',borderRadius:6,fontWeight:600}}>● EN USO</span>}
                        </div>
                        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                          <span style={{fontSize:11,color:T.muted}}>📦 {item.quantity} {item.unit}</span>
                          {item.location&&<span style={{fontSize:11,color:T.muted}}>📍 {item.location}</span>}
                          {expDiff!==null&&<span style={{fontSize:11,color:expColor,fontWeight:600}}>{expDiff<0?`Vencido hace ${Math.abs(expDiff)}d`:expDiff===0?'Vence hoy':`Vence en ${expDiff}d`}</span>}
                        </div>
                        {item.notes&&<div style={{fontSize:11,color:T.dim,marginTop:4}}>{item.notes}</div>}
                      </div>
                      <div style={{display:'flex',gap:6,flexShrink:0}}>
                        <button onClick={()=>{setEditFarmacia(item);setEditFarmaciaForm({...item});}} style={{background:'none',border:`1px solid ${T.border}`,borderRadius:8,padding:'4px 10px',cursor:'pointer',color:T.muted,fontSize:11,fontFamily:'inherit'}}>Editar</button>
                        <button onClick={()=>delFarmacia(item.id)} style={{background:'none',border:`1px solid ${T.red}40`,borderRadius:8,padding:'4px 10px',cursor:'pointer',color:T.red,fontSize:11,fontFamily:'inherit'}}>✕</button>
                      </div>
                    </div>
                  );
                })}
            </div>
          }
        </div>
      )}

      {/* ══════════ COCHE ══════════ */}
      {tab==='coche'&&(
        <Coche data={data} setData={setData} isMobile={isMobile} onBack={()=>setTab('mantenimientos')} embedded={true}/>
      )}

      {/* ── Modal: nueva farmacia ── */}
      {modalFarmacia&&(
        <Modal title="Agregar al botiquín" onClose={()=>setModalFarmacia(false)}>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <Input value={farmaciaForm.name} onChange={v=>setFarmaciaForm(f=>({...f,name:v}))} placeholder="Nombre del medicamento *"/>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <Input value={farmaciaForm.quantity} onChange={v=>setFarmaciaForm(f=>({...f,quantity:v}))} placeholder="Cantidad" type="number"/>
              <Select value={farmaciaForm.unit} onChange={v=>setFarmaciaForm(f=>({...f,unit:v}))}>
                {FARMACIA_UNITS.map(u=><option key={u}>{u}</option>)}
              </Select>
            </div>
            <Input value={farmaciaForm.expiresAt} onChange={v=>setFarmaciaForm(f=>({...f,expiresAt:v}))} placeholder="Fecha vencimiento" type="date"/>
            <Input value={farmaciaForm.location} onChange={v=>setFarmaciaForm(f=>({...f,location:v}))} placeholder="Ubicación (cajón, mueble…)"/>
            <Input value={farmaciaForm.notes} onChange={v=>setFarmaciaForm(f=>({...f,notes:v}))} placeholder="Notas opcionales"/>
          </div>
          <div style={{display:'flex',gap:10,marginTop:20}}>
            <Btn onClick={saveFarmacia} style={{flex:1,justifyContent:'center'}}>Guardar</Btn>
            <Btn variant="ghost" onClick={()=>setModalFarmacia(false)}>Cancelar</Btn>
          </div>
        </Modal>
      )}

      {/* ── Modal: editar farmacia ── */}
      {editFarmacia&&(
        <Modal title="Editar medicamento" onClose={()=>setEditFarmacia(null)}>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <Input value={editFarmaciaForm.name||''} onChange={v=>setEditFarmaciaForm(f=>({...f,name:v}))} placeholder="Nombre *"/>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <Input value={editFarmaciaForm.quantity||''} onChange={v=>setEditFarmaciaForm(f=>({...f,quantity:v}))} placeholder="Cantidad" type="number"/>
              <Select value={editFarmaciaForm.unit||'unidades'} onChange={v=>setEditFarmaciaForm(f=>({...f,unit:v}))}>
                {FARMACIA_UNITS.map(u=><option key={u}>{u}</option>)}
              </Select>
            </div>
            <Input value={editFarmaciaForm.expiresAt||''} onChange={v=>setEditFarmaciaForm(f=>({...f,expiresAt:v}))} type="date"/>
            <Input value={editFarmaciaForm.location||''} onChange={v=>setEditFarmaciaForm(f=>({...f,location:v}))} placeholder="Ubicación"/>
            <Input value={editFarmaciaForm.notes||''} onChange={v=>setEditFarmaciaForm(f=>({...f,notes:v}))} placeholder="Notas"/>
          </div>
          <div style={{display:'flex',gap:10,marginTop:20}}>
            <Btn onClick={updateFarmacia} style={{flex:1,justifyContent:'center'}}>Guardar cambios</Btn>
            <Btn variant="ghost" onClick={()=>setEditFarmacia(null)}>Cancelar</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ===================== HEALTH =====================
const Health = ({data,setData,isMobile,onBack}) => {
  const [tab,setTab]=useState('trends');
  const [metric,setMetric]=useState('peso');
  const [workoutModal,setWorkoutModal]=useState(false);
  const [metricModal,setMetricModal]=useState(false);
  const [medModal,setMedModal]=useState(false);
  const [wForm,setWForm]=useState({type:'Gym',date:today(),duration:60,calories:0,distance:''});
  const [mForm,setMForm]=useState({metric:'peso',value:'',date:today()});
  const [medForm,setMedForm]=useState({name:'',dose:'',unit:'mg',frequency:'Diaria',time:'08:00',notes:''});
  // Scheduled notification interval refs: { medId: intervalId }
  const notifRefs=useRef({});

  const meds=data.medications||[];

  const saveMed=()=>{
    if(!medForm.name.trim())return;
    const m={id:uid(),...medForm,createdAt:today()};
    const upd=[m,...meds];
    setData(d=>({...d,medications:upd}));save('medications',upd);
    setMedModal(false);setMedForm({name:'',dose:'',unit:'mg',frequency:'Diaria',time:'08:00',notes:''});
    toast.success(`💊 ${m.name} agregado`);
  };
  const delMed=(id)=>{
    // Cancel any pending notification for this med
    clearTimeout(notifRefs.current[id]);
    const upd=meds.filter(m=>m.id!==id);
    setData(d=>({...d,medications:upd}));save('medications',upd);
  };
  const scheduleMedNotif=(med)=>{
    if(!('Notification' in window)||Notification.permission!=='granted'){
      toast.warn('Activa las notificaciones del navegador en Configuración primero.');
      return;
    }
    const [hh,mm]=(med.time||'08:00').split(':').map(Number);
    const now=new Date();
    const next=new Date(now.getFullYear(),now.getMonth(),now.getDate(),hh,mm,0,0);
    if(next<=now) next.setDate(next.getDate()+1);
    const ms=next-now;
    clearTimeout(notifRefs.current[med.id]);
    notifRefs.current[med.id]=setTimeout(()=>{
      new Notification(`💊 Medicamento: ${med.name}`,{
        body:`${med.dose}${med.unit} — ${med.frequency}`,
        icon:'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><text y="28" font-size="28">💊</text></svg>'
      });
    },ms);
    toast.success(`🔔 Recordatorio de ${med.name} programado para las ${med.time}`);
  };

  const workouts=data.workouts||[];
  const metrics=data.healthMetrics||{};

  const saveWorkout=()=>{
    if(!wForm.type||!wForm.duration)return;
    const upd=[{id:uid(),...wForm,duration:Number(wForm.duration),calories:Number(wForm.calories||0)},...workouts];
    setData(d=>({...d,workouts:upd}));save('workouts',upd);
    setWorkoutModal(false);setWForm({type:'Gym',date:today(),duration:60,calories:0,distance:''});
  };
  const saveMetric=()=>{
    if(!mForm.value)return;
    const key=mForm.metric;
    const entry={date:mForm.date,value:Number(mForm.value)};
    const prev=metrics[key]||[];
    const upd={...metrics,[key]:[...prev.filter(e=>e.date!==mForm.date),entry].sort((a,b)=>a.date.localeCompare(b.date))};
    setData(d=>({...d,healthMetrics:upd}));save('healthMetrics',upd);
    setMetricModal(false);setMForm({metric:'peso',value:'',date:today()});
  };
  const delWorkout=(id)=>{const u=workouts.filter(w=>w.id!==id);setData(d=>({...d,workouts:u}));save('workouts',u);};

  const [goalEditModal,setGoalEditModal]=useState(false);
  const [goalForm,setGoalForm]=useState({});

  const hGoals=data.healthGoals||{peso:75,sueño:8,pasos:10000,agua:2,entrenosSem:4};

  const saveHealthGoal=(key,val)=>{
    const upd={...hGoals,[key]:Number(val)};
    setData(d=>({...d,healthGoals:upd}));save('healthGoals',upd);
  };

  const METRIC_CFG={
    peso:  {label:'Peso',  unit:'kg',color:T.blue,   goal:hGoals.peso||75, icon:'⚖️',lowerBetter:true},
    sueño: {label:'Sueño', unit:'h', color:T.purple,  goal:hGoals.sueño||8,  icon:'😴',lowerBetter:false},
    pasos: {label:'Pasos', unit:'',  color:T.accent,  goal:hGoals.pasos||10000, icon:'👟',lowerBetter:false},
    agua:  {label:'Agua',  unit:'L', color:T.blue,    goal:hGoals.agua||2,   icon:'💧',lowerBetter:false},
  };

  const cfg=METRIC_CFG[metric]||METRIC_CFG.peso;
  const mData=metrics[metric]||[];
  const latest=mData.length?mData[mData.length-1]?.value:null;
  const prev=mData.length>1?mData[mData.length-2]?.value:null;
  const delta=latest!=null&&prev!=null?(latest-prev):null;
  const goalPct=latest!=null?Math.min(Math.round((latest/cfg.goal)*100),200):0;
  const goalColor=cfg.lowerBetter
    ?(goalPct<=100?T.accent:goalPct<=120?T.orange:T.red)
    :(goalPct>=100?T.accent:goalPct>=70?T.orange:T.red);

  // Workout stats
  const last7Days=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-i);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;});
  const weekWorkouts=workouts.filter(w=>last7Days.includes(w.date));
  const weekCal=weekWorkouts.reduce((s,w)=>s+(w.calories||0),0);
  const weekMin=weekWorkouts.reduce((s,w)=>s+(w.duration||0),0);

  // Workout streak
  const sortedDates=[...new Set(workouts.map(w=>w.date))].sort().reverse();
  let wStreak=0;
  const ref=new Date();
  for(let i=0;i<sortedDates.length;i++){
    const d=new Date(sortedDates[i]);
    const diff=Math.floor((ref-d)/86400000);
    if(diff===i||(i===0&&diff<=1)){wStreak++;}else break;
  }
  // Best workout streak
  const wBestStreak=(()=>{
    if(!sortedDates.length)return 0;
    const asc=[...sortedDates].reverse();
    let maxS=1,cur=1;
    for(let i=1;i<asc.length;i++){
      const diff=(new Date(asc[i])-new Date(asc[i-1]))/86400000;
      if(diff===1){cur++;maxS=Math.max(maxS,cur);}else cur=1;
    }
    return maxS;
  })();
  // Workout heatmap - last 14 days
  const wHeatmap=Array.from({length:14},(_,i)=>{
    const d=new Date();d.setDate(d.getDate()-(13-i));
    const str=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const count=workouts.filter(w=>w.date===str).length;
    return {date:str,count,label:d.toLocaleDateString('es-ES',{weekday:'narrow'})};
  });

  // Weekly summary data
  const weekSummary=(()=>{
    const now=new Date();
    const weekStart=new Date(now);weekStart.setDate(now.getDate()-6);
    const wsStr=`${weekStart.getFullYear()}-${String(weekStart.getMonth()+1).padStart(2,'0')}-${String(weekStart.getDate()).padStart(2,'0')}`;
    const wkWorkouts=workouts.filter(w=>w.date>=wsStr);
    const wkMin=wkWorkouts.reduce((s,w)=>s+(w.duration||0),0);
    const wkCal=wkWorkouts.reduce((s,w)=>s+(w.calories||0),0);
    const metricDeltas=Object.entries(METRIC_CFG).map(([k,c])=>{
      const mEntries=metrics[k]||[];
      const recent=mEntries.filter(e=>e.date>=wsStr);
      if(recent.length<2)return {key:k,...c,delta:null};
      const first=recent[0].value,last=recent[recent.length-1].value;
      return {key:k,...c,delta:last-first,last};
    });
    const dailyHabits=(data.habits||[]).filter(h=>!h.frequency||h.frequency==='daily');
    const last7=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-i);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;});
    const habitTotal=dailyHabits.reduce((s,h)=>s+last7.filter(d=>h.completions.includes(d)).length,0);
    const habitPossible=dailyHabits.length*7;
    const habitPct=habitPossible?Math.round(habitTotal/habitPossible*100):0;
    return {workouts:wkWorkouts.length,min:wkMin,cal:wkCal,metricDeltas,habitPct};
  })();

  const WORKOUT_TYPES=['Gym','Correr','Ciclismo','Natación','Yoga','HIIT','Caminata','Otro'];
  const wtIcon=(t)=>t==='Correr'?'🏃':t==='Gym'?'🏋️':t==='Ciclismo'?'🚴':t==='Natación'?'🏊':t==='Yoga'?'🧘':t==='HIIT'?'⚡':t==='Caminata'?'🚶':'💪';

  const fmtVal=v=>metric==='pasos'?Number(v).toLocaleString():v;

  const GOALS=[
    {label:'Peso objetivo',icon:'⚖️',metricKey:'peso',current:mData.length&&metric==='peso'?mData[mData.length-1].value+'kg':((metrics.peso||[]).length?(metrics.peso||[]).slice(-1)[0].value+'kg':'—'),goal:`${hGoals.peso||75} kg`,pct:Math.min(Math.round(((metrics.peso||[]).length?((hGoals.peso||75)/(metrics.peso||[]).slice(-1)[0].value)*100:0)),100),color:T.blue,inv:true},
    {label:'Sueño promedio',icon:'😴',metricKey:'sueño',current:(metrics.sueño||[]).slice(-7).length?((metrics.sueño||[]).slice(-7).reduce((s,e)=>s+e.value,0)/Math.min(7,(metrics.sueño||[]).length)).toFixed(1)+'h':'—',goal:`${hGoals.sueño||8}h/noche`,pct:Math.min(Math.round(((metrics.sueño||[]).slice(-7).length?((metrics.sueño||[]).slice(-7).reduce((s,e)=>s+e.value,0)/(7*(hGoals.sueño||8)))*100:0)),100),color:T.purple,inv:false},
    {label:'Pasos diarios',icon:'👟',metricKey:'pasos',current:(metrics.pasos||[]).slice(-7).length?Math.round((metrics.pasos||[]).slice(-7).reduce((s,e)=>s+e.value,0)/(metrics.pasos||[]).slice(-7).length).toLocaleString():'—',goal:(hGoals.pasos||10000).toLocaleString(),pct:Math.min(Math.round(((metrics.pasos||[]).slice(-7).length?((metrics.pasos||[]).slice(-7).reduce((s,e)=>s+e.value,0)/((metrics.pasos||[]).slice(-7).length*(hGoals.pasos||10000)))*100:0)),100),color:T.accent,inv:false},
    {label:'Entrenos/semana',icon:'🏋️',metricKey:'entrenosSem',current:`${weekWorkouts.length}`,goal:`${hGoals.entrenosSem||4} sesiones`,pct:Math.min(Math.round((weekWorkouts.length/(hGoals.entrenosSem||4))*100),100),color:T.orange,inv:false},
  ];

  return (
    <div>
      <PageHeader title="💪 Salud" subtitle="Seguimiento y tendencias" isMobile={isMobile} onBack={onBack}
        action={<div style={{display:'flex',gap:6}}>
          <Btn size="sm" variant="ghost" onClick={()=>setMetricModal(true)}>+ Métrica</Btn>
          <Btn size="sm" onClick={()=>setWorkoutModal(true)}><Icon name="plus" size={12}/>Entreno</Btn>
        </div>}/>

      {/* Summary row */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:16}}>
        {[
          {label:'Racha entrenos',val:`🔥 ${wStreak}d`,color:T.orange},
          {label:'Mejor racha',val:`⚡ ${wBestStreak}d`,color:T.purple},
          {label:'Esta semana',val:`${weekWorkouts.length} sesiones`,color:T.blue},
          {label:'Calorías 7d',val:weekCal>0?weekCal.toLocaleString():'—',color:T.red},
        ].map(s=>(
          <Card key={s.label} style={{padding:isMobile?8:12,textAlign:'center'}}>
            <div style={{fontSize:isMobile?12:13,fontWeight:800,color:s.color}}>{s.val}</div>
            <div style={{fontSize:10,color:T.muted,marginTop:3}}>{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Tab nav */}
      <div style={{display:'flex',gap:6,marginBottom:14,flexWrap:'wrap'}}>
        {[['trends','📈 Tendencias'],['workouts','🏃 Entrenos'],['summary','📊 Resumen'],['goals','🎯 Metas'],['meds','💊 Medicamentos']].map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)}
            style={{padding:'6px 14px',borderRadius:10,border:`1px solid ${tab===id?T.green:T.border}`,background:tab===id?`${T.green}18`:'transparent',color:tab===id?T.green:T.muted,cursor:'pointer',fontSize:12,fontWeight:tab===id?700:400,fontFamily:'inherit',whiteSpace:'nowrap'}}>
            {label}
          </button>
        ))}
      </div>

      {/* ── TRENDS ── */}
      {tab==='trends'&&(
        <Card style={{padding:18}}>
          <div style={{display:'flex',gap:6,marginBottom:16,flexWrap:'wrap'}}>
            {Object.entries(METRIC_CFG).map(([k,c])=>(
              <button key={k} onClick={()=>setMetric(k)}
                style={{padding:'5px 12px',borderRadius:9,border:`1px solid ${metric===k?c.color:T.border}`,background:metric===k?`${c.color}18`:'transparent',color:metric===k?c.color:T.muted,cursor:'pointer',fontSize:11,fontFamily:'inherit'}}>
                {c.icon} {c.label}
              </button>
            ))}
          </div>
          {mData.length===0?(
            <div style={{textAlign:'center',padding:'24px 0',color:T.dim}}>
              <p style={{fontSize:14,marginBottom:8}}>Sin registros de {cfg.label.toLowerCase()} aún</p>
              <Btn size="sm" onClick={()=>{setMForm(f=>({...f,metric}));setMetricModal(true);}}>+ Registrar {cfg.label}</Btn>
            </div>
          ):(
            <>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}}>
                <div>
                  <div style={{fontSize:28,fontWeight:800,color:cfg.color}}>{fmtVal(latest)} <span style={{fontSize:14,color:T.muted,fontWeight:400}}>{cfg.unit}</span></div>
                  {delta!=null&&<div style={{fontSize:12,marginTop:3,color:cfg.lowerBetter?(delta<=0?T.accent:T.red):(delta>=0?T.accent:T.red)}}>
                    {delta>0?'▲':'▼'} {Math.abs(delta).toFixed(metric==='pasos'?0:1)} {cfg.unit} vs anterior
                  </div>}
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:11,color:T.muted}}>Meta: {metric==='pasos'?cfg.goal.toLocaleString():cfg.goal} {cfg.unit}</div>
                  <div style={{fontSize:13,fontWeight:700,color:goalColor,marginTop:2}}>{cfg.lowerBetter?goalPct<=100?'✓ Dentro de meta':'Por encima':goalPct+'% de meta'}</div>
                </div>
              </div>
              <MetricTrendChart
                data={mData.slice(-30)}
                color={cfg.color}
                goal={cfg.goal}
                unit={cfg.unit}
                width={Math.min((typeof window!=="undefined"?window.innerWidth:360)-80,340)}
                height={140}
              />
              <div style={{display:'flex',justifyContent:'space-between',marginTop:4}}>
                <span style={{fontSize:9,color:T.dim}}>{mData.slice(-30)[0]?.date?.slice(5)}</span>
                <span style={{fontSize:9,color:T.dim}}>{mData[mData.length-1]?.date?.slice(5)}</span>
              </div>
              <div style={{marginTop:12}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                  <span style={{fontSize:11,color:T.muted}}>Progreso hacia meta</span>
                  <span style={{fontSize:11,fontWeight:700,color:goalColor}}>{cfg.lowerBetter?goalPct<=100?'✓':''+goalPct+'%':goalPct+'%'}</span>
                </div>
                <div style={{height:6,background:T.border,borderRadius:3,overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${Math.min(cfg.lowerBetter?Math.max(0,200-goalPct):goalPct,100)}%`,background:goalColor,borderRadius:3,transition:'width 0.6s'}}/>
                </div>
              </div>
              <div style={{marginTop:10,textAlign:'right'}}>
                <button onClick={()=>{setMForm(f=>({...f,metric}));setMetricModal(true);}} style={{fontSize:11,color:T.accent,background:'none',border:'none',cursor:'pointer',fontFamily:'inherit'}}>+ Registrar {cfg.label}</button>
              </div>
            </>
          )}
        </Card>
      )}

      {/* ── WORKOUTS ── */}
      {tab==='workouts'&&(
        <div>
          <Card style={{marginBottom:12,padding:14}}>
            <div style={{fontWeight:600,fontSize:13,color:T.text,marginBottom:10}}>Resumen semanal</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
              {[
                {l:'Sesiones',v:weekWorkouts.length,c:T.accent},
                {l:'Minutos',v:weekMin,c:T.blue},
                {l:'Calorías',v:weekCal||'—',c:T.red},
                {l:'Racha',v:`🔥${wStreak}d`,c:T.orange},
              ].map(s=>(
                <div key={s.l} style={{textAlign:'center',padding:'6px 4px'}}>
                  <div style={{fontSize:15,fontWeight:800,color:s.c}}>{s.v}</div>
                  <div style={{fontSize:9,color:T.muted,marginTop:2}}>{s.l}</div>
                </div>
              ))}
            </div>
          </Card>
          {/* Workout heatmap - últimos 14 días */}
          <Card style={{marginBottom:12,padding:14}}>
            <div style={{fontWeight:600,fontSize:12,color:T.muted,marginBottom:8}}>Actividad — últimos 14 días</div>
            <div style={{display:'flex',gap:4,alignItems:'flex-end'}}>
              {wHeatmap.map((d,i)=>(
                <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
                  <div style={{
                    width:'100%',height:d.count>0?Math.max(d.count*14,14):6,maxHeight:42,
                    borderRadius:4,
                    background:d.count>0?T.accent:`${T.border}`,
                    opacity:d.count>0?Math.min(0.4+d.count*0.3,1):0.3,
                    transition:'all 0.3s',
                  }} title={`${d.date}: ${d.count} entreno${d.count!==1?'s':''}`}/>
                  <span style={{fontSize:8,color:d.date===today()?T.accent:T.dim}}>{d.label}</span>
                </div>
              ))}
            </div>
          </Card>
          {workouts.slice(0,10).map(w=>(
            <div key={w.id} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,marginBottom:6}}>
              <div style={{width:36,height:36,borderRadius:9,background:`${T.blue}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{wtIcon(w.type)}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:600,color:T.text}}>{w.type}</div>
                <div style={{fontSize:11,color:T.muted,marginTop:2}}>{fmt(w.date)} · {w.duration}min{w.distance?` · ${w.distance}`:''}</div>
              </div>
              {w.calories>0&&<div style={{fontSize:13,fontWeight:700,color:T.red,flexShrink:0}}>{w.calories} kcal</div>}
              <button onClick={()=>delWorkout(w.id)} style={{background:'none',border:'none',color:T.dim,cursor:'pointer',padding:4}}><Icon name="trash" size={12}/></button>
            </div>
          ))}
          {!workouts.length&&<div style={{textAlign:'center',padding:'30px 0',color:T.dim}}><p style={{fontSize:14}}>Sin entrenamientos registrados</p><Btn size="sm" onClick={()=>setWorkoutModal(true)} style={{marginTop:8}}><Icon name="plus" size={12}/>Registrar entreno</Btn></div>}
        </div>
      )}

      {/* ── WEEKLY SUMMARY ── */}
      {tab==='summary'&&(
        <div>
          <Card style={{padding:18,marginBottom:12}}>
            <div style={{fontWeight:700,fontSize:14,color:T.text,marginBottom:14}}>📊 Resumen semanal de actividad</div>
            {/* Workout stats */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:18}}>
              {[
                {l:'Entrenos',v:weekSummary.workouts,c:T.accent,icon:'🏋️'},
                {l:'Minutos totales',v:weekSummary.min,c:T.blue,icon:'⏱'},
                {l:'Calorías quemadas',v:weekSummary.cal||'—',c:T.red,icon:'🔥'},
              ].map(s=>(
                <div key={s.l} style={{background:T.surface2,borderRadius:10,padding:'12px 10px',textAlign:'center'}}>
                  <div style={{fontSize:18,marginBottom:4}}>{s.icon}</div>
                  <div style={{fontSize:18,fontWeight:800,color:s.c}}>{s.v}</div>
                  <div style={{fontSize:9,color:T.muted,marginTop:3}}>{s.l}</div>
                </div>
              ))}
            </div>
            {/* Consistency */}
            <div style={{background:T.surface2,borderRadius:10,padding:'12px 14px',marginBottom:14}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                <span style={{fontSize:12,fontWeight:600,color:T.text}}>🔥 Consistencia hábitos</span>
                <span style={{fontSize:14,fontWeight:800,color:weekSummary.habitPct>=70?T.accent:weekSummary.habitPct>=40?T.orange:T.red}}>{weekSummary.habitPct}%</span>
              </div>
              <div style={{height:6,background:T.border,borderRadius:3,overflow:'hidden'}}>
                <div style={{height:'100%',width:`${weekSummary.habitPct}%`,background:weekSummary.habitPct>=70?T.accent:weekSummary.habitPct>=40?T.orange:T.red,borderRadius:3,transition:'width 0.6s'}}/>
              </div>
            </div>
            {/* Metric deltas */}
            <div style={{fontSize:12,fontWeight:600,color:T.text,marginBottom:8}}>📈 Tendencias de la semana</div>
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              {weekSummary.metricDeltas.map(m=>(
                <div key={m.key} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 12px',background:T.surface,borderRadius:9,border:`1px solid ${T.border}`}}>
                  <span style={{fontSize:16}}>{m.icon}</span>
                  <span style={{flex:1,fontSize:13,color:T.text}}>{m.label}</span>
                  {m.delta!=null?(
                    <span style={{fontSize:13,fontWeight:700,color:m.lowerBetter?(m.delta<=0?T.accent:T.red):(m.delta>=0?T.accent:T.red)}}>
                      {m.delta>0?'▲':'▼'} {Math.abs(m.delta).toFixed(m.key==='pasos'?0:1)} {m.unit}
                    </span>
                  ):(
                    <span style={{fontSize:11,color:T.dim}}>Sin datos esta semana</span>
                  )}
                </div>
              ))}
            </div>
          </Card>
          {/* Workout streak visual */}
          <Card style={{padding:14}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              <span style={{fontWeight:600,fontSize:12,color:T.text}}>🔥 Racha de entrenamientos</span>
              <div style={{display:'flex',gap:12}}>
                <div style={{textAlign:'center'}}><div style={{fontSize:16,fontWeight:800,color:T.orange}}>{wStreak}d</div><div style={{fontSize:8,color:T.muted}}>Actual</div></div>
                <div style={{textAlign:'center'}}><div style={{fontSize:16,fontWeight:800,color:T.purple}}>{wBestStreak}d</div><div style={{fontSize:8,color:T.muted}}>Máxima</div></div>
              </div>
            </div>
            <div style={{display:'flex',gap:3}}>
              {wHeatmap.map((d,i)=>(
                <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
                  <div style={{width:'100%',height:18,borderRadius:4,background:d.count>0?T.accent:T.border,opacity:d.count>0?Math.min(0.5+d.count*0.25,1):0.25}} title={`${d.date}: ${d.count}`}/>
                  <span style={{fontSize:7,color:d.date===today()?T.accent:T.dim}}>{d.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ── GOALS ── */}
      {tab==='goals'&&(
        <Card style={{padding:18}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
            <div style={{fontWeight:700,fontSize:14,color:T.text}}>Metas de salud</div>
            <button onClick={()=>{setGoalForm({peso:hGoals.peso||75,sueño:hGoals.sueño||8,pasos:hGoals.pasos||10000,agua:hGoals.agua||2,entrenosSem:hGoals.entrenosSem||4});setGoalEditModal(true);}}
              style={{fontSize:11,color:T.accent,background:`${T.accent}12`,border:`1px solid ${T.accent}30`,borderRadius:8,padding:'4px 12px',cursor:'pointer',fontFamily:'inherit',fontWeight:600}}>
              ✏️ Editar metas
            </button>
          </div>
          {GOALS.map(g=>(
            <div key={g.label} style={{marginBottom:16}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                <div style={{display:'flex',alignItems:'center',gap:7}}>
                  <span>{g.icon}</span>
                  <span style={{fontSize:13,fontWeight:600,color:T.text}}>{g.label}</span>
                </div>
                <div style={{fontSize:12,color:T.muted}}><strong style={{color:g.color}}>{g.current}</strong> / {g.goal}</div>
              </div>
              <div style={{height:7,background:T.border,borderRadius:4,overflow:'hidden'}}>
                <div style={{height:'100%',width:`${g.pct}%`,background:g.color,borderRadius:4,transition:'width 0.6s'}}/>
              </div>
              <div style={{fontSize:10,color:g.pct>=100?T.accent:T.muted,marginTop:3,textAlign:'right'}}>{g.pct>=100?'✅ Meta alcanzada':`${g.pct}%`}</div>
            </div>
          ))}
        </Card>
      )}

      {/* ── MEDICATIONS ── */}
      {tab==='meds'&&(
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
            <div style={{fontSize:13,fontWeight:700,color:T.text}}>💊 Mis medicamentos</div>
            <Btn size="sm" onClick={()=>setMedModal(true)}><Icon name="plus" size={13}/>Agregar</Btn>
          </div>
          {meds.length===0?(
            <Card style={{textAlign:'center',padding:'32px 20px'}}>
              <div style={{fontSize:36,marginBottom:10}}>💊</div>
              <div style={{color:T.muted,fontSize:14,marginBottom:12}}>Sin medicamentos registrados</div>
              <Btn size="sm" onClick={()=>setMedModal(true)}><Icon name="plus" size={12}/>Agregar medicamento</Btn>
            </Card>
          ):(
            meds.map(m=>(
              <Card key={m.id} style={{marginBottom:10,padding:14}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:10}}>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:14,color:T.text}}>{m.name}</div>
                    <div style={{fontSize:12,color:T.muted,marginTop:3}}>
                      {m.dose&&`${m.dose}${m.unit}`} {m.frequency&&`· ${m.frequency}`} {m.time&&`· 🕐 ${m.time}`}
                    </div>
                    {m.notes&&<div style={{fontSize:11,color:T.dim,marginTop:4}}>{m.notes}</div>}
                  </div>
                  <div style={{display:'flex',gap:6,flexShrink:0}}>
                    <button onClick={()=>scheduleMedNotif(m)}
                      title="Programar recordatorio de hoy"
                      style={{background:`${T.orange}15`,border:`1px solid ${T.orange}40`,borderRadius:8,padding:'5px 10px',cursor:'pointer',fontSize:11,color:T.orange,fontFamily:'inherit',fontWeight:600}}>
                      🔔 Recordatorio
                    </button>
                    <button onClick={()=>delMed(m.id)} aria-label="Eliminar medicamento"
                      style={{background:'none',border:'none',color:T.dim,cursor:'pointer',padding:4,display:'flex'}}>
                      <Icon name="trash" size={13}/>
                    </button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Workout modal */}
      {workoutModal&&<Modal title="Nuevo entreno" onClose={()=>setWorkoutModal(false)}>
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          <Select value={wForm.type} onChange={v=>setWForm(f=>({...f,type:v}))}>
            {WORKOUT_TYPES.map(t=><option key={t} value={t}>{wtIcon(t)} {t}</option>)}
          </Select>
          <Input type="date" value={wForm.date} onChange={v=>setWForm(f=>({...f,date:v}))}/>
          <div style={{display:'flex',gap:8}}>
            <div style={{flex:1}}><label style={{fontSize:11,color:T.muted}}>Duración (min)</label><Input type="number" value={wForm.duration} onChange={v=>setWForm(f=>({...f,duration:v}))}/></div>
            <div style={{flex:1}}><label style={{fontSize:11,color:T.muted}}>Calorías</label><Input type="number" value={wForm.calories} onChange={v=>setWForm(f=>({...f,calories:v}))}/></div>
          </div>
          <Input value={wForm.distance} onChange={v=>setWForm(f=>({...f,distance:v}))} placeholder="Distancia (ej: 5.2km) — opcional"/>
          <Btn onClick={saveWorkout} style={{width:'100%',justifyContent:'center'}}>Guardar entreno</Btn>
        </div>
      </Modal>}

      {/* Metric modal */}
      {metricModal&&<Modal title="Registrar métrica" onClose={()=>setMetricModal(false)}>
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          <Select value={mForm.metric} onChange={v=>setMForm(f=>({...f,metric:v}))}>
            {Object.entries(METRIC_CFG).map(([k,c])=><option key={k} value={k}>{c.icon} {c.label} ({c.unit||'unidades'})</option>)}
          </Select>
          <Input type="number" value={mForm.value} onChange={v=>setMForm(f=>({...f,value:v}))} placeholder={`Valor en ${METRIC_CFG[mForm.metric]?.unit||'unidades'}`}/>
          <Input type="date" value={mForm.date} onChange={v=>setMForm(f=>({...f,date:v}))}/>
          <Btn onClick={saveMetric} style={{width:'100%',justifyContent:'center'}}>Guardar</Btn>
        </div>
      </Modal>}
      {medModal&&<Modal title="Agregar medicamento" onClose={()=>setMedModal(false)}>
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          <Input value={medForm.name} onChange={v=>setMedForm(f=>({...f,name:v}))} placeholder="Nombre del medicamento"/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            <Input value={medForm.dose} onChange={v=>setMedForm(f=>({...f,dose:v}))} placeholder="Dosis (ej: 500)" type="number"/>
            <Select value={medForm.unit} onChange={v=>setMedForm(f=>({...f,unit:v}))}>
              {['mg','ml','g','UI','gotas','comprimido','cápsula'].map(u=><option key={u}>{u}</option>)}
            </Select>
          </div>
          <Select value={medForm.frequency} onChange={v=>setMedForm(f=>({...f,frequency:v}))}>
            {['Diaria','Cada 8h','Cada 12h','Semanal','Mensual','Según necesidad'].map(f=><option key={f}>{f}</option>)}
          </Select>
          <div>
            <label style={{fontSize:11,color:T.muted,display:'block',marginBottom:4}}>⏰ Hora del recordatorio</label>
            <Input type="time" value={medForm.time} onChange={v=>setMedForm(f=>({...f,time:v}))}/>
          </div>
          <Input value={medForm.notes} onChange={v=>setMedForm(f=>({...f,notes:v}))} placeholder="Notas (p.ej: tomar con comida)"/>
          <Btn onClick={saveMed} style={{width:'100%',justifyContent:'center'}}>💊 Guardar</Btn>
        </div>
      </Modal>}
      {goalEditModal&&<Modal title="✏️ Editar metas de salud" onClose={()=>setGoalEditModal(false)}>
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          {[
            {key:'peso',label:'⚖️ Peso objetivo',unit:'kg',placeholder:'75'},
            {key:'sueño',label:'😴 Sueño objetivo',unit:'horas/noche',placeholder:'8'},
            {key:'pasos',label:'👟 Pasos diarios',unit:'pasos',placeholder:'10000'},
            {key:'agua',label:'💧 Agua diaria',unit:'litros',placeholder:'2'},
            {key:'entrenosSem',label:'🏋️ Entrenos/semana',unit:'sesiones',placeholder:'4'},
          ].map(g=>(
            <div key={g.key}>
              <label style={{fontSize:12,color:T.muted,display:'block',marginBottom:4}}>{g.label} ({g.unit})</label>
              <Input type="number" value={goalForm[g.key]||''} onChange={v=>setGoalForm(f=>({...f,[g.key]:v}))} placeholder={g.placeholder}/>
            </div>
          ))}
          <Btn onClick={()=>{
            const upd={...hGoals};
            Object.keys(goalForm).forEach(k=>{if(goalForm[k])upd[k]=Number(goalForm[k]);});
            setData(d=>({...d,healthGoals:upd}));save('healthGoals',upd);
            setGoalEditModal(false);toast.success('Metas de salud actualizadas');
          }} style={{width:'100%',justifyContent:'center'}}>Guardar metas</Btn>
        </div>
      </Modal>}
    </div>
  );
};

const Finance = ({data,setData,isMobile,onBack}) => {
  const [modal,setModal]=useState(false);
  const [editTx,setEditTx]=useState(null);
  const [editBudget,setEditBudget]=useState(null);
  const [tab,setTab]=useState('movimientos');
  const [chartTab,setChartTab]=useState('overview');
  const [filter,setFilter]=useState('all');
  const [monthFilter,setMonthFilter]=useState(today().slice(0,7));
  const [form,setForm]=useState({type:'egreso',amount:'',category:'',description:'',date:today(),currency:'MXN',areaId:''});
  const [editTxForm,setEditTxForm]=useState({});
  const [editBudgetForm,setEditBudgetForm]=useState({});

  const txs=data.transactions||[];
  const budgets=data.budget||[];

  const months=[...new Set(txs.map(t=>t.date.slice(0,7)))].sort((a,b)=>b.localeCompare(a));
  if(months.length>0&&!months.includes(monthFilter)){setMonthFilter(months[0]);}

  const filtered=txs.filter(t=>monthFilter==='all'||t.date.slice(0,7)===monthFilter).filter(t=>filter==='all'||t.type===filter).sort((a,b)=>b.date.localeCompare(a.date));
  const allMonth=txs.filter(t=>t.date.slice(0,7)===monthFilter);
  const totalIngresos=allMonth.filter(t=>t.type==='ingreso').reduce((s,t)=>s+(t.amount||0),0);
  const totalEgresos=allMonth.filter(t=>t.type==='egreso').reduce((s,t)=>s+(t.amount||0),0);
  const balance=totalIngresos-totalEgresos;
  const totalPresupuesto=budgets.reduce((s,b)=>s+(b.amount||0),0);

  const catBreakdown={};
  allMonth.filter(t=>t.type==='egreso').forEach(t=>{const c=t.category||'Sin categoría';catBreakdown[c]=(catBreakdown[c]||0)+t.amount;});
  const catEntries=Object.entries(catBreakdown).sort((a,b)=>b[1]-a[1]);

  const CATS_EGRESO=['Comida','Transporte','Renta','Salud','Entretenimiento','Servicios','Ropa','Educación','Otros'];
  const CATS_INGRESO=['Salario','Freelance','Inversiones','Ventas','Regalo','Otros'];

  const fmtCurrency=(n)=>`$${Number(n).toLocaleString('es-MX',{minimumFractionDigits:0,maximumFractionDigits:0})}`;
  const monthLabel=(m)=>{try{return new Date(m+'-02').toLocaleDateString('es-ES',{month:'long',year:'numeric'});}catch{return m;}};

  // 6-month bar chart data
  const sixMonthsData=Array.from({length:6},(_,i)=>{
    const d=new Date();d.setMonth(d.getMonth()-5+i);
    const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    const label=d.toLocaleDateString('es-ES',{month:'short'});
    const monthTxs=txs.filter(t=>t.date.slice(0,7)===key);
    return {key,label,income:monthTxs.filter(t=>t.type==='ingreso').reduce((s,t)=>s+(t.amount||0),0),expense:monthTxs.filter(t=>t.type==='egreso').reduce((s,t)=>s+(t.amount||0),0)};
  });
  const balanceTrend=sixMonthsData.map(m=>({value:m.income-m.expense}));

  // Budget alerts
  const budgetAlerts=budgets.map(b=>{
    const spent=allMonth.filter(t=>t.type==='egreso'&&t.category===b.title).reduce((s,t)=>s+(t.amount||0),0);
    const pct=b.amount>0?Math.round(spent/b.amount*100):0;
    return{...b,spent,pct,over:pct>100};
  }).filter(b=>b.pct>80);

  // Savings goal
  const savingGoal=data.savingGoal||0;
  const savedAmount=balance>0?balance:0;
  const savePct=savingGoal>0?Math.min(Math.round((savedAmount/savingGoal)*100),100):0;

  const saveTx=()=>{
    if(!form.amount||!form.description.trim())return;
    const t={id:uid(),...form,amount:Number(form.amount),createdAt:today()};
    const upd=[t,...txs];setData(d=>({...d,transactions:upd}));save('transactions',upd);
    setModal(false);setForm({type:'egreso',amount:'',category:'',description:'',date:today(),currency:'MXN',areaId:''});
  };
  const delTx=(id)=>{const upd=txs.filter(t=>t.id!==id);setData(d=>({...d,transactions:upd}));save('transactions',upd);};
  const updateTx=()=>{
    if(!editTxForm.amount||!editTxForm.description?.trim())return;
    const upd=txs.map(t=>t.id===editTx.id?{...t,...editTxForm,amount:Number(editTxForm.amount)}:t);
    setData(d=>({...d,transactions:upd}));save('transactions',upd);setEditTx(null);
  };
  const delBudget=(id)=>{const upd=budgets.filter(b=>b.id!==id);setData(d=>({...d,budget:upd}));save('budget',upd);};
  const updateBudget=()=>{
    if(!editBudgetForm.title?.trim()||!editBudgetForm.amount)return;
    const upd=budgets.map(b=>b.id===editBudget.id?{...b,...editBudgetForm,amount:Number(editBudgetForm.amount)}:b);
    setData(d=>({...d,budget:upd}));save('budget',upd);setEditBudget(null);
  };

  const exportCSV=()=>{
    const rows=[['Fecha','Tipo','Categoría','Descripción','Monto','Moneda'],...filtered.map(t=>[t.date,t.type,t.category||'',t.description,t.amount,t.currency||'MXN'])];
    const csv=rows.map(r=>r.join(',')).join('\n');
    const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);
    a.download=`finanzas_${monthFilter}.csv`;a.click();
  };

  return (
    <div>
      <PageHeader isMobile={isMobile} onBack={onBack}
        title="💰 Finanzas"
        subtitle="Control de ingresos, egresos y presupuesto"
        action={<div style={{display:'flex',gap:6}}>
          <button onClick={exportCSV} style={{padding:'6px 10px',borderRadius:9,border:`1px solid ${T.border}`,background:'transparent',color:T.muted,cursor:'pointer',fontSize:11,fontFamily:'inherit'}}>↓ CSV</button>
          <Btn size="sm" onClick={()=>setModal(true)}><Icon name="plus" size={14}/>Nuevo</Btn>
        </div>}/>

      {/* Insights row */}
      {(()=>{
        const prevMonthDate2=new Date();prevMonthDate2.setMonth(prevMonthDate2.getMonth()-1);
        const prevMonthKey=`${prevMonthDate2.getFullYear()}-${String(prevMonthDate2.getMonth()+1).padStart(2,'0')}`;
        const prevTxs=txs.filter(t=>t.date.slice(0,7)===prevMonthKey);
        const prevEgr=prevTxs.filter(t=>t.type==='egreso').reduce((s,t)=>s+(t.amount||0),0);
        const prevIng=prevTxs.filter(t=>t.type==='ingreso').reduce((s,t)=>s+(t.amount||0),0);
        const expDeltaPct=prevEgr>0?Math.round(((totalEgresos-prevEgr)/prevEgr)*100):null;
        const topCat=catEntries[0];
        return (
          <div style={{display:'flex',gap:8,marginBottom:12,flexWrap:'wrap'}}>
            {expDeltaPct!==null&&(
              <div style={{display:'flex',alignItems:'center',gap:6,padding:'6px 12px',borderRadius:9,background:expDeltaPct>10?`${T.red}12`:expDeltaPct<-10?`${T.green}12`:T.surface2,border:`1px solid ${expDeltaPct>10?T.red:expDeltaPct<-10?T.green:T.border}`,fontSize:12}}>
                <span style={{fontWeight:700,color:expDeltaPct>0?T.red:T.green}}>{expDeltaPct>0?'↑':'↓'}{Math.abs(expDeltaPct)}% egresos</span>
                <span style={{color:T.dim}}>vs mes anterior</span>
              </div>
            )}
            {topCat&&<div style={{display:'flex',alignItems:'center',gap:6,padding:'6px 12px',borderRadius:9,background:`${T.orange}12`,border:`1px solid ${T.orange}30`,fontSize:12}}><span style={{color:T.orange,fontWeight:700}}>Top gasto:</span><span style={{color:T.text}}>{topCat[0]}</span><span style={{color:T.muted}}>{fmtCurrency(topCat[1])}</span></div>}
            {savingGoal>0&&<div style={{display:'flex',alignItems:'center',gap:8,padding:'6px 12px',borderRadius:9,background:`${T.accent}12`,border:`1px solid ${T.accent}30`,fontSize:12,flex:1}}>
              <span style={{color:T.accent,fontWeight:700}}>Meta ahorro:</span>
              <div style={{flex:1,height:6,background:T.border,borderRadius:3,overflow:'hidden',minWidth:60}}>
                <div style={{height:'100%',width:`${savePct}%`,background:T.accent,borderRadius:3}}/>
              </div>
              <span style={{color:T.accent,fontWeight:700,whiteSpace:'nowrap'}}>{savePct}%</span>
            </div>}
          </div>
        );
      })()}

      {/* Summary cards */}
      <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr 1fr':'repeat(4,1fr)',gap:10,marginBottom:16}}>
        {[
          {label:'Ingresos',val:totalIngresos,color:T.green,sign:'+'},
          {label:'Egresos',val:totalEgresos,color:T.red,sign:'-'},
          {label:'Balance',val:balance,color:balance>=0?T.green:T.red,sign:balance>=0?'+':''},
          {label:'Presupuesto/mes',val:totalPresupuesto,color:T.blue,sign:''},
        ].map(s=>(
          <Card key={s.label} style={{textAlign:'center',padding:14}}>
            <div style={{fontSize:11,color:T.muted,marginBottom:4}}>{s.label}</div>
            <div style={{fontSize:isMobile?15:18,fontWeight:700,color:s.color}}>{s.sign}{fmtCurrency(Math.abs(s.val))}</div>
            <div style={{fontSize:10,color:T.dim}}>{monthLabel(monthFilter)}</div>
          </Card>
        ))}
      </div>

      {/* Budget alerts */}
      {budgetAlerts.length>0&&(
        <div style={{marginBottom:14}}>
          {budgetAlerts.map(b=>(
            <div key={b.id} style={{padding:'9px 14px',borderRadius:10,background:`${b.over?T.red:T.orange}10`,border:`1px solid ${b.over?T.red:T.orange}30`,marginBottom:6,display:'flex',gap:8,alignItems:'center'}}>
              <span style={{fontSize:15}}>{b.over?'🚨':'⚠️'}</span>
              <div>
                <span style={{fontSize:12,fontWeight:700,color:b.over?T.red:T.orange}}>{b.title}</span>
                <span style={{fontSize:11,color:T.muted,marginLeft:8}}>{fmtCurrency(b.spent)} de {fmtCurrency(b.amount)} ({b.pct}%{b.over?' — EXCEDIDO':''})</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{display:'flex',gap:6,marginBottom:14,flexWrap:'wrap'}}>
        {[{id:'movimientos',label:'📋 Movimientos'},{id:'graficos',label:'📊 Gráficos'},{id:'presupuesto',label:'📌 Presupuesto'},{id:'ahorro',label:'🎯 Ahorro'}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{padding:'6px 14px',borderRadius:10,border:`1px solid ${tab===t.id?T.accent:T.border}`,background:tab===t.id?`${T.accent}18`:'transparent',color:tab===t.id?T.accent:T.muted,cursor:'pointer',fontSize:12,fontWeight:tab===t.id?600:400,fontFamily:'inherit',whiteSpace:'nowrap'}}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── MOVIMIENTOS ── */}
      {tab==='movimientos'&&(
        <div>
          <div style={{display:'flex',gap:8,marginBottom:14,flexWrap:'wrap',alignItems:'center'}}>
            <select value={monthFilter} onChange={e=>setMonthFilter(e.target.value)}
              style={{background:T.bg,border:`1px solid ${T.border}`,color:T.text,padding:'6px 12px',borderRadius:10,fontSize:13,outline:'none',cursor:'pointer'}}>
              {months.length===0?<option value={today().slice(0,7)}>{monthLabel(today().slice(0,7))}</option>:months.map(m=><option key={m} value={m}>{monthLabel(m)}</option>)}
            </select>
            {['all','ingreso','egreso'].map(f=>(
              <button key={f} onClick={()=>setFilter(f)}
                style={{padding:'6px 14px',borderRadius:10,border:`1px solid ${filter===f?(f==='egreso'?T.red:f==='ingreso'?T.green:T.accent):T.border}`,background:filter===f?(f==='egreso'?`${T.red}18`:f==='ingreso'?`${T.green}18`:`${T.accent}18`):'transparent',color:filter===f?(f==='egreso'?T.red:f==='ingreso'?T.green:T.accent):T.muted,cursor:'pointer',fontSize:12,fontFamily:'inherit'}}>
                {f==='all'?'Todos':f==='ingreso'?'Ingresos':'Egresos'}
              </button>
            ))}
          </div>
          {filtered.map(t=>(
            <div key={t.id} style={{display:'flex',gap:10,alignItems:'center',padding:'10px 14px',background:T.surface,borderRadius:10,marginBottom:6,border:`1px solid ${T.border}`,borderLeft:`3px solid ${t.type==='ingreso'?T.green:T.red}`}}>
              {editTx?.id===t.id?(
                <div style={{flex:1,display:'flex',gap:8,flexWrap:'wrap'}}>
                  <Input style={{flex:2,minWidth:120}} value={editTxForm.description||''} onChange={v=>setEditTxForm(f=>({...f,description:v}))} placeholder="Descripción"/>
                  <Input type="number" style={{width:90}} value={editTxForm.amount||''} onChange={v=>setEditTxForm(f=>({...f,amount:v}))} placeholder="Monto"/>
                  <Btn size="sm" onClick={updateTx}>✓</Btn>
                  <Btn size="sm" variant="ghost" onClick={()=>setEditTx(null)}>✕</Btn>
                </div>
              ):(
                <>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{color:T.text,fontSize:13,fontWeight:500}}>{t.description}</div>
                    <div style={{display:'flex',gap:8,marginTop:2}}>
                      {t.category&&<span style={{fontSize:10,color:T.muted}}>{t.category}</span>}
                      <span style={{fontSize:10,color:T.dim}}>{fmt(t.date)}</span>
                    </div>
                  </div>
                  <div style={{fontSize:14,fontWeight:700,color:t.type==='ingreso'?T.green:T.red,flexShrink:0}}>{t.type==='ingreso'?'+':'-'}{fmtCurrency(t.amount)}</div>
                  <div style={{display:'flex',gap:2,flexShrink:0}}>
                    <button onClick={()=>{setEditTx(t);setEditTxForm({description:t.description,amount:t.amount,category:t.category,date:t.date});}} style={{background:'none',border:'none',color:T.dim,cursor:'pointer',padding:3}}><Icon name="pencil" size={12}/></button>
                    <button onClick={()=>delTx(t.id)} style={{background:'none',border:'none',color:T.dim,cursor:'pointer',padding:3}}><Icon name="trash" size={13}/></button>
                  </div>
                </>
              )}
            </div>
          ))}
          {!filtered.length&&<p style={{color:T.dim,fontSize:13,textAlign:'center',padding:'20px 0'}}>Sin movimientos{filter!=='all'?` de tipo ${filter}`:''}</p>}
        </div>
      )}

      {/* ── GRÁFICOS ── */}
      {tab==='graficos'&&(
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
            {[['overview','📊 6 meses'],['cats','🗂 Categorías'],['trend','📈 Tendencia']].map(([id,label])=>(
              <button key={id} onClick={()=>setChartTab(id)}
                style={{padding:'5px 12px',borderRadius:9,border:`1px solid ${chartTab===id?T.orange:T.border}`,background:chartTab===id?`${T.orange}15`:'transparent',color:chartTab===id?T.orange:T.muted,cursor:'pointer',fontSize:11,fontFamily:'inherit'}}>
                {label}
              </button>
            ))}
          </div>
          {chartTab==='overview'&&(
            <Card style={{padding:18}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                <div style={{fontWeight:700,fontSize:14,color:T.text}}>Ingresos vs Egresos — 6 meses</div>
                <div style={{display:'flex',gap:10}}>
                  {[[T.accent,'Ingresos'],[T.red,'Egresos']].map(([c,l])=>(
                    <div key={l} style={{display:'flex',alignItems:'center',gap:4}}>
                      <div style={{width:7,height:7,borderRadius:2,background:c}}/>
                      <span style={{fontSize:9,color:T.muted}}>{l}</span>
                    </div>
                  ))}
                </div>
              </div>
              <BalanceBarChart months={sixMonthsData} height={100}/>
            </Card>
          )}
          {chartTab==='cats'&&catEntries.length>0&&(
            <Card style={{padding:18}}>
              <div style={{fontWeight:700,fontSize:14,color:T.text,marginBottom:14}}>Egresos por categoría — {monthLabel(monthFilter)}</div>
              {catEntries.map(([cat,amt],i)=>(
                <HBar key={cat} label={cat} value={amt} total={totalEgresos} color={T.areaColors?T.areaColors[i%T.areaColors.length]:T.accent} amount={amt} fmtCurrency={fmtCurrency}/>
              ))}
              {!catEntries.length&&<p style={{color:T.dim,fontSize:13,textAlign:'center'}}>Sin egresos con categoría este mes</p>}
            </Card>
          )}
          {chartTab==='cats'&&!catEntries.length&&(
            <Card style={{padding:18,textAlign:'center'}}><p style={{color:T.dim,fontSize:13}}>Sin egresos categorizados este mes</p></Card>
          )}
          {chartTab==='trend'&&(
            <Card style={{padding:18}}>
              <div style={{fontWeight:700,fontSize:14,color:T.text,marginBottom:4}}>Balance mensual — tendencia</div>
              <div style={{fontSize:11,color:T.muted,marginBottom:12}}>Diferencia entre ingresos y egresos por mes</div>
              <Sparkline data={balanceTrend} color={T.accent} width={isMobile?280:340} height={65} filled/>
              <div style={{display:'flex',justifyContent:'space-between',marginTop:4}}>
                {sixMonthsData.map(m=><span key={m.key} style={{fontSize:9,color:T.dim}}>{m.label}</span>)}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginTop:14}}>
                <div style={{background:T.surface2,borderRadius:10,padding:'10px 12px'}}>
                  <div style={{fontSize:10,color:T.muted}}>Balance este mes</div>
                  <div style={{fontSize:18,fontWeight:800,color:balance>=0?T.accent:T.red,marginTop:2}}>{balance>=0?'+':''}{fmtCurrency(balance)}</div>
                </div>
                <div style={{background:T.surface2,borderRadius:10,padding:'10px 12px'}}>
                  <div style={{fontSize:10,color:T.muted}}>Mejor mes (6m)</div>
                  <div style={{fontSize:18,fontWeight:800,color:T.text,marginTop:2}}>{fmtCurrency(Math.max(...sixMonthsData.map(m=>m.income-m.expense),0))}</div>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ── PRESUPUESTO ── */}
      {tab==='presupuesto'&&(
        <div>
          <p style={{color:T.muted,fontSize:13,marginBottom:14}}>Gastos fijos recurrentes que salen cada mes.</p>
          {budgets.length===0
            ?<div style={{textAlign:'center',padding:'40px 0',color:T.dim}}>
               <div style={{fontSize:32,marginBottom:8}}>📌</div>
               <div style={{fontSize:14}}>Sin presupuesto fijo registrado</div>
               <div style={{fontSize:12,color:T.muted,marginTop:4}}>Agrégalos desde el área correspondiente</div>
             </div>
            :budgets.map(b=>{
              const spent=allMonth.filter(t=>t.type==='egreso'&&t.category===b.title).reduce((s,t)=>s+(t.amount||0),0);
              const pct=b.amount>0?Math.round(spent/b.amount*100):0;
              const alert=pct>100;
              return (
                <div key={b.id} style={{display:'flex',alignItems:'center',gap:10,padding:'12px 14px',background:T.surface,border:`1px solid ${alert?T.red:T.border}`,borderRadius:11,marginBottom:8,borderLeft:`3px solid ${alert?T.red:T.blue}`}}>
                  <div style={{width:36,height:36,borderRadius:10,background:`${T.blue}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>💳</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{color:T.text,fontSize:13,fontWeight:500}}>{b.title}</div>
                    <div style={{color:T.muted,fontSize:11,marginTop:2}}>Día {b.dayOfMonth} · {b.currency||'MXN'}</div>
                    {b.amount>0&&<div style={{height:3,background:T.border,borderRadius:2,marginTop:5}}><div style={{height:'100%',width:`${Math.min(pct,100)}%`,background:alert?T.red:T.accent,borderRadius:2,transition:'width 0.4s'}}/></div>}
                  </div>
                  <div style={{textAlign:'right',flexShrink:0}}>
                    <div style={{color:alert?T.red:T.blue,fontWeight:700,fontSize:15}}>{fmtCurrency(b.amount)}</div>
                    {spent>0&&<div style={{fontSize:10,color:alert?T.red:T.muted,marginTop:2}}>{fmtCurrency(spent)} usado ({pct}%)</div>}
                  </div>
                  <button onClick={()=>{setEditBudget(b);setEditBudgetForm({title:b.title,amount:b.amount,dayOfMonth:b.dayOfMonth||1,currency:b.currency||'MXN'});}} style={{background:`${T.blue}15`,border:`1px solid ${T.blue}30`,borderRadius:7,color:T.blue,cursor:'pointer',padding:'4px 7px',flexShrink:0,fontSize:11}}>✏️</button>
                  <button onClick={()=>delBudget(b.id)} style={{background:'none',border:'none',color:T.dim,cursor:'pointer',padding:4,display:'flex'}}><Icon name="trash" size={13}/></button>
                </div>
              );
            })
          }
          {budgets.length>0&&<div style={{marginTop:12,padding:'12px 14px',background:`${T.blue}10`,border:`1px solid ${T.blue}30`,borderRadius:11}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{color:T.muted,fontSize:13}}>Total mensual fijo</span>
              <span style={{color:T.blue,fontWeight:700,fontSize:16}}>{fmtCurrency(totalPresupuesto)}</span>
            </div>
          </div>}
        </div>
      )}

      {/* ── AHORRO ── */}
      {tab==='ahorro'&&(
        <Card style={{padding:18}}>
          <div style={{fontWeight:700,fontSize:14,color:T.text,marginBottom:4}}>🎯 Meta de ahorro mensual</div>
          <div style={{fontSize:12,color:T.muted,marginBottom:16}}>Configura una meta y sigue tu progreso</div>
          <div style={{display:'flex',gap:12,alignItems:'center',marginBottom:20}}>
            <div style={{flex:1}}>
              <label style={{fontSize:11,color:T.muted}}>Meta de ahorro ($)</label>
              <Input type="number" value={data.savingGoal||''} onChange={v=>{setData(d=>({...d,savingGoal:Number(v)}));save('savingGoal',Number(v));}} placeholder="8000"/>
            </div>
          </div>
          {savingGoal>0&&(
            <>
              <div style={{display:'flex',alignItems:'center',gap:20,marginBottom:16}}>
                <svg width={100} height={100} style={{transform:'rotate(-90deg)',flexShrink:0}}>
                  <circle cx={50} cy={50} r={40} fill="none" stroke={T.border} strokeWidth={10}/>
                  <circle cx={50} cy={50} r={40} fill="none" stroke={savePct>=100?T.accent:T.orange} strokeWidth={10}
                    strokeDasharray={`${2*Math.PI*40*(savePct/100)} ${2*Math.PI*40}`} strokeLinecap="round"
                    style={{transition:'stroke-dasharray 0.8s ease'}}/>
                  <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill={T.text} fontSize={15} fontWeight="800"
                    style={{transform:'rotate(90deg)',transformOrigin:'center'}}>{savePct}%</text>
                </svg>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:T.text,marginBottom:6}}>{savePct>=100?'✅ ¡Meta alcanzada!':'En progreso...'}</div>
                  <div style={{fontSize:12,color:T.muted,marginBottom:4}}>Ahorrado: <strong style={{color:T.accent}}>{fmtCurrency(savedAmount)}</strong></div>
                  <div style={{fontSize:12,color:T.muted}}>Meta: <strong>{fmtCurrency(savingGoal)}</strong></div>
                  {savePct<100&&<div style={{fontSize:11,color:T.dim,marginTop:4}}>Faltan: {fmtCurrency(savingGoal-savedAmount)}</div>}
                </div>
              </div>
              <div style={{height:8,background:T.border,borderRadius:4,overflow:'hidden'}}>
                <div style={{height:'100%',width:`${savePct}%`,background:savePct>=100?T.accent:T.orange,borderRadius:4,transition:'width 0.8s'}}/>
              </div>
            </>
          )}
        </Card>
      )}

      {/* New transaction modal */}
      {modal&&<Modal title="Nuevo movimiento" onClose={()=>setModal(false)}>
        <div style={{display:'flex',gap:8,marginBottom:14}}>
          {['egreso','ingreso'].map(t=>(
            <button key={t} onClick={()=>setForm(f=>({...f,type:t,category:''}))}
              style={{flex:1,padding:'9px 0',borderRadius:10,border:`2px solid ${form.type===t?(t==='egreso'?T.red:T.green):T.border}`,background:form.type===t?(t==='egreso'?`${T.red}18`:`${T.green}18`):'transparent',color:form.type===t?(t==='egreso'?T.red:T.green):T.muted,cursor:'pointer',fontWeight:600,fontSize:14,fontFamily:'inherit'}}>
              {t==='egreso'?'📉 Egreso':'📈 Ingreso'}
            </button>
          ))}
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          <Input value={form.description} onChange={v=>setForm(f=>({...f,description:v}))} placeholder="Descripción (ej: Uber, Nómina...)"/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            <Input value={form.amount} onChange={v=>setForm(f=>({...f,amount:v}))} placeholder="Monto" type="number"/>
            <Select value={form.currency} onChange={v=>setForm(f=>({...f,currency:v}))}>
              {['MXN','USD','EUR','COP','ARS'].map(c=><option key={c}>{c}</option>)}
            </Select>
          </div>
          <Select value={form.category} onChange={v=>setForm(f=>({...f,category:v}))}>
            <option value="">— Categoría —</option>
            {(form.type==='egreso'?CATS_EGRESO:CATS_INGRESO).map(c=><option key={c}>{c}</option>)}
          </Select>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            <Input value={form.date} onChange={v=>setForm(f=>({...f,date:v}))} type="date"/>
            <Select value={form.areaId} onChange={v=>setForm(f=>({...f,areaId:v}))}>
              <option value="">Sin área</option>
              {data.areas.map(a=><option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
            </Select>
          </div>
        </div>
        <div style={{display:'flex',gap:10,marginTop:20}}>
          <Btn onClick={saveTx} style={{flex:1,justifyContent:'center'}}>Guardar</Btn>
          <Btn variant="ghost" onClick={()=>setModal(false)}>Cancelar</Btn>
        </div>
      </Modal>}
      {editTx&&<Modal title="Editar movimiento" onClose={()=>setEditTx(null)}>
        <div style={{display:'flex',gap:8,marginBottom:14}}>
          {['egreso','ingreso'].map(t=>(
            <button key={t} onClick={()=>setEditTxForm(f=>({...f,type:t,category:''}))}
              style={{flex:1,padding:'9px 0',borderRadius:10,border:`2px solid ${editTxForm.type===t?(t==='egreso'?T.red:T.green):T.border}`,background:editTxForm.type===t?(t==='egreso'?`${T.red}18`:`${T.green}18`):'transparent',color:editTxForm.type===t?(t==='egreso'?T.red:T.green):T.muted,cursor:'pointer',fontWeight:600,fontSize:14,fontFamily:'inherit'}}>
              {t==='egreso'?'📉 Egreso':'📈 Ingreso'}
            </button>
          ))}
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          <Input value={editTxForm.description||''} onChange={v=>setEditTxForm(f=>({...f,description:v}))} placeholder="Descripción"/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            <Input value={editTxForm.amount||''} onChange={v=>setEditTxForm(f=>({...f,amount:v}))} placeholder="Monto" type="number"/>
            <Select value={editTxForm.currency||'MXN'} onChange={v=>setEditTxForm(f=>({...f,currency:v}))}>
              {['MXN','USD','EUR','COP','ARS'].map(c=><option key={c}>{c}</option>)}
            </Select>
          </div>
          <Select value={editTxForm.category||''} onChange={v=>setEditTxForm(f=>({...f,category:v}))}>
            <option value="">— Categoría —</option>
            {(editTxForm.type==='egreso'?CATS_EGRESO:CATS_INGRESO).map(c=><option key={c}>{c}</option>)}
          </Select>
          <Input value={editTxForm.date||''} onChange={v=>setEditTxForm(f=>({...f,date:v}))} type="date"/>
        </div>
        <div style={{display:'flex',gap:10,marginTop:20}}>
          <Btn onClick={updateTx} style={{flex:1,justifyContent:'center'}}>Guardar cambios</Btn>
          <Btn variant="ghost" onClick={()=>setEditTx(null)}>Cancelar</Btn>
        </div>
      </Modal>}
      {editBudget&&<Modal title="Editar presupuesto fijo" onClose={()=>setEditBudget(null)}>
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          <Input value={editBudgetForm.title||''} onChange={v=>setEditBudgetForm(f=>({...f,title:v}))} placeholder="Nombre del gasto"/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            <Input value={editBudgetForm.amount||''} onChange={v=>setEditBudgetForm(f=>({...f,amount:v}))} placeholder="Monto" type="number"/>
            <Select value={editBudgetForm.currency||'MXN'} onChange={v=>setEditBudgetForm(f=>({...f,currency:v}))}>
              {['MXN','USD','EUR','COP','ARS'].map(c=><option key={c}>{c}</option>)}
            </Select>
          </div>
          <Input value={editBudgetForm.dayOfMonth||''} onChange={v=>setEditBudgetForm(f=>({...f,dayOfMonth:v}))} placeholder="Día del mes (ej: 1)" type="number"/>
        </div>
        <div style={{display:'flex',gap:10,marginTop:20}}>
          <Btn onClick={updateBudget} style={{flex:1,justifyContent:'center'}}>Guardar cambios</Btn>
          <Btn variant="ghost" onClick={()=>setEditBudget(null)}>Cancelar</Btn>
        </div>
      </Modal>}
    </div>
  );
};


// ===================== ONBOARDING =====================
const ONBOARDING_STEPS=[
  {icon:'🧠',title:'Bienvenido a tu Segundo Cerebro',desc:'Un sistema todo-en-uno para externalizar tu memoria, organizar tus ideas y vivir con más intención.',color:'#00c896'},
  {icon:'📥',title:'Empieza por el Inbox',desc:'Vuelca cualquier idea, tarea o pensamiento. No lo filtres, solo captúralo. Después lo clasificas con el flujo GTD.',color:'#4da6ff'},
  {icon:'🎯',title:'Define tus Objetivos',desc:'Cada área de tu vida puede tener objetivos concretos, con milestones y check-ins semanales para medir avance.',color:'#ff8c42'},
  {icon:'🔥',title:'Construye hábitos sólidos',desc:'Registra tus hábitos diarios y visualiza tu progreso con rachas, heatmaps y estadísticas de las últimas semanas.',color:'#ff5069'},
  {icon:'⚡',title:'Psicke te ayuda',desc:'Abre el asistente IA con el botón flotante y pídele resumir tu día, crear notas/tareas con /comandos, o aconsejarte.',color:'#a78bfa'},
  {icon:'🔍',title:'Búsqueda global',desc:'Presiona Cmd+K (o Ctrl+K) en cualquier momento para buscar en todos tus módulos, o filtrar por fechas como "esta semana".',color:'#ffd166'},
];
const Onboarding=({onDone})=>{
  const [step,setStep]=useState(0);
  const s=ONBOARDING_STEPS[step];
  const isLast=step===ONBOARDING_STEPS.length-1;
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.88)',zIndex:9000,display:'flex',alignItems:'center',justifyContent:'center',padding:16,backdropFilter:'blur(8px)'}}>
      <div style={{background:T.surface,border:`1px solid ${s.color}50`,borderRadius:20,padding:32,maxWidth:400,width:'100%',textAlign:'center',boxShadow:`0 0 60px ${s.color}30`}}>
        {/* Progress dots */}
        <div style={{display:'flex',gap:6,justifyContent:'center',marginBottom:24}}>
          {ONBOARDING_STEPS.map((_,i)=>(
            <div key={i} style={{width:i===step?22:7,height:7,borderRadius:4,background:i===step?s.color:T.border,transition:'all 0.3s'}}/>
          ))}
        </div>
        <div style={{fontSize:52,marginBottom:16,lineHeight:1}}>{s.icon}</div>
        <h2 style={{color:T.text,fontSize:20,fontWeight:700,margin:'0 0 12px',lineHeight:1.3}}>{s.title}</h2>
        <p style={{color:T.muted,fontSize:14,lineHeight:1.7,margin:'0 0 28px'}}>{s.desc}</p>
        <div style={{display:'flex',gap:10,justifyContent:'center'}}>
          {step>0&&<button onClick={()=>setStep(s=>s-1)} style={{padding:'10px 20px',borderRadius:12,border:`1px solid ${T.border}`,background:'transparent',color:T.muted,cursor:'pointer',fontSize:13,fontFamily:'inherit'}}>← Atrás</button>}
          <button onClick={isLast?onDone:()=>setStep(s=>s+1)}
            style={{padding:'10px 28px',borderRadius:12,border:'none',background:s.color,color:'#000',cursor:'pointer',fontSize:14,fontWeight:700,fontFamily:'inherit',flex:1,maxWidth:200}}>
            {isLast?'¡Empezar! 🚀':'Siguiente →'}
          </button>
        </div>
        <button onClick={onDone} style={{marginTop:14,background:'none',border:'none',color:T.dim,cursor:'pointer',fontSize:12,fontFamily:'inherit'}}>Omitir tour</button>
      </div>
    </div>
  );
};


const ToastCtx = { listeners: [] };
const toast = {
  show:(msg,type='success',sub='')=>ToastCtx.listeners.forEach(fn=>fn({id:Date.now()+Math.random(),msg,type,sub})),
  success:(msg,sub='')=>toast.show(msg,'success',sub),
  info:(msg,sub='')=>toast.show(msg,'info',sub),
  warn:(msg,sub='')=>toast.show(msg,'warn',sub),
  error:(msg,sub='')=>toast.show(msg,'error',sub),
};
const ToastContainer=()=>{
  const [toasts,setToasts]=useState([]);
  useEffect(()=>{
    const fn=(t)=>{
      setToasts(prev=>[...prev.slice(-4),t]);
      setTimeout(()=>setToasts(prev=>prev.filter(x=>x.id!==t.id)),4000);
    };
    ToastCtx.listeners.push(fn);
    return()=>{ToastCtx.listeners=ToastCtx.listeners.filter(f=>f!==fn);};
  },[]);
  const tColor=(type)=>({success:T.accent,info:T.blue,warn:T.orange,error:T.red}[type]||T.accent);
  if(!toasts.length) return null;
  return (
    <div style={{position:'fixed',bottom:isMobileGlobal?72:24,right:16,zIndex:9999,display:'flex',flexDirection:'column',gap:8,maxWidth:320,minWidth:240}}>
      {toasts.map(t=>(
        <div key={t.id} style={{background:T.surface2,border:`1px solid ${tColor(t.type)}40`,borderLeft:`3px solid ${tColor(t.type)}`,borderRadius:10,padding:'10px 14px',display:'flex',gap:10,alignItems:'flex-start',boxShadow:'0 4px 24px rgba(0,0,0,0.4)',animation:'slideIn 0.2s ease'}}>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:700,color:T.text}}>{t.msg}</div>
            {t.sub&&<div style={{fontSize:11,color:T.muted,marginTop:2}}>{t.sub}</div>}
          </div>
          <button onClick={()=>setToasts(p=>p.filter(x=>x.id!==t.id))} style={{background:'none',border:'none',color:T.dim,cursor:'pointer',fontSize:18,padding:0,lineHeight:1,flexShrink:0}}>×</button>
        </div>
      ))}
    </div>
  );
};
// ===================== ERROR BOUNDARY =====================
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{background:'#090e13',color:'#ff5c5c',padding:24,fontFamily:'monospace',fontSize:13,minHeight:'100vh',overflowY:'auto'}}>
          <div style={{color:'#00c896',fontSize:18,marginBottom:16}}>🧠 Error detectado</div>
          <pre style={{whiteSpace:'pre-wrap',wordBreak:'break-all',color:'#ff5c5c'}}>{String(this.state.error)}</pre>
          <pre style={{whiteSpace:'pre-wrap',wordBreak:'break-all',color:'#6b8299',fontSize:11,marginTop:12}}>{this.state.error?.stack}</pre>
          <button onClick={()=>this.setState({error:null})} style={{marginTop:16,background:'#00c896',color:'#000',border:'none',borderRadius:8,padding:'8px 16px',cursor:'pointer',fontWeight:600}}>Reintentar</button>
        </div>
      );
    }
    return this.props.children;
  }
}

let isMobileGlobal=false;

// ===================== LOADING SKELETON =====================
const AppLoader = () => (
  <div style={{
    display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
    height:'100dvh', width:'100%', background:T.bg, gap:20,
    fontFamily:"'DM Sans',system-ui,sans-serif"
  }}>
    <div style={{
      width:52, height:52, borderRadius:14,
      background:`linear-gradient(135deg,${T.accent},${T.orange})`,
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:30, animation:'sbPulse 1.4s ease-in-out infinite'
    }}>🧠</div>
    <div style={{display:'flex', flexDirection:'column', gap:10, alignItems:'center'}}>
      {[160,120,140].map((w,i)=>(
        <div key={i} style={{
          width:w, height:10, borderRadius:6,
          background:`linear-gradient(90deg,${T.surface} 25%,${T.surface2} 50%,${T.surface} 75%)`,
          backgroundSize:'200% 100%',
          animation:`sbShimmer 1.4s ease-in-out ${i*0.15}s infinite`
        }}/>
      ))}
    </div>
    <style>{`
      @keyframes sbPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.7;transform:scale(0.95)}}
      @keyframes sbShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
    `}</style>
  </div>
);

function App() {
  const [view,setView]=useState('dashboard');
  const [viewHint,setViewHint]=useState(null);
  const [data,setData]=useState(null);
  const [showMore,setShowMore]=useState(false);
  const [psickeOpen,setPsickeOpen]=useState(false);
  const [showSearch,setShowSearch]=useState(false);
  const [apiKey,setApiKey]=useState(()=>{try{return localStorage.getItem('sb_gemini_key')||'';}catch{return '';}});
  const [showOnboarding,setShowOnboarding]=useState(()=>{try{return !localStorage.getItem('sb_onboarding_done');}catch{return true;}});
  const [transitioning,setTransitioning]=useState(false);
  const [isOnline,setIsOnline]=useState(typeof navigator!=='undefined'?navigator.onLine:true);
  const isMobile=useIsMobile();
  isMobileGlobal=isMobile;

  // ── Online/Offline detection ──
  useEffect(()=>{
    const goOnline=()=>setIsOnline(true);
    const goOffline=()=>setIsOnline(false);
    window.addEventListener('online',goOnline);
    window.addEventListener('offline',goOffline);
    return()=>{window.removeEventListener('online',goOnline);window.removeEventListener('offline',goOffline);};
  },[]);

  // ── Emoji favicon + PWA manifest ──
  useEffect(()=>{
    // Favicon
    const canvas=document.createElement('canvas');
    canvas.width=64; canvas.height=64;
    const ctx=canvas.getContext('2d');
    ctx.font='52px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('🧠',32,36);
    const link=document.querySelector("link[rel~='icon']")||document.createElement('link');
    link.rel='icon'; link.href=canvas.toDataURL();
    document.head.appendChild(link);
    document.title='Segundo Cerebro';

    // PWA Web App Manifest (injected dynamically so no separate file needed)
    if(!document.querySelector('link[rel="manifest"]')){
      const manifest={
        name:'Segundo Cerebro',
        short_name:'2do Cerebro',
        description:'Tu sistema de productividad personal — Método Tiago Forte',
        start_url:'/',
        display:'standalone',
        background_color:'#090e13',
        theme_color:'#090e13',
        orientation:'portrait-primary',
        icons:[
          {src:canvas.toDataURL(),sizes:'64x64',type:'image/png'},
        ],
        categories:['productivity','lifestyle'],
        lang:'es',
      };
      const blob=new Blob([JSON.stringify(manifest)],{type:'application/json'});
      const manifestUrl=URL.createObjectURL(blob);
      const mLink=document.createElement('link');
      mLink.rel='manifest'; mLink.href=manifestUrl;
      document.head.appendChild(mLink);
      // Theme color meta
      const tc=document.querySelector('meta[name="theme-color"]')||document.createElement('meta');
      tc.name='theme-color'; tc.content='#090e13';
      document.head.appendChild(tc);
      // Apple mobile web app meta
      const apple=document.querySelector('meta[name="apple-mobile-web-app-capable"]')||document.createElement('meta');
      apple.name='apple-mobile-web-app-capable'; apple.content='yes';
      document.head.appendChild(apple);
    }

    // Service Worker — offline-first, cache-then-network strategy
    if('serviceWorker' in navigator){
      const swCode=`
const CACHE='sb-v1';
const CORE=['/','/index.html'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>
    Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))
  ).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  if(e.request.url.includes('fonts.googleapis')||e.request.url.includes('fonts.gstatic')){
    e.respondWith(caches.open(CACHE).then(c=>c.match(e.request).then(cached=>{
      if(cached) return cached;
      return fetch(e.request).then(r=>{c.put(e.request,r.clone());return r;}).catch(()=>new Response('',{status:408}));
    })));
    return;
  }
  e.respondWith(
    fetch(e.request)
      .then(r=>{
        if(r.ok){const cl=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cl));}
        return r;
      })
      .catch(()=>caches.match(e.request).then(c=>c||new Response('Offline',{status:503})))
  );
});
      `;
      const swBlob=new Blob([swCode],{type:'text/javascript'});
      const swUrl=URL.createObjectURL(swBlob);
      navigator.serviceWorker.register(swUrl,{scope:'/'})
        .catch(()=>{}); // fails gracefully in cross-origin / sandboxed envs
    }
  },[]);

  // Cmd+K global search
  useEffect(()=>{
    const handler=(e)=>{
      if((e.metaKey||e.ctrlKey)&&e.key==='k'){e.preventDefault();setShowSearch(true);}
      if(e.key==='Escape')setShowSearch(false);
    };
    window.addEventListener('keydown',handler);
    return()=>window.removeEventListener('keydown',handler);
  },[]);

  // Smart navigate: sets view + optional hint for target component
  const navigate=(v,hint=null)=>{
    if(v===view){setViewHint(hint);return;}
    setTransitioning(true);
    setTimeout(()=>{setView(v);setViewHint(hint);setTransitioning(false);},120);
  };
  // Nav bar navigate: clears any hint
  const navTo=(v)=>{
    if(v===view)return;
    setTransitioning(true);
    setTimeout(()=>{setView(v);setViewHint(null);setTransitioning(false);},120);
  };

  useEffect(()=>{
    (async()=>{
      const def=initData();
      const [areas,objectives,projects,tasks,notes,inbox,habits,budget,transactions,healthMetrics,healthGoals,medications,workouts,maintenances,homeDocs,homeContacts,learnings,retros,ideas,people,followUps,interactions,sideProjects,spTasks,milestones,spTimeLogs,journal,books,shopping,education,carMaintenances,carExpenses,carDocs,carReminders,carInfo,vehicles,activeVehicleId]=await Promise.all([
        load('areas',def.areas),load('objectives',def.objectives),load('projects',def.projects),
        load('tasks',def.tasks),load('notes',def.notes),load('inbox',def.inbox),load('habits',def.habits),load('budget',def.budget),
        load('transactions',def.transactions),
        load('healthMetrics',def.healthMetrics),load('healthGoals',def.healthGoals),load('medications',def.medications),load('workouts',def.workouts),
        load('maintenances',def.maintenances),load('homeDocs',def.homeDocs),load('homeContacts',def.homeContacts),
        load('learnings',def.learnings),load('retros',def.retros),load('ideas',def.ideas),
        load('people',def.people),load('followUps',def.followUps),load('interactions',def.interactions),
        load('sideProjects',def.sideProjects),load('spTasks',def.spTasks),load('milestones',def.milestones),load('spTimeLogs',def.spTimeLogs),
        load('journal',def.journal),load('books',def.books),load('shopping',def.shopping),load('education',def.education),
        load('carMaintenances',def.carMaintenances),load('carExpenses',def.carExpenses),
        load('carDocs',def.carDocs),load('carReminders',def.carReminders),load('carInfo',def.carInfo),
        load('vehicles',def.vehicles),load('activeVehicleId',def.activeVehicleId),
      ]);
      setData({areas,objectives,projects,tasks,notes,inbox,habits,budget,transactions,healthMetrics,healthGoals,medications,workouts,maintenances,homeDocs,homeContacts,learnings,retros,ideas,people,followUps,interactions,sideProjects,spTasks,milestones,journal,books,shopping,education,carMaintenances,carExpenses,carDocs,carReminders,carInfo,vehicles,activeVehicleId});
    })();
  },[]);

  // ── Hooks must be declared before any conditional return (Rules of Hooks) ──
  const consumeHint = useCallback(()=>setViewHint(null),[]);
  const backToDashboard = useCallback(()=>navTo('dashboard'),[]);

  if(!data) return <AppLoader/>;

  const inboxCount=data.inbox.filter(i=>!i.processed).length;
  const props={data,setData,isMobile};

  // ── View renderer ──
  const renderView = () => {
    const p=props;
    switch(view){
      case 'dashboard':    return <Dashboard {...p} onNavigate={navigate}/>;
      case 'areas':        return <Areas data={data} isMobile={isMobile} onNavigate={navigate}/>;
      case 'areaDetail':   return <AreaDetail {...p} viewHint={viewHint} onConsumeHint={consumeHint} onNavigate={navigate} onBack={()=>navTo('areas')}/>;
      case 'objectives':   return <Objectives {...p} viewHint={viewHint} onConsumeHint={consumeHint} onNavigate={navigate}/>;
      case 'projects':     return <ProjectsAndTasks {...p} viewHint={viewHint} onConsumeHint={consumeHint} onNavigate={navigate}/>;
      case 'notes':        return <Notes {...p} viewHint={viewHint} onConsumeHint={consumeHint}/>;
      case 'finance':      return <Finance {...p} onBack={backToDashboard}/>;
      case 'inbox':        return <Inbox {...p}/>;
      case 'habits':       return <HabitTracker {...p}/>;
      case 'journal':      return <Journal {...p}/>;
      case 'books':        return <Books {...p}/>;
      case 'shopping':     return <Shopping {...p}/>;
      case 'education':    return <Education {...p}/>;
      case 'health':       return <Health {...p} onBack={backToDashboard}/>;
      case 'relaciones':   return <Relaciones {...p} onBack={backToDashboard}/>;
      case 'sideprojects': return <SideProjects {...p} onBack={backToDashboard}/>;
      case 'trabajo':      return <TrabajoEmbed isMobile={isMobile} onBack={backToDashboard}/>;
      case 'desarrollo':   return <DesarrolloPersonal {...p} onBack={backToDashboard}/>;
      case 'hogar':        return <Hogar {...p} onBack={backToDashboard}/>;
      case 'coche':        return <Coche {...p} onBack={backToDashboard}/>;
      case 'settings':     return <Settings apiKey={apiKey} setApiKey={setApiKey} isMobile={isMobile} data={data} setData={setData} viewHint={viewHint} onConsumeHint={consumeHint} onOpenPsicke={()=>setPsickeOpen(true)}/>;
      default:             return null;
    }
  };

  // Keep legacy alias so nothing downstream breaks
  const views = { [view]: renderView() };
  

  return (
    <div style={{display:'flex',flexDirection:isMobile?'column':'row',height:'100dvh',width:'100%',background:T.bg,fontFamily:"'DM Sans',system-ui,sans-serif",color:T.text,overflow:'hidden',position:'fixed',inset:0}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap');
        html,body,#root{margin:0;padding:0;width:100%;height:100%;background:#090e13;}
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
        *:focus-visible{outline:2px solid ${T.accent};outline-offset:2px;border-radius:4px;}
        ::-webkit-scrollbar{width:5px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:${T.border};border-radius:3px;}
        @keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
        input[type=date]::-webkit-calendar-picker-indicator{filter:invert(0.5);}
        select option{background:${T.surface};}
      `}</style>

      {/* Offline indicator */}
      {!isOnline&&(
        <div style={{position:'fixed',top:0,left:0,right:0,zIndex:999,background:'#ff5c5c',color:'#fff',textAlign:'center',padding:'6px 12px',fontSize:12,fontWeight:700,letterSpacing:0.3,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
          <span>📡</span> Sin conexión — los datos se guardan localmente
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      {!isMobile&&(
        <div style={{width:220,background:T.surface,borderRight:`1px solid ${T.border}`,display:'flex',flexDirection:'column',flexShrink:0}}>
          <div style={{padding:'20px 16px 16px',borderBottom:`1px solid ${T.border}`}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:34,height:34,background:`linear-gradient(135deg,${T.accent},${T.orange})`,borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>
                🧠
              </div>
              <div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:700,color:T.text,lineHeight:1}}>Segundo</div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:700,color:T.accent,lineHeight:1}}>Cerebro</div>
              </div>
            </div>
          </div>
          <nav role="navigation" aria-label="Menú principal" style={{flex:1,padding:'8px 8px',overflowY:'auto'}}>
            {NAV_SECTIONS.map(section=>(
              <div key={section.label} style={{marginBottom:4}}>
                <div style={{fontSize:9,fontWeight:700,color:T.dim,letterSpacing:1.2,textTransform:'uppercase',padding:'8px 12px 4px'}}>{section.label}</div>
                {section.items.map(item=>{
                  const active=view===item.id;
                  const badge=item.id==='inbox'&&inboxCount>0?inboxCount:null;
                  return (
                    <button key={item.id} onClick={()=>navTo(item.id)}
                      aria-label={`Ir a ${item.name}`} aria-current={active?'page':undefined}
                      style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'7px 12px',borderRadius:9,border:'none',cursor:'pointer',textAlign:'left',fontFamily:'inherit',fontSize:12,fontWeight:active?600:400,
                        background:active?`${T.accent}18`:'transparent',color:active?T.accent:T.muted,transition:'all 0.15s',marginBottom:1}}>
                      <Icon name={item.icon} size={15} color={active?T.accent:T.muted}/>
                      <span style={{flex:1}}>{item.label}</span>
                      {badge&&<span style={{background:T.red,color:'#fff',fontSize:10,fontWeight:700,padding:'1px 6px',borderRadius:10}}>{badge}</span>}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
          <div style={{padding:'12px 16px',borderTop:`1px solid ${T.border}`,display:'flex',flexDirection:'column',gap:6}}>
            <button onClick={()=>setShowSearch(true)} aria-label="Abrir búsqueda global (Cmd+K)" style={{display:'flex',alignItems:'center',gap:8,background:'transparent',border:`1px solid ${T.border}`,borderRadius:8,padding:'6px 10px',cursor:'pointer',color:T.muted,fontSize:12,fontFamily:'inherit',width:'100%',marginBottom:4}}>
              🔍 <span>Búsqueda global</span>
            </button>
            <div style={{display:'flex',alignItems:'center',gap:6,cursor:'pointer'}} onClick={()=>navTo('settings')}>
              <span style={{width:7,height:7,borderRadius:'50%',background:apiKey?T.green:T.red,display:'inline-block',flexShrink:0}}/>
              <span style={{fontSize:11,color:apiKey?T.green:T.red,fontWeight:600}}>{apiKey?'Gemini activo':'Sin API Key'}</span>
            </div>
            <div style={{fontSize:10,color:T.dim,textAlign:'center'}}>Método Tiago Forte</div>
          </div>
        </div>
      )}

      {/* MOBILE TOP BAR */}
      {isMobile&&(
        <div style={{background:T.surface,borderBottom:`1px solid ${T.border}`,padding:'12px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <div style={{width:28,height:28,background:`linear-gradient(135deg,${T.accent},${T.orange})`,borderRadius:7,display:'flex',alignItems:'center',justifyContent:'center',fontSize:17}}>
              🧠
            </div>
            <span style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,color:T.text}}>
              Segundo <span style={{color:T.accent}}>Cerebro</span>
            </span>
          </div>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
          {inboxCount>0&&<span style={{background:T.red,color:'#fff',fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:12}}>{inboxCount} inbox</span>}
          <button onClick={()=>setShowSearch(true)} aria-label="Buscar" style={{background:'none',border:`1px solid ${T.border}`,borderRadius:8,padding:'3px 10px',cursor:'pointer',color:T.muted,fontSize:11,fontWeight:600,display:'flex',alignItems:'center',gap:4}}>🔍</button>
          <button onClick={()=>navTo('settings')} aria-label="Configuración" style={{background:'none',border:`1px solid ${apiKey?T.green:T.red}`,borderRadius:8,padding:'3px 10px',cursor:'pointer',color:apiKey?T.green:T.red,fontSize:11,fontWeight:600,display:'flex',alignItems:'center',gap:4}}>
            <span style={{width:6,height:6,borderRadius:'50%',background:apiKey?T.green:T.red,display:'inline-block'}}/>
            {apiKey?'IA ON':'IA OFF'}
          </button>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main role="main" aria-label="Contenido principal" style={{flex:1,overflowY:'auto',padding:isMobile?'16px 16px 90px':'28px',minHeight:0,marginTop:isOnline?0:28}}>
        <div style={{opacity:transitioning?0:1,transform:transitioning?'translateY(6px)':'translateY(0)',transition:'opacity 0.12s ease,transform 0.12s ease'}}>
          {views[view]}
        </div>
      </main>

      {/* MOBILE BOTTOM NAV */}
      {isMobile&&(
        <nav role="navigation" aria-label="Navegación móvil" style={{position:'fixed',bottom:0,left:0,right:0,background:T.surface,borderTop:`1px solid ${T.border}`,display:'flex',zIndex:50,paddingBottom:'env(safe-area-inset-bottom)'}}>
          {MOBILE_NAV.map(item=>{
            const isPsicke=item.id==='__psicke__';
            const active=isPsicke?psickeOpen:(view===item.id&&!psickeOpen);
            return (
              <button key={item.id} aria-label={isPsicke?'Abrir Psicke IA':`Ir a ${item.label}`} aria-current={active?'page':undefined}
                onClick={()=>{
                if(isPsicke){setPsickeOpen(true);}
                else{setPsickeOpen(false);navTo(item.id);}
              }}
                style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'10px 4px 8px',border:'none',cursor:'pointer',background:'transparent',color:active?T.accent:T.dim,fontFamily:'inherit',position:'relative',gap:3}}>
                {isPsicke?(
                  <div style={{width:22,height:22,borderRadius:6,background:active?`linear-gradient(135deg,${T.accent},${T.orange})`:`${T.dim}33`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,transition:'all 0.2s'}}>
                    🧠
                  </div>
                ):(
                  <Icon name={item.icon} size={22} color={active?T.accent:undefined}/>
                )}
                <span style={{fontSize:10,fontWeight:active?600:400,color:active?T.accent:T.dim}}>{item.label}</span>
              </button>
            );
          })}
        </nav>
      )}

      {/* GLOBAL SEARCH OVERLAY */}
      {showSearch&&data&&<GlobalSearch data={data} onNavigate={(v,h)=>{navigate(v,h);}} onClose={()=>setShowSearch(false)}/>}

      {/* PSICKE — nav-controlled, no floating bubble */}
      <Psicke apiKey={apiKey} onGoSettings={()=>navTo('settings')} data={data} setData={setData}
        openFromNav={psickeOpen} onNavClose={()=>setPsickeOpen(false)}/>

      {/* ONBOARDING */}
      {showOnboarding&&<Onboarding onDone={()=>{localStorage.setItem('sb_onboarding_done','1');setShowOnboarding(false);}}/>}

      <ToastContainer/>
    </div>
  );
}

export default function AppWithBoundary() {
  return <ErrorBoundary><App /></ErrorBoundary>;
}
