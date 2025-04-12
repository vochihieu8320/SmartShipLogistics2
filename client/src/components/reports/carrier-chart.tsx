import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, TooltipProps } from "recharts";

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

interface CarrierData {
  carrier: string;
  count: number;
}

interface CarrierChartProps {
  data?: CarrierData[];
}

const defaultData = [
  { carrier: "UPS", count: 400 },
  { carrier: "FedEx", count: 300 },
  { carrier: "DHL", count: 200 },
  { carrier: "SF Express", count: 100 },
];

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-md shadow-md p-2">
        <p className="font-semibold">{`${payload[0].name}`}</p>
        <p>{`Orders: ${payload[0].value}`}</p>
        <p>{`Percentage: ${((payload[0].value as number) / getTotalCount(payload[0].payload.data) * 100).toFixed(1)}%`}</p>
      </div>
    );
  }

  return null;
};

function getTotalCount(data: CarrierData[]) {
  return data.reduce((sum, item) => sum + item.count, 0);
}

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function CarrierChart({ data = defaultData }: CarrierChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={110}
          fill="#8884d8"
          dataKey="count"
          nameKey="carrier"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
