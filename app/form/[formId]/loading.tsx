import { Loader2 } from 'lucide-react';

export default function FormLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 size={48} className="text-blue-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Loading form...</p>
      </div>
    </div>
  );
}
