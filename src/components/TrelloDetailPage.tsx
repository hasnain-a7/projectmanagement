import React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock } from "lucide-react";
import { FaEdit } from "react-icons/fa";
import TodoModel from "./TodoModel";
import type { Task } from "@/TaskContext/TaskContext";
type TaskDetailModalProps = {
  task: Task;
  projectId?: string;
};

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  projectId,
}) => {
  if (!task) return null;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "default";
      case "completed":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <DialogContent
      className={`w-[95vw] max-w-6xl ${
        task?.attachments && task?.attachments?.length > 0
          ? "max-h-[80vh]"
          : "max-h-[50vh]"
      }  overflow-y-auto rounded-2xl border border-border bg-background shadow-xl p-0`}
    >
      {task.attachments && task.attachments.length > 0 && (
        <div className="w-full h-48 sm:h-64 md:h-72 bg-muted relative overflow-hidden">
          <img
            src={task.attachments[0]}
            alt="Task attachment"
            className="w-full h-full object-cover"
          />{" "}
        </div>
      )}
      {/* ✅ Add description here */}
      <DialogDescription></DialogDescription>
      <div className="p-6 sm:p-8 space-y-6">
        <DialogHeader>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <DialogTitle className="text-2xl font-bold text-foreground">
                {task.title}
              </DialogTitle>

              <Dialog>
                <DialogTrigger asChild>
                  <button
                    title="Edit Task"
                    className="p-2 rounded-md hover:bg-muted transition-colors"
                  >
                    <FaEdit
                      size={18}
                      className="text-muted-foreground hover:text-primary"
                    />
                  </button>
                </DialogTrigger>
                <TodoModel projectId={projectId} taskToEdit={task} />
              </Dialog>
            </div>

            <Badge
              variant={getStatusVariant(task.status)}
              className="w-fit px-3 py-1 text-sm capitalize"
            >
              {task.status}
            </Badge>
          </div>
        </DialogHeader>

        <Separator />

        {/* 🔹 Description */}
        {task.todo && (
          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Description
            </h3>
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
              {task.todo}
            </p>
          </section>
        )}

        <Separator />

        {/* 🔹 Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {task.dueDate && (
            <div className="flex items-start gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Due Date
                </p>
                <p className="text-sm font-semibold">
                  {formatDate(task.dueDate)}
                </p>
              </div>
            </div>
          )}

          {task.createdAt && (
            <div className="flex items-start gap-2">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Created At
                </p>
                <p className="text-sm font-semibold">
                  {formatDate(task.createdAt)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 🔹 Last Updated */}
        {task.updatedAt && (
          <>
            <Separator />
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Last Updated
              </p>
              <p className="text-sm">{formatDate(task.updatedAt)}</p>
            </div>
          </>
        )}
      </div>
    </DialogContent>
  );
};

export default TaskDetailModal;
