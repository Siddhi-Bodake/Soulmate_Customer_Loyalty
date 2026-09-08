"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  visit_count: {
    label: "Visits",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export function VisitsChart({
  data,
}: {
  data: { day: string; visit_count: number }[];
}) {
  const chartData = data.map((d) => ({
    ...d,
    label: new Date(d.day + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "short",
    }),
  }));

  return (
    <ChartContainer config={chartConfig} className="h-64 w-full">
      <BarChart data={chartData}>
        <CartesianGrid vertical={false} strokeDasharray="4 4" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="visit_count" fill="var(--color-visit_count)" radius={6} />
      </BarChart>
    </ChartContainer>
  );
}
