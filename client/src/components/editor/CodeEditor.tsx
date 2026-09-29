import Editor, { loader } from '@monaco-editor/react';
import { useTheme } from '@mui/material/styles';
import * as monaco from 'monaco-editor';
import EditorWorker from 'monaco-editor/editor/editor.worker?worker';
import CssWorker from 'monaco-editor/language/css/css.worker?worker';
import HtmlWorker from 'monaco-editor/language/html/html.worker?worker';
import JsonWorker from 'monaco-editor/language/json/json.worker?worker';
import TsWorker from 'monaco-editor/language/typescript/ts.worker?worker';
import { registerEmbeddedCss } from './embeddedCss';

// Monaco CDN'dan emas, ilova bilan birga yuklanadi (internet cheklangan tarmoqda ham ishlaydi)
self.MonacoEnvironment = {
  getWorker(_id, label) {
    if (label === 'json') return new JsonWorker();
    if (label === 'css' || label === 'scss' || label === 'less') return new CssWorker();
    if (label === 'html' || label === 'handlebars' || label === 'razor') return new HtmlWorker();
    if (label === 'typescript' || label === 'javascript') return new TsWorker();
    return new EditorWorker();
  },
};
loader.config({ monaco });
registerEmbeddedCss(monaco);

export interface CodeEditorProps {
  value: string;
  language: 'javascript' | 'html';
  onChange?: (value: string) => void;
  height?: number | string;
}

/** VS Code muharriri (Monaco): sintaksis ranglari, qator raqamlari, avtoto'ldirish */
export default function CodeEditor({ value, language, onChange, height = 360 }: CodeEditorProps) {
  const theme = useTheme();
  return (
    <Editor
      height={height}
      language={language}
      value={value}
      theme={theme.palette.mode === 'dark' ? 'vs-dark' : 'light'}
      onChange={(v) => onChange?.(v ?? '')}
      loading="Muharrir yuklanmoqda…"
      options={{
        fontFamily: '"JetBrains Mono", "Fira Code", Consolas, monospace',
        fontSize: 13,
        fontLigatures: true,
        tabSize: 2,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        wordWrap: 'off',
        bracketPairColorization: { enabled: true },
        guides: { bracketPairs: true, indentation: true },
        padding: { top: 12, bottom: 12 },
        scrollbar: { alwaysConsumeMouseWheel: false },
      }}
    />
  );
}
