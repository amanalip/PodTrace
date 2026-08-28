import React from 'react';
import { AppShell } from './components/ui/AppShell.tsx';
import { YAMLEditor } from './components/editor/YAMLEditor.tsx';
import { DiagramCanvas } from './components/canvas/DiagramCanvas.tsx';

export const App: React.FC = () => {
  return (
    <AppShell
      editorSlot={<YAMLEditor />}
      canvasSlot={<DiagramCanvas />}
    />
  );
};

export default App;
