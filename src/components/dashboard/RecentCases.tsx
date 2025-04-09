
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderClosed } from "lucide-react";

const recentCases = [
  {
    id: 1,
    title: "Smith v. Jones LLC",
    type: "Corporate Litigation",
    status: "active",
    date: "Apr 12, 2023",
    nextHearing: "Jun 15, 2023",
  },
  {
    id: 2,
    title: "Davidson Estate Planning",
    type: "Estate Planning",
    status: "pending",
    date: "Apr 15, 2023",
    nextHearing: "N/A",
  },
  {
    id: 3,
    title: "Westlake Merger",
    type: "M&A",
    status: "active",
    date: "Apr 18, 2023",
    nextHearing: "N/A",
  },
  {
    id: 4,
    title: "Harris IP Dispute",
    type: "Intellectual Property",
    status: "closed",
    date: "Mar 30, 2023",
    nextHearing: "Completed",
  },
];

export function RecentCases() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-md font-medium">Recent Cases</CardTitle>
        <a href="/cases" className="text-sm text-primary hover:underline">
          View All
        </a>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Case</th>
                <th className="text-left py-3 px-4 font-medium">Type</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">Date</th>
                <th className="text-left py-3 px-4 font-medium">Next Hearing</th>
              </tr>
            </thead>
            <tbody>
              {recentCases.map((caseItem) => (
                <tr key={caseItem.id} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <FolderClosed size={16} className="text-muted-foreground" />
                      <span className="font-medium">{caseItem.title}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{caseItem.type}</td>
                  <td className="py-3 px-4">
                    <Badge variant={
                      caseItem.status === "active" ? "default" : 
                      caseItem.status === "pending" ? "outline" : 
                      "secondary"
                    }>
                      {caseItem.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{caseItem.date}</td>
                  <td className="py-3 px-4 text-muted-foreground">{caseItem.nextHearing}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
