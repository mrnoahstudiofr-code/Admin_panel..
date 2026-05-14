import { useState, useRef } from "react";
import { Shield, Ban, Volume2, AlertTriangle, Plus, Trash2, CheckCircle2, XCircle, FileText, Eye, MessageSquare, Lock, Ticket, Send, Navigation, Gift, Star, Crown, Users, Tag, Heart, UserX, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

const ITEMS = [
  { id:"argent", label:"💰 Argent" },
  { id:"arme", label:"🔫 Arme" },
  { id:"vehicule", label:"🚗 Véhicule" },
  { id:"nourriture", label:"🍔 Nourriture" },
  { id:"munitions", label:"🎯 Munitions" },
  { id:"medkit", label:"💊 Medkit" },
  { id:"drogue", label:"🌿 Drogue" },
  { id:"custom", label:"📦 Autre (custom)" },
];
const SANCTION_TYPES = ["ban","jail","mute","warn"];
const DEFAULT_STAFF = [
  { id:1, name:"Modérateur", color:"#3b82f6", icon:"🛡️" },
  { id:2, name:"Administrateur", color:"#8b5cf6", icon:"⚡" },
  { id:3, name:"Fondateur", color:"#f59e0b", icon:"👑" },
];
const DEFAULT_WL = [
  { id:1, name:"Policier", color:"#3b82f6", icon:"👮" },
  { id:2, name:"Médecin", color:"#10b981", icon:"🏥" },
  { id:3, name:"Mécanicien", color:"#f97316", icon:"🔧" },
];
const COLORS = ["#3b82f6","#8b5cf6","#f59e0b","#10b981","#ef4444","#f97316","#ec4899","#06b6d4","#84cc16","#6366f1"];
const ICONS  = ["🛡️","⚡","👑","👮","🏥","🔧","🚒","🎖️","🌟","💎","🔑","🎯","🗡️","🏆","🚔","⚕️","🧑‍✈️","🕵️"];

function fmt(secs) {
  const h=Math.floor(secs/3600), m=Math.floor((secs%3600)/60), s=secs%60;
  return [h>0&&String(h).padStart(2,"0"), String(m).padStart(2,"0"), String(s).padStart(2,"0")].filter(Boolean).join(":");
}

function TpaWidget() {
  const [from, setFrom] = useState("");
  const [to,   setTo  ] = useState("");
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 items-center">
        <input value={from} onChange={e=>setFrom(e.target.value)} placeholder="ID source..."
          className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none"/>
        <span className="text-slate-400 text-lg font-bold">→</span>
        <input value={to} onChange={e=>setTo(e.target.value)} placeholder="ID destination..."
          className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none"/>
      </div>
      <button onClick={()=>{ if(!from.trim()||!to.trim()) return alert("Les deux IDs sont requis"); alert("🔀 TPA : ID "+from.trim()+" → ID "+to.trim()); setFrom(""); setTo(""); }}
        className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium">
        🔀 Téléporter
      </button>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("admin");

  /* ---- users ---- */
  const [users, setUsers] = useState([
    { id:1, name:"1", banned:false, muted:false, jailed:false, warns:0, sanctions:[], staffRoles:[], wlRoles:[] },
    { id:2, name:"2", banned:false, muted:false, jailed:false, warns:1, sanctions:[], staffRoles:[], wlRoles:[] },
  ]);
  const [newUser, setNewUser]   = useState("");
  const [editingId, setEditId]  = useState(null);
  const [editValue, setEditVal] = useState("");
  const [expandedUser, setExp]  = useState(null);

  /* ---- roles ---- */
  const [staffRoles, setStaffRoles] = useState(DEFAULT_STAFF);
  const [wlRoles,    setWlRoles   ] = useState(DEFAULT_WL);
  const [newRoleName,  setRName]  = useState("");
  const [newRoleIcon,  setRIcon]  = useState("🛡️");
  const [newRoleColor, setRColor] = useState("#3b82f6");
  const [roleTab, setRoleTab]     = useState("staff");

  /* ---- outils ---- */
  const [fly,       setFly     ] = useState(false);
  const [noclip,    setNoclip  ] = useState(false);
  const [trackId,   setTrackId ] = useState("");
  const [tracking,  setTracking] = useState(null);
  const [followId,  setFollowId] = useState("");
  const [following, setFollowing] = useState(null);

  /* ---- tickets ---- */
  const [tickets, setTickets] = useState([
    { id:1, title:"Problème connexion", creator:"ID 1234", status:"open", claimedBy:null,
      comments:[{id:1,author:"ID 1234",text:"Je ne peux pas me connecter",date:new Date().toLocaleString("fr-FR")}],
      createdAt:new Date().toLocaleString("fr-FR") },
  ]);
  const [newTTitle,   setNTTitle  ] = useState("");
  const [newTDesc,    setNTDesc   ] = useState("");
  const [newTCreator, setNTCreator] = useState("");
  const [commentMap,  setComMap   ] = useState({});

  /* ---- co staff ---- */
  const [coSession, setCoSess]  = useState(null);
  const [coElapsed, setCoEl  ]  = useState(0);
  const [coLogs,    setCoLogs]  = useState([]);
  const timerRef = useRef(null);
  const startCo = () => { const s=Date.now(); setCoSess(s); setCoEl(0); timerRef.current=setInterval(()=>setCoEl(Math.floor((Date.now()-s)/1000)),1000); };
  const stopCo  = () => { clearInterval(timerRef.current); setCoLogs(p=>[{id:Date.now(),dur:fmt(coElapsed),date:new Date().toLocaleString("fr-FR")},...p]); setCoSess(null); setCoEl(0); };

  /* ---- modal ---- */
  const [modal,       setModal   ] = useState(null);
  const [reason,      setReason  ] = useState("");
  const [duration,    setDuration] = useState("");
  const [durType,     setDurType ] = useState("minutes");
  const [giveItem,    setGiveItem] = useState("argent");
  const [giveCustom,  setGiveCust] = useState("");
  const [giveQty,     setGiveQty ] = useState(1);
  const [obsText,     setObsText ] = useState("");
  const [msgText,     setMsgText ] = useState("");

  const openModal = (type, opts={}) => { setModal({type,...opts}); setReason(""); setDuration(""); setObsText(""); setMsgText(""); setGiveItem("argent"); setGiveCust(""); setGiveQty(1); };
  const closeModal = () => setModal(null);

  /* ---- helpers ---- */
  const addUser = () => { if(!newUser.trim()) return; setUsers([...users,{id:Date.now(),name:newUser.trim(),banned:false,muted:false,jailed:false,warns:0,sanctions:[],staffRoles:[],wlRoles:[]}]); setNewUser(""); };
  const saveEdit = uid => { if(editValue.trim()) setUsers(users.map(u=>u.id===uid?{...u,name:editValue.trim()}:u)); setEditId(null); };
  const removeSanc = (uid,type) => setUsers(users.map(u=>u.id!==uid?u:{...u,[type==="ban"?"banned":type==="mute"?"muted":"jailed"]:false}));

  const applySanction = () => {
    if(!reason.trim()) return alert("Raison requise");
    const s={id:Date.now(),type:modal.type,reason,duration:duration?duration+" "+durType:null,date:new Date().toLocaleString("fr-FR")};
    setUsers(users.map(u=>{
      if(u.id!==modal.userId) return u;
      const sanctions=[...u.sanctions,s];
      if(modal.type==="ban")  return{...u,banned:true,sanctions};
      if(modal.type==="mute") return{...u,muted:true,sanctions};
      if(modal.type==="jail") return{...u,jailed:true,sanctions};
      if(modal.type==="warn") return{...u,warns:u.warns+1,sanctions};
      return u;
    }));
    closeModal();
  };

  const toggleRole = (uid,roleId,type) => setUsers(users.map(u=>{
    if(u.id!==uid) return u;
    const key=type==="staff"?"staffRoles":"wlRoles";
    const has=u[key].includes(roleId);
    return{...u,[key]:has?u[key].filter(r=>r!==roleId):[...u[key],roleId]};
  }));

  const addRole = type => {
    if(!newRoleName.trim()) return;
    const r={id:Date.now(),name:newRoleName.trim(),color:newRoleColor,icon:newRoleIcon};
    type==="staff"?setStaffRoles([...staffRoles,r]):setWlRoles([...wlRoles,r]);
    setRName(""); setRIcon("🛡️"); setRColor("#3b82f6");
  };
  const delRole = (id,type) => {
    type==="staff"?setStaffRoles(staffRoles.filter(r=>r.id!==id)):setWlRoles(wlRoles.filter(r=>r.id!==id));
    setUsers(users.map(u=>({...u,staffRoles:u.staffRoles.filter(r=>r!==id),wlRoles:u.wlRoles.filter(r=>r!==id)})));
  };
  const getRoleObj = (id,type) => (type==="staff"?staffRoles:wlRoles).find(r=>r.id===id);

  const addComment = tid => {
    const txt=(commentMap[tid]||"").trim(); if(!txt) return;
    setTickets(tickets.map(t=>t.id===tid?{...t,comments:[...t.comments,{id:Date.now(),author:"Admin",text:txt,date:new Date().toLocaleString("fr-FR")}]}:t));
    setComMap({...commentMap,[tid]:""});
  };
  const createTicket = () => {
    if(!newTTitle.trim()||!newTDesc.trim()) return alert("Titre et description requis");
    const creator = newTCreator.trim() ? "ID "+newTCreator.trim() : "ID "+Math.floor(1000+Math.random()*9000);
    setTickets([{id:Date.now(),title:newTTitle.trim(),creator,status:"open",claimedBy:null,
      comments:[{id:Date.now(),author:creator,text:newTDesc.trim(),date:new Date().toLocaleString("fr-FR")}],
      createdAt:new Date().toLocaleString("fr-FR")},...tickets]);
    setNTTitle(""); setNTDesc(""); setNTCreator("");
  };

  const TABS = [
    {key:"admin",  label:"🛡️ Admin"},
    {key:"roles",  label:"🎭 Rôles"},
    {key:"outils", label:"🔧 Outils"},
    {key:"tickets",label:"🎫 Tickets"},
    {key:"staff",  label:coSession?"🟢 Co ("+fmt(coElapsed)+")":"⚫ Co Staff"},
  ];

  const quickActions = [
    {id:"heal",      icon:<Heart className="w-4 h-4"/>,      label:"Soigner",    cls:"bg-rose-600 hover:bg-rose-700",    action:u=>openModal("heal",{userId:u.id})},
    {id:"unban",     icon:<Ban className="w-4 h-4"/>,        label:"Unban",      cls:"bg-red-700 hover:bg-red-800",      action:u=>removeSanc(u.id,"ban"), disabled:u=>!u.banned},
    {id:"resetperso",icon:<UserX className="w-4 h-4"/>,      label:"Reset Perso",cls:"bg-orange-600 hover:bg-orange-700",action:u=>openModal("resetperso",{userId:u.id})},
    {id:"reset",     icon:<RefreshCw className="w-4 h-4"/>,  label:"Reset",      cls:"bg-slate-600 hover:bg-slate-500",  action:u=>openModal("reset",{userId:u.id})},
  ];

  const userName = uid => users.find(u=>u.id===uid)?.name ?? "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="bg-slate-800 rounded-xl p-4 mb-4 border border-slate-700">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-7 h-7 text-blue-400"/>
            <h1 className="text-2xl font-bold text-white">Panel Administration</h1>
          </div>
          <div className="flex gap-2 flex-wrap">
            {TABS.map(({key,label})=>(
              <button key={key} onClick={()=>setView(key)}
                className={"px-3 py-1.5 rounded-lg text-sm font-medium transition-colors "+(view===key?"bg-blue-600 text-white":"bg-slate-700 text-slate-300 hover:bg-slate-600")}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ===== ADMIN ===== */}
        {view==="admin"&&(
          <div className="space-y-4">
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex gap-3">
              <input value={newUser} onChange={e=>setNewUser(e.target.value)} onKeyPress={e=>e.key==="Enter"&&addUser()} placeholder="ID joueur..."
                className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              <button onClick={addUser} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"><Plus className="w-4 h-4"/></button>
            </div>

            {users.map(user=>(
              <div key={user.id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">ID</div>
                      <div>
                        {editingId===user.id?(
                          <div className="flex items-center gap-2">
                            <input autoFocus value={editValue} onChange={e=>setEditVal(e.target.value)} onKeyPress={e=>e.key==="Enter"&&saveEdit(user.id)}
                              className="px-2 py-1 bg-slate-700 border border-blue-500 rounded-lg text-white text-sm w-28 focus:outline-none"/>
                            <button onClick={()=>saveEdit(user.id)} className="text-green-400 text-xs font-bold">✓</button>
                            <button onClick={()=>setEditId(null)} className="text-slate-400 text-xs">✕</button>
                          </div>
                        ):(
                          <button onClick={()=>{setEditId(user.id);setEditVal(user.name);}} className="text-white font-semibold hover:text-blue-300 flex items-center gap-1 group">
                            <span>ID: {user.name}</span><span className="text-slate-500 text-xs group-hover:text-blue-400">✏️</span>
                          </button>
                        )}
                        <div className="flex gap-1 mt-0.5 flex-wrap">
                          {user.banned&&<span className="px-1.5 py-0.5 bg-red-600 text-white text-xs rounded-full">Banni</span>}
                          {user.jailed&&<span className="px-1.5 py-0.5 bg-gray-600 text-white text-xs rounded-full">Jail</span>}
                          {user.muted &&<span className="px-1.5 py-0.5 bg-orange-600 text-white text-xs rounded-full">Muté</span>}
                          {user.warns>0&&<span className="px-1.5 py-0.5 bg-yellow-600 text-white text-xs rounded-full">{user.warns}w</span>}
                          {user.staffRoles.map(rid=>{const r=getRoleObj(rid,"staff");return r?<span key={rid} className="px-1.5 py-0.5 text-white text-xs rounded-full" style={{backgroundColor:r.color}}>{r.icon} {r.name}</span>:null;})}
                          {user.wlRoles.map(rid=>{const r=getRoleObj(rid,"wl");return r?<span key={rid} className="px-1.5 py-0.5 text-white text-xs rounded-full border" style={{borderColor:r.color,color:r.color}}>{r.icon} {r.name}</span>:null;})}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={()=>setExp(expandedUser===user.id?null:user.id)} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
                        {expandedUser===user.id?<ChevronUp className="w-4 h-4"/>:<ChevronDown className="w-4 h-4"/>}
                      </button>
                      <button onClick={()=>setUsers(users.filter(u=>u.id!==user.id))} className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  </div>

                  {/* Quick actions */}
                  <div className="grid grid-cols-4 gap-1.5">
                    {quickActions.map(({id,icon,label,cls,action,disabled})=>(
                      <button key={id} onClick={()=>action(user)} disabled={disabled?.(user)}
                        className={"flex flex-col items-center gap-0.5 py-2 rounded-lg text-xs font-medium text-white transition-colors disabled:opacity-40 "+cls}>
                        {icon}{label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Expanded */}
                {expandedUser===user.id&&(
                  <div className="border-t border-slate-700 p-4 bg-slate-900/40 space-y-2">
                    <div className="grid grid-cols-5 gap-1.5">
                      {[
                        {label:user.banned?"Unban":"Ban",  active:user.banned, color:"red",    icon:<Ban className="w-3.5 h-3.5"/>,      action:()=>user.banned?removeSanc(user.id,"ban"):openModal("ban",{userId:user.id})},
                        {label:user.jailed?"Unjail":"Jail",active:user.jailed, color:"gray",   icon:<Lock className="w-3.5 h-3.5"/>,     action:()=>user.jailed?removeSanc(user.id,"jail"):openModal("jail",{userId:user.id})},
                        {label:user.muted?"Unmute":"Mute", active:user.muted,  color:"orange", icon:<Volume2 className="w-3.5 h-3.5"/>,  action:()=>user.muted?removeSanc(user.id,"mute"):openModal("mute",{userId:user.id})},
                        {label:"+Warn", active:false, color:null, icon:<Plus className="w-3.5 h-3.5"/>,          action:()=>openModal("warn",{userId:user.id})},
                        {label:"-Warn", active:false, color:null, icon:<AlertTriangle className="w-3.5 h-3.5"/>, action:()=>setUsers(users.map(u=>u.id===user.id?{...u,warns:Math.max(0,u.warns-1)}:u)), disabled:user.warns===0},
                      ].map(({label,active,color,icon,action,disabled})=>(
                        <button key={label} onClick={action} disabled={!!disabled}
                          className={"flex flex-col items-center gap-0.5 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 "+(active?(color==="red"?"bg-red-600 text-white":color==="gray"?"bg-gray-500 text-white":"bg-orange-600 text-white"):"bg-slate-700 text-slate-300 hover:bg-slate-600")}>
                          {icon}{label}
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-5 gap-1.5">
                      <button onClick={()=>openModal("observation",{userId:user.id})} className="flex flex-col items-center gap-0.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium"><FileText className="w-3.5 h-3.5"/>Obs.</button>
                      <button onClick={()=>openModal("message",{userId:user.id})}     className="flex flex-col items-center gap-0.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium"><MessageSquare className="w-3.5 h-3.5"/>Msg</button>
                      <button onClick={()=>openModal("tp",{userId:user.id})}          className="flex flex-col items-center gap-0.5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-medium"><Navigation className="w-3.5 h-3.5"/>TP</button>
                      <button onClick={()=>openModal("to",{userId:user.id})}          className="flex flex-col items-center gap-0.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium"><Eye className="w-3.5 h-3.5"/>TO</button>
                      <button onClick={()=>openModal("give",{userId:user.id})}        className="flex flex-col items-center gap-0.5 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-xs font-medium"><Gift className="w-3.5 h-3.5"/>Give</button>
                    </div>
                    <button onClick={()=>openModal("assignRoles",{userId:user.id})} className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium">
                      <Tag className="w-3.5 h-3.5"/>Gérer les rôles
                    </button>
                    {user.sanctions.length>0&&(
                      <div className="space-y-1.5 pt-1">
                        {user.sanctions.slice(-2).reverse().map(s=>(
                          <div key={s.id} className="bg-slate-700 rounded-lg p-2.5 text-xs">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className={"px-1.5 py-0.5 rounded text-white font-bold uppercase "+(s.type==="ban"?"bg-red-600":s.type==="jail"?"bg-gray-600":s.type==="mute"?"bg-orange-600":"bg-yellow-600")}>{s.type}</span>
                              {s.duration&&<span className="text-slate-400">{s.duration}</span>}
                            </div>
                            <p className="text-slate-300">{s.reason}</p>
                            <p className="text-slate-500 mt-0.5">{s.date}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ===== RÔLES ===== */}
        {view==="roles"&&(
          <div className="space-y-4">
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <div className="flex gap-2 mb-4">
                <button onClick={()=>setRoleTab("staff")} className={"flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 "+(roleTab==="staff"?"bg-indigo-600 text-white":"bg-slate-700 text-slate-300 hover:bg-slate-600")}>
                  <Crown className="w-4 h-4"/>Rôles Staff
                </button>
                <button onClick={()=>setRoleTab("wl")} className={"flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 "+(roleTab==="wl"?"bg-emerald-600 text-white":"bg-slate-700 text-slate-300 hover:bg-slate-600")}>
                  <Star className="w-4 h-4"/>Rôles WL
                </button>
              </div>
              <div className="bg-slate-700 rounded-xl p-4 mb-4 border border-slate-600">
                <p className="text-white font-semibold text-sm mb-3">➕ Créer un rôle {roleTab==="staff"?"Staff":"WL"}</p>
                <input value={newRoleName} onChange={e=>setRName(e.target.value)} placeholder="Nom du rôle..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none mb-3"/>
                <p className="text-slate-400 text-xs mb-2">Icône</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {ICONS.map(ic=>(
                    <button key={ic} onClick={()=>setRIcon(ic)} className={"w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all "+(newRoleIcon===ic?"bg-blue-600 ring-2 ring-blue-400":"bg-slate-800 hover:bg-slate-600")}>{ic}</button>
                  ))}
                </div>
                <p className="text-slate-400 text-xs mb-2">Couleur</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {COLORS.map(c=>(
                    <button key={c} onClick={()=>setRColor(c)} className={"w-7 h-7 rounded-full border-2 transition-all "+(newRoleColor===c?"border-white scale-110":"border-transparent")} style={{backgroundColor:c}}/>
                  ))}
                </div>
                {newRoleName.trim()&&<div className="flex items-center gap-2 mb-3 p-2 bg-slate-800 rounded-lg"><span className="text-sm text-slate-400">Aperçu :</span><span className="px-2 py-0.5 text-white text-xs rounded-full" style={{backgroundColor:newRoleColor}}>{newRoleIcon} {newRoleName}</span></div>}
                <button onClick={()=>addRole(roleTab)} className={"w-full py-2 text-white rounded-lg font-medium flex items-center justify-center gap-2 "+(roleTab==="staff"?"bg-indigo-600 hover:bg-indigo-700":"bg-emerald-600 hover:bg-emerald-700")}>
                  <Plus className="w-4 h-4"/>Créer le rôle
                </button>
              </div>
              <div className="space-y-2">
                {(roleTab==="staff"?staffRoles:wlRoles).map(role=>{
                  const cnt=users.filter(u=>(roleTab==="staff"?u.staffRoles:u.wlRoles).includes(role.id)).length;
                  return(
                    <div key={role.id} className="flex items-center justify-between bg-slate-700 rounded-xl p-3 border border-slate-600">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xl" style={{backgroundColor:role.color+"33",border:"1px solid "+role.color}}>{role.icon}</div>
                        <div>
                          <p className="text-white font-semibold text-sm">{role.name}</p>
                          <p className="text-slate-400 text-xs flex items-center gap-1"><Users className="w-3 h-3"/>{cnt} joueur{cnt>1?"s":""}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-white text-xs rounded-full" style={{backgroundColor:role.color}}>{role.icon} {role.name}</span>
                        <button onClick={()=>delRole(role.id,roleTab)} className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                      </div>
                    </div>
                  );
                })}
                {(roleTab==="staff"?staffRoles:wlRoles).length===0&&<p className="text-slate-500 text-sm text-center py-4">Aucun rôle créé</p>}
              </div>
            </div>
          </div>
        )}

        {/* ===== OUTILS ===== */}
        {view==="outils"&&(
          <div className="space-y-3">
            {/* FLY */}
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🛫</span>
                <div><p className="text-white font-semibold text-sm">Fly</p><p className="text-slate-400 text-xs">Mode vol admin</p></div>
              </div>
              <button onClick={()=>setFly(!fly)} className={"relative w-14 h-7 rounded-full transition-colors "+(fly?"bg-blue-600":"bg-slate-600")}>
                <span className={"absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all "+(fly?"left-8":"left-1")}/>
              </button>
            </div>
            {/* NOCLIP */}
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">👻</span>
                <div><p className="text-white font-semibold text-sm">No Clip</p><p className="text-slate-400 text-xs">Traverser les murs</p></div>
              </div>
              <button onClick={()=>setNoclip(!noclip)} className={"relative w-14 h-7 rounded-full transition-colors "+(noclip?"bg-purple-600":"bg-slate-600")}>
                <span className={"absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all "+(noclip?"left-8":"left-1")}/>
              </button>
            </div>
            {/* TRACK */}
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">📡</span>
                <div><p className="text-white font-semibold text-sm">Track All</p><p className="text-slate-400 text-xs">Localiser un joueur</p></div>
              </div>
              {tracking&&(
                <div className="flex items-center justify-between bg-green-900/30 border border-green-600 rounded-xl px-3 py-2 mb-3">
                  <span className="text-green-300 text-sm">📡 Tracking ID <span className="font-bold text-white">{tracking}</span></span>
                  <button onClick={()=>setTracking(null)} className="text-red-400 hover:text-red-300 text-xs font-bold">✕ Stop</button>
                </div>
              )}
              <div className="flex gap-2">
                <input value={trackId} onChange={e=>setTrackId(e.target.value)} placeholder="ID joueur à tracker..."
                  className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none"/>
                <button onClick={()=>{if(!trackId.trim())return;setTracking(trackId.trim());setTrackId("");}}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium">Track</button>
              </div>
            </div>
            {/* TPA */}
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🔀</span>
                <div><p className="text-white font-semibold text-sm">TPA</p><p className="text-slate-400 text-xs">Téléporter un joueur vers un autre</p></div>
              </div>
              <TpaWidget/>
            </div>
            {/* FOLLOW */}
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">👁️</span>
                <div><p className="text-white font-semibold text-sm">Suivre</p><p className="text-slate-400 text-xs">Suivre un joueur en spectateur</p></div>
              </div>
              {following&&(
                <div className="flex items-center justify-between bg-indigo-900/30 border border-indigo-500 rounded-xl px-3 py-2 mb-3">
                  <span className="text-indigo-300 text-sm">👁️ Spectateur de ID <span className="font-bold text-white">{following}</span></span>
                  <button onClick={()=>setFollowing(null)} className="text-red-400 hover:text-red-300 text-xs font-bold">✕ Stop</button>
                </div>
              )}
              <div className="flex gap-2">
                <input value={followId} onChange={e=>setFollowId(e.target.value)} placeholder="ID joueur à suivre..."
                  className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none"/>
                <button onClick={()=>{if(!followId.trim())return;setFollowing(followId.trim());setFollowId("");}}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium">Suivre</button>
              </div>
            </div>
          </div>
        )}

        {/* ===== TICKETS ===== */}
        {view==="tickets"&&(
          <div className="space-y-4">
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 space-y-3">
              <h2 className="text-white font-semibold flex items-center gap-2"><Plus className="w-4 h-4 text-green-400"/>Créer un ticket</h2>
              <input value={newTCreator} onChange={e=>setNTCreator(e.target.value)} placeholder="ID du joueur (ex: 3690) — optionnel"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none"/>
              <input value={newTTitle} onChange={e=>setNTTitle(e.target.value)} placeholder="Titre *"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none"/>
              <textarea value={newTDesc} onChange={e=>setNTDesc(e.target.value)} placeholder="Description *" rows="3"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none resize-none"/>
              <button onClick={createTicket} className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"><Ticket className="w-4 h-4"/>Créer</button>
            </div>
            {tickets.map(ticket=>(
              <div key={ticket.id} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-white font-semibold">{ticket.title}</p>
                      <span className={"px-2 py-0.5 rounded-full text-xs text-white "+(ticket.status==="open"?"bg-green-600":ticket.status==="claimed"?"bg-blue-600":"bg-gray-600")}>
                        {ticket.status==="open"?"🟢 Ouvert":ticket.status==="claimed"?"🔵 En cours":"⚫ Fermé"}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs">{ticket.creator} · {ticket.createdAt}</p>
                    {ticket.claimedBy&&<p className="text-blue-400 text-xs">👤 {ticket.claimedBy}</p>}
                  </div>
                  <button onClick={()=>setTickets(tickets.filter(t=>t.id!==ticket.id))} className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                </div>
                <div className="flex gap-2 mb-3 flex-wrap">
                  <button onClick={()=>setTickets(tickets.map(t=>t.id===ticket.id?{...t,claimedBy:"Admin",status:"claimed"}:t))} disabled={ticket.status!=="open"} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium disabled:opacity-50"><CheckCircle2 className="w-3.5 h-3.5"/>Claim</button>
                  <button onClick={()=>setTickets(tickets.map(t=>t.id===ticket.id?{...t,status:"closed"}:t))} disabled={ticket.status==="closed"} className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium disabled:opacity-50"><XCircle className="w-3.5 h-3.5"/>Close</button>
                  <button onClick={()=>openModal("tp",{creator:ticket.creator})} disabled={ticket.status==="closed"} className="flex items-center gap-1 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-medium disabled:opacity-50"><Navigation className="w-3.5 h-3.5"/>TP</button>
                  <button onClick={()=>openModal("to",{creator:ticket.creator})} disabled={ticket.status==="closed"} className="flex items-center gap-1 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium disabled:opacity-50"><Eye className="w-3.5 h-3.5"/>TO</button>
                </div>
                <div className="bg-slate-900 rounded-lg p-3">
                  <p className="text-slate-400 text-xs mb-2 flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5"/>Commentaires ({ticket.comments.length})</p>
                  <div className="space-y-2 mb-2 max-h-40 overflow-y-auto">
                    {ticket.comments.map(c=>(
                      <div key={c.id} className="bg-slate-800 rounded-lg p-2.5 border border-slate-700">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">{c.author.charAt(0).toUpperCase()}</div>
                          <span className="text-slate-300 text-xs font-medium">{c.author}</span>
                          <span className="text-slate-500 text-xs">{c.date}</span>
                        </div>
                        <p className="text-slate-200 text-xs">{c.text}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input value={commentMap[ticket.id]||""} onChange={e=>setComMap({...commentMap,[ticket.id]:e.target.value})} onKeyPress={e=>e.key==="Enter"&&addComment(ticket.id)} placeholder="Commentaire..." disabled={ticket.status==="closed"}
                      className="flex-1 px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 text-xs focus:outline-none disabled:opacity-50"/>
                    <button onClick={()=>addComment(ticket.id)} disabled={ticket.status==="closed"} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"><Send className="w-3.5 h-3.5"/></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===== CO STAFF ===== */}
        {view==="staff"&&(
          <div className="flex flex-col items-center gap-6 py-8">
            <div className={"w-56 h-56 rounded-full flex flex-col items-center justify-center border-4 shadow-2xl "+(coSession?"border-green-400 shadow-green-900/50 bg-slate-800":"border-slate-600 bg-slate-800")}>
              <p className={"text-4xl font-mono font-bold tracking-widest "+(coSession?"text-green-400":"text-slate-500")}>{fmt(coElapsed)}</p>
              <p className="text-slate-400 text-sm mt-1">{coSession?"🟢 En ligne":"⚫ Hors ligne"}</p>
            </div>
            {!coSession
              ?<button onClick={startCo} className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white text-lg font-bold rounded-2xl flex items-center gap-3"><CheckCircle2 className="w-5 h-5"/>Démarrer ma connexion</button>
              :<button onClick={stopCo}  className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white text-lg font-bold rounded-2xl flex items-center gap-3"><XCircle className="w-5 h-5"/>Terminer ma connexion</button>}
            {coSession&&<p className="text-slate-400 text-sm">Connecté depuis {new Date(coSession).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}</p>}
            {coLogs.length>0&&(
              <div className="w-full max-w-md bg-slate-800 rounded-xl border border-slate-700 p-4">
                <p className="text-slate-300 font-semibold text-sm mb-3">📋 Historique sessions</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {coLogs.map(log=>(
                    <div key={log.id} className="flex items-center gap-2 bg-slate-700/50 rounded-lg px-3 py-2">
                      <span className="text-green-400 text-xs font-bold px-1.5 py-0.5 bg-green-900/40 rounded">CO</span>
                      <span className="text-slate-300 text-xs flex-1">Durée : {log.dur}</span>
                      <span className="text-slate-500 text-xs">{log.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== MODALS ===== */}
      {modal&&(
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-xl max-w-sm w-full p-5 border border-slate-700 shadow-2xl max-h-[90vh] overflow-y-auto">

            {modal.type==="heal"&&(
              <>
                <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2"><Heart className="w-5 h-5 text-rose-400"/>Soigner</h2>
                <p className="text-slate-400 text-sm mb-4">ID : <span className="text-white font-semibold">{userName(modal.userId)}</span></p>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {["Soin complet","Soin partiel","Défibriller"].map(opt=>(
                    <button key={opt} onClick={()=>{alert("🏥 "+opt+" → ID "+userName(modal.userId));closeModal();}}
                      className="py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-medium">{opt}</button>
                  ))}
                </div>
                <button onClick={closeModal} className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg">Annuler</button>
              </>
            )}

            {modal.type==="resetperso"&&(
              <>
                <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2"><UserX className="w-5 h-5 text-orange-400"/>Reset Personnage RP</h2>
                <p className="text-slate-400 text-sm mb-3">ID : <span className="text-white font-semibold">{userName(modal.userId)}</span></p>
                <div className="bg-orange-900/30 border border-orange-600 rounded-xl p-3 mb-4">
                  <p className="text-orange-300 text-xs">⚠️ Supprime l'identité RP du joueur (nom, historique, faction). Irréversible.</p>
                </div>
                <textarea value={reason} onChange={e=>setReason(e.target.value)} rows="2" placeholder="Raison *"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white mb-4 resize-none focus:outline-none"/>
                <div className="flex gap-2">
                  <button onClick={closeModal} className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg">Annuler</button>
                  <button onClick={()=>{if(!reason.trim())return alert("Raison requise");alert("🗑️ Personnage réinitialisé — ID "+userName(modal.userId));closeModal();}}
                    className="flex-1 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium">Confirmer</button>
                </div>
              </>
            )}

            {modal.type==="reset"&&(
              <>
                <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2"><RefreshCw className="w-5 h-5 text-slate-300"/>Reset Joueur</h2>
                <p className="text-slate-400 text-sm mb-3">ID : <span className="text-white font-semibold">{userName(modal.userId)}</span></p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[
                    {label:"💰 Argent",desc:"Remet à 0"},
                    {label:"🎒 Inventaire",desc:"Vide l'inventaire"},
                    {label:"📊 Stats",desc:"Stats RP"},
                    {label:"🚗 Véhicules",desc:"Retire tous"},
                    {label:"🏠 Propriétés",desc:"Retire toutes"},
                    {label:"🔄 Tout",desc:"Reset complet"},
                  ].map(({label,desc})=>(
                    <button key={label} onClick={()=>{alert("♻️ "+label+" réinitialisé — ID "+userName(modal.userId));closeModal();}}
                      className="flex flex-col items-center gap-0.5 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-medium border border-slate-600 hover:border-slate-500 transition-all">
                      <span>{label}</span><span className="text-slate-400 text-xs">{desc}</span>
                    </button>
                  ))}
                </div>
                <button onClick={closeModal} className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg">Fermer</button>
              </>
            )}

            {modal.type==="assignRoles"&&(()=>{
              const user=users.find(u=>u.id===modal.userId);
              return(
                <>
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Tag className="w-5 h-5 text-indigo-400"/>Rôles — ID {user?.name}</h2>
                  <div className="mb-4">
                    <p className="text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1"><Crown className="w-3.5 h-3.5"/>Rôles Staff</p>
                    <div className="space-y-1.5">
                      {staffRoles.length===0&&<p className="text-slate-500 text-xs">Aucun rôle staff créé</p>}
                      {staffRoles.map(role=>{
                        const has=user?.staffRoles.includes(role.id);
                        return(
                          <button key={role.id} onClick={()=>toggleRole(modal.userId,role.id,"staff")}
                            className={"w-full flex items-center justify-between p-2.5 rounded-lg border transition-all "+(has?"border-indigo-500 bg-indigo-900/30":"border-slate-600 bg-slate-700 hover:bg-slate-600")}>
                            <span className="flex items-center gap-2 text-sm text-white">{role.icon} {role.name}</span>
                            <span className={"w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs "+(has?"bg-indigo-500 border-indigo-400 text-white":"border-slate-500")}>{has?"✓":""}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1"><Star className="w-3.5 h-3.5"/>Rôles WL</p>
                    <div className="space-y-1.5">
                      {wlRoles.length===0&&<p className="text-slate-500 text-xs">Aucun rôle WL créé</p>}
                      {wlRoles.map(role=>{
                        const has=user?.wlRoles.includes(role.id);
                        return(
                          <button key={role.id} onClick={()=>toggleRole(modal.userId,role.id,"wl")}
                            className={"w-full flex items-center justify-between p-2.5 rounded-lg border transition-all "+(has?"border-emerald-500 bg-emerald-900/30":"border-slate-600 bg-slate-700 hover:bg-slate-600")}>
                            <span className="flex items-center gap-2 text-sm text-white">{role.icon} {role.name}</span>
                            <span className={"w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs "+(has?"bg-emerald-500 border-emerald-400 text-white":"border-slate-500")}>{has?"✓":""}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <button onClick={closeModal} className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg">Fermer</button>
                </>
              );
            })()}

            {modal.type==="give"&&(
              <>
                <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2"><Gift className="w-5 h-5 text-yellow-400"/>Give — ID {userName(modal.userId)}</h2>
                <select value={giveItem} onChange={e=>setGiveItem(e.target.value)} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white mb-3 focus:outline-none">
                  {ITEMS.map(i=><option key={i.id} value={i.id}>{i.label}</option>)}
                </select>
                {giveItem==="custom"&&<input value={giveCustom} onChange={e=>setGiveCust(e.target.value)} placeholder="Nom de l'item..." className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white mb-3 focus:outline-none"/>}
                <input type="number" min="1" value={giveQty} onChange={e=>setGiveQty(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white mb-4 focus:outline-none"/>
                <div className="flex gap-2">
                  <button onClick={closeModal} className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg">Annuler</button>
                  <button onClick={()=>{alert("🎁 Give x"+giveQty+" → ID "+userName(modal.userId));closeModal();}} className="flex-1 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium">Donner</button>
                </div>
              </>
            )}

            {(modal.type==="tp"||modal.type==="to")&&(
              <>
                <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                  {modal.type==="tp"?<><Navigation className="w-5 h-5 text-cyan-400"/>TP vers lui</>:<><Eye className="w-5 h-5 text-teal-400"/>TO vers moi</>}
                </h2>
                <p className="text-slate-400 text-sm mb-3">ID : <span className="text-white font-semibold">{modal.creator||userName(modal.userId)}</span></p>
                <textarea value={reason} onChange={e=>setReason(e.target.value)} rows="3" placeholder="Raison *" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white mb-4 resize-none focus:outline-none"/>
                <div className="flex gap-2">
                  <button onClick={closeModal} className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg">Annuler</button>
                  <button onClick={()=>{if(!reason.trim())return alert("Raison requise");alert((modal.type==="tp"?"🚀 TP":"🏢 TO")+" → "+(modal.creator||userName(modal.userId)));closeModal();}}
                    className={"flex-1 py-2 text-white rounded-lg font-medium "+(modal.type==="tp"?"bg-cyan-600 hover:bg-cyan-700":"bg-teal-600 hover:bg-teal-700")}>
                    {modal.type==="tp"?"🚀 TP":"🏢 TO"}
                  </button>
                </div>
              </>
            )}

            {modal.type==="observation"&&(
              <>
                <h2 className="text-xl font-bold text-white mb-3">👁️ Observation</h2>
                <textarea value={obsText} onChange={e=>setObsText(e.target.value)} rows="4" placeholder="Votre observation..." className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white mb-4 resize-none focus:outline-none"/>
                <div className="flex gap-2">
                  <button onClick={closeModal} className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg">Annuler</button>
                  <button onClick={()=>{if(obsText.trim())closeModal();}} className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium">Confirmer</button>
                </div>
              </>
            )}

            {modal.type==="message"&&(
              <>
                <h2 className="text-xl font-bold text-white mb-3">✉️ Message — ID {userName(modal.userId)}</h2>
                <textarea value={msgText} onChange={e=>setMsgText(e.target.value)} rows="4" placeholder="Votre message..." className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white mb-4 resize-none focus:outline-none"/>
                <div className="flex gap-2">
                  <button onClick={closeModal} className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg">Annuler</button>
                  <button onClick={()=>{if(msgText.trim()){alert("✉️ Envoyé à ID "+userName(modal.userId));closeModal();}}} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">Envoyer</button>
                </div>
              </>
            )}

            {SANCTION_TYPES.includes(modal.type)&&(
              <>
                <h2 className="text-xl font-bold text-white mb-3">{modal.type==="ban"?"🚫 Bannir":modal.type==="jail"?"🔒 Jail":modal.type==="mute"?"🔇 Mute":"⚠️ Warn"}</h2>
                <textarea value={reason} onChange={e=>setReason(e.target.value)} rows="3" placeholder="Raison..." className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white mb-3 resize-none focus:outline-none"/>
                {(modal.type==="jail"||modal.type==="mute")&&(
                  <div className="flex gap-2 mb-3">
                    <input type="number" value={duration} onChange={e=>setDuration(e.target.value)} placeholder="Durée" min="1" className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none"/>
                    <select value={durType} onChange={e=>setDurType(e.target.value)} className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none">
                      <option value="minutes">Min</option><option value="heures">Heure</option><option value="jours">Jour</option><option value="permanent">Perm</option>
                    </select>
                  </div>
                )}
                <div className="flex gap-2">
                  <button onClick={closeModal} className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg">Annuler</button>
                  <button onClick={applySanction} className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium">Confirmer</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}