"use client";

import { useMemo } from "react";
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

interface DashboardChartsProps {
    dataBP: any[];
    dataActivity: any[];
}

export function DashboardCharts({ dataBP, dataActivity }: DashboardChartsProps) {
    // Recharts must be client-side
    return (
        <>
            {/* Blood Pressure */}
            <div className="bg-white p-6 rounded-3xl shadow-sm">
                <div className="flex justify-between mb-4">
                    <h4 className="font-bold text-gray-700">Presión Arterial</h4>
                    <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-md">Hoy</span>
                </div>
                <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dataBP}>
                            <defs>
                                <linearGradient id="colorBp" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="value" stroke="#F97316" fillOpacity={1} fill="url(#colorBp)" strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Your Activity */}
            <div className="bg-white p-6 rounded-3xl shadow-sm">
                <div className="flex justify-between mb-4">
                    <h4 className="font-bold text-gray-700">Tu Actividad</h4>
                    <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-md">Semana</span>
                </div>
                <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dataActivity}>
                            <Bar dataKey="val" radius={[10, 10, 10, 10]}>
                                {dataActivity.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={entry.day === 'Wed' ? '#F97316' : '#EFF6FF'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </>
    );
}
