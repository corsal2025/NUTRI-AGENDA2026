import { NutritionForm } from "@/components/NutritionForm";

export default function ResultadosPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">Evaluación y Resultados</h2>
                    <p className="text-gray-500 mt-2">Ingresa los datos antropométricos para el cálculo automático.</p>
                </div>
            </div>

            <NutritionForm />
        </div>
    );
}
