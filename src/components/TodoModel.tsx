import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTaskContext, type Task } from "../TaskContext/TaskContext";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DatePicker from "./DatePicker";
import { useParams } from "react-router-dom";
import { Separator } from "./ui/separator";
import EmojiInput from "./EmojiInput";

export interface TaskFormData {
  title: string;
  todo: string;
  status: string;
  attachments: string[];
  dueDate: string;
  createdAt?: string;
  todoEmoji?: string;
}

interface TodoModelProps {
  projectId?: string;
  taskToEdit?: Task;
}

const TodoModel: React.FC<TodoModelProps> = ({ projectId, taskToEdit }) => {
  const { addTaskToProject, updateTaskInProject } = useTaskContext();
  const { projectid } = useParams();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    todo: "",
    status: "backlog",
    attachments: [],
    dueDate: "",
    createdAt: "",
    todoEmoji: "",
  });

  // ✅ Set task data only when editing
  useEffect(() => {
    if (taskToEdit) {
      setFormData({
        title: taskToEdit.title || "",
        todo: taskToEdit.todo || "",
        status: taskToEdit.status || "backlog",
        attachments: taskToEdit.attachments || [],
        dueDate: taskToEdit.dueDate || "",
        createdAt: taskToEdit.createdAt || "",
        todoEmoji: taskToEdit.todoEmoji,
      });
    } else {
      setFormData({
        title: "",
        todo: "",
        status: "backlog",
        attachments: [],
        dueDate: "",
        createdAt: "",
        todoEmoji: "",
      });
    }
  }, [taskToEdit]);

  const handleInputChange = useCallback(
    (field: keyof TaskFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleSubmit = useCallback(async () => {
    if (!formData.title.trim()) return;
    setLoading(true);

    try {
      const activeProjectId = projectId || projectid;
      if (!activeProjectId) throw new Error("❌ No project ID found");

      if (taskToEdit?.id) {
        await updateTaskInProject(activeProjectId, taskToEdit.id, formData);
      } else {
        await addTaskToProject(activeProjectId, formData);
      }

      // Reset form after success
      setFormData({
        title: "",
        todo: "",
        status: "backlog",
        attachments: [],
        dueDate: "",
        createdAt: "",
      });
    } catch (err) {
      console.error("❌ Error saving task:", err);
    } finally {
      setLoading(false);
    }
  }, [
    addTaskToProject,
    updateTaskInProject,
    projectId,
    projectid,
    formData,
    taskToEdit,
  ]);

  const statusOptions = useMemo(
    () => [
      "pending",
      "active",
      "inactive",
      "cancelled",
      "completed",
      "backlog",
    ],
    []
  );

  return (
    <DialogContent className="w-[95vw] max-w-6xl max-h-[90vh] p-4 bg-background shadow-[0_8px_30px_rgba(0,0,0,0.1)] border border-border">
      <DialogHeader className="mb-4">
        <DialogTitle className="text-2xl font-semibold tracking-tight">
          {taskToEdit ? "Edit Task" : "Add New Task"}
        </DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          {taskToEdit
            ? "Update the Task details below."
            : "Fill out the information to create a new Task."}
        </DialogDescription>
      </DialogHeader>

      <div className="grid md:grid-cols-[1fr_auto_1fr] gap-9 items-start">
        {/* Left Section */}
        <div className="flex flex-col gap-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Task Title
            </label>
            <div className="relative flex items-center gap-2 mt-2">
              <Input
                placeholder="Enter project title..."
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="flex-1 pr-10"
              />

              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <EmojiInput
                  value={formData?.todoEmoji || ""}
                  onChange={(todoEmoji) =>
                    setFormData({ ...formData, todoEmoji })
                  }
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Description
            </label>
            <Textarea
              placeholder="Write task details..."
              rows={7}
              value={formData.todo}
              onChange={(e) => handleInputChange("todo", e.target.value)}
              className="resize-none h-44 border-muted-foreground/20 mt-1"
            />
          </div>

          <div className="flex  justify-start items-center gap-4">
            <Select
              value={formData.status}
              onValueChange={(v) => handleInputChange("status", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div>
              <DatePicker
                value={formData.dueDate || ""}
                onChange={(date) => handleInputChange("dueDate", date || "")}
              />
            </div>
          </div>
        </div>

        {/* Vertical Separator */}
        <Separator
          orientation="vertical"
          className="h-full bg-border hidden md:block"
        />

        {/* Right Section */}
        <div className="flex flex-col h-full gap-4">
          <div className="bg-accent/25 rounded-lg p-4 flex flex-col items-center justify-center gap-4">
            {formData.attachments?.[0] ? (
              <img
                src={formData.attachments[0]}
                alt="Preview"
                className="w-full h-52 object-cover shadow-sm"
              />
            ) : (
              <div className="w-full h-52 flex items-center justify-center border border-dashed text-muted-foreground text-sm">
                No image uploaded
              </div>
            )}

            <Input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                if (file.size > 500 * 1024) {
                  alert("Image too large. Please upload under 500KB.");
                  return;
                }

                const toBase64 = (file: File) =>
                  new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = reject;
                  });

                const base64String = await toBase64(file);
                setFormData((prev) => ({
                  ...prev,
                  attachments: [base64String],
                }));
              }}
            />
          </div>
        </div>
      </div>

      <DialogFooter className="-mt-2 flex justify-end">
        <Button onClick={handleSubmit} disabled={loading} className="px-6">
          {loading
            ? taskToEdit
              ? "Updating..."
              : "Adding..."
            : taskToEdit
            ? "Update Task"
            : "Add Task"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default React.memo(TodoModel);
