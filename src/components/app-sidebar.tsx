import * as React from "react";
import { NavLink } from "react-router-dom";
import { IoHomeOutline } from "react-icons/io5";
import { AiOutlinePlus } from "react-icons/ai";
import { Separator } from "./ui/separator";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Bot, FolderOpen } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import ProjectModol from "./ProjectModol";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useTaskContext } from "@/TaskContext/TaskContext";
import SidebarFooter from "./sidebar-footer";
import Loader from "./Loader";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { projects, taskCache, loading } = useTaskContext();
  const { setOpen, state } = useSidebar();
  const [hovered, setHovered] = React.useState(false);
  const items = [
    { title: "Home", url: ".", icon: IoHomeOutline },
    { title: "Projects", url: "assign-projects", icon: FolderOpen },
    { title: "Ai Talk", url: "ai-talk", icon: Bot },
  ];
  return (
    <Sidebar
      collapsible="icon"
      {...props}
      className="flex flex-col h-full bg-sidebar"
    >
      <div className="md:hidden flex items-center justify-between px-4 pt-2 -mb-2">
        <span className="font-semibold text-base tracking-tight">Menu</span>
        <SidebarTrigger className="scale-90" />
      </div>

      <div
        className={`flex items-center ${
          state === "collapsed"
            ? "justify-center px-1 pt-3 pb-1"
            : "justify-between pl-3 pr-2 pt-3 pb-1"
        } w-full`}
      >
        <div
          className={`flex items-center gap-1 ${
            state === "collapsed" ? "justify-center" : ""
          }`}
        >
          {state === "collapsed" ? (
            <div
              className="relative flex items-center justify-center"
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            >
              {!hovered ? (
                <Avatar className="hidden md:flex cursor-pointer transition-transform hover:scale-105">
                  <AvatarImage
                    src="/todo-list-svgrepo-com.svg"
                    alt="User Avatar"
                    className="h-8 w-8 p-1"
                  />
                  <AvatarFallback className="text-[13px] font-medium">
                    U
                  </AvatarFallback>
                </Avatar>
              ) : (
                <SidebarTrigger
                  className="transition-all duration-200 scale-110 cursor-pointer"
                  onClick={() => setHovered(false)}
                />
              )}
            </div>
          ) : (
            <>
              <Avatar className=" cursor-pointer">
                <AvatarImage
                  src="/todo-list-svgrepo-com.svg"
                  alt="User Avatar"
                  className=" h-8 w-8 p-1"
                />
                <AvatarFallback className="text-[13px] font-medium">
                  U
                </AvatarFallback>
              </Avatar>

              <span className="text-[13px] font-semibold tracking-wide text-foreground">
                Project Flow
              </span>
            </>
          )}
        </div>

        {state === "expanded" && <SidebarTrigger className="scale-100" />}
      </div>

      {/* Sidebar Content */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem
                  key={item.title}
                  className={`flex ${
                    state === "expanded"
                      ? "flex-row"
                      : "flex-col items-center justify-center ml-2 "
                  } items-center`}
                >
                  <NavLink
                    to={item.url}
                    className="w-full"
                    onClick={() => {
                      setOpen(false);
                    }}
                  >
                    {({ isActive }) => (
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={isActive}
                        className={`flex items-center gap-3 px-2 py-1.5 rounded-md transition-colors ${
                          isActive
                            ? "bg-accent text-white"
                            : "hover:bg-sidebar-accent hover:text-foreground"
                        } `}
                      >
                        <item.icon
                          className="cursor-pointer"
                          size={20} // refined icon size for consistency
                        />
                        <span
                          className=" md:hidden text-[14px] font-medium cursor-pointer"
                          onClick={() => setOpen(false)}
                        >
                          {item.title}
                        </span>
                        {state === "expanded" && (
                          <span
                            className="text-[14px] font-medium cursor-pointer"
                            onClick={() => setOpen(false)}
                          >
                            {item.title}
                          </span>
                        )}
                      </SidebarMenuButton>
                    )}
                  </NavLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>

            <Separator className="my-3" />

            <div
              className={`flex items-center ${
                state === "expanded"
                  ? "justify-between px-0.5"
                  : "justify-center flex-col"
              }`}
            >
              {state === "expanded" ? (
                <>
                  <SidebarGroupLabel className="hidden md:flex text-[12px] gap-1 uppercase text-muted-foreground tracking-wide font-semibold">
                    Projects
                  </SidebarGroupLabel>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button
                        className="p-1.5 rounded hover:bg-sidebar-accent inline-flex items-center justify-center"
                        title="Add Project"
                      >
                        <AiOutlinePlus size={17} />
                      </button>
                    </DialogTrigger>
                    <ProjectModol />
                  </Dialog>
                </>
              ) : (
                <div className=" w-full  px-2 flex justify-between items-center gap-1">
                  <SidebarGroupLabel className="flex md:hidden text-[12px] uppercase text-muted-foreground tracking-wide font-semibold">
                    Projects
                  </SidebarGroupLabel>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button
                        className=" p-1.5 rounded hover:bg-sidebar-accent inline-flex items-center justify-center"
                        title="Add Project"
                      >
                        <AiOutlinePlus size={17} />
                      </button>
                    </DialogTrigger>
                    <ProjectModol />
                  </Dialog>
                </div>
              )}
            </div>

            <div className="">
              <ScrollArea className="h-[h-64] mt-2">
                {window.innerWidth < 640 && (
                  <SidebarMenu className="space-y-0.5 mt-1">
                    {projects.length > 0 ? (
                      [...projects]
                        .sort(
                          (a, b) =>
                            new Date(b.createdAt).getTime() -
                            new Date(a.createdAt).getTime()
                        )
                        .map((project) => {
                          const taskCount =
                            taskCache[project?.id || ""]?.tasks?.length || 0;
                          return (
                            <SidebarMenuItem key={project.id}>
                              <NavLink
                                to={`projects/${project.id}`}
                                onClick={() => setOpen(false)} // closes sidebar on mobile
                              >
                                {({ isActive }) => (
                                  <SidebarMenuButton
                                    tooltip={project?.title}
                                    isActive={isActive}
                                    className={`flex items-center justify-between gap-2 px-2 py-1.5 rounded-md text-[13px] font-medium truncate transition-colors ${
                                      isActive
                                        ? "bg-primary text-white"
                                        : "hover:bg-sidebar-accent/70 hover:text-foreground"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 truncate">
                                      <FolderOpen
                                        size={14}
                                        className={
                                          isActive
                                            ? "text-white"
                                            : "text-muted-foreground"
                                        }
                                      />
                                      <span className="truncate max-w-[110px]">
                                        {project.title.charAt(0).toUpperCase() +
                                          project.title.slice(1)}
                                      </span>
                                    </div>

                                    {taskCount > 0 && (
                                      <span
                                        className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                          isActive
                                            ? "bg-white/20 text-white"
                                            : "bg-muted text-muted-foreground"
                                        }`}
                                      >
                                        {taskCount}
                                      </span>
                                    )}
                                  </SidebarMenuButton>
                                )}
                              </NavLink>
                            </SidebarMenuItem>
                          );
                        })
                    ) : (
                      <div className="text-center py-6 text-xs text-muted-foreground">
                        {loading ? (
                          <Loader />
                        ) : (
                          <>
                            <p>No projects</p>
                            <p>Add one to get started</p>
                          </>
                        )}
                      </div>
                    )}
                  </SidebarMenu>
                )}
              </ScrollArea>
            </div>

            <div className="hidden sm:block">
              <ScrollArea className="h-[h-64] mt-2">
                {state === "expanded" && (
                  <SidebarMenu className="space-y-0.5 mt-1">
                    {projects.length > 0 ? (
                      [...projects]
                        .sort(
                          (a, b) =>
                            new Date(b.createdAt).getTime() -
                            new Date(a.createdAt).getTime()
                        )
                        .map((project) => {
                          const taskCount =
                            taskCache[project?.id || ""]?.tasks?.length || 0;
                          return (
                            <SidebarMenuItem key={project.id}>
                              <NavLink
                                to={`projects/${project.id}`}
                                onClick={() => setOpen(false)}
                              >
                                {({ isActive }) => (
                                  <SidebarMenuButton
                                    tooltip={project?.title}
                                    isActive={isActive}
                                    className={`flex items-center justify-between gap-2 px-2 py-1.5 rounded-md text-[13px] font-medium truncate transition-colors ${
                                      isActive
                                        ? "bg-primary text-white"
                                        : "hover:bg-sidebar-accent/70 hover:text-foreground"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 truncate">
                                      <FolderOpen
                                        size={14}
                                        className={
                                          isActive
                                            ? "text-white"
                                            : "text-muted-foreground"
                                        }
                                      />
                                      <span className="truncate max-w-[110px]">
                                        {project.title.charAt(0).toUpperCase() +
                                          project.title.slice(1)}
                                      </span>
                                    </div>

                                    {taskCount > 0 && (
                                      <span
                                        className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                          isActive
                                            ? "bg-white/20 text-white"
                                            : "bg-muted text-muted-foreground"
                                        }`}
                                      >
                                        {taskCount}
                                      </span>
                                    )}
                                  </SidebarMenuButton>
                                )}
                              </NavLink>
                            </SidebarMenuItem>
                          );
                        })
                    ) : (
                      <div className="text-center py-6 text-xs text-muted-foreground">
                        {loading ? (
                          <Loader />
                        ) : (
                          <>
                            <p>No projects</p>
                            <p>Add one to get started</p>
                          </>
                        )}
                      </div>
                    )}
                  </SidebarMenu>
                )}
              </ScrollArea>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter state={state} setopen={setOpen} />
    </Sidebar>
  );
}
