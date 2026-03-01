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
    note: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color||'currentColor'} strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
    inbox: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color||'currentColor'} strokeWidth="1.8"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>,
    habit: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color||'currentColor'} strokeWidth="1.8"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>,
    ai: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color||'currentColor'} strokeWidth="1.8"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    plus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color||'currentColor'} strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    trash: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color||'currentColor'} strokeWidth="1.8"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
    send: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color||'currentColor'} strokeWidth="1.8"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
    x: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color||'currentColor'} strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    edit: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color||'currentColor'} strokeWidth="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    star: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color||'currentColor'} strokeWidth="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    chevronRight: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color||'currentColor'} strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>,
    link: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color||'currentColor'} strokeWidth="1.8"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  };
  return <span style={{display:'inline-flex',alignItems:'center'}}>{icons[name] || null}</span>;
};

// ===================== HELPERS =====================
const uid = () => Math.random().toString(36).slice(2,10);
const today = () => new Date().toISOString().split('T')[0];
const fmt = (d) => d ? new Date(d).toLocaleDateString('es-ES', {day:'2-digit',month:'short'}) : '';

// ===================== INITIAL DATA =====================
const initData = () => ({
  areas: [
    {id:uid(), name:'Salud', color:T.areaColors[1], icon:'💪'},
    {id:uid(), name:'Trabajo', color:T.areaColors[0], icon:'💼'},
    {id:uid(), name:'Finanzas', color:T.areaColors[2], icon:'💰'},
  ],
  objectives: [
    {id:uid(), title:'Correr una maratón', areaId:'', deadline:'2025-12-31', status:'active'},
  ],
  projects: [],
  tasks: [],
  notes: [
    {id:uid(), title:'Cómo funciona el Segundo Cerebro', content:'El Segundo Cerebro es un sistema para externalizar nuestra memoria y liberar carga cognitiva. Basado en el método de Tiago Forte: Áreas → Objetivos → Proyectos → Tareas.', tags:['productividad','sistema'], areaId:'', createdAt: today()},
  ],
  inbox: [
    {id:uid(), content:'Revisar el sistema de Segundo Cerebro', createdAt: today(), processed: false},
  ],
  habits: [
    {id:uid(), name:'Meditar 10 min', frequency:'daily', completions:[]},
    {id:uid(), name:'Leer 30 min', frequency:'daily', completions:[]},
    {id:uid(), name:'Ejercicio', frequency:'daily', completions:[]},
  ],
});

// ===================== COMPONENTS =====================

const Modal = ({ title, onClose, children }) => (
  <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(4px)'}}
    onClick={e => e.target === e.currentTarget && onClose()}>
    <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:28,width:'100%',maxWidth:480,boxShadow:'0 20px 60px rgba(0,0,0,0.5)'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <h3 style={{margin:0,color:T.text,fontSize:16,fontWeight:600}}>{title}</h3>
        <button onClick={onClose} style={{background:'none',border:'none',color:T.muted,cursor:'pointer',padding:4,display:'flex'}}><Icon name="x" size={16}/></button>
      </div>
      {children}
    </div>
  </div>
);

const Input = ({ value, onChange, placeholder, style={}, type='text', ...p }) => (
  <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
    style={{width:'100%',background:T.bg,border:`1px solid ${T.border}`,color:T.text,padding:'8px 12px',borderRadius:8,fontSize:14,outline:'none',boxSizing:'border-box',...style}} {...p}/>
);

const Textarea = ({ value, onChange, placeholder, rows=4 }) => (
  <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows}
    style={{width:'100%',background:T.bg,border:`1px solid ${T.border}`,color:T.text,padding:'8px 12px',borderRadius:8,fontSize:14,outline:'none',resize:'vertical',fontFamily:'inherit',boxSizing:'border-box'}}/>
);

const Select = ({ value, onChange, children, style={} }) => (
  <select value={value} onChange={e=>onChange(e.target.value)}
    style={{background:T.bg,border:`1px solid ${T.border}`,color:T.text,padding:'8px 12px',borderRadius:8,fontSize:14,outline:'none',width:'100%',...style}}>
    {children}
  </select>
);

const Btn = ({ onClick, children, variant='primary', size='md', style={} }) => {
  const base = {border:'none',cursor:'pointer',borderRadius:8,fontWeight:500,display:'inline-flex',alignItems:'center',gap:6,fontFamily:'inherit',...style};
  const variants = {
    primary: {background:T.accent,color:'#000',padding: size==='sm'?'5px 10px':'8px 16px',fontSize:size==='sm'?12:14},
    ghost: {background:'transparent',color:T.muted,padding: size==='sm'?'5px 10px':'8px 16px',fontSize:size==='sm'?12:14,border:`1px solid ${T.border}`},
    danger: {background:'rgba(248,81,73,0.15)',color:T.red,padding: size==='sm'?'5px 10px':'8px 16px',fontSize:size==='sm'?12:14,border:`1px solid rgba(248,81,73,0.3)`},
  };
  return <button onClick={onClick} style={{...base,...variants[variant]}}>{children}</button>;
};

const Tag = ({ text, color }) => (
  <span style={{background:`${color||T.accent}22`,color:color||T.accent,padding:'2px 8px',borderRadius:20,fontSize:12,fontWeight:500}}>{text}</span>
);

const Card = ({ children, style={}, onClick }) => (
  <div onClick={onClick} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,padding:16,cursor:onClick?'pointer':'default',transition:'border-color 0.2s',...style}}
    onMouseEnter={e=>onClick&&(e.currentTarget.style.borderColor=T.accent)}
    onMouseLeave={e=>onClick&&(e.currentTarget.style.borderColor=T.border)}>
    {children}
  </div>
);

// ===================== VIEWS =====================

// DASHBOARD
const Dashboard = ({ data }) => {
  const pendingTasks = data.tasks.filter(t=>t.status!=='done').length;
  const inboxUnread = data.inbox.filter(i=>!i.processed).length;
  const todayHabits = data.habits.filter(h=>h.completions.includes(today())).length;
  const stats = [
    {label:'Áreas', val:data.areas.length, icon:'grid', color:T.blue},
    {label:'Objetivos activos', val:data.objectives.filter(o=>o.status==='active').length, icon:'target', color:T.accent},
    {label:'Tareas pendientes', val:pendingTasks, icon:'check', color:T.orange},
    {label:'Inbox sin procesar', val:inboxUnread, icon:'inbox', color:T.red},
    {label:'Hábitos hoy', val:`${todayHabits}/${data.habits.length}`, icon:'habit', color:T.green},
    {label:'Notas', val:data.notes.length, icon:'note', color:T.purple},
  ];
  const recentNotes = [...data.notes].sort((a,b)=>b.createdAt>a.createdAt?1:-1).slice(0,3);
  const pendingList = data.tasks.filter(t=>t.status!=='done').slice(0,5);
  return (
    <div>
      <h2 style={{color:T.text,marginTop:0,fontSize:24,fontWeight:700,marginBottom:4}}>Buenos días 🧠</h2>
      <p style={{color:T.muted,marginBottom:24,fontSize:14}}>{new Date().toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'})}</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:24}}>
        {stats.map(s=>(
          <Card key={s.label} style={{textAlign:'center'}}>
            <div style={{marginBottom:8,color:s.color}}><Icon name={s.icon} size={22} color={s.color}/></div>
            <div style={{fontSize:28,fontWeight:700,color:T.text}}>{s.val}</div>
            <div style={{fontSize:12,color:T.muted,marginTop:2}}>{s.label}</div>
          </Card>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        <div>
          <h3 style={{color:T.text,fontSize:14,fontWeight:600,marginBottom:12,marginTop:0}}>Próximas tareas</h3>
          {pendingList.length===0?<p style={{color:T.dim,fontSize:13}}>¡Sin tareas pendientes! 🎉</p>:
            pendingList.map(t=>(
              <div key={t.id} style={{display:'flex',gap:8,alignItems:'flex-start',marginBottom:8}}>
                <div style={{width:8,height:8,borderRadius:'50%',background:t.priority==='alta'?T.red:t.priority==='media'?T.accent:T.green,marginTop:5,flexShrink:0}}/>
                <span style={{color:T.text,fontSize:13}}>{t.title}</span>
              </div>
            ))
          }
        </div>
        <div>
          <h3 style={{color:T.text,fontSize:14,fontWeight:600,marginBottom:12,marginTop:0}}>Notas recientes</h3>
          {recentNotes.map(n=>(
            <div key={n.id} style={{marginBottom:10,padding:'10px 12px',background:T.surface2,borderRadius:8,borderLeft:`3px solid ${T.accent}`}}>
              <div style={{color:T.text,fontSize:13,fontWeight:500}}>{n.title}</div>
              <div style={{color:T.muted,fontSize:11,marginTop:2}}>{fmt(n.createdAt)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// AREAS
const Areas = ({ data, setData }) => {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({name:'',icon:'🌟',color:T.areaColors[0]});
  const save_ = () => {
    if(!form.name.trim()) return;
    const newArea = {id:uid(),...form};
    const newAreas = [...data.areas, newArea];
    setData(d=>({...d, areas:newAreas}));
    save('areas', newAreas);
    setModal(false); setForm({name:'',icon:'🌟',color:T.areaColors[0]});
  };
  const del = (id) => {
    const newAreas = data.areas.filter(a=>a.id!==id);
    setData(d=>({...d,areas:newAreas})); save('areas',newAreas);
  };
  const emojis = ['💪','💼','💰','📚','🏠','❤️','🎨','🌍','🎵','⚽','✈️','🍎'];
  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <h2 style={{margin:0,color:T.text,fontSize:20,fontWeight:700}}>Áreas de vida</h2>
        <Btn onClick={()=>setModal(true)}><Icon name="plus" size={14}/>Nueva área</Btn>
      </div>
      <p style={{color:T.muted,fontSize:13,marginTop:-12,marginBottom:20}}>Los grandes pilares de tu vida. Todo lo demás se organiza dentro de ellas.</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:12}}>
        {data.areas.map(a=>{
          const objCount = data.objectives.filter(o=>o.areaId===a.id).length;
          const projCount = data.projects.filter(p=>p.areaId===a.id).length;
          return (
            <Card key={a.id} style={{borderLeft:`4px solid ${a.color}`,position:'relative'}}>
              <div style={{fontSize:28,marginBottom:8}}>{a.icon}</div>
              <div style={{color:T.text,fontWeight:600,fontSize:15,marginBottom:4}}>{a.name}</div>
              <div style={{color:T.muted,fontSize:12}}>{objCount} objetivo{objCount!==1?'s':''} · {projCount} proyecto{projCount!==1?'s':''}</div>
              <button onClick={()=>del(a.id)} style={{position:'absolute',top:10,right:10,background:'none',border:'none',color:T.dim,cursor:'pointer',padding:4,display:'flex'}}><Icon name="trash" size={14}/></button>
            </Card>
          );
        })}
        <div onClick={()=>setModal(true)} style={{border:`2px dashed ${T.border}`,borderRadius:10,padding:16,cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:8,color:T.dim,minHeight:100}}
          onMouseEnter={e=>e.currentTarget.style.borderColor=T.accent}
          onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
          <Icon name="plus" size={20}/><span style={{fontSize:13}}>Nueva área</span>
        </div>
      </div>
      {modal && (
        <Modal title="Nueva área" onClose={()=>setModal(false)}>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <Input value={form.name} onChange={v=>setForm(f=>({...f,name:v}))} placeholder="Nombre del área"/>
            <div>
              <label style={{color:T.muted,fontSize:12,marginBottom:6,display:'block'}}>Icono</label>
              <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                {emojis.map(e=><button key={e} onClick={()=>setForm(f=>({...f,icon:e}))} style={{width:36,height:36,borderRadius:8,border:`2px solid ${form.icon===e?T.accent:T.border}`,background:T.bg,cursor:'pointer',fontSize:16}}>{e}</button>)}
              </div>
            </div>
            <div>
              <label style={{color:T.muted,fontSize:12,marginBottom:6,display:'block'}}>Color</label>
              <div style={{display:'flex',gap:8}}>
                {T.areaColors.map(c=><button key={c} onClick={()=>setForm(f=>({...f,color:c}))} style={{width:28,height:28,borderRadius:'50%',background:c,border:`3px solid ${form.color===c?T.text:'transparent'}`,cursor:'pointer'}}/>)}
              </div>
            </div>
            <Btn onClick={save_}>Crear área</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

// OBJECTIVES
const Objectives = ({ data, setData }) => {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({title:'',areaId:'',deadline:'',status:'active'});
  const save_ = () => {
    if(!form.title.trim()) return;
    const n = {id:uid(),...form};
    const updated = [...data.objectives,n];
    setData(d=>({...d,objectives:updated})); save('objectives',updated);
    setModal(false); setForm({title:'',areaId:'',deadline:'',status:'active'});
  };
  const toggle = (id) => {
    const updated = data.objectives.map(o=>o.id===id?{...o,status:o.status==='active'?'done':'active'}:o);
    setData(d=>({...d,objectives:updated})); save('objectives',updated);
  };
  const del = (id) => {
    const updated = data.objectives.filter(o=>o.id!==id);
    setData(d=>({...d,objectives:updated})); save('objectives',updated);
  };
  const getArea = (id) => data.areas.find(a=>a.id===id);
  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <h2 style={{margin:0,color:T.text,fontSize:20,fontWeight:700}}>Objetivos</h2>
        <Btn onClick={()=>setModal(true)}><Icon name="plus" size={14}/>Nuevo objetivo</Btn>
      </div>
      {['active','done'].map(status=>{
        const list = data.objectives.filter(o=>o.status===status);
        if(list.length===0) return null;
        return (
          <div key={status} style={{marginBottom:24}}>
            <h3 style={{color:T.muted,fontSize:12,fontWeight:600,textTransform:'uppercase',letterSpacing:1,marginBottom:12}}>{status==='active'?'Activos':'Completados'}</h3>
            {list.map(o=>{
              const area = getArea(o.areaId);
              const relProj = data.projects.filter(p=>p.objectiveId===o.id);
              return (
                <Card key={o.id} style={{marginBottom:10,opacity:status==='done'?0.6:1}}>
                  <div style={{display:'flex',alignItems:'flex-start',gap:12}}>
                    <button onClick={()=>toggle(o.id)} style={{width:22,height:22,borderRadius:'50%',border:`2px solid ${status==='done'?T.green:T.border}`,background:status==='done'?T.green:'transparent',cursor:'pointer',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',marginTop:2}}>
                      {status==='done'&&<Icon name="check" size={12} color="#000"/>}
                    </button>
                    <div style={{flex:1}}>
                      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                        <span style={{color:T.text,fontWeight:600,fontSize:14,textDecoration:status==='done'?'line-through':'none'}}>{o.title}</span>
                        {area && <Tag text={`${area.icon} ${area.name}`} color={area.color}/>}
                      </div>
                      <div style={{display:'flex',gap:12,color:T.muted,fontSize:12}}>
                        {o.deadline && <span>📅 {fmt(o.deadline)}</span>}
                        <span>📁 {relProj.length} proyecto{relProj.length!==1?'s':''}</span>
                      </div>
                    </div>
                    <button onClick={()=>del(o.id)} style={{background:'none',border:'none',color:T.dim,cursor:'pointer',padding:4,display:'flex'}}><Icon name="trash" size={14}/></button>
                  </div>
                </Card>
              );
            })}
          </div>
        );
      })}
      {modal && (
        <Modal title="Nuevo objetivo" onClose={()=>setModal(false)}>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <Input value={form.title} onChange={v=>setForm(f=>({...f,title:v}))} placeholder="¿Qué quieres lograr?"/>
            <Select value={form.areaId} onChange={v=>setForm(f=>({...f,areaId:v}))}>
              <option value="">Sin área</option>
              {data.areas.map(a=><option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
            </Select>
            <Input type="date" value={form.deadline} onChange={v=>setForm(f=>({...f,deadline:v}))} placeholder="Fecha límite"/>
            <Btn onClick={save_}>Crear objetivo</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

// PROJECTS & TASKS
const ProjectsAndTasks = ({ data, setData }) => {
  const [selProject, setSelProject] = useState(null);
  const [projModal, setProjModal] = useState(false);
  const [taskModal, setTaskModal] = useState(false);
  const [projForm, setProjForm] = useState({title:'',objectiveId:'',areaId:'',status:'active'});
  const [taskForm, setTaskForm] = useState({title:'',priority:'media',dueDate:''});

  const saveProj = () => {
    if(!projForm.title.trim()) return;
    const n = {id:uid(),...projForm};
    const updated = [...data.projects,n];
    setData(d=>({...d,projects:updated})); save('projects',updated);
    setProjModal(false); setProjForm({title:'',objectiveId:'',areaId:'',status:'active'});
  };
  const saveTask = () => {
    if(!taskForm.title.trim() || !selProject) return;
    const n = {id:uid(),projectId:selProject.id,status:'todo',...taskForm};
    const updated = [...data.tasks,n];
    setData(d=>({...d,tasks:updated})); save('tasks',updated);
    setTaskModal(false); setTaskForm({title:'',priority:'media',dueDate:''});
  };
  const toggleTask = (id) => {
    const updated = data.tasks.map(t=>t.id===id?{...t,status:t.status==='done'?'todo':'done'}:t);
    setData(d=>({...d,tasks:updated})); save('tasks',updated);
  };
  const delTask = (id) => {
    const updated = data.tasks.filter(t=>t.id!==id);
    setData(d=>({...d,tasks:updated})); save('tasks',updated);
  };
  const delProj = (id) => {
    const updP = data.projects.filter(p=>p.id!==id);
    const updT = data.tasks.filter(t=>t.projectId!==id);
    setData(d=>({...d,projects:updP,tasks:updT}));
    save('projects',updP); save('tasks',updT);
    if(selProject?.id===id) setSelProject(null);
  };
  const pTasks = selProject ? data.tasks.filter(t=>t.projectId===selProject.id) : [];
  const pColors = {alta:T.red,media:T.accent,baja:T.green};
  return (
    <div style={{display:'grid',gridTemplateColumns:'240px 1fr',gap:16,height:'100%'}}>
      <div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <span style={{color:T.muted,fontSize:12,fontWeight:600,textTransform:'uppercase',letterSpacing:1}}>Proyectos</span>
          <button onClick={()=>setProjModal(true)} style={{background:'none',border:'none',color:T.muted,cursor:'pointer',display:'flex'}}><Icon name="plus" size={16}/></button>
        </div>
        {data.projects.map(p=>{
          const tasks = data.tasks.filter(t=>t.projectId===p.id);
          const done = tasks.filter(t=>t.status==='done').length;
          const pct = tasks.length ? Math.round(done/tasks.length*100) : 0;
          return (
            <div key={p.id} onClick={()=>setSelProject(p)}
              style={{padding:'10px 12px',borderRadius:8,cursor:'pointer',marginBottom:4,background:selProject?.id===p.id?T.surface2:'transparent',border:`1px solid ${selProject?.id===p.id?T.border:'transparent'}`,position:'relative'}}>
              <div style={{color:T.text,fontSize:13,fontWeight:500,marginBottom:4}}>{p.title}</div>
              <div style={{height:3,background:T.border,borderRadius:2}}>
                <div style={{height:'100%',width:`${pct}%`,background:T.accent,borderRadius:2,transition:'width 0.3s'}}/>
              </div>
              <div style={{color:T.dim,fontSize:11,marginTop:3}}>{done}/{tasks.length} tareas</div>
            </div>
          );
        })}
        {data.projects.length===0&&<p style={{color:T.dim,fontSize:13}}>Sin proyectos aún</p>}
      </div>
      <div>
        {selProject ? (
          <>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <h3 style={{margin:0,color:T.text,fontSize:18,fontWeight:700}}>{selProject.title}</h3>
              <div style={{display:'flex',gap:8}}>
                <Btn size="sm" onClick={()=>setTaskModal(true)}><Icon name="plus" size={12}/>Tarea</Btn>
                <Btn size="sm" variant="danger" onClick={()=>delProj(selProject.id)}><Icon name="trash" size={12}/></Btn>
              </div>
            </div>
            {['todo','done'].map(st=>{
              const list = pTasks.filter(t=>t.status===st);
              return (
                <div key={st} style={{marginBottom:16}}>
                  {st==='done'&&list.length>0&&<div style={{color:T.muted,fontSize:12,fontWeight:600,textTransform:'uppercase',letterSpacing:1,marginBottom:8}}>Completadas</div>}
                  {list.map(t=>(
                    <div key={t.id} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,marginBottom:6,opacity:st==='done'?0.6:1}}>
                      <button onClick={()=>toggleTask(t.id)} style={{width:18,height:18,borderRadius:'50%',border:`2px solid ${st==='done'?T.green:T.border}`,background:st==='done'?T.green:'transparent',cursor:'pointer',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
                        {st==='done'&&<Icon name="check" size={10} color="#000"/>}
                      </button>
                      <div style={{width:8,height:8,borderRadius:'50%',background:pColors[t.priority]||T.muted,flexShrink:0}}/>
                      <span style={{color:T.text,fontSize:13,flex:1,textDecoration:st==='done'?'line-through':'none'}}>{t.title}</span>
                      {t.dueDate&&<span style={{color:T.muted,fontSize:11}}>{fmt(t.dueDate)}</span>}
                      <button onClick={()=>delTask(t.id)} style={{background:'none',border:'none',color:T.dim,cursor:'pointer',display:'flex'}}><Icon name="trash" size={13}/></button>
                    </div>
                  ))}
                </div>
              );
            })}
            {pTasks.length===0&&<div style={{textAlign:'center',padding:'40px 0',color:T.dim}}><Icon name="check" size={32}/><p>Sin tareas. ¡Añade la primera!</p></div>}
          </>
        ) : (
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',color:T.dim,textAlign:'center'}}>
            <Icon name="folder" size={48}/><p style={{marginTop:12}}>Selecciona un proyecto o crea uno nuevo</p>
          </div>
        )}
      </div>
      {projModal&&(
        <Modal title="Nuevo proyecto" onClose={()=>setProjModal(false)}>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <Input value={projForm.title} onChange={v=>setProjForm(f=>({...f,title:v}))} placeholder="Nombre del proyecto"/>
            <Select value={projForm.areaId} onChange={v=>setProjForm(f=>({...f,areaId:v}))}>
              <option value="">Sin área</option>
              {data.areas.map(a=><option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
            </Select>
            <Select value={projForm.objectiveId} onChange={v=>setProjForm(f=>({...f,objectiveId:v}))}>
              <option value="">Sin objetivo</option>
              {data.objectives.map(o=><option key={o.id} value={o.id}>{o.title}</option>)}
            </Select>
            <Btn onClick={saveProj}>Crear proyecto</Btn>
          </div>
        </Modal>
      )}
      {taskModal&&(
        <Modal title="Nueva tarea" onClose={()=>setTaskModal(false)}>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <Input value={taskForm.title} onChange={v=>setTaskForm(f=>({...f,title:v}))} placeholder="¿Qué hay que hacer?"/>
            <Select value={taskForm.priority} onChange={v=>setTaskForm(f=>({...f,priority:v}))}>
              <option value="baja">Prioridad baja</option>
              <option value="media">Prioridad media</option>
              <option value="alta">Prioridad alta</option>
            </Select>
            <Input type="date" value={taskForm.dueDate} onChange={v=>setTaskForm(f=>({...f,dueDate:v}))}/>
            <Btn onClick={saveTask}>Crear tarea</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

// NOTES
const Notes = ({ data, setData }) => {
  const [sel, setSel] = useState(null);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({title:'',content:'',tags:'',areaId:''});
  const [search, setSearch] = useState('');
  const save_ = () => {
    if(!form.title.trim()) return;
    const n = {id:uid(),...form,tags:form.tags.split(',').map(t=>t.trim()).filter(Boolean),createdAt:today()};
    const updated = [...data.notes,n];
    setData(d=>({...d,notes:updated})); save('notes',updated);
    setModal(false); setForm({title:'',content:'',tags:'',areaId:''});
    setSel(n);
  };
  const del = (id) => {
    const updated = data.notes.filter(n=>n.id!==id);
    setData(d=>({...d,notes:updated})); save('notes',updated);
    if(sel?.id===id) setSel(null);
  };
  const filtered = data.notes.filter(n=>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div style={{display:'grid',gridTemplateColumns:'240px 1fr',gap:16,height:'100%'}}>
      <div>
        <div style={{marginBottom:12}}>
          <Input value={search} onChange={setSearch} placeholder="Buscar notas..." style={{fontSize:13}}/>
        </div>
        <Btn onClick={()=>setModal(true)} style={{width:'100%',justifyContent:'center',marginBottom:12}} size="sm">
          <Icon name="plus" size={12}/>Nueva nota
        </Btn>
        {filtered.map(n=>(
          <div key={n.id} onClick={()=>setSel(n)}
            style={{padding:'10px 12px',borderRadius:8,cursor:'pointer',marginBottom:4,background:sel?.id===n.id?T.surface2:'transparent',border:`1px solid ${sel?.id===n.id?T.border:'transparent'}`}}>
            <div style={{color:T.text,fontSize:13,fontWeight:500,marginBottom:2}}>{n.title}</div>
            <div style={{color:T.dim,fontSize:11}}>{fmt(n.createdAt)}</div>
          </div>
        ))}
        {filtered.length===0&&<p style={{color:T.dim,fontSize:13}}>Sin notas</p>}
      </div>
      <div>
        {sel ? (
          <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,padding:20,height:'100%',boxSizing:'border-box'}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
              <h3 style={{margin:0,color:T.text,fontSize:18,fontWeight:700}}>{sel.title}</h3>
              <button onClick={()=>del(sel.id)} style={{background:'none',border:'none',color:T.red,cursor:'pointer',display:'flex'}}><Icon name="trash" size={16}/></button>
            </div>
            <div style={{display:'flex',gap:6,marginBottom:12,flexWrap:'wrap'}}>
              {sel.tags?.map(t=><Tag key={t} text={t}/>)}
              {sel.areaId && (()=>{const a=data.areas.find(x=>x.id===sel.areaId);return a?<Tag text={`${a.icon} ${a.name}`} color={a.color}/>:null;})()}
              <span style={{color:T.dim,fontSize:12}}>{fmt(sel.createdAt)}</span>
            </div>
            <p style={{color:T.text,fontSize:14,lineHeight:1.7,whiteSpace:'pre-wrap'}}>{sel.content}</p>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',color:T.dim,textAlign:'center'}}>
            <Icon name="note" size={48}/><p style={{marginTop:12}}>Selecciona o crea una nota</p>
          </div>
        )}
      </div>
      {modal&&(
        <Modal title="Nueva nota" onClose={()=>setModal(false)}>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <Input value={form.title} onChange={v=>setForm(f=>({...f,title:v}))} placeholder="Título"/>
            <Textarea value={form.content} onChange={v=>setForm(f=>({...f,content:v}))} placeholder="Escribe tu nota..." rows={6}/>
            <Input value={form.tags} onChange={v=>setForm(f=>({...f,tags:v}))} placeholder="Tags (separados por coma)"/>
            <Select value={form.areaId} onChange={v=>setForm(f=>({...f,areaId:v}))}>
              <option value="">Sin área</option>
              {data.areas.map(a=><option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
            </Select>
            <Btn onClick={save_}>Guardar nota</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

// INBOX
const Inbox = ({ data, setData }) => {
  const [text, setText] = useState('');
  const add = () => {
    if(!text.trim()) return;
    const n = {id:uid(),content:text.trim(),createdAt:today(),processed:false};
    const updated = [n,...data.inbox];
    setData(d=>({...d,inbox:updated})); save('inbox',updated);
    setText('');
  };
  const process = (id) => {
    const updated = data.inbox.map(i=>i.id===id?{...i,processed:!i.processed}:i);
    setData(d=>({...d,inbox:updated})); save('inbox',updated);
  };
  const del = (id) => {
    const updated = data.inbox.filter(i=>i.id!==id);
    setData(d=>({...d,inbox:updated})); save('inbox',updated);
  };
  const convertToNote = (item) => {
    const n = {id:uid(),title:item.content.slice(0,50),content:item.content,tags:['inbox'],areaId:'',createdAt:today()};
    const updNotes = [...data.notes,n];
    const updInbox = data.inbox.map(i=>i.id===item.id?{...i,processed:true}:i);
    setData(d=>({...d,notes:updNotes,inbox:updInbox}));
    save('notes',updNotes); save('inbox',updInbox);
  };
  const unprocessed = data.inbox.filter(i=>!i.processed);
  const processed = data.inbox.filter(i=>i.processed);
  return (
    <div>
      <h2 style={{margin:'0 0 4px',color:T.text,fontSize:20,fontWeight:700}}>Captura Rápida</h2>
      <p style={{color:T.muted,fontSize:13,marginBottom:20}}>Vuelca aquí cualquier idea. Clasifícala después.</p>
      <div style={{display:'flex',gap:10,marginBottom:24}}>
        <Input value={text} onChange={setText} placeholder="¿Qué tienes en mente?" style={{flex:1}}
          onKeyDown={e=>e.key==='Enter'&&add()}/>
        <Btn onClick={add}><Icon name="plus" size={14}/>Capturar</Btn>
      </div>
      {unprocessed.length>0&&(
        <div style={{marginBottom:20}}>
          <h3 style={{color:T.muted,fontSize:12,fontWeight:600,textTransform:'uppercase',letterSpacing:1,marginBottom:12}}>
            Por procesar ({unprocessed.length})
          </h3>
          {unprocessed.map(i=>(
            <Card key={i.id} style={{marginBottom:8,borderLeft:`3px solid ${T.accent}`}}>
              <div style={{display:'flex',alignItems:'flex-start',gap:10}}>
                <div style={{flex:1}}>
                  <p style={{color:T.text,margin:'0 0 6px',fontSize:14}}>{i.content}</p>
                  <span style={{color:T.dim,fontSize:11}}>{fmt(i.createdAt)}</span>
                </div>
                <div style={{display:'flex',gap:6,flexShrink:0}}>
                  <Btn size="sm" variant="ghost" onClick={()=>convertToNote(i)}>→ Nota</Btn>
                  <Btn size="sm" variant="ghost" onClick={()=>process(i)}>✓ Procesar</Btn>
                  <button onClick={()=>del(i.id)} style={{background:'none',border:'none',color:T.dim,cursor:'pointer',display:'flex'}}><Icon name="trash" size={14}/></button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      {processed.length>0&&(
        <div style={{opacity:0.5}}>
          <h3 style={{color:T.muted,fontSize:12,fontWeight:600,textTransform:'uppercase',letterSpacing:1,marginBottom:12}}>Procesados ({processed.length})</h3>
          {processed.slice(0,5).map(i=>(
            <div key={i.id} style={{display:'flex',gap:10,alignItems:'center',padding:'8px 0',borderBottom:`1px solid ${T.border}`}}>
              <Icon name="check" size={14} color={T.green}/>
              <span style={{color:T.muted,fontSize:13,flex:1}}>{i.content}</span>
              <button onClick={()=>del(i.id)} style={{background:'none',border:'none',color:T.dim,cursor:'pointer',display:'flex'}}><Icon name="trash" size={13}/></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// HABIT TRACKER
const HabitTracker = ({ data, setData }) => {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({name:'',frequency:'daily'});
  const days = Array.from({length:7},(_,i)=>{
    const d = new Date(); d.setDate(d.getDate()-6+i);
    return {date:d.toISOString().split('T')[0], label:d.toLocaleDateString('es-ES',{weekday:'short',day:'numeric'})};
  });
  const toggle = (habitId, date) => {
    const updated = data.habits.map(h=>{
      if(h.id!==habitId) return h;
      const has = h.completions.includes(date);
      return {...h,completions:has?h.completions.filter(d=>d!==date):[...h.completions,date]};
    });
    setData(d=>({...d,habits:updated})); save('habits',updated);
  };
  const add = () => {
    if(!form.name.trim()) return;
    const n = {id:uid(),...form,completions:[]};
    const updated = [...data.habits,n];
    setData(d=>({...d,habits:updated})); save('habits',updated);
    setModal(false); setForm({name:'',frequency:'daily'});
  };
  const del = (id) => {
    const updated = data.habits.filter(h=>h.id!==id);
    setData(d=>({...d,habits:updated})); save('habits',updated);
  };
  const todayStr = today();
  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <h2 style={{margin:0,color:T.text,fontSize:20,fontWeight:700}}>Habit Tracker</h2>
        <Btn onClick={()=>setModal(true)}><Icon name="plus" size={14}/>Nuevo hábito</Btn>
      </div>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr>
              <th style={{color:T.muted,fontSize:12,fontWeight:600,textAlign:'left',padding:'8px 12px',width:180}}>Hábito</th>
              {days.map(d=>(
                <th key={d.date} style={{color:d.date===todayStr?T.accent:T.muted,fontSize:11,fontWeight:600,textAlign:'center',padding:'8px 6px',minWidth:50}}>
                  {d.label.split(' ').map((w,i)=><div key={i}>{w}</div>)}
                </th>
              ))}
              <th style={{width:40}}/>
            </tr>
          </thead>
          <tbody>
            {data.habits.map(h=>{
              const streak = (()=>{let s=0,d=new Date();while(h.completions.includes(d.toISOString().split('T')[0])){s++;d.setDate(d.getDate()-1);}return s;})();
              return (
                <tr key={h.id}>
                  <td style={{padding:'10px 12px'}}>
                    <div style={{color:T.text,fontSize:14,fontWeight:500}}>{h.name}</div>
                    {streak>0&&<div style={{color:T.accent,fontSize:11}}>🔥 {streak} días</div>}
                  </td>
                  {days.map(d=>{
                    const done = h.completions.includes(d.date);
                    return (
                      <td key={d.date} style={{textAlign:'center',padding:'10px 6px'}}>
                        <button onClick={()=>toggle(h.id,d.date)}
                          style={{width:28,height:28,borderRadius:8,border:`2px solid ${done?T.green:T.border}`,background:done?T.green:'transparent',cursor:'pointer',display:'inline-flex',alignItems:'center',justifyContent:'center',transition:'all 0.15s'}}>
                          {done&&<Icon name="check" size={12} color="#000"/>}
                        </button>
                      </td>
                    );
                  })}
                  <td style={{padding:'10px 6px'}}>
                    <button onClick={()=>del(h.id)} style={{background:'none',border:'none',color:T.dim,cursor:'pointer',display:'flex'}}><Icon name="trash" size={14}/></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {data.habits.length===0&&<div style={{textAlign:'center',padding:'40px 0',color:T.dim}}><p>Sin hábitos. ¡Empieza hoy!</p></div>}
      </div>
      {modal&&(
        <Modal title="Nuevo hábito" onClose={()=>setModal(false)}>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <Input value={form.name} onChange={v=>setForm(f=>({...f,name:v}))} placeholder="Nombre del hábito"/>
            <Select value={form.frequency} onChange={v=>setForm(f=>({...f,frequency:v}))}>
              <option value="daily">Diario</option>
              <option value="weekly">Semanal</option>
            </Select>
            <Btn onClick={add}>Crear hábito</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

// AI ASSISTANT
const AIAssistant = ({ data }) => {
  const [messages, setMessages] = useState([
    {role:'assistant',content:'¡Hola! Soy tu asistente de IA. Puedo consultar toda la información de tu Segundo Cerebro. Pregúntame lo que quieras: ¿qué proyectos tienes activos? ¿cuáles son tus objetivos? ¿qué notas tienes sobre un tema? 🧠'}
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:'smooth'}); },[messages]);

  const buildContext = useCallback(() => {
    const ctx = {
      areas: data.areas.map(a=>({name:a.name,icon:a.icon})),
      objectives: data.objectives.map(o=>({title:o.title,status:o.status,deadline:o.deadline,area:data.areas.find(a=>a.id===o.areaId)?.name||'Sin área'})),
      projects: data.projects.map(p=>({title:p.title,status:p.status,objective:data.objectives.find(o=>o.id===p.objectiveId)?.title||'Sin objetivo'})),
      tasks: data.tasks.map(t=>({title:t.title,status:t.status,priority:t.priority,project:data.projects.find(p=>p.id===t.projectId)?.title||'Sin proyecto',dueDate:t.dueDate})),
      notes: data.notes.map(n=>({title:n.title,content:n.content,tags:n.tags})),
      inbox: data.inbox.filter(i=>!i.processed).map(i=>({content:i.content})),
      habits: data.habits.map(h=>({name:h.name,streak:(()=>{let s=0,d=new Date();while(h.completions.includes(d.toISOString().split('T')[0])){s++;d.setDate(d.getDate()-1);}return s;})()})),
    };
    return JSON.stringify(ctx,null,2);
  },[data]);

  const send = async () => {
    if(!input.trim()||loading) return;
    const userMsg = {role:'user',content:input};
    setMessages(m=>[...m,userMsg]);
    setInput(''); setLoading(true);
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          model:'claude-sonnet-4-20250514',
          max_tokens:1000,
          system:`Eres el asistente de IA integrado en el Segundo Cerebro del usuario. Tienes acceso a toda su información personal: áreas de vida, objetivos, proyectos, tareas, notas, inbox y hábitos. Responde de forma concisa, útil y en español. Ayuda al usuario a encontrar información, hacer conexiones entre datos y reflexionar sobre su sistema de organización.

DATOS DEL SEGUNDO CEREBRO:
${buildContext()}`,
          messages:[...messages,userMsg].map(m=>({role:m.role,content:m.content})),
        })
      });
      const d = await res.json();
      const reply = d.content?.[0]?.text || 'No pude procesar la respuesta.';
      setMessages(m=>[...m,{role:'assistant',content:reply}]);
    } catch(e) {
      setMessages(m=>[...m,{role:'assistant',content:'Error al conectar con la IA. Verifica tu conexión.'}]);
    }
    setLoading(false);
  };

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%'}}>
      <h2 style={{margin:'0 0 4px',color:T.text,fontSize:20,fontWeight:700}}>IA — Tu asistente personal</h2>
      <p style={{color:T.muted,fontSize:13,marginBottom:16}}>Consulta tu Segundo Cerebro con lenguaje natural</p>
      <div style={{flex:1,overflowY:'auto',marginBottom:16,display:'flex',flexDirection:'column',gap:12}}>
        {messages.map((m,i)=>(
          <div key={i} style={{display:'flex',justifyContent:m.role==='user'?'flex-end':'flex-start'}}>
            <div style={{maxWidth:'80%',padding:'10px 14px',borderRadius:12,background:m.role==='user'?T.accent:T.surface,color:m.role==='user'?'#000':T.text,fontSize:14,lineHeight:1.6,
              borderBottomRightRadius:m.role==='user'?2:12,borderBottomLeftRadius:m.role==='assistant'?2:12}}>
              {m.content}
            </div>
          </div>
        ))}
        {loading&&(
          <div style={{display:'flex',justifyContent:'flex-start'}}>
            <div style={{padding:'10px 16px',borderRadius:12,background:T.surface,color:T.muted,fontSize:14}}>
              <span>Pensando</span>
              {[0,1,2].map(i=><span key={i} style={{display:'inline-block',animation:`bounce 1s ${i*0.2}s infinite`,marginLeft:2}}>.</span>)}
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>
      <div style={{display:'flex',gap:10}}>
        <Input value={input} onChange={setInput} placeholder="Pregunta algo sobre tu Segundo Cerebro..." style={{flex:1}}
          onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&send()}/>
        <Btn onClick={send} style={{flexShrink:0}}><Icon name="send" size={14}/>Enviar</Btn>
      </div>
      <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}`}</style>
    </div>
  );
};

// ===================== MAIN APP =====================
const NAV = [
  {id:'dashboard',label:'Inicio',icon:'brain'},
  {id:'areas',label:'Áreas',icon:'grid'},
  {id:'objectives',label:'Objetivos',icon:'target'},
  {id:'projects',label:'Proyectos & Tareas',icon:'folder'},
  {id:'notes',label:'Notas',icon:'note'},
  {id:'inbox',label:'Inbox',icon:'inbox'},
  {id:'habits',label:'Hábitos',icon:'habit'},
  {id:'ai',label:'IA Asistente',icon:'ai'},
];

export default function App() {
  const [view, setView] = useState('dashboard');
  const [data, setData] = useState(null);

  useEffect(()=>{
    (async()=>{
      const def = initData();
      const [areas,objectives,projects,tasks,notes,inbox,habits] = await Promise.all([
        load('areas',def.areas),
        load('objectives',def.objectives),
        load('projects',def.projects),
        load('tasks',def.tasks),
        load('notes',def.notes),
        load('inbox',def.inbox),
        load('habits',def.habits),
      ]);
      // Link objectives to areas if needed
      const linkedObj = objectives.map(o=>({...o,areaId:o.areaId||areas[0]?.id||''}));
      setData({areas,objectives:linkedObj,projects,tasks,notes,inbox,habits});
    })();
  },[]);

  if(!data) return <div style={{background:T.bg,height:'100vh',display:'flex',alignItems:'center',justifyContent:'center',color:T.muted,fontFamily:'system-ui'}}>Cargando tu Segundo Cerebro...</div>;

  const inboxCount = data.inbox.filter(i=>!i.processed).length;
  const views = {dashboard:<Dashboard data={data}/>,areas:<Areas data={data} setData={setData}/>,objectives:<Objectives data={data} setData={setData}/>,projects:<ProjectsAndTasks data={data} setData={setData}/>,notes:<Notes data={data} setData={setData}/>,inbox:<Inbox data={data} setData={setData}/>,habits:<HabitTracker data={data} setData={setData}/>,ai:<AIAssistant data={data}/>};

  return (
    <div style={{display:'flex',height:'100vh',background:T.bg,fontFamily:"'DM Sans', system-ui, sans-serif",color:T.text,overflow:'hidden'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 3px; }
        input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.5); }
        select option { background: ${T.surface}; }
      `}</style>
      {/* SIDEBAR */}
      <div style={{width:220,background:T.surface,borderRight:`1px solid ${T.border}`,display:'flex',flexDirection:'column',flexShrink:0}}>
        <div style={{padding:'20px 16px 16px',borderBottom:`1px solid ${T.border}`}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:32,height:32,background:`linear-gradient(135deg,${T.accent},${T.orange})`,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Icon name="brain" size={16} color="#000"/>
            </div>
            <div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:700,color:T.text,lineHeight:1}}>Segundo</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:700,color:T.accent,lineHeight:1}}>Cerebro</div>
            </div>
          </div>
        </div>
        <nav style={{flex:1,padding:'12px 8px',overflowY:'auto'}}>
          {NAV.map(item=>{
            const active = view===item.id;
            const badge = item.id==='inbox'&&inboxCount>0?inboxCount:null;
            return (
              <button key={item.id} onClick={()=>setView(item.id)}
                style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'8px 12px',borderRadius:8,border:'none',cursor:'pointer',textAlign:'left',fontFamily:'inherit',fontSize:13,fontWeight:active?600:400,
                  background:active?`${T.accent}18`:'transparent',color:active?T.accent:T.muted,marginBottom:2,transition:'all 0.15s',position:'relative'}}>
                <Icon name={item.icon} size={16} color={active?T.accent:undefined}/>
                <span>{item.label}</span>
                {badge&&<span style={{marginLeft:'auto',background:T.red,color:'#fff',fontSize:10,fontWeight:700,padding:'1px 6px',borderRadius:10}}>{badge}</span>}
              </button>
            );
          })}
        </nav>
        <div style={{padding:'12px 16px',borderTop:`1px solid ${T.border}`,fontSize:11,color:T.dim,textAlign:'center'}}>
          Basado en el método de Tiago Forte
        </div>
      </div>
      {/* MAIN CONTENT */}
      <main style={{flex:1,overflowY:'auto',padding:28}}>
        {views[view]}
      </main>
    </div>
  );
}
