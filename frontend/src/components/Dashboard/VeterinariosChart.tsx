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

interface VeterinariosChartProps {
  data: Array<{
    nome: string;
    especialidade: string;
    total_consultas: number;
  }>;
}

export const VeterinariosChart: React.FC<VeterinariosChartProps> = ({ data }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Top 10 Veterinários - Performance
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="nome" type="category" width={100} />
            <Tooltip />
            <Legend />
            <Bar dataKey="total_consultas" fill="#82ca9d" name="Consultas" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

