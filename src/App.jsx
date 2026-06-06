import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { OnboardingWizard } from './components/layout/Onboarding';
import { ToastProvider } from './lib/toast';
import { useAppStore } from './store';

// Pages
import Dashboard from './pages/Dashboard/Dashboard';
import GDD from './pages/GDD/GDD';
import SprintBoard from './pages/SprintBoard/SprintBoard';
import AssetManager from './pages/AssetManager/AssetManager';
import BugTracker from './pages/BugTracker/BugTracker';
import WorldBuilding from './pages/WorldBuilding/WorldBuilding';
import Characters from './pages/Characters/Characters';
import LevelDesign from './pages/LevelDesign/LevelDesign';
import TechStack from './pages/TechStack/TechStack';
import Milestones from './pages/Milestones/Milestones';
import Team from './pages/Team/Team';

import './styles/globals.css';

function AppShell() {
  const onboardingDone = useAppStore(s => s.onboardingDone);

  return (
    <>
      <div className="cyber-ambient-glow">
        <div className="ambient-blob blob-1"></div>
        <div className="ambient-blob blob-2"></div>
        <div className="ambient-blob blob-3"></div>
      </div>
      {!onboardingDone && <OnboardingWizard />}
      <BrowserRouter>
        <ToastProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="/gdd" element={<GDD />} />
              <Route path="/sprints" element={<SprintBoard />} />
              <Route path="/assets" element={<AssetManager />} />
              <Route path="/bugs" element={<BugTracker />} />
              <Route path="/world" element={<WorldBuilding />} />
              <Route path="/characters" element={<Characters />} />
              <Route path="/levels" element={<LevelDesign />} />
              <Route path="/techstack" element={<TechStack />} />
              <Route path="/milestones" element={<Milestones />} />
              <Route path="/team" element={<Team />} />
            </Route>
          </Routes>
        </ToastProvider>
      </BrowserRouter>
    </>
  );
}

export default AppShell;
