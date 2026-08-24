import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const PIE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--lilac)",
  "var(--mint)",
  "var(--gold)",
];

const tooltipStyle = {
  borderRadius: 14,
  border: "1px solid var(--border)",
  background: "var(--popover)",
  color: "var(--popover-foreground)",
  fontSize: 12,
  boxShadow: "var(--shadow-soft)",
};

export function SpendPie({ data }: { data: { name: string; value: number }[] }) {
  return (
    <div className="h-56 w-full sm:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="58%"
            outerRadius="88%"
            paddingAngle={3}
            stroke="none"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(v: number, n) => [`$${v.toLocaleString()}`, n as string]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function WealthChart({
  data,
}: {
  data: { year: number; invested: number; contributed: number }[];
}) {
  return (
    <div className="h-64 w-full sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 6, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="growth" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.85} />
              <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="contrib" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--grape)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--grape)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="year"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            tickFormatter={(y: number) => `${y}y`}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`)}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            labelFormatter={(y) => `Year ${y}`}
            formatter={(v: number, n) => [
              `$${v.toLocaleString()}`,
              n === "invested" ? "Portfolio" : "You put in",
            ]}
          />
          <Area
            type="monotone"
            dataKey="contributed"
            stroke="var(--grape)"
            strokeWidth={2}
            fill="url(#contrib)"
          />
          <Area
            type="monotone"
            dataKey="invested"
            stroke="var(--chart-1)"
            strokeWidth={3}
            fill="url(#growth)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
