import { Lock } from "lucide-react";

interface Props {
    open: boolean;
    onClose: () => void;
}

const CertificateLockedModal = ({ open, onClose }: Props) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-[90%] max-w-md p-6 text-center">

                <div className="flex justify-center mb-4">
                    <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                        <Lock className="w-7 h-7 text-red-500" />
                    </div>
                </div>

                <h2 className="text-lg font-bold text-gray-800 mb-2">
                    Certificate Locked
                </h2>

                <p className="text-gray-500 text-sm mb-5">
                    Please complete all modules to unlock your certificate.
                </p>

                <button
                    onClick={onClose}
                    className="px-5 py-2 rounded-lg text-white font-semibold"
                    style={{ background: "linear-gradient(135deg,#203f78,#2d5aa0)" }}
                >
                    Got it
                </button>
            </div>
        </div>
    );
};

export default CertificateLockedModal;