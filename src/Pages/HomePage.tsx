import { useMemo, useState } from "react";
import { ProjectCard } from "@/components/ProjectCard";
import { CheckCircle, Clock, FolderOpen, Search } from "lucide-react";
import { useTaskContext } from "@/TaskContext/TaskContext";
import { useNavigate } from "react-router-dom";
import { StatsCard } from "@/components/HomePageSatasCard";
import LatestUpdatedTasks from "@/components/LatestUpdatedTasks";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import ProjectModol from "@/components/ProjectModol";
import { Plus } from "lucide-react";
import Loader from "@/components/Loader";
import { UpcomingDeadlines } from "@/components/UpCommingDeadline";
import LatestProjects from "@/components/LatesteProjects";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Separator } from "@/components/ui/separator";

const HomePage = () => {
  const { projects, taskCache, loading } = useTaskContext();
  const navigate = useNavigate();

  const [filteredProject, setfilteredProject] = useState("");
  const [filter, setFilter] = useState("all");
  const [filteredCategory, setFilteredCategory] = useState("");

  const LatestProject = useMemo(() => {
    if (!projects?.length) return null;
    return [...projects]
      .filter((p) => p.createdAt)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];
  }, [projects]);
  const AssignedProjects = useMemo(() => {
    if (!projects?.length) return null;
    return [...projects].filter((p) => p.assignedUsers?.length);
  }, [projects]);
  const TotalActiveProjects = useMemo(() => {
    if (!projects?.length) return null;
    return [...projects].filter((p) => p.status == "active");
  }, [projects]);
  const LastUpdatedProject = useMemo(() => {
    if (!projects?.length) return null;
    return [...projects]
      .filter((p) => p.updatedAt)
      .sort(
        (a, b) =>
          new Date(b.updatedAt ?? 0).getTime() -
          new Date(a.updatedAt ?? 0).getTime()
      )[0];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const titleMatch = project.title
        .toLowerCase()
        .includes(filteredProject.toLowerCase());
      const categoryMatch = filteredCategory
        ? project.Category?.toLowerCase() === filteredCategory.toLowerCase()
        : true;

      const dropdownMatch =
        filter === "recent"
          ? project.id === LatestProject?.id
          : filter === "lastupdated"
          ? project.id === LastUpdatedProject?.id
          : true;

      return titleMatch && categoryMatch && dropdownMatch;
    });
  }, [
    projects,
    filteredProject,
    filteredCategory,
    filter,
    LatestProject,
    LastUpdatedProject,
  ]);

  const Categories = useMemo(() => {
    const unique = new Set();
    return projects.filter((p) => {
      if (p.Category && !unique.has(p.Category)) {
        unique.add(p.Category);
        return true;
      }
      return false;
    });
  }, [projects]);

  const { totalTasks, latestTasks } = useMemo(() => {
    let total = 0,
      active = 0,
      completed = 0;
    const allTasks = [];

    for (const [projectId, project] of Object.entries(taskCache)) {
      const tasks = project.tasks || [];
      total += tasks.length;
      active += tasks.filter((t) => t.status === "active").length;
      completed += tasks.filter((t) => t.status === "completed").length;

      for (const task of tasks) {
        if (task.updatedAt) {
          allTasks.push({
            ...task,
            projectId,
            projectTitle: project.title,
          });
        }
      }
    }

    allTasks
      .sort(
        (a, b) =>
          new Date(b.updatedAt ?? 0).getTime() -
          new Date(a.updatedAt ?? 0).getTime()
      )
      .slice(0, 9);

    return {
      totalTasks: total,
      totalActive: active,
      totalCompleted: completed,
      latestTasks: allTasks,
    };
  }, [taskCache]);

  const handleProjectClick = (id: string) => navigate(`projects/${id}`);

  const handleCategoryProject = (value: string) =>
    setFilteredCategory(value === "all" ? "" : value);
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 6;

  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
  const sortedProjects = [...filteredProjects].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = sortedProjects.slice(
    indexOfFirstProject,
    indexOfLastProject
  );

  return (
    <>
      {loading == true ? (
        <div className="flex justify-center items-center h-full py-20">
          <Loader />
        </div>
      ) : (
        <div className="h-full  p-1 bg-background md:p-1 ">
          <main className="w-full mx-auto pt-1 flex-1 ">
            <section className="mb-1">
              <div className="grid px-0.5 py-0.5 auto-rows-min gap-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4">
                <StatsCard
                  title="Projects"
                  value={projects.length}
                  icon={FolderOpen}
                  color="bg-gradient-to-br from-sky-600 to-sky-700"
                />
                <StatsCard
                  title="Assigned Projects"
                  value={AssignedProjects?.length || 0}
                  icon={CheckCircle}
                  color="bg-gradient-to-br from-violet-600 to-violet-700"
                />
                <StatsCard
                  title="Active Projects"
                  value={TotalActiveProjects?.length || 0}
                  icon={Clock}
                  color="bg-gradient-to-br from-green-500 to-green-600"
                />
                <StatsCard
                  title="Total Tasks"
                  value={totalTasks}
                  icon={CheckCircle}
                  color="bg-gradient-to-br from-teal-500 to-teal-600"
                />
              </div>
            </section>

            <section className="flex flex-col lg:flex-row h-full w-full gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col md:flex-row lg:flex-row lg:items-center lg:justify-between w-full gap-2 pt-2 shadow-sm">
                    <div className="relative flex items-center  w-full sm:max-w-sm md:max-w-full lg:max-w-full xl:w-full ">
                      <Search
                        className="absolute left-3 text-muted-foreground"
                        size={18}
                      />
                      <Input
                        type="text"
                        placeholder="Search..."
                        value={filteredProject}
                        onChange={(e) => setfilteredProject(e.target.value)}
                        className="pl-10 pr-8 py-1 text-sm  "
                      />
                    </div>

                    <div className="flex items-center justify-start lg:justify-end gap-2 w-full lg:w-auto">
                      <Select defaultValue="all" onValueChange={setFilter}>
                        <SelectTrigger className="min-w-[125px]">
                          <SelectValue placeholder="All Projects" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Projects</SelectItem>
                          <SelectItem value="recent">Recent</SelectItem>
                          <SelectItem value="lastupdated">
                            Last Updated
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      <Select
                        defaultValue="all"
                        onValueChange={handleCategoryProject}
                      >
                        <SelectTrigger className="min-w-[125px]">
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Categories</SelectItem>
                          {Categories.map((c) => (
                            <SelectItem key={c.id} value={c.Category}>
                              {c.Category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="default"
                            className="min-w-min md:min-w-[120px] flex items-center gap-2 font-medium whitespace-nowrap"
                          >
                            <Plus size={18} />

                            <span className="hidden md:inline">
                              Add Project
                            </span>
                            <span className=" md:hidden">Project</span>
                          </Button>
                        </DialogTrigger>
                        <ProjectModol />
                      </Dialog>
                      <Card className="hidden md:block md:bg-blend-hard-light p-0 rounded-lg sticky bottom-4 left-0 right-0 mx-auto w-fit z-40">
                        <Pagination>
                          <PaginationContent className="flex justify-center items-center gap-3">
                            <PaginationItem>
                              <PaginationPrevious
                                onClick={() =>
                                  setCurrentPage((p) => Math.max(p - 1, 1))
                                }
                                className={`h-8 w-8 flex items-center justify-center rounded-full transition-all duration-200 ${
                                  currentPage === 1
                                    ? "pointer-events-none text-primary opacity-40"
                                    : "hover:text-primary-foreground cursor-pointer"
                                }`}
                              />
                            </PaginationItem>

                            <span className="text-sm font-medium select-none text-muted-foreground">
                              {currentPage}
                            </span>

                            <PaginationItem>
                              <PaginationNext
                                onClick={() =>
                                  setCurrentPage((p) =>
                                    Math.min(p + 1, totalPages)
                                  )
                                }
                                className={`h-8 w-8 flex items-center justify-center rounded-full transition-all duration-200 ${
                                  currentPage === totalPages
                                    ? "pointer-events-none text-primary opacity-40"
                                    : "hover:text-accent-foreground cursor-pointer"
                                }`}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </Card>
                    </div>
                  </div>
                  <Separator />
                  <div className="w-full min-h-[340px] md:min-h-[500px] lg:min-h-[340px] xl:h-full rounded-lg grid gap-2 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {currentProjects.length > 0 ? (
                      currentProjects.map((project, index) => (
                        <motion.div
                          key={project.id}
                          className="w-full h-full"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.4,
                            delay: index * 0.07,
                            ease: "easeOut",
                          }}
                          whileHover={{
                            scale: 1.02,
                            transition: { duration: 0.2 },
                          }}
                        >
                          <ProjectCard
                            projectToShow={project}
                            tasks={
                              project.id ? taskCache[project.id]?.tasks : []
                            }
                            onClick={handleProjectClick}
                          />
                        </motion.div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center col-span-full pt-12">
                        No projects found. Add new projects to get started.
                      </p>
                    )}
                  </div>

                  {totalPages > 1 && (
                    <Pagination className="-mt-1 md:hidden lg:hidden xl:hidden">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() =>
                              setCurrentPage((p) => Math.max(p - 1, 1))
                            }
                            className={
                              currentPage === 1
                                ? "pointer-events-none opacity-50"
                                : ""
                            }
                          />
                        </PaginationItem>

                        {Array.from({ length: totalPages }, (_, i) => (
                          <PaginationItem key={i}>
                            <PaginationLink
                              isActive={currentPage === i + 1}
                              onClick={() => {
                                setCurrentPage(i + 1);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                            >
                              {i + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}

                        <PaginationItem>
                          <PaginationNext
                            onClick={() =>
                              setCurrentPage((p) => Math.min(p + 1, totalPages))
                            }
                            className={
                              currentPage === totalPages
                                ? "pointer-events-none opacity-50"
                                : ""
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </div>
              </div>

              <div
                className="flex min-h-[340px] flex-col gap-2 mt-2 
                lg:flex-col lg:w-[40%] xl:w-[45%]"
              >
                <div className="flex flex-col gap-2 sm:flex-col md:flex-row">
                  <Card
                    className="max-h-[392px] bg-background flex p-0 border-none flex-col  
                     w-full md:w-1/2"
                  >
                    <CardHeader className="flex justify-between -ml-5">
                      <CardTitle className="text-md">
                        Project Highlights
                      </CardTitle>
                    </CardHeader>

                    {projects.length > 0 && (
                      <>
                        <UpcomingDeadlines projects={projects} />
                        <LatestProjects LatestProjects={projects} />
                      </>
                    )}
                  </Card>
                  <div className="flex h-auto md:h-[200px] flex-col gap-2 w-full md:w-1/2 md:-mt-2">
                    <LatestUpdatedTasks latestTasks={latestTasks} />
                  </div>
                </div>
              </div>
            </section>
            {/* <section className="-mt-2">
              <ProjectsBoard />
            </section> */}
          </main>
        </div>
      )}
    </>
  );
};

export default HomePage;
