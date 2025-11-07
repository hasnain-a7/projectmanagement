"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { CalendarDays } from "lucide-react";
import { Badge } from "./ui/badge";

type Project = {
  id?: string;
  title: string;
  dueDate?: string;
};

export function UpcomingDeadlines({ projects = [] }: { projects: Project[] }) {
  const sorted = [...projects]
    .filter((p) => p.dueDate)
    .sort(
      (a, b) =>
        new Date(a.dueDate ?? 0).getTime() - new Date(b.dueDate ?? 0).getTime()
    )
    .slice(0, 5);
  const navigate = useNavigate();
  const handleProjectClick = (id: string) => navigate(`projects/${id}`);
  return (
    <Card className="relative border border-border/50 rounded-lg w-full  max-h-min">
      <CardHeader className="px-3">
        <CardTitle className="flex items-center gap-2 text-xs font-semibold">
          <CalendarDays size={16} />
          Upcoming Deadlines
        </CardTitle>
        <Badge variant="outline" className="text-sx absolute top-2 right-3">
          {sorted.length}
        </Badge>
      </CardHeader>
      <ScrollArea className="w-full ">
        <CardContent className="p-0 max-h-[68px]">
          <div className="flex flex-col  px-2 ">
            {sorted.length > 0 ? (
              sorted.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleProjectClick(p?.id || "")}
                  className="flex justify-between text-xs px-2 py-1 text-muted-foreground rounded-md transition-transform duration-200 ease-in-out hover:bg-accent hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
                >
                  <h2 className=" max-w-[65%] cursor-pointer">{p.title}</h2>
                  <span className="text-foreground font-medium">
                    {new Date(p.dueDate ?? 0).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-xs text-center py-1">
                No upcoming deadlines
              </p>
            )}
          </div>
          <ScrollBar orientation="vertical" />
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
