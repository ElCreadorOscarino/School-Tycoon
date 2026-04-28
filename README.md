<div align="center">

# 🏫 School Tycoon

### Simulación de Gestión Escolar

**Construye, gestiona y haz crecer tu propia escuela privada.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com)

Juego de simulación tycoon completo con **IA integrada**, **123+ eventos dinámicos** y **música procedural generada en tiempo real**.

[🎮 Jugar Ahora](#) · [🚀 Instalación](#-instalación-local) · [☁️ Desplegar](#-despliegue-en-vercel--gratis-) · [📖 Changelog](#-versiones)

</div>

---

## 📸 Vista Previa

> 🎨 Estética terminal/neon con tema oscuro, partículas flotantes, audio procedural y diseño responsivo.

---

## ✨ Características

### 🏗️ Configuración Escolar Completa
- **14 pantallas de configuración**: perfil, edificio, oficinas, aulas, baños, cafetería, tecnología, servicios, reglas, profesores, calendario, estudiantes y revisión
- **Aprobación del Ministerio de Educación** generada por IA en tiempo real
- **Sistema de reputación** calculado automáticamente según tus decisiones de diseño

### 🎮 Gameplay Profundo
- **Simulación por semanas** con 3 velocidades (normal, rápida, turbo)
- **123+ eventos escolares**: inspecciones ministeriales, festivales, conflictos, donaciones, desastres naturales y más
- **Eventos generados por IA**: cada evento es único y contextual al estado de tu escuela
- **17+ logros desbloqueables** con recompensas de dinero y reputación
- **Clima dinámico** con 4 estaciones que afectan el gameplay
- **Rivales escolares** — compite contra otras escuelas por el #1
- **Dificultad progresiva** — los gastos aumentan cuanto más sobrevives
- **Sistema de préstamos y marketing** para hacer crecer tu escuela

### 📊 Dashboard con 27 Pestañas
| Categoría | Pestañas |
|---|---|
| 📈 General | Resumen, Eventos, Clima, Noticias |
| 💰 Finanzas | Finanzas, Préstamos, Marketing, Tienda |
| 👥 Personas | Profesores, Estudiantes, Personal, Padres |
| 🏫 Campus | Edificio, Transporte, Campus, Decoración |
| 🧠 Avanzado | IA Asesora, Habilidades, Logros, Desafíos, Récords |
| 🎯 Social | Rivales, Decisiones, Alumni |
| 🎪 Entretenimiento | **4 minijuegos** integrados |

### 🎮 Minijuegos Integrados
- 🧮 **Quiz de Matemáticas** — gana dinero por cada respuesta correcta
- 🧠 **Trivia Cultural** — pon a prueba tus conocimientos
- 🔤 **Sopa de Letras** — encuentra palabras ocultas
- 🃏 **Memoria** — juego de pares con recompensas

### 🤖 IA Integrada con Z.ai
- Generación de **profesores** con personalidad, especialidad y calidad únicas
- Generación de **estudiantes** con habilidades variadas
- **Eventos dinámicos** contextuales según reputación, dinero y satisfacción
- **Asesoramiento escolar** inteligente
- **Revisión del Ministerio** generada al abrir la escuela

### 🎨 Estilo Visual Premium
- Estética **terminal/neon** con tema oscuro (#050508)
- Partículas flotantes animadas
- Audio procedural (música chiptune + 28 efectos de sonido)
- Cursores personalizados con glow
- Animaciones suaves y transiciones
- 100% responsivo (móvil y escritorio)

---

## 🛠️ Stack Tecnológico

| Tecnología | Versión | Uso |
|---|:---:|---|
| ![Next.js](https://img.shields.io/badge/-Next.js-black?logo=next.js) | 16 | Framework principal |
| ![React](https://img.shields.io/badge/-React-61DAFB?logo=react) | 19 | UI Components |
| ![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white) | 5 | Tipado estático |
| ![Tailwind](https://img.shields.io/badge/-Tailwind-06B6D4?logo=tailwindcss&logoColor=white) | 4 | Estilos |
| ![Zustand](https://img.shields.io/badge/-Zustand-orange) | 5 | Estado global |
| ![Z.ai](https://img.shields.io/badge/-Z.ai-00ff88) | SDK | Integración de IA |
| Web Audio API | — | Música + SFX procedural |

---

## 🚀 Instalación Local

### Requisitos
- [Node.js](https://nodejs.org/) 18+ 
- npm o bun

### Pasos

```bash
# 1. Clona el repositorio
git clone https://github.com/ElCreadorOscarino/School-Tycoon.git

# 2. Entra a la carpeta
cd School-Tycoon

# 3. Instala las dependencias
npm install

# 4. Inicia el servidor de desarrollo
npm run dev
```

Abre **http://localhost:3000** en tu navegador. ¡A jugar! 🎮

---

## ☁️ Despliegue en Vercel (100% Gratis)

<details>
<summary>📖 Haga clic aquí para ver las instrucciones</summary>

1. Ve a [vercel.com](https://vercel.com) y créate una cuenta con GitHub
2. Haz clic en **"Add New → Project"**
3. Selecciona tu repositorio `School-Tycoon`
4. **No cambies nada** — Vercel detecta Next.js automáticamente
5. Haz clic en **"Deploy"**
6. ¡Espera ~2 minutos y listo! Recibirás una URL pública 🎉

```
https://school-tycoon-xxxx.vercel.app
```

> 💡 **Tip**: Vercel es completamente gratis para proyectos personales. 100GB de ancho de banda/mes, builds ilimitados y SSL incluido.

</details>

---

## 📁 Estructura del Proyecto

```
School-Tycoon/
├── 📂 src/
│   ├── 📂 app/
│   │   ├── 📄 page.tsx                 # Página principal + router
│   │   ├── 📄 layout.tsx               # Layout con fuentes y metadata
│   │   ├── 🎨 globals.css              # Estilos globales + tema terminal
│   │   └── 📂 api/
│   │       ├── 📄 ai/route.ts          # API de IA (chat completions)
│   │       └── 📄 ai/events/route.ts   # API de generación de eventos
│   ├── 📂 components/
│   │   ├── 📂 game/                    # 15 pantallas del juego
│   │   │   ├── 📄 DashboardScreen.tsx  # Dashboard principal
│   │   │   ├── 📂 tabs/                # 27 pestañas del dashboard
│   │   │   └── 📂 hooks/               # Hooks personalizados
│   │   ├── 📂 ui/                      # Componentes shadcn/ui
│   │   └── 📄 ErrorBoundary.tsx        # Capturador de errores
│   ├── 📂 lib/
│   │   ├── 📄 game-store.ts            # Estado global (Zustand, 2400+ líneas)
│   │   ├── 📄 game-types.ts            # Tipos y constantes
│   │   ├── 📄 event-pool.ts            # Pool de 123+ eventos
│   │   ├── 📄 sounds.ts               # Motor de SFX (28 sonidos)
│   │   ├── 📄 music.ts                # Motor de música (5 tracks)
│   │   ├── 📄 weather-system.ts        # Sistema de clima
│   │   └── 📄 school-rivals.ts         # Sistema de rivales
│   └── 📂 hooks/
│       ├── 📄 use-toast.ts             # Sistema de notificaciones
│       └── 📄 use-mobile.ts            # Detección de móvil
├── 📂 public/                          # Archivos estáticos
├── 📄 package.json
├── 📄 next.config.ts
├── 📄 tsconfig.json
└── 📄 README.md
```

---

## 🎮 Controles

| Tecla | Acción |
|:---:|---|
| `Espacio` | ⏸️ Pausar / ▶️ Reanudar |
| `1` | 🐢 Velocidad normal |
| `2` | 🏃 Velocidad rápida (5x) |
| `3` | 🚀 Velocidad turbo (50x) |
| `M` | 🔇 Silenciar música |
| `S` | 🔇 Silenciar sonidos |

---

## 📊 Estadísticas del Proyecto

| Métrica | Cantidad |
|---|:---:|
| Pantallas del juego | 15 |
| Pestañas del dashboard | 27 |
| Eventos escolares | 123+ |
| Logros desbloqueables | 17+ |
| Efectos de sonido | 28 |
| Tracks de música | 5 |
| Minijuegos | 4 |
| Líneas de código | ~15,000+ |

---

## 🔄 Versiones

### v1.0.0 — Lanzamiento Inicial
- ✅ 14 pantallas de configuración escolar
- ✅ 27 pestañas de dashboard
- ✅ 123+ eventos escolares
- ✅ IA integrada con Z.ai
- ✅ Música y efectos de sonido procedurales
- ✅ 4 minijuegos integrados
- ✅ Sistema de clima y estaciones
- ✅ Rivales escolares
- ✅ Diseño responsivo

---

## 👨‍💻 Autor

<div align="center">

**El Creador Oscarino**

[![GitHub](https://img.shields.io/badge/-ElCreadorOscarino-181717?style=flat-square&logo=github)](https://github.com/ElCreadorOscarino)

> Desarrollador independiente apasionado por crear juegos y experiencias interactivas.

🎮 [TheImpostorGame](https://github.com/ElCreadorOscarino/TheImpostorGame) · 🏫 School Tycoon

</div>

---

## 📜 Licencia

Este proyecto está bajo la licencia **MIT**. Usa el código como quieras. ¡Diviértete!

---

<div align="center">

**Hecho con 💚 por El Creador Oscarino**

© 2025 School Tycoon. Todos los derechos reservados.

</div>
