import { useState } from "react";
import {
  User, Mail, Phone, MapPin, Lock,
  Building2, GraduationCap, Briefcase,
  ArrowRight, ChevronDown, BookOpen,
} from "lucide-react";
import { toast } from "react-toastify";
import api from '../utils/api';

const streamOptions = [
  "Mechanical Engineering",
  "Computer Science",
  "Electrical Engineering",
  "Electronics Engineering",
  "IIoT / Industrial IoT",
  "Instrumentation Engineering",
  "Automation & Robotics",
  "Civil Engineering",
  "Chemical Engineering",
  "Information Technology",
  "Mechatronics",
  "Other",
];
const yearOptions = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"];
const passingYears = Array.from({ length: 8 }, (_, i) => `${2024 + i}`);
const interestOptions = [
  { value: "startup", label: "Startup", icon: "🚀" },
  { value: "jobs", label: "Jobs", icon: "💼" },
  { value: "not_sure", label: "Not Sure", icon: "🔭" },
];

const COLOR = "#203f78";

// ── TextInput ─────────────────────────────────────────────────────────────────
function TextInput({ label, icon: Icon, style: extraStyle, ...props }: any) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={extraStyle}>
      <label style={{
        display: "block", fontSize: 11, fontWeight: 700,
        textTransform: "uppercase" as const, color: "#374151",  // ← darker label
        marginBottom: 5, letterSpacing: "0.05em"
      }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <Icon size={15} style={{
          position: "absolute", left: 12, top: "50%",
          transform: "translateY(-50%)",
          color: focused ? COLOR : "#6b7280",  // ← darker icon
          transition: "color 0.2s", pointerEvents: "none"
        }} />
        <input
          {...props}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%", padding: "10px 12px 10px 36px",
            fontSize: 14,
            color: "#111827",               // ← much darker input text
            fontWeight: 500,
            background: focused ? "#fff" : "#f3f6fb",  // ← slightly more contrast bg
            border: `1.5px solid ${focused ? COLOR : "#c8d3e8"}`,  // ← more visible border
            borderRadius: 8, outline: "none", transition: "all 0.2s",
            boxSizing: "border-box" as const,
            boxShadow: focused ? `0 0 0 3px ${COLOR}1a` : "none"
          }}
        />
      </div>
    </div>
  );
}

// ── SelectInput ───────────────────────────────────────────────────────────────
function SelectInput({ label, icon: Icon, options, value, onChange, placeholder }: any) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <label style={{
        display: "block", fontSize: 11, fontWeight: 700,
        textTransform: "uppercase" as const, color: "#374151",  // ← darker label
        marginBottom: 5, letterSpacing: "0.05em"
      }}>{label}</label>
      <div onClick={() => setOpen(!open)} style={{
        display: "flex", alignItems: "center", gap: 8, padding: "10px 12px",
        background: open ? "#fff" : "#f3f6fb",  // ← matches TextInput
        border: `1.5px solid ${open ? COLOR : "#c8d3e8"}`,  // ← more visible border
        borderRadius: 8, cursor: "pointer", transition: "all 0.2s",
        boxShadow: open ? `0 0 0 3px ${COLOR}1a` : "none"
      }}>
        <Icon size={15} style={{ color: COLOR, flexShrink: 0 }} />
        <span style={{
          flex: 1, fontSize: 14,
          color: value ? "#111827" : "#6b7280",  // ← much darker when value selected
          fontWeight: value ? 500 : 400
        }}>{value || placeholder}</span>
        <ChevronDown size={14} style={{ color: "#6b7280", transform: open ? "rotate(180deg)" : "none", transition: "0.2s" }} />
      </div>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          zIndex: 1000, background: "white", border: "1.5px solid #c8d3e8",
          borderRadius: 8, boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
          overflow: "hidden", maxHeight: 170, overflowY: "auto" as const
        }}>
          {options.map((opt: string) => (
            <div key={opt} onClick={() => { onChange(opt); setOpen(false); }}
              style={{
                padding: "10px 14px", fontSize: 14, cursor: "pointer",
                color: value === opt ? COLOR : "#1f2937",  // ← darker option text
                background: value === opt ? `${COLOR}11` : "transparent",
                fontWeight: value === opt ? 600 : 400, transition: "background 0.15s"
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = `${COLOR}11`)}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = value === opt ? `${COLOR}11` : "transparent")}
            >{opt}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Section label ─────────────────────────────────────────────────────────────
function SecTitle({ children }: { children: string }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
      textTransform: "uppercase" as const, color: "#9ba8bb",
      display: "flex", alignItems: "center", gap: 6, margin: "18px 0 10px"
    }}>
      {children}
      <span style={{ flex: 1, height: 1, background: "#e8edf5", display: "block" }} />
    </div>
  );
}

// ── Radio Role Card ───────────────────────────────────────────────────────────
function RoleCard({ active, onClick, title }: any) {
  return (
    <div
      onClick={onClick}
      style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        padding: "11px 14px", borderRadius: 10, cursor: "pointer",
        border: `2px solid ${active ? COLOR : "#dde4ef"}`,
        background: active ? `${COLOR}08` : "white",
        transition: "all 0.22s",
        boxShadow: active ? `0 0 0 3px ${COLOR}18, 0 2px 8px ${COLOR}14` : "0 1px 3px rgba(0,0,0,0.04)",
        userSelect: "none" as const,
      }}
    >
      {/* Radio dot */}
      <div style={{
        width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
        border: `2px solid ${active ? COLOR : "#b0bdd4"}`,
        background: "white",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.2s",
        boxShadow: active ? `0 0 0 2px ${COLOR}22` : "none",
      }}>
        {active && (
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: COLOR,
            animation: "radioPop 0.18s cubic-bezier(0.34,1.56,0.64,1) both",
          }} />
        )}
      </div>

      {/* Label */}
      <span style={{
        fontSize: 14, fontWeight: 700,
        color: active ? COLOR : "#1f2937",
        transition: "color 0.2s",
      }}>{title}</span>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Registration() {
  type PageType = "student" | "professional" | null;
  const [role, setRole] = useState<PageType>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [form, setForm] = useState({
    firstName: "", lastName: "", mobile: "", city: "", password: "",
    email: "", year: "", passingYear: "", stream: "", streamOther: "", interest: "",
    company: "", personalEmail: "", companyEmail: "",
  });

  const set = (k: string) => (e: any) => setForm(p => ({ ...p, [k]: e.target ? e.target.value : e }));

  const handleRegister = async () => {
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
      setForm({ firstName: "", lastName: "", mobile: "", city: "", password: "", email: "", year: "", passingYear: "", stream: "", streamOther: "", interest: "", company: "", personalEmail: "", companyEmail: "" });
      setShowSuccess(true);
    } catch (error: any) {
      if (error.response?.data) {
        Object.keys(error.response.data).forEach(k => toast.error(`${k}: ${error.response.data[k]}`));
      } else {
        toast.error("Server error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; }

        @keyframes radioPop {
          from { transform: scale(0); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }

        .scene {
          min-height: 100vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 32px 16px;
          background: linear-gradient(145deg, #e8edf5 0%, #f1f5f9 50%, #e8edf5 100%);
          position: relative; overflow: hidden;
        }
        .scene::before {
          content: ''; position: fixed;
          width: 500px; height: 500px; top: -150px; right: -150px;
          background: radial-gradient(circle, rgba(32,63,120,0.14) 0%, transparent 60%);
          pointer-events: none; z-index: 0;
        }
        .side-glow-left, .side-glow-right {
          position: fixed; top: 0; bottom: 0; width: 200px; pointer-events: none; z-index: 0;
        }
        .side-glow-left  { left: 0;  background: linear-gradient(to right, rgba(32,63,120,0.10) 0%, transparent 100%); }
        .side-glow-right { right: 0; background: linear-gradient(to left,  rgba(32,63,120,0.10) 0%, transparent 100%); }

        @keyframes floatUp { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        .bg-chip {
          position: fixed; display: flex; align-items: center; gap: 5px;
          padding: 6px 12px; border-radius: 20px;
          border: 1.5px solid rgba(32,63,120,0.35);
          background: rgba(255,255,255,0.72); backdrop-filter: blur(6px);
          font-size: 11px; font-weight: 700; letter-spacing: 0.04em;
          color: rgba(32,63,120,0.8); pointer-events: none; z-index: 1;
          user-select: none; box-shadow: 0 2px 10px rgba(32,63,120,0.12);
          animation: floatUp var(--dur,6s) ease-in-out infinite;
          animation-delay: var(--delay,0s);
        }

        .reg-card {
          position: relative; z-index: 5;
          width: 100%; max-width: 860px;
          background: white; border-radius: 16px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05), 0 16px 48px rgba(32,63,120,0.14);
          overflow: hidden; display: flex;
        }

        .panel-left {
          width: 44%;
          padding: 36px 32px 32px;
          border-right: 1px solid #e8edf5;
          display: flex; flex-direction: column;
          background: white;
          flex-shrink: 0;
        }

        .panel-right {
          flex: 1;
          padding: 36px 32px 32px;
          background: #fafbfd;
          display: flex; flex-direction: column;
          min-height: 520px;
          position: relative;
          overflow: hidden;
        }
        .panel-right:has(.idle-panel) {
          padding: 0;
        }

        .panel-title { font-size: 20px; font-weight: 700; color: #0f172a; letter-spacing: -0.02em; margin-bottom: 4px; }
        .panel-sub   { font-size: 13px; color: #7e8fa8; margin-bottom: 4px; }

        .fg { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .fg-full { grid-column: 1 / -1; }

        /* ── Role selector (replaces old toggle) ── */
        .role-wrap {
          display: flex; flex-direction: column; gap: 8px;
          margin-top: 4px;
        }
        .role-card-hover:hover {
          border-color: #203f78 !important;
          background: rgba(32,63,120,0.04) !important;
        }

        .sbtn {
          width: 100%; padding: 13px; border: none; border-radius: 8px;
          font-size: 14px; font-weight: 600; color: white; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: all 0.25s; margin-top: auto; padding-top: 13px;
          background: #203f78; box-shadow: 0 4px 12px rgba(32,63,120,0.3);
        }
        .sbtn:hover  { transform: translateY(-2px); filter: brightness(1.1); }
        .sbtn:active { transform: scale(0.98); }
        .sbtn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .signin { text-align: center; font-size: 13px; color: #7e8fa8; margin-top: 10px; }
        .signin a { color: #203f78; font-weight: 600; text-decoration: none; }
        .signin a:hover { text-decoration: underline; }

        @keyframes slideIn { from { opacity: 0; transform: translateX(10px); } to { opacity: 1; transform: translateX(0); } }
        .slide-in { animation: slideIn 0.28s ease both; }

        /* Pills */
        .pills { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 4px; }
        .pill {
          display: flex; align-items: center; gap: 5px;
          padding: 7px 16px; border-radius: 50px;
          border: 1.5px solid #dde4ef; background: #f3f6fb;
          font-size: 13px; color: #374151; cursor: pointer;
          transition: all 0.2s; user-select: none; font-weight: 500;
        }
        .pill:hover { transform: translateY(-1px); border-color: #203f78; color: #203f78; background: #eff6ff; }
        .pill-active { background: #203f78; border-color: #203f78; color: white; box-shadow: 0 2px 6px rgba(32,63,120,0.3); }

        .stream-other {
          margin-top: 8px; width: 100%; padding: 10px 12px;
          font-size: 14px; color: #111827; font-weight: 500;
          background: #fff;
          border: 1.5px solid #203f78; border-radius: 8px; outline: none;
          box-shadow: 0 0 0 3px rgba(32,63,120,0.12); box-sizing: border-box;
        }

        .role-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 12px; border-radius: 20px; font-size: 12px;
          font-weight: 700; letter-spacing: 0.04em;
          background: #eff6ff; color: #203f78;
          border: 1px solid rgba(32,63,120,0.18);
          margin-bottom: 16px; align-self: flex-start;
        }

        .r-sec {
          font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
          text-transform: uppercase; color: #9ba8bb;
          display: flex; align-items: center; gap: 6px; margin: 14px 0 10px;
        }
        .r-sec::after { content: ''; flex: 1; height: 1px; background: #e8edf5; }

        /* ── Idle panel ── */
        .idle-panel {
          position: relative; display: flex; flex-direction: column;
          width: 100%; height: 100%; overflow: hidden;
        }

        .idle-half {
          flex: 1; position: relative;
          display: flex; flex-direction: column;
          justify-content: center; padding: 0 28px;
          overflow: hidden;
        }
        .idle-half-student {
          background: linear-gradient(135deg, #1a3366 0%, #203f78 60%, #2a52a0 100%);
        }
        .idle-half-pro {
          background: linear-gradient(135deg, #f8faff 0%, #eef3fc 100%);
        }

        .idle-curve { position: absolute; left: 0; right: 0; height: 28px; z-index: 10; pointer-events: none; }
        .idle-curve-top { bottom: -1px; }
        .idle-curve-bottom { top: -1px; }

        .idle-blob {
          position: absolute; border-radius: 50%;
          filter: blur(40px); pointer-events: none; opacity: 0.35;
        }

        .idle-role-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 12px; border-radius: 20px; font-size: 11px;
          font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
          margin-bottom: 8px; align-self: flex-start;
        }
        .idle-role-badge-student { background: rgba(255,255,255,0.15); color: rgba(255,255,255,0.9); border: 1px solid rgba(255,255,255,0.2); }
        .idle-role-badge-pro     { background: rgba(32,63,120,0.1);    color: #203f78;               border: 1px solid rgba(32,63,120,0.2); }

        .idle-title { font-size: 17px; font-weight: 800; line-height: 1.2; margin-bottom: 4px; letter-spacing: -0.02em; }
        .idle-title-student { color: #ffffff; }
        .idle-title-pro     { color: #0f172a; }

        .idle-desc { font-size: 11.5px; line-height: 1.5; margin-bottom: 10px; }
        .idle-desc-student { color: rgba(255,255,255,0.7); }
        .idle-desc-pro     { color: #64748b; }

        .idle-features { display: flex; flex-direction: column; gap: 5px; }
        .idle-feat { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 500; }
        .idle-feat-student { color: rgba(255,255,255,0.85); }
        .idle-feat-pro     { color: #374151; }
        .idle-feat-dot-student { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.5); flex-shrink: 0; }
        .idle-feat-dot-pro     { width: 6px; height: 6px; border-radius: 50%; background: #203f78; flex-shrink: 0; opacity: 0.5; }
        .idle-feat-emoji { font-size: 14px; flex-shrink: 0; }

        @keyframes idleFadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .idle-fade-1 { animation: idleFadeUp 0.4s ease 0.05s both; }
        .idle-fade-2 { animation: idleFadeUp 0.4s ease 0.15s both; }
        .idle-fade-3 { animation: idleFadeUp 0.4s ease 0.25s both; }
        .idle-fade-4 { animation: idleFadeUp 0.4s ease 0.35s both; }
        .idle-fade-5 { animation: idleFadeUp 0.4s ease 0.1s  both; }
        .idle-fade-6 { animation: idleFadeUp 0.4s ease 0.2s  both; }
        .idle-fade-7 { animation: idleFadeUp 0.4s ease 0.3s  both; }
        .idle-fade-8 { animation: idleFadeUp 0.4s ease 0.4s  both; }

        /* Success overlay */
        .success-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.4);
          display: flex; align-items: center; justify-content: center;
          z-index: 9999; backdrop-filter: blur(3px);
        }
        @keyframes popIn { from { opacity:0; transform:scale(0.93); } to { opacity:1; transform:scale(1); } }
        .success-modal {
          background: white; padding: 28px 28px 22px; border-radius: 14px;
          max-width: 400px; width: 90%; text-align: center;
          box-shadow: 0 20px 50px rgba(0,0,0,0.18);
          animation: popIn 0.28s cubic-bezier(0.34,1.56,0.64,1) both;
        }

        .mobile-submit-wrap { display: none; }

        @media (max-width: 768px) {
          .reg-card { max-width: 98vw; }
          .panel-left  { width: 46%; padding: 28px 22px 24px; }
          .panel-right { padding: 28px 22px 24px; }
          .fg { grid-template-columns: 1fr; }
          .fg-full { grid-column: 1; }
        }

        @media (max-width: 580px) {
          .reg-card { flex-direction: column; max-width: 100%; }
          .panel-left  { width: 100%; border-right: none; border-bottom: 1px solid #e8edf5; padding: 22px 16px 18px; }
          .panel-right { min-height: unset; padding: 18px 16px 22px; }
          .bg-chip { display: none; }
          .side-glow-left, .side-glow-right { display: none; }
          .fg { grid-template-columns: 1fr 1fr; gap: 12px; }
          .sbtn-desktop { display: none; }
          .signin-desktop { display: none; }
          .mobile-submit-wrap {
            display: block;
            padding: 0 16px 24px;
            background: white;
            border-radius: 0 0 16px 16px;
          }
        }
        @media (max-width: 380px) {
          .fg { grid-template-columns: 1fr; }
          .fg-full { grid-column: 1; }
        }
      `}</style>

      <div className="scene">
        <div className="side-glow-left" />
        <div className="side-glow-right" />

        {/* Floating chips LEFT */}
        {[
          { label: "⚙️ PLC", top: "12%", left: "3%", dur: "7s", delay: "0s" },
          { label: "🔌 IIoT", top: "28%", left: "1.5%", dur: "9s", delay: "1.2s" },
          { label: "📡 SCADA", top: "45%", left: "4%", dur: "6s", delay: "2.1s" },
          { label: "🏭 Industry 4.0", top: "61%", left: "2%", dur: "8s", delay: "0.5s" },
          { label: "🤖 Automation", top: "76%", left: "3.5%", dur: "7.5s", delay: "3s" },
          { label: "🔧 HMI", top: "88%", left: "1%", dur: "6.5s", delay: "1.8s" },
        ].map((c, i) => (
          <div key={i} className="bg-chip" style={{ top: c.top, left: c.left, "--dur": c.dur, "--delay": c.delay } as any}>{c.label}</div>
        ))}

        {/* Floating chips RIGHT */}
        {[
          { label: "📊 MQTT", top: "10%", right: "2%", dur: "8s", delay: "0.8s" },
          { label: "🌐 OPC-UA", top: "25%", right: "1%", dur: "6s", delay: "2s" },
          { label: "💡 Smart MFG", top: "41%", right: "3%", dur: "9s", delay: "0.3s" },
          { label: "🔁 SLM", top: "57%", right: "1.5%", dur: "7s", delay: "1.5s" },
          { label: "📈 Data Flow", top: "71%", right: "4%", dur: "8.5s", delay: "2.5s" },
          { label: "🛠️ DCS", top: "85%", right: "2.5%", dur: "6.5s", delay: "0.7s" },
        ].map((c, i) => (
          <div key={i} className="bg-chip" style={{ top: c.top, right: c.right, "--dur": c.dur, "--delay": c.delay } as any}>{c.label}</div>
        ))}

        <div className="reg-card">

          {/* ══════════ LEFT PANEL ══════════ */}
          <div className="panel-left">
            <div className="panel-title">Create an Account</div>
            <div className="panel-sub">Build real skills, your way</div>

            <SecTitle>Personal Info</SecTitle>
            <div className="fg">
              <TextInput label="First Name *" icon={User} type="text" placeholder="John" value={form.firstName} onChange={set("firstName")} />
              <TextInput label="Last Name *" icon={User} type="text" placeholder="Doe" value={form.lastName} onChange={set("lastName")} />
              <TextInput label="Mobile *" icon={Phone} type="tel" placeholder="+91 98765 43210" value={form.mobile} onChange={set("mobile")} />
              <TextInput label="City *" icon={MapPin} type="text" placeholder="Your city" value={form.city} onChange={set("city")} />
              <TextInput label="Password *" icon={Lock} type="password" placeholder="Enter password" value={form.password} onChange={set("password")} style={{ gridColumn: "1 / -1" }} />
            </div>

            <SecTitle>I am a…</SecTitle>

            {/* ── Radio-style role cards — one row ── */}
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <RoleCard
                active={role === "student"}
                onClick={() => setRole(role === "student" ? null : "student")}
                title="Participant"
              />
              <RoleCard
                active={role === "professional"}
                onClick={() => setRole(role === "professional" ? null : "professional")}
                title="Professional"
              />
            </div>

            <div style={{ flex: 1, minHeight: 16 }} />

            <button className="sbtn sbtn-desktop" onClick={handleRegister} disabled={loading}>
              {loading ? "Creating Account…" : <><span>Create Account</span><ArrowRight size={14} /></>}
            </button>
            <div className="signin signin-desktop">Already registered? <a href="/login">Sign in</a></div>
          </div>

          {/* ══════════ RIGHT PANEL ══════════ */}
          <div className="panel-right">

            {/* ── Idle ── */}
            {!role && (
              <div className="idle-panel slide-in">
                <div className="idle-half idle-half-student" style={{ position: "relative" }}>
                  <div className="idle-blob" style={{ width: 180, height: 180, background: "#4a6fbb", top: -40, right: -40 }} />
                  <div className="idle-blob" style={{ width: 100, height: 100, background: "#6b8fd4", bottom: 20, left: 20 }} />
                  <div style={{ position: "relative", zIndex: 2, padding: "32px 28px 44px" }}>
                    <div className="idle-role-badge idle-role-badge-student idle-fade-1"><GraduationCap size={11} /> Students</div>
                    <div className="idle-title idle-title-student idle-fade-2">Learn Smart<br />Manufacturing Skills</div>
                    <p className="idle-desc idle-desc-student idle-fade-3">Build practical skills in PLC, IIoT, and automation with hands-on SLM learning.</p>
                    <div className="idle-features idle-fade-4">
                      {[["⚙️", "PLC & Automation"], ["🧪", "Hands-On Practice"], ["📘", "Self-Paced SLM"], ["🏅", "Industry Certificate"]].map(([ic, t]) => (
                        <div key={t} className="idle-feat idle-feat-student">
                          <span className="idle-feat-dot-student" /><span className="idle-feat-emoji">{ic}</span><span>{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <svg className="idle-curve idle-curve-top" viewBox="0 0 400 28" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style={{ height: 28, display: "block", width: "100%" }}>
                    <path d="M0,10 L30,20 L55,8 L80,22 L105,10 L130,24 L155,6 L178,18 L200,4 L222,18 L248,6 L272,22 L298,10 L322,24 L348,8 L372,20 L400,10 L400,28 L0,28 Z" fill="#eef3fc" />
                  </svg>
                </div>
                <div className="idle-half idle-half-pro" style={{ position: "relative" }}>
                  <div className="idle-blob" style={{ width: 160, height: 160, background: "rgba(32,63,120,0.15)", bottom: -30, right: -30 }} />
                  <div style={{ position: "relative", zIndex: 2, padding: "18px 28px 32px" }}>
                    <div className="idle-role-badge idle-role-badge-pro idle-fade-5"><Briefcase size={11} /> Professionals</div>
                    <div className="idle-title idle-title-pro idle-fade-6">Upgrade to<br />Industry 4.0</div>
                    <p className="idle-desc idle-desc-pro idle-fade-7">Gain practical experience in PLC, IIoT, and smart manufacturing systems.</p>
                    <div className="idle-features idle-fade-8">
                      {[["🏭", "Industry 4.0 Skills"], ["🔗", "PLC to Cloud"], ["📊", "Real Use Cases"], ["🚀", "Career Growth"]].map(([ic, t]) => (
                        <div key={t} className="idle-feat idle-feat-pro">
                          <span className="idle-feat-dot-pro" /><span className="idle-feat-emoji">{ic}</span><span>{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Student fields ── */}
            {role === "student" && (
              <div className="slide-in" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <div className="role-badge"><GraduationCap size={11} /> Student Details</div>
                <div className="r-sec">Academic Info</div>
                <div className="fg">
                  <TextInput label="Email *" icon={Mail} type="email" placeholder="john@example.com"
                    value={form.email} onChange={set("email")} style={{ gridColumn: "1 / -1" }}
                  />
                  <SelectInput label="Current Year *" icon={GraduationCap} options={yearOptions}
                    value={form.year} onChange={(v: string) => setForm(p => ({ ...p, year: v }))} placeholder="Select year"
                  />
                  <SelectInput label="Passing Year *" icon={BookOpen} options={passingYears}
                    value={form.passingYear} onChange={(v: string) => setForm(p => ({ ...p, passingYear: v }))} placeholder="Select year"
                  />
                  <div style={{ gridColumn: "1 / -1" }}>
                    <SelectInput label="Stream *" icon={BookOpen} options={streamOptions}
                      value={form.stream} onChange={(v: string) => setForm(p => ({ ...p, stream: v, streamOther: "" }))} placeholder="Your stream"
                    />
                    {form.stream === "Other" && (
                      <input className="stream-other" type="text"
                        placeholder="Please specify your stream…" value={form.streamOther} onChange={set("streamOther")}
                      />
                    )}
                  </div>
                </div>
                <div className="r-sec" style={{ marginTop: 14 }}>Your Goal</div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, textTransform: "uppercase" as const, color: "#374151", marginBottom: 8 }}>
                  What are you looking for? *
                </label>
                <div className="pills">
                  {interestOptions.map(opt => (
                    <button key={opt.value} type="button"
                      className={`pill ${form.interest === opt.value ? "pill-active" : ""}`}
                      onClick={() => setForm(p => ({ ...p, interest: opt.value }))}
                    >{opt.icon} {opt.label}</button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Professional fields ── */}
            {role === "professional" && (
              <div className="slide-in" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <div className="role-badge"><Briefcase size={11} /> Professional Details</div>
                <div className="r-sec">Work Info</div>
                <div className="fg">
                  <TextInput label="Company *" icon={Building2} type="text" placeholder="Acme Corp"
                    value={form.company} onChange={set("company")} style={{ gridColumn: "1 / -1" }}
                  />
                  <TextInput label="Personal Email *" icon={Mail} type="email" placeholder="you@gmail.com" value={form.personalEmail} onChange={set("personalEmail")} />
                  <TextInput label="Professional Email" icon={Mail} type="email" placeholder="you@company.com" value={form.companyEmail} onChange={set("companyEmail")} />
                </div>
                <div className="r-sec" style={{ marginTop: 14 }}>Your Goal</div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, textTransform: "uppercase" as const, color: "#374151", marginBottom: 8 }}>
                  What are you looking for? *
                </label>
                <div className="pills">
                  {interestOptions.map(opt => (
                    <button key={opt.value} type="button"
                      className={`pill ${form.interest === opt.value ? "pill-active" : ""}`}
                      onClick={() => setForm(p => ({ ...p, interest: opt.value }))}
                    >{opt.icon} {opt.label}</button>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Mobile-only submit */}
          <div className="mobile-submit-wrap">
            <button className="sbtn" onClick={handleRegister} disabled={loading}>
              {loading ? "Creating Account…" : <><span>Create Account</span><ArrowRight size={14} /></>}
            </button>
            <div className="signin">Already registered? <a href="/login">Sign in</a></div>
          </div>

        </div>
      </div>

      {/* ── Success Modal ── */}
      {showSuccess && (
        <div className="success-overlay" onClick={() => setShowSuccess(false)}>
          <div className="success-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
              <svg width="80" height="80" viewBox="0 0 80 80">
                <style>{`
                  @keyframes circleGrow { from{stroke-dashoffset:220;opacity:0} to{stroke-dashoffset:0;opacity:1} }
                  @keyframes tickDraw   { from{stroke-dashoffset:60}            to{stroke-dashoffset:0} }
                  @keyframes scaleIn    { 0%{transform:scale(0.6);opacity:0} 60%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }
                  .tick-wrap   { animation: scaleIn 0.45s cubic-bezier(0.34,1.56,0.64,1) both; }
                  .tick-circle { fill:none;stroke:#22c55e;stroke-width:5;stroke-dasharray:220;stroke-dashoffset:220;stroke-linecap:round;animation:circleGrow 0.5s ease 0.1s forwards; }
                  .tick-check  { fill:none;stroke:#22c55e;stroke-width:5.5;stroke-dasharray:60;stroke-dashoffset:60;stroke-linecap:round;stroke-linejoin:round;animation:tickDraw 0.35s ease 0.55s forwards; }
                  .tick-bg     { fill:#f0fdf4;animation:scaleIn 0.4s ease 0s both; }
                `}</style>
                <g className="tick-wrap">
                  <circle className="tick-bg" cx="40" cy="40" r="36" />
                  <circle className="tick-circle" cx="40" cy="40" r="34" />
                  <polyline className="tick-check" points="24,41 35,52 56,30" />
                </g>
              </svg>
            </div>
            <h2 style={{ color: "#203f78", marginBottom: 8, fontSize: 17, fontWeight: 700 }}>Successfully Registered!</h2>
            <p style={{ fontSize: 13, color: "#475569", marginBottom: 12, lineHeight: 1.6 }}>
              Your account will be activated within <strong>24 hours</strong>.
            </p>
            <div style={{ background: "#eff6ff", borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
              <p style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>For support contact:</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#203f78" }}>📞 +91 9999765380</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#203f78" }}>✉ support@technovizautomation.com</p>
            </div>
            <button
              onClick={() => setShowSuccess(false)}
              style={{ padding: "8px 22px", background: "#203f78", color: "white", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 600, fontSize: 12, boxShadow: "0 3px 10px rgba(32,63,120,0.3)" }}
            >Close</button>
          </div>
        </div>
      )}
    </>
  );
}