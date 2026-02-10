"use client";

import { use } from "react";
import AnthropometryForm from "@/components/AnthropometryForm";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function EvaluatePatientPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    return (
        <div className="p-4 lg:p-8 space-y-10 max-w-7xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Navigation back */}
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard/patients"
                    className="p-3 bg-white rounded-2xl border border-gray-100 text-gray-400 hover:text-fuchsia-600 transition-all shadow-sm hover:shadow-md"
                >
                    <ChevronLeft size={20} />
                </Link>
                <div className="h-4 w-px bg-gray-200 mx-2" />
                <p className="text-xs font-black text-gray-300 uppercase tracking-widest">Protocolo de Evaluación Clínica</p>
            </div>

            {/* Component */}
            <AnthropometryForm patientId={id} />
        </div>
    );
}
