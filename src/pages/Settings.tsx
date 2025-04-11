
import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const Settings = () => {
  return (
    <DashboardLayout title="Settings">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Settings</h1>
        <p className="text-gray-600">
          Configure your account settings and preferences.
        </p>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
