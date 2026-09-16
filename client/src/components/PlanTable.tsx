import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import LessonTypeChip from './LessonTypeChip';
import type { TopicListItem } from '../types';

interface Props {
  topics: TopicListItem[];
  onSelect?: (topic: TopicListItem) => void;
}

/** Kalendar-tematik reja jadvali */
export default function PlanTable({ topics, onSelect }: Props) {
  const totalHours = topics.reduce((sum, t) => sum + t.hours, 0);

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell width={50}>№</TableCell>
            <TableCell width={80}>Hafta</TableCell>
            <TableCell>Mavzu</TableCell>
            <TableCell width={140}>Dars turi</TableCell>
            <TableCell width={70} align="center">
              Soat
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {topics.map((topic, index) => (
            <TableRow
              key={topic.id}
              hover={Boolean(onSelect)}
              sx={{ cursor: onSelect ? 'pointer' : 'default' }}
              onClick={() => onSelect?.(topic)}
            >
              <TableCell>{index + 1}</TableCell>
              <TableCell>{topic.week ?? '—'}</TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight={500}>
                  {topic.title}
                </Typography>
                {topic.summary && (
                  <Typography variant="caption" color="text.secondary">
                    {topic.summary}
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <LessonTypeChip type={topic.lesson_type} />
              </TableCell>
              <TableCell align="center">{topic.hours}</TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell colSpan={4} align="right" sx={{ fontWeight: 600 }}>
              Jami:
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 600 }}>
              {totalHours}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}
