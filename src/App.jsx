import { useState, useEffect, useRef } from "react";

// ===================== THEME =====================
const T = {
  bg: '#090e13', surface: '#0f1923', surface2: '#162030',
  border: '#1e2d3d', borderLight: '#243447',
  accent: '#00c896', accentHover: '#00e0a8',
  text: '#e2eaf4', muted: '#6b8299', dim: '#3a5068',
  green: '#00c896', red: '#ff5c5c', blue: '#4da6ff',
  purple: '#a78bfa', orange: '#ff8c42',
  userBubble: '#00c896', userText: '#000',
  areaColors: ['#4da6ff','#00c896','#ff8c42','#a78bfa','#ff5c5c','#00e0a8','#ffd166','#ff6b8a'],
};

// ===================== RESPONSIVE HOOK =====================
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
};

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
const Icon = ({ name, size = 18, color }) => {
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
  };
  return <span style={{display:'inline-flex',alignItems:'center'}}>{icons[name]||null}</span>;
};

// ===================== HELPERS =====================
const uid = () => Math.random().toString(36).slice(2,10);
const today = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
const fmt = (d) => d ? new Date(d).toLocaleDateString('es-ES',{day:'2-digit',month:'short'}) : '';

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
  journal:[],
  books:[],
  shopping:[{id:uid(),name:'Leche',qty:2,unit:'L',category:'Lácteos',done:false,createdAt:today()},{id:uid(),name:'Pan integral',qty:1,unit:'pza',category:'Panadería',done:false,createdAt:today()}],
  education:[],
});

// ===================== BASE COMPONENTS =====================
const Modal = ({title,onClose,children}) => (
  <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',zIndex:200,display:'flex',alignItems:'flex-end',justifyContent:'center',backdropFilter:'blur(4px)'}}
    onClick={e=>e.target===e.currentTarget&&onClose()}>
    <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:'16px 16px 0 0',padding:24,width:'100%',maxWidth:520,boxShadow:'0 -8px 40px rgba(0,0,0,0.5)',maxHeight:'90vh',overflowY:'auto'}}>
      <div style={{width:36,height:4,background:T.border,borderRadius:2,margin:'0 auto 20px'}}/>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <h3 style={{margin:0,color:T.text,fontSize:16,fontWeight:600}}>{title}</h3>
        <button onClick={onClose} style={{background:'none',border:'none',color:T.muted,cursor:'pointer',padding:4,display:'flex'}}><Icon name="x" size={18}/></button>
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

const PageHeader = ({title,subtitle,action,isMobile}) => (
  <div style={{marginBottom:20}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <h2 style={{margin:0,color:T.text,fontSize:isMobile?18:20,fontWeight:700}}>{title}</h2>
      {action}
    </div>
    {subtitle&&<p style={{color:T.muted,fontSize:13,marginTop:4,marginBottom:0}}>{subtitle}</p>}
  </div>
);

// ===================== GLOBAL SEARCH =====================
const GlobalSearch = ({data,onNavigate,onClose}) => {
  const [q,setQ]=useState('');
  const inputRef=useRef(null);
  useEffect(()=>inputRef.current?.focus(),[]);
  if(!q.trim()) return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:300,display:'flex',alignItems:'flex-start',justifyContent:'center',paddingTop:60,backdropFilter:'blur(6px)'}} onClick={onClose}>
      <div style={{width:'100%',maxWidth:520,padding:'0 16px'}} onClick={e=>e.stopPropagation()}>
        <div style={{position:'relative'}}>
          <input ref={inputRef} value={q} onChange={e=>setQ(e.target.value)} autoComplete="off"
            placeholder="Buscar en todo tu Segundo Cerebro..."
            style={{width:'100%',background:T.surface,border:`2px solid ${T.accent}`,color:T.text,padding:'14px 44px 14px 16px',borderRadius:14,fontSize:16,outline:'none',boxSizing:'border-box',fontFamily:'inherit'}}/>
          <button onClick={onClose} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:T.muted,cursor:'pointer',display:'flex'}}><Icon name="x" size={20}/></button>
        </div>
        <div style={{marginTop:12,color:T.dim,fontSize:12,textAlign:'center'}}>Busca en notas, tareas, objetivos, proyectos y hábitos</div>
      </div>
    </div>
  );
  const ql=q.toLowerCase();
  const results=[
    ...data.notes.filter(n=>n.title.toLowerCase().includes(ql)||n.content.toLowerCase().includes(ql)||(n.tags||[]).some(t=>t.toLowerCase().includes(ql))).map(n=>({type:'📝 Nota',label:n.title,sub:n.content.slice(0,60),action:()=>{onNavigate('notes',n.id);onClose();}})),
    ...data.tasks.filter(t=>t.title.toLowerCase().includes(ql)).map(t=>({type:'✅ Tarea',label:t.title,sub:t.status==='done'?'Completada':'Pendiente',action:()=>{onNavigate('projects',null);onClose();}})),
    ...data.objectives.filter(o=>o.title.toLowerCase().includes(ql)).map(o=>({type:'🎯 Objetivo',label:o.title,sub:o.status==='active'?'Activo':'Completado',action:()=>{onNavigate('objectives',null);onClose();}})),
    ...data.projects.filter(p=>p.title.toLowerCase().includes(ql)).map(p=>({type:'📁 Proyecto',label:p.title,sub:'',action:()=>{onNavigate('projects',null);onClose();}})),
    ...data.habits.filter(h=>h.name.toLowerCase().includes(ql)).map(h=>({type:'🔁 Hábito',label:h.name,sub:h.frequency==='daily'?'Diario':'Semanal',action:()=>{onNavigate('habits',null);onClose();}})),
  ];
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:300,display:'flex',alignItems:'flex-start',justifyContent:'center',paddingTop:60,backdropFilter:'blur(6px)'}} onClick={onClose}>
      <div style={{width:'100%',maxWidth:520,padding:'0 16px',maxHeight:'70vh',display:'flex',flexDirection:'column'}} onClick={e=>e.stopPropagation()}>
        <div style={{position:'relative',marginBottom:8}}>
          <input ref={inputRef} value={q} onChange={e=>setQ(e.target.value)} autoComplete="off"
            placeholder="Buscar en todo tu Segundo Cerebro..."
            style={{width:'100%',background:T.surface,border:`2px solid ${T.accent}`,color:T.text,padding:'14px 44px 14px 16px',borderRadius:14,fontSize:16,outline:'none',boxSizing:'border-box',fontFamily:'inherit'}}/>
          <button onClick={onClose} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:T.muted,cursor:'pointer',display:'flex'}}><Icon name="x" size={20}/></button>
        </div>
        <div style={{overflowY:'auto',background:T.surface,borderRadius:12,border:`1px solid ${T.border}`}}>
          {results.length===0?(<div style={{padding:'24px',textAlign:'center',color:T.dim,fontSize:14}}>Sin resultados para "{q}"</div>)
            :results.map((r,i)=>(
              <div key={i} onClick={r.action} style={{padding:'12px 16px',cursor:'pointer',borderBottom:`1px solid ${T.border}`,display:'flex',gap:10,alignItems:'center'}}
                onMouseEnter={e=>e.currentTarget.style.background=T.surface2} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <span style={{fontSize:11,color:T.accent,background:`${T.accent}18`,padding:'2px 8px',borderRadius:8,flexShrink:0,fontWeight:600}}>{r.type}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{color:T.text,fontSize:14,fontWeight:500}}>{r.label}</div>
                  {r.sub&&<div style={{color:T.muted,fontSize:12,marginTop:1}}>{r.sub}</div>}
                </div>
              </div>
            ))}
        </div>
        <div style={{marginTop:8,color:T.dim,fontSize:11,textAlign:'center'}}>{results.length} resultado{results.length!==1?'s':''}</div>
      </div>
    </div>
  );
};

// ===================== DASHBOARD =====================
const Dashboard = ({data,isMobile,onNavigate}) => {
  const pendingTasks=data.tasks.filter(t=>t.status!=='done').length;
  const inboxUnread=data.inbox.filter(i=>!i.processed).length;
  const todayHabits=data.habits.filter(h=>h.completions.includes(today())).length;
  const stats=[
    {label:'Áreas',val:data.areas.length,icon:'grid',color:T.blue,view:'areas',hint:null},
    {label:'Objetivos',val:data.objectives.filter(o=>o.status==='active').length,icon:'target',color:T.accent,view:'objectives',hint:'active'},
    {label:'Tareas',val:pendingTasks,icon:'check',color:T.orange,view:'projects',hint:'pending'},
    {label:'Inbox',val:inboxUnread,icon:'inbox',color:T.red,view:'inbox',hint:'unread'},
    {label:'Hábitos hoy',val:`${todayHabits}/${data.habits.length}`,icon:'habit',color:T.green,view:'habits',hint:'today'},
    {label:'Notas',val:data.notes.length,icon:'note',color:T.purple,view:'notes',hint:null},
  ];
  const recentNotes=[...data.notes].sort((a,b)=>b.createdAt>a.createdAt?1:-1).slice(0,3);
  const pendingList=data.tasks.filter(t=>t.status!=='done').slice(0,5);
  return (
    <div>
      <h2 style={{color:T.text,marginTop:0,fontSize:isMobile?20:24,fontWeight:700,marginBottom:2}}>{(()=>{const h=new Date().getHours();return h<12?'Buenos días 🌅':h<18?'Buenas tardes ☀️':'Buenas noches 🌙';})()}</h2>
      <p style={{color:T.muted,marginBottom:20,fontSize:13}}>{new Date().toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'})}</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:20}}>
        {stats.map(s=>(
          <Card key={s.label} onClick={onNavigate?()=>onNavigate(s.view,s.hint):undefined} style={{textAlign:'center',padding:isMobile?12:16}}>
            <div style={{marginBottom:6,color:s.color}}><Icon name={s.icon} size={isMobile?18:22} color={s.color}/></div>
            <div style={{fontSize:isMobile?22:28,fontWeight:700,color:T.text}}>{s.val}</div>
            <div style={{fontSize:11,color:T.muted,marginTop:2}}>{s.label}</div>
          </Card>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr',gap:16}}>
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
            <h3 style={{color:T.text,fontSize:14,fontWeight:600,margin:0}}>Próximas tareas</h3>
            <button onClick={()=>onNavigate&&onNavigate('projects',null)} style={{background:'none',border:`1px solid ${T.border}`,borderRadius:8,padding:'3px 10px',cursor:'pointer',color:T.muted,fontSize:11,fontFamily:'inherit'}}>Ver todas</button>
          </div>
          {pendingList.length===0
            ?<div style={{textAlign:'center',padding:'16px 0'}}>
               <p style={{color:T.dim,fontSize:13,margin:'0 0 8px'}}>¡Sin tareas pendientes! 🎉</p>
               <button onClick={()=>onNavigate&&onNavigate('projects',null)} style={{background:`${T.accent}18`,border:`1px solid ${T.accent}40`,borderRadius:8,padding:'6px 14px',cursor:'pointer',color:T.accent,fontSize:12,fontFamily:'inherit',fontWeight:600}}>+ Nueva tarea</button>
             </div>
            :pendingList.map(t=>(
              <div key={t.id} onClick={()=>onNavigate&&onNavigate('projects','pending')}
                style={{display:'flex',gap:8,alignItems:'flex-start',marginBottom:8,padding:'10px 12px',background:T.surface,borderRadius:10,cursor:'pointer',border:`1px solid ${T.border}`,transition:'border-color 0.15s'}}
                onMouseEnter={e=>e.currentTarget.style.borderColor=T.accent}
                onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
                <div style={{width:8,height:8,borderRadius:'50%',background:t.priority==='alta'?T.red:t.priority==='media'?T.accent:T.green,marginTop:5,flexShrink:0}}/>
                <span style={{color:T.text,fontSize:13,flex:1}}>{t.title}</span>
                {t.dueDate&&<span style={{color:T.muted,fontSize:11,flexShrink:0}}>{fmt(t.dueDate)}</span>}
              </div>
            ))
          }
        </div>
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12,marginTop:isMobile?16:0}}>
            <h3 style={{color:T.text,fontSize:14,fontWeight:600,margin:0}}>Notas recientes</h3>
            <button onClick={()=>onNavigate&&onNavigate('notes',null)} style={{background:'none',border:`1px solid ${T.border}`,borderRadius:8,padding:'3px 10px',cursor:'pointer',color:T.muted,fontSize:11,fontFamily:'inherit'}}>Ver todas</button>
          </div>
          {recentNotes.length===0
            ?<div style={{textAlign:'center',padding:'16px 0'}}>
               <p style={{color:T.dim,fontSize:13,margin:'0 0 8px'}}>Sin notas aún</p>
               <button onClick={()=>onNavigate&&onNavigate('notes',null)} style={{background:`${T.purple}18`,border:`1px solid ${T.purple}40`,borderRadius:8,padding:'6px 14px',cursor:'pointer',color:T.purple,fontSize:12,fontFamily:'inherit',fontWeight:600}}>+ Nueva nota</button>
             </div>
            :recentNotes.map(n=>(
              <div key={n.id} onClick={()=>onNavigate&&onNavigate('notes',n.id)}
                style={{marginBottom:8,padding:'12px 14px',background:T.surface2,borderRadius:10,borderLeft:`3px solid ${T.accent}`,cursor:'pointer',transition:'opacity 0.15s'}}
                onMouseEnter={e=>e.currentTarget.style.opacity='0.8'}
                onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                  <div style={{color:T.text,fontSize:13,fontWeight:500,flex:1,minWidth:0}}>{n.title}</div>
                  {n.amount&&<span style={{color:T.green,fontSize:11,fontWeight:600,flexShrink:0,marginLeft:6}}>${n.amount}</span>}
                </div>
                <div style={{color:T.muted,fontSize:11,marginTop:3}}>{fmt(n.createdAt)}</div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
};

// ===================== AREAS =====================
const Areas = ({data,setData,isMobile,onNavigate}) => {
  const [modal,setModal]=useState(false);
  const [form,setForm]=useState({name:'',icon:'🌟',color:T.areaColors[0]});
  const emojis=['💪','💼','💰','📚','🏠','❤️','🎨','🌍','🎵','⚽','✈️','🍎','🧘','🎯','🔬','💡'];
  const saveArea=()=>{
    if(!form.name.trim())return;
    const updated=[...data.areas,{id:uid(),...form}];
    setData(d=>({...d,areas:updated}));save('areas',updated);
    setModal(false);setForm({name:'',icon:'🌟',color:T.areaColors[0]});
  };
  const del=(id)=>{
    if(!window.confirm('¿Eliminar esta área? Los objetivos, proyectos y notas vinculados quedarán sin área asignada.'))return;
    const u=data.areas.filter(a=>a.id!==id);
    const updObj=data.objectives.map(o=>o.areaId===id?{...o,areaId:''}:o);
    const updProj=data.projects.map(p=>p.areaId===id?{...p,areaId:''}:p);
    const updNotes=data.notes.map(n=>n.areaId===id?{...n,areaId:''}:n);
    setData(d=>({...d,areas:u,objectives:updObj,projects:updProj,notes:updNotes}));
    save('areas',u);save('objectives',updObj);save('projects',updProj);save('notes',updNotes);
  };
  return (
    <div>
      <PageHeader title="Áreas de vida" subtitle="Los grandes pilares de su vida." isMobile={isMobile}
        action={<Btn onClick={()=>setModal(true)} size="sm"><Icon name="plus" size={14}/>Nueva</Btn>}/>
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
              <button onClick={e=>{e.stopPropagation();del(a.id);}} style={{position:'absolute',top:10,right:10,background:'none',border:'none',color:T.dim,cursor:'pointer',padding:6,display:'flex'}}><Icon name="trash" size={14}/></button>
            </Card>
          );
        })}
        <div onClick={()=>setModal(true)} style={{border:`2px dashed ${T.border}`,borderRadius:12,padding:16,cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:8,color:T.dim,minHeight:100}}
          onMouseEnter={e=>e.currentTarget.style.borderColor=T.accent}
          onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
          <Icon name="plus" size={20}/><span style={{fontSize:13}}>Nueva área</span>
        </div>
      </div>
      {modal&&(
        <Modal title="Nueva área" onClose={()=>setModal(false)}>
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <Input value={form.name} onChange={v=>setForm(f=>({...f,name:v}))} placeholder="Nombre del área"/>
            <div>
              <label style={{color:T.muted,fontSize:12,marginBottom:8,display:'block'}}>Icono</label>
              <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                {emojis.map(e=><button key={e} onClick={()=>setForm(f=>({...f,icon:e}))} style={{width:40,height:40,borderRadius:10,border:`2px solid ${form.icon===e?T.accent:T.border}`,background:T.bg,cursor:'pointer',fontSize:18}}>{e}</button>)}
              </div>
            </div>
            <div>
              <label style={{color:T.muted,fontSize:12,marginBottom:8,display:'block'}}>Color</label>
              <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                {T.areaColors.map(c=><button key={c} onClick={()=>setForm(f=>({...f,color:c}))} style={{width:32,height:32,borderRadius:'50%',background:c,border:`3px solid ${form.color===c?T.text:'transparent'}`,cursor:'pointer'}}/>)}
              </div>
            </div>
            <Btn onClick={saveArea} style={{width:'100%',justifyContent:'center'}}>Crear área</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ===================== AREA DETAIL =====================
const AreaDetail = ({data,setData,isMobile,viewHint,onConsumeHint,onNavigate}) => {
  const [areaId,setAreaId]=useState(viewHint||'');


  useEffect(()=>{
    if(viewHint){setAreaId(viewHint);onConsumeHint?.();}
  },[viewHint]);

  const area=data.areas.find(a=>a.id===areaId);

  if(!area) return <div style={{textAlign:'center',padding:40,color:T.dim}}>Área no encontrada</div>;

  // Si el área es Finanzas, renderizar la vista dedicada
  if(area.name.toLowerCase().includes('finanz')||area.icon==='💰'){
    return <Finance data={data} setData={setData} isMobile={isMobile}/>;
  }

  // Si el área es Salud, renderizar la vista dedicada
  if(area.name.toLowerCase().includes('salud')||area.icon==='💪'){
    return <Health data={data} setData={setData} isMobile={isMobile}/>;
  }

  // Si el área es Hogar, renderizar la vista dedicada
  if(area.name.toLowerCase().includes('hogar')||area.name.toLowerCase().includes('casa')||area.icon==='🏠'){
    return <Hogar data={data} setData={setData} isMobile={isMobile}/>;
  }

  // Si el área es Desarrollo Personal, renderizar la vista dedicada
  if(area.name.toLowerCase().includes('desarrollo')||area.name.toLowerCase().includes('personal')||area.icon==='🧠'){
    return <DesarrolloPersonal data={data} setData={setData} isMobile={isMobile}/>;
  }

  // Si el área es Relaciones, renderizar la vista dedicada
  if(area.name.toLowerCase().includes('relacion')||area.icon==='👥'){
    return <Relaciones data={data} setData={setData} isMobile={isMobile}/>;
  }

  // Si el área es Side Projects, renderizar la vista dedicada
  if(area.name.toLowerCase().includes('side')||area.name.toLowerCase().includes('project')||area.icon==='🚀'){
    return <SideProjects data={data} setData={setData} isMobile={isMobile}/>;
  }

  // Si el área es Trabajo, embeber app externa
  if(area.name.toLowerCase().includes('trabajo')||area.name.toLowerCase().includes('work')||area.icon==='💼'){
    return <TrabajoEmbed isMobile={isMobile}/>;
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
        <div style={{width:44,height:44,borderRadius:12,background:`${area.color}22`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>{area.icon}</div>
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

  // Parse area filter from hint like "area:someId"
  const [areaFilter,setAreaFilter]=useState(()=>viewHint?.startsWith('area:')?viewHint.slice(5):null);
  useEffect(()=>{
    if(viewHint?.startsWith('area:')){setAreaFilter(viewHint.slice(5));onConsumeHint?.();}
    else if(viewHint===null){/* don't clear filter on unrelated nav */}
  },[viewHint]);

  const filteredArea=areaFilter?data.areas.find(a=>a.id===areaFilter):null;

  const saveObj=()=>{
    if(!form.title.trim())return;
    const updated=[...data.objectives,{id:uid(),...form}];
    setData(d=>({...d,objectives:updated}));save('objectives',updated);
    setModal(false);setForm({title:'',areaId:areaFilter||'',deadline:'',status:'active'});
  };
  const toggle=(id)=>{const u=data.objectives.map(o=>o.id===id?{...o,status:o.status==='active'?'done':'active'}:o);setData(d=>({...d,objectives:u}));save('objectives',u);};
  const del=(id)=>{const u=data.objectives.filter(o=>o.id!==id);setData(d=>({...d,objectives:u}));save('objectives',u);};

  const allObj=areaFilter
    ?data.objectives.filter(o=>o.areaId===areaFilter)
    :data.objectives;

  return (
    <div>
      <div style={{marginBottom:20}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <h2 style={{margin:0,color:T.text,fontSize:isMobile?18:20,fontWeight:700}}>
              {filteredArea?`${filteredArea.icon} ${filteredArea.name}`:'Objetivos'}
            </h2>
            {filteredArea
              ?<p style={{color:T.muted,fontSize:13,marginTop:4,marginBottom:0}}>
                  Objetivos de esta área
                  <button onClick={()=>setAreaFilter(null)} style={{marginLeft:8,background:'none',border:`1px solid ${T.border}`,borderRadius:6,padding:'1px 8px',cursor:'pointer',color:T.muted,fontSize:11,fontFamily:'inherit'}}>✕ Ver todos</button>
                </p>
              :<p style={{color:T.muted,fontSize:13,marginTop:4,marginBottom:0}}>Metas concretas con fecha límite.</p>
            }
          </div>
          <Btn onClick={()=>setModal(true)} size="sm"><Icon name="plus" size={14}/>Nuevo</Btn>
        </div>
      </div>
      {['active','done'].map(status=>{
        const list=allObj.filter(o=>o.status===status);
        if(!list.length)return null;
        return (
          <div key={status} style={{marginBottom:24}}>
            <h3 style={{color:T.muted,fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:1,marginBottom:12}}>{status==='active'?'Activos':'Completados'}</h3>
            {list.map(o=>{
              const area=data.areas.find(a=>a.id===o.areaId);
              const relProj=data.projects.filter(p=>p.objectiveId===o.id);
              const objTasks=data.tasks.filter(t=>relProj.some(p=>p.id===t.projectId));
              const objDone=objTasks.filter(t=>t.status==='done').length;
              const objPct=objTasks.length?Math.round(objDone/objTasks.length*100):0;
              const isOverdue=o.deadline&&o.deadline<today()&&status==='active';
              return (
                <Card key={o.id} style={{marginBottom:10,opacity:status==='done'?0.6:1,cursor:'pointer'}}
                  onClick={()=>onNavigate&&onNavigate('projects',`obj:${o.id}`)}>
                  <div style={{display:'flex',alignItems:'flex-start',gap:12}}>
                    <button onClick={e=>{e.stopPropagation();toggle(o.id);}} style={{width:24,height:24,borderRadius:'50%',border:`2px solid ${status==='done'?T.green:T.border}`,background:status==='done'?T.green:'transparent',cursor:'pointer',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',marginTop:2}}>
                      {status==='done'&&<Icon name="check" size={12} color="#000"/>}
                    </button>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{color:T.text,fontWeight:600,fontSize:14,textDecoration:status==='done'?'line-through':'none',marginBottom:6}}>{o.title}</div>
                      {objTasks.length>0&&(
                        <div style={{marginBottom:6}}>
                          <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                            <span style={{color:T.dim,fontSize:11}}>{objDone}/{objTasks.length} tareas</span>
                            <span style={{color:objPct===100?T.green:T.accent,fontSize:11,fontWeight:600}}>{objPct}%</span>
                          </div>
                          <div style={{height:4,background:T.border,borderRadius:2}}>
                            <div style={{height:'100%',width:`${objPct}%`,background:objPct===100?T.green:T.accent,borderRadius:2,transition:'width 0.4s'}}/>
                          </div>
                        </div>
                      )}
                      <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
                        {area&&<Tag text={`${area.icon} ${area.name}`} color={area.color}/>}
                        {o.deadline&&<span style={{color:isOverdue?T.red:T.muted,fontSize:12,fontWeight:isOverdue?600:400}}>{isOverdue?'⚠️ Vencido: ':' 📅 '}{fmt(o.deadline)}</span>}
                        <span style={{color:relProj.length?T.blue:T.dim,fontSize:12,fontWeight:relProj.length?600:400}}>
                          📁 {relProj.length} proyecto{relProj.length!==1?'s':''} →
                        </span>
                      </div>
                    </div>
                    <button onClick={e=>{e.stopPropagation();del(o.id);}} style={{background:'none',border:'none',color:T.dim,cursor:'pointer',padding:6,display:'flex'}}><Icon name="trash" size={14}/></button>
                  </div>
                </Card>
              );
            })}
          </div>
        );
      })}
      {!allObj.length&&(
        <div style={{textAlign:'center',padding:'40px 0',color:T.dim}}>
          <Icon name="target" size={40}/>
          <p style={{marginBottom:12}}>{filteredArea?`Sin objetivos en ${filteredArea.name}`:'Sin objetivos aún'}</p>
          <Btn onClick={()=>setModal(true)} size="sm"><Icon name="plus" size={14}/>Crear primer objetivo</Btn>
        </div>
      )}
      {modal&&(
        <Modal title="Nuevo objetivo" onClose={()=>setModal(false)}>
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <Input value={form.title} onChange={v=>setForm(f=>({...f,title:v}))} placeholder="¿Qué quiere lograr?"/>
            <Select value={form.areaId||areaFilter||''} onChange={v=>setForm(f=>({...f,areaId:v}))}>
              <option value="">Sin área</option>
              {data.areas.map(a=><option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
            </Select>
            <Input type="date" value={form.deadline} onChange={v=>setForm(f=>({...f,deadline:v}))}/>
            <Btn onClick={saveObj} style={{width:'100%',justifyContent:'center'}}>Crear objetivo</Btn>
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
  const [taskForm,setTaskForm]=useState({title:'',priority:'media',dueDate:''});
  const [objFilter,setObjFilter]=useState(null); // objectiveId filter

  const UNASSIGNED={id:'__unassigned__',title:'📥 Sin proyecto'};
  const unassignedTasks=data.tasks.filter(t=>!t.projectId);

  // Smart nav: handle hints
  useEffect(()=>{
    if(viewHint==='pending'){
      if(unassignedTasks.length>0){setSelProject(UNASSIGNED);if(isMobile)setShowDetail(true);}
      onConsumeHint?.();
    } else if(typeof viewHint==='string'&&viewHint.startsWith('obj:')){
      const oId=viewHint.slice(4);
      setObjFilter(oId);
      // pre-select first project of this objective if exists
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
    const updated=[...data.tasks,{id:uid(),projectId:pid,status:'todo',...taskForm}];
    setData(d=>({...d,tasks:updated}));save('tasks',updated);
    setTaskModal(false);setTaskForm({title:'',priority:'media',dueDate:''});
  };
  const [editTask,setEditTask]=useState(null);
  const [editTaskForm,setEditTaskForm]=useState({title:'',priority:'media',dueDate:''});
  const toggleTask=(id)=>{const u=data.tasks.map(t=>t.id===id?{...t,status:t.status==='done'?'todo':'done'}:t);setData(d=>({...d,tasks:u}));save('tasks',u);};
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
          <option value="baja">🟢 Baja</option>
          <option value="media">🟡 Media</option>
          <option value="alta">🔴 Alta</option>
        </Select>
        <Input type="date" value={taskForm.dueDate} onChange={v=>setTaskForm(f=>({...f,dueDate:v}))}/>
        <Btn onClick={saveTask} style={{width:'100%',justifyContent:'center'}}>Crear tarea</Btn>
      </div>
    </Modal>}
  </>;

  const ProjectList=()=>{
    const filteredObj=objFilter?data.objectives.find(o=>o.id===objFilter):null;
    const visibleProjects=objFilter
      ?data.projects.filter(p=>p.objectiveId===objFilter)
      :data.projects;
    return (
    <div>
      {!isMobile&&<div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
        <span style={{color:T.muted,fontSize:12,fontWeight:600,textTransform:'uppercase',letterSpacing:1}}>Proyectos</span>
        <button onClick={()=>setProjModal(true)} style={{background:'none',border:'none',color:T.muted,cursor:'pointer',display:'flex'}}><Icon name="plus" size={16}/></button>
      </div>}
      {filteredObj&&(
        <div style={{marginBottom:12,padding:'8px 12px',background:`${T.accent}12`,border:`1px solid ${T.accent}30`,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'space-between',gap:8}}>
          <span style={{color:T.accent,fontSize:12,fontWeight:600}}>🎯 {filteredObj.title}</span>
          <button onClick={()=>setObjFilter(null)} style={{background:'none',border:'none',color:T.muted,cursor:'pointer',fontSize:11,fontFamily:'inherit',padding:0}}>✕ Todos</button>
        </div>
      )}
      {visibleProjects.map(p=>{
        const tasks=data.tasks.filter(t=>t.projectId===p.id);
        const done=tasks.filter(t=>t.status==='done').length;
        const pct=tasks.length?Math.round(done/tasks.length*100):0;
        return (
          <div key={p.id} onClick={()=>openProject(p)}
            style={{padding:'12px 14px',borderRadius:10,cursor:'pointer',marginBottom:8,background:selProject?.id===p.id&&!isMobile?T.surface2:T.surface,border:`1px solid ${selProject?.id===p.id&&!isMobile?T.accent:T.border}`,transition:'border-color 0.15s'}}>
            <div style={{color:T.text,fontSize:14,fontWeight:500,marginBottom:6}}>{p.title}</div>
            <div style={{height:4,background:T.border,borderRadius:2,marginBottom:4}}>
              <div style={{height:'100%',width:`${pct}%`,background:T.accent,borderRadius:2}}/>
            </div>
            <div style={{color:T.dim,fontSize:11}}>{done}/{tasks.length} completadas</div>
          </div>
        );
      })}
      {!objFilter&&unassignedTasks.length>0&&(
        <div onClick={()=>openProject(UNASSIGNED)}
          style={{padding:'12px 14px',borderRadius:10,cursor:'pointer',marginBottom:8,background:selProject?.id==='__unassigned__'&&!isMobile?T.surface2:T.surface,border:`1px solid ${selProject?.id==='__unassigned__'&&!isMobile?T.accent:T.border}`,transition:'border-color 0.15s',borderStyle:'dashed'}}>
          <div style={{color:T.muted,fontSize:14,fontWeight:500,marginBottom:4}}>📥 Sin proyecto</div>
          <div style={{color:T.dim,fontSize:11}}>{unassignedTasks.filter(t=>t.status!=='done').length} pendientes</div>
        </div>
      )}
      {!visibleProjects.length&&!(unassignedTasks.length&&!objFilter)&&(
        <div style={{textAlign:'center',padding:'30px 0',color:T.dim}}>
          <Icon name="folder" size={36}/>
          <p style={{marginBottom:12}}>{filteredObj?`Sin proyectos para este objetivo`:'Sin proyectos'}</p>
          <Btn size="sm" onClick={()=>setProjModal(true)}><Icon name="plus" size={12}/>Crear proyecto</Btn>
        </div>
      )}
    </div>
  );}

  const TaskDetail=()=>(
    <div>
      {isMobile&&<button onClick={()=>setShowDetail(false)} style={{display:'flex',alignItems:'center',gap:6,background:'none',border:'none',color:T.muted,cursor:'pointer',marginBottom:16,fontSize:14,padding:0}}>
        <Icon name="back" size={18}/>Proyectos
      </button>}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <h3 style={{margin:0,color:T.text,fontSize:isMobile?18:16,fontWeight:700}}>{selProject?.title}</h3>
        <div style={{display:'flex',gap:8}}>
          <Btn size="sm" onClick={()=>setTaskModal(true)}><Icon name="plus" size={12}/>Tarea</Btn>
          {!isUnassigned&&<Btn size="sm" variant="danger" onClick={()=>delProj(selProject.id)}><Icon name="trash" size={12}/></Btn>}
        </div>
      </div>
      {['todo','done'].map(st=>{
        const list=pTasks.filter(t=>t.status===st);
        return (
          <div key={st} style={{marginBottom:12}}>
            {st==='done'&&list.length>0&&<div style={{color:T.muted,fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:1,marginBottom:8}}>Completadas</div>}
            {list.map(t=>(
              <div key={t.id} style={{background:T.surface,border:`1px solid ${editTask===t.id?T.accent:T.border}`,borderRadius:10,marginBottom:8,opacity:st==='done'?0.6:1,overflow:'hidden'}}>
                {editTask===t.id?(
                  <div style={{padding:'12px 14px',display:'flex',flexDirection:'column',gap:8}}>
                    <Input value={editTaskForm.title} onChange={v=>setEditTaskForm(f=>({...f,title:v}))} placeholder="Título de la tarea"/>
                    <div style={{display:'flex',gap:8}}>
                      <Select value={editTaskForm.priority} onChange={v=>setEditTaskForm(f=>({...f,priority:v}))} style={{flex:1,padding:'6px 10px',fontSize:13}}>
                        <option value="baja">🟢 Baja</option>
                        <option value="media">🟡 Media</option>
                        <option value="alta">🔴 Alta</option>
                      </Select>
                      <Input type="date" value={editTaskForm.dueDate} onChange={v=>setEditTaskForm(f=>({...f,dueDate:v}))} style={{flex:1,padding:'6px 10px',fontSize:13}}/>
                    </div>
                    <div style={{display:'flex',gap:8}}>
                      <Btn onClick={saveEditTask} size="sm" style={{flex:1,justifyContent:'center'}}>Guardar</Btn>
                      <Btn variant="ghost" onClick={()=>setEditTask(null)} size="sm" style={{flex:1,justifyContent:'center'}}>Cancelar</Btn>
                    </div>
                  </div>
                ):(
                  <div style={{display:'flex',alignItems:'center',gap:10,padding:'12px 14px'}}>
                    <button onClick={()=>toggleTask(t.id)} style={{width:22,height:22,borderRadius:'50%',border:`2px solid ${st==='done'?T.green:T.border}`,background:st==='done'?T.green:'transparent',cursor:'pointer',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
                      {st==='done'&&<Icon name="check" size={11} color="#000"/>}
                    </button>
                    <div style={{width:8,height:8,borderRadius:'50%',background:pColors[t.priority]||T.muted,flexShrink:0}}/>
                    <span style={{color:T.text,fontSize:14,flex:1,textDecoration:st==='done'?'line-through':'none'}}>{t.title}</span>
                    {t.dueDate&&<span style={{color:t.dueDate<today()&&st!=='done'?T.red:T.muted,fontSize:11}}>{fmt(t.dueDate)}</span>}
                    {st!=='done'&&<button onClick={()=>startEditTask(t)} style={{background:'none',border:'none',color:T.dim,cursor:'pointer',display:'flex',padding:4,fontSize:12}}>✏️</button>}
                    <button onClick={()=>delTask(t.id)} style={{background:'none',border:'none',color:T.dim,cursor:'pointer',display:'flex',padding:4}}><Icon name="trash" size={14}/></button>
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      })}
      {!pTasks.length&&<div style={{textAlign:'center',padding:'30px 0',color:T.dim}}><Icon name="check" size={36}/><p>Sin tareas. ¡Añade la primera!</p></div>}
    </div>
  );

  if(isMobile) return (
    <div>
      <PageHeader title="Proyectos & Tareas" isMobile={isMobile}
        action={!showDetail&&<Btn onClick={()=>setProjModal(true)} size="sm"><Icon name="plus" size={14}/>Nuevo</Btn>}/>
      {showDetail&&selProject?<TaskDetail/>:<ProjectList/>}
      <ProjModals/>
    </div>
  );

  return (
    <div style={{display:'grid',gridTemplateColumns:'250px 1fr',gap:16,minHeight:400}}>
      <ProjectList/>
      <div>
        {selProject?<TaskDetail/>:<div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',color:T.dim,textAlign:'center'}}><Icon name="folder" size={48}/><p>Selecciona un proyecto</p></div>}
      </div>
      <ProjModals/>
    </div>
  );
};

// ===================== NOTES =====================
const Notes = ({data,setData,isMobile,viewHint,onConsumeHint}) => {
  const [sel,setSel]=useState(null);
  const [showNote,setShowNote]=useState(false);
  const [modal,setModal]=useState(false);
  const [form,setForm]=useState({title:'',content:'',tags:'',areaId:''});
  const [search,setSearch]=useState('');
  const [editing,setEditing]=useState(false);
  const [editForm,setEditForm]=useState({title:'',content:'',tags:'',areaId:''});

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
    setModal(false);setForm({title:'',content:'',tags:'',areaId:''});
    setSel(n);if(isMobile)setShowNote(true);
  };
  const startEdit=(n)=>{
    setEditForm({title:n.title,content:n.content,tags:(n.tags||[]).join(', '),areaId:n.areaId||''});
    setEditing(true);
  };
  const saveEdit=()=>{
    if(!editForm.title.trim())return;
    const updated=data.notes.map(n=>n.id===sel.id?{...n,...editForm,tags:editForm.tags.split(',').map(t=>t.trim()).filter(Boolean)}:n);
    setData(d=>({...d,notes:updated}));save('notes',updated);
    setSel(updated.find(n=>n.id===sel.id));
    setEditing(false);
  };
  const del=(id)=>{
    if(!window.confirm('¿Eliminar esta nota?'))return;
    const updated=data.notes.filter(n=>n.id!==id);
    setData(d=>({...d,notes:updated}));save('notes',updated);
    if(sel?.id===id){setSel(null);setShowNote(false);}
  };
  const filtered=data.notes.filter(n=>{
    const q=search.toLowerCase();
    return n.title.toLowerCase().includes(q)||n.content.toLowerCase().includes(q)||(n.tags||[]).some(t=>t.toLowerCase().includes(q));
  });

  const NoteList=()=>(
    <div>
      <Input value={search} onChange={setSearch} placeholder="🔍 Buscar..." style={{marginBottom:12,fontSize:14}}/>
      <Btn onClick={()=>setModal(true)} style={{width:'100%',justifyContent:'center',marginBottom:14}} size="sm"><Icon name="plus" size={12}/>Nueva nota</Btn>
      {filtered.map(n=>(
        <div key={n.id} onClick={()=>{setSel(n);if(isMobile)setShowNote(true);}}
          style={{padding:'12px 14px',borderRadius:10,cursor:'pointer',marginBottom:8,background:sel?.id===n.id&&!isMobile?T.surface2:T.surface,border:`1px solid ${sel?.id===n.id&&!isMobile?T.accent:T.border}`,transition:'border-color 0.15s'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
            <div style={{color:T.text,fontSize:14,fontWeight:500,marginBottom:2,flex:1,minWidth:0}}>{n.title}</div>
            {n.amount&&<span style={{color:T.green,fontSize:12,fontWeight:600,flexShrink:0,marginLeft:8}}>💰 ${n.amount}</span>}
          </div>
          <div style={{color:T.muted,fontSize:12,marginBottom:3}}>{n.content.slice(0,60)}{n.content.length>60?'...':''}</div>
          <div style={{display:'flex',gap:6,alignItems:'center'}}>
            <span style={{color:T.dim,fontSize:11}}>{fmt(n.createdAt)}</span>
            {n.tags?.slice(0,3).map(t=><span key={t} style={{fontSize:10,color:T.accent,background:`${T.accent}15`,padding:'1px 6px',borderRadius:8}}>{t}</span>)}
          </div>
        </div>
      ))}
      {!filtered.length&&<p style={{color:T.dim,fontSize:13,textAlign:'center',padding:'20px 0'}}>Sin notas</p>}
    </div>
  );

  const NoteView=()=>(
    <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:20}}>
      {isMobile&&<button onClick={()=>{setShowNote(false);setEditing(false);}} style={{display:'flex',alignItems:'center',gap:6,background:'none',border:'none',color:T.muted,cursor:'pointer',marginBottom:16,fontSize:14,padding:0}}><Icon name="back" size={18}/>Notas</button>}
      {editing?(
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          <Input value={editForm.title} onChange={v=>setEditForm(f=>({...f,title:v}))} placeholder="Título"/>
          <Textarea value={editForm.content} onChange={v=>setEditForm(f=>({...f,content:v}))} placeholder="Contenido..." rows={6}/>
          <Input value={editForm.tags} onChange={v=>setEditForm(f=>({...f,tags:v}))} placeholder="Tags (separados por coma)"/>
          <Select value={editForm.areaId} onChange={v=>setEditForm(f=>({...f,areaId:v}))}>
            <option value="">Sin área</option>
            {data.areas.map(a=><option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
          </Select>
          <div style={{display:'flex',gap:10}}>
            <Btn onClick={saveEdit} style={{flex:1,justifyContent:'center'}}>Guardar</Btn>
            <Btn variant="ghost" onClick={()=>setEditing(false)} style={{flex:1,justifyContent:'center'}}>Cancelar</Btn>
          </div>
        </div>
      ):(
        <>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
            <h3 style={{margin:0,color:T.text,fontSize:18,fontWeight:700,flex:1}}>{sel?.title}</h3>
            <div style={{display:'flex',gap:4}}>
              <button onClick={()=>startEdit(sel)} style={{background:'none',border:`1px solid ${T.border}`,borderRadius:8,color:T.muted,cursor:'pointer',display:'flex',padding:'4px 10px',fontSize:12,fontFamily:'inherit',gap:4,alignItems:'center'}}>✏️ Editar</button>
              <button onClick={()=>del(sel.id)} style={{background:'none',border:'none',color:T.red,cursor:'pointer',display:'flex',padding:4}}><Icon name="trash" size={16}/></button>
            </div>
          </div>
          <div style={{display:'flex',gap:6,marginBottom:16,flexWrap:'wrap'}}>
            {sel?.tags?.map(t=><Tag key={t} text={t}/>)}
            {sel?.areaId&&(()=>{const a=data.areas.find(x=>x.id===sel.areaId);return a?<Tag text={`${a.icon} ${a.name}`} color={a.color}/>:null;})()}
            {sel?.amount&&<Tag text={`💰 $${sel.amount} ${sel.currency||'MXN'}`} color={T.green}/>}
            <span style={{color:T.dim,fontSize:12,alignSelf:'center'}}>{fmt(sel?.createdAt)}</span>
          </div>
          <p style={{color:T.text,fontSize:15,lineHeight:1.8,whiteSpace:'pre-wrap',margin:0}}>{sel?.content}</p>
        </>
      )}
    </div>
  );

  const NoteModal=()=>modal?(
    <Modal title="Nueva nota" onClose={()=>setModal(false)}>
      <div style={{display:'flex',flexDirection:'column',gap:14}}>
        <Input value={form.title} onChange={v=>setForm(f=>({...f,title:v}))} placeholder="Título"/>
        <Textarea value={form.content} onChange={v=>setForm(f=>({...f,content:v}))} placeholder="Escribe tu nota..." rows={5}/>
        <Input value={form.tags} onChange={v=>setForm(f=>({...f,tags:v}))} placeholder="Tags (separados por coma)"/>
        <Select value={form.areaId} onChange={v=>setForm(f=>({...f,areaId:v}))}>
          <option value="">Sin área</option>
          {data.areas.map(a=><option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
        </Select>
        <Btn onClick={saveNote} style={{width:'100%',justifyContent:'center'}}>Guardar nota</Btn>
      </div>
    </Modal>
  ):null;

  if(isMobile) return (
    <div>
      {!showNote&&<PageHeader title="Notas" isMobile={isMobile}/>}
      {showNote&&sel?<NoteView/>:<NoteList/>}
      <NoteModal/>
    </div>
  );

  return (
    <div style={{display:'grid',gridTemplateColumns:'260px 1fr',gap:16,minHeight:400}}>
      <NoteList/>
      <div>{sel?<NoteView/>:<div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',color:T.dim,textAlign:'center'}}><Icon name="note" size={48}/><p>Selecciona una nota</p></div>}</div>
      <NoteModal/>
    </div>
  );
};

// ===================== INBOX =====================
const Inbox = ({data,setData,isMobile}) => {
  const [text,setText]=useState('');
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
  return (
    <div>
      <PageHeader title="Captura Rápida" subtitle="Vuelca ideas. Clasifícalas después." isMobile={isMobile}/>
      <div style={{display:'flex',gap:10,marginBottom:20}}>
        <Input value={text} onChange={setText} placeholder="¿Qué tienes en mente?" style={{flex:1}} onKeyDown={e=>e.key==='Enter'&&add()}/>
        <button onClick={add} style={{background:T.accent,border:'none',borderRadius:10,padding:'0 16px',cursor:'pointer',display:'flex',alignItems:'center',flexShrink:0}}><Icon name="plus" size={20} color="#000"/></button>
      </div>
      {data.inbox.filter(i=>!i.processed).length>0&&(
        <div style={{marginBottom:20}}>
          <h3 style={{color:T.muted,fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:1,marginBottom:12}}>Por procesar ({data.inbox.filter(i=>!i.processed).length})</h3>
          {data.inbox.filter(i=>!i.processed).map(i=>(
            <Card key={i.id} style={{marginBottom:10,borderLeft:`3px solid ${T.accent}`}}>
              <p style={{color:T.text,margin:'0 0 10px',fontSize:14,lineHeight:1.5}}>{i.content}</p>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                <Btn size="sm" variant="ghost" onClick={()=>convertToNote(i)}>📝 Nota</Btn>
                <Btn size="sm" variant="ghost" onClick={()=>convertToTask(i)}>✅ Tarea</Btn>
                <Btn size="sm" variant="ghost" onClick={()=>convertToObjective(i)}>🎯 Objetivo</Btn>
                <Btn size="sm" variant="ghost" onClick={()=>process(i)}>✓ Listo</Btn>
                <Btn size="sm" variant="danger" onClick={()=>del(i.id)}><Icon name="trash" size={11}/></Btn>
              </div>
            </Card>
          ))}
        </div>
      )}
      {data.inbox.filter(i=>i.processed).length>0&&(
        <div style={{opacity:0.5}}>
          <h3 style={{color:T.muted,fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:1,marginBottom:12}}>Procesados</h3>
          {data.inbox.filter(i=>i.processed).slice(0,5).map(i=>(
            <div key={i.id} style={{display:'flex',gap:10,alignItems:'center',padding:'10px 0',borderBottom:`1px solid ${T.border}`}}>
              <Icon name="check" size={14} color={T.green}/>
              <span style={{color:T.muted,fontSize:14,flex:1}}>{i.content}</span>
              <button onClick={()=>del(i.id)} style={{background:'none',border:'none',color:T.dim,cursor:'pointer',display:'flex',padding:4}}><Icon name="trash" size={14}/></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ===================== HABIT TRACKER =====================
const HabitTracker = ({data,setData,isMobile}) => {
  const [modal,setModal]=useState(false);
  const [form,setForm]=useState({name:'',frequency:'daily',objectiveId:''});
  const numDays=isMobile?5:7;
  const nameColW=isMobile?'130px':'160px';
  const days=Array.from({length:numDays},(_,i)=>{
    const d=new Date();d.setDate(d.getDate()-(numDays-1)+i);
    return {date:`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`,label:d.toLocaleDateString('es-ES',{weekday:'short'}),day:d.getDate()};
  });
  const toggle=(habitId,date)=>{
    const updated=data.habits.map(h=>{
      if(h.id!==habitId)return h;
      const has=h.completions.includes(date);
      return {...h,completions:has?h.completions.filter(d=>d!==date):[...h.completions,date]};
    });
    setData(d=>({...d,habits:updated}));save('habits',updated);
  };
  const add=()=>{
    if(!form.name.trim())return;
    const updated=[...data.habits,{id:uid(),...form,completions:[]}];
    setData(d=>({...d,habits:updated}));save('habits',updated);
    setModal(false);setForm({name:'',frequency:'daily',objectiveId:''});
  };
  const del=(id)=>{const u=data.habits.filter(h=>h.id!==id);setData(d=>({...d,habits:u}));save('habits',u);};
  const todayStr=today();

  // Compute stats
  const streaks=data.habits.map(h=>{
    let s=0,d=new Date();
    const ld=()=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    while(h.completions.includes(ld())){s++;d.setDate(d.getDate()-1);}
    return {id:h.id,name:h.name,streak:s};
  });
  const todayDone=data.habits.filter(h=>h.completions.includes(todayStr)).length;
  const todayTotal=data.habits.length;
  const todayPct=todayTotal?Math.round(todayDone/todayTotal*100):0;
  const bestStreak=streaks.reduce((max,s)=>s.streak>max?s.streak:max,0);
  const weekDates=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-6+i);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;});
  const weekTotal=data.habits.reduce((s,h)=>s+weekDates.filter(d=>h.completions.includes(d)).length,0);
  const weekPossible=data.habits.length*7;
  const weekPct=weekPossible?Math.round(weekTotal/weekPossible*100):0;

  return (
    <div>
      <PageHeader title="Habit Tracker" subtitle="Construye rachas diarias 🔥" isMobile={isMobile}
        action={<Btn onClick={()=>setModal(true)} size="sm"><Icon name="plus" size={14}/>Nuevo</Btn>}/>

      {/* Stats summary */}
      {data.habits.length>0&&(
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:20}}>
          <Card style={{textAlign:'center',padding:isMobile?10:14}}>
            <div style={{fontSize:10,color:T.muted,marginBottom:2}}>Hoy</div>
            <div style={{fontSize:isMobile?20:24,fontWeight:700,color:todayPct===100?T.green:todayPct>50?T.accent:T.text}}>{todayDone}/{todayTotal}</div>
            <div style={{height:3,background:T.border,borderRadius:2,marginTop:4}}>
              <div style={{height:'100%',width:`${todayPct}%`,background:todayPct===100?T.green:T.accent,borderRadius:2,transition:'width 0.3s'}}/>
            </div>
          </Card>
          <Card style={{textAlign:'center',padding:isMobile?10:14}}>
            <div style={{fontSize:10,color:T.muted,marginBottom:2}}>Mejor racha</div>
            <div style={{fontSize:isMobile?20:24,fontWeight:700,color:bestStreak>=7?T.green:bestStreak>=3?T.accent:T.text}}>🔥 {bestStreak}d</div>
            <div style={{fontSize:10,color:T.dim,marginTop:4}}>{streaks.find(s=>s.streak===bestStreak&&s.streak>0)?.name||''}</div>
          </Card>
          <Card style={{textAlign:'center',padding:isMobile?10:14}}>
            <div style={{fontSize:10,color:T.muted,marginBottom:2}}>Semana</div>
            <div style={{fontSize:isMobile?20:24,fontWeight:700,color:weekPct>=80?T.green:weekPct>=50?T.accent:T.text}}>{weekPct}%</div>
            <div style={{height:3,background:T.border,borderRadius:2,marginTop:4}}>
              <div style={{height:'100%',width:`${weekPct}%`,background:weekPct>=80?T.green:T.accent,borderRadius:2,transition:'width 0.3s'}}/>
            </div>
          </Card>
        </div>
      )}

      {/* Habit grid */}
      <div style={{background:T.surface,borderRadius:12,border:`1px solid ${T.border}`,overflow:'hidden'}}>
        <div style={{display:'grid',gridTemplateColumns:`${nameColW} repeat(${numDays},1fr)`,borderBottom:`1px solid ${T.border}`}}>
          <div style={{padding:'10px 14px',color:T.muted,fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:1}}>Hábito</div>
          {days.map(d=>(
            <div key={d.date} style={{padding:'8px 4px',textAlign:'center',borderLeft:`1px solid ${T.border}`}}>
              <div style={{color:d.date===todayStr?T.accent:T.dim,fontSize:10,fontWeight:600,textTransform:'uppercase'}}>{d.label}</div>
              <div style={{color:d.date===todayStr?T.accent:T.muted,fontSize:13,fontWeight:700}}>{d.day}</div>
            </div>
          ))}
        </div>
        {data.habits.map(h=>{
          const streak=streaks.find(s=>s.id===h.id)?.streak||0;
          const weekDone=weekDates.filter(d=>h.completions.includes(d)).length;
          return (
            <div key={h.id} style={{display:'grid',gridTemplateColumns:`${nameColW} repeat(${numDays},1fr)`,borderBottom:`1px solid ${T.border}`}}>
              <div style={{padding:'12px 10px 12px 14px',display:'flex',alignItems:'center',gap:6}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{color:T.text,fontSize:12,fontWeight:500,lineHeight:1.3,wordBreak:'break-word'}}>{h.name}</div>
                  <div style={{display:'flex',gap:6,marginTop:2,flexWrap:'wrap'}}>
                    {streak>0&&<span style={{color:T.accent,fontSize:10}}>🔥 {streak}d</span>}
                    <span style={{color:weekDone>=5?T.green:T.dim,fontSize:10}}>{weekDone}/7 sem</span>
                    {h.objectiveId&&(()=>{const o=data.objectives.find(x=>x.id===h.objectiveId);return o?<span style={{color:T.purple,fontSize:10}}>🎯 {o.title.slice(0,20)}{o.title.length>20?'…':''}</span>:null;})()}
                  </div>
                </div>
                <button onClick={()=>del(h.id)} style={{background:'none',border:'none',color:T.dim,cursor:'pointer',padding:2,display:'flex',flexShrink:0}}><Icon name="trash" size={12}/></button>
              </div>
              {days.map(d=>{
                const done=h.completions.includes(d.date);
                return (
                  <div key={d.date} style={{display:'flex',alignItems:'center',justifyContent:'center',borderLeft:`1px solid ${T.border}`}}>
                    <button onClick={()=>toggle(h.id,d.date)} style={{width:28,height:28,borderRadius:7,border:`2px solid ${done?T.green:T.border}`,background:done?T.green:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.15s'}}>
                      {done&&<Icon name="check" size={12} color="#000"/>}
                    </button>
                  </div>
                );
              })}
            </div>
          );
        })}
        {!data.habits.length&&(
          <div style={{padding:'40px 20px',textAlign:'center',color:T.dim}}>
            <div style={{fontSize:40,marginBottom:8}}>🔥</div>
            <p style={{margin:'0 0 4px',fontSize:14}}>Sin hábitos aún</p>
            <p style={{margin:'0 0 12px',fontSize:12,color:T.muted}}>Los hábitos se construyen un día a la vez. Empiece con uno pequeño.</p>
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
const GEMINI_MODEL='gemini-2.5-flash-lite';


// ===================== SETTINGS =====================
const Settings = ({apiKey,setApiKey,isMobile}) => {
  const [val,setVal]=useState(apiKey);
  const [show,setShow]=useState(false);
  const [saved,setSaved]=useState(false);

  const handleSave=()=>{
    const k=val.trim();
    localStorage.setItem('sb_gemini_key',k);
    setApiKey(k);
    setSaved(true);
    setTimeout(()=>setSaved(false),2500);
  };
  const handleClear=()=>{setVal('');setApiKey('');localStorage.removeItem('sb_gemini_key');};

  return (
    <div style={{maxWidth:480}}>
      <PageHeader title="Configuración" subtitle="Ajustes del asistente IA" isMobile={isMobile}/>
      <Card style={{marginBottom:16}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
          <div style={{width:40,height:40,background:`${T.accent}22`,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <Icon name="key" size={20} color={T.accent}/>
          </div>
          <div>
            <div style={{color:T.text,fontWeight:600,fontSize:15}}>Google Gemini API Key</div>
            <div style={{color:T.muted,fontSize:12,marginTop:2}}>Necesaria para el asistente IA</div>
          </div>
          <div style={{marginLeft:'auto',width:10,height:10,borderRadius:'50%',background:apiKey?T.green:T.red,flexShrink:0}}/>
        </div>

        <div style={{position:'relative',marginBottom:12}}>
          <input
            type={show?'text':'password'}
            value={val}
            onChange={e=>setVal(e.target.value)}
            placeholder="AIza..."
            style={{width:'100%',background:T.bg,border:`1px solid ${T.border}`,color:T.text,padding:'10px 44px 10px 14px',borderRadius:10,fontSize:14,outline:'none',boxSizing:'border-box',fontFamily:'monospace'}}
          />
          <button onClick={()=>setShow(s=>!s)} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:T.muted,cursor:'pointer',fontSize:12,fontFamily:'inherit'}}>
            {show?'Ocultar':'Ver'}
          </button>
        </div>

        <div style={{display:'flex',gap:10}}>
          <Btn onClick={handleSave} style={{flex:1,justifyContent:'center'}}>
            {saved?<><Icon name="checkCircle" size={15}/>Guardada</>:<><Icon name="key" size={15}/>Guardar Key</>}
          </Btn>
          {apiKey&&<Btn variant="danger" onClick={handleClear} size="md" style={{flexShrink:0}}>Limpiar</Btn>}
        </div>
      </Card>

      <Card>
        <div style={{color:T.muted,fontSize:13,lineHeight:1.7}}>
          <div style={{color:T.text,fontWeight:600,fontSize:14,marginBottom:10}}>¿Cómo obtener la API Key?</div>
          <ol style={{margin:0,paddingLeft:18,display:'flex',flexDirection:'column',gap:6}}>
            <li>Ve a <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{color:T.blue}}>aistudio.google.com</a></li>
            <li>Inicia sesión con tu cuenta de Google</li>
            <li>Haz clic en "Create API Key"</li>
            <li>Copia la clave y pégala arriba</li>
          </ol>
          <div style={{marginTop:12,padding:'10px 14px',background:`${T.green}12`,borderRadius:8,border:`1px solid ${T.green}30`,color:T.green,fontSize:12}}>
            ✓ El plan gratuito de Gemini es suficiente para uso personal intensivo.
          </div>
        </div>
      </Card>

      <Card style={{marginTop:16}}>
        <div style={{color:T.text,fontWeight:600,fontSize:14,marginBottom:10}}>Acerca del Asistente</div>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {[
            {icon:'brain',label:'Modelo',val:'Google gemini-2.5-flash-lite'},
            {icon:'note',label:'Auto-guardado',val:'Notas + etiquetas'},
            {icon:'mic',label:'Voz',val:'Web Speech API (español)'},
            {icon:'image',label:'Imágenes',val:'OCR visual con Gemini'},
          ].map(({icon,label,val})=>(
            <div key={label} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:`1px solid ${T.border}`}}>
              <Icon name={icon} size={15} color={T.muted}/>
              <span style={{color:T.muted,fontSize:13,flex:1}}>{label}</span>
              <span style={{color:T.text,fontSize:13}}>{val}</span>
            </div>
          ))}
        </div>
      </Card>
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
║  [bloque JSON solo si aplica, siempre al final]      ║
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
Medicamentos:
${medications||'(sin medicamentos)'}
Actividad reciente:
${recentWorkouts||'(sin entrenamientos)'}

── HOGAR ──
Mantenimientos:
${maintenances||'(sin mantenimientos)'}
Documentos:
${homeDocs||'(sin documentos)'}

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
  12. Tarea de mantenimiento recurrente → SAVE_MAINTENANCE
      (name, category, frequencyDays, lastDone, cost, notes)
      Categorías: General, Coche, Jardín, Plomería, Electricidad, Climatización, Electrodomésticos, Otro
  13. Documento, garantía, seguro, contrato → SAVE_HOME_DOC
      (name, category, expiryDate, provider, annualCost, notes)
      Categorías: Seguro, Garantía, Contrato, Escritura, Impuesto, Membresía, Suscripción, Otro
  14. Contacto de servicio (plomero, médico, etc.) → SAVE_HOME_CONTACT
      (name, role, phone, email, notes)
      Roles: Plomero, Electricista, Médico, Dentista, Veterinario, Mecánico, Abogado, Contador, Jardinero, Limpieza, Cerrajero, Otro

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
{"action":"SAVE_MAINTENANCE","data":{"name":"Cambio de aceite","category":"Coche","frequencyDays":90,"lastDone":"${t}","cost":800,"notes":""}}
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
- Agrupar por categoría/área cuando ayude.`;
};

const parsePsickeAction=(text)=>{
  const m=text.match(/\`\`\`json\s*([\s\S]*?)\s*\`\`\`/);
  if(!m)return null;
  try{
    const p=JSON.parse(m[1]);
    if(p.action&&p.data)return p;
  }catch(e){}
  return null;
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
  out=out.replace(/\`\`\`json[\s\S]*?\`\`\`/g,'');

  return out.trim();
};

const Psicke=({apiKey,onGoSettings,data,setData})=>{
  const INIT_MSG={role:'assistant',content:'Aquí Psicke. ¿En qué está pensando?'};
  const [open,setOpen]=useState(false);
  const [msgs,setMsgs]=useState([INIT_MSG]);
  const [input,setInput]=useState('');
  const [loading,setLoading]=useState(false);
  const [recording,setRecording]=useState(false);
  const [pulse,setPulse]=useState(false);
  const [msgMenu,setMsgMenu]=useState(null); // index of msg showing actions
  const [editingIdx,setEditingIdx]=useState(null);
  const [editVal,setEditVal]=useState('');
  const [copied,setCopied]=useState(null);
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

  // Subtle pulse every 8s to remind user Psicke exists
  useEffect(()=>{
    if(open)return;
    const t=setInterval(()=>{setPulse(true);setTimeout(()=>setPulse(false),1200);},8000);
    return()=>clearInterval(t);
  },[open]);

  const send=async(textOverride=null)=>{
    const text=(textOverride??input).trim();
    if(!text||loading)return;
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
        contents:[
          {role:'user',parts:[{text:`[SISTEMA]\n${sysPrompt}\n\n[Confirma tu rol brevemente]`}]},
          {role:'model',parts:[{text:'Aquí Psicke. ¿En qué está pensando?'}]},
          ...cleanMsgs
        ],
        generationConfig:{temperature:0.8,maxOutputTokens:1400},
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
        if(reason==='SAFETY')throw new Error('Respuesta bloqueada por filtros de seguridad. Intente reformular.');
        throw new Error(`Sin respuesta (${reason})`);
      }
      const raw=candidate.content.parts[0].text;

      // Parse and execute save action if present
      const action=parsePsickeAction(raw);
      const display=stripPsickeJson(raw);
      let savedLabel=null;

      if(action&&setData){
        const td=today();

        // ── Helper: resolve personId by name ──
        const resolvePersonId=(name)=>{
          if(!name) return '';
          const p=(data.people||[]).find(p=>p.name.toLowerCase()===name.toLowerCase());
          return p?.id||'';
        };

        // ── SAVE_PLAN ──
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
          const updObj=[newObj,...(data.objectives||[])];
          const updProj=[newProj,...(data.projects||[])];
          const updTasks=[...newTasks,...(data.tasks||[])];
          const updHabits=[...(data.habits||[]),...newHabits];
          setData(d=>({...d,objectives:updObj,projects:updProj,tasks:updTasks,habits:updHabits}));
          save('objectives',updObj);save('projects',updProj);save('tasks',updTasks);save('habits',updHabits);
          savedLabel=`🗺️ Plan creado · 🎯 ${newObj.title} · 📋 ${newTasks.length} tareas${newHabits.length?' · 🔁 '+newHabits.length+' hábitos':''}`;

        // ── SAVE_TASK ──
        }else if(action.action==='SAVE_TASK'&&action.data.title){
          const t={id:uid(),title:action.data.title,projectId:'',status:'todo',priority:action.data.priority||'media',deadline:action.data.deadline||''};
          const upd=[t,...(data.tasks||[])];
          setData(d=>({...d,tasks:upd}));save('tasks',upd);
          savedLabel='📋 Tarea guardada';

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
          const upd=[n,...(data.notes||[])];
          setData(d=>({...d,notes:upd}));save('notes',upd);
          savedLabel=`📝 Nota guardada${areaLabel?` · ${areaLabel.icon} ${areaLabel.name}`:''}${n.amount?` · 💰 $${n.amount} ${n.currency}`:''}`;

        // ── SAVE_INBOX ──
        }else if(action.action==='SAVE_INBOX'&&action.data.content){
          const i={id:uid(),content:action.data.content,createdAt:td,processed:false};
          const upd=[i,...(data.inbox||[])];
          setData(d=>({...d,inbox:upd}));save('inbox',upd);
          savedLabel='📥 Agregado al inbox';

        // ── SAVE_BUDGET ──
        }else if(action.action==='SAVE_BUDGET'&&action.data.title){
          const b={id:uid(),title:action.data.title,amount:Number(action.data.amount)||0,currency:action.data.currency||'MXN',
            dayOfMonth:Number(action.data.dayOfMonth)||1,
            areaId:(()=>{if(action.data.areaId)return action.data.areaId;if(action.data.area){const m=(data.areas||[]).find(a=>a.name.toLowerCase()===action.data.area.toLowerCase());return m?.id||'';}return '';})(),
            createdAt:td};
          const upd=[b,...(data.budget||[])];
          setData(d=>({...d,budget:upd}));save('budget',upd);
          savedLabel=`💳 Presupuesto: ${b.title} — $${b.amount} ${b.currency}/mes (día ${b.dayOfMonth})`;

        // ── SAVE_HABIT ──
        }else if(action.action==='SAVE_HABIT'&&action.data.name){
          const h={id:uid(),name:action.data.name,frequency:action.data.frequency||'daily',completions:[]};
          const upd=[...(data.habits||[]),h];
          setData(d=>({...d,habits:upd}));save('habits',upd);
          savedLabel=`🔁 Hábito creado: ${h.name}`;

        // ── SAVE_TRANSACTION ──
        }else if(action.action==='SAVE_TRANSACTION'&&action.data.amount){
          const tx={id:uid(),type:action.data.type||'egreso',amount:Number(action.data.amount)||0,
            currency:action.data.currency||'MXN',category:action.data.category||'Otro',
            description:action.data.description||'',date:action.data.date||td,createdAt:td};
          const upd=[tx,...(data.transactions||[])];
          setData(d=>({...d,transactions:upd}));save('transactions',upd);
          savedLabel=`💸 ${tx.type==='ingreso'?'Ingreso':'Gasto'}: $${tx.amount} ${tx.currency} — ${tx.category}${tx.description?' ('+tx.description+')':''}`;

        // ── SAVE_HEALTH_METRIC ──
        }else if(action.action==='SAVE_HEALTH_METRIC'&&action.data.type){
          const m={id:uid(),type:action.data.type,value:action.data.value,unit:action.data.unit||'',
            date:action.data.date||td,notes:action.data.notes||'',createdAt:td};
          const upd=[m,...(data.healthMetrics||[])];
          setData(d=>({...d,healthMetrics:upd}));save('healthMetrics',upd);
          savedLabel=`📊 Métrica: ${m.type} — ${m.value} ${m.unit}`;

        // ── SAVE_WORKOUT ──
        }else if(action.action==='SAVE_WORKOUT'&&action.data.type){
          const w={id:uid(),type:action.data.type,duration:Number(action.data.duration)||0,
            calories:Number(action.data.calories)||0,distance:Number(action.data.distance)||0,
            date:action.data.date||td,notes:action.data.notes||'',createdAt:td};
          const upd=[w,...(data.workouts||[])];
          setData(d=>({...d,workouts:upd}));save('workouts',upd);
          savedLabel=`🏃 Workout: ${w.type} ${w.duration}min${w.calories?' · '+w.calories+'kcal':''}`;

        // ── SAVE_MEDICATION ──
        }else if(action.action==='SAVE_MEDICATION'&&action.data.name){
          const m={id:uid(),name:action.data.name,dose:action.data.dose||'',unit:action.data.unit||'',
            frequency:action.data.frequency||'daily',time:action.data.time||'',
            stock:Number(action.data.stock)||0,createdAt:td};
          const upd=[m,...(data.medications||[])];
          setData(d=>({...d,medications:upd}));save('medications',upd);
          savedLabel=`💊 Medicamento: ${m.name} ${m.dose} ${m.unit}`;

        // ── SAVE_MAINTENANCE ──
        }else if(action.action==='SAVE_MAINTENANCE'&&action.data.name){
          const m={id:uid(),name:action.data.name,category:action.data.category||'General',
            frequencyDays:Number(action.data.frequencyDays)||30,lastDone:action.data.lastDone||td,
            cost:Number(action.data.cost)||0,notes:action.data.notes||'',createdAt:td};
          const upd=[m,...(data.maintenances||[])];
          setData(d=>({...d,maintenances:upd}));save('maintenances',upd);
          savedLabel=`🔧 Mantenimiento: ${m.name} — cada ${m.frequencyDays}d`;

        // ── SAVE_HOME_DOC ──
        }else if(action.action==='SAVE_HOME_DOC'&&action.data.name){
          const d2={id:uid(),name:action.data.name,category:action.data.category||'Otro',
            expiryDate:action.data.expiryDate||'',provider:action.data.provider||'',
            annualCost:Number(action.data.annualCost)||0,notes:action.data.notes||'',createdAt:td};
          const upd=[d2,...(data.homeDocs||[])];
          setData(d=>({...d,homeDocs:upd}));save('homeDocs',upd);
          savedLabel=`📄 Documento: ${d2.name}${d2.expiryDate?' · vence '+d2.expiryDate:''}`;

        // ── SAVE_HOME_CONTACT ──
        }else if(action.action==='SAVE_HOME_CONTACT'&&action.data.name){
          const c={id:uid(),name:action.data.name,role:action.data.role||'Otro',
            phone:action.data.phone||'',email:action.data.email||'',
            notes:action.data.notes||'',createdAt:td};
          const upd=[c,...(data.homeContacts||[])];
          setData(d=>({...d,homeContacts:upd}));save('homeContacts',upd);
          savedLabel=`📞 Contacto: ${c.name} (${c.role})`;

        // ── SAVE_LEARNING ──
        }else if(action.action==='SAVE_LEARNING'&&action.data.name){
          const l={id:uid(),name:action.data.name,platform:action.data.platform||'',
            category:action.data.category||'',progress:Number(action.data.progress)||0,
            hoursSpent:Number(action.data.hoursSpent)||0,hoursTotal:Number(action.data.hoursTotal)||0,
            status:'active',notes:action.data.notes||'',createdAt:td};
          const upd=[l,...(data.learnings||[])];
          setData(d=>({...d,learnings:upd}));save('learnings',upd);
          savedLabel=`📖 Aprendizaje: ${l.name}${l.platform?' en '+l.platform:''} (${l.progress}%)`;

        // ── SAVE_RETRO ──
        }else if(action.action==='SAVE_RETRO'&&(action.data.wentWell||action.data.learned)){
          const r={id:uid(),period:action.data.period||'semanal',date:action.data.date||td,
            wentWell:action.data.wentWell||'',improve:action.data.improve||'',
            learned:action.data.learned||'',createdAt:td};
          const upd=[r,...(data.retros||[])];
          setData(d=>({...d,retros:upd}));save('retros',upd);
          savedLabel=`🔄 Retrospectiva ${r.period} guardada`;

        // ── SAVE_IDEA ──
        }else if(action.action==='SAVE_IDEA'&&action.data.content){
          const i={id:uid(),content:action.data.content,tag:action.data.tag||'Idea',
            date:action.data.date||td,createdAt:td};
          const upd=[i,...(data.ideas||[])];
          setData(d=>({...d,ideas:upd}));save('ideas',upd);
          savedLabel=`💡 Idea guardada: [${i.tag}]`;

        // ── SAVE_PERSON ──
        }else if(action.action==='SAVE_PERSON'&&action.data.name){
          const p={id:uid(),name:action.data.name,relation:action.data.relation||'',
            birthday:action.data.birthday||'',emoji:action.data.emoji||'👤',
            phone:action.data.phone||'',email:action.data.email||'',
            notes:action.data.notes||'',createdAt:td};
          const upd=[p,...(data.people||[])];
          setData(d=>({...d,people:upd}));save('people',upd);
          savedLabel=`👤 Persona: ${p.emoji} ${p.name}${p.relation?' ('+p.relation+')':''}`;

        // ── SAVE_FOLLOWUP ──
        }else if(action.action==='SAVE_FOLLOWUP'&&action.data.task){
          const personId=resolvePersonId(action.data.personName);
          const f={id:uid(),personId,task:action.data.task,
            dueDate:action.data.dueDate||'',priority:action.data.priority||'media',
            done:false,createdAt:td};
          const upd=[f,...(data.followUps||[])];
          setData(d=>({...d,followUps:upd}));save('followUps',upd);
          savedLabel=`📋 Seguimiento: "${f.task}"${action.data.personName?' con '+action.data.personName:''}`;

        // ── SAVE_INTERACTION ──
        }else if(action.action==='SAVE_INTERACTION'&&action.data.personName){
          const personId=resolvePersonId(action.data.personName);
          const i={id:uid(),personId,type:action.data.type||'Otro',
            date:action.data.date||td,notes:action.data.notes||'',createdAt:td};
          const upd=[i,...(data.interactions||[])];
          setData(d=>({...d,interactions:upd}));save('interactions',upd);
          savedLabel=`💬 Contacto: ${action.data.type||'Interacción'} con ${action.data.personName}`;

        // ── SAVE_SIDE_PROJECT ──
        }else if(action.action==='SAVE_SIDE_PROJECT'&&action.data.name){
          const p={id:uid(),name:action.data.name,description:action.data.description||'',
            status:action.data.status||'idea',stack:action.data.stack||'',
            url:action.data.url||'',startDate:action.data.startDate||td,
            color:T.areaColors[Math.floor(Math.random()*T.areaColors.length)],createdAt:td};
          const upd=[p,...(data.sideProjects||[])];
          setData(d=>({...d,sideProjects:upd}));save('sideProjects',upd);
          savedLabel=`🚀 Proyecto: ${p.name} [${p.status}]`;

        // ── SAVE_SP_TASK ──
        }else if(action.action==='SAVE_SP_TASK'&&action.data.title){
          const proj=(data.sideProjects||[]).find(p=>p.name.toLowerCase()===action.data.projectName?.toLowerCase());
          const t={id:uid(),projectId:proj?.id||'',title:action.data.title,
            priority:action.data.priority||'media',dueDate:action.data.dueDate||'',
            done:false,createdAt:td};
          const upd=[t,...(data.spTasks||[])];
          setData(d=>({...d,spTasks:upd}));save('spTasks',upd);
          savedLabel=`✅ Tarea: "${t.title}"${proj?' en '+proj.name:''}`;

        // ── SAVE_MILESTONE ──
        }else if(action.action==='SAVE_MILESTONE'&&action.data.title){
          const proj=(data.sideProjects||[]).find(p=>p.name.toLowerCase()===action.data.projectName?.toLowerCase());
          const m={id:uid(),projectId:proj?.id||'',title:action.data.title,
            date:action.data.date||td,notes:action.data.notes||'',createdAt:td};
          const upd=[m,...(data.milestones||[])];
          setData(d=>({...d,milestones:upd}));save('milestones',upd);
          savedLabel=`🏆 Hito: "${m.title}"${proj?' en '+proj.name:''}`;
        }
      }

      const finalContent=display+(savedLabel?`\n\n✅ ${savedLabel}`:'');
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
          onClick={e=>e.target===e.currentTarget&&setOpen(false)}>
          {/* Backdrop */}
          <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.55)',backdropFilter:'blur(6px)'}} onClick={()=>setOpen(false)}/>

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
                  <button onClick={()=>setOpen(false)}
                    style={{background:'none',border:'none',cursor:'pointer',color:T.muted,display:'flex',padding:4}}>
                    <Icon name="x" size={20}/>
                  </button>
                </div>
              </div>
            </div>

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
              <div style={{display:'flex',gap:8,alignItems:'center'}}>
                <button onClick={toggleMic} style={{
                  width:38,height:38,borderRadius:'50%',border:`2px solid ${recording?T.red:T.border}`,
                  background:recording?`${T.red}22`:'transparent',cursor:'pointer',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  color:recording?T.red:T.muted,flexShrink:0,transition:'all 0.2s'}}>
                  <Icon name={recording?'micoff':'mic'} size={16} color={recording?T.red:undefined}/>
                </button>
                <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&send()}
                  autoComplete="off" autoCorrect="off" spellCheck="false"
                  placeholder="Pregunta, idea, decisión..."
                  style={{flex:1,background:T.bg,border:`1px solid ${T.border}`,color:T.text,
                    padding:'10px 14px',borderRadius:12,fontSize:14,outline:'none',fontFamily:'inherit'}}/>
                <button onClick={()=>send()} disabled={!input.trim()||loading}
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

      {/* FLOATING BUBBLE */}
      {!open&&(
        <button className="psicke-bubble" onClick={()=>setOpen(true)}
          style={{
            position:'fixed',bottom:80,right:18,zIndex:999,
            width:54,height:54,borderRadius:'50%',border:'none',cursor:'pointer',
            background:`linear-gradient(135deg,${T.accent},${T.orange})`,
            display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:1,
            boxShadow:'0 4px 20px rgba(0,200,150,0.35)',
            transition:'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)',
            animation:pulse?'psicke-pulse 1.2s ease-out':'none',
          }}>
          {/* Ripple ring when pulsing */}
          {pulse&&<div style={{position:'absolute',inset:-2,borderRadius:'50%',border:`2px solid ${T.accent}`,animation:'psicke-ring 1.2s ease-out both',pointerEvents:'none'}}/>}
          <span style={{fontSize:26,lineHeight:1}}>🧠</span>
          <span style={{fontSize:7,fontWeight:800,color:'#000',letterSpacing:'0.05em',lineHeight:1,fontFamily:"'DM Sans',sans-serif"}}>PSICKE</span>
        </button>
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

const NAV=[
  {id:'dashboard',label:'Inicio',icon:'home'},
  {id:'areas',label:'Áreas',icon:'grid'},
  {id:'objectives',label:'Objetivos',icon:'target'},
  {id:'projects',label:'Proyectos',icon:'folder'},
  {id:'notes',label:'Notas',icon:'note'},
  {id:'journal',label:'Journal',icon:'journal'},
  {id:'shopping',label:'Compras',icon:'cart'},
  {id:'education',label:'Educación',icon:'graduation'},
  {id:'inbox',label:'Inbox',icon:'inbox'},
  {id:'habits',label:'Hábitos',icon:'habit'},
  {id:'settings',label:'Config',icon:'cog'},
];
const MOBILE_NAV=NAV.slice(0,5);
const MORE_NAV=NAV.slice(5);

// ===================== TRABAJO EMBED =====================
const TrabajoEmbed = ({isMobile}) => {
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
      <div>
        <h2 style={{margin:0,color:T.text,fontSize:isMobile?18:20,fontWeight:700}}>💼 Trabajo</h2>
        {!fullscreen&&<p style={{color:T.muted,fontSize:13,margin:'4px 0 0'}}>ControlCheck — tu app de trabajo</p>}
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
const SideProjects = ({data,setData,isMobile}) => {
  const [tab,setTab]             = useState('proyectos');
  const [modalProj,setModalProj] = useState(false);
  const [modalTask,setModalTask] = useState(false);
  const [modalMile,setModalMile] = useState(false);
  const [selProj,setSelProj]     = useState(null);
  const [editingProj,setEditingProj] = useState(null);
  const [projFilter,setProjFilter]   = useState('all');
  const [projForm,setProjForm]   = useState({name:'',description:'',status:'idea',stack:'',url:'',startDate:today(),color:T.areaColors[0]});
  const [taskForm,setTaskForm]   = useState({projectId:'',title:'',priority:'media',dueDate:'',done:false});
  const [mileForm,setMileForm]   = useState({projectId:'',title:'',date:today(),notes:''});

  const sideProjects = data.sideProjects||[];
  const spTasks      = data.spTasks||[];
  const milestones   = data.milestones||[];

  // ── status config ──
  const STATUSES=[
    {id:'idea',     label:'Idea',       color:T.muted,   emoji:'💡'},
    {id:'progress', label:'En progreso',color:T.accent,  emoji:'⚡'},
    {id:'paused',   label:'Pausado',    color:T.orange,  emoji:'⏸️'},
    {id:'launched', label:'Lanzado',    color:T.green,   emoji:'🚀'},
    {id:'archived', label:'Archivado',  color:T.dim,     emoji:'📦'},
  ];
  const statusInfo=(id)=>STATUSES.find(s=>s.id===id)||STATUSES[0];

  // ── summary ──
  const activeProjs   = sideProjects.filter(p=>p.status==='progress');
  const launchedProjs = sideProjects.filter(p=>p.status==='launched');
  const pendingTasks  = spTasks.filter(t=>!t.done);
  const todayTasks    = pendingTasks.filter(t=>t.dueDate===today());
  const lastMile      = [...milestones].sort((a,b)=>b.date.localeCompare(a.date))[0];

  const fmtDate=(d)=>{ try{ return new Date(d+'T12:00:00').toLocaleDateString('es-ES',{day:'2-digit',month:'short',year:'numeric'}); }catch{return d||'—';} };
  const priorityColor=(p)=>p==='alta'?T.red:p==='media'?T.orange:T.green;

  // ── PROJECT actions ──
  const COLORS=[T.areaColors[0],T.areaColors[1],T.areaColors[2],T.areaColors[3],T.areaColors[4],T.areaColors[5],T.areaColors[6],T.areaColors[7]];
  const saveProj=()=>{
    if(!projForm.name.trim()) return;
    const p={id:editingProj?.id||uid(),...projForm,createdAt:editingProj?.createdAt||today()};
    const upd=editingProj?sideProjects.map(x=>x.id===p.id?p:x):[p,...sideProjects];
    setData(d=>({...d,sideProjects:upd})); save('sideProjects',upd);
    setModalProj(false); setEditingProj(null); setSelProj(p);
    setProjForm({name:'',description:'',status:'idea',stack:'',url:'',startDate:today(),color:T.areaColors[0]});
  };
  const openEditProj=(p)=>{ setProjForm({name:p.name,description:p.description||'',status:p.status,stack:p.stack||'',url:p.url||'',startDate:p.startDate||today(),color:p.color||T.areaColors[0]}); setEditingProj(p); setModalProj(true); };
  const delProj=(id)=>{
    if(!window.confirm('¿Eliminar este proyecto?')) return;
    const upd=sideProjects.filter(p=>p.id!==id); setData(d=>({...d,sideProjects:upd})); save('sideProjects',upd);
    if(selProj?.id===id) setSelProj(null);
  };
  const updateStatus=(id,status)=>{
    const upd=sideProjects.map(p=>p.id===id?{...p,status}:p);
    setData(d=>({...d,sideProjects:upd})); save('sideProjects',upd);
    setSelProj(p=>p?.id===id?{...p,status}:p);
  };

  // ── TASK actions ──
  const saveTask=()=>{
    if(!taskForm.title.trim()||!taskForm.projectId) return;
    const t={id:uid(),...taskForm,done:false,createdAt:today()};
    const upd=[t,...spTasks]; setData(d=>({...d,spTasks:upd})); save('spTasks',upd);
    setModalTask(false); setTaskForm({projectId:selProj?.id||'',title:'',priority:'media',dueDate:'',done:false});
  };
  const toggleTask=(id)=>{
    const upd=spTasks.map(t=>t.id===id?{...t,done:!t.done}:t);
    setData(d=>({...d,spTasks:upd})); save('spTasks',upd);
  };
  const delTask=(id)=>{ const upd=spTasks.filter(t=>t.id!==id); setData(d=>({...d,spTasks:upd})); save('spTasks',upd); };

  // ── MILESTONE actions ──
  const saveMile=()=>{
    if(!mileForm.title.trim()||!mileForm.projectId) return;
    const m={id:uid(),...mileForm,createdAt:today()};
    const upd=[m,...milestones]; setData(d=>({...d,milestones:upd})); save('milestones',upd);
    setModalMile(false); setMileForm({projectId:selProj?.id||'',title:'',date:today(),notes:''});
  };
  const delMile=(id)=>{ const upd=milestones.filter(m=>m.id!==id); setData(d=>({...d,milestones:upd})); save('milestones',upd); };

  const projName=(id)=>sideProjects.find(p=>p.id===id)?.name||'Sin proyecto';

  const visibleProjs = projFilter==='all' ? sideProjects : sideProjects.filter(p=>p.status===projFilter);

  return (
    <div>
      <PageHeader isMobile={isMobile} title="🚀 Side Projects"
        subtitle="Proyectos personales, experimentos y lanzamientos"
        action={
          <div style={{display:'flex',gap:8}}>
            {tab==='proyectos'&&<Btn size="sm" onClick={()=>{setEditingProj(null);setProjForm({name:'',description:'',status:'idea',stack:'',url:'',startDate:today(),color:T.areaColors[0]});setModalProj(true);}}><Icon name="plus" size={14}/>Proyecto</Btn>}
            {tab==='tareas'   &&<Btn size="sm" onClick={()=>{setTaskForm({projectId:selProj?.id||'',title:'',priority:'media',dueDate:'',done:false});setModalTask(true);}}><Icon name="plus" size={14}/>Tarea</Btn>}
            {tab==='hitos'    &&<Btn size="sm" onClick={()=>{setMileForm({projectId:selProj?.id||'',title:'',date:today(),notes:''});setModalMile(true);}}><Icon name="plus" size={14}/>Hito</Btn>}
          </div>
        }
      />

      {/* ── Summary cards ── */}
      <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr 1fr':'repeat(4,1fr)',gap:10,marginBottom:20}}>
        {[
          {label:'En progreso',  val:activeProjs.length,   color:T.accent, icon:'⚡'},
          {label:'Tareas hoy',   val:todayTasks.length,    color:todayTasks.length>0?T.orange:T.muted, icon:'✅'},
          {label:'Lanzados',     val:launchedProjs.length, color:T.green,  icon:'🚀'},
          {label:'Último hito',  val:lastMile?lastMile.title.slice(0,12)+(lastMile.title.length>12?'…':''):'—', color:T.purple, icon:'🏆'},
        ].map(s=>(
          <Card key={s.label} style={{textAlign:'center',padding:14}}>
            <div style={{fontSize:18,marginBottom:4}}>{s.icon}</div>
            <div style={{fontSize:isMobile?15:18,fontWeight:700,color:s.color,lineHeight:1.2}}>{s.val}</div>
            <div style={{fontSize:11,color:T.muted,marginTop:2}}>{s.label}</div>
          </Card>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
        {[{id:'proyectos',label:'🗂️ Proyectos'},{id:'tareas',label:'✅ Tareas'},{id:'hitos',label:'🏆 Hitos'}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{padding:'7px 16px',borderRadius:10,border:`1px solid ${tab===t.id?T.accent:T.border}`,background:tab===t.id?`${T.accent}18`:'transparent',color:tab===t.id?T.accent:T.muted,cursor:'pointer',fontSize:13,fontWeight:tab===t.id?600:400,fontFamily:'inherit'}}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ══════════ PROYECTOS ══════════ */}
      {tab==='proyectos'&&(
        <div>
          {/* Status filter */}
          {sideProjects.length>0&&(
            <div style={{display:'flex',gap:6,marginBottom:14,flexWrap:'wrap'}}>
              <button onClick={()=>setProjFilter('all')}
                style={{padding:'5px 12px',borderRadius:8,border:`1px solid ${projFilter==='all'?T.accent:T.border}`,background:projFilter==='all'?`${T.accent}18`:'transparent',color:projFilter==='all'?T.accent:T.muted,cursor:'pointer',fontSize:12,fontFamily:'inherit'}}>
                Todos ({sideProjects.length})
              </button>
              {STATUSES.filter(s=>sideProjects.some(p=>p.status===s.id)).map(s=>(
                <button key={s.id} onClick={()=>setProjFilter(projFilter===s.id?'all':s.id)}
                  style={{padding:'5px 12px',borderRadius:8,border:`1px solid ${projFilter===s.id?s.color:T.border}`,background:projFilter===s.id?`${s.color}18`:'transparent',color:projFilter===s.id?s.color:T.muted,cursor:'pointer',fontSize:12,fontFamily:'inherit'}}>
                  {s.emoji} {s.label}
                </button>
              ))}
            </div>
          )}

          {/* Selected project detail */}
          {selProj&&(()=>{
            const st=statusInfo(selProj.status);
            const projTasksPending=spTasks.filter(t=>t.projectId===selProj.id&&!t.done);
            const projMiles=[...milestones].filter(m=>m.projectId===selProj.id).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,3);
            return (
              <Card style={{marginBottom:16,borderLeft:`3px solid ${selProj.color||T.accent}`}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:10,marginBottom:12}}>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                      <span style={{color:T.text,fontWeight:700,fontSize:16}}>{selProj.name}</span>
                      <span style={{fontSize:12,color:st.color,background:`${st.color}18`,padding:'3px 10px',borderRadius:8,fontWeight:600}}>{st.emoji} {st.label}</span>
                    </div>
                    {selProj.description&&<div style={{color:T.muted,fontSize:13,marginTop:6,lineHeight:1.5}}>{selProj.description}</div>}
                    <div style={{display:'flex',gap:12,marginTop:8,flexWrap:'wrap'}}>
                      {selProj.stack&&<span style={{fontSize:12,color:T.muted}}>🛠 {selProj.stack}</span>}
                      {selProj.startDate&&<span style={{fontSize:12,color:T.muted}}>📅 {fmtDate(selProj.startDate)}</span>}
                      {selProj.url&&<a href={selProj.url} target="_blank" rel="noreferrer" style={{fontSize:12,color:T.blue,textDecoration:'none'}}>🔗 {selProj.url}</a>}
                    </div>
                  </div>
                  <div style={{display:'flex',gap:6,flexShrink:0}}>
                    <button onClick={()=>openEditProj(selProj)} style={{background:'none',border:`1px solid ${T.border}`,borderRadius:8,padding:'4px 10px',cursor:'pointer',color:T.muted,fontSize:12,fontFamily:'inherit'}}>✏️</button>
                    <button onClick={()=>delProj(selProj.id)} style={{background:'none',border:'none',color:T.red,cursor:'pointer',padding:4,display:'flex'}}><Icon name="trash" size={15}/></button>
                  </div>
                </div>
                {/* quick status change */}
                <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:projTasksPending.length>0||projMiles.length>0?12:0}}>
                  {STATUSES.filter(s=>s.id!==selProj.status).map(s=>(
                    <button key={s.id} onClick={()=>updateStatus(selProj.id,s.id)}
                      style={{padding:'5px 10px',borderRadius:8,border:`1px solid ${s.color}30`,background:`${s.color}12`,color:s.color,cursor:'pointer',fontSize:11,fontWeight:600,fontFamily:'inherit'}}>
                      {s.emoji} {s.label}
                    </button>
                  ))}
                </div>
                {projTasksPending.length>0&&(
                  <div style={{marginBottom:projMiles.length>0?10:0}}>
                    <div style={{fontSize:11,fontWeight:600,color:T.accent,marginBottom:6}}>Tareas pendientes ({projTasksPending.length})</div>
                    {projTasksPending.slice(0,3).map(t=>(
                      <div key={t.id} style={{display:'flex',alignItems:'center',gap:8,padding:'5px 0',borderBottom:`1px solid ${T.border}`}}>
                        <button onClick={()=>toggleTask(t.id)} style={{width:18,height:18,borderRadius:5,border:`1.5px solid ${priorityColor(t.priority)}`,background:'transparent',cursor:'pointer',flexShrink:0}}/>
                        <span style={{color:T.text,fontSize:12,flex:1}}>{t.title}</span>
                        {t.dueDate&&<span style={{color:T.dim,fontSize:11}}>{fmtDate(t.dueDate)}</span>}
                      </div>
                    ))}
                  </div>
                )}
                {projMiles.length>0&&(
                  <div>
                    <div style={{fontSize:11,fontWeight:600,color:T.purple,marginBottom:6}}>Últimos hitos</div>
                    {projMiles.map(m=>(
                      <div key={m.id} style={{fontSize:12,color:T.muted,padding:'4px 0',borderBottom:`1px solid ${T.border}`}}>
                        <span style={{color:T.purple,marginRight:6}}>🏆</span>{m.title}<span style={{color:T.dim,marginLeft:8}}>{fmtDate(m.date)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })()}

          {/* Kanban-style columns */}
          {sideProjects.length===0
            ?<div style={{textAlign:'center',padding:'40px 0',color:T.dim}}>
               <div style={{fontSize:36,marginBottom:8}}>🚀</div>
               <div style={{fontSize:14,marginBottom:12}}>Sin proyectos todavía</div>
               <Btn size="sm" onClick={()=>setModalProj(true)}><Icon name="plus" size={13}/>Crear proyecto</Btn>
             </div>
            :<div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr',gap:10}}>
               {visibleProjs.map(p=>{
                 const st=statusInfo(p.status);
                 const cnt=spTasks.filter(t=>t.projectId===p.id&&!t.done).length;
                 const miles=milestones.filter(m=>m.projectId===p.id).length;
                 return (
                   <div key={p.id} onClick={()=>setSelProj(selProj?.id===p.id?null:p)}
                     style={{padding:'16px',background:T.surface,border:`1px solid ${selProj?.id===p.id?p.color||T.accent:T.border}`,borderRadius:12,cursor:'pointer',borderTop:`3px solid ${p.color||T.accent}`,transition:'border-color 0.15s'}}>
                     <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
                       <div style={{color:T.text,fontSize:14,fontWeight:700,lineHeight:1.3,flex:1}}>{p.name}</div>
                       <span style={{fontSize:11,color:st.color,background:`${st.color}15`,padding:'2px 8px',borderRadius:8,flexShrink:0,marginLeft:8}}>{st.emoji} {st.label}</span>
                     </div>
                     {p.description&&<div style={{color:T.muted,fontSize:12,marginBottom:8,lineHeight:1.4}}>{p.description.slice(0,80)}{p.description.length>80?'…':''}</div>}
                     <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                       {p.stack&&<span style={{fontSize:11,color:T.muted}}>🛠 {p.stack}</span>}
                       {cnt>0&&<span style={{fontSize:11,color:T.accent}}>✅ {cnt} tareas</span>}
                       {miles>0&&<span style={{fontSize:11,color:T.purple}}>🏆 {miles} hitos</span>}
                       {p.url&&<span style={{fontSize:11,color:T.blue}}>🔗 Live</span>}
                     </div>
                   </div>
                 );
               })}
             </div>
          }
        </div>
      )}

      {/* ══════════ TAREAS ══════════ */}
      {tab==='tareas'&&(
        <div>
          {/* project filter tabs */}
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
            const filtered=selProj?spTasks.filter(t=>t.projectId===selProj.id):spTasks;
            const pending=[...filtered.filter(t=>!t.done)].sort((a,b)=>(a.dueDate||'9999').localeCompare(b.dueDate||'9999'));
            const done=filtered.filter(t=>t.done);
            if(filtered.length===0) return (
              <div style={{textAlign:'center',padding:'40px 0',color:T.dim}}>
                <div style={{fontSize:36,marginBottom:8}}>✅</div>
                <div style={{fontSize:14,marginBottom:12}}>Sin tareas{selProj?` en ${selProj.name}`:''}</div>
                <Btn size="sm" onClick={()=>{setTaskForm({projectId:selProj?.id||'',title:'',priority:'media',dueDate:'',done:false});setModalTask(true);}}><Icon name="plus" size={13}/>Agregar</Btn>
              </div>
            );
            return (
              <div>
                {pending.length>0&&(
                  <div style={{marginBottom:20}}>
                    <div style={{fontSize:12,fontWeight:600,color:T.muted,marginBottom:10}}>PENDIENTES — {pending.length}</div>
                    {pending.map(t=>{
                      const proj=sideProjects.find(p=>p.id===t.projectId);
                      return (
                        <div key={t.id} style={{display:'flex',alignItems:'center',gap:10,padding:'12px 14px',background:T.surface,border:`1px solid ${T.border}`,borderRadius:11,marginBottom:8,borderLeft:`3px solid ${priorityColor(t.priority)}`}}>
                          <button onClick={()=>toggleTask(t.id)} style={{width:22,height:22,borderRadius:6,border:`2px solid ${priorityColor(t.priority)}`,background:'transparent',cursor:'pointer',flexShrink:0}}/>
                          <div style={{flex:1}}>
                            <div style={{color:T.text,fontSize:13,fontWeight:500}}>{t.title}</div>
                            <div style={{color:T.muted,fontSize:11,marginTop:2,display:'flex',gap:8}}>
                              {proj&&<span style={{color:proj.color||T.accent}}>◆ {proj.name}</span>}
                              {t.dueDate&&<span>📅 {fmtDate(t.dueDate)}</span>}
                            </div>
                          </div>
                          <button onClick={()=>delTask(t.id)} style={{background:'none',border:'none',color:T.dim,cursor:'pointer',padding:4,display:'flex'}}><Icon name="trash" size={13}/></button>
                        </div>
                      );
                    })}
                  </div>
                )}
                {done.length>0&&(
                  <div style={{opacity:0.5}}>
                    <div style={{fontSize:12,fontWeight:600,color:T.muted,marginBottom:10}}>COMPLETADAS — {done.length}</div>
                    {done.map(t=>(
                      <div key={t.id} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',background:T.surface,borderRadius:10,marginBottom:6}}>
                        <button onClick={()=>toggleTask(t.id)} style={{width:22,height:22,borderRadius:6,border:`2px solid ${T.green}`,background:`${T.green}30`,cursor:'pointer',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
                          <Icon name="check" size={12} color={T.green}/>
                        </button>
                        <div style={{flex:1}}>
                          <div style={{color:T.muted,fontSize:13,textDecoration:'line-through'}}>{t.title}</div>
                          <div style={{color:T.dim,fontSize:11}}>{projName(t.projectId)}</div>
                        </div>
                        <button onClick={()=>delTask(t.id)} style={{background:'none',border:'none',color:T.dim,cursor:'pointer',padding:4,display:'flex'}}><Icon name="trash" size={12}/></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
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
                <div key={m.id} style={{display:'flex',gap:12,padding:'14px 16px',background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,marginBottom:10,borderLeft:`3px solid ${proj?.color||T.purple}`}}>
                  <div style={{width:40,height:40,borderRadius:12,background:`${T.purple}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>🏆</div>
                  <div style={{flex:1}}>
                    <div style={{color:T.text,fontSize:14,fontWeight:600}}>{m.title}</div>
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
            <Input value={projForm.url} onChange={v=>setProjForm(f=>({...f,url:v}))} placeholder="URL (si ya está publicado)"/>
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
    </div>
  );
};

// ===================== RELACIONES =====================
const Relaciones = ({data,setData,isMobile}) => {
  const [tab,setTab]               = useState('personas');
  const [modalPerson,setModalPerson]   = useState(false);
  const [modalFollowUp,setModalFollowUp] = useState(false);
  const [modalInteraction,setModalInteraction] = useState(false);
  const [selPerson,setSelPerson]       = useState(null);
  const [editingPerson,setEditingPerson] = useState(null);
  const [personForm,setPersonForm]     = useState({name:'',relation:'',birthday:'',emoji:'👤',phone:'',email:'',notes:''});
  const [followForm,setFollowForm]     = useState({personId:'',task:'',dueDate:'',priority:'media',done:false});
  const [interForm,setInterForm]       = useState({personId:'',type:'Mensaje',notes:'',date:today()});

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

  const priorityColor=(p)=>p==='alta'?T.red:p==='media'?T.orange:T.green;

  return (
    <div>
      <PageHeader isMobile={isMobile} title="👥 Relaciones"
        subtitle="CRM personal — personas, seguimientos e interacciones"
        action={
          <div style={{display:'flex',gap:8}}>
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
            return (
              <Card style={{marginBottom:16,borderLeft:`3px solid ${T.accent}`}}>
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
                    <div style={{fontSize:11,fontWeight:600,color:T.muted,marginBottom:6}}>Últimos contactos</div>
                    {personInters.map(i=>(
                      <div key={i.id} style={{fontSize:12,color:T.muted,padding:'4px 0',borderBottom:`1px solid ${T.border}`}}>
                        <span style={{color:T.accent,marginRight:6}}>{i.type}</span>{i.notes&&<span style={{marginRight:6}}>{i.notes}</span>}<span style={{color:T.dim}}>{fmtDate(i.date)}</span>
                      </div>
                    ))}
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
            :<div style={{display:'grid',gridTemplateColumns:isMobile?'1fr 1fr':'repeat(auto-fill,minmax(180px,1fr))',gap:10}}>
               {people.map(p=>{
                 const dl=birthdayDaysLeft(p.birthday);
                 const pFollows=followUps.filter(f=>f.personId===p.id&&!f.done).length;
                 return (
                   <div key={p.id} onClick={()=>setSelPerson(selPerson?.id===p.id?null:p)}
                     style={{padding:'14px',background:T.surface,border:`1px solid ${selPerson?.id===p.id?T.accent:T.border}`,borderRadius:12,cursor:'pointer',transition:'border-color 0.15s',position:'relative'}}>
                     {dl!==null&&dl<=7&&<span style={{position:'absolute',top:8,right:8,fontSize:14}}>🎂</span>}
                     <div style={{fontSize:32,marginBottom:8}}>{p.emoji}</div>
                     <div style={{color:T.text,fontSize:14,fontWeight:600}}>{p.name}</div>
                     {p.relation&&<div style={{fontSize:11,color:T.muted,marginTop:2}}>{p.relation}</div>}
                     {pFollows>0&&<div style={{marginTop:6,fontSize:11,color:T.accent,background:`${T.accent}15`,padding:'2px 8px',borderRadius:8,display:'inline-block'}}>{pFollows} pendiente{pFollows>1?'s':''}</div>}
                   </div>
                 );
               })}
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

      {/* ══════════ HISTORIAL ══════════ */}
      {tab==='historial'&&(
        <div>
          {interactions.length===0
            ?<div style={{textAlign:'center',padding:'40px 0',color:T.dim}}>
               <div style={{fontSize:36,marginBottom:8}}>💬</div>
               <div style={{fontSize:14,marginBottom:12}}>Sin interacciones registradas</div>
               <Btn size="sm" onClick={()=>setModalInteraction(true)}><Icon name="plus" size={13}/>Registrar</Btn>
             </div>
            :[...interactions].sort((a,b)=>b.date.localeCompare(a.date)).map(i=>(
              <div key={i.id} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',background:T.surface,border:`1px solid ${T.border}`,borderRadius:11,marginBottom:8,borderLeft:`3px solid ${T.purple}`}}>
                <div style={{width:36,height:36,borderRadius:10,background:`${T.purple}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>
                  {personEmoji(i.personId)}
                </div>
                <div style={{flex:1}}>
                  <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
                    <span style={{color:T.text,fontSize:13,fontWeight:600}}>{personName(i.personId)}</span>
                    <span style={{fontSize:11,color:T.purple,background:`${T.purple}15`,padding:'2px 8px',borderRadius:8}}>{i.type}</span>
                  </div>
                  {i.notes&&<div style={{color:T.muted,fontSize:12,marginTop:3}}>{i.notes}</div>}
                  <div style={{color:T.dim,fontSize:11,marginTop:3}}>{fmtDate(i.date)}</div>
                </div>
                <button onClick={()=>delInteraction(i.id)} style={{background:'none',border:'none',color:T.dim,cursor:'pointer',padding:4,display:'flex',flexShrink:0}}><Icon name="trash" size={13}/></button>
              </div>
            ))
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
const DesarrolloPersonal = ({data,setData,isMobile}) => {
  const [tab,setTab]             = useState('libros');
  const [modalBook,setModalBook] = useState(false);
  const [modalLearn,setModalLearn] = useState(false);
  const [modalRetro,setModalRetro] = useState(false);
  const [modalIdea,setModalIdea]   = useState(false);
  const [selBook,setSelBook]       = useState(null);
  const [editingBook,setEditingBook] = useState(false);
  const [bookFilter,setBookFilter]   = useState('all');
  const [bookForm,setBookForm]       = useState({title:'',author:'',status:'want',rating:0,review:'',genre:'',pages:''});
  const [learnForm,setLearnForm]     = useState({name:'',platform:'',category:'',progress:0,hoursTotal:0,hoursSpent:0,status:'active',notes:''});
  const [retroForm,setRetroForm]     = useState({period:'semanal',wentWell:'',improve:'',learned:'',date:today()});
  const [ideaForm,setIdeaForm]       = useState({content:'',tag:'',date:today()});

  const books    = data.books||[];
  const learnings= data.learnings||[];
  const retros   = data.retros||[];
  const ideas    = data.ideas||[];

  // ── summary ──
  const BOOK_STATUSES=[{id:'want',label:'Por leer',color:T.blue,emoji:'📚'},{id:'reading',label:'Leyendo',color:T.accent,emoji:'📖'},{id:'done',label:'Leído',color:T.green,emoji:'✅'},{id:'abandoned',label:'Abandonado',color:T.dim,emoji:'❌'}];
  const activelearnings = learnings.filter(l=>l.status==='active');
  const hoursThisMonth  = learnings.reduce((s,l)=>s+(Number(l.hoursSpent)||0),0);
  const lastRetro       = [...retros].sort((a,b)=>b.date.localeCompare(a.date))[0];
  const lastRetroDays   = lastRetro ? Math.floor((new Date()-new Date(lastRetro.date))/(1000*60*60*24)) : null;

  // ── book actions ──
  const saveBook=(isEdit=false)=>{
    if(!bookForm.title.trim()) return;
    const b={...bookForm,id:isEdit?selBook.id:uid(),pages:Number(bookForm.pages)||0,createdAt:isEdit?(selBook.createdAt||today()):today()};
    const upd=isEdit?books.map(x=>x.id===b.id?b:x):[b,...books];
    setData(d=>({...d,books:upd})); save('books',upd);
    setModalBook(false); setEditingBook(false); setSelBook(b);
    setBookForm({title:'',author:'',status:'want',rating:0,review:'',genre:'',pages:''});
  };
  const delBook=(id)=>{
    if(!window.confirm('¿Eliminar este libro?')) return;
    const upd=books.filter(b=>b.id!==id); setData(d=>({...d,books:upd})); save('books',upd);
    if(selBook?.id===id) setSelBook(null);
  };
  const openEditBook=(b)=>{ setBookForm({title:b.title,author:b.author||'',status:b.status,rating:b.rating||0,review:b.review||'',genre:b.genre||'',pages:b.pages||''}); setEditingBook(true); setSelBook(b); setModalBook(true); };

  // ── learning actions ──
  const LEARN_CATS=['Programación','Idiomas','Diseño','Negocios','Ciencia','Arte','Música','Deporte','Filosofía','Otro'];
  const saveLearn=()=>{
    if(!learnForm.name.trim()) return;
    const l={id:uid(),...learnForm,progress:Number(learnForm.progress)||0,hoursTotal:Number(learnForm.hoursTotal)||0,hoursSpent:Number(learnForm.hoursSpent)||0,createdAt:today()};
    const upd=[l,...learnings]; setData(d=>({...d,learnings:upd})); save('learnings',upd);
    setModalLearn(false); setLearnForm({name:'',platform:'',category:'',progress:0,hoursTotal:0,hoursSpent:0,status:'active',notes:''});
  };
  const updateProgress=(id,delta)=>{
    const upd=learnings.map(l=>l.id===id?{...l,progress:Math.min(100,Math.max(0,(l.progress||0)+delta))}:l);
    setData(d=>({...d,learnings:upd})); save('learnings',upd);
  };
  const completeLearn=(id)=>{
    const upd=learnings.map(l=>l.id===id?{...l,status:'done',progress:100}:l);
    setData(d=>({...d,learnings:upd})); save('learnings',upd);
  };
  const delLearn=(id)=>{ const upd=learnings.filter(l=>l.id!==id); setData(d=>({...d,learnings:upd})); save('learnings',upd); };

  // ── retro actions ──
  const saveRetro=()=>{
    if(!retroForm.wentWell.trim()&&!retroForm.learned.trim()) return;
    const r={id:uid(),...retroForm,createdAt:today()};
    const upd=[r,...retros]; setData(d=>({...d,retros:upd})); save('retros',upd);
    setModalRetro(false); setRetroForm({period:'semanal',wentWell:'',improve:'',learned:'',date:today()});
  };
  const delRetro=(id)=>{ const upd=retros.filter(r=>r.id!==id); setData(d=>({...d,retros:upd})); save('retros',upd); };

  // ── idea actions ──
  const IDEA_TAGS=['Insight','Cita','Aprendizaje','Pregunta','Idea','Reflexión','Otro'];
  const saveIdea=()=>{
    if(!ideaForm.content.trim()) return;
    const i={id:uid(),...ideaForm,createdAt:today()};
    const upd=[i,...ideas]; setData(d=>({...d,ideas:upd})); save('ideas',upd);
    setModalIdea(false); setIdeaForm({content:'',tag:'',date:today()});
  };
  const delIdea=(id)=>{ const upd=ideas.filter(i=>i.id!==id); setData(d=>({...d,ideas:upd})); save('ideas',upd); };

  const StarRating=({val,onChange})=>(
    <div style={{display:'flex',gap:4}}>
      {[1,2,3,4,5].map(i=><button key={i} onClick={()=>onChange&&onChange(i===val?0:i)}
        style={{background:'none',border:'none',cursor:onChange?'pointer':'default',padding:2,color:i<=val?T.accent:T.border}}>
        <Icon name={i<=val?'star':'starEmpty'} size={18} color={i<=val?T.accent:T.border}/>
      </button>)}
    </div>
  );

  const fmtDate=(d)=>{ try{ return new Date(d+'T12:00:00').toLocaleDateString('es-ES',{day:'2-digit',month:'short',year:'numeric'}); }catch{return d||'—';} };

  return (
    <div>
      <PageHeader isMobile={isMobile} title="🧠 Desarrollo Personal"
        subtitle="Libros, aprendizajes, retrospectivas e ideas"
        action={
          <div style={{display:'flex',gap:8}}>
            {tab==='libros'       &&<Btn size="sm" onClick={()=>{setEditingBook(false);setBookForm({title:'',author:'',status:'want',rating:0,review:'',genre:'',pages:''});setModalBook(true);}}><Icon name="plus" size={14}/>Libro</Btn>}
            {tab==='aprendizajes' &&<Btn size="sm" onClick={()=>setModalLearn(true)}><Icon name="plus" size={14}/>Aprendizaje</Btn>}
            {tab==='retrospectivas'&&<Btn size="sm" onClick={()=>setModalRetro(true)}><Icon name="plus" size={14}/>Retro</Btn>}
            {tab==='ideas'        &&<Btn size="sm" onClick={()=>setModalIdea(true)}><Icon name="plus" size={14}/>Idea</Btn>}
          </div>
        }
      />

      {/* ── Summary cards ── */}
      <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr 1fr':'repeat(4,1fr)',gap:10,marginBottom:20}}>
        {[
          {label:'Libros leídos',   val:books.filter(b=>b.status==='done').length,  color:T.green},
          {label:'Aprendizajes activos', val:activelearnings.length,               color:T.accent},
          {label:'Horas invertidas',val:hoursThisMonth,                            color:T.blue},
          {label:'Última retro',    val:lastRetroDays===null?'—':`hace ${lastRetroDays}d`, color:lastRetroDays===null||lastRetroDays>14?T.orange:T.green},
        ].map(s=>(
          <Card key={s.label} style={{textAlign:'center',padding:14}}>
            <div style={{fontSize:11,color:T.muted,marginBottom:4}}>{s.label}</div>
            <div style={{fontSize:isMobile?18:22,fontWeight:700,color:s.color}}>{s.val}</div>
          </Card>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
        {[{id:'libros',label:'📚 Libros'},{id:'aprendizajes',label:'📖 Aprendizajes'},{id:'retrospectivas',label:'🔄 Retrospectivas'},{id:'ideas',label:'💡 Ideas'}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{padding:'7px 16px',borderRadius:10,border:`1px solid ${tab===t.id?T.accent:T.border}`,background:tab===t.id?`${T.accent}18`:'transparent',color:tab===t.id?T.accent:T.muted,cursor:'pointer',fontSize:13,fontWeight:tab===t.id?600:400,fontFamily:'inherit'}}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ══════════ LIBROS ══════════ */}
      {tab==='libros'&&(
        <div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:16}}>
            {BOOK_STATUSES.map(s=>{
              const cnt=books.filter(b=>b.status===s.id).length;
              return <Card key={s.id} onClick={()=>setBookFilter(bookFilter===s.id?'all':s.id)}
                style={{textAlign:'center',padding:10,border:`1px solid ${bookFilter===s.id?s.color:T.border}`,cursor:'pointer'}}>
                <div style={{fontSize:18}}>{s.emoji}</div>
                <div style={{fontSize:20,fontWeight:700,color:s.color}}>{cnt}</div>
                <div style={{fontSize:10,color:T.muted,marginTop:1}}>{s.label}</div>
              </Card>;
            })}
          </div>

          {selBook&&(
            <Card style={{marginBottom:16,borderLeft:`3px solid ${T.accent}`}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                <div style={{flex:1}}>
                  <div style={{color:T.text,fontWeight:700,fontSize:16}}>{selBook.title}</div>
                  {selBook.author&&<div style={{color:T.muted,fontSize:13,marginTop:2}}>por {selBook.author}</div>}
                </div>
                <div style={{display:'flex',gap:6}}>
                  <button onClick={()=>openEditBook(selBook)} style={{background:'none',border:`1px solid ${T.border}`,borderRadius:8,padding:'4px 10px',cursor:'pointer',color:T.muted,fontSize:12,fontFamily:'inherit'}}>✏️</button>
                  <button onClick={()=>delBook(selBook.id)} style={{background:'none',border:'none',color:T.red,cursor:'pointer',display:'flex',padding:4}}><Icon name="trash" size={15}/></button>
                </div>
              </div>
              <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:10,alignItems:'center'}}>
                {(()=>{const s=BOOK_STATUSES.find(x=>x.id===selBook.status);return s?<Tag text={`${s.emoji} ${s.label}`} color={s.color}/>:null;})()}
                {selBook.genre&&<Tag text={selBook.genre}/>}
                {selBook.pages>0&&<span style={{color:T.muted,fontSize:12}}>{selBook.pages} págs</span>}
              </div>
              {selBook.rating>0&&<div style={{marginBottom:8}}><StarRating val={selBook.rating}/></div>}
              {selBook.review&&<p style={{color:T.text,fontSize:14,lineHeight:1.7,margin:0,fontStyle:'italic'}}>"{selBook.review}"</p>}
            </Card>
          )}

          <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr 1fr':'repeat(auto-fill,minmax(160px,1fr))',gap:10}}>
            {(bookFilter==='all'?books:books.filter(b=>b.status===bookFilter)).map(b=>{
              const st=BOOK_STATUSES.find(s=>s.id===b.status);
              return <div key={b.id} onClick={()=>setSelBook(selBook?.id===b.id?null:b)}
                style={{padding:'12px 14px',background:T.surface,border:`1px solid ${selBook?.id===b.id?T.accent:T.border}`,borderRadius:10,cursor:'pointer',borderTop:`3px solid ${st?.color||T.border}`}}>
                <div style={{color:T.text,fontSize:13,fontWeight:600,marginBottom:4,lineHeight:1.3}}>{b.title}</div>
                {b.author&&<div style={{color:T.muted,fontSize:11,marginBottom:6}}>{b.author}</div>}
                {b.rating>0&&<div style={{display:'flex',gap:1}}>{[1,2,3,4,5].map(i=><span key={i} style={{color:i<=b.rating?T.accent:T.border,fontSize:11}}>★</span>)}</div>}
              </div>;
            })}
            {books.length===0&&<div style={{gridColumn:'1/-1',textAlign:'center',padding:'40px 0',color:T.dim}}>
              <div style={{fontSize:36,marginBottom:8}}>📚</div>
              <div style={{fontSize:14,marginBottom:12}}>Sin libros aún</div>
              <Btn size="sm" onClick={()=>{setEditingBook(false);setModalBook(true);}}><Icon name="plus" size={13}/>Agregar</Btn>
            </div>}
          </div>
        </div>
      )}

      {/* ══════════ APRENDIZAJES ══════════ */}
      {tab==='aprendizajes'&&(
        <div>
          {learnings.length===0
            ?<div style={{textAlign:'center',padding:'40px 0',color:T.dim}}>
               <div style={{fontSize:36,marginBottom:8}}>📖</div>
               <div style={{fontSize:14,marginBottom:12}}>Sin aprendizajes registrados</div>
               <Btn size="sm" onClick={()=>setModalLearn(true)}><Icon name="plus" size={13}/>Agregar</Btn>
             </div>
            :[...learnings].sort((a,b)=>(a.status==='done'?1:0)-(b.status==='done'?1:0)).map(l=>(
              <div key={l.id} style={{padding:'14px 16px',background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,marginBottom:10,borderLeft:`3px solid ${l.status==='done'?T.green:T.accent}`,opacity:l.status==='done'?0.7:1}}>
                <div style={{display:'flex',alignItems:'flex-start',gap:10}}>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                      <span style={{color:T.text,fontSize:14,fontWeight:600}}>{l.name}</span>
                      {l.status==='done'&&<span style={{fontSize:11,color:T.green,background:`${T.green}18`,padding:'2px 8px',borderRadius:8}}>✅ Completado</span>}
                      {l.category&&<span style={{fontSize:11,color:T.purple,background:`${T.purple}15`,padding:'2px 8px',borderRadius:8}}>{l.category}</span>}
                    </div>
                    {l.platform&&<div style={{color:T.muted,fontSize:12,marginTop:3}}>📍 {l.platform}</div>}
                    {l.notes&&<div style={{color:T.dim,fontSize:11,marginTop:4}}>{l.notes}</div>}
                    {/* Progress bar */}
                    <div style={{marginTop:10}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                        <span style={{fontSize:11,color:T.muted}}>Progreso</span>
                        <span style={{fontSize:11,fontWeight:600,color:T.accent}}>{l.progress||0}%</span>
                      </div>
                      <div style={{height:6,background:T.surface2,borderRadius:4,overflow:'hidden'}}>
                        <div style={{height:'100%',width:`${l.progress||0}%`,background:l.status==='done'?T.green:T.accent,borderRadius:4,transition:'width 0.3s'}}/>
                      </div>
                    </div>
                    <div style={{display:'flex',gap:12,marginTop:8,flexWrap:'wrap'}}>
                      {l.hoursSpent>0&&<span style={{fontSize:11,color:T.muted}}>⏱ {l.hoursSpent}h invertidas</span>}
                      {l.hoursTotal>0&&<span style={{fontSize:11,color:T.muted}}>🎯 {l.hoursTotal}h estimadas</span>}
                    </div>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:6,flexShrink:0,alignItems:'flex-end'}}>
                    {l.status!=='done'&&(
                      <>
                        <div style={{display:'flex',gap:4}}>
                          <button onClick={()=>updateProgress(l.id,-10)} style={{padding:'4px 8px',background:T.surface2,border:`1px solid ${T.border}`,borderRadius:7,cursor:'pointer',color:T.muted,fontSize:12,fontFamily:'inherit'}}>−10%</button>
                          <button onClick={()=>updateProgress(l.id,10)}  style={{padding:'4px 8px',background:T.surface2,border:`1px solid ${T.border}`,borderRadius:7,cursor:'pointer',color:T.muted,fontSize:12,fontFamily:'inherit'}}>+10%</button>
                        </div>
                        <button onClick={()=>completeLearn(l.id)}
                          style={{padding:'5px 10px',background:`${T.green}18`,border:`1px solid ${T.green}40`,borderRadius:8,cursor:'pointer',color:T.green,fontSize:11,fontWeight:600,fontFamily:'inherit'}}>
                          ✓ Completar
                        </button>
                      </>
                    )}
                    <button onClick={()=>delLearn(l.id)} style={{background:'none',border:'none',color:T.dim,cursor:'pointer',padding:4,display:'flex'}}><Icon name="trash" size={13}/></button>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* ══════════ RETROSPECTIVAS ══════════ */}
      {tab==='retrospectivas'&&(
        <div>
          {retros.length===0
            ?<div style={{textAlign:'center',padding:'40px 0',color:T.dim}}>
               <div style={{fontSize:36,marginBottom:8}}>🔄</div>
               <div style={{fontSize:14,marginBottom:12}}>Sin retrospectivas aún</div>
               <Btn size="sm" onClick={()=>setModalRetro(true)}><Icon name="plus" size={13}/>Nueva retro</Btn>
             </div>
            :[...retros].sort((a,b)=>b.date.localeCompare(a.date)).map(r=>(
              <div key={r.id} style={{padding:'16px',background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,marginBottom:12,borderLeft:`3px solid ${T.purple}`}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                  <div style={{display:'flex',gap:8,alignItems:'center'}}>
                    <span style={{fontSize:13,fontWeight:700,color:T.text}}>Retro {r.period}</span>
                    <span style={{fontSize:11,color:T.purple,background:`${T.purple}15`,padding:'2px 8px',borderRadius:8}}>{fmtDate(r.date)}</span>
                  </div>
                  <button onClick={()=>delRetro(r.id)} style={{background:'none',border:'none',color:T.dim,cursor:'pointer',padding:4,display:'flex'}}><Icon name="trash" size={13}/></button>
                </div>
                {r.wentWell&&<div style={{marginBottom:10}}>
                  <div style={{fontSize:11,fontWeight:600,color:T.green,marginBottom:4}}>✅ Qué salió bien</div>
                  <div style={{color:T.text,fontSize:13,lineHeight:1.6}}>{r.wentWell}</div>
                </div>}
                {r.improve&&<div style={{marginBottom:10}}>
                  <div style={{fontSize:11,fontWeight:600,color:T.orange,marginBottom:4}}>🔧 Qué mejorar</div>
                  <div style={{color:T.text,fontSize:13,lineHeight:1.6}}>{r.improve}</div>
                </div>}
                {r.learned&&<div>
                  <div style={{fontSize:11,fontWeight:600,color:T.blue,marginBottom:4}}>💡 Qué aprendí</div>
                  <div style={{color:T.text,fontSize:13,lineHeight:1.6}}>{r.learned}</div>
                </div>}
              </div>
            ))
          }
        </div>
      )}

      {/* ══════════ IDEAS ══════════ */}
      {tab==='ideas'&&(
        <div>
          {ideas.length===0
            ?<div style={{textAlign:'center',padding:'40px 0',color:T.dim}}>
               <div style={{fontSize:36,marginBottom:8}}>💡</div>
               <div style={{fontSize:14,marginBottom:12}}>Sin ideas registradas</div>
               <Btn size="sm" onClick={()=>setModalIdea(true)}><Icon name="plus" size={13}/>Capturar</Btn>
             </div>
            :[...ideas].sort((a,b)=>b.date.localeCompare(a.date)).map(i=>(
              <div key={i.id} style={{padding:'14px 16px',background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,marginBottom:8,borderLeft:`3px solid ${T.orange}`}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:10}}>
                  <div style={{flex:1}}>
                    {i.tag&&<span style={{fontSize:11,color:T.orange,background:`${T.orange}15`,padding:'2px 8px',borderRadius:8,display:'inline-block',marginBottom:6}}>{i.tag}</span>}
                    <div style={{color:T.text,fontSize:14,lineHeight:1.6}}>{i.content}</div>
                    <div style={{color:T.dim,fontSize:11,marginTop:6}}>{fmtDate(i.date)}</div>
                  </div>
                  <button onClick={()=>delIdea(i.id)} style={{background:'none',border:'none',color:T.dim,cursor:'pointer',padding:4,display:'flex',flexShrink:0}}><Icon name="trash" size={13}/></button>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* ══════════ MODALES ══════════ */}
      {modalBook&&(
        <Modal title={editingBook?'Editar libro':'Nuevo libro'} onClose={()=>{setModalBook(false);setEditingBook(false);}}>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <Input value={bookForm.title} onChange={v=>setBookForm(f=>({...f,title:v}))} placeholder="Título"/>
            <Input value={bookForm.author} onChange={v=>setBookForm(f=>({...f,author:v}))} placeholder="Autor"/>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <Input value={bookForm.genre} onChange={v=>setBookForm(f=>({...f,genre:v}))} placeholder="Género"/>
              <Input type="number" value={bookForm.pages} onChange={v=>setBookForm(f=>({...f,pages:v}))} placeholder="Páginas"/>
            </div>
            <Select value={bookForm.status} onChange={v=>setBookForm(f=>({...f,status:v}))}>
              {BOOK_STATUSES.map(s=><option key={s.id} value={s.id}>{s.emoji} {s.label}</option>)}
            </Select>
            <div>
              <div style={{color:T.muted,fontSize:12,marginBottom:6}}>Calificación</div>
              <StarRating val={bookForm.rating} onChange={v=>setBookForm(f=>({...f,rating:v}))}/>
            </div>
            <Textarea value={bookForm.review} onChange={v=>setBookForm(f=>({...f,review:v}))} placeholder="Reseña o notas..." rows={3}/>
          </div>
          <div style={{display:'flex',gap:10,marginTop:20}}>
            <Btn onClick={()=>saveBook(editingBook)} style={{flex:1,justifyContent:'center'}}>{editingBook?'Guardar cambios':'Agregar'}</Btn>
            <Btn variant="ghost" onClick={()=>{setModalBook(false);setEditingBook(false);}}>Cancelar</Btn>
          </div>
        </Modal>
      )}

      {modalLearn&&(
        <Modal title="Nuevo aprendizaje" onClose={()=>setModalLearn(false)}>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <Input value={learnForm.name} onChange={v=>setLearnForm(f=>({...f,name:v}))} placeholder="¿Qué estás aprendiendo? (ej: Python, Inglés B2...)"/>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <Input value={learnForm.platform} onChange={v=>setLearnForm(f=>({...f,platform:v}))} placeholder="Plataforma / Recurso"/>
              <Select value={learnForm.category} onChange={v=>setLearnForm(f=>({...f,category:v}))}>
                <option value="">— Categoría —</option>
                {LEARN_CATS.map(c=><option key={c}>{c}</option>)}
              </Select>
            </div>
            <div>
              <div style={{fontSize:12,color:T.muted,marginBottom:6}}>Progreso actual: {learnForm.progress}%</div>
              <input type="range" min={0} max={100} step={5} value={learnForm.progress}
                onChange={e=>setLearnForm(f=>({...f,progress:Number(e.target.value)}))}
                style={{width:'100%',accentColor:T.accent}}/>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <Input type="number" value={learnForm.hoursSpent} onChange={v=>setLearnForm(f=>({...f,hoursSpent:v}))} placeholder="Horas invertidas"/>
              <Input type="number" value={learnForm.hoursTotal} onChange={v=>setLearnForm(f=>({...f,hoursTotal:v}))} placeholder="Horas estimadas"/>
            </div>
            <Textarea value={learnForm.notes} onChange={v=>setLearnForm(f=>({...f,notes:v}))} placeholder="Notas..." rows={2}/>
          </div>
          <div style={{display:'flex',gap:10,marginTop:20}}>
            <Btn onClick={saveLearn} style={{flex:1,justifyContent:'center'}}>Guardar</Btn>
            <Btn variant="ghost" onClick={()=>setModalLearn(false)}>Cancelar</Btn>
          </div>
        </Modal>
      )}

      {modalRetro&&(
        <Modal title="Nueva retrospectiva" onClose={()=>setModalRetro(false)}>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <Select value={retroForm.period} onChange={v=>setRetroForm(f=>({...f,period:v}))}>
                {['semanal','mensual','trimestral','anual'].map(p=><option key={p}>{p}</option>)}
              </Select>
              <Input value={retroForm.date} onChange={v=>setRetroForm(f=>({...f,date:v}))} type="date"/>
            </div>
            <div>
              <div style={{fontSize:12,fontWeight:600,color:T.green,marginBottom:6}}>✅ ¿Qué salió bien?</div>
              <Textarea value={retroForm.wentWell} onChange={v=>setRetroForm(f=>({...f,wentWell:v}))} placeholder="Logros, momentos positivos, lo que funcionó..." rows={3}/>
            </div>
            <div>
              <div style={{fontSize:12,fontWeight:600,color:T.orange,marginBottom:6}}>🔧 ¿Qué mejorar?</div>
              <Textarea value={retroForm.improve} onChange={v=>setRetroForm(f=>({...f,improve:v}))} placeholder="Áreas de mejora, obstáculos, friction..." rows={3}/>
            </div>
            <div>
              <div style={{fontSize:12,fontWeight:600,color:T.blue,marginBottom:6}}>💡 ¿Qué aprendí?</div>
              <Textarea value={retroForm.learned} onChange={v=>setRetroForm(f=>({...f,learned:v}))} placeholder="Insights, lecciones, conclusiones clave..." rows={3}/>
            </div>
          </div>
          <div style={{display:'flex',gap:10,marginTop:20}}>
            <Btn onClick={saveRetro} style={{flex:1,justifyContent:'center'}}>Guardar</Btn>
            <Btn variant="ghost" onClick={()=>setModalRetro(false)}>Cancelar</Btn>
          </div>
        </Modal>
      )}

      {modalIdea&&(
        <Modal title="Capturar idea / reflexión" onClose={()=>setModalIdea(false)}>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <Select value={ideaForm.tag} onChange={v=>setIdeaForm(f=>({...f,tag:v}))}>
                <option value="">— Etiqueta —</option>
                {IDEA_TAGS.map(t=><option key={t}>{t}</option>)}
              </Select>
              <Input value={ideaForm.date} onChange={v=>setIdeaForm(f=>({...f,date:v}))} type="date"/>
            </div>
            <Textarea value={ideaForm.content} onChange={v=>setIdeaForm(f=>({...f,content:v}))} placeholder="Escribe tu idea, insight o reflexión..." rows={5}/>
          </div>
          <div style={{display:'flex',gap:10,marginTop:20}}>
            <Btn onClick={saveIdea} style={{flex:1,justifyContent:'center'}}>Capturar</Btn>
            <Btn variant="ghost" onClick={()=>setModalIdea(false)}>Cancelar</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ===================== HOGAR =====================
const Hogar = ({data,setData,isMobile}) => {
  const [tab,setTab]       = useState('mantenimientos');
  const [modalMaint,setModalMaint]   = useState(false);
  const [modalDoc,setModalDoc]       = useState(false);
  const [modalContact,setModalContact] = useState(false);
  const [maintForm,setMaintForm]     = useState({name:'',category:'',frequencyDays:90,lastDone:'',notes:'',cost:''});
  const [docForm,setDocForm]         = useState({name:'',category:'',expiresAt:'',provider:'',amount:'',notes:''});
  const [contactForm,setContactForm] = useState({name:'',role:'',phone:'',email:'',notes:''});

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
  };
  const delMaint=(id)=>{ const u=maints.filter(m=>m.id!==id); setData(d=>({...d,maintenances:u})); save('maintenances',u); };

  // ── DOC actions ──
  const DOC_CATS=['Seguro','Garantía','Contrato','Escritura','Impuesto','Membresía','Suscripción','Otro'];
  const saveDoc=()=>{
    if(!docForm.name.trim()) return;
    const d={id:uid(),...docForm,createdAt:today()};
    const upd=[d,...docs]; setData(s=>({...s,homeDocs:upd})); save('homeDocs',upd);
    setModalDoc(false); setDocForm({name:'',category:'',expiresAt:'',provider:'',amount:'',notes:''});
  };
  const delDoc=(id)=>{ const u=docs.filter(d=>d.id!==id); setData(s=>({...s,homeDocs:u})); save('homeDocs',u); };

  // ── CONTACT actions ──
  const CONTACT_ROLES=['Plomero','Electricista','Médico','Dentista','Veterinario','Mecánico','Abogado','Contador','Jardinero','Limpieza','Cerrajero','Otro'];
  const saveContact=()=>{
    if(!contactForm.name.trim()) return;
    const c={id:uid(),...contactForm,createdAt:today()};
    const upd=[c,...contacts]; setData(d=>({...d,homeContacts:upd})); save('homeContacts',upd);
    setModalContact(false); setContactForm({name:'',role:'',phone:'',email:'',notes:''});
  };
  const delContact=(id)=>{ const u=contacts.filter(c=>c.id!==id); setData(d=>({...d,homeContacts:u})); save('homeContacts',u); };
  const copyPhone=(phone)=>{ navigator.clipboard?.writeText(phone).catch(()=>{}); };

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
      <PageHeader isMobile={isMobile} title="🏠 Hogar"
        subtitle="Mantenimientos, documentos y contactos de servicio"
        action={
          <div style={{display:'flex',gap:8}}>
            {tab==='mantenimientos'&&<Btn size="sm" onClick={()=>setModalMaint(true)}><Icon name="plus" size={14}/>Tarea</Btn>}
            {tab==='documentos'    &&<Btn size="sm" onClick={()=>setModalDoc(true)}><Icon name="plus" size={14}/>Doc</Btn>}
            {tab==='contactos'     &&<Btn size="sm" onClick={()=>setModalContact(true)}><Icon name="plus" size={14}/>Contacto</Btn>}
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
        {[{id:'mantenimientos',label:'🔧 Mantenimientos'},{id:'documentos',label:'📄 Documentos'},{id:'contactos',label:'📞 Contactos'}].map(t=>(
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
                     </div>
                     <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:6,flexShrink:0}}>
                       <span style={{fontSize:11,fontWeight:600,color:st.color,background:`${st.color}15`,padding:'3px 10px',borderRadius:8,whiteSpace:'nowrap'}}>{st.label}</span>
                       <button onClick={()=>delDoc(doc.id)} style={{background:'none',border:'none',color:T.dim,cursor:'pointer',padding:4,display:'flex'}}><Icon name="trash" size={13}/></button>
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
          {contacts.length===0
            ?<div style={{textAlign:'center',padding:'40px 0',color:T.dim}}>
               <div style={{fontSize:36,marginBottom:8}}>📞</div>
               <div style={{fontSize:14,marginBottom:12}}>Sin contactos de servicio</div>
               <Btn size="sm" onClick={()=>setModalContact(true)}><Icon name="plus" size={13}/>Agregar</Btn>
             </div>
            :<div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr',gap:10}}>
               {contacts.map(c=>(
                 <div key={c.id} style={{padding:'14px 16px',background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,borderLeft:`3px solid ${T.purple}`}}>
                   <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8}}>
                     <div style={{flex:1,minWidth:0}}>
                       <div style={{color:T.text,fontSize:14,fontWeight:600}}>{c.name}</div>
                       {c.role&&<span style={{fontSize:11,background:`${T.purple}15`,color:T.purple,padding:'2px 8px',borderRadius:8,display:'inline-block',marginTop:4}}>{c.role}</span>}
                       {c.notes&&<div style={{color:T.dim,fontSize:11,marginTop:6}}>{c.notes}</div>}
                     </div>
                     <button onClick={()=>delContact(c.id)} style={{background:'none',border:'none',color:T.dim,cursor:'pointer',padding:4,display:'flex',flexShrink:0}}><Icon name="trash" size={13}/></button>
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
             </div>
          }
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
    </div>
  );
};

// ===================== HEALTH =====================
const Health = ({data,setData,isMobile}) => {
  const [tab,setTab]=useState('metricas');
  const [modalMetric,setModalMetric]=useState(false);
  const [modalMed,setModalMed]=useState(false);
  const [modalWorkout,setModalWorkout]=useState(false);
  const [metricForm,setMetricForm]=useState({type:'peso',value:'',unit:'kg',date:today(),note:''});
  const [medForm,setMedForm]=useState({name:'',dose:'',unit:'mg',frequency:'diario',time:'08:00',stock:''});
  const [workoutForm,setWorkoutForm]=useState({type:'Correr',duration:'',calories:'',distance:'',date:today(),note:''});

  const metrics  = data.healthMetrics||[];
  const meds     = data.medications||[];
  const workouts = data.workouts||[];

  // ── Metric helpers ──
  const METRIC_TYPES=[
    {id:'peso',      label:'Peso',           unit:'kg',   icon:'⚖️'},
    {id:'presion',   label:'Presión arterial',unit:'mmHg',icon:'🫀'},
    {id:'glucosa',   label:'Glucosa',        unit:'mg/dL',icon:'🩸'},
    {id:'sueno',     label:'Sueño',          unit:'hrs',  icon:'😴'},
    {id:'pasos',     label:'Pasos',          unit:'pasos',icon:'👟'},
    {id:'agua',      label:'Agua',           unit:'L',    icon:'💧'},
    {id:'otro',      label:'Otro',           unit:'',     icon:'📊'},
  ];
  const metricInfo=(id)=>METRIC_TYPES.find(m=>m.id===id)||METRIC_TYPES[0];

  // last value per type
  const lastMetric=(type)=>[...metrics].filter(m=>m.type===type).sort((a,b)=>b.date.localeCompare(a.date))[0];
  const pesoLast   = lastMetric('peso');
  const suenoLast  = lastMetric('sueno');

  // avg sleep this month
  const thisMonth  = today().slice(0,7);
  const suenoMonth = metrics.filter(m=>m.type==='sueno'&&m.date.slice(0,7)===thisMonth);
  const avgSueno   = suenoMonth.length ? (suenoMonth.reduce((s,m)=>s+(Number(m.value)||0),0)/suenoMonth.length).toFixed(1) : null;

  // workout streak
  const workoutDays=[...new Set(workouts.map(w=>w.date))].sort((a,b)=>b.localeCompare(a));
  let streak=0;
  const d=new Date();
  for(let i=0;i<workoutDays.length;i++){
    const dd=new Date(d); dd.setDate(dd.getDate()-i);
    const key=`${dd.getFullYear()}-${String(dd.getMonth()+1).padStart(2,'0')}-${String(dd.getDate()).padStart(2,'0')}`;
    if(workoutDays.includes(key)) streak++; else break;
  }

  // meds taken today
  const medsTakenToday = meds.filter(m=>(m.takenDates||[]).includes(today()));

  const saveMetric=()=>{
    if(!metricForm.value) return;
    const m={id:uid(),...metricForm,createdAt:today()};
    const upd=[m,...metrics]; setData(d=>({...d,healthMetrics:upd})); save('healthMetrics',upd);
    setModalMetric(false); setMetricForm({type:'peso',value:'',unit:'kg',date:today(),note:''});
  };
  const delMetric=(id)=>{ const u=metrics.filter(m=>m.id!==id); setData(d=>({...d,healthMetrics:u})); save('healthMetrics',u); };

  const saveMed=()=>{
    if(!medForm.name.trim()) return;
    const m={id:uid(),...medForm,takenDates:[],createdAt:today()};
    const upd=[m,...meds]; setData(d=>({...d,medications:upd})); save('medications',upd);
    setModalMed(false); setMedForm({name:'',dose:'',unit:'mg',frequency:'diario',time:'08:00',stock:''});
  };
  const toggleMedToday=(id)=>{
    const upd=meds.map(m=>{
      if(m.id!==id) return m;
      const taken=m.takenDates||[];
      return {...m,takenDates:taken.includes(today())?taken.filter(d=>d!==today()):[...taken,today()]};
    });
    setData(d=>({...d,medications:upd})); save('medications',upd);
  };
  const delMed=(id)=>{ const u=meds.filter(m=>m.id!==id); setData(d=>({...d,medications:u})); save('medications',u); };

  const saveWorkout=()=>{
    if(!workoutForm.duration) return;
    const w={id:uid(),...workoutForm,duration:Number(workoutForm.duration),calories:Number(workoutForm.calories)||0,createdAt:today()};
    const upd=[w,...workouts]; setData(d=>({...d,workouts:upd})); save('workouts',upd);
    setModalWorkout(false); setWorkoutForm({type:'Correr',duration:'',calories:'',distance:'',date:today(),note:''});
  };
  const delWorkout=(id)=>{ const u=workouts.filter(w=>w.id!==id); setData(d=>({...d,workouts:u})); save('workouts',u); };

  const WORKOUT_TYPES=['Correr','Caminar','Ciclismo','Natación','Gym','Yoga','HIIT','Fútbol','Basquetbol','Otro'];
  const fmtDate=(d)=>{ try{ return new Date(d+'T12:00:00').toLocaleDateString('es-ES',{day:'2-digit',month:'short'}); }catch{return d;} };

  // mini trend for a metric type (last 7 entries)
  const trendData=(type)=>[...metrics].filter(m=>m.type===type).sort((a,b)=>a.date.localeCompare(b.date)).slice(-7);

  // ── Inline sparkline ──
  const Sparkline=({points,color})=>{
    if(points.length<2) return null;
    const vals=points.map(p=>Number(p.value));
    const min=Math.min(...vals), max=Math.max(...vals), range=max-min||1;
    const W=80,H=28;
    const pts=vals.map((v,i)=>`${(i/(vals.length-1))*W},${H-((v-min)/range)*H}`).join(' ');
    return <svg width={W} height={H} style={{display:'block'}}><polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  };

  return (
    <div>
      <PageHeader isMobile={isMobile} title="💪 Salud"
        subtitle="Métricas, medicamentos y actividad física"
        action={
          <div style={{display:'flex',gap:8}}>
            {tab==='metricas' &&<Btn size="sm" onClick={()=>setModalMetric(true)} ><Icon name="plus" size={14}/>Métrica</Btn>}
            {tab==='medicamentos'&&<Btn size="sm" onClick={()=>setModalMed(true)}    ><Icon name="plus" size={14}/>Med</Btn>}
            {tab==='actividad'  &&<Btn size="sm" onClick={()=>setModalWorkout(true)} ><Icon name="plus" size={14}/>Actividad</Btn>}
          </div>
        }
      />

      {/* ── Summary cards ── */}
      <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr 1fr':'repeat(4,1fr)',gap:10,marginBottom:20}}>
        {[
          {label:'Peso actual',   val:pesoLast?`${pesoLast.value} kg`:'—',       color:T.blue},
          {label:'Promedio sueño',val:avgSueno?`${avgSueno} hrs`:'—',            color:T.purple},
          {label:'Racha activa',  val:`${streak} día${streak!==1?'s':''}`,        color:T.accent},
          {label:'Meds hoy',      val:`${medsTakenToday.length}/${meds.length}`,  color:meds.length>0&&medsTakenToday.length===meds.length?T.green:T.orange},
        ].map(s=>(
          <Card key={s.label} style={{textAlign:'center',padding:14}}>
            <div style={{fontSize:11,color:T.muted,marginBottom:4}}>{s.label}</div>
            <div style={{fontSize:isMobile?18:22,fontWeight:700,color:s.color}}>{s.val}</div>
          </Card>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
        {[{id:'metricas',label:'📊 Métricas'},{id:'medicamentos',label:'💊 Medicamentos'},{id:'actividad',label:'🏃 Actividad'}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{padding:'7px 16px',borderRadius:10,border:`1px solid ${tab===t.id?T.accent:T.border}`,background:tab===t.id?`${T.accent}18`:'transparent',color:tab===t.id?T.accent:T.muted,cursor:'pointer',fontSize:13,fontWeight:tab===t.id?600:400,fontFamily:'inherit'}}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ══════════ MÉTRICAS ══════════ */}
      {tab==='metricas'&&(
        <div>
          {/* Cards por tipo con sparkline */}
          <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr',gap:12,marginBottom:20}}>
            {METRIC_TYPES.filter(mt=>metrics.some(m=>m.type===mt.id)).map(mt=>{
              const last=lastMetric(mt.id);
              const trend=trendData(mt.id);
              return (
                <Card key={mt.id} style={{padding:'14px 16px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                    <div>
                      <div style={{fontSize:11,color:T.muted,marginBottom:2}}>{mt.icon} {mt.label}</div>
                      <div style={{fontSize:22,fontWeight:700,color:T.text}}>{last?.value} <span style={{fontSize:13,color:T.muted,fontWeight:400}}>{last?.unit||mt.unit}</span></div>
                      <div style={{fontSize:11,color:T.dim,marginTop:2}}>{fmtDate(last?.date)}</div>
                    </div>
                    <Sparkline points={trend} color={T.accent}/>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Historial completo */}
          {metrics.length===0
            ?<div style={{textAlign:'center',padding:'40px 0',color:T.dim}}>
               <div style={{fontSize:36,marginBottom:8}}>📊</div>
               <div style={{fontSize:14,marginBottom:12}}>Sin métricas registradas</div>
               <Btn size="sm" onClick={()=>setModalMetric(true)}><Icon name="plus" size={13}/>Agregar</Btn>
             </div>
            :<div>
               <div style={{fontSize:13,fontWeight:600,color:T.muted,marginBottom:10}}>Historial reciente</div>
               {[...metrics].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,20).map(m=>{
                 const mt=metricInfo(m.type);
                 return (
                   <div key={m.id} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,marginBottom:7,borderLeft:`3px solid ${T.accent}`}}>
                     <span style={{fontSize:20,flexShrink:0}}>{mt.icon}</span>
                     <div style={{flex:1}}>
                       <div style={{color:T.text,fontSize:13,fontWeight:500}}>{mt.label}</div>
                       {m.note&&<div style={{color:T.muted,fontSize:11,marginTop:1}}>{m.note}</div>}
                     </div>
                     <div style={{textAlign:'right',flexShrink:0}}>
                       <div style={{fontWeight:700,color:T.accent,fontSize:15}}>{m.value} <span style={{fontSize:11,color:T.muted,fontWeight:400}}>{m.unit||mt.unit}</span></div>
                       <div style={{color:T.dim,fontSize:11}}>{fmtDate(m.date)}</div>
                     </div>
                     <button onClick={()=>delMetric(m.id)} style={{background:'none',border:'none',color:T.dim,cursor:'pointer',padding:4,display:'flex'}}><Icon name="trash" size={13}/></button>
                   </div>
                 );
               })}
             </div>
          }
        </div>
      )}

      {/* ══════════ MEDICAMENTOS ══════════ */}
      {tab==='medicamentos'&&(
        <div>
          {meds.length===0
            ?<div style={{textAlign:'center',padding:'40px 0',color:T.dim}}>
               <div style={{fontSize:36,marginBottom:8}}>💊</div>
               <div style={{fontSize:14,marginBottom:12}}>Sin medicamentos registrados</div>
               <Btn size="sm" onClick={()=>setModalMed(true)}><Icon name="plus" size={13}/>Agregar</Btn>
             </div>
            :<div>
               <div style={{fontSize:12,color:T.muted,marginBottom:12}}>Toca el check para marcar como tomado hoy</div>
               {meds.map(m=>{
                 const taken=(m.takenDates||[]).includes(today());
                 return (
                   <div key={m.id} style={{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',background:T.surface,border:`1px solid ${taken?T.green:T.border}`,borderRadius:12,marginBottom:10,transition:'border-color 0.2s'}}>
                     <button onClick={()=>toggleMedToday(m.id)}
                       style={{width:32,height:32,borderRadius:10,border:`2px solid ${taken?T.green:T.border}`,background:taken?`${T.green}20`:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all 0.2s'}}>
                       {taken&&<Icon name="check" size={16} color={T.green}/>}
                     </button>
                     <div style={{flex:1}}>
                       <div style={{color:T.text,fontSize:14,fontWeight:600}}>{m.name}</div>
                       <div style={{color:T.muted,fontSize:12,marginTop:2,display:'flex',gap:10,flexWrap:'wrap'}}>
                         {m.dose&&<span>💊 {m.dose} {m.unit}</span>}
                         <span>🔁 {m.frequency}</span>
                         {m.time&&<span>⏰ {m.time}</span>}
                         {m.stock&&<span style={{color:Number(m.stock)<5?T.red:T.muted}}>📦 {m.stock} restantes</span>}
                       </div>
                     </div>
                     <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,flexShrink:0}}>
                       <span style={{fontSize:10,fontWeight:600,color:taken?T.green:T.dim}}>{taken?'✓ Hoy':'Pendiente'}</span>
                       <button onClick={()=>delMed(m.id)} style={{background:'none',border:'none',color:T.dim,cursor:'pointer',padding:2,display:'flex'}}><Icon name="trash" size={12}/></button>
                     </div>
                   </div>
                 );
               })}
             </div>
          }
        </div>
      )}

      {/* ══════════ ACTIVIDAD ══════════ */}
      {tab==='actividad'&&(
        <div>
          {/* Stats mes actual */}
          {workouts.length>0&&(()=>{
            const wMonth=workouts.filter(w=>w.date.slice(0,7)===thisMonth);
            const totalMin=wMonth.reduce((s,w)=>s+(w.duration||0),0);
            const totalCal=wMonth.reduce((s,w)=>s+(w.calories||0),0);
            return (
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:16}}>
                {[
                  {label:'Sesiones',val:wMonth.length,color:T.accent},
                  {label:'Minutos',  val:totalMin,     color:T.blue},
                  {label:'Calorías', val:totalCal,     color:T.orange},
                ].map(s=>(
                  <Card key={s.label} style={{textAlign:'center',padding:12}}>
                    <div style={{fontSize:11,color:T.muted,marginBottom:2}}>{s.label}</div>
                    <div style={{fontSize:20,fontWeight:700,color:s.color}}>{s.val.toLocaleString()}</div>
                  </Card>
                ))}
              </div>
            );
          })()}

          {workouts.length===0
            ?<div style={{textAlign:'center',padding:'40px 0',color:T.dim}}>
               <div style={{fontSize:36,marginBottom:8}}>🏃</div>
               <div style={{fontSize:14,marginBottom:12}}>Sin actividad registrada</div>
               <Btn size="sm" onClick={()=>setModalWorkout(true)}><Icon name="plus" size={13}/>Agregar</Btn>
             </div>
            :[...workouts].sort((a,b)=>b.date.localeCompare(a.date)).map(w=>(
              <div key={w.id} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,marginBottom:8,borderLeft:`3px solid ${T.orange}`}}>
                <div style={{width:40,height:40,borderRadius:12,background:`${T.orange}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>
                  {w.type==='Correr'?'🏃':w.type==='Ciclismo'?'🚴':w.type==='Natación'?'🏊':w.type==='Yoga'?'🧘':w.type==='HIIT'?'⚡':w.type==='Caminar'?'🚶':w.type==='Gym'?'🏋️':'⚽'}
                </div>
                <div style={{flex:1}}>
                  <div style={{color:T.text,fontSize:14,fontWeight:600}}>{w.type}</div>
                  <div style={{color:T.muted,fontSize:12,marginTop:2,display:'flex',gap:10,flexWrap:'wrap'}}>
                    <span>⏱ {w.duration} min</span>
                    {w.calories>0&&<span>🔥 {w.calories} kcal</span>}
                    {w.distance&&<span>📍 {w.distance} km</span>}
                  </div>
                  {w.note&&<div style={{color:T.dim,fontSize:11,marginTop:3}}>{w.note}</div>}
                </div>
                <div style={{textAlign:'right',flexShrink:0}}>
                  <div style={{color:T.dim,fontSize:12}}>{fmtDate(w.date)}</div>
                  <button onClick={()=>delWorkout(w.id)} style={{background:'none',border:'none',color:T.dim,cursor:'pointer',padding:4,display:'flex',marginTop:4}}><Icon name="trash" size={12}/></button>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* ══════════ MODALES ══════════ */}
      {modalMetric&&(
        <Modal title="Nueva métrica" onClose={()=>setModalMetric(false)}>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <Select value={metricForm.type} onChange={v=>setMetricForm(f=>({...f,type:v,unit:metricInfo(v).unit}))}>
              {METRIC_TYPES.map(mt=><option key={mt.id} value={mt.id}>{mt.icon} {mt.label}</option>)}
            </Select>
            <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:10}}>
              <Input value={metricForm.value} onChange={v=>setMetricForm(f=>({...f,value:v}))} placeholder="Valor" type="number"/>
              <Input value={metricForm.unit} onChange={v=>setMetricForm(f=>({...f,unit:v}))} placeholder="Unidad"/>
            </div>
            <Input value={metricForm.date} onChange={v=>setMetricForm(f=>({...f,date:v}))} type="date"/>
            <Input value={metricForm.note} onChange={v=>setMetricForm(f=>({...f,note:v}))} placeholder="Nota opcional"/>
          </div>
          <div style={{display:'flex',gap:10,marginTop:20}}>
            <Btn onClick={saveMetric} style={{flex:1,justifyContent:'center'}}>Guardar</Btn>
            <Btn variant="ghost" onClick={()=>setModalMetric(false)}>Cancelar</Btn>
          </div>
        </Modal>
      )}

      {modalMed&&(
        <Modal title="Nuevo medicamento" onClose={()=>setModalMed(false)}>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <Input value={medForm.name} onChange={v=>setMedForm(f=>({...f,name:v}))} placeholder="Nombre (ej: Vitamina D, Metformina...)"/>
            <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:10}}>
              <Input value={medForm.dose} onChange={v=>setMedForm(f=>({...f,dose:v}))} placeholder="Dosis" type="number"/>
              <Select value={medForm.unit} onChange={v=>setMedForm(f=>({...f,unit:v}))}>
                {['mg','mcg','mL','g','UI','gotas','tabletas'].map(u=><option key={u}>{u}</option>)}
              </Select>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <Select value={medForm.frequency} onChange={v=>setMedForm(f=>({...f,frequency:v}))}>
                {['diario','cada 8h','cada 12h','semanal','mensual','según necesidad'].map(fr=><option key={fr}>{fr}</option>)}
              </Select>
              <Input value={medForm.time} onChange={v=>setMedForm(f=>({...f,time:v}))} type="time"/>
            </div>
            <Input value={medForm.stock} onChange={v=>setMedForm(f=>({...f,stock:v}))} placeholder="Unidades en stock (opcional)" type="number"/>
          </div>
          <div style={{display:'flex',gap:10,marginTop:20}}>
            <Btn onClick={saveMed} style={{flex:1,justifyContent:'center'}}>Guardar</Btn>
            <Btn variant="ghost" onClick={()=>setModalMed(false)}>Cancelar</Btn>
          </div>
        </Modal>
      )}

      {modalWorkout&&(
        <Modal title="Nueva actividad" onClose={()=>setModalWorkout(false)}>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <Select value={workoutForm.type} onChange={v=>setWorkoutForm(f=>({...f,type:v}))}>
              {WORKOUT_TYPES.map(t=><option key={t}>{t}</option>)}
            </Select>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <Input value={workoutForm.duration} onChange={v=>setWorkoutForm(f=>({...f,duration:v}))} placeholder="Duración (min)" type="number"/>
              <Input value={workoutForm.calories} onChange={v=>setWorkoutForm(f=>({...f,calories:v}))} placeholder="Calorías" type="number"/>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <Input value={workoutForm.distance} onChange={v=>setWorkoutForm(f=>({...f,distance:v}))} placeholder="Distancia (km)"/>
              <Input value={workoutForm.date} onChange={v=>setWorkoutForm(f=>({...f,date:v}))} type="date"/>
            </div>
            <Input value={workoutForm.note} onChange={v=>setWorkoutForm(f=>({...f,note:v}))} placeholder="Nota (ej: PR en 5k, sesión intensa...)"/>
          </div>
          <div style={{display:'flex',gap:10,marginTop:20}}>
            <Btn onClick={saveWorkout} style={{flex:1,justifyContent:'center'}}>Guardar</Btn>
            <Btn variant="ghost" onClick={()=>setModalWorkout(false)}>Cancelar</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ===================== FINANCE =====================
const Finance = ({data,setData,isMobile}) => {
  const [modal,setModal]=useState(false);
  const [tab,setTab]=useState('movimientos'); // 'movimientos' | 'presupuesto'
  const [filter,setFilter]=useState('all'); // 'all'|'ingreso'|'egreso'
  const [monthFilter,setMonthFilter]=useState(today().slice(0,7));
  const [form,setForm]=useState({type:'egreso',amount:'',category:'',description:'',date:today(),currency:'MXN',areaId:''});

  const txs = data.transactions||[];
  const budgets = data.budget||[];

  // ── helpers ──
  const months = [...new Set(txs.map(t=>t.date.slice(0,7)))].sort((a,b)=>b.localeCompare(a));
  if(months.length>0 && !months.includes(monthFilter)) setMonthFilter(months[0]);

  const filtered = txs
    .filter(t=> monthFilter==='all' || t.date.slice(0,7)===monthFilter)
    .filter(t=> filter==='all' || t.type===filter)
    .sort((a,b)=>b.date.localeCompare(a.date));

  const allMonth = txs.filter(t=>t.date.slice(0,7)===monthFilter);
  const totalIngresos = allMonth.filter(t=>t.type==='ingreso').reduce((s,t)=>s+(t.amount||0),0);
  const totalEgresos  = allMonth.filter(t=>t.type==='egreso' ).reduce((s,t)=>s+(t.amount||0),0);
  const balance = totalIngresos - totalEgresos;
  const totalPresupuesto = budgets.reduce((s,b)=>s+(b.amount||0),0);

  // ── category breakdown ──
  const catBreakdown = {};
  allMonth.filter(t=>t.type==='egreso').forEach(t=>{
    const c=t.category||'Sin categoría';
    catBreakdown[c]=(catBreakdown[c]||0)+t.amount;
  });
  const catEntries = Object.entries(catBreakdown).sort((a,b)=>b[1]-a[1]);

  const CATS_EGRESO  = ['Comida','Transporte','Renta','Salud','Entretenimiento','Servicios','Ropa','Educación','Otros'];
  const CATS_INGRESO = ['Salario','Freelance','Inversiones','Ventas','Regalo','Otros'];

  const saveTx = () => {
    if(!form.amount||!form.description.trim()) return;
    const t={id:uid(),...form,amount:Number(form.amount),createdAt:today()};
    const upd=[t,...txs];
    setData(d=>({...d,transactions:upd}));
    save('transactions',upd);
    setModal(false);
    setForm({type:'egreso',amount:'',category:'',description:'',date:today(),currency:'MXN',areaId:''});
  };

  const delTx = (id) => {
    const upd=txs.filter(t=>t.id!==id);
    setData(d=>({...d,transactions:upd}));
    save('transactions',upd);
  };

  const delBudget = (id) => {
    const upd=budgets.filter(b=>b.id!==id);
    setData(d=>({...d,budget:upd}));
    save('budget',upd);
  };

  const fmtCurrency=(n)=>`$${Number(n).toLocaleString('es-MX',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
  const monthLabel=(m)=>{ try{ return new Date(m+'-02').toLocaleDateString('es-ES',{month:'long',year:'numeric'}); }catch{return m;} };

  return (
    <div>
      <PageHeader isMobile={isMobile}
        title="💰 Finanzas"
        subtitle="Control de ingresos, egresos y presupuesto"
        action={<Btn size="sm" onClick={()=>setModal(true)}><Icon name="plus" size={14}/>Nuevo</Btn>}
      />

      {/* ── Summary cards ── */}
      <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr 1fr':'repeat(4,1fr)',gap:10,marginBottom:20}}>
        {[
          {label:'Ingresos',val:totalIngresos,color:T.green,sign:'+'},
          {label:'Egresos',  val:totalEgresos, color:T.red,  sign:'-'},
          {label:'Balance',  val:balance,       color:balance>=0?T.green:T.red, sign:balance>=0?'+':'-'},
          {label:'Presupuesto/mes',val:totalPresupuesto,color:T.blue,sign:''},
        ].map(s=>(
          <Card key={s.label} style={{textAlign:'center',padding:14}}>
            <div style={{fontSize:11,color:T.muted,marginBottom:4}}>{s.label}</div>
            <div style={{fontSize:isMobile?16:20,fontWeight:700,color:s.color}}>{s.sign}{fmtCurrency(Math.abs(s.val))}</div>
            <div style={{fontSize:10,color:T.dim}}>{monthLabel(monthFilter)}</div>
          </Card>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div style={{display:'flex',gap:8,marginBottom:16}}>
        {[{id:'movimientos',label:'📋 Movimientos'},{id:'presupuesto',label:'📌 Presupuesto fijo'}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{padding:'7px 16px',borderRadius:10,border:`1px solid ${tab===t.id?T.accent:T.border}`,background:tab===t.id?`${T.accent}18`:'transparent',color:tab===t.id?T.accent:T.muted,cursor:'pointer',fontSize:13,fontWeight:tab===t.id?600:400,fontFamily:'inherit'}}>
            {t.label}
          </button>
        ))}
      </div>

      {tab==='movimientos'&&(
        <div>
          {/* ── Filters ── */}
          <div style={{display:'flex',gap:8,marginBottom:14,flexWrap:'wrap',alignItems:'center'}}>
            <select value={monthFilter} onChange={e=>setMonthFilter(e.target.value)}
              style={{background:T.bg,border:`1px solid ${T.border}`,color:T.text,padding:'6px 12px',borderRadius:10,fontSize:13,outline:'none',cursor:'pointer'}}>
              {months.length===0
                ?<option value={today().slice(0,7)}>{monthLabel(today().slice(0,7))}</option>
                :months.map(m=><option key={m} value={m}>{monthLabel(m)}</option>)
              }
            </select>
            {['all','ingreso','egreso'].map(f=>(
              <button key={f} onClick={()=>setFilter(f)}
                style={{padding:'6px 14px',borderRadius:10,border:`1px solid ${filter===f?(f==='egreso'?T.red:f==='ingreso'?T.green:T.accent):T.border}`,background:filter===f?(f==='egreso'?`${T.red}18`:f==='ingreso'?`${T.green}18`:`${T.accent}18`):'transparent',color:filter===f?(f==='egreso'?T.red:f==='ingreso'?T.green:T.accent):T.muted,cursor:'pointer',fontSize:12,fontWeight:filter===f?600:400,fontFamily:'inherit'}}>
                {f==='all'?'Todos':f==='ingreso'?'Ingresos':'Egresos'}
              </button>
            ))}
          </div>

          {/* ── Category bar chart ── */}
          {catEntries.length>0&&filter!=='ingreso'&&(
            <Card style={{marginBottom:16,padding:'14px 16px'}}>
              <div style={{fontSize:13,fontWeight:600,color:T.text,marginBottom:10}}>Distribución de egresos</div>
              {catEntries.map(([cat,amt],i)=>{
                const pct=totalEgresos>0?(amt/totalEgresos)*100:0;
                const color=T.areaColors[i%T.areaColors.length];
                return (
                  <div key={cat} style={{marginBottom:7}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                      <span style={{fontSize:12,color:T.muted}}>{cat}</span>
                      <span style={{fontSize:12,color:color,fontWeight:600}}>{fmtCurrency(amt)} <span style={{color:T.dim,fontWeight:400}}>({pct.toFixed(0)}%)</span></span>
                    </div>
                    <div style={{height:5,background:T.surface2,borderRadius:4,overflow:'hidden'}}>
                      <div style={{height:'100%',width:`${pct}%`,background:color,borderRadius:4,transition:'width 0.4s'}}/>
                    </div>
                  </div>
                );
              })}
            </Card>
          )}

          {/* ── Transaction list ── */}
          {filtered.length===0
            ?<div style={{textAlign:'center',padding:'40px 0',color:T.dim}}>
               <div style={{fontSize:32,marginBottom:8}}>💸</div>
               <div style={{fontSize:14,marginBottom:12}}>Sin movimientos</div>
               <Btn size="sm" onClick={()=>setModal(true)}><Icon name="plus" size={13}/>Agregar</Btn>
             </div>
            :filtered.map(t=>(
              <div key={t.id} style={{display:'flex',alignItems:'center',gap:10,padding:'12px 14px',background:T.surface,border:`1px solid ${T.border}`,borderRadius:11,marginBottom:8,borderLeft:`3px solid ${t.type==='ingreso'?T.green:T.red}`}}>
                <div style={{width:36,height:36,borderRadius:10,background:t.type==='ingreso'?`${T.green}18`:`${T.red}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>
                  {t.type==='ingreso'?'📈':'📉'}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{color:T.text,fontSize:13,fontWeight:500}}>{t.description}</div>
                  <div style={{color:T.muted,fontSize:11,marginTop:2,display:'flex',gap:6,flexWrap:'wrap'}}>
                    {t.category&&<span style={{background:`${T.accent}15`,color:T.accent,padding:'1px 6px',borderRadius:6}}>{t.category}</span>}
                    <span>{fmt(t.date)}</span>
                    {t.currency&&t.currency!=='MXN'&&<span>{t.currency}</span>}
                  </div>
                </div>
                <div style={{textAlign:'right',flexShrink:0}}>
                  <div style={{fontSize:15,fontWeight:700,color:t.type==='ingreso'?T.green:T.red}}>
                    {t.type==='ingreso'?'+':'-'}{fmtCurrency(t.amount)}
                  </div>
                </div>
                <button onClick={()=>delTx(t.id)} style={{background:'none',border:'none',color:T.dim,cursor:'pointer',padding:4,display:'flex',flexShrink:0}}><Icon name="trash" size={13}/></button>
              </div>
            ))
          }
        </div>
      )}

      {tab==='presupuesto'&&(
        <div>
          <p style={{color:T.muted,fontSize:13,marginBottom:14}}>Gastos fijos recurrentes que salen cada mes.</p>
          {budgets.length===0
            ?<div style={{textAlign:'center',padding:'40px 0',color:T.dim}}>
               <div style={{fontSize:32,marginBottom:8}}>📌</div>
               <div style={{fontSize:14}}>Sin presupuesto fijo registrado</div>
             </div>
            :budgets.map(b=>(
              <div key={b.id} style={{display:'flex',alignItems:'center',gap:10,padding:'12px 14px',background:T.surface,border:`1px solid ${T.border}`,borderRadius:11,marginBottom:8,borderLeft:`3px solid ${T.blue}`}}>
                <div style={{width:36,height:36,borderRadius:10,background:`${T.blue}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>💳</div>
                <div style={{flex:1}}>
                  <div style={{color:T.text,fontSize:13,fontWeight:500}}>{b.title}</div>
                  <div style={{color:T.muted,fontSize:11,marginTop:2}}>Día {b.dayOfMonth} de cada mes · {b.currency||'MXN'}</div>
                </div>
                <div style={{color:T.blue,fontWeight:700,fontSize:15,flexShrink:0}}>{fmtCurrency(b.amount)}</div>
                <button onClick={()=>delBudget(b.id)} style={{background:'none',border:'none',color:T.dim,cursor:'pointer',padding:4,display:'flex'}}><Icon name="trash" size={13}/></button>
              </div>
            ))
          }
          <div style={{marginTop:12,padding:'12px 14px',background:`${T.blue}10`,border:`1px solid ${T.blue}30`,borderRadius:11}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{color:T.muted,fontSize:13}}>Total mensual fijo</span>
              <span style={{color:T.blue,fontWeight:700,fontSize:16}}>{fmtCurrency(totalPresupuesto)}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: nuevo movimiento ── */}
      {modal&&(
        <Modal title="Nuevo movimiento" onClose={()=>setModal(false)}>
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
        </Modal>
      )}
    </div>
  );
};


export default function App() {
  const [view,setView]=useState('dashboard');
  const [viewHint,setViewHint]=useState(null);
  const [data,setData]=useState(null);
  const [showMore,setShowMore]=useState(false);
  const [showSearch,setShowSearch]=useState(false);
  const [apiKey,setApiKey]=useState(()=>localStorage.getItem('sb_gemini_key')||'');
  const isMobile=useIsMobile();

  // ── Emoji favicon ──
  useEffect(()=>{
    const canvas=document.createElement('canvas');
    canvas.width=64; canvas.height=64;
    const ctx=canvas.getContext('2d');
    ctx.font='52px serif';
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.fillText('🧠',32,36);
    const link=document.querySelector("link[rel~='icon']")||document.createElement('link');
    link.rel='icon'; link.href=canvas.toDataURL();
    document.head.appendChild(link);
    document.title='Segundo Cerebro';
  },[]);

  // Smart navigate: sets view + optional hint for target component
  const navigate=(v,hint=null)=>{setView(v);setViewHint(hint);};
  // Nav bar navigate: clears any hint
  const navTo=(v)=>{setView(v);setViewHint(null);};

  useEffect(()=>{
    (async()=>{
      const def=initData();
      const [areas,objectives,projects,tasks,notes,inbox,habits,budget,transactions,healthMetrics,medications,workouts,maintenances,homeDocs,homeContacts,learnings,retros,ideas,people,followUps,interactions,sideProjects,spTasks,milestones,journal,books,shopping,education]=await Promise.all([
        load('areas',def.areas),load('objectives',def.objectives),load('projects',def.projects),
        load('tasks',def.tasks),load('notes',def.notes),load('inbox',def.inbox),load('habits',def.habits),load('budget',def.budget),
        load('transactions',def.transactions),
        load('healthMetrics',def.healthMetrics),load('medications',def.medications),load('workouts',def.workouts),
        load('maintenances',def.maintenances),load('homeDocs',def.homeDocs),load('homeContacts',def.homeContacts),
        load('learnings',def.learnings),load('retros',def.retros),load('ideas',def.ideas),
        load('people',def.people),load('followUps',def.followUps),load('interactions',def.interactions),
        load('sideProjects',def.sideProjects),load('spTasks',def.spTasks),load('milestones',def.milestones),
        load('journal',def.journal),load('books',def.books),load('shopping',def.shopping),load('education',def.education),
      ]);
      setData({areas,objectives,projects,tasks,notes,inbox,habits,budget,transactions,healthMetrics,medications,workouts,maintenances,homeDocs,homeContacts,learnings,retros,ideas,people,followUps,interactions,sideProjects,spTasks,milestones,journal,books,shopping,education});
    })();
  },[]);

  if(!data) return (
    <div style={{background:T.bg,height:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:T.muted,fontFamily:'system-ui',gap:16}}>
      <div style={{fontSize:48}}>🧠</div><div>Cargando tu Segundo Cerebro...</div>
    </div>
  );

  const inboxCount=data.inbox.filter(i=>!i.processed).length;
  const props={data,setData,isMobile};
  const views={
    dashboard:<Dashboard {...props} onNavigate={navigate}/>,
    areas:<Areas {...props} onNavigate={navigate}/>,
    areaDetail:<AreaDetail {...props} viewHint={viewHint} onConsumeHint={()=>setViewHint(null)} onNavigate={navigate}/>,
    objectives:<Objectives {...props} viewHint={viewHint} onConsumeHint={()=>setViewHint(null)} onNavigate={navigate}/>,
    projects:<ProjectsAndTasks {...props} viewHint={viewHint} onConsumeHint={()=>setViewHint(null)} onNavigate={navigate}/>,
    notes:<Notes {...props} viewHint={viewHint} onConsumeHint={()=>setViewHint(null)}/>,
    finance:<Finance {...props}/>,
    inbox:<Inbox {...props}/>,
    habits:<HabitTracker {...props}/>,
    journal:<Journal {...props}/>,
    books:<Books {...props}/>,
    shopping:<Shopping {...props}/>,
    education:<Education {...props}/>,
    settings:<Settings apiKey={apiKey} setApiKey={setApiKey} isMobile={isMobile}/>,
  };
  const isMoreActive=MORE_NAV.some(n=>n.id===view);

  return (
    <div style={{display:'flex',flexDirection:isMobile?'column':'row',height:'100dvh',width:'100%',background:T.bg,fontFamily:"'DM Sans',system-ui,sans-serif",color:T.text,overflow:'hidden',position:'fixed',inset:0}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap');
        html,body,#root{margin:0;padding:0;width:100%;height:100%;background:#090e13;}
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
        ::-webkit-scrollbar{width:5px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:${T.border};border-radius:3px;}
        input[type=date]::-webkit-calendar-picker-indicator{filter:invert(0.5);}
        select option{background:${T.surface};}
      `}</style>

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
          <nav style={{flex:1,padding:'12px 8px',overflowY:'auto'}}>
            {NAV.map(item=>{
              const active=view===item.id;
              const badge=item.id==='inbox'&&inboxCount>0?inboxCount:null;
              return (
                <button key={item.id} onClick={()=>navTo(item.id)}
                  style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'9px 12px',borderRadius:9,border:'none',cursor:'pointer',textAlign:'left',fontFamily:'inherit',fontSize:13,fontWeight:active?600:400,
                    background:active?`${T.accent}18`:'transparent',color:active?T.accent:T.muted,marginBottom:2,transition:'all 0.15s'}}>
                  <Icon name={item.icon} size={16} color={active?T.accent:undefined}/>
                  <span style={{flex:1}}>{item.label}</span>
                  {badge&&<span style={{background:T.red,color:'#fff',fontSize:10,fontWeight:700,padding:'1px 6px',borderRadius:10}}>{badge}</span>}
                </button>
              );
            })}
          </nav>
          <div style={{padding:'12px 16px',borderTop:`1px solid ${T.border}`,display:'flex',flexDirection:'column',gap:6}}>
            <button onClick={()=>setShowSearch(true)} style={{display:'flex',alignItems:'center',gap:8,background:'transparent',border:`1px solid ${T.border}`,borderRadius:8,padding:'6px 10px',cursor:'pointer',color:T.muted,fontSize:12,fontFamily:'inherit',width:'100%',marginBottom:4}}>
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
          <button onClick={()=>setShowSearch(true)} style={{background:'none',border:`1px solid ${T.border}`,borderRadius:8,padding:'3px 10px',cursor:'pointer',color:T.muted,fontSize:11,fontWeight:600,display:'flex',alignItems:'center',gap:4}}>🔍</button>
          <button onClick={()=>navTo('settings')} style={{background:'none',border:`1px solid ${apiKey?T.green:T.red}`,borderRadius:8,padding:'3px 10px',cursor:'pointer',color:apiKey?T.green:T.red,fontSize:11,fontWeight:600,display:'flex',alignItems:'center',gap:4}}>
            <span style={{width:6,height:6,borderRadius:'50%',background:apiKey?T.green:T.red,display:'inline-block'}}/>
            {apiKey?'IA ON':'IA OFF'}
          </button>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main style={{flex:1,overflowY:'auto',padding:isMobile?'16px 16px 90px':'28px',minHeight:0}}>
        {views[view]}
      </main>

      {/* MOBILE BOTTOM NAV */}
      {isMobile&&(
        <>
          {/* More drawer */}
          {showMore&&(
            <div style={{position:'fixed',inset:0,zIndex:90}} onClick={()=>setShowMore(false)}>
              <div style={{position:'absolute',bottom:65,left:0,right:0,background:T.surface,borderTop:`1px solid ${T.border}`,padding:16,display:'flex',gap:8,flexWrap:'wrap',justifyContent:'center'}}
                onClick={e=>e.stopPropagation()}>
                {MORE_NAV.map(item=>(
                  <button key={item.id} onClick={()=>{navTo(item.id);setShowMore(false);}}
                    style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,padding:'10px 20px',borderRadius:10,border:`1px solid ${view===item.id?T.accent:T.border}`,background:view===item.id?`${T.accent}18`:'transparent',cursor:'pointer',color:view===item.id?T.accent:T.muted,fontFamily:'inherit',minWidth:70}}>
                    <Icon name={item.icon} size={22} color={view===item.id?T.accent:undefined}/>
                    <span style={{fontSize:11,fontWeight:view===item.id?600:400}}>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div style={{position:'fixed',bottom:0,left:0,right:0,background:T.surface,borderTop:`1px solid ${T.border}`,display:'flex',zIndex:50,paddingBottom:'env(safe-area-inset-bottom)'}}>
            {MOBILE_NAV.map(item=>{
              const active=view===item.id;
              const badge=item.id==='inbox'&&inboxCount>0?inboxCount:null;
              return (
                <button key={item.id} onClick={()=>navTo(item.id)}
                  style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'10px 4px 8px',border:'none',cursor:'pointer',background:'transparent',color:active?T.accent:T.dim,fontFamily:'inherit',position:'relative',gap:3}}>
                  <Icon name={item.icon} size={22} color={active?T.accent:undefined}/>
                  <span style={{fontSize:10,fontWeight:active?600:400}}>{item.label}</span>
                  {badge&&<span style={{position:'absolute',top:6,right:'50%',marginRight:-18,background:T.red,color:'#fff',fontSize:9,fontWeight:700,padding:'1px 5px',borderRadius:10}}>{badge}</span>}
                </button>
              );
            })}
            <button onClick={()=>setShowMore(!showMore)}
              style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'10px 4px 8px',border:'none',cursor:'pointer',background:'transparent',color:isMoreActive||showMore?T.accent:T.dim,fontFamily:'inherit',gap:3}}>
              <Icon name="menu" size={22} color={isMoreActive||showMore?T.accent:undefined}/>
              <span style={{fontSize:10,fontWeight:isMoreActive||showMore?600:400}}>{isMoreActive?NAV.find(n=>n.id===view)?.label:'Más'}</span>
            </button>
          </div>
        </>
      )}

      {/* GLOBAL SEARCH OVERLAY */}
      {showSearch&&data&&<GlobalSearch data={data} onNavigate={(v,h)=>{navigate(v,h);}} onClose={()=>setShowSearch(false)}/>}

      {/* PSICKE — FLOATING BUBBLE */}
      <Psicke apiKey={apiKey} onGoSettings={()=>navTo('settings')} data={data} setData={setData}/>

    </div>
  );
}
