'use client';

import Navbar from '@/components/Navbar';
import ActionCard from '@/components/ActionCard';
import { Plus, Layout, BarChart2, Loader2, FileText, Eye, Edit2, MessageSquare, MoreVertical, Trash2, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getAllFormsWithStats, deleteForm, toggleArchiveForm } from '@/lib/forms';
import { Archive, RotateCcw } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [forms, setForms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'creation_date' | 'last_modified' | 'last_accessed'>('last_modified');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [viewFilter, setViewFilter] = useState<'active' | 'archived'>('active');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

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

  const handleArchive = async (id: string, isArchiving: boolean) => {
    try {
      await toggleArchiveForm(id, isArchiving);
      fetchForms();
      setActiveMenuId(null);
    } catch (error) {
      console.error('Failed to update archive status:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${month}/${day}/${year}`;
  };

  const sortedForms = forms
    .filter(f => viewFilter === 'active' ? !f.is_archived : f.is_archived)
    .sort((a, b) => {
      let dateA, dateB;
      if (sortBy === 'creation_date') {
        dateA = new Date(a.created_at).getTime();
        dateB = new Date(b.created_at).getTime();
      } else if (sortBy === 'last_modified') {
        dateA = new Date(a.last_edited_at || a.created_at).getTime();
        dateB = new Date(b.last_edited_at || b.created_at).getTime();
      } else {
        // last_accessed
        dateA = new Date(a.last_accessed_at || a.last_edited_at || a.created_at).getTime();
        dateB = new Date(b.last_accessed_at || b.last_edited_at || b.created_at).getTime();
      }
      return dateB - dateA;
    });

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
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 hover:text-blue-600 transition-colors group"
              >
                {viewFilter === 'active' ? 'Recent Projects' : 'Archived Projects'}
                <ChevronDown size={14} className={`text-gray-400 group-hover:text-blue-600 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
              </button>

              {isFilterOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsFilterOpen(false)}></div>
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-40 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <button
                      onClick={() => { setViewFilter('active'); setIsFilterOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors hover:bg-gray-50 flex items-center gap-2 ${viewFilter === 'active' ? 'text-blue-600 bg-blue-50/50' : 'text-gray-500'}`}
                    >
                      <Layout size={12} />
                      Active Projects
                    </button>
                    <button
                      onClick={() => { setViewFilter('archived'); setIsFilterOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors hover:bg-gray-50 flex items-center gap-2 ${viewFilter === 'archived' ? 'text-blue-600 bg-blue-50/50' : 'text-gray-500'}`}
                    >
                      <Archive size={12} />
                      Archived Projects
                    </button>
                  </div>
                </>
              )}

              {sortedForms.length > 0 && (
                <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-full uppercase tracking-wider">
                  {sortedForms.length}
                </span>
              )}
            </h2>
            <button
              onClick={() => router.push('/builder')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm"
            >
              <Plus size={14} />
              New Form
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-sm">
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
              <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      <th className="px-6 py-4">Project</th>
                      <th className="px-4 py-4">Status</th>
                      <th className="px-4 py-4 relative">
                        <button
                          onClick={(e) => { e.stopPropagation(); setIsSortOpen(!isSortOpen); }}
                          className="flex items-center gap-1.5 hover:text-gray-900 transition-colors uppercase tracking-widest outline-none group"
                        >
                          <span>
                            {sortBy === 'creation_date' ? 'Creation Date' : sortBy === 'last_modified' ? 'Last Modified' : 'Last Accessed'}
                          </span>
                          <ChevronDown size={12} className={`transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isSortOpen && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsSortOpen(false)}></div>
                            <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-gray-100 rounded-xl shadow-xl z-20 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                              {[
                                { id: 'creation_date', label: 'Creation Date' },
                                { id: 'last_modified', label: 'Last Modified' },
                                { id: 'last_accessed', label: 'Last Accessed' }
                              ].map((item) => (
                                <button
                                  key={item.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSortBy(item.id as any);
                                    setIsSortOpen(false);
                                  }}
                                  className={`w-full text-left px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors hover:bg-gray-50 ${sortBy === item.id ? 'text-blue-600 bg-blue-50/50' : 'text-gray-500'}`}
                                >
                                  {item.label}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </th>
                      <th className="px-4 py-4">Submissions</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {sortedForms.map((form) => (
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
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${form.status === 'published'
                              ? 'bg-green-50 text-green-600 border-green-100'
                              : 'bg-amber-50 text-amber-600 border-amber-100'
                              }`}>
                              {form.status}
                            </span>
                            {form.last_edited_at && new Date(form.last_edited_at).getTime() - new Date(form.created_at).getTime() > 10000 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border bg-blue-50 text-blue-600 border-blue-100">
                                Edited
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-xs font-medium text-gray-500">
                          {formatTime(sortBy === 'creation_date' ? form.created_at : (sortBy === 'last_modified' ? (form.last_edited_at || form.created_at) : (form.last_accessed_at || form.last_edited_at || form.created_at)))}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <MessageSquare size={12} className="text-gray-300" />
                            <span className="text-xs font-bold text-gray-900">{form.response_count}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {!form.is_archived && (
                              <>
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
                              </>
                            )}
                            <div className="relative">
                              <button
                                onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === form.id ? null : form.id); }}
                                className={`p-2 rounded-lg transition-all ${activeMenuId === form.id ? 'bg-gray-100 text-blue-600 border border-gray-200 shadow-sm' : 'text-gray-400 hover:bg-gray-100 hover:text-black'}`}
                                title="More Actions"
                              >
                                <MoreVertical size={16} />
                              </button>

                              {activeMenuId === form.id && (
                                <>
                                  <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); }}></div>
                                  <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-2 animate-in fade-in zoom-in-95 duration-200">
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleArchive(form.id, !form.is_archived); }}
                                      className="w-full text-left px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-600 hover:bg-gray-50 hover:text-blue-600 flex items-center gap-2 transition-colors"
                                    >
                                      {form.is_archived ? <RotateCcw size={12} /> : <Archive size={12} />}
                                      {form.is_archived ? 'Unarchive' : 'Archive'}
                                    </button>
                                    <div className="mx-2 my-1 border-t border-gray-50"></div>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleDelete(form.id, form.title); }}
                                      className="w-full text-left px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-red-500 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                    >
                                      <Trash2 size={12} />
                                      Delete
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
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
