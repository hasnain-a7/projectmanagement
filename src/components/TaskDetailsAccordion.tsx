import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Eye, FileText } from "lucide-react";
import TaskDetailModal from "./TrelloDetailPage";
import { MdDeleteOutline } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import type { Task } from "@/TaskContext/TaskContext";
import { useTaskContext } from "@/TaskContext/TaskContext";
import TodoModel from "./TodoModel";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

const TaskDetailsAccordion = ({
  task,
  projectid,
}: {
  task: Task & { dueDate: string };
  projectid: string;
}) => {
  const { deleteTaskFromProject } = useTaskContext();

  const handleDelChange = async (taskId: string) => {
    try {
      if (window.confirm("Are you sure you want to delete this task?")) {
        await deleteTaskFromProject(projectid, taskId || "");
      }
    } catch (error) {
      console.log("err: ", error);
    }
  };

  return (
    <>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem
          value={`task-${task.id}`}
          className="border-b last:border-b-0  cursor-pointer"
        >
          <AccordionTrigger className="hover:no-underline md:px-3 py-0">
            <div className="flex gap-1 items-center w-full cursor-pointer">
              {task?.todoEmoji ? (
                <span className="text-[13px]">{task?.todoEmoji}</span>
              ) : (
                <div className="w-3 h-3 rounded-full bg-cyan-400 ml-0.5 mr-1 "></div>
              )}
              <span className="flex w-full text-sm font-medium justify-between truncate">
                {task.title?.split(" ").slice(0, 4).join(" ")}
                <div className=" flex gap-2">
                  <Dialog>
                    <DialogTrigger
                      asChild
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <Eye
                        size={20}
                        className="text-muted-foreground hover:text-primary cursor-pointer"
                      />
                    </DialogTrigger>
                    <TaskDetailModal task={task} />
                  </Dialog>
                  <MdDeleteOutline
                    size={18}
                    className=" text-muted-foreground hover:text-primary cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelChange(task.id || "");
                    }}
                  />
                  <Dialog>
                    <DialogTrigger asChild>
                      <FaEdit
                        size={16}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="text-muted-foreground hover:text-primary cursor-pointer"
                      />
                    </DialogTrigger>
                    <TodoModel projectId={projectid} taskToEdit={task} />
                  </Dialog>
                </div>
              </span>
            </div>
          </AccordionTrigger>

          <AccordionContent className="p-2">
            <div className="w-full rounded-lg bg-muted p-3 relative">
              <div className="flex">
                <div className="space-y-4 ">
                  <div className="w-full ">
                    <div className="flex justify-between items-center mb-2 ">
                      <div className="flex gap-0.5">
                        <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Description
                        </p>
                      </div>
                    </div>

                    <p className="text-sm max-w-full break-words whitespace-pre-wrap text-foreground/80 line-clamp-3">
                      {task.todo}
                    </p>
                  </div>
                </div>
              </div>
              {/* <Dialog>
                <DialogTrigger asChild>
                  <Eye
                    size={20}
                    className="absolute top-2 right-2 text-muted-foreground hover:text-primary cursor-pointer"
                  />
                </DialogTrigger>
                <TaskDetailModal task={task} />
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <FaEdit
                    size={16}
                    className="absolute top-2 right-14 text-muted-foreground hover:text-primary cursor-pointer"
                  />
                </DialogTrigger>
                <TodoModel projectId={projectid} taskToEdit={task} />
              </Dialog>

              <MdDeleteOutline
                size={18}
                className="absolute top-2 right-8 text-muted-foreground hover:text-primary cursor-pointer"
                onClick={() => handleDelChange(task.id || "")}
              /> */}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
};

export default TaskDetailsAccordion;
