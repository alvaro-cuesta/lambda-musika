import ace, { Ace } from 'ace-builds';
import 'ace-builds/src-noconflict/ext-elastic_tabstops_lite';
import aceExtKeyErrorMarker from 'ace-builds/src-noconflict/ext-error_marker';
import aceExtKeybindingMenu from 'ace-builds/src-noconflict/ext-keybinding_menu';
import 'ace-builds/src-noconflict/ext-searchbox';
import 'ace-builds/src-noconflict/ext-settings_menu';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-tomorrow_night_eighties';
import cx from 'classnames';
import { useEffect, useImperativeHandle, useRef, type Ref } from 'react';
import packageJson from '../../package.json';
import LambdaMusikaLogo from '../../public-src/lambda-musika-logo-no-color-change.svg?react';
import EmptyScript from '../examples/empty.musika?raw';
import type { ExceptionInfo } from '../lib/exception.js';
import type { EditorSerialState } from '../utils/editor.js';
import { useSetting, type Settings } from '../utils/settings.js';
import styles from './Editor.module.scss';

function getEditorOptions(
  settings: Pick<Settings, 'editorFontSize'>,
): Partial<Ace.EditorOptions> {
  return {
    selectionStyle: 'line',
    highlightActiveLine: true,
    highlightSelectedWord: true,
    readOnly: false,
    cursorStyle: 'slim',
    behavioursEnabled: true,
    wrapBehavioursEnabled: true,
    autoScrollEditorIntoView: false,
    hScrollBarAlwaysVisible: false,
    vScrollBarAlwaysVisible: false,
    highlightGutterLine: true,
    animatedScroll: false,
    showInvisibles: false,
    showPrintMargin: true,
    printMarginColumn: 79,
    fadeFoldWidgets: true,
    showFoldWidgets: true,
    showLineNumbers: true,
    showGutter: true,
    displayIndentGuides: true,
    fontSize: `${settings.editorFontSize}px`,
    scrollPastEnd: 1,
    fixedWidthGutter: true,
    theme: 'ace/theme/tomorrow_night_eighties',
    useWorker: false,
    useSoftTabs: true,
    tabSize: 2,
    wrap: false,
    mode: 'ace/mode/javascript',
    useElasticTabstops: true,
  };
}

export type EditorRef = {
  getValue: () => string | null;
  newScript: (content?: string) => void;
  addError: (error: ExceptionInfo) => void;
  clearErrors: () => void;
  getSerialState: () => EditorSerialState | null;
  setSerialState: (state: EditorSerialState) => void;
  markClean: () => void;
  isClean: () => boolean | null;
};

type EditorProps = {
  defaultValue?: string;
  gutterState?: 'success' | 'error' | 'none';
  ref?: Ref<EditorRef | null>;
};

function clearErrorsFromSession(session: ace.EditSession) {
  session.setAnnotations([]);
  if (session.lineWidgets) {
    session.lineWidgets.forEach((w) => {
      session.widgetManager.removeLineWidget(w);
    });
  }
}

export const Editor = ({ defaultValue, gutterState, ref }: EditorProps) => {
  const [editorFontSize] = useSetting('editorFontSize');

  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<ace.Editor | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const editor = ace.edit(containerRef.current);
    editorRef.current = editor;

    if (defaultValue !== undefined) {
      editor.setValue(defaultValue);
      editor.gotoLine(0, 0, false);
      editor.scrollToLine(0, false, false);
    }
    editor.getSession().setUndoManager(new ace.UndoManager());
    editor.setOptions(getEditorOptions({ editorFontSize }));

    // Add margin so drop shadows don't overlap text
    editor.renderer.setScrollMargin(8, 8, 0, 0);

    aceExtKeybindingMenu.init(editor);

    editor.renderer.on('resize', () => {
      if (editor.getSession().getAnnotations().length > 0) {
        aceExtKeyErrorMarker.showErrorMarker(editor, 1);
      }
    });

    editor.getSession().on('changeAnnotation', () => {
      setTimeout(() => {
        editor.resize();
        if (editor.getSession().getAnnotations().length > 0) {
          aceExtKeyErrorMarker.showErrorMarker(editor, 1);
          editor.focus();
        }
      }, 2);
    });

    editor.focus();

    return () => {
      clearErrorsFromSession(editor.getSession());
      editor.destroy();
      editorRef.current = null;
    };
    // @todo Buggy! Intentionally omitted defaultValue  but this is scary
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!editorRef.current) return;
    const editor = editorRef.current;
    editor.setFontSize(editorFontSize);
  }, [editorFontSize]);

  // Expose methods
  // @todo Imperative handle is probably a bad idea here -- ported straight from a class component
  useImperativeHandle<EditorRef | null, EditorRef | null>(
    ref,
    () => ({
      getValue() {
        if (!editorRef.current) return null;
        const editor = editorRef.current;
        return editor.getValue();
      },

      newScript(content) {
        if (!editorRef.current) return;
        const editor = editorRef.current;
        editor.setValue(content ?? EmptyScript);
        editor.gotoLine(0, 0, false);
        editor.getSession().setUndoManager(new ace.UndoManager());
        editor.focus();
      },

      addError(error: ExceptionInfo) {
        if (!editorRef.current) return;
        const editor = editorRef.current;
        const session = editor.getSession();

        clearErrorsFromSession(session);

        const { name, message, row, column } = error;
        // Cleans stuff like `SyntaxError: Unexpected token (113:8)` to just `SyntaxError: Unexpected token`
        const cleanMessage = message.replace(/\s+\(\d+:\d+\)$/, '');
        const text = `${name}: ${cleanMessage}`;
        session.setAnnotations([{ type: 'error', text, row, column }]);
        console.error(error);
      },

      clearErrors() {
        if (!editorRef.current) return;
        const editor = editorRef.current;
        const session = editor.getSession();
        clearErrorsFromSession(session);
      },

      getSerialState() {
        if (!editorRef.current) return null;
        const editor = editorRef.current;
        const source = editor.getValue();
        const cursor = editor.getCursorPosition();
        const undo = editor.getSession().getUndoManager().toJSON();
        return { source, cursor, undo };
      },

      setSerialState({ source, cursor, undo }: EditorSerialState) {
        if (!editorRef.current) return;
        const editor = editorRef.current;
        editor.setValue(source);
        setTimeout(() => {
          editor.resize();
          const { row, column } = cursor;
          editor.gotoLine(row + 1, column, false);
          editor.scrollToLine(row + 1, true, false);
          editor.focus();
        }, 1);
        const undoManager = new ace.UndoManager();
        undoManager.fromJSON(undo);
        editor.getSession().setUndoManager(undoManager);
      },

      markClean() {
        if (!editorRef.current) return;
        const editor = editorRef.current;
        editor.getSession().getUndoManager().markClean();
      },

      isClean() {
        if (!editorRef.current) return null;
        const editor = editorRef.current;
        return editor.getSession().getUndoManager().isClean();
      },
    }),
    [],
  );

  return (
    <div
      className={cx(styles['container'], {
        [`${styles['container-success']}`]: gutterState === 'success',
        [`${styles['container-error']}`]: gutterState === 'error',
      })}
    >
      <div
        className={styles['logo-container']}
        title={`${packageJson.config.shortName} v${packageJson.version} (${import.meta.env.GIT_COMMIT_SHORT_SHA})`}
      >
        <LambdaMusikaLogo className={styles['logo']} />
      </div>
      <div ref={containerRef} />
    </div>
  );
};
