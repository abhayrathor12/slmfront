import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Globe, ArrowRight, GraduationCap } from 'lucide-react';
import { toast } from 'react-toastify';
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import api from '../utils/api';
import "@fontsource/inter";
import smallogo from '../public/logo-.png';
// ─── Model paths ───────────────────────────────────────────────
const MODEL_PATH = new URL("../public/Quest3.glb", import.meta.url).href;
const F40_MODEL_PATH = new URL("../public/f40_engine1.glb", import.meta.url).href;

// ─── auto-center model ─────────────────────────────────────────
function centerModel(object: THREE.Object3D) {
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    object.position.sub(center);
    const size = box.getSize(new THREE.Vector3());
    return { size, center };
}

// ══════════════════════════════════════════
//  QUEST 3D MODEL (ScrollModelStrip)
// ══════════════════════════════════════════
function QuestModel({
    scrollProgress,
    mouse,
    onReady,
}: {
    scrollProgress: number;
    mouse: React.MutableRefObject<{ x: number; y: number }>;
    onReady?: () => void;
}) {
    const { scene } = useGLTF(MODEL_PATH);
    const groupRef = useRef<THREE.Group>(null);
    const { camera } = useThree();
    const currentRotY = useRef(0);
    const currentRotX = useRef(0);
    const readyCalled = useRef(false);
    const cloned = useRef<THREE.Group | null>(null);

    if (!cloned.current) {
        cloned.current = scene.clone(true);
        cloned.current.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const m = child as THREE.Mesh;
                m.castShadow = true;
                m.receiveShadow = true;
            }
        });
        centerModel(cloned.current);
        const box = new THREE.Box3().setFromObject(cloned.current);
        const s = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(s.x, s.y, s.z);
        const fovRad = (42 * Math.PI) / 180;
        const dist = (maxDim / 2 / Math.tan(fovRad / 2)) * 1.6;
        (camera as THREE.PerspectiveCamera).position.set(0, 0, dist);
    }

    useFrame((_, delta) => {
        if (!groupRef.current) return;
        if (!readyCalled.current) { readyCalled.current = true; onReady?.(); }
        const targetY = scrollProgress * Math.PI * 2;
        const targetX = -mouse.current.y * 0.2;
        const mouseYaw = mouse.current.x * 0.14;
        const lerp = 1 - Math.pow(0.04, delta);
        currentRotY.current += (targetY - currentRotY.current) * lerp;
        currentRotX.current += (targetX - currentRotX.current) * lerp;
        groupRef.current.rotation.y = currentRotY.current + mouseYaw;
        groupRef.current.rotation.x = currentRotX.current;
        groupRef.current.position.y = Math.sin(Date.now() * 0.0009) * 0.04;
    });

    return (
        <group ref={groupRef} dispose={null}>
            <primitive object={cloned.current!} />
        </group>
    );
}

// ══════════════════════════════════════════
//  SPEC PANEL (ScrollModelStrip)
// ══════════════════════════════════════════
interface PanelData {
    side: "left" | "right";
    tag: string;
    title: string;
    subtitle: string;
    accent: string;
    stats: { label: string; value: string; bar?: number }[];
}

function SpecPanel({ data, show, isMobile }: { data: PanelData; show: boolean; isMobile?: boolean }) {
    const isLeft = data.side === "left";
    if (isMobile) {
        return (
            <div style={{
                position: "absolute", bottom: 80, left: "50%",
                transform: `translateX(-50%) translateY(${show ? 0 : 20}px)`,
                opacity: show ? 1 : 0,
                transition: "opacity 0.55s ease, transform 0.55s cubic-bezier(0.16,1,0.3,1)",
                width: "calc(100vw - 32px)", maxWidth: 360,
                pointerEvents: show ? "auto" : "none", zIndex: 20,
            }}>
                <div style={{ background: "rgba(255,255,255,0.96)", border: `1px solid ${data.accent}44`, backdropFilter: "blur(18px)", padding: "14px 16px", position: "relative", overflow: "hidden", boxShadow: `0 8px 32px rgba(0,0,0,0.10), 0 0 0 1px ${data.accent}22`, borderRadius: 12 }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${data.accent},transparent)` }} />
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, letterSpacing: 0.5, color: data.accent, textTransform: "uppercase", marginBottom: 6, fontWeight: 600 }}>{data.tag}</div>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 16, color: "#203f78", lineHeight: 1.2, marginBottom: 2 }}>{data.title}</div>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "rgba(32,63,120,.65)", marginBottom: 12, lineHeight: 1.5 }}>{data.subtitle}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {data.stats.slice(0, 2).map((s) => (
                            <div key={s.label}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: s.bar !== undefined ? 4 : 0 }}>
                                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 500, color: "rgba(32,63,120,.7)", textTransform: "uppercase" }}>{s.label}</span>
                                    <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 11, color: data.accent }}>{s.value}</span>
                                </div>
                                {s.bar !== undefined && (
                                    <div style={{ height: 2.5, background: "rgba(32,63,120,.08)", borderRadius: 2 }}>
                                        <div style={{ height: "100%", width: show ? `${s.bar}%` : "0%", background: `linear-gradient(90deg,${data.accent},${data.accent}88)`, borderRadius: 2, transition: `width ${0.8 + s.bar / 200}s ease ${show ? "0.3s" : "0s"}` }} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            position: "absolute",
            top: "54%",
            [isLeft ? "left" : "right"]: "3.5%",
            transform: `translateY(calc(-50% + 16px)) translateX(${show ? 0 : (isLeft ? -50 : 50)}px)`,
            opacity: show ? 1 : 0,
            transition: "opacity 0.55s ease, transform 0.55s cubic-bezier(0.16,1,0.3,1)",
            width: 280,
            pointerEvents: show ? "auto" : "none",
            zIndex: 20,
            maxHeight: "calc(100vh - 220px)",
            overflow: "hidden",
            paddingBottom: 10,
            boxSizing: "border-box",
        }}>
            <div style={{ background: "rgba(255,255,255,0.97)", border: `1px solid ${data.accent}33`, backdropFilter: "blur(18px)", padding: "20px 22px", position: "relative", overflow: "hidden", boxShadow: `0 12px 40px rgba(0,0,0,0.10), 0 0 0 1px ${data.accent}18`, borderRadius: 12 }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${data.accent},transparent)` }} />
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, letterSpacing: 1, color: data.accent, textTransform: "uppercase", marginBottom: 9, fontWeight: 600 }}>{data.tag}</div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 18, color: "#203f78", lineHeight: 1.2, marginBottom: 3 }}>{data.title}</div>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "rgba(32,63,120,.62)", marginBottom: 16, lineHeight: 1.5 }}>{data.subtitle}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                    {data.stats.map((s) => (
                        <div key={s.label}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: s.bar !== undefined ? 5 : 0 }}>
                                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 500, color: "rgba(32,63,120,.58)", textTransform: "uppercase" }}>{s.label}</span>
                                <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 12, color: data.accent }}>{s.value}</span>
                            </div>
                            {s.bar !== undefined && (
                                <div style={{ height: 2.5, background: "rgba(32,63,120,.08)", borderRadius: 2 }}>
                                    <div style={{ height: "100%", width: show ? `${s.bar}%` : "0%", background: `linear-gradient(90deg,${data.accent},${data.accent}88)`, borderRadius: 2, transition: `width ${0.8 + s.bar / 200}s ease ${show ? "0.3s" : "0s"}` }} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div style={{ marginTop: 14, paddingTop: 11, borderTop: `1px solid ${data.accent}22`, display: "flex", gap: 5, alignItems: "center" }}>
                    {[1, 2, 3].map((i) => (
                        <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: i === 1 ? data.accent : `${data.accent}44`, boxShadow: i === 1 ? `0 0 6px ${data.accent}` : "none" }} />
                    ))}
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, color: "rgba(32,63,120,.45)", letterSpacing: 0.5, marginLeft: 4, fontWeight: 500 }}>VERIFIED SPECS</span>
                </div>
            </div>
            <div style={{ position: "absolute", top: "50%", [isLeft ? "right" : "left"]: -32, width: 32, height: 1, background: `linear-gradient(${isLeft ? "90deg" : "270deg"},transparent,${data.accent}55)`, transform: "translateY(-50%)" }} />
        </div>
    );
}

// ══════════════════════════════════════════
//  DEGREE RING
// ══════════════════════════════════════════
function DegreeRing({ p, isMobile }: { p: number; isMobile?: boolean }) {
    const deg = Math.round(p * 360);
    const r = 26;
    const circ = 2 * Math.PI * r;
    return (
        <div style={{ position: "absolute", bottom: isMobile ? 24 : 32, right: isMobile ? 16 : 72, zIndex: 20, width: 66, height: 66 }}>
            <svg viewBox="0 0 64 64" style={{ width: "100%", height: "100%" }}>
                <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(32,63,120,.15)" strokeWidth="1" strokeDasharray="3 3" />
                <circle cx="32" cy="32" r={r} fill="none" stroke="#203f78" strokeWidth="1.8"
                    strokeDasharray={`${(p * circ).toFixed(1)} ${circ}`}
                    strokeLinecap="round" transform="rotate(-90 32 32)"
                />
                <text x="32" y="28" textAnchor="middle" fontFamily="'Inter',sans-serif" fontSize="11" fontWeight="700" fill="#203f78">{deg}°</text>
                <text x="32" y="41" textAnchor="middle" fontFamily="'Inter',sans-serif" fontSize="7" fill="rgba(32,63,120,.6)" fontWeight="500">ROTATE</text>
            </svg>
        </div>
    );
}

// ══════════════════════════════════════════
//  PHASE BAR
// ══════════════════════════════════════════
const PHASES = ["Assembly", "Facility", "Training", "Safety"];

function PhaseBar({ p, isMobile }: { p: number; isMobile?: boolean }) {
    const active = Math.min(3, Math.floor(p * 4));
    return (
        <div style={{ position: "absolute", bottom: isMobile ? 18 : 34, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 0, zIndex: 20 }}>
            {PHASES.map((ph, i) => (
                <div key={ph} style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: isMobile ? 5 : 7 }}>
                        <div style={{ width: i === active ? (isMobile ? 7 : 9) : (isMobile ? 5 : 6), height: i === active ? (isMobile ? 7 : 9) : (isMobile ? 5 : 6), borderRadius: "50%", background: i <= active ? "#203f78" : "rgba(32,63,120,.2)", boxShadow: i === active ? "0 0 12px rgba(32,63,120,0.5)" : "none", transition: "all .4s ease" }} />
                        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: isMobile ? 7 : 8.5, letterSpacing: isMobile ? 0.5 : 1, color: i === active ? "#203f78" : "rgba(32,63,120,.5)", textTransform: "uppercase", transition: "color .4s", fontWeight: 600 }}>{ph}</div>
                    </div>
                    {i < PHASES.length - 1 && (
                        <div style={{ width: isMobile ? 24 : 40, height: 1, margin: isMobile ? "0 4px 16px" : "0 6px 20px", background: i < active ? "rgba(32,63,120,.35)" : "rgba(32,63,120,.12)", transition: "background .5s" }} />
                    )}
                </div>
            ))}
        </div>
    );
}

// ══════════════════════════════════════════
//  PANELS DATA
// ══════════════════════════════════════════
const PANELS: PanelData[] = [
    { side: "left", tag: "// Engine Assembly", title: "V8 Block Build", subtitle: "Live guided engine assembly training", accent: "#203f78", stats: [{ label: "Operator Training", value: "Guided Assembly Steps" }, { label: "Simulation Practice", value: "Repeatable Hands-on Tasks", bar: 86 }, { label: "Skill Assessment", value: "Process Validation Test", bar: 82 }, { label: "Final Evaluation", value: "Quality + Speed Score", bar: 94 }] },
    { side: "right", tag: "// Company Tour", title: "Virtual Facility", subtitle: "Immersive plant floor walkthrough", accent: "#2c5a9e", stats: [{ label: "Facility Training", value: "Guided Area Walkthrough" }, { label: "Zone Practice", value: "Explore Departments Interactively", bar: 84 }, { label: "Location Test", value: "Identify Zones & Equipment", bar: 78 }, { label: "Understanding Score", value: "Navigation + Awareness", bar: 90 }] },
    { side: "left", tag: "// Workforce Training", title: "Operator Skills", subtitle: "Hands-on VR skill certification", accent: "#00995c", stats: [{ label: "Skill Training", value: "Step-wise Task Learning" }, { label: "Hands-on Practice", value: "Repeatable Job Simulation", bar: 88 }, { label: "Skill Test", value: "Real Task Validation", bar: 85 }, { label: "Certification Score", value: "Performance + Accuracy", bar: 94 }] },
    { side: "right", tag: "// Safety Protocol", title: "Hazard Simulation", subtitle: "Zero-risk emergency response drills", accent: "#c47c00", stats: [{ label: "Safety Training", value: "Hazard Awareness Learning" }, { label: "Emergency Practice", value: "Simulated Risk Scenarios", bar: 87 }, { label: "Response Test", value: "Action & Decision Check", bar: 83 }, { label: "Safety Score", value: "Reaction + Compliance", bar: 95 }] },
];

// ══════════════════════════════════════════
//  SCROLL MODEL STRIP
// ══════════════════════════════════════════
function ScrollModelStrip() {
    const stripRef = useRef<HTMLDivElement>(null);
    const [progress, setProgress] = useState(0);
    const mouse = useRef({ x: 0, y: 0 });
    const [modelReady, setModelReady] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    useEffect(() => {
        const fn = () => {
            if (!stripRef.current) return;
            const rect = stripRef.current.getBoundingClientRect();
            const scrollable = stripRef.current.offsetHeight - window.innerHeight;
            const entered = -rect.top;
            setProgress(Math.max(0, Math.min(1, entered / scrollable)));
        };
        window.addEventListener("scroll", fn, { passive: true });
        fn();
        return () => window.removeEventListener("scroll", fn);
    }, []);

    useEffect(() => {
        const fn = (e: MouseEvent) => {
            mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
            mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
        };
        window.addEventListener("mousemove", fn);
        return () => window.removeEventListener("mousemove", fn);
    }, []);

    const onReady = useCallback(() => setModelReady(true), []);
    const panelIdx = Math.min(3, Math.floor(progress * 4));

    return (
        <div ref={stripRef} style={{ height: "400vh", position: "relative" }}>
            <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden", background: "#f4f7fb" }}>
                <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "linear-gradient(rgba(32,63,120,0.055) 1px,transparent 1px),linear-gradient(90deg,rgba(32,63,120,0.055) 1px,transparent 1px)", backgroundSize: "64px 64px" }} />
                <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `radial-gradient(ellipse 48% 38% at 50% 50%, rgba(32,63,120,${0.06 + progress * 0.08}), rgba(44,90,158,${0.03 + progress * 0.04}) 45%, transparent 70%)` }} />
                <div style={{ position: "absolute", top: isMobile ? 72 : 88, left: "50%", transform: "translateX(-50%)", textAlign: "center", zIndex: 25, whiteSpace: "nowrap" }}>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: isMobile ? 10 : 11, letterSpacing: isMobile ? 1 : 2, color: "rgba(32,63,120,.5)", textTransform: "uppercase", marginBottom: 7, fontWeight: 500 }}>// Interactive 360° Breakdown</div>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: isMobile ? 18 : 26, color: "#203f78", letterSpacing: "-0.5px" }}>
                        Industrial XR — <span style={{ background: "linear-gradient(90deg,#203f78,#2c5a9e)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Experience Explorer</span>
                    </div>
                </div>
                {PANELS.map((panel, i) => (<SpecPanel key={panel.tag} data={panel} show={i === panelIdx && modelReady} isMobile={isMobile} />))}
                <div style={{ position: "absolute", inset: 0, zIndex: 10 }}>
                    {!modelReady && (
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 14 }}>
                            <div style={{ width: 52, height: 52, borderRadius: "50%", border: "1.5px solid rgba(32,63,120,.15)", borderTop: "1.5px solid #203f78", animation: "spinLoad 1s linear infinite" }} />
                            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, letterSpacing: 1, color: "rgba(32,63,120,.6)", fontWeight: 500 }}>LOADING MODEL…</div>
                        </div>
                    )}
                    <Canvas camera={{ position: [0, 0, 5], fov: 42 }} gl={{ antialias: true, alpha: true }} style={{ background: "#f4f7fb" }} shadows dpr={[1, 2]}>
                        <ambientLight intensity={0.6} />
                        <directionalLight position={[3, 5, 4]} intensity={1.4} castShadow color="#ffffff" />
                        <pointLight position={[-4, 2, 2]} intensity={0.5} color="#203f78" />
                        <pointLight position={[4, -2, -2]} intensity={0.3} color="#2c5a9e" />
                        <pointLight position={[0, 0, 4]} intensity={progress * 1.2} color="#203f78" />
                        <Suspense fallback={null}>
                            <Environment preset="city" />
                            <QuestModel scrollProgress={progress} mouse={mouse} onReady={onReady} />
                            <ContactShadows position={[0, -1.9, 0]} opacity={0.12 + progress * 0.2} scale={6} blur={3.5} far={5} color="#c8d8f0" />
                        </Suspense>
                    </Canvas>
                </div>
                <PhaseBar p={progress} isMobile={isMobile} />
                <DegreeRing p={progress} isMobile={isMobile} />
                {progress < 0.035 && (
                    <div style={{ position: "absolute", bottom: isMobile ? 85 : 95, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, zIndex: 25 }}>
                        <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, letterSpacing: 1, color: "rgba(32,63,120,.6)", textTransform: "uppercase", fontWeight: 500 }}>Scroll to rotate</span>
                        <div style={{ width: 20, height: 32, border: "1px solid rgba(32,63,120,.3)", borderRadius: 10, display: "flex", justifyContent: "center", paddingTop: 5 }}>
                            <div style={{ width: 3.5, height: 7, background: "#203f78", borderRadius: 2, animation: "scrollDot 1.6s ease-in-out infinite" }} />
                        </div>
                    </div>
                )}
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "rgba(32,63,120,.1)", zIndex: 30 }}>
                    <div style={{ height: "100%", width: `${progress * 100}%`, background: "linear-gradient(90deg,#203f78,#2c5a9e)", transition: "width .06s linear" }} />
                </div>
            </div>
        </div>
    );
}

useGLTF.preload(MODEL_PATH);

// ══════════════════════════════════════════
//  F40 MODEL INNER
// ══════════════════════════════════════════
function F40ModelInner({ rotationRef, isDragging, onReady }: { rotationRef: React.MutableRefObject<{ x: number; y: number }>; isDragging: React.MutableRefObject<boolean>; onReady?: () => void; }) {
    const { scene } = useGLTF(F40_MODEL_PATH);
    const groupRef = useRef<THREE.Group>(null);
    const { camera } = useThree();
    const currentRotY = useRef(0);
    const currentRotX = useRef(0);
    const readyCalled = useRef(false);
    const autoRotateY = useRef(0);
    const cloned = useRef<THREE.Group | null>(null);

    if (!cloned.current) {
        cloned.current = scene.clone(true);
        cloned.current.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const m = child as THREE.Mesh;
                m.castShadow = true;
                m.receiveShadow = true;
                m.material = new THREE.MeshStandardMaterial({ color: new THREE.Color("#5f5c5c"), metalness: 0.85, roughness: 0.25, envMapIntensity: 1.5 });
            }
        });
        centerModel(cloned.current);
        const box = new THREE.Box3().setFromObject(cloned.current);
        const s = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(s.x, s.y, s.z);
        const fovRad = (42 * Math.PI) / 180;
        const dist = (maxDim / 2 / Math.tan(fovRad / 2)) * 1.05;
        (camera as THREE.PerspectiveCamera).position.set(0, 0, dist);
    }

    useFrame((_, delta) => {
        if (!groupRef.current) return;
        if (!readyCalled.current) { readyCalled.current = true; onReady?.(); }
        const lerp = 1 - Math.pow(0.03, delta);
        if (!isDragging.current) {
            autoRotateY.current += delta * 0.35;
            rotationRef.current.y = autoRotateY.current;
        } else {
            autoRotateY.current = rotationRef.current.y;
        }
        currentRotY.current += (rotationRef.current.y - currentRotY.current) * lerp;
        currentRotX.current += (rotationRef.current.x - currentRotX.current) * lerp;
        groupRef.current.rotation.y = currentRotY.current;
        groupRef.current.rotation.x = currentRotX.current;
        groupRef.current.position.y = Math.sin(Date.now() * 0.0009) * 0.03;
    });

    return (
        <group ref={groupRef} dispose={null}>
            <primitive object={cloned.current!} />
        </group>
    );
}

// ══════════════════════════════════════════
//  HERO MODEL VIEWER
// ══════════════════════════════════════════
function HeroModelViewer({ isMobile }: { isMobile?: boolean }) {
    const [modelReady, setModelReady] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const onReady = useCallback(() => setModelReady(true), []);
    const rotationRef = useRef({ x: -0.12, y: 0 });
    const dragState = useRef({ dragging: false, lastX: 0, lastY: 0 });
    const isDragging = useRef(false);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const onMouseDown = (e: MouseEvent) => { dragState.current.dragging = true; isDragging.current = true; dragState.current.lastX = e.clientX; dragState.current.lastY = e.clientY; el.style.cursor = "grabbing"; };
        const onMouseMove = (e: MouseEvent) => { if (!dragState.current.dragging) return; const dx = e.clientX - dragState.current.lastX; const dy = e.clientY - dragState.current.lastY; dragState.current.lastX = e.clientX; dragState.current.lastY = e.clientY; rotationRef.current.y += dx * 0.008; rotationRef.current.x += dy * 0.008; rotationRef.current.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, rotationRef.current.x)); };
        const onMouseUp = () => { dragState.current.dragging = false; isDragging.current = false; el.style.cursor = "grab"; };
        const onTouchStart = (e: TouchEvent) => { dragState.current.dragging = true; isDragging.current = true; dragState.current.lastX = e.touches[0].clientX; dragState.current.lastY = e.touches[0].clientY; };
        const onTouchMove = (e: TouchEvent) => { if (!dragState.current.dragging) return; const dx = e.touches[0].clientX - dragState.current.lastX; const dy = e.touches[0].clientY - dragState.current.lastY; dragState.current.lastX = e.touches[0].clientX; dragState.current.lastY = e.touches[0].clientY; rotationRef.current.y += dx * 0.008; rotationRef.current.x += dy * 0.008; rotationRef.current.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, rotationRef.current.x)); };
        const onTouchEnd = () => { dragState.current.dragging = false; isDragging.current = false; };
        el.addEventListener("mousedown", onMouseDown); window.addEventListener("mousemove", onMouseMove); window.addEventListener("mouseup", onMouseUp); el.addEventListener("touchstart", onTouchStart); window.addEventListener("touchmove", onTouchMove); window.addEventListener("touchend", onTouchEnd);
        return () => { el.removeEventListener("mousedown", onMouseDown); window.removeEventListener("mousemove", onMouseMove); window.removeEventListener("mouseup", onMouseUp); el.removeEventListener("touchstart", onTouchStart); window.removeEventListener("touchmove", onTouchMove); window.removeEventListener("touchend", onTouchEnd); };
    }, []);

    if (isMobile) {
        return (
            <div ref={containerRef} style={{ width: "100%", height: "260px", position: "relative", cursor: "grab" }}>
                {!modelReady && (<div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ width: 44, height: 44, borderRadius: "50%", border: "1.5px solid rgba(32,63,120,.15)", borderTop: "1.5px solid #203f78", animation: "spinLoad 1s linear infinite" }} /></div>)}
                <Canvas camera={{ position: [0, 0, 5], fov: 42 }} gl={{ antialias: true, alpha: true }} style={{ background: "transparent", width: "100%", height: "100%" }} shadows dpr={[1, 1.5]}>
                    <ambientLight intensity={0.55} /><directionalLight position={[5, 8, 5]} intensity={1.1} castShadow color="#ffffff" /><directionalLight position={[-5, 3, -4]} intensity={0.4} color="#ffffff" /><pointLight position={[3, 2, 4]} intensity={0.5} color="#ffffff" />
                    <Suspense fallback={null}><Environment preset="studio" /><F40ModelInner rotationRef={rotationRef} isDragging={isDragging} onReady={onReady} /><ContactShadows position={[0, -1.9, 0]} opacity={0.15} scale={8} blur={3} far={5} color="#b8cce4" /></Suspense>
                </Canvas>
                <div style={{ position: "absolute", top: "12px", right: "12px", display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", background: "rgba(255,255,255,0.88)", border: "1px solid rgba(32,63,120,0.2)", backdropFilter: "blur(8px)", borderRadius: "999px", opacity: modelReady ? 1 : 0, transition: "opacity 0.6s ease", pointerEvents: "none", boxShadow: "0 2px 12px rgba(0,0,0,.08)" }}>
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, letterSpacing: 0.5, color: "rgba(32,63,120,0.85)", textTransform: "uppercase", fontWeight: 500 }}>Drag to Interact</span>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} style={{ position: "absolute", right: "-60px", bottom: "80px", height: "85vh", minWidth: 520, zIndex: 1, cursor: "grab", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end" }}>
            <div style={{ width: "100%", flex: 1, position: "relative" }}>
                {!modelReady && (<div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}><div style={{ width: 44, height: 44, borderRadius: "50%", border: "1.5px solid rgba(32,63,120,.15)", borderTop: "1.5px solid #203f78", animation: "spinLoad 1s linear infinite" }} /><div style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, letterSpacing: 1, color: "rgba(32,63,120,.6)", fontWeight: 500 }}>LOADING MODEL…</div></div>)}
                <Canvas camera={{ position: [0, 0, 5], fov: 42 }} gl={{ antialias: true, alpha: true }} style={{ background: "transparent", width: "100%", height: "100%" }} shadows dpr={[1, 2]}>
                    <ambientLight intensity={0.55} /><directionalLight position={[5, 8, 5]} intensity={1.1} castShadow color="#ffffff" /><directionalLight position={[-5, 3, -4]} intensity={0.4} color="#ffffff" /><directionalLight position={[0, -4, 3]} intensity={0.3} color="#ffffff" /><pointLight position={[3, 2, 4]} intensity={0.5} color="#ffffff" />
                    <Suspense fallback={null}><Environment preset="studio" /><F40ModelInner rotationRef={rotationRef} isDragging={isDragging} onReady={onReady} /><ContactShadows position={[0, -1.9, 0]} opacity={0.15} scale={8} blur={3} far={5} color="#b8cce4" /></Suspense>
                </Canvas>
            </div>
            <div style={{ position: "absolute", top: "24px", right: "24px", display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", background: "rgba(255,255,255,0.9)", border: "1px solid rgba(32,63,120,0.2)", backdropFilter: "blur(8px)", borderRadius: "999px", opacity: modelReady ? 1 : 0, transition: "opacity 0.6s ease", pointerEvents: "none", boxShadow: "0 2px 12px rgba(0,0,0,.08)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#203f78" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 11V6a2 2 0 0 0-4 0v5" /><path d="M14 10V4a2 2 0 0 0-4 0v6" /><path d="M10 10.5V6a2 2 0 0 0-4 0v8" /><path d="M6 14a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4v-2.5" /><path d="M18 11a2 2 0 0 1 4 0v3" /></svg>
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, letterSpacing: 0.5, color: "rgba(32,63,120,0.85)", textTransform: "uppercase", fontWeight: 500 }}>Drag to Interact</span>
            </div>
        </div>
    );
}

useGLTF.preload(F40_MODEL_PATH);

// ══════════════════════════════════════════
//  XR ORBIT OVERVIEW PANEL
// ══════════════════════════════════════════
function XROverviewPanel() {
    const mountRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const el = mountRef.current;
        if (!el) return;
        const W = el.clientWidth || 400;
        const H = 420;
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(W, H);
        el.style.position = "relative";
        el.appendChild(renderer.domElement);
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffffff);
        const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 100);
        camera.position.set(0, 0.5, 6.5);
        scene.add(new THREE.AmbientLight(0xffffff, 1.0));
        const dir = new THREE.DirectionalLight(0xffffff, 0.4);
        dir.position.set(5, 8, 5);
        scene.add(dir);
        const wireMat = new THREE.MeshBasicMaterial({ color: 0x203f78, wireframe: true, transparent: true, opacity: 0.55 });
        const wireSphere = new THREE.Mesh(new THREE.IcosahedronGeometry(1.55, 3), wireMat);
        scene.add(wireSphere);
        const innerSphere = new THREE.Mesh(new THREE.IcosahedronGeometry(1.52, 3), new THREE.MeshBasicMaterial({ color: 0xe4eef9, transparent: true, opacity: 0.5 }));
        scene.add(innerSphere);
        function makeOrbitLine(rx: number, ry: number, tiltX: number, color: number, opacity: number): THREE.Line {
            const pts: THREE.Vector3[] = [];
            for (let i = 0; i <= 128; i++) { const a = (i / 128) * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * rx, 0, Math.sin(a) * ry)); }
            const geo = new THREE.BufferGeometry().setFromPoints(pts);
            const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
            const line = new THREE.Line(geo, mat);
            line.rotation.x = tiltX;
            return line;
        }
        const orbit1 = makeOrbitLine(2.6, 2.6, Math.PI / 2.2, 0x203f78, 0.28);
        const orbit2 = makeOrbitLine(3.2, 3.2, Math.PI / 2.8, 0x2c5a9e, 0.18);
        const orbit3 = makeOrbitLine(2.0, 2.0, Math.PI / 1.9, 0x4d7abf, 0.22);
        orbit2.rotation.y = 0.6; orbit3.rotation.y = 1.1;
        scene.add(orbit1, orbit2, orbit3);
        const satBaseGeo = new THREE.SphereGeometry(0.072, 16, 16);
        interface Sat { mesh: THREE.Mesh; orbitRadius: number; tiltX: number; baseRotY: number; speed: number; offset: number; label: string | null; }
        const makeSatMat = (color: number, ei: number) => new THREE.MeshStandardMaterial({ color, emissive: new THREE.Color(color), emissiveIntensity: ei, metalness: 0.1, roughness: 0.3 });
        const sats: Sat[] = [
            { mesh: new THREE.Mesh(satBaseGeo, makeSatMat(0x203f78, 0.8)), orbitRadius: 2.6, tiltX: Math.PI / 2.2, baseRotY: 0, speed: 0.38, offset: 0, label: "Meta Quest" },
            { mesh: new THREE.Mesh(satBaseGeo, makeSatMat(0x2c5a9e, 0.8)), orbitRadius: 3.2, tiltX: Math.PI / 2.8, baseRotY: 0.6, speed: 0.26, offset: 2.1, label: "Apple Vision Pro" },
            { mesh: new THREE.Mesh(satBaseGeo, makeSatMat(0x4d7abf, 0.9)), orbitRadius: 2.6, tiltX: Math.PI / 2.2, baseRotY: 0, speed: 0.38, offset: 3.5, label: "HoloLens 2" },
            { mesh: new THREE.Mesh(satBaseGeo, makeSatMat(0x0055cc, 0.7)), orbitRadius: 2.0, tiltX: Math.PI / 1.9, baseRotY: 1.1, speed: 0.52, offset: 1.2, label: null },
            { mesh: new THREE.Mesh(satBaseGeo, makeSatMat(0x2c5a9e, 0.7)), orbitRadius: 2.0, tiltX: Math.PI / 1.9, baseRotY: 1.1, speed: 0.52, offset: 4.0, label: null },
        ];
        sats.forEach(s => scene.add(s.mesh));
        const starCount = 200; const starPos = new Float32Array(starCount * 3);
        for (let i = 0; i < starCount; i++) { starPos[i * 3] = (Math.random() - 0.5) * 32; starPos[i * 3 + 1] = (Math.random() - 0.5) * 22; starPos[i * 3 + 2] = (Math.random() - 0.5) * 16 - 5; }
        const starGeo = new THREE.BufferGeometry();
        starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
        scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0x90b8d8, size: 0.042, transparent: true, opacity: 0.5 })));
        const overlay = document.createElement("canvas");
        overlay.style.cssText = `position:absolute;top:0;left:0;width:${W}px;height:${H}px;pointer-events:none;`;
        overlay.width = W * Math.min(window.devicePixelRatio, 2); overlay.height = H * Math.min(window.devicePixelRatio, 2);
        el.appendChild(overlay);
        const ctx = overlay.getContext("2d")!;
        ctx.scale(Math.min(window.devicePixelRatio, 2), Math.min(window.devicePixelRatio, 2));
        function drawLabel(text: string, sx: number, sy: number, side: "left" | "right") {
            ctx.font = "500 11px 'Inter', sans-serif";
            const tw = ctx.measureText(text).width; const pad = 10; const bw = tw + pad * 2; const bh = 26;
            const bx = side === "left" ? sx - bw - 10 : sx + 10; const by = sy - bh / 2;
            ctx.fillStyle = "rgba(255,255,255,0.94)"; ctx.strokeStyle = "rgba(32,63,120,0.32)"; ctx.lineWidth = 1;
            ctx.beginPath(); (ctx as any).roundRect(bx, by, bw, bh, 6); ctx.fill(); ctx.stroke();
            ctx.fillStyle = "#203f78"; ctx.textBaseline = "middle"; ctx.fillText(text, bx + pad, by + bh / 2);
            ctx.strokeStyle = "rgba(32,63,120,0.22)"; ctx.lineWidth = 0.8; ctx.setLineDash([3, 4]);
            ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(side === "left" ? bx + bw : bx, sy); ctx.stroke(); ctx.setLineDash([]);
        }
        function drawBottomBadge() {
            const text = "SPATIAL WEB — LIVE PREVIEW"; ctx.font = "600 11px 'Inter', sans-serif";
            const tw = ctx.measureText(text).width; const bw = tw + 28; const bh = 30; const bx = W / 2 - bw / 2; const by = H - 50;
            ctx.fillStyle = "rgba(255,255,255,0.92)"; ctx.strokeStyle = "rgba(32,63,120,0.28)"; ctx.lineWidth = 1;
            ctx.beginPath(); (ctx as any).roundRect(bx, by, bw, bh, 6); ctx.fill(); ctx.stroke();
            ctx.fillStyle = "#203f78"; ctx.textBaseline = "middle"; ctx.textAlign = "center";
            ctx.fillText(text, W / 2, by + bh / 2); ctx.textAlign = "left";
        }
        function projectToScreen(v3: THREE.Vector3) {
            const v = v3.clone().project(camera);
            return { x: (v.x * 0.5 + 0.5) * W, y: (-v.y * 0.5 + 0.5) * H };
        }
        let rotY = 0, rotX = 0.18, isDragging = false, prevX = 0, prevY = 0;
        const onDown = (e: MouseEvent) => { isDragging = true; prevX = e.clientX; prevY = e.clientY; renderer.domElement.style.cursor = "grabbing"; };
        const onUp = () => { isDragging = false; renderer.domElement.style.cursor = "grab"; };
        const onMove = (e: MouseEvent) => { if (!isDragging) return; rotY += (e.clientX - prevX) * 0.008; rotX = Math.max(-0.65, Math.min(0.65, rotX + (e.clientY - prevY) * 0.006)); prevX = e.clientX; prevY = e.clientY; };
        renderer.domElement.style.cursor = "grab";
        renderer.domElement.addEventListener("mousedown", onDown); window.addEventListener("mouseup", onUp); window.addEventListener("mousemove", onMove);
        let rafId = 0;
        function animate() {
            rafId = requestAnimationFrame(animate);
            const t = performance.now() * 0.001;
            if (!isDragging) rotY += 0.0038;
            wireSphere.rotation.y = rotY; wireSphere.rotation.x = rotX;
            innerSphere.rotation.y = rotY; innerSphere.rotation.x = rotX;
            orbit1.rotation.y = rotY * 0.6; orbit2.rotation.y = 0.6 + rotY * 0.5; orbit3.rotation.y = 1.1 + rotY * 0.7;
            wireMat.opacity = 0.45 + Math.sin(t * 0.8) * 0.1;
            sats.forEach(s => {
                const angle = t * s.speed + s.offset;
                const lx = Math.cos(angle) * s.orbitRadius; const lz = Math.sin(angle) * s.orbitRadius;
                const tilt = Math.PI / 2 - s.tiltX;
                const ly = lz * Math.sin(tilt); const lz2 = lz * Math.cos(tilt);
                const ry = s.baseRotY + rotY * (s.orbitRadius === 3.2 ? 0.5 : s.orbitRadius === 2.0 ? 0.7 : 0.6);
                const cosY = Math.cos(ry); const sinY = Math.sin(ry);
                s.mesh.position.set(lx * cosY - lz2 * sinY, ly, lx * sinY + lz2 * cosY);
            });
            renderer.render(scene, camera);
            ctx.clearRect(0, 0, W, H);
            drawBottomBadge();
            sats.forEach(s => {
                if (!s.label) return;
                const sp = projectToScreen(s.mesh.position);
                if (sp.x < 20 || sp.x > W - 20 || sp.y < 20 || sp.y > H - 65) return;
                drawLabel(s.label, sp.x, sp.y, sp.x < W / 2 ? "left" : "right");
            });
        }
        animate();
        return () => { cancelAnimationFrame(rafId); renderer.domElement.removeEventListener("mousedown", onDown); window.removeEventListener("mouseup", onUp); window.removeEventListener("mousemove", onMove); renderer.dispose(); el.innerHTML = ""; };
    }, []);
    return <div ref={mountRef} style={{ width: "100%", height: 420, background: "#f4f7fb", overflow: "hidden", borderRadius: 12 }} />;
}

// ══════════════════════════════════════════
//  CERTIFICATE SVG
// ══════════════════════════════════════════
function CertificateSVG() {
    return (
        <svg viewBox="0 0 800 560" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", maxWidth: 700 }}>
            <defs>
                <linearGradient id="cbg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#f8f5ec" /><stop offset="100%" stopColor="#fdf8ee" /></linearGradient>
                <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#b8860b" /><stop offset="50%" stopColor="#d4a017" /><stop offset="100%" stopColor="#996515" /></linearGradient>
                <linearGradient id="cyg" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#203f78" /><stop offset="100%" stopColor="#2c5a9e" /></linearGradient>
                <filter id="cg"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                <pattern id="gp" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0L0 0 0 40" fill="none" stroke="rgba(32,63,120,0.055)" strokeWidth=".5" /></pattern>
            </defs>
            <rect width="800" height="560" fill="url(#cbg)" rx="3" />
            <rect width="800" height="560" fill="url(#gp)" rx="3" />
            <rect x="11" y="11" width="778" height="538" fill="none" stroke="url(#gold)" strokeWidth="2" rx="3" />
            <rect x="19" y="19" width="762" height="522" fill="none" stroke="rgba(184,134,11,.3)" strokeWidth=".8" rx="2" />
            {([[30, 30], [770, 30], [30, 530], [770, 530]] as [number, number][]).map(([cx, cy], i) => (
                <g key={i} transform={`translate(${cx},${cy})`}><circle r="10" fill="none" stroke="url(#gold)" strokeWidth="1.5" /><circle r="5" fill="rgba(184,134,11,.18)" /><circle r="2" fill="url(#gold)" /></g>
            ))}
            {([[50, 30, 195, 30], [605, 30, 750, 30], [50, 530, 195, 530], [605, 530, 750, 530]] as [number, number, number, number][]).map(([x1, y1, x2, y2], i) => (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="url(#gold)" strokeWidth="1" opacity=".45" />
            ))}
            <text x="400" y="66" textAnchor="middle" fontFamily="'Inter',sans-serif" fontSize="10" fill="rgba(32,63,120,.6)" letterSpacing="4" fontWeight="500">XRFORGE · VERIFIED CREDENTIAL</text>
            <text x="400" y="114" textAnchor="middle" fontFamily="Georgia,serif" fontSize="30" fill="url(#gold)" letterSpacing="4" fontStyle="italic">Certificate of Completion</text>
            <line x1="100" y1="127" x2="700" y2="127" stroke="url(#gold)" strokeWidth=".8" opacity=".45" />
            <circle cx="400" cy="127" r="3" fill="url(#gold)" />
            <text x="400" y="168" textAnchor="middle" fontFamily="'Inter',sans-serif" fontSize="13" fill="rgba(30,40,60,.55)" letterSpacing="2" fontWeight="500">THIS CERTIFIES THAT</text>
            <text x="400" y="218" textAnchor="middle" fontFamily="Georgia,serif" fontSize="42" fill="#1a2340" fontStyle="italic">Your Name</text>
            <line x1="155" y1="230" x2="645" y2="230" stroke="rgba(32,63,120,.2)" strokeWidth=".8" />
            <text x="400" y="263" textAnchor="middle" fontFamily="'Inter',sans-serif" fontSize="12" fill="rgba(30,40,60,.5)" letterSpacing="2" fontWeight="500">HAS SUCCESSFULLY COMPLETED</text>
            <text x="400" y="304" textAnchor="middle" fontFamily="'Inter',sans-serif" fontSize="18" fill="url(#cyg)" letterSpacing="0.5" fontWeight="600">AR / VR Immersive Learning — Foundation Module</text>
            <rect x="158" y="326" width="484" height="52" rx="6" fill="rgba(32,63,120,.04)" stroke="rgba(32,63,120,.18)" strokeWidth=".8" />
            {([["MODULES", "12 Completed", 255], ["ASSESSMENT", "MCQ + Labs", 400], ["ISSUED", "Jan 2025", 545]] as [string, string, number][]).map(([lbl, val, x]) => (
                <g key={lbl}><text x={x} y="345" textAnchor="middle" fontFamily="'Inter',sans-serif" fontSize="9" fill="rgba(32,63,120,.55)" letterSpacing="1.5" fontWeight="500">{lbl}</text><text x={x} y="363" textAnchor="middle" fontFamily="'Inter',sans-serif" fontSize="13" fill="#1a2340" fontWeight="600">{val}</text></g>
            ))}
            <line x1="320" y1="332" x2="320" y2="372" stroke="rgba(32,63,120,.15)" strokeWidth=".5" />
            <line x1="480" y1="332" x2="480" y2="372" stroke="rgba(32,63,120,.15)" strokeWidth=".5" />
            <line x1="100" y1="400" x2="700" y2="400" stroke="rgba(184,134,11,.22)" strokeWidth=".6" />
            <text x="400" y="438" textAnchor="middle" fontFamily="Georgia,serif" fontSize="17" fill="#1a2340" fontStyle="italic">Kapil Khurana</text>
            <line x1="290" y1="449" x2="510" y2="449" stroke="rgba(184,134,11,.4)" strokeWidth=".8" />
            <text x="400" y="463" textAnchor="middle" fontFamily="'Inter',sans-serif" fontSize="9" fill="rgba(30,40,60,.45)" letterSpacing="1.5" fontWeight="500">PROGRAM COORDINATOR</text>
            <text x="400" y="510" textAnchor="middle" fontFamily="'Inter',sans-serif" fontSize="9" fill="rgba(32,63,120,.38)" letterSpacing="2" fontWeight="500">CERT-ID: XRSLM-2025-AR-00847 · BLOCKCHAIN VERIFIED</text>
        </svg>
    );
}

// ══════════════════════════════════════════
//  CURRICULUM ROW
// ══════════════════════════════════════════
function CurrRow({ num, title, topics, open: initOpen }: { num: string; title: string; topics: string[]; open: boolean; }) {
    const [open, setOpen] = useState(initOpen);
    return (
        <div className="border-b border-gray-200 group">
            <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 py-5 text-left bg-transparent border-none cursor-pointer hover:text-[#203f78] transition-colors">
                <span className="font-semibold text-xs text-[#203f78] w-6 flex-shrink-0">{num}</span>
                <span className="flex-1 font-semibold text-sm text-gray-900 group-hover:text-[#203f78]">{title}</span>
                <span className={`text-[#203f78] text-xs transition-transform duration-300 ${open ? "rotate-90" : ""}`}>▶</span>
            </button>
            {open && (
                <div className="pb-5 pl-9 flex flex-wrap gap-2">
                    {topics.map((t) => (
                        <span key={t} className="text-xs text-gray-600 px-3 py-1 border border-blue-100 bg-blue-50/50 rounded-lg">↳ {t}</span>
                    ))}
                </div>
            )}
        </div>
    );
}

// ══════════════════════════════════════════
//  LOGIN FORM (right sticky panel)
// ══════════════════════════════════════════
const LoginFormPanel = ({
    email, setEmail, password, setPassword,
    showPassword, setShowPassword, loading, handleSubmit,
}: {
    email: string; setEmail: (v: string) => void;
    password: string; setPassword: (v: string) => void;
    showPassword: boolean; setShowPassword: (v: boolean) => void;
    loading: boolean; handleSubmit: (e: React.FormEvent) => void;
}) => {
    const navigate = useNavigate();
    return (
        <div className="w-full bg-white rounded-2xl shadow-xl border border-gray-200" style={{ boxShadow: "0 8px 40px rgba(32,63,120,.10)" }}>
            <div className="p-7">
                <h2 className="text-xl font-bold text-center mb-1" style={{ color: "#203f78", fontFamily: "'Inter',sans-serif" }}>Welcome Back!</h2>
                <p className="text-center text-sm text-gray-500 mb-6" style={{ fontFamily: "'Inter',sans-serif" }}>Sign in to access your dashboard</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700" style={{ fontFamily: "'Inter',sans-serif" }}>Email Address</label>
                        <input
                            type="email"
                            placeholder="you@xrforge.io"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#203f78] focus:border-transparent transition-all text-sm text-gray-900"
                            style={{ fontFamily: "'Inter',sans-serif" }}
                        />
                    </div>
                    <div className="relative">
                        <label className="block text-sm font-medium mb-2 text-gray-700" style={{ fontFamily: "'Inter',sans-serif" }}>Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#203f78] focus:border-transparent transition-all text-sm text-gray-900"
                            style={{ fontFamily: "'Inter',sans-serif" }}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[42px] text-gray-400 hover:text-[#203f78] transition-colors">
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 text-white font-semibold rounded-lg flex items-center justify-center gap-2 hover:shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
                        style={{ background: "linear-gradient(135deg,#203f78,#2c5a9e)", fontFamily: "'Inter',sans-serif" }}
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Signing in...
                            </span>
                        ) : (
                            <>
                                Sign In
                                <GraduationCap size={20} />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 pt-5 border-t border-gray-100 text-center">
                    <p className="text-sm text-gray-500" style={{ fontFamily: "'Inter',sans-serif" }}>
                        New learner?{" "}
                        <span onClick={() => navigate("/ar-register")} className="text-[#203f78] cursor-pointer font-semibold hover:underline">
                            Create account →
                        </span>
                    </p>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100">
                    <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-3" style={{ fontFamily: "'Inter',sans-serif" }}>Get In Touch</p>
                    <div className="space-y-1.5">
                        {[
                            { href: "tel:+919999765380", icon: <svg className="w-3.5 h-3.5 text-[#203f78]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 8V5z" /></svg>, label: "+91-9999765380" },
                            { href: "support@technovizautomation.com", icon: <Mail size={13} className="text-[#203f78]" />, label: "support@technovizautomation.com" },
                            { href: "https://www.technovizautomation.com", icon: <Globe size={13} className="text-[#203f78]" />, label: "www.technovizautomation.com" },
                        ].map(({ href, icon, label }) => (
                            <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
                                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-gray-50 hover:bg-blue-50 border border-transparent hover:border-[#203f78]/20 transition-all">
                                {icon}
                                <span className="text-xs font-medium text-[#203f78]" style={{ fontFamily: "'Inter',sans-serif" }}>{label}</span>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ══════════════════════════════════════════
//  MAIN LOGIN PAGE
// ══════════════════════════════════════════
const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [activeVideo, setActiveVideo] = useState<string | null>(null);
    const [showModules, setShowModules] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('');
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 1024);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) { toast.error('Please fill in all fields'); return; }
        setLoading(true);
        try {
            localStorage.clear();
            const res = await api.post('/accounts/login/', { email, password });
            const { user, access, refresh } = res.data;
            localStorage.setItem('access', access);
            localStorage.setItem('refresh', refresh);
            localStorage.setItem('user', JSON.stringify(user));
            toast.success('Login successful!');
            const role = user.role || 'Participant';
            setTimeout(() => { navigate(role === 'admin' ? '/admin_home' : '/user_home'); }, 400);
        } catch (err: any) {
            toast.error(err.response?.data?.detail || err.response?.data?.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const sections = ['overview', 'highlights', 'content', 'why', 'videos', 'certificate'];
        const handleScroll = () => {
            if (window.scrollY < 50) { setActiveSection(''); return; }
            let current = '';
            for (const id of sections) {
                const el = document.getElementById(id);
                if (el && el.getBoundingClientRect().top <= 120) current = id;
            }
            setActiveSection(current);
        };
        window.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { href: '#overview', label: 'Overview' },
        { href: '#highlights', label: 'Highlights' },
        { href: '#content', label: 'Content' },
        { href: '#why', label: 'Why It Works' },
        { href: '#videos', label: 'Demo' },
        { href: '#certificate', label: 'Certificate' },
    ];

    const videos = [
        { title: "Engine Assembly Simulation", url: "https://drive.google.com/file/d/1HiWUc20w9ZcGmc6UuOuhF_iLBBmVG91Z/preview", thumb: "https://drive.google.com/thumbnail?id=1HiWUc20w9ZcGmc6UuOuhF_iLBBmVG91Z" },
        { title: "Forklift Operation Training", url: "https://drive.google.com/file/d/1I9SqpQj-VgaZWR159jPPRmMCDwNwaw6S/preview", thumb: "https://drive.google.com/thumbnail?id=1I9SqpQj-VgaZWR159jPPRmMCDwNwaw6S" },
        { title: "Roller & Nut Assembly Process", url: "https://drive.google.com/file/d/14LABygDWiU8-ZweqZuZ9FI5uC1x3fflv/preview", thumb: "https://drive.google.com/thumbnail?id=14LABygDWiU8-ZweqZuZ9FI5uC1x3fflv" },
    ];

    const modules = [
        { num: "01", title: "Introduction to AR, VR, MR, and XR", topics: ["What is AR (Augmented Reality)", "What is VR (Virtual Reality)", "What is MR (Mixed Reality)", "What is XR (Extended Reality)", "Evolution of AR, VR, MR, and XR", "Differences Between AR, VR, MR, and XR", "Applications of AR, VR, MR, and XR", "Benefits of AR, VR, MR, and XR", "Future Scope of AR, VR, MR, and XR"], open: true },
        { num: "02", title: "Introduction to Unity for AR/VR Development", topics: ["What is Unity", "What is a Game Engine", "Why Unity is Used for AR/VR Development", "Features of Unity Engine", "Unity Interface Overview", "Unity Workflow for Development", "Unity Components and Game Objects", "Unity Supported Platforms", "Role of Unity in XR Development", "Unity Use Cases in Industry"], open: false },
        { num: "03", title: "Unity Installation and Setup", topics: ["Introduction to Unity Hub", "Downloading Unity Hub", "Installing Unity Hub", "Creating and Signing into Unity Account", "Installing Unity Editor (LTS Version)", "Understanding Unity Modules", "Installing Android Build Support", "Installing Windows and WebGL Build Support", "Creating a New Unity Project", "Understanding Project Templates"], open: false },
        { num: "04", title: "Unity Interface and Navigation", topics: ["Overview of Unity Editor Interface", "Scene View and Game View", "Hierarchy Window", "Inspector Window", "Project Window and Assets", "Transform Tools and Controls", "Layouts and Customization", "Role of Unity Editor", "Workflow inside Unity Editor"], open: false },
        { num: "05", title: "Game Objects and Components in Unity", topics: ["What is a Game Object", "Types of Game Objects", "Creating and Managing Game Objects", "Introduction to Components", "Transform Component", "Mesh Renderer and Materials", "Colliders and Collision Detection", "Adding and Removing Components", "Parent-Child Relationships"], open: false },
        { num: "06", title: "Introduction to C# Scripting in Unity", topics: ["What is Scripting in Unity", "Introduction to C# Programming", "Creating Your First Script", "Variables and Data Types", "Functions and Methods", "Unity Lifecycle and MonoBehaviour", "Basic Movement Script", "Conditional Statements", "Loops", "Debugging and Console Usage"], open: false },
        { num: "07", title: "Physics and Interaction in Unity", topics: ["Introduction to Physics", "Rigidbody Component", "Types of Colliders", "Collision Detection and Triggers", "Interaction Handling", "Gravity and Mass", "Raycasting Basics", "Physics Materials", "Kinematic vs Dynamic Objects"], open: false },
        { num: "08", title: "UI System in Unity", topics: ["Introduction to UI", "Canvas and UI Elements", "UI Layout and Anchoring", "Event System and Button Clicks", "Creating UI Panels", "Creating UI Menus", "Role of UI in XR", "Types of XR UI"], open: false },
        { num: "09", title: "Introduction to XR in Unity", topics: ["What is XR in Unity", "XR Development Overview", "XR Plugin Management", "OpenXR Introduction", "Supported XR Devices", "XR Origin and Input Systems", "Characteristics of XR Systems", "Applications of XR", "XR Interaction Basics"], open: false },
        { num: "10", title: "VR Development in Unity", topics: ["Introduction to VR Development", "VR Package Setup", "VR Scene Setup", "VR Controllers", "Locomotion in VR", "Interaction in VR", "Basic Concepts of VR", "Types of VR Systems", "Advantages of VR"], open: false },
        { num: "11", title: "AR Development in Unity", topics: ["Introduction to AR Development", "AR Foundation Setup", "AR Camera and Session", "Plane Detection", "Placing Objects", "Image Tracking", "Basic Concepts of AR", "Types of AR", "Advantages of AR"], open: false },
        { num: "12", title: "Build and Deployment", topics: ["Build Process Overview", "Player Settings", "Build for Android", "Build for Windows and WebGL", "Debugging Build Issues", "Purpose of Deployment", "Types of Build Outputs", "Deployment Platforms", "Build File Structure"], open: false },
    ];

    const loginFormProps = { email, setEmail, password, setPassword, showPassword, setShowPassword, loading, handleSubmit };

    return (
        <div className="bg-white min-h-screen scroll-smooth" style={{ fontFamily: "'Inter',sans-serif", color: "#203f78" }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        @keyframes spinLoad { to { transform: rotate(360deg); } }
        @keyframes scrollDot { 0%,100% { transform:translateY(0);opacity:1; } 60% { transform:translateY(9px);opacity:0.2; } }
        @keyframes fadeIn { from { opacity:0;transform:translateY(-8px); } to { opacity:1;transform:translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-in-out; }
      `}</style>

            {/* ─── STICKY NAVBAR ─── */}
            <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
                <div className="max-w-full px-4 sm:px-6 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <img src={smallogo} className="w-10 h-10 object-contain" alt="logo" />
                        <span className="font-bold text-base sm:text-lg text-[#203f78]">Technoviz Automation</span>
                    </div>

                    {/* Desktop Nav */}
                    <nav className="hidden lg:flex items-center gap-6">
                        {navLinks.map(({ href, label }) => (
                            <a key={href} href={href}
                                className={`text-sm font-medium transition-colors pb-1 ${activeSection === href.slice(1) ? 'text-[#203f78] border-b-2 border-[#203f78]' : 'text-gray-500 hover:text-[#203f78]'}`}
                                style={{ fontFamily: "'Inter',sans-serif" }}>
                                {label}
                            </a>
                        ))}
                    </nav>



                    {/* Mobile Hamburger */}
                    <button className="lg:hidden flex flex-col gap-1.5 p-2 rounded-md hover:bg-gray-100" onClick={() => setMobileNavOpen(!mobileNavOpen)} aria-label="Toggle navigation">
                        <span className={`block w-6 h-0.5 bg-[#203f78] transition-transform duration-300 ${mobileNavOpen ? 'rotate-45 translate-y-2' : ''}`} />
                        <span className={`block w-6 h-0.5 bg-[#203f78] transition-opacity duration-300 ${mobileNavOpen ? 'opacity-0' : ''}`} />
                        <span className={`block w-6 h-0.5 bg-[#203f78] transition-transform duration-300 ${mobileNavOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                    </button>
                </div>

                {/* Mobile Dropdown */}
                {mobileNavOpen && (
                    <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg animate-fadeIn">
                        <nav className="px-4 py-3 flex flex-col gap-1">
                            {navLinks.map(({ href, label }) => (
                                <a key={href} href={href} onClick={() => setMobileNavOpen(false)}
                                    className={`px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeSection === href.slice(1) ? 'text-[#203f78] bg-blue-50' : 'text-gray-600 hover:text-[#203f78] hover:bg-gray-50'}`}
                                    style={{ fontFamily: "'Inter',sans-serif" }}>
                                    {label}
                                </a>
                            ))}
                        </nav>
                    </div>
                )}
            </div>

            {/* ─── TWO-COLUMN BODY ─── */}
            <div className="flex flex-col lg:flex-row">

                {/* ══ LEFT COLUMN — scrollable content ══ */}
                <div className="w-full lg:w-3/5 xl:w-7/12">

                    {/* HERO */}
                    <div className="relative overflow-hidden px-6 sm:px-10 xl:px-14 py-10 sm:py-12 lg:py-14" style={{ background: "linear-gradient(to br, #f8faff, #eef3fb)", backgroundImage: "linear-gradient(rgba(32,63,120,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(32,63,120,.05) 1px,transparent 1px)", backgroundSize: "60px 60px" }}>
                        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 65% 55% at 30% 50%, rgba(32,63,120,.07) 0%,transparent 70%)" }} />
                        <div className="relative space-y-4 sm:space-y-5">

                            {/* Tag */}
                            <div className="inline-block mb-1">
                                <span className="text-xs font-semibold uppercase tracking-widest text-[#203f78] border border-[#203f78]/30 bg-[#203f78]/05 px-4 py-1.5 rounded-lg" style={{ fontFamily: "'Inter',sans-serif" }}>
                                    AR / VR Self-Learning Module
                                </span>
                            </div>

                            {/* Headline */}
                            <h1 className="font-bold leading-tight" style={{ fontSize: "clamp(32px,6vw,42px)", fontFamily: "'Inter',sans-serif", color: "#203f78" }}>
                                XRForge<br />
                                <span style={{ background: "linear-gradient(90deg,#203f78,#2c5a9e)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                                    AR / VR Self-Learning Module
                                </span>
                            </h1>

                            <h2 className="text-base sm:text-lg font-semibold text-gray-700" style={{ fontFamily: "'Inter',sans-serif" }}>
                                A self-paced immersive curriculum for the spatial computing era
                            </h2>

                            <p className="text-gray-600 leading-relaxed max-w-lg" style={{ fontSize: 15, fontFamily: "'Inter',sans-serif" }}>
                                Master AR/VR development through hands-on XR environments — not screen-based videos.
                                Learn Unity XR, WebXR, ARKit, and OpenXR and complete real projects that run on Meta Quest, Apple Vision Pro, and HoloLens 2.
                            </p>

                            {/* Tech tags */}
                            <div className="flex flex-wrap gap-2">
                                {["Unity XR", "WebXR", "ARKit", "OpenXR", "Meta SDK", "MRTK3"].map(t => (
                                    <span key={t} className="text-xs font-medium border border-[#203f78]/30 text-[#203f78] px-3 py-1 bg-[#203f78]/05 rounded-full" style={{ fontFamily: "'Inter',sans-serif" }}>{t}</span>
                                ))}
                            </div>

                            {/* CTAs */}
                            <div className="flex flex-wrap gap-3 pt-2">
                                <a href="#overview" className="inline-flex items-center gap-2 text-white text-sm font-semibold px-6 py-3 rounded-lg hover:shadow-lg transition-all transform hover:scale-[1.02]"
                                    style={{ background: "linear-gradient(135deg,#203f78,#2c5a9e)", fontFamily: "'Inter',sans-serif" }}>
                                    Explore Course <ArrowRight size={16} />
                                </a>
                                <a href="#videos" className="inline-flex items-center gap-2 text-gray-600 text-sm font-semibold px-6 py-3 border border-gray-300 rounded-lg hover:border-[#203f78] hover:text-[#203f78] transition-colors"
                                    style={{ fontFamily: "'Inter',sans-serif" }}>
                                    Watch Demo
                                </a>
                            </div>

                            {/* Stats */}
                            <div className="flex gap-8 pt-5 border-t border-[#203f78]/10">
                                {[["40h", "Content"], ["12", "Modules"], ["3", "XR Platforms"], ["Cert", "Included"]].map(([n, l]) => (
                                    <div key={l}>
                                        <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 20, color: "#203f78" }}>{n}</div>
                                        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "rgba(32,63,120,.5)", textTransform: "uppercase", marginTop: 2, fontWeight: 500 }}>{l}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* SCROLL MODEL STRIP */}
                    <ScrollModelStrip />

                    {/* ─── ALL SECTIONS ─── */}
                    <div className="px-6 sm:px-10 xl:px-14 space-y-0">

                        {/* OVERVIEW */}
                        <section id="overview" className="py-16 scroll-mt-20">
                            <h2 className="font-bold mb-5" style={{ fontFamily: "'Inter',sans-serif", fontSize: "clamp(22px,4vw,36px)", color: "#203f78" }}>
                                Overview
                            </h2>
                            <p className="text-gray-600 leading-relaxed mb-4" style={{ fontSize: 15, fontFamily: "'Inter',sans-serif" }}>
                                The AR/VR Self-Learning Module is a fully immersive, self-paced program that teaches you to build, deploy, and design for the spatial web. No prior XR experience needed — just curiosity.
                            </p>
                            <p className="text-gray-600 leading-relaxed mb-8" style={{ fontSize: 15, fontFamily: "'Inter',sans-serif" }}>
                                Using Unity XR, WebXR, ARKit, and OpenXR you'll complete real projects that run on Meta Quest, Apple Vision Pro, and HoloLens 2.
                            </p>
                            <div className="rounded-xl overflow-hidden">
                                <XROverviewPanel />
                            </div>
                        </section>

                        {/* HIGHLIGHTS */}
                        <section id="highlights" className="py-16 scroll-mt-20">
                            <h2 className="font-bold mb-10" style={{ fontFamily: "'Inter',sans-serif", fontSize: "clamp(22px,4vw,36px)", color: "#203f78" }}>
                                Highlights
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { ic: "🥽", t: "XR Fundamentals", d: "Learn AR, VR, MR, and XR from basics to advanced with real-world applications and future scope." },
                                    { ic: "🛠️", t: "Unity Mastery", d: "Complete Unity engine training including interface, workflow, game objects, and components." },
                                    { ic: "💻", t: "C# Scripting", d: "Build logic using C# — variables, loops, conditions, and real project scripting in Unity." },
                                    { ic: "⚙️", t: "Physics & Interaction", d: "Understand colliders, rigidbody, gravity, and create real-time object interactions." },
                                    { ic: "🎮", t: "VR Project Labs", d: "Hands-on labs to build VR projects — movement, grabbing objects, controller interaction." },
                                    { ic: "📱", t: "AR Development", d: "Create AR apps with plane detection, object placement, image tracking, and real-world interaction." },
                                    { ic: "🧪", t: "Practice & MCQs", d: "Module-wise MCQs and practical exercises to test your understanding and improve skills." },
                                    { ic: "🏆", t: "Certificate", d: "Get a verified completion certificate after finishing projects, labs, and assessments." },
                                ].map(({ ic, t, d }) => (
                                    <div key={t} className="p-5 border border-gray-200 bg-white rounded-xl hover:border-[#203f78]/40 hover:bg-blue-50/30 transition-all group">
                                        <div className="text-2xl mb-3">{ic}</div>
                                        <div className="font-semibold text-sm mb-2 text-gray-900 group-hover:text-[#203f78] transition-colors" style={{ fontFamily: "'Inter',sans-serif" }}>{t}</div>
                                        <div className="text-sm text-gray-500 leading-relaxed" style={{ fontFamily: "'Inter',sans-serif" }}>{d}</div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* CONTENT / MODULES */}
                        <section id="content" className="py-16 scroll-mt-20">
                            <h2 className="font-bold mb-3" style={{ fontFamily: "'Inter',sans-serif", fontSize: "clamp(22px,4vw,36px)", color: "#203f78" }}>
                                Module Content
                            </h2>
                            <p className="text-sm text-gray-500 mb-8" style={{ fontFamily: "'Inter',sans-serif" }}>Check the curriculum structure of the AR/VR Self Learning Module programme.</p>
                            <div className="border-t border-gray-200">
                                {modules.slice(0, showModules ? modules.length : 6).map((m) => (
                                    <CurrRow key={m.num} {...m} />
                                ))}
                            </div>
                            {modules.length > 6 && (
                                <div className="mt-6 text-center">
                                    <button onClick={() => setShowModules(v => !v)}
                                        className="text-sm font-semibold px-8 py-3 border border-[#203f78]/30 text-gray-600 hover:text-[#203f78] hover:border-[#203f78] transition-colors rounded-lg"
                                        style={{ fontFamily: "'Inter',sans-serif" }}>
                                        {showModules ? "Show Less ↑" : "Show More ↓"}
                                    </button>
                                </div>
                            )}
                        </section>

                        {/* WHY IT WORKS */}
                        <section id="why" className="py-16 scroll-mt-20">
                            <h2 className="font-bold mb-4" style={{ fontFamily: "'Inter',sans-serif", fontSize: "clamp(22px,4vw,36px)", color: "#203f78" }}>
                                Why This Module Works
                            </h2>
                            <p className="text-gray-500 mb-8 text-sm" style={{ fontFamily: "'Inter',sans-serif" }}>Built on cognitive science, spatial pedagogy, and 5 years of XR learning research.</p>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                {[
                                    { ic: "🚀", st: "3×", lb: "Faster Learning", d: "Hands-on Unity + XR labs accelerate understanding compared to only theory-based learning." },
                                    { ic: "🧠", st: "90%", lb: "Concept Clarity", d: "Practical projects and real-time interaction help you deeply understand AR, VR, and Unity workflows." },
                                    { ic: "🎯", st: "100%", lb: "Project-Based", d: "Every module includes real project building — from basics to full XR application development." },
                                ].map(({ ic, st, lb, d }) => (
                                    <div key={lb} className="p-6 border border-gray-200 bg-white rounded-xl text-center hover:border-[#203f78]/30 hover:shadow-lg transition-all">
                                        <div className="text-3xl mb-3">{ic}</div>
                                        <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 36, color: "#203f78", lineHeight: 1, marginBottom: 4 }}>{st}</div>
                                        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "rgba(32,63,120,.6)", textTransform: "uppercase", marginBottom: 10, fontWeight: 500 }}>{lb}</div>
                                        <div className="text-sm text-gray-500 leading-relaxed" style={{ fontFamily: "'Inter',sans-serif" }}>{d}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { t: "Hands-On Learning", d: "You don't just watch — you build. Every concept is applied through Unity projects and XR labs." },
                                    { t: "Step-by-Step Curriculum", d: "Structured modules take you from beginner to advanced — no confusion, no gaps in learning." },
                                    { t: "Real XR Labs", d: "Learn how to create VR interactions like grabbing objects, movement, and real-world AR placement." },
                                    { t: "Assessment & Certification", d: "Test your skills with MCQs and projects, then earn a verified certificate on completion." },
                                ].map(({ t, d }) => (
                                    <div key={t} className="flex gap-4 p-5 border border-gray-200 rounded-xl bg-blue-50/20">
                                        <div className="w-0.5 bg-gradient-to-b from-[#203f78] to-[#2c5a9e] rounded flex-shrink-0" />
                                        <div>
                                            <div className="font-semibold text-sm mb-1 text-gray-900" style={{ fontFamily: "'Inter',sans-serif" }}>{t}</div>
                                            <div className="text-sm text-gray-500 leading-relaxed" style={{ fontFamily: "'Inter',sans-serif" }}>{d}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* DEMO VIDEOS */}
                        <section id="videos" className="py-16 scroll-mt-20">
                            <h2 className="font-bold mb-10" style={{ fontFamily: "'Inter',sans-serif", fontSize: "clamp(22px,4vw,36px)", color: "#203f78" }}>
                                See It In Action
                            </h2>
                            <div className="flex flex-col sm:flex-row gap-4">
                                {/* Main video */}
                                <div className="flex-1 border border-gray-200 rounded-xl overflow-hidden bg-white">
                                    <div className="aspect-video bg-black relative">
                                        {activeVideo ? (
                                            <iframe src={activeVideo} width="100%" height="100%" allow="autoplay" style={{ border: "none", display: "block" }} />
                                        ) : (
                                            <div onClick={() => setActiveVideo(videos[0].url)} className="w-full h-full flex items-center justify-center cursor-pointer" style={{ background: "linear-gradient(135deg,#d8e6f8,#eaf0fb)" }}>
                                                <div className="w-14 h-14 rounded-full bg-[#203f78]/10 border-2 border-[#203f78]/60 flex items-center justify-center text-[#203f78] text-xl">▶</div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <div className="font-semibold text-sm text-gray-900" style={{ fontFamily: "'Inter',sans-serif" }}>{videos.find(v => v.url === activeVideo)?.title || videos[0].title}</div>
                                        <div className="text-xs text-gray-400 mt-1" style={{ fontFamily: "'Inter',sans-serif" }}>Click to play immersive XR demo</div>
                                    </div>
                                </div>
                                {/* Thumbnails */}
                                <div className="flex flex-row sm:flex-col gap-3 overflow-x-auto sm:overflow-x-visible pb-1 sm:pb-0">
                                    {videos.map((v) => (
                                        <div key={v.title} onClick={() => setActiveVideo(v.url)} className="cursor-pointer rounded-xl overflow-hidden transition-all hover:scale-[1.02]"
                                            style={{ border: activeVideo === v.url ? "2px solid rgba(32,63,120,.6)" : "1px solid rgba(32,63,120,.14)", minWidth: 130, width: 130 }}>
                                            <div className="bg-blue-50 relative" style={{ height: 90 }}>
                                                <img src={v.thumb} alt={v.title} className="w-full h-full object-cover" style={{ opacity: activeVideo === v.url ? 1 : 0.75 }} />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-7 h-7 rounded-full bg-[#203f78]/10 border border-[#203f78]/60 flex items-center justify-center text-[#203f78] text-xs">▶</div>
                                                </div>
                                            </div>
                                            <div className="p-2 text-xs font-semibold leading-tight bg-white" style={{ color: activeVideo === v.url ? "#203f78" : "rgba(32,63,120,.75)", fontFamily: "'Inter',sans-serif" }}>{v.title}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* CERTIFICATE */}
                        <section id="certificate" className="py-16 scroll-mt-20">
                            <h2 className="font-bold mb-4" style={{ fontFamily: "'Inter',sans-serif", fontSize: "clamp(22px,4vw,36px)", color: "#203f78" }}>
                                Earn Your Certificate
                            </h2>
                            <p className="text-gray-500 text-sm mb-8 max-w-lg" style={{ fontFamily: "'Inter',sans-serif" }}>
                                Complete all 12 modules and pass each module-end quiz to receive your blockchain-verified certificate from XRFORGE.
                            </p>

                            {/* Assessment Table */}
                            <div className="mb-8 border border-gray-200 rounded-xl overflow-hidden">
                                <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
                                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, letterSpacing: 1, color: "rgba(32,63,120,.7)", textTransform: "uppercase", fontWeight: 600 }}>Assessment & Evaluation</div>
                                </div>
                                {[["Module-End MCQ Quiz (12 Modules)", "Pass All Quizzes"], ["Hands-On Lab Practice", "For Skill Development"], ["Module Completion", "All 12 Modules Required"]].map(([label, value], i, arr) => (
                                    <div key={label} className="flex" style={{ borderBottom: i < arr.length - 1 ? "1px solid rgba(32,63,120,.10)" : "none" }}>
                                        <div className="flex-1 px-5 py-3 text-sm text-gray-600 border-r border-gray-200" style={{ fontFamily: "'Inter',sans-serif" }}>{label}</div>
                                        <div className="flex-1 px-5 py-3 text-sm font-semibold text-[#203f78]" style={{ fontFamily: "'Inter',sans-serif" }}>{value}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="mb-6">
                                <h3 className="font-semibold text-base text-[#203f78] mb-3" style={{ fontFamily: "'Inter',sans-serif" }}>Completion Criteria</h3>
                                <p className="text-sm text-gray-500 leading-relaxed" style={{ fontFamily: "'Inter',sans-serif" }}>Complete all 12 modules, practice with hands-on lab documents, and pass the MCQ quiz at the end of each module to unlock the next module.</p>
                            </div>

                            <div className="mb-8">
                                <h3 className="font-semibold text-base text-[#203f78] mb-3" style={{ fontFamily: "'Inter',sans-serif" }}>Certification*</h3>
                                <div className="space-y-3">
                                    {[
                                        'Participants who successfully complete all 12 modules and pass all module-end quizzes will receive a "Certificate of Completion" from XRFORGE.',
                                        'Participants who complete some modules but not all will receive a "Certificate of Participation".',
                                        'All certificates are auto-generated, portal-verifiable, and digitally signed.',
                                    ].map((text, i) => (
                                        <div key={i} className="flex gap-3 text-sm text-gray-500 leading-relaxed" style={{ fontFamily: "'Inter',sans-serif" }}>
                                            <span className="text-[#203f78] flex-shrink-0">→</span><span>{text}</span>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-400 mt-4 italic" style={{ fontFamily: "'Inter',sans-serif" }}>*Certificates will be issued by XRFORGE and are verifiable through the learning portal.</p>
                            </div>

                            <div className="border border-gray-200 rounded-xl overflow-hidden" style={{ boxShadow: "0 0 60px rgba(32,63,120,.06)" }}>
                                <CertificateSVG />
                            </div>
                        </section>

                    </div>
                </div>

                {/* ══ RIGHT COLUMN — sticky login form ══ */}
                <div className="w-full lg:w-2/5 xl:w-5/12 border-l border-gray-100">

                    {/* Mobile login form (inline) */}
                    <div id="login-form" className="lg:hidden px-6 py-10">
                        <LoginFormPanel {...loginFormProps} />
                    </div>

                    {/* Desktop sticky login form */}
                    <div className="hidden lg:flex w-full items-start justify-center px-8 xl:px-12 sticky top-16 self-start pt-10">
                        <div className="w-full max-w-[420px]">
                            <LoginFormPanel {...loginFormProps} />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Login;