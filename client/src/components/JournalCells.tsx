import { Box, InputBase } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import type { AttendanceMark } from '../types';

/** 1.5 → "1,5", 0.25 → "0,25"; butun sonlar kasrsiz */
export const formatScore = (v: number) => String(Math.round(v * 100) / 100).replace('.', ',');

/** Ball: istalgan manfiy bo'lmagan son (server bilan bir xil qoida) */
export const isValidScore = (v: number) => Number.isFinite(v) && v >= 0 && v <= 9999.99;

const NAV_KEYS: Record<string, [number, number]> = {
  ArrowUp: [-1, 0],
  ArrowDown: [1, 0],
  ArrowLeft: [0, -1],
  ArrowRight: [0, 1],
};

/** Jadvalda qo'shni katakka fokusni o'tkazadi (Excel'dagidek) */
export function focusCell(grid: string, row: number, col: number) {
  document
    .querySelector<HTMLElement>(`[data-grid="${grid}"][data-row="${row}"][data-col="${col}"]`)
    ?.focus();
}

function navigate(e: React.KeyboardEvent, grid: string, row: number, col: number): boolean {
  const delta = NAV_KEYS[e.key];
  if (!delta) return false;
  e.preventDefault();
  focusCell(grid, row + delta[0], col + delta[1]);
  return true;
}

const cellBoxSx = {
  width: '100%',
  height: 34,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 0,
  outline: 'none',
  font: 'inherit',
  fontSize: 14,
  bgcolor: 'transparent',
  color: 'inherit',
  '&:focus, &.Mui-focused': {
    boxShadow: (t: { palette: { primary: { main: string } } }) =>
      `inset 0 0 0 2px ${t.palette.primary.main}`,
  },
} as const;

interface CellPosition {
  grid: string;
  row: number;
  col: number;
}

interface AttendanceCellProps extends CellPosition {
  mark: AttendanceMark | undefined;
  onToggle: () => void;
}

/** Davomat katagi: bosish / Space / Enter — keldi ↔ NB */
export function AttendanceCell({ mark, onToggle, grid, row, col }: AttendanceCellProps) {
  const state = !mark ? 'none' : mark.present ? 'present' : 'absent';
  return (
    <Box
      component="button"
      type="button"
      data-grid={grid}
      data-row={row}
      data-col={col}
      onClick={onToggle}
      onKeyDown={(e: React.KeyboardEvent) => navigate(e, grid, row, col)}
      sx={(theme) => ({
        ...cellBoxSx,
        cursor: 'pointer',
        fontWeight: 600,
        color:
          state === 'present'
            ? 'success.main'
            : state === 'absent'
              ? 'error.main'
              : 'text.disabled',
        bgcolor: state === 'absent' ? alpha(theme.palette.error.main, 0.1) : 'transparent',
        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) },
      })}
    >
      {state === 'present' ? '✓' : state === 'absent' ? 'NB' : '—'}
    </Box>
  );
}

/** Mavzu bo'yicha baholangan topshiriqlar yig'indisi (shu kunga avtomatik qo'shiladi) */
export interface TaskScore {
  score: number;
  count: number;
}

interface ScoreCellProps extends CellPosition {
  mark: AttendanceMark | undefined;
  task: TaskScore | undefined;
  onCommit: (score: number) => void;
  rowCount: number;
}

/** Excel'dagi izoh belgisi kabi: topshiriq bali qo'shilgan katak burchagida yashil uchburchak */
const taskCornerSx = {
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    borderStyle: 'solid',
    borderWidth: '0 7px 7px 0',
    borderColor: 'transparent',
    borderRightColor: 'success.main',
    pointerEvents: 'none',
  },
} as const;

function taskHint(manual: number, task: TaskScore) {
  return `Darsdagi ball: ${formatScore(manual)} · Topshiriq (${task.count} ta): ${formatScore(task.score)}`;
}

/**
 * Ball katagi — to'g'ridan-to'g'ri yoziladi. Enter / strelka / fokus chiqishi — saqlaydi,
 * Esc — bekor qiladi. Bo'sh qoldirilsa — 0. NB bo'lgan kunda darsdagi ball qo'yilmaydi.
 *
 * Katakda kunning jami bali ko'rinadi: darsdagi ball + shu mavzu bo'yicha topshiriq ballari.
 * Tahrirlashda (fokusda) faqat darsdagi ball o'zgaradi, topshiriq bali alohida hisoblanadi.
 */
export function ScoreCell({ mark, task, onCommit, grid, row, col, rowCount }: ScoreCellProps) {
  const saved = mark?.present ? formatScore(mark.score) : '';
  const [draft, setDraft] = useState(saved);
  const [invalid, setInvalid] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    setDraft(saved);
    setInvalid(false);
  }, [saved]);

  const hasTask = Boolean(task && task.score > 0);

  if (mark && !mark.present) {
    // Kelmagan kun: darsdagi ball 0, lekin yuborgan topshiriq bali baribir hisoblanadi
    return (
      <Box
        tabIndex={0}
        data-grid={grid}
        data-row={row}
        data-col={col}
        title={hasTask ? `Kelmagan · Topshiriq (${task!.count} ta): ${formatScore(task!.score)}` : 'Kelmagan — ball 0'}
        onKeyDown={(e) => navigate(e, grid, row, col)}
        sx={(theme) => ({
          ...cellBoxSx,
          ...(hasTask ? taskCornerSx : {}),
          gap: 0.5,
          color: 'error.main',
          fontWeight: 600,
          fontSize: 12,
          bgcolor: alpha(theme.palette.error.main, 0.1),
        })}
      >
        NB
        {hasTask && (
          <Box component="span" sx={{ color: 'success.main', fontSize: 11.5 }}>
            +{formatScore(task!.score)}
          </Box>
        )}
      </Box>
    );
  }

  /** true — qiymat to'g'ri (saqlandi yoki o'zgarmagan) */
  const commit = (): boolean => {
    const text = draft.trim();
    if (text === saved) return true;
    const value = text === '' ? 0 : Number(text.replace(',', '.'));
    if (!isValidScore(value)) {
      setInvalid(true);
      return false;
    }
    setInvalid(false);
    if (mark?.present && value === mark.score) {
      setDraft(saved);
      return true;
    }
    onCommit(value);
    return true;
  };

  const manual = mark?.present ? mark.score : 0;
  const total = manual + (task?.score ?? 0);
  // Fokusda — tahrirlanadigan darsdagi ball, aks holda — kunning jami bali
  const shown = focused || !hasTask ? draft : formatScore(total);

  return (
    <Box sx={hasTask ? taskCornerSx : undefined} title={hasTask ? taskHint(manual, task!) : undefined}>
      <InputBase
        value={shown}
        onChange={(e) => {
          setDraft(e.target.value);
          setInvalid(false);
        }}
        onFocus={(e) => {
          setFocused(true);
          const el = e.target;
          // Qiymat jamidan darsdagi ballga almashgach belgilanadi
          requestAnimationFrame(() => el.select());
        }}
        onBlur={() => {
          setFocused(false);
          if (!commit()) {
            setDraft(saved);
            setInvalid(false);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setDraft(saved);
            setInvalid(false);
            (e.target as HTMLInputElement).blur();
            return;
          }
          if (e.key === 'Enter') {
            e.preventDefault();
            if (commit()) focusCell(grid, Math.min(row + 1, rowCount - 1), col);
            return;
          }
          if (NAV_KEYS[e.key] && !commit()) return;
          navigate(e, grid, row, col);
        }}
        endAdornment={
          focused && hasTask ? (
            <Box
              component="span"
              sx={{ color: 'success.main', fontSize: 11, pr: 0.5, whiteSpace: 'nowrap' }}
            >
              +{formatScore(task!.score)}
            </Box>
          ) : undefined
        }
        inputProps={{
          'data-grid': grid,
          'data-row': row,
          'data-col': col,
          inputMode: 'decimal',
          'aria-label': 'Darsdagi ball',
        }}
        title={invalid ? 'Manfiy bo‘lmagan son kiriting, masalan 0,3 yoki 1,5' : undefined}
        sx={(theme) => ({
          ...cellBoxSx,
          '& input': { textAlign: 'center', p: 0, height: '100%', minWidth: 0 },
          color: total === 0 ? 'text.secondary' : 'text.primary',
          fontWeight: total > 0 ? 600 : 400,
          bgcolor: invalid ? alpha(theme.palette.error.main, 0.18) : 'transparent',
        })}
      />
    </Box>
  );
}
