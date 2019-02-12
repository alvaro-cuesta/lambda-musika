import React from 'react'
import PropTypes from 'prop-types'

import ace from 'brace'
import 'brace/mode/javascript'
import 'brace/theme/tomorrow_night_eighties'
import 'brace/ext/error_marker'
import 'brace/ext/searchbox'
import 'brace/ext/elastic_tabstops_lite'
import 'brace/ext/keybinding_menu'
import 'brace/ext/settings_menu'

const EMPTY_SCRIPT = require('!raw!examples/empty')

export default class Editor extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    let editor = ace.edit(this.refs.editor)

    editor.$blockScrolling = Infinity;

    if (this.props.defaultValue) {
      editor.setValue(this.props.defaultValue)
      editor.gotoLine(0, 0, false)
      editor.scrollToLine(0, false, false, function () {})
    }
    editor.getSession().setUndoManager(new ace.UndoManager())
    editor.setOptions({
      // Editor
      selectionStyle: 'line',
      highlightActiveLine: true,
      highlightSelectedWord: true,
      readOnly: false,
      /*mergeUndoDeltas*/
      cursorStyle: 'slim',
      behavioursEnabled: true,
      wrapBehavioursEnabled: true,
      autoScrollEditorIntoView: false,

      // Renderer
      hScrollBarAlwaysVisible: false,
      vScrollBarAlwaysVisible: false,
      highlightGutterLine: true,
      animatedScroll: false,
      showInvisibles: false,
      showPrintMargin: true,
      printMarginColumn: 79,
      //printMargin
      fadeFoldWidgets: true,
      showFoldWidgets: true,
      showLineNumbers: true,
      showGutter: true,
      displayIndentGuides: true,
      fontSize: '14px',
      scrollPastEnd: true,
      fixedWidthGutter: true,
      theme: 'ace/theme/tomorrow_night_eighties',

      // Session
      useWorker: false,
      useSoftTabs: true/*false?*/,
      tabSize: 2,
      wrap: false,
      /*foldStyle*/
      mode: 'ace/mode/javascript',

      // Extensions
      useElasticTabstops: true,
    })

    if (this.props.onChange) {
      editor.on('change', this.props.onChange)
    }

    ace.acequire('ace/ext/keybinding_menu').init(editor)

    // HACK: This happens to fix magically the mispositioning of error markers
    //       when loading the app for the first time
    editor.renderer.on('resize', () => {
      if (editor.getSession().getAnnotations().length > 0) {
        ace.acequire('ace/ext/error_marker').showErrorMarker(editor, 1)
      }
    })

    editor.getSession().on('changeAnnotation', () => {
      // HACK: Wait for next tick so this is done _after_ setSerialState
      //       Necessary because of setSerialState hack
      setTimeout(() => {
        editor.resize()
        if (editor.getSession().getAnnotations().length > 0) {
          ace.acequire('ace/ext/error_marker').showErrorMarker(editor, 1)
          editor.focus()
        }
      }, 2)
    })

    editor.focus()

    this.editor = editor
    if (this.props.onLoad) this.props.onLoad(editor)
  }

  new(content) {
    let editor = this.editor
    editor.setValue(typeof content !== 'undefined' ? content : EMPTY_SCRIPT)
    editor.gotoLine(0, 0, false)
    editor.getSession().setUndoManager(new ace.UndoManager())
    editor.focus()
  }

  maybeAddError(error) {
    let editor = this.editor
    let source = editor.getValue()
    let session = editor.getSession()

    // Clear errors
    session.setAnnotations()
    if (session.lineWidgets) {
      session.lineWidgets.forEach(w => {
        session.widgetManager.removeLineWidget(w)
      })
    }

    // Add new error
    if (error) {
      let {name, message, row, column} = error
      let text = `${name}: ${message.replace(/\s+\(\d+:\d+\)$/, '')}`
      session.setAnnotations([{ type: 'error', text, row, column }])

      console.error(error)
      throw error.e
    }
  }

  setUndo($undoStack, $redoStack, dirtyCounter) {
    let undoManager = new ace.UndoManager()
    let session = this.editor.getSession()

    if (typeof $undoStack !== 'undefined'
      && typeof $redoStack !== 'undefined'
      && typeof dirtyCounter !== 'undefined'
    ) {
      undoManager.$doc = session
      undoManager.$undoStack = $undoStack
      undoManager.$redoStack = $redoStack
      undoManager.dirtyCounter = dirtyCounter
    }

    session.setUndoManager(undoManager)
  }

  getSerialState() {
    let editor = this.editor

    let source = editor.getValue()
    let cursor = editor.getCursorPosition()
    let {$undoStack, $redoStack, dirtyCounter} = editor.getSession().getUndoManager()

    return {source, cursor, $undoStack, $redoStack, dirtyCounter}
  }

  setSerialState({source, cursor, $undoStack, $redoStack, dirtyCounter}) {
    let editor = this.editor

    if (typeof source !== 'undefined') {
      editor.setValue(source)
    }

    // HACK: Wait for next tick so resize works
    setTimeout(() => {
      editor.resize()

      if (cursor) {
        let {row, column} = cursor
        editor.gotoLine(row + 1, column, false)
        editor.scrollToLine(row + 1, true, false, function () {})
      } else {
        editor.gotoLine(0, 0, false)
        editor.scrollToLine(0, false, false, function () {})
      }

      editor.focus()
    }, 1)

    this.setUndo($undoStack, $redoStack, dirtyCounter)
  }

  markDirty() {
    this.editor.getSession().getUndoManager().dirtyCounter = NaN
  }

  markClean() {
    this.editor.getSession().getUndoManager().markClean()
  }

  isClean() {
    return this.editor.getSession().getUndoManager().isClean()
  }

  render() {
    return <div ref='editor' className='Musika-Editor' />
  }
}

Editor.propTypes = {
  defaultValue: PropTypes.string,
  onLoad: PropTypes.func,
}
