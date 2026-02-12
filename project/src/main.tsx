import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { NotificationProvider } from './components/NotificationSystem';
createRoot(document.getElementById('root')!).render(
  <NotificationProvider>
    <StrictMode>
      <App />
    </StrictMode>
  </NotificationProvider>
);
