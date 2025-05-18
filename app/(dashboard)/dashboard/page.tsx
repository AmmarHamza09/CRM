"use client"
import OverViewCard from "@/components/dashboard/overview/OverViewCard";
import RecentClient from "@/components/dashboard/overview/RecentClient";
import RecentProjects from "@/components/dashboard/overview/RecentProjects";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

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

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const { data: session } = useSession();

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch('/api/projects');
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Failed to fetch projects:', errorText);
          throw new Error(`Failed to fetch projects: ${errorText}`);
        }
        
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    }
    
    if (session?.user) {
      console.log("Session found, fetching projects...");
      fetchProjects();
    } else {
      console.log("No session found, skipping fetch");
    }
  }, [session]);



  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        {/* <OverViewCard />
        <OverViewCard />
        <OverViewCard />
        <OverViewCard /> */}
        {
          projects.map((project, index) => {
            

            return(
              <OverViewCard
                priority={project.priority}
                title={project.title}
                endDate={project.endDate}
                key={index}
              />
            )
          })
        }

      </div>

      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 ">
        <RecentProjects/>
        <RecentClient/>
          

        </div>
     
    </main>
  );
}
