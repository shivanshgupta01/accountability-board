import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabase";

const MODES = { SOLO: "solo", DUO: "duo", GROUP: "group" };
const GOAL_CATEGORIES = ["Health","Career","Learning","Fitness","Creative","Finance","Mindset","Other"];
const CAT_COLORS = { Health:"#F9A8D4", Career:"#93C5FD", Learning:"#86EFAC", Fitness:"#FCD34D", Creative:"#C4B5FD", Finance:"#6EE7B7", Mindset:"#A78BFA", Other:"#E2E8F0" };
const AVATARS = ["🦁","🐯","🦊","🐺","🦅","🐉","🦋","🌟","🔥","⚡","🎯","💎"];

const getToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
};
const getLast7 = () => Array.from({length:7},(_,i)=>{ const x=new Date(); x.setDate(x.getDate()-(6-i)); return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,"0")}-${String(x.getDate()).padStart(2,"0")}`; });
const getLast28 = () => Array.from({length:28},(_,i)=>{ const x=new Date(); x.setDate(x.getDate()-(27-i)); return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,"0")}-${String(x.getDate()).padStart(2,"0")}`; });
const DAY_LABELS = ["S","M","T","W","T","F","S"];
const fmtDate = (d) => new Date(d+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"});
const generateBoardId = () => Math.random().toString(36).substring(2,8).toUpperCase();

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800;900&family=Nunito:wght@400;500;600;700&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; }
  ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px}
  @keyframes fadeSlideUp{from{opacity:0;transform:translateY(16px) translateX(-50%)}to{opacity:1;transform:translateY(0) translateX(-50%)}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
  @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse{0%,100%{opacity:0.5}50%{opacity:1}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  .glass{background:rgba(255,255,255,0.06);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.12)}
  .glass-card{background:rgba(255,255,255,0.05);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.1);border-radius:20px;transition:all 0.25s}
  .glass-card:hover{border-color:rgba(255,255,255,0.2);transform:translateY(-2px)}
  .tab-btn{background:none;border:1px solid transparent;cursor:pointer;font-family:'Nunito',sans-serif;font-size:13px;font-weight:700;padding:8px 16px;border-radius:30px;transition:all 0.2s}
  .tab-btn.active{background:rgba(124,58,237,0.5);color:#F0EAFF;border-color:rgba(167,139,250,0.4)}
  .tab-btn.inactive{color:rgba(255,255,255,0.35)}
  .tab-btn.inactive:hover{color:rgba(255,255,255,0.7)}
  .m-input{background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:12px;color:#F0EAFF;font-family:'Nunito',sans-serif;font-size:14px;padding:11px 14px;width:100%;outline:none;transition:border 0.2s}
  .m-input:focus{border-color:#A78BFA}
  input[type="date"].m-input{color-scheme:dark}
  .s-input{background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:12px;color:#F0EAFF;font-family:'Nunito',sans-serif;font-size:15px;padding:12px 16px;width:100%;outline:none;transition:border 0.2s}
  .s-input:focus{border-color:#A78BFA}
  .icon-btn{background:none;border:none;cursor:pointer;color:rgba(255,255,255,0.35);font-size:16px;padding:6px;transition:all 0.2s;border-radius:8px}
  .icon-btn:hover{color:#F0EAFF;background:rgba(255,255,255,0.08)}
  .add-fab{position:fixed;bottom:28px;right:28px;width:58px;height:58px;border-radius:50%;background:linear-gradient(135deg,#7C3AED,#4F46E5);border:none;cursor:pointer;font-size:28px;color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 32px rgba(124,58,237,0.5);transition:all 0.2s;z-index:100}
  .add-fab:hover{transform:scale(1.1)}
  .orb{position:absolute;border-radius:50%;filter:blur(90px);pointer-events:none}
  .mode-card{border-radius:16px;padding:18px;cursor:pointer;transition:all 0.2s;text-align:center}
  .mode-card:hover{transform:translateY(-3px)}
  .spinner{width:32px;height:32px;border:3px solid rgba(167,139,250,0.2);border-top-color:#A78BFA;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto}
  .copy-btn{background:rgba(167,139,250,0.15);border:1px solid rgba(167,139,250,0.3);border-radius:10px;color:#A78BFA;padding:10px 16px;cursor:pointer;font-family:'Nunito',sans-serif;font-size:13px;font-weight:700;transition:all 0.2s}
  .copy-btn:hover{background:rgba(167,139,250,0.25)}
  .live-dot{width:8px;height:8px;border-radius:50%;background:#86EFAC;display:inline-block;margin-right:6px;animation:pulse 2s ease-in-out infinite}
`;

function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  const colors = { success:"#86EFAC", error:"#FCA5A5", info:"#93C5FD", ai:"#C4B5FD" };
  const bg = colors[type] || "#C4B5FD";
  return (
    <div style={{ position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)", background:bg, color:"#0F0A1E", padding:"10px 22px", borderRadius:30, fontSize:13, fontWeight:700, zIndex:999, whiteSpace:"nowrap", boxShadow:`0 8px 32px ${bg}66`, animation:"fadeSlideUp 0.3s ease" }}>
      {message}
    </div>
  );
}

function LoadingScreen({ text="Syncing board..." }) {
  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#0F0A1E,#1A0F3C,#0D1A2E)", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <style>{STYLES}</style>
      <div style={{ textAlign:"center" }}><div className="spinner" /><p style={{ color:"rgba(255,255,255,0.4)", marginTop:16, fontFamily:"'Nunito',sans-serif", fontSize:14 }}>{text}</p></div>
    </div>
  );
}

// ── Join Screen (invite link) ──────────────────────────────────────────────
function JoinScreen({ boardId, onJoined }) {
  const [loading, setLoading] = useState(true);
  const [board, setBoard] = useState(null);
  const [myName, setMyName] = useState("");
  const [myAvatar, setMyAvatar] = useState("🦁");
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    supabase.from("boards").select("*").eq("id", boardId).single().then(({ data, error }) => {
      if (error || !data) setError("Board not found. The link may be invalid.");
      else setBoard(data);
      setLoading(false);
    });
  }, [boardId]);

  const handleJoin = async () => {
    if (!myName.trim()) return;
    setJoining(true);
    try {
      const memberId = `member_${Date.now()}`;
      const updatedMembers = [...(board.members||[]), { id:memberId, name:myName.trim(), avatar:myAvatar }];
      const { error } = await supabase.from("boards").update({ members:updatedMembers }).eq("id", boardId);
      if (error) throw error;
      localStorage.setItem("acc_board_id", boardId);
      localStorage.setItem("acc_member_id", memberId);
      onJoined(boardId, memberId);
    } catch(e) { setError("Failed to join. Try again."); setJoining(false); }
  };

  if (loading) return <LoadingScreen text="Loading board..." />;
  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#0F0A1E 0%,#1A0F3C 50%,#0D1A2E 100%)", display:"flex", alignItems:"center", justifyContent:"center", padding:24, fontFamily:"'Nunito',sans-serif", position:"relative", overflow:"hidden" }}>
      <style>{STYLES}</style>
      <div className="orb" style={{ width:300, height:300, background:"#7C3AED", top:-80, right:-80, opacity:0.15 }} />
      <div className="glass" style={{ borderRadius:28, padding:"40px 32px", width:"100%", maxWidth:420, animation:"slideUp 0.6s ease" }}>
        {error ? (
          <div style={{ textAlign:"center" }}><div style={{ fontSize:48, marginBottom:12 }}>😕</div><p style={{ color:"#FCA5A5", fontSize:15 }}>{error}</p></div>
        ) : (
          <>
            <div style={{ fontSize:52, textAlign:"center", marginBottom:16, animation:"float 3s ease-in-out infinite" }}>🤝</div>
            <h1 style={{ fontFamily:"'Outfit',sans-serif", fontSize:26, fontWeight:900, color:"#F0EAFF", textAlign:"center", marginBottom:6 }}>You're Invited!</h1>
            <p style={{ color:"rgba(255,255,255,0.4)", fontSize:14, textAlign:"center", marginBottom:6 }}>Join <strong style={{ color:"#A78BFA" }}>{board?.board_name}</strong></p>
            <p style={{ color:"rgba(255,255,255,0.3)", fontSize:13, textAlign:"center", marginBottom:28 }}>
              {(board?.members||[]).length > 0 ? `${(board.members||[]).map(m=>`${m.avatar} ${m.name}`).join(", ")} is already in` : ""}
            </p>
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>Your Name</p>
            <input className="s-input" placeholder="Enter your name..." value={myName} onChange={e => setMyName(e.target.value)} style={{ marginBottom:14 }} autoFocus />
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:10 }}>Pick Your Avatar</p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:24 }}>
              {AVATARS.map(av => (
                <button key={av} onClick={() => setMyAvatar(av)}
                  style={{ width:42, height:42, borderRadius:12, border:`2px solid ${myAvatar===av?"#A78BFA":"transparent"}`, background:myAvatar===av?"rgba(167,139,250,0.2)":"rgba(255,255,255,0.06)", cursor:"pointer", fontSize:22, transition:"all 0.15s" }}>
                  {av}
                </button>
              ))}
            </div>
            <button onClick={handleJoin} disabled={!myName.trim()||joining}
              style={{ width:"100%", background:myName.trim()?"linear-gradient(135deg,#7C3AED,#4F46E5)":"rgba(255,255,255,0.08)", color:myName.trim()?"#fff":"rgba(255,255,255,0.3)", border:"none", borderRadius:14, padding:14, fontSize:15, fontWeight:700, cursor:myName.trim()?"pointer":"not-allowed", fontFamily:"'Nunito',sans-serif", transition:"all 0.2s" }}>
              {joining ? "Joining..." : `Join ${board?.board_name} 🚀`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Setup Screen ───────────────────────────────────────────────────────────
function SetupScreen({ onComplete }) {
  const [mode, setMode] = useState(null);
  const [myName, setMyName] = useState("");
  const [myAvatar, setMyAvatar] = useState("🦁");
  const [boardName, setBoardName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  const modeConfig = {
    [MODES.SOLO]:  { label:"Solo",  icon:"🧘", desc:"Personal accountability" },
    [MODES.DUO]:   { label:"Duo",   icon:"🤝", desc:"Pair with one partner" },
    [MODES.GROUP]: { label:"Group", icon:"👥", desc:"Team up to 5 people" },
  };

  const canProceed = mode && boardName.trim() && myName.trim();

  const handleComplete = async () => {
    if (!canProceed) return;
    setCreating(true); setError(null);
    try {
      const boardId = generateBoardId();
      const myMemberId = "member_0";
      const { error } = await supabase.from("boards").insert({
        id: boardId, board_name: boardName.trim(), mode,
        members: [{ id: myMemberId, name: myName.trim(), avatar: myAvatar }],
        checkins: {}, goals: [], created_at: getToday(),
      });
      if (error) throw error;
      localStorage.setItem("acc_board_id", boardId);
      localStorage.setItem("acc_member_id", myMemberId);
      // Pass showInvite=true for duo/group so invite modal opens immediately
      onComplete(boardId, myMemberId, mode !== MODES.SOLO);
    } catch(e) {
      setError(`Failed to create board: ${e.message}`);
      setCreating(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#0F0A1E 0%,#1A0F3C 50%,#0D1A2E 100%)", display:"flex", alignItems:"center", justifyContent:"center", padding:24, fontFamily:"'Nunito',sans-serif", position:"relative", overflow:"hidden" }}>
      <style>{STYLES}</style>
      <div className="orb" style={{ width:300, height:300, background:"#7C3AED", top:-80, right:-80, opacity:0.15, animation:"pulse 4s ease-in-out infinite" }} />
      <div className="orb" style={{ width:200, height:200, background:"#EC4899", bottom:-60, left:-60, opacity:0.1, animation:"pulse 5s ease-in-out infinite" }} />
      <div className="glass" style={{ borderRadius:28, padding:"40px 32px", width:"100%", maxWidth:440, animation:"slideUp 0.6s ease" }}>
        <div style={{ fontSize:56, textAlign:"center", marginBottom:16, animation:"float 3s ease-in-out infinite" }}>🎯</div>
        <h1 style={{ fontFamily:"'Outfit',sans-serif", fontSize:28, fontWeight:900, color:"#F0EAFF", textAlign:"center", marginBottom:8 }}>Accountability Board</h1>
        <p style={{ color:"rgba(255,255,255,0.4)", fontSize:14, textAlign:"center", marginBottom:28 }}>Stay consistent. Hold each other accountable.</p>

        {error && <div style={{ background:"rgba(252,165,165,0.15)", border:"1px solid rgba(252,165,165,0.3)", borderRadius:12, padding:"12px 16px", marginBottom:16 }}><p style={{ color:"#FCA5A5", fontSize:13 }}>❌ {error}</p></div>}

        <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:10 }}>Who's joining?</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:20 }}>
          {Object.entries(modeConfig).map(([key, cfg]) => (
            <div key={key} className="mode-card glass"
              style={{ border:`1.5px solid ${mode===key?"#A78BFA":"rgba(255,255,255,0.1)"}`, background:mode===key?"rgba(167,139,250,0.15)":"rgba(255,255,255,0.04)" }}
              onClick={() => setMode(key)}>
              <div style={{ fontSize:24, marginBottom:4 }}>{cfg.icon}</div>
              <p style={{ fontSize:13, fontWeight:700, color:"#F0EAFF" }}>{cfg.label}</p>
              <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", marginTop:2 }}>{cfg.desc}</p>
            </div>
          ))}
        </div>

        <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>Board Name</p>
        <input className="s-input" placeholder="e.g. Squad Goals, Study Buddies..." value={boardName} onChange={e => setBoardName(e.target.value)} style={{ marginBottom:16 }} />

        <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>Your Name</p>
        <input className="s-input" placeholder="Enter your name..." value={myName} onChange={e => setMyName(e.target.value)} style={{ marginBottom:14 }} />

        <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:10 }}>Your Avatar</p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:20 }}>
          {AVATARS.map(av => (
            <button key={av} onClick={() => setMyAvatar(av)}
              style={{ width:38, height:38, borderRadius:10, border:`2px solid ${myAvatar===av?"#A78BFA":"transparent"}`, background:myAvatar===av?"rgba(167,139,250,0.2)":"rgba(255,255,255,0.06)", cursor:"pointer", fontSize:20, transition:"all 0.15s" }}>
              {av}
            </button>
          ))}
        </div>

        {mode && mode !== MODES.SOLO && (
          <div style={{ background:"rgba(167,139,250,0.1)", border:"1px solid rgba(167,139,250,0.2)", borderRadius:12, padding:"12px 16px", marginBottom:16 }}>
            <p style={{ fontSize:13, color:"#A78BFA" }}>🔗 After creating, you'll get an invite link to share with your {mode === MODES.DUO ? "partner" : "group"}!</p>
          </div>
        )}

        <button onClick={handleComplete} disabled={!canProceed||creating}
          style={{ width:"100%", background:canProceed?"linear-gradient(135deg,#7C3AED,#4F46E5)":"rgba(255,255,255,0.08)", color:canProceed?"#fff":"rgba(255,255,255,0.3)", border:"none", borderRadius:14, padding:14, fontSize:15, fontWeight:700, cursor:canProceed?"pointer":"not-allowed", fontFamily:"'Nunito',sans-serif", transition:"all 0.2s" }}>
          {creating ? "Creating Board..." : "Create Board 🚀"}
        </button>
      </div>
    </div>
  );
}

// ── Invite Modal ───────────────────────────────────────────────────────────
function InviteModal({ boardId, boardName, onClose }) {
  const [copied, setCopied] = useState(false);
  const inviteLink = `${window.location.origin}${window.location.pathname}?board=${boardId}`;
  const copyLink = () => { navigator.clipboard.writeText(inviteLink).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); };
  const shareLink = () => { if (navigator.share) { navigator.share({ title:`Join ${boardName}`, text:"Join my accountability board!", url:inviteLink }); } else copyLink(); };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:300, backdropFilter:"blur(8px)", padding:16, animation:"fadeIn 0.2s" }}>
      <div className="glass" style={{ borderRadius:24, padding:28, width:"100%", maxWidth:400, animation:"slideUp 0.3s ease" }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
          <h2 style={{ fontFamily:"'Outfit',sans-serif", fontSize:22, color:"#F0EAFF" }}>🔗 Invite Others</h2>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.4)", fontSize:24, cursor:"pointer" }}>×</button>
        </div>
        <div style={{ background:"rgba(167,139,250,0.1)", border:"1px solid rgba(167,139,250,0.25)", borderRadius:14, padding:16, marginBottom:16, textAlign:"center" }}>
          <p style={{ fontFamily:"'Outfit',sans-serif", fontSize:36, fontWeight:900, color:"#A78BFA", letterSpacing:6, marginBottom:4 }}>{boardId}</p>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.4)" }}>Board ID — share this code</p>
        </div>
        <p style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginBottom:8 }}>Or share the full invite link:</p>
        <div style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:12, padding:"10px 14px", marginBottom:14 }}>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.5)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{inviteLink}</p>
        </div>
        <div style={{ display:"flex", gap:10, marginBottom:16 }}>
          <button className="copy-btn" onClick={copyLink} style={{ flex:1 }}>{copied?"✓ Copied!":"📋 Copy Link"}</button>
          <button onClick={shareLink} style={{ flex:1, background:"linear-gradient(135deg,#7C3AED,#4F46E5)", color:"#fff", border:"none", borderRadius:10, padding:"10px 16px", cursor:"pointer", fontFamily:"'Nunito',sans-serif", fontSize:13, fontWeight:700 }}>🚀 Share</button>
        </div>
        <div style={{ background:"rgba(134,239,172,0.08)", border:"1px solid rgba(134,239,172,0.2)", borderRadius:12, padding:14 }}>
          <p style={{ fontSize:12, color:"#86EFAC", fontWeight:700, marginBottom:6 }}>✅ How it works</p>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.5)", lineHeight:1.8 }}>1. Share this link with your partner<br />2. They open it and enter their name<br />3. They join your board instantly<br />4. Everyone's check-ins sync live 🔥</p>
        </div>
      </div>
    </div>
  );
}

// ── AI Motivation Modal ────────────────────────────────────────────────────
function AIMotivationModal({ board, onClose }) {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const checkins = board.checkins||{}, goals = board.goals||[], members = board.members||[];
        const totalCheckins = Object.values(checkins).flat().length;
        const todayCheckins = members.filter(m=>(checkins[getToday()]||[]).includes(m.id)).length;
        const streakInfo = members.map(m => {
          let s=0; const d=new Date();
          while(true){ const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; if((checkins[k]||[]).includes(m.id)){s++;d.setDate(d.getDate()-1);}else break; }
          return `${m.name}: ${s} days`;
        }).join(", ");
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method:"POST", headers:{ "Content-Type":"application/json", "x-api-key":import.meta.env.VITE_ANTHROPIC_KEY, "anthropic-version":"2023-06-01", "anthropic-dangerous-direct-browser-access":"true" },
          body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:800, messages:[{ role:"user", content:`You are an enthusiastic accountability coach. Board: "${board.board_name}", Members: ${members.map(m=>m.name).join(", ")}, Total check-ins: ${totalCheckins}, Today: ${todayCheckins}/${members.length}, Goals completed: ${goals.filter(g=>g.completed).length}/${goals.length}, Streaks: ${streakInfo}. Return ONLY raw JSON no markdown: {"headline":"short punchy headline max 8 words","message":"2-3 sentence motivational message mentioning names","shoutout":"who deserves shoutout and why","challenge":"one specific challenge for today","quote":"powerful quote with author"}` }] })
        });
        const data = await res.json();
        setResult(JSON.parse((data.content?.[0]?.text||"").replace(/```json|```/g,"").trim()));
      } catch(e) { setError("Couldn't load AI motivation."); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:300, backdropFilter:"blur(8px)", padding:16, animation:"fadeIn 0.2s" }}>
      <div className="glass" style={{ borderRadius:24, padding:28, width:"100%", maxWidth:420, maxHeight:"90vh", overflowY:"auto", animation:"slideUp 0.3s ease" }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
          <h2 style={{ fontFamily:"'Outfit',sans-serif", fontSize:22, color:"#F0EAFF" }}>🤖 AI Coach</h2>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.4)", fontSize:24, cursor:"pointer" }}>×</button>
        </div>
        {loading && <div style={{ textAlign:"center", padding:"40px 0" }}><div style={{ fontSize:40, animation:"float 1.5s ease-in-out infinite", marginBottom:12 }}>🤖</div><p style={{ color:"rgba(255,255,255,0.4)", fontSize:14 }}>Analyzing your board...</p></div>}
        {error && <p style={{ color:"#FCA5A5", textAlign:"center" }}>{error}</p>}
        {result && (
          <div>
            <div style={{ background:"rgba(124,58,237,0.2)", border:"1px solid rgba(167,139,250,0.3)", borderRadius:16, padding:20, marginBottom:14, textAlign:"center" }}>
              <p style={{ fontFamily:"'Outfit',sans-serif", fontSize:22, fontWeight:800, color:"#F0EAFF", marginBottom:8 }}>{result.headline}</p>
              <p style={{ fontSize:14, color:"rgba(255,255,255,0.7)", lineHeight:1.7 }}>{result.message}</p>
            </div>
            {result.shoutout && <div style={{ background:"rgba(252,211,77,0.1)", border:"1px solid rgba(252,211,77,0.25)", borderRadius:14, padding:16, marginBottom:12 }}><p style={{ fontSize:11, color:"#FCD34D", fontWeight:700, marginBottom:6, textTransform:"uppercase", letterSpacing:0.8 }}>⭐ Shoutout</p><p style={{ fontSize:14, color:"rgba(255,255,255,0.8)" }}>{result.shoutout}</p></div>}
            {result.challenge && <div style={{ background:"rgba(134,239,172,0.1)", border:"1px solid rgba(134,239,172,0.25)", borderRadius:14, padding:16, marginBottom:12 }}><p style={{ fontSize:11, color:"#86EFAC", fontWeight:700, marginBottom:6, textTransform:"uppercase", letterSpacing:0.8 }}>🎯 Today's Challenge</p><p style={{ fontSize:14, color:"rgba(255,255,255,0.8)" }}>{result.challenge}</p></div>}
            {result.quote && <div style={{ background:"rgba(255,255,255,0.05)", borderRadius:14, padding:16, borderLeft:"3px solid #A78BFA" }}><p style={{ fontSize:13, color:"rgba(255,255,255,0.6)", fontStyle:"italic", lineHeight:1.6 }}>"{result.quote}"</p></div>}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Add Goal Modal ─────────────────────────────────────────────────────────
function AddGoalModal({ members, onAdd, onClose }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Health");
  const [deadline, setDeadline] = useState("");
  const [assignedTo, setAssignedTo] = useState("all");
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, backdropFilter:"blur(6px)", padding:16, animation:"fadeIn 0.2s" }}>
      <div className="glass" style={{ borderRadius:22, padding:26, width:"100%", maxWidth:380, animation:"slideUp 0.3s ease" }}>
        <h2 style={{ fontFamily:"'Outfit',sans-serif", fontSize:20, color:"#F0EAFF", marginBottom:20 }}>New Goal</h2>
        <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", fontWeight:700, marginBottom:7, textTransform:"uppercase", letterSpacing:0.8 }}>Goal Title</p>
        <input className="m-input" placeholder="e.g. Read 10 books this year" value={title} onChange={e=>setTitle(e.target.value)} style={{ marginBottom:14 }} autoFocus />
        <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", fontWeight:700, marginBottom:7, textTransform:"uppercase", letterSpacing:0.8 }}>Category</p>
        <select className="m-input" value={category} onChange={e=>setCategory(e.target.value)} style={{ marginBottom:14 }}>{GOAL_CATEGORIES.map(c=><option key={c}>{c}</option>)}</select>
        <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", fontWeight:700, marginBottom:7, textTransform:"uppercase", letterSpacing:0.8 }}>Assigned To</p>
        <select className="m-input" value={assignedTo} onChange={e=>setAssignedTo(e.target.value)} style={{ marginBottom:14 }}>
          <option value="all">👥 Everyone</option>
          {members.map(m=><option key={m.id} value={m.id}>{m.avatar} {m.name}</option>)}
        </select>
        <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", fontWeight:700, marginBottom:7, textTransform:"uppercase", letterSpacing:0.8 }}>Deadline <span style={{ color:"rgba(255,255,255,0.2)", textTransform:"none" }}>(optional)</span></p>
        <input type="date" className="m-input" value={deadline} onChange={e=>setDeadline(e.target.value)} style={{ marginBottom:20 }} />
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onClose} style={{ flex:1, background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:10, color:"rgba(255,255,255,0.5)", padding:"12px", cursor:"pointer", fontFamily:"'Nunito',sans-serif", fontSize:14, fontWeight:600 }}>Cancel</button>
          <button onClick={()=>{ if(!title.trim()) return; onAdd({id:Date.now().toString(),title:title.trim(),category,deadline,assignedTo,completed:false,createdAt:getToday()}); onClose(); }}
            style={{ flex:2, background:"linear-gradient(135deg,#7C3AED,#4F46E5)", color:"#fff", border:"none", borderRadius:10, padding:"12px", cursor:"pointer", fontFamily:"'Nunito',sans-serif", fontSize:14, fontWeight:700 }}>Add Goal</button>
        </div>
      </div>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function AccountabilityBoard() {
  const [boardId, setBoardId] = useState(() => {
    const urlBoard = new URLSearchParams(window.location.search).get("board");
    return urlBoard || localStorage.getItem("acc_board_id") || null;
  });
  const [myMemberId, setMyMemberId] = useState(() => localStorage.getItem("acc_member_id") || null);
  const [isJoining] = useState(() => {
    const urlBoard = new URLSearchParams(window.location.search).get("board");
    return urlBoard && urlBoard !== localStorage.getItem("acc_board_id");
  });
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("board");
  const [toast, setToast] = useState(null);
  const [showAI, setShowAI] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  const showToast = useCallback((msg, type="success") => setToast({ message:msg, type }), []);

  useEffect(() => {
    if (!boardId || isJoining) { setLoading(false); return; }
    supabase.from("boards").select("*").eq("id", boardId).single().then(({ data }) => {
      if (data) setBoard(data);
      setLoading(false);
    });
    const channel = supabase.channel(`board_${boardId}`)
      .on("postgres_changes", { event:"UPDATE", schema:"public", table:"boards", filter:`id=eq.${boardId}` }, (payload) => setBoard(payload.new))
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [boardId, isJoining]);

  const getStreak = useCallback((memberId) => {
    const checkins = board?.checkins||{};
    let s=0; const d=new Date();
    while(true){ const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; if((checkins[k]||[]).includes(memberId)){s++;d.setDate(d.getDate()-1);}else break; }
    return s;
  }, [board]);

  const updateBoard = async (updates) => {
    const { error } = await supabase.from("boards").update(updates).eq("id", boardId);
    if (error) { showToast("Sync failed.", "error"); console.error(error); }
  };

  if (isJoining && boardId) {
    return <JoinScreen boardId={boardId} onJoined={(id, mid) => {
      setBoardId(id); setMyMemberId(mid);
      window.history.replaceState({}, "", window.location.pathname);
      setLoading(true);
    }} />;
  }

  if (!boardId) {
    return <SetupScreen onComplete={(id, mid, shouldShowInvite) => {
      setBoardId(id); setMyMemberId(mid); setLoading(true);
      // Auto-show invite modal for duo/group after board creation
      if (shouldShowInvite) setTimeout(() => setShowInvite(true), 1000);
    }} />;
  }

  if (loading || !board) return <LoadingScreen />;

  const today = getToday();
  const last7 = getLast7();
  const last28 = getLast28();
  const checkins = board.checkins||{};
  const goals = board.goals||[];
  const members = board.members||[];
  const todayCheckedIn = checkins[today]||[];
  const allCheckedIn = members.length > 0 && todayCheckedIn.length === members.length;

  const toggleCheckin = async (memberId, memberName) => {
    const dayList = checkins[today]||[];
    const already = dayList.includes(memberId);
    await updateBoard({ checkins:{ ...checkins, [today]: already ? dayList.filter(id=>id!==memberId) : [...dayList, memberId] } });
    if (!already) showToast(`✅ ${memberName} checked in!`, "success");
  };

  const toggleGoal = async (goalId) => updateBoard({ goals: goals.map(g=>g.id===goalId?{...g,completed:!g.completed}:g) });
  const addGoal = async (goal) => { await updateBoard({ goals:[...goals,goal] }); showToast("Goal added! 🎯"); };
  const deleteGoal = async (goalId) => updateBoard({ goals:goals.filter(g=>g.id!==goalId) });

  const exportCSV = () => {
    const rows = [["Date",...members.map(m=>`${m.avatar} ${m.name}`)]];
    Object.keys(checkins).sort().forEach(d=>{ rows.push([d,...members.map(m=>(checkins[d]||[]).includes(m.id)?"Done":"")]); });
    rows.push([]); rows.push(["--- GOALS ---"]); rows.push(["Title","Category","Assigned","Deadline","Status"]);
    goals.forEach(g=>{ const m=members.find(x=>x.id===g.assignedTo); rows.push([g.title,g.category,m?m.name:"Everyone",g.deadline||"-",g.completed?"Completed":"In Progress"]); });
    const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([rows.map(r=>r.map(c=>`"${c}"`).join(",")).join("\n")],{type:"text/csv"})); a.download=`accountability-${today}.csv`; a.click();
    showToast("📥 CSV exported!", "info");
  };

  const resetBoard = () => { localStorage.removeItem("acc_board_id"); localStorage.removeItem("acc_member_id"); setBoardId(null); setMyMemberId(null); setBoard(null); };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#0F0A1E 0%,#1A0F3C 50%,#0D1A2E 100%)", color:"#E2D9F3", fontFamily:"'Nunito',sans-serif", position:"relative", overflowX:"hidden" }}>
      <style>{STYLES}</style>
      <div className="orb" style={{ width:350, height:350, background:"#7C3AED", top:-120, right:-100, opacity:0.12, animation:"pulse 4s ease-in-out infinite" }} />
      <div className="orb" style={{ width:250, height:250, background:"#4F46E5", bottom:100, left:-80, opacity:0.1, animation:"pulse 5s ease-in-out infinite" }} />

      {toast && <Toast message={toast.message} type={toast.type} onClose={()=>setToast(null)} />}
      {showAI && <AIMotivationModal board={board} onClose={()=>setShowAI(false)} />}
      {showAddGoal && <AddGoalModal members={members} onAdd={addGoal} onClose={()=>setShowAddGoal(false)} />}
      {showInvite && <InviteModal boardId={boardId} boardName={board.board_name} onClose={()=>setShowInvite(false)} />}

      <div style={{ maxWidth:620, margin:"0 auto", padding:"0 16px 100px" }}>

        {/* Header */}
        <div style={{ padding:"28px 0 18px", animation:"slideUp 0.5s ease", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
              <span className="live-dot" />
              <p style={{ color:"rgba(255,255,255,0.35)", fontSize:12 }}>Live · {new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</p>
            </div>
            <h1 style={{ fontFamily:"'Outfit',sans-serif", fontSize:26, fontWeight:900, color:"#F0EAFF" }}>{board.board_name}</h1>
            <p style={{ color:"rgba(255,255,255,0.35)", fontSize:12, marginTop:3 }}>{members.map(m=>m.avatar).join(" ")} {members.map(m=>m.name).join(", ")}</p>
          </div>
          <div style={{ display:"flex", gap:4, flexShrink:0 }}>
            {board.mode !== MODES.SOLO && <button className="icon-btn" style={{ fontSize:20 }} onClick={()=>setShowInvite(true)} title="Invite">🔗</button>}
            <button className="icon-btn" style={{ fontSize:20 }} onClick={()=>setShowAI(true)} title="AI Coach">🤖</button>
            <button className="icon-btn" style={{ fontSize:20 }} onClick={exportCSV} title="Export">📥</button>
            <button className="icon-btn" style={{ fontSize:18 }} onClick={resetBoard} title="Leave">🚪</button>
          </div>
        </div>

        {/* Status Banner */}
        <div className="glass-card" style={{ padding:"16px 20px", marginBottom:20, animation:"slideUp 0.5s 0.1s ease both", background:allCheckedIn?"rgba(134,239,172,0.1)":"rgba(255,255,255,0.05)", borderColor:allCheckedIn?"rgba(134,239,172,0.3)":"rgba(255,255,255,0.1)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <p style={{ fontFamily:"'Outfit',sans-serif", fontSize:17, fontWeight:800, color:allCheckedIn?"#86EFAC":"#F0EAFF" }}>{allCheckedIn?"🎉 Everyone checked in!":`${todayCheckedIn.length}/${members.length} checked in today`}</p>
              <p style={{ fontSize:12, color:"rgba(255,255,255,0.35)", marginTop:2 }}>{allCheckedIn?"Amazing! Keep the streak alive.":"Tap your ring below to check in 👇"}</p>
            </div>
            <p style={{ fontFamily:"'Outfit',sans-serif", fontSize:30, fontWeight:900, color:allCheckedIn?"#86EFAC":"rgba(255,255,255,0.15)" }}>{members.length>0?Math.round((todayCheckedIn.length/members.length)*100):0}%</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:4, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:40, padding:4, marginBottom:20, animation:"slideUp 0.5s 0.15s ease both" }}>
          {["board","goals","streaks"].map(t=>(
            <button key={t} className={`tab-btn ${tab===t?"active":"inactive"}`} style={{ flex:1 }} onClick={()=>setTab(t)}>
              {t==="board"?"Board":t==="goals"?"Goals":"Streaks"}
            </button>
          ))}
        </div>

        {/* BOARD TAB */}
        {tab === "board" && (
          <div>
            {members.map((member, i) => {
              const checkedIn = (checkins[today]||[]).includes(member.id);
              const streak = getStreak(member.id);
              const memberGoals = goals.filter(g=>g.assignedTo===member.id||g.assignedTo==="all");
              const isMe = member.id === myMemberId;
              return (
                <div key={member.id} className="glass-card" style={{ padding:20, marginBottom:14, animation:"slideUp 0.4s ease both", animationDelay:`${i*0.08}s`, borderColor:isMe?"rgba(167,139,250,0.3)":"rgba(255,255,255,0.1)" }}>
                  {isMe && <p style={{ fontSize:11, color:"#A78BFA", fontWeight:700, marginBottom:10, textTransform:"uppercase", letterSpacing:1 }}>👤 You</p>}
                  <div style={{ display:"flex", gap:14, alignItems:"center", marginBottom:16 }}>
                    <div onClick={()=>toggleCheckin(member.id, member.name)}
                      style={{ width:52, height:52, borderRadius:"50%", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, transition:"all 0.25s", flexShrink:0, background:checkedIn?"rgba(134,239,172,0.2)":"rgba(255,255,255,0.06)", border:`2.5px solid ${checkedIn?"#86EFAC":"rgba(255,255,255,0.15)"}`, boxShadow:checkedIn?"0 0 20px rgba(134,239,172,0.3)":"none" }}>
                      {checkedIn?"✓":member.avatar}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <h3 style={{ fontFamily:"'Outfit',sans-serif", fontSize:18, fontWeight:800, color:"#F0EAFF" }}>{member.name}</h3>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          {streak>0 && <span style={{ fontSize:13, fontWeight:700, color:"#FCD34D" }}>🔥 {streak}d</span>}
                          <span style={{ fontSize:12, background:checkedIn?"rgba(134,239,172,0.15)":"rgba(255,255,255,0.07)", color:checkedIn?"#86EFAC":"rgba(255,255,255,0.4)", padding:"2px 10px", borderRadius:20, fontWeight:600 }}>{checkedIn?"✓ Done":"Pending"}</span>
                        </div>
                      </div>
                      <p style={{ fontSize:12, color:"rgba(255,255,255,0.35)", marginTop:3 }}>{memberGoals.length>0?`${memberGoals.filter(g=>g.completed).length}/${memberGoals.length} goals complete`:"No goals yet"}</p>
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:6 }}>
                    {last7.map(d=>{
                      const done=(checkins[d]||[]).includes(member.id);
                      return (
                        <div key={d} style={{ flex:1, textAlign:"center" }}>
                          <div style={{ height:32, borderRadius:6, background:done?"rgba(167,139,250,0.2)":"rgba(255,255,255,0.05)", border:`1px solid ${done?"rgba(167,139,250,0.5)":"rgba(255,255,255,0.08)"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:done?"#A78BFA":"rgba(255,255,255,0.1)" }}>{done?"✓":"·"}</div>
                          <p style={{ fontSize:10, color:d===today?"#A78BFA":"rgba(255,255,255,0.25)", marginTop:4, fontWeight:d===today?700:400 }}>{DAY_LABELS[new Date(d+"T12:00:00").getDay()]}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {/* Invite CTA only for duo/group */}
            {board.mode !== MODES.SOLO && (
              <div className="glass-card" style={{ padding:20, textAlign:"center", borderStyle:"dashed", cursor:"pointer", opacity:0.7 }} onClick={()=>setShowInvite(true)}>
                <p style={{ fontSize:20, marginBottom:6 }}>🔗</p>
                <p style={{ fontFamily:"'Outfit',sans-serif", fontSize:15, fontWeight:700, color:"#A78BFA" }}>Invite your {board.mode===MODES.DUO?"partner":"group members"}</p>
                <p style={{ fontSize:12, color:"rgba(255,255,255,0.35)", marginTop:4 }}>Share the link so they can join and check in live</p>
              </div>
            )}
          </div>
        )}

        {/* GOALS TAB */}
        {tab === "goals" && (
          <div style={{ animation:"slideUp 0.4s ease" }}>
            {goals.length === 0 ? (
              <div style={{ textAlign:"center", padding:"60px 0" }}>
                <div style={{ fontSize:48, marginBottom:12, animation:"float 3s ease-in-out infinite" }}>🎯</div>
                <p style={{ fontFamily:"'Outfit',sans-serif", fontSize:18, color:"rgba(255,255,255,0.2)" }}>No goals yet</p>
                <p style={{ fontSize:13, color:"rgba(255,255,255,0.3)", marginTop:6 }}>Tap + to add your first goal</p>
              </div>
            ) : (
              <div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
                  {[[goals.length,"Total Goals","#A78BFA"],[goals.filter(g=>g.completed).length,"Completed","#86EFAC"]].map(([v,l,c])=>(
                    <div key={l} className="glass-card" style={{ padding:14, textAlign:"center" }}>
                      <p style={{ fontFamily:"'Outfit',sans-serif", fontSize:26, fontWeight:900, color:c }}>{v}</p>
                      <p style={{ fontSize:12, color:"rgba(255,255,255,0.35)" }}>{l}</p>
                    </div>
                  ))}
                </div>
                {GOAL_CATEGORIES.filter(cat=>goals.some(g=>g.category===cat)).map(cat=>(
                  <div key={cat} style={{ marginBottom:16 }}>
                    <p style={{ fontSize:11, color:CAT_COLORS[cat]||"#A78BFA", fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>{cat}</p>
                    {goals.filter(g=>g.category===cat).map(goal=>{
                      const assignedMember=members.find(m=>m.id===goal.assignedTo);
                      return (
                        <div key={goal.id} className="glass-card" style={{ padding:"14px 16px", marginBottom:8, display:"flex", gap:12, alignItems:"center", opacity:goal.completed?0.6:1 }}>
                          <div onClick={()=>toggleGoal(goal.id)} style={{ width:26, height:26, borderRadius:"50%", border:`2px solid ${goal.completed?"#86EFAC":"rgba(255,255,255,0.2)"}`, background:goal.completed?"rgba(134,239,172,0.2)":"transparent", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, color:"#86EFAC", flexShrink:0, transition:"all 0.2s" }}>{goal.completed?"✓":""}</div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <p style={{ fontSize:14, fontWeight:700, color:"#F0EAFF", textDecoration:goal.completed?"line-through":"none" }}>{goal.title}</p>
                            <div style={{ display:"flex", gap:8, marginTop:3 }}>
                              <span style={{ fontSize:11, color:"rgba(255,255,255,0.35)" }}>{assignedMember?`${assignedMember.avatar} ${assignedMember.name}`:"👥 Everyone"}</span>
                              {goal.deadline && <span style={{ fontSize:11, color:"rgba(255,255,255,0.35)" }}>📅 {fmtDate(goal.deadline)}</span>}
                            </div>
                          </div>
                          <button className="icon-btn" onClick={()=>deleteGoal(goal.id)}>🗑️</button>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STREAKS TAB */}
        {tab === "streaks" && (
          <div style={{ animation:"slideUp 0.4s ease" }}>
            <div className="glass-card" style={{ padding:20, marginBottom:14 }}>
              <p style={{ fontFamily:"'Outfit',sans-serif", fontSize:16, fontWeight:800, color:"#F0EAFF", marginBottom:16 }}>🏆 Streak Leaderboard</p>
              {[...members].sort((a,b)=>getStreak(b.id)-getStreak(a.id)).map((m,rank)=>{
                const streak=getStreak(m.id);
                const totalDays=Object.keys(checkins).filter(d=>(checkins[d]||[]).includes(m.id)).length;
                return (
                  <div key={m.id} style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 0", borderBottom:rank<members.length-1?"1px solid rgba(255,255,255,0.06)":"none" }}>
                    <span style={{ fontSize:22, width:30, textAlign:"center" }}>{["🥇","🥈","🥉"][rank]||`#${rank+1}`}</span>
                    <span style={{ fontSize:28 }}>{m.avatar}</span>
                    <div style={{ flex:1 }}>
                      <p style={{ fontFamily:"'Outfit',sans-serif", fontSize:16, fontWeight:800, color:"#F0EAFF" }}>{m.name} {m.id===myMemberId&&<span style={{ fontSize:11, color:"#A78BFA" }}>(you)</span>}</p>
                      <p style={{ fontSize:12, color:"rgba(255,255,255,0.35)" }}>{totalDays} total check-ins</p>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <p style={{ fontFamily:"'Outfit',sans-serif", fontSize:22, fontWeight:900, color:streak>0?"#FCD34D":"rgba(255,255,255,0.2)" }}>{streak>0?`🔥${streak}`:"0"}</p>
                      <p style={{ fontSize:11, color:"rgba(255,255,255,0.3)" }}>day streak</p>
                    </div>
                  </div>
                );
              })}
            </div>
            {members.map(m=>{
              const totalDays=Object.keys(checkins).filter(d=>(checkins[d]||[]).includes(m.id)).length;
              return (
                <div key={m.id} className="glass-card" style={{ padding:18, marginBottom:12 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
                    <p style={{ fontFamily:"'Outfit',sans-serif", fontSize:15, fontWeight:800, color:"#F0EAFF" }}>{m.avatar} {m.name} {m.id===myMemberId&&<span style={{ fontSize:11, color:"#A78BFA" }}>(you)</span>}</p>
                    <p style={{ fontSize:12, color:"rgba(255,255,255,0.35)" }}>{totalDays} days</p>
                  </div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                    {last28.map(d=>{
                      const done=(checkins[d]||[]).includes(m.id);
                      return <div key={d} title={d} style={{ width:20, height:20, borderRadius:4, background:done?"#A78BFA":"rgba(255,255,255,0.06)", border:`1px solid ${done?"rgba(167,139,250,0.5)":"rgba(255,255,255,0.05)"}`, transition:"all 0.2s" }} />;
                    })}
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
                    <p style={{ fontSize:10, color:"rgba(255,255,255,0.25)" }}>28 days ago</p>
                    <p style={{ fontSize:10, color:"rgba(255,255,255,0.25)" }}>Today</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <button className="add-fab" onClick={()=>setShowAddGoal(true)}>+</button>
    </div>
  );
}