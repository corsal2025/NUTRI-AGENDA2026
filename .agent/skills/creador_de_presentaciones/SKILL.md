---
name: creador_de_presentaciones
description: Crea presentaciones visuales para Google Slides basadas en una entrada de blog.
---

# Creador de Presentaciones

Esta habilidad transforma el contenido de un blog post o texto largo en una estructura de presentación para Google Slides, enfocándose en el impacto visual.

## Instrucciones

1.  **Obtener Contenido**:
    *   Solicita al usuario la URL del blog post o el texto base.
    *   Si es una URL, usa `read_url_content` o `search_web` para obtener el texto.

2.  **Analizar y Estructurar**:
    *   Identifica los puntos clave, títulos y subtítulos del contenido.
    *   Divide el contenido en diapositivas lógicas (aprox. 1 tema por diapositiva).

3.  **Generar Estructura de Diapositivas**:
    Para cada diapositiva, genera la siguiente información:
    *   **Título**: Atractivo y conciso.
    *   **Texto Principal**: Bullet points resumidos (evita párrafos largos).
    *   **Notas del Orador**: Detalles adicionales para quien presenta.
    *   **Sugerencia Visual**:
        *   Describe qué imagen, gráfico o diagrama debería ir en la diapositiva.
        *   Sugiere un layout (ej: "Texto a la izquierda, imagen grande a la derecha", "Título centrado con fondo de imagen").
        *   Propón un estilo visual (ej: "Minimalista, colores corporativos", "Dinámico con iconos").

4.  **Formato de Salida**:
    Presenta el resultado en un formato Markdown claro, listo para ser copiado a Google Slides o usado como guion.

    ```markdown
    ## Diapositiva 1: [Título]
    - Punto 1
    - Punto 2
    *Visual*: [Descripción de imagen/layout]
    *Notas*: [Texto para el orador]
    ```
