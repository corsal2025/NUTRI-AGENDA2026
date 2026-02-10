---
name: scraper_reddit
description: Rastrea y resume las 5 mejores publicaciones de un subreddit.
---

# Scraper de Reddit

Esta habilidad obtiene las publicaciones más populares de un subreddit específico y presenta un resumen.

## Instrucciones

1.  **Identificar Subreddit**:
    *   Identifica el subreddit o tema que el usuario quiere investigar.

2.  **Buscar Publicaciones**:
    *   Usa `search_web` con una consulta como: `site:reddit.com/r/[subreddit] top posts this month` o `best posts subreddit [tema]`.
    *   Opcionalmente, usa `read_url_content` si tienes una URL específica de listado (ten en cuenta las limitaciones de scraping directo, prefiere búsqueda si falla).

3.  **Extraer Información (Top 5)**:
    Para cada una de las 5 mejores publicaciones encontradas:
    *   **Título**: El titular del post.
    *   **Enlace**: URL directa al post.
    *   **Resumen/Contenido**: Breve descripción de qué trata o por qué es popular (basado en el snippet de búsqueda o contenido leído).
    *   **Puntos Clave**: Si es posible, extrae 2-3 puntos clave o reacciones principales.

4.  **Presentar Resultados**:
    Muestra la lista de los 5 posts en formato Markdown.

    ```markdown
    ### 1. [Título del Post](URL)
    *Resumen*: ...
    ```
