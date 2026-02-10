-- Habilitar extensiones para UUID y criptografía
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Gestión de Sucursales (Oficinas)
CREATE TABLE sucursales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL, 
    direccion TEXT NOT NULL,
    comuna TEXT DEFAULT 'Valparaíso'
);

-- 2. Perfiles de Usuario (Nutricionista y Pacientes)
CREATE TABLE perfiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    nombre_completo TEXT NOT NULL,
    rut TEXT,
    telefono TEXT,
    rol TEXT CHECK (rol IN ('admin', 'paciente')) DEFAULT 'paciente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Disponibilidad Semanal de la Nutricionista
CREATE TABLE disponibilidad_maestra (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dia_semana INT CHECK (dia_semana BETWEEN 0 AND 6), -- 0=Domingo
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    id_sucursal UUID REFERENCES sucursales(id),
    cupos_por_bloque INT DEFAULT 1
);

-- 4. Reservas y Pagos (Integración Mercado Pago)
CREATE TABLE citas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_paciente UUID REFERENCES perfiles(id),
    id_sucursal UUID REFERENCES sucursales(id),
    fecha_cita DATE NOT NULL,
    hora_cita TIME NOT NULL,
    estado_pago TEXT CHECK (estado_pago IN ('pendiente', 'pagado', 'reembolsado')) DEFAULT 'pendiente',
    id_preferencia_mp TEXT, -- ID generado para el checkout
    monto_total DECIMAL(10,2),
    link_reunion TEXT, -- En caso de ser telemedicina o info adicional
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Ficha Clínica y Métricas (Antropometría)
CREATE TABLE evaluaciones_nutricionales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_paciente UUID REFERENCES perfiles(id),
    peso_kg DECIMAL(5,2),
    talla_cm DECIMAL(5,2),
    imc DECIMAL(4,2),
    porcentaje_grasa DECIMAL(4,2),
    masa_muscular_kg DECIMAL(5,2),
    grasa_visceral INT,
    circunferencia_cintura DECIMAL(5,2),
    observaciones TEXT,
    url_informe_pdf TEXT, -- Ruta en Supabase Storage
    fecha_evaluacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
