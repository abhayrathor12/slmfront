import { useEffect, useState, useRef } from "react";
import {
    MessageSquare,
    Search,
    ArrowLeft
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import api from "../utils/api";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";

interface Conversation {
    id: number;
    user_email: string;
    created_at: string;
}

interface Message {
    id: number;
    sender: "user" | "admin";
    message: string;
    screenshot: string | null;
    created_at: string;
}

const fmtDateTime = (iso: string) =>
    new Date(iso).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

const AdminChats = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [filtered, setFiltered] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [input, setInput] = useState("");
    const bottomRef = useRef<HTMLDivElement>(null);

    /* ───────────── Load Conversation List ───────────── */

    const fetchConversations = async () => {
        try {
            const res = await api.get("/accounts/admin/conversations/");
            setConversations(res.data);
            setFiltered(res.data);
        } catch {
            toast.error("Failed to fetch conversations");
        } finally {
            setLoading(false);
        }
    };

    /* ───────────── Load Single Chat ───────────── */

    const fetchChat = async (convoId: string) => {
        try {
            const res = await api.get(`/accounts/admin/conversation/${convoId}/`);
            setMessages(res.data.messages);
        } catch {
            toast.error("Failed to load chat");
        } finally {
            setLoading(false);
        }
    };

    /* ───────────── Effects ───────────── */

    useEffect(() => {
        setLoading(true);
        if (id) {
            fetchChat(id);
        } else {
            fetchConversations();
        }
    }, [id]);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setFiltered(conversations);
        } else {
            const q = searchQuery.toLowerCase();
            setFiltered(
                conversations.filter(c =>
                    c.user_email.toLowerCase().includes(q) ||
                    c.id.toString().includes(q)
                )
            );
        }
    }, [searchQuery, conversations]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    /* ───────────── Send Message ───────────── */
    const handleDelete = async (convoId: number) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this conversation?"
        );

        if (!confirmDelete) return;

        try {
            await api.delete(`/accounts/admin/conversation/${convoId}/delete/`);

            toast.success("Conversation deleted");

            // remove from state without refetch
            setConversations(prev =>
                prev.filter(c => c.id !== convoId)
            );
            setFiltered(prev =>
                prev.filter(c => c.id !== convoId)
            );

        } catch {
            toast.error("Failed to delete conversation");
        }
    };
    const sendMessage = async () => {
        if (!input.trim() || !id) return;

        try {
            const formData = new FormData();
            formData.append("message", input);

            const res = await api.post(
                `/accounts/admin/conversation/${id}/send/`,
                formData
            );

            setMessages(res.data.messages);
            setInput("");
        } catch {
            toast.error("Failed to send message");
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="flex min-h-screen">
            <Sidebar />

            <div className="flex-1 lg:ml-64 pt-16 lg:pt-0 p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen overflow-y-auto">

                {/* ───────────────── CHAT VIEW ───────────────── */}
                {id ? (
                    <>
                        {/* Header */}
                        <div className="flex items-center gap-4 mb-6">
                            <button
                                onClick={() => navigate("/admin/chats")}
                                className="p-2 rounded-lg hover:bg-gray-200 transition"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <h1 className="text-2xl font-bold text-gray-800">
                                Conversation #{id}
                            </h1>
                        </div>

                        {/* Chat Box */}
                        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col h-[70vh]">

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                                {messages.length === 0 ? (
                                    <EmptyState message="No messages yet" />
                                ) : (
                                    messages.map(msg => (
                                        <div
                                            key={msg.id}
                                            className={`max-w-[70%] p-3 rounded-xl text-sm ${msg.sender === "admin"
                                                ? "ml-auto bg-blue-600 text-white"
                                                : "bg-gray-200 text-gray-800"
                                                }`}
                                        >
                                            {msg.message}
                                            {msg.screenshot && (
                                                <img
                                                    src={msg.screenshot}
                                                    alt="screenshot"
                                                    className="mt-2 rounded-lg max-h-40"
                                                />
                                            )}
                                            <div className="text-xs opacity-60 mt-1">
                                                {fmtDateTime(msg.created_at)}
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={bottomRef} />
                            </div>

                            {/* Input */}
                            <div className="mt-4 flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                                    placeholder="Type a reply..."
                                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <button
                                    onClick={sendMessage}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    /* ───────────────── LIST VIEW ───────────────── */
                    <>
                        {/* Header */}
                        <div className="flex justify-between items-center mb-8 mt-4">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                                Support Conversations
                            </h1>

                            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
                                <MessageSquare className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-semibold text-gray-600">
                                    {conversations.length} Conversations
                                </span>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="bg-white rounded-xl shadow-sm p-6">

                            <div className="relative mb-5">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search by email or conversation ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            {filtered.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                {["ID", "User Email", "Created At", "Actions"].map(h => (
                                                    <th key={h} className="text-left py-3 px-4 text-gray-700 font-semibold text-sm">
                                                        {h}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filtered.map(convo => (
                                                <tr key={convo.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="py-3 px-4 text-sm text-gray-500">
                                                        #{convo.id}
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-gray-800 font-medium">
                                                        {convo.user_email}
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-gray-500">
                                                        {fmtDateTime(convo.created_at)}
                                                    </td>
                                                    <td className="py-3 px-4 flex gap-4">
                                                        <button
                                                            onClick={() => navigate(`/admin/chats/${convo.id}`)}
                                                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                                        >
                                                            Open Chat
                                                        </button>

                                                        <button
                                                            onClick={() => handleDelete(convo.id)}
                                                            className="text-sm text-red-600 hover:text-red-800 font-medium"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <EmptyState message="No conversations found" />
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminChats;