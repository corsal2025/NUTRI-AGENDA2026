import { Construction, LucideIcon } from "lucide-react";

interface PlaceholderPageProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
}

export function PlaceholderPage({ title, description = "Esta sección está en desarrollo. Pronto estará disponible.", icon: Icon = Construction }: PlaceholderPageProps) {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">{title}</h1>

            <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center space-y-4">
                <div className="bg-fuchsia-50 p-4 rounded-full">
                    <Icon className="text-fuchsia-600 w-8 h-8" />
                </div>
                <h3 className="text-xl font-medium text-gray-900">En Construcción</h3>
                <p className="text-gray-500 max-w-md">{description}</p>
            </div>
        </div>
    );
}
