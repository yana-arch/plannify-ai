import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { ProjectsProvider } from './ProjectContext.tsx';
import { SettingsProvider } from './SettingsContext.tsx';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <SettingsProvider>
    <ProjectsProvider>
      <App />
    </ProjectsProvider>
  </SettingsProvider>
);
