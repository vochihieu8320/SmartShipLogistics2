import { useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from "recharts";
import { useTheme } from "@/components/ui/theme-provider";

// Sample data for the revenue chart
const revenueData = [
  { name: "Mon", revenue: 4000, expenses: 2400 },
  { name: "Tue", revenue: 3000, expenses: 1398 },
  { name: "Wed", revenue: 2000, expenses: 9800 },
  { name: "Thu", revenue: 2780, expenses: 3908 },
  { name: "Fri", revenue: 1890, expenses: 4800 },
  { name: "Sat", revenue: 2390, expenses: 3800 },
  { name: "Sun", revenue: 3490, expenses: 4300 }
];

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-md shadow-md p-2">
        <p className="font-semibold">{label}</p>
        <p className="text-primary">Revenue: ${payload[0].value}</p>
        <p className="text-destructive">Expenses: ${payload[1].value}</p>
      </div>
    );
  }

  return null;
};

export function RevenueChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="name" stroke="var(--foreground)" />
        <YAxis stroke="var(--foreground)" />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="revenue" fill="hsl(var(--chart-1))" name="Revenue" />
        <Bar dataKey="expenses" fill="hsl(var(--chart-2))" name="Expenses" />
      </BarChart>
    </ResponsiveContainer>
  );
}
