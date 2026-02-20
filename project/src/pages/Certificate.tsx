import { useEffect, useState } from 'react';
import {
    Users,
    GraduationCap,
    Upload,
    CheckCircle,
    XCircle,
    FileText
} from 'lucide-react';

import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import api from '../utils/api';
import { toast } from 'react-toastify';

interface CertificateUser {
    id: number;
    user_name: string;
    total_modules: number;
    completed_modules: number;
    all_completed: boolean;
    certificate: string | null;
}

const CertificatePage = () => {
    const [users, setUsers] = useState<CertificateUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploadingUser, setUploadingUser] = useState<number | null>(null);
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await api.get('/certificate-status-all/'); // 🔥 create this API
            setUsers(res.data);
        } catch {
            toast.error('Failed to fetch certificate data');
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (userId: number) => {
        if (!file) {
            toast.error("Please select certificate file");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("certificate_file", file);

            await api.post(`/upload-certificate/${userId}/`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            toast.success("Certificate uploaded successfully");
            setUploadingUser(null);
            setFile(null);
            fetchData();
        } catch {
            toast.error("Upload failed");
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="flex min-h-screen">
            <Sidebar />

            <div className="flex-1 lg:ml-64 pt-16 lg:pt-0 p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen overflow-y-auto">

                {/* Header */}
                <div className="flex justify-between items-center mb-8 mt-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                        Certificate Management
                    </h1>

                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-semibold text-gray-600">
                            {users.length} Users
                        </span>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm p-6">

                    {users.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        {['User', 'Completed Modules', 'Status', 'Certificate', 'Action'].map(h => (
                                            <th key={h} className="text-left py-3 px-4 text-gray-700 font-semibold text-sm whitespace-nowrap">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {users.map(user => (
                                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition">

                                            {/* User */}
                                            <td className="py-3 px-4 font-medium text-gray-800 whitespace-nowrap">
                                                {user.user_name}
                                            </td>

                                            {/* Completion */}
                                            <td className="py-3 px-4 text-sm text-gray-600">
                                                {user.completed_modules} / {user.total_modules}
                                            </td>

                                            {/* Status */}
                                            <td className="py-3 px-4">
                                                {user.all_completed ? (
                                                    <span className="inline-flex items-center gap-1 text-emerald-600 font-medium text-sm">
                                                        <CheckCircle className="w-4 h-4" /> Eligible
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-red-500 font-medium text-sm">
                                                        <XCircle className="w-4 h-4" /> Not Eligible
                                                    </span>
                                                )}
                                            </td>

                                            {/* Certificate View */}
                                            <td className="py-3 px-4">
                                                {user.certificate ? (
                                                    <a
                                                        href={user.certificate}
                                                        target="_blank"
                                                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                    >
                                                        <FileText className="w-4 h-4" />
                                                        View
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">—</span>
                                                )}
                                            </td>

                                            {/* Upload Action */}
                                            <td className="py-3 px-4">

                                                {uploadingUser === user.id ? (
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="file"
                                                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                                                            className="text-sm"
                                                        />
                                                        <button
                                                            onClick={() => handleUpload(user.id)}
                                                            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                                                        >
                                                            Upload
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setUploadingUser(user.id)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition bg-blue-600 text-white hover:bg-blue-700"
                                                    >
                                                        <Upload className="w-4 h-4" />
                                                        Upload
                                                    </button>
                                                )}

                                            </td>

                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <EmptyState message="No certificate data found" />
                    )}

                </div>
            </div>
        </div>
    );
};

export default CertificatePage;