import { useState, useEffect, useRef, useCallback } from "react";

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
  ],
  objectives:[{id:uid(),title:'Correr una maratón',areaId:'',deadline:'2025-12-31',status:'active'}],
  projects:[],tasks:[],
  notes:[{id:uid(),title:'Cómo funciona el Segundo Cerebro',content:'El Segundo Cerebro es un sistema para externalizar nuestra memoria y liberar carga cognitiva. Basado en el método de Tiago Forte: Áreas → Objetivos → Proyectos → Tareas.',tags:['productividad','sistema'],areaId:'',createdAt:today()}],
  inbox:[{id:uid(),content:'Revisar el sistema de Segundo Cerebro',createdAt:today(),processed:false}],
  habits:[
    {id:uid(),name:'Meditar 10 min',frequency:'daily',completions:[]},
    {id:uid(),name:'Leer 30 min',frequency:'daily',completions:[]},
    {id:uid(),name:'Ejercicio',frequency:'daily',completions:[]},
  ],
  budget:[],
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
      <h2 style={{color:T.text,marginTop:0,fontSize:isMobile?20:24,fontWeight:700,marginBottom:2}}>Buenos días 🧠</h2>
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
  const del=(id)=>{const u=data.areas.filter(a=>a.id!==id);setData(d=>({...d,areas:u}));save('areas',u);};
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
              return (
                <Card key={o.id} style={{marginBottom:10,opacity:status==='done'?0.6:1,cursor:'pointer'}}
                  onClick={()=>onNavigate&&onNavigate('projects',`obj:${o.id}`)}>
                  <div style={{display:'flex',alignItems:'flex-start',gap:12}}>
                    <button onClick={e=>{e.stopPropagation();toggle(o.id);}} style={{width:24,height:24,borderRadius:'50%',border:`2px solid ${status==='done'?T.green:T.border}`,background:status==='done'?T.green:'transparent',cursor:'pointer',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',marginTop:2}}>
                      {status==='done'&&<Icon name="check" size={12} color="#000"/>}
                    </button>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{color:T.text,fontWeight:600,fontSize:14,textDecoration:status==='done'?'line-through':'none',marginBottom:6}}>{o.title}</div>
                      <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
                        {area&&<Tag text={`${area.icon} ${area.name}`} color={area.color}/>}
                        {o.deadline&&<span style={{color:T.muted,fontSize:12}}>📅 {fmt(o.deadline)}</span>}
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
const ProjectsAndTasks = ({data,setData,isMobile,viewHint,onConsumeHint}) => {
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
  const toggleTask=(id)=>{const u=data.tasks.map(t=>t.id===id?{...t,status:t.status==='done'?'todo':'done'}:t);setData(d=>({...d,tasks:u}));save('tasks',u);};
  const delTask=(id)=>{const u=data.tasks.filter(t=>t.id!==id);setData(d=>({...d,tasks:u}));save('tasks',u);};
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
              <div key={t.id} style={{display:'flex',alignItems:'center',gap:10,padding:'12px 14px',background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,marginBottom:8,opacity:st==='done'?0.6:1}}>
                <button onClick={()=>toggleTask(t.id)} style={{width:22,height:22,borderRadius:'50%',border:`2px solid ${st==='done'?T.green:T.border}`,background:st==='done'?T.green:'transparent',cursor:'pointer',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
                  {st==='done'&&<Icon name="check" size={11} color="#000"/>}
                </button>
                <div style={{width:8,height:8,borderRadius:'50%',background:pColors[t.priority]||T.muted,flexShrink:0}}/>
                <span style={{color:T.text,fontSize:14,flex:1,textDecoration:st==='done'?'line-through':'none'}}>{t.title}</span>
                {t.dueDate&&<span style={{color:T.muted,fontSize:11}}>{fmt(t.dueDate)}</span>}
                <button onClick={()=>delTask(t.id)} style={{background:'none',border:'none',color:T.dim,cursor:'pointer',display:'flex',padding:4}}><Icon name="trash" size={14}/></button>
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
    const updated=[...data.notes,n];
    setData(d=>({...d,notes:updated}));save('notes',updated);
    setModal(false);setForm({title:'',content:'',tags:'',areaId:''});
    setSel(n);if(isMobile)setShowNote(true);
  };
  const del=(id)=>{
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
      {isMobile&&<button onClick={()=>setShowNote(false)} style={{display:'flex',alignItems:'center',gap:6,background:'none',border:'none',color:T.muted,cursor:'pointer',marginBottom:16,fontSize:14,padding:0}}><Icon name="back" size={18}/>Notas</button>}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
        <h3 style={{margin:0,color:T.text,fontSize:18,fontWeight:700,flex:1}}>{sel?.title}</h3>
        <button onClick={()=>del(sel.id)} style={{background:'none',border:'none',color:T.red,cursor:'pointer',display:'flex',padding:4}}><Icon name="trash" size={16}/></button>
      </div>
      <div style={{display:'flex',gap:6,marginBottom:16,flexWrap:'wrap'}}>
        {sel?.tags?.map(t=><Tag key={t} text={t}/>)}
        {sel?.areaId&&(()=>{const a=data.areas.find(x=>x.id===sel.areaId);return a?<Tag text={`${a.icon} ${a.name}`} color={a.color}/>:null;})()}
        {sel?.amount&&<Tag text={`💰 $${sel.amount} ${sel.currency||'MXN'}`} color={T.green}/>}
        <span style={{color:T.dim,fontSize:12,alignSelf:'center'}}>{fmt(sel?.createdAt)}</span>
      </div>
      <p style={{color:T.text,fontSize:15,lineHeight:1.8,whiteSpace:'pre-wrap',margin:0}}>{sel?.content}</p>
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
    const updN=[...data.notes,n];
    const updI=data.inbox.map(i=>i.id===item.id?{...i,processed:true}:i);
    setData(d=>({...d,notes:updN,inbox:updI}));save('notes',updN);save('inbox',updI);
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
                <Btn size="sm" variant="ghost" onClick={()=>convertToNote(i)}>→ Nota</Btn>
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
  const [form,setForm]=useState({name:'',frequency:'daily'});
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
    setModal(false);setForm({name:'',frequency:'daily'});
  };
  const del=(id)=>{const u=data.habits.filter(h=>h.id!==id);setData(d=>({...d,habits:u}));save('habits',u);};
  const todayStr=today();

  // Compute stats
  const streaks=data.habits.map(h=>{
    let s=0,d=new Date();
    const ld=()=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    while(h.completions.includes(ld())){s++;d.setDate(d.getDate()-1);}
    return {name:h.name,streak:s};
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
            <div style={{fontSize:10,color:T.dim,marginTop:4}}>{streaks.find(s=>s.streak===bestStreak)?.name||''}</div>
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
          const streak=streaks.find(s=>s.name===h.name)?.streak||0;
          const weekDone=weekDates.filter(d=>h.completions.includes(d)).length;
          return (
            <div key={h.id} style={{display:'grid',gridTemplateColumns:`${nameColW} repeat(${numDays},1fr)`,borderBottom:`1px solid ${T.border}`}}>
              <div style={{padding:'12px 10px 12px 14px',display:'flex',alignItems:'center',gap:6}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{color:T.text,fontSize:12,fontWeight:500,lineHeight:1.3,wordBreak:'break-word'}}>{h.name}</div>
                  <div style={{display:'flex',gap:6,marginTop:2}}>
                    {streak>0&&<span style={{color:T.accent,fontSize:10}}>🔥 {streak}d</span>}
                    <span style={{color:weekDone>=5?T.green:T.dim,fontSize:10}}>{weekDone}/7 sem</span>
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
  const notesSummary=data.notes.slice(0,8).map(n=>{
    let s=`• ${n.title.slice(0,40)}`;
    if(n.amount)s+=` $${n.amount}`;
    if(n.tags?.length)s+=` [${n.tags.slice(0,2).join(',')}]`;
    return s;
  }).join('\n');
  const tasksPending=data.tasks.filter(t=>t.status==='todo');
  const tasksSummary=tasksPending.slice(0,6).map(t=>`• ${t.title.slice(0,40)}${t.deadline?' ('+t.deadline+')':''}`).join('\n');
  const inboxPending=data.inbox.filter(i=>!i.processed);
  const habitNames=data.habits.map(h=>h.name).join(', ');
  const areaNames=data.areas.map(a=>`${a.icon} ${a.name}`).join(', ');
  const areaMap=data.areas.map(a=>`"${a.name}" → "${a.id}"`).join(', ');
  const objectives=data.objectives.filter(o=>o.status==='active').map(o=>`• ${o.title}`).join('\n');

  // Collect existing tags for consistency
  const allTags=[...new Set(data.notes.flatMap(n=>n.tags||[]))].slice(0,15);
  const tagList=allTags.length?allTags.join(', '):'(sin tags aún)';

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
- Empática cuando el momento lo amerita — si alguien está overwhelmed o stressed, lo notas y bajas el tono.
- Tienes humor seco, subtle. No forzado.
- Hablas principalmente en español. Puedes usar algún anglicismo natural — "eso está heavy", "that's the move".
- SIEMPRE tratas de USTED. Nunca tutees. Di "usted", "su", "le", nunca "tú" ni "tu".
- NUNCA digas "como asistente de IA" ni nada corporate. Eres Psicke, punto.

═══ DATOS ACTUALES DEL USUARIO ═══
Áreas: ${areaNames || 'Ninguna'}
Mapa de áreas (nombre → id): ${areaMap || 'sin áreas'}

Objetivos activos:
${objectives || '(sin objetivos)'}

Tareas pendientes (${tasksPending.length}):
${tasksSummary || '(sin tareas)'}

Notas recientes (con montos y tags):
${notesSummary || '(sin notas)'}

Tags existentes: ${tagList}
Inbox sin procesar: ${inboxPending.length} items
Hábitos: ${habitNames || '(sin hábitos)'}

Presupuesto fijo (gastos recurrentes):
${data.budget?.length?data.budget.map(b=>`• ${b.title}: $${b.amount} ${b.currency||'MXN'} — día ${b.dayOfMonth} de cada mes`).join('\n'):'(sin presupuesto aún)'}

╔═══════════════════════════════════════════════════╗
║   PROTOCOLO DE RAZONAMIENTO INTERNO OBLIGATORIO   ║
║                                                   ║
║  FORMATO OBLIGATORIO DE CADA RESPUESTA:           ║
║  <pensamiento>                                    ║
║    [razonamiento interno paso a paso]             ║
║  </pensamiento>                                   ║
║  [respuesta visible al usuario]                   ║
║                                                   ║
║  Las etiquetas <pensamiento> se eliminan          ║
║  automáticamente — el usuario NO las ve.          ║
║  SIEMPRE empieza con <pensamiento>.               ║
╚═══════════════════════════════════════════════════╝

PASO I — TIPO DE ENTRADA
¿Qué tipo de mensaje es este?

  A) CONSULTA — El usuario pregunta, pide un resumen, o quiere conversar.
     → Ir directo a PASO V (responder).

  B) CAPTURA — El usuario comparte información, quiere guardar algo, o expresa
     una intención de lograr/hacer algo.
     → Continuar a PASO II.

──────────────────────────────────────────────────────
PASO II — ÁREA (solo si es CAPTURA)
¿A qué área de la vida del usuario pertenece esta información?
Áreas disponibles: ${areaNames || '(sin áreas)'}

  → Mapea mentalmente la captura a un área existente.
  → Si no encaja claramente en ninguna, marca areaId = "".
  → Continuar a PASO III.

──────────────────────────────────────────────────────
PASO III — NIVEL JERÁRQUICO (método Tiago Forte)
¿Dónde encaja esta captura dentro de la jerarquía?

  1. ¿Es una META DE VIDA con resultado medible y fecha límite?
     → Nivel: OBJETIVO
     → Ejemplos: "quiero bajar 5kg", "lograr $50k de ingreso mensual", "aprender inglés"
     → Ir a PASO IV-PLAN

  2. ¿Es un CONJUNTO DE ACCIONES con inicio y fin para lograr algo?
     → Nivel: PROYECTO
     → Ejemplos: "renovar la cocina", "lanzar el sitio web", "preparar la presentación"
     → Ir a PASO IV-PLAN

  3. ¿Es una ACCIÓN ÚNICA y concreta que debe hacerse?
     → Nivel: TAREA
     → Ejemplos: "llamar al mecánico", "pagar la renta", "mandar el reporte"
     → Acción: SAVE_TASK → Ir a PASO IV-SIMPLE

  4. ¿Es una ACCIÓN RECURRENTE que quiere repetir con frecuencia?
     → Nivel: HÁBITO
     → Ejemplos: "meditar cada día", "leer 30 min", "hacer ejercicio"
     → Acción: SAVE_HABIT → Ir a PASO IV-SIMPLE

  5. ¿Es un GASTO FIJO que se repite cada mes?
     → Nivel: PRESUPUESTO
     → Ejemplos: "pago mensual de internet $500", "renta $8000 cada 1ro"
     → Acción: SAVE_BUDGET → Ir a PASO IV-SIMPLE

  6. ¿Es INFORMACIÓN, DATO, REGISTRO, GASTO ÚNICO, EXPERIENCIA, APRENDIZAJE o REFERENCIA?
     → Nivel: NOTA
     → Ejemplos: gastos, mediciones, ideas, aprendizajes, info de clientes, mantenimientos
     → Acción: SAVE_NOTE → Ir a PASO IV-SIMPLE

  7. ¿No encaja en ninguno de los anteriores y es demasiado ambiguo?
     → Nivel: INBOX (último recurso absoluto)
     → Acción: SAVE_INBOX → Ir a PASO IV-SIMPLE

──────────────────────────────────────────────────────
PASO IV-PLAN — FLUJO PARA OBJETIVOS Y PROYECTOS GRANDES
(Solo aplica si el nivel es OBJETIVO o PROYECTO)

  ETAPA A — ¿Tengo suficiente información para armar un plan completo?
  Necesito saber: meta concreta (número/resultado), plazo estimado, y cómo piensa lograrlo.

    SÍ tengo todo → Saltar a ETAPA C.
    NO tengo todo → Ejecutar ETAPA B.

  ETAPA B — INDAGAR (el usuario ve esto)
  Hacer 1-2 preguntas clave en tono conversacional, no como interrogatorio.
  Máximo 2 preguntas por mensaje. Esperar respuesta. Volver a ETAPA A.

  ETAPA C — CONFIRMAR (el usuario ve esto)
  Presentar un resumen breve del plan propuesto y preguntar si le parece bien.
  NO generar JSON todavía. Esperar confirmación.

  ETAPA D — GENERAR (solo con confirmación explícita del usuario)
  Generar SAVE_PLAN con: área + objetivo + proyecto + tareas accionables + hábitos recurrentes.
  → Ir a PASO V.

──────────────────────────────────────────────────────
PASO IV-SIMPLE — FLUJO PARA CAPTURAS INDIVIDUALES
(Aplica para TAREA, HÁBITO, PRESUPUESTO, NOTA, INBOX)

  ¿Tengo TODOS los datos necesarios para guardar correctamente?

    SÍ → Generar el JSON correspondiente e ir a PASO V.
    NO → Hacer UNA pregunta puntual para obtener el dato faltante. Esperar. Volver.

  REGLAS DE CALIDAD antes de generar:
  - TAGS: Reutilizar tags existentes: ${tagList}. No crear duplicados semánticos.
  - MONTOS: Si hay cualquier cantidad de dinero → incluir amount + currency siempre.
  - ÁREA: Usar el id exacto del mapa de áreas. Si no hay match, dejar areaId = "".
  - TÍTULO: Descriptivo y específico. "Servicio coche 73,000km — $3,400" > "Mantenimiento".
  - CONTENIDO: Incluir todo el contexto que el usuario dio (cantidades, fechas, lugares, detalles).

──────────────────────────────────────────────────────
PASO V — RESPONDER AL USUARIO
Cierra el bloque </pensamiento> y escribe la respuesta visible. Estructura exacta:

  <pensamiento>
    [todo el razonamiento de los pasos anteriores]
  </pensamiento>
  [respuesta conversacional al usuario, máx 2-3 oraciones excepto planes]
  [bloque JSON si aplica, siempre AL FINAL]

  Reglas:
  - El texto conversacional va FUERA de <pensamiento>, ANTES del JSON.
  - JSON de acción SIEMPRE al final, nunca en medio del texto.
  - Solo UN bloque JSON por mensaje.
  - NUNCA mencionar ni resumir el proceso interno al usuario.
  - NUNCA inventar datos que el usuario no proporcionó.
  - NUNCA tutear. Siempre de usted.

╔═══════════════════════════════════════════════════╗
║              FORMATOS DE GUARDADO                 ║
╚═══════════════════════════════════════════════════╝

Nota con monto: \`\`\`json
{"action":"SAVE_NOTE","data":{"title":"Gas LP coche — 5L","content":"5 litros de gas LP a $10/L. Total: $50","tags":["auto","gastos","combustible"],"area":"Finanzas","amount":50,"currency":"MXN"}}
\`\`\`

Nota sin monto: \`\`\`json
{"action":"SAVE_NOTE","data":{"title":"Cliente prefiere entregas lunes","content":"El cliente mencionó que prefiere recibir entregas los lunes temprano","tags":["clientes","entregas"],"area":"Trabajo"}}
\`\`\`

Tarea: \`\`\`json
{"action":"SAVE_TASK","data":{"title":"Llamar al mecánico por frenos","priority":"alta"}}
\`\`\`

Hábito: \`\`\`json
{"action":"SAVE_HABIT","data":{"name":"Caminar 30 min","frequency":"daily"}}
\`\`\`

Presupuesto: \`\`\`json
{"action":"SAVE_BUDGET","data":{"title":"Escuela","amount":1500,"currency":"MXN","dayOfMonth":9,"area":"Finanzas"}}
\`\`\`

Inbox (solo si es genuinamente ambiguo): \`\`\`json
{"action":"SAVE_INBOX","data":{"content":"captura rápida"}}
\`\`\`

Plan completo (solo tras confirmación): \`\`\`json
{"action":"SAVE_PLAN","data":{
  "area":"Salud",
  "objective":{"title":"Bajar 5kg","deadline":"2026-06-01"},
  "project":{"title":"Plan fitness y alimentación"},
  "tasks":[
    {"title":"Investigar dieta balanceada","priority":"alta"},
    {"title":"Armar menú semanal","priority":"alta"},
    {"title":"Inscribirme al gym","priority":"media"},
    {"title":"Comprar báscula","priority":"baja"}
  ],
  "habits":[
    {"name":"Ejercicio 30 min","frequency":"daily"},
    {"name":"Tomar 2L de agua","frequency":"daily"},
    {"name":"Pesarme","frequency":"weekly"}
  ]
}}
\`\`\`

Reglas del plan:
- "area" debe ser una de: ${areaNames || '(sin áreas)'}
- Tareas: 3-8, accionables y concretas.
- Hábitos: 1-4, acciones recurrentes reales.
- NUNCA generar sin confirmación explícita del usuario.

═══ CONSULTAS SOBRE DATOS ═══
Si el usuario pregunta por gastos, notas, tareas, hábitos o cualquier dato:
- Responder con números concretos tomados de los datos actuales.
- Si hay montos, sumar y presentar el total claramente.
- Agrupar por tags o área cuando sea relevante.`;
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
        if(action.action==='SAVE_PLAN'&&action.data.objective){
          // Create full connected plan: area match → objective → project → tasks + habits
          const plan=action.data;
          const matchedArea=data.areas.find(a=>a.name.toLowerCase()===plan.area?.toLowerCase());
          const areaId=matchedArea?.id||'';

          const objId=uid();
          const newObj={id:objId,title:plan.objective.title,areaId,deadline:plan.objective.deadline||'',status:'active'};

          const projId=uid();
          const newProj={id:projId,title:plan.project?.title||plan.objective.title,objectiveId:objId,areaId,status:'active'};

          const newTasks=(plan.tasks||[]).map(t=>({id:uid(),title:t.title,projectId:projId,status:'todo',priority:t.priority||'media',dueDate:t.dueDate||''}));

          const newHabits=(plan.habits||[]).map(h=>({id:uid(),name:h.name,frequency:h.frequency||'daily',completions:[]}));

          const updObj=[newObj,...data.objectives];
          const updProj=[newProj,...data.projects];
          const updTasks=[...newTasks,...data.tasks];
          const updHabits=[...newHabits,...data.habits];

          setData(d=>({...d,objectives:updObj,projects:updProj,tasks:updTasks,habits:updHabits}));
          save('objectives',updObj);save('projects',updProj);save('tasks',updTasks);save('habits',updHabits);

          const summary=[];
          summary.push(`🎯 Objetivo: ${newObj.title}`);
          summary.push(`📁 Proyecto: ${newProj.title}`);
          summary.push(`📋 ${newTasks.length} tareas`);
          if(newHabits.length)summary.push(`🔁 ${newHabits.length} hábitos`);
          savedLabel='🗺️ Plan creado\n'+summary.join(' · ');
        }else if(action.action==='SAVE_TASK'&&action.data.title){
          const t={id:uid(),title:action.data.title,projectId:'',status:'todo',deadline:action.data.deadline||''};
          const upd=[t,...data.tasks];
          setData(d=>({...d,tasks:upd}));save('tasks',upd);
          savedLabel='📋 Tarea guardada';
        }else if(action.action==='SAVE_NOTE'&&action.data.title){
          // Resolve areaId: use explicit id, or match by name, or leave empty
          let resolvedAreaId = action.data.areaId || '';
          if(!resolvedAreaId && action.data.area){
            const match = data.areas.find(a=>a.name.toLowerCase()===action.data.area?.toLowerCase());
            resolvedAreaId = match?.id || '';
          }
          const areaLabel = resolvedAreaId ? data.areas.find(a=>a.id===resolvedAreaId) : null;
          const n={id:uid(),title:action.data.title,content:action.data.content||'',tags:action.data.tags||[],areaId:resolvedAreaId,createdAt:td,
            ...(action.data.amount?{amount:Number(action.data.amount),currency:action.data.currency||'MXN'}:{})};
          const upd=[n,...data.notes];
          setData(d=>({...d,notes:upd}));save('notes',upd);
          const amountStr=n.amount?` · 💰 $${n.amount} ${n.currency||''}`:'';
          savedLabel=`📝 Nota guardada${areaLabel?` · ${areaLabel.icon} ${areaLabel.name}`:''}${amountStr}`;
        }else if(action.action==='SAVE_INBOX'&&action.data.content){
          const i={id:uid(),content:action.data.content,createdAt:td,processed:false};
          const upd=[i,...data.inbox];
          setData(d=>({...d,inbox:upd}));save('inbox',upd);
          savedLabel='📥 Agregado al inbox';
        }else if(action.action==='SAVE_BUDGET'&&action.data.title){
          const b={id:uid(),title:action.data.title,amount:Number(action.data.amount)||0,currency:action.data.currency||'MXN',dayOfMonth:Number(action.data.dayOfMonth)||1,
            areaId:(()=>{if(action.data.areaId)return action.data.areaId;if(action.data.area){const m=data.areas.find(a=>a.name.toLowerCase()===action.data.area.toLowerCase());return m?.id||'';}return '';})(),
            createdAt:td};
          const upd=[b,...(data.budget||[])];
          setData(d=>({...d,budget:upd}));save('budget',upd);
          savedLabel=`💳 Presupuesto: ${b.title} — $${b.amount}/mes (día ${b.dayOfMonth})`;
        }else if(action.action==='SAVE_HABIT'&&action.data.name){
          const h={id:uid(),name:action.data.name,frequency:action.data.frequency||'daily',completions:[]};
          const upd=[...data.habits,h];
          setData(d=>({...d,habits:upd}));save('habits',upd);
          savedLabel=`🔁 Hábito creado: ${h.name}`;
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
                  <div style={{width:34,height:34,borderRadius:10,background:`linear-gradient(135deg,${T.accent},${T.orange})`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <Icon name="brain" size={17} color="#000"/>
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
                      {!isUser&&<div style={{width:24,height:24,borderRadius:7,background:`${T.accent}22`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginBottom:2}}>
                        <Icon name="brain" size={12} color={T.accent}/>
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
                  <div style={{width:24,height:24,borderRadius:7,background:`${T.accent}22`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <Icon name="brain" size={12} color={T.accent}/>
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
          <Icon name="brain" size={22} color="#000"/>
          <span style={{fontSize:7,fontWeight:800,color:'#000',letterSpacing:'0.05em',lineHeight:1,fontFamily:"'DM Sans',sans-serif"}}>PSICKE</span>
        </button>
      )}
    </>
  );
};
const NAV=[
  {id:'dashboard',label:'Inicio',icon:'home'},
  {id:'areas',label:'Áreas',icon:'grid'},
  {id:'objectives',label:'Objetivos',icon:'target'},
  {id:'projects',label:'Proyectos',icon:'folder'},
  {id:'notes',label:'Notas',icon:'note'},
  {id:'inbox',label:'Inbox',icon:'inbox'},
  {id:'habits',label:'Hábitos',icon:'habit'},
  {id:'settings',label:'Config',icon:'cog'},
];
const MOBILE_NAV=NAV.slice(0,5);
const MORE_NAV=NAV.slice(5);

// ===================== MAIN APP =====================
export default function App() {
  const [view,setView]=useState('dashboard');
  const [viewHint,setViewHint]=useState(null);
  const [data,setData]=useState(null);
  const [showMore,setShowMore]=useState(false);
  const [apiKey,setApiKey]=useState(()=>localStorage.getItem('sb_gemini_key')||'');
  const isMobile=useIsMobile();

  // Smart navigate: sets view + optional hint for target component
  const navigate=(v,hint=null)=>{setView(v);setViewHint(hint);};
  // Nav bar navigate: clears any hint
  const navTo=(v)=>{setView(v);setViewHint(null);};

  useEffect(()=>{
    (async()=>{
      const def=initData();
      const [areas,objectives,projects,tasks,notes,inbox,habits,budget]=await Promise.all([
        load('areas',def.areas),load('objectives',def.objectives),load('projects',def.projects),
        load('tasks',def.tasks),load('notes',def.notes),load('inbox',def.inbox),load('habits',def.habits),load('budget',def.budget),
      ]);
      const linkedObj=objectives.map(o=>({...o,areaId:o.areaId||areas[0]?.id||''}));
      setData({areas,objectives:linkedObj,projects,tasks,notes,inbox,habits,budget});
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
    projects:<ProjectsAndTasks {...props} viewHint={viewHint} onConsumeHint={()=>setViewHint(null)}/>,
    notes:<Notes {...props} viewHint={viewHint} onConsumeHint={()=>setViewHint(null)}/>,
    inbox:<Inbox {...props}/>,
    habits:<HabitTracker {...props}/>,
    settings:<Settings apiKey={apiKey} setApiKey={setApiKey} isMobile={isMobile}/>,
  };
  const isMoreActive=MORE_NAV.some(n=>n.id===view);

  return (
    <div style={{display:'flex',flexDirection:isMobile?'column':'row',height:'100dvh',width:'100%',background:T.bg,fontFamily:"'DM Sans',system-ui,sans-serif",color:T.text,overflow:'hidden',position:'fixed',inset:0}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap');
        html,body,#root{margin:0;padding:0;width:100%;height:100%;background:#0d1117;}
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
              <div style={{width:34,height:34,background:`linear-gradient(135deg,${T.accent},${T.orange})`,borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <Icon name="brain" size={17} color="#000"/>
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
            <div style={{width:28,height:28,background:`linear-gradient(135deg,${T.accent},${T.orange})`,borderRadius:7,display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Icon name="brain" size={14} color="#000"/>
            </div>
            <span style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,color:T.text}}>
              Segundo <span style={{color:T.accent}}>Cerebro</span>
            </span>
          </div>
          {inboxCount>0&&<span style={{background:T.red,color:'#fff',fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:12}}>{inboxCount} inbox</span>}
          <button onClick={()=>navTo('settings')} style={{background:'none',border:`1px solid ${apiKey?T.green:T.red}`,borderRadius:8,padding:'3px 10px',cursor:'pointer',color:apiKey?T.green:T.red,fontSize:11,fontWeight:600,display:'flex',alignItems:'center',gap:4}}>
            <span style={{width:6,height:6,borderRadius:'50%',background:apiKey?T.green:T.red,display:'inline-block'}}/>
            {apiKey?'IA ON':'IA OFF'}
          </button>
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

      {/* PSICKE — FLOATING BUBBLE */}
      <Psicke apiKey={apiKey} onGoSettings={()=>navTo('settings')} data={data} setData={setData}/>

    </div>
  );
}
