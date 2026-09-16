import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import LinkIcon from '@mui/icons-material/Link';
import { Alert, Box, Chip, Paper, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { ReactNode } from 'react';
import LessonTypeChip from './LessonTypeChip';
import Markdown from './Markdown';
import type { Topic } from '../types';

function Section({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, mb: 2 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
        {icon}
        <Typography variant="subtitle1">{title}</Typography>
      </Stack>
      {children}
    </Paper>
  );
}

interface Props {
  topic: Topic;
  /** Sarlavha ustidagi qism (breadcrumbs va h.k.) */
  header?: ReactNode;
  /** Sarlavha yonidagi tugmalar */
  actions?: ReactNode;
  /** Sahifa oxiri (oldingi/keyingi tugmalari va h.k.) */
  footer?: ReactNode;
}

/** Dars qo'llanmasining to'liq ko'rinishi — ham asosiy saytda, ham ulashilgan sahifada ishlatiladi */
export default function LessonView({ topic, header, actions, footer }: Props) {
  const objectives = topic.objectives
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const keywords = topic.keywords
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);

  return (
    <Box sx={{ maxWidth: 940, mx: 'auto' }}>
      {header}

      <Box
        sx={(theme) => ({
          p: { xs: 2.5, md: 3 },
          mb: 3,
          borderRadius: 3,
          border: 1,
          borderColor: 'divider',
          bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.08 : 0.05),
        })}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'flex-start' }}
          spacing={2}
        >
          <Box>
            <Typography variant="h4" sx={{ mb: 1.5, lineHeight: 1.25 }}>
              {topic.title}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
              <LessonTypeChip type={topic.lesson_type} />
              {topic.week != null && (
                <Chip size="small" variant="outlined" label={`${topic.week}-hafta`} />
              )}
              <Chip size="small" variant="outlined" label={`${topic.hours} soat`} />
            </Stack>
          </Box>
          {actions && (
            <Stack direction="row" spacing={1} sx={{ flexShrink: 0, displayPrint: 'none' }}>
              {actions}
            </Stack>
          )}
        </Stack>

        {topic.summary && (
          <Typography color="text.secondary" sx={{ mt: 2, lineHeight: 1.7 }}>
            {topic.summary}
          </Typography>
        )}
      </Box>

      {objectives.length > 0 && (
        <Section icon={<FlagOutlinedIcon color="primary" fontSize="small" />} title="Dars maqsadlari">
          <Box component="ul" sx={{ pl: 3, m: 0 }}>
            {objectives.map((item, i) => (
              <Typography component="li" variant="body2" key={i} sx={{ mb: 0.5, lineHeight: 1.7 }}>
                {item}
              </Typography>
            ))}
          </Box>
        </Section>
      )}

      {keywords.length > 0 && (
        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
          {keywords.map((k) => (
            <Chip key={k} label={k} size="small" variant="outlined" />
          ))}
        </Stack>
      )}

      {topic.content ? (
        <Paper variant="outlined" sx={{ p: { xs: 2, md: 4 }, mb: 2 }}>
          <Markdown>{topic.content}</Markdown>
        </Paper>
      ) : (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Dars qo'llanmasi matni hali kiritilmagan.
        </Alert>
      )}

      {topic.assignments && (
        <Section
          icon={<AssignmentOutlinedIcon color="secondary" fontSize="small" />}
          title="Topshiriqlar"
        >
          <Markdown>{topic.assignments}</Markdown>
        </Section>
      )}

      {topic.resources && (
        <Section icon={<LinkIcon color="action" fontSize="small" />} title="Adabiyotlar va manbalar">
          <Markdown>{topic.resources}</Markdown>
        </Section>
      )}

      {footer}
    </Box>
  );
}
