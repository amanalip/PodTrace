import React from 'react';
import { AppShell } from './components/ui/AppShell.tsx';
import { YAMLEditor } from './components/editor/YAMLEditor.tsx';

export const App: React.FC = () => {
  return <AppShell editorSlot={<YAMLEditor />} />;
};

export default App;
