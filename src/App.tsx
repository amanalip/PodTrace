import React from 'react';
import { AppShell } from './components/ui/AppShell.tsx';
import { YAMLEditor } from './components/editor/YAMLEditor.tsx';
import { DiagramCanvas } from './components/canvas/DiagramCanvas.tsx';
import { ExplanationPanel } from './components/explanation/ExplanationPanel.tsx';

export const App: React.FC = () => {
  return (
    <AppShell
      editorSlot={<YAMLEditor />}
      canvasSlot={<DiagramCanvas />}
      explanationSlot={<ExplanationPanel />}
    />
  );
};

export default App;
