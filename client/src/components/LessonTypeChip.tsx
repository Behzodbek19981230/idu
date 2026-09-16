import { Chip, useTheme, type ChipProps } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { lessonTypeColor, lessonTypeLabel, type LessonType } from '../types';

interface Props extends Omit<ChipProps, 'label' | 'color'> {
  type: LessonType;
}

/** Dars turini ikkala mavzu rejimida ham o'qiladigan rangda ko'rsatadi */
export default function LessonTypeChip({ type, ...props }: Props) {
  const theme = useTheme();
  const color = lessonTypeColor(type, theme.palette.mode);

  return (
    <Chip
      size="small"
      label={lessonTypeLabel(type)}
      {...props}
      sx={{
        bgcolor: alpha(color, theme.palette.mode === 'dark' ? 0.18 : 0.12),
        color,
        border: 1,
        borderColor: alpha(color, 0.25),
        ...props.sx,
      }}
    />
  );
}
