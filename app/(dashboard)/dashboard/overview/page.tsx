"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, Briefcase } from "lucide-react";
import { toast } from "react-hot-toast";

interface Job {
  id: string;
  title: string;
  endDate: string;
  status: string;
  priority: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  recentAmount?: number;
}

interface Meeting {
  id: string;
  title: string;
  date: string;
  clientName: string;
}

export default function OverviewPage() {
  const { data: session } = useSession();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [session]);

  const fetchDashboardData = async () => {
    try {
      // Fetch jobs
      const jobsResponse = await fetch('/api/projects?limit=4');
      if (!jobsResponse.ok) throw new Error('Failed to fetch jobs');
      const jobsData = await jobsResponse.json();
      setJobs(jobsData);

      // Fetch clients
      const clientsResponse = await fetch('/api/clients?limit=10');
      if (!clientsResponse.ok) throw new Error('Failed to fetch clients');
      const clientsData = await clientsResponse.json();
      setClients(clientsData);

      // Fetch meetings
      const meetingsResponse = await fetch('/api/meetings?limit=5');
      if (!meetingsResponse.ok) throw new Error('Failed to fetch meetings');
      const meetingsData = await meetingsResponse.json();
      setMeetings(meetingsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysRemaining = (endDate: string) => {
    const today = new Date();
    const dueDate = new Date(endDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return <div className="p-8">Loading dashboard...</div>;
  }

  return (
    <></>
  );
} 