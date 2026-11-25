import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import './styles/tokens.css';

const root = document.getElementById('root');
if (root === null) {
  throw new Error('Không tìm thấy #root trong index.html');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
