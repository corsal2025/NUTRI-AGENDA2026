'use client'

import { motion } from 'framer-motion'
import { memo } from 'react'

interface BodyScanProps {
    focusedZone: string | null
    gender: 'M' | 'F' | string
}

const BodyScan = ({ focusedZone, gender }: BodyScanProps) => {
    const isActive = (zones: string[]) => zones.includes(focusedZone || '')

    return (
        <div className="relative w-full aspect-[3/4] flex items-center justify-center p-4 bg-[#0a0a0c] rounded-[3rem] overflow-hidden shadow-2xl border border-white/5">
            {/* Fondo con Grid Médico / HUD */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(217,70,239,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(217,70,239,0.1)_1px,transparent_1px)] bg-[size:30px_30px]" />
            </div>

            {/* Ilustración Anatómica Muscular */}
            <div className="relative w-full h-full flex items-center justify-center z-10">
                {/* Imagen Anatómica (Representación de la imagen enviada por el usuario) */}
                <div className="absolute inset-0 flex items-center justify-center opacity-80 mix-blend-screen overflow-hidden">
                    <img
                        src="https://images.unsplash.com/photo-1599058917232-d750c1830bb7?q=80&w=1470&auto=format&fit=crop"
                        alt="Anatomy"
                        className="h-full object-contain grayscale invert brightness-150"
                        style={{ filter: 'invert(1) opacity(0.3) drop-shadow(0 0 10px rgba(217,70,239,0.5))' }}
                    />
                </div>

                {/* --- HOTSPOTS / ZONAS DE MEDICIÓN REACTIVAS --- */}
                <div className="absolute inset-0 pointer-events-none">
                    {/* Cabeza / Cuello */}
                    <Hotspot x="50%" y="15%" active={isActive(['edad'])} color="fuchsia" />

                    {/* Pecho / Brazos */}
                    <Hotspot x="35%" y="28%" active={isActive(['bicipital', 'brazo_relajado', 'brazo_contraido'])} color="fuchsia" />
                    <Hotspot x="65%" y="28%" active={isActive(['tricipital', 'brazo_relajado', 'brazo_contraido'])} color="fuchsia" />

                    {/* Abdomen / Oblicuos */}
                    <Hotspot x="55.5%" y="42%" active={isActive(['cintura', 'abdominal', 'pliegue_suprailiaco'])} color="fuchsia" />
                    <Hotspot x="44.5%" y="42%" active={isActive(['cintura', 'abdominal', 'pliegue_subescapular'])} color="fuchsia" />

                    {/* Muslo */}
                    <Hotspot x="43%" y="65%" active={isActive(['muslo_frontal', 'femur'])} color="cyan" />
                    <Hotspot x="57%" y="65%" active={isActive(['muslo_frontal', 'femur'])} color="cyan" />

                    {/* Pantorrilla */}
                    <Hotspot x="43%" y="85%" active={isActive(['pantorrilla', 'pantorrilla_circ'])} color="cyan" />
                    <Hotspot x="57%" y="85%" active={isActive(['pantorrilla', 'pantorrilla_circ'])} color="cyan" />
                </div>
            </div>

            {/* HUD Inferior */}
            <div className="absolute bottom-6 left-8 right-8 flex justify-between items-center z-20">
                <div className="flex items-center gap-3">
                    <div className="size-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    <span className="text-[10px] font-black text-white/40 tracking-[0.2em] uppercase">Escaneo Corporal V3.1 - Live</span>
                </div>
                <div className="flex gap-2">
                    <div className="size-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21 21-4.3-4.3" /><circle cx="11" cy="11" r="8" /><path d="m11 8 3 3-3 3" /><path d="M8 11h6" /></svg>
                    </div>
                </div>
            </div>
        </div>
    )
}

const Hotspot = ({ x, y, active, color }: { x: string, y: string, active: boolean, color: 'fuchsia' | 'cyan' }) => {
    const colorHex = color === 'fuchsia' ? '#d946ef' : '#22d3ee'
    const shadowClass = color === 'fuchsia' ? 'shadow-[0_0_15px_rgba(217,70,239,0.5)]' : 'shadow-[0_0_15px_rgba(34,211,238,0.5)]'

    return (
        <motion.div
            style={{ left: x, top: y }}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
            animate={{ scale: active ? 1.2 : 1 }}
        >
            <div className={`size-3 rounded-full border-2 border-white transition-all duration-500 ${active ? 'bg-white' : 'bg-transparent'} ${active ? shadowClass : ''}`} />
            {active && (
                <div
                    className="absolute size-8 rounded-full border-2 animate-ping"
                    style={{ borderColor: colorHex }}
                />
            )}
            <div
                className={`absolute size-5 rounded-full border-2 transition-opacity duration-500 ${active ? 'opacity-100' : 'opacity-0'}`}
                style={{ borderColor: colorHex }}
            />
        </motion.div>
    )
}

export default memo(BodyScan)
