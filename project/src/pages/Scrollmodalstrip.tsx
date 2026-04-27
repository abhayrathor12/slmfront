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
export default function ScrollModelStrip() {
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