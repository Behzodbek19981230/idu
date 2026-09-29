import type * as Monaco from 'monaco-editor';
// Monaco'ning ichki til ta'riflari (package exports: monaco-editor/* → esm/vs/*.js)
import { language as cssLanguage } from 'monaco-editor/languages/definitions/css/css';
import { language as htmlLanguage } from 'monaco-editor/languages/definitions/html/html';
import {
  CompletionItemKind,
  getCSSLanguageService,
  InsertTextFormat,
  type MarkupContent,
  type Range as LspRange,
} from 'vscode-css-languageservice';
import { TextDocument } from 'vscode-languageserver-textdocument';

/**
 * HTML ichidagi CSS — VS Code'dagidek:
 *  - <style> bloklari va style="..." atributlarida avtoto'ldirish, hover, rang tanlagich;
 *  - style="..." atributi CSS sifatida ranglanadi (Monaco uni oddiy satr deb ko'rsatadi).
 *
 * Usul (VS Code embeddedSupport): HTML'dan "virtual CSS hujjat" yasaladi — CSS bo'lmagan hamma belgi
 * bo'shliqqa almashadi, qatorlar saqlanadi. Shu sababli qator/ustun ikkala hujjatda bir xil.
 */

const cssService = getCSSLanguageService();

interface Region {
  start: number;
  end: number;
  /** style="..." atributi (aks holda <style> bloki) */
  attr: boolean;
}

function findCssRegions(html: string): Region[] {
  const regions: Region[] = [];
  const blocked: Array<[number, number]> = [];

  const blockRe = /<style\b[^>]*>([\s\S]*?)(?:<\/style\s*>|$)/gi;
  for (let m = blockRe.exec(html); m; m = blockRe.exec(html)) {
    const start = m.index + m[0].indexOf('>') + 1;
    regions.push({ start, end: start + m[1].length, attr: false });
    blocked.push([m.index, m.index + m[0].length]);
  }
  // <script> ichidagi "style=" satrlari hisobga olinmaydi
  const scriptRe = /<script\b[\s\S]*?(?:<\/script\s*>|$)/gi;
  for (let m = scriptRe.exec(html); m; m = scriptRe.exec(html)) blocked.push([m.index, m.index + m[0].length]);

  // "..." ichida '...' bo'lishi mumkin (font-family: 'Arial') va aksincha
  const attrRe = /\bstyle\s*=\s*(?:"([^"]*)(?:"|$)|'([^']*)(?:'|$))/gi;
  for (let m = attrRe.exec(html); m; m = attrRe.exec(html)) {
    const at = m.index;
    if (blocked.some(([a, b]) => at >= a && at < b)) continue;
    // Teg ichidami: oldidagi eng yaqin '<' eng yaqin '>' dan keyin bo'lishi kerak
    if (html.lastIndexOf('<', at) <= html.lastIndexOf('>', at)) continue;
    const value = m[1] ?? m[2];
    const start = at + m[0].search(/["']/) + 1;
    regions.push({ start, end: start + value.length, attr: true });
  }
  return regions;
}

function buildVirtualCss(html: string, regions: Region[]) {
  const out = html.replace(/[^\r\n]/g, ' ').split('');
  for (const r of regions) {
    for (let i = r.start; i < r.end; i++) out[i] = html[i];
    if (r.attr) {
      // `style="` o'rniga `__{`, yopuvchi qo'shtirnoq o'rniga `}` — deklaratsiyalar qoidaga aylanadi
      out[r.start - 3] = '_';
      out[r.start - 2] = '_';
      out[r.start - 1] = '{';
      if (r.end < out.length) out[r.end] = '}';
      else out.push('}');
    }
  }
  return out.join('');
}

/** Kursor CSS hududida bo'lsa — virtual hujjat va uning tahlili */
function cssAt(model: Monaco.editor.ITextModel, offset?: number) {
  const html = model.getValue();
  const regions = findCssRegions(html);
  if (offset !== undefined && !regions.some((r) => offset >= r.start && offset <= r.end)) return null;
  const doc = TextDocument.create(
    `${model.uri.toString()}.css`,
    'css',
    model.getVersionId(),
    buildVirtualCss(html, regions),
  );
  return { doc, sheet: cssService.parseStylesheet(doc), regions };
}

const toRange = (r: LspRange): Monaco.IRange => ({
  startLineNumber: r.start.line + 1,
  startColumn: r.start.character + 1,
  endLineNumber: r.end.line + 1,
  endColumn: r.end.character + 1,
});

const toLsp = (p: Monaco.IPosition) => ({ line: p.lineNumber - 1, character: p.column - 1 });

const markdown = (doc: string | MarkupContent | undefined) =>
  doc === undefined ? undefined : typeof doc === 'string' ? doc : { value: doc.value };

function completionKind(monaco: typeof Monaco, kind: CompletionItemKind | undefined) {
  const K = monaco.languages.CompletionItemKind;
  switch (kind) {
    case CompletionItemKind.Property:
      return K.Property;
    case CompletionItemKind.Value:
      return K.Value;
    case CompletionItemKind.Unit:
      return K.Unit;
    case CompletionItemKind.Color:
      return K.Color;
    case CompletionItemKind.Function:
      return K.Function;
    case CompletionItemKind.Keyword:
      return K.Keyword;
    case CompletionItemKind.Snippet:
      return K.Snippet;
    default:
      return K.Text;
  }
}

/** style="..." ichi uchun: CSS tokenizatori, lekin selector emas — to'g'ridan-to'g'ri deklaratsiyalar */
const inlineCssLanguage = {
  ...cssLanguage,
  tokenizer: {
    ...cssLanguage.tokenizer,
    root: [{ include: '@comments' }, ['[*_]?@identifier@ws:', 'attribute.name', '@rulevalue'], [';', 'delimiter']],
  },
} as Monaco.languages.IMonarchLanguage;

const attrStates = (quote: '"' | "'", name: string) => ({
  [name]: [
    [/\s+/, ''],
    [/=/, 'delimiter'],
    [quote, { token: 'attribute.value', switchTo: `@${name}Body`, nextEmbedded: 'css-inline' }],
  ],
  [`${name}Body`]: [
    [quote, { token: '@rematch', switchTo: `@${name}End`, nextEmbedded: '@pop' }],
    [quote === '"' ? /[^"]+/ : /[^']+/, ''],
  ],
  [`${name}End`]: [[quote, 'attribute.value', '@pop']],
});

const htmlWithInlineCss = {
  ...htmlLanguage,
  tokenizer: {
    ...htmlLanguage.tokenizer,
    otherTag: [
      [/style(?=\s*=\s*")/, 'attribute.name', '@styleAttrDq'],
      [/style(?=\s*=\s*')/, 'attribute.name', '@styleAttrSq'],
      ...htmlLanguage.tokenizer.otherTag,
    ],
    ...attrStates('"', 'styleAttrDq'),
    ...attrStates("'", 'styleAttrSq'),
  },
} as Monaco.languages.IMonarchLanguage;

export function registerEmbeddedCss(monaco: typeof Monaco) {
  monaco.languages.register({ id: 'css-inline' });
  monaco.languages.setMonarchTokensProvider('css-inline', inlineCssLanguage);
  // Model yaratilishidan oldin o'rnatiladi — Monaco'ning lazy html yuklovchisi buni almashtirmaydi
  monaco.languages.setMonarchTokensProvider('html', htmlWithInlineCss);

  monaco.languages.registerCompletionItemProvider('html', {
    triggerCharacters: [':', ' ', '-', '(', ';'],
    provideCompletionItems(model, position) {
      const ctx = cssAt(model, model.getOffsetAt(position));
      if (!ctx) return undefined;
      const list = cssService.doComplete(ctx.doc, toLsp(position), ctx.sheet);
      const word = model.getWordUntilPosition(position);
      const fallback: Monaco.IRange = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };
      return {
        incomplete: list.isIncomplete,
        suggestions: list.items.map((item) => {
          const edit = item.textEdit && 'range' in item.textEdit ? item.textEdit : undefined;
          return {
            label: item.label,
            kind: completionKind(monaco, item.kind),
            detail: item.detail,
            documentation: markdown(item.documentation),
            sortText: item.sortText,
            filterText: item.filterText,
            insertText: edit?.newText ?? item.insertText ?? item.label,
            insertTextRules:
              item.insertTextFormat === InsertTextFormat.Snippet
                ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                : undefined,
            range: edit ? toRange(edit.range) : fallback,
            // "color: " dan keyin qiymatlar ro'yxatini darhol ochish
            command: item.command ? { id: item.command.command, title: item.command.title } : undefined,
            tags: item.tags as Monaco.languages.CompletionItemTag[] | undefined,
          };
        }),
      };
    },
  });

  monaco.languages.registerHoverProvider('html', {
    provideHover(model, position) {
      const ctx = cssAt(model, model.getOffsetAt(position));
      if (!ctx) return undefined;
      const hover = cssService.doHover(ctx.doc, toLsp(position), ctx.sheet);
      if (!hover) return undefined;
      const contents = Array.isArray(hover.contents) ? hover.contents : [hover.contents];
      return {
        range: hover.range ? toRange(hover.range) : undefined,
        contents: contents.map((c) => ({ value: typeof c === 'string' ? c : c.value })),
      };
    },
  });

  // Rang namunasi va tanlagich (<style> va style="..."). Provayder bo'lgach Monaco'ning zaxira dekoratori o'chadi,
  // shuning uchun hamma CSS hududlari shu yerda qaytariladi
  monaco.languages.registerColorProvider('html', {
    provideDocumentColors(model) {
      const ctx = cssAt(model);
      if (!ctx || ctx.regions.length === 0) return [];
      return cssService
        .findDocumentColors(ctx.doc, ctx.sheet)
        .map((c) => ({ color: c.color, range: toRange(c.range) }));
    },
    provideColorPresentations(model, info) {
      const ctx = cssAt(model);
      if (!ctx) return [];
      const range: LspRange = {
        start: { line: info.range.startLineNumber - 1, character: info.range.startColumn - 1 },
        end: { line: info.range.endLineNumber - 1, character: info.range.endColumn - 1 },
      };
      return cssService.getColorPresentations(ctx.doc, ctx.sheet, info.color, range).map((p) => ({
        label: p.label,
        textEdit: p.textEdit ? { range: toRange(p.textEdit.range), text: p.textEdit.newText } : undefined,
      }));
    },
  });
}
