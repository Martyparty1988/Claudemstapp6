/**
 * MST Application Entry Point
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app';
import { registerServiceWorker } from './pwa';
import './shared/styles/globals.css';

// Register Service Worker
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  registerServiceWorker('/sw.js');
}

// Mount app
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
