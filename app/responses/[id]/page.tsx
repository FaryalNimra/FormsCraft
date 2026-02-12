'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getResponseDetails } from '@/lib/forms';
import Navbar from '@/components/Navbar';
import {
    ArrowLeft,
    Calendar,
    ChevronRight,
    ChevronDown,
    FileText,
    Clock,
    User,
    Loader2,
    BarChart3,
    ArrowUpRight,
    Search
} from 'lucide-react';
import Link from 'next/link';

export default function ResponseDashboard() {
    const { id } = useParams();
    const router = useRouter();
    const [data, setData] = useState<{ form: any, responsesWithAnswers: any[] } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedResponseId, setExpandedResponseId] = useState<string | null>(null);

    useEffect(() => {
        if (id) fetchDetails();
    }, [id]);

    const fetchDetails = async () => {
        try {
            const results = await getResponseDetails(id as string);
            setData(results);
        } catch (error) {
            console.error('Failed to fetch response details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#FDFDFF] flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-[#FDFDFF] flex flex-col">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <Search size={32} className="text-gray-200" />
                    </div>
                    <h1 className="text-lg font-bold text-gray-900 mb-2 uppercase tracking-tight">Records Not Found</h1>
                    <Link href="/" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold text-xs uppercase tracking-widest shadow-sm mt-4">
                        Dashoard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFDFF] flex flex-col text-sm">
            <Navbar />

            <main className="max-w-5xl mx-auto px-6 py-10 w-full">
                <header className="mb-10">
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center gap-2 text-gray-400 hover:text-blue-600 transition-all mb-6 group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Analytics</span>
                    </button>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-1 bg-blue-600 rounded-full"></div>
                                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Insights</span>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight leading-tight">{data.form.title}</h1>
                        </div>
                        <Link
                            href={`/view/${id}`}
                            target="_blank"
                            className="inline-flex items-center gap-2 bg-white border border-gray-100 px-5 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest text-gray-900 hover:bg-gray-50 transition-all shadow-sm"
                        >
                            Open Link
                            <ArrowUpRight size={14} />
                        </Link>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                    <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-sm relative overflow-hidden">
                        <p className="text-[9px] font-bold uppercase tracking-widest opacity-60 mb-4">Reach</p>
                        <h2 className="text-4xl font-black tracking-tighter mb-1">{data.responsesWithAnswers.length}</h2>
                        <span className="text-[10px] font-medium opacity-60 uppercase">Entries</span>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-indigo-500 mb-4">Completion</p>
                        <h2 className="text-4xl font-black tracking-tighter mb-1 text-gray-900">94%</h2>
                        <span className="text-[10px] font-medium text-gray-400 uppercase">Average</span>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-purple-500 mb-4">Engage</p>
                        <h2 className="text-4xl font-black tracking-tighter mb-1 text-gray-900">1.2m</h2>
                        <span className="text-[10px] font-medium text-gray-400 uppercase">Avg. Time</span>
                    </div>
                </div>

                <section className="space-y-6">
                    <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        Signal Log
                        <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                        <span>{data.responsesWithAnswers.length} Entries</span>
                    </h2>

                    {data.responsesWithAnswers.length === 0 ? (
                        <div className="bg-white rounded-3xl py-24 text-center border-2 border-dashed border-gray-50">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Waiting for signal...</h3>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {data.responsesWithAnswers.map((resp, idx) => {
                                const isExpanded = expandedResponseId === resp.id;

                                return (
                                    <div
                                        key={resp.id}
                                        className={`bg-white rounded-2xl border transition-all duration-300 ${isExpanded
                                                ? 'border-blue-300 shadow-lg'
                                                : 'border-gray-50 hover:border-gray-100'
                                            }`}
                                    >
                                        <div
                                            onClick={() => setExpandedResponseId(isExpanded ? null : resp.id)}
                                            className={`p-6 cursor-pointer flex items-center justify-between transition-colors ${isExpanded ? 'bg-blue-50/10' : ''}`}
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-all ${isExpanded ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-400'
                                                    }`}>
                                                    <span className="text-[11px] font-bold tracking-tighter">#{data.responsesWithAnswers.length - idx}</span>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                                            {new Date(resp.submitted_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-bold text-gray-900 tracking-tight uppercase">Anonymous Data</p>
                                                </div>
                                            </div>

                                            <div className={`w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center transition-all ${isExpanded ? 'rotate-180 bg-blue-600 text-white' : 'text-gray-300'}`}>
                                                <ChevronDown size={18} />
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <div className="px-6 pb-8 pt-2 space-y-6 animate-in fade-in duration-300">
                                                <div className="h-px bg-gray-50 w-full"></div>
                                                <div className="grid gap-6">
                                                    {data.form.elements.map((el: any) => (
                                                        <div key={el.id} className="space-y-2">
                                                            <label className="text-[9px] font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2">
                                                                <BarChart3 size={12} />
                                                                {el.label}
                                                            </label>
                                                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white transition-all">
                                                                <p className="text-sm font-semibold text-gray-700 leading-relaxed">
                                                                    {resp.answers[el.id] || <span className="text-gray-200 italic">No entry</span>}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
