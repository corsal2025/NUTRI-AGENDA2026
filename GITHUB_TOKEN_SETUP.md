# 🔐 Configuración de Token de GitHub

## Paso 1: Generar Token Personal

1. **Ve a GitHub Settings:**
   - Abre: https://github.com/settings/tokens
   - O navega manualmente: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)

2. **Genera Nuevo Token:**
   - Click en **"Generate new token (classic)"**
   - Dale un nombre descriptivo: `nutri-agenda-laptop` o `workspace-token`

3. **Selecciona Permisos (Scopes):**
   ✅ Marca las siguientes casillas:
   - **repo** (full control of private repositories)
     - repo:status
     - repo_deployment
     - public_repo
     - repo:invite
     - security_events
   - **workflow** (Update GitHub Action workflows)
   
4. **Expiration:**
   - Selecciona: **No expiration** (recomendado para desarrollo personal)
   - O: **90 days** (más seguro, tendrás que renovarlo)

5. **Genera el Token:**
   - Click en **"Generate token"**
   - ⚠️ **IMPORTANTE:** Copia el token INMEDIATAMENTE
   - Se verá así: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - **NO podrás volver a verlo después**

## Paso 2: Configurar Git con el Token

Una vez tengas el token, ejecutaremos:

```bash
# Configurar Git para usar el token
git remote set-url origin https://TU_TOKEN@github.com/corsal2025/nutri-agenda.git

# O si prefieres que te pida el token una sola vez:
git config --global credential.helper store
git push origin main
# Te pedirá username: corsal2025
# Te pedirá password: [pega tu token aquí]
```

## Paso 3: Verificar

```bash
# Intentar push
git push origin main

# Si funciona, verás:
# Enumerating objects: 79, done.
# Counting objects: 100% (79/79), done.
# ...
# To https://github.com/corsal2025/nutri-agenda.git
#    abc1234..5ab97bb  main -> main
```

## 🚨 Seguridad del Token

- **NO compartas el token** en código, screenshots, o mensajes públicos
- Guárdalo en un lugar seguro (Gestor de contraseñas)
- Si se filtra, revócalo inmediatamente en GitHub Settings
- Úsalo solo en tu máquina personal

---

## 📋 Checklist Rápido

- [ ] Ir a https://github.com/settings/tokens
- [ ] Click "Generate new token (classic)"
- [ ] Marcar: repo, workflow
- [ ] Click "Generate token"
- [ ] Copiar token (ghp_...)
- [ ] Pegar token cuando te lo pida el agente

---

**¿Listo?** Cuando tengas el token, pégalo aquí y lo configuraré automáticamente.
