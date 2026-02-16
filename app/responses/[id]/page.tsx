'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getResponseDetails } from '@/lib/forms';
import {
    Loader2,
    ArrowLeft,
    Download,
    MessageSquare,
    Clock,
    User,
    Mail,
    FileText,
    BarChart3,
    ChevronDown,
    ChevronUp,
    Search,
    Eye,
    Link as LinkIcon,
    Copy,
    Check,
    X
} from 'lucide-react';
import Link from 'next/link';

interface ResponseData {
    id: string;
    form_id: string;
    user_email?: string;
    submitted_at: string;
    answers: Record<string, string>;
}

export default function ResponsesPage() {
    const { id } = useParams();
    const router = useRouter();
    const [form, setForm] = useState<any>(null);
    const [responses, setResponses] = useState<ResponseData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'table' | 'individual'>('table');
    const [selectedResponseIndex, setSelectedResponseIndex] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState<'submitted_at' | null>('submitted_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [copySuccess, setCopySuccess] = useState(false);

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const data = await getResponseDetails(id as string);
            setForm(data.form);
            setResponses(data.responsesWithAnswers);
        } catch (err: any) {
            console.error('Error fetching responses:', err);
            setError(err.message || 'Failed to load responses');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredResponses = useMemo(() => {
        let result = [...responses];

        // Filter by search query
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter((r) => {
                if (r.user_email?.toLowerCase().includes(q)) return true;
                return Object.values(r.answers).some(a => a?.toLowerCase().includes(q));
            });
        }

        // Sort
        if (sortField === 'submitted_at') {
            result.sort((a, b) => {
                const diff = new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime();
                return sortOrder === 'asc' ? diff : -diff;
            });
        }

        return result;
    }, [responses, searchQuery, sortField, sortOrder]);

    const toggleSort = () => {
        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    };

    const copyShareLink = () => {
        const link = `${window.location.origin}/view/${id}`;
        navigator.clipboard.writeText(link);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    const exportCSV = () => {
        if (!form || responses.length === 0) return;

        const headers = ['#', 'Submitted At', ...(form.collect_email ? ['Email'] : []), ...form.elements.map((el: any) => el.label)];
        const rows = filteredResponses.map((r, i) => [
            i + 1,
            new Date(r.submitted_at).toLocaleString(),
            ...(form.collect_email ? [r.user_email || ''] : []),
            ...form.elements.map((el: any) => r.answers[el.id] || '')
        ]);

        const csvContent = [headers.join(','), ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${form.title}_responses.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#FDFDFF] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    // Error state
    if (error || !form) {
        const isUnauthorized = error === 'UNAUTHORIZED';
        return (
            <div className="min-h-screen bg-[#FDFDFF] flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-sm text-center max-w-sm w-full border border-gray-100 overflow-hidden relative p-8">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500"></div>
                    <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        {isUnauthorized ? <User size={24} /> : <X size={24} />}
                    </div>
                    <h1 className="text-lg font-bold text-gray-900 mb-2">
                        {isUnauthorized ? 'Access Denied' : 'Error'}
                    </h1>
                    <p className="text-gray-500 text-xs mb-6 lowercase first-letter:uppercase">
                        {isUnauthorized
                            ? "You don't have permission to view responses for this form. Only the creator can access this data."
                            : (error || 'Form not found.')}
                    </p>
                    <Link
                        href="/"
                        className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-medium text-xs transition-colors hover:bg-blue-700 shadow-sm uppercase tracking-widest"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const selectedResponse = filteredResponses[selectedResponseIndex];

    return (
        <div className="min-h-screen bg-[#FDFDFF]">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                                <ArrowLeft size={14} />
                            </div>
                            <span className="text-[10px] font-bold text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-widest hidden sm:block">Dashboard</span>
                        </Link>
                        <div className="h-4 w-px bg-gray-100"></div>
                        <div>
                            <h1 className="text-sm font-bold text-gray-900 tracking-tight">{form.title}</h1>
                            <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest ${form.status === 'published'
                                    ? 'bg-green-50 text-green-600'
                                    : 'bg-amber-50 text-amber-600'
                                    }`}>
                                    {form.status}
                                </span>
                                <span className="text-[10px] text-gray-400 font-medium">
                                    {responses.length} response{responses.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={copyShareLink}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all text-[10px] font-bold uppercase tracking-wider"
                        >
                            {copySuccess ? <Check size={14} /> : <LinkIcon size={14} />}
                            {copySuccess ? 'Copied!' : 'Share'}
                        </button>
                        <button
                            onClick={exportCSV}
                            disabled={responses.length === 0}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all text-[10px] font-bold uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <Download size={14} />
                            Export CSV
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <MessageSquare size={18} />
                            </div>
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Total Responses</span>
                        </div>
                        <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{responses.length}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                                <BarChart3 size={18} />
                            </div>
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Questions</span>
                        </div>
                        <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{form.elements?.length || 0}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                <Clock size={18} />
                            </div>
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Last Response</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900">
                            {responses.length > 0
                                ? new Date(responses[0].submitted_at).toLocaleDateString([], { dateStyle: 'medium' })
                                : 'No responses yet'
                            }
                        </p>
                    </div>
                </div>

                {/* Empty State */}
                {responses.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 text-center">
                        <div className="w-16 h-16 bg-gray-50 text-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">No responses yet</h3>
                        <p className="text-gray-400 text-xs max-w-xs mx-auto mb-6">
                            Share your form to start collecting responses. They'll appear here in real-time.
                        </p>
                        <button
                            onClick={copyShareLink}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all inline-flex items-center gap-2"
                        >
                            <LinkIcon size={14} />
                            Copy Form Link
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Toolbar */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search responses..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 w-64 transition-all"
                                    />
                                </div>
                                {searchQuery && (
                                    <span className="text-[10px] font-bold text-gray-400">
                                        {filteredResponses.length} of {responses.length} results
                                    </span>
                                )}
                            </div>

                            {/* View Toggle */}
                            <div className="flex items-center bg-gray-50 p-0.5 rounded-lg border border-gray-100">
                                <button
                                    onClick={() => setViewMode('table')}
                                    className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${viewMode === 'table'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    Table
                                </button>
                                <button
                                    onClick={() => setViewMode('individual')}
                                    className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${viewMode === 'individual'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    Individual
                                </button>
                            </div>
                        </div>

                        {/* Table View */}
                        {viewMode === 'table' && (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr className="bg-gray-50/50 border-b border-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                <th className="px-6 py-4 w-10">#</th>
                                                <th
                                                    className="px-4 py-4 cursor-pointer hover:text-gray-600 transition-colors select-none"
                                                    onClick={toggleSort}
                                                >
                                                    <div className="flex items-center gap-1">
                                                        Submitted
                                                        {sortOrder === 'desc' ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
                                                    </div>
                                                    <p className="text-sm font-bold text-gray-900 tracking-tight uppercase">
                                                        {resp.user_email || 'Anonymous Data'}
                                                    </p>
                                                </div>
                                            </div>
                                                </th>
                                                {form.collect_email && (
                                                    <th className="px-4 py-4">Email</th>
                                                )}
                                                {form.elements?.map((el: any) => (
                                                    <th key={el.id} className="px-4 py-4 max-w-[200px]">
                                                        <span className="truncate block">{el.label}</span>
                                                    </th>
                                                ))}
                                                <th className="px-4 py-4 w-20 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {filteredResponses.map((response, index) => (
                                                <tr key={response.id} className="hover:bg-gray-50/50 transition-all group">
                                                    <td className="px-6 py-4 text-xs font-bold text-gray-400">{index + 1}</td>
                                                    <td className="px-4 py-4 text-xs text-gray-500 font-medium whitespace-nowrap">
                                                        {new Date(response.submitted_at).toLocaleString([], {
                                                            dateStyle: 'medium',
                                                            timeStyle: 'short',
                                                        })}
                                                    </td>
                                                    {form.collect_email && (
                                                        <td className="px-4 py-4">
                                                            <span className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                                                                <Mail size={12} className="text-gray-300" />
                                                                {response.user_email || '—'}
                                                            </span>
                                                        </td>
                                                    )}
                                                    {form.elements?.map((el: any) => (
                                                        <td key={el.id} className="px-4 py-4 max-w-[200px]">
                                                            <span className="text-xs text-gray-700 font-normal truncate block">
                                                                {response.answers[el.id] || <span className="text-gray-300 italic">—</span>}
                                                            </span>
                                                        </td>
                                                    ))}
                                                    <td className="px-4 py-4 text-right">
                                                        <button
                                                            onClick={() => { setSelectedResponseIndex(index); setViewMode('individual'); }}
                                                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                            title="View Details"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Individual View */}
                        {viewMode === 'individual' && selectedResponse && (
                            <div className="space-y-4">
                                {/* Navigation */}
                                <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                                    <button
                                        onClick={() => setSelectedResponseIndex(Math.max(0, selectedResponseIndex - 1))}
                                        disabled={selectedResponseIndex === 0}
                                        className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-widest"
                                    >
                                        ← Previous
                                    </button>
                                    <span className="text-xs font-bold text-gray-400">
                                        {selectedResponseIndex + 1} of {filteredResponses.length}
                                    </span>
                                    <button
                                        onClick={() => setSelectedResponseIndex(Math.min(filteredResponses.length - 1, selectedResponseIndex + 1))}
                                        disabled={selectedResponseIndex === filteredResponses.length - 1}
                                        className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-widest"
                                    >
                                        Next →
                                    </button>
                                </div>

                                {/* Response Metadata */}
                                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                    <div className="flex items-center gap-6 text-xs">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <Clock size={14} className="text-gray-300" />
                                            <span className="font-medium">
                                                {new Date(selectedResponse.submitted_at).toLocaleString([], {
                                                    dateStyle: 'full',
                                                    timeStyle: 'short',
                                                })}
                                            </span>
                                        </div>
                                        {selectedResponse.user_email && (
                                            <div className="flex items-center gap-2 text-gray-500">
                                                <Mail size={14} className="text-gray-300" />
                                                <span className="font-bold">{selectedResponse.user_email}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Answers */}
                                <div className="space-y-3">
                                    {form.elements?.map((el: any) => (
                                        <div
                                            key={el.id}
                                            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
                                        >
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                                                {el.label}
                                                {el.required && <span className="text-red-500 ml-1">*</span>}
                                            </p>
                                            <p className="text-sm text-gray-900 font-normal leading-relaxed whitespace-pre-wrap">
                                                {selectedResponse.answers[el.id] || (
                                                    <span className="text-gray-300 italic">No answer provided</span>
                                                )}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
