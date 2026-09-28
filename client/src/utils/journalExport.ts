import ExcelJS from 'exceljs';
import type { Journal } from '../types';

/**
 * Jurnalni Excel (.xlsx) ga eksport qilish. Brauzerda yaratiladi.
 * Hisob qoidalari jurnal sahifasi bilan bir xil:
 *  - NB yoki yozuvsiz kun — darsdagi ball 0;
 *  - kunlik ball = darsdagi ball + shu mavzu bo'yicha baholangan topshiriqlar yig'indisi;
 *  - darsi hali yo'q mavzular topshiriqlari — "Darssiz topshiriq" ustunida.
 */

export type ExportSheet = 'davomat' | 'baholar';

const key = (sessionId: number, studentId: number) => `${sessionId}:${studentId}`;

/** 2026-09-28 → 28.09.2026 */
const fullDate = (iso: string) => `${iso.slice(8, 10)}.${iso.slice(5, 7)}.${iso.slice(0, 4)}`;

const round2 = (v: number) => Math.round(v * 100) / 100;

const COLORS = {
  headerFill: 'FFE8EEF7',
  absentFill: 'FFFDE2E1',
  absentText: 'FFC62828',
  presentText: 'FF2E7D32',
  taskFill: 'FFE8F5E9',
  border: 'FFBDBDBD',
};

const thin = { style: 'thin' as const, color: { argb: COLORS.border } };
const allBorders = { top: thin, left: thin, bottom: thin, right: thin };

/** Excel ustun harfi: 1 → A, 27 → AA */
function colLetter(n: number): string {
  let s = '';
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

function buildIndexes(journal: Journal) {
  const marks = new Map(journal.marks.map((m) => [key(m.session_id, m.student_id), m]));
  const tasks = new Map(journal.task_scores.map((t) => [key(t.session_id, t.student_id), t]));
  const unassigned = new Map(journal.unassigned_task_scores.map((t) => [t.student_id, t]));
  return { marks, tasks, unassigned };
}

/** Sarlavha qismi: fan, kurs, eksport sanasi. Jadval boshlanadigan qator raqamini qaytaradi */
function writeTitle(ws: ExcelJS.Worksheet, journal: Journal, title: string, lastCol: number): number {
  ws.mergeCells(1, 1, 1, lastCol);
  const t = ws.getCell(1, 1);
  t.value = `${title} — ${journal.subject.code} ${journal.subject.name}`;
  t.font = { bold: true, size: 14 };

  ws.mergeCells(2, 1, 2, lastCol);
  ws.getCell(2, 1).value = `${journal.course}-kurs · Eksport: ${new Date().toLocaleString('ru-RU')}`;
  ws.getCell(2, 1).font = { color: { argb: 'FF616161' } };
  return 4;
}

function styleHeaderRow(row: ExcelJS.Row) {
  row.height = 22;
  row.eachCell((cell) => {
    cell.font = { bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerFill } };
    cell.border = allBorders;
  });
}

function sessionHeaderNote(topic: string | null | undefined, note: string) {
  return [topic, note].filter(Boolean).join('\n') || undefined;
}

function addAttendanceSheet(wb: ExcelJS.Workbook, journal: Journal) {
  const { students, sessions } = journal;
  const { marks } = buildIndexes(journal);
  const ws = wb.addWorksheet('Davomat', { views: [{ state: 'frozen', xSplit: 2, ySplit: 4 }] });

  const firstSession = 3;
  const presentCol = firstSession + sessions.length;
  const lastCol = presentCol + 2; // Keldi, NB, Davomat %
  const headerRowNo = writeTitle(ws, journal, 'Davomat', lastCol);

  const header = ws.getRow(headerRowNo);
  header.values = ['№', 'Talaba', ...sessions.map((s) => fullDate(s.lesson_date)), 'Keldi', 'NB', 'Davomat, %'];
  sessions.forEach((s, i) => {
    const note = sessionHeaderNote(s.topic_title, s.note);
    if (note) header.getCell(firstSession + i).note = note;
  });
  styleHeaderRow(header);

  students.forEach((st, index) => {
    const rowNo = headerRowNo + 1 + index;
    const row = ws.getRow(rowNo);
    row.getCell(1).value = index + 1;
    row.getCell(2).value = `${st.last_name} ${st.first_name}`;

    sessions.forEach((se, i) => {
      const m = marks.get(key(se.id, st.id));
      const cell = row.getCell(firstSession + i);
      if (!m) return;
      if (m.present) {
        cell.value = '+';
        cell.font = { bold: true, color: { argb: COLORS.presentText } };
      } else {
        cell.value = 'NB';
        cell.font = { bold: true, color: { argb: COLORS.absentText } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.absentFill } };
      }
    });

    // Formulalar — Excel'da belgini o'zgartirsa, jami ham qayta hisoblanadi
    const range = sessions.length
      ? `${colLetter(firstSession)}${rowNo}:${colLetter(presentCol - 1)}${rowNo}`
      : null;
    const present = sessions.filter((se) => marks.get(key(se.id, st.id))?.present).length;
    const absent = sessions.filter((se) => marks.get(key(se.id, st.id))?.present === false).length;
    const pCell = `${colLetter(presentCol)}${rowNo}`;
    const aCell = `${colLetter(presentCol + 1)}${rowNo}`;
    row.getCell(presentCol).value = range ? { formula: `COUNTIF(${range},"+")`, result: present } : 0;
    row.getCell(presentCol + 1).value = range ? { formula: `COUNTIF(${range},"NB")`, result: absent } : 0;
    row.getCell(presentCol + 2).value = {
      formula: `IF(${pCell}+${aCell}=0,"",ROUND(${pCell}/(${pCell}+${aCell})*100,0))`,
      result: present + absent ? Math.round((present / (present + absent)) * 100) : '',
    };
    row.getCell(presentCol + 1).font = { bold: absent > 0, color: absent ? { argb: COLORS.absentText } : undefined };
  });

  // Pastki qator: har bir darsga kelganlar soni
  if (sessions.length && students.length) {
    const footerNo = headerRowNo + students.length + 1;
    const footer = ws.getRow(footerNo);
    footer.getCell(2).value = 'Kelganlar';
    sessions.forEach((se, i) => {
      const col = colLetter(firstSession + i);
      const present = students.filter((st) => marks.get(key(se.id, st.id))?.present).length;
      footer.getCell(firstSession + i).value = {
        formula: `COUNTIF(${col}${headerRowNo + 1}:${col}${footerNo - 1},"+")`,
        result: present,
      };
    });
    footer.font = { bold: true };
  }

  finishSheet(ws, headerRowNo, lastCol, students.length + (sessions.length ? 1 : 0));
}

function addGradesSheet(wb: ExcelJS.Workbook, journal: Journal) {
  const { students, sessions } = journal;
  const { marks, tasks, unassigned } = buildIndexes(journal);
  const hasUnassigned = students.some((st) => unassigned.has(st.id));
  const ws = wb.addWorksheet('Baholar', { views: [{ state: 'frozen', xSplit: 2, ySplit: 4 }] });

  const firstSession = 3;
  const afterSessions = firstSession + sessions.length;
  const unassignedCol = hasUnassigned ? afterSessions : null;
  const totalCol = afterSessions + (hasUnassigned ? 1 : 0);
  const headerRowNo = writeTitle(ws, journal, 'Baholar', totalCol);

  const header = ws.getRow(headerRowNo);
  header.values = [
    '№',
    'Talaba',
    ...sessions.map((s) => fullDate(s.lesson_date)),
    ...(hasUnassigned ? ['Darssiz topshiriq'] : []),
    'Jami ball',
  ];
  sessions.forEach((s, i) => {
    const note = sessionHeaderNote(s.topic_title, s.note);
    if (note) header.getCell(firstSession + i).note = note;
  });
  styleHeaderRow(header);

  students.forEach((st, index) => {
    const rowNo = headerRowNo + 1 + index;
    const row = ws.getRow(rowNo);
    row.getCell(1).value = index + 1;
    row.getCell(2).value = `${st.last_name} ${st.first_name}`;
    let total = 0;

    sessions.forEach((se, i) => {
      const m = marks.get(key(se.id, st.id));
      const task = tasks.get(key(se.id, st.id));
      const manual = m?.present ? m.score : 0;
      const taskScore = task?.score ?? 0;
      const cell = row.getCell(firstSession + i);
      total += manual + taskScore;

      if (m && !m.present) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.absentFill } };
        cell.font = { bold: true, color: { argb: COLORS.absentText } };
        // NB kuni: topshiriq bali bo'lsa — son (jamiga qo'shiladi), aks holda "NB"
        cell.value = taskScore > 0 ? round2(taskScore) : 'NB';
        if (taskScore > 0) cell.note = `Kelmagan (NB)\nTopshiriq (${task!.count} ta): ${round2(taskScore)}`;
        return;
      }
      if (!m && !task) return;
      cell.value = round2(manual + taskScore);
      if (taskScore > 0) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.taskFill } };
        cell.note = `Darsdagi ball: ${round2(manual)}\nTopshiriq (${task!.count} ta): ${round2(taskScore)}`;
      }
    });

    if (unassignedCol) {
      const u = unassigned.get(st.id);
      if (u) {
        row.getCell(unassignedCol).value = round2(u.score);
        row.getCell(unassignedCol).note = `${u.count} ta topshiriq — jurnalda mavzusi bilan dars yo'q`;
      }
      total += u?.score ?? 0;
    }

    // SUM "NB" matnini e'tiborsiz qoldiradi
    const from = colLetter(firstSession);
    const to = colLetter(totalCol - 1);
    row.getCell(totalCol).value =
      totalCol > firstSession
        ? { formula: `SUM(${from}${rowNo}:${to}${rowNo})`, result: round2(total) }
        : 0;
    row.getCell(totalCol).font = { bold: true };
  });

  // Ballar: kerak bo'lsa 2 kasr xonagacha, butunlar kasrsiz
  for (let c = firstSession; c <= totalCol; c++) ws.getColumn(c).numFmt = '0.##';

  finishSheet(ws, headerRowNo, totalCol, students.length);
}

/** Ustun kengliklari, chegaralar, markazlash */
function finishSheet(ws: ExcelJS.Worksheet, headerRowNo: number, lastCol: number, bodyRows: number) {
  ws.getColumn(1).width = 5;
  ws.getColumn(2).width = 30;
  for (let c = 3; c <= lastCol; c++) ws.getColumn(c).width = 11;

  for (let r = headerRowNo + 1; r <= headerRowNo + bodyRows; r++) {
    const row = ws.getRow(r);
    for (let c = 1; c <= lastCol; c++) {
      const cell = row.getCell(c);
      cell.border = allBorders;
      if (c !== 2) cell.alignment = { horizontal: 'center', vertical: 'middle' };
    }
  }
  ws.pageSetup = { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 };
}

/** Faylni yaratib, brauzerda yuklab olishni boshlaydi */
export async function exportJournal(journal: Journal, sheets: ExportSheet[]) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "O'quv jarayoni platformasi";
  wb.created = new Date();
  // Formulalar Excel/LibreOffice'da ochilganda qayta hisoblansin (exceljs 0 natijani yozmaydi)
  wb.calcProperties.fullCalcOnLoad = true;
  if (sheets.includes('davomat')) addAttendanceSheet(wb, journal);
  if (sheets.includes('baholar')) addGradesSheet(wb, journal);

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const part = sheets.length === 2 ? 'jurnal' : sheets[0];
  const safeCode = journal.subject.code.replace(/[^\w.-]+/g, '_');
  const today = new Date().toLocaleDateString('sv-SE');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${safeCode}_${journal.course}-kurs_${part}_${today}.xlsx`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
