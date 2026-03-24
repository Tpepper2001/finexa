/**
 * Finexa — App.jsx
 * Full app shell: auth, routing, sidebar, and all page stubs
 * Styling: 100% inline — no CSS files, no Tailwind
 * Backend: Supabase (auth + db + realtime + storage)
 *
 * Required env:
 *   VITE_SUPABASE_URL
 *   VITE_SUPABASE_ANON_KEY
 */

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── Supabase client ──────────────────────────────────────────────────────────
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ─── Design tokens (mirrors your CSS variables) ───────────────────────────────
const T = {
  ink:        "#0A0F1E",
  ink80:      "rgba(10,15,30,.8)",
  white:      "#F5F4F0",
  white80:    "rgba(245,244,240,.8)",
  white40:    "rgba(245,244,240,.4)",
  gold:       "#C8A96E",
  goldLt:     "#E4CFA0",
  gold10:     "rgba(200,169,110,.10)",
  gold18:     "rgba(200,169,110,.18)",
  gold25:     "rgba(200,169,110,.25)",
  electric:   "#1AFFB2",
  electric10: "rgba(26,255,178,.10)",
  mid:        "#1C2340",
  slate:      "#5B6485",
  border:     "rgba(200,169,110,.18)",
  red:        "#FF6B6B",
  red10:      "rgba(255,107,107,.10)",
  blue:       "#4B8BFF",
  fontDisplay:"'Syne', system-ui, sans-serif",
  fontBody:   "'DM Sans', 'Helvetica Neue', sans-serif",
  fontMono:   "'Space Mono', monospace",
};

// ─── Auth context ─────────────────────────────────────────────────────────────
const AuthCtx = createContext(null);
const useAuth = () => useContext(AuthCtx);

function AuthProvider({ children }) {
  const [session, setSession]   = useState(undefined); // undefined = loading
  const [profile, setProfile]   = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setProfile(null); return; }
    supabase
      .from("profiles")
      .select("*, organizations(*)")
      .eq("id", session.user.id)
      .single()
      .then(({ data }) => setProfile(data));
  }, [session]);

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password });

  const signUp = (email, password, fullName) =>
    supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });

  const signOut = () => supabase.auth.signOut();

  return (
    <AuthCtx.Provider value={{ session, profile, signIn, signUp, signOut, supabase }}>
      {children}
    </AuthCtx.Provider>
  );
}

// ─── Router (tiny hash-based, no react-router dep needed for demo) ────────────
const RouterCtx = createContext(null);
const useRouter = () => useContext(RouterCtx);

function Router({ children }) {
  const [path, setPath] = useState(window.location.hash.slice(1) || "/");
  useEffect(() => {
    const handler = () => setPath(window.location.hash.slice(1) || "/");
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);
  const navigate = useCallback((to) => { window.location.hash = to; }, []);
  return (
    <RouterCtx.Provider value={{ path, navigate }}>
      {children}
    </RouterCtx.Provider>
  );
}

// ─── Toast system ─────────────────────────────────────────────────────────────
const ToastCtx = createContext(null);
const useToast = () => useContext(ToastCtx);

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const toast = useCallback((msg, type = "info") => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  const typeColor = { info: T.gold, success: T.electric, error: T.red };

  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      <div style={{ position:"fixed", bottom:"2rem", right:"2rem", zIndex:9000, display:"flex", flexDirection:"column", gap:".5rem" }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background: T.mid, border:`1px solid ${typeColor[t.type] || T.border}`,
            color: T.white, fontFamily: T.fontMono, fontSize:".75rem",
            padding:".75rem 1.25rem", letterSpacing:".04em",
            boxShadow:`0 8px 32px rgba(0,0,0,.4)`,
            animation:"slideIn .25s ease-out",
            borderLeft:`3px solid ${typeColor[t.type] || T.border}`,
          }}>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const NAV = [
  { label: "Dashboard",   href: "/dashboard",   icon: "▦" },
  { label: "Invoices",    href: "/invoices",    icon: "◻" },
  { label: "Payroll",     href: "/payroll",     icon: "◈" },
  { label: "Receipts",    href: "/receipts",    icon: "◉" },
  { label: "Teller",      href: "/teller",      icon: "⬡" },
  { label: "Settings",    href: "/settings",    icon: "◎" },
];

function Sidebar() {
  const { path, navigate } = useRouter();
  const { profile, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast("Signed out successfully", "success");
    navigate("/");
  };

  return (
    <nav style={{
      position:"fixed", top:0, left:0, bottom:0, width:220,
      background:"rgba(10,15,30,.92)", borderRight:`1px solid ${T.border}`,
      backdropFilter:"blur(20px)", display:"flex", flexDirection:"column",
      padding:"2.5rem 1.75rem", zIndex:200, gap:0,
    }}>
      {/* Logo */}
      <a href="#/dashboard" style={{ display:"flex", alignItems:"center", gap:".6rem", textDecoration:"none", marginBottom:"3rem" }}>
        <svg width="28" height="28" viewBox="0 0 56 56" fill="none">
          <rect x="1.5" y="1.5" width="53" height="53" rx="9" stroke={T.gold} strokeWidth="1.5"/>
          <path d="M16 28 L28 14 L40 28 L28 42 Z" fill={T.gold} opacity="0.9"/>
          <line x1="28" y1="12" x2="28" y2="44" stroke={T.electric} strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <span style={{ fontFamily:T.fontDisplay, fontWeight:800, fontSize:"1.15rem", letterSpacing:"-.03em", color:T.white }}>
          Fine<span style={{ color:T.gold }}>x</span>a
        </span>
      </a>

      {/* Nav links */}
      <ul style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:".2rem", width:"100%" }}>
        {NAV.map(({ label, href, icon }) => {
          const active = path === href || path.startsWith(href + "/");
          return (
            <li key={href}>
              <button onClick={() => navigate(href)} style={{
                width:"100%", background: active ? T.gold10 : "transparent",
                border:"none", borderLeft:`2px solid ${active ? T.electric : "transparent"}`,
                color: active ? T.white : T.slate,
                fontFamily:T.fontMono, fontSize:".72rem", letterSpacing:".08em",
                textTransform:"uppercase", padding:".55rem .75rem",
                display:"flex", alignItems:"center", gap:".6rem",
                cursor:"pointer", transition:"all .2s", textAlign:"left",
              }}>
                <span style={{ fontSize:"1rem", lineHeight:1 }}>{icon}</span>
                {label}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Bottom: profile + sign out */}
      <div style={{ marginTop:"auto", borderTop:`1px solid ${T.border}`, paddingTop:"1.5rem", width:"100%" }}>
        {profile && (
          <div style={{ marginBottom:"1rem" }}>
            <div style={{ fontFamily:T.fontMono, fontSize:".6rem", color:T.slate, letterSpacing:".08em", textTransform:"uppercase", marginBottom:".25rem" }}>
              Signed in as
            </div>
            <div style={{ fontSize:".8rem", color:T.white, fontFamily:T.fontBody, fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {profile.full_name || profile.email}
            </div>
            {profile.organizations && (
              <div style={{ fontSize:".68rem", color:T.gold, fontFamily:T.fontMono, marginTop:".15rem" }}>
                {profile.organizations.name}
              </div>
            )}
          </div>
        )}
        <button onClick={handleSignOut} style={{
          width:"100%", background:"transparent", border:`1px solid ${T.border}`,
          color:T.slate, fontFamily:T.fontMono, fontSize:".65rem", letterSpacing:".1em",
          textTransform:"uppercase", padding:".5rem .75rem", cursor:"pointer",
          transition:"all .2s",
        }}
          onMouseEnter={e => { e.target.style.borderColor = T.red; e.target.style.color = T.red; }}
          onMouseLeave={e => { e.target.style.borderColor = T.border; e.target.style.color = T.slate; }}
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
}

// ─── Page shell ───────────────────────────────────────────────────────────────
function PageShell({ children }) {
  return (
    <div style={{ paddingLeft:220, minHeight:"100vh", background:T.ink }}>
      <Sidebar />
      <main style={{ padding:"3rem 3.5rem", minHeight:"100vh" }}>
        {children}
      </main>
    </div>
  );
}

// ─── Shared UI: PageHeader ────────────────────────────────────────────────────
function PageHeader({ title, sub, action }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"3rem" }}>
      <div>
        <div style={{ fontFamily:T.fontMono, fontSize:".62rem", letterSpacing:".2em", color:T.electric, textTransform:"uppercase", marginBottom:".75rem" }}>
          — {title}
        </div>
        {sub && <p style={{ color:T.slate, fontSize:".88rem", fontFamily:T.fontBody }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

// ─── Shared UI: StatCard ──────────────────────────────────────────────────────
function StatCard({ label, value, delta, accent }) {
  return (
    <div style={{
      background:T.mid, border:`1px solid ${T.border}`, padding:"1.5rem",
      flex:1, minWidth:180,
    }}>
      <div style={{ fontFamily:T.fontMono, fontSize:".6rem", color:T.slate, letterSpacing:".1em", textTransform:"uppercase", marginBottom:".75rem" }}>{label}</div>
      <div style={{ fontFamily:T.fontDisplay, fontWeight:800, fontSize:"2rem", color: accent || T.white, letterSpacing:"-.03em" }}>{value}</div>
      {delta !== undefined && (
        <div style={{ fontSize:".72rem", fontFamily:T.fontMono, color: delta >= 0 ? T.electric : T.red, marginTop:".4rem" }}>
          {delta >= 0 ? "↑" : "↓"} {Math.abs(delta)}% vs last month
        </div>
      )}
    </div>
  );
}

// ─── Shared UI: PrimaryButton ─────────────────────────────────────────────────
function Btn({ children, onClick, variant = "primary", disabled, style: s }) {
  const base = {
    fontFamily:T.fontDisplay, fontWeight:700, fontSize:".82rem", letterSpacing:".05em",
    padding:".75rem 1.5rem", border:"none", cursor: disabled ? "not-allowed" : "pointer",
    transition:"all .2s", opacity: disabled ? .5 : 1, ...s,
  };
  const styles = {
    primary:   { background:T.gold, color:T.ink },
    secondary: { background:"transparent", border:`1px solid ${T.border}`, color:T.white },
    danger:    { background:T.red10, border:`1px solid ${T.red}`, color:T.red },
    ghost:     { background:"transparent", color:T.slate, padding:".5rem .75rem" },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, ...styles[variant] }}
      onMouseEnter={e => { if (!disabled && variant === "primary") e.currentTarget.style.background = T.goldLt; }}
      onMouseLeave={e => { if (!disabled && variant === "primary") e.currentTarget.style.background = T.gold; }}
    >
      {children}
    </button>
  );
}

// ─── Shared UI: Input ─────────────────────────────────────────────────────────
function Input({ label, id, error, ...props }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:".4rem" }}>
      {label && <label htmlFor={id} style={{ fontFamily:T.fontMono, fontSize:".62rem", color:T.slate, letterSpacing:".08em", textTransform:"uppercase" }}>{label}</label>}
      <input id={id} {...props} style={{
        background:"rgba(10,15,30,.6)", border:`1px solid ${error ? T.red : T.border}`,
        color:T.white, fontFamily:T.fontBody, fontSize:".88rem",
        padding:".65rem .9rem", outline:"none", width:"100%",
        transition:"border-color .2s",
        ...props.style,
      }}
        onFocus={e => { e.target.style.borderColor = T.gold; }}
        onBlur={e  => { e.target.style.borderColor = error ? T.red : T.border; }}
      />
      {error && <span style={{ fontSize:".7rem", color:T.red, fontFamily:T.fontMono }}>{error}</span>}
    </div>
  );
}

// ─── Shared UI: Badge ─────────────────────────────────────────────────────────
function Badge({ status }) {
  const map = {
    paid:     { bg: T.electric10, color: T.electric,  label: "PAID"     },
    pending:  { bg: T.gold10,     color: T.gold,       label: "PENDING"  },
    overdue:  { bg: T.red10,      color: T.red,        label: "OVERDUE"  },
    draft:    { bg: T.mid,        color: T.slate,      label: "DRAFT"    },
    sent:     { bg: "rgba(75,139,255,.1)", color: T.blue, label: "SENT"  },
    processed:{ bg: T.electric10, color: T.electric,  label: "PROCESSED"},
  };
  const s = map[status] || map.draft;
  return (
    <span style={{
      background:s.bg, color:s.color, fontFamily:T.fontMono,
      fontSize:".58rem", letterSpacing:".1em", padding:".2rem .6rem",
    }}>
      {s.label}
    </span>
  );
}

// ─── Shared UI: Modal ─────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children, width = 540 }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position:"fixed", inset:0, background:"rgba(10,15,30,.85)",
      backdropFilter:"blur(8px)", zIndex:1000,
      display:"flex", alignItems:"center", justifyContent:"center",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background:T.mid, border:`1px solid ${T.border}`,
        width, maxWidth:"90vw", maxHeight:"85vh", overflowY:"auto",
        padding:"2.5rem",
      }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"2rem" }}>
          <h2 style={{ fontFamily:T.fontDisplay, fontWeight:800, fontSize:"1.25rem", color:T.white, letterSpacing:"-.02em" }}>{title}</h2>
          <button onClick={onClose} style={{ background:"none", border:"none", color:T.slate, cursor:"pointer", fontSize:"1.2rem", lineHeight:1 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
function LoginPage() {
  const { signIn, signUp } = useAuth();
  const { navigate } = useRouter();
  const { toast } = useToast();
  const [mode, setMode]       = useState("signin"); // signin | signup
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]       = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});

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
    const { error } = mode === "signin"
      ? await signIn(email, password)
      : await signUp(email, password, name);
    setLoading(false);
    if (error) { toast(error.message, "error"); return; }
    if (mode === "signup") {
      toast("Account created — check your email to confirm", "success");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div style={{
      minHeight:"100vh", background:T.ink, display:"flex",
      alignItems:"center", justifyContent:"center",
      fontFamily:T.fontBody,
    }}>
      {/* Ambient orb */}
      <div style={{ position:"fixed", top:"-15%", right:"-10%", width:"55vw", height:"55vw", maxWidth:650, borderRadius:"50%", background:`radial-gradient(ellipse, rgba(200,169,110,.09), transparent 70%)`, pointerEvents:"none" }}/>

      <div style={{ width:420, background:T.mid, border:`1px solid ${T.border}`, padding:"3rem" }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:".6rem", marginBottom:"2.5rem" }}>
          <svg width="28" height="28" viewBox="0 0 56 56" fill="none">
            <rect x="1.5" y="1.5" width="53" height="53" rx="9" stroke={T.gold} strokeWidth="1.5"/>
            <path d="M16 28 L28 14 L40 28 L28 42 Z" fill={T.gold} opacity="0.9"/>
            <line x1="28" y1="12" x2="28" y2="44" stroke={T.electric} strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span style={{ fontFamily:T.fontDisplay, fontWeight:800, fontSize:"1.25rem", color:T.white }}>
            Fine<span style={{ color:T.gold }}>x</span>a
          </span>
        </div>

        <div style={{ fontFamily:T.fontMono, fontSize:".62rem", color:T.electric, letterSpacing:".2em", textTransform:"uppercase", marginBottom:".5rem" }}>
          — {mode === "signin" ? "Welcome back" : "Create account"}
        </div>
        <h1 style={{ fontFamily:T.fontDisplay, fontWeight:800, fontSize:"1.6rem", color:T.white, letterSpacing:"-.03em", marginBottom:"2rem" }}>
          {mode === "signin" ? "Sign in to Finexa" : "Get started free"}
        </h1>

        <div style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
          {mode === "signup" && (
            <Input label="Full Name" id="name" type="text" value={name} onChange={e => setName(e.target.value)} error={errors.name} placeholder="Ada Okonkwo"/>
          )}
          <Input label="Email" id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} error={errors.email} placeholder="you@company.ng"/>
          <Input label="Password" id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} error={errors.password} placeholder="••••••••"/>

          <Btn onClick={submit} disabled={loading} style={{ width:"100%", marginTop:".5rem" }}>
            {loading ? "Please wait…" : mode === "signin" ? "Sign In →" : "Create Account →"}
          </Btn>
        </div>

        <div style={{ marginTop:"1.5rem", textAlign:"center", fontFamily:T.fontMono, fontSize:".68rem", color:T.slate }}>
          {mode === "signin" ? "No account? " : "Already have one? "}
          <button onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setErrors({}); }}
            style={{ background:"none", border:"none", color:T.gold, cursor:"pointer", fontFamily:T.fontMono, fontSize:".68rem" }}>
            {mode === "signin" ? "Sign up free" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD PAGE ───────────────────────────────────────────────────────────
function DashboardPage() {
  const { supabase, profile } = useAuth();
  const [stats, setStats] = useState({ invoices:0, payroll:0, receipts:0, transactions:0 });

  useEffect(() => {
    async function load() {
      const [inv, pay, rec, txn] = await Promise.all([
        supabase.from("invoices").select("id", { count:"exact", head:true }),
        supabase.from("payroll_runs").select("id", { count:"exact", head:true }),
        supabase.from("receipts").select("id", { count:"exact", head:true }),
        supabase.from("transactions").select("id", { count:"exact", head:true }),
      ]);
      setStats({ invoices: inv.count||0, payroll: pay.count||0, receipts: rec.count||0, transactions: txn.count||0 });
    }
    load();
  }, [supabase]);

  return (
    <PageShell>
      <PageHeader
        title="Dashboard"
        sub={`${new Date().toLocaleDateString("en-NG", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}`}
      />

      <div style={{ display:"flex", gap:"1.25rem", flexWrap:"wrap", marginBottom:"3rem" }}>
        <StatCard label="Total Invoices"     value={stats.invoices}     delta={12}  accent={T.gold} />
        <StatCard label="Payroll Runs"       value={stats.payroll}      delta={0}                   />
        <StatCard label="Receipts Logged"    value={stats.receipts}     delta={8}   accent={T.electric} />
        <StatCard label="Transactions"       value={stats.transactions} delta={-3}                  />
      </div>

      {/* Recent activity placeholder */}
      <div style={{ background:T.mid, border:`1px solid ${T.border}`, padding:"2rem" }}>
        <div style={{ fontFamily:T.fontMono, fontSize:".65rem", color:T.slate, letterSpacing:".1em", textTransform:"uppercase", marginBottom:"1.5rem" }}>
          Recent Transactions
        </div>
        <RecentTransactions supabase={supabase} />
      </div>
    </PageShell>
  );
}

function RecentTransactions({ supabase }) {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    supabase.from("transactions").select("*").order("created_at", { ascending:false }).limit(8)
      .then(({ data }) => setRows(data || []));
  }, [supabase]);

  if (!rows.length) return (
    <div style={{ color:T.slate, fontFamily:T.fontMono, fontSize:".75rem", padding:"2rem 0", textAlign:"center" }}>
      No transactions yet — they'll appear here once recorded.
    </div>
  );

  return (
    <table style={{ width:"100%", borderCollapse:"collapse" }}>
      <thead>
        <tr>
          {["Reference","Type","Amount","Date"].map(h => (
            <th key={h} style={{ fontFamily:T.fontMono, fontSize:".6rem", color:T.slate, letterSpacing:".1em", textTransform:"uppercase", textAlign:"left", paddingBottom:".75rem", borderBottom:`1px solid ${T.border}` }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(r => (
          <tr key={r.id}>
            <td style={{ padding:".75rem 0", fontFamily:T.fontMono, fontSize:".75rem", color:T.white, borderBottom:`1px solid ${T.border}` }}>{r.reference || r.id.slice(0,8)}</td>
            <td style={{ padding:".75rem 0", fontFamily:T.fontMono, fontSize:".72rem", color:T.slate, borderBottom:`1px solid ${T.border}`, textTransform:"uppercase" }}>{r.type}</td>
            <td style={{ padding:".75rem 0", fontFamily:T.fontDisplay, fontWeight:700, color:T.gold, borderBottom:`1px solid ${T.border}` }}>
              ₦{Number(r.amount||0).toLocaleString("en-NG", { minimumFractionDigits:2 })}
            </td>
            <td style={{ padding:".75rem 0", fontFamily:T.fontMono, fontSize:".68rem", color:T.slate, borderBottom:`1px solid ${T.border}` }}>
              {new Date(r.created_at).toLocaleDateString("en-NG")}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── INVOICES PAGE ────────────────────────────────────────────────────────────
function InvoicesPage() {
  const { supabase } = useAuth();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("invoices").select("*").order("created_at", { ascending:false });
    setInvoices(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  // Realtime subscription
  useEffect(() => {
    const ch = supabase.channel("invoices-rt")
      .on("postgres_changes", { event:"*", schema:"public", table:"invoices" }, load)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [supabase, load]);

  const deleteInvoice = async (id) => {
    const { error } = await supabase.from("invoices").delete().eq("id", id);
    if (error) { toast(error.message, "error"); return; }
    toast("Invoice deleted", "success");
    load();
  };

  return (
    <PageShell>
      <PageHeader
        title="Invoices"
        sub="Create, send, and track your invoices"
        action={<Btn onClick={() => setShowForm(true)}>+ New Invoice</Btn>}
      />

      {loading ? (
        <Loader />
      ) : invoices.length === 0 ? (
        <EmptyState icon="◻" title="No invoices yet" sub="Create your first invoice to get started." />
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:0, border:`1px solid ${T.border}` }}>
          {invoices.map(inv => (
            <div key={inv.id} style={{
              display:"flex", alignItems:"center", gap:"1.5rem",
              padding:"1.25rem 1.5rem", borderBottom:`1px solid ${T.border}`,
              background:T.mid, transition:"background .15s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = T.gold10}
              onMouseLeave={e => e.currentTarget.style.background = T.mid}
            >
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:T.fontDisplay, fontWeight:700, color:T.white, fontSize:".95rem" }}>{inv.client_name}</div>
                <div style={{ fontFamily:T.fontMono, fontSize:".65rem", color:T.slate, marginTop:".2rem" }}>INV-{inv.id.slice(0,8).toUpperCase()} · Due {inv.due_date ? new Date(inv.due_date).toLocaleDateString("en-NG") : "—"}</div>
              </div>
              <div style={{ fontFamily:T.fontDisplay, fontWeight:800, color:T.gold, fontSize:"1.1rem" }}>
                ₦{Number(inv.total_ngn||0).toLocaleString("en-NG", { minimumFractionDigits:2 })}
              </div>
              <Badge status={inv.status || "draft"} />
              <Btn variant="danger" onClick={() => deleteInvoice(inv.id)} style={{ padding:".35rem .75rem", fontSize:".65rem" }}>Delete</Btn>
            </div>
          ))}
        </div>
      )}

      <InvoiceFormModal open={showForm} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); toast("Invoice created", "success"); }} supabase={supabase} />
    </PageShell>
  );
}

function InvoiceFormModal({ open, onClose, onSaved, supabase }) {
  const [client, setClient]   = useState("");
  const [due, setDue]         = useState("");
  const [amount, setAmount]   = useState("");
  const [notes, setNotes]     = useState("");
  const [saving, setSaving]   = useState(false);

  const save = async () => {
    if (!client || !amount) return;
    setSaving(true);
    const { error } = await supabase.from("invoices").insert({
      client_name: client, due_date: due || null,
      total_ngn: parseFloat(amount), status: "draft", notes,
    });
    setSaving(false);
    if (!error) onSaved();
  };

  return (
    <Modal open={open} onClose={onClose} title="New Invoice">
      <div style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
        <Input label="Client Name" value={client} onChange={e => setClient(e.target.value)} placeholder="Acme Corp Ltd"/>
        <Input label="Due Date" type="date" value={due} onChange={e => setDue(e.target.value)} />
        <Input label="Amount (₦)" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="250000"/>
        <div style={{ display:"flex", flexDirection:"column", gap:".4rem" }}>
          <label style={{ fontFamily:T.fontMono, fontSize:".62rem", color:T.slate, letterSpacing:".08em", textTransform:"uppercase" }}>Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Payment terms, bank details…" style={{
            background:"rgba(10,15,30,.6)", border:`1px solid ${T.border}`, color:T.white,
            fontFamily:T.fontBody, fontSize:".88rem", padding:".65rem .9rem", resize:"vertical", outline:"none",
          }}/>
        </div>
        <div style={{ display:"flex", gap:"1rem", justifyContent:"flex-end" }}>
          <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
          <Btn onClick={save} disabled={saving}>{saving ? "Saving…" : "Create Invoice"}</Btn>
        </div>
      </div>
    </Modal>
  );
}

// ─── PAYROLL PAGE ─────────────────────────────────────────────────────────────
function PayrollPage() {
  const { supabase } = useAuth();
  const { toast } = useToast();
  const [employees, setEmployees] = useState([]);
  const [runs, setRuns]           = useState([]);
  const [showEmpForm, setShowEmpForm] = useState(false);

  useEffect(() => {
    supabase.from("employees").select("*").then(({ data }) => setEmployees(data||[]));
    supabase.from("payroll_runs").select("*").order("created_at", { ascending:false }).then(({ data }) => setRuns(data||[]));
  }, [supabase]);

  const runPayroll = async () => {
    const total = employees.reduce((s, e) => s + Number(e.salary_ngn||0), 0);
    const { error } = await supabase.from("payroll_runs").insert({
      period_start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
      period_end:   new Date().toISOString().split("T")[0],
      status: "processed", total,
    });
    if (error) { toast(error.message, "error"); return; }
    toast(`Payroll run complete — ₦${total.toLocaleString()} processed`, "success");
    supabase.from("payroll_runs").select("*").order("created_at", { ascending:false }).then(({ data }) => setRuns(data||[]));
  };

  return (
    <PageShell>
      <PageHeader title="Payroll" sub="Manage employees and process payroll runs"
        action={<div style={{ display:"flex", gap:".75rem" }}>
          <Btn variant="secondary" onClick={() => setShowEmpForm(true)}>+ Employee</Btn>
          <Btn onClick={runPayroll} disabled={!employees.length}>Run Payroll</Btn>
        </div>}
      />

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"2rem" }}>
        {/* Employees */}
        <div>
          <div style={{ fontFamily:T.fontMono, fontSize:".62rem", color:T.slate, letterSpacing:".12em", textTransform:"uppercase", marginBottom:"1rem" }}>
            Employees ({employees.length})
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:".5rem" }}>
            {employees.length === 0 && <EmptyState icon="◈" title="No employees" sub="Add your first employee." compact />}
            {employees.map(e => (
              <div key={e.id} style={{ background:T.mid, border:`1px solid ${T.border}`, padding:"1rem 1.25rem", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ fontFamily:T.fontDisplay, fontWeight:600, color:T.white, fontSize:".9rem" }}>{e.full_name}</div>
                  <div style={{ fontFamily:T.fontMono, fontSize:".62rem", color:T.slate, marginTop:".15rem" }}>{e.role || "Staff"}</div>
                </div>
                <div style={{ fontFamily:T.fontMono, color:T.gold, fontSize:".85rem" }}>
                  ₦{Number(e.salary_ngn||0).toLocaleString()}/mo
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payroll runs */}
        <div>
          <div style={{ fontFamily:T.fontMono, fontSize:".62rem", color:T.slate, letterSpacing:".12em", textTransform:"uppercase", marginBottom:"1rem" }}>
            Payroll History
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:".5rem" }}>
            {runs.length === 0 && <EmptyState icon="◈" title="No runs yet" sub="Process your first payroll." compact />}
            {runs.map(r => (
              <div key={r.id} style={{ background:T.mid, border:`1px solid ${T.border}`, padding:"1rem 1.25rem", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ fontFamily:T.fontMono, fontSize:".7rem", color:T.white }}>{r.period_start} → {r.period_end}</div>
                  <div style={{ marginTop:".3rem" }}><Badge status={r.status || "processed"} /></div>
                </div>
                <div style={{ fontFamily:T.fontDisplay, fontWeight:700, color:T.electric }}>
                  ₦{Number(r.total||0).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <EmployeeFormModal open={showEmpForm} onClose={() => setShowEmpForm(false)}
        onSaved={emp => {
          setEmployees(e => [...e, emp]);
          setShowEmpForm(false);
          toast("Employee added", "success");
        }}
        supabase={supabase}
      />
    </PageShell>
  );
}

function EmployeeFormModal({ open, onClose, onSaved, supabase }) {
  const [name, setName]     = useState("");
  const [role, setRole]     = useState("");
  const [salary, setSalary] = useState("");
  const [bank, setBank]     = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name || !salary) return;
    setSaving(true);
    const { data, error } = await supabase.from("employees").insert({ full_name:name, role, salary_ngn:parseFloat(salary), bank_account:bank }).select().single();
    setSaving(false);
    if (!error) onSaved(data);
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Employee">
      <div style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
        <Input label="Full Name" value={name} onChange={e => setName(e.target.value)} placeholder="Ngozi Adeyemi"/>
        <Input label="Role / Title" value={role} onChange={e => setRole(e.target.value)} placeholder="Senior Engineer"/>
        <Input label="Monthly Salary (₦)" type="number" value={salary} onChange={e => setSalary(e.target.value)} placeholder="350000"/>
        <Input label="Bank Account Number" value={bank} onChange={e => setBank(e.target.value)} placeholder="0123456789"/>
        <div style={{ display:"flex", gap:"1rem", justifyContent:"flex-end" }}>
          <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
          <Btn onClick={save} disabled={saving}>{saving ? "Saving…" : "Add Employee"}</Btn>
        </div>
      </div>
    </Modal>
  );
}

// ─── RECEIPTS PAGE ────────────────────────────────────────────────────────────
function ReceiptsPage() {
  const { supabase } = useAuth();
  const { toast } = useToast();
  const [receipts, setReceipts] = useState([]);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.from("receipts").select("*").order("date", { ascending:false });
    setReceipts(data||[]);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const path = `receipts/${Date.now()}_${file.name}`;
    const { error: uploadErr } = await supabase.storage.from("receipts").upload(path, file);
    if (uploadErr) { toast(uploadErr.message, "error"); setUploading(false); return; }

    const { error } = await supabase.from("receipts").insert({ storage_path:path, merchant:"Uploaded", amount:0, date:new Date().toISOString().split("T")[0] });
    setUploading(false);
    if (error) { toast(error.message, "error"); return; }
    toast("Receipt uploaded", "success");
    load();
  };

  return (
    <PageShell>
      <PageHeader title="Receipts" sub="Upload and manage expense receipts"
        action={
          <label style={{
            background:T.gold, color:T.ink, fontFamily:T.fontDisplay, fontWeight:700,
            fontSize:".82rem", letterSpacing:".05em", padding:".75rem 1.5rem", cursor:"pointer",
          }}>
            {uploading ? "Uploading…" : "+ Upload Receipt"}
            <input type="file" accept="image/*,application/pdf" onChange={handleUpload} style={{ display:"none" }}/>
          </label>
        }
      />

      {receipts.length === 0 ? (
        <EmptyState icon="◉" title="No receipts" sub="Upload your first receipt above." />
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))", gap:"1rem" }}>
          {receipts.map(r => (
            <div key={r.id} style={{ background:T.mid, border:`1px solid ${T.border}`, padding:"1.5rem" }}>
              <div style={{ fontFamily:T.fontMono, fontSize:".62rem", color:T.slate, letterSpacing:".08em", textTransform:"uppercase", marginBottom:".5rem" }}>{r.date}</div>
              <div style={{ fontFamily:T.fontDisplay, fontWeight:700, color:T.white, fontSize:".95rem", marginBottom:".4rem" }}>{r.merchant}</div>
              <div style={{ fontFamily:T.fontDisplay, fontWeight:800, color:T.gold, fontSize:"1.2rem" }}>
                ₦{Number(r.amount||0).toLocaleString("en-NG", { minimumFractionDigits:2 })}
              </div>
              {r.storage_path && (
                <a href={supabase.storage.from("receipts").getPublicUrl(r.storage_path).data.publicUrl}
                  target="_blank" rel="noreferrer"
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

// ─── TELLER PAGE ─────────────────────────────────────────────────────────────
function TellerPage() {
  const { supabase } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount]   = useState("0.00");
  const [note, setNote]       = useState("");
  const [direction, setDir]   = useState("credit");
  const [entries, setEntries] = useState([]);

  const load = useCallback(async () => {
    const { data } = await supabase.from("teller_entries").select("*").order("created_at", { ascending:false }).limit(20);
    setEntries(data||[]);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  const keyPress = (k) => {
    setAmount(prev => {
      if (k === "C") return "0.00";
      if (k === "⌫") {
        const s = prev.replace(".","").slice(0,-1) || "0";
        const n = parseInt(s, 10) / 100;
        return n.toFixed(2);
      }
      const digits = prev.replace(".","") + k;
      const n = parseInt(digits, 10) / 100;
      return n.toFixed(2);
    });
  };

  const post = async () => {
    const val = parseFloat(amount);
    if (!val) { toast("Enter an amount", "error"); return; }
    const { error } = await supabase.from("teller_entries").insert({ amount:val, direction, note });
    if (error) { toast(error.message, "error"); return; }
    toast(`₦${val.toLocaleString()} ${direction} posted`, "success");
    setAmount("0.00"); setNote("");
    load();
  };

  const KEYS = ["1","2","3","4","5","6","7","8","9","C","0","⌫"];

  return (
    <PageShell>
      <PageHeader title="Teller Console" sub="Record cash-in and cash-out transactions" />

      <div style={{ display:"grid", gridTemplateColumns:"360px 1fr", gap:"2.5rem" }}>
        {/* Numpad */}
        <div style={{ background:T.mid, border:`1px solid ${T.border}`, padding:"2rem" }}>
          {/* Amount display */}
          <div style={{ background:"rgba(10,15,30,.6)", border:`1px solid ${T.border}`, padding:"1.25rem 1.5rem", marginBottom:"1.5rem", textAlign:"right" }}>
            <div style={{ fontFamily:T.fontMono, fontSize:".62rem", color:T.slate, letterSpacing:".1em", textTransform:"uppercase", marginBottom:".25rem" }}>Amount</div>
            <div style={{ fontFamily:T.fontDisplay, fontWeight:800, fontSize:"2.2rem", color:T.gold, letterSpacing:"-.03em" }}>
              ₦ {amount}
            </div>
          </div>

          {/* Direction toggle */}
          <div style={{ display:"flex", gap:".5rem", marginBottom:"1.5rem" }}>
            {["credit","debit"].map(d => (
              <button key={d} onClick={() => setDir(d)} style={{
                flex:1, padding:".6rem", fontFamily:T.fontMono, fontSize:".65rem",
                letterSpacing:".1em", textTransform:"uppercase", cursor:"pointer",
                background: direction === d ? (d === "credit" ? T.electric10 : T.red10) : "transparent",
                border:`1px solid ${direction === d ? (d === "credit" ? T.electric : T.red) : T.border}`,
                color: direction === d ? (d === "credit" ? T.electric : T.red) : T.slate,
                transition:"all .2s",
              }}>{d === "credit" ? "↑ Credit" : "↓ Debit"}</button>
            ))}
          </div>

          {/* Numpad grid */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:".5rem", marginBottom:"1rem" }}>
            {KEYS.map(k => (
              <button key={k} onClick={() => keyPress(k)} style={{
                padding:"1rem", fontFamily:T.fontMono, fontSize:"1rem", fontWeight:700,
                background:"rgba(10,15,30,.5)", border:`1px solid ${T.border}`,
                color: k === "C" ? T.red : k === "⌫" ? T.gold : T.white,
                cursor:"pointer", transition:"all .15s",
              }}
                onMouseEnter={e => e.currentTarget.style.background = T.gold10}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(10,15,30,.5)"}
              >{k}</button>
            ))}
          </div>

          <Input label="Note (optional)" value={note} onChange={e => setNote(e.target.value)} placeholder="Payment reference…" style={{ marginBottom:"1rem" }} />

          <Btn onClick={post} style={{ width:"100%" }}>Post Entry →</Btn>
        </div>

        {/* Entry log */}
        <div>
          <div style={{ fontFamily:T.fontMono, fontSize:".62rem", color:T.slate, letterSpacing:".12em", textTransform:"uppercase", marginBottom:"1rem" }}>
            Today's Entries
          </div>
          {entries.length === 0 ? (
            <EmptyState icon="⬡" title="No entries yet" sub="Post your first teller entry." compact />
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:".5rem" }}>
              {entries.map(e => (
                <div key={e.id} style={{ background:T.mid, border:`1px solid ${T.border}`, padding:"1rem 1.25rem", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <div style={{ fontFamily:T.fontMono, fontSize:".7rem", color:T.slate, marginBottom:".25rem" }}>
                      {new Date(e.created_at).toLocaleTimeString("en-NG")}
                    </div>
                    <div style={{ fontSize:".82rem", color:T.white }}>{e.note || "—"}</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontFamily:T.fontDisplay, fontWeight:700, fontSize:"1rem", color: e.direction === "credit" ? T.electric : T.red }}>
                      {e.direction === "credit" ? "+" : "-"}₦{Number(e.amount).toLocaleString("en-NG", { minimumFractionDigits:2 })}
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

// ─── SETTINGS PAGE ────────────────────────────────────────────────────────────
function SettingsPage() {
  const { supabase, profile } = useAuth();
  const { toast } = useToast();
  const [name, setName]     = useState(profile?.full_name || "");
  const [orgName, setOrgName] = useState(profile?.organizations?.name || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await supabase.from("profiles").update({ full_name: name }).eq("id", profile?.id);
    if (profile?.organizations?.id) {
      await supabase.from("organizations").update({ name: orgName }).eq("id", profile.organizations.id);
    }
    setSaving(false);
    toast("Settings saved", "success");
  };

  return (
    <PageShell>
      <PageHeader title="Settings" sub="Manage your account and organization" />
      <div style={{ maxWidth:480, display:"flex", flexDirection:"column", gap:"1.5rem" }}>
        <div style={{ background:T.mid, border:`1px solid ${T.border}`, padding:"2rem` }}>
          <div style={{ fontFamily:T.fontMono, fontSize:".62rem", color:T.electric, letterSpacing:".15em", textTransform:"uppercase", marginBottom:"1.5rem" }}>Profile</div>
          <div style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
            <Input label="Full Name" value={name} onChange={e => setName(e.target.value)} />
            <Input label="Email" value={profile?.email || ""} disabled style={{ opacity:.5 }} />
          </div>
        </div>
        <div style={{ background:T.mid, border:`1px solid ${T.border}`, padding:"2rem" }}>
          <div style={{ fontFamily:T.fontMono, fontSize:".62rem", color:T.electric, letterSpacing:".15em", textTransform:"uppercase", marginBottom:"1.5rem" }}>Organization</div>
          <Input label="Organization Name" value={orgName} onChange={e => setOrgName(e.target.value)} />
        </div>
        <Btn onClick={save} disabled={saving}>{saving ? "Saving…" : "Save Changes"}</Btn>
      </div>
    </PageShell>
  );
}

// ─── Utility components ───────────────────────────────────────────────────────
function Loader() {
  return (
    <div style={{ display:"flex", justifyContent:"center", padding:"4rem", color:T.gold, fontFamily:T.fontMono, fontSize:".75rem", letterSpacing:".1em" }}>
      LOADING…
    </div>
  );
}

function EmptyState({ icon, title, sub, compact }) {
  return (
    <div style={{ textAlign:"center", padding: compact ? "2rem" : "5rem 2rem" }}>
      <div style={{ fontSize: compact ? "2rem" : "3rem", marginBottom:"1rem", color:T.gold25 }}>{icon}</div>
      <div style={{ fontFamily:T.fontDisplay, fontWeight:700, color:T.white, fontSize: compact ? ".9rem" : "1.2rem", marginBottom:".5rem" }}>{title}</div>
      <div style={{ fontFamily:T.fontBody, fontSize:".82rem", color:T.slate }}>{sub}</div>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastProvider>
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&family=Space+Mono:wght@400;700&display=swap');
            *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
            body { background: #0A0F1E; color: #F5F4F0; font-family: 'DM Sans', sans-serif; }
            @keyframes slideIn { from { opacity:0; transform:translateX(10px); } to { opacity:1; transform:none; } }
            ::-webkit-scrollbar { width: 4px; } 
            ::-webkit-scrollbar-track { background: #0A0F1E; }
            ::-webkit-scrollbar-thumb { background: rgba(200,169,110,.3); }
          `}</style>
          <AppRoutes />
        </ToastProvider>
      </Router>
    </AuthProvider>
  );
}

function AppRoutes() {
  const { session }   = useAuth();
  const { path, navigate } = useRouter();

  // Loading state
  if (session === undefined) {
    return (
      <div style={{ minHeight:"100vh", background:T.ink, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ fontFamily:T.fontDisplay, fontWeight:800, fontSize:"2rem", color:T.gold, letterSpacing:"-.03em" }}>
          Fine<span style={{ color:T.electric }}>x</span>a
        </div>
      </div>
    );
  }

  // Auth guard
  const protectedPaths = ["/dashboard","/invoices","/payroll","/receipts","/teller","/settings"];
  if (!session && protectedPaths.some(p => path.startsWith(p))) {
    return <LoginPage />;
  }
  if (session && path === "/") {
    navigate("/dashboard");
    return null;
  }

  // Route table
  if (path === "/" || path === "/login")       return <LoginPage />;
  if (path.startsWith("/dashboard"))           return <DashboardPage />;
  if (path.startsWith("/invoices"))            return <InvoicesPage />;
  if (path.startsWith("/payroll"))             return <PayrollPage />;
  if (path.startsWith("/receipts"))            return <ReceiptsPage />;
  if (path.startsWith("/teller"))              return <TellerPage />;
  if (path.startsWith("/settings"))            return <SettingsPage />;

  return (
    <div style={{ minHeight:"100vh", background:T.ink, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
      <div style={{ fontFamily:T.fontDisplay, fontWeight:800, fontSize:"6rem", color:T.gold25 }}>404</div>
      <div style={{ color:T.slate, fontFamily:T.fontMono, fontSize:".8rem", marginTop:"1rem" }}>Page not found</div>
      <Btn onClick={() => navigate("/dashboard")} style={{ marginTop:"2rem" }}>← Back to Dashboard</Btn>
    </div>
  );
}
