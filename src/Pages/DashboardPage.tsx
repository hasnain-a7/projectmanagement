import React, { useState, useEffect } from "react";
import { useTaskContext } from "../TaskContext/TaskContext";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { db } from "../Config/firbase";
import { updateDoc, doc } from "firebase/firestore";
import { useParams } from "react-router-dom";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import TodoModel from "@/components/TodoModel";
import { FaEdit } from "react-icons/fa";
import { ChevronsRightLeft, Plus } from "lucide-react";
import TaskDetailModal from "@/components/TrelloDetailPage";
import { MdDeleteOutline } from "react-icons/md";
import Loader from "@/components/Loader";

const DashboardPage: React.FC = () => {
  const { taskCache, loading } = useTaskContext();
  const { projectId } = useParams();
  const [cardWidth, setcardWidth] = useState<boolean>(false);
  const [statusTasks, setStatusTasks] = useState<{ [key: string]: any[] }>({});
  const Navigate = useNavigate();
  const statuses = ["backlog", "pending", "active", "inactive", "completed"];
  const { deleteTaskFromProject } = useTaskContext();
  useEffect(() => {
    if (!projectId) return;

    const project = taskCache[projectId];
    const projectTasks = project?.tasks;

    const statusTasksObj: { [key: string]: any[] } = {};
    statuses.forEach((status) => {
      statusTasksObj[status] = projectTasks?.filter(
        (task) => task.status === status
      );
    });

    setStatusTasks(statusTasksObj);
  }, [projectId, taskCache]);

  const updateTaskStatusInFirebase = async (
    taskId: string,
    newStatus: string
  ) => {
    try {
      const projectId = Object.keys(taskCache).find((pid) =>
        taskCache[pid].tasks.some((t) => t.id === taskId)
      );
      if (!projectId) return;

      const todoRef = doc(db, "Projects", projectId, "tasks", taskId);
      await updateDoc(todoRef, { status: newStatus });
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const handleDragEnd = (event: any) => {
    const { source, destination } = event;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const sourceId = source.droppableId;
    const destId = destination.droppableId;

    const newStatusTasks = { ...statusTasks };
    const movedTask = newStatusTasks[sourceId].splice(source.index, 1)[0];
    if (sourceId !== destId) {
      movedTask.status = destId;
    }
    newStatusTasks[destId].splice(destination.index, 0, movedTask);
    setStatusTasks(newStatusTasks);

    if (sourceId !== destId) {
      updateTaskStatusInFirebase(movedTask.id, destId);
    }
  };
  const handleListView = () => {
    console.log(`Navigating the ${projectId} to list view`);
    Navigate(`../projects/${projectId}`);
  };
  const handleDelChange = async (taskId: string) => {
    try {
      if (window.confirm("Are you sure you want to delete this task?")) {
        await deleteTaskFromProject(projectId || "", taskId || "");
      }
    } catch (error) {
      console.log("err: ", error);
    }
  };
  return (
    <>
      {loading == true ? (
        <div className="flex justify-center items-center h-full py-20">
          <Loader />
        </div>
      ) : (
        <>
          <DragDropContext onDragEnd={handleDragEnd}>
            <div>
              <div className="w-full flex justify-between items-center px-4 py-2  border-b border-accent/35 rounded-t-md">
                <h2 className="text-lg font-semibold text-foreground">
                  Drag & Drop
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 text-muted-foreground hover:text-foreground hover:bg-accent"
                    onClick={(e) => {
                      e.stopPropagation();
                      setcardWidth((prev) => !prev);
                    }}
                  >
                    <ChevronsRightLeft size={18} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:bg-accent hover:text-accent-foreground"
                    onClick={handleListView}
                  >
                    View List
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-3 h-full w-full overflow-y-auto scrollbar-thin  rounded-b-md">
              {statuses?.map((statusKey) => (
                <Droppable droppableId={statusKey} type="TASK" key={statusKey}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-none rounded-xl border  shadow-sm transition-all duration-300 p-2.5 hover:shadow-md hover:border-accent/50
              ${
                cardWidth
                  ? "min-w-[60px] max-w-[60px] h-[50px]"
                  : "min-w-[230px] max-w-[260px]"
              } 
              max-h-min overflow-y-auto`}
                    >
                      {!cardWidth ? (
                        <div className="flex justify-between items-center mb-1">
                          <h2 className="font-semibold text-base capitalize text-foreground truncate">
                            {statusKey}
                          </h2>
                        </div>
                      ) : (
                        <h3 className="text-sm font-semibold mb-1 text-center text-muted-foreground whitespace-nowrap w-8">
                          {statusKey.charAt(0).toUpperCase() +
                            statusKey.slice(-1)}
                        </h3>
                      )}

                      {!cardWidth && (
                        <div className="flex flex-col gap-2">
                          {!loading &&
                            (!statusTasks[statusKey] ||
                              statusTasks[statusKey].length === 0) && (
                              <p className="text-[12px] text-muted-foreground text-center">
                                No tasks.
                              </p>
                            )}

                          {loading ? (
                            <p className="text-sm text-muted-foreground text-center">
                              Loading...
                            </p>
                          ) : (
                            (statusTasks[statusKey] || []).map(
                              (todo, index) => (
                                <Draggable
                                  key={todo.id}
                                  draggableId={todo.id}
                                  index={index}
                                >
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className="relative p-2 flex flex-col gap-2 bg-card text-accent-foreground rounded-lg border border-transparent hover:border-accent shadow-sm hover:shadow-md transition cursor-pointer"
                                    >
                                      {/* Attachment */}
                                      {todo.attachments?.length > 0 && (
                                        <img
                                          src={todo.attachments[0]}
                                          alt="todo-attachment"
                                          className="w-full h-24 object-cover rounded-md"
                                        />
                                      )}

                                      <Dialog>
                                        <DialogTrigger asChild>
                                          <span
                                            className={`text-sm font-medium cursor-pointer ${
                                              todo.status === "completed"
                                                ? "line-through text-muted-foreground"
                                                : "text-foreground"
                                            }`}
                                          >
                                            {todo.title}
                                          </span>
                                        </DialogTrigger>
                                        <TaskDetailModal
                                          task={todo}
                                          projectId={projectId}
                                        />
                                      </Dialog>

                                      {todo.todo && (
                                        <p className="text-xs text-muted-foreground line-clamp-3">
                                          {todo.todo}
                                        </p>
                                      )}

                                      <Dialog>
                                        <DialogTrigger asChild>
                                          <FaEdit
                                            size={16}
                                            className={`absolute right-2 ${
                                              todo.attachments?.length > 0 &&
                                              "top-28"
                                            } text-muted-foreground hover:text-primary cursor-pointer`}
                                          />
                                        </DialogTrigger>
                                        <TodoModel
                                          projectId={projectId}
                                          taskToEdit={todo}
                                        />
                                      </Dialog>
                                      <MdDeleteOutline
                                        size={18}
                                        className={`absolute right-6 ${
                                          todo.attachments?.length > 0 &&
                                          "top-28"
                                        } text-muted-foreground hover:text-primary cursor-pointer`}
                                        onClick={() =>
                                          handleDelChange(todo.id || "")
                                        }
                                      />
                                    </div>
                                  )}
                                </Draggable>
                              )
                            )
                          )}

                          <div className="w-full flex justify-end mt-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-sm text-muted-foreground hover:text-primary hover:bg-accent/30 flex items-center gap-1"
                                >
                                  <Plus className="h-3 w-3" />
                                  Add
                                </Button>
                              </DialogTrigger>
                              <TodoModel projectId={projectId} />
                            </Dialog>
                          </div>
                        </div>
                      )}

                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </DragDropContext>
        </>
      )}
    </>
  );
};

export default DashboardPage;
