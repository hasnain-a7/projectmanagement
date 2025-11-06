"use client";

import React from "react";
import { Plus, Users, Tag, Layers, ListCheck, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTaskContext, type Task } from "@/TaskContext/TaskContext";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import TaskDetailsAccordion from "./TaskDetailsAccordion";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import TodoModel from "./TodoModel";
import ProjectOptions from "./TaskAccOption";
import ProjectChatModal from "./ProjectChatModal";
interface TaskAccordionTableProps {
  tasks: Task[];
  loading: boolean;
  projectId: string | undefined;
}

const TaskAccordionTable: React.FC<TaskAccordionTableProps> = ({
  tasks,
  loading,
  projectId,
}) => {
  const { projects } = useTaskContext();
  const specifictaskdata = projects.find((project) => project.id === projectId);

  const getPriorityInfo = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffInTime = due.getTime() - today.getTime();
    const diffInDays = Math.ceil(diffInTime / (1000 * 3600 * 24));

    if (diffInDays < 0)
      return {
        label: "Overdue",
        className: "bg-destructive text-destructive-foreground line-through",
      };
    if (diffInDays <= 2)
      return { label: "High", className: "bg-primary text-primary-foreground" };
    if (diffInDays <= 7)
      return {
        label: "Medium",
        className: "bg-secondary text-secondary-foreground",
      };
    return { label: "Low", className: "bg-accent text-accent-foreground" };
  };

  const STATUSES = ["backlog", "pending", "inactive", "active", "completed"];

  // Group tasks by status, ensure dueDate is always a string
  const groupedTasks = tasks.reduce((acc, task) => {
    const status = task.status || "backlog";
    if (!acc[status]) acc[status] = [];
    acc[status].push({
      ...task,
      dueDate: task.dueDate || new Date().toISOString().split("T")[0],
    } as Task & { dueDate: string });
    return acc;
  }, {} as Record<string, (Task & { dueDate: string })[]>);

  const taskSections = STATUSES.map((status) => {
    let badgeColor = "bg-muted text-muted-foreground";
    switch (status) {
      case "pending":
        badgeColor =
          "bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
        break;
      case "active":
        badgeColor = "bg-primary text-primary-foreground";
        break;
      case "completed":
        badgeColor =
          "bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200";
        break;
    }
    return {
      id: status,
      title: status.charAt(0).toUpperCase() + status.slice(1),
      badgeColor,
      tasks: groupedTasks[status] || [],
    };
  });

  return (
    <Card className=" relative h-full rounded-none cursor-pointer bg-background p-0 ">
      {specifictaskdata?.attachments &&
        specifictaskdata?.attachments.length > 0 && (
          <img
            src={specifictaskdata?.attachments[0]}
            alt={specifictaskdata?.title ?? "Project image"}
            className="w-full h-64 md:h-64 object-cover mb-2"
          />
        )}
      <CardHeader>
        <CardTitle className=" flex sm:justify-between sm:items-center gap-2 text-lg">
          <div className="  flex items-center gap-2">
            {/* <FileText
              className="
            h-5 w-5 text-primary"
            /> */}
            <span className="text-4xl absolute top-59">
              {specifictaskdata?.projectEmoji && specifictaskdata?.projectEmoji}
            </span>

            <h5 className="text-[22px] md:font-semibold mt-2 ">
              {specifictaskdata &&
                specifictaskdata?.title.charAt(0).toUpperCase() +
                  specifictaskdata?.title.slice(1)}
              's Tasks
            </h5>
          </div>

          {!loading && (
            <div className="flex gap-1 ml-auto  md:ml-0 lg:ml-0">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="cursor-pointer">
                    <Plus className="h-4 w-4" />
                    <span className="hidden md:block">Add Task</span>
                  </Button>
                </DialogTrigger>

                <TodoModel projectId={projectId} />
              </Dialog>

              <ProjectOptions currentProjectDetails={specifictaskdata!} />
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <p className="line-clamp-5 text-gray-300">
            {specifictaskdata?.description ?? "No description available"}
          </p>

          <div className="flex flex-wrap items-center gap-4 absolute -bottom-8 text-[12px]   py-2 rounded-xl shadow-sm">
            <div className="flex items-center gap-1.5">
              <ListCheck className="w-4 h-4 text-blue-500" />
              <span>{tasks?.length ?? 0} Tasks</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-green-500" />
              <span>Status: {specifictaskdata?.status || "Backlog"}</span>
            </div>

            {specifictaskdata?.Category && (
              <div className="hidden md:flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-purple-500" />
                <span>Category: {specifictaskdata?.Category || ""}</span>
              </div>
            )}

            <div className="hidden md:flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-500" />
              <span>
                Created day:{" "}
                {specifictaskdata?.createdAt
                  ? new Date(specifictaskdata.createdAt).toLocaleDateString()
                  : "—"}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-orange-500" />
              <span>
                {specifictaskdata?.assignedUsers?.length
                  ? `${specifictaskdata.assignedUsers.length} Users`
                  : "No Assignees"}
              </span>
            </div>
          </div>
        </div>
        <div className="fixed bottom-8 right-4 z-50">
          <ProjectChatModal projectId={projectId!} />
        </div>

        <Accordion
          type="multiple"
          defaultValue={["backlog"]}
          className="space-y-2 mt-8"
        >
          {taskSections.map((section) => (
            <AccordionItem key={section.id} value={section.id}>
              <AccordionTrigger className="px-0 py-2 hover:no-underline ">
                <div className="flex items-center">
                  <Badge
                    className={`${section.badgeColor} w-20 mr-3 rounded-sm`}
                  >
                    {section.title}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    • {section.tasks.length} Task
                    {section.tasks.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </AccordionTrigger>

              <AccordionContent className="px-0 pb-0 ">
                <div>
                  <div className="hidden  sm:grid grid-cols-12 gap-2 px-3 py-2 bg-accent text-card-foreground text-xs font-semibold uppercase rounded-t-2xl">
                    <div className="col-span-5">Name</div>
                    <div className="col-span-2">Priority</div>
                    <div className="col-span-2">Due Date</div>
                    <div className="col-span-3">Created</div>
                  </div>

                  {section.tasks.map((task) => (
                    <div key={task.id} className="border-b pb-2 ">
                      <div className="hidden sm:grid grid-cols-12 gap-2 py-2 items-center">
                        <div className="col-span-5 ">
                          <TaskDetailsAccordion
                            task={task}
                            projectid={projectId ?? ""}
                          />
                        </div>
                        <div className="col-span-2 flex items-center">
                          <Badge
                            className={getPriorityInfo(task.dueDate).className}
                          >
                            {getPriorityInfo(task.dueDate).label}
                          </Badge>
                        </div>
                        <div className="col-span-2 flex items-center">
                          <span className="text-sm">
                            {task.dueDate
                              ? new Date(task.dueDate).toLocaleDateString()
                              : "—"}
                          </span>
                        </div>
                        <div className="col-span-3 flex items-center">
                          <span className="text-sm">
                            {task.createdAt
                              ? new Date(task.createdAt).toLocaleDateString()
                              : "—"}
                          </span>
                        </div>
                      </div>

                      <div className="sm:hidden flex flex-col gap-2 ">
                        <TaskDetailsAccordion
                          task={task}
                          projectid={projectId ?? ""}
                        />
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">Priority:</span>
                          <Badge
                            className={getPriorityInfo(task.dueDate).className}
                          >
                            {getPriorityInfo(task.dueDate).label}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">Due Date:</span>
                          <span>
                            {task.dueDate
                              ? new Date(task.dueDate).toLocaleDateString()
                              : "—"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">Created:</span>
                          <span>
                            {task.createdAt
                              ? new Date(task.createdAt).toLocaleDateString()
                              : "—"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default TaskAccordionTable;
