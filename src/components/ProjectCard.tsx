import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
} from "./ui/card";

import { Progress } from "./ui/progress";
import { Calendar, Paperclip, UsersIcon } from "lucide-react";
import { FaEdit } from "react-icons/fa";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

import ProjectModol from "./ProjectModol";

interface Task {
  id?: string;
  title: string;
  status: string;
}

interface Project {
  id?: string;
  title: string;
  description: string;
  url?: string;
  createdAt: string;
  Category: string;
  dueDate?: string;
  label?: string;
  priority?: string;
  attachments?: string[];
  assignedUsers?: string[];
  comments?: number;
  members?: { avatar: string; name: string }[];
  projectEmoji?: string;
}

interface ProjectCardProps {
  projectToShow: Project;
  tasks: Task[];
  onClick?: (projectId: string) => void;
}

export const ProjectCard = ({
  projectToShow,
  tasks,
  onClick,
}: ProjectCardProps) => {
  const calculateProgress = (completed: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const getTaskStats = (tasks?: Task[]) => {
    if (!tasks || !Array.isArray(tasks)) {
      return { completed: 0, inProgress: 0, pending: 0, total: 0 };
    }

    const stats = tasks.reduce(
      (acc, task) => {
        switch (task.status) {
          case "completed":
            acc.completed++;
            break;
          case "in-progress":
            acc.inProgress++;
            break;
          case "pending":
            acc.pending++;
            break;
        }
        return acc;
      },
      { completed: 0, inProgress: 0, pending: 0 }
    );

    return { ...stats, total: tasks.length };
  };
  const { completed, total } = getTaskStats(tasks);
  const percentage = calculateProgress(completed, total);
  const handleCardClick = () => {
    if (projectToShow.id) {
      onClick?.(projectToShow.id);
    }
  };

  return (
    <Card className="w-full relative border border-border/50 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden pb-1">
      {projectToShow?.attachments && projectToShow.attachments.length > 0 ? (
        <div className="w-full  h-30 md:h-12 -mt-3">
          <img
            src={projectToShow.attachments[0]}
            alt={projectToShow.title}
            className="w-full h-full object-cover "
          />
        </div>
      ) : (
        <div className="w-full  h-22 md:h-12 -mt-3">
          <img src={"hero.png"} className="w-full h-full object-cover " />
        </div>
      )}

      <CardHeader className="-mt-1">
        <div className="flex justify-between items-start">
          <Dialog>
            <DialogTrigger asChild>
              <FaEdit
                size={16}
                className=" absolute top-32 md:top-13 right-2 text-muted-foreground hover:text-primary cursor-pointer"
              />
            </DialogTrigger>

            <ProjectModol ProjectToEdit={projectToShow} />
          </Dialog>
        </div>
        {projectToShow?.projectEmoji && (
          <span className="text-lg absolute top-30 md:top-12 left-0">
            {projectToShow.projectEmoji}
          </span>
        )}
      </CardHeader>

      <CardContent
        className="flex flex-col gap-1 -mt-2 -ml-3 px-4"
        onClick={handleCardClick}
      >
        <CardTitle
          className={`text-base font-semibold ${
            projectToShow?.projectEmoji && "ml-6"
          }`}
        >
          <span>
            {projectToShow?.title.charAt(0).toUpperCase() +
              projectToShow?.title.slice(1)}
          </span>
        </CardTitle>

        <p className="text-sm text-muted-foreground line-clamp-2 ">
          {projectToShow.description || "No description  provided."}
        </p>

        <div className="flex items-center flex-wrap gap-2 text-xs">
          <span className="text-xs text-gray-500 flex gap-0.5">
            <Calendar size={14} />
            <p className="text-xs text-gray-500">
              {projectToShow?.createdAt
                ? new Date(projectToShow.createdAt).toLocaleDateString()
                : "No date"}
            </p>
          </span>

          <div className="flex gap-2">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Paperclip className="w-3 h-3" />
              {projectToShow?.attachments?.length || 0}
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <UsersIcon className="w-3 h-3" />
              {projectToShow?.assignedUsers?.length || 0}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between -ml-3 px-4">
        <div className="flex items-center gap-2 flex-1">
          <Progress value={percentage} className="h-2 flex-1 rounded-full" />
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {completed}/{total}
          </span>
        </div>

        {/* {projectToShow?.assignedUsers &&
          projectToShow.assignedUsers?.length > 0 && (
            <div className="flex  -space-x-2 -mt-2 ml-2 -mr-2">
              {projectToShow.assignedUsers.slice(0, 3).map((i) => (
                <img
                  key={i}
                  src={"/public/hero.png"}
                  className="w-5 h-5 rounded-full border-2 border-background object-cover"
                />
              ))}
            </div>
          )}
        {projectToShow?.assignedUsers &&
          projectToShow?.assignedUsers?.length > 3 && (
            <span className="w-5 h-5 flex items-center -mr-3 justify-center rounded-full bg-muted text-[10px] font-medium border border-background -mt-2">
              +{projectToShow?.assignedUsers.length - 3}
            </span>
          )} */}
      </CardFooter>
    </Card>
  );
};
