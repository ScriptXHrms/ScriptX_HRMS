import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

// Prevent mousewheel on number inputs from incrementing/decrementing values
if (typeof window !== 'undefined') {
  window.addEventListener(
    'wheel',
    (e) => {
      if (document.activeElement?.tagName === 'INPUT' && document.activeElement?.type === 'number') {
        document.activeElement.blur();
      }
      if (e.target?.tagName === 'INPUT' && e.target?.type === 'number') {
        e.target.blur();
      }
    },
    { passive: true },
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
