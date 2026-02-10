---
name: explorador_habilidades_awesome
description: Busca y recomienda habilidades del repositorio 'awesome-agentic-skills'.
---

# Explorador de Habilidades (Awesome)

Esta habilidad ayuda a encontrar nuevas capacidades para el agente buscando en el repositorio de referencia.

## Instrucciones

1.  **Contexto**:
    *   El usuario busca nuevas habilidades o inspiraciones.
    *   Fuente: [GitHub - sickn33/antigravity-awesome-skills](https://github.com/sickn33/antigravity-awesome-skills)

2.  **Búsqueda**:
    *   Usa `search_web` para buscar habilidades específicas dentro de ese repositorio o relacionadas.
    *   Ejemplo de query: `site:github.com/sickn33/antigravity-awesome-skills "marketing"` o `awesome agentic skills "coding"`.

3.  **Recomendación**:
    *   Presenta las habilidades encontradas con su nombre y descripción.
    *   Si es posible, extrae el enlace directo al archivo `SKILL.md` o carpeta en GitHub.
    *   Sugiere cómo adaptar esa habilidad al agente actual (usando la habilidad `creador_de_habilidades`).
