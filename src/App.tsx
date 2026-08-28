import React, { useEffect } from 'react';
import { AppShell } from './components/ui/AppShell.tsx';
import { Sidebar } from './components/ui/Sidebar.tsx';
import { DiagramCanvas } from './components/canvas/DiagramCanvas.tsx';
import { ExplanationPanel } from './components/explanation/ExplanationPanel.tsx';
import { decodeStateFromHash } from './export/export-utils.ts';
import { useAppStore } from './store/index.ts';

export const App: React.FC = () => {
  const { setYaml, setCurrentStepIndex, setTheme } = useAppStore();

  useEffect(() => {
    if (window.location.hash) {
      const decoded = decodeStateFromHash(window.location.hash);
      if (decoded) {
        if (decoded.yaml) setYaml(decoded.yaml);
        if (typeof decoded.step === 'number') setCurrentStepIndex(decoded.step);
        if (decoded.theme === 'light' || decoded.theme === 'dark') setTheme(decoded.theme);
      }
    }
  }, [setYaml, setCurrentStepIndex, setTheme]);

  return (
    <AppShell
      editorSlot={<Sidebar />}
      canvasSlot={<DiagramCanvas />}
      explanationSlot={<ExplanationPanel />}
    />
  );
};

export default App;
