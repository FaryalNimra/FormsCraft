import { FileText } from 'lucide-react';

interface RecentFormCardProps {
    name: string;
    time: string;
    responses: number;
}

export default function RecentFormCard({ name, time, responses }: RecentFormCardProps) {
    return (
        <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col gap-4 relative">
            <div className="absolute top-4 right-4 text-xs text-gray-400 font-medium">
                {time}
            </div>
            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-50 text-blue-500">
                <FileText size={20} />
            </div>
            <div className="flex flex-col gap-1">
                <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{name}</h4>
                <p className="text-xs text-gray-500 font-medium">{responses} responses</p>
            </div>
        </div>
    );
}
