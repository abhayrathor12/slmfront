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

// ── Theme tokens (mirrors Login page) ──────────────────────────
const NAVY = "#203f78";
const BLUE = "#2c5a9e";
const LIGHT = "#f4f7fb";
const WHITE = "#ffffff";
const BORDER = "rgba(32,63,120,.18)";
const MUTED = "rgba(32,63,120,.55)";
const FONT = "'Inter', sans-serif";

// ── Field ──────────────────────────────────────────────────────
function Field({ label, type = "text", placeholder, value, onChange, required = false }: {
    label: string; type?: string; placeholder?: string; value: string;
    onChange: (v: string) => void; required?: boolean;
}) {
    const [focused, setFocused] = useState(false);
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{
                fontFamily: FONT, fontSize: 13, fontWeight: 500,
                color: focused ? NAVY : "#374151",
                transition: "color .2s"
            }}>
                {label}{required && <span style={{ color: "#e53e3e", marginLeft: 2 }}>*</span>}
            </label>
            <input
                type={type} placeholder={placeholder} value={value}
                onChange={e => onChange(e.target.value)}
                onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                style={{
                    background: WHITE,
                    border: focused ? `1.5px solid ${NAVY}` : `1px solid #d1d5db`,
                    color: "#111827", fontFamily: FONT, fontSize: 14,
                    padding: "10px 14px", outline: "none", width: "100%",
                    borderRadius: 8, transition: "border .2s, box-shadow .2s",
                    boxShadow: focused ? `0 0 0 3px rgba(32,63,120,.08)` : "none"
                }}
            />
        </div>
    );
}

// ── SelectField ────────────────────────────────────────────────
function SelectField({ label, value, onChange, options, placeholder, required = false }: {
    label: string; value: string; onChange: (v: string) => void;
    options: { label: string; value: string }[]; placeholder?: string; required?: boolean;
}) {
    const [focused, setFocused] = useState(false);
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{
                fontFamily: FONT, fontSize: 13, fontWeight: 500,
                color: focused ? NAVY : "#374151", transition: "color .2s"
            }}>
                {label}{required && <span style={{ color: "#e53e3e", marginLeft: 2 }}>*</span>}
            </label>
            <select
                value={value} onChange={e => onChange(e.target.value)}
                onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                style={{
                    background: WHITE,
                    border: focused ? `1.5px solid ${NAVY}` : `1px solid #d1d5db`,
                    color: value ? "#111827" : "#9ca3af",
                    fontFamily: FONT, fontSize: 14, padding: "10px 14px",
                    outline: "none", width: "100%", cursor: "pointer",
                    appearance: "none", WebkitAppearance: "none", borderRadius: 8,
                    transition: "border .2s, box-shadow .2s",
                    boxShadow: focused ? `0 0 0 3px rgba(32,63,120,.08)` : "none"
                }}
            >
                {placeholder && <option value="" disabled>{placeholder}</option>}
                {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
        </div>
    );
}

// ── GoalPicker ─────────────────────────────────────────────────
const GOALS = [
    { value: "startup", label: "🚀 Startup" },
    { value: "jobs", label: "💼 Jobs" },
    { value: "exploring", label: "🧭 Exploring" },
];

function GoalPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontFamily: FONT, fontSize: 13, fontWeight: 500, color: "#374151" }}>
                Goal<span style={{ color: "#e53e3e", marginLeft: 2 }}>*</span>
            </label>
            <div style={{ display: "flex", gap: 8 }}>
                {GOALS.map(g => {
                    const active = value === g.value;
                    return (
                        <button key={g.value} type="button" onClick={() => onChange(g.value)}
                            style={{
                                fontFamily: FONT, fontSize: 13, fontWeight: 500,
                                padding: "8px 16px", borderRadius: 8,
                                background: active ? `rgba(32,63,120,.08)` : WHITE,
                                border: active ? `1.5px solid ${NAVY}` : `1px solid #d1d5db`,
                                color: active ? NAVY : "#6b7280",
                                cursor: "pointer", transition: "all .2s",
                                boxShadow: active ? `0 0 0 3px rgba(32,63,120,.08)` : "none"
                            }}>
                            {g.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// ── StepBar ────────────────────────────────────────────────────
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
                                boxShadow: active ? `0 0 0 4px rgba(32,63,120,.1)` : "none"
                            }}>
                                {done ? "✓" : idx}
                            </div>
                            <span style={{
                                fontFamily: FONT, fontSize: 12, fontWeight: 600, letterSpacing: 0.5,
                                textTransform: "uppercase",
                                color: done || active ? NAVY : "#9ca3af",
                                transition: "color .3s"
                            }}>{lbl}</span>
                        </div>
                        {i < STEP_LABELS.length - 1 && (
                            <div style={{
                                width: 32, height: 1.5, margin: "0 12px",
                                background: current > idx
                                    ? `linear-gradient(90deg,${NAVY},${BLUE})`
                                    : "#e5e7eb",
                                borderRadius: 2, transition: "background .4s"
                            }} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────
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
            first_name: base.first_name, last_name: base.last_name, phone: base.phone,
            city: base.city, password: base.password, role: base.role, source: "ar",
            ...(base.role === "student"
                ? { email: student.email, current_year: student.current_year, passing_year: student.passing_year, stream: student.stream, interest: student.interest }
                : { email: pro.personal_email, company: pro.company, company_email: pro.company_email || undefined, interest: pro.interest }),
        };
        try {
            await api.post("/accounts/register/", payload);
            setSubmitted(true);
        } catch (err: any) {
            if (err.response?.data) {
                const data = err.response.data;
                setError(typeof data === "object" ? Object.values(data).flat().join(" ") : "Registration failed.");
            } else {
                setError("Network error. Please try again.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    const CURRENT_YEAR_OPTS = [
        { value: "1st", label: "1st Year" }, { value: "2nd", label: "2nd Year" },
        { value: "3rd", label: "3rd Year" }, { value: "4th", label: "4th Year" },
        { value: "postgrad", label: "Post Graduate" }
    ];
    const PASSING_YEAR_OPTS = Array.from({ length: 8 }, (_, i) => {
        const y = 2024 + i; return { value: String(y), label: String(y) };
    });

    return (
        <div style={{
            background: LIGHT, color: "#111827", minHeight: "100vh",
            fontFamily: FONT, display: "flex", overflow: "hidden"
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', sans-serif; }
                ::-webkit-scrollbar { width: 4px }
                ::-webkit-scrollbar-track { background: #f4f7fb }
                ::-webkit-scrollbar-thumb { background: rgba(32,63,120,.3); border-radius: 3px }
                input::placeholder, select option[disabled] { color: #9ca3af; font-size: 13px; }
                @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes spinLoad { to { transform: rotate(360deg); } }
                @keyframes float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-6px) } }
                .fade-step { animation: fadeUp .3s ease both; }
                .btn-primary {
                    font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600;
                    padding: 10px 28px; letter-spacing: 0.3px;
                    background: linear-gradient(135deg, #203f78, #2c5a9e);
                    color: #ffffff; border: none; cursor: pointer; border-radius: 8px;
                    transition: box-shadow .2s, transform .15s, opacity .2s;
                    display: inline-flex; align-items: center; gap: 6px;
                }
                .btn-primary:hover { box-shadow: 0 4px 20px rgba(32,63,120,.28); transform: scale(1.02); }
                .btn-primary:disabled { opacity: .6; cursor: not-allowed; transform: none; }
                .btn-ghost {
                    font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 500;
                    padding: 10px 20px; background: transparent;
                    color: #6b7280; border: 1px solid #d1d5db; cursor: pointer; border-radius: 8px;
                    transition: border-color .2s, color .2s;
                }
                .btn-ghost:hover { border-color: ${NAVY}; color: ${NAVY}; }
            `}</style>

            {/* ── LEFT PANEL ───────────────────────────────────── */}
            <div style={{
                flex: "0 0 42%", position: "relative", display: "flex",
                flexDirection: "column", justifyContent: "space-between",
                padding: "36px 44px",
                borderRight: `1px solid ${BORDER}`,
                background: WHITE, overflow: "hidden"
            }}>
                {/* subtle grid */}
                <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(rgba(32,63,120,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(32,63,120,.04) 1px,transparent 1px)`, backgroundSize: "48px 48px", pointerEvents: "none" }} />
                {/* radial glow */}
                <div style={{ position: "absolute", top: "38%", left: "28%", width: 340, height: 340, background: `radial-gradient(circle, rgba(32,63,120,.07) 0%, transparent 65%)`, pointerEvents: "none" }} />
                <div style={{ position: "absolute", bottom: "8%", right: "8%", width: 220, height: 220, background: `radial-gradient(circle, rgba(44,90,158,.06) 0%, transparent 65%)`, pointerEvents: "none" }} />

                {/* Logo */}
                <div style={{ position: "relative" }}>
                    <a href="/AR-VR" style={{ fontFamily: FONT, fontWeight: 800, fontSize: 20, color: NAVY, letterSpacing: 1, textDecoration: "none" }}>
                        XR<span style={{ color: BLUE }}>SLM</span>
                    </a>
                </div>

                {/* Center content */}
                <div style={{ position: "relative" }}>
                    <div style={{ fontFamily: FONT, fontSize: 11, letterSpacing: 3, color: MUTED, textTransform: "uppercase", marginBottom: 14, fontWeight: 500 }}>
                        // Spatial Learning Platform
                    </div>
                    <h1 style={{ fontFamily: FONT, fontWeight: 800, fontSize: "clamp(26px,3vw,38px)", lineHeight: 1.15, marginBottom: 14, color: NAVY }}>
                        Build Skills<br />in{" "}
                        <span style={{ background: `linear-gradient(90deg, ${NAVY}, ${BLUE})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                            Extended Reality
                        </span>
                    </h1>
                    <p style={{ fontFamily: FONT, fontSize: 14, color: "#6b7280", lineHeight: 1.75, maxWidth: 300, marginBottom: 32 }}>
                        Immersive curriculum for the next generation of spatial computing. Start free — no headset required.
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                        {[
                            { icon: "🎓", text: "Structured XR learning paths" },
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

                    {/* Stats row */}
                    <div style={{ display: "flex", gap: 28, marginTop: 32, paddingTop: 24, borderTop: `1px solid ${BORDER}` }}>
                        {[["40h", "Content"], ["12", "Modules"], ["3", "Platforms"]].map(([n, l]) => (
                            <div key={l}>
                                <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 22, color: NAVY }}>{n}</div>
                                <div style={{ fontFamily: FONT, fontSize: 11, color: MUTED, textTransform: "uppercase", marginTop: 2, fontWeight: 500, letterSpacing: 0.5 }}>{l}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom */}
                <div style={{ position: "relative", fontFamily: FONT, fontSize: 14, color: "#9ca3af" }}>
                    Already have an account?{" "}
                    <a href="/AR-VR" style={{ color: NAVY, textDecoration: "none", fontWeight: 600 }}>Sign in →</a>
                </div>
            </div>

            {/* ── RIGHT PANEL ──────────────────────────────────── */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: LIGHT }}>
                <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>

                    {submitted ? (
                        <div className="fade-step" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: "40px 48px" }}>
                            <div style={{
                                width: 60, height: 60, borderRadius: "50%",
                                background: `linear-gradient(135deg,${NAVY},${BLUE})`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 24, color: WHITE,
                                boxShadow: `0 8px 32px rgba(32,63,120,.28)`,
                                animation: "float 3s ease-in-out infinite"
                            }}>✓</div>
                            <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 22, color: NAVY }}>You're in!</div>
                            <p style={{ fontFamily: FONT, fontSize: 14, color: "#6b7280", lineHeight: 1.8, textAlign: "center" }}>
                                Account created.<br />Check your email to activate access.
                            </p>
                            <a href="/AR-VR" className="btn-primary" style={{ textDecoration: "none", marginTop: 8 }}>Go to Login →</a>
                        </div>
                    ) : (
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "36px 48px 28px" }}>

                            <StepBar current={step} />

                            {/* Card */}
                            <div style={{
                                flex: 1, background: WHITE,
                                border: `1px solid rgba(32,63,120,.14)`,
                                borderRadius: 16,
                                boxShadow: "0 8px 40px rgba(32,63,120,.10)",
                                position: "relative", display: "flex", flexDirection: "column",
                                overflow: "hidden"
                            }}>
                                {/* top accent bar */}
                                <div style={{ height: 3, background: `linear-gradient(90deg,${NAVY},${BLUE})`, borderRadius: "16px 16px 0 0" }} />

                                <div style={{ flex: 1, padding: "32px 36px 32px", display: "flex", flexDirection: "column" }}>

                                    {/* ── STEP 1 ── */}
                                    {step === 1 && (
                                        <div className="fade-step" style={{ flex: 1, display: "flex", flexDirection: "column", gap: 18 }}>
                                            <div>
                                                <div style={{ fontFamily: FONT, fontSize: 11, letterSpacing: 2, color: MUTED, textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>Step 01</div>
                                                <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 18, color: NAVY }}>Personal Info</div>
                                            </div>
                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                                <Field label="First Name" placeholder="Alex" value={base.first_name} onChange={setB("first_name")} required />
                                                <Field label="Last Name" placeholder="Johnson" value={base.last_name} onChange={setB("last_name")} required />
                                            </div>
                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                                <Field label="Mobile" type="tel" placeholder="+91 98765 43210" value={base.phone} onChange={setB("phone")} required />
                                                <Field label="City" placeholder="Mumbai" value={base.city} onChange={setB("city")} required />
                                            </div>
                                            <div style={{ height: 1, background: `rgba(32,63,120,.08)` }} />
                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                                <Field label="Password" type="password" placeholder="Min 8 characters" value={base.password} onChange={setB("password")} required />
                                                <Field label="Confirm Password" type="password" placeholder="Re-enter password" value={base.confirm_password} onChange={setB("confirm_password")} required />
                                            </div>
                                            {base.password && (
                                                <div>
                                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                                        <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5 }}>Password Strength</span>
                                                        <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: base.password.length < 8 ? "#ef4444" : base.password.length < 12 ? "#f59e0b" : NAVY }}>
                                                            {base.password.length < 8 ? "Weak" : base.password.length < 12 ? "Good" : "Strong"}
                                                        </span>
                                                    </div>
                                                    <div style={{ height: 4, background: "#e5e7eb", borderRadius: 4 }}>
                                                        <div style={{
                                                            height: "100%", borderRadius: 4,
                                                            background: base.password.length < 8 ? "#ef4444" : base.password.length < 12 ? "#f59e0b" : `linear-gradient(90deg,${NAVY},${BLUE})`,
                                                            width: `${Math.min(100, (base.password.length / 16) * 100)}%`,
                                                            transition: "width .4s, background .4s"
                                                        }} />
                                                    </div>
                                                </div>
                                            )}
                                            <div style={{ flex: 1 }} />
                                            {error && (
                                                <div style={{ padding: "10px 14px", border: "1px solid rgba(239,68,68,.3)", background: "rgba(239,68,68,.05)", borderRadius: 8, fontFamily: FONT, fontSize: 13, color: "#b91c1c", lineHeight: 1.6 }}>
                                                    ⚠ {error}
                                                </div>
                                            )}
                                            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                                <button className="btn-primary" onClick={next}>Continue →</button>
                                            </div>
                                        </div>
                                    )}

                                    {/* ── STEP 2 ── */}
                                    {step === 2 && (
                                        <div className="fade-step" style={{ flex: 1, display: "flex", flexDirection: "column", gap: 18 }}>
                                            <div>
                                                <div style={{ fontFamily: FONT, fontSize: 11, letterSpacing: 2, color: MUTED, textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>Step 02</div>
                                                <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 18, color: NAVY }}>Choose Your Path</div>
                                            </div>
                                            <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6, fontFamily: FONT }}>Select your role to personalize your XR journey.</p>
                                            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                                {[
                                                    { role: "student" as Role, icon: "🎓", title: "Student", desc: "Enrolled in a degree program. Access guided curriculum & certifications." },
                                                    { role: "professional" as Role, icon: "💼", title: "Professional", desc: "In the workforce. Upskill in XR for your industry or startup." },
                                                ].map(item => {
                                                    const selected = base.role === item.role;
                                                    return (
                                                        <button key={item.role} type="button" onClick={() => setBase(b => ({ ...b, role: item.role }))}
                                                            style={{
                                                                background: selected ? `rgba(32,63,120,.06)` : WHITE,
                                                                border: selected ? `1.5px solid ${NAVY}` : `1px solid #d1d5db`,
                                                                padding: "18px 20px", cursor: "pointer", textAlign: "left",
                                                                transition: "all .25s", position: "relative", borderRadius: 12,
                                                                boxShadow: selected ? `0 0 0 4px rgba(32,63,120,.08)` : "none"
                                                            }}>
                                                            {selected && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${NAVY},${BLUE})`, borderRadius: "12px 12px 0 0" }} />}
                                                            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                                                                <span style={{ fontSize: 26, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                                                                <div style={{ flex: 1 }}>
                                                                    <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 15, color: selected ? NAVY : "#111827", marginBottom: 5, transition: "color .25s" }}>{item.title}</div>
                                                                    <div style={{ fontFamily: FONT, fontSize: 13, lineHeight: 1.55, color: "#6b7280" }}>{item.desc}</div>
                                                                </div>
                                                                {selected && (
                                                                    <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 600, color: NAVY, flexShrink: 0, background: `rgba(32,63,120,.08)`, padding: "3px 8px", borderRadius: 6 }}>
                                                                        Selected ✓
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <div style={{ flex: 1 }} />
                                            {error && (
                                                <div style={{ padding: "10px 14px", border: "1px solid rgba(239,68,68,.3)", background: "rgba(239,68,68,.05)", borderRadius: 8, fontFamily: FONT, fontSize: 13, color: "#b91c1c", lineHeight: 1.6 }}>
                                                    ⚠ {error}
                                                </div>
                                            )}
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <button className="btn-ghost" onClick={() => { setError(""); setStep(s => (s - 1) as Step); }}>← Back</button>
                                                <button className="btn-primary" onClick={next}>Continue →</button>
                                            </div>
                                        </div>
                                    )}

                                    {/* ── STEP 3 — Student ── */}
                                    {step === 3 && base.role === "student" && (
                                        <div className="fade-step" style={{ flex: 1, display: "flex", flexDirection: "column", gap: 18 }}>
                                            <div>
                                                <div style={{ fontFamily: FONT, fontSize: 11, letterSpacing: 2, color: MUTED, textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>Step 03</div>
                                                <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 18, color: NAVY }}>Student Details</div>
                                            </div>
                                            <Field label="Email Address" type="email" placeholder="you@college.edu" value={student.email} onChange={setSt("email")} required />
                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                                <SelectField label="Current Year" value={student.current_year} onChange={setSt("current_year")} options={CURRENT_YEAR_OPTS} placeholder="Select year" required />
                                                <SelectField label="Passing Year" value={student.passing_year} onChange={setSt("passing_year")} options={PASSING_YEAR_OPTS} placeholder="Select year" required />
                                            </div>
                                            <Field label="Stream" placeholder="Computer Science, Design…" value={student.stream} onChange={setSt("stream")} required />
                                            <GoalPicker value={student.interest} onChange={setSt("interest")} />
                                            <div style={{ flex: 1 }} />
                                            {error && (
                                                <div style={{ padding: "10px 14px", border: "1px solid rgba(239,68,68,.3)", background: "rgba(239,68,68,.05)", borderRadius: 8, fontFamily: FONT, fontSize: 13, color: "#b91c1c", lineHeight: 1.6 }}>
                                                    ⚠ {error}
                                                </div>
                                            )}
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <button className="btn-ghost" onClick={() => { setError(""); setStep(s => (s - 1) as Step); }}>← Back</button>
                                                <button className="btn-primary" onClick={submit} disabled={submitting}>
                                                    {submitting
                                                        ? <><span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,.35)", borderTop: "2px solid #fff", animation: "spinLoad 1s linear infinite", display: "inline-block" }} /> Creating…</>
                                                        : "Create Account →"}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* ── STEP 3 — Professional ── */}
                                    {step === 3 && base.role === "professional" && (
                                        <div className="fade-step" style={{ flex: 1, display: "flex", flexDirection: "column", gap: 18 }}>
                                            <div>
                                                <div style={{ fontFamily: FONT, fontSize: 11, letterSpacing: 2, color: MUTED, textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>Step 03</div>
                                                <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 18, color: BLUE }}>Work Info</div>
                                            </div>
                                            <Field label="Company" placeholder="Acme Corp" value={pro.company} onChange={setPr("company")} required />
                                            <Field label="Personal Email" type="email" placeholder="you@gmail.com" value={pro.personal_email} onChange={setPr("personal_email")} required />
                                            <Field label="Professional Email" type="email" placeholder="you@company.com (optional)" value={pro.company_email} onChange={setPr("company_email")} />
                                            <GoalPicker value={pro.interest} onChange={setPr("interest")} />
                                            <div style={{ flex: 1 }} />
                                            {error && (
                                                <div style={{ padding: "10px 14px", border: "1px solid rgba(239,68,68,.3)", background: "rgba(239,68,68,.05)", borderRadius: 8, fontFamily: FONT, fontSize: 13, color: "#b91c1c", lineHeight: 1.6 }}>
                                                    ⚠ {error}
                                                </div>
                                            )}
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <button className="btn-ghost" onClick={() => { setError(""); setStep(s => (s - 1) as Step); }}>← Back</button>
                                                <button className="btn-primary" onClick={submit} disabled={submitting}>
                                                    {submitting
                                                        ? <><span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,.35)", borderTop: "2px solid #fff", animation: "spinLoad 1s linear infinite", display: "inline-block" }} /> Creating…</>
                                                        : "Create Account →"}
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