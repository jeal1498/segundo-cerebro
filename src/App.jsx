import { useState, useEffect, useRef, useCallback } from "react";

// ===================== THEME =====================
const T = {
  bg: '#0d1117', surface: '#161b22', surface2: '#1c2230',
  border: '#21262d', borderLight: '#30363d',
  accent: '#d4a017', accentHover: '#e8b420',
  text: '#e6edf3', muted: '#8b949e', dim: '#484f58',
  green: '#3fb950', red: '#f85149', blue: '#58a6ff',
  purple: '#bc8cff', orange: '#f78166',
  areaColors: ['#58a6ff','#3fb950','#d4a017','#bc8cff','#f78166','#79c0ff','#ffa657','#ff7b72'],
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
const save = async (key, val) => {
  try { await window.storage?.set(key, JSON.stringify(val)); } catch(e) {}
};
const load = async (key, def) => {
  try {
    const r = await window.storage?.get(key);
    return r ? JSON.parse(r.value) : def;
  } catch(e) { return def; }
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
  };
  return <span style={{display:'inline-flex',alignItems:'center'}}>{icons[name]||null}</span>;
};

// ===================== HELPERS =====================
const uid = () => Math.random().toString(36).slice(2,10);
const today = () => new Date().toISOString().split('T')[0];
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
const Dashboard = ({data,isMobile}) => {
  const pendingTasks=data.tasks.filter(t=>t.status!=='done').length;
  const inboxUnread=data.inbox.filter(i=>!i.processed).length;
  const todayHabits=data.habits.filter(h=>h.completions.includes(today())).length;
  const stats=[
    {label:'Áreas',val:data.areas.length,icon:'grid',color:T.blue},
    {label:'Objetivos',val:data.objectives.filter(o=>o.status==='active').length,icon:'target',color:T.accent},
    {label:'Tareas',val:pendingTasks,icon:'check',color:T.orange},
    {label:'Inbox',val:inboxUnread,icon:'inbox',color:T.red},
    {label:'Hábitos hoy',val:`${todayHabits}/${data.habits.length}`,icon:'habit',color:T.green},
    {label:'Notas',val:data.notes.length,icon:'note',color:T.purple},
  ];
  const recentNotes=[...data.notes].sort((a,b)=>b.createdAt>a.createdAt?1:-1).slice(0,3);
  const pendingList=data.tasks.filter(t=>t.status!=='done').slice(0,5);
  return (
    <div>
      <h2 style={{color:T.text,marginTop:0,fontSize:isMobile?20:24,fontWeight:700,marginBottom:2}}>Buenos días 🧠</h2>
      <p style={{color:T.muted,marginBottom:20,fontSize:13}}>{new Date().toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'})}</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:20}}>
        {stats.map(s=>(
          <Card key={s.label} style={{textAlign:'center',padding:isMobile?12:16}}>
            <div style={{marginBottom:6,color:s.color}}><Icon name={s.icon} size={isMobile?18:22} color={s.color}/></div>
            <div style={{fontSize:isMobile?22:28,fontWeight:700,color:T.text}}>{s.val}</div>
            <div style={{fontSize:11,color:T.muted,marginTop:2}}>{s.label}</div>
          </Card>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr',gap:16}}>
        <div>
          <h3 style={{color:T.text,fontSize:14,fontWeight:600,marginBottom:12,marginTop:0}}>Próximas tareas</h3>
          {pendingList.length===0?<p style={{color:T.dim,fontSize:13}}>¡Sin tareas pendientes! 🎉</p>:
            pendingList.map(t=>(
              <div key={t.id} style={{display:'flex',gap:8,alignItems:'flex-start',marginBottom:10,padding:'10px 12px',background:T.surface,borderRadius:10}}>
                <div style={{width:8,height:8,borderRadius:'50%',background:t.priority==='alta'?T.red:t.priority==='media'?T.accent:T.green,marginTop:5,flexShrink:0}}/>
                <span style={{color:T.text,fontSize:13}}>{t.title}</span>
              </div>
            ))
          }
        </div>
        <div>
          <h3 style={{color:T.text,fontSize:14,fontWeight:600,marginBottom:12,marginTop:isMobile?16:0}}>Notas recientes</h3>
          {recentNotes.map(n=>(
            <div key={n.id} style={{marginBottom:10,padding:'12px 14px',background:T.surface2,borderRadius:10,borderLeft:`3px solid ${T.accent}`}}>
              <div style={{color:T.text,fontSize:13,fontWeight:500}}>{n.title}</div>
              <div style={{color:T.muted,fontSize:11,marginTop:3}}>{fmt(n.createdAt)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ===================== AREAS =====================
const Areas = ({data,setData,isMobile}) => {
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
      <PageHeader title="Áreas de vida" subtitle="Los grandes pilares de tu vida." isMobile={isMobile}
        action={<Btn onClick={()=>setModal(true)} size="sm"><Icon name="plus" size={14}/>Nueva</Btn>}/>
      <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr 1fr':'repeat(auto-fill,minmax(180px,1fr))',gap:12}}>
        {data.areas.map(a=>{
          const objCount=data.objectives.filter(o=>o.areaId===a.id).length;
          const projCount=data.projects.filter(p=>p.areaId===a.id).length;
          return (
            <Card key={a.id} style={{borderLeft:`4px solid ${a.color}`,position:'relative'}}>
              <div style={{fontSize:isMobile?24:28,marginBottom:8}}>{a.icon}</div>
              <div style={{color:T.text,fontWeight:600,fontSize:14,marginBottom:4}}>{a.name}</div>
              <div style={{color:T.muted,fontSize:11}}>{objCount} obj · {projCount} proy</div>
              <button onClick={()=>del(a.id)} style={{position:'absolute',top:10,right:10,background:'none',border:'none',color:T.dim,cursor:'pointer',padding:6,display:'flex'}}><Icon name="trash" size={14}/></button>
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

// ===================== OBJECTIVES =====================
const Objectives = ({data,setData,isMobile}) => {
  const [modal,setModal]=useState(false);
  const [form,setForm]=useState({title:'',areaId:'',deadline:'',status:'active'});
  const saveObj=()=>{
    if(!form.title.trim())return;
    const updated=[...data.objectives,{id:uid(),...form}];
    setData(d=>({...d,objectives:updated}));save('objectives',updated);
    setModal(false);setForm({title:'',areaId:'',deadline:'',status:'active'});
  };
  const toggle=(id)=>{const u=data.objectives.map(o=>o.id===id?{...o,status:o.status==='active'?'done':'active'}:o);setData(d=>({...d,objectives:u}));save('objectives',u);};
  const del=(id)=>{const u=data.objectives.filter(o=>o.id!==id);setData(d=>({...d,objectives:u}));save('objectives',u);};
  return (
    <div>
      <PageHeader title="Objetivos" subtitle="Metas concretas con fecha límite." isMobile={isMobile}
        action={<Btn onClick={()=>setModal(true)} size="sm"><Icon name="plus" size={14}/>Nuevo</Btn>}/>
      {['active','done'].map(status=>{
        const list=data.objectives.filter(o=>o.status===status);
        if(!list.length)return null;
        return (
          <div key={status} style={{marginBottom:24}}>
            <h3 style={{color:T.muted,fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:1,marginBottom:12}}>{status==='active'?'Activos':'Completados'}</h3>
            {list.map(o=>{
              const area=data.areas.find(a=>a.id===o.areaId);
              const relProj=data.projects.filter(p=>p.objectiveId===o.id);
              return (
                <Card key={o.id} style={{marginBottom:10,opacity:status==='done'?0.6:1}}>
                  <div style={{display:'flex',alignItems:'flex-start',gap:12}}>
                    <button onClick={()=>toggle(o.id)} style={{width:24,height:24,borderRadius:'50%',border:`2px solid ${status==='done'?T.green:T.border}`,background:status==='done'?T.green:'transparent',cursor:'pointer',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',marginTop:2}}>
                      {status==='done'&&<Icon name="check" size={12} color="#000"/>}
                    </button>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{color:T.text,fontWeight:600,fontSize:14,textDecoration:status==='done'?'line-through':'none',marginBottom:6}}>{o.title}</div>
                      <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
                        {area&&<Tag text={`${area.icon} ${area.name}`} color={area.color}/>}
                        {o.deadline&&<span style={{color:T.muted,fontSize:12}}>📅 {fmt(o.deadline)}</span>}
                        <span style={{color:T.dim,fontSize:12}}>📁 {relProj.length} proyectos</span>
                      </div>
                    </div>
                    <button onClick={()=>del(o.id)} style={{background:'none',border:'none',color:T.dim,cursor:'pointer',padding:6,display:'flex'}}><Icon name="trash" size={14}/></button>
                  </div>
                </Card>
              );
            })}
          </div>
        );
      })}
      {!data.objectives.length&&<div style={{textAlign:'center',padding:'40px 0',color:T.dim}}><Icon name="target" size={40}/><p>Sin objetivos aún</p></div>}
      {modal&&(
        <Modal title="Nuevo objetivo" onClose={()=>setModal(false)}>
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <Input value={form.title} onChange={v=>setForm(f=>({...f,title:v}))} placeholder="¿Qué quieres lograr?"/>
            <Select value={form.areaId} onChange={v=>setForm(f=>({...f,areaId:v}))}>
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
const ProjectsAndTasks = ({data,setData,isMobile}) => {
  const [selProject,setSelProject]=useState(null);
  const [showDetail,setShowDetail]=useState(false);
  const [projModal,setProjModal]=useState(false);
  const [taskModal,setTaskModal]=useState(false);
  const [projForm,setProjForm]=useState({title:'',objectiveId:'',areaId:'',status:'active'});
  const [taskForm,setTaskForm]=useState({title:'',priority:'media',dueDate:''});

  const saveProj=()=>{
    if(!projForm.title.trim())return;
    const updated=[...data.projects,{id:uid(),...projForm}];
    setData(d=>({...d,projects:updated}));save('projects',updated);
    setProjModal(false);setProjForm({title:'',objectiveId:'',areaId:'',status:'active'});
  };
  const saveTask=()=>{
    if(!taskForm.title.trim()||!selProject)return;
    const updated=[...data.tasks,{id:uid(),projectId:selProject.id,status:'todo',...taskForm}];
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
  const pTasks=selProject?data.tasks.filter(t=>t.projectId===selProject.id):[];
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

  const ProjectList=()=>(
    <div>
      {!isMobile&&<div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <span style={{color:T.muted,fontSize:12,fontWeight:600,textTransform:'uppercase',letterSpacing:1}}>Proyectos</span>
        <button onClick={()=>setProjModal(true)} style={{background:'none',border:'none',color:T.muted,cursor:'pointer',display:'flex'}}><Icon name="plus" size={16}/></button>
      </div>}
      {data.projects.map(p=>{
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
      {!data.projects.length&&<div style={{textAlign:'center',padding:'30px 0',color:T.dim}}><Icon name="folder" size={36}/><p>Sin proyectos</p></div>}
    </div>
  );

  const TaskDetail=()=>(
    <div>
      {isMobile&&<button onClick={()=>setShowDetail(false)} style={{display:'flex',alignItems:'center',gap:6,background:'none',border:'none',color:T.muted,cursor:'pointer',marginBottom:16,fontSize:14,padding:0}}>
        <Icon name="back" size={18}/>Proyectos
      </button>}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <h3 style={{margin:0,color:T.text,fontSize:isMobile?18:16,fontWeight:700}}>{selProject?.title}</h3>
        <div style={{display:'flex',gap:8}}>
          <Btn size="sm" onClick={()=>setTaskModal(true)}><Icon name="plus" size={12}/>Tarea</Btn>
          <Btn size="sm" variant="danger" onClick={()=>delProj(selProject.id)}><Icon name="trash" size={12}/></Btn>
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
const Notes = ({data,setData,isMobile}) => {
  const [sel,setSel]=useState(null);
  const [showNote,setShowNote]=useState(false);
  const [modal,setModal]=useState(false);
  const [form,setForm]=useState({title:'',content:'',tags:'',areaId:''});
  const [search,setSearch]=useState('');

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
  const filtered=data.notes.filter(n=>n.title.toLowerCase().includes(search.toLowerCase())||n.content.toLowerCase().includes(search.toLowerCase()));

  const NoteList=()=>(
    <div>
      <Input value={search} onChange={setSearch} placeholder="🔍 Buscar..." style={{marginBottom:12,fontSize:14}}/>
      <Btn onClick={()=>setModal(true)} style={{width:'100%',justifyContent:'center',marginBottom:14}} size="sm"><Icon name="plus" size={12}/>Nueva nota</Btn>
      {filtered.map(n=>(
        <div key={n.id} onClick={()=>{setSel(n);if(isMobile)setShowNote(true);}}
          style={{padding:'12px 14px',borderRadius:10,cursor:'pointer',marginBottom:8,background:sel?.id===n.id&&!isMobile?T.surface2:T.surface,border:`1px solid ${sel?.id===n.id&&!isMobile?T.accent:T.border}`,transition:'border-color 0.15s'}}>
          <div style={{color:T.text,fontSize:14,fontWeight:500,marginBottom:2}}>{n.title}</div>
          <div style={{color:T.muted,fontSize:12,marginBottom:3}}>{n.content.slice(0,60)}{n.content.length>60?'...':''}</div>
          <div style={{color:T.dim,fontSize:11}}>{fmt(n.createdAt)}</div>
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
  const days=Array.from({length:numDays},(_,i)=>{
    const d=new Date();d.setDate(d.getDate()-(numDays-1)+i);
    return {date:d.toISOString().split('T')[0],label:d.toLocaleDateString('es-ES',{weekday:'short'}),day:d.getDate()};
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
  return (
    <div>
      <PageHeader title="Habit Tracker" subtitle="Construye rachas diarias 🔥" isMobile={isMobile}
        action={<Btn onClick={()=>setModal(true)} size="sm"><Icon name="plus" size={14}/>Nuevo</Btn>}/>
      <div style={{background:T.surface,borderRadius:12,border:`1px solid ${T.border}`,overflow:'hidden'}}>
        <div style={{display:'grid',gridTemplateColumns:`1fr repeat(${numDays},44px)`,borderBottom:`1px solid ${T.border}`}}>
          <div style={{padding:'10px 14px',color:T.muted,fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:1}}>Hábito</div>
          {days.map(d=>(
            <div key={d.date} style={{padding:'8px 4px',textAlign:'center',borderLeft:`1px solid ${T.border}`}}>
              <div style={{color:d.date===todayStr?T.accent:T.dim,fontSize:10,fontWeight:600,textTransform:'uppercase'}}>{d.label}</div>
              <div style={{color:d.date===todayStr?T.accent:T.muted,fontSize:13,fontWeight:700}}>{d.day}</div>
            </div>
          ))}
        </div>
        {data.habits.map(h=>{
          const streak=(()=>{let s=0,d=new Date();while(h.completions.includes(d.toISOString().split('T')[0])){s++;d.setDate(d.getDate()-1);}return s;})();
          return (
            <div key={h.id} style={{display:'grid',gridTemplateColumns:`1fr repeat(${numDays},44px)`,borderBottom:`1px solid ${T.border}`}}>
              <div style={{padding:'12px 14px',display:'flex',alignItems:'center',gap:8}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{color:T.text,fontSize:13,fontWeight:500,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{h.name}</div>
                  {streak>0&&<div style={{color:T.accent,fontSize:11}}>🔥 {streak}d</div>}
                </div>
                <button onClick={()=>del(h.id)} style={{background:'none',border:'none',color:T.dim,cursor:'pointer',padding:4,display:'flex',flexShrink:0}}><Icon name="trash" size={13}/></button>
              </div>
              {days.map(d=>{
                const done=h.completions.includes(d.date);
                return (
                  <div key={d.date} style={{display:'flex',alignItems:'center',justifyContent:'center',borderLeft:`1px solid ${T.border}`}}>
                    <button onClick={()=>toggle(h.id,d.date)} style={{width:30,height:30,borderRadius:8,border:`2px solid ${done?T.green:T.border}`,background:done?T.green:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.15s'}}>
                      {done&&<Icon name="check" size={13} color="#000"/>}
                    </button>
                  </div>
                );
              })}
            </div>
          );
        })}
        {!data.habits.length&&<div style={{padding:'30px',textAlign:'center',color:T.dim}}>Sin hábitos. ¡Empieza hoy!</div>}
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

// ===================== AI ASSISTANT =====================
const AIAssistant = ({data,isMobile}) => {
  const [messages,setMessages]=useState([{role:'assistant',content:'¡Hola! Soy tu asistente IA con acceso completo a tu Segundo Cerebro. Pregúntame lo que quieras: proyectos activos, objetivos pendientes, notas, hábitos... 🧠'}]);
  const [input,setInput]=useState('');
  const [loading,setLoading]=useState(false);
  const bottomRef=useRef(null);
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:'smooth'});},[messages]);

  const buildContext=useCallback(()=>JSON.stringify({
    areas:data.areas.map(a=>({name:a.name,icon:a.icon})),
    objectives:data.objectives.map(o=>({title:o.title,status:o.status,deadline:o.deadline,area:data.areas.find(a=>a.id===o.areaId)?.name||'Sin área'})),
    projects:data.projects.map(p=>({title:p.title,objective:data.objectives.find(o=>o.id===p.objectiveId)?.title||'Sin objetivo'})),
    tasks:data.tasks.map(t=>({title:t.title,status:t.status,priority:t.priority,project:data.projects.find(p=>p.id===t.projectId)?.title||'Sin proyecto'})),
    notes:data.notes.map(n=>({title:n.title,content:n.content,tags:n.tags})),
    inbox:data.inbox.filter(i=>!i.processed).map(i=>({content:i.content})),
    habits:data.habits.map(h=>({name:h.name,streak:(()=>{let s=0,d=new Date();while(h.completions.includes(d.toISOString().split('T')[0])){s++;d.setDate(d.getDate()-1);}return s;})()})),
  },null,2),[data]);

  const send=async()=>{
    if(!input.trim()||loading)return;
    const userMsg={role:'user',content:input};
    setMessages(m=>[...m,userMsg]);setInput('');setLoading(true);
    try{
      const res=await fetch('https://api.anthropic.com/v1/messages',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1000,
          system:`Eres el asistente IA del Segundo Cerebro del usuario. Responde de forma concisa y útil en español.\n\nDATOS:\n${buildContext()}`,
          messages:[...messages,userMsg].map(m=>({role:m.role,content:m.content}))})
      });
      const d=await res.json();
      setMessages(m=>[...m,{role:'assistant',content:d.content?.[0]?.text||'Sin respuesta'}]);
    }catch(e){setMessages(m=>[...m,{role:'assistant',content:'Error al conectar con la IA.'}]);}
    setLoading(false);
  };

  return (
    <div style={{display:'flex',flexDirection:'column',height:isMobile?'calc(100vh - 160px)':'calc(100vh - 120px)'}}>
      <PageHeader title="IA — Asistente personal" subtitle="Consulta tu Segundo Cerebro en lenguaje natural" isMobile={isMobile}/>
      <div style={{flex:1,overflowY:'auto',marginBottom:12,display:'flex',flexDirection:'column',gap:10}}>
        {messages.map((m,i)=>(
          <div key={i} style={{display:'flex',justifyContent:m.role==='user'?'flex-end':'flex-start'}}>
            <div style={{maxWidth:'85%',padding:'10px 14px',borderRadius:14,background:m.role==='user'?T.accent:T.surface,color:m.role==='user'?'#000':T.text,fontSize:14,lineHeight:1.6,
              borderBottomRightRadius:m.role==='user'?2:14,borderBottomLeftRadius:m.role==='assistant'?2:14}}>
              {m.content}
            </div>
          </div>
        ))}
        {loading&&<div style={{display:'flex',justifyContent:'flex-start'}}><div style={{padding:'10px 16px',borderRadius:14,background:T.surface,color:T.muted,fontSize:14}}>Pensando{[0,1,2].map(i=><span key={i} style={{display:'inline-block',animation:`bounce 1s ${i*0.2}s infinite`}}>.</span>)}</div></div>}
        <div ref={bottomRef}/>
      </div>
      <div style={{display:'flex',gap:10}}>
        <Input value={input} onChange={setInput} placeholder="Pregunta sobre tu Segundo Cerebro..." style={{flex:1}} onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&send()}/>
        <button onClick={send} disabled={loading} style={{background:T.accent,border:'none',borderRadius:10,padding:'0 16px',cursor:'pointer',display:'flex',alignItems:'center',flexShrink:0}}><Icon name="send" size={18} color="#000"/></button>
      </div>
      <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}`}</style>
    </div>
  );
};

// ===================== NAVIGATION =====================
const NAV=[
  {id:'dashboard',label:'Inicio',icon:'home'},
  {id:'areas',label:'Áreas',icon:'grid'},
  {id:'objectives',label:'Objetivos',icon:'target'},
  {id:'projects',label:'Proyectos',icon:'folder'},
  {id:'notes',label:'Notas',icon:'note'},
  {id:'inbox',label:'Inbox',icon:'inbox'},
  {id:'habits',label:'Hábitos',icon:'habit'},
  {id:'ai',label:'IA',icon:'ai'},
];
const MOBILE_NAV=NAV.slice(0,5);
const MORE_NAV=NAV.slice(5);

// ===================== MAIN APP =====================
export default function App() {
  const [view,setView]=useState('dashboard');
  const [data,setData]=useState(null);
  const [showMore,setShowMore]=useState(false);
  const isMobile=useIsMobile();

  useEffect(()=>{
    (async()=>{
      const def=initData();
      const [areas,objectives,projects,tasks,notes,inbox,habits]=await Promise.all([
        load('areas',def.areas),load('objectives',def.objectives),load('projects',def.projects),
        load('tasks',def.tasks),load('notes',def.notes),load('inbox',def.inbox),load('habits',def.habits),
      ]);
      const linkedObj=objectives.map(o=>({...o,areaId:o.areaId||areas[0]?.id||''}));
      setData({areas,objectives:linkedObj,projects,tasks,notes,inbox,habits});
    })();
  },[]);

  if(!data) return (
    <div style={{background:T.bg,height:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:T.muted,fontFamily:'system-ui',gap:16}}>
      <div style={{fontSize:48}}>🧠</div><div>Cargando tu Segundo Cerebro...</div>
    </div>
  );

  const inboxCount=data.inbox.filter(i=>!i.processed).length;
  const props={data,setData,isMobile};
  const views={dashboard:<Dashboard {...props}/>,areas:<Areas {...props}/>,objectives:<Objectives {...props}/>,projects:<ProjectsAndTasks {...props}/>,notes:<Notes {...props}/>,inbox:<Inbox {...props}/>,habits:<HabitTracker {...props}/>,ai:<AIAssistant {...props}/>};
  const isMoreActive=MORE_NAV.some(n=>n.id===view);

  return (
    <div style={{display:'flex',flexDirection:isMobile?'column':'row',height:'100vh',background:T.bg,fontFamily:"'DM Sans',system-ui,sans-serif",color:T.text,overflow:'hidden'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap');
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
                <button key={item.id} onClick={()=>setView(item.id)}
                  style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'9px 12px',borderRadius:9,border:'none',cursor:'pointer',textAlign:'left',fontFamily:'inherit',fontSize:13,fontWeight:active?600:400,
                    background:active?`${T.accent}18`:'transparent',color:active?T.accent:T.muted,marginBottom:2,transition:'all 0.15s'}}>
                  <Icon name={item.icon} size={16} color={active?T.accent:undefined}/>
                  <span style={{flex:1}}>{item.label}</span>
                  {badge&&<span style={{background:T.red,color:'#fff',fontSize:10,fontWeight:700,padding:'1px 6px',borderRadius:10}}>{badge}</span>}
                </button>
              );
            })}
          </nav>
          <div style={{padding:'12px 16px',borderTop:`1px solid ${T.border}`,fontSize:11,color:T.dim,textAlign:'center'}}>Método Tiago Forte</div>
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
        </div>
      )}

      {/* MAIN CONTENT */}
      <main style={{flex:1,overflowY:'auto',padding:isMobile?'16px 16px 90px':'28px'}}>
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
                  <button key={item.id} onClick={()=>{setView(item.id);setShowMore(false);}}
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
                <button key={item.id} onClick={()=>setView(item.id)}
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
    </div>
  );
}
