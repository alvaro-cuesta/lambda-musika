import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './components/App.jsx';
import './main.scss';

const root = document.getElementById('root');
if (!root) throw new Error('No #root element found');

const reactRoot = createRoot(root);

reactRoot.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
