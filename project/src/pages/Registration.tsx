import { useState } from "react";
import {
  User, Mail, Phone, MapPin, Lock,
  Building2, GraduationCap, BookOpen,
  ArrowRight, ChevronDown,
} from "lucide-react";
import { toast } from "react-toastify";
import api from '../utils/api';

// ── Theme tokens ──────────────────────────────────────────────────
const NAVY = "#203f78";
const BLUE = "#2c5a9e";
const LIGHT = "#f4f7fb";
const WHITE = "#ffffff";
const BORDER = "rgba(32,63,120,.18)";
const MUTED = "rgba(32,63,120,.55)";
const FONT = "'Inter', sans-serif";

// ── Types ─────────────────────────────────────────────────────────
type RoleType = "student" | "professional" | null;
type Step = 1 | 2 | 3;

// ── Data ──────────────────────────────────────────────────────────
const streamOptions = [
  "Mechanical Engineering", "Computer Science", "Electrical Engineering",
  "Electronics Engineering", "IIoT / Industrial IoT", "Instrumentation Engineering",
  "Automation & Robotics", "Civil Engineering", "Chemical Engineering",
  "Information Technology", "Mechatronics", "Other",
];
const yearOptions = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"];
const passingYears = Array.from({ length: 8 }, (_, i) => `${2024 + i}`);
const interestOptions = [
  { value: "startup", label: "Startup", icon: "🚀" },
  { value: "jobs", label: "Jobs", icon: "💼" },
  { value: "not_sure", label: "Exploring Career Paths", icon: "🌱" },
];

// ── TextInput ─────────────────────────────────────────────────────
function TextInput({ label, icon: Icon, style: extraStyle, required, ...props }: any) {
  const [focused, setFocused] = useState(false);
  const [readOnly, setReadOnly] = useState(true);
  return (
    <div style={extraStyle}>
      <label style={{
        fontFamily: FONT, fontSize: 13, fontWeight: 500,
        color: focused ? NAVY : "#374151",
        display: "block", marginBottom: 6, transition: "color .2s",
      }}>
        {label}{required && <span style={{ color: "#e53e3e", marginLeft: 2 }}>*</span>}
      </label>
      <div style={{ position: "relative" }}>
        <Icon size={15} style={{
          position: "absolute", left: 12, top: "50%",
          transform: "translateY(-50%)",
          color: focused ? NAVY : "#6b7280",
          transition: "color 0.2s", pointerEvents: "none",
        }} />
        <input
          {...props}
          autoComplete={props.autoComplete ?? "new-password"}
          readOnly={readOnly}
          onFocus={() => { setFocused(true); setReadOnly(false); }}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%", padding: "10px 12px 10px 36px",
            fontSize: 14, fontFamily: FONT,
            color: "#111827", fontWeight: 500,
            background: WHITE,
            border: focused ? `1.5px solid ${NAVY}` : `1px solid #d1d5db`,
            borderRadius: 8, outline: "none", transition: "all 0.2s",
            boxSizing: "border-box" as const,
            boxShadow: focused ? `0 0 0 3px rgba(32,63,120,.08)` : "none",
          }}
        />
      </div>
    </div>
  );
}

// ── SelectInput ───────────────────────────────────────────────────
function SelectInput({ label, icon: Icon, options, value, onChange, placeholder, required }: any) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <label style={{
        display: "block", fontSize: 13, fontWeight: 500, fontFamily: FONT,
        color: open ? NAVY : "#374151", marginBottom: 6, transition: "color .2s",
      }}>
        {label}{required && <span style={{ color: "#e53e3e", marginLeft: 2 }}>*</span>}
      </label>
      <div onClick={() => setOpen(!open)} style={{
        display: "flex", alignItems: "center", gap: 8, padding: "10px 12px",
        background: WHITE,
        border: `${open ? "1.5px" : "1px"} solid ${open ? NAVY : "#d1d5db"}`,
        borderRadius: 8, cursor: "pointer", transition: "all 0.2s",
        boxShadow: open ? `0 0 0 3px rgba(32,63,120,.08)` : "none",
      }}>
        <Icon size={15} style={{ color: NAVY, flexShrink: 0 }} />
        <span style={{
          flex: 1, fontSize: 14, fontFamily: FONT,
          color: value ? "#111827" : "#9ca3af", fontWeight: value ? 500 : 400,
        }}>{value || placeholder}</span>
        <ChevronDown size={14} style={{
          color: "#6b7280",
          transform: open ? "rotate(180deg)" : "none",
          transition: "0.2s",
        }} />
      </div>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          zIndex: 1000, background: WHITE, border: "1px solid #d1d5db",
          borderRadius: 8, boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
          overflow: "hidden", maxHeight: 170, overflowY: "auto" as const,
        }}>
          {options.map((opt: string) => (
            <div key={opt} onClick={() => { onChange(opt); setOpen(false); }}
              style={{
                padding: "10px 14px", fontSize: 14, cursor: "pointer", fontFamily: FONT,
                color: value === opt ? NAVY : "#1f2937",
                background: value === opt ? `rgba(32,63,120,.06)` : "transparent",
                fontWeight: value === opt ? 600 : 400, transition: "background 0.15s",
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = `rgba(32,63,120,.06)`)}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = value === opt ? `rgba(32,63,120,.06)` : "transparent")}
            >{opt}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── StepBar ───────────────────────────────────────────────────────
const STEP_LABELS = ["Identity", "Role", "Details"];

function StepBar({ current }: { current: Step }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 28 }}>
      {STEP_LABELS.map((lbl, i) => {
        const idx = i + 1;
        const done = current > idx;
        const active = current === idx;
        return (
          <div key={lbl} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: active ? 26 : 20, height: active ? 26 : 20,
                borderRadius: "50%",
                border: done || active ? `2px solid ${NAVY}` : `1.5px solid #d1d5db`,
                background: done ? NAVY : active ? `rgba(32,63,120,.1)` : WHITE,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: FONT, fontSize: 10, fontWeight: 700,
                color: done ? WHITE : active ? NAVY : "#9ca3af",
                transition: "all .3s", flexShrink: 0,
                boxShadow: active ? `0 0 0 4px rgba(32,63,120,.1)` : "none",
              }}>
                {done ? "✓" : idx}
              </div>
              <span style={{
                fontFamily: FONT, fontSize: 12, fontWeight: 600, letterSpacing: 0.5,
                textTransform: "uppercase" as const,
                color: done || active ? NAVY : "#9ca3af",
                transition: "color .3s",
              }}>{lbl}</span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div style={{
                width: 32, height: 1.5, margin: "0 12px",
                background: current > idx
                  ? `linear-gradient(90deg,${NAVY},${BLUE})`
                  : "#e5e7eb",
                borderRadius: 2, transition: "background .4s",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Section divider ───────────────────────────────────────────────
function SectionDivider({ children }: { children: string }) {
  return (
    <div style={{
      fontFamily: FONT, fontSize: 11, letterSpacing: 2,
      color: MUTED, textTransform: "uppercase" as const, fontWeight: 600,
      display: "flex", alignItems: "center", gap: 8, marginBottom: 14,
    }}>
      {children}
      <span style={{ flex: 1, height: 1, background: BORDER }} />
    </div>
  );
}

// ── Role card ─────────────────────────────────────────────────────
function RoleCard({ active, onClick, icon, title, desc }: any) {
  return (
    <button type="button" onClick={onClick} style={{
      background: active ? `rgba(32,63,120,.06)` : WHITE,
      border: active ? `1.5px solid ${NAVY}` : `1px solid #d1d5db`,
      padding: "18px 20px", cursor: "pointer", textAlign: "left" as const,
      transition: "all .25s", position: "relative" as const,
      borderRadius: 12, width: "100%",
      boxShadow: active ? `0 0 0 4px rgba(32,63,120,.08)` : "none",
      fontFamily: FONT,
    }}>
      {active && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg,${NAVY},${BLUE})`,
          borderRadius: "12px 12px 0 0",
        }} />
      )}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <span style={{ fontSize: 26, flexShrink: 0, marginTop: 1 }}>{icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: FONT, fontWeight: 700, fontSize: 15,
            color: active ? NAVY : "#111827", marginBottom: 5, transition: "color .25s",
          }}>{title}</div>
          <div style={{ fontFamily: FONT, fontSize: 13, lineHeight: 1.55, color: "#6b7280" }}>{desc}</div>
        </div>
        {active && (
          <span style={{
            fontFamily: FONT, fontSize: 11, fontWeight: 600, color: NAVY, flexShrink: 0,
            background: `rgba(32,63,120,.08)`, padding: "3px 8px", borderRadius: 6,
          }}>Selected ✓</span>
        )}
      </div>
    </button>
  );
}

// ── Main ──────────────────────────────────────────────────────────
export default function SLMRegistration() {
  const [step, setStep] = useState<Step>(1);
  const [role, setRole] = useState<RoleType>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    firstName: "", lastName: "", mobile: "", city: "", password: "", confirmPassword: "",
    // student
    email: "", year: "", passingYear: "", stream: "", streamOther: "", interest: "",
    // professional
    company: "", personalEmail: "", companyEmail: "",
  });

  const set = (k: string) => (e: any) =>
    setForm(p => ({ ...p, [k]: e.target ? e.target.value : e }));

  // ── Validation ────────────────────────────────────────────────
  const validateStep1 = () => {
    if (!form.firstName || !form.lastName || !form.mobile || !form.city) {
      setError("Please fill in all required fields."); return false;
    }
    if (!form.password || form.password.length < 8) {
      setError("Password must be at least 8 characters."); return false;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match."); return false;
    }
    return true;
  };
  const validateStep2 = () => {
    if (!role) { setError("Please select your role."); return false; }
    return true;
  };
  const validateStep3 = () => {
    if (role === "student") {
      if (!form.email || !form.year || !form.passingYear || !form.stream || !form.interest) {
        setError("Please fill in all required fields."); return false;
      }
      if (form.stream === "Other" && !form.streamOther) {
        setError("Please specify your stream."); return false;
      }
    } else {
      if (!form.company || !form.personalEmail || !form.interest) {
        setError("Please fill in all required fields."); return false;
      }
    }
    return true;
  };

  const next = () => {
    setError("");
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(s => (s + 1) as Step);
  };
  const back = () => { setError(""); setStep(s => (s - 1) as Step); };

  // ── Submit ────────────────────────────────────────────────────
  const handleRegister = async () => {
    setError("");
    if (!validateStep3()) return;
    try {
      setLoading(true);
      let payload: any;
      if (role === "student") {
        payload = {
          email: form.email, password: form.password, role: "student",
          phone: form.mobile, first_name: form.firstName, last_name: form.lastName,
          current_year: form.year, passing_year: form.passingYear,
          stream: form.stream === "Other" ? form.streamOther : form.stream,
          interest: form.interest, city: form.city,
        };
      } else {
        payload = {
          email: form.personalEmail, password: form.password, role: "professional",
          phone: form.mobile, first_name: form.firstName, last_name: form.lastName,
          company: form.company, city: form.city,
          interest: form.interest,
          company_email: form.companyEmail || null,
        };
      }
      await api.post("/accounts/register/", payload);
      setForm({
        firstName: "", lastName: "", mobile: "", city: "", password: "", confirmPassword: "",
        email: "", year: "", passingYear: "", stream: "", streamOther: "", interest: "",
        company: "", personalEmail: "", companyEmail: "",
      });
      setRole(null);
      setStep(1);
      setShowSuccess(true);
    } catch (error: any) {
      if (error.response?.data) {
        const data = error.response.data;
        const msg = typeof data === "object"
          ? Object.values(data).flat().join(" ")
          : "Registration failed.";
        setError(msg);
        Object.keys(error.response.data).forEach(k =>
          toast.error(`${k}: ${error.response.data[k]}`)
        );
      } else {
        setError("Server error. Please try again.");
        toast.error("Server error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Password strength ─────────────────────────────────────────
  const pwLen = form.password.length;
  const pwStrengthColor = pwLen < 8 ? "#ef4444" : pwLen < 12 ? "#f59e0b" : NAVY;
  const pwStrengthLabel = pwLen < 8 ? "Weak" : pwLen < 12 ? "Good" : "Strong";
  const pwStrengthWidth = `${Math.min(100, (pwLen / 16) * 100)}%`;
  const pwStrengthBg = pwLen < 8 ? "#ef4444" : pwLen < 12 ? "#f59e0b"
    : `linear-gradient(90deg,${NAVY},${BLUE})`;

  return (
    <div style={{
      background: LIGHT, color: "#111827", minHeight: "100vh",
      fontFamily: FONT, display: "flex", overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', sans-serif; }
        ::-webkit-scrollbar { width: 4px }
        ::-webkit-scrollbar-track { background: #f4f7fb }
        ::-webkit-scrollbar-thumb { background: rgba(32,63,120,.3); border-radius: 3px }
        input::placeholder { color: #9ca3af; font-size: 13px; }

        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes popIn  { from{opacity:0;transform:scale(0.93)} to{opacity:1;transform:scale(1)} }
        @keyframes circleGrow { from{stroke-dashoffset:220;opacity:0} to{stroke-dashoffset:0;opacity:1} }
        @keyframes tickDraw   { from{stroke-dashoffset:60} to{stroke-dashoffset:0} }
        @keyframes scaleIn    { 0%{transform:scale(0.6);opacity:0} 60%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }

        .fade-step { animation: fadeUp .3s ease both; }

        .btn-primary {
          font-family:'Inter',sans-serif; font-size:14px; font-weight:600;
          padding:11px 28px; letter-spacing:0.3px;
          background:linear-gradient(135deg,#203f78,#2c5a9e);
          color:#fff; border:none; cursor:pointer; border-radius:8px;
          transition:box-shadow .2s, transform .15s;
          display:inline-flex; align-items:center; gap:6px;
          box-shadow:0 4px 20px rgba(32,63,120,.28);
        }
        .btn-primary:hover   { box-shadow:0 6px 28px rgba(32,63,120,.38); transform:translateY(-1px); }
        .btn-primary:active  { transform:scale(0.98); }
        .btn-primary:disabled{ opacity:.6; cursor:not-allowed; transform:none; box-shadow:none; }

        .btn-ghost {
          font-family:'Inter',sans-serif; font-size:14px; font-weight:500;
          padding:10px 20px; background:transparent;
          color:#6b7280; border:1px solid #d1d5db; cursor:pointer; border-radius:8px;
          transition:border-color .2s, color .2s;
        }
        .btn-ghost:hover { border-color:${NAVY}; color:${NAVY}; }

        .pill {
          display:flex; align-items:center; gap:5px; padding:8px 16px; border-radius:8px;
          border:1px solid #d1d5db; background:white; font-size:13px; color:#6b7280;
          cursor:pointer; transition:all 0.2s; user-select:none; font-weight:500;
          font-family:'Inter',sans-serif;
        }
        .pill:hover { border-color:${NAVY}; color:${NAVY}; background:rgba(32,63,120,.04); }
        .pill-active {
          background:rgba(32,63,120,.08); border:1.5px solid ${NAVY}; color:${NAVY};
          box-shadow:0 0 0 3px rgba(32,63,120,.08); font-weight:600;
        }

        .stream-other {
          margin-top:8px; width:100%; padding:10px 12px;
          font-size:14px; color:#111827; font-weight:500; font-family:'Inter',sans-serif;
          background:#fff; border:1.5px solid ${NAVY}; border-radius:8px; outline:none;
          box-shadow:0 0 0 3px rgba(32,63,120,.08); box-sizing:border-box;
        }

        .success-overlay {
          position:fixed; inset:0; background:rgba(0,0,0,0.4);
          display:flex; align-items:center; justify-content:center;
          z-index:9999; backdrop-filter:blur(3px);
        }
        .success-modal {
          background:white; padding:28px 28px 22px; border-radius:14px;
          max-width:400px; width:90%; text-align:center;
          box-shadow:0 20px 50px rgba(0,0,0,0.18);
          animation:popIn 0.28s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        .tick-wrap   { animation:scaleIn 0.45s cubic-bezier(0.34,1.56,0.64,1) both; }
        .tick-circle { fill:none;stroke:#22c55e;stroke-width:5;stroke-dasharray:220;stroke-dashoffset:220;stroke-linecap:round;animation:circleGrow 0.5s ease 0.1s forwards; }
        .tick-check  { fill:none;stroke:#22c55e;stroke-width:5.5;stroke-dasharray:60;stroke-dashoffset:60;stroke-linecap:round;stroke-linejoin:round;animation:tickDraw 0.35s ease 0.55s forwards; }
        .tick-bg     { fill:#f0fdf4;animation:scaleIn 0.4s ease 0s both; }

        @media (max-width:900px) { .left-panel { display:none !important; } }
        @media (max-width:600px) {
          .right-panel { padding:20px 16px !important; }
          .card-body   { padding:24px 20px !important; }
          .form-grid   { grid-template-columns:1fr !important; }
          .form-grid > * { grid-column:1 !important; }
        }
      `}</style>

      {/* ══ LEFT PANEL ══════════════════════════════════════════ */}
      <div className="left-panel" style={{
        flex: "0 0 42%", position: "relative", display: "flex",
        flexDirection: "column", justifyContent: "space-between",
        padding: "36px 44px", borderRight: `1px solid ${BORDER}`,
        background: WHITE, overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(rgba(32,63,120,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(32,63,120,.04) 1px,transparent 1px)`, backgroundSize: "48px 48px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "38%", left: "28%", width: 340, height: 340, background: `radial-gradient(circle,rgba(32,63,120,.07) 0%,transparent 65%)`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "8%", right: "8%", width: 220, height: 220, background: `radial-gradient(circle,rgba(44,90,158,.06) 0%,transparent 65%)`, pointerEvents: "none" }} />

        {/* Logo */}
        <div style={{ position: "relative" }}>
          <a href="/" style={{ fontFamily: FONT, fontWeight: 800, fontSize: 20, color: NAVY, letterSpacing: 1, textDecoration: "none" }}>
            Technoviz<span style={{ color: BLUE }}>SLM</span>
          </a>
        </div>

        {/* Center */}
        <div style={{ position: "relative" }}>
          <div style={{ fontFamily: FONT, fontSize: 11, letterSpacing: 3, color: MUTED, textTransform: "uppercase", marginBottom: 14, fontWeight: 500 }}>
            // Industrial Learning Platform
          </div>
          <h1 style={{ fontFamily: FONT, fontWeight: 800, fontSize: "clamp(26px,3vw,38px)", lineHeight: 1.15, marginBottom: 14, color: NAVY }}>
            Build Skills in{" "}
            <span style={{ background: `linear-gradient(90deg,${NAVY},${BLUE})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Smart Manufacturing
            </span>
          </h1>
          <p style={{ fontFamily: FONT, fontSize: 14, color: "#6b7280", lineHeight: 1.75, maxWidth: 300, marginBottom: 32 }}>
            Hands-on curriculum for the next generation of industrial automation engineers. Start free — no experience required.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            {[
              { icon: "⚙️", text: "PLC, IIoT & automation learning paths" },
              { icon: "🏆", text: "Industry-recognized certificates" },
              { icon: "🌐", text: "Access from any device, anywhere" },
              { icon: "🚀", text: "Career labs & startup tracks" },
            ].map(item => (
              <div key={item.text} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 17 }}>{item.icon}</span>
                <span style={{ fontFamily: FONT, fontSize: 14, color: "#4b5563" }}>{item.text}</span>
              </div>
            ))}
          </div>

        </div>

        {/* Bottom */}
        <div style={{ position: "relative", fontFamily: FONT, fontSize: 14, color: "#9ca3af" }}>
          Already have an account?{" "}
          <a href="/login" style={{ color: NAVY, textDecoration: "none", fontWeight: 600 }}>Sign in →</a>
        </div>
      </div>

      {/* ══ RIGHT PANEL ═════════════════════════════════════════ */}
      <div className="right-panel" style={{
        flex: 1, display: "flex", flexDirection: "column",
        overflow: "hidden", background: LIGHT,
      }}>
        <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "36px 48px 28px" }}>

            <StepBar current={step} />

            {/* Card */}
            <div style={{
              flex: 1, background: WHITE,
              border: `1px solid rgba(32,63,120,.14)`,
              borderRadius: 16,
              boxShadow: "0 8px 40px rgba(32,63,120,.10)",
              position: "relative", display: "flex", flexDirection: "column",
              overflow: "hidden",
            }}>
              <div style={{ height: 3, background: `linear-gradient(90deg,${NAVY},${BLUE})`, borderRadius: "16px 16px 0 0", flexShrink: 0 }} />

              <div className="card-body" style={{
                flex: 1, padding: "32px 36px",
                display: "flex", flexDirection: "column",
                overflowY: "auto",
              }}>

                {/* ── STEP 1 — Identity ── */}
                {step === 1 && (
                  <div className="fade-step" style={{ flex: 1, display: "flex", flexDirection: "column", gap: 0 }}>
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontFamily: FONT, fontSize: 11, letterSpacing: 2, color: MUTED, textTransform: "uppercase" as const, fontWeight: 600, marginBottom: 4 }}>Step 01</div>
                      <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 18, color: NAVY }}>Personal Info</div>
                    </div>

                    <SectionDivider>Basic Details</SectionDivider>
                    <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                      <TextInput label="First Name" required icon={User} type="text" placeholder="John" value={form.firstName} onChange={set("firstName")} />
                      <TextInput label="Last Name" required icon={User} type="text" placeholder="Doe" value={form.lastName} onChange={set("lastName")} />
                      <TextInput label="Mobile" required icon={Phone} type="tel" placeholder="+91 98765 43210" value={form.mobile} onChange={set("mobile")} />
                      <TextInput label="City" required icon={MapPin} type="text" placeholder="Your city" value={form.city} onChange={set("city")} />
                    </div>

                    <SectionDivider>Security</SectionDivider>
                    <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                      <TextInput label="Password" required icon={Lock} type="password" autoComplete="new-password" placeholder="Min 8 characters" value={form.password} onChange={set("password")} />
                      <TextInput label="Confirm Password" required icon={Lock} type="password" autoComplete="new-password" placeholder="Re-enter password" value={form.confirmPassword} onChange={set("confirmPassword")} />
                    </div>

                    {form.password && (
                      <div style={{ marginBottom: 20 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                          <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5 }}>Password Strength</span>
                          <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: pwStrengthColor }}>{pwStrengthLabel}</span>
                        </div>
                        <div style={{ height: 4, background: "#e5e7eb", borderRadius: 4 }}>
                          <div style={{ height: "100%", borderRadius: 4, background: pwStrengthBg, width: pwStrengthWidth, transition: "width .4s, background .4s" }} />
                        </div>
                      </div>
                    )}

                    <div style={{ flex: 1 }} />
                    {error && <ErrorBox>{error}</ErrorBox>}
                    <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 8 }}>
                      <button className="btn-primary" onClick={next}>Continue →</button>
                    </div>
                  </div>
                )}

                {/* ── STEP 2 — Role ── */}
                {step === 2 && (
                  <div className="fade-step" style={{ flex: 1, display: "flex", flexDirection: "column", gap: 0 }}>
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontFamily: FONT, fontSize: 11, letterSpacing: 2, color: MUTED, textTransform: "uppercase" as const, fontWeight: 600, marginBottom: 4 }}>Step 02</div>
                      <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 18, color: NAVY }}>Choose Your Path</div>
                    </div>
                    <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6, fontFamily: FONT, marginBottom: 16 }}>
                      Select your role to personalize your learning journey.
                    </p>

                    <SectionDivider>I am a…</SectionDivider>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                      <RoleCard
                        active={role === "student"}
                        onClick={() => setRole(role === "student" ? null : "student")}
                        icon="🎓" title="Student"
                        desc="Enrolled in a degree program. Access guided curriculum & certifications."
                      />
                      <RoleCard
                        active={role === "professional"}
                        onClick={() => setRole(role === "professional" ? null : "professional")}
                        icon="💼" title="Professional"
                        desc="In the workforce. Upskill in PLC, IIoT & smart manufacturing systems."
                      />
                    </div>

                    <div style={{ flex: 1 }} />
                    {error && <ErrorBox>{error}</ErrorBox>}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8 }}>
                      <button className="btn-ghost" onClick={back}>← Back</button>
                      <button className="btn-primary" onClick={next}>Continue →</button>
                    </div>
                  </div>
                )}

                {/* ── STEP 3 — Student Details ── */}
                {step === 3 && role === "student" && (
                  <div className="fade-step" style={{ flex: 1, display: "flex", flexDirection: "column", gap: 0 }}>
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontFamily: FONT, fontSize: 11, letterSpacing: 2, color: MUTED, textTransform: "uppercase" as const, fontWeight: 600, marginBottom: 4 }}>Step 03</div>
                      <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 18, color: NAVY }}>Student Details</div>
                    </div>

                    <SectionDivider>Academic Info</SectionDivider>
                    <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                      <TextInput label="Email" required icon={Mail} type="email" placeholder="you@college.edu"
                        value={form.email} onChange={set("email")} style={{ gridColumn: "1 / -1" }}
                      />
                      <SelectInput label="Current Year" required icon={GraduationCap} options={yearOptions}
                        value={form.year} onChange={(v: string) => setForm(p => ({ ...p, year: v }))} placeholder="Select year"
                      />
                      <SelectInput label="Passing Year" required icon={BookOpen} options={passingYears}
                        value={form.passingYear} onChange={(v: string) => setForm(p => ({ ...p, passingYear: v }))} placeholder="Select year"
                      />
                      <div style={{ gridColumn: "1 / -1" }}>
                        <SelectInput label="Stream" required icon={BookOpen} options={streamOptions}
                          value={form.stream} onChange={(v: string) => setForm(p => ({ ...p, stream: v, streamOther: "" }))} placeholder="Your stream"
                        />
                        {form.stream === "Other" && (
                          <input className="stream-other" type="text"
                            placeholder="Please specify your stream…"
                            value={form.streamOther} onChange={set("streamOther")}
                          />
                        )}
                      </div>
                    </div>

                    <SectionDivider>Career Goal</SectionDivider>
                    <label style={{ display: "block", fontFamily: FONT, fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 8 }}>
                      What are you looking for?<span style={{ color: "#e53e3e", marginLeft: 2 }}>*</span>
                    </label>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
                      {interestOptions.map(opt => (
                        <button key={opt.value} type="button"
                          className={`pill ${form.interest === opt.value ? "pill-active" : ""}`}
                          onClick={() => setForm(p => ({ ...p, interest: opt.value }))}
                        >{opt.icon} {opt.label}</button>
                      ))}
                    </div>

                    <div style={{ flex: 1 }} />
                    {error && <ErrorBox>{error}</ErrorBox>}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8 }}>
                      <button className="btn-ghost" onClick={back}>← Back</button>
                      <button className="btn-primary" onClick={handleRegister} disabled={loading}>
                        {loading
                          ? <><span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,.35)", borderTop: "2px solid #fff", animation: "spin 1s linear infinite", display: "inline-block" }} /> Creating…</>
                          : <><span>Create Account</span><ArrowRight size={14} /></>}
                      </button>
                    </div>
                  </div>
                )}

                {/* ── STEP 3 — Professional Details ── */}
                {step === 3 && role === "professional" && (
                  <div className="fade-step" style={{ flex: 1, display: "flex", flexDirection: "column", gap: 0 }}>
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontFamily: FONT, fontSize: 11, letterSpacing: 2, color: MUTED, textTransform: "uppercase" as const, fontWeight: 600, marginBottom: 4 }}>Step 03</div>
                      <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 18, color: NAVY }}>Work Info</div>
                    </div>

                    <SectionDivider>Company Details</SectionDivider>
                    <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                      <TextInput label="Company" required icon={Building2} type="text" placeholder="Acme Corp"
                        value={form.company} onChange={set("company")} style={{ gridColumn: "1 / -1" }}
                      />
                      <TextInput label="Personal Email" required icon={Mail} type="email" placeholder="you@gmail.com" value={form.personalEmail} onChange={set("personalEmail")} />
                      <TextInput label="Professional Email" icon={Mail} type="email" placeholder="you@company.com (optional)" value={form.companyEmail} onChange={set("companyEmail")} />
                    </div>

                    <SectionDivider>Career Goal</SectionDivider>
                    <label style={{ display: "block", fontFamily: FONT, fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 8 }}>
                      What are you looking for?<span style={{ color: "#e53e3e", marginLeft: 2 }}>*</span>
                    </label>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
                      {interestOptions.map(opt => (
                        <button key={opt.value} type="button"
                          className={`pill ${form.interest === opt.value ? "pill-active" : ""}`}
                          onClick={() => setForm(p => ({ ...p, interest: opt.value }))}
                        >{opt.icon} {opt.label}</button>
                      ))}
                    </div>

                    <div style={{ flex: 1 }} />
                    {error && <ErrorBox>{error}</ErrorBox>}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8 }}>
                      <button className="btn-ghost" onClick={back}>← Back</button>
                      <button className="btn-primary" onClick={handleRegister} disabled={loading}>
                        {loading
                          ? <><span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,.35)", borderTop: "2px solid #fff", animation: "spin 1s linear infinite", display: "inline-block" }} /> Creating…</>
                          : <><span>Create Account</span><ArrowRight size={14} /></>}
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Success Modal ── */}
      {showSuccess && (
        <div className="success-overlay" onClick={() => setShowSuccess(false)}>
          <div className="success-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
              <svg width="80" height="80" viewBox="0 0 80 80">
                <g className="tick-wrap">
                  <circle className="tick-bg" cx="40" cy="40" r="36" />
                  <circle className="tick-circle" cx="40" cy="40" r="34" />
                  <polyline className="tick-check" points="24,41 35,52 56,30" />
                </g>
              </svg>
            </div>
            <h2 style={{ color: NAVY, marginBottom: 8, fontSize: 17, fontWeight: 700, fontFamily: FONT }}>Successfully Registered!</h2>
            <p style={{ fontSize: 13, color: "#475569", marginBottom: 12, lineHeight: 1.6, fontFamily: FONT }}>
              Your account will be activated within <strong>24 hours</strong>.
            </p>
            <div style={{ background: `rgba(32,63,120,.06)`, borderRadius: 8, padding: "10px 14px", marginBottom: 16, border: `1px solid ${BORDER}` }}>
              <p style={{ fontSize: 12, color: "#64748b", marginBottom: 4, fontFamily: FONT }}>For support contact:</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: NAVY, fontFamily: FONT }}>📞 +91 9999765380</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: NAVY, fontFamily: FONT }}>✉ support@technovizautomation.com</p>
            </div>
            <button
              onClick={() => setShowSuccess(false)}
              style={{
                padding: "9px 24px",
                background: `linear-gradient(135deg,${NAVY},${BLUE})`,
                color: WHITE, border: "none", borderRadius: 7, cursor: "pointer",
                fontWeight: 600, fontSize: 13, fontFamily: FONT,
                boxShadow: "0 4px 20px rgba(32,63,120,.28)",
              }}
            >Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Error box helper ──────────────────────────────────────────────
function ErrorBox({ children }: { children: string }) {
  return (
    <div style={{
      padding: "10px 14px", marginBottom: 8,
      border: "1px solid rgba(239,68,68,.3)", background: "rgba(239,68,68,.05)",
      borderRadius: 8, fontFamily: FONT, fontSize: 13, color: "#b91c1c", lineHeight: 1.6,
    }}>
      ⚠ {children}
    </div>
  );
}