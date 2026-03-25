/**
 * Finexa — App.jsx (Fully Restored + UI Overhaul)
 * - Every original function, modal, and database logic restored.
 * - Navbar fixed to scroll to sections.
 * - "How It Works" overhauled with CSS-driven "Framer-style" animations.
 */

import { useState, useEffect, useCallback, useRef, createContext, useContext, Component } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── Supabase ─────────────────────────────────────────────────────────────────
const SUPA_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPA_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = (SUPA_URL && SUPA_KEY) ? createClient(SUPA_URL, SUPA_KEY) : null;

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  ink:"#0A0F1E", ink80:"rgba(10,15,30,.8)",
  white:"#F5F4F0", white80:"rgba(245,244,240,.8)", white40:"rgba(245,244,240,.4)",
  gold:"#C8A96E", goldLt:"#E4CFA0", gold10:"rgba(200,169,110,.10)",
  gold18:"rgba(200,169,110,.18)", gold25:"rgba(200,169,110,.25)", gold50:"rgba(200,169,110,.5)",
  electric:"#1AFFB2", electric10:"rgba(26,255,178,.10)", electric20:"rgba(26,255,178,.20)",
  mid:"#1C2340", slate:"#5B6485", border:"rgba(200,169,110,.18)",
  red:"#FF6B6B", red10:"rgba(255,107,107,.10)", blue:"#4B8BFF",
  fontDisplay:"'Syne', system-ui, sans-serif",
  fontBody:"'DM Sans', 'Helvetica Neue', sans-serif",
  fontMono:"'Space Mono', monospace",
};

// ─── Global keyframes ─────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&family=Space+Mono:wght@400;700&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  html { scroll-behavior:smooth; }
  body { background:#0A0F1E; color:#F5F4F0; font-family:'DM Sans',sans-serif; font-weight:300; overflow-x:hidden; }
  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-track { background:#0A0F1E; }
  ::-webkit-scrollbar-thumb { background:rgba(200,169,110,.3); }

  @keyframes fadeUp       { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:none} }
  @keyframes fadeIn       { from{opacity:0} to{opacity:.7} }
  @keyframes pulse        { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.05);opacity:.7} }
  @keyframes gridDrift    { from{transform:translateY(0)} to{transform:translateY(60px)} }
  @keyframes gradShift    { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
  @keyframes ticker       { from{transform:translateX(0)} to{transform:translateX(-50%)} }
  @keyframes scrollBounce { 0%,100%{transform:translateY(0);opacity:1} 70%{transform:translateY(10px);opacity:0} }
  @keyframes slideIn      { from{opacity:0;transform:translateX(10px)} to{opacity:1;transform:none} }
  @keyframes particleUp  {
    0%  { opacity:0; transform:translateY(100vh) scale(0); }
    10% { opacity:.4; }
    90% { opacity:.2; }
    100%{ opacity:0; transform:translateY(-10vh) scale(1.5); }
  }

  /* Show-Not-Tell Frame Animations */
  @keyframes windowFloat { 0%, 100% { transform: translateY(0) rotateX(2deg); } 50% { transform: translateY(-15px) rotateX(5deg); } }
  @keyframes checkPop { 0% { transform: scale(0); opacity:0; } 80% { transform: scale(1.2); } 100% { transform: scale(1); opacity:1; } }
  @keyframes barFill { from { width: 0%; } to { width: 100%; } }
  @keyframes cursorTap { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(20px, 15px); } }

  .reveal { opacity:0; transform:translateY(28px); transition:opacity .75s cubic-bezier(.16,1,.3,1), transform .75s cubic-bezier(.16,1,.3,1); }
  .reveal.visible { opacity:1; transform:none; }
  .reveal-slide { opacity:0; transform:translateX(-20px); transition:opacity .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1); }
  .reveal-slide.visible { opacity:1; transform:none; }

  .nav-link-land { font-size:.75rem; color:#5B6485; text-decoration:none; letter-spacing:.1em; text-transform:uppercase; font-family:'Space Mono',monospace; padding:.4rem .5rem; transition:color .2s; cursor:pointer; }
  .nav-link-land:hover { color:#F5F4F0; }

  .feat-card { background:#1C2340; border:1px solid rgba(200,169,110,.18); border-left:2px solid transparent; padding:2rem; transition:all .25s; cursor:default; }
  .feat-card:hover { background:rgba(200,169,110,.05); border-left-color:#C8A96E; transform:translateY(-3px); box-shadow:0 12px 40px rgba(0,0,0,.3); }

  .btn-land-primary { background:#C8A96E; color:#0A0F1E; font-family:'Syne',system-ui,sans-serif; font-weight:700; letter-spacing:.05em; border:none; cursor:pointer; transition:all .2s; }
  .btn-land-primary:hover { background:#E4CFA0; transform:translateY(-2px); box-shadow:0 12px 32px rgba(200,169,110,.25); }
  .btn-land-secondary { background:transparent; color:#F5F4F0; font-family:'Syne',system-ui,sans-serif; font-weight:600; letter-spacing:.05em; border:1px solid rgba(200,169,110,.18); cursor:pointer; transition:all .2s; }
  .btn-land-secondary:hover { border-color:#C8A96E; color:#C8A96E; }
  .sidebar-btn:hover { background:rgba(200,169,110,.08) !important; color:#F5F4F0 !important; }

  .mock-window { background: #0A0F1E; border: 1px solid ${T.border}; border-radius: 8px; box-shadow: 0 30px 60px rgba(0,0,0,0.5); overflow: hidden; position: relative; perspective: 1000px; }
  .mock-header { background: #1C2340; padding: 10px; display: flex; gap: 6px; border-bottom: 1px solid ${T.border}; }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: ${T.slate}; opacity: 0.5; }
`;

// ─── Shared Logic (Error Boundary, Auth, Router, Toast) ──────────────────────
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error:null }; }
  static getDerivedStateFromError(e) { return { error:e }; }
  render() {
    if (this.state.error) return (
      <div style={{ minHeight:"100vh", background:T.ink, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:"1rem", padding:"2rem" }}>
        <div style={{ fontFamily:T.fontDisplay, color:T.gold, fontSize:"1.8rem", fontWeight:800 }}>Finexa</div>
        <div style={{ color:T.red, background:T.red10, border:`1px solid ${T.red}`, padding:"1rem 1.5rem", maxWidth:520, fontSize:".78rem", wordBreak:"break-all", fontFamily:T.fontMono }}>{this.state.error.message}</div>
        <button onClick={() => window.location.reload()} style={{ background:T.gold, color:T.ink, border:"none", padding:".75rem 1.5rem", cursor:"pointer" }}>Reload</button>
      </div>
    );
    return this.props.children;
  }
}

function MissingEnv() {
  return (
    <div style={{ minHeight:"100vh", background:T.ink, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:"1.25rem" }}>
      <Logo size={40}/>
      <div style={{ color:T.red, fontSize:".75rem", fontFamily:T.fontMono }}>Missing Supabase environment variables</div>
    </div>
  );
}

const AuthCtx = createContext(null);
const RouterCtx = createContext(null);
const ToastCtx = createContext(null);
const useAuth = () => useContext(AuthCtx);
const useRouter = () => useContext(RouterCtx);
const useToast = () => useContext(ToastCtx);

function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined);
  const [profile, setProfile] = useState(null);
  useEffect(() => {
    if (!supabase) { setSession(null); return; }
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data:{ subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (!session || !supabase) { setProfile(null); return; }
    supabase.from("profiles").select("*, organizations(*)").eq("id", session.user.id).single().then(({ data }) => setProfile(data));
  }, [session]);
  const signIn  = (e, p) => supabase?.auth.signInWithPassword({ email:e, password:p });
  const signUp  = (e, p, n) => supabase?.auth.signUp({ email:e, password:p, options:{ data:{ full_name:n } } });
  const signOut = () => supabase?.auth.signOut();
  return <AuthCtx.Provider value={{ session, profile, signIn, signUp, signOut, supabase }}>{children}</AuthCtx.Provider>;
}

function Router({ children }) {
  const [path, setPath] = useState(() => window.location.hash.slice(1) || "/");
  useEffect(() => {
    const h = () => setPath(window.location.hash.slice(1) || "/");
    window.addEventListener("hashchange", h);
    return () => window.removeEventListener("hashchange", h);
  }, []);
  const navigate = useCallback(to => { window.location.hash = to; }, []);
  return <RouterCtx.Provider value={{ path, navigate }}>{children}</RouterCtx.Provider>;
}

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const toast = useCallback((msg, type = "info") => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);
  const colors = { info:T.gold, success:T.electric, error:T.red };
  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      <div style={{ position:"fixed", bottom:"2rem", right:"2rem", zIndex:9000, display:"flex", flexDirection:"column", gap:".5rem" }}>
        {toasts.map(t => (
          <div key={t.id} style={{ background:T.mid, borderLeft:`3px solid ${colors[t.type]||T.gold}`, color:T.white, fontFamily:T.fontMono, fontSize:".72rem", padding:".75rem 1.25rem", boxShadow:"0 8px 32px rgba(0,0,0,.4)", animation:"slideIn .25s ease-out" }}>{t.msg}</div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

// ─── Shared Components (Logo, Btn, Input, Badge, etc.) ──────────────────────
function Logo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      <rect x="1.5" y="1.5" width="53" height="53" rx="9" stroke={T.gold} strokeWidth="1.5"/>
      <path d="M16 28 L28 14 L40 28 L28 42 Z" fill={T.gold} opacity="0.9"/>
      <line x1="28" y1="12" x2="28" y2="44" stroke={T.electric} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function Btn({ children, onClick, variant="primary", disabled, style:s }) {
  const base = { fontFamily:T.fontDisplay, fontWeight:700, fontSize:".82rem", letterSpacing:".05em", padding:".75rem 1.5rem", border:"none", cursor:disabled?"not-allowed":"pointer", transition:"all .2s", opacity:disabled?.5:1, ...s };
  const vs = {
    primary:   { background:T.gold, color:T.ink },
    secondary: { background:"transparent", border:`1px solid ${T.border}`, color:T.white },
    danger:    { background:T.red10, border:`1px solid ${T.red}`, color:T.red },
    ghost:     { background:"transparent", color:T.slate },
  };
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...vs[variant] }}>{children}</button>;
}

function Input({ label, id, error, ...props }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:".4rem" }}>
      {label && <label htmlFor={id} style={{ fontFamily:T.fontMono, fontSize:".62rem", color:T.slate, letterSpacing:".08em", textTransform:"uppercase" }}>{label}</label>}
      <input id={id} {...props} style={{ background:"rgba(10,15,30,.6)", border:`1px solid ${error?T.red:T.border}`, color:T.white, fontFamily:T.fontBody, fontSize:".88rem", padding:".65rem .9rem", outline:"none", width:"100%", ...props.style }}/>
    </div>
  );
}

function Badge({ status }) {
  const m = { paid:{ bg:T.electric10, color:T.electric, label:"PAID" }, pending:{ bg:T.gold10, color:T.gold, label:"PENDING" }, processed:{ bg:T.electric10, color:T.electric, label:"PROCESSED" }, draft:{ bg:T.mid, color:T.slate, label:"DRAFT" } };
  const s = m[status]||m.draft;
  return <span style={{ background:s.bg, color:s.color, fontFamily:T.fontMono, fontSize:".58rem", padding:".2rem .6rem" }}>{s.label}</span>;
}

function Modal({ open, onClose, title, children, width=540 }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(10,15,30,.85)", backdropFilter:"blur(8px)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div onClick={e => e.stopPropagation()} style={{ background:T.mid, border:`1px solid ${T.border}`, width, maxWidth:"90vw", maxHeight:"85vh", overflowY:"auto", padding:"2.5rem" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"2rem" }}>
          <h2 style={{ fontFamily:T.fontDisplay, fontWeight:800, fontSize:"1.25rem", color:T.white }}>{title}</h2>
          <button onClick={onClose} style={{ background:"none", border:"none", color:T.slate, cursor:"pointer", fontSize:"1.2rem" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function PageHeader({ title, sub, action }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"3rem" }}>
      <div>
        <div style={{ fontFamily:T.fontMono, fontSize:".62rem", letterSpacing:".2em", color:T.electric, textTransform:"uppercase", marginBottom:".5rem" }}>— {title}</div>
        {sub && <p style={{ color:T.slate, fontSize:".88rem" }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

function Loader() { return <div style={{ display:"flex", justifyContent:"center", padding:"4rem", color:T.gold, fontFamily:T.fontMono }}>LOADING…</div>; }

function EmptyState({ icon, title, sub, compact }) {
  return (
    <div style={{ textAlign:"center", padding:compact?"2rem":"5rem 2rem" }}>
      <div style={{ fontSize:"3rem", color:T.gold25, marginBottom:"1rem" }}>{icon}</div>
      <div style={{ fontFamily:T.fontDisplay, fontWeight:700, color:T.white }}>{title}</div>
      <div style={{ fontFamily:T.fontBody, fontSize:".82rem", color:T.slate }}>{sub}</div>
    </div>
  );
}

function useScrollReveal() {
  useEffect(() => {
    const ro = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visible"); ro.unobserve(e.target); } });
    }, { threshold:.1 });
    document.querySelectorAll(".reveal, .reveal-slide").forEach(el => ro.observe(el));
    return () => ro.disconnect();
  }, []);
}

// ═══════════════════════════════════════════════════════════════
// LANDING PAGE (UI UPDATED)
// ═══════════════════════════════════════════════════════════════
function LandingPage() {
  const { navigate } = useRouter();
  const { session } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const particlesRef = useRef(null);
  useScrollReveal();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ background:T.ink, color:T.white }}>
      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:200, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"1.25rem 4rem", background:scrolled?T.ink80:"transparent", backdropFilter:scrolled?"blur(20px)":"none", borderBottom:scrolled?`1px solid ${T.border}`:"1px solid transparent", transition:".3s" }}>
        <div style={{ display:"flex", alignItems:"center", gap:".65rem", cursor:"pointer" }} onClick={() => window.scrollTo(0,0)}>
          <Logo size={26}/>
          <span style={{ fontFamily:T.fontDisplay, fontWeight:800, fontSize:"1.1rem" }}>Fine<span style={{ color:T.gold }}>x</span>a</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"1.75rem" }}>
          <span onClick={() => scrollTo('features')} className="nav-link-land">Features</span>
          <span onClick={() => scrollTo('how-it-works')} className="nav-link-land">How It Works</span>
          <span onClick={() => scrollTo('pricing')} className="nav-link-land">Pricing</span>
          {session ? (
            <Btn onClick={() => navigate("/dashboard")} style={{ padding:".55rem 1rem" }}>Go to App →</Btn>
          ) : (
            <Btn onClick={() => navigate("/login")} style={{ padding:".55rem 1rem" }}>Sign In</Btn>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight:"100vh", display:"flex", flexDirection:"column", justifyContent:"center", padding:"0 4rem", position:"relative" }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:`linear-gradient(${T.gold10} 1px,transparent 1px),linear-gradient(90deg,${T.gold10} 1px,transparent 1px)`, backgroundSize:"60px 60px", animation:"gridDrift 20s linear infinite", zIndex:0 }}/>
        <div style={{ position:"relative", zIndex:1, maxWidth:900 }}>
          <h1 style={{ fontFamily:T.fontDisplay, fontWeight:800, fontSize:"clamp(3.5rem,8vw,7rem)", lineHeight:1, letterSpacing:"-.04em", marginBottom:"2rem", animation: "fadeUp .8s ease" }}>
            Finance, <span style={{ color:T.gold }}>Engineered</span> for What's Next.
          </h1>
          <p style={{ maxWidth:500, fontSize:"1.1rem", color:T.slate, marginBottom:"3rem", animation: "fadeUp .8s .2s ease both" }}>
            Finexa is smart financial software that helps Nigerian businesses handle payments, payroll, invoices, and receipts.
          </p>
          <div style={{ display:"flex", gap:"1rem", animation: "fadeUp .8s .4s ease both" }}>
            <Btn onClick={() => navigate("/login")} style={{ padding:"1rem 2.5rem" }}>Get Started Free →</Btn>
            <Btn variant="secondary" onClick={() => scrollTo('how-it-works')} style={{ padding:"1rem 2.5rem" }}>See How it Works</Btn>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding:"10rem 4rem" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div className="reveal" style={{ marginBottom:"4rem" }}>
            <div style={{ fontFamily:T.fontMono, color:T.electric, fontSize:".7rem", textTransform:"uppercase", letterSpacing:".2em" }}>— Capabilities</div>
            <h2 style={{ fontFamily:T.fontDisplay, fontSize:"3rem", fontWeight:800 }}>Everything you need</h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:"1.5rem" }}>
            {[
              { t:"Payroll Automation", d:"Add employees, set salaries, and run payroll in seconds. Automate PAYE and pension." },
              { t:"Professional Invoicing", d:"Create stunning invoices. Track drafts, payments, and overdue accounts in real-time." },
              { t:"Expense Management", d:"Upload receipts and organize business spending by category with ease." },
              { t:"Teller Console", d:"A specialized interface for cash management, daily logs, and branch banking." },
            ].map((f, i) => (
              <div key={f.t} className="feat-card reveal" style={{ transitionDelay:`${i*0.1}s` }}>
                <h3 style={{ fontFamily:T.fontDisplay, marginBottom:"1rem" }}>{f.t}</h3>
                <p style={{ color:T.slate, fontSize:".9rem", lineHeight:1.6 }}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS (ANIMATED SHOW-NOT-TELL) */}
      <section id="how-it-works" style={{ padding:"10rem 4rem", background:T.mid, overflow:"hidden" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div className="reveal" style={{ textAlign:"center", marginBottom:"6rem" }}>
            <div style={{ fontFamily:T.fontMono, color:T.electric, fontSize:".7rem", textTransform:"uppercase" }}>— Experience Finexa</div>
            <h2 style={{ fontFamily:T.fontDisplay, fontSize:"3.5rem", fontWeight:800 }}>Show, Not Tell</h2>
          </div>

          <div style={{ display:"grid", gridTemplateColumns: "1fr 1fr", gap: "6rem", alignItems: "center" }}>
            <div className="reveal-slide">
                <div style={{ display:"flex", flexDirection:"column", gap:"4rem" }}>
                   <div>
                      <h4 style={{ color:T.gold, fontFamily:T.fontMono, marginBottom:"1rem" }}>STEP 01</h4>
                      <h3 style={{ fontFamily:T.fontDisplay, fontSize:"1.8rem", marginBottom:"1rem" }}>Launch Your Workspace</h3>
                      <p style={{ color:T.slate }}>Create your organization profile and brand your financial environment instantly.</p>
                   </div>
                   <div>
                      <h4 style={{ color:T.gold, fontFamily:T.fontMono, marginBottom:"1rem" }}>STEP 02</h4>
                      <h3 style={{ fontFamily:T.fontDisplay, fontSize:"1.8rem", marginBottom:"1rem" }}>Scale Your Operations</h3>
                      <p style={{ color:T.slate }}>Deploy payroll, invoicing, or teller modules with a single click. Your data syncs across all modules.</p>
                   </div>
                </div>
            </div>

            <div className="reveal" style={{ perspective: "1000px" }}>
               <div className="mock-window" style={{ height: "400px", animation: "windowFloat 6s ease-in-out infinite" }}>
                  <div className="mock-header">
                    <div className="dot"/> <div className="dot"/> <div className="dot"/>
                  </div>
                  <div style={{ padding: "2rem" }}>
                    {/* Animated UI Simulation */}
                    <div style={{ height:"10px", width:"40%", background:T.gold10, marginBottom:"20px", borderRadius:"10px" }} />
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"30px" }}>
                       <div style={{ height:"80px", background:T.gold10, border:`1px solid ${T.gold25}`, borderRadius:"4px", display:"flex", alignItems:"center", justifyContent:"center" }}>
                          <div style={{ width:"30px", height:"30px", borderRadius:"50%", background:T.electric, opacity:0, animation:"checkPop 2s 1s forwards infinite" }} />
                       </div>
                       <div style={{ height:"80px", background:T.gold10, border:`1px solid ${T.gold25}`, borderRadius:"4px" }} />
                    </div>
                    <div style={{ height:"2px", width:"100%", background:T.border, marginBottom:"20px" }}>
                       <div style={{ height:"100%", background:T.gold, width:"0%", animation: "barFill 3s ease-out infinite" }} />
                    </div>
                    <div style={{ display:"flex", gap:"10px" }}>
                       {[1,2,3,4].map(i => <div key={i} style={{ height:"40px", flex:1, background:T.gold10, borderRadius:"4px" }} />)}
                    </div>
                  </div>
                  {/* Cursor simulation */}
                  <div style={{ position:"absolute", bottom:"20%", right:"20%", width:"12px", height:"12px", background:T.white, borderRadius:"50%", animation:"cursorTap 4s infinite" }} />
               </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" style={{ padding:"10rem 4rem" }}>
        <div style={{ maxWidth:1000, margin:"0 auto", textAlign:"center" }}>
           <h2 style={{ fontFamily:T.fontDisplay, fontSize:"3rem", marginBottom:"4rem" }}>Growth starts here.</h2>
           <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))", gap:"2rem" }}>
              <div className="feat-card reveal" style={{ border:`1px solid ${T.gold}` }}>
                <h3 style={{ color:T.gold }}>Growth</h3>
                <div style={{ fontSize:"3rem", fontWeight:800, margin:"1.5rem 0" }}>₦15,000<span style={{ fontSize:"1rem", color:T.slate }}>/mo</span></div>
                <Btn onClick={() => navigate("/login")} style={{ width:"100%" }}>Get Started</Btn>
              </div>
           </div>
        </div>
      </section>

      <footer style={{ padding:"4rem", textAlign:"center", borderTop:`1px solid ${T.border}` }}>
        <Logo size={24} />
        <p style={{ marginTop:"1rem", color:T.slate, fontSize:".7rem", fontFamily:T.fontMono }}>© {new Date().getFullYear()} FINEXA TECHNOLOGIES. FINANCE, ENGINEERED.</p>
      </footer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// APP PAGES (RESTORING ALL ORIGINAL LOGIC)
// ═══════════════════════════════════════════════════════════════

function LoginPage() {
  const { signIn, signUp } = useAuth();
  const { navigate } = useRouter();
  const { toast } = useToast();
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    const { error } = mode === "signin" ? await signIn(email, password) : await signUp(email, password, name);
    setLoading(false);
    if (error) toast(error.message, "error");
    else if (mode === "signin") navigate("/dashboard");
    else toast("Check email to confirm", "success");
  };

  return (
    <div style={{ minHeight:"100vh", background:T.ink, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:400, background:T.mid, border:`1px solid ${T.border}`, padding:"3rem" }}>
        <div onClick={() => navigate("/")} style={{ cursor:"pointer", marginBottom:"2rem" }}><Logo /></div>
        <h1 style={{ fontFamily:T.fontDisplay, fontSize:"1.5rem", marginBottom:"2rem" }}>{mode === "signin" ? "Sign In" : "Join Finexa"}</h1>
        <div style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
          {mode === "signup" && <Input label="Full Name" value={name} onChange={e => setName(e.target.value)} />}
          <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          <Btn onClick={submit} disabled={loading}>{loading ? "..." : "Continue"}</Btn>
          <button onClick={() => setMode(mode==="signin"?"signup":"signin")} style={{ background:"none", border:"none", color:T.gold, fontSize:".7rem", cursor:"pointer" }}>
            {mode === "signin" ? "No account? Create one" : "Have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Sidebar() {
  const { path, navigate } = useRouter();
  const { profile, signOut } = useAuth();
  const items = [
    { l:"Dashboard", p:"/dashboard", i:"▦" },
    { l:"Invoices", p:"/invoices", i:"◻" },
    { l:"Payroll", p:"/payroll", i:"◈" },
    { l:"Receipts", p:"/receipts", i:"◉" },
    { l:"Teller", p:"/teller", i:"⬡" },
    { l:"Settings", p:"/settings", i:"◎" },
  ];
  return (
    <nav style={{ position:"fixed", left:0, top:0, bottom:0, width:240, background:T.mid, borderRight:`1px solid ${T.border}`, padding:"2.5rem 1.5rem" }}>
      <div onClick={()=>navigate("/dashboard")} style={{ cursor:"pointer", marginBottom:"3rem" }}><Logo /></div>
      <div style={{ display:"flex", flexDirection:"column", gap:".5rem" }}>
        {items.map(n => (
          <button key={n.p} onClick={()=>navigate(n.p)} style={{ textAlign:"left", background:path.startsWith(n.p)?T.gold10:"none", border:"none", color:path.startsWith(n.p)?T.white:T.slate, padding:".8rem 1rem", cursor:"pointer", fontFamily:T.fontMono, fontSize:".75rem", display:"flex", alignItems:"center", gap:".8rem" }}>
            <span style={{ fontSize:"1.2rem" }}>{n.i}</span> {n.l}
          </button>
        ))}
      </div>
      <div style={{ position:"absolute", bottom:"2rem", left:"1.5rem", right:"1.5rem" }}>
         <div style={{ fontSize:".7rem", color:T.slate, marginBottom:"1rem" }}>{profile?.full_name}</div>
         <Btn variant="secondary" onClick={signOut} style={{ width:"100%", fontSize:".7rem" }}>Logout</Btn>
      </div>
    </nav>
  );
}

function PageShell({ children }) {
  return (
    <div style={{ paddingLeft:240, minHeight:"100vh", background:T.ink }}>
      <Sidebar />
      <main style={{ padding:"4rem" }}>{children}</main>
    </div>
  );
}

// ─── DASHBOARD PAGE
function DashboardPage() {
  const { supabase } = useAuth();
  const [stats, setStats] = useState({ inv:0, pay:0, rec:0 });
  useEffect(() => {
    if (!supabase) return;
    Promise.all([
      supabase.from("invoices").select("*", {count:"exact", head:true}),
      supabase.from("payroll_runs").select("*", {count:"exact", head:true}),
      supabase.from("receipts").select("*", {count:"exact", head:true}),
    ]).then(([i, p, r]) => setStats({ inv:i.count||0, pay:p.count||0, rec:r.count||0 }));
  }, [supabase]);

  return (
    <PageShell>
      <PageHeader title="Dashboard" sub={new Date().toLocaleDateString()} />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:"1.5rem" }}>
        {[
          { l:"Active Invoices", v:stats.inv, c:T.gold },
          { l:"Payroll Runs", v:stats.pay, c:T.electric },
          { l:"Receipts Logged", v:stats.rec, c:T.white }
        ].map(s => (
          <div key={s.l} style={{ background:T.mid, padding:"2rem", border:`1px solid ${T.border}` }}>
            <div style={{ fontSize:".6rem", color:T.slate, textTransform:"uppercase", fontFamily:T.fontMono }}>{s.l}</div>
            <div style={{ fontSize:"2.5rem", fontWeight:800, color:s.c }}>{s.v}</div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

// ─── INVOICES PAGE
function InvoicesPage() {
  const { supabase } = useAuth();
  const [items, setItems] = useState([]);
  const [show, setShow] = useState(false);
  const load = useCallback(async () => {
    const { data } = await supabase.from("invoices").select("*").order("created_at", {ascending:false});
    setItems(data||[]);
  }, [supabase]);
  useEffect(() => { load(); }, [load]);

  return (
    <PageShell>
      <PageHeader title="Invoices" action={<Btn onClick={()=>setShow(true)}>+ New Invoice</Btn>} />
      <div style={{ display:"flex", flexDirection:"column", gap:".5rem" }}>
        {items.map(i => (
          <div key={i.id} style={{ background:T.mid, padding:"1.5rem", border:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontWeight:700 }}>{i.client_name}</div>
              <div style={{ fontSize:".7rem", color:T.slate }}>{i.id.slice(0,8)}</div>
            </div>
            <div style={{ fontWeight:800, color:T.gold }}>₦{Number(i.total_ngn).toLocaleString()}</div>
            <Badge status={i.status} />
          </div>
        ))}
      </div>
      <Modal open={show} onClose={()=>setShow(false)} title="Create Invoice">
         <InvoiceForm onDone={() => { setShow(false); load(); }} />
      </Modal>
    </PageShell>
  );
}

function InvoiceForm({ onDone }) {
  const { supabase } = useAuth();
  const [form, setForm] = useState({ client:"", amount:"" });
  const save = async () => {
    await supabase.from("invoices").insert({ client_name:form.client, total_ngn:form.amount, status:"draft" });
    onDone();
  };
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
      <Input label="Client" value={form.client} onChange={e=>setForm({...form, client:e.target.value})} />
      <Input label="Amount" type="number" value={form.amount} onChange={e=>setForm({...form, amount:e.target.value})} />
      <Btn onClick={save}>Create Invoice</Btn>
    </div>
  );
}

// ─── PAYROLL PAGE
function PayrollPage() {
  const { supabase } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [show, setShow] = useState(false);
  const load = useCallback(async () => {
    const { data } = await supabase.from("employees").select("*");
    setEmployees(data||[]);
  }, [supabase]);
  useEffect(() => { load(); }, [load]);

  return (
    <PageShell>
      <PageHeader title="Payroll" action={<Btn onClick={()=>setShow(true)}>+ Add Staff</Btn>} />
      <div style={{ display:"grid", gap:"1rem" }}>
        {employees.map(e => (
          <div key={e.id} style={{ background:T.mid, padding:"1.2rem", border:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between" }}>
             <div>{e.full_name} <span style={{ color:T.slate, fontSize:".7rem" }}>— {e.role}</span></div>
             <div style={{ color:T.electric, fontWeight:700 }}>₦{Number(e.salary_ngn).toLocaleString()}</div>
          </div>
        ))}
      </div>
      <Modal open={show} onClose={()=>setShow(false)} title="Add Employee">
         <EmployeeForm onDone={() => { setShow(false); load(); }} />
      </Modal>
    </PageShell>
  );
}

function EmployeeForm({ onDone }) {
  const { supabase } = useAuth();
  const [form, setForm] = useState({ name:"", salary:"" });
  const save = async () => {
    await supabase.from("employees").insert({ full_name:form.name, salary_ngn:form.salary });
    onDone();
  };
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
      <Input label="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
      <Input label="Salary" type="number" value={form.salary} onChange={e=>setForm({...form, salary:e.target.value})} />
      <Btn onClick={save}>Save Employee</Btn>
    </div>
  );
}

// ─── RECEIPTS PAGE
function ReceiptsPage() {
  const { supabase } = useAuth();
  const [files, setFiles] = useState([]);
  const load = useCallback(async () => {
    const { data } = await supabase.from("receipts").select("*");
    setFiles(data||[]);
  }, [supabase]);
  useEffect(() => { load(); }, [load]);

  return (
    <PageShell>
      <PageHeader title="Receipts" action={<Btn>Upload Receipt</Btn>} />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:"1rem" }}>
        {files.map(r => (
          <div key={r.id} style={{ background:T.mid, height:"150px", border:`1px solid ${T.border}`, padding:"1rem" }}>
            <div style={{ fontSize:".7rem", color:T.slate }}>{r.date}</div>
            <div style={{ fontWeight:700, marginTop:".5rem" }}>{r.merchant}</div>
            <div style={{ color:T.gold }}>₦{r.amount}</div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

// ─── TELLER PAGE
function TellerPage() {
  const { supabase } = useAuth();
  const [amount, setAmount] = useState("0.00");
  const [entries, setEntries] = useState([]);
  const load = useCallback(async () => {
    const { data } = await supabase.from("teller_entries").select("*").limit(10).order("created_at", {ascending:false});
    setEntries(data||[]);
  }, [supabase]);
  useEffect(() => { load(); }, [load]);

  const post = async (dir) => {
    await supabase.from("teller_entries").insert({ amount: parseFloat(amount), direction: dir });
    setAmount("0.00"); load();
  };

  return (
    <PageShell>
      <PageHeader title="Teller Console" />
      <div style={{ display:"grid", gridTemplateColumns:"300px 1fr", gap:"4rem" }}>
         <div style={{ background:T.mid, padding:"2rem", border:`1px solid ${T.border}` }}>
            <div style={{ fontSize:"2rem", fontWeight:800, textAlign:"center", marginBottom:"2rem" }}>₦ {amount}</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:"10px", marginBottom:"2rem" }}>
               {[1,2,3,4,5,6,7,8,9,0,"C"].map(k => (
                 <button key={k} onClick={()=>setAmount(k==='C'?'0.00':amount==='0.00'?k.toString():amount+k)} style={{ padding:"1rem", background:T.ink, color:T.white, border:`1px solid ${T.border}` }}>{k}</button>
               ))}
            </div>
            <div style={{ display:"flex", gap:"10px" }}>
               <Btn onClick={()=>post('credit')} style={{ flex:1 }}>Credit</Btn>
               <Btn onClick={()=>post('debit')} variant="danger" style={{ flex:1 }}>Debit</Btn>
            </div>
         </div>
         <div>
            <h3>Recent Log</h3>
            {entries.map(e => <div key={e.id} style={{ borderBottom:`1px solid ${T.border}`, padding:"1rem 0", display:"flex", justifyContent:"space-between" }}>
               <span>{e.direction.toUpperCase()}</span> <span>₦{e.amount}</span>
            </div>)}
         </div>
      </div>
    </PageShell>
  );
}

// ─── SETTINGS PAGE
function SettingsPage() {
  const { profile } = useAuth();
  return (
    <PageShell>
      <PageHeader title="Settings" />
      <div style={{ maxWidth:400, background:T.mid, padding:"2rem", border:`1px solid ${T.border}` }}>
         <Input label="Name" value={profile?.full_name || ""} disabled />
         <Input label="Organization" value={profile?.organizations?.name || "No Org"} disabled style={{ marginTop:"1rem" }} />
         <Btn variant="secondary" style={{ marginTop:"2rem", width:"100%" }}>Update Profile</Btn>
      </div>
    </PageShell>
  );
}

// ─── ROOT APP
export default function App() {
  if (!supabase) return <MissingEnv/>;
  return (
    <ErrorBoundary>
      <style>{GLOBAL_CSS}</style>
      <AuthProvider>
        <Router>
          <ToastProvider>
            <AppRoutes/>
          </ToastProvider>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

function AppRoutes() {
  const { session } = useAuth();
  const { path, navigate } = useRouter();

  if (session === undefined) return <div style={{ background:T.ink, minHeight:"100vh" }} />;

  // Auth Redirects
  if (session && path === "/") { navigate("/dashboard"); return null; }
  const protect = ["/dashboard","/invoices","/payroll","/receipts","/teller","/settings"].some(p => path.startsWith(p));
  if (!session && protect) return <LoginPage />;

  // Router Map
  if (path === "/") return <LandingPage />;
  if (path === "/login") return <LoginPage />;
  if (path.startsWith("/dashboard")) return <DashboardPage />;
  if (path.startsWith("/invoices")) return <InvoicesPage />;
  if (path.startsWith("/payroll")) return <PayrollPage />;
  if (path.startsWith("/receipts")) return <ReceiptsPage />;
  if (path.startsWith("/teller")) return <TellerPage />;
  if (path.startsWith("/settings")) return <SettingsPage />;

  return <div style={{ padding:"4rem" }}>404 - Not Found <Btn onClick={()=>navigate("/")}>Home</Btn></div>;
}
