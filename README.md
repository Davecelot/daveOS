# daveOS

WebOS 100% cliente con UI estilo Ubuntu (GNOME/Yaru), construido con React, TypeScript y Vite.

## 🚀 Características

- **UI estilo Ubuntu**: TopBar, Dock lateral, Overview con workspaces
- **Window Manager**: Ventanas arrastrables, redimensionables con snap
- **Sistema de Archivos**: IndexedDB con API completa (CRUD, Trash, import/export)
- **Terminal**: xterm.js con shell simulado y comandos Unix-like
- **Apps integradas**: Files, TextEdit, Calculator, Notes, Minesweeper y más
- **PWA**: Instalable y funciona offline
- **Accesibilidad**: Navegación por teclado, ARIA, alto contraste

## 🛠️ Stack Tecnológico

- **Frontend**: React 18 + TypeScript + Vite
- **Estilos**: TailwindCSS con tokens Yaru-like
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

### ✅ Fase 1: Shell Básico - Ubuntu 25.04 UI
- [x] TopBar con Activities, Clock, Quick Settings (36px altura, translúcido)
- [x] Dock lateral con apps ancladas (68px ancho, iconos 48px, indicador naranja)
- [x] Desktop con iconos y shortcuts
- [x] Window Manager con CSD GNOME (HeaderBar, botones circulares)
- [x] Stores de Zustand
- [x] Sistema de theming Yaru (Ubuntu Sans, tokens de color)

### 📋 Fase 2: Sistema de Archivos
- [ ] Schema de Dexie
- [ ] API de FS (CRUD, search, props, trash)
- [ ] Seed de carpetas iniciales
- [ ] Import/Export de archivos
- [ ] Asociaciones MIME

### 💻 Fase 3: Terminal
- [ ] Integración de xterm.js
- [ ] Parser de comandos
- [ ] Comandos FS (ls, cd, cat, etc.)
- [ ] Comandos de sistema (neofetch, top, etc.)
- [ ] Historial y autocompletado

### 📱 Fase 4: Apps Base
- [ ] Files (explorador de archivos)
- [ ] TextEdit (editor de texto/Markdown)
- [ ] Image/Video/Music viewers
- [ ] Calculator
- [ ] Notes
- [ ] Minesweeper

### ⚙️ Fase 5: Apps Avanzadas
- [ ] Calendar con eventos
- [ ] Screenshot con html2canvas
- [ ] System Monitor
- [ ] Settings (preferencias del sistema)
- [ ] Quick Settings y Notificaciones

### 🔧 Fase 6: PWA y Pulidos
- [ ] Service Worker completo
- [ ] Restauración de sesión
- [ ] Accesibilidad completa
- [ ] Optimizaciones de rendimiento

## ⌨️ Atajos de Teclado

- `Super` → Overview
- `Super + 1-9` → Apps ancladas en el dock
- `Alt + Tab` → Cambiar entre ventanas
- `Alt + \`` → Cambiar entre ventanas de la misma app
- `Ctrl + Alt + ←/→` → Cambiar workspace
- `PrtSc` → Screenshot
- `Ctrl + L` → Barra de direcciones (Files)
- `Ctrl + F` → Buscar (Files)

## ✅ Checklist Visual Ubuntu 25.04

### Shell UI Components
- [x] **TopBar (36px)**: Activities, reloj/fecha 24h, indicadores de sistema (Wi-Fi, Bluetooth, sonido, batería), caret para Quick Settings
- [x] **Dock Vertical (68px)**: Iconos 48px centrados, indicador naranja (pill redondeado) para apps activas, tooltips con flecha
- [x] **CalendarPopover**: Grid mensual con mini-eventos, navegación por meses, eventos del día seleccionado
- [x] **Quick Settings**: Panel flotante con tiles y sliders para Wi-Fi, Bluetooth, sonido, brillo, modo oscuro
- [x] **Window CSD**: HeaderBar con gradiente sutil, botones circulares (amarillo/verde/rojo) estilo GNOME

### Visual Design Tokens (Yaru)
- [x] **Colores**: Ubuntu Orange (#E95420), Aubergine (#2C001E, #5E2750, #772953)
- [x] **Fondos**: Light (#F6F4F2), Surface (#FFFFFF, #F2F0EE), Dark (#141414, #1B1B1B, #222222)
- [x] **Tipografía**: Ubuntu Sans (400/500/700), Ubuntu Mono para terminal
- [x] **Sombras**: CSS Shadow (0 8px 24px rgba(0,0,0,.24))
- [x] **Radius**: 12px border-radius estándar

### Interacciones y Animaciones
- [x] **Transiciones suaves**: 200-300ms duration en hover/focus
- [x] **Escalado en hover**: Dock icons con scale-110
- [x] **Focus rings**: Estilo accesible con color accent
- [x] **Backdrop blur**: TopBar y Dock con blur translúcido

## 🎨 Theming

El sistema usa tokens de color inspirados en Ubuntu/Yaru:

- **Colores primarios**: Ubuntu Orange (#E95420), Purple (#772953)
- **Superficie**: Variables CSS para modo claro/oscuro  
- **Tipografía**: Ubuntu Sans y Ubuntu Mono
- **Sombras**: Estilo Ubuntu con múltiples niveles

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

**daveOS** - Un WebOS moderno inspirado en Ubuntu, construido con tecnologías web.
