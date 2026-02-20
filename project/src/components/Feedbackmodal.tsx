import { useState, useRef, useEffect } from "react";
import api from "../utils/api";
import { X, Star, Send, MessageSquare } from "lucide-react";

interface Props {
    open: boolean;
    onClose: () => void;
    /** Pass a ref to the Feedback button so we can anchor the popover */
    anchorRef?: React.RefObject<HTMLElement>;
}

const FeedbackModal = ({ open, onClose, anchorRef }: Props) => {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [feedbackText, setFeedbackText] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        const handle = (e: MouseEvent) => {
            if (
                popoverRef.current &&
                !popoverRef.current.contains(e.target as Node) &&
                anchorRef?.current &&
                !anchorRef.current.contains(e.target as Node)
            ) {
                handleClose();
            }
        };
        document.addEventListener("mousedown", handle);
        return () => document.removeEventListener("mousedown", handle);
    }, [open]);

    if (!open) return null;

    const handleSubmit = async () => {
        if (!feedbackText.trim() || rating === 0) return;
        setSubmitting(true);
        try {
            await api.post("/accounts/submit-feedback/", {
                rating,
                message: feedbackText,
            });
            setSubmitted(true);
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        onClose();
        setTimeout(() => {
            setSubmitted(false);
            setFeedbackText("");
            setRating(0);
            setHoveredRating(0);
        }, 300);
    };

    const ratingLabels = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

    return (
        <>
            {/*
              Popover container — positioned fixed, anchored to top-right.
              The arrow triangle points upward toward the Feedback button.
              Adjust `top` / `right` to align with your button's position.
            */}
            <div
                ref={popoverRef}
                style={{
                    position: "fixed",
                    top: "126px",         // below the Feedback button (~78px top + 40px height + 8px gap)
                    right: "16px",        // flush with the right edge
                    zIndex: 9999,
                    width: "380px",
                    filter: "drop-shadow(0 8px 32px rgba(15,33,71,0.22))",
                    // Animate in
                    animation: "feedbackSlideIn 0.22s cubic-bezier(.23,1,.32,1) both",
                }}
            >
                <style>{`
                    @keyframes feedbackSlideIn {
                        from { opacity: 0; transform: translateY(-10px) scale(0.97); }
                        to   { opacity: 1; transform: translateY(0)   scale(1);    }
                    }
                `}</style>

                {/* Arrow pointing UP toward the button */}
                <div
                    style={{
                        position: "absolute",
                        top: "-11px",
                        right: "48px",      // roughly center over the Feedback button
                        width: 0,
                        height: 0,
                        borderLeft: "12px solid transparent",
                        borderRight: "12px solid transparent",
                        borderBottom: "12px solid #0f2147",
                    }}
                />

                {/* Card */}
                <div
                    style={{
                        borderRadius: "16px",
                        overflow: "hidden",
                        background: "#fff",
                        border: "1.5px solid #e8edf5",
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            padding: "14px 18px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            background: "linear-gradient(135deg, #0f2147 0%, #203f78 60%, #2d5aa0 100%)",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div
                                style={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: 10,
                                    background: "rgba(255,255,255,0.15)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <MessageSquare size={16} color="#fff" />
                            </div>
                            <div>
                                <div style={{ color: "#fff", fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>
                                    Share Your Feedback
                                </div>
                                <div style={{ color: "#93b8e8", fontSize: 11, marginTop: 2 }}>
                                    Your thoughts help us improve
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            style={{
                                width: 28,
                                height: 28,
                                borderRadius: "50%",
                                background: "rgba(255,255,255,0.12)",
                                border: "none",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#fff",
                                transition: "background 0.15s",
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.24)")}
                            onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
                        >
                            <X size={14} />
                        </button>
                    </div>

                    {/* Body */}
                    {submitted ? (
                        <div
                            style={{
                                padding: "36px 24px",
                                textAlign: "center",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: "#1a2e55", marginBottom: 6 }}>
                                Thank you!
                            </div>
                            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 20, maxWidth: 240 }}>
                                We've received your feedback and truly appreciate you taking the time.
                            </div>
                            <button
                                onClick={handleClose}
                                style={{
                                    padding: "8px 24px",
                                    borderRadius: 10,
                                    border: "none",
                                    background: "linear-gradient(135deg, #203f78 0%, #2d5aa0 100%)",
                                    color: "#fff",
                                    fontWeight: 600,
                                    fontSize: 13,
                                    cursor: "pointer",
                                }}
                            >
                                Close
                            </button>
                        </div>
                    ) : (
                        <div style={{ padding: "14px 16px 12px", display: "flex", flexDirection: "column", gap: 12 }}>
                            {/* Star rating */}
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 10 }}>
                                    How would you rate your experience?
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onMouseEnter={() => setHoveredRating(star)}
                                            onMouseLeave={() => setHoveredRating(0)}
                                            onClick={() => setRating(star)}
                                            style={{
                                                background: "none",
                                                border: "none",
                                                cursor: "pointer",
                                                padding: 2,
                                                transition: "transform 0.12s",
                                                transform: star <= (hoveredRating || rating) ? "scale(1.18)" : "scale(1)",
                                            }}
                                        >
                                            <Star
                                                size={30}
                                                fill={star <= (hoveredRating || rating) ? "#f59e0b" : "none"}
                                                stroke={star <= (hoveredRating || rating) ? "#f59e0b" : "#d1d5db"}
                                                strokeWidth={1.5}
                                            />
                                        </button>
                                    ))}
                                    {(hoveredRating || rating) > 0 && (
                                        <span style={{ fontSize: 12, fontWeight: 600, color: "#d97706", marginLeft: 6 }}>
                                            {ratingLabels[hoveredRating || rating]}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Textarea */}
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 8 }}>
                                    Tell us more about your experience
                                </div>
                                <div
                                    style={{
                                        borderRadius: 12,
                                        border: `2px solid ${feedbackText ? "#203f78" : "#e5e7eb"}`,
                                        background: "#fafbff",
                                        overflow: "hidden",
                                        transition: "border-color 0.15s",
                                    }}
                                >
                                    {/* Mac-style dots bar */}
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 5,
                                            padding: "8px 12px",
                                            borderBottom: `1px solid ${feedbackText ? "#dbeafe" : "#f3f4f6"}`,
                                            background: feedbackText ? "#eff6ff" : "#f9fafb",
                                        }}
                                    >
                                        <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#fca5a5" }} />
                                        <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#fde68a" }} />
                                        <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#86efac" }} />
                                        <span style={{ marginLeft: 6, fontSize: 10, color: "#9ca3af", fontWeight: 500 }}>
                                            Your message
                                        </span>
                                    </div>
                                    <textarea
                                        value={feedbackText}
                                        onChange={(e) => setFeedbackText(e.target.value)}
                                        placeholder="What did you like? What could be improved?..."
                                        rows={3}
                                        style={{
                                            width: "100%",
                                            padding: "12px 14px",
                                            fontSize: 13,
                                            color: "#374151",
                                            background: "transparent",
                                            border: "none",
                                            outline: "none",
                                            resize: "none",
                                            lineHeight: 1.6,
                                            boxSizing: "border-box",
                                        }}
                                    />
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            padding: "6px 12px",
                                            borderTop: "1px solid #f3f4f6",
                                        }}
                                    >
                                        <span style={{ fontSize: 11, color: "#9ca3af" }}>
                                            {feedbackText.length > 0 ? `${feedbackText.length} characters` : "Start typing..."}
                                        </span>
                                        {feedbackText.length > 0 && (
                                            <button
                                                onClick={() => setFeedbackText("")}
                                                style={{
                                                    fontSize: 11,
                                                    color: "#9ca3af",
                                                    background: "none",
                                                    border: "none",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                Clear
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                onClick={handleSubmit}
                                disabled={!feedbackText.trim() || rating === 0 || submitting}
                                style={{
                                    width: "100%",
                                    padding: "9px",
                                    borderRadius: 10,
                                    border: "none",
                                    background: "linear-gradient(135deg, #0f2147 0%, #203f78 60%, #2d5aa0 100%)",
                                    color: "#fff",
                                    fontWeight: 700,
                                    fontSize: 13,
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 8,
                                    opacity: (!feedbackText.trim() || rating === 0 || submitting) ? 0.45 : 1,
                                    transition: "opacity 0.15s",
                                }}
                            >
                                {submitting ? (
                                    <>
                                        <svg
                                            style={{ animation: "spin 1s linear infinite", width: 14, height: 14 }}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Send size={14} />
                                        Submit Feedback
                                    </>
                                )}
                            </button>

                            {(rating === 0 || !feedbackText.trim()) && (
                                <p style={{ textAlign: "center", fontSize: 11, color: "#9ca3af", margin: 0 }}>
                                    {rating === 0 && !feedbackText.trim()
                                        ? "Please select a rating and write your feedback"
                                        : rating === 0
                                            ? "Please select a star rating"
                                            : "Please write your feedback"}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default FeedbackModal;