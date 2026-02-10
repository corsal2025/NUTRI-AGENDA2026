---
name: creador_de_habilidades
description: Crea nuevas habilidades para el agente en el formato correcto (YAML + Markdown).
---

# Creador de Habilidades

Esta habilidad te permite crear nuevas habilidades para el agente de manera estructurada y correcta.

## Instrucciones

1.  **Analizar la Solicitud**:
    *   Identifica el propósito de la nueva habilidad que el usuario quiere crear.
    *   Determina el nombre de la habilidad (debe ser breve y descriptivo, ej: `mi_habilidad`).
    *   Redacta una descripción clara en el frontmatter YAML.

2.  **Estructura del Archivo `SKILL.md`**:
    *   El archivo debe comenzar con un bloque YAML frontmatter:
        ```yaml
        ---
        name: nombre_de_la_habilidad
        description: Breve descripción de lo que hace.
        ---
        ```
    *   A continuación, debe incluir instrucciones Markdown detalladas.
    *   Usa encabezados, listas y bloques de código para organizar las instrucciones.

3.  **Generación del Contenido**:
    *   Crea el contenido del archivo `SKILL.md` basándote en la solicitud del usuario.
    *   Asegúrate de incluir pasos claros y acciones específicas que el agente debe realizar.
    *   Si la habilidad requiere herramientas específicas (ej: `search_web`, `read_url_content`), menciónalas en las instrucciones.

4.  **Guardar la Habilidad**:
    *   Indica al usuario que guardarás el archivo en la ruta correct: `.agent/skills/<nombre_carpeta>/SKILL.md`.
    *   Crea la carpeta y el archivo.
