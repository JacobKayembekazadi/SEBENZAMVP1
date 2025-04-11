
import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const Estimates = () => {
  return (
    <DashboardLayout title="Estimates">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Estimates</h1>
        <p className="text-gray-600">
          Create and manage estimates for your clients.
        </p>
      </div>
    </DashboardLayout>
  );
};

export default Estimates;
