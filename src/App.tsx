import React from 'react';
import { AppShell } from './components/ui/AppShell.tsx';
import { Sidebar } from './components/ui/Sidebar.tsx';
import { DiagramCanvas } from './components/canvas/DiagramCanvas.tsx';
import { ExplanationPanel } from './components/explanation/ExplanationPanel.tsx';

export const App: React.FC = () => {
  return (
    <AppShell
      editorSlot={<Sidebar />}
      canvasSlot={<DiagramCanvas />}
      explanationSlot={<ExplanationPanel />}
    />
  );
};

export default App;
