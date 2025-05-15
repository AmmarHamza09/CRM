import OverViewCard from "@/components/dashboard/overview/OverViewCard";
import RecentClient from "@/components/dashboard/overview/RecentClient";
import RecentProjects from "@/components/dashboard/overview/RecentProjects";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <OverViewCard />
        <OverViewCard />
        <OverViewCard />
        <OverViewCard />

      </div>

      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 ">
        <RecentProjects/>
        <RecentClient/>
          

        </div>
     
    </main>
  );
}
