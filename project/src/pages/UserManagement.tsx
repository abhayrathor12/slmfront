import { useEffect, useState } from 'react';
import {
    Search, Users, Shield, GraduationCap, Briefcase,
    ChevronDown, X, Mail, Phone, MapPin, Building2,
    BookOpen, Calendar, Clock, CheckCircle, XCircle, Star,
    Trash2, ToggleLeft, ToggleRight
} from 'lucide-react';

import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import api from '../utils/api';
import { toast } from 'react-toastify';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StudentProfile {
    id: number;
    user: number;
    current_year: string;
    stream: string;
    interest: string;
    city: string | null;
}

interface ProfessionalProfile {
    id: number;
    user: number;
    company: string;
    city: string;
    company_email: string | null;
}

interface User {
    id: number;
    email: string;
    role: 'student' | 'professional' | 'admin';
    first_name: string;
    last_name: string;
    phone: string | null;
    dob: string | null;
    is_active: boolean;
    is_staff: boolean;
    is_superuser: boolean;
    last_login: string | null;
    date_joined: string;
    student_profile: StudentProfile | null;
    professional_profile: ProfessionalProfile | null;
}

type RoleFilter = 'all' | 'student' | 'professional' | 'admin';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const roleMeta: Record<string, { label: string; badgeCls: string; icon: React.ReactNode }> = {
    student: { label: 'Student', badgeCls: 'bg-emerald-50 border border-emerald-200 text-emerald-700', icon: <GraduationCap className="w-3.5 h-3.5" /> },
    professional: { label: 'Professional', badgeCls: 'bg-blue-50 border border-blue-200 text-blue-700', icon: <Briefcase className="w-3.5 h-3.5" /> },
    admin: { label: 'Admin', badgeCls: 'bg-purple-50 border border-purple-200 text-purple-700', icon: <Shield className="w-3.5 h-3.5" /> },
};

const avatarBg: Record<string, string> = {
    student: 'bg-emerald-100 text-emerald-700',
    professional: 'bg-blue-100 text-blue-700',
    admin: 'bg-purple-100 text-purple-700',
};

const ConfirmModal = ({
    open,
    title,
    description,
    confirmText,
    confirmColor = "blue",
    onConfirm,
    onCancel,
}: {
    open: boolean;
    title: string;
    description: string;
    confirmText: string;
    confirmColor?: "blue" | "red";
    onConfirm: () => void;
    onCancel: () => void;
}) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Modal */}
            <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 animate-scale-in">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {title}
                </h3>

                <p className="text-sm text-gray-500 mb-6">
                    {description}
                </p>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold text-white transition
                            ${confirmColor === "red"
                                ? "bg-red-600 hover:bg-red-700"
                                : "bg-blue-600 hover:bg-blue-700"
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes scale-in {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-scale-in {
                    animation: scale-in 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
};


const fmt = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const fmtDateTime = (iso: string | null) =>
    iso
        ? new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : 'Never';

const getInitials = (first: string, last: string, email: string) => {
    if (first || last) return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase();
    return email?.[0]?.toUpperCase() ?? '?';
};


// ─── Small reusables ──────────────────────────────────────────────────────────

const RoleBadge = ({ role }: { role: string }) => {
    const m = roleMeta[role] ?? { label: role, badgeCls: 'bg-gray-100 text-gray-700', icon: null };
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${m.badgeCls}`}>
            {m.icon}{m.label}
        </span>
    );
};

const Avatar = ({
    user,
    size = 'sm',
}: {
    user: Pick<User, 'first_name' | 'last_name' | 'email' | 'role'>;
    size?: 'sm' | 'lg';
}) => (
    <div
        className={`flex items-center justify-center font-bold shrink-0
      ${size === 'lg' ? 'w-14 h-14 text-xl rounded-2xl' : 'w-9 h-9 text-sm rounded-full'}
      ${avatarBg[user.role] ?? 'bg-gray-100 text-gray-600'}`}
    >
        {getInitials(user.first_name, user.last_name, user.email)}
    </div>
);

const StatusDot = ({ active }: { active: boolean }) => (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${active ? 'text-emerald-600' : 'text-red-500'}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-red-400'}`} />
        {active ? 'Active' : 'Inactive'}
    </span>
);

// ─── Drawer sub-components ────────────────────────────────────────────────────

const SectionBlock = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{title}</p>
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">{children}</div>
    </div>
);

const Row = ({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
}) => (
    <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0 text-gray-400">{icon}</span>
        <div className="min-w-0">
            <p className="text-[11px] text-gray-400 leading-none mb-0.5">{label}</p>
            <p className="text-sm text-gray-800 font-medium break-all">{value ?? '—'}</p>
        </div>
    </div>
);

const Flag = ({ label, value }: { label: string; value: boolean }) => (
    <div className="flex items-center justify-between py-1">
        <span className="text-sm text-gray-600">{label}</span>
        {value
            ? <CheckCircle className="w-4 h-4 text-emerald-500" />
            : <XCircle className="w-4 h-4 text-gray-300" />}
    </div>
);

// ─── Detail Drawer ────────────────────────────────────────────────────────────

const UserDrawer = ({ userId, onClose }: { userId: number; onClose: () => void }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/accounts/users/${userId}/`)
            .then(r => setUser(r.data))
            .catch(() => { toast.error('Failed to load user details'); onClose(); })
            .finally(() => setLoading(false));
    }, [userId]);

    const fullName = user
        ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || user.email
        : '';

    return (
        <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

            {/* Panel */}
            <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col animate-slide-in">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800">User Details</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : user ? (
                    <div className="flex-1 overflow-y-auto p-6 space-y-5">

                        {/* Identity card */}
                        <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4">
                            <Avatar user={user} size="lg" />
                            <div className="min-w-0">
                                <p className="text-base font-bold text-gray-900 leading-tight">{fullName}</p>
                                <p className="text-xs text-gray-500 mt-0.5 truncate">#{user.id} · {user.email}</p>
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                    <RoleBadge role={user.role} />
                                    <StatusDot active={user.is_active} />
                                </div>
                            </div>
                        </div>

                        {/* Contact */}
                        <SectionBlock title="Contact">
                            <Row icon={<Mail className="w-4 h-4" />} label="Email" value={user.email} />
                            <Row icon={<Phone className="w-4 h-4" />} label="Phone" value={user.phone} />
                            <Row icon={<Calendar className="w-4 h-4" />} label="Date of Birth" value={fmt(user.dob)} />
                        </SectionBlock>

                        {/* Account */}
                        <SectionBlock title="Account">
                            <Row icon={<Clock className="w-4 h-4" />} label="Date Joined" value={fmtDateTime(user.date_joined)} />

                        </SectionBlock>

                        {/* Student Profile */}
                        {user.role === 'student' && user.student_profile && (
                            <SectionBlock title="Student Profile">
                                <Row icon={<BookOpen className="w-4 h-4" />} label="Current Year" value={user.student_profile.current_year} />
                                <Row icon={<GraduationCap className="w-4 h-4" />} label="Stream" value={user.student_profile.stream} />
                                <Row icon={<Star className="w-4 h-4" />} label="Interest" value={user.student_profile.interest} />
                                <Row icon={<MapPin className="w-4 h-4" />} label="City" value={user.student_profile.city} />
                            </SectionBlock>
                        )}

                        {/* Professional Profile */}
                        {user.role === 'professional' && user.professional_profile && (
                            <SectionBlock title="Professional Profile">
                                <Row icon={<Building2 className="w-4 h-4" />} label="Company" value={user.professional_profile.company} />
                                <Row icon={<MapPin className="w-4 h-4" />} label="City" value={user.professional_profile.city} />
                                <Row icon={<Mail className="w-4 h-4" />} label="Work Email" value={user.professional_profile.company_email} />
                            </SectionBlock>
                        )}

                    </div>
                ) : null}
            </div>
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const UserPage = () => {
    const [confirmUser, setConfirmUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [filtered, setFiltered] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
    const [selectedId, setSelectedId] = useState<number | null>(null);

    useEffect(() => { fetchUsers(); }, []);

    useEffect(() => {
        let list = users;
        if (roleFilter !== 'all') list = list.filter(u => u.role === roleFilter);
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(u =>
                u.email.toLowerCase().includes(q) ||
                u.first_name.toLowerCase().includes(q) ||
                u.last_name.toLowerCase().includes(q)
            );
        }
        setFiltered(list);
    }, [searchQuery, roleFilter, users]);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/accounts/users/');
            setUsers(res.data);
            setFiltered(res.data);
        } catch {
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const counts = {
        all: users.length,
        student: users.filter(u => u.role === 'student').length,
        professional: users.filter(u => u.role === 'professional').length,
        admin: users.filter(u => u.role === 'admin').length,
    };
    const toggleActive = async (userId: number, currentStatus: boolean) => {
        try {
            const res = await api.patch(`/accounts/users/${userId}/toggle-active/`);
            // Update both lists in-place
            const update = (list: User[]) =>
                list.map(u => u.id === userId ? { ...u, is_active: res.data.is_active } : u);
            setUsers(prev => update(prev));
            setFiltered(prev => update(prev));
            toast.success(`User ${res.data.is_active ? 'activated' : 'deactivated'} successfully`);
        } catch {
            toast.error('Failed to update user status');
        }
    };

    const deleteUser = async (userId: number) => {
        if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
        try {
            await api.delete(`/accounts/users/${userId}/delete/`);
            setUsers(prev => prev.filter(u => u.id !== userId));
            setFiltered(prev => prev.filter(u => u.id !== userId));
            toast.success('User deleted successfully');
        } catch {
            toast.error('Failed to delete user');
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="flex min-h-screen">
            <Sidebar />

            <div className="flex-1 lg:ml-64 pt-16 lg:pt-0 p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen overflow-y-auto">

                {/* Page header */}
                <div className="flex justify-between items-center mb-8 mt-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">User Management</h1>
                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-semibold text-gray-600">{users.length} Users</span>
                    </div>
                </div>

                {/* Stat cards / filter buttons */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {([
                        { key: 'all', label: 'Total', icon: <Users className="w-5 h-5" />, color: 'text-gray-600', bg: 'bg-gray-100' },
                        { key: 'student', label: 'Students', icon: <GraduationCap className="w-5 h-5" />, color: 'text-emerald-600', bg: 'bg-emerald-100' },
                        { key: 'professional', label: 'Professionals', icon: <Briefcase className="w-5 h-5" />, color: 'text-blue-600', bg: 'bg-blue-100' },
                        { key: 'admin', label: 'Admins', icon: <Shield className="w-5 h-5" />, color: 'text-purple-600', bg: 'bg-purple-100' },
                    ] as const).map(({ key, label, icon, color, bg }) => (
                        <button
                            key={key}
                            onClick={() => setRoleFilter(key)}
                            className={`bg-white rounded-xl shadow-sm p-4 text-left transition hover:shadow-md border-2 ${roleFilter === key ? 'border-blue-500' : 'border-transparent'
                                }`}
                        >
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${bg} ${color}`}>{icon}</div>
                            <p className="text-2xl font-bold text-gray-800">{counts[key]}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                        </button>
                    ))}
                </div>

                {/* Table card */}
                <div className="bg-white rounded-xl shadow-sm p-6">

                    {/* Search + role dropdown */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-5">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                        </div>
                        <div className="relative">
                            <select
                                value={roleFilter}
                                onChange={e => setRoleFilter(e.target.value as RoleFilter)}
                                className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                            >
                                <option value="all">All Roles</option>
                                <option value="student">Student</option>
                                <option value="professional">Professional</option>
                                <option value="admin">Admin</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {filtered.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        {['ID', 'User', 'Email', 'Phone', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                                            <th key={h} className="text-left py-3 px-4 text-gray-700 font-semibold text-sm whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(user => {
                                        const displayName = `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || '—';
                                        return (
                                            <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">

                                                <td className="py-3 px-4 text-sm text-gray-500">{user.id}</td>

                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2.5">
                                                        <Avatar user={user} />
                                                        <span className="text-sm font-medium text-gray-800 whitespace-nowrap">{displayName}</span>
                                                    </div>
                                                </td>

                                                <td className="py-3 px-4 text-sm text-gray-600">{user.email}</td>
                                                <td className="py-3 px-4 text-sm text-gray-600">{user.phone ?? '—'}</td>
                                                <td className="py-3 px-4"><RoleBadge role={user.role} /></td>
                                                <td className="py-3 px-4"><StatusDot active={user.is_active} /></td>
                                                <td className="py-3 px-4 text-sm text-gray-500 whitespace-nowrap">{fmt(user.date_joined)}</td>




                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => setSelectedId(user.id)}
                                                            className="text-sm text-blue-600 hover:text-blue-800 font-medium transition whitespace-nowrap"
                                                        >
                                                            View
                                                        </button>
                                                        {user.role !== 'admin' && (
                                                            <button
                                                                onClick={() => setConfirmUser(user)}
                                                                title={user.is_active ? 'Deactivate user' : 'Activate user'}
                                                                className={`transition ${user.is_active ? 'text-emerald-500 hover:text-emerald-700' : 'text-gray-300 hover:text-gray-500'}`}
                                                            >
                                                                {user.is_active
                                                                    ? <ToggleRight className="w-6 h-6" />
                                                                    : <ToggleLeft className="w-6 h-6" />}
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => deleteUser(user.id)}
                                                            title="Delete user"
                                                            className="text-gray-300 hover:text-red-500 transition"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>

                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <EmptyState message="No users found" />
                    )}
                </div>
            </div>

            {/* Detail drawer */}
            {selectedId !== null && (
                <UserDrawer userId={selectedId} onClose={() => setSelectedId(null)} />
            )}

            <style>{`
        @keyframes slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .animate-slide-in { animation: slide-in 0.25s cubic-bezier(0.4,0,0.2,1) forwards; }
      `}</style>

            <ConfirmModal
                open={confirmUser !== null}
                title={
                    confirmUser?.is_active
                        ? "Deactivate User?"
                        : "Activate User?"
                }
                description={
                    confirmUser?.is_active
                        ? "This user will no longer be able to login or access the platform."
                        : "This user will regain access to the platform."
                }
                confirmText={
                    confirmUser?.is_active ? "Deactivate" : "Activate"
                }
                confirmColor={confirmUser?.is_active ? "red" : "blue"}
                onCancel={() => setConfirmUser(null)}
                onConfirm={() => {
                    if (confirmUser) {
                        toggleActive(confirmUser.id, confirmUser.is_active);
                        setConfirmUser(null);
                    }
                }}
            />

        </div>
    );
};

export default UserPage;