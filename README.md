# ⚡ GameNotion — Workspace & Game Design Companion

GameNotion is a high-fidelity, web-based workspace companion and game design dashboard tailored for Game Dev projects. Built with a stunning dark-mode glassmorphic interface, it integrates tools for game direction, asset management, state tracking, and narrative mapping in a single unified cockpit.

---


## 🛠️ Main Feature Suites

### 1. 🎛️ Workspace Dashboard
The central terminal highlighting active sprint progress, critical bug tickets, asset registry status, and level building percentages. Features dynamic glowing charts and interactive task highlights.

### 2. 📝 Game Design Document (GDD) Editor
A full-featured rich text workspace utilizing the **TipTap** editor. Persists Game Concepts, Pillars, and Core Mechanics directly to local storage with immediate updates.

### 3. 📋 Sprint Kanban Board
An interactive Kanban board leveraging `@dnd-kit` for drag-and-drop task lifecycle management (Backlog, In Progress, Under Review, and Complete). Tracks assignees, task priorities (Critical, High, Medium, Low), and tags.

### 4. 📦 Asset Manager
An index of your game engine assets (meshes, blueprints, textures, audio, animations, Niagara VFX systems). Highlights Nanite integration, polygon counts, asset owners, file sizes, and status.

### 5. 🐛 Bug Tracker
A priority-sorted QA logs database. Allows team members to file tickets with reproduction steps, system tags, and assignee designations.

### 6. 🌐 Creative & Technical Companions
* **World Building Logs**: Categorized databases of biomes, lore records, and factions.
* **Character Profile Directories**: Rich bio sheets for protagonists, antagonists, and companion NPCs with assigned avatar artwork and faction affinity grids.
* **Level Design**: Details stage progression, whitebox metrics, actor counts, and level designer allocations.
* **Tech Stack**: Maps engine specifications, compiler versions, target console platform SDKs (PS5, Xbox Series X/S, PC), and middleware modules.
* **Milestones**: A historical timeline track of alpha releases, vertical slices, and publisher signoffs.
* **Team Directory**: Integrated member statuses, department roles, skill sets, and local timezone readouts.

---

## 🏗️ Architecture & Stack

GameNotion is designed as a modular SPA leveraging modern React patterns and decoupled stores:

```
src/
├── components/          # Reusable UI & Layout Components
│   ├── layout/          # Layout structures (Sidebar, Topbar, Layout, Onboarding)
│   └── ui/              # Atom level items (Buttons, Badges, Modals)
├── lib/                 # Shared libraries (Toast configurations, helper scripts)
├── pages/               # Feature suite views (Dashboard, GDD, Sprints, Assets, Bugs, etc.)
├── store/               # Zustand state stores with localStorage persistence
└── styles/              # Global CSS, variables, themes, and design tokens
```

* **Framework**: React 18 & Vite
* **State Management**: Zustand (stores are localized and persisted, e.g., `useAppStore` for global status/onboarding, `useTaskStore` for sprints, `useBugStore` for QA).
* **Styling**: Vanilla CSS Modules (scoped layouts, customizable utility design tokens in `globals.css`).
* **Routing**: React Router DOM v7
* **Rich Text**: TipTap React Starter Kit

---

## 🚀 Running the Workspace Locally

Follow these quick commands to spin up the local development suite or compile the production release:

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+ recommended)
* `npm` or `yarn`

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
Spins up a local server with Fast Refresh (HMR):
```bash
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your web browser.

### 3. Build for Production
Compiles minified production-ready assets into the `dist/` directory:
```bash
npm run build
```

### 4. Preview Build
Locally preview the compiled production distribution:
```bash
npm run preview
```
