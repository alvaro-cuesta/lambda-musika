import { isEqual as deepEqual } from '@react-hookz/deep-equal';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';
import { EXAMPLE_SCRIPTS } from '../examples/index.js';
import { useInterval } from '../hooks/useInterval.js';
import {
  compile,
  type CompileResult,
  type ExceptionInfo,
} from '../lib/compile.js';
import { renderPcmBufferStereoWithWorkers } from '../lib/PCM/PCM-with-workers.js';
import { makeWavBlob, type BitDepth } from '../lib/PCM/PCM.js';
import { isEditorSerialState } from '../utils/editor.js';
import { downloadBlob } from '../utils/file.js';
import { dateToSortableString, toMinsSecs } from '../utils/time.js';
import styles from './App.module.scss';
import { BottomBar } from './BottomBar/BottomBar.js';
import { CPULoad } from './CPULoad.js';
import { Editor, type EditorRef } from './Editor.js';
import { Player, type PlayerRef } from './Player/Player.js';

const DEFAULT_SCRIPT = EXAMPLE_SCRIPTS.Default;
const DEFAULT_BUFFER_LENGTH = 8192;

const BACKUP_INTERVAL = 1000;

type AppProps = {
  bufferLength?: number;
};

function useAudioContext() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  audioCtxRef.current ??= new AudioContext();

  useEffect(() => {
    return () => {
      void audioCtxRef.current?.close();
      audioCtxRef.current = null;
    };
  }, []);

  return audioCtxRef.current;
}

const DIRTY_INTERVAL = 100;
function useEditorCleanState(editorRef: RefObject<EditorRef | null>) {
  // Track document changes
  const [isClean, setIsClean] = useState(false);

  const markClean = useCallback(() => {
    editorRef.current?.markClean();
    setIsClean(true);
  }, [editorRef]);

  // Poll for dirty state on editor (I think there is no way to listen to changes)
  useInterval(() => {
    if (!editorRef.current) return;
    const editor = editorRef.current;
    const isClean = editor.isClean();
    if (isClean === null) return;
    setIsClean(isClean);
  }, DIRTY_INTERVAL);

  return {
    isClean,
    markClean,
  };
}

export const App = ({ bufferLength = DEFAULT_BUFFER_LENGTH }: AppProps) => {
  const audioCtx = useAudioContext();

  const [compileResult, setCompileResult] = useState<Exclude<
    CompileResult,
    { type: 'error' }
  > | null>(null);
  const [renderTime, setRenderTime] = useState<number | null>(null);
  const [isRendering, setIsRendering] = useState(false);

  const backupIntervalRef = useRef<number>(null);

  const playerRef = useRef<PlayerRef>(null);
  const editorRef = useRef<EditorRef>(null);

  const { isClean, markClean } = useEditorCleanState(editorRef);

  const handleUpdate = useCallback(() => {
    if (!editorRef.current) return;
    const source = editorRef.current.getValue();
    if (source === null) return;

    const compileResult = compile(source, audioCtx.sampleRate);
    switch (compileResult.type) {
      case 'error':
        editorRef.current.addError(compileResult.error);
        return;
      case 'infinite':
      case 'with-length':
        setCompileResult(compileResult);
        return;
    }
  }, [audioCtx]);

  const handleBackup = useCallback(() => {
    if (!editorRef.current) return;
    const serialState = editorRef.current.getSerialState();
    if (!serialState) return;
    if (
      !isEditorSerialState(history.state) ||
      !deepEqual(history.state, serialState)
    ) {
      history.replaceState(serialState, 'unused');
    }
  }, []);

  const handleExplicitUpdate = useCallback(() => {
    handleUpdate();
    handleBackup();
  }, [handleUpdate, handleBackup]);

  // Setup intervals and initial state
  useEffect(() => {
    // @todo This needs to happen always when the editor already is refed -- I think that's why the player starts with no loaded fn
    if (editorRef.current) {
      if (history.state && isEditorSerialState(history.state)) {
        editorRef.current.setSerialState(history.state);
      }
    }

    backupIntervalRef.current = setInterval(handleBackup, BACKUP_INTERVAL);

    handleUpdate();

    return () => {
      if (backupIntervalRef.current) clearInterval(backupIntervalRef.current);
    };
  }, [handleUpdate, handleBackup]);

  // Player events
  const handlePlayingChange = useCallback((_playing: boolean) => {
    setRenderTime(null);
  }, []);

  const handleRenderTime = useCallback((renderTime: number) => {
    setRenderTime(renderTime);
  }, []);

  const handleError = useCallback((error: ExceptionInfo) => {
    try {
      editorRef.current?.addError(error);
    } catch {
      /* IGNORE EXCEPTION! Let the player try to recover */
    }
  }, []);

  // Bottom bar events
  const handleNew = useCallback(
    (source: string) => {
      setCompileResult(null);
      editorRef.current?.newScript(source);
      markClean();
      handleUpdate();
    },
    [markClean, handleUpdate],
  );

  const handleSave = useCallback(() => {
    if (!editorRef.current) return;
    const source = editorRef.current.getValue();
    if (source === null) return;
    const blob = new Blob([source], {
      type: 'application/javascript;charset=utf-8',
    });
    downloadBlob(`script-${dateToSortableString(new Date())}.musika`, blob);
    markClean();
  }, [markClean]);

  const handleRender = useCallback(
    (sampleRate: number, bitDepth: BitDepth) => {
      void (async () => {
        if (!editorRef.current) return;

        setIsRendering(true);
        try {
          playerRef.current?.pause();

          handleUpdate();

          const source = editorRef.current.getValue();
          if (source === null) return;

          const compileResult = compile(source, sampleRate);
          switch (compileResult.type) {
            case 'error': {
              editorRef.current.addError(compileResult.error);
              return;
            }
            case 'infinite': {
              throw new Error('Cannot render infinite-length script');
            }
            case 'with-length': {
              const renderResult = await renderPcmBufferStereoWithWorkers(
                bitDepth,
                sampleRate,
                compileResult.length,
                source,
              );
              switch (renderResult.type) {
                case 'error': {
                  editorRef.current.addError(renderResult.error);
                  break;
                }
                case 'success': {
                  const blob = makeWavBlob(renderResult.buffers, 2, sampleRate);
                  downloadBlob(
                    `render-${dateToSortableString(new Date())}_${toMinsSecs(compileResult.length, '-')}_${sampleRate}-${bitDepth}b.wav`,
                    blob,
                  );
                }
              }
            }
          }
        } finally {
          setIsRendering(false);
        }
      })();
    },
    [handleUpdate],
  );

  const defaultValue = isEditorSerialState(history.state)
    ? history.state.source
    : DEFAULT_SCRIPT;

  return (
    <div className={styles['container']}>
      <Player
        ref={playerRef}
        // @todo Merge this into a single prop?
        fn={compileResult?.fn ?? null}
        length={compileResult?.length ?? null}
        bufferLength={bufferLength}
        audioCtx={audioCtx}
        onPlayingChange={handlePlayingChange}
        onRenderTime={handleRenderTime}
        onError={handleError}
      />

      <CPULoad
        renderTime={renderTime}
        bufferLength={bufferLength}
        sampleRate={audioCtx.sampleRate}
      />

      <Editor
        ref={editorRef}
        defaultValue={defaultValue}
      />

      <BottomBar
        isClean={isClean}
        showRenderControls={!!compileResult?.length}
        isRendering={isRendering}
        onCommit={handleExplicitUpdate}
        onNew={handleNew}
        onSave={handleSave}
        onRender={handleRender}
      />
    </div>
  );
};
