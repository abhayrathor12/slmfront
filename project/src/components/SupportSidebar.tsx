import { useEffect, useState, useRef } from "react";
import api from "../utils/api";
import avaimage from '../public/avatar2.png';
interface Props {
    open: boolean;
    onClose: () => void;
}

interface Message {
    id: number;
    sender: "user" | "admin";
    message: string;
    screenshot: string | null;
    created_at: string;
}

type View = "chat" | "trouble";

const TROUBLE_OPTIONS = [
    { id: "quiz", icon: "📝", label: "Quiz Issue" },
    { id: "lab", icon: "🧪", label: "Lab Issue" },
    { id: "content", icon: "📚", label: "Content Issue" },
    { id: "other", icon: "🔧", label: "Other Issue" },
];

const SupportSidebar = ({ open, onClose }: Props) => {
    const [view, setView] = useState<View>("chat");
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [screenshot, setScreenshot] = useState<File | null>(null);
    const [troubleType, setTroubleType] = useState<string | null>(null);
    const [troubleText, setTroubleText] = useState("");
    const [troubleScreenshot, setTroubleScreenshot] = useState<File | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const [selectedModule, setSelectedModule] = useState<number | null>(null);
    const [modules, setModules] = useState<any[]>([]);
    const [selectedLab, setSelectedLab] = useState<string>("");

    const fetchConversation = async () => {
        try {
            const res = await api.get("/accounts/conversation/");
            setMessages(res.data.messages || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (open) {
            fetchConversation();
            setView("chat");
            setSubmitted(false);
        }
    }, [open]);

    const fetchModules = async () => {
        try {
            const res = await api.get("/api/maincontent/");
            setModules(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (view === "trouble" && (troubleType === "Quiz Issue" || troubleType === "Content Issue")) {
            fetchModules();
        }
    }, [troubleType]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!input && !screenshot) return;
        const formData = new FormData();
        formData.append("message", input);
        if (screenshot) formData.append("screenshot", screenshot);
        try {
            const res = await api.post("/accounts/send-message/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setMessages(res.data.messages);
            setInput("");
            setScreenshot(null);
        } catch (err) {
            console.error(err);
        }
    };

    const handleTroubleSubmit = async () => {
        if (!troubleType || !troubleText.trim()) return;

        const formData = new FormData();
        formData.append("issue_type", troubleType);
        formData.append("message", `Issue Type: ${troubleType}\n\n${troubleText.trim()}`);

        if (selectedModule) formData.append("main_content_id", selectedModule.toString());
        if (selectedLab) formData.append("lab_name", selectedLab);
        if (troubleScreenshot) formData.append("screenshot", troubleScreenshot);

        try {
            await api.post("/accounts/send-message/", formData);
            setSubmitted(true);
            setTroubleText("");
            setTroubleType(null);
            setSelectedModule(null);
            setSelectedLab("");
            setTroubleScreenshot(null);
        } catch (err) {
            console.error(err);
        }
    };

    const reset = () => {
        setView("chat");
        setSubmitted(false);
        setTroubleText("");
        setTroubleType(null);
        setTroubleScreenshot(null);
    };

    return (
        <div
            className={`fixed top-0 right-0 h-full w-[360px] bg-white shadow-2xl transition-transform duration-300 z-50 flex flex-col ${open ? "translate-x-0" : "translate-x-full"}`}
        >
            {/* HEADER */}
            <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ background: "#203f78" }}>
                <div className="flex items-center gap-2">
                    {view !== "chat" && (
                        <button
                            onClick={reset}
                            className="flex items-center gap-1 bg-white/20 hover:bg-white/30 transition-colors text-white text-xs font-semibold px-2.5 py-1 rounded-full mr-1"
                        >
                            ← Back
                        </button>
                    )}
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                        <img src={avaimage} alt="Sathi" className="w-8 h-8 object-contain" />
                    </div>
                    <div>
                        <p className="text-white font-semibold text-sm leading-tight">Study Buddy</p>
                        <p className="text-white/60 text-xs">We're here to help you</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white text-sm"
                >
                    ✕
                </button>
            </div>

            {/* ── CHAT VIEW ── */}
            {view === "chat" && (
                <>
                    {/* Quick action — only "Having Trouble?" now */}
                    <div className="px-3 pt-3 pb-2 shrink-0 border-b border-gray-100">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-0.5">Quick Actions</p>
                        <button
                            onClick={() => { setView("trouble"); setSubmitted(false); }}
                            className="w-full flex items-center gap-3 p-3 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 transition-all text-left"
                        >
                            <span className="text-2xl leading-none">🐞</span>
                            <div>
                                <p className="font-semibold text-red-800 text-sm leading-tight">Having Trouble?</p>
                                <p className="text-xs text-red-600 leading-tight mt-0.5">Report an issue to our team</p>
                            </div>
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {messages.length === 0 && (
                            <div className="text-center py-8">
                                <div className="text-3xl mb-2">👋</div>
                                <p className="text-sm text-gray-500">Hi! How can we help you today?</p>
                                <p className="text-xs text-gray-400 mt-1">Send a message to get started</p>
                            </div>
                        )}
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`max-w-[82%] p-3 rounded-2xl ${msg.sender === "user"
                                    ? "ml-auto rounded-tr-sm text-[#203f78]"
                                    : "bg-gray-100 text-gray-800 rounded-tl-sm"
                                    }`}
                                style={msg.sender === "user" ? { background: "transparent", border: "1.5px solid #203f78" } : {}}
                            >
                                {msg.message && <p className="text-sm leading-relaxed">{msg.message}</p>}
                                {msg.screenshot && (
                                    <img src={msg.screenshot} alt="screenshot" className="mt-2 rounded-lg max-h-36 w-full object-cover" />
                                )}
                                <span className="text-xs opacity-50 mt-1 block">
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </span>
                            </div>
                        ))}
                        <div ref={bottomRef} />
                    </div>

                    {/* Chat input */}
                    <div className="border-t border-gray-100 p-3 shrink-0">
                        {screenshot && (
                            <div className="mb-2 px-2 py-1.5 bg-gray-50 rounded-lg text-xs text-gray-500 flex items-center gap-1">
                                📎 {screenshot.name}
                                <button onClick={() => setScreenshot(null)} className="text-red-400 ml-auto">✕</button>
                            </div>
                        )}
                        <div className="flex gap-2 items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                placeholder="Type a message..."
                                className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                                onFocus={(e) => (e.target.style.boxShadow = "0 0 0 2px #203f78")}
                                onBlur={(e) => (e.target.style.boxShadow = "none")}
                            />
                            <label className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer bg-gray-100 hover:bg-gray-200 transition-colors shrink-0 text-base">
                                📎
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => setScreenshot(e.target.files?.[0] || null)} />
                            </label>
                            <button
                                onClick={handleSend}
                                className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0"
                                style={{ background: "#203f78" }}
                            >
                                ➤
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* ── TROUBLE VIEW ── */}
            {view === "trouble" && (
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {submitted ? (
                        <div className="text-center py-16 space-y-3">
                            <div className="text-5xl">✅</div>
                            <p className="font-semibold text-gray-800">Report received!</p>
                            <p className="text-sm text-gray-500">Our team will look into this shortly.</p>
                            <button onClick={reset} className="mt-2 text-sm px-5 py-2 rounded-xl text-white font-semibold" style={{ background: "#203f78" }}>
                                Back to Chat
                            </button>
                        </div>
                    ) : (
                        <>
                            <div>
                                <p className="font-semibold text-gray-800 text-sm mb-0.5">🐞 Report an Issue</p>
                                <p className="text-xs text-gray-400">Select the issue type and describe what happened</p>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                {TROUBLE_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={() => setTroubleType(opt.label)}
                                        className={`p-3 rounded-xl border text-left transition-all ${troubleType === opt.label
                                            ? "border-[#203f78] bg-[#f0f4ff]"
                                            : "border-gray-200 hover:border-gray-300 bg-gray-50"
                                            }`}
                                    >
                                        <div className="text-xl mb-1">{opt.icon}</div>
                                        <div className="text-xs font-medium text-gray-700">{opt.label}</div>
                                    </button>
                                ))}
                            </div>

                            {troubleType === "Lab Issue" && (
                                <div>
                                    <label className="text-xs font-medium text-gray-600 block mb-1.5">Select Lab</label>
                                    <select
                                        value={selectedLab}
                                        onChange={(e) => setSelectedLab(e.target.value)}
                                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm"
                                    >
                                        <option value="">Select Lab</option>
                                        {[...Array(10)].map((_, i) => (
                                            <option key={i} value={`Lab ${i + 1}`}>Lab {i + 1}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {(troubleType === "Quiz Issue" || troubleType === "Content Issue") && (
                                <div>
                                    <label className="text-xs font-medium text-gray-600 block mb-1.5">Select Module</label>
                                    <select
                                        value={selectedModule || ""}
                                        onChange={(e) => setSelectedModule(Number(e.target.value))}
                                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm"
                                    >
                                        <option value="">Select Module</option>
                                        {modules.map((mod) => (
                                            <option key={mod.id} value={mod.id}>{mod.title}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="text-xs font-medium text-gray-600 block mb-1.5">Describe the issue</label>
                                <textarea
                                    value={troubleText}
                                    onChange={(e) => setTroubleText(e.target.value)}
                                    rows={4}
                                    placeholder="What happened? Include steps to reproduce..."
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none"
                                    onFocus={(e) => (e.target.style.boxShadow = "0 0 0 2px #203f78")}
                                    onBlur={(e) => (e.target.style.boxShadow = "none")}
                                />
                            </div>

                            <div>
                                <label className="text-xs font-medium text-gray-600 block mb-1.5">
                                    Attach screenshot <span className="text-gray-400 font-normal">(optional)</span>
                                </label>
                                <label className="flex items-center gap-2 border-2 border-dashed border-gray-200 rounded-xl p-3 cursor-pointer hover:border-gray-300 transition-colors">
                                    <span className="text-lg">📎</span>
                                    <span className="text-xs text-gray-500 truncate">
                                        {troubleScreenshot ? troubleScreenshot.name : "Click to upload image"}
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => setTroubleScreenshot(e.target.files?.[0] || null)}
                                    />
                                </label>
                            </div>

                            <button
                                onClick={handleTroubleSubmit}
                                disabled={!troubleType || !troubleText.trim()}
                                className="w-full py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity disabled:opacity-40"
                                style={{ background: "#203f78" }}
                            >
                                Submit Report
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default SupportSidebar;