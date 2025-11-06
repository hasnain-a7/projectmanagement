import { useState, useEffect, useMemo, useCallback } from "react";
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
  SelectTrigger,
  SelectItem,
  SelectValue,
  SelectContent,
} from "./ui/select";
import { useTaskContext } from "@/TaskContext/TaskContext";
import { useUserContextId } from "@/AuthContext/UserContext";
import DatePicker from "./DatePicker";
import { Separator } from "./ui/separator";
import EmojiInput from "./EmojiInput";

type ProjectToEdit = {
  id?: string;
  title: string;
  description: string;
  Category?: string;
  attachments?: string[];
  dueDate?: string;
  status?: string;
  userId?: string;
  assignedUsers?: string[];
  projectEmoji?: string;
};

export default function ProjectModol({
  ProjectToEdit,
  onClose,
}: {
  ProjectToEdit?: ProjectToEdit;
  onClose?: () => void;
}) {
  const [formData, setFormData] = useState<ProjectToEdit>({
    title: "",
    description: "",
    Category: "",
    attachments: [],
    dueDate: "",
    status: "backlog",
    assignedUsers: [],
    projectEmoji: "",
  });
  const [deletedUserIds, setDeletedUserIds] = useState<string[]>([]);

  const { userContextId } = useUserContextId();
  const { loading, addProject, updateProject } = useTaskContext();
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
  const handleInputChange = useCallback(
    (field: keyof ProjectToEdit, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );
  useEffect(() => {
    if (ProjectToEdit) {
      setFormData({
        title: ProjectToEdit.title,
        description: ProjectToEdit.description || "",
        attachments: ProjectToEdit.attachments || [],
        Category: ProjectToEdit.Category || "",
        id: ProjectToEdit.id,
        dueDate: ProjectToEdit.dueDate || "",
        status: ProjectToEdit.status || "",
        assignedUsers: ProjectToEdit.assignedUsers || [],
        projectEmoji: ProjectToEdit.projectEmoji,
      });
    }
  }, [ProjectToEdit]);

  const handleSubmit = async () => {
    const requiredFields = [
      { field: "title", label: "Project Title" },
      { field: "description", label: "Description" },
      { field: "Category", label: "Category" },
      { field: "dueDate", label: "Due Date" },
      { field: "status", label: "Status" },
    ];

    const missing = requiredFields.filter(
      (f) => !formData[f.field as keyof ProjectToEdit]?.toString().trim()
    );

    if (missing.length > 0) {
      const missingList = missing.map((m) => m.label).join(", ");
      alert(`Please fill in all required fields: ${missingList}`);
      return;
    }

    const payload = {
      ...formData,
      userId: userContextId || "",
      emoji: formData.projectEmoji || "",
    };

    try {
      if (ProjectToEdit) {
        await updateProject(
          ProjectToEdit.id || "",
          payload.title,
          payload.description,
          payload.Category,
          payload.attachments,
          payload.dueDate,
          payload.status,
          payload.assignedUsers,
          deletedUserIds,
          payload.emoji
        );
      } else {
        await addProject(
          payload.title,
          payload.userId,
          payload.description,
          payload.Category || "",
          payload.attachments || [],
          payload.dueDate,
          payload.status,
          payload.emoji
        );
      }

      setFormData({
        title: "",
        description: "",
        attachments: [],
        Category: "",
        dueDate: "",
        status: "",
        assignedUsers: [],
        projectEmoji: "",
      });

      if (onClose) onClose();
    } catch (error) {
      console.error("Error saving project:", error);
      alert("An error occurred while saving the project.");
    }
  };

  const isOwner = ProjectToEdit
    ? ProjectToEdit?.userId === userContextId
    : true;
  return (
    <DialogContent className="w-[95vw] max-w-6xl max-h-[90vh] p-4 bg-background shadow-[0_8px_30px_rgba(0,0,0,0.1)] border border-border">
      <DialogHeader className="mb-6">
        <DialogTitle className="text-2xl font-semibold tracking-tight">
          {ProjectToEdit ? "Edit Project" : "Add New Project"}
        </DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          {ProjectToEdit
            ? "Update the project details below."
            : "Fill out the information to create a new project."}
        </DialogDescription>
      </DialogHeader>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Project Title
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
                  value={formData?.projectEmoji || ""}
                  onChange={(projectEmoji) =>
                    setFormData({ ...formData, projectEmoji })
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
              placeholder="Write a detailed project description..."
              rows={7}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="resize-none h-44 border-muted-foreground/20 mt-2"
            />
          </div>
        </div>

        <div className="flex flex-col h-full gap-4">
          <div className="bg-accent/25 rounded-lg p-4 border flex flex-col items-center justify-center gap-4">
            {formData.attachments?.[0] ? (
              <img
                src={formData.attachments[0]}
                alt="Preview"
                className="w-full  h-52 object-cover shadow-sm"
              />
            ) : (
              <div className="w-full  h-52 flex items-center justify-center border border-dashed text-muted-foreground text-sm">
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

      <Separator className="border-t mt-4 mb-4" />

      <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-2">
        <Input
          placeholder="Category"
          value={formData.Category}
          onChange={(e) =>
            setFormData({ ...formData, Category: e.target.value })
          }
        />

        <DatePicker
          value={formData.dueDate || ""}
          onChange={(date) => setFormData({ ...formData, dueDate: date || "" })}
        />

        <div className=" space-y-3">
          {!isOwner && (
            <p className="text-xs text-muted-foreground">
              you can only view assigned users.
            </p>
          )}

          {isOwner && (
            <Input
              placeholder="Assign project by Id"
              className="w-full"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const value = e.currentTarget.value.trim();

                  if (value && !formData.assignedUsers?.includes(value)) {
                    setFormData((prev) => ({
                      ...prev,
                      assignedUsers: [...(prev.assignedUsers || []), value],
                    }));
                  }

                  e.currentTarget.value = "";
                }
              }}
            />
          )}

          <div className="flex flex-wrap gap-2 mt-1">
            {formData.assignedUsers?.map((uid) => (
              <div
                key={uid}
                className="flex items-center gap-1 bg-muted text-foreground text-xs px-2 py-0.5 rounded-md"
              >
                {uid.slice(0, 4)}
                {isOwner && (
                  <button
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        assignedUsers: prev.assignedUsers?.filter(
                          (id) => id !== uid
                        ),
                      }));

                      setDeletedUserIds((prev) => [...prev, uid]);
                    }}
                    className="text-chart-5 hover:text-destructive ml-1 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <Select
          value={formData.status}
          onValueChange={(v) => handleInputChange("status", v)}
        >
          <SelectTrigger className="">
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
      </div>

      {/* Footer */}
      <DialogFooter className=" -mt-12 flex justify-end">
        <Button onClick={handleSubmit} disabled={loading} className="px-6">
          {loading
            ? ProjectToEdit
              ? "Updating..."
              : "Adding..."
            : ProjectToEdit
            ? "Update Project"
            : "Add Project"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
