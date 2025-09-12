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
import { compile, type CompileResult } from '../lib/compile.js';
import { makeWavBlob, type BitDepth } from '../lib/PCM/PCM.js';
import { renderPcmBufferStereoWithBestEffort } from '../lib/PCM/renderWithBestEffort.js';
import type {
  ScriptPlayer,
  ScriptPlayerEvents,
} from '../lib/ScriptPlayer/ScriptPlayer.js';
import { isEditorSerialState } from '../utils/editor.js';
import { downloadBlob } from '../utils/file.js';
import { dateToSortableString, toMinsSecs } from '../utils/time.js';
import styles from './App.module.scss';
import { BottomBar } from './BottomBar/BottomBar.js';
import {
  CPULoad,
  TIMING_HISTORY_LENGTH,
  type RenderTiming,
} from './CPULoad.js';
import { Editor, type EditorRef } from './Editor.js';
import { Player } from './Player/Player.js';

const DEFAULT_SCRIPT = EXAMPLE_SCRIPTS.Default;

const BACKUP_INTERVAL = 1000;

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

type AppProps = {
  audioCtx: AudioContext;
  player: ScriptPlayer;
};

export const App = ({ audioCtx, player }: AppProps) => {
  const [compileResult, setCompileResult] = useState<
    (Exclude<CompileResult, { type: 'error' }> & { fnCode: string }) | null
  >(null);
  const [renderTime, setRenderTime] = useState<RenderTiming | null>(null);
  const [isRendering, setIsRendering] = useState(false);

  const backupIntervalRef = useRef<number>(null);

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
      case 'success':
        void player.setFn(source);
        setCompileResult({ ...compileResult, fnCode: source });
        return;
    }
  }, [audioCtx, player]);

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

  const handleSubmit = useCallback(() => {
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
  const handlePlayingChange = useCallback(
    (_event: ScriptPlayerEvents['playingChange']) => {
      setRenderTime(null);
    },
    [],
  );

  const handleRenderTime = useCallback(
    (event: ScriptPlayerEvents['renderTime']) => {
      setRenderTime((prev) => ({
        ms: [...(prev?.ms ?? []), event.detail.ms].slice(
          -TIMING_HISTORY_LENGTH,
        ),
        bufferLength: event.detail.bufferLength,
      }));
    },
    [],
  );

  const handleError = useCallback((event: ScriptPlayerEvents['error']) => {
    try {
      editorRef.current?.addError(event.detail.error);
    } catch {
      /* IGNORE EXCEPTION! Let the player try to recover */
    }
  }, []);

  useEffect(() => {
    player.addEventListener('playingChange', handlePlayingChange);
    player.addEventListener('renderTime', handleRenderTime);
    player.addEventListener('error', handleError);

    return () => {
      player.removeEventListener('playingChange', handlePlayingChange);
      player.removeEventListener('renderTime', handleRenderTime);
      player.removeEventListener('error', handleError);
    };
  }, [player, handlePlayingChange, handleRenderTime, handleError]);

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
          void player.pause();

          handleUpdate();

          const source = editorRef.current.getValue();
          if (source === null) return;

          const compileResult = compile(source, sampleRate);
          switch (compileResult.type) {
            case 'error': {
              editorRef.current.addError(compileResult.error);
              return;
            }
            case 'success': {
              if (compileResult.length === null) {
                throw new Error('Cannot render infinite-length script');
              }

              const renderResult = await renderPcmBufferStereoWithBestEffort(
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
    [handleUpdate, player],
  );

  const defaultValue = isEditorSerialState(history.state)
    ? history.state.source
    : DEFAULT_SCRIPT;

  return (
    <div className={styles['container']}>
      <Player
        player={player}
        state={compileResult}
      />

      <CPULoad
        renderTiming={renderTime}
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
        onCommit={handleSubmit}
        onNew={handleNew}
        onSave={handleSave}
        onRender={handleRender}
      />
    </div>
  );
};
