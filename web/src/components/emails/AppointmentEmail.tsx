import * as React from 'react';
import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Text,
    Section,
    Row,
    Column,
    Img,
} from '@react-email/components';

interface AppointmentEmailProps {
    patientName: string;
    date: string;
    time: string;
    type: string;
}

export const AppointmentEmail = ({
    patientName,
    date,
    time,
    type,
}: AppointmentEmailProps) => (
    <Html>
        <Head />
        <Preview>Confirmación de Cita - NutriAgenda</Preview>
        <Body style={main}>
            <Container style={container}>
                <Section style={header}>
                    <Heading style={h1}>Confirmación de Cita</Heading>
                </Section>
                <Section style={body}>
                    <Text style={text}>Hola <strong>{patientName}</strong>,</Text>
                    <Text style={text}>
                        Tu cita ha sido agendada exitosamente. Aquí están los detalles:
                    </Text>

                    <Section style={infoBox}>
                        <Row>
                            <Column>
                                <Text style={label}>Fecha:</Text>
                                <Text style={value}>{date}</Text>
                            </Column>
                            <Column>
                                <Text style={label}>Hora:</Text>
                                <Text style={value}>{time}</Text>
                            </Column>
                        </Row>
                        <Row>
                            <Column>
                                <Text style={label}>Tipo:</Text>
                                <Text style={value}>{type}</Text>
                            </Column>
                        </Row>
                    </Section>

                    <Text style={text}>
                        Si necesitas reagendar, por favor contáctanos con al menos 24 horas de anticipación.
                    </Text>
                    <Text style={text}>
                        ¡Nos vemos pronto!
                    </Text>
                </Section>
                <Section style={footer}>
                    <Text style={footerText}>NutriAgenda - Verónica Amaya</Text>
                </Section>
            </Container>
        </Body>
    </Html>
);

const main = {
    backgroundColor: '#fdf4ff',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px 0 48px',
    marginBottom: '64px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
    maxWidth: '580px',
};

const header = {
    padding: '32px',
    textAlign: 'center' as const,
    backgroundColor: '#c026d3',
    borderRadius: '12px 12px 0 0',
};

const h1 = {
    color: '#ffffff',
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    margin: '0',
};

const body = {
    padding: '32px',
};

const text = {
    color: '#333',
    fontSize: '16px',
    lineHeight: '26px',
};

const infoBox = {
    backgroundColor: '#f8fafc',
    padding: '24px',
    borderRadius: '8px',
    margin: '24px 0',
};

const label = {
    color: '#64748b',
    fontSize: '12px',
    textTransform: 'uppercase' as const,
    fontWeight: 'bold',
    marginBottom: '4px',
};

const value = {
    color: '#0f172a',
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '16px',
};

const footer = {
    padding: '0 32px',
    textAlign: 'center' as const,
};

const footerText = {
    color: '#8898aa',
    fontSize: '12px',
};

export default AppointmentEmail;
