---
name: analista_notebooklm
description: Utiliza NotebookLM para análisis estratégicos (ej: Marca Personal).
---

# Analista NotebookLM

Esta habilidad utiliza las capacidades de NotebookLM (vía MCP) para realizar análisis profundos de documentos y estrategias, con un enfoque en Marca Personal.

## Instrucciones

1.  **Preparación**:
    *   Verificar si hay un cuaderno (notebook) existente en NotebookLM relacionado con el tema.
    *   Si no, instruir al usuario para crear uno o subir las fuentes necesarias (PDFs, docs de estrategia, tendencias).
    *   Usa las herramientas de `notebooklm_mcp` si están disponibles para consultar documentos.

2.  **Análisis de Estrategia (Marca Personal)**:
    Si el objetivo es marca personal, realiza las siguientes consultas a las fuentes:
    *   "¿Cuáles son los segmentos de audiencia clave identificados?"
    *   "¿Cuáles son los diferenciadores únicos y el tono de voz sugerido?"
    *   "Identifica canales ideales y tendencias actuales en el nicho."
    *   "Resume casos de éxito mencionados."

3.  **Creación de Instrucción para Asesor**:
    Basado en el análisis, redacta un "Prompt de Sistema" o "Perfil de Agente" para un Asesor Estratégico.
    *   **Rol**: Asesor de Marca Personal.
    *   **Conocimiento Base**: (Los insights extraídos del paso 2).
    *   **Tono**: (El tono definido en la estrategia).
    *   **Objetivo**: Guiar al usuario en la construcción de su marca.

4.  **Salida**:
    Entrega el análisis completo y el prompt del asesor listo para usar.
