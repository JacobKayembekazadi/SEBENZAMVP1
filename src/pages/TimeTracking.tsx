
import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const TimeTracking = () => {
  return (
    <DashboardLayout title="Time Tracking">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Time Tracking</h1>
        <p className="text-gray-600">
          Track and manage your billable hours and activities.
        </p>
      </div>
    </DashboardLayout>
  );
};

export default TimeTracking;
