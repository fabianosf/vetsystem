import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, Typography } from '@mui/material';

interface DiagnosticosChartProps {
  data: Array<{
    data: string;
    total: number;
    validados: number;
  }>;
}

export const DiagnosticosChart: React.FC<DiagnosticosChartProps> = ({ data }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Diagnósticos IA - Últimos 30 Dias
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="data"
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getDate()}/${date.getMonth() + 1}`;
              }}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('pt-BR');
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="total"
              stackId="1"
              stroke="#8884d8"
              fill="#8884d8"
              name="Total"
            />
            <Area
              type="monotone"
              dataKey="validados"
              stackId="2"
              stroke="#82ca9d"
              fill="#82ca9d"
              name="Validados"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

