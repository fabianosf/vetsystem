import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, Typography } from '@mui/material';

interface StatusChartProps {
  data: Array<{
    status: string;
    total: number;
  }>;
}

export const StatusChart: React.FC<StatusChartProps> = ({ data }) => {
  const statusMap: { [key: string]: string } = {
    agendada: 'Agendada',
    confirmada: 'Confirmada',
    em_andamento: 'Em Andamento',
    concluida: 'Concluída',
    cancelada: 'Cancelada',
  };

  const chartData = data.map((item) => ({
    ...item,
    status: statusMap[item.status] || item.status,
  }));

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Consultas por Status
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="status" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total" fill="#8884d8" name="Total" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
