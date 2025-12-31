import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { Card, CardContent, Typography } from '@mui/material';

interface SpeciesChartProps {
  data: Array<{
    species: string;
    total: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const SpeciesChart: React.FC<SpeciesChartProps> = ({ data }) => {
  const chartData = data.map((item) => ({
    name: item.species,
    value: item.total,
  }));

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Distribuição por Espécie
        </Typography>
        {chartData.length === 0 ? (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
            Nenhum dado disponível
          </Typography>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => {
                  const percent = entry.percent || 0;
                  return `${entry.name}: ${(percent * 100).toFixed(0)}%`;
                }}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

