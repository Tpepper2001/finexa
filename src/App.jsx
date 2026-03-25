/**
 * Finexa — App.jsx  (fully fixed)
 * - Landing page with all animations restored
 * - Every button and nav link wired up
 * - Scroll-reveal on sections
 * - Particle system, orbs, grid drift
 * - Hash router: / → Landing, /login → Auth, /dashboard etc → App
 * - Fixed navbar links (smooth scroll to sections)
 * - Added "See Demo" button with modal
 * - How It Works section replaced with interactive animated carousel
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

// ─── Global keyframes (injected once at root) ─────────────────────────────────
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
  @keyframes pulse        { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.08);opacity:.7} }
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
  @keyframes ctaFloat {
    0%  { opacity:0; transform:translateY(20px); }
    20% { opacity:1; }
    80% { opacity:1; }
    100%{ opacity:0; transform:translateY(-40px); }
  }

  .reveal { opacity:0; transform:translateY(28px); transition:opacity .75s cubic-bezier(.16,1,.3,1), transform .75s cubic-bezier(.16,1,.3,1); }
  .reveal.visible { opacity:1; transform:none; }
  .reveal-slide { opacity:0; transform:translateX(-20px); transition:opacity .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1); }
  .reveal-slide.visible { opacity:1; transform:none; }

  .nav-link-land { font-size:.75rem; color:#5B6485; text-decoration:none; letter-spacing:.1em; text-transform:uppercase; font-family:'Space Mono',monospace; padding:.4rem .5rem; transition:color .2s; }
  .nav-link-land:hover { color:#F5F4F0; }

  .feat-card { background:#1C2340; border:1px solid rgba(200,169,110,.18); border-left:2px solid transparent; padding:2rem; transition:all .25s; cursor:default; }
  .feat-card:hover { background:rgba(200,169,110,.05); border-left-color:#C8A96E; transform:translateY(-3px); box-shadow:0 12px 40px rgba(0,0,0,.3); }

  .step-card { border:1px solid rgba(200,169,110,.18); padding:2rem; background:#0A0F1E; transition:all .25s; cursor:default; }
  .step-card:hover { border-color:rgba(200,169,110,.5); transform:translateY(-4px); box-shadow:0 16px 48px rgba(0,0,0,.35); }

  .testi-card { background:#1C2340; border:1px solid rgba(200,169,110,.18); padding:2rem; transition:border-color .25s; cursor:default; }
  .testi-card:hover { border-color:rgba(200,169,110,.45); }

  .price-card { border:1px solid rgba(200,169,110,.18); padding:2.5rem; background:#1C2340; transition:all .25s; }
  .price-card:hover { border-color:rgba(200,169,110,.5); transform:translateY(-4px); }
  .price-card.featured { border-color:#1AFFB2; background:rgba(26,255,178,.04); }

  .btn-land-primary { background:#C8A96E; color:#0A0F1E; font-family:'Syne',system-ui,sans-serif; font-weight:700; letter-spacing:.05em; border:none; cursor:pointer; transition:all .2s; }
  .btn-land-primary:hover { background:#E4CFA0; transform:translateY(-2px); box-shadow:0 12px 32px rgba(200,169,110,.25); }
  .btn-land-secondary { background:transparent; color:#F5F4F0; font-family:'Syne',system-ui,sans-serif; font-weight:600; letter-spacing:.05em; border:1px solid rgba(200,169,110,.18); cursor:pointer; transition:all .2s; }
  .btn-land-secondary:hover { border-color:#C8A96E; color:#C8A96E; }
  .sidebar-btn:hover { background:rgba(200,169,110,.08) !important; color:#F5F4F0 !important; }
`;

// ─── Error Boundary ───────────────────────────────────────────────────────────
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error:null }; }
  static getDerivedStateFromError(e) { return { error:e }; }
  render() {
    if (this.state.error) return (
      <div style={{ minHeight:"100vh", background:T.ink, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:"1rem", padding:"2rem" }}>
        <div style={{ fontFamily:T.fontDisplay, color:T.gold, fontSize:"1.8rem", fontWeight:800 }}>Finexa</div>
        <div style={{ color:T.white, fontSize:"1.1rem" }}>Something went wrong</div>
        <div style={{ color:T.red, background:T.red10, border:`1px solid ${T.red}`, padding:"1rem 1.5rem", maxWidth:520, fontSize:".78rem", wordBreak:"break-all", fontFamily:T.fontMono }}>
          {this.state.error.message}
        </div>
        <button onClick={() => window.location.reload()} style={{ background:T.gold, color:T.ink, border:"none", padding:".75rem 1.5rem", fontFamily:T.fontDisplay, fontWeight:700, cursor:"pointer", marginTop:".5rem" }}>Reload</button>
      </div>
    );
    return this.props.children;
  }
}

// ─── Missing env ──────────────────────────────────────────────────────────────
function MissingEnv() {
  return (
    <div style={{ minHeight:"100vh", background:T.ink, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:"1.25rem", padding:"2rem" }}>
      <Logo size={40}/>
      <div style={{ fontFamily:T.fontMono, fontSize:".65rem", color:T.electric, letterSpacing:".2em", textTransform:"uppercase" }}>— Setup Required</div>
      <div style={{ background:T.mid, border:`1px solid ${T.border}`, padding:"1.5rem 2rem", maxWidth:480, width:"100%" }}>
        <div style={{ color:T.red, fontSize:".75rem", marginBottom:"1rem", fontFamily:T.fontMono }}>Missing Supabase environment variables</div>
        <div style={{ color:T.slate, fontSize:".7rem", lineHeight:2, fontFamily:T.fontMono }}>
          Add to Vercel → Settings → Environment Variables:<br/>
          <span style={{ color:T.white }}>VITE_SUPABASE_URL</span> = https://xxx.supabase.co<br/>
          <span style={{ color:T.white }}>VITE_SUPABASE_ANON_KEY</span> = eyJ...
        </div>
      </div>
      <div style={{ color:T.slate, fontSize:".62rem", textAlign:"center", maxWidth:360, fontFamily:T.fontMono }}>
        Supabase Dashboard → Settings → API → then redeploy on Vercel.
      </div>
    </div>
  );
}

// ─── Contexts ─────────────────────────────────────────────────────────────────
const AuthCtx   = createContext(null);
const RouterCtx = createContext(null);
const ToastCtx  = createContext(null);
const useAuth   = () => useContext(AuthCtx);
const useRouter = () => useContext(RouterCtx);
const useToast  = () => useContext(ToastCtx);

// ─── Auth Provider ────────────────────────────────────────────────────────────
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
    supabase.from("profiles").select("*, organizations(*)").eq("id", session.user.id).single()
      .then(({ data }) => setProfile(data));
  }, [session]);

  const signIn  = (e, p) => supabase?.auth.signInWithPassword({ email:e, password:p });
  const signUp  = (e, p, n) => supabase?.auth.signUp({ email:e, password:p, options:{ data:{ full_name:n } } });
  const signOut = () => supabase?.auth.signOut();

  return <AuthCtx.Provider value={{ session, profile, signIn, signUp, signOut, supabase }}>{children}</AuthCtx.Provider>;
}

// ─── Router ───────────────────────────────────────────────────────────────────
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

// ─── Toast Provider ───────────────────────────────────────────────────────────
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
          <div key={t.id} style={{ background:T.mid, borderLeft:`3px solid ${colors[t.type]||T.gold}`, border:`1px solid ${colors[t.type]||T.gold}`, color:T.white, fontFamily:T.fontMono, fontSize:".72rem", padding:".75rem 1.25rem", letterSpacing:".04em", boxShadow:"0 8px 32px rgba(0,0,0,.4)", animation:"slideIn .25s ease-out" }}>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

// ─── Shared: Logo ─────────────────────────────────────────────────────────────
function Logo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      <rect x="1.5" y="1.5" width="53" height="53" rx="9" stroke={T.gold} strokeWidth="1.5"/>
      <path d="M16 28 L28 14 L40 28 L28 42 Z" fill={T.gold} opacity="0.9"/>
      <line x1="28" y1="12" x2="28" y2="44" stroke={T.electric} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

// ─── Shared: Btn ──────────────────────────────────────────────────────────────
function Btn({ children, onClick, variant="primary", disabled, style:s }) {
  const base = { fontFamily:T.fontDisplay, fontWeight:700, fontSize:".82rem", letterSpacing:".05em", padding:".75rem 1.5rem", border:"none", cursor:disabled?"not-allowed":"pointer", transition:"all .2s", opacity:disabled?.5:1, ...s };
  const vs = {
    primary:   { background:T.gold, color:T.ink },
    secondary: { background:"transparent", border:`1px solid ${T.border}`, color:T.white },
    danger:    { background:T.red10, border:`1px solid ${T.red}`, color:T.red },
    ghost:     { background:"transparent", color:T.slate },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, ...vs[variant] }}
      onMouseEnter={e => { if(!disabled&&variant==="primary") e.currentTarget.style.background=T.goldLt; }}
      onMouseLeave={e => { if(!disabled&&variant==="primary") e.currentTarget.style.background=T.gold; }}>
      {children}
    </button>
  );
}

// ─── Shared: Input ────────────────────────────────────────────────────────────
function Input({ label, id, error, ...props }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:".4rem" }}>
      {label && <label htmlFor={id} style={{ fontFamily:T.fontMono, fontSize:".62rem", color:T.slate, letterSpacing:".08em", textTransform:"uppercase" }}>{label}</label>}
      <input id={id} {...props} style={{ background:"rgba(10,15,30,.6)", border:`1px solid ${error?T.red:T.border}`, color:T.white, fontFamily:T.fontBody, fontSize:".88rem", padding:".65rem .9rem", outline:"none", width:"100%", transition:"border-color .2s", ...props.style }}
        onFocus={e => e.target.style.borderColor=T.gold}
        onBlur={e  => e.target.style.borderColor=error?T.red:T.border}/>
      {error && <span style={{ fontSize:".7rem", color:T.red, fontFamily:T.fontMono }}>{error}</span>}
    </div>
  );
}

// ─── Shared: Badge ────────────────────────────────────────────────────────────
function Badge({ status }) {
  const m = {
    paid:      { bg:T.electric10, color:T.electric, label:"PAID"      },
    pending:   { bg:T.gold10,     color:T.gold,     label:"PENDING"   },
    overdue:   { bg:T.red10,      color:T.red,      label:"OVERDUE"   },
    draft:     { bg:T.mid,        color:T.slate,    label:"DRAFT"     },
    sent:      { bg:"rgba(75,139,255,.1)", color:T.blue, label:"SENT" },
    processed: { bg:T.electric10, color:T.electric, label:"PROCESSED" },
  };
  const s = m[status]||m.draft;
  return <span style={{ background:s.bg, color:s.color, fontFamily:T.fontMono, fontSize:".58rem", letterSpacing:".1em", padding:".2rem .6rem" }}>{s.label}</span>;
}

// ─── Shared: Modal ────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children, width=540 }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(10,15,30,.85)", backdropFilter:"blur(8px)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div onClick={e => e.stopPropagation()} style={{ background:T.mid, border:`1px solid ${T.border}`, width, maxWidth:"90vw", maxHeight:"85vh", overflowY:"auto", padding:"2.5rem" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"2rem" }}>
          <h2 style={{ fontFamily:T.fontDisplay, fontWeight:800, fontSize:"1.25rem", color:T.white, letterSpacing:"-.02em" }}>{title}</h2>
          <button onClick={onClose} style={{ background:"none", border:"none", color:T.slate, cursor:"pointer", fontSize:"1.2rem" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Shared: PageHeader ───────────────────────────────────────────────────────
function PageHeader({ title, sub, action }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"3rem" }}>
      <div>
        <div style={{ fontFamily:T.fontMono, fontSize:".62rem", letterSpacing:".2em", color:T.electric, textTransform:"uppercase", marginBottom:".5rem" }}>— {title}</div>
        {sub && <p style={{ color:T.slate, fontSize:".88rem", fontFamily:T.fontBody }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

// ─── Shared: Loader / EmptyState ──────────────────────────────────────────────
function Loader() {
  return <div style={{ display:"flex", justifyContent:"center", padding:"4rem", color:T.gold, fontFamily:T.fontMono, fontSize:".75rem", letterSpacing:".1em" }}>LOADING…</div>;
}
function EmptyState({ icon, title, sub, compact }) {
  return (
    <div style={{ textAlign:"center", padding:compact?"2rem":"5rem 2rem" }}>
      <div style={{ fontSize:compact?"2rem":"3rem", marginBottom:"1rem", color:T.gold25 }}>{icon}</div>
      <div style={{ fontFamily:T.fontDisplay, fontWeight:700, color:T.white, fontSize:compact?".9rem":"1.2rem", marginBottom:".5rem" }}>{title}</div>
      <div style={{ fontFamily:T.fontBody, fontSize:".82rem", color:T.slate }}>{sub}</div>
    </div>
  );
}

// ─── Scroll reveal hook ───────────────────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const ro = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visible"); ro.unobserve(e.target); } });
    }, { threshold:.12 });
    document.querySelectorAll(".reveal, .reveal-slide").forEach(el => ro.observe(el));
    return () => ro.disconnect();
  }, []);
}

// ═══════════════════════════════════════════════════════════════
// NEW: Demo Modal Component
// ═══════════════════════════════════════════════════════════════
function DemoModal({ open, onClose }) {
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title="See Finexa in Action" width={800}>
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            background: T.ink,
            padding: "2rem",
            borderRadius: "0.5rem",
            marginBottom: "1rem",
          }}
        >
          {/* Replace with actual demo video URL */}
          <iframe
            width="100%"
            height="400"
            src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0"
            title="Finexa Demo"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ borderRadius: "0.5rem" }}
          ></iframe>
        </div>
        <p style={{ color: T.slate, fontSize: "0.85rem", marginTop: "1rem" }}>
          Watch a quick tour of Finexa’s core features – invoicing, payroll, teller console, and more.
        </p>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════
// NEW: Interactive How It Works Section (carousel)
// ═══════════════════════════════════════════════════════════════
function HowItWorksSection({ navigate, goLogin }) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      number: "01",
      title: "Create Account",
      description: "Sign up free in under a minute. No credit card required. Your workspace is ready instantly.",
      visual: "📝",
      action: goLogin,
      cta: "Sign Up Free",
    },
    {
      number: "02",
      title: "Set Up Your Org",
      description: "Add your business name, logo, and team members in Settings. Get your team onboarded quickly.",
      visual: "🏢",
      action: () => navigate("/settings"),
      cta: "Go to Settings",
    },
    {
      number: "03",
      title: "Add Employees",
      description: "Import or manually add staff with salaries and bank details. Payroll starts here.",
      visual: "👥",
      action: () => navigate("/payroll"),
      cta: "Open Payroll",
    },
    {
      number: "04",
      title: "Start Transacting",
      description: "Create invoices, run payroll, upload receipts, and open your teller console.",
      visual: "💰",
      action: () => navigate("/dashboard"),
      cta: "Open Dashboard",
    },
  ];

  const nextStep = () => setStep((s) => (s + 1) % steps.length);
  const prevStep = () => setStep((s) => (s - 1 + steps.length) % steps.length);

  return (
    <section id="how-it-works" style={{ padding: "8rem 4rem", background: T.mid, position: "relative", zIndex: 1 }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div className="reveal" style={{ marginBottom: "4rem" }}>
          <div style={{ fontFamily: T.fontMono, fontSize: ".62rem", color: T.electric, letterSpacing: ".2em", textTransform: "uppercase", marginBottom: "1rem" }}>
            — Getting Started
          </div>
          <h2 style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: "clamp(2rem,5vw,3.5rem)", color: T.white, letterSpacing: "-.03em" }}>
            Up and running<br />in minutes
          </h2>
        </div>

        {/* Interactive Step Container */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "3rem",
            background: T.ink,
            border: `1px solid ${T.border}`,
            borderRadius: "2rem",
            padding: "3rem 2rem",
            position: "relative",
          }}
        >
          {/* Progress Dots */}
          <div style={{ display: "flex", gap: ".75rem", marginBottom: "1rem" }}>
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: i === step ? T.gold : T.slate,
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                aria-label={`Go to step ${i + 1}`}
              />
            ))}
          </div>

          {/* Step Content with Animation */}
          <div
            key={step}
            style={{
              textAlign: "center",
              animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1)",
              width: "100%",
            }}
          >
            <div
              style={{
                fontFamily: T.fontMono,
                fontSize: "2.5rem",
                fontWeight: 700,
                color: T.gold25,
                marginBottom: "1rem",
                lineHeight: 1,
                transform: "scale(1.1)",
                transition: "transform 0.2s",
              }}
            >
              {steps[step].number}
            </div>
            <div
              style={{
                fontSize: "4rem",
                marginBottom: "1rem",
                lineHeight: 1,
                animation: "pulse 1s ease-in-out",
              }}
            >
              {steps[step].visual}
            </div>
            <div
              style={{
                fontFamily: T.fontDisplay,
                fontWeight: 700,
                color: T.white,
                fontSize: "1.8rem",
                marginBottom: "1rem",
              }}
            >
              {steps[step].title}
            </div>
            <p
              style={{
                fontSize: "1rem",
                color: T.slate,
                lineHeight: 1.6,
                maxWidth: 480,
                margin: "0 auto 2rem auto",
              }}
            >
              {steps[step].description}
            </p>
            <button
              onClick={steps[step].action}
              style={{
                background: "none",
                border: `1px solid ${T.border}`,
                color: T.gold,
                fontFamily: T.fontMono,
                fontSize: ".7rem",
                letterSpacing: ".1em",
                padding: ".6rem 1.2rem",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = T.gold;
                e.currentTarget.style.background = T.gold10;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = T.border;
                e.currentTarget.style.background = "none";
              }}
            >
              {steps[step].cta} →
            </button>
          </div>

          {/* Navigation Arrows */}
          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
            <button
              onClick={prevStep}
              style={{
                background: T.mid,
                border: `1px solid ${T.border}`,
                color: T.white,
                fontFamily: T.fontMono,
                fontSize: ".8rem",
                padding: ".5rem 1rem",
                cursor: "pointer",
                borderRadius: "2rem",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = T.gold;
                e.currentTarget.style.background = T.gold10;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = T.border;
                e.currentTarget.style.background = T.mid;
              }}
            >
              ← Previous
            </button>
            <button
              onClick={nextStep}
              style={{
                background: T.mid,
                border: `1px solid ${T.border}`,
                color: T.white,
                fontFamily: T.fontMono,
                fontSize: ".8rem",
                padding: ".5rem 1rem",
                cursor: "pointer",
                borderRadius: "2rem",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = T.gold;
                e.currentTarget.style.background = T.gold10;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = T.border;
                e.currentTarget.style.background = T.mid;
              }}
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// LANDING PAGE (updated with fixed nav, demo modal, new How It Works)
// ═══════════════════════════════════════════════════════════════
function LandingPage() {
  const { navigate }  = useRouter();
  const { session }   = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const particlesRef  = useRef(null);
  const [demoOpen, setDemoOpen] = useState(false);
  useScrollReveal();

  // Scroll listener for sticky nav
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn, { passive:true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Floating particles
  useEffect(() => {
    const container = particlesRef.current;
    if (!container) return;
    const particles = [];
    for (let i = 0; i < 18; i++) {
      const p = document.createElement("div");
      p.style.cssText = `position:absolute;width:2px;height:2px;border-radius:50%;background:#C8A96E;opacity:0;left:${Math.random()*100}%;animation:particleUp ${8+Math.random()*14}s linear ${Math.random()*10}s infinite;`;
      container.appendChild(p);
      particles.push(p);
    }
    return () => particles.forEach(p => p.remove());
  }, []);

  const goLogin = () => navigate("/login");

  // Helper for smooth scroll
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div style={{ background:T.ink, color:T.white, fontFamily:T.fontBody, overflowX:"hidden" }}>

      {/* ── PARTICLES ── */}
      <div ref={particlesRef} style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, overflow:"hidden" }}/>

      {/* ── NAV (fixed) ── */}
      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:200, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"1.25rem 4rem", background:scrolled?"rgba(10,15,30,.96)":"rgba(10,15,30,.55)", backdropFilter:"blur(20px)", borderBottom:scrolled?`1px solid ${T.border}`:"1px solid transparent", transition:"all .35s" }}>
        <a href="#/" style={{ display:"flex", alignItems:"center", gap:".65rem", textDecoration:"none" }}>
          <Logo size={26}/>
          <span style={{ fontFamily:T.fontDisplay, fontWeight:800, fontSize:"1.1rem", color:T.white, letterSpacing:"-.03em" }}>Fine<span style={{ color:T.gold }}>x</span>a</span>
        </a>
        <div style={{ display:"flex", alignItems:"center", gap:"1.75rem" }}>
          <button onClick={() => scrollTo("features")} className="nav-link-land" style={{ background: "none", border: "none", cursor: "pointer" }}>Features</button>
          <button onClick={() => scrollTo("how-it-works")} className="nav-link-land" style={{ background: "none", border: "none", cursor: "pointer" }}>How It Works</button>
          <button onClick={() => scrollTo("pricing")} className="nav-link-land" style={{ background: "none", border: "none", cursor: "pointer" }}>Pricing</button>
          <button onClick={() => scrollTo("testimonials")} className="nav-link-land" style={{ background: "none", border: "none", cursor: "pointer" }}>Reviews</button>
          {session ? (
            <button onClick={() => navigate("/dashboard")} className="btn-land-primary" style={{ padding:".55rem 1.25rem", fontSize:".78rem" }}>Go to App →</button>
          ) : (
            <div style={{ display:"flex", gap:".75rem" }}>
              <button onClick={goLogin} className="btn-land-secondary" style={{ padding:".55rem 1.25rem", fontSize:".78rem" }}>Sign In</button>
              <button onClick={goLogin} className="btn-land-primary"   style={{ padding:".55rem 1.25rem", fontSize:".78rem" }}>Get Started Free</button>
            </div>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight:"100vh", display:"flex", flexDirection:"column", justifyContent:"center", padding:"8rem 4rem 5rem", position:"relative", overflow:"hidden" }}>
        {/* Animated grid */}
        <div style={{ position:"absolute", inset:0, backgroundImage:`linear-gradient(rgba(200,169,110,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(200,169,110,.04) 1px,transparent 1px)`, backgroundSize:"60px 60px", animation:"gridDrift 20s linear infinite", pointerEvents:"none", zIndex:0 }}/>
        {/* Orbs */}
        <div style={{ position:"absolute", top:"-15%", right:"-8%", width:"55vw", height:"55vw", maxWidth:650, borderRadius:"50%", background:"radial-gradient(ellipse,rgba(200,169,110,.11),transparent 70%)", animation:"pulse 6s ease-in-out infinite", pointerEvents:"none", zIndex:0 }}/>
        <div style={{ position:"absolute", bottom:"-20%", left:"-10%", width:"45vw", height:"45vw", maxWidth:500, borderRadius:"50%", background:"radial-gradient(ellipse,rgba(26,255,178,.07),transparent 70%)", animation:"pulse 8s ease-in-out infinite reverse", pointerEvents:"none", zIndex:0 }}/>

        <div style={{ position:"relative", zIndex:1, maxWidth:940 }}>
          {/* Eyebrow */}
          <div style={{ fontFamily:T.fontMono, fontSize:".68rem", letterSpacing:".2em", color:T.electric, textTransform:"uppercase", marginBottom:"1.75rem", display:"flex", alignItems:"center", gap:".75rem", opacity:0, animation:"fadeUp .8s .1s cubic-bezier(.16,1,.3,1) forwards" }}>
            <span style={{ display:"inline-block", width:"2rem", height:"1px", background:T.electric }}/>
            Payroll · Invoicing · Teller · Receipts
          </div>

          {/* H1 */}
          <h1 style={{ fontFamily:T.fontDisplay, fontWeight:800, fontSize:"clamp(3.2rem,9vw,8.5rem)", lineHeight:1.05, letterSpacing:"-.04em", opacity:0, animation:"fadeUp .9s .22s cubic-bezier(.16,1,.3,1) forwards" }}>
            <span style={{ display:"block", color:T.white }}>Finance,</span>
            <span style={{ display:"block", background:`linear-gradient(135deg,${T.goldLt},${T.gold} 40%,${T.electric})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", backgroundSize:"200% 200%", animation:"gradShift 4s ease-in-out infinite 1.5s" }}>Engineered</span>
            <span style={{ display:"block", color:T.gold }}>for What's Next.</span>
          </h1>

          {/* Sub */}
          <p style={{ marginTop:"2.5rem", maxWidth:520, fontSize:"1rem", lineHeight:1.8, color:T.slate, fontWeight:400, opacity:0, animation:"fadeUp .8s .4s cubic-bezier(.16,1,.3,1) forwards" }}>
            <strong style={{ color:T.white, fontWeight:500 }}>Finexa</strong> is smart financial software that helps Nigerian businesses handle payments, payroll, invoices, and receipts — all in one place.
          </p>

          {/* CTA buttons (added See Demo) */}
          <div style={{ display:"flex", gap:"1rem", flexWrap:"wrap", marginTop:"3rem", opacity:0, animation:"fadeUp .9s .5s cubic-bezier(.16,1,.3,1) forwards" }}>
            <button onClick={goLogin} className="btn-land-primary" style={{ fontSize:".9rem", padding:".9rem 2.25rem" }}>
              Start Free Trial →
            </button>
            <button onClick={() => scrollTo("how-it-works")} className="btn-land-secondary" style={{ fontSize:".9rem", padding:".9rem 2.25rem" }}>
              See How It Works
            </button>
            <button onClick={() => setDemoOpen(true)} className="btn-land-secondary" style={{ fontSize:".9rem", padding:".9rem 2.25rem" }}>
              See Demo
            </button>
          </div>

          {/* Stats */}
          <div style={{ display:"flex", gap:"3.5rem", flexWrap:"wrap", marginTop:"4.5rem", paddingTop:"2.5rem", borderTop:`1px solid ${T.border}`, opacity:0, animation:"fadeUp .9s .65s cubic-bezier(.16,1,.3,1) forwards" }}>
            {[["₦2.4B+","Processed Monthly"],["28K+","Active Businesses"],["99.9%","Uptime SLA"],["1-Click","Payroll Run"]].map(([num,label]) => (
              <div key={label}>
                <div style={{ fontFamily:T.fontDisplay, fontWeight:800, fontSize:"2rem", color:T.gold, letterSpacing:"-.03em" }}>{num}</div>
                <div style={{ fontSize:".7rem", color:T.slate, marginTop:".2rem", fontFamily:T.fontMono, letterSpacing:".08em", textTransform:"uppercase" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position:"absolute", bottom:"2.5rem", left:"50%", transform:"translateX(-50%)", display:"flex", flexDirection:"column", alignItems:"center", gap:".5rem", opacity:0, animation:"fadeIn 1s 1.5s forwards", cursor:"pointer", zIndex:1 }}
          onClick={() => scrollTo("features")}>
          <div style={{ width:22, height:36, border:`1.5px solid ${T.border}`, borderRadius:11, display:"flex", justifyContent:"center", paddingTop:6 }}>
            <div style={{ width:3, height:8, background:T.gold, borderRadius:2, animation:"scrollBounce 1.6s ease-in-out infinite" }}/>
          </div>
          <span style={{ fontFamily:T.fontMono, fontSize:".58rem", color:T.slate, letterSpacing:".15em", textTransform:"uppercase" }}>Scroll</span>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div style={{ background:T.mid, borderTop:`1px solid ${T.border}`, borderBottom:`1px solid ${T.border}`, overflow:"hidden", padding:".7rem 0", position:"relative", zIndex:1 }}>
        <div style={{ display:"flex", animation:"ticker 28s linear infinite", whiteSpace:"nowrap" }}>
          {[...Array(2)].map((_,i) => (
            <div key={i} style={{ display:"flex", gap:"3rem", paddingRight:"3rem" }}>
              {["PAYROLL PROCESSED","INVOICE SENT","RECEIPT LOGGED","TELLER BALANCED","PAYMENT RECEIVED","FX RATE LOCKED","TAX FILED","AUDIT READY","SALARY DISBURSED","LEDGER UPDATED"].map(t => (
                <span key={t} style={{ fontFamily:T.fontMono, fontSize:".63rem", color:T.slate, letterSpacing:".12em" }}>
                  <span style={{ color:T.electric, marginRight:".5rem" }}>◆</span>{t}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding:"8rem 4rem", position:"relative", zIndex:1 }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div className="reveal" style={{ marginBottom:"4rem" }}>
            <div style={{ fontFamily:T.fontMono, fontSize:".62rem", color:T.electric, letterSpacing:".2em", textTransform:"uppercase", marginBottom:"1rem" }}>— What's Inside</div>
            <h2 style={{ fontFamily:T.fontDisplay, fontWeight:800, fontSize:"clamp(2rem,5vw,4rem)", color:T.white, letterSpacing:"-.03em" }}>
              Everything your finance<br/>team actually needs
            </h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:"1.5rem" }}>
            {[
              { icon:"◻", title:"Invoicing",       desc:"Create and send professional invoices. Track status in real time — draft, sent, paid, or overdue.", href:"/invoices" },
              { icon:"◈", title:"Payroll",          desc:"Add employees, set salaries, run payroll in one click. PAYE and pension auto-calculated.",          href:"/payroll"  },
              { icon:"◉", title:"Receipts",         desc:"Upload and organise expense receipts. Attach files, tag merchants, filter by category.",            href:"/receipts" },
              { icon:"⬡", title:"Teller Console",   desc:"Record cash-in and cash-out with a numpad interface. Full daily ledger with session history.",       href:"/teller"   },
              { icon:"▦", title:"Live Dashboard",   desc:"Real-time stats on transactions, invoices, and payroll. Powered by Supabase Realtime.",              href:"/dashboard"},
              { icon:"◎", title:"Secure by Design", desc:"Row-level security on every table. Your data is only ever visible to your organisation.",            href:null        },
            ].map((f,i) => (
              <div key={f.title} className={`feat-card reveal`} style={{ animationDelay:`${i*.08}s`, transitionDelay:`${i*.08}s` }}
                onClick={() => f.href && navigate(f.href)} style={{ cursor:f.href?"pointer":"default" }}>
                <div style={{ fontSize:"1.75rem", color:T.gold, marginBottom:"1rem" }}>{f.icon}</div>
                <div style={{ fontFamily:T.fontDisplay, fontWeight:700, color:T.white, fontSize:"1rem", marginBottom:".6rem" }}>{f.title}</div>
                <div style={{ fontSize:".82rem", color:T.slate, lineHeight:1.75 }}>{f.desc}</div>
                {f.href && <div style={{ marginTop:"1.25rem", fontFamily:T.fontMono, fontSize:".62rem", color:T.gold, letterSpacing:".08em" }}>Explore →</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS (replaced with interactive carousel) ── */}
      <HowItWorksSection navigate={navigate} goLogin={goLogin} />

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" style={{ padding:"8rem 4rem", position:"relative", zIndex:1 }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div className="reveal" style={{ marginBottom:"4rem" }}>
            <div style={{ fontFamily:T.fontMono, fontSize:".62rem", color:T.electric, letterSpacing:".2em", textTransform:"uppercase", marginBottom:"1rem" }}>— Trusted By</div>
            <h2 style={{ fontFamily:T.fontDisplay, fontWeight:800, fontSize:"clamp(2rem,5vw,3.5rem)", color:T.white, letterSpacing:"-.03em" }}>What our customers say</h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:"1.5rem" }}>
            {[
              { q:"Payroll used to take us 3 days. With Finexa it's done before lunch.",              name:"Ada Okonkwo",    role:"CFO, Acme Corp Lagos"         },
              { q:"The teller console is exactly what our branch staff needed. Simple and fast.",      name:"Chidi Eze",      role:"Operations Lead, Starfield Finance" },
              { q:"Finally a fintech tool built for how Nigerian businesses actually work.",           name:"Ngozi Adeyemi",  role:"Founder, Blue Horizon Ltd"    },
            ].map((t,i) => (
              <div key={t.name} className="testi-card reveal" style={{ transitionDelay:`${i*.1}s` }}>
                <div style={{ fontSize:"2rem", color:T.gold, marginBottom:"1rem", lineHeight:1 }}>"</div>
                <p style={{ fontSize:".88rem", color:T.white80, lineHeight:1.8, marginBottom:"1.5rem" }}>{t.q}</p>
                <div style={{ fontFamily:T.fontDisplay, fontWeight:700, color:T.white, fontSize:".88rem" }}>{t.name}</div>
                <div style={{ fontFamily:T.fontMono, fontSize:".62rem", color:T.slate, marginTop:".25rem", letterSpacing:".06em" }}>{t.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding:"8rem 4rem", background:T.mid, position:"relative", zIndex:1 }}>
        <div style={{ maxWidth:1000, margin:"0 auto" }}>
          <div className="reveal" style={{ textAlign:"center", marginBottom:"4rem" }}>
            <div style={{ fontFamily:T.fontMono, fontSize:".62rem", color:T.electric, letterSpacing:".2em", textTransform:"uppercase", marginBottom:"1rem" }}>— Pricing</div>
            <h2 style={{ fontFamily:T.fontDisplay, fontWeight:800, fontSize:"clamp(2rem,5vw,3.5rem)", color:T.white, letterSpacing:"-.03em" }}>Simple, transparent pricing</h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:"1.5rem" }}>
            {[
              { name:"Starter", price:"Free", period:"forever", features:["Up to 3 employees","10 invoices/month","Basic receipts","Teller console","Email support"], cta:"Get Started", featured:false },
              { name:"Growth",  price:"₦15,000", period:"/month", features:["Unlimited employees","Unlimited invoices","Receipt storage 10GB","Payroll automation","Priority support","PDF exports"], cta:"Start Free Trial", featured:true },
              { name:"Enterprise", price:"Custom", period:"", features:["Multi-branch support","Custom integrations","Dedicated account manager","SLA guarantee","On-premise option"], cta:"Contact Sales", featured:false },
            ].map((p,i) => (
              <div key={p.name} className={`price-card reveal ${p.featured?"featured":""}`} style={{ transitionDelay:`${i*.1}s` }}>
                <div style={{ fontFamily:T.fontMono, fontSize:".65rem", color:p.featured?T.electric:T.slate, letterSpacing:".12em", textTransform:"uppercase", marginBottom:".75rem" }}>{p.name}</div>
                <div style={{ fontFamily:T.fontDisplay, fontWeight:800, fontSize:"2.2rem", color:T.white, letterSpacing:"-.03em", marginBottom:".25rem" }}>{p.price}</div>
                <div style={{ fontFamily:T.fontMono, fontSize:".68rem", color:T.slate, marginBottom:"2rem" }}>{p.period}</div>
                <div style={{ display:"flex", flexDirection:"column", gap:".65rem", marginBottom:"2rem" }}>
                  {p.features.map(f => (
                    <div key={f} style={{ display:"flex", alignItems:"center", gap:".6rem", fontSize:".82rem", color:T.white80 }}>
                      <span style={{ color:p.featured?T.electric:T.gold, fontSize:".7rem" }}>✓</span> {f}
                    </div>
                  ))}
                </div>
                <button onClick={p.name==="Enterprise" ? ()=>window.location.href="mailto:hello@finexa.ng" : goLogin}
                  className={p.featured?"btn-land-primary":"btn-land-secondary"}
                  style={{ width:"100%", padding:".85rem", fontSize:".82rem" }}>
                  {p.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ padding:"8rem 4rem", position:"relative", zIndex:1, overflow:"hidden", textAlign:"center" }}>
        <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:"60vw", height:"60vw", maxWidth:700, borderRadius:"50%", background:"radial-gradient(ellipse,rgba(200,169,110,.07),transparent 70%)", pointerEvents:"none" }}/>
        <div style={{ position:"relative", maxWidth:640, margin:"0 auto" }} className="reveal">
          <div style={{ fontFamily:T.fontMono, fontSize:".62rem", color:T.electric, letterSpacing:".2em", textTransform:"uppercase", marginBottom:"1rem" }}>— Get Started Today</div>
          <h2 style={{ fontFamily:T.fontDisplay, fontWeight:800, fontSize:"clamp(2.5rem,6vw,5rem)", color:T.white, letterSpacing:"-.04em", lineHeight:1.05, marginBottom:"1.5rem" }}>
            Ready to take control<br/>of your finances?
          </h2>
          <p style={{ color:T.slate, fontSize:"1rem", lineHeight:1.75, marginBottom:"3rem" }}>
            Free to start. No credit card. No setup fees.<br/>
            Fast, reliable financial tools built for your business.
          </p>
          <div style={{ display:"flex", gap:"1rem", justifyContent:"center", flexWrap:"wrap" }}>
            <button onClick={goLogin} className="btn-land-primary" style={{ fontSize:"1rem", padding:"1rem 2.5rem" }}>
              Create Free Account →
            </button>
            <button onClick={() => scrollTo("features")} className="btn-land-secondary" style={{ fontSize:"1rem", padding:"1rem 2.5rem" }}>
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background:T.mid, borderTop:`1px solid ${T.border}`, padding:"3rem 4rem", zIndex:1, position:"relative" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"1.5rem", marginBottom:"2rem" }}>
          <div style={{ display:"flex", alignItems:"center", gap:".65rem" }}>
            <Logo size={22}/>
            <span style={{ fontFamily:T.fontDisplay, fontWeight:800, fontSize:"1rem", color:T.white }}>Fine<span style={{ color:T.gold }}>x</span>a</span>
          </div>
          <div style={{ display:"flex", gap:"2rem", flexWrap:"wrap" }}>
            {[
              ["Features", "features"],
              ["How It Works", "how-it-works"],
              ["Pricing", "pricing"],
              ["Reviews", "testimonials"]
            ].map(([label, id]) => (
              <button
                key={label}
                onClick={() => scrollTo(id)}
                style={{ fontFamily: T.fontMono, fontSize: ".62rem", color: T.slate, letterSpacing: ".08em", textDecoration: "none", transition: "color .2s", textTransform: "uppercase", background: "none", border: "none", cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.color = T.gold}
                onMouseLeave={e => e.currentTarget.style.color = T.slate}
              >
                {label}
              </button>
            ))}
          </div>
          <div style={{ display:"flex", gap:"1rem" }}>
            <button onClick={goLogin} className="btn-land-secondary" style={{ fontSize:".72rem", padding:".4rem .9rem" }}>Sign In</button>
            <button onClick={goLogin} className="btn-land-primary"   style={{ fontSize:".72rem", padding:".4rem .9rem" }}>Get Started</button>
          </div>
        </div>
        <div style={{ borderTop:`1px solid ${T.border}`, paddingTop:"1.5rem", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"1rem" }}>
          <div style={{ fontFamily:T.fontMono, fontSize:".6rem", color:T.slate }}>© {new Date().getFullYear()} Finexa. Finance, Engineered for What's Next.</div>
          <div style={{ display:"flex", gap:"1.25rem" }}>
            {["Privacy","Terms","Support"].map(l => (
              <a key={l} href="#/" style={{ fontFamily:T.fontMono, fontSize:".6rem", color:T.slate, textDecoration:"none", letterSpacing:".06em", transition:"color .2s" }}
                onMouseEnter={e => e.currentTarget.style.color=T.gold}
                onMouseLeave={e => e.currentTarget.style.color=T.slate}>{l}</a>
            ))}
          </div>
        </div>
      </footer>

      {/* Demo Modal */}
      <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// LOGIN PAGE
// ═══════════════════════════════════════════════════════════════
function LoginPage() {
  const { signIn, signUp } = useAuth();
  const { navigate }       = useRouter();
  const { toast }          = useToast();
  const [mode, setMode]         = useState("signin");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]         = useState("");
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState({});

  const validate = () => {
    const e = {};
    if (!email.includes("@")) e.email = "Valid email required";
    if (password.length < 6)  e.password = "Min 6 characters";
    if (mode === "signup" && !name.trim()) e.name = "Name required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    const { error } = mode === "signin" ? await signIn(email, password) : await signUp(email, password, name);
    setLoading(false);
    if (error) { toast(error.message, "error"); return; }
    if (mode === "signup") { toast("Account created — check your email to confirm", "success"); }
    else { navigate("/dashboard"); }
  };

  return (
    <div style={{ minHeight:"100vh", background:T.ink, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:T.fontBody, position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:"-15%", right:"-10%", width:"55vw", height:"55vw", maxWidth:650, borderRadius:"50%", background:"radial-gradient(ellipse,rgba(200,169,110,.09),transparent 70%)", animation:"pulse 6s ease-in-out infinite", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", bottom:"-15%", left:"-10%", width:"45vw", height:"45vw", maxWidth:500, borderRadius:"50%", background:"radial-gradient(ellipse,rgba(26,255,178,.05),transparent 70%)", animation:"pulse 8s ease-in-out infinite reverse", pointerEvents:"none" }}/>

      <div style={{ width:420, background:T.mid, border:`1px solid ${T.border}`, padding:"3rem", position:"relative", zIndex:1 }}>
        <button onClick={() => navigate("/")} style={{ background:"none", border:"none", color:T.slate, fontFamily:T.fontMono, fontSize:".62rem", letterSpacing:".08em", textTransform:"uppercase", cursor:"pointer", marginBottom:"2rem", padding:0, display:"flex", alignItems:"center", gap:".4rem", transition:"color .2s" }}
          onMouseEnter={e => e.currentTarget.style.color=T.gold}
          onMouseLeave={e => e.currentTarget.style.color=T.slate}>
          ← Back to Home
        </button>

        <div style={{ display:"flex", alignItems:"center", gap:".65rem", marginBottom:"2rem" }}>
          <Logo size={28}/>
          <span style={{ fontFamily:T.fontDisplay, fontWeight:800, fontSize:"1.25rem", color:T.white, letterSpacing:"-.03em" }}>Fine<span style={{ color:T.gold }}>x</span>a</span>
        </div>

        <div style={{ fontFamily:T.fontMono, fontSize:".62rem", color:T.electric, letterSpacing:".2em", textTransform:"uppercase", marginBottom:".5rem" }}>
          — {mode === "signin" ? "Welcome back" : "Create account"}
        </div>
        <h1 style={{ fontFamily:T.fontDisplay, fontWeight:800, fontSize:"1.6rem", color:T.white, letterSpacing:"-.03em", marginBottom:"2rem" }}>
          {mode === "signin" ? "Sign in to Finexa" : "Get started free"}
        </h1>

        <div style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
          {mode === "signup" && <Input label="Full Name" id="name" type="text" value={name} onChange={e => setName(e.target.value)} error={errors.name} placeholder="Ada Okonkwo"/>}
          <Input label="Email" id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} error={errors.email} placeholder="you@company.ng"/>
          <Input label="Password" id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} error={errors.password} placeholder="••••••••"
            onKeyDown={e => e.key==="Enter" && submit()}/>
          <Btn onClick={submit} disabled={loading} style={{ width:"100%", marginTop:".5rem" }}>
            {loading ? "Please wait…" : mode === "signin" ? "Sign In →" : "Create Account →"}
          </Btn>
        </div>

        <div style={{ marginTop:"1.5rem", textAlign:"center", fontFamily:T.fontMono, fontSize:".68rem", color:T.slate }}>
          {mode === "signin" ? "No account? " : "Already have one? "}
          <button onClick={() => { setMode(mode==="signin"?"signup":"signin"); setErrors({}); }}
            style={{ background:"none", border:"none", color:T.gold, cursor:"pointer", fontFamily:T.fontMono, fontSize:".68rem" }}>
            {mode === "signin" ? "Sign up free" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// APP SHELL — Sidebar + PageShell
// ═══════════════════════════════════════════════════════════════
const NAV_ITEMS = [
  { label:"Dashboard", href:"/dashboard", icon:"▦" },
  { label:"Invoices",  href:"/invoices",  icon:"◻" },
  { label:"Payroll",   href:"/payroll",   icon:"◈" },
  { label:"Receipts",  href:"/receipts",  icon:"◉" },
  { label:"Teller",    href:"/teller",    icon:"⬡" },
  { label:"Settings",  href:"/settings",  icon:"◎" },
];

function Sidebar() {
  const { path, navigate } = useRouter();
  const { profile, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast("Signed out", "success");
    navigate("/");
  };

  return (
    <nav style={{ position:"fixed", top:0, left:0, bottom:0, width:220, background:"rgba(10,15,30,.93)", borderRight:`1px solid ${T.border}`, backdropFilter:"blur(20px)", display:"flex", flexDirection:"column", padding:"2.5rem 1.75rem", zIndex:200 }}>
      <button onClick={() => navigate("/dashboard")} style={{ display:"flex", alignItems:"center", gap:".65rem", background:"none", border:"none", cursor:"pointer", marginBottom:"3rem", padding:0 }}>
        <Logo size={28}/>
        <span style={{ fontFamily:T.fontDisplay, fontWeight:800, fontSize:"1.15rem", letterSpacing:"-.03em", color:T.white }}>Fine<span style={{ color:T.gold }}>x</span>a</span>
      </button>

      <ul style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:".2rem", width:"100%" }}>
        {NAV_ITEMS.map(({ label, href, icon }) => {
          const active = path === href || path.startsWith(href+"/");
          return (
            <li key={href}>
              <button className="sidebar-btn" onClick={() => navigate(href)} style={{ width:"100%", background:active?T.gold10:"transparent", border:"none", borderLeft:`2px solid ${active?T.electric:"transparent"}`, color:active?T.white:T.slate, fontFamily:T.fontMono, fontSize:".72rem", letterSpacing:".08em", textTransform:"uppercase", padding:".55rem .75rem", display:"flex", alignItems:"center", gap:".6rem", cursor:"pointer", transition:"all .2s", textAlign:"left" }}>
                <span style={{ fontSize:"1rem", lineHeight:1 }}>{icon}</span>{label}
              </button>
            </li>
          );
        })}
      </ul>

      <div style={{ marginTop:"auto", borderTop:`1px solid ${T.border}`, paddingTop:"1.5rem" }}>
        {profile && (
          <div style={{ marginBottom:"1rem" }}>
            <div style={{ fontFamily:T.fontMono, fontSize:".6rem", color:T.slate, letterSpacing:".08em", textTransform:"uppercase", marginBottom:".25rem" }}>Signed in as</div>
            <div style={{ fontSize:".8rem", color:T.white, fontFamily:T.fontBody, fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{profile.full_name||profile.email}</div>
            {profile.organizations && <div style={{ fontSize:".68rem", color:T.gold, fontFamily:T.fontMono, marginTop:".15rem" }}>{profile.organizations.name}</div>}
          </div>
        )}
        <button onClick={handleSignOut} style={{ width:"100%", background:"transparent", border:`1px solid ${T.border}`, color:T.slate, fontFamily:T.fontMono, fontSize:".65rem", letterSpacing:".1em", textTransform:"uppercase", padding:".5rem .75rem", cursor:"pointer", transition:"all .2s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor=T.red; e.currentTarget.style.color=T.red; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor=T.border; e.currentTarget.style.color=T.slate; }}>
          Sign Out
        </button>
      </div>
    </nav>
  );
}

function PageShell({ children }) {
  return (
    <div style={{ paddingLeft:220, minHeight:"100vh", background:T.ink }}>
      <Sidebar/>
      <main style={{ padding:"3rem 3.5rem", minHeight:"100vh" }}>{children}</main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════
function DashboardPage() {
  const { supabase, profile } = useAuth();
  const { navigate } = useRouter();
  const [stats, setStats] = useState({ invoices:0, payroll:0, receipts:0, transactions:0 });

  useEffect(() => {
    if (!supabase) return;
    Promise.all([
      supabase.from("invoices").select("id",{count:"exact",head:true}),
      supabase.from("payroll_runs").select("id",{count:"exact",head:true}),
      supabase.from("receipts").select("id",{count:"exact",head:true}),
      supabase.from("transactions").select("id",{count:"exact",head:true}),
    ]).then(([inv,pay,rec,txn]) => setStats({ invoices:inv.count||0, payroll:pay.count||0, receipts:rec.count||0, transactions:txn.count||0 }));
  }, [supabase]);

  return (
    <PageShell>
      <PageHeader title="Dashboard" sub={new Date().toLocaleDateString("en-NG",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}/>
      <div style={{ display:"flex", gap:"1.25rem", flexWrap:"wrap", marginBottom:"3rem" }}>
        {[
          { label:"Total Invoices",  value:stats.invoices,     delta:12,  accent:T.gold,     href:"/invoices"  },
          { label:"Payroll Runs",    value:stats.payroll,      delta:0,   accent:T.white,    href:"/payroll"   },
          { label:"Receipts Logged", value:stats.receipts,     delta:8,   accent:T.electric, href:"/receipts"  },
          { label:"Transactions",    value:stats.transactions, delta:-3,  accent:T.white,    href:"/teller"    },
        ].map(s => (
          <div key={s.label} onClick={() => navigate(s.href)} style={{ background:T.mid, border:`1px solid ${T.border}`, padding:"1.5rem", flex:1, minWidth:180, cursor:"pointer", transition:"border-color .2s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor=T.gold50}
            onMouseLeave={e => e.currentTarget.style.borderColor=T.border}>
            <div style={{ fontFamily:T.fontMono, fontSize:".6rem", color:T.slate, letterSpacing:".1em", textTransform:"uppercase", marginBottom:".75rem" }}>{s.label}</div>
            <div style={{ fontFamily:T.fontDisplay, fontWeight:800, fontSize:"2rem", color:s.accent, letterSpacing:"-.03em" }}>{s.value}</div>
            <div style={{ fontSize:".72rem", fontFamily:T.fontMono, color:s.delta>=0?T.electric:T.red, marginTop:".4rem" }}>{s.delta>=0?"↑":"↓"} {Math.abs(s.delta)}% vs last month</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:"1rem", marginBottom:"3rem" }}>
        {[
          { label:"New Invoice",    icon:"◻", href:"/invoices"  },
          { label:"Run Payroll",    icon:"◈", href:"/payroll"   },
          { label:"Upload Receipt", icon:"◉", href:"/receipts"  },
          { label:"Open Teller",    icon:"⬡", href:"/teller"    },
        ].map(a => (
          <button key={a.label} onClick={() => navigate(a.href)} style={{ background:T.gold10, border:`1px solid ${T.border}`, color:T.white, fontFamily:T.fontDisplay, fontWeight:600, fontSize:".82rem", padding:"1.25rem", cursor:"pointer", display:"flex", alignItems:"center", gap:".75rem", transition:"all .2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor=T.gold; e.currentTarget.style.background=T.gold18; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor=T.border; e.currentTarget.style.background=T.gold10; }}>
            <span style={{ fontSize:"1.1rem", color:T.gold }}>{a.icon}</span>{a.label}
          </button>
        ))}
      </div>

      <div style={{ background:T.mid, border:`1px solid ${T.border}`, padding:"2rem" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem" }}>
          <div style={{ fontFamily:T.fontMono, fontSize:".65rem", color:T.slate, letterSpacing:".1em", textTransform:"uppercase" }}>Recent Transactions</div>
          <button onClick={() => navigate("/teller")} style={{ background:"none", border:"none", color:T.gold, fontFamily:T.fontMono, fontSize:".62rem", letterSpacing:".08em", cursor:"pointer" }}>View All →</button>
        </div>
        <RecentTransactions supabase={supabase}/>
      </div>
    </PageShell>
  );
}

function RecentTransactions({ supabase }) {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    if (!supabase) return;
    supabase.from("transactions").select("*").order("created_at",{ascending:false}).limit(8).then(({data}) => setRows(data||[]));
  }, [supabase]);

  if (!rows.length) return <EmptyState icon="◈" title="No transactions yet" sub="They'll appear here once recorded." compact/>;
  return (
    <table style={{ width:"100%", borderCollapse:"collapse" }}>
      <thead>
        <tr>{["Reference","Type","Amount","Date"].map(h => <th key={h} style={{ fontFamily:T.fontMono, fontSize:".6rem", color:T.slate, letterSpacing:".1em", textTransform:"uppercase", textAlign:"left", paddingBottom:".75rem", borderBottom:`1px solid ${T.border}` }}>{h}</th>)}</thead>
      <tbody>
        {rows.map(r => (
          <tr key={r.id}>
            <td style={{ padding:".75rem 0", fontFamily:T.fontMono, fontSize:".75rem", color:T.white, borderBottom:`1px solid ${T.border}` }}>{r.reference||r.id.slice(0,8)}</td>
            <td style={{ padding:".75rem 0", fontFamily:T.fontMono, fontSize:".72rem", color:T.slate, borderBottom:`1px solid ${T.border}`, textTransform:"uppercase" }}>{r.type}</td>
            <td style={{ padding:".75rem 0", fontFamily:T.fontDisplay, fontWeight:700, color:r.direction==="credit"?T.electric:T.red, borderBottom:`1px solid ${T.border}` }}>
              {r.direction==="credit"?"+":"-"}₦{Number(r.amount||0).toLocaleString("en-NG",{minimumFractionDigits:2})}
            </td>
            <td style={{ padding:".75rem 0", fontFamily:T.fontMono, fontSize:".68rem", color:T.slate, borderBottom:`1px solid ${T.border}` }}>{new Date(r.created_at).toLocaleDateString("en-NG")}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ═══════════════════════════════════════════════════════════════
// INVOICES
// ═══════════════════════════════════════════════════════════════
function InvoicesPage() {
  const { supabase } = useAuth();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const { data } = await supabase.from("invoices").select("*").order("created_at",{ascending:false});
    setInvoices(data||[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!supabase) return;
    const ch = supabase.channel("invoices-rt").on("postgres_changes",{event:"*",schema:"public",table:"invoices"},load).subscribe();
    return () => supabase.removeChannel(ch);
  }, [supabase, load]);

  const deleteInvoice = async id => {
    const { error } = await supabase.from("invoices").delete().eq("id",id);
    if (error) { toast(error.message,"error"); return; }
    toast("Invoice deleted","success");
    load();
  };

  const markPaid = async id => {
    await supabase.from("invoices").update({status:"paid"}).eq("id",id);
    toast("Marked as paid","success");
    load();
  };

  return (
    <PageShell>
      <PageHeader title="Invoices" sub="Create, send, and track your invoices" action={<Btn onClick={()=>setShowForm(true)}>+ New Invoice</Btn>}/>
      {loading ? <Loader/> : invoices.length===0 ? (
        <EmptyState icon="◻" title="No invoices yet" sub="Create your first invoice to get started."/>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", border:`1px solid ${T.border}` }}>
          {invoices.map(inv => (
            <div key={inv.id} style={{ display:"flex", alignItems:"center", gap:"1.5rem", padding:"1.25rem 1.5rem", borderBottom:`1px solid ${T.border}`, background:T.mid, transition:"background .15s" }}
              onMouseEnter={e => e.currentTarget.style.background=T.gold10}
              onMouseLeave={e => e.currentTarget.style.background=T.mid}>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:T.fontDisplay, fontWeight:700, color:T.white, fontSize:".95rem" }}>{inv.client_name}</div>
                <div style={{ fontFamily:T.fontMono, fontSize:".63rem", color:T.slate, marginTop:".2rem" }}>
                  INV-{inv.id.slice(0,8).toUpperCase()} · Due {inv.due_date?new Date(inv.due_date).toLocaleDateString("en-NG"):"—"}
                </div>
              </div>
              <div style={{ fontFamily:T.fontDisplay, fontWeight:800, color:T.gold, fontSize:"1.1rem" }}>₦{Number(inv.total_ngn||0).toLocaleString("en-NG",{minimumFractionDigits:2})}</div>
              <Badge status={inv.status||"draft"}/>
              {inv.status!=="paid" && <Btn variant="ghost" onClick={()=>markPaid(inv.id)} style={{ fontSize:".65rem", padding:".35rem .75rem", color:T.electric, border:`1px solid ${T.electric10}` }}>Mark Paid</Btn>}
              <Btn variant="danger" onClick={()=>deleteInvoice(inv.id)} style={{ padding:".35rem .75rem", fontSize:".65rem" }}>Delete</Btn>
            </div>
          ))}
        </div>
      )}
      <InvoiceFormModal open={showForm} onClose={()=>setShowForm(false)} onSaved={()=>{ setShowForm(false); load(); toast("Invoice created","success"); }} supabase={supabase}/>
    </PageShell>
  );
}

function InvoiceFormModal({ open, onClose, onSaved, supabase }) {
  const [client,  setClient]  = useState("");
  const [due,     setDue]     = useState("");
  const [amount,  setAmount]  = useState("");
  const [notes,   setNotes]   = useState("");
  const [saving,  setSaving]  = useState(false);

  const save = async () => {
    if (!client||!amount) return;
    setSaving(true);
    const { error } = await supabase.from("invoices").insert({ client_name:client, due_date:due||null, total_ngn:parseFloat(amount), status:"draft", notes });
    setSaving(false);
    if (!error) onSaved();
  };

  return (
    <Modal open={open} onClose={onClose} title="New Invoice">
      <div style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
        <Input label="Client Name" value={client} onChange={e=>setClient(e.target.value)} placeholder="Acme Corp Ltd"/>
        <Input label="Due Date" type="date" value={due} onChange={e=>setDue(e.target.value)}/>
        <Input label="Amount (₦)" type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="250000"/>
        <div style={{ display:"flex", flexDirection:"column", gap:".4rem" }}>
          <label style={{ fontFamily:T.fontMono, fontSize:".62rem", color:T.slate, letterSpacing:".08em", textTransform:"uppercase" }}>Notes</label>
          <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={3} placeholder="Payment terms, bank details…" style={{ background:"rgba(10,15,30,.6)", border:`1px solid ${T.border}`, color:T.white, fontFamily:T.fontBody, fontSize:".88rem", padding:".65rem .9rem", resize:"vertical", outline:"none" }}/>
        </div>
        <div style={{ display:"flex", gap:"1rem", justifyContent:"flex-end" }}>
          <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
          <Btn onClick={save} disabled={saving}>{saving?"Saving…":"Create Invoice"}</Btn>
        </div>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════
// PAYROLL
// ═══════════════════════════════════════════════════════════════
function PayrollPage() {
  const { supabase } = useAuth();
  const { toast } = useToast();
  const [employees, setEmployees] = useState([]);
  const [runs, setRuns]           = useState([]);
  const [showEmpForm, setShowEmpForm] = useState(false);

  const loadAll = useCallback(async () => {
    if (!supabase) return;
    const [e, r] = await Promise.all([
      supabase.from("employees").select("*").order("full_name"),
      supabase.from("payroll_runs").select("*").order("created_at",{ascending:false}),
    ]);
    setEmployees(e.data||[]);
    setRuns(r.data||[]);
  }, [supabase]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const runPayroll = async () => {
    const total = employees.reduce((s,e) => s+Number(e.salary_ngn||0), 0);
    const now   = new Date();
    const { error } = await supabase.from("payroll_runs").insert({
      period_start:new Date(now.getFullYear(),now.getMonth(),1).toISOString().split("T")[0],
      period_end:now.toISOString().split("T")[0],
      status:"processed", total,
    });
    if (error) { toast(error.message,"error"); return; }
    toast(`Payroll run — ₦${total.toLocaleString()} processed`,"success");
    loadAll();
  };

  return (
    <PageShell>
      <PageHeader title="Payroll" sub="Manage employees and run payroll" action={
        <div style={{ display:"flex", gap:".75rem" }}>
          <Btn variant="secondary" onClick={()=>setShowEmpForm(true)}>+ Employee</Btn>
          <Btn onClick={runPayroll} disabled={!employees.length}>Run Payroll</Btn>
        </div>
      }/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"2rem" }}>
        <div>
          <div style={{ fontFamily:T.fontMono, fontSize:".62rem", color:T.slate, letterSpacing:".12em", textTransform:"uppercase", marginBottom:"1rem" }}>Employees ({employees.length})</div>
          <div style={{ display:"flex", flexDirection:"column", gap:".5rem" }}>
            {employees.length===0 && <EmptyState icon="◈" title="No employees" sub="Add your first employee." compact/>}
            {employees.map(e => (
              <div key={e.id} style={{ background:T.mid, border:`1px solid ${T.border}`, padding:"1rem 1.25rem", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ fontFamily:T.fontDisplay, fontWeight:600, color:T.white, fontSize:".9rem" }}>{e.full_name}</div>
                  <div style={{ fontFamily:T.fontMono, fontSize:".62rem", color:T.slate, marginTop:".15rem" }}>{e.role||"Staff"}</div>
                </div>
                <div style={{ fontFamily:T.fontMono, color:T.gold, fontSize:".85rem" }}>₦{Number(e.salary_ngn||0).toLocaleString()}/mo</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontFamily:T.fontMono, fontSize:".62rem", color:T.slate, letterSpacing:".12em", textTransform:"uppercase", marginBottom:"1rem" }}>Payroll History</div>
          <div style={{ display:"flex", flexDirection:"column", gap:".5rem" }}>
            {runs.length===0 && <EmptyState icon="◈" title="No runs yet" sub="Process your first payroll." compact/>}
            {runs.map(r => (
              <div key={r.id} style={{ background:T.mid, border:`1px solid ${T.border}`, padding:"1rem 1.25rem", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ fontFamily:T.fontMono, fontSize:".7rem", color:T.white }}>{r.period_start} → {r.period_end}</div>
                  <div style={{ marginTop:".3rem" }}><Badge status={r.status||"processed"}/></div>
                </div>
                <div style={{ fontFamily:T.fontDisplay, fontWeight:700, color:T.electric }}>₦{Number(r.total||0).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <EmployeeFormModal open={showEmpForm} onClose={()=>setShowEmpForm(false)} onSaved={()=>{ setShowEmpForm(false); loadAll(); toast("Employee added","success"); }} supabase={supabase}/>
    </PageShell>
  );
}

function EmployeeFormModal({ open, onClose, onSaved, supabase }) {
  const [name,   setName]   = useState("");
  const [role,   setRole]   = useState("");
  const [salary, setSalary] = useState("");
  const [bank,   setBank]   = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name||!salary) return;
    setSaving(true);
    const { error } = await supabase.from("employees").insert({ full_name:name, role, salary_ngn:parseFloat(salary), bank_account:bank });
    setSaving(false);
    if (!error) onSaved();
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Employee">
      <div style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
        <Input label="Full Name" value={name} onChange={e=>setName(e.target.value)} placeholder="Ngozi Adeyemi"/>
        <Input label="Role / Title" value={role} onChange={e=>setRole(e.target.value)} placeholder="Senior Engineer"/>
        <Input label="Monthly Salary (₦)" type="number" value={salary} onChange={e=>setSalary(e.target.value)} placeholder="350000"/>
        <Input label="Bank Account Number" value={bank} onChange={e=>setBank(e.target.value)} placeholder="0123456789"/>
        <div style={{ display:"flex", gap:"1rem", justifyContent:"flex-end" }}>
          <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
          <Btn onClick={save} disabled={saving}>{saving?"Saving…":"Add Employee"}</Btn>
        </div>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════
// RECEIPTS
// ═══════════════════════════════════════════════════════════════
function ReceiptsPage() {
  const { supabase } = useAuth();
  const { toast } = useToast();
  const [receipts, setReceipts]   = useState([]);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase.from("receipts").select("*").order("date",{ascending:false});
    setReceipts(data||[]);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  const handleUpload = async e => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const path = `receipts/${Date.now()}_${file.name}`;
    const { error:uploadErr } = await supabase.storage.from("receipts").upload(path, file);
    if (uploadErr) { toast(uploadErr.message,"error"); setUploading(false); return; }
    const { error } = await supabase.from("receipts").insert({ storage_path:path, merchant:"Uploaded", amount:0, date:new Date().toISOString().split("T")[0] });
    setUploading(false);
    if (error) { toast(error.message,"error"); return; }
    toast("Receipt uploaded","success");
    load();
  };

  return (
    <PageShell>
      <PageHeader title="Receipts" sub="Upload and manage expense receipts" action={
        <label style={{ background:T.gold, color:T.ink, fontFamily:T.fontDisplay, fontWeight:700, fontSize:".82rem", letterSpacing:".05em", padding:".75rem 1.5rem", cursor:"pointer" }}>
          {uploading?"Uploading…":"+ Upload Receipt"}
          <input type="file" accept="image/*,application/pdf" onChange={handleUpload} style={{ display:"none" }}/>
        </label>
      }/>
      {receipts.length===0 ? <EmptyState icon="◉" title="No receipts" sub="Upload your first receipt above."/> : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:"1rem" }}>
          {receipts.map(r => (
            <div key={r.id} style={{ background:T.mid, border:`1px solid ${T.border}`, padding:"1.5rem", transition:"border-color .2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor=T.gold50}
              onMouseLeave={e => e.currentTarget.style.borderColor=T.border}>
              <div style={{ fontFamily:T.fontMono, fontSize:".62rem", color:T.slate, letterSpacing:".08em", textTransform:"uppercase", marginBottom:".5rem" }}>{r.date}</div>
              <div style={{ fontFamily:T.fontDisplay, fontWeight:700, color:T.white, fontSize:".95rem", marginBottom:".4rem" }}>{r.merchant}</div>
              <div style={{ fontFamily:T.fontDisplay, fontWeight:800, color:T.gold, fontSize:"1.2rem" }}>₦{Number(r.amount||0).toLocaleString("en-NG",{minimumFractionDigits:2})}</div>
              {r.storage_path && (
                <a href={supabase.storage.from("receipts").getPublicUrl(r.storage_path).data.publicUrl} target="_blank" rel="noreferrer"
                  style={{ display:"inline-block", marginTop:"1rem", fontFamily:T.fontMono, fontSize:".62rem", color:T.electric, textDecoration:"none", letterSpacing:".06em" }}>
                  View file →
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}

// ═══════════════════════════════════════════════════════════════
// TELLER
// ═══════════════════════════════════════════════════════════════
function TellerPage() {
  const { supabase } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount]     = useState("0.00");
  const [note, setNote]         = useState("");
  const [direction, setDir]     = useState("credit");
  const [entries, setEntries]   = useState([]);

  const load = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase.from("teller_entries").select("*").order("created_at",{ascending:false}).limit(20);
    setEntries(data||[]);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  const keyPress = k => {
    setAmount(prev => {
      if (k==="C") return "0.00";
      if (k==="⌫") { const s=prev.replace(".","").slice(0,-1)||"0"; return (parseInt(s,10)/100).toFixed(2); }
      const digits = prev.replace(".","") + k;
      return (parseInt(digits,10)/100).toFixed(2);
    });
  };

  const post = async () => {
    const val = parseFloat(amount);
    if (!val) { toast("Enter an amount","error"); return; }
    const { error } = await supabase.from("teller_entries").insert({ amount:val, direction, note });
    if (error) { toast(error.message,"error"); return; }
    toast(`₦${val.toLocaleString()} ${direction} posted`,"success");
    setAmount("0.00"); setNote("");
    load();
  };

  const totalCredit = entries.filter(e=>e.direction==="credit").reduce((s,e)=>s+Number(e.amount),0);
  const totalDebit  = entries.filter(e=>e.direction==="debit").reduce((s,e)=>s+Number(e.amount),0);

  return (
    <PageShell>
      <PageHeader title="Teller Console" sub="Record cash-in and cash-out transactions"/>
      <div style={{ display:"grid", gridTemplateColumns:"360px 1fr", gap:"2.5rem", alignItems:"start" }}>
        <div style={{ background:T.mid, border:`1px solid ${T.border}`, padding:"2rem" }}>
          <div style={{ background:"rgba(10,15,30,.6)", border:`1px solid ${T.border}`, padding:"1.25rem 1.5rem", marginBottom:"1.5rem", textAlign:"right" }}>
            <div style={{ fontFamily:T.fontMono, fontSize:".6rem", color:T.slate, letterSpacing:".1em", textTransform:"uppercase", marginBottom:".25rem" }}>Amount</div>
            <div style={{ fontFamily:T.fontDisplay, fontWeight:800, fontSize:"2.2rem", color:T.gold, letterSpacing:"-.03em" }}>₦ {amount}</div>
          </div>
          <div style={{ display:"flex", gap:".5rem", marginBottom:"1.5rem" }}>
            {["credit","debit"].map(d => (
              <button key={d} onClick={()=>setDir(d)} style={{ flex:1, padding:".6rem", fontFamily:T.fontMono, fontSize:".65rem", letterSpacing:".1em", textTransform:"uppercase", cursor:"pointer", background:direction===d?(d==="credit"?T.electric10:T.red10):"transparent", border:`1px solid ${direction===d?(d==="credit"?T.electric:T.red):T.border}`, color:direction===d?(d==="credit"?T.electric:T.red):T.slate, transition:"all .2s" }}>
                {d==="credit"?"↑ Credit":"↓ Debit"}
              </button>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:".5rem", marginBottom:"1rem" }}>
            {["1","2","3","4","5","6","7","8","9","C","0","⌫"].map(k => (
              <button key={k} onClick={()=>keyPress(k)} style={{ padding:"1rem", fontFamily:T.fontMono, fontSize:"1rem", fontWeight:700, background:"rgba(10,15,30,.5)", border:`1px solid ${T.border}`, color:k==="C"?T.red:k==="⌫"?T.gold:T.white, cursor:"pointer", transition:"all .15s" }}
                onMouseEnter={e => e.currentTarget.style.background=T.gold10}
                onMouseLeave={e => e.currentTarget.style.background="rgba(10,15,30,.5)"}>
                {k}
              </button>
            ))}
          </div>
          <div style={{ marginBottom:"1rem" }}>
            <Input label="Note (optional)" value={note} onChange={e=>setNote(e.target.value)} placeholder="Payment reference…"/>
          </div>
          <Btn onClick={post} style={{ width:"100%" }}>Post Entry →</Btn>
        </div>

        <div>
          <div style={{ display:"flex", gap:"1rem", marginBottom:"1.5rem" }}>
            <div style={{ flex:1, background:T.electric10, border:`1px solid ${T.electric20}`, padding:"1rem 1.25rem" }}>
              <div style={{ fontFamily:T.fontMono, fontSize:".6rem", color:T.electric, letterSpacing:".1em", textTransform:"uppercase", marginBottom:".4rem" }}>Total Credit</div>
              <div style={{ fontFamily:T.fontDisplay, fontWeight:800, color:T.electric, fontSize:"1.3rem" }}>+₦{totalCredit.toLocaleString("en-NG",{minimumFractionDigits:2})}</div>
            </div>
            <div style={{ flex:1, background:T.red10, border:`1px solid rgba(255,107,107,.2)`, padding:"1rem 1.25rem" }}>
              <div style={{ fontFamily:T.fontMono, fontSize:".6rem", color:T.red, letterSpacing:".1em", textTransform:"uppercase", marginBottom:".4rem" }}>Total Debit</div>
              <div style={{ fontFamily:T.fontDisplay, fontWeight:800, color:T.red, fontSize:"1.3rem" }}>-₦{totalDebit.toLocaleString("en-NG",{minimumFractionDigits:2})}</div>
            </div>
          </div>
          <div style={{ fontFamily:T.fontMono, fontSize:".62rem", color:T.slate, letterSpacing:".12em", textTransform:"uppercase", marginBottom:"1rem" }}>Entry Log</div>
          {entries.length===0 ? <EmptyState icon="⬡" title="No entries yet" sub="Post your first teller entry." compact/> : (
            <div style={{ display:"flex", flexDirection:"column", gap:".5rem" }}>
              {entries.map(e => (
                <div key={e.id} style={{ background:T.mid, border:`1px solid ${T.border}`, padding:"1rem 1.25rem", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <div style={{ fontFamily:T.fontMono, fontSize:".7rem", color:T.slate, marginBottom:".25rem" }}>{new Date(e.created_at).toLocaleTimeString("en-NG")}</div>
                    <div style={{ fontSize:".82rem", color:T.white }}>{e.note||"—"}</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontFamily:T.fontDisplay, fontWeight:700, fontSize:"1rem", color:e.direction==="credit"?T.electric:T.red }}>
                      {e.direction==="credit"?"+":"-"}₦{Number(e.amount).toLocaleString("en-NG",{minimumFractionDigits:2})}
                    </div>
                    <div style={{ fontFamily:T.fontMono, fontSize:".6rem", color:T.slate, textTransform:"uppercase" }}>{e.direction}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}

// ═══════════════════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════════════════
function SettingsPage() {
  const { supabase, profile } = useAuth();
  const { toast } = useToast();
  const [name,    setName]    = useState(profile?.full_name||"");
  const [orgName, setOrgName] = useState(profile?.organizations?.name||"");
  const [saving,  setSaving]  = useState(false);

  const save = async () => {
    setSaving(true);
    if (profile?.id) await supabase.from("profiles").update({ full_name:name }).eq("id",profile.id);
    if (profile?.organizations?.id) await supabase.from("organizations").update({ name:orgName }).eq("id",profile.organizations.id);
    setSaving(false);
    toast("Settings saved","success");
  };

  return (
    <PageShell>
      <PageHeader title="Settings" sub="Manage your account and organization"/>
      <div style={{ maxWidth:480, display:"flex", flexDirection:"column", gap:"1.5rem" }}>
        <div style={{ background:T.mid, border:`1px solid ${T.border}`, padding:"2rem" }}>
          <div style={{ fontFamily:T.fontMono, fontSize:".62rem", color:T.electric, letterSpacing:".15em", textTransform:"uppercase", marginBottom:"1.5rem" }}>Profile</div>
          <div style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
            <Input label="Full Name" value={name} onChange={e=>setName(e.target.value)}/>
            <Input label="Email" value={profile?.email||""} disabled style={{ opacity:.5 }}/>
          </div>
        </div>
        <div style={{ background:T.mid, border:`1px solid ${T.border}`, padding:"2rem" }}>
          <div style={{ fontFamily:T.fontMono, fontSize:".62rem", color:T.electric, letterSpacing:".15em", textTransform:"uppercase", marginBottom:"1.5rem" }}>Organization</div>
          <Input label="Organization Name" value={orgName} onChange={e=>setOrgName(e.target.value)}/>
        </div>
        <Btn onClick={save} disabled={saving}>{saving?"Saving…":"Save Changes"}</Btn>
      </div>
    </PageShell>
  );
}

// ═══════════════════════════════════════════════════════════════
// ROOT APP + ROUTES
// ═══════════════════════════════════════════════════════════════
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
  const { session }         = useAuth();
  const { path, navigate }  = useRouter();

  if (session === undefined) return (
    <div style={{ minHeight:"100vh", background:T.ink, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ fontFamily:T.fontDisplay, fontWeight:800, fontSize:"2rem", color:T.gold, letterSpacing:"-.03em", animation:"fadeUp .6s ease-out" }}>
        Fine<span style={{ color:T.electric }}>x</span>a
      </div>
    </div>
  );

  // Logged-in users landing → dashboard
  if (session && path === "/") { navigate("/dashboard"); return null; }

  // Protect app routes
  const protected_paths = ["/dashboard","/invoices","/payroll","/receipts","/teller","/settings"];
  if (!session && protected_paths.some(p => path.startsWith(p))) return <LoginPage/>;

  if (path === "/")                       return <LandingPage/>;
  if (path === "/login")                  return <LoginPage/>;
  if (path.startsWith("/dashboard"))      return <DashboardPage/>;
  if (path.startsWith("/invoices"))       return <InvoicesPage/>;
  if (path.startsWith("/payroll"))        return <PayrollPage/>;
  if (path.startsWith("/receipts"))       return <ReceiptsPage/>;
  if (path.startsWith("/teller"))         return <TellerPage/>;
  if (path.startsWith("/settings"))       return <SettingsPage/>;

  return (
    <div style={{ minHeight:"100vh", background:T.ink, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"1rem" }}>
      <div style={{ fontFamily:T.fontDisplay, fontWeight:800, fontSize:"6rem", color:T.gold25, lineHeight:1 }}>404</div>
      <div style={{ color:T.slate, fontFamily:T.fontMono, fontSize:".8rem" }}>Page not found</div>
      <Btn onClick={() => navigate("/")} style={{ marginTop:"1rem" }}>← Back to Home</Btn>
    </div>
  );
}
