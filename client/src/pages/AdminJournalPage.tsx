import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import EditIcon from '@mui/icons-material/Edit';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import GradingOutlinedIcon from '@mui/icons-material/GradingOutlined';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Link,
  ListItemIcon,
  Menu,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { AttendanceCell, formatScore, ScoreCell, type TaskScore } from '../components/JournalCells';
import type { ExportSheet } from '../utils/journalExport';
import type {
  AttendanceMark,
  ClassSession,
  ClassSessionInput,
  Journal,
  TopicListItem,
} from '../types';

type Sheet = 'davomat' | 'baholar';

const markKey = (sessionId: number, studentId: number) => `${sessionId}:${studentId}`;

/** Bugungi sana mahalliy vaqt bo'yicha, YYYY-MM-DD */
const today = () => new Date().toLocaleDateString('sv-SE');

/** 2026-09-28 → 28.09 */
const shortDate = (iso: string) => `${iso.slice(8, 10)}.${iso.slice(5, 7)}`;

/** Saqlangan (yoki saqlanayotgan) belgilarni ro'yxatga qo'shadi / almashtiradi */
function upsertMarks(list: AttendanceMark[], updates: AttendanceMark[]): AttendanceMark[] {
  const keys = new Set(updates.map((m) => markKey(m.session_id, m.student_id)));
  return [...list.filter((m) => !keys.has(markKey(m.session_id, m.student_id))), ...updates];
}

export default function AdminJournalPage() {
  const { subjectId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const courseParam = searchParams.get('kurs');
  const sheet: Sheet = searchParams.get('jadval') === 'baholar' ? 'baholar' : 'davomat';

  const [journal, setJournal] = useState<Journal | null>(null);
  const [topics, setTopics] = useState<TopicListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [sessionDialog, setSessionDialog] = useState<{ id: number | null; form: ClassSessionInput } | null>(null);
  const [savingSession, setSavingSession] = useState(false);
  const [sessionMenu, setSessionMenu] = useState<{ anchor: HTMLElement; session: ClassSession } | null>(null);
  const [exportAnchor, setExportAnchor] = useState<HTMLElement | null>(null);
  const [exporting, setExporting] = useState(false);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    next.set(key, value);
    setSearchParams(next, { replace: true });
  };

  const load = useCallback(() => {
    if (!subjectId) return;
    setLoading(true);
    api
      .getJournal(Number(subjectId), courseParam ? Number(courseParam) : null)
      .then(setJournal)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [subjectId, courseParam]);

  useEffect(load, [load]);

  useEffect(() => {
    if (!subjectId) return;
    api.listTopics(Number(subjectId)).then(setTopics).catch(() => setTopics([]));
  }, [subjectId]);

  const marks = useMemo(() => {
    const map = new Map<string, AttendanceMark>();
    journal?.marks.forEach((m) => map.set(markKey(m.session_id, m.student_id), m));
    return map;
  }, [journal]);

  const taskScores = useMemo(() => {
    const map = new Map<string, TaskScore>();
    journal?.task_scores.forEach((t) => map.set(markKey(t.session_id, t.student_id), t));
    return map;
  }, [journal]);

  const unassignedTasks = useMemo(() => {
    const map = new Map<number, TaskScore>();
    journal?.unassigned_task_scores.forEach((t) => map.set(t.student_id, t));
    return map;
  }, [journal]);

  /**
   * Talaba bo'yicha: keldi, NB soni va jami ball.
   * Jami = darsdagi ballar (NB yoki yozuvsiz kun — 0) + barcha baholangan topshiriq ballari.
   */
  const totals = useMemo(() => {
    const result = new Map<number, { present: number; absent: number; score: number }>();
    journal?.students.forEach((st) => {
      const t = { present: 0, absent: 0, score: unassignedTasks.get(st.id)?.score ?? 0 };
      journal.sessions.forEach((se) => {
        const m = marks.get(markKey(se.id, st.id));
        // Qo'lda o'zgartirilgan katakda topshiriq bali qo'shilmaydi
        if (!(m?.present && m.score_override)) t.score += taskScores.get(markKey(se.id, st.id))?.score ?? 0;
        if (!m) return;
        if (m.present) {
          t.present += 1;
          t.score += m.score;
        } else {
          t.absent += 1;
        }
      });
      result.set(st.id, t);
    });
    return result;
  }, [journal, marks, taskScores, unassignedTasks]);

  // Darsi hali jurnalda yo'q mavzular bo'yicha topshiriq ballari bo'lsa — alohida ustun
  const showUnassigned = Boolean(journal?.students.some((st) => unassignedTasks.has(st.id)));

  /** Optimistik saqlash: jadval darhol yangilanadi, xato bo'lsa — jurnal qayta yuklanadi */
  const saveMarks = async (sessionId: number, items: Omit<AttendanceMark, 'session_id'>[]) => {
    const optimistic = items.map((m) => ({
      ...m,
      session_id: sessionId,
      score: m.present ? m.score : 0,
      score_override: m.present && m.score_override,
    }));
    setJournal((j) => j && { ...j, marks: upsertMarks(j.marks, optimistic) });
    try {
      const saved = await api.saveMarks(sessionId, items);
      setJournal((j) => j && { ...j, marks: upsertMarks(j.marks, saved) });
    } catch (e) {
      setError((e as Error).message);
      load();
    }
  };

  const toggleAttendance = (sessionId: number, studentId: number) => {
    const m = marks.get(markKey(sessionId, studentId));
    // Yozuv yo'q → keldi; keldi → NB (ball 0); NB → keldi (ball 0 dan boshlanadi)
    const present = !m ? true : !m.present;
    saveMarks(sessionId, [{ student_id: studentId, present, score: 0, score_override: false }]);
  };

  const markAllPresent = (session: ClassSession) => {
    setSessionMenu(null);
    if (!journal) return;
    const items = journal.students
      .filter((st) => !marks.get(markKey(session.id, st.id))?.present)
      .map((st) => ({ student_id: st.id, present: true, score: 0, score_override: false }));
    if (items.length) saveMarks(session.id, items);
  };

  /** Excel kutubxonasi katta — faqat eksport bosilganda yuklanadi */
  const exportExcel = async (sheets: ExportSheet[]) => {
    setExportAnchor(null);
    if (!journal) return;
    setExporting(true);
    setError('');
    try {
      const { exportJournal } = await import('../utils/journalExport');
      await exportJournal(journal, sheets);
    } catch (e) {
      setError(`Excel faylini yaratib bo'lmadi: ${(e as Error).message}`);
    } finally {
      setExporting(false);
    }
  };

  const saveSession = async () => {
    if (!sessionDialog || !journal?.course || !subjectId) return;
    setSavingSession(true);
    setError('');
    try {
      if (sessionDialog.id) await api.updateSession(sessionDialog.id, sessionDialog.form);
      else await api.createSession(Number(subjectId), { ...sessionDialog.form, course: journal.course });
      setSessionDialog(null);
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSavingSession(false);
    }
  };

  const removeSession = async (session: ClassSession) => {
    setSessionMenu(null);
    if (!confirm(`${shortDate(session.lesson_date)} dagi dars, uning davomati va baholari o'chiriladi. Davom etasizmi?`)) return;
    try {
      await api.deleteSession(session.id);
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  if (loading && !journal) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (!journal) return <Alert severity="error">{error || 'Jurnal topilmadi'}</Alert>;

  const { subject, course, students, sessions } = journal;
  const grid = `${sheet}-${course}`;

  const stickyNameSx = {
    position: 'sticky',
    left: 0,
    bgcolor: 'background.paper',
    borderRight: 1,
    borderColor: 'divider',
    minWidth: 200,
  } as const;

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 1 }}>
        <Link component={RouterLink} to="/admin" underline="hover" color="inherit" variant="body2">
          Adminka
        </Link>
        <Typography variant="body2" color="text.primary">
          Jurnal
        </Typography>
      </Breadcrumbs>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ sm: 'center' }}
        spacing={1.5}
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="h4">Jurnal</Typography>
          <Typography color="text.secondary">
            {subject.code} — {subject.name}
          </Typography>
        </Box>
        {course && (
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={exporting ? <CircularProgress size={16} /> : <FileDownloadOutlinedIcon />}
              disabled={exporting || students.length === 0}
              onClick={(e) => setExportAnchor(e.currentTarget)}
            >
              Excel
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setSessionDialog({ id: null, form: { lesson_date: today(), topic_id: null, note: '' } })}
            >
              Dars qo'shish
            </Button>
          </Stack>
        )}
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {subject.courses.length === 0 ? (
        <Alert severity="info">
          Fan hech qaysi kursga biriktirilmagan. Avval fanlar ro'yxatida kursni belgilang.
        </Alert>
      ) : (
        <>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ md: 'flex-end' }}
            spacing={1.5}
            sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
          >
            <Tabs value={course} onChange={(_e, value: number) => setParam('kurs', String(value))}>
              {subject.courses.map((c) => (
                <Tab key={c} value={c} label={`${c}-kurs`} />
              ))}
            </Tabs>
            <ToggleButtonGroup
              exclusive
              size="small"
              color="primary"
              value={sheet}
              onChange={(_e, value: Sheet | null) => value && setParam('jadval', value)}
              sx={{ mb: 1 }}
            >
              <ToggleButton value="davomat" sx={{ px: 2 }}>
                <EventAvailableOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
                Davomat
              </ToggleButton>
              <ToggleButton value="baholar" sx={{ px: 2 }}>
                <GradingOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
                Baholar
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>

          {students.length === 0 ? (
            <Alert severity="info">{course}-kursda hali ro'yxatdan o'tgan talaba yo'q.</Alert>
          ) : sessions.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              Hali dars qo'shilmagan. "Dars qo'shish" tugmasi bilan birinchi darsni yarating — barcha
              talabalar "keldi" deb belgilanadi.
            </Alert>
          ) : null}

          {students.length > 0 && (
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: '70vh' }}>
              <Table
                size="small"
                stickyHeader
                sx={{
                  '& td, & th': { whiteSpace: 'nowrap' },
                  // Excel'dagidek to'r: kataklar orasida chiziq, ichida padding yo'q
                  '& td.cell': { p: 0, borderLeft: 1, borderColor: 'divider', minWidth: 58 },
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ ...stickyNameSx, zIndex: 3 }}>Talaba</TableCell>
                    {sessions.map((se) => (
                      <TableCell key={se.id} align="center" sx={{ px: 0.25, borderLeft: 1, borderColor: 'divider' }}>
                        <Tooltip title={se.topic_title || se.note || ''}>
                          <Button
                            size="small"
                            color="inherit"
                            sx={{ minWidth: 0, px: 0.75, fontWeight: 600 }}
                            onClick={(e) => setSessionMenu({ anchor: e.currentTarget, session: se })}
                          >
                            {shortDate(se.lesson_date)}
                          </Button>
                        </Tooltip>
                      </TableCell>
                    ))}
                    {sheet === 'davomat' ? (
                      <>
                        <TableCell align="center" sx={{ borderLeft: 1, borderColor: 'divider' }}>Keldi</TableCell>
                        <TableCell align="center">NB</TableCell>
                      </>
                    ) : (
                      <>
                        {showUnassigned && (
                          <TableCell align="center" sx={{ borderLeft: 1, borderColor: 'divider' }}>
                            <Tooltip title="Jurnalda mavzusi belgilangan dars hali yo'q topshiriqlar bali. Shu mavzu bilan dars qo'shilsa — o'sha kunga o'tadi.">
                              <span>Darssiz topshiriq</span>
                            </Tooltip>
                          </TableCell>
                        )}
                        <TableCell align="center" sx={{ borderLeft: 1, borderColor: 'divider' }}>Jami ball</TableCell>
                      </>
                    )}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {students.map((st, row) => {
                    const total = totals.get(st.id) ?? { present: 0, absent: 0, score: 0 };
                    return (
                      <TableRow key={st.id} hover>
                        <TableCell sx={{ ...stickyNameSx, zIndex: 1 }}>
                          <Typography variant="body2" fontWeight={500}>
                            {row + 1}. {st.last_name} {st.first_name}
                          </Typography>
                          {st.course !== course && (
                            <Typography variant="caption" color="text.secondary">
                              hozir {st.course}-kursda
                            </Typography>
                          )}
                        </TableCell>

                        {sessions.map((se, col) => {
                          const m = marks.get(markKey(se.id, st.id));
                          return (
                            <TableCell key={se.id} className="cell" align="center">
                              {sheet === 'davomat' ? (
                                <AttendanceCell
                                  grid={grid}
                                  row={row}
                                  col={col}
                                  mark={m}
                                  onToggle={() => toggleAttendance(se.id, st.id)}
                                />
                              ) : (
                                <ScoreCell
                                  grid={grid}
                                  row={row}
                                  col={col}
                                  rowCount={students.length}
                                  mark={m}
                                  task={taskScores.get(markKey(se.id, st.id))}
                                  onCommit={(score, override) =>
                                    saveMarks(se.id, [
                                      { student_id: st.id, present: true, score, score_override: override },
                                    ])
                                  }
                                />
                              )}
                            </TableCell>
                          );
                        })}

                        {sheet === 'davomat' ? (
                          <>
                            <TableCell align="center" sx={{ borderLeft: 1, borderColor: 'divider' }}>
                              {total.present}
                            </TableCell>
                            <TableCell align="center">
                              <Typography
                                variant="body2"
                                color={total.absent ? 'error.main' : 'text.secondary'}
                                fontWeight={total.absent ? 600 : 400}
                              >
                                {total.absent}
                              </Typography>
                            </TableCell>
                          </>
                        ) : (
                          <>
                            {showUnassigned && (
                              <TableCell align="center" sx={{ borderLeft: 1, borderColor: 'divider' }}>
                                {unassignedTasks.has(st.id) ? (
                                  <Typography variant="body2" color="success.main" fontWeight={600}>
                                    {formatScore(unassignedTasks.get(st.id)!.score)}
                                  </Typography>
                                ) : (
                                  <Typography variant="body2" color="text.disabled">—</Typography>
                                )}
                              </TableCell>
                            )}
                            <TableCell align="center" sx={{ borderLeft: 1, borderColor: 'divider' }}>
                              <Typography variant="body2" fontWeight={700} color="primary.main">
                                {formatScore(total.score)}
                              </Typography>
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>

                {sheet === 'davomat' && sessions.length > 0 && (
                  <TableFooter>
                    <TableRow>
                      <TableCell sx={{ ...stickyNameSx, zIndex: 1, fontWeight: 600 }}>
                        Kelganlar
                      </TableCell>
                      {sessions.map((se) => {
                        const present = students.filter((st) => marks.get(markKey(se.id, st.id))?.present).length;
                        return (
                          <TableCell key={se.id} align="center" sx={{ borderLeft: 1, borderColor: 'divider' }}>
                            {present}/{students.length}
                          </TableCell>
                        );
                      })}
                      <TableCell colSpan={2} sx={{ borderLeft: 1, borderColor: 'divider' }} />
                    </TableRow>
                  </TableFooter>
                )}
              </Table>
            </TableContainer>
          )}

          {sessions.length > 0 && students.length > 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
              {sheet === 'davomat'
                ? 'Katakka bosing (yoki Space) — keldi ✓ / kelmadi NB. Strelkalar bilan kataklar bo‘ylab yuriladi.'
                : 'Ballni to‘g‘ridan-to‘g‘ri yozing — istalgan son (masalan 0,3, 1 yoki 1,5). Yashil burchakli katak — shu mavzu bo‘yicha topshiriq ballari avtomatik qo‘shilgan (katakda kunning jami bali). Uni o‘zgartirsangiz — yozilgan son kunning yakuniy bali bo‘ladi, topshiriq bali ustiga qo‘shilmaydi (sariq burchak); katakni bo‘shatsangiz — avtomatik hisobga qaytadi. Enter — saqlab pastga, strelkalar — qo‘shni katakka, Esc — bekor qilish. Bo‘sh katak va NB kunlari 0 ball.'}{' '}
              Sana ustiga bosing — darsni tahrirlash yoki o'chirish.
            </Typography>
          )}
        </>
      )}

      <Menu anchorEl={exportAnchor} open={Boolean(exportAnchor)} onClose={() => setExportAnchor(null)}>
        <MenuItem onClick={() => exportExcel(['davomat'])}>Davomat (.xlsx)</MenuItem>
        <MenuItem onClick={() => exportExcel(['baholar'])}>Baholar (.xlsx)</MenuItem>
        <MenuItem onClick={() => exportExcel(['davomat', 'baholar'])}>Ikkalasi — bitta faylda</MenuItem>
      </Menu>

      {/* Dars ustuni menyusi */}
      <Menu open={Boolean(sessionMenu)} anchorEl={sessionMenu?.anchor} onClose={() => setSessionMenu(null)}>
        {sessionMenu?.session.topic_title && (
          <MenuItem disabled sx={{ maxWidth: 320, whiteSpace: 'normal', opacity: '1 !important' }}>
            <Typography variant="caption" color="text.secondary">
              {sessionMenu.session.topic_title}
            </Typography>
          </MenuItem>
        )}
        <MenuItem onClick={() => sessionMenu && markAllPresent(sessionMenu.session)}>
          <ListItemIcon>
            <DoneAllIcon fontSize="small" />
          </ListItemIcon>
          Hammasi keldi
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (!sessionMenu) return;
            const { session } = sessionMenu;
            setSessionMenu(null);
            setSessionDialog({
              id: session.id,
              form: { lesson_date: session.lesson_date, topic_id: session.topic_id, note: session.note },
            });
          }}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Tahrirlash
        </MenuItem>
        <MenuItem onClick={() => sessionMenu && removeSession(sessionMenu.session)} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          O'chirish
        </MenuItem>
      </Menu>

      <Dialog open={Boolean(sessionDialog)} onClose={() => setSessionDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{sessionDialog?.id ? 'Darsni tahrirlash' : `Yangi dars — ${course}-kurs`}</DialogTitle>
        {sessionDialog && (
          <DialogContent dividers>
            <Stack spacing={2} sx={{ pt: 0.5 }}>
              <TextField
                label="Sana"
                type="date"
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={sessionDialog.form.lesson_date}
                onChange={(e) =>
                  setSessionDialog({ ...sessionDialog, form: { ...sessionDialog.form, lesson_date: e.target.value } })
                }
              />
              <FormControl size="small" fullWidth>
                <InputLabel id="session-topic">Mavzu (ixtiyoriy)</InputLabel>
                <Select
                  labelId="session-topic"
                  label="Mavzu (ixtiyoriy)"
                  value={sessionDialog.form.topic_id ?? ''}
                  onChange={(e) =>
                    setSessionDialog({
                      ...sessionDialog,
                      form: { ...sessionDialog.form, topic_id: e.target.value === '' ? null : Number(e.target.value) },
                    })
                  }
                >
                  <MenuItem value="">
                    <em>Tanlanmagan</em>
                  </MenuItem>
                  {topics.map((t, i) => (
                    <MenuItem key={t.id} value={t.id} sx={{ whiteSpace: 'normal' }}>
                      {i + 1}. {t.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Izoh"
                size="small"
                fullWidth
                value={sessionDialog.form.note}
                onChange={(e) =>
                  setSessionDialog({ ...sessionDialog, form: { ...sessionDialog.form, note: e.target.value } })
                }
              />
              {!sessionDialog.id && (
                <Typography variant="caption" color="text.secondary">
                  Kursdagi barcha talabalar "keldi, 0 ball" deb belgilanadi. Mavzu tanlansa — shu mavzu
                  bo'yicha topshiriq ballari shu kunga avtomatik qo'shiladi.
                </Typography>
              )}
            </Stack>
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={() => setSessionDialog(null)}>Bekor qilish</Button>
          <Button variant="contained" onClick={saveSession} disabled={savingSession || !sessionDialog?.form.lesson_date}>
            Saqlash
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
