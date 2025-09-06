/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

declare module '*?worker' {
  const WorkerConstructor: new () => Worker;
  export default WorkerConstructor;
}

declare module './audioRenderWorker?worker' {
  const AudioRenderWorker: new () => Worker;
  export default AudioRenderWorker;
}
