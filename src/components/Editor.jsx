import React from 'react'

import ace from 'brace'
import 'brace/mode/javascript'
import 'brace/theme/tomorrow_night_eighties'
import 'brace/ext/error_marker'
import 'brace/ext/searchbox'
import 'brace/ext/elastic_tabstops_lite'
import 'brace/ext/keybinding_menu'
import 'brace/ext/settings_menu'

export default class Editor extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    let editor = ace.edit(this.refs.editor)

    editor.$blockScrolling = Infinity;

    editor.setValue(this.props.defaultValue)
    editor.gotoLine(0, 0, false)
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
      printMarginColumn: 80,
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

    editor.commands.addCommand({
      name: "Update",
      bindKey: { win: "Ctrl-S", mac: "Command-S" },
      exec: () => {
        if (this.props.onUpdate) this.props.onUpdate(editor.getValue(), editor)
      }
    })

    editor.commands.addCommand({
      name: "Toggle Play",
      bindKey: { win: "Ctrl-Space", mac: "Command-Space" },
      exec: () => {
        if (this.props.onTogglePlay) this.props.onTogglePlay()
      }
    })

    ace.acequire('ace/ext/keybinding_menu').init(editor)

    editor.focus()

    this.editor = editor
    if (this.props.onLoad) this.props.onLoad(editor)
  }

  maybeAddError(error) {
    let editor = this.editor
    let source = editor.getValue()
    let session = editor.getSession()

    session.setAnnotations()
    if (error) {
      let {name, message, row, column} = error
      let text = `${name}: ${message.replace(/\s+\(\d+:\d+\)$/, '')}`

      session.setAnnotations([{ type: 'error', text, row, column }])
      ace.acequire('ace/ext/error_marker').showErrorMarker(editor, 1)
      editor.focus()

      console.error(error)
      throw error.e
    }
  }

  render() {
    return <div ref='editor' className='Musika-Editor' />
  }
}
