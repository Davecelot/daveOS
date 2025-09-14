## 🖼️ Iconos y Licencias

Este proyecto integra un sistema de iconografía estilo Windows XP.

- Los íconos principales provienen de `WinXP-icon-theme` (GPL-2.0, assets solamente) y se ubican en `public/icons/xp/`.
- Íconos de fallback opcional (CC0, dominio público) se ubican en `public/icons/xp-cc0/`.
- El código del proyecto mantiene su propia licencia; los archivos de íconos conservan las suyas.

Créditos y licencias:

- WinXP-icon-theme — GPL-2.0 (icons only). Fuente: https://github.com/PonyRoleplayer/WinXP-icon-theme
- Windows XP High Resolution Icon Pack — CC0. Fuente: https://github.com/marchmountain/-Windows-XP-High-Resolution-Icon-Pack

Ver `public/icons/CREDITS.md` y los LICENSE dentro de cada pack para más detalles.

# daveOS XP Mode

WebOS 100% cliente con UI estilo Windows XP (tema Luna Blue), construido con React, TypeScript y Vite.

## 🚀 Características

- **UI estilo Windows XP Luna Blue**: Taskbar, Start Menu, ventanas con gradientes
- **Window Manager**: Ventanas arrastrables, redimensionables, cascada/tiling
- **Sistema de Archivos**: IndexedDB con API completa (CRUD, Recycle Bin, import/export)
- **Terminal**: terminal simple con comandos DOS-like (y soporte futuro para xterm)
- **Apps integradas**: Explorer, Notepad, Paint, Calculator, Minesweeper y más
- **PWA**: Instalable y funciona offline
- **Accesibilidad**: Navegación por teclado, ARIA, alto contraste

## 🛠️ Stack Tecnológico

- **Frontend**: React 18 + TypeScript + Vite
- **Estilos**: TailwindCSS con tokens Windows XP Luna
- **Estado**: Zustand
- **Base de Datos**: Dexie (IndexedDB)
- **Terminal**: xterm.js
- **PWA**: Vite PWA Plugin
- **Testing**: Vitest
- **Linting**: ESLint + Prettier + Husky

## 📦 Scripts

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo
npm run build        # Build para producción
npm run preview      # Preview del build

# Calidad de código
npm run lint         # Ejecuta ESLint
npm run lint:fix     # Corrige errores de ESLint
npm run format       # Formatea código con Prettier

# Testing
npm run test         # Ejecuta tests
npm run test:ui      # Ejecuta tests con UI
```

## 🏗️ Estructura del Proyecto

```
daveOS/
├── public/
│   ├── icons/           # PWA + iconos del sistema
│   └── wallpapers/      # Fondos de pantalla
├── src/
│   ├── main.tsx         # Punto de entrada
│   ├── app.tsx          # Componente principal
│   ├── styles/
│   │   ├── tailwind.css # Estilos base de Tailwind
│   │   └── theme.css    # Tokens de tema Yaru-like
│   ├── system/
│   │   ├── store/       # Stores de Zustand
│   │   ├── wm/          # Window Manager
│   │   ├── shell/       # Terminal y comandos
│   │   ├── fs/          # Sistema de archivos
│   │   ├── ui/          # Componentes de UI del sistema
│   │   └── apps/        # Aplicaciones integradas
│   ├── config/          # Configuración PWA y shortcuts
│   └── utils/           # Utilidades compartidas
```

## 🎯 Roadmap de Desarrollo

### ✅ Fase 0: Scaffold
- [x] Configuración de proyecto (Vite, TypeScript, Tailwind)
- [x] ESLint, Prettier, Husky
- [x] PWA básico
- [x] Estructura de carpetas

### ✅ Fase 1: Shell XP
- [x] Taskbar con botón Start, Quick Launch, System Tray (32px altura)
- [x] Start Menu de dos columnas estilo XP
- [x] Desktop con iconos XP (My Computer, My Documents, Recycle Bin)
- [x] Window Manager con chrome XP (titlebar con gradiente, botones min/max/close)
- [x] Stores de Zustand
- [x] Sistema de theming Luna Blue (Tahoma, gradientes y tokens XP)

### 📋 Fase 2: Sistema de Archivos
- [ ] Schema de Dexie
- [ ] API de FS (CRUD, search, props, trash)
- [ ] Seed de carpetas iniciales
- [ ] Import/Export de archivos
- [ ] Asociaciones MIME

### 💻 Fase 3: CMD
- [ ] Integración de xterm.js
- [ ] Parser de comandos
- [x] Comando VER con banner ASCII de daveOS
- [ ] Comandos FS (DIR, CD, TYPE, COPY, MOVE, DEL, etc.)
- [ ] Comandos de sistema (DATE, TIME, HELP, etc.)
- [ ] Historial y autocompletado

### 📱 Fase 4: Apps Base
- [ ] Explorer (explorador de archivos estilo XP)
- [ ] Notepad (editor de texto)
- [ ] Paint (editor de imágenes 2D)
- [ ] Windows Media Player
- [ ] Calculator
- [ ] Minesweeper y Solitaire

### ⚙️ Fase 5: Apps Avanzadas
- [ ] Control Panel (categorías XP)
- [ ] Task Manager
- [ ] Run dialog (Win+R)
- [ ] System Properties
- [ ] Date and Time settings

### 🔧 Fase 6: PWA y Pulidos
- [ ] Service Worker completo
- [ ] Restauración de sesión
- [ ] Accesibilidad completa
- [ ] Optimizaciones de rendimiento

## ⌨️ Atajos de Teclado

- `Win` → Start Menu
- `Win + E` → My Computer
- `Win + D` → Show Desktop
- `Win + R` → Run dialog
- `Alt + Tab` → Cambiar entre ventanas
- `F2` → Renombrar archivo
- `Del` → Enviar a Recycle Bin
- `Shift + Del` → Borrar permanentemente
- `Ctrl + C/V/X` → Copiar/Pegar/Cortar
- `Ctrl + F` → Buscar (Explorer)

## ✅ Checklist Visual Windows XP Luna Blue

### Shell UI Components
- [x] **Taskbar (32px)**: Botón Start verde con gradiente, Quick Launch, botones de ventana, System Tray con reloj
- [x] **Start Menu**: Dos columnas (apps frecuentes | accesos sistema), header con usuario, footer con Log Off/Turn Off
- [x] **Desktop**: Iconos alineados (My Computer, My Documents, Recycle Bin, My Network Places)
- [x] **Window Chrome**: Titlebar con gradiente azul, botones [_][□][X], bordes 3D, sombra
- [ ] **Explorer**: Vistas Icons/List/Details, toolbar, panel Tasks lateral, barra de direcciones

### Visual Design Tokens (Luna Blue)
- [x] **Titlebar activo**: Gradiente #3A6EA5 → #4F8AD9 → #9DB9EB
- [x] **Titlebar inactivo**: Gradiente #7F9DB9 → #BCCADF
- [x] **Taskbar**: Gradiente #3B6EA5 → #245EDB
- [x] **Start button**: Gradiente verde #7DBE45 → #37A243 → #1E8F2F
- [x] **Superficies**: #FFFFFF (ventanas), #EDF0F5 (fondos), #FFFDF4 (menús)
- [x] **Tipografía**: Tahoma 11px UI, Lucida Console para CMD
- [x] **Botones 3D**: Bevel con highlight/shadow (#FFFFFF/#A0A0A0)
- [x] **Sombras**: 0 10px 24px rgba(0,0,0,0.25)

### Interacciones XP
- [x] **Hover amarillo**: #FFF1A8 en menús y listas
- [x] **Selección azul**: #316AC5 con texto blanco
- [x] **Botones pressed**: Inversión de bevel (inset)
- [ ] **Animaciones mínimas**: Solo transiciones básicas
- [ ] **Tooltips**: Fondo crema con borde negro
- [ ] **Context menus**: Fondo blanco con sombra

## 🎨 Theming

El sistema usa tokens de color del tema Windows XP Luna Blue:

- **Colores primarios**: Luna Blue (#316AC5), Start Green (#37A243)
- **Gradientes**: Titlebar activo/inactivo, taskbar, botones
- **Tipografía**: Tahoma para UI, Lucida Console para CMD
- **Efectos 3D**: Bordes bevel, sombras, highlight/shadow

## 🔧 Configuración de Desarrollo

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Iniciar desarrollo**:
   ```bash
   npm run dev
   ```

3. **Configurar Husky** (primera vez):
   ```bash
   npm run prepare
   ```

## 🚀 Deployment

### Netlify (Recomendado)
daveOS está configurado para deployment automático en Netlify:

1. **Fork el repositorio** en tu cuenta de GitHub
2. **Conecta con Netlify**: [netlify.com](https://netlify.com) → "New site from Git"
3. **Configurar el site**:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18`
4. **Deploy automático**: Cada push a `master` despliega automáticamente

### Variables de Entorno (GitHub Secrets)
Para GitHub Actions, configurar:
```
NETLIFY_SITE_ID=tu-site-id
NETLIFY_AUTH_TOKEN=tu-auth-token
```

### URLs de Ejemplo
- 🌐 **Producción**: `https://daveos.netlify.app`
- 🔍 **Preview**: Automático en cada PR

## 📱 PWA

La aplicación es una PWA completa:
- Instalable en escritorio y móvil
- Funciona offline
- Service Worker con cache inteligente
- Manifest con iconos y configuración
- Cache de Google Fonts automático

## 🧪 Testing

Tests con Vitest para:
- Comandos del shell
- API del sistema de archivos
- Componentes críticos
- Utilidades

## 📄 Licencia

MIT License - Ver archivo LICENSE para más detalles.

---

**daveOS XP Mode** - Un WebOS nostálgico con UI Windows XP Luna, construido con tecnologías web modernas.

## 🎯 Definición de Completado (Windows XP)

- ✅ Start/Taskbar/QuickLaunch/Tray replican layout/estados XP
- ✅ Ventanas con titlebar degradada, botones y bordes XP
- ✅ Desktop con iconos clásicos XP
- ✅ Comando `ver` muestra banner ASCII de daveOS
- ⏳ Explorer con vistas y panel Tasks
- ⏳ Alt+Tab + Cascade/Tile operativos
- ⏳ FS CRUD + Recycle Bin + import/export
- ⏳ CMD funcional con comandos DOS
- ⏳ PWA instalable y usable offline
