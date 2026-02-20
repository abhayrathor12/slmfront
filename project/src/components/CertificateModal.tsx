import { X, Download } from 'lucide-react';

interface CertificateModalProps {
  open: boolean;
  onClose: () => void;
  certificateUrl: string | null;
}

const CertificateModal = ({ open, onClose, certificateUrl }: CertificateModalProps) => {
  if (!open) return null;

  const handleDownload = async () => {
    if (!certificateUrl) return;
    try {
      const response = await fetch(certificateUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'certificate.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch {
      // Fallback if CORS blocks the fetch
      window.open(certificateUrl, '_blank');
    }
  };
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10, 20, 50, 0.80)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-3xl flex flex-col gap-4"
        style={{ animation: 'fadeIn 0.22s ease-out both' }}
      >
        {/* Action bar */}
        <div className="flex items-center justify-between px-1">
          <span className="text-white/70 text-sm font-medium tracking-wide">
            Certificate of Completion
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={!certificateUrl}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all hover:brightness-110 active:scale-95 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #203f78 0%, #2d5aa0 100%)' }}
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white/80 text-sm font-semibold border border-white/20 hover:bg-white/10 transition-all active:scale-95"
            >
              <X className="w-4 h-4" />
              Close
            </button>
          </div>
        </div>

        {/* Certificate image */}
        <div className="w-full rounded-2xl overflow-hidden shadow-2xl bg-white">
          {certificateUrl ? (
            <img
              src={certificateUrl}
              alt="Certificate of Completion"
              className="w-full h-auto object-contain"
            />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
              Certificate not available yet.
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.96) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default CertificateModal;
