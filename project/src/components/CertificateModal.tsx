import { useEffect, useRef, useState } from 'react';
import { X, Download, Printer, Award, CheckCircle } from 'lucide-react';
import { getUser } from '../utils/auth';
import certlogo from '../public/logo1.png';
import Stamp from '../public/stamp.png';
import Sign from '../public/sign.jpeg';

interface CertificateModalProps {
  open: boolean;
  onClose: () => void;
  certificateUrl?: string | null;
}

// ── Brand config ──────────────────────────────────────────────────────────────
const BRAND = {
  logoSrc: certlogo,
  stampSrc: Stamp,
  signSrc: Sign,
  orgName: 'Technoviz Automation',
  courseName: 'PLC to Cloud IIoT Smart Manufacturing',
  directorName: 'Mr. Kapil Khurana',
  directorTitle: 'Director',
  navy: '#1a2e5a',
  navyDark: '#0f1e3d',
  gold: '#e8a020',
  goldDark: '#c47d0a',
};
// ─────────────────────────────────────────────────────────────────────────────

const W = 1400;
const H = 990;

function todayLong() {
  return new Date().toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function loadImg(src: string): Promise<HTMLImageElement | null> {
  return new Promise((res) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => res(img);
    img.onerror = () => res(null);
    img.src = src;
  });
}

async function drawCertificate(canvas: HTMLCanvasElement, name: string) {
  const ctx = canvas.getContext('2d')!;
  canvas.width = W;
  canvas.height = H;

  // ── 1. White background ──────────────────────────────────────────────────
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  // ── 2. Left navy panel with curved right edge ────────────────────────────
  const panelW = 340;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(panelW - 60, 0);
  ctx.bezierCurveTo(panelW + 60, H * 0.25, panelW - 120, H * 0.75, panelW - 40, H);
  ctx.lineTo(0, H);
  ctx.closePath();

  const panelGrad = ctx.createLinearGradient(0, 0, panelW, H);
  panelGrad.addColorStop(0, '#1a2e5a');
  panelGrad.addColorStop(1, '#0f1e3d');
  ctx.fillStyle = panelGrad;
  ctx.fill();
  ctx.restore();

  // Gold accent stripe along the curve
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(panelW - 60, 0);
  ctx.bezierCurveTo(panelW + 60, H * 0.25, panelW - 120, H * 0.75, panelW - 40, H);
  ctx.lineTo(panelW - 20, H);
  ctx.bezierCurveTo(panelW - 100, H * 0.75, panelW + 80, H * 0.25, panelW - 40, 0);
  ctx.closePath();
  const goldGrad = ctx.createLinearGradient(0, 0, 0, H);
  goldGrad.addColorStop(0, '#e8a020');
  goldGrad.addColorStop(0.5, '#f5c842');
  goldGrad.addColorStop(1, '#c47d0a');
  ctx.fillStyle = goldGrad;
  ctx.fill();
  ctx.restore();

  // Subtle wave swoosh decoration in the white area (light grey)
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(W * 0.55, 0);
  ctx.bezierCurveTo(W * 0.65, H * 0.3, W * 0.45, H * 0.7, W * 0.7, H);
  ctx.lineTo(W, H);
  ctx.lineTo(W, 0);
  ctx.closePath();
  ctx.fillStyle = 'rgba(220, 230, 245, 0.18)';
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(W * 0.70, 0);
  ctx.bezierCurveTo(W * 0.80, H * 0.35, W * 0.60, H * 0.65, W * 0.82, H);
  ctx.lineTo(W, H);
  ctx.lineTo(W, 0);
  ctx.closePath();
  ctx.fillStyle = 'rgba(200, 215, 240, 0.12)';
  ctx.fill();
  ctx.restore();

  // ── 3. Thin outer border on the full canvas ──────────────────────────────
  ctx.strokeStyle = BRAND.gold;
  ctx.lineWidth = 6;
  ctx.strokeRect(12, 12, W - 24, H - 24);
  ctx.strokeStyle = 'rgba(232,160,32,0.35)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(22, 22, W - 44, H - 44);

  // ── 4. Load images ───────────────────────────────────────────────────────
  const [logo, stamp, sign] = await Promise.all([
    loadImg(BRAND.logoSrc),
    loadImg(BRAND.stampSrc),
    loadImg(BRAND.signSrc),
  ]);

  // ── 5. Medal / Ribbon ────────────────────────────────────────────────────
  const medalX = panelW - 20;
  const medalY = 148;
  const medalR = 88;

  // Left ribbon
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(medalX - 36, medalY + medalR - 20);
  ctx.lineTo(medalX - 60, medalY + medalR + 110);
  ctx.lineTo(medalX - 18, medalY + medalR + 80);
  ctx.lineTo(medalX + 6, medalY + medalR + 120);
  ctx.closePath();
  const ribGL = ctx.createLinearGradient(medalX - 60, medalY + medalR, medalX, medalY + medalR + 120);
  ribGL.addColorStop(0, '#f5c842');
  ribGL.addColorStop(1, '#c47d0a');
  ctx.fillStyle = ribGL;
  ctx.fill();
  ctx.restore();

  // Right ribbon
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(medalX + 36, medalY + medalR - 20);
  ctx.lineTo(medalX + 60, medalY + medalR + 110);
  ctx.lineTo(medalX + 18, medalY + medalR + 80);
  ctx.lineTo(medalX - 6, medalY + medalR + 120);
  ctx.closePath();
  const ribGR = ctx.createLinearGradient(medalX, medalY + medalR, medalX + 60, medalY + medalR + 120);
  ribGR.addColorStop(0, '#e8a020');
  ribGR.addColorStop(1, '#a86800');
  ctx.fillStyle = ribGR;
  ctx.fill();
  ctx.restore();

  // Outer gold ring
  const ringGrad = ctx.createRadialGradient(medalX - 20, medalY - 20, 10, medalX, medalY, medalR);
  ringGrad.addColorStop(0, '#fff7d0');
  ringGrad.addColorStop(0.35, '#f5c842');
  ringGrad.addColorStop(0.65, BRAND.gold);
  ringGrad.addColorStop(0.85, '#c47d0a');
  ringGrad.addColorStop(1, '#8a5200');
  ctx.beginPath();
  ctx.arc(medalX, medalY, medalR, 0, Math.PI * 2);
  ctx.fillStyle = ringGrad;
  ctx.fill();

  // Serrated / rosette edge
  const teeth = 32;
  ctx.save();
  ctx.translate(medalX, medalY);
  ctx.beginPath();
  for (let i = 0; i <= teeth * 2; i++) {
    const angle = (i / (teeth * 2)) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 === 0 ? medalR : medalR - 14;
    const x = r * Math.cos(angle), y = r * Math.sin(angle);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = BRAND.gold;
  ctx.fill();
  ctx.restore();

  // Inner circle
  const innerR = medalR - 22;
  const innerGrad = ctx.createRadialGradient(medalX - 12, medalY - 12, 4, medalX, medalY, innerR);
  innerGrad.addColorStop(0, '#fffbe8');
  innerGrad.addColorStop(0.5, '#f5d060');
  innerGrad.addColorStop(1, '#c47d0a');
  ctx.beginPath();
  ctx.arc(medalX, medalY, innerR, 0, Math.PI * 2);
  ctx.fillStyle = innerGrad;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Star inside medal
  ctx.save();
  ctx.translate(medalX, medalY);
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    const r = i % 2 === 0 ? innerR - 10 : (innerR - 10) * 0.42;
    i === 0 ? ctx.moveTo(r * Math.cos(a), r * Math.sin(a))
      : ctx.lineTo(r * Math.cos(a), r * Math.sin(a));
  }
  ctx.closePath();
  const starG = ctx.createLinearGradient(0, -(innerR - 10), 0, innerR - 10);
  starG.addColorStop(0, '#ffffff');
  starG.addColorStop(1, '#ffe070');
  ctx.fillStyle = starG;
  ctx.fill();
  ctx.restore();

  // ── 6. Main text content ─────────────────────────────────────────────────
  const contentX = panelW + 60;
  const contentW = W - contentX - 60;
  const cx = contentX + contentW / 2;

  ctx.textAlign = 'center';

  ctx.font = `300 130px 'Palatino Linotype', Palatino, Georgia, serif`;
  ctx.fillStyle = BRAND.navy;
  ctx.fillText('Certificate', cx, 210);

  ctx.font = `400 32px Georgia, serif`;
  ctx.fillStyle = BRAND.gold;
  const subText = 'of Completion';
  const subSpacing = 7;
  let subX = cx - (subText.split('').reduce((a, c) => a + ctx.measureText(c).width + subSpacing, 0) - subSpacing) / 2;
  subText.split('').forEach(ch => {
    ctx.fillText(ch, subX + ctx.measureText(ch).width / 2, 262);
    subX += ctx.measureText(ch).width + subSpacing;
  });

  // Decorative divider
  const divY = 306;
  const drawDivider = (y: number, halfW: number) => {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx - halfW, y);
    ctx.lineTo(cx - 28, y);
    ctx.strokeStyle = BRAND.gold;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 28, y);
    ctx.lineTo(cx + halfW, y);
    ctx.stroke();
    ctx.save();
    ctx.translate(cx, y);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = BRAND.gold;
    ctx.fillRect(-7, -7, 14, 14);
    ctx.restore();
    ctx.restore();
  };
  drawDivider(divY, 280);

  ctx.font = `italic 400 26px 'Palatino Linotype', Palatino, Georgia, serif`;
  ctx.fillStyle = '#555';
  ctx.fillText('This certificate is presented to', cx, divY + 68);

  let fs = 90;
  ctx.font = `700 ${fs}px 'Palatino Linotype', Palatino, Georgia, serif`;
  while (ctx.measureText(name).width > contentW - 80 && fs > 42) {
    fs -= 2;
    ctx.font = `700 ${fs}px 'Palatino Linotype', Palatino, Georgia, serif`;
  }
  const nameY = divY + 180;
  ctx.fillStyle = BRAND.goldDark;
  ctx.fillText(name, cx + 2, nameY + 2);
  ctx.fillStyle = BRAND.gold;
  ctx.fillText(name, cx, nameY);

  const nw = Math.min(ctx.measureText(name).width + 60, contentW - 60);
  ctx.beginPath();
  ctx.moveTo(cx - nw / 2, nameY + 18);
  ctx.lineTo(cx + nw / 2, nameY + 18);
  ctx.strokeStyle = BRAND.gold;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = `400 24px Georgia, serif`;
  ctx.fillStyle = '#444';

  const bodyY = nameY + 70;
  const bodyLine1 = `in completion of his/her successful completion of the`;
  const bodyLine2 = `${BRAND.courseName} program on ${todayLong()}.`;

  ctx.fillText(bodyLine1, cx, bodyY);
  ctx.font = `600 24px Georgia, serif`;
  ctx.fillStyle = BRAND.navy;
  const maxBodyW = contentW - 80;
  let body2Y = bodyY + 38;
  if (ctx.measureText(bodyLine2).width > maxBodyW) {
    const words = bodyLine2.split(' ');
    let line = '';
    for (const word of words) {
      const test = line ? line + ' ' + word : word;
      if (ctx.measureText(test).width > maxBodyW && line) {
        ctx.fillText(line, cx, body2Y);
        line = word;
        body2Y += 34;
      } else {
        line = test;
      }
    }
    if (line) ctx.fillText(line, cx, body2Y);
  } else {
    ctx.fillText(bodyLine2, cx, body2Y);
  }

  // ── 7. Signature section ─────────────────────────────────────────────────
  const sigY = H - 220;
  const sigCx = cx + 60;

  ctx.textAlign = 'center';
  ctx.font = `italic 400 20px Georgia, serif`;
  ctx.fillStyle = '#666';
  ctx.fillText('Signed by,', sigCx, sigY);

  if (sign) {
    const sh = 70, sw = (sign.width / sign.height) * sh;
    ctx.drawImage(sign, sigCx - sw / 2, sigY + 10, sw, sh);
  } else {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(sigCx - 90, sigY + 68);
    ctx.bezierCurveTo(sigCx - 40, sigY + 20, sigCx + 20, sigY + 80, sigCx + 50, sigY + 40);
    ctx.bezierCurveTo(sigCx + 78, sigY + 10, sigCx + 100, sigY + 50, sigCx + 110, sigY + 45);
    ctx.strokeStyle = BRAND.navy;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  const sigLineY = sigY + 95;
  ctx.beginPath();
  ctx.moveTo(sigCx - 160, sigLineY);
  ctx.lineTo(sigCx + 160, sigLineY);
  ctx.strokeStyle = '#999';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.font = `700 22px Georgia, serif`;
  ctx.fillStyle = BRAND.navy;
  ctx.fillText(BRAND.directorName, sigCx, sigLineY + 32);

  ctx.font = `400 17px Georgia, serif`;
  ctx.fillStyle = '#777';
  ctx.fillText(BRAND.directorTitle, sigCx, sigLineY + 56);

  // ── 8. Stamp ─────────────────────────────────────────────────────────────
  if (stamp) {
    const stH = 130, stW = (stamp.width / stamp.height) * stH;
    const stX = contentX + 160;
    ctx.globalAlpha = 0.80;
    ctx.drawImage(stamp, stX - stW / 2, sigLineY - 65, stW, stH);
    ctx.globalAlpha = 1;
  }

  // ── 9. Logo ──────────────────────────────────────────────────────────────
  if (logo) {
    const lh = 80, lw = (logo.width / logo.height) * lh;
    ctx.globalAlpha = 0.92;
    ctx.drawImage(logo, W - lw - 50, 50, lw, lh);
    ctx.globalAlpha = 1;
  }

  // Org name in panel (vertical)

}

// ─────────────────────────────────────────────────────────────────────────────

const CertificateModal = ({ open, onClose }: CertificateModalProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rendered, setRendered] = useState(false);
  const user = getUser();

  const recipientName =
    user?.full_name ||
    user?.name ||
    [user?.first_name, user?.last_name].filter(Boolean).join(' ') ||
    user?.username ||
    user?.email ||
    'Student';

  useEffect(() => {
    if (!open) { setRendered(false); return; }
    const canvas = canvasRef.current;
    if (!canvas) return;
    setRendered(false);
    drawCertificate(canvas, recipientName).then(() => setRendered(true));
  }, [open, recipientName]);

  if (!open) return null;

  const handleDownloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'certificate.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handlePrintOrPDF = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Certificate — ${recipientName}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{background:#0f1a2e;display:flex;flex-direction:column;align-items:center;
         justify-content:center;min-height:100vh;padding:24px;gap:18px;font-family:Georgia,serif;}
    .bar{display:flex;gap:10px;}
    button{padding:10px 22px;border-radius:10px;font-size:14px;font-weight:600;
           cursor:pointer;border:none;}
    .pdf{background:linear-gradient(135deg,#1a2e5a,#2d5aa0);color:#fff;}
    .cls{background:rgba(255,255,255,0.08);color:#fff;border:1px solid rgba(255,255,255,0.18);}
    img{max-width:100%;height:auto;border-radius:12px;box-shadow:0 10px 60px rgba(0,0,0,0.5);}
    @media print{body{background:none;padding:0;}.bar{display:none;}
    img{box-shadow:none;border-radius:0;width:100%;}}
  </style>
</head>
<body>
  <div class="bar">
    <button class="pdf" onclick="window.print()">🖨 Save as PDF / Print</button>
    <button class="cls" onclick="window.close()">✕ Close</button>
  </div>
  <img src="${dataUrl}" alt="Certificate"/>
</body>
</html>`);
    win.document.close();
  };

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          background: 'rgba(8,16,42,0.93)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          flexDirection: 'column',
          padding: '12px 16px',
          gap: 10,
          // ── KEY FIX: prevent the modal itself from overflowing ──
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        {/* ── TOP ACTION BAR ── */}
        <div
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 8,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: 14,
            padding: '8px 14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              background: 'linear-gradient(135deg,#e8a020,#f5c842)',
              borderRadius: 8, padding: '6px 7px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Award style={{ width: 16, height: 16, color: '#fff' }} />
            </div>
            <div>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: 14, margin: 0, lineHeight: 1 }}>
                Certificate of Completion
              </p>
              <p style={{ color: 'rgba(255,255,255,0.40)', fontSize: 11, margin: '3px 0 0' }}>
                Issued to {recipientName}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={handleDownloadPNG}
              disabled={!rendered}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 10,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.16)',
                color: '#fff', fontSize: 13, fontWeight: 600,
                cursor: rendered ? 'pointer' : 'not-allowed',
                opacity: rendered ? 1 : 0.38,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => rendered && ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.14)')}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)')}
            >
              <Download style={{ width: 14, height: 14 }} />
              Download PNG
            </button>

            <button
              onClick={handlePrintOrPDF}
              disabled={!rendered}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 10,
                background: rendered
                  ? 'linear-gradient(135deg,#1a2e5a 0%,#2d5aa0 100%)'
                  : 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.10)',
                color: '#fff', fontSize: 13, fontWeight: 600,
                cursor: rendered ? 'pointer' : 'not-allowed',
                opacity: rendered ? 1 : 0.38,
                boxShadow: rendered ? '0 2px 12px rgba(26,46,90,0.45)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              <Printer style={{ width: 14, height: 14 }} />
              PDF / Print
            </button>

            <button
              onClick={onClose}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                cursor: 'pointer', color: 'rgba(255,255,255,0.65)',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,80,80,0.18)')}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)')}
            >
              <X style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </div>

        {/* ── CERTIFICATE CANVAS ── */}
        {/*
          KEY FIX:
          - The wrapper uses flex: 1 with minHeight: 0 so it fills remaining space
          - overflow: hidden prevents it from expanding the parent
          - Inner div uses height: 100% so the canvas wrapper fills it
          - canvas uses width: 100% + height: 100% with object-fit-like behaviour
            achieved via maxHeight: 100% — this scales the canvas down to fit
            without cropping and without scrolling
        */}
        <div
          style={{
            flex: 1,
            minHeight: 0,           // ← critical: lets flexbox shrink this below content size
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',     // ← no scroll
          }}
        >
          <div
            style={{
              position: 'relative',
              // Scale canvas to fit within available space while preserving aspect ratio
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {!rendered && (
              <div style={{
                position: 'absolute',
                inset: 0,
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255,255,255,0.95)',
                borderRadius: 16,
                gap: 14,
              }}>
                <div style={{
                  width: 38, height: 38,
                  border: `3px solid rgba(26,46,90,0.15)`,
                  borderTopColor: '#1a2e5a',
                  borderRadius: '50%',
                  animation: 'certSpin 0.75s linear infinite',
                }} />
                <p style={{ color: '#1a2e5a', fontSize: 13, fontWeight: 600, margin: 0 }}>
                  Generating certificate…
                </p>
              </div>
            )}
            <canvas
              ref={canvasRef}
              style={{
                // ── THE CORE FIX ──
                // Canvas renders at 1400×990 internally, but CSS scales it down
                // to fit the available container without scroll
                maxWidth: '100%',
                maxHeight: '100%',
                width: 'auto',
                height: 'auto',
                display: 'block',
                borderRadius: 16,
                boxShadow: '0 24px 80px rgba(0,0,0,0.65)',
              }}
            />
          </div>
        </div>

        {/* ── BOTTOM HINT ── */}
        {rendered && (
          <div style={{
            flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 20, flexWrap: 'wrap', paddingBottom: 2,
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,0.30)', fontSize: 11 }}>
              <CheckCircle style={{ width: 12, height: 12, color: '#22c55e' }} />
              Certificate generated successfully
            </span>
            <span style={{ color: 'rgba(255,255,255,0.18)', fontSize: 11 }}>
              Click "PDF / Print" → select "Save as PDF" in the print dialog
            </span>
          </div>
        )}
      </div>

      <style>{`@keyframes certSpin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
};

export default CertificateModal;