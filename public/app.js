const {useState,useEffect,createElement:h}=React;

const G={bg:"#080808",card:"#111111",border:"#222222",aqua:"#2AB8D4",aquaDim:"rgba(42,184,212,0.1)",aquaBorder:"rgba(42,184,212,0.25)",gold:"#D4A843",white:"#FFFFFF",muted:"rgba(255,255,255,0.5)",green:"#3d9e5c",red:"#ef4444"};

const apiAuth=async(body)=>{const r=await fetch("/api/auth",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});return r.json();};
const apiAdmin=async(body)=>{const r=await fetch("/api/admin",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});return r.json();};
const apiClaude=async(prompt,system,maxTokens=1000)=>{
const r=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt,system,maxTokens})});
const d=await r.json();
if(d.error)throw new Error(d.error);
const t=d.text.trim();
try{return JSON.parse(t);}catch{}
const cm=t.match(/```(?:json)?\s*([\s\S]*?)```/);
if(cm){try{return JSON.parse(cm[1].trim());}catch{}}
const jm=t.match(/\{[\s\S]*\}/);
if(jm){try{return JSON.parse(jm[0]);}catch{}}
throw new Error("Could not parse AI response. Please try again.");
};

const s=(style)=>style;
const css={
btn:(disabled)=>({background:disabled?"#1a1a1a":G.aqua,color:disabled?G.muted:"#080808",border:"none",borderRadius:8,padding:"13px 24px",fontSize:14,fontWeight:700,cursor:disabled?"not-allowed":"pointer",fontFamily:"inherit",width:"auto"}),
ghost:{background:"transparent",color:G.muted,border:`1px solid ${G.border}`,borderRadius:8,padding:"11px 20px",fontSize:13,cursor:"pointer",fontFamily:"inherit"},
input:{width:"100%",background:"#0d0d0d",border:`1px solid ${G.border}`,borderRadius:8,color:G.white,fontSize:14,padding:"11px 14px",outline:"none",fontFamily:"inherit",boxSizing:"border-box"},
card:{background:G.card,border:`1px solid ${G.border}`,borderRadius:14,padding:24,marginBottom:18},
label:{display:"block",fontSize:11,fontWeight:700,letterSpacing:"0.1em",color:G.muted,textTransform:"uppercase",marginBottom:4},
};

function Btn({onClick,children,disabled,style={}}){return h("button",{onClick,disabled,style:{...css.btn(disabled),...style}},children);}
function GhostBtn({onClick,children,style={}}){return h("button",{onClick,style:{...css.ghost,...style}},children);}
function Field({label,hint,value,onChange,placeholder,type="text"}){
return h("div",{style:{marginBottom:16}},
label&&h("label",{style:css.label},label),
hint&&h("p",{style:{fontSize:12,color:"#444",margin:"0 0 5px",fontStyle:"italic"}},hint),
h("input",{type,value,onChange:e=>onChange(e.target.value),placeholder,style:css.input})
);
}
function TextArea({label,hint,value,onChange,placeholder,rows=3}){
return h("div",{style:{marginBottom:16}},
label&&h("label",{style:css.label},label),
hint&&h("p",{style:{fontSize:12,color:"#444",margin:"0 0 5px",fontStyle:"italic"}},hint),
h("textarea",{value,onChange:e=>onChange(e.target.value),placeholder,rows,style:{...css.input,resize:"vertical"}})
);
}
function Chips({label,hint,options,selected,onToggle,single=false}){
return h("div",{style:{marginBottom:20}},
label&&h("label",{style:css.label},label),
hint&&h("p",{style:{fontSize:12,color:"#444",margin:"0 0 7px",fontStyle:"italic"}},hint),
h("div",{style:{display:"flex",flexWrap:"wrap",gap:7}},
options.map(opt=>{
const val=typeof opt==="string"?opt:opt.value;
const lbl=typeof opt==="string"?opt:opt.label;
const sub=typeof opt==="object"?opt.desc:null;
const active=single?selected===val:selected.includes(val);
return h("button",{key:val,onClick:()=>onToggle(val),style:{background:active?"#0f2a0f":"#0d0d0d",border:`1px solid ${active?G.green:G.border}`,borderRadius:7,color:active?"#6ee7a0":"#888",fontSize:12,padding:sub?"9px 13px":"7px 12px",cursor:"pointer",fontFamily:"inherit",textAlign:"left"}},
h("div",{style:{fontWeight:active?700:400}},lbl),
sub&&h("div",{style:{fontSize:11,color:active?"#4ade80":G.muted,marginTop:2}},sub)
);
})
)
);
}
function CopyCard({title,content,icon,badge,accentColor=G.aqua}){
const [copied,setCopied]=useState(false);
return h("div",{style:{background:"#0d0d0d",border:`1px solid ${G.border}`,borderRadius:10,padding:"15px 17px",marginBottom:12}},
h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}},
h("div",{style:{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}},
h("span",{style:{fontSize:11,fontWeight:700,letterSpacing:"0.1em",color:accentColor,textTransform:"uppercase"}},`${icon} ${title}`),
badge&&h("span",{style:{fontSize:10,background:"#1a2a3a",color:"#60a5fa",border:"1px solid #1e3a5a",borderRadius:4,padding:"2px 6px"}},badge)
),
h("button",{onClick:()=>{navigator.clipboard.writeText(content);setCopied(true);setTimeout(()=>setCopied(false),1800);},style:{background:copied?"#0f2a0f":"#161616",border:`1px solid ${copied?"#2a5a2a":G.border}`,borderRadius:6,color:copied?"#4caf50":"#666",fontSize:11,padding:"4px 11px",cursor:"pointer",fontFamily:"inherit",flexShrink:0}},copied?"✓ Copied":"Copy")
),
h("p",{style:{color:"#ccc",fontSize:14,lineHeight:1.75,margin:0,whiteSpace:"pre-wrap"}},content)
);
}

// LOGIN
function LoginScreen({onLogin}){
const [email,setEmail]=useState("");
const [password,setPassword]=useState("");
const [loading,setLoading]=useState(false);
const [error,setError]=useState("");
const login=async()=>{
if(!email||!password){setError("Please enter your email and password.");return;}
setLoading(true);setError("");
const res=await apiAuth({action:"login",email,password});
setLoading(false);
if(res.success)onLogin(res.user);
else setError(res.error||"Login failed.");
};
return h("div",{style:{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24,background:G.bg}},
h("div",{style:{width:"100%",maxWidth:420}},
h("div",{style:{textAlign:"center",marginBottom:36}},
h("div",{style:{fontSize:28,fontWeight:700,letterSpacing:3,color:G.white,marginBottom:8}},
"STREAM",h("span",{style:{color:G.aqua}},"FLUX")
),
h("p",{style:{color:G.muted,fontSize:14}},"AI-Powered Real Estate Marketing")
),
h("div",{style:css.card},
h("h2",{style:{fontSize:18,fontWeight:700,marginBottom:20,color:G.white}},"Sign In to Your Account"),
h(Field,{label:"Email Address",type:"email",value:email,onChange:setEmail,placeholder:"your@email.com"}),
h(Field,{label:"Password",type:"password",value:password,onChange:setPassword,placeholder:"••••••••"}),
error&&h("div",{style:{background:"#1a0808",border:"1px solid #3a1010",borderRadius:8,padding:"10px 14px",color:"#f87171",fontSize:13,marginBottom:14,fontFamily:"monospace"}},`⚠ ${error}`),
h(Btn,{onClick:login,disabled:loading,style:{width:"100%",fontSize:15}},loading?"Signing in...":"Sign In →"),
h("p",{style:{textAlign:"center",color:G.muted,fontSize:12,marginTop:16}},"Don't have an account? Contact ",h("span",{style:{color:G.aqua}},"francisco@streamflux.app"))
)
)
);
}

// DASHBOARD
function Dashboard({user,onSelectApp,onLogout,onAdmin}){
const hasApp1=user.plan==="marketing"||user.plan==="bundle";
const hasApp2=user.plan==="outreach"||user.plan==="bundle";
return h("div",{style:{minHeight:"100vh",background:G.bg}},
h("div",{style:{background:G.card,borderBottom:`1px solid ${G.border}`,padding:"16px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}},
h("div",{style:{fontSize:20,fontWeight:700,letterSpacing:3,color:G.white}},"STREAM",h("span",{style:{color:G.aqua}},"FLUX")),
h("div",{style:{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}},
user.trialActive&&h("span",{style:{fontSize:12,background:G.aquaDim,border:`1px solid ${G.aquaBorder}`,borderRadius:100,padding:"4px 12px",color:G.aqua,fontWeight:600}},`🎯 ${user.daysLeft} day${user.daysLeft!==1?"s":""} left in trial`),
user.subscribed&&h("span",{style:{fontSize:12,background:"rgba(61,158,92,0.1)",border:"1px solid rgba(61,158,92,0.3)",borderRadius:100,padding:"4px 12px",color:"#4ade80",fontWeight:600}},"✓ Active"),
user.email==="francisco@streamflux.app"&&h(GhostBtn,{onClick:onAdmin,style:{fontSize:12,padding:"6px 14px"}},"⚙️ Admin"),
h(GhostBtn,{onClick:onLogout,style:{fontSize:12,padding:"6px 14px"}},"Sign Out")
)
),
h("div",{style:{maxWidth:900,margin:"0 auto",padding:"48px 24px"}},
h("div",{style:{marginBottom:36}},
h("h1",{style:{fontSize:28,fontWeight:700,color:G.white,marginBottom:6}},`Welcome back, ${user.name.split(" ")[0]} 👋`),
h("p",{style:{color:G.muted,fontSize:15}},"Your AI marketing tools are ready.")
),
h("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:20,marginBottom:40}},
// App 1
h("div",{style:{background:G.card,border:`1px solid ${hasApp1?G.aquaBorder:G.border}`,borderRadius:16,overflow:"hidden",opacity:hasApp1?1:0.5}},
h("div",{style:{background:"#111",padding:"28px 28px 20px",borderBottom:`1px solid ${G.border}`}},
h("div",{style:{fontSize:10,fontWeight:700,letterSpacing:3,textTransform:"uppercase",color:G.aqua,marginBottom:8}},"App One"),
h("div",{style:{fontSize:20,fontWeight:700,color:G.white,marginBottom:4}},"Property Marketing Machine"),
h("div",{style:{fontSize:13,color:G.muted}},"MLS listing, social media, ads, TikTok, neighbour letter — all in 30 seconds")
),
h("div",{style:{padding:"20px 28px"}},
h("div",{style:{fontSize:12,color:G.muted,marginBottom:14}},"Generates: MLS · Instagram · Facebook · Twitter · LinkedIn · Email · SMS · WhatsApp · Google Ad · Facebook Ad · TikTok · Letter · Schedule"),
hasApp1?h(Btn,{onClick:()=>onSelectApp("app1"),style:{width:"100%"}},"Launch App 1 →"):h("div",{style:{textAlign:"center",color:G.muted,fontSize:13,padding:"12px",border:`1px solid ${G.border}`,borderRadius:8}},"Not included in your plan")
)
),
// App 2
h("div",{style:{background:G.card,border:`1px solid ${hasApp2?G.aquaBorder:G.border}`,borderRadius:16,overflow:"hidden",opacity:hasApp2?1:0.5}},
h("div",{style:{background:"#111",padding:"28px 28px 20px",borderBottom:`1px solid ${G.border}`}},
h("div",{style:{fontSize:10,fontWeight:700,letterSpacing:3,textTransform:"uppercase",color:G.aqua,marginBottom:8}},"App Two"),
h("div",{style:{fontSize:20,fontWeight:700,color:G.white,marginBottom:4}},"Client Outreach Machine"),
h("div",{style:{fontSize:13,color:G.muted}},"WhatsApp, SMS, phone script, email, letter, 4 follow-ups — for any buyer or seller")
),
h("div",{style:{padding:"20px 28px"}},
h("div",{style:{fontSize:12,color:G.muted,marginBottom:14}},"Generates: WhatsApp · SMS · Phone Script · Email · Letter · 4 Follow-Ups · Property Matcher · Objection Handler · Anniversary · Referral · Schedule"),
hasApp2?h(Btn,{onClick:()=>onSelectApp("app2"),style:{width:"100%"}},"Launch App 2 →"):h("div",{style:{textAlign:"center",color:G.muted,fontSize:13,padding:"12px",border:`1px solid ${G.border}`,borderRadius:8}},"Not included in your plan")
)
)
),
h("div",{style:{background:G.card,border:`1px solid ${G.border}`,borderRadius:12,padding:"20px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}},
h("div",{},
h("div",{style:{fontSize:11,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:G.muted,marginBottom:4}},"Your Plan"),
h("div",{style:{fontSize:16,fontWeight:700,color:G.white}},user.plan==="bundle"?"Complete Bundle":user.plan==="marketing"?"Marketing Tool":"Outreach Tool")
),
!user.subscribed&&h("a",{href:"https://streamflux.app/#pricing",target:"_blank",style:{background:G.aqua,color:"#080808",borderRadius:8,padding:"10px 20px",fontSize:13,fontWeight:700,textDecoration:"none"}},"Upgrade to Full Access →")
)
)
);
}

// ADMIN PANEL
function AdminPanel({onBack}){
const [adminKey,setAdminKey]=useState("");
const [authed,setAuthed]=useState(false);
const [users,setUsers]=useState([]);
const [loading,setLoading]=useState(false);
const [msg,setMsg]=useState("");
const [name,setName]=useState("");
const [email,setEmail]=useState("");
const [password,setPassword]=useState("");
const [plan,setPlan]=useState("bundle");
const [trialDays,setTrialDays]=useState("7");

const loadUsers=async(key)=>{const res=await apiAdmin({adminKey:key,action:"list_users"});if(res.success)setUsers(res.users);};
const auth=async()=>{setLoading(true);const res=await apiAdmin({adminKey,action:"list_users"});setLoading(false);if(res.success){setAuthed(true);setUsers(res.users);}else setMsg("❌ Wrong admin key");};
const addUser=async()=>{
if(!name||!email||!password){setMsg("Fill in all fields.");return;}
setLoading(true);
const res=await apiAdmin({adminKey,action:"add_user",name,email,password,plan,trialDays:parseInt(trialDays)});
setLoading(false);
if(res.success){setMsg("✅ User added: "+res.user.email);setName("");setEmail("");setPassword("");loadUsers(adminKey);}
else setMsg("❌ "+res.error);
};
const deactivate=async(userId,userName)=>{if(!confirm(`Deactivate ${userName}?`))return;await apiAdmin({adminKey,action:"deactivate_user",userId});setMsg("✅ Deactivated.");loadUsers(adminKey);};
const activate=async(userId)=>{await apiAdmin({adminKey,action:"activate_user",userId});setMsg("✅ Activated.");loadUsers(adminKey);};
const markPaid=async(userId)=>{await apiAdmin({adminKey,action:"subscribe_user",userId});setMsg("✅ Marked as paid.");loadUsers(adminKey);};

if(!authed) return h("div",{style:{background:G.bg,minHeight:"100vh",padding:24}},
h("div",{style:{maxWidth:420,margin:"60px auto"}},
h(GhostBtn,{onClick:onBack,style:{marginBottom:24,fontSize:12}},"← Back"),
h("div",{style:css.card},
h("h2",{style:{fontSize:18,fontWeight:700,marginBottom:16,color:G.white}},"⚙️ Admin Panel"),
h(Field,{label:"Admin Secret Key",type:"password",value:adminKey,onChange:setAdminKey,placeholder:"Your admin secret key"}),
msg&&h("p",{style:{color:"#f87171",fontSize:13,marginBottom:12}},msg),
h(Btn,{onClick:auth,disabled:loading,style:{width:"100%"}},loading?"Checking...":"Access Admin →")
)
)
);

return h("div",{style:{background:G.bg,minHeight:"100vh"}},
h("div",{style:{background:G.card,borderBottom:`1px solid ${G.border}`,padding:"14px 24px",display:"flex",justifyContent:"space-between",alignItems:"center"}},
h("span",{style:{fontSize:15,fontWeight:700}},"⚙️ Streamflux Admin Panel"),
h(GhostBtn,{onClick:onBack,style:{fontSize:12,padding:"6px 14px"}},"← Dashboard")
),
h("div",{style:{maxWidth:900,margin:"0 auto",padding:"32px 20px 60px"}},
msg&&h("div",{style:{background:"#0a1f0a",border:`1px solid ${G.green}`,borderRadius:8,padding:"10px 14px",color:"#4ade80",fontSize:13,marginBottom:16}},msg),
h("div",{style:css.card},
h("h3",{style:{fontSize:16,fontWeight:700,color:G.white,marginBottom:16}},"➕ Add New Client"),
h("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}},
h(Field,{label:"Full Name",value:name,onChange:setName,placeholder:"Sarah Johnson"}),
h(Field,{label:"Email",type:"email",value:email,onChange:setEmail,placeholder:"sarah@email.com"}),
h(Field,{label:"Password",value:password,onChange:setPassword,placeholder:"Welcome2024!"}),
h(Field,{label:"Trial Days",type:"number",value:trialDays,onChange:setTrialDays,placeholder:"7"})
),
h("div",{style:{marginBottom:16}},
h("label",{style:css.label},"Plan"),
h("select",{value:plan,onChange:e=>setPlan(e.target.value),style:{...css.input,cursor:"pointer"}},
h("option",{value:"marketing"},"Marketing Tool — $125/mo (App 1 only)"),
h("option",{value:"outreach"},"Outreach Tool — $125/mo (App 2 only)"),
h("option",{value:"bundle"},"Complete Bundle — $157/mo (Both Apps)")
)
),
h(Btn,{onClick:addUser,disabled:loading},loading?"Adding...":"Add Client →")
),
h("div",{style:css.card},
h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}},
h("h3",{style:{fontSize:16,fontWeight:700,color:G.white}},`👥 All Clients (${users.length})`),
h(GhostBtn,{onClick:()=>loadUsers(adminKey),style:{fontSize:12,padding:"6px 12px"}},"Refresh")
),
users.length===0?h("p",{style:{color:G.muted,fontSize:14}},"No clients yet."):
users.map(u=>{
const trial=new Date(u.trial_ends_at);
const now=new Date();
const trialActive=now<trial;
const daysLeft=trialActive?Math.ceil((trial-now)/(1000*60*60*24)):0;
return h("div",{key:u.id,style:{background:"#0d0d0d",border:`1px solid ${G.border}`,borderRadius:10,padding:"14px 16px",marginBottom:10}},
h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}},
h("div",{},
h("div",{style:{fontWeight:700,color:G.white,fontSize:14}},u.name),
h("div",{style:{color:G.muted,fontSize:12,marginTop:2}},u.email),
h("div",{style:{display:"flex",gap:8,marginTop:6,flexWrap:"wrap"}},
h("span",{style:{fontSize:11,background:G.aquaDim,border:`1px solid ${G.aquaBorder}`,borderRadius:100,padding:"2px 10px",color:G.aqua,fontWeight:600}},u.plan==="bundle"?"Bundle":u.plan==="marketing"?"Marketing":"Outreach"),
u.subscribed&&h("span",{style:{fontSize:11,background:"rgba(61,158,92,0.1)",border:"1px solid rgba(61,158,92,0.3)",borderRadius:100,padding:"2px 10px",color:"#4ade80",fontWeight:600}},"✓ Paid"),
trialActive&&!u.subscribed&&h("span",{style:{fontSize:11,background:"rgba(212,168,67,0.1)",border:"1px solid rgba(212,168,67,0.3)",borderRadius:100,padding:"2px 10px",color:G.gold,fontWeight:600}},`Trial: ${daysLeft}d left`),
!trialActive&&!u.subscribed&&h("span",{style:{fontSize:11,background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:100,padding:"2px 10px",color:G.red,fontWeight:600}},"Trial Expired"),
!u.active&&h("span",{style:{fontSize:11,background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:100,padding:"2px 10px",color:G.red,fontWeight:600}},"Deactivated")
)
),
h("div",{style:{display:"flex",gap:8,flexWrap:"wrap"}},
!u.subscribed&&h(GhostBtn,{onClick:()=>markPaid(u.id),style:{fontSize:11,padding:"5px 12px",color:G.green,borderColor:G.green}},"Mark Paid"),
u.active?h(GhostBtn,{onClick:()=>deactivate(u.id,u.name),style:{fontSize:11,padding:"5px 12px",color:G.red,borderColor:G.red}},"Deactivate"):h(GhostBtn,{onClick:()=>activate(u.id),style:{fontSize:11,padding:"5px 12px",color:G.green,borderColor:G.green}},"Activate")
)
)
);
})
)
)
);
}

// APP 1 and APP 2 — redirect to standalone pages
function App1({onBack}){
useEffect(()=>{window.location.href="/app1.html";},[]);
return h("div",{style:{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:G.bg}},
h("div",{style:{textAlign:"center"}},
h("div",{style:{fontSize:20,color:G.aqua,marginBottom:12}},"Loading App 1..."),
h(GhostBtn,{onClick:onBack},"← Back to Dashboard")
)
);
}
function App2({onBack}){
useEffect(()=>{window.location.href="/app2.html";},[]);
return h("div",{style:{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:G.bg}},
h("div",{style:{textAlign:"center"}},
h("div",{style:{fontSize:20,color:G.aqua,marginBottom:12}},"Loading App 2..."),
h(GhostBtn,{onClick:onBack},"← Back to Dashboard")
)
);
}

// MAIN
function App(){
const [user,setUser]=useState(null);
const [screen,setScreen]=useState("login");
useEffect(()=>{
const saved=localStorage.getItem("sf_user");
if(saved){
const u=JSON.parse(saved);
apiAuth({action:"check",userId:u.id}).then(res=>{
if(res.success){setUser(res.user);setScreen("dashboard");}
else localStorage.removeItem("sf_user");
});
}
},[]);
const handleLogin=(u)=>{localStorage.setItem("sf_user",JSON.stringify(u));setUser(u);setScreen("dashboard");};
const handleLogout=()=>{localStorage.removeItem("sf_user");setUser(null);setScreen("login");};
if(screen==="login")return h(LoginScreen,{onLogin:handleLogin});
if(screen==="dashboard")return h(Dashboard,{user,onSelectApp:app=>setScreen(app),onLogout:handleLogout,onAdmin:()=>setScreen("admin")});
if(screen==="app1")return h(App1,{onBack:()=>setScreen("dashboard")});
if(screen==="app2")return h(App2,{onBack:()=>setScreen("dashboard")});
if(screen==="admin")return h(AdminPanel,{onBack:()=>setScreen("dashboard")});
return null;
}

ReactDOM.createRoot(document.getElementById("root")).render(h(App,null));

