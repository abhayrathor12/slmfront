
import { useState } from "react";
import api from '../utils/api';
type Role = "student" | "professional" | null;
type Step = 1 | 2 | 3;

interface BaseForm {
    first_name: string; last_name: string; phone: string; city: string;
    password: string; confirm_password: string; role: Role;
}
interface StudentForm { email: string; current_year: string; passing_year: string; stream: string; interest: string; }
interface ProfessionalForm { company: string; personal_email: string; company_email: string; interest: string; }

function Field({ label, type = "text", placeholder, value, onChange, required = false }: {
    label: string; type?: string; placeholder?: string; value: string;
    onChange: (v: string) => void; required?: boolean;
}) {
    const [focused, setFocused] = useState(false);
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, letterSpacing: 2, textTransform: "uppercase", color: focused ? "#00e0ff" : "rgba(228,238,248,.38)", transition: "color .2s" }}>
                {label}{required && <span style={{ color: "#7c4dff", marginLeft: 2 }}>*</span>}
            </label>
            <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
                onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                style={{ background: focused ? "rgba(0,224,255,.05)" : "rgba(255,255,255,.03)", border: focused ? "1px solid rgba(0,224,255,.5)" : "1px solid rgba(0,224,255,.12)", color: "#e4eef8", fontFamily: "'Exo 2', sans-serif", fontSize: 14, padding: "10px 14px", outline: "none", width: "100%", transition: "border .2s, background .2s", clipPath: "polygon(5px 0%,100% 0%,calc(100% - 5px) 100%,0% 100%)" }}
            />
        </div>
    );
}

function SelectField({ label, value, onChange, options, placeholder, required = false }: {
    label: string; value: string; onChange: (v: string) => void;
    options: { label: string; value: string }[]; placeholder?: string; required?: boolean;
}) {
    const [focused, setFocused] = useState(false);
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, letterSpacing: 2, textTransform: "uppercase", color: focused ? "#00e0ff" : "rgba(228,238,248,.38)", transition: "color .2s" }}>
                {label}{required && <span style={{ color: "#7c4dff", marginLeft: 2 }}>*</span>}
            </label>
            <select value={value} onChange={e => onChange(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                style={{ background: focused ? "rgba(0,224,255,.05)" : "#070d1a", border: focused ? "1px solid rgba(0,224,255,.5)" : "1px solid rgba(0,224,255,.12)", color: value ? "#e4eef8" : "rgba(228,238,248,.3)", fontFamily: "'Exo 2', sans-serif", fontSize: 12, padding: "10px 14px", outline: "none", width: "100%", cursor: "pointer", appearance: "none", WebkitAppearance: "none", transition: "border .2s", clipPath: "polygon(5px 0%,100% 0%,calc(100% - 5px) 100%,0% 100%)" }}>
                {placeholder && <option value="" disabled style={{ background: "#070d1a" }}>{placeholder}</option>}
                {options.map(o => <option key={o.value} value={o.value} style={{ background: "#070d1a", color: "#e4eef8" }}>{o.label}</option>)}
            </select>
        </div>
    );
}

const GOALS = [
    { value: "startup", label: "🚀 Startup" },
    { value: "jobs", label: "💼 Jobs" },
    { value: "exploring", label: "🧭 Exploring" },
];

function GoalPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, letterSpacing: 2, textTransform: "uppercase", color: "rgba(228,238,248,.38)" }}>Goal<span style={{ color: "#7c4dff", marginLeft: 2 }}>*</span></label>
            <div style={{ display: "flex", gap: 8 }}>
                {GOALS.map(g => {
                    const active = value === g.value;
                    return (
                        <button key={g.value} type="button" onClick={() => onChange(g.value)}
                            style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, letterSpacing: 1, padding: "8px 14px", background: active ? "rgba(0,224,255,.1)" : "rgba(255,255,255,.03)", border: active ? "1px solid rgba(0,224,255,.6)" : "1px solid rgba(0,224,255,.12)", color: active ? "#00e0ff" : "rgba(228,238,248,.45)", cursor: "pointer", transition: "all .2s", clipPath: "polygon(5px 0%,100% 0%,calc(100% - 5px) 100%,0% 100%)" }}>
                            {g.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

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
                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                            <div style={{ width: active ? 24 : 18, height: active ? 24 : 18, borderRadius: "50%", border: done || active ? "1.5px solid #00e0ff" : "1.5px solid rgba(0,224,255,.2)", background: done ? "rgba(0,224,255,.2)" : active ? "rgba(0,224,255,.08)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Mono', monospace", fontSize: 9, color: done || active ? "#00e0ff" : "rgba(0,224,255,.3)", transition: "all .3s", flexShrink: 0, boxShadow: active ? "0 0 12px rgba(0,224,255,.2)" : "none" }}>
                                {done ? "✓" : idx}
                            </div>
                            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", color: done || active ? "#00e0ff" : "rgba(228,238,248,.22)", transition: "color .3s" }}>{lbl}</span>
                        </div>
                        {i < STEP_LABELS.length - 1 && <div style={{ width: 28, height: 1, margin: "0 10px", background: current > idx ? "rgba(0,224,255,.4)" : "rgba(0,224,255,.1)", transition: "background .4s" }} />}
                    </div>
                );
            })}
        </div>
    );
}

export default function RegistrationPage() {
    const [step, setStep] = useState<Step>(1);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const [base, setBase] = useState<BaseForm>({ first_name: "", last_name: "", phone: "", city: "", password: "", confirm_password: "", role: null });
    const [student, setStudent] = useState<StudentForm>({ email: "", current_year: "", passing_year: "", stream: "", interest: "" });
    const [pro, setPro] = useState<ProfessionalForm>({ company: "", personal_email: "", company_email: "", interest: "" });

    const setB = (k: keyof BaseForm) => (v: string) => setBase(p => ({ ...p, [k]: v }));
    const setSt = (k: keyof StudentForm) => (v: string) => setStudent(p => ({ ...p, [k]: v }));
    const setPr = (k: keyof ProfessionalForm) => (v: string) => setPro(p => ({ ...p, [k]: v }));

    const validateStep1 = () => {
        if (!base.first_name || !base.last_name || !base.phone || !base.city) { setError("Please fill in all required fields."); return false; }
        if (!base.password || base.password.length < 8) { setError("Password must be at least 8 characters."); return false; }
        if (base.password !== base.confirm_password) { setError("Passwords do not match."); return false; }
        return true;
    };
    const validateStep2 = () => { if (!base.role) { setError("Please select your role."); return false; } return true; };
    const validateStep3 = () => {
        if (base.role === "student") {
            if (!student.email || !student.current_year || !student.passing_year || !student.stream || !student.interest) { setError("Please fill in all required fields."); return false; }
        } else {
            if (!pro.company || !pro.personal_email || !pro.interest) { setError("Please fill in all required fields."); return false; }
        }
        return true;
    };

    const next = () => {
        setError("");
        if (step === 1 && !validateStep1()) return;
        if (step === 2 && !validateStep2()) return;
        setStep(s => (s + 1) as Step);
    };

    const submit = async () => {
        setError("");
        if (!validateStep3()) return;
        setSubmitting(true);
        const payload: Record<string, unknown> = {
            first_name: base.first_name, last_name: base.last_name, phone: base.phone, city: base.city, password: base.password, role: base.role, source: "ar",
            ...(base.role === "student" ? { email: student.email, current_year: student.current_year, passing_year: student.passing_year, stream: student.stream, interest: student.interest }
                : { email: pro.personal_email, company: pro.company, company_email: pro.company_email || undefined, interest: pro.interest }),
        };
        try {
            await api.post("/accounts/register/", payload);

            setSubmitted(true);

        } catch (err: any) {
            if (err.response?.data) {
                const data = err.response.data;
                setError(
                    typeof data === "object"
                        ? Object.values(data).flat().join(" ")
                        : "Registration failed."
                );
            } else {
                setError("Network error. Please try again.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    const CURRENT_YEAR_OPTS = [{ value: "1st", label: "1st Year" }, { value: "2nd", label: "2nd Year" }, { value: "3rd", label: "3rd Year" }, { value: "4th", label: "4th Year" }, { value: "postgrad", label: "Post Graduate" }];
    const PASSING_YEAR_OPTS = Array.from({ length: 8 }, (_, i) => { const y = 2024 + i; return { value: String(y), label: String(y) }; });

    return (
        <div style={{ background: "#060c18", color: "#e4eef8", height: "100vh", fontFamily: "'Exo 2', sans-serif", display: "flex", overflow: "hidden" }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: 'Inter', sans-serif;   /* 👈 APPLY GLOBALLY */
  }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 3px } ::-webkit-scrollbar-track { background: #060c18 } ::-webkit-scrollbar-thumb { background: rgba(0,224,255,.3); border-radius: 2px }
        input::placeholder { color: rgba(228,238,248,.22); font-size: 12px; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spinLoad { to { transform: rotate(360deg); } }
        @keyframes float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-6px) } }
        .fade-step { animation: fadeUp .3s ease both; }
        .btn-primary { font-family: 'DM Mono', monospace; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; padding: 11px 32px; background: linear-gradient(135deg, #00e0ff, #7c4dff); color: #060c18; border: none; cursor: pointer; font-weight: 700; clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%); transition: filter .2s, box-shadow .2s, opacity .2s; }
        .btn-primary:hover { filter: brightness(1.1); box-shadow: 0 0 20px rgba(0,224,255,.25); }
        .btn-primary:disabled { opacity: .5; cursor: not-allowed; }
        .btn-ghost { font-family: 'DM Mono', monospace; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; padding: 11px 24px; background: transparent; color: rgba(228,238,248,.45); border: 1px solid rgba(0,224,255,.18); cursor: pointer; clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%); transition: border-color .2s, color .2s; }
        .btn-ghost:hover { border-color: rgba(0,224,255,.45); color: #00e0ff; }
      `}</style>

            {/* ── LEFT PANEL ── */}
            <div style={{ flex: "0 0 42%", position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "36px 44px", borderRight: "1px solid rgba(0,224,255,.08)", overflow: "hidden" }}>
                {/* bg effects */}
                <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,224,255,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(0,224,255,.018) 1px,transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" }} />
                <div style={{ position: "absolute", top: "40%", left: "30%", width: 320, height: 320, background: "radial-gradient(circle, rgba(0,224,255,.055) 0%, transparent 65%)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", bottom: "10%", right: "10%", width: 200, height: 200, background: "radial-gradient(circle, rgba(124,77,255,.07) 0%, transparent 65%)", pointerEvents: "none" }} />

                {/* Logo */}
                <div style={{ position: "relative" }}>
                    <a href="/AR-VR" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: "#00e0ff", letterSpacing: 2, textDecoration: "none" }}>
                        XR<span style={{ color: "#7c4dff" }}>SLM</span>
                    </a>
                </div>

                {/* Center content */}
                <div style={{ position: "relative" }}>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, letterSpacing: 3.5, color: "rgba(0,224,255,.5)", textTransform: "uppercase", marginBottom: 14 }}>// Spatial Learning Platform</div>
                    <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(26px,3vw,38px)", lineHeight: 1.1, marginBottom: 14 }}>
                        Build Skills<br />in{" "}
                        <span style={{ background: "linear-gradient(90deg, #00e0ff, #7c4dff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Extended Reality</span>
                    </h1>
                    <p style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 14, color: "rgba(228,238,248,.45)", lineHeight: 1.75, maxWidth: 300, marginBottom: 32 }}>
                        Immersive curriculum for the next generation of spatial computing. Start free — no headset required.
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {[
                            { icon: "🎓", text: "Structured XR learning paths" },
                            { icon: "🏆", text: "Industry-recognized certificates" },
                            { icon: "🌐", text: "Access from any device, anywhere" },
                            { icon: "🚀", text: "Career labs & startup tracks" },
                        ].map(item => (
                            <div key={item.text} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <span style={{ fontSize: 16 }}>{item.icon}</span>
                                <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 14, color: "rgba(228,238,248,.5)" }}>{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom */}
                <div style={{ position: "relative", fontFamily: "'DM Mono', monospace", fontSize: 14, letterSpacing: 1.5, color: "rgba(228,238,248,.22)" }}>
                    Already have an account?{" "}
                    <a href="/AR-VR" style={{ color: "#00e0ff", textDecoration: "none" }}>Sign in →</a>
                </div>
            </div>

            {/* ── RIGHT PANEL ── */}
            {/* CHANGED: removed padding & centering; now full bleed flex column */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

                {/* CHANGED: inner wrapper fills 100% width & height, no maxWidth cap, padding moved inside */}
                <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>

                    {submitted ? (
                        <div className="fade-step" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: "40px 48px" }}>
                            <div style={{ width: 56, height: 56, borderRadius: "50%", border: "1.5px solid #00e0ff", background: "rgba(0,224,255,.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, boxShadow: "0 0 30px rgba(0,224,255,.2)", animation: "float 3s ease-in-out infinite" }}>✓</div>
                            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20 }}>You're in!</div>
                            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: 1.5, color: "rgba(228,238,248,.4)", lineHeight: 2, textAlign: "center" }}>Account created.<br />Check your email to activate access.</p>
                            <a href="/AR-VR" className="btn-primary" style={{ textDecoration: "none", marginTop: 8 }}>Go to Login →</a>
                        </div>
                    ) : (
                        /* CHANGED: flex: 1 + flex column so card stretches top-to-bottom; padding replaces old centering */
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "36px 48px 28px" }}>

                            <StepBar current={step} />

                            {/* CHANGED: flex: 1 makes the card grow to fill all remaining vertical space */}
                            <div style={{ flex: 1, background: "rgba(5,10,20,.9)", border: "1px solid rgba(0,224,255,.11)", backdropFilter: "blur(20px)", position: "relative", display: "flex", flexDirection: "column" }}>
                                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1.5, background: "linear-gradient(90deg, #00e0ff, #7c4dff, transparent)" }} />

                                {/* CHANGED: flex: 1 + flex column so inner content also stretches; generous padding */}
                                <div style={{ flex: 1, padding: "32px 36px 32px", display: "flex", flexDirection: "column" }}>

                                    {/* STEP 1 */}
                                    {step === 1 && (
                                        <div className="fade-step" style={{ flex: 1, display: "flex", flexDirection: "column", gap: 18 }}>
                                            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, letterSpacing: 2.5, color: "rgba(0,224,255,.5)", marginBottom: 2 }}>Step 01 — Personal Info</div>
                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                                <Field label="First Name" placeholder="Alex" value={base.first_name} onChange={setB("first_name")} required />
                                                <Field label="Last Name" placeholder="Johnson" value={base.last_name} onChange={setB("last_name")} required />
                                            </div>
                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                                <Field label="Mobile" type="tel" placeholder="+91 98765 43210" value={base.phone} onChange={setB("phone")} required />
                                                <Field label="City" placeholder="Mumbai" value={base.city} onChange={setB("city")} required />
                                            </div>
                                            <div style={{ height: 1, background: "rgba(0,224,255,.06)" }} />
                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                                <Field label="Password" type="password" placeholder="Min 8 chars" value={base.password} onChange={setB("password")} required />
                                                <Field label="Confirm Password" type="password" placeholder="Re-enter" value={base.confirm_password} onChange={setB("confirm_password")} required />
                                            </div>
                                            {base.password && (
                                                <div>
                                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, letterSpacing: 2, color: "rgba(228,238,248,.28)", textTransform: "uppercase" }}>Strength</span>
                                                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: base.password.length < 8 ? "#ff6b6b" : base.password.length < 12 ? "#e8b84b" : "#00e0ff" }}>
                                                            {base.password.length < 8 ? "WEAK" : base.password.length < 12 ? "GOOD" : "STRONG"}
                                                        </span>
                                                    </div>
                                                    <div style={{ height: 2, background: "rgba(255,255,255,.06)", borderRadius: 2 }}>
                                                        <div style={{ height: "100%", borderRadius: 2, background: base.password.length < 8 ? "#ff6b6b" : base.password.length < 12 ? "#e8b84b" : "#00e0ff", width: `${Math.min(100, (base.password.length / 16) * 100)}%`, transition: "width .4s, background .4s" }} />
                                                    </div>
                                                </div>
                                            )}
                                            {/* CHANGED: spacer pushes nav to bottom */}
                                            <div style={{ flex: 1 }} />
                                            {error && <div style={{ padding: "10px 14px", border: "1px solid rgba(255,100,80,.28)", background: "rgba(255,80,60,.05)", fontFamily: "'DM Mono', monospace", fontSize: 16, letterSpacing: 1, color: "#ff9980", lineHeight: 1.6 }}>⚠ {error}</div>}
                                            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                                <button className="btn-primary" onClick={next}>Continue →</button>
                                            </div>
                                        </div>
                                    )}

                                    {/* STEP 2 */}
                                    {step === 2 && (
                                        <div className="fade-step" style={{ flex: 1, display: "flex", flexDirection: "column", gap: 18 }}>
                                            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, letterSpacing: 2.5, color: "rgba(0,224,255,.5)", marginBottom: 2 }}>Step 02 — Choose Your Path</div>
                                            <p style={{ fontSize: 14, color: "rgba(228,238,248,.4)", lineHeight: 1.6 }}>Select your role to personalize your XR journey.</p>
                                            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                                {[
                                                    { role: "student" as Role, icon: "🎓", title: "Student", desc: "Enrolled in a degree program. Access guided curriculum & certifications.", accent: "0,224,255" },
                                                    { role: "professional" as Role, icon: "💼", title: "Professional", desc: "In the workforce. Upskill in XR for your industry or startup.", accent: "124,77,255" },
                                                ].map(item => {
                                                    const selected = base.role === item.role;
                                                    return (
                                                        <button key={item.role} type="button" onClick={() => setBase(b => ({ ...b, role: item.role }))}
                                                            style={{ background: selected ? `rgba(${item.accent},0.07)` : "rgba(255,255,255,.025)", border: selected ? `1px solid rgba(${item.accent},0.6)` : "1px solid rgba(0,224,255,.09)", padding: "18px 20px", cursor: "pointer", textAlign: "left", transition: "all .25s", position: "relative", overflow: "hidden", clipPath: "polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)", boxShadow: selected ? `0 0 24px rgba(${item.accent},0.1)` : "none" }}>
                                                            {selected && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1.5, background: `linear-gradient(90deg,rgba(${item.accent},1),transparent)` }} />}
                                                            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                                                                <span style={{ fontSize: 26, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                                                                <div>
                                                                    <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, color: selected ? `rgba(${item.accent},1)` : "#e4eef8", marginBottom: 5, transition: "color .25s" }}>{item.title}</div>
                                                                    <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 14, lineHeight: 1.55, color: "rgba(228,238,248,.4)" }}>{item.desc}</div>
                                                                </div>
                                                                {selected && <div style={{ marginLeft: "auto", fontFamily: "'DM Mono', monospace", fontSize: 7, letterSpacing: 1.5, color: `rgba(${item.accent},0.7)`, flexShrink: 0 }}>SELECTED ✓</div>}
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <div style={{ flex: 1 }} />
                                            {error && <div style={{ padding: "10px 14px", border: "1px solid rgba(255,100,80,.28)", background: "rgba(255,80,60,.05)", fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: 1, color: "#ff9980", lineHeight: 1.6 }}>⚠ {error}</div>}
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <button className="btn-ghost" onClick={() => { setError(""); setStep(s => (s - 1) as Step); }}>← Back</button>
                                                <button className="btn-primary" onClick={next}>Continue →</button>
                                            </div>
                                        </div>
                                    )}

                                    {/* STEP 3 — Student */}
                                    {step === 3 && base.role === "student" && (
                                        <div className="fade-step" style={{ flex: 1, display: "flex", flexDirection: "column", gap: 18 }}>
                                            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, letterSpacing: 2.5, color: "rgba(0,224,255,.5)", marginBottom: 2 }}>Step 03 — Student Details</div>
                                            <Field label="Email Address" type="email" placeholder="you@college.edu" value={student.email} onChange={setSt("email")} required />
                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                                <SelectField label="Current Year" value={student.current_year} onChange={setSt("current_year")} options={CURRENT_YEAR_OPTS} placeholder="Select year" required />
                                                <SelectField label="Passing Year" value={student.passing_year} onChange={setSt("passing_year")} options={PASSING_YEAR_OPTS} placeholder="Select year" required />
                                            </div>
                                            <Field label="Stream" placeholder="Computer Science, Design…" value={student.stream} onChange={setSt("stream")} required />
                                            <GoalPicker value={student.interest} onChange={setSt("interest")} />
                                            <div style={{ flex: 1 }} />
                                            {error && <div style={{ padding: "10px 14px", border: "1px solid rgba(255,100,80,.28)", background: "rgba(255,80,60,.05)", fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: 1, color: "#ff9980", lineHeight: 1.6 }}>⚠ {error}</div>}
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <button className="btn-ghost" onClick={() => { setError(""); setStep(s => (s - 1) as Step); }}>← Back</button>
                                                <button className="btn-primary" onClick={submit} disabled={submitting}>
                                                    {submitting ? <span style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 10, height: 10, borderRadius: "50%", border: "1.5px solid rgba(6,12,24,.3)", borderTop: "1.5px solid #060c18", animation: "spinLoad 1s linear infinite", display: "inline-block" }} />Creating…</span> : "Create Account →"}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* STEP 3 — Professional */}
                                    {step === 3 && base.role === "professional" && (
                                        <div className="fade-step" style={{ flex: 1, display: "flex", flexDirection: "column", gap: 18 }}>
                                            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, letterSpacing: 2.5, color: "rgba(124,77,255,.6)", marginBottom: 2 }}>Step 03 — Work Info</div>
                                            <Field label="Company" placeholder="Acme Corp" value={pro.company} onChange={setPr("company")} required />
                                            <Field label="Personal Email" type="email" placeholder="you@gmail.com" value={pro.personal_email} onChange={setPr("personal_email")} required />
                                            <Field label="Professional Email" type="email" placeholder="you@company.com (optional)" value={pro.company_email} onChange={setPr("company_email")} />
                                            <GoalPicker value={pro.interest} onChange={setPr("interest")} />
                                            <div style={{ flex: 1 }} />
                                            {error && <div style={{ padding: "10px 14px", border: "1px solid rgba(255,100,80,.28)", background: "rgba(255,80,60,.05)", fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: 1, color: "#ff9980", lineHeight: 1.6 }}>⚠ {error}</div>}
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <button className="btn-ghost" onClick={() => { setError(""); setStep(s => (s - 1) as Step); }}>← Back</button>
                                                <button className="btn-primary" onClick={submit} disabled={submitting}>
                                                    {submitting ? <span style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 10, height: 10, borderRadius: "50%", border: "1.5px solid rgba(6,12,24,.3)", borderTop: "1.5px solid #060c18", animation: "spinLoad 1s linear infinite", display: "inline-block" }} />Creating…</span> : "Create Account →"}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </div>



                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
