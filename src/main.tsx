import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './components/App.jsx';
import { ScriptPlayer } from './lib/ScriptPlayer/ScriptPlayer.js';
import './main.scss';

const root = document.getElementById('root');
if (!root) throw new Error('No #root element found');

const audioCtx = new AudioContext();
await audioCtx.suspend(); // Prevent autoplay during HMR

const player = await ScriptPlayer.create(audioCtx); // Pre-create AudioContext and ScriptPlayer to avoid delay on first play

const reactRoot = createRoot(root);
reactRoot.render(
  <StrictMode>
    <App
      audioCtx={audioCtx}
      player={player}
    />
  </StrictMode>,
);
