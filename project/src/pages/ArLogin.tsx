import heroar2 from "../public/heroar2.png";
// ─────────────────────────────────────────────────────────────
//  ScrollModelStrip.tsx  — v2 "Cinematic Reveal"
//
//  npm install @react-three/fiber @react-three/drei three
//  Put your file at  public/Quest3.glb  (or change MODEL_PATH)
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef, useState, Suspense, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

const MODEL_PATH = new URL("../public/Quest3.glb", import.meta.url).href; // ← match your exact public/ filename

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
        // Center the model
        centerModel(cloned.current);
        // Set camera back so model fills view
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

function SpecPanel({ data, show }: { data: PanelData; show: boolean }) {
    const isLeft = data.side === "left";
    return (
        <div style={{
            position: "absolute",
            top: "50%",
            [isLeft ? "left" : "right"]: "3.5%",
            transform: `translateY(-50%) translateX(${show ? 0 : (isLeft ? -50 : 50)}px)`,
            opacity: show ? 1 : 0,
            transition: "opacity 0.55s ease, transform 0.55s cubic-bezier(0.16,1,0.3,1)",
            width: 255,
            pointerEvents: show ? "auto" : "none",
            zIndex: 20,
        }}>
            {/* card */}
            <div style={{
                background: "rgba(5,10,20,0.86)",
                border: `1px solid ${data.accent}28`,
                backdropFilter: "blur(18px)",
                padding: "20px 22px",
                position: "relative",
                overflow: "hidden",
            }}>
                {/* top accent bar */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${data.accent},transparent)` }} />

                {/* corner hex decoration */}
                <div style={{
                    position: "absolute", [isLeft ? "right" : "left"]: 0, top: 0,
                    width: 40, height: 40, opacity: 0.06,
                    background: `linear-gradient(${isLeft ? "225" : "315"}deg,${data.accent},transparent)`,
                }} />

                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: 3, color: data.accent, textTransform: "uppercase", marginBottom: 9 }}>
                    {data.tag}
                </div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 19, color: "#e4eef8", lineHeight: 1.1, marginBottom: 3 }}>
                    {data.title}
                </div>
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "rgba(228,238,248,.35)", marginBottom: 18, lineHeight: 1.5 }}>
                    {data.subtitle}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                    {data.stats.map((s) => (
                        <div key={s.label}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: s.bar !== undefined ? 5 : 0 }}>
                                <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: 1, color: "rgba(228,238,248,.38)", textTransform: "uppercase" }}>
                                    {s.label}
                                </span>
                                <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 12, color: data.accent }}>
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

                {/* bottom dots */}
                <div style={{ marginTop: 16, paddingTop: 13, borderTop: `1px solid ${data.accent}18`, display: "flex", gap: 5, alignItems: "center" }}>
                    {[1, 2, 3].map((i) => (
                        <div key={i} style={{
                            width: 5, height: 5, borderRadius: "50%",
                            background: i === 1 ? data.accent : `${data.accent}33`,
                            boxShadow: i === 1 ? `0 0 6px ${data.accent}` : "none",
                        }} />
                    ))}
                    <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 7, color: "rgba(228,238,248,.22)", letterSpacing: 2, marginLeft: 4 }}>
                        VERIFIED SPECS
                    </span>
                </div>
            </div>

            {/* connector line stub */}
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
function DegreeRing({ p }: { p: number }) {
    const deg = Math.round(p * 360);
    const r = 26;
    const circ = 2 * Math.PI * r;
    return (
        <div style={{ position: "absolute", bottom: 32, right: 72, zIndex: 20, width: 66, height: 66 }}>
            <svg viewBox="0 0 64 64" style={{ width: "100%", height: "100%" }}>
                <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(0,224,255,.1)" strokeWidth="1" strokeDasharray="3 3" />
                <circle cx="32" cy="32" r={r} fill="none" stroke="#00e0ff" strokeWidth="1.8"
                    strokeDasharray={`${(p * circ).toFixed(1)} ${circ}`}
                    strokeLinecap="round"
                    transform="rotate(-90 32 32)"
                    style={{ filter: "drop-shadow(0 0 4px rgba(0,224,255,0.7))" }}
                />
                <text x="32" y="28" textAnchor="middle" fontFamily="'DM Mono',monospace" fontSize="11" fontWeight="bold" fill="#00e0ff">{deg}°</text>
                <text x="32" y="41" textAnchor="middle" fontFamily="'DM Mono',monospace" fontSize="6.5" fill="rgba(0,224,255,.45)">ROTATE</text>
            </svg>
        </div>
    );
}

/* ══════════════════════════════════════════
   PHASE INDICATOR
══════════════════════════════════════════ */
const PHASES = ["Hardware", "Display", "Tracking", "Platform"];

function PhaseBar({ p }: { p: number }) {
    const active = Math.min(3, Math.floor(p * 4));
    return (
        <div style={{
            position: "absolute", bottom: 34, left: "50%", transform: "translateX(-50%)",
            display: "flex", alignItems: "center", gap: 0, zIndex: 20,
        }}>
            {PHASES.map((ph, i) => (
                <div key={ph} style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}>
                        <div style={{
                            width: i === active ? 9 : 6, height: i === active ? 9 : 6,
                            borderRadius: "50%",
                            background: i <= active ? "#00e0ff" : "rgba(0,224,255,.15)",
                            boxShadow: i === active ? "0 0 12px #00e0ff, 0 0 24px rgba(0,224,255,.3)" : "none",
                            transition: "all .4s ease",
                        }} />
                        <div style={{
                            fontFamily: "'DM Mono',monospace", fontSize: 7.5, letterSpacing: 2,
                            color: i === active ? "#00e0ff" : "rgba(228,238,248,.22)",
                            textTransform: "uppercase", transition: "color .4s",
                        }}>{ph}</div>
                    </div>
                    {i < PHASES.length - 1 && (
                        <div style={{
                            width: 48, height: 1, margin: "0 8px 20px",
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
   ALL PANEL DATA
══════════════════════════════════════════ */
const PANELS: PanelData[] = [
    {
        side: "left", tag: "// Hardware", title: "Meta Quest 3", subtitle: "Snapdragon XR2 Gen 2 platform",
        accent: "#00e0ff",
        stats: [
            { label: "Processor", value: "XR2 Gen 2" },
            { label: "RAM", value: "8 GB LPDDR5", bar: 80 },
            { label: "Storage", value: "128 – 512 GB", bar: 60 },
            { label: "Weight", value: "515 g", bar: 48 },
        ],
    },
    {
        side: "right", tag: "// Optics", title: "Pancake Lenses", subtitle: "Local-dimming LCD per eye",
        accent: "#7c4dff",
        stats: [
            { label: "Resolution", value: "2064 × 2208" },
            { label: "Refresh Rate", value: "120 Hz", bar: 90 },
            { label: "Field of View", value: "110° × 96°", bar: 78 },
            { label: "PPD", value: "25 PPD", bar: 55 },
        ],
    },
    {
        side: "left", tag: "// Tracking", title: "6DoF Spatial", subtitle: "Inside-out AI hand tracking",
        accent: "#00ff9d",
        stats: [
            { label: "Cameras", value: "4 Wide-angle" },
            { label: "Latency", value: "< 10 ms", bar: 95 },
            { label: "Hand Tracking", value: "v2.0 AI", bar: 88 },
            { label: "Eye Tracking", value: "Native", bar: 80 },
        ],
    },
    {
        side: "right", tag: "// Platform", title: "Horizon OS", subtitle: "Mixed reality app ecosystem",
        accent: "#e8b84b",
        stats: [
            { label: "App Library", value: "500+ titles", bar: 70 },
            { label: "Passthrough", value: "Full colour", bar: 92 },
            { label: "PC Link", value: "Air + USB-C" },
            { label: "Battery", value: "2.5 – 3 hr", bar: 42 },
        ],
    },
];

/* ══════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════ */
function ScrollModelStrip() {
    const stripRef = useRef<HTMLDivElement>(null);
    const [progress, setProgress] = useState(0);
    const mouse = useRef({ x: 0, y: 0 });
    const [modelReady, setModelReady] = useState(false);

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

    // Which panel is active (one per 25% of scroll)
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

                {/* Header */}
                <div style={{
                    position: "absolute", top: 32, left: "50%", transform: "translateX(-50%)",
                    textAlign: "center", zIndex: 25, whiteSpace: "nowrap",
                }}>
                    <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: 4, color: "rgba(0,224,255,.4)", textTransform: "uppercase", marginBottom: 7 }}>
            // Interactive 360° Breakdown
                    </div>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, color: "#e4eef8" }}>
                        Meta Quest 3 — <span style={{ background: "linear-gradient(90deg,#00e0ff,#7c4dff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                            Spec Explorer
                        </span>
                    </div>
                </div>

                {/* Spec panels — all mounted, shown/hidden via opacity+transform */}
                {PANELS.map((panel, i) => (
                    <SpecPanel key={panel.tag} data={panel} show={i === panelIdx && modelReady} />
                ))}

                {/* 3-D Canvas — centred, large */}
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
                            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: 3, color: "rgba(0,224,255,.4)" }}>LOADING MODEL…</div>
                        </div>
                    )}
                    <Canvas
                        camera={{ position: [0, 0, 5], fov: 42 }}
                        gl={{ antialias: true, alpha: true }}
                        style={{ background: "transparent" }}
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
                <PhaseBar p={progress} />
                <DegreeRing p={progress} />

                {/* Scroll hint */}
                {progress < 0.035 && (
                    <div style={{
                        position: "absolute", bottom: 95, left: "50%", transform: "translateX(-50%)",
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 8, zIndex: 25,
                    }}>
                        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 7.5, letterSpacing: 3, color: "rgba(0,224,255,.38)", textTransform: "uppercase" }}>
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
/* ══════════════════════════════════════════
   HEADSET SVG — reacts to scroll progress
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

            <path d="M58 88 Q58 58 98 53 L402 53 Q442 58 442 88 L442 212 Q442 242 402 247 L98 247 Q58 242 58 212 Z"
                fill="url(#body)" stroke={`rgba(0,224,255,${0.3 + g * 0.35})`} strokeWidth="1.6" />

            <path d="M128 53 Q184 38 250 35 Q316 38 372 53" fill="none" stroke={`rgba(0,224,255,${0.22 + g * 0.3})`} strokeWidth="1.6" />

            <path d="M148 53 L148 16 Q148 9 158 9 L342 9 Q352 9 352 16 L352 53" fill="none" stroke={`rgba(0,224,255,${0.28 + g * 0.22})`} strokeWidth="1.5" />
            <rect x="200" y="9" width="100" height="9" rx="4.5" fill="rgba(0,224,255,0.07)" stroke="rgba(0,224,255,0.18)" strokeWidth=".8" />

            <path d="M58 98 Q24 98 20 130 Q20 150 20 170 Q24 202 58 202" fill="rgba(8,14,28,.92)" stroke={`rgba(0,224,255,${0.28 + g * 0.2})`} strokeWidth="1.2" />
            <path d="M442 98 Q476 98 480 130 Q480 150 480 170 Q476 202 442 202" fill="rgba(8,14,28,.92)" stroke={`rgba(124,77,255,${0.28 + g * 0.2})`} strokeWidth="1.2" />

            <path d="M73 94 Q73 72 98 67 L402 67 Q427 72 427 94 L427 206 Q427 228 402 233 L98 233 Q73 228 73 206 Z"
                fill="rgba(4,9,18,.96)" stroke="rgba(0,224,255,.08)" strokeWidth="1" />

            {/* LEFT LENS */}
            <ellipse cx="162" cy="150" rx="74" ry="60" fill="rgba(0,8,24,.97)" stroke={`rgba(0,224,255,${0.48 + g * 0.42})`} strokeWidth="1.9" filter="url(#glow2)" />
            <ellipse cx="162" cy="150" rx="60" ry="47" fill="url(#ll)" />
            <ellipse cx="162" cy="150" rx="47" ry="36" fill="none" stroke={`rgba(0,224,255,${0.14 + g * 0.28})`} strokeWidth=".8" />
            <ellipse cx="162" cy="150" rx="30" ry="22" fill="none" stroke={`rgba(0,224,255,${0.09 + g * 0.22})`} strokeWidth=".5" strokeDasharray="3 2" />
            <ellipse cx="145" cy="133" rx="13" ry="9" fill="rgba(255,255,255,0.035)" transform="rotate(-22 145 133)" />
            <circle cx="162" cy="150" r={3 + g * 5} fill={`rgba(0,224,255,${0.55 + g * 0.45})`} filter="url(#glow5)" />

            {/* RIGHT LENS */}
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
            <text x="400" y="66" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="10" fill="rgba(0,210,255,.55)" letterSpacing="6">XRSLM ACADEMY · VERIFIED CREDENTIAL</text>
            <text x="400" y="114" textAnchor="middle" fontFamily="Georgia,serif" fontSize="30" fill="url(#gold)" letterSpacing="4" fontStyle="italic">Certificate of Completion</text>
            <line x1="100" y1="127" x2="700" y2="127" stroke="url(#gold)" strokeWidth=".8" opacity=".45" />
            <circle cx="400" cy="127" r="3" fill="url(#gold)" />
            <text x="400" y="168" textAnchor="middle" fontFamily="Georgia,serif" fontSize="13" fill="rgba(210,228,248,.6)" letterSpacing="2">THIS CERTIFIES THAT</text>
            <text x="400" y="218" textAnchor="middle" fontFamily="Georgia,serif" fontSize="42" fill="#e8f4ff" fontStyle="italic">Alex Johnson</text>
            <line x1="155" y1="230" x2="645" y2="230" stroke="rgba(0,210,255,.28)" strokeWidth=".8" />
            <text x="400" y="263" textAnchor="middle" fontFamily="Georgia,serif" fontSize="12" fill="rgba(210,228,248,.5)" letterSpacing="2">HAS SUCCESSFULLY COMPLETED</text>
            <text x="400" y="304" textAnchor="middle" fontFamily="Georgia,serif" fontSize="20" fill="url(#cyg)" letterSpacing="1">AR / VR Immersive Learning — Foundation Module</text>
            <rect x="158" y="326" width="484" height="52" rx="4" fill="rgba(0,210,255,.04)" stroke="rgba(0,210,255,.14)" strokeWidth=".8" />
            {[["DURATION", "40 Hours", 255], ["GRADE", "Distinction", 400], ["ISSUED", "Jan 2025", 545]].map(([lbl, val, x]) => (
                <g key={lbl}>
                    <text x={x} y="345" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="8" fill="rgba(0,200,255,.55)" letterSpacing="2">{lbl}</text>
                    <text x={x} y="363" textAnchor="middle" fontFamily="Georgia,serif" fontSize="13" fill="#e8f4ff">{val}</text>
                </g>
            ))}
            <line x1="320" y1="332" x2="320" y2="372" stroke="rgba(0,210,255,.18)" strokeWidth=".5" />
            <line x1="480" y1="332" x2="480" y2="372" stroke="rgba(0,210,255,.18)" strokeWidth=".5" />
            <line x1="100" y1="400" x2="700" y2="400" stroke="rgba(232,184,75,.18)" strokeWidth=".6" />
            <text x="198" y="442" textAnchor="middle" fontFamily="Georgia,serif" fontSize="17" fill="#e8f4ff" fontStyle="italic">Dr. Priya Sharma</text>
            <line x1="118" y1="449" x2="278" y2="449" stroke="rgba(232,184,75,.35)" strokeWidth=".8" />
            <text x="198" y="463" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="8" fill="rgba(210,228,248,.4)" letterSpacing="2">PROGRAM DIRECTOR</text>
            <circle cx="400" cy="448" r="43" fill="none" stroke="url(#gold)" strokeWidth="2" filter="url(#cg)" />
            <circle cx="400" cy="448" r="35" fill="rgba(232,184,75,.05)" stroke="url(#gold)" strokeWidth=".8" />
            <text x="400" y="441" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="7" fill="url(#gold)" letterSpacing="2">XRSLM</text>
            <text x="400" y="451" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="7" fill="url(#gold)" letterSpacing="1">ACADEMY</text>
            <text x="400" y="463" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="6" fill="rgba(232,184,75,.6)">✦ VERIFIED ✦</text>
            {[0, 45, 90, 135, 180, 225, 270, 315].map((d, i) => (
                <circle key={i} cx={400 + 43 * Math.cos(d * Math.PI / 180)} cy={448 + 43 * Math.sin(d * Math.PI / 180)} r="2" fill="url(#gold)" opacity=".6" />
            ))}
            <text x="602" y="442" textAnchor="middle" fontFamily="Georgia,serif" fontSize="17" fill="#e8f4ff" fontStyle="italic">Raj Mehta</text>
            <line x1="522" y1="449" x2="682" y2="449" stroke="rgba(232,184,75,.35)" strokeWidth=".8" />
            <text x="602" y="463" textAnchor="middle" fontFamily="'Courier New',monospace" fontSize="8" fill="rgba(210,228,248,.4)" letterSpacing="2">CHIEF LEARNING OFFICER</text>
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
        "Free": "#00e0ff", "Core": "rgba(228,238,248,.4)", "Advanced": "#7c4dff", "Capstone": "#e8b84b"
    };
    return (
        <div style={{ border: "1px solid rgba(0,224,255,.1)", background: open ? "rgba(0,224,255,.03)" : "transparent", transition: "background .3s" }}>
            <button onClick={() => setOpen(!open)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 20, padding: "22px 28px", background: "none", border: "none", cursor: "pointer", color: "#e4eef8", textAlign: "left" }}>
                <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "rgba(0,224,255,.5)", width: 26, flexShrink: 0 }}>{num}</span>
                <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, flex: 1 }}>{title}</span>
                <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: colors[status] || "#00e0ff", letterSpacing: 1, marginRight: 8, textTransform: "uppercase" }}>{status}</span>
                <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "rgba(228,238,248,.32)", marginRight: 16 }}>{hrs}</span>
                <span style={{ color: "#00e0ff", fontSize: 12, transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform .3s" }}>▶</span>
            </button>
            {open && (
                <div style={{ padding: "0 28px 22px 74px", display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {topics.map((t: string) => (
                        <span key={t} style={{ fontSize: 12, color: "rgba(228,238,248,.52)", padding: "5px 14px", border: "1px solid rgba(0,224,255,.1)", background: "rgba(0,224,255,.03)" }}>↳ {t}</span>
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
    const [d, setD] = useState({ email: "", pw: "", rem: false });
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const go = (e: any) => {
        e.preventDefault();
        if (!d.email || !d.pw) { setMsg("⚠ Please fill in all fields."); return; }
        setLoading(true); setMsg("");
        setTimeout(() => { setLoading(false); setMsg("✓ Access granted — loading your XR dashboard…"); }, 1400);
    };
    return (
        <div style={{ padding: "48px 44px" }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, marginBottom: 5 }}>Sign In</div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: 2, color: "rgba(228,238,248,.35)", marginBottom: 34, textTransform: "uppercase" }}>Student Portal Access</div>
            <form onSubmit={go}>
                <div style={{ marginBottom: 18 }}>
                    <label style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: 2, color: "rgba(228,238,248,.45)", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Email Address</label>
                    <input style={{ width: "100%", background: "rgba(0,224,255,.04)", border: "1px solid rgba(0,224,255,.18)", color: "#e4eef8", fontFamily: "'Exo 2',sans-serif", fontSize: 15, padding: "13px 16px", outline: "none", boxSizing: "border-box" }}
                        type="email" placeholder="you@xrslm.io" value={d.email} onChange={e => setD(x => ({ ...x, email: e.target.value }))} />
                </div>
                <div style={{ marginBottom: 22 }}>
                    <label style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: 2, color: "rgba(228,238,248,.45)", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Password</label>
                    <input style={{ width: "100%", background: "rgba(0,224,255,.04)", border: "1px solid rgba(0,224,255,.18)", color: "#e4eef8", fontFamily: "'Exo 2',sans-serif", fontSize: 15, padding: "13px 16px", outline: "none", boxSizing: "border-box" }}
                        type="password" placeholder="••••••••••" value={d.pw} onChange={e => setD(x => ({ ...x, pw: e.target.value }))} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 26 }}>
                    <label style={{ display: "flex", gap: 9, alignItems: "center", fontSize: 13, color: "rgba(228,238,248,.48)", cursor: "pointer" }}>
                        <input type="checkbox" checked={d.rem} onChange={e => setD(x => ({ ...x, rem: e.target.checked }))} style={{ accentColor: "#00e0ff" }} />
                        Remember me
                    </label>
                    <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#00e0ff", cursor: "pointer", letterSpacing: 1 }}>Forgot password?</span>
                </div>
                <button type="submit" style={{ width: "100%", fontFamily: "'DM Mono',monospace", fontSize: 12, letterSpacing: 3, textTransform: "uppercase", padding: "16px", background: "linear-gradient(135deg,#00e0ff,#7c4dff)", color: "#060c18", border: "none", cursor: "pointer", fontWeight: 700, clipPath: "polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)", opacity: loading ? .7 : 1, transition: "filter .25s,box-shadow .25s" }}>
                    {loading ? "Authenticating…" : "Enter Dashboard"}
                </button>
            </form>
            {msg && <div style={{ marginTop: 14, fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: 1, color: msg.includes("✓") ? "#00e0ff" : "#ffaa44" }}>{msg}</div>}
            <div style={{ marginTop: 26, paddingTop: 22, borderTop: "1px solid rgba(0,224,255,.1)", textAlign: "center", fontSize: 13, color: "rgba(228,238,248,.4)" }}>
                New learner? <span style={{ color: "#00e0ff", cursor: "pointer" }}>Create free account →</span>
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
   MAIN PAGE
══════════════════════════════════════════ */
export default function LandingPage() {
    const [p, setP] = useState(0);
    const [navSolid, setNavSolid] = useState(false);
    const [activeNav, setActiveNav] = useState("overview");
    const floatT = useRef(0);
    const [fy, setFy] = useState(0);

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

    return (
        <div style={{ background: "#060c18", color: "#e4eef8", fontFamily: "'Exo 2',sans-serif" }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Exo+2:ital,wght@0,200;0,400;0,600;0,800;1,400&family=Syne:wght@700;800&family=DM+Mono:ital@0;1&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#060c18}::-webkit-scrollbar-thumb{background:#00e0ff;border-radius:2px}
        .rv{opacity:0;transform:translateY(30px);transition:opacity .75s ease,transform .75s ease}
        .rv.in{opacity:1;transform:translateY(0)}
        .rv2{opacity:0;transform:translateY(30px);transition:opacity .75s .15s ease,transform .75s .15s ease}
        .rv2.in{opacity:1;transform:translateY(0)}
        .gc{background:rgba(255,255,255,.028);border:1px solid rgba(0,224,255,.11);padding:30px;transition:border-color .3s,background .3s,transform .3s}
        .gc:hover{border-color:rgba(0,224,255,.38);background:rgba(0,224,255,.038);transform:translateY(-4px)}
        .nl{font-family:'DM Mono',monospace;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:rgba(228,238,248,.42);background:none;border:none;cursor:pointer;padding:6px 0;position:relative;transition:color .25s}
        .nl:hover,.nl.act{color:#00e0ff}
        .nl.act::after{content:'';position:absolute;bottom:0;left:0;right:0;height:1px;background:#00e0ff;box-shadow:0 0 8px #00e0ff}
        .tag{display:inline-block;font-family:'DM Mono',monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#00e0ff;border:1px solid rgba(0,224,255,.3);padding:4px 13px;background:rgba(0,224,255,.055);clip-path:polygon(5px 0%,100% 0%,calc(100% - 5px) 100%,0% 100%)}
        .eye{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:rgba(0,224,255,.58);margin-bottom:14px}
        .st{font-family:'Syne',sans-serif;font-size:clamp(30px,4.5vw,58px);font-weight:800;line-height:1.05;margin-bottom:18px}
        .gt{background:linear-gradient(90deg,#00e0ff,#7c4dff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .bod{font-size:16px;line-height:1.82;color:rgba(228,238,248,.56);font-weight:200}
        .pb{height:3px;background:rgba(0,224,255,.13);border-radius:2px;overflow:hidden;margin-top:7px}
        .pf{height:100%;background:linear-gradient(90deg,#00e0ff,#7c4dff);border-radius:2px;transition:width .3s}
        .vc{background:rgba(0,0,0,.38);border:1px solid rgba(0,224,255,.14);overflow:hidden;cursor:pointer;transition:border-color .3s,transform .3s}
        .vc:hover{border-color:rgba(0,224,255,.48);transform:scale(1.025)}
        .pb2{width:58px;height:58px;border-radius:50%;background:rgba(0,224,255,.12);border:2px solid rgba(0,224,255,.7);display:flex;align-items:center;justify-content:center;font-size:20px;color:#00e0ff;transition:background .25s,transform .25s}
        .vc:hover .pb2{background:rgba(0,224,255,.28);transform:scale(1.1)}
        @keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
        .fu{animation:fadeUp .9s ease both}
        .d1{animation-delay:.1s}.d2{animation-delay:.22s}.d3{animation-delay:.36s}.d4{animation-delay:.5s}
        @keyframes scandown{0%{transform:translateY(-100%)}100%{transform:translateY(500%)}}
        input:focus{border-color:#00e0ff!important;box-shadow:0 0 18px rgba(0,224,255,.12)!important}
      `}</style>

            <Reveal />

            {/* ─── NAV ─── */}
            <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 48px", height: 64, background: navSolid ? "rgba(6,12,24,.94)" : "transparent", backdropFilter: navSolid ? "blur(20px)" : "none", borderBottom: navSolid ? "1px solid rgba(0,224,255,.1)" : "1px solid transparent", transition: "background .4s,backdrop-filter .4s,border-color .4s" }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, color: "#00e0ff", letterSpacing: 2 }}>XR<span style={{ color: "#7c4dff" }}>SLM</span></div>
                <div style={{ display: "flex", gap: 30 }}>
                    {navLinks.map(n => <button key={n.id} className={`nl${activeNav === n.id ? " act" : ""}`} onClick={() => goto(n.id)}>{n.l}</button>)}
                </div>
                <button onClick={() => goto("login")} style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", padding: "10px 22px", background: "linear-gradient(135deg,#00e0ff,#7c4dff)", color: "#060c18", border: "none", cursor: "pointer", fontWeight: 700, clipPath: "polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)", transition: "filter .25s" }}>
                    Login
                </button>
            </nav>

            {/* ─── HERO ─── */}
            <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "clip" }}>
                <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,224,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,224,255,.03) 1px,transparent 1px)", backgroundSize: "60px 60px", zIndex: 0 }} />
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 55% at 50% 40%, rgba(0,224,255,.05) 0%,transparent 70%)", zIndex: 0 }} />

                <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 1200, margin: "0 auto", padding: "120px 48px 80px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
                    {/* TEXT */}
                    <div>
                        <div className="tag fu" style={{ marginBottom: 22 }}>AR / VR Self-Learning Module</div>
                        <h1 className="fu d1" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(40px,5.5vw,76px)", lineHeight: 1, marginBottom: 22 }}>
                            Learn Inside<br /><span className="gt">Virtual Reality</span>
                        </h1>
                        <p className="fu d2 bod" style={{ maxWidth: 420, marginBottom: 38 }}>
                            A self-paced immersive curriculum for the spatial computing era. Master AR/VR development through hands-on XR environments — not screen-based videos.
                        </p>
                        <div className="fu d3" style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                            <button onClick={() => goto("overview")} style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", padding: "15px 36px", background: "linear-gradient(135deg,#00e0ff,#7c4dff)", color: "#060c18", border: "none", cursor: "pointer", fontWeight: 700, clipPath: "polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)", transition: "filter .25s,box-shadow .25s" }}>
                                Explore Course
                            </button>
                            <button onClick={() => goto("videos")} style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", padding: "15px 36px", background: "transparent", color: "rgba(228,238,248,.7)", border: "1px solid rgba(228,238,248,.22)", cursor: "pointer", clipPath: "polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)", transition: "border-color .25s,color .25s" }}>
                                Watch Demo
                            </button>
                        </div>
                        {/* mini stats */}
                        <div className="fu d4" style={{ display: "flex", gap: 28, marginTop: 44, paddingTop: 28, borderTop: "1px solid rgba(0,224,255,.1)" }}>
                            {[["40h", "Content"], ["6", "Modules"], ["3", "XR Platforms"], ["Cert", "Included"]].map(([n, l]) => (
                                <div key={l}>
                                    <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, color: "#00e0ff" }}>{n}</div>
                                    <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: 2, color: "rgba(228,238,248,.38)", textTransform: "uppercase", marginTop: 2 }}>{l}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT COLUMN — replace the entire right div */}
                    <div style={{
                        position: "relative",
                        display: "flex",
                        alignItems: "flex-end",       // anchor to bottom of grid cell
                        justifyContent: "center",
                        minHeight: "100vh",
                        overflow: "visible",          // allow image to bleed out
                    }}>
                        <img
                            src={heroar2}
                            style={{
                                position: "absolute",
                                right: "-160px",
                                bottom: "180px",       // sit it at the bottom edge of the section
                                height: "80vh",       // taller than viewport — fills more space
                                width: "auto",         // let height drive, width follows naturally
                                maxWidth: "none",      // prevent any container from squishing it
                                objectFit: "contain",
                                zIndex: 1,
                            }}
                        />
                    </div>
                </div>

                {/* scroll cue */}
                <div style={{ position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: 3, color: "rgba(228,238,248,.28)", textTransform: "uppercase" }}>Scroll</div>
                    <div style={{ width: 1, height: 48, background: "linear-gradient(to bottom,rgba(0,224,255,.6),transparent)", animation: "scandown 2s ease-in-out infinite" }} />
                </div>
            </section>

            {/* ─── SCROLL HEADSET ANIMATION (FIXED) ─── */}
            <ScrollModelStrip />

            {/* ─── OVERVIEW ─── */}
            <section id="overview" style={{ padding: "110px 48px", maxWidth: 1200, margin: "0 auto" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
                    <div className="rv">
                        <div className="eye">// Overview</div>
                        <h2 className="st">What Is This <span className="gt">Module?</span></h2>
                        <p className="bod" style={{ marginBottom: 26 }}>The AR/VR Self-Learning Module is a fully immersive, self-paced program that teaches you to build, deploy, and design for the spatial web. No prior XR experience needed — just curiosity.</p>
                        <p className="bod" style={{ marginBottom: 34 }}>Using Unity XR, WebXR, ARKit, and OpenXR you'll complete real projects that run on Meta Quest, Apple Vision Pro, and HoloLens 2.</p>
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                            {["Unity XR", "WebXR", "ARKit", "OpenXR", "Meta SDK", "MRTK3"].map(t => <span key={t} className="tag">{t}</span>)}
                        </div>
                    </div>
                    <div className="rv2">
                        {[["Spatial Computing Foundations", 95], ["XR Development (Unity/WebXR)", 88], ["AR Design Principles", 82], ["Multi-Platform Deployment", 78], ["AI Integration in XR", 70]].map(([l, pct]) => (
                            <div key={l} style={{ marginBottom: 18 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                    <span style={{ fontFamily: "'Exo 2',sans-serif", fontSize: 13, color: "rgba(228,238,248,.72)" }}>{l}</span>
                                    <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#00e0ff" }}>{pct}%</span>
                                </div>
                                <div className="pb"><div className="pf" style={{ width: `${pct}%` }} /></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── HIGHLIGHTS ─── */}
            <section id="highlights" style={{ padding: "110px 48px", background: "rgba(0,224,255,.018)", borderTop: "1px solid rgba(0,224,255,.08)", borderBottom: "1px solid rgba(0,224,255,.08)" }}>
                <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                    <div className="rv" style={{ textAlign: "center", marginBottom: 60 }}>
                        <div className="eye">// Highlights</div>
                        <h2 className="st">What You <span className="gt">Get</span></h2>
                    </div>
                    <div className="rv" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 1, background: "rgba(0,224,255,.07)" }}>
                        {[
                            { ic: "🥽", t: "Full Headset Support", d: "Meta Quest 3, Apple Vision Pro, HoloLens 2 — learn once, deploy everywhere." },
                            { ic: "🧠", t: "AI-Adaptive Learning", d: "Your pace, your path. Neural difficulty adjustment keeps you in the flow state." },
                            { ic: "🌐", t: "WebXR Projects", d: "Browser-native XR experiences that run without an app install on any device." },
                            { ic: "🤝", t: "Social XR Labs", d: "Collaborative virtual classrooms with up to 12 peers in shared XR space." },
                            { ic: "📊", t: "Live Analytics", d: "Real-time heatmaps, attention tracking, and skill graphs for each module." },
                            { ic: "🏆", t: "Blockchain Certificate", d: "Tamper-proof, verifiable certificate minted on completion — shareable anywhere." },
                        ].map(({ ic, t, d }) => (
                            <div key={t} className="gc" style={{ background: "rgba(6,12,24,.97)" }}>
                                <div style={{ fontSize: 30, marginBottom: 14 }}>{ic}</div>
                                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 9, color: "#e4eef8" }}>{t}</div>
                                <div style={{ fontSize: 13, lineHeight: 1.72, color: "rgba(228,238,248,.48)" }}>{d}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── CONTENT ─── */}
            <section id="content" style={{ padding: "110px 48px", maxWidth: 1200, margin: "0 auto" }}>
                <div className="rv" style={{ marginBottom: 56 }}>
                    <div className="eye">// Curriculum</div>
                    <h2 className="st">Module <span className="gt">Content</span></h2>
                </div>
                <div className="rv" style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {[
                        { num: "01", title: "Spatial Computing Foundations", hrs: "6h", topics: ["What is XR?", "6DOF vs 3DOF", "Headset hardware", "XR OS & SDK landscape"], status: "Free", open: true },
                        { num: "02", title: "Unity XR Toolkit Bootcamp", hrs: "8h", topics: ["Scene setup for VR", "Input system & controllers", "Interaction toolkit", "Performance profiling"], status: "Core", open: false },
                        { num: "03", title: "AR with ARKit & ARCore", hrs: "7h", topics: ["Plane detection", "Object occlusion", "World-scale AR", "LiDAR scanning"], status: "Core", open: false },
                        { num: "04", title: "WebXR & Browser-Native XR", hrs: "5h", topics: ["Three.js XR", "WebXR Device API", "Progressive XR", "PWA deployment"], status: "Core", open: false },
                        { num: "05", title: "AI & Generative XR", hrs: "7h", topics: ["Stable Diffusion in XR", "LLM voice agents", "Real-time NPC AI", "Computer vision AR"], status: "Advanced", open: false },
                        { num: "06", title: "Multi-Platform Deployment & Portfolio", hrs: "7h", topics: ["Meta Quest publishing", "Apple Vision Pro", "HoloLens enterprise", "Portfolio showcase"], status: "Capstone", open: false },
                    ].map(m => <CurrRow key={m.num} {...m} />)}
                </div>
            </section>

            {/* ─── WHY IT WORKS ─── */}
            <section id="why" style={{ padding: "110px 48px", background: "linear-gradient(180deg,rgba(124,77,255,.04) 0%,transparent 100%)", borderTop: "1px solid rgba(124,77,255,.1)" }}>
                <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                    <div className="rv" style={{ textAlign: "center", marginBottom: 72 }}>
                        <div className="eye">// Methodology</div>
                        <h2 className="st">Why This Module <span className="gt">Works</span></h2>
                        <p className="bod" style={{ maxWidth: 520, margin: "0 auto" }}>Built on cognitive science, spatial pedagogy, and 5 years of XR learning research. This isn't screen content with a headset strapped on — it's learning reimagined for three dimensions.</p>
                    </div>
                    <div className="rv" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 28 }}>
                        {[
                            { ic: "🧬", st: "3.2×", lb: "Better Retention", d: "Spatial memory encoding outperforms traditional e-learning in longitudinal studies. You remember what you experience." },
                            { ic: "⏱", st: "40%", lb: "Faster Completion", d: "Immersive environments eliminate distractions. Flow state is the default, not the exception." },
                            { ic: "🎯", st: "94%", lb: "Job Readiness", d: "Employers report XR-trained candidates arrive with immediately applicable, hands-on skills." },
                        ].map(({ ic, st, lb, d }) => (
                            <div key={lb} className="gc" style={{ textAlign: "center" }}>
                                <div style={{ fontSize: 34, marginBottom: 14 }}>{ic}</div>
                                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 46, color: "#00e0ff", lineHeight: 1, marginBottom: 5 }}>{st}</div>
                                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: 2, color: "rgba(228,238,248,.45)", textTransform: "uppercase", marginBottom: 14 }}>{lb}</div>
                                <div style={{ fontSize: 13, lineHeight: 1.72, color: "rgba(228,238,248,.48)" }}>{d}</div>
                            </div>
                        ))}
                    </div>
                    <div className="rv" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 20, marginTop: 28 }}>
                        {[
                            { t: "Embodied Cognition", d: "Learning happens through the body. Physical presence in virtual space activates deeper neural pathways than reading or watching." },
                            { t: "Spaced Repetition XR", d: "Our AI resurfaces concepts at exactly the right moment in subsequent XR sessions — no flashcard decks needed." },
                            { t: "Error-Embracing Design", d: "Virtual environments make failure safe and instructive. Mistakes cost nothing and teach everything." },
                            { t: "Peer Presence Effect", d: "Social XR labs recreate the powerful effect of learning alongside others — even across continents." },
                        ].map(({ t, d }) => (
                            <div key={t} style={{ display: "flex", gap: 18, padding: "22px 26px", border: "1px solid rgba(0,224,255,.1)", background: "rgba(0,224,255,.02)" }}>
                                <div style={{ width: 3, background: "linear-gradient(to bottom,#00e0ff,#7c4dff)", borderRadius: 2, flexShrink: 0 }} />
                                <div>
                                    <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 7 }}>{t}</div>
                                    <div style={{ fontSize: 13, lineHeight: 1.72, color: "rgba(228,238,248,.48)" }}>{d}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── DEMO VIDEOS ─── */}
            <section id="videos" style={{ padding: "110px 48px", maxWidth: 1200, margin: "0 auto" }}>
                <div className="rv" style={{ marginBottom: 56 }}>
                    <div className="eye">// Demo Videos</div>
                    <h2 className="st">See It In <span className="gt">Action</span></h2>
                </div>
                <div className="rv vc" style={{ marginBottom: 20, borderRadius: 2 }}>
                    <div style={{ width: "100%", aspectRatio: "16/9", background: "linear-gradient(135deg,#050e20,#0a1830,#0d1040)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", minHeight: 340 }}>
                        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 30% 40%,rgba(0,224,255,.07) 0%,transparent 50%),radial-gradient(circle at 70% 60%,rgba(124,77,255,.07) 0%,transparent 50%)" }} />
                        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,224,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,224,255,.025) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
                        {[[10, 20, 80, 60], [60, 70, 150, 100], [80, 15, 210, 38], [18, 62, 270, 125]].map(([s, o, x, y], i) => (
                            <div key={i} style={{ position: "absolute", width: s, height: s, border: `1px solid rgba(0,224,255,${o / 100})`, transform: `rotate(${45 + i * 22}deg)`, left: x, top: y }} />
                        ))}
                        <div className="pb2">▶</div>
                        <div style={{ position: "absolute", bottom: 18, left: 22, fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: 2, color: "rgba(0,224,255,.65)" }}>FEATURED · MODULE 01 INTRO · 8:34</div>
                        <div style={{ position: "absolute", top: 16, right: 18, background: "rgba(0,224,255,.08)", border: "1px solid rgba(0,224,255,.28)", padding: "4px 12px", fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: 2, color: "#00e0ff" }}>FREE PREVIEW</div>
                    </div>
                    <div style={{ padding: "18px 22px" }}>
                        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 17, marginBottom: 5 }}>Welcome to Spatial Computing — Your First XR Scene</div>
                        <div style={{ fontSize: 13, color: "rgba(228,238,248,.48)" }}>Build your first VR environment from scratch in Unity. Scene hierarchy, XR rig setup, and your first real interaction in 8 minutes.</div>
                    </div>
                </div>
                <div className="rv" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
                    {[
                        { t: "6DOF Controllers Deep Dive", dur: "12:20", mod: "02", c: ["#00e0ff", "#0040ff"] },
                        { t: "AR Plane Detection in ARKit", dur: "9:45", mod: "03", c: ["#7c4dff", "#ff4d9b"] },
                        { t: "WebXR in 10 Minutes Flat", dur: "10:02", mod: "04", c: ["#00ff9d", "#00e0ff"] },
                    ].map(({ t, dur, mod, c }) => (
                        <div key={t} className="vc" style={{ borderRadius: 2 }}>
                            <div style={{ width: "100%", aspectRatio: "16/9", background: "rgba(5,10,22,1)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", minHeight: 130 }}>
                                <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 50%,${c[0]}12,transparent 70%)` }} />
                                <div style={{ position: "absolute", top: 11, left: 13, fontFamily: "'DM Mono',monospace", fontSize: 7, letterSpacing: 2, color: c[0], opacity: .65 }}>MOD {mod}</div>
                                <div className="pb2" style={{ width: 42, height: 42, fontSize: 13 }}>▶</div>
                                <div style={{ position: "absolute", bottom: 9, right: 11, fontFamily: "'DM Mono',monospace", fontSize: 8, color: "rgba(228,238,248,.35)" }}>{dur}</div>
                            </div>
                            <div style={{ padding: "12px 15px", fontSize: 12, fontFamily: "'Exo 2',sans-serif", fontWeight: 600 }}>{t}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── CERTIFICATE ─── */}
            <section id="certificate" style={{ padding: "110px 48px", background: "rgba(232,184,75,.018)", borderTop: "1px solid rgba(232,184,75,.1)" }}>
                <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                    <div className="rv" style={{ textAlign: "center", marginBottom: 60 }}>
                        <div className="eye" style={{ color: "rgba(232,184,75,.65)" }}>// On Completion</div>
                        <h2 className="st">Earn Your <span style={{ background: "linear-gradient(90deg,#e8b84b,#ffd97a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Certificate</span></h2>
                        <p className="bod" style={{ maxWidth: 480, margin: "0 auto" }}>Complete all 6 modules and capstone review. Receive a blockchain-verified certificate recognized by 200+ XR employers worldwide.</p>
                    </div>
                    <div className="rv" style={{ display: "flex", justifyContent: "center", padding: "0 24px" }}>
                        <div style={{ maxWidth: 700, width: "100%", border: "1px solid rgba(232,184,75,.22)", boxShadow: "0 0 60px rgba(232,184,75,.08),0 0 120px rgba(0,224,255,.04)" }}>
                            <Certificate />
                        </div>
                    </div>
                    <div className="rv" style={{ display: "flex", justifyContent: "center", gap: 32, marginTop: 44, flexWrap: "wrap" }}>
                        {[["🔗", "Blockchain Verified"], ["📤", "LinkedIn Ready"], ["🌍", "Globally Recognized"], ["♾️", "Never Expires"]].map(([ic, lb]) => (
                            <div key={lb} style={{ display: "flex", alignItems: "center", gap: 9, fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: 2, color: "rgba(228,238,248,.45)" }}>
                                <span style={{ fontSize: 17 }}>{ic}</span> {lb}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── LOGIN ─── */}
            <section id="login" style={{ padding: "110px 48px", borderTop: "1px solid rgba(0,224,255,.1)" }}>
                <div style={{ maxWidth: 920, margin: "0 auto" }}>
                    <div className="rv" style={{ textAlign: "center", marginBottom: 52 }}>
                        <div className="eye">// Student Portal</div>
                        <h2 className="st">Start <span className="gt">Learning</span></h2>
                    </div>
                    <div className="rv" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", border: "1px solid rgba(0,224,255,.13)", background: "rgba(255,255,255,.02)" }}>
                        <div style={{ padding: "48px 40px", borderRight: "1px solid rgba(0,224,255,.1)", background: "linear-gradient(135deg,rgba(0,224,255,.03),rgba(124,77,255,.03))", display: "flex", flexDirection: "column", gap: 0 }}>
                            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 24, lineHeight: 1.2, marginBottom: 14 }}>
                                Access Your<br /><span className="gt">XR Dashboard</span>
                            </div>
                            <p className="bod" style={{ fontSize: 14, marginBottom: 32 }}>Resume modules, track XR session time, collaborate in virtual labs, and download your progress reports.</p>
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {["Personalized XR learning path", "Multi-headset progress sync", "Live collaboration rooms", "AI mentor available 24/7", "Certificate tracking"].map(f => (
                                    <div key={f} style={{ display: "flex", gap: 11, alignItems: "center", fontSize: 13, color: "rgba(228,238,248,.55)" }}>
                                        <span style={{ color: "#00e0ff", fontSize: 11 }}>▸</span>{f}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <LoginForm />
                    </div>
                </div>
            </section>

            {/* ─── FOOTER ─── */}
            <footer style={{ padding: "36px 48px", borderTop: "1px solid rgba(0,224,255,.08)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 17, color: "#00e0ff", letterSpacing: 2 }}>XR<span style={{ color: "#7c4dff" }}>SLM</span></div>
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: 1, color: "rgba(228,238,248,.28)" }}>© 2025 XRSLM Academy · All realities reserved</div>
                <div style={{ display: "flex", gap: 22 }}>
                    {["Privacy", "Terms", "Docs", "Contact"].map(l => <span key={l} style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: 2, color: "rgba(228,238,248,.32)", cursor: "pointer", textTransform: "uppercase" }}>{l}</span>)}
                </div>
            </footer>
        </div>
    );
}