import React, { useEffect, useState } from "react";
import { useTaskContext } from "@/TaskContext/TaskContext";
import Loader from "@/components/Loader";
import { useNavigate } from "react-router-dom";
import { ProjectCard } from "@/components/ProjectCard";
import type { Project } from "@/TaskContext/TaskContext";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ClipboardList,
  Clock,
  Rocket,
  Moon,
  XCircle,
  CheckCircle2,
} from "lucide-react";
const ProjectsBoard: React.FC = () => {
  const { projects = [], taskCache = {}, loading } = useTaskContext();
  const navigate = useNavigate();

  const statuses = [
    "backlog",
    "pending",
    "active",
    "inactive",
    "cancelled",
    "completed",
  ];

  const [groupedProjects, setGroupedProjects] = useState<
    Record<string, Project[]>
  >({});
  const [activeTab, setActiveTab] = useState("backlog");

  useEffect(() => {
    const grouped: Record<string, Project[]> = {};
    statuses.forEach((s) => (grouped[s] = []));
    projects.forEach((p) => {
      const st = (p.status ?? "backlog").toLowerCase();
      if (!grouped[st]) grouped[st] = [];
      grouped[st].push(p);
    });
    setGroupedProjects(grouped);
  }, [projects]);

  const handleProjectClick = (id: string) => navigate(`../projects/${id}`);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader />
      </div>
    );
  }

  return (
    <section className="w-full bg-background mt-4 rounded-xl border-none">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-2">
        <h1 className="text-2xl font-bold">Projects Status:</h1>
        <ScrollArea
          className="w-full sm:w-auto whitespace-nowrap rounded-md border 
          bg-background backdrop-blur-sm shadow-sm px-2 py-0.5"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex w-max gap-3 bg-transparent border-none">
              {statuses.map((status) => (
                <TabsTrigger
                  key={status}
                  value={status}
                  className={`relative flex items-center justify-center gap-2 
                  px-3 py-1 min-w-[110px] sm:min-w-[130px]
                  text-sm sm:text-base font-medium capitalize rounded-md
                  bg-background/60 border border-transparent
                  hover:bg-accent/10 hover:border-border/30 hover:shadow-sm
                  data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/90 data-[state=active]:to-primary
                  data-[state=active]:text-primary-foreground data-[state=active]:shadow-md
                  transition-all duration-300 ease-in-out`}
                >
                  {status === "backlog" && (
                    <ClipboardList className="w-4 h-4 text-muted-foreground" />
                  )}
                  {status === "pending" && (
                    <Clock className="w-4 h-4 text-yellow-500" />
                  )}
                  {status === "active" && (
                    <Rocket className="w-4 h-4 text-blue-500" />
                  )}
                  {status === "inactive" && (
                    <Moon className="w-4 h-4 text-gray-400" />
                  )}
                  {status === "cancelled" && (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  {status === "completed" && (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  )}
                  <span>{status}</span>

                  <span
                    className="absolute bottom-1 left-1/2 transform -translate-x-1/2 
                    h-[3px] w-0 bg-primary rounded-full transition-all duration-300
                    data-[state=active]:w-10"
                  />
                </TabsTrigger>
              ))}
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </Tabs>
        </ScrollArea>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {statuses.map((status) => {
          const projectsForStatus = groupedProjects[status] || [];

          return (
            <TabsContent key={status} value={status} className="mt-2 ">
              <ScrollArea className="h-[calc(100vh-300px)]  rounded-md">
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                  {projectsForStatus.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <p className="text-muted-foreground text-sm">
                        No projects found for this status.
                      </p>
                    </div>
                  ) : (
                    projectsForStatus.map((project) => (
                      <ProjectCard
                        key={project.id}
                        projectToShow={project}
                        tasks={taskCache[project.id!]?.tasks || []}
                        onClick={handleProjectClick}
                      />
                    ))
                  )}
                </div>

                <ScrollBar orientation="vertical" />
              </ScrollArea>
            </TabsContent>
          );
        })}
      </Tabs>
    </section>
  );
};

export default ProjectsBoard;
