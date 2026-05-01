import heroar2 from "../public/heroar2.png";
// ─────────────────────────────────────────────────────────────
//  ScrollModelStrip.tsx  — v2 "Cinematic Reveal"
//
//  npm install @react-three/fiber @react-three/drei three
//  Put your file at  public/Quest3.glb  (or change MODEL_PATH)
// ─────────────────────────────────────────────────────────────
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState, Suspense, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import api from '../utils/api';
import { toast } from 'react-toastify';
const MODEL_PATH = new URL("../public/Quest3.glb", import.meta.url).href;

/* ─── auto-center model ───────────────────────────────────── */
function centerModel(object: THREE.Object3D) {
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    object.position.sub(center);
    return { size, center };
}

/* ══════════════════════════════════════════
   3-D MODEL
══════════════════════════════════════════ */
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

        if (!readyCalled.current) {
            readyCalled.current = true;
            onReady?.();
        }

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

/* ══════════════════════════════════════════
   SPEC PANEL
══════════════════════════════════════════ */
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
                position: "absolute",
                bottom: 80,
                left: "50%",
                transform: `translateX(-50%) translateY(${show ? 0 : 20}px)`,
                opacity: show ? 1 : 0,
                transition: "opacity 0.55s ease, transform 0.55s cubic-bezier(0.16,1,0.3,1)",
                width: "calc(100vw - 32px)",
                maxWidth: 360,
                pointerEvents: show ? "auto" : "none",
                zIndex: 20,
            }}>
                <div style={{
                    background: "rgba(5,10,20,0.92)",
                    border: `1px solid ${data.accent}28`,
                    backdropFilter: "blur(18px)",
                    padding: "14px 16px",
                    position: "relative",
                    overflow: "hidden",
                }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${data.accent},transparent)` }} />
                    <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, letterSpacing: 2, color: data.accent, textTransform: "uppercase", marginBottom: 6 }}>
                        {data.tag}
                    </div>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 16, color: "#ffffff", lineHeight: 1.1, marginBottom: 2 }}>
                        {data.title}
                    </div>
                    <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "rgba(228,238,248,.88)", marginBottom: 12, lineHeight: 1.4 }}>
                        {data.subtitle}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {data.stats.slice(0, 2).map((s) => (
                            <div key={s.label}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: s.bar !== undefined ? 4 : 0 }}>
                                    <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, letterSpacing: 1, color: "rgba(228,238,248,.88)", textTransform: "uppercase" }}>
                                        {s.label}
                                    </span>
                                    <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 11, color: data.accent }}>
                                        {s.value}
                                    </span>
                                </div>
                                {s.bar !== undefined && (
                                    <div style={{ height: 2.5, background: "rgba(255,255,255,.05)", borderRadius: 2 }}>
                                        <div style={{
                                            height: "100%",
                                            width: show ? `${s.bar}%` : "0%",
                                            background: `linear-gradient(90deg,${data.accent},${data.accent}66)`,
                                            borderRadius: 2,
                                            transition: `width ${0.8 + s.bar / 200}s ease ${show ? "0.3s" : "0s"}`,
                                        }} />
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
            top: "50%",
            [isLeft ? "left" : "right"]: "3.5%",
            transform: `translateY(-50%) translateX(${show ? 0 : (isLeft ? -50 : 50)}px)`,
            opacity: show ? 1 : 0,
            transition: "opacity 0.55s ease, transform 0.55s cubic-bezier(0.16,1,0.3,1)",
            width: 365,
            pointerEvents: show ? "auto" : "none",
            zIndex: 20,
        }}>
            <div style={{
                background: "rgba(5,10,20,0.86)",
                border: `1px solid ${data.accent}28`,
                backdropFilter: "blur(18px)",
                padding: "20px 22px",
                position: "relative",
                overflow: "hidden",
            }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${data.accent},transparent)` }} />
                <div style={{
                    position: "absolute", [isLeft ? "right" : "left"]: 0, top: 0,
                    width: 40, height: 40, opacity: 0.06,
                    background: `linear-gradient(${isLeft ? "225" : "315"}deg,${data.accent},transparent)`,
                }} />
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, letterSpacing: 3, color: data.accent, textTransform: "uppercase", marginBottom: 9 }}>
                    {data.tag}
                </div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 23, color: "#ffffff", lineHeight: 1.1, marginBottom: 3 }}>
                    {data.title}
                </div>
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 13, color: "rgba(228,238,248,.88)", marginBottom: 18, lineHeight: 1.5 }}>
                    {data.subtitle}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                    {data.stats.map((s) => (
                        <div key={s.label}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: s.bar !== undefined ? 5 : 0 }}>
                                <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, letterSpacing: 1, color: "rgba(228,238,248,.88)", textTransform: "uppercase" }}>
                                    {s.label}
                                </span>
                                <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, color: data.accent }}>
                                    {s.value}
                                </span>
                            </div>
                            {s.bar !== undefined && (
                                <div style={{ height: 2.5, background: "rgba(255,255,255,.05)", borderRadius: 2 }}>
                                    <div style={{
                                        height: "100%",
                                        width: show ? `${s.bar}%` : "0%",
                                        background: `linear-gradient(90deg,${data.accent},${data.accent}66)`,
                                        borderRadius: 2,
                                        transition: `width ${0.8 + s.bar / 200}s ease ${show ? "0.3s" : "0s"}`,
                                    }} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div style={{ marginTop: 16, paddingTop: 13, borderTop: `1px solid ${data.accent}18`, display: "flex", gap: 5, alignItems: "center" }}>
                    {[1, 2, 3].map((i) => (
                        <div key={i} style={{
                            width: 5, height: 5, borderRadius: "50%",
                            background: i === 1 ? data.accent : `${data.accent}33`,
                            boxShadow: i === 1 ? `0 0 6px ${data.accent}` : "none",
                        }} />
                    ))}
                    <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "rgba(228,238,248,.45)", letterSpacing: 2, marginLeft: 4 }}>
                        VERIFIED SPECS
                    </span>
                </div>
            </div>
            <div style={{
                position: "absolute",
                top: "50%",
                [isLeft ? "right" : "left"]: -32,
                width: 32,
                height: 1,
                background: `linear-gradient(${isLeft ? "90deg" : "270deg"},transparent,${data.accent}40)`,
                transform: "translateY(-50%)",
            }} />
        </div>
    );
}

/* ══════════════════════════════════════════
   DEGREE RING
══════════════════════════════════════════ */
function DegreeRing({ p, isMobile }: { p: number; isMobile?: boolean }) {
    const deg = Math.round(p * 360);
    const r = 26;
    const circ = 2 * Math.PI * r;
    return (
        <div style={{ position: "absolute", bottom: isMobile ? 24 : 32, right: isMobile ? 16 : 72, zIndex: 20, width: 66, height: 66 }}>
            <svg viewBox="0 0 64 64" style={{ width: "100%", height: "100%" }}>
                <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(0,224,255,.1)" strokeWidth="1" strokeDasharray="3 3" />
                <circle cx="32" cy="32" r={r} fill="none" stroke="#00e0ff" strokeWidth="1.8"
                    strokeDasharray={`${(p * circ).toFixed(1)} ${circ}`}
                    strokeLinecap="round"
                    transform="rotate(-90 32 32)"
                    style={{ filter: "drop-shadow(0 0 4px rgba(0,224,255,0.7))" }}
                />
                <text x="32" y="28" textAnchor="middle" fontFamily="'DM Mono',monospace" fontSize="11" fontWeight="bold" fill="#00e0ff">{deg}°</text>
                <text x="32" y="41" textAnchor="middle" fontFamily="'DM Mono',monospace" fontSize="6.5" fill="rgba(0,224,255,.55)">ROTATE</text>
            </svg>
        </div>
    );
}

/* ══════════════════════════════════════════
   PHASE INDICATOR
══════════════════════════════════════════ */
const PHASES = ["Assembly", "Facility", "Training", "Safety"];

function PhaseBar({ p, isMobile }: { p: number; isMobile?: boolean }) {
    const active = Math.min(3, Math.floor(p * 4));
    return (
        <div style={{
            position: "absolute",
            bottom: isMobile ? 18 : 34,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            gap: 0,
            zIndex: 20,
        }}>
            {PHASES.map((ph, i) => (
                <div key={ph} style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: isMobile ? 5 : 7 }}>
                        <div style={{
                            width: i === active ? (isMobile ? 7 : 9) : (isMobile ? 5 : 6),
                            height: i === active ? (isMobile ? 7 : 9) : (isMobile ? 5 : 6),
                            borderRadius: "50%",
                            background: i <= active ? "#00e0ff" : "rgba(0,224,255,.15)",
                            boxShadow: i === active ? "0 0 12px #00e0ff, 0 0 24px rgba(0,224,255,.3)" : "none",
                            transition: "all .4s ease",
                        }} />
                        <div style={{
                            fontFamily: "'DM Mono',monospace",
                            fontSize: isMobile ? 7 : 8.5,
                            letterSpacing: isMobile ? 1 : 2,
                            color: i === active ? "#00e0ff" : "rgba(228,238,248,.45)",
                            textTransform: "uppercase",
                            transition: "color .4s",
                        }}>{ph}</div>
                    </div>
                    {i < PHASES.length - 1 && (
                        <div style={{
                            width: isMobile ? 24 : 48,
                            height: 1,
                            margin: isMobile ? "0 4px 16px" : "0 8px 20px",
                            background: i < active ? "rgba(0,224,255,.35)" : "rgba(0,224,255,.08)",
                            transition: "background .5s",
                        }} />
                    )}
                </div>
            ))}
        </div>
    );
}

/* ══════════════════════════════════════════
   PANELS DATA
══════════════════════════════════════════ */
const PANELS: PanelData[] = [
    {
        side: "left",
        tag: "// Engine Assembly",
        title: "V8 Block Build",
        subtitle: "Live guided engine assembly training",
        accent: "#00e0ff",
        stats: [
            { label: "Operator Training", value: "Guided Assembly Steps" },
            { label: "Simulation Practice", value: "Repeatable Hands-on Tasks", bar: 86 },
            { label: "Skill Assessment", value: "Process Validation Test", bar: 82 },
            { label: "Final Evaluation", value: "Quality + Speed Score", bar: 94 },
        ],
    },
    {
        side: "right",
        tag: "// Company Tour",
        title: "Virtual Facility",
        subtitle: "Immersive plant floor walkthrough",
        accent: "#7c4dff",
        stats: [
            { label: "Facility Training", value: "Guided Area Walkthrough" },
            { label: "Zone Practice", value: "Explore Departments Interactively", bar: 84 },
            { label: "Location Test", value: "Identify Zones & Equipment", bar: 78 },
            { label: "Understanding Score", value: "Navigation + Awareness", bar: 90 },
        ],
    },
    {
        side: "left",
        tag: "// Workforce Training",
        title: "Operator Skills",
        subtitle: "Hands-on VR skill certification",
        accent: "#00ff9d",
        stats: [
            { label: "Skill Training", value: "Step-wise Task Learning" },
            { label: "Hands-on Practice", value: "Repeatable Job Simulation", bar: 88 },
            { label: "Skill Test", value: "Real Task Validation", bar: 85 },
            { label: "Certification Score", value: "Performance + Accuracy", bar: 94 },
        ],
    },
    {
        side: "right",
        tag: "// Safety Protocol",
        title: "Hazard Simulation",
        subtitle: "Zero-risk emergency response drills",
        accent: "#e8b84b",
        stats: [
            { label: "Safety Training", value: "Hazard Awareness Learning" },
            { label: "Emergency Practice", value: "Simulated Risk Scenarios", bar: 87 },
            { label: "Response Test", value: "Action & Decision Check", bar: 83 },
            { label: "Safety Score", value: "Reaction + Compliance", bar: 95 },
        ],
    },
];

/* ══════════════════════════════════════════
   SCROLL MODEL STRIP
══════════════════════════════════════════ */
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
            <div style={{
                position: "sticky", top: 0, height: "100vh",
                overflow: "hidden", background: "#060c18",
            }}>
                {/* Grid bg */}
                <div style={{
                    position: "absolute", inset: 0, pointerEvents: "none",
                    backgroundImage: "linear-gradient(rgba(0,224,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(0,224,255,0.018) 1px,transparent 1px)",
                    backgroundSize: "64px 64px",
                }} />

                {/* Centre atmosphere */}
                <div style={{
                    position: "absolute", inset: 0, pointerEvents: "none",
                    background: `radial-gradient(ellipse 48% 38% at 50% 50%,
            rgba(0,224,255,${0.025 + progress * 0.07}),
            rgba(124,77,255,${0.015 + progress * 0.04}) 45%,
            transparent 70%)`,
                }} />

                {/* Title */}
                <div style={{
                    position: "absolute", top: isMobile ? 72 : 88, left: "50%", transform: "translateX(-50%)",
                    textAlign: "center", zIndex: 25, whiteSpace: "nowrap",
                }}>
                    <div style={{ fontFamily: "'DM Mono',monospace", fontSize: isMobile ? 8 : 9, letterSpacing: isMobile ? 2 : 4, color: "rgba(0,224,255,.6)", textTransform: "uppercase", marginBottom: 7 }}>
                        // Interactive 360° Breakdown
                    </div>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: isMobile ? 14 : 20, color: "#f0f8ff" }}>
                        Industrial XR — <span style={{ background: "linear-gradient(90deg,#00e0ff,#7c4dff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                            Experience Explorer
                        </span>
                    </div>
                </div>

                {/* Spec panels */}
                {PANELS.map((panel, i) => (
                    <SpecPanel key={panel.tag} data={panel} show={i === panelIdx && modelReady} isMobile={isMobile} />
                ))}

                {/* 3-D Canvas */}
                <div style={{ position: "absolute", inset: 0, zIndex: 10 }}>
                    {!modelReady && (
                        <div style={{
                            position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                            flexDirection: "column", gap: 14,
                        }}>
                            <div style={{
                                width: 52, height: 52, borderRadius: "50%",
                                border: "1.5px solid rgba(0,224,255,.08)",
                                borderTop: "1.5px solid #00e0ff",
                                animation: "spinLoad 1s linear infinite",
                            }} />
                            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: 3, color: "rgba(0,224,255,.55)" }}>LOADING MODEL…</div>
                        </div>
                    )}
                    <Canvas
                        camera={{ position: [0, 0, 5], fov: 42 }}
                        gl={{ antialias: true, alpha: true }}
                        style={{ background: "#060c18" }}
                        shadows
                        dpr={[1, 2]}
                    >
                        <ambientLight intensity={0.28} />
                        <directionalLight position={[3, 5, 4]} intensity={1.15} castShadow color="#ffffff" />
                        <pointLight position={[-4, 2, 2]} intensity={0.7} color="#00e0ff" />
                        <pointLight position={[4, -2, -2]} intensity={0.4} color="#7c4dff" />
                        <pointLight position={[0, 0, 4]} intensity={progress * 1.5} color="#00e0ff" />

                        <Suspense fallback={null}>
                            <Environment preset="city" />
                            <QuestModel scrollProgress={progress} mouse={mouse} onReady={onReady} />
                            <ContactShadows
                                position={[0, -1.9, 0]}
                                opacity={0.2 + progress * 0.4}
                                scale={6}
                                blur={3.5}
                                far={5}
                                color="#001633"
                            />
                        </Suspense>
                    </Canvas>
                </div>

                {/* Bottom UI */}
                <PhaseBar p={progress} isMobile={isMobile} />
                <DegreeRing p={progress} isMobile={isMobile} />

                {/* Scroll hint */}
                {progress < 0.035 && (
                    <div style={{
                        position: "absolute", bottom: isMobile ? 85 : 95, left: "50%", transform: "translateX(-50%)",
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 8, zIndex: 25,
                    }}>
                        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 8.5, letterSpacing: 3, color: "rgba(0,224,255,.55)", textTransform: "uppercase" }}>
                            Scroll to rotate
                        </span>
                        <div style={{ width: 20, height: 32, border: "1px solid rgba(0,224,255,.22)", borderRadius: 10, display: "flex", justifyContent: "center", paddingTop: 5 }}>
                            <div style={{ width: 3.5, height: 7, background: "#00e0ff", borderRadius: 2, animation: "scrollDot 1.6s ease-in-out infinite" }} />
                        </div>
                    </div>
                )}

                {/* Progress bar */}
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "rgba(0,224,255,.05)", zIndex: 30 }}>
                    <div style={{ height: "100%", width: `${progress * 100}%`, background: "linear-gradient(90deg,#00e0ff,#7c4dff)", transition: "width .06s linear" }} />
                </div>
            </div>

            <style>{`
        @keyframes spinLoad { to { transform: rotate(360deg); } }
        @keyframes scrollDot {
          0%,100% { transform: translateY(0); opacity: 1; }
          60%      { transform: translateY(9px); opacity: 0.2; }
        }
      `}</style>
        </div>
    );
}

useGLTF.preload(MODEL_PATH);
const F40_MODEL_PATH = new URL("../public/f40_engine1.glb", import.meta.url).href;

/* ══════════════════════════════════════════
   F40 MODEL INNER
══════════════════════════════════════════ */
function F40ModelInner({
    rotationRef,
    isDragging,
    onReady,
}: {
    rotationRef: React.MutableRefObject<{ x: number; y: number }>;
    isDragging: React.MutableRefObject<boolean>;
    onReady?: () => void;
}) {
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
                m.material = new THREE.MeshStandardMaterial({
                    color: new THREE.Color("#5f5c5c"),
                    metalness: 0.85,
                    roughness: 0.25,
                    envMapIntensity: 1.5,
                });
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

/* ══════════════════════════════════════════
   HERO MODEL VIEWER
══════════════════════════════════════════ */
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

        const onMouseDown = (e: MouseEvent) => {
            dragState.current.dragging = true;
            isDragging.current = true;
            dragState.current.lastX = e.clientX;
            dragState.current.lastY = e.clientY;
            el.style.cursor = "grabbing";
        };
        const onMouseMove = (e: MouseEvent) => {
            if (!dragState.current.dragging) return;
            const dx = e.clientX - dragState.current.lastX;
            const dy = e.clientY - dragState.current.lastY;
            dragState.current.lastX = e.clientX;
            dragState.current.lastY = e.clientY;
            rotationRef.current.y += dx * 0.008;
            rotationRef.current.x += dy * 0.008;
            rotationRef.current.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, rotationRef.current.x));
        };
        const onMouseUp = () => {
            dragState.current.dragging = false;
            isDragging.current = false;
            el.style.cursor = "grab";
        };
        const onTouchStart = (e: TouchEvent) => {
            dragState.current.dragging = true;
            isDragging.current = true;
            dragState.current.lastX = e.touches[0].clientX;
            dragState.current.lastY = e.touches[0].clientY;
        };
        const onTouchMove = (e: TouchEvent) => {
            if (!dragState.current.dragging) return;
            const dx = e.touches[0].clientX - dragState.current.lastX;
            const dy = e.touches[0].clientY - dragState.current.lastY;
            dragState.current.lastX = e.touches[0].clientX;
            dragState.current.lastY = e.touches[0].clientY;
            rotationRef.current.y += dx * 0.008;
            rotationRef.current.x += dy * 0.008;
            rotationRef.current.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, rotationRef.current.x));
        };
        const onTouchEnd = () => {
            dragState.current.dragging = false;
            isDragging.current = false;
        };

        el.addEventListener("mousedown", onMouseDown);
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
        el.addEventListener("touchstart", onTouchStart);
        window.addEventListener("touchmove", onTouchMove);
        window.addEventListener("touchend", onTouchEnd);

        return () => {
            el.removeEventListener("mousedown", onMouseDown);
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
            el.removeEventListener("touchstart", onTouchStart);
            window.removeEventListener("touchmove", onTouchMove);
            window.removeEventListener("touchend", onTouchEnd);
        };
    }, []);

    if (isMobile) {
        return (
            <div ref={containerRef} style={{
                width: "100%",
                height: "300px",
                position: "relative",
                cursor: "grab",
            }}>
                {!modelReady && (
                    <div style={{
                        position: "absolute", inset: 0, display: "flex",
                        alignItems: "center", justifyContent: "center",
                        flexDirection: "column", gap: 12,
                    }}>
                        <div style={{
                            width: 44, height: 44, borderRadius: "50%",
                            border: "1.5px solid rgba(0,224,255,.08)",
                            borderTop: "1.5px solid #00e0ff",
                            animation: "spinLoad 1s linear infinite",
                        }} />
                    </div>
                )}
                <Canvas
                    camera={{ position: [0, 0, 5], fov: 42 }}
                    gl={{ antialias: true, alpha: true }}
                    style={{ background: "transparent", width: "100%", height: "100%" }}
                    shadows
                    dpr={[1, 1.5]}
                >
                    <ambientLight intensity={0.15} />
                    <directionalLight position={[5, 8, 5]} intensity={0.8} castShadow color="#ffffff" />
                    <directionalLight position={[-5, 3, -4]} intensity={0.3} color="#ffffff" />
                    <pointLight position={[3, 2, 4]} intensity={0.6} color="#ffffff" />
                    <Suspense fallback={null}>
                        <Environment preset="studio" />
                        <F40ModelInner rotationRef={rotationRef} isDragging={isDragging} onReady={onReady} />
                        <ContactShadows position={[0, -1.9, 0]} opacity={0.3} scale={8} blur={3} far={5} color="#001633" />
                    </Suspense>
                </Canvas>
                <div style={{
                    position: "absolute", top: "12px", right: "12px",
                    display: "flex", alignItems: "center", gap: 6, padding: "6px 10px",
                    background: "rgba(0,0,0,0.45)", border: "1px solid rgba(0,224,255,0.25)",
                    backdropFilter: "blur(8px)", borderRadius: "999px",
                    opacity: modelReady ? 1 : 0, transition: "opacity 0.6s ease", pointerEvents: "none",
                }}>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: 2, color: "rgba(0,224,255,0.85)", textTransform: "uppercase" }}>
                        Drag to Interact
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} style={{
            position: "absolute",
            right: "-80px",
            bottom: "100px",
            height: "90vh",
            minWidth: 620,
            zIndex: 1,
            cursor: "grab",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-end",
        }}>
            <div style={{ width: "100%", flex: 1, position: "relative" }}>
                {!modelReady && (
                    <div style={{
                        position: "absolute", inset: 0, display: "flex",
                        alignItems: "center", justifyContent: "center",
                        flexDirection: "column", gap: 12,
                    }}>
                        <div style={{
                            width: 44, height: 44, borderRadius: "50%",
                            border: "1.5px solid rgba(0,224,255,.08)",
                            borderTop: "1.5px solid #00e0ff",
                            animation: "spinLoad 1s linear infinite",
                        }} />
                        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: 3, color: "rgba(0,224,255,.55)" }}>
                            LOADING MODEL…
                        </div>
                    </div>
                )}
                <Canvas
                    camera={{ position: [0, 0, 5], fov: 42 }}
                    gl={{ antialias: true, alpha: true }}
                    style={{ background: "transparent", width: "100%", height: "100%" }}
                    shadows
                    dpr={[1, 2]}
                >
                    <ambientLight intensity={0.15} />
                    <directionalLight position={[5, 8, 5]} intensity={0.8} castShadow color="#ffffff" />
                    <directionalLight position={[-5, 3, -4]} intensity={0.3} color="#ffffff" />
                    <directionalLight position={[0, -4, 3]} intensity={0.4} color="#ffffff" />
                    <pointLight position={[3, 2, 4]} intensity={0.6} color="#ffffff" />

                    <Suspense fallback={null}>
                        <Environment preset="studio" />
                        <F40ModelInner rotationRef={rotationRef} isDragging={isDragging} onReady={onReady} />
                        <ContactShadows position={[0, -1.9, 0]} opacity={0.3} scale={8} blur={3} far={5} color="#001633" />
                    </Suspense>
                </Canvas>
            </div>

            <div style={{
                position: "absolute", top: "24px", right: "24px",
                display: "flex", alignItems: "center", gap: 8, padding: "8px 14px",
                background: "rgba(0,0,0,0.45)", border: "1px solid rgba(0,224,255,0.25)",
                backdropFilter: "blur(8px)", borderRadius: "999px",
                opacity: modelReady ? 1 : 0, transition: "opacity 0.6s ease", pointerEvents: "none",
            }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00e0ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 11V6a2 2 0 0 0-4 0v5" />
                    <path d="M14 10V4a2 2 0 0 0-4 0v6" />
                    <path d="M10 10.5V6a2 2 0 0 0-4 0v8" />
                    <path d="M6 14a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4v-2.5" />
                    <path d="M18 11a2 2 0 0 1 4 0v3" />
                </svg>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: 2, color: "rgba(0,224,255,0.85)", textTransform: "uppercase" }}>
                    Drag to Interact
                </span>
            </div>
        </div>
    );
}

useGLTF.preload(F40_MODEL_PATH);

/* ══════════════════════════════════════════
   HEADSET SVG
══════════════════════════════════════════ */
function HeadsetSVG({ rotY = 0, rotX = 0, scale = 1, progress = 0 }) {
    const g = progress;
    return (
        <svg viewBox="0 0 500 300" xmlns="http://www.w3.org/2000/svg"
            style={{
                width: "100%", height: "100%",
                transform: `rotateY(${rotY}deg) rotateX(${rotX}deg) scale(${scale})`,
                transition: "transform 0.06s linear",
                filter: `drop-shadow(0 0 ${16 + g * 48}px rgba(0,224,255,${0.25 + g * 0.55}))`,
            }}>
            <defs>
                <radialGradient id="ll" cx="50%" cy="50%">
                    <stop offset="0%" stopColor={`rgba(0,224,255,${0.12 + g * 0.5})`} />
                    <stop offset="100%" stopColor="transparent" />
                </radialGradient>
                <radialGradient id="rl" cx="50%" cy="50%">
                    <stop offset="0%" stopColor={`rgba(124,77,255,${0.12 + g * 0.5})`} />
                    <stop offset="100%" stopColor="transparent" />
                </radialGradient>
                <linearGradient id="body" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#192840" />
                    <stop offset="100%" stopColor="#080f1e" />
                </linearGradient>
                <filter id="glow2"><feGaussianBlur stdDeviation="4" result="b" />
                    <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                <filter id="glow5"><feGaussianBlur stdDeviation="8" result="b" />
                    <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            </defs>
            <ellipse cx="250" cy="150" rx="215" ry="118" fill="none" stroke={`rgba(0,224,255,${0.04 + g * 0.1})`} strokeWidth="1" strokeDasharray="6 5" />
            <ellipse cx="250" cy="150" rx="195" ry="103" fill="none" stroke={`rgba(124,77,255,${0.03 + g * 0.07})`} strokeWidth=".6" />
            <path d="M58 88 Q58 58 98 53 L402 53 Q442 58 442 88 L442 212 Q442 242 402 247 L98 247 Q58 242 58 212 Z" fill="url(#body)" stroke={`rgba(0,224,255,${0.3 + g * 0.35})`} strokeWidth="1.6" />
            <path d="M128 53 Q184 38 250 35 Q316 38 372 53" fill="none" stroke={`rgba(0,224,255,${0.22 + g * 0.3})`} strokeWidth="1.6" />
            <path d="M148 53 L148 16 Q148 9 158 9 L342 9 Q352 9 352 16 L352 53" fill="none" stroke={`rgba(0,224,255,${0.28 + g * 0.22})`} strokeWidth="1.5" />
            <rect x="200" y="9" width="100" height="9" rx="4.5" fill="rgba(0,224,255,0.07)" stroke="rgba(0,224,255,0.18)" strokeWidth=".8" />
            <path d="M58 98 Q24 98 20 130 Q20 150 20 170 Q24 202 58 202" fill="rgba(8,14,28,.92)" stroke={`rgba(0,224,255,${0.28 + g * 0.2})`} strokeWidth="1.2" />
            <path d="M442 98 Q476 98 480 130 Q480 150 480 170 Q476 202 442 202" fill="rgba(8,14,28,.92)" stroke={`rgba(124,77,255,${0.28 + g * 0.2})`} strokeWidth="1.2" />
            <path d="M73 94 Q73 72 98 67 L402 67 Q427 72 427 94 L427 206 Q427 228 402 233 L98 233 Q73 228 73 206 Z" fill="rgba(4,9,18,.96)" stroke="rgba(0,224,255,.08)" strokeWidth="1" />
            <ellipse cx="162" cy="150" rx="74" ry="60" fill="rgba(0,8,24,.97)" stroke={`rgba(0,224,255,${0.48 + g * 0.42})`} strokeWidth="1.9" filter="url(#glow2)" />
            <ellipse cx="162" cy="150" rx="60" ry="47" fill="url(#ll)" />
            <ellipse cx="162" cy="150" rx="47" ry="36" fill="none" stroke={`rgba(0,224,255,${0.14 + g * 0.28})`} strokeWidth=".8" />
            <ellipse cx="162" cy="150" rx="30" ry="22" fill="none" stroke={`rgba(0,224,255,${0.09 + g * 0.22})`} strokeWidth=".5" strokeDasharray="3 2" />
            <ellipse cx="145" cy="133" rx="13" ry="9" fill="rgba(255,255,255,0.035)" transform="rotate(-22 145 133)" />
            <circle cx="162" cy="150" r={3 + g * 5} fill={`rgba(0,224,255,${0.55 + g * 0.45})`} filter="url(#glow5)" />
            <ellipse cx="338" cy="150" rx="74" ry="60" fill="rgba(0,8,24,.97)" stroke={`rgba(124,77,255,${0.48 + g * 0.42})`} strokeWidth="1.9" filter="url(#glow2)" />
            <ellipse cx="338" cy="150" rx="60" ry="47" fill="url(#rl)" />
            <ellipse cx="338" cy="150" rx="47" ry="36" fill="none" stroke={`rgba(124,77,255,${0.14 + g * 0.28})`} strokeWidth=".8" />
            <ellipse cx="338" cy="150" rx="30" ry="22" fill="none" stroke={`rgba(124,77,255,${0.09 + g * 0.22})`} strokeWidth=".5" strokeDasharray="3 2" />
            <ellipse cx="321" cy="133" rx="13" ry="9" fill="rgba(255,255,255,0.035)" transform="rotate(-22 321 133)" />
            <circle cx="338" cy="150" r={3 + g * 5} fill={`rgba(124,77,255,${0.55 + g * 0.45})`} filter="url(#glow5)" />
            <path d="M232 128 Q250 118 268 128 L270 172 Q250 182 230 172 Z" fill="rgba(4,11,24,.92)" stroke="rgba(0,224,255,.18)" strokeWidth=".8" />
            {[0, 1, 2, 3].map(i => <rect key={i} x={108 + i * 18} y={232} width="10" height="4" rx="2" fill="rgba(0,224,255,.11)" />)}
            {[0, 1, 2, 3].map(i => <rect key={i} x={278 + i * 18} y={232} width="10" height="4" rx="2" fill="rgba(124,77,255,.11)" />)}
            <circle cx="108" cy="246" r="3.5" fill={`rgba(0,255,140,${0.55 + g * 0.45})`} filter="url(#glow2)" />
            <circle cx="123" cy="246" r="2.5" fill={`rgba(0,224,255,${0.5 + g * 0.4})`} filter="url(#glow2)" />
            <circle cx="392" cy="246" r="3.5" fill={`rgba(124,77,255,${0.55 + g * 0.45})`} filter="url(#glow2)" />
            {g > 0.25 && [68, 78, 88, 98, 108].map(y => (
                <line key={y} x1="96" y1={y + 22} x2="232" y2={y + 22} stroke={`rgba(0,224,255,${(g - 0.25) * 0.18})`} strokeWidth=".5" />
            ))}
            {g > 0.25 && [68, 78, 88, 98, 108].map(y => (
                <line key={y} x1="270" y1={y + 22} x2="405" y2={y + 22} stroke={`rgba(124,77,255,${(g - 0.25) * 0.18})`} strokeWidth=".5" />
            ))}
        </svg>
    );
}

/* ══════════════════════════════════════════
   CERTIFICATE SVG
══════════════════════════════════════════ */
function Certificate() {
    return (
        <svg viewBox="0 0 800 560" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", maxWidth: 700 }}>
            <defs>
                <linearGradient id="cbg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#09152a" /><stop offset="100%" stopColor="#060e1e" />
                </linearGradient>
                <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#e8b84b" /><stop offset="50%" stopColor="#ffd97a" /><stop offset="100%" stopColor="#c8911e" />
                </linearGradient>
                <linearGradient id="cyg" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00d4ff" /><stop offset="100%" stopColor="#0077cc" />
                </linearGradient>
                <filter id="cg"><feGaussianBlur stdDeviation="3" result="b" />
                    <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                <pattern id="gp" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M40 0L0 0 0 40" fill="none" stroke="rgba(0,200,255,0.035)" strokeWidth=".5" />
                </pattern>
            </defs>
            <rect width="800" height="560" fill="url(#cbg)" rx="3" />
            <rect width="800" height="560" fill="url(#gp)" rx="3" />
            <rect x="11" y="11" width="778" height="538" fill="none" stroke="url(#gold)" strokeWidth="2" rx="3" />
            <rect x="19" y="19" width="762" height="522" fill="none" stroke="rgba(232,184,75,.25)" strokeWidth=".8" rx="2" />
            {[[30, 30], [770, 30], [30, 530], [770, 530]].map(([cx, cy], i) => (
                <g key={i} transform={`translate(${cx},${cy})`}>
                    <circle r="10" fill="none" stroke="url(#gold)" strokeWidth="1.5" />
                    <circle r="5" fill="rgba(232,184,75,.25)" />
                    <circle r="2" fill="url(#gold)" />
                </g>
            ))}
            {[[50, 30, 195, 30], [605, 30, 750, 30], [50, 530, 195, 530], [605, 530, 750, 530]].map(([x1, y1, x2, y2], i) => (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="url(#gold)" strokeWidth="1" opacity=".45" />
            ))}
            <text x="400" y="66" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="10" fill="rgba(0,210,255,.55)" letterSpacing="6">XRFORGE · VERIFIED CREDENTIAL</text>
            <text x="400" y="114" textAnchor="middle" fontFamily="Georgia,serif" fontSize="30" fill="url(#gold)" letterSpacing="4" fontStyle="italic">Certificate of Completion</text>
            <line x1="100" y1="127" x2="700" y2="127" stroke="url(#gold)" strokeWidth=".8" opacity=".45" />
            <circle cx="400" cy="127" r="3" fill="url(#gold)" />
            <text x="400" y="168" textAnchor="middle" fontFamily="Georgia,serif" fontSize="13" fill="rgba(210,228,248,.6)" letterSpacing="2">THIS CERTIFIES THAT</text>
            <text x="400" y="218" textAnchor="middle" fontFamily="Georgia,serif" fontSize="42" fill="#e8f4ff" fontStyle="italic">Your Name</text>
            <line x1="155" y1="230" x2="645" y2="230" stroke="rgba(0,210,255,.28)" strokeWidth=".8" />
            <text x="400" y="263" textAnchor="middle" fontFamily="Georgia,serif" fontSize="12" fill="rgba(210,228,248,.5)" letterSpacing="2">HAS SUCCESSFULLY COMPLETED</text>
            <text x="400" y="304" textAnchor="middle" fontFamily="Georgia,serif" fontSize="20" fill="url(#cyg)" letterSpacing="1">AR / VR Immersive Learning — Foundation Module</text>
            <rect x="158" y="326" width="484" height="52" rx="4" fill="rgba(0,210,255,.04)" stroke="rgba(0,210,255,.14)" strokeWidth=".8" />
            {[["MODULES", "12 Completed", 255], ["ASSESSMENT", "MCQ + Labs", 400], ["ISSUED", "Jan 2025", 545]].map(([lbl, val, x]) => (
                <g key={lbl}>
                    <text x={x} y="345" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="8" fill="rgba(0,200,255,.55)" letterSpacing="2">{lbl}</text>
                    <text x={x} y="363" textAnchor="middle" fontFamily="Georgia,serif" fontSize="13" fill="#e8f4ff">{val}</text>
                </g>
            ))}
            <line x1="320" y1="332" x2="320" y2="372" stroke="rgba(0,210,255,.18)" strokeWidth=".5" />
            <line x1="480" y1="332" x2="480" y2="372" stroke="rgba(0,210,255,.18)" strokeWidth=".5" />
            <line x1="100" y1="400" x2="700" y2="400" stroke="rgba(232,184,75,.18)" strokeWidth=".6" />
            {/* Single coordinator centered */}
            <text x="400" y="438" textAnchor="middle" fontFamily="Georgia,serif" fontSize="17" fill="#e8f4ff" fontStyle="italic">Kapil Khurana</text>
            <line x1="290" y1="449" x2="510" y2="449" stroke="rgba(232,184,75,.35)" strokeWidth=".8" />
            <text x="400" y="463" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="8" fill="rgba(210,228,248,.4)" letterSpacing="2">PROGRAM COORDINATOR</text>
            <circle cx="400" cy="495" r="0" />
            <text x="400" y="510" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="8" fill="rgba(0,200,255,.38)" letterSpacing="3">CERT-ID: XRSLM-2025-AR-00847 · BLOCKCHAIN VERIFIED</text>
        </svg>
    );
}

/* ══════════════════════════════════════════
   CURRICULUM ROW
══════════════════════════════════════════ */
function CurrRow({ num, title, hrs, topics, status, open: initOpen }: any) {
    const [open, setOpen] = useState(initOpen);
    const colors: Record<string, string> = {
        "Free": "#00e0ff", "Core": "rgba(228,238,248,.7)", "Advanced": "#7c4dff", "Capstone": "#e8b84b"
    };
    return (
        <div style={{ border: "1px solid rgba(0,224,255,.1)", background: open ? "rgba(0,224,255,.03)" : "transparent", transition: "background .3s" }}>
            <button onClick={() => setOpen(!open)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "18px 16px", background: "none", border: "none", cursor: "pointer", color: "#e4eef8", textAlign: "left" }}>
                <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: "rgba(0,224,255,.65)", width: 26, flexShrink: 0 }}>{num}</span>
                <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, flex: 1 }}>{title}</span>
                <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: colors[status] || "#00e0ff", letterSpacing: 1, marginRight: 4, textTransform: "uppercase", flexShrink: 0 }}>{status}</span>
                <span style={{ color: "#00e0ff", fontSize: 12, transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform .3s", flexShrink: 0 }}>▶</span>
            </button>
            {open && (
                <div style={{ padding: "0 16px 18px 54px", display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {topics.map((t: string) => (
                        <span key={t} style={{ fontSize: 12, color: "rgba(228,238,248,.72)", padding: "4px 12px", border: "1px solid rgba(0,224,255,.1)", background: "rgba(0,224,255,.03)" }}>↳ {t}</span>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ══════════════════════════════════════════
   LOGIN FORM
══════════════════════════════════════════ */
function LoginForm() {
    const navigate = useNavigate();

    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error('Please fill in all fields');
            return;
        }

        setLoading(true);

        try {
            localStorage.clear();

            const res = await api.post('/accounts/login/', {
                email,
                password
            });

            const { user, access, refresh } = res.data;

            localStorage.setItem('access', access);
            localStorage.setItem('refresh', refresh);
            localStorage.setItem('user', JSON.stringify(user));

            toast.success('Login successful!');

            const role = user.role || 'Participant';

            setTimeout(() => {
                if (role === 'admin') {
                    navigate('/admin_home');
                } else {
                    navigate('/user_home');
                }
            }, 400);

        } catch (err) {
            const message =
                err.response?.data?.detail ||
                err.response?.data?.message ||
                'Invalid email or password';

            toast.error(message);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div style={{ padding: "32px 24px" }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, marginBottom: 5 }}>Sign In</div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: 2, color: "rgba(228,238,248,.55)", marginBottom: 28, textTransform: "uppercase" }}>Student Portal Access</div>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 16 }}>
                    <label style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: 2, color: "rgba(228,238,248,.65)", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Email Address</label>
                    <input style={{ width: "100%", background: "rgba(0,224,255,.04)", border: "1px solid rgba(0,224,255,.18)", color: "#e4eef8", fontFamily: "'Exo 2',sans-serif", fontSize: 15, padding: "13px 16px", outline: "none", boxSizing: "border-box" }}
                        type="email" placeholder="you@xrslm.io" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div style={{ marginBottom: 20 }}>
                    <label style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: 2, color: "rgba(228,238,248,.65)", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Password</label>
                    <input style={{ width: "100%", background: "rgba(0,224,255,.04)", border: "1px solid rgba(0,224,255,.18)", color: "#e4eef8", fontFamily: "'Exo 2',sans-serif", fontSize: 15, padding: "13px 16px", outline: "none", boxSizing: "border-box" }}
                        type="password" placeholder="••••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>

                <button type="submit" style={{ width: "100%", fontFamily: "'DM Mono',monospace", fontSize: 12, letterSpacing: 3, textTransform: "uppercase", padding: "16px", background: "linear-gradient(135deg,#00e0ff,#7c4dff)", color: "#060c18", border: "none", cursor: "pointer", fontWeight: 700, clipPath: "polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)", opacity: loading ? .7 : 1, transition: "filter .25s,box-shadow .25s" }}>
                    {loading ? "Authenticating…" : "Enter Dashboard"}
                </button>
            </form>
            {msg && <div style={{ marginTop: 14, fontFamily: "'DM Mono',monospace", fontSize: 11, letterSpacing: 1, color: msg.includes("✓") ? "#00e0ff" : "#ffaa44" }}>{msg}</div>}
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid rgba(0,224,255,.1)", textAlign: "center", fontSize: 14, color: "rgba(228,238,248,.6)" }}>
                New learner? <span onClick={() => navigate("/ar-register")} style={{ color: "#00e0ff", cursor: "pointer" }}>Create New account →</span>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════
   REVEAL OBSERVER
══════════════════════════════════════════ */
function Reveal() {
    useEffect(() => {
        const obs = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add("in"); }), { threshold: .1 });
        document.querySelectorAll(".rv").forEach(el => obs.observe(el));
        return () => obs.disconnect();
    }, []);
    return null;
}

/* ══════════════════════════════════════════
   MOBILE NAV DRAWER
══════════════════════════════════════════ */
function MobileNav({ navLinks, goto, activeNav, onLogin }: { navLinks: any[]; goto: (id: string) => void; activeNav: string; onLogin: () => void }) {
    const [open, setOpen] = useState(false);
    return (
        <>
            <button onClick={() => setOpen(o => !o)} style={{
                background: "none", border: "none", cursor: "pointer",
                display: "flex", flexDirection: "column", gap: 5, padding: 8,
            }}>
                <div style={{ width: 22, height: 1.5, background: open ? "#00e0ff" : "rgba(228,238,248,.7)", transition: "transform .3s, background .3s", transform: open ? "rotate(45deg) translate(4px, 4.5px)" : "none" }} />
                <div style={{ width: 22, height: 1.5, background: open ? "transparent" : "rgba(228,238,248,.7)", transition: "opacity .2s" }} />
                <div style={{ width: 22, height: 1.5, background: open ? "#00e0ff" : "rgba(228,238,248,.7)", transition: "transform .3s, background .3s", transform: open ? "rotate(-45deg) translate(4px, -4.5px)" : "none" }} />
            </button>
            {open && (
                <div style={{
                    position: "fixed", top: 56, left: 0, right: 0, bottom: 0,
                    background: "#060c18",
                    backdropFilter: "none",
                    WebkitBackdropFilter: "none",
                    zIndex: 9999,
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", gap: 8,
                    isolation: "isolate",
                }}>
                    {navLinks.map(n => (
                        <button key={n.id} onClick={() => { goto(n.id); setOpen(false); }} style={{
                            fontFamily: "'Syne',sans-serif", fontWeight: 700,
                            fontSize: 24, color: activeNav === n.id ? "#00e0ff" : "rgba(228,238,248,.7)",
                            background: "none", border: "none", cursor: "pointer", padding: "12px 0",
                            transition: "color .2s",
                        }}>{n.l}</button>
                    ))}
                    <button onClick={() => { onLogin(); setOpen(false); }} style={{
                        marginTop: 20, fontFamily: "'DM Mono',monospace", fontSize: 14,
                        letterSpacing: 2, textTransform: "uppercase", padding: "14px 40px",
                        background: "linear-gradient(135deg,#00e0ff,#7c4dff)", color: "#060c18",
                        border: "none", cursor: "pointer", fontWeight: 700,
                        clipPath: "polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)",
                    }}>Login</button>
                </div>
            )}
        </>
    );
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function LandingPage() {

    const videos = [
        { title: "Engine Assembly Simulation", url: "https://drive.google.com/file/d/1HiWUc20w9ZcGmc6UuOuhF_iLBBmVG91Z/preview", thumb: "https://drive.google.com/thumbnail?id=1HiWUc20w9ZcGmc6UuOuhF_iLBBmVG91Z" },
        { title: "Forklift Operation Training", url: "https://drive.google.com/file/d/1I9SqpQj-VgaZWR159jPPRmMCDwNwaw6S/preview", thumb: "https://drive.google.com/thumbnail?id=1I9SqpQj-VgaZWR159jPPRmMCDwNwaw6S" },
        { title: "Roller & Nut Assembly Process", url: "https://drive.google.com/file/d/14LABygDWiU8-ZweqZuZ9FI5uC1x3fflv/preview", thumb: "https://drive.google.com/thumbnail?id=14LABygDWiU8-ZweqZuZ9FI5uC1x3fflv" },
    ];
    const [activeVideo, setActiveVideo] = useState<string | null>(null);
    const [showModules, setShowModules] = useState(false);
    const [p, setP] = useState(0);
    const [navSolid, setNavSolid] = useState(false);
    const [activeNav, setActiveNav] = useState("overview");
    const floatT = useRef(0);
    const [fy, setFy] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);

    useEffect(() => {
        const check = () => {
            const w = window.innerWidth;
            setIsMobile(w < 768);
            setIsTablet(w >= 768 && w < 1024);
        };
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    useEffect(() => {
        let raf: number;
        const tick = () => { floatT.current += 0.016; setFy(Math.sin(floatT.current) * 11); raf = requestAnimationFrame(tick); };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, []);

    useEffect(() => {
        const fn = () => {
            const y = window.scrollY;
            setNavSolid(y > 70);
            setP(Math.min(1, y / (window.innerHeight * 0.9)));
            const ids = ["overview", "highlights", "content", "why", "videos", "certificate"];
            for (const id of [...ids].reverse()) {
                const el = document.getElementById(id);
                if (el && el.getBoundingClientRect().top < window.innerHeight * 0.55) { setActiveNav(id); break; }
            }
        };
        window.addEventListener("scroll", fn, { passive: true });
        return () => window.removeEventListener("scroll", fn);
    }, []);

    const goto = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

    const navLinks = [
        { id: "overview", l: "Overview" }, { id: "highlights", l: "Highlights" }, { id: "content", l: "Content" },
        { id: "why", l: "Why It Works" }, { id: "videos", l: "Demo" }, { id: "certificate", l: "Certificate" },
    ];

    const px = isMobile ? "20px" : isTablet ? "32px" : "48px";

    return (
        <div style={{ background: "#060c18", color: "#e4eef8", fontFamily: "'Exo 2',sans-serif" }}>
            <style>{`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html{scroll-behavior:smooth;}
body{font-family:'Inter',sans-serif;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;}
::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-track{background:#060c18}
::-webkit-scrollbar-thumb{background:#00e0ff;border-radius:2px}

.rv{opacity:0;transform:translateY(30px);transition:opacity .7s ease,transform .7s ease;}
.rv.in{opacity:1;transform:translateY(0);}
.rv2{opacity:0;transform:translateY(30px);transition:opacity .7s .15s ease,transform .7s .15s ease;}
.rv2.in{opacity:1;transform:translateY(0);}

.gc{background:rgba(255,255,255,.025);border:1px solid rgba(0,224,255,.12);padding:30px;transition:all .3s ease;}
.gc:hover{border-color:rgba(0,224,255,.35);background:rgba(0,224,255,.04);transform:translateY(-4px);}

@media (max-width:767px){
  .gc{padding:20px;}
}

/* ── Nav links: brighter + larger ── */
.nl{font-family:'Space Grotesk',sans-serif;font-size:13px;letter-spacing:1.5px;text-transform:uppercase;color:rgba(228,238,248,.7);background:none;border:none;cursor:pointer;padding:6px 0;position:relative;transition:color .25s;}
.nl:hover,.nl.act{color:#00e0ff;}
.nl.act::after{content:'';position:absolute;bottom:0;left:0;right:0;height:1px;background:#00e0ff;box-shadow:0 0 8px #00e0ff;}

.tag{display:inline-block;font-family:'Space Grotesk',sans-serif;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#00e0ff;border:1px solid rgba(0,224,255,.3);padding:5px 14px;background:rgba(0,224,255,.06);clip-path:polygon(5px 0%,100% 0%,calc(100% - 5px) 100%,0% 100%);}

/* ── eyebrow label: brighter ── */
.eye{font-family:'Space Grotesk',sans-serif;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:rgba(0,224,255,.75);margin-bottom:14px;}

.st{font-family:'Inter',sans-serif;font-size:clamp(26px,4.5vw,58px);font-weight:700;letter-spacing:-0.03em;line-height:1.1;margin-bottom:18px;}
.gt{background:linear-gradient(90deg,#00e0ff,#7c4dff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}

/* ── body text: significantly brighter ── */
.bod{font-size:16px;line-height:1.75;color:rgba(228,238,248,.82);font-weight:400;}

.pb{height:3px;background:rgba(0,224,255,.13);border-radius:2px;overflow:hidden;margin-top:7px;}
.pf{height:100%;background:linear-gradient(90deg,#00e0ff,#7c4dff);border-radius:2px;transition:width .3s;}
.vc{background:rgba(0,0,0,.38);border:1px solid rgba(0,224,255,.14);overflow:hidden;cursor:pointer;transition:all .3s ease;}
.vc:hover{border-color:rgba(0,224,255,.45);transform:scale(1.02);}
.pb2{width:58px;height:58px;border-radius:50%;background:rgba(0,224,255,.12);border:2px solid rgba(0,224,255,.7);display:flex;align-items:center;justify-content:center;font-size:20px;color:#00e0ff;transition:all .25s;}
.vc:hover .pb2{background:rgba(0,224,255,.25);transform:scale(1.1);}

@keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
.fu{animation:fadeUp .9s ease both}
.d1{animation-delay:.1s}.d2{animation-delay:.22s}.d3{animation-delay:.36s}.d4{animation-delay:.5s}
@keyframes scandown{0%{transform:translateY(-100%)}100%{transform:translateY(500%)}}
@keyframes spinLoad{to{transform:rotate(360deg)}}
@keyframes scrollDot{0%,100%{transform:translateY(0);opacity:1}60%{transform:translateY(9px);opacity:0.2}}

input:focus{border-color:#00e0ff!important;box-shadow:0 0 18px rgba(0,224,255,.12)!important;}
`}</style>
            <Reveal />

            {/* ─── NAV ─── */}
            <nav style={{
                position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: `0 ${px}`, height: isMobile ? 56 : 64,
                background: navSolid ? "rgba(6,12,24,.94)" : "transparent",
                backdropFilter: navSolid ? "blur(20px)" : "none",
                borderBottom: navSolid ? "1px solid rgba(0,224,255,.1)" : "1px solid transparent",
                transition: "background .4s,backdrop-filter .4s,border-color .4s",
            }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: isMobile ? 18 : 20, color: "#00e0ff", letterSpacing: 2 }}>
                    XR<span style={{ color: "#7c4dff" }}>FORGE</span>
                </div>

                {/* Desktop nav links */}
                {!isMobile && (
                    <div style={{ display: "flex", gap: isTablet ? 16 : 30 }}>
                        {navLinks.map(n => (
                            <button key={n.id} className={`nl${activeNav === n.id ? " act" : ""}`} onClick={() => goto(n.id)}>{n.l}</button>
                        ))}
                    </div>
                )}

                {/* Desktop login btn */}
                {!isMobile && (
                    <button onClick={() => goto("login")} style={{
                        fontFamily: "'DM Mono',monospace", fontSize: 13, letterSpacing: 2, textTransform: "uppercase",
                        padding: isTablet ? "8px 16px" : "10px 22px",
                        background: "linear-gradient(135deg,#00e0ff,#7c4dff)", color: "#060c18",
                        border: "none", cursor: "pointer", fontWeight: 700,
                        clipPath: "polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)",
                    }}>Login</button>
                )}

                {/* Mobile hamburger */}
                {isMobile && (
                    <MobileNav navLinks={navLinks} goto={goto} activeNav={activeNav} onLogin={() => goto("login")} />
                )}
            </nav>

            {/* ─── HERO ─── */}
            <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "clip" }}>
                <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,224,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,224,255,.03) 1px,transparent 1px)", backgroundSize: "60px 60px", zIndex: 0 }} />
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 55% at 50% 40%, rgba(0,224,255,.05) 0%,transparent 70%)", zIndex: 0 }} />

                <div style={{
                    position: "relative", zIndex: 1, width: "100%", maxWidth: 1200, margin: "0 auto",
                    padding: isMobile ? "100px 20px 60px" : isTablet ? "110px 32px 80px" : "120px 48px 80px",
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                    gap: isMobile ? 0 : 48,
                    alignItems: "center",
                }}>
                    {/* TEXT */}
                    <div>
                        <div className="tag fu" style={{ marginBottom: 22 }}>AR / VR Self-Learning Module</div>
                        <h1 className="fu d1" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: isMobile ? "clamp(36px,10vw,56px)" : "clamp(40px,5.5vw,76px)", lineHeight: 1, marginBottom: 22 }}>
                            Learn Inside<br /><span className="gt">Virtual Reality</span>
                        </h1>
                        <p className="fu d2 bod" style={{ maxWidth: isMobile ? "100%" : 420, marginBottom: 32, fontSize: isMobile ? 15 : 16 }}>
                            A self-paced immersive curriculum for the spatial computing era. Master AR/VR development through hands-on XR environments — not screen-based videos.
                        </p>
                        <div className="fu d3" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                            <button onClick={() => goto("overview")} style={{
                                fontFamily: "'DM Mono',monospace", fontSize: isMobile ? 10 : 13, letterSpacing: 2, textTransform: "uppercase",
                                padding: isMobile ? "12px 24px" : "15px 36px",
                                background: "linear-gradient(135deg,#00e0ff,#7c4dff)", color: "#060c18",
                                border: "none", cursor: "pointer", fontWeight: 700,
                                clipPath: "polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)",
                            }}>Explore Course</button>
                            <button onClick={() => goto("videos")} style={{
                                fontFamily: "'DM Mono',monospace", fontSize: isMobile ? 10 : 13, letterSpacing: 2, textTransform: "uppercase",
                                padding: isMobile ? "12px 24px" : "15px 36px",
                                background: "transparent", color: "rgba(228,238,248,.85)",
                                border: "1px solid rgba(228,238,248,.35)", cursor: "pointer",
                                clipPath: "polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)",
                            }}>Watch Demo</button>
                        </div>
                        {/* mini stats */}
                        <div className="fu d4" style={{
                            display: "flex", gap: isMobile ? 16 : 28, marginTop: 36, paddingTop: 24,
                            borderTop: "1px solid rgba(0,224,255,.1)", flexWrap: "wrap",
                        }}>
                            {[["40h", "Content"], ["6", "Modules"], ["3", "XR Platforms"], ["Cert", "Included"]].map(([n, l]) => (
                                <div key={l}>
                                    <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: isMobile ? 16 : 20, color: "#00e0ff" }}>{n}</div>
                                    <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: 2, color: "rgba(228,238,248,.82)", textTransform: "uppercase", marginTop: 2 }}>{l}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT COLUMN — 3D model */}
                    {isMobile ? (
                        <div style={{ marginTop: 32 }}>
                            <HeroModelViewer isMobile={true} />
                        </div>
                    ) : (
                        <div style={{
                            position: "relative", display: "flex", alignItems: "flex-end",
                            justifyContent: "center", minHeight: "100vh", overflow: "visible",
                        }}>
                            <HeroModelViewer isMobile={false} />
                        </div>
                    )}
                </div>

                {/* scroll cue */}
                <div style={{ position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: 3, color: "rgba(228,238,248,.45)", textTransform: "uppercase" }}>Scroll</div>
                    <div style={{ width: 1, height: 48, background: "linear-gradient(to bottom,rgba(0,224,255,.6),transparent)", animation: "scandown 2s ease-in-out infinite" }} />
                </div>
            </section>

            {/* ─── SCROLL HEADSET ANIMATION ─── */}
            <ScrollModelStrip />

            {/* ─── OVERVIEW ─── */}
            <section id="overview" style={{ padding: isMobile ? "70px 20px" : isTablet ? "90px 32px" : "110px 48px", maxWidth: 1200, margin: "0 auto" }}>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                    gap: isMobile ? 48 : 80,
                    alignItems: "center",
                }}>
                    <div className="rv">
                        <div className="eye">// Overview</div>
                        <h2 className="st">What Is This <span className="gt">Module?</span></h2>
                        <p className="bod" style={{ marginBottom: 26, fontSize: isMobile ? 15 : 16 }}>The AR/VR Self-Learning Module is a fully immersive, self-paced program that teaches you to build, deploy, and design for the spatial web. No prior XR experience needed — just curiosity.</p>
                        <p className="bod" style={{ marginBottom: 34, fontSize: isMobile ? 15 : 16 }}>Using Unity XR, WebXR, ARKit, and OpenXR you'll complete real projects that run on Meta Quest, Apple Vision Pro, and HoloLens 2.</p>
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                            {["Unity XR", "WebXR", "ARKit", "OpenXR", "Meta SDK", "MRTK3"].map(t => <span key={t} className="tag">{t}</span>)}
                        </div>
                    </div>
                    <div className="rv2">
                        {[["Spatial Computing Foundations", 95], ["XR Development (Unity/WebXR)", 88], ["AR Design Principles", 82], ["Multi-Platform Deployment", 78], ["AI Integration in XR", 70]].map(([l, pct]) => (
                            <div key={l} style={{ marginBottom: 18 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                    <span style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 14, color: "rgba(228,238,248,.82)" }}>{l}</span>
                                    <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: "#00e0ff" }}>{pct}%</span>
                                </div>
                                <div className="pb"><div className="pf" style={{ width: `${pct}%` }} /></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── HIGHLIGHTS ─── */}
            <section id="highlights" style={{ padding: isMobile ? "70px 20px" : isTablet ? "90px 32px" : "110px 48px", background: "rgba(0,224,255,.018)", borderTop: "1px solid rgba(0,224,255,.08)", borderBottom: "1px solid rgba(0,224,255,.08)" }}>
                <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                    <div className="rv" style={{ textAlign: "center", marginBottom: 48 }}>
                        <div className="eye">// Highlights</div>
                        <h2 className="st">What You <span className="gt">Get</span></h2>
                    </div>
                    <div className="rv" style={{
                        display: "grid",
                        gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2,1fr)" : "repeat(auto-fit,minmax(260px,1fr))",
                        gap: 1, background: "rgba(0,224,255,.07)",
                    }}>
                        {[
                            {
                                ic: "🥽",
                                t: "XR Fundamentals",
                                d: "Learn AR, VR, MR, and XR from basics to advanced with real-world applications and future scope."
                            },
                            {
                                ic: "🛠️",
                                t: "Unity Mastery",
                                d: "Complete Unity engine training including interface, workflow, game objects, and components."
                            },
                            {
                                ic: "💻",
                                t: "C# Scripting",
                                d: "Build logic using C# — variables, loops, conditions, and real project scripting in Unity."
                            },
                            {
                                ic: "⚙️",
                                t: "Physics & Interaction",
                                d: "Understand colliders, rigidbody, gravity, and create real-time object interactions."
                            },
                            {
                                ic: "🎮",
                                t: "VR Project Labs",
                                d: "Hands-on labs to build VR projects — movement, grabbing objects, controller interaction."
                            },
                            {
                                ic: "📱",
                                t: "AR Development",
                                d: "Create AR apps with plane detection, object placement, image tracking, and real-world interaction."
                            },
                            {
                                ic: "🧪",
                                t: "Practice & MCQs",
                                d: "Module-wise MCQs and practical exercises to test your understanding and improve skills."
                            },
                            {
                                ic: "🏆",
                                t: "Certificate",
                                d: "Get a verified completion certificate after finishing projects, labs, and assessments."
                            }
                        ].map(({ ic, t, d }) => (
                            <div key={t} className="gc" style={{ background: "rgba(6,12,24,.97)" }}>
                                <div style={{ fontSize: 28, marginBottom: 12 }}>{ic}</div>
                                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 8, color: "#f0f8ff" }}>{t}</div>
                                <div style={{ fontSize: 14, lineHeight: 1.75, color: "rgba(228,238,248,.72)" }}>{d}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── CONTENT ─── */}
            <section id="content" style={{ padding: isMobile ? "70px 20px" : isTablet ? "90px 32px" : "110px 48px", maxWidth: 1200, margin: "0 auto" }}>
                <div className="rv" style={{ marginBottom: 48 }}>
                    <div className="eye">// Curriculum</div>
                    <h2 className="st">Module <span className="gt">Content</span></h2>
                </div>
                <div className="rv" style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {[
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
                    ].slice(0, showModules ? 12 : 6).map(m => <CurrRow key={m.num} {...m} />)}
                </div>
                <div style={{ textAlign: "center", marginTop: 24 }}>
                    <button onClick={() => setShowModules(v => !v)} style={{
                        fontFamily: "'DM Mono',monospace", fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
                        padding: "13px 38px", background: "transparent", color: "rgba(228,238,248,.8)",
                        border: "1px solid rgba(0,224,255,.3)", cursor: "pointer",
                        clipPath: "polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)",
                    }}>
                        {showModules ? "Show Less ↑" : "Show More ↓"}
                    </button>
                </div>
            </section>

            {/* ─── WHY IT WORKS ─── */}
            <section id="why" style={{ padding: isMobile ? "70px 20px" : isTablet ? "90px 32px" : "110px 48px", background: "linear-gradient(180deg,rgba(124,77,255,.04) 0%,transparent 100%)", borderTop: "1px solid rgba(124,77,255,.1)" }}>
                <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                    <div className="rv" style={{ textAlign: "center", marginBottom: 56 }}>
                        <div className="eye">// Methodology</div>
                        <h2 className="st">Why This Module <span className="gt">Works</span></h2>
                        <p className="bod" style={{ maxWidth: 520, margin: "0 auto", fontSize: isMobile ? 15 : 16 }}>Built on cognitive science, spatial pedagogy, and 5 years of XR learning research.</p>
                    </div>
                    <div className="rv" style={{
                        display: "grid",
                        gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2,1fr)" : "repeat(3,1fr)",
                        gap: 20,
                    }}>
                        {[
                            { ic: "🚀", st: "3×", lb: "Faster Learning", d: "Hands-on Unity + XR labs accelerate understanding compared to only theory-based learning." },
                            { ic: "🧠", st: "90%", lb: "Concept Clarity", d: "Practical projects and real-time interaction help you deeply understand AR, VR, and Unity workflows." },
                            { ic: "🎯", st: "100%", lb: "Project-Based", d: "Every module includes real project building — from basics to full XR application development." },
                        ].map(({ ic, st, lb, d }) => (
                            <div key={lb} className="gc" style={{ textAlign: "center" }}>
                                <div style={{ fontSize: 32, marginBottom: 12 }}>{ic}</div>
                                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: isMobile ? 38 : 46, color: "#00e0ff", lineHeight: 1, marginBottom: 5 }}>{st}</div>
                                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: 2, color: "rgba(228,238,248,.90)", textTransform: "uppercase", marginBottom: 12 }}>{lb}</div>
                                <div style={{ fontSize: 14, lineHeight: 1.75, color: "rgba(228,238,248,.92)" }}>{d}</div>
                            </div>
                        ))}
                    </div>
                    <div className="rv" style={{
                        display: "grid",
                        gridTemplateColumns: isMobile ? "1fr" : "repeat(2,1fr)",
                        gap: 16, marginTop: 24,
                    }}>
                        {[
                            { t: "Hands-On Learning", d: "You don’t just watch — you build. Every concept is applied through Unity projects and XR labs." },
                            { t: "Step-by-Step Curriculum", d: "Structured modules take you from beginner to advanced — no confusion, no gaps in learning." },
                            { t: "Real XR Labs", d: "Learn how to create VR interactions like grabbing objects, movement, and real-world AR placement." },
                            { t: "Assessment & Certification", d: "Test your skills with MCQs and projects, then earn a verified certificate on completion." },
                        ].map(({ t, d }) => (
                            <div key={t} style={{ display: "flex", gap: 16, padding: "20px 22px", border: "1px solid rgba(0,224,255,.1)", background: "rgba(0,224,255,.02)" }}>
                                <div style={{ width: 3, background: "linear-gradient(to bottom,#00e0ff,#7c4dff)", borderRadius: 2, flexShrink: 0 }} />
                                <div>
                                    <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{t}</div>
                                    <div style={{ fontSize: 14, lineHeight: 1.75, color: "rgba(228,238,248,.72)" }}>{d}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── DEMO VIDEOS ─── */}
            <section id="videos" style={{ padding: isMobile ? "70px 20px" : isTablet ? "90px 32px" : "80px 48px", maxWidth: 1200, margin: "0 auto" }}>
                <div className="rv" style={{ marginBottom: 32 }}>
                    <div className="eye">// Demo Videos</div>
                    <h2 className="st">See It In <span className="gt">Action</span></h2>
                </div>
                <div className="rv" style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 280px",
                    gap: 14,
                    maxWidth: 960,
                    margin: "0 auto",
                    alignItems: "start",
                }}>
                    {/* Main Video - Left */}
                    <div className="vc" style={{ borderRadius: 2 }}>
                        <div style={{
                            width: "100%",
                            height: isMobile ? "220px" : "397px",
                            background: "#000",
                            position: "relative",
                            overflow: "hidden",
                        }}>
                            {activeVideo ? (
                                <iframe src={activeVideo} width="100%" height="100%" allow="autoplay" style={{ border: "none", display: "block" }} />
                            ) : (
                                <div onClick={() => setActiveVideo(videos[0].url)} style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", background: "linear-gradient(135deg,#050e20,#0a1830,#0d1040)" }}>
                                    <div className="pb2">▶</div>
                                </div>
                            )}
                        </div>
                        <div style={{ padding: "12px 16px" }}>
                            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: isMobile ? 14 : 15, marginBottom: 2, color: "#f0f8ff" }}>
                                {videos.find(v => v.url === activeVideo)?.title || videos[0].title}
                            </div>
                            <div style={{ fontSize: 12, color: "rgba(228,238,248,.75)" }}>Click to play immersive XR demo</div>
                        </div>
                    </div>

                    {/* 3 Thumbnails - Right stacked */}
                    <div style={{ display: "flex", flexDirection: isMobile ? "row" : "column", gap: 8, flexWrap: isMobile ? "wrap" : "nowrap" }}>
                        {videos.map((v) => (
                            <div key={v.title} className="vc" style={{
                                borderRadius: 2,
                                flex: isMobile ? "1 1 calc(33% - 8px)" : "unset",
                                border: activeVideo === v.url ? "1px solid rgba(0,224,255,.6)" : "1px solid rgba(0,224,255,.14)",
                                cursor: "pointer",
                            }} onClick={() => setActiveVideo(v.url)}>
                                <div style={{
                                    width: "100%",
                                    height: isMobile ? "80px" : "118px",
                                    background: "rgba(5,10,22,1)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    position: "relative",
                                    overflow: "hidden",
                                }}>
                                    <img
                                        src={v.thumb}
                                        alt={v.title}
                                        style={{ width: "100%", height: "100%", objectFit: "cover", opacity: activeVideo === v.url ? 0.9 : 0.65 }}
                                    />
                                    <div className="pb2" style={{ position: "absolute", width: 30, height: 30, fontSize: 10 }}>▶</div>
                                </div>
                                <div style={{
                                    padding: "7px 10px",
                                    fontSize: 12,
                                    fontFamily: "'Exo 2',sans-serif",
                                    fontWeight: 600,
                                    color: activeVideo === v.url ? "#00e0ff" : "rgba(228,238,248,.92)",
                                    lineHeight: 1.35,
                                }}>{v.title}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── CERTIFICATE ─── */}
            <section id="certificate" style={{ padding: isMobile ? "70px 20px" : isTablet ? "90px 32px" : "110px 48px", background: "rgba(232,184,75,.018)", borderTop: "1px solid rgba(232,184,75,.1)" }}>
                <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                    <div className="rv" style={{ textAlign: "center", marginBottom: 52 }}>
                        <div className="eye" style={{ color: "rgba(232,184,75,.75)" }}>// On Completion</div>
                        <h2 className="st">Earn Your <span style={{ background: "linear-gradient(90deg,#e8b84b,#ffd97a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Certificate</span></h2>
                        <p className="bod" style={{ maxWidth: 520, margin: "0 auto", fontSize: isMobile ? 15 : 16 }}>
                            Complete all 12 modules and pass each module-end quiz to receive your blockchain-verified certificate from XRFORGE.
                        </p>
                    </div>

                    <div className="rv" style={{
                        display: "grid",
                        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                        gap: 48,
                        alignItems: "start",
                        maxWidth: 1100,
                        margin: "0 auto",
                    }}>
                        {/* LEFT — all text content */}
                        <div>
                            {/* Assessment Table */}
                            <div style={{ marginBottom: 32, border: "1px solid rgba(232,184,75,.2)", background: "rgba(232,184,75,.03)" }}>
                                <div style={{ padding: "16px 22px", borderBottom: "1px solid rgba(232,184,75,.15)" }}>
                                    <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: 3, color: "rgba(232,184,75,.75)", textTransform: "uppercase", marginBottom: 4 }}>// Assessment & Evaluation</div>
                                </div>
                                {[
                                    ["Module-End MCQ Quiz (12 Modules)", "Pass All Quizzes"],
                                    ["Hands-On Lab Practice", "For Skill Development"],
                                    ["Module Completion", "All 12 Modules Required"],
                                ].map(([label, value], i, arr) => (
                                    <div key={label} style={{ display: "flex", borderBottom: i < arr.length - 1 ? "1px solid rgba(232,184,75,.1)" : "none" }}>
                                        <div style={{ flex: 1, padding: "13px 22px", fontFamily: "'DM Mono',monospace", fontSize: isMobile ? 11 : 12, color: "rgba(228,238,248,.82)", borderRight: "1px solid rgba(232,184,75,.1)" }}>
                                            {label}
                                        </div>
                                        <div style={{ flex: 1, padding: "13px 22px", fontFamily: "'Exo 2',sans-serif", fontSize: isMobile ? 12 : 13, color: "#e8b84b", fontWeight: 600 }}>
                                            {value}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Completion Criteria */}
                            <div style={{ marginBottom: 32 }}>
                                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: 3, color: "rgba(0,224,255,.65)", textTransform: "uppercase", marginBottom: 10 }}>// Completion Criteria</div>
                                <p style={{ fontSize: 14, lineHeight: 1.75, color: "rgba(228,238,248,.82)" }}>
                                    Complete all 12 modules, practice with hands-on lab documents, and pass the MCQ quiz at the end of each module to unlock the next module.
                                </p>
                            </div>

                            {/* Certification bullets */}
                            <div>
                                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: 3, color: "rgba(0,224,255,.65)", textTransform: "uppercase", marginBottom: 12 }}>// Certification*</div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                    {[
                                        'Participants who successfully complete all 12 modules and pass all module-end quizzes will receive a "Certificate of Completion" from XRFORGE.',
                                        'Participants who complete some modules but not all will receive a "Certificate of Participation".',
                                        'All certificates are auto-generated, portal-verifiable, and digitally signed.',
                                    ].map((text, i) => (
                                        <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", fontSize: 14, lineHeight: 1.7, color: "rgba(228,238,248,.82)" }}>
                                            <span style={{ color: "#00e0ff", flexShrink: 0, marginTop: 2 }}>→</span>
                                            <span>{text}</span>
                                        </div>
                                    ))}
                                </div>
                                <p style={{ fontSize: 12, color: "rgba(228,238,248,.45)", marginTop: 14, fontStyle: "italic" }}>
                                    *Certificates will be issued by XRFORGE and are verifiable through the learning portal.
                                </p>
                            </div>
                        </div>

                        {/* RIGHT — Certificate SVG */}
                        <div style={{ border: "1px solid rgba(232,184,75,.22)", boxShadow: "0 0 60px rgba(232,184,75,.08),0 0 120px rgba(0,224,255,.04)", position: "sticky", top: 80 }}>
                            <Certificate />
                        </div>
                    </div>
                </div>
            </section>
            {/* ─── LOGIN ─── */}
            <section id="login" style={{ padding: isMobile ? "70px 20px" : isTablet ? "90px 32px" : "110px 48px", borderTop: "1px solid rgba(0,224,255,.1)" }}>
                <div style={{ maxWidth: 920, margin: "0 auto" }}>
                    <div className="rv" style={{ textAlign: "center", marginBottom: 48 }}>
                        <div className="eye">// Student Portal</div>
                        <h2 className="st">Start Your <span className="gt">XR Journey</span></h2>
                    </div>
                    <div className="rv" style={{
                        display: "grid",
                        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                        border: "1px solid rgba(0,224,255,.13)",
                        background: "rgba(255,255,255,.02)",
                    }}>
                        {/* Left info panel */}
                        {!isMobile && (
                            <div style={{ padding: isTablet ? "36px 28px" : "48px 40px", borderRight: "1px solid rgba(0,224,255,.1)", background: "linear-gradient(135deg,rgba(0,224,255,.03),rgba(124,77,255,.03))", display: "flex", flexDirection: "column", gap: 0 }}>
                                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, lineHeight: 1.2, marginBottom: 14 }}>
                                    Access Your<br /><span className="gt">XR Dashboard</span>
                                </div>
                                <p className="bod" style={{ fontSize: 15, marginBottom: 28 }}>
                                    Continue your Unity & XR journey — track progress, build projects, complete labs, and test your skills.
                                </p>
                                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                    {[
                                        "Track module-wise progress (AR, VR, Unity)",
                                        "Access VR & AR project labs anytime",
                                        "Practice MCQs and improve concepts",
                                        "Download your completion certificate",
                                        "Save and resume your Unity projects"
                                    ].map(f => (
                                        <div key={f} style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 14, color: "rgba(228,238,248,.75)" }}>
                                            <span style={{ color: "#00e0ff", fontSize: 12 }}>▸</span>{f}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <LoginForm />
                    </div>
                </div>
            </section>
        </div>
    );
}