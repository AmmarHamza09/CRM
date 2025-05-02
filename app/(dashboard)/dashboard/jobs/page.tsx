"use client";

import React, { useState, useEffect } from 'react';
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Briefcase, Plus, Search, Filter, Calendar, Clock, Building2, MapPin, Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

enum ProjectStatus {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  REVIEW = "REVIEW",
  COMPLETED = "COMPLETED",
  ON_HOLD = "ON_HOLD"
}

enum ProjectPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH"
}

enum ProjectType {
  FULL_TIME = "FULL_TIME",
  PART_TIME = "PART_TIME",
  CONTRACT = "CONTRACT",
  INTERNSHIP = "INTERNSHIP"
}

interface Project {
  id: string;
  title: string;
  description?: string;
  company: string;
  location?: string;
  type: ProjectType;
  status: ProjectStatus;
  priority: ProjectPriority;
  budget?: number;
  client?: string;
  startDate: Date;
  endDate?: Date;
}

const projectTypes = Object.values(ProjectType);
const projectStatuses = Object.values(ProjectStatus);
const priorities = Object.values(ProjectPriority);

export default function JobsPage() {
  const { theme } = useTheme();
  const [projects, setProjects] = useState<Project[]>(() => {
    if (typeof window !== 'undefined') {
      const savedProjects = localStorage.getItem('projects');
      return savedProjects ? JSON.parse(savedProjects) : [];
    }
    return [];
  });
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [newProject, setNewProject] = useState<Partial<Project>>({
    title: '',
    company: '',
    location: '',
    type: ProjectType.FULL_TIME,
    status: ProjectStatus.OPEN,
    description: '',
    priority: ProjectPriority.MEDIUM,
    startDate: new Date(),
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('projects', JSON.stringify(projects));
    }
  }, [projects]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'projects' && !e.newValue) {
        setProjects([]);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const updatedProjects = Array.from(projects);
    const [movedProject] = updatedProjects.splice(source.index, 1);
    movedProject.status = destination.droppableId as ProjectStatus;
    updatedProjects.splice(destination.index, 0, movedProject);
    setProjects(updatedProjects);
  };

  const handleAddProject = () => {
    if (newProject.title && newProject.company) {
      const project: Project = {
        id: Date.now().toString(),
        title: newProject.title,
        company: newProject.company,
        location: newProject.location,
        type: newProject.type as ProjectType,
        status: newProject.status as ProjectStatus,
        description: newProject.description,
        priority: newProject.priority as ProjectPriority,
        budget: newProject.budget,
        client: newProject.client,
        startDate: newProject.startDate as Date,
        endDate: newProject.endDate,
      };
      setProjects([...projects, project]);
      setIsDialogOpen(false);
      setNewProject({
        title: '',
        company: '',
        location: '',
        type: ProjectType.FULL_TIME,
        status: ProjectStatus.OPEN,
        description: '',
        priority: ProjectPriority.MEDIUM,
        startDate: new Date(),
      });
    }
  };

  const handleEditProject = () => {
    if (selectedProject && newProject.title && newProject.company) {
      const updatedProjects = projects.map(p => {
        if (p.id === selectedProject.id) {
          return {
            ...p,
            title: newProject.title!,
            company: newProject.company!,
            location: newProject.location || undefined,
            type: newProject.type as ProjectType,
            status: newProject.status as ProjectStatus,
            description: newProject.description || undefined,
            priority: newProject.priority as ProjectPriority,
            budget: newProject.budget || undefined,
            client: newProject.client || undefined,
            endDate: newProject.endDate || undefined,
          };
        }
        return p;
      });
      setProjects(updatedProjects);
      setIsDialogOpen(false);
      setSelectedProject(null);
    }
  };

  const handleDeleteProject = () => {
    if (selectedProject) {
      setProjects(projects.filter(p => p.id !== selectedProject.id));
      setIsDialogOpen(false);
      setSelectedProject(null);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (project.location?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesType = filterType === 'all' || project.type === filterType;
    const matchesPriority = filterPriority === 'all' || project.priority === filterPriority;
    return matchesSearch && matchesType && matchesPriority;
  });

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.OPEN: return 'bg-blue-100 text-blue-800';
      case ProjectStatus.IN_PROGRESS: return 'bg-yellow-100 text-yellow-800';
      case ProjectStatus.REVIEW: return 'bg-purple-100 text-purple-800';
      case ProjectStatus.COMPLETED: return 'bg-green-100 text-green-800';
      case ProjectStatus.ON_HOLD: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: ProjectPriority) => {
    switch (priority) {
      case ProjectPriority.HIGH: return 'bg-red-100 text-red-800';
      case ProjectPriority.MEDIUM: return 'bg-yellow-100 text-yellow-800';
      case ProjectPriority.LOW: return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Business Projects</h1>
        <Button onClick={() => {
          setNewProject({
            title: '',
            company: '',
            location: '',
            type: ProjectType.FULL_TIME,
            status: ProjectStatus.OPEN,
            description: '',
            priority: ProjectPriority.MEDIUM,
            startDate: new Date(),
          });
          setSelectedProject(null);
          setIsDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Project
        </Button>
      </div>

      <Tabs defaultValue="board" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="board">Board</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Project Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {projectTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                {priorities.map(priority => (
                  <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="board" className="space-y-4">
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-5 gap-4">
              {projectStatuses.map((status) => (
                <div key={status} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">{status}</h2>
                    <Badge variant="outline" className={getStatusColor(status)}>
                      {filteredProjects.filter(project => project.status === status).length}
                    </Badge>
                  </div>
                  <Droppable droppableId={status}>
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-4 min-h-[500px] p-4 bg-gray-50 rounded-lg"
                      >
                        {filteredProjects
                          .filter(project => project.status === status)
                          .map((project, index) => (
                            <Draggable key={project.id} draggableId={project.id} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-move"
                                  onClick={() => {
                                    setSelectedProject(project);
                                    setNewProject(project);
                                    setIsDialogOpen(true);
                                  }}
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-medium">{project.title}</h3>
                                    <Badge className={getPriorityColor(project.priority)}>
                                      {project.priority}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                    <Building2 className="h-4 w-4" />
                                    {project.company}
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                    <MapPin className="h-4 w-4" />
                                    {project.location}
                                  </div>
                                  {project.endDate && (
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                      <Clock className="h-4 w-4" />
                                      Due: {new Date(project.endDate).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              initialView="dayGridMonth"
              events={projects.map(project => ({
                title: project.title,
                start: project.startDate,
                end: project.endDate,
                backgroundColor: getStatusColor(project.status).split(' ')[0],
                borderColor: getStatusColor(project.status).split(' ')[0],
                textColor: theme === 'dark' ? 'white' : 'black',
                extendedProps: {
                  company: project.company,
                  location: project.location,
                  priority: project.priority,
                }
              }))}
              eventClick={(info) => {
                const project = projects.find(p => p.title === info.event.title);
                if (project) {
                  setSelectedProject(project);
                  setNewProject(project);
                  setIsDialogOpen(true);
                }
              }}
              height="auto"
              themeSystem={theme === 'dark' ? 'dark' : 'light'}
              eventTextColor={theme === 'dark' ? 'white' : 'black'}
              eventBackgroundColor={theme === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)'}
              eventBorderColor={theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}
              dayMaxEvents={true}
              eventDisplay="block"
              eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                meridiem: false
              }}
              slotMinTime="00:00:00"
              slotMaxTime="24:00:00"
              allDaySlot={true}
              expandRows={true}
              stickyHeaderDates={true}
              nowIndicator={true}
              navLinks={true}
              dayMaxEventRows={true}
              handleWindowResize={true}
              windowResizeDelay={100}
              eventResizableFromStart={true}
              eventStartEditable={true}
              eventDurationEditable={true}
              eventConstraint={{
                startTime: '00:00',
                endTime: '24:00',
                daysOfWeek: [0, 1, 2, 3, 4, 5, 6]
              }}
              eventOverlap={true}
              eventDragMinDistance={5}
              eventLongPressDelay={1000}
              eventMinHeight={30}
              eventShortHeight={30}
              eventMaxStack={2}
              eventOrder="start,-duration,allDay,title"
              eventOrderStrict={false}
              eventRender={(info: { el: HTMLElement }) => {
                const eventEl = info.el;
                if (theme === 'dark') {
                  eventEl.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
                  eventEl.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  eventEl.style.color = 'white';
                } else {
                  eventEl.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                  eventEl.style.borderColor = 'rgba(0, 0, 0, 0.2)';
                  eventEl.style.color = 'black';
                }
              }}
            />
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedProject ? 'Edit Project' : 'Add New Project'}</DialogTitle>
            <DialogDescription>
              {selectedProject ? 'Make changes to the project here.' : 'Add details for the new project.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={newProject.title}
                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                className="col-span-3"
                placeholder="Project title"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="company" className="text-right">
                Company
              </Label>
              <Input
                id="company"
                value={newProject.company}
                onChange={(e) => setNewProject({ ...newProject, company: e.target.value })}
                className="col-span-3"
                placeholder="Company name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="client" className="text-right">
                Client
              </Label>
              <Input
                id="client"
                value={newProject.client || ''}
                onChange={(e) => setNewProject({ ...newProject, client: e.target.value })}
                className="col-span-3"
                placeholder="Client name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Input
                id="location"
                value={newProject.location || ''}
                onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
                className="col-span-3"
                placeholder="Project location"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select
                value={newProject.type}
                onValueChange={(value) => setNewProject({ ...newProject, type: value as ProjectType })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select project type" />
                </SelectTrigger>
                <SelectContent>
                  {projectTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select
                value={newProject.status}
                onValueChange={(value) => setNewProject({ ...newProject, status: value as ProjectStatus })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {projectStatuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priority" className="text-right">
                Priority
              </Label>
              <Select
                value={newProject.priority}
                onValueChange={(value) => setNewProject({ ...newProject, priority: value as ProjectPriority })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map(priority => (
                    <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="budget" className="text-right">
                Budget
              </Label>
              <Input
                id="budget"
                type="number"
                value={newProject.budget || ''}
                onChange={(e) => setNewProject({ ...newProject, budget: Number(e.target.value) })}
                className="col-span-3"
                placeholder="Project budget"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={newProject.description || ''}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                className="col-span-3"
                placeholder="Project description"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">
                Deadline
              </Label>
              <Input
                id="endDate"
                type="date"
                value={newProject.endDate ? new Date(newProject.endDate).toISOString().split('T')[0] : ''}
                onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value ? new Date(e.target.value) : undefined })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter className="sticky bottom-0 bg-background border-t pt-4">
            {selectedProject && (
              <Button variant="destructive" onClick={handleDeleteProject}>
                Delete
              </Button>
            )}
            <Button type="submit" onClick={selectedProject ? handleEditProject : handleAddProject}>
              {selectedProject ? 'Save Changes' : 'Add Project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 