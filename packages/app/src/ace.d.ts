// taken from ace-ext.d.ts which declares aceExtKeybindingMenu wrongly
declare module 'ace-builds/src-noconflict/ext-keybinding_menu' {
  export function init(editor: Editor): void;
  import { Editor } from 'ace-builds-internal/editor';
}

// for ace-builds/src-noconflict/ext-elastic_tabstops_lite
// documented here https://github.com/ajaxorg/ace/wiki/Configuring-Ace
declare module 'ace-builds' {
  namespace Ace {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- we are merging into an interface
    interface EditorOptions {
      useElasticTabstops?: boolean;
    }
  }
}
