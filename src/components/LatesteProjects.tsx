import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { FaEdit } from "react-icons/fa";
import { Badge } from "./ui/badge";
import { type Project } from "@/TaskContext/TaskContext";
import ProjectModol from "./ProjectModol";
import { useNavigate } from "react-router-dom";

interface LatestProjectProps {
  LatestProjects: Project[];
}

const LatestProject: React.FC<LatestProjectProps> = ({ LatestProjects }) => {
  const navigate = useNavigate();
  const handleNavigateToPage = (projectId: string | undefined) => {
    if (projectId) {
      navigate(`projects/${projectId}`);
    }
  };
  const top5UpdatedProjects = [...LatestProjects]
    .filter((p) => p.updatedAt)
    .sort(
      (a, b) =>
        new Date(b.updatedAt || "").getTime() -
        new Date(a.updatedAt || "").getTime()
    )
    .slice(0, 5);

  return (
    <Card className="w-full overscroll-none pb-1 pt-1 min-h-min border border-border/50 rounded-lg mt-2 bg-card transition-all duration-300">
      <CardHeader className="flex justify-between -ml-3">
        <CardTitle className="text-sm">Recently Updated Projects</CardTitle>
        <Badge variant="outline" className="text-xs -mr-3">
          {top5UpdatedProjects.length}
        </Badge>
      </CardHeader>

      {top5UpdatedProjects.length > 0 ? (
        <ScrollArea className="w-full pr-1">
          <CardContent className="max-h-[198px] p-0 -mt-1">
            <div className="flex flex-col gap-2 p-1">
              {top5UpdatedProjects.map((project) => (
                <Card
                  key={project.id}
                  className="border rounded-md p-2 relative transition-transform duration-200 ease-in-out hover:-translate-y-1 hover:shadow-md cursor-pointer"
                >
                  <CardContent className="p-0">
                    <div className="relative flex justify-between items-start">
                      <div>
                        <p
                          className="font-medium"
                          onClick={() => handleNavigateToPage(project.id)}
                        >
                          {project.title}
                        </p>
                        {/* <p className="text-sm text-gray-500">
                          Category: {project.Category || "N/A"}
                        </p> */}
                        <p className="text-xs text-gray-500">
                          UpdatedAt:{" "}
                          {new Date(
                            project.updatedAt || ""
                          ).toLocaleDateString()}
                        </p>
                        <p className="absolute bottom-0.5 right-1 text-xs text-gray-500">
                          Status:{" "}
                          {project.status &&
                            project?.status.charAt(0).toUpperCase() +
                              project?.status.slice(1)}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <FaEdit
                              size={16}
                              className="text-muted-foreground hover:text-primary cursor-pointer"
                            />
                          </DialogTrigger>
                          <ProjectModol ProjectToEdit={project} />
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </ScrollArea>
      ) : (
        <p className="text-center text-sm text-muted-foreground pb-3">
          No recent project updates found.
        </p>
      )}
    </Card>
  );
};

export default LatestProject;
