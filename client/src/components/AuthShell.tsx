import { Avatar, Box, Paper, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface AuthShellProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  children: ReactNode;
}

/** Kirish / ro'yxatdan o'tish sahifalari uchun markazlashgan karta (asosiy Layout'siz) */
export default function AuthShell({ icon, title, subtitle, children }: AuthShellProps) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        px: 2,
        py: 4,
      }}
    >
      <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 }, width: '100%', maxWidth: 420 }}>
        <Stack alignItems="center" spacing={1} sx={{ mb: 3 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>{icon}</Avatar>
          <Typography variant="h6">{title}</Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {subtitle}
          </Typography>
        </Stack>
        {children}
      </Paper>
    </Box>
  );
}
