'use client';

import Navbar from '@/components/Navbar';
import ActionCard from '@/components/ActionCard';
import RecentFormCard from '@/components/RecentFormCard';
import { Plus, Layout, BarChart2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const recentForms = [
    { name: 'Customer Feedback Survey', time: '2 hours ago', responses: 24 },
    { name: 'Event Registration', time: '1 day ago', responses: 156 },
    { name: 'Job Application Form', time: '3 days ago', responses: 42 },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-12">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Welcome back!</h1>
          <p className="text-gray-500">Manage your forms and view your latest analytics.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <ActionCard
            icon={Plus}
            title="Create New Form"
            description="Start from scratch with our drag-and-drop builder"
            iconBgColor="bg-blue-50"
            iconColor="text-blue-500"
            onClick={() => router.push('/builder')}
          />
          <ActionCard
            icon={Layout}
            title="Use Template"
            description="Start with a pre-built template (coming soon)"
            iconBgColor="bg-purple-50"
            iconColor="text-purple-500"
          />
          <ActionCard
            icon={BarChart2}
            title="View Analytics"
            description="See insights across all forms (coming soon)"
            iconBgColor="bg-green-50"
            iconColor="text-green-500"
          />
        </div>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Forms</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentForms.map((form, index) => (
              <RecentFormCard key={index} name={form.name} time={form.time} responses={form.responses} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
