
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase } from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

// Sample data for case types chart
const caseTypeData = [
  { name: "Corporate", value: 35 },
  { name: "Litigation", value: 25 },
  { name: "Estate", value: 15 },
  { name: "IP", value: 15 },
  { name: "Other", value: 10 },
];

const COLORS = ["#56B99F", "#F6B656", "#7386FF", "#E6707F", "#9879E9"];

export function CaseDistribution() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-medium flex items-center gap-2">
          <Briefcase size={16} />
          Case Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={caseTypeData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={2}
              dataKey="value"
            >
              {caseTypeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
            <Legend
              layout="vertical"
              verticalAlign="middle"
              align="right"
              iconType="circle"
              iconSize={8}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
