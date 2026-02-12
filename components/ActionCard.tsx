import { LucideIcon, ArrowUpRight } from 'lucide-react';

interface ActionCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
    iconBgColor: string;
    iconColor: string;
    onClick?: () => void;
}

export default function ActionCard({ icon: Icon, title, description, iconBgColor, iconColor, onClick }: ActionCardProps) {
    return (
        <div
            onClick={onClick}
            className="p-5 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col gap-4 group hover:border-[var(--primary-600)]"
        >
            <div className="flex items-start justify-between">
                <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${iconBgColor} ${iconColor} transition-transform group-hover:scale-105`}>
                    <Icon size={20} />
                </div>
                <div className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight size={14} />
                </div>
            </div>

            <div className="space-y-1">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">{title}</h3>
                <p className="text-gray-400 text-[10px] font-medium leading-relaxed line-clamp-1">{description}</p>
            </div>
        </div>
    );
}
