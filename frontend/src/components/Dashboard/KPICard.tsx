import React from 'react';
import { Card, CardContent, Box, Typography, Chip } from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';

interface KPICardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon: SvgIconComponent;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  trend?: number; // Percentual de crescimento
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  trend,
  prefix = '',
  suffix = '',
  decimals = 0,
}) => {
  const gradientMap = {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    success: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    warning: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    error: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
    info: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
    >
      <Card
        elevation={2}
        sx={{
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: 6,
            '& .icon-container': {
              transform: 'scale(1.1) rotate(5deg)',
            },
          },
        }}
      >
        {/* Background Gradient */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '120px',
            height: '120px',
            background: gradientMap[color],
            opacity: 0.1,
            borderRadius: '50%',
            transform: 'translate(30%, -30%)',
          }}
        />

        <CardContent>
          <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
            {/* Título */}
            <Box flex={1}>
              <Typography
                variant="body2"
                color="text.secondary"
                fontWeight={500}
                gutterBottom
              >
                {title}
              </Typography>
            </Box>

            {/* Ícone */}
            <Box
              className="icon-container"
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                background: gradientMap[color],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.3s ease',
              }}
            >
              <Icon sx={{ color: 'white', fontSize: 28 }} />
            </Box>
          </Box>

          {/* Valor Animado */}
          <Typography
            variant="h3"
            fontWeight={700}
            color="text.primary"
            sx={{ mb: 1 }}
          >
            {prefix}
            <CountUp
              end={value}
              duration={2}
              separator="."
              decimals={decimals}
              decimal=","
            />
            {suffix}
          </Typography>

          {/* Subtitle e Trend */}
          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}

            {trend !== undefined && trend !== 0 && (
              <Chip
                label={`${trend > 0 ? '+' : ''}${trend}%`}
                size="small"
                color={trend > 0 ? 'success' : 'error'}
                sx={{
                  height: 20,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                }}
              />
            )}
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};
