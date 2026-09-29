import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SaveIcon from '@mui/icons-material/Save';
import StopIcon from '@mui/icons-material/Stop';
import UndoIcon from '@mui/icons-material/Undo';
import {
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';

// Monaco og'ir — faqat kod ochilganda yuklanadi
const CodeEditor = lazy(() => import('./editor/CodeEditor'));

export type RunLang = 'javascript' | 'html';

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';
interface LogEntry {
  level: LogLevel;
  text: string;
}

const MONO = '"JetBrains Mono", "Fira Code", Consolas, monospace';
const MAX_LOGS = 500;

/** Kod HTML sahifaga o'xshaydimi — aks holda JavaScript deb olinadi */
export function detectLang(code: string, fileName?: string | null): RunLang {
  const ext = fileName?.split('.').pop()?.toLowerCase();
  if (ext === 'html' || ext === 'htm') return 'html';
  if (ext === 'js' || ext === 'mjs') return 'javascript';
  return /<\s*(!doctype|html|head|body|div|p|h[1-6]|style|script|span|section|main|a|ul|ol|img|link|form|button|input|table)\b/i.test(
    code,
  )
    ? 'html'
    : 'javascript';
}

/**
 * iframe ichida console.* va xatolarni ushlab, ota oynaga yuboradi.
 * `</script` ketma-ketligi satr ichida ham skriptni yopib qo'ymasligi uchun escape qilinadi.
 */
function bridgeScript(runId: string) {
  return `<script>(function(){
var ID=${JSON.stringify(runId)};
function fmt(v){
  if(typeof v==='string')return v;
  if(v===undefined)return 'undefined';
  if(typeof v==='function')return v.toString();
  if(v instanceof Error)return v.name+': '+v.message;
  if(typeof Element!=='undefined'&&v instanceof Element)return v.outerHTML.slice(0,300);
  try{var s=JSON.stringify(v,null,2);return s===undefined?String(v):s}catch(e){return String(v)}
}
function send(level,args){try{parent.postMessage({__runner:ID,level:level,text:Array.prototype.map.call(args,fmt).join(' ')},'*')}catch(e){}}
['log','info','warn','error','debug'].forEach(function(l){var o=console[l];console[l]=function(){send(l,arguments);o&&o.apply(console,arguments)}});
window.addEventListener('error',function(e){send('error',[e.message+(e.lineno?' (qator '+e.lineno+')':'')])});
window.addEventListener('unhandledrejection',function(e){send('error',['Promise xatosi: '+fmt(e.reason)])});
})();<\/script>`;
}

const escapeForScript = (s: string) => s.replace(/<\/(script)/gi, '<\\/$1').replace(/<!--/g, '<\\!--');

function buildDocument(code: string, lang: RunLang, runId: string) {
  const bridge = bridgeScript(runId);
  if (lang === 'javascript') {
    // Indirect eval — SyntaxError ham konsolga chiqadi
    const src = escapeForScript(JSON.stringify(code));
    return `<!doctype html><html><head><meta charset="utf-8">${bridge}</head><body><script>
try{(0,eval)(${src})}catch(e){console.error(e)}
</script></body></html>`;
  }
  // HTML: ko'prikni <head> boshiga (bo'lmasa hujjat boshiga) qo'yamiz
  const head = /<head[^>]*>/i.exec(code);
  if (head) {
    const at = head.index + head[0].length;
    return `${code.slice(0, at)}${bridge}${code.slice(at)}`;
  }
  return `<meta charset="utf-8">${bridge}${code}`;
}

const LEVEL_COLOR: Record<LogLevel, string> = {
  log: 'text.primary',
  debug: 'text.secondary',
  info: 'info.main',
  warn: 'warning.main',
  error: 'error.main',
};

interface Props {
  code: string;
  defaultLang?: RunLang;
  /** Berilsa — kod tashqarida boshqariladi (masalan, yuborish formasi) */
  onChange?: (code: string) => void;
  /**
   * onChange berilmasa, o'zgarishlar faqat shu yerda (qoralama) turadi va ishga tushirishda ishlatiladi.
   * onSave berilsa — "Saqlash" tugmasi chiqadi; bosilmasa hech narsa saqlanmaydi.
   */
  onSave?: (code: string) => Promise<void>;
}

const LINE_PX = 19;

/** VS Code muharririda kodni ko'rsatadi va brauzerda (sandbox iframe) JavaScript yoki HTML+CSS sifatida ishga tushiradi */
export default function CodeRunner({ code, defaultLang, onChange, onSave }: Props) {
  const controlled = Boolean(onChange);
  const [draft, setDraft] = useState(code);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saved, setSaved] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [lang, setLang] = useState<RunLang>(() => defaultLang ?? detectLang(code));
  const [run, setRun] = useState<{ id: string; doc: string; lang: RunLang } | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [copied, setCopied] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);

  // To'liq ekran: sahifa aylanmaydi; Esc — chiqish (muharrir ichidagi Esc takliflarni yopadi, unga tegmaymiz)
  useEffect(() => {
    if (!fullscreen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      if ((e.target as HTMLElement | null)?.closest?.('.monaco-editor')) return;
      setFullscreen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [fullscreen]);

  // Saqlangach (yoki boshqa topshiriq ochilganda) qoralama yangi asl kodga tenglashadi
  useEffect(() => {
    if (!controlled) setDraft(code);
  }, [code, controlled]);

  const value = controlled ? code : draft;
  const dirty = !controlled && draft !== code;

  const change = (next: string) => {
    if (onChange) onChange(next);
    else setDraft(next);
    setSaved(false);
  };

  const save = async () => {
    if (!onSave) return;
    setSaving(true);
    setSaveError('');
    try {
      await onSave(draft);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setSaveError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!run) return;
    const onMessage = (e: MessageEvent) => {
      if (e.source !== frame.current?.contentWindow) return;
      const data = e.data as { __runner?: string; level?: LogLevel; text?: string } | null;
      if (!data || data.__runner !== run.id || !data.level) return;
      setLogs((list) =>
        list.length >= MAX_LOGS ? list : [...list, { level: data.level!, text: String(data.text ?? '') }],
      );
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [run]);

  const start = () => {
    const id = Math.random().toString(36).slice(2);
    setLogs([]);
    setRun({ id, doc: buildDocument(value, lang, id), lang });
  };

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Yuborish formasida — qulay qat'iy balandlik; ko'rishda — kod uzunligiga moslashadi
  const lineCount = value.split('\n').length;
  const height = controlled ? 400 : Math.min(Math.max(lineCount * LINE_PX + 24, 160), 520);

  const fs = fullscreen;
  const editorHeight = fs ? '100%' : height;

  return (
    <Stack
      spacing={1}
      sx={
        fs
          ? {
              position: 'fixed',
              inset: 0,
              zIndex: (theme) => theme.zIndex.modal,
              bgcolor: 'background.default',
              p: 2,
            }
          : undefined
      }
    >
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
        <ToggleButtonGroup
          exclusive
          size="small"
          color="primary"
          value={lang}
          onChange={(_e, value: RunLang | null) => value && setLang(value)}
        >
          <ToggleButton value="javascript" sx={{ px: 1.5, textTransform: 'none' }}>
            JavaScript
          </ToggleButton>
          <ToggleButton value="html" sx={{ px: 1.5, textTransform: 'none' }}>
            HTML + CSS
          </ToggleButton>
        </ToggleButtonGroup>
        <Button
          size="small"
          variant="contained"
          color="success"
          startIcon={<PlayArrowIcon />}
          onClick={start}
          disabled={!value.trim()}
        >
          {run ? 'Qayta ishga tushirish' : 'Ishga tushirish'}
        </Button>
        {run && (
          <Button size="small" color="inherit" startIcon={<StopIcon />} onClick={() => setRun(null)}>
            To'xtatish
          </Button>
        )}
        <Box sx={{ flex: 1 }} />
        {saved && <Chip size="small" color="success" variant="outlined" label="Saqlandi" />}
        {dirty && (
          <>
            <Chip size="small" color="warning" variant="outlined" label="O'zgartirilgan" />
            <Tooltip title="Asl holiga qaytarish">
              <IconButton size="small" onClick={() => setDraft(code)} disabled={saving}>
                <UndoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {onSave && (
              <Button size="small" variant="outlined" startIcon={<SaveIcon />} onClick={save} disabled={saving}>
                {saving ? 'Saqlanmoqda…' : 'Saqlash'}
              </Button>
            )}
          </>
        )}
        <Tooltip title={copied ? 'Nusxa olindi' : 'Nusxa olish'}>
          <IconButton size="small" onClick={copy} disabled={!value}>
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={fs ? 'To‘liq ekrandan chiqish (Esc)' : 'To‘liq ekran'}>
          <IconButton size="small" onClick={() => setFullscreen((v) => !v)}>
            {fs ? <FullscreenExitIcon fontSize="small" /> : <FullscreenIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Tuzilma ikkala rejimda bir xil — to'liq ekranga o'tganda natija (iframe) qayta ishga tushmaydi */}
      <Box
        sx={
          fs
            ? {
                flex: 1,
                minHeight: 0,
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                gap: 1.5,
              }
            : { display: 'flex', flexDirection: 'column', gap: 1 }
        }
      >
        <Box
          sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: 1.5,
            overflow: 'hidden',
            ...(fs && { flex: 1, minHeight: 0, minWidth: 0 }),
          }}
        >
          <Suspense
            fallback={
              <Box sx={{ height: editorHeight, display: 'grid', placeItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Muharrir yuklanmoqda…
                </Typography>
              </Box>
            }
          >
            <CodeEditor value={value} language={lang} onChange={change} height={editorHeight} />
          </Suspense>
        </Box>

        {saveError && (
          <Typography variant="caption" color="error">
            {saveError}
          </Typography>
        )}

        {run && (
          <Box
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 1.5,
              overflow: 'hidden',
              ...(fs && { flex: 1, minHeight: 0, minWidth: 0, display: 'flex', flexDirection: 'column' }),
            }}
          >
            {/* allow-same-origin YO'Q: kod ilova tokeni va ma'lumotlariga yeta olmaydi */}
            <Box
              component="iframe"
              key={run.id}
              ref={frame}
              title="Natija"
              sandbox="allow-scripts allow-modals"
              srcDoc={run.doc}
              sx={{
                display: run.lang === 'html' ? 'block' : 'none',
                width: '100%',
                height: fs ? 'auto' : 420,
                flex: fs ? 1 : undefined,
                minHeight: 0,
                border: 0,
                bgcolor: '#fff',
              }}
            />
            <Box
              sx={(theme) => ({
                ...(fs &&
                  run.lang === 'javascript' && { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }),
                borderTop: run.lang === 'html' ? 1 : 0,
                borderColor: 'divider',
                bgcolor: alpha(theme.palette.text.primary, 0.03),
              })}
            >
              <Stack direction="row" alignItems="center" sx={{ px: 1.5, py: 0.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
                  Konsol{logs.length >= MAX_LOGS ? ` (birinchi ${MAX_LOGS} ta yozuv)` : ''}
                </Typography>
                <Tooltip title="Tozalash">
                  <IconButton size="small" onClick={() => setLogs([])}>
                    <DeleteSweepIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
              <Box
                sx={{
                  px: 1.5,
                  pb: 1.5,
                  fontFamily: MONO,
                  fontSize: 12.5,
                  lineHeight: 1.6,
                  maxHeight: run.lang === 'html' ? 180 : fs ? 'none' : 320,
                  flex: fs && run.lang === 'javascript' ? 1 : undefined,
                  minHeight: run.lang === 'html' ? 0 : 60,
                  overflow: 'auto',
                }}
              >
                {logs.length === 0 ? (
                  <Typography variant="caption" color="text.disabled" sx={{ fontFamily: MONO }}>
                    {run.lang === 'javascript'
                      ? 'Chiqish yo‘q (console.log ishlating)'
                      : 'Konsolga hech narsa chiqmadi'}
                  </Typography>
                ) : (
                  logs.map((l, i) => (
                    <Box
                      key={i}
                      component="pre"
                      sx={{
                        m: 0,
                        py: 0.25,
                        font: 'inherit',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        color: LEVEL_COLOR[l.level],
                        borderBottom: 1,
                        borderColor: 'divider',
                      }}
                    >
                      {l.text}
                    </Box>
                  ))
                )}
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Stack>
  );
}
