import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { FaEdit } from "react-icons/fa";
import TodoModel from "./TodoModel";
import { Badge } from "./ui/badge";
import { Eye } from "lucide-react";
import TaskDetailModal from "./TrelloDetailPage";

interface LatestTask {
  id?: string;
  title: string;
  todo: string;
  createdAt: string;
  updatedAt?: string;
  status: string;
  attachments?: string[];
  dueDate?: string;
  userId?: string | null;
  projectId?: string;
  projectTitle: string;
}
interface LatestUpdatedTasksProps {
  latestTasks: LatestTask[];
}

const LatestUpdatedTasks: React.FC<LatestUpdatedTasksProps> = ({
  latestTasks,
}) => {
  return (
    <Card
      className={`w-full  pb-1 pt-1 min-h-min border-none border-border/50 rounded-lg mt-2 bg-card transition-all duration-300 `}
    >
      <CardHeader className="flex justify-between -ml-3">
        <CardTitle className="text-md">Recently Updated Tasks</CardTitle>
        <Badge variant="outline" className="text-sm -mr-3">
          {latestTasks.length}
        </Badge>
      </CardHeader>

      {latestTasks.length > 0 && (
        <ScrollArea className=" w-full pr-1">
          <CardContent className="max-h-[355px] p-0 -mt-1">
            <div className="flex flex-col gap-2 p-1">
              {latestTasks.map((task) => (
                <Card
                  key={task.id}
                  className="border rounded-md p-2 relative transition-transform duration-200 ease-in-out hover:-translate-y-1 hover:shadow-md cursor-pointer"
                >
                  <CardContent className="p-0">
                    <div className="relative flex justify-between items-start">
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-gray-500">
                          Project: {task.projectTitle}
                        </p>
                        <p className="text-xs text-gray-500">
                          UpdatedAt:{" "}
                          {new Date(task.updatedAt || "").toLocaleDateString()}
                        </p>
                        <p className="absolute bottom-0.5 right-1 text-xs text-gray-500">
                          Status:{" "}
                          {task.status.charAt(0).toUpperCase() +
                            task.status.slice(1)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Eye
                              size={20}
                              className="text-muted-foreground hover:text-primary cursor-pointer"
                            />
                          </DialogTrigger>

                          <TaskDetailModal task={task} />
                        </Dialog>

                        <Dialog>
                          <DialogTrigger asChild>
                            <FaEdit
                              size={16}
                              className="text-muted-foreground hover:text-primary cursor-pointer"
                            />
                          </DialogTrigger>

                          <TodoModel
                            projectId={task.projectId}
                            taskToEdit={task}
                          />
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>{" "}
        </ScrollArea>
      )}
    </Card>
  );
};

export default LatestUpdatedTasks;
