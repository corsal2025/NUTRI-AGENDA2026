# Configuracion de GitHub (sin pegar tokens en chats)

## Recomendado: GitHub CLI

1. Instala `gh` (GitHub CLI).
2. Inicia sesion:

```bash
gh auth login
```

Si no puedes abrir navegador, elige la opcion de **pegar token** en la terminal (no en chats).

### Scopes recomendados

- `repo`
- `workflow`
- `read:org` (solo si tu cuenta trabaja con organizaciones y `gh` te lo pide)

### Verificar

```bash
gh auth status
```

## Alternativas

- Usar SSH: genera llave y configura `git remote set-url origin git@github.com:USER/REPO.git`
- Usar HTTPS + gestor de credenciales (Windows Credential Manager / Git Credential Manager)

## Si un token se filtro

1. Revocalo en GitHub Settings.
2. Crea uno nuevo.
3. Vuelve a autenticar con `gh auth login`.
