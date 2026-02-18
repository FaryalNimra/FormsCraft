'use client';

import Navbar from '@/components/Navbar';
import ActionCard from '@/components/ActionCard';
import { Plus, Layout, BarChart2, Loader2, FileText, Eye, Edit2, MessageSquare, MoreVertical, Trash2, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getAllFormsWithStats, deleteForm } from '@/lib/forms';

export default function Home() {
  const router = useRouter();
  const [forms, setForms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const data = await getAllFormsWithStats();
      setForms(data);
    } catch (error) {
      console.error('Failed to fetch forms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      try {
        await deleteForm(id);
        fetchForms();
      } catch (error) {
        console.error('Failed to delete form:', error);
        alert('Failed to delete form. Please check console for details.');
      }
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${month}/${day}/${year}`;
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-8">
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-1 rounded-full" style={{ backgroundColor: 'var(--primary-600)' }}></div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Workspace Overview</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
            Design, Build, & Track yours.
          </h1>
          <p className="text-gray-500 text-sm font-medium max-w-xl">
            Welcome back. Here's a quick look at your projects and their performance.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <ActionCard
            icon={Plus}
            title="New Project"
            description="Create from scratch"
            iconBgColor="bg-blue-50"
            iconColor="text-blue-600"
            onClick={() => router.push('/builder')}
          />
          <ActionCard
            icon={Layout}
            title="Templates"
            description="Start with a layout"
            iconBgColor="bg-blue-50"
            iconColor="text-blue-600"
          />
          <ActionCard
            icon={BarChart2}
            title="Insights"
            description="Deep dive into data"
            iconBgColor="bg-blue-50"
            iconColor="text-blue-600"
          />
        </div>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              Recent Projects
              {forms.length > 0 && (
                <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-full uppercase tracking-wider">
                  {forms.length}
                </span>
              )}
            </h2>
            <div className="flex items-center gap-3">
              {forms.length > 4 && (
                <div className="relative group animate-in fade-in slide-in-from-right-2 duration-300">
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-white border border-gray-100 rounded-lg text-xs font-bold text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none w-64 transition-all"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={14} />
                </div>
              )}
              <button
                onClick={() => router.push('/builder')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm whitespace-nowrap"
              >
                <Plus size={14} />
                New Form
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden text-sm">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            ) : forms.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 bg-gray-50 text-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                  <FileText size={32} />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white shadow-sm rounded-full flex items-center justify-center text-blue-500">
                    <Plus size={14} />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Start your first project</h3>
                <p className="text-gray-400 text-xs max-w-xs mx-auto">Create a form to start collecting responses.</p>
                <button
                  onClick={() => router.push('/builder')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all"
                >
                  Get Started
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      <th className="px-6 py-4">Project</th>
                      <th className="px-4 py-4">Status</th>
                      <th className="px-4 py-4">Creation Date</th>
                      <th className="px-4 py-4">Submissions</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {forms
                      .filter(form => form.title.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((form) => (
                        <tr
                          key={form.id}
                          onClick={() => router.push(`/responses/${form.id}`)}
                          className="group hover:bg-gray-50/50 transition-all cursor-pointer"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                                <FileText size={18} />
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight text-xs">{form.title}</p>
                                <p className="text-[10px] text-gray-400 font-medium">#{form.id.substring(0, 8)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${form.status === 'published'
                              ? 'bg-green-50 text-green-600 border-green-100'
                              : form.status === 'in_progress'
                                ? 'bg-blue-50 text-blue-600 border-blue-100'
                                : 'bg-amber-50 text-amber-600 border-amber-100'
                              }`}>
                              {form.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-xs font-medium text-gray-500">
                            {formatTime(form.updated_at || form.created_at)}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <MessageSquare size={12} className="text-gray-300" />
                              <span className="text-xs font-bold text-gray-900">{form.response_count}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); router.push(`/responses/${form.id}`); }}
                                className="p-2 text-black hover:bg-gray-100 rounded-lg transition-all"
                                title="View"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); router.push(`/builder?id=${form.id}`); }}
                                className="p-2 text-black hover:bg-gray-100 rounded-lg transition-all"
                                title="Edit"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(form.id, form.title); }}
                                className="p-2 text-black hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
