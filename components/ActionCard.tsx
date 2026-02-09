import { LucideIcon } from 'lucide-react';

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
            className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col gap-4"
        >
            <div className={`w-12 h-12 flex items-center justify-center rounded-xl ${iconBgColor} ${iconColor}`}>
                <Icon size={24} />
            </div>
            <div>
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500">{description}</p>
            </div>
        </div>
    );
}
