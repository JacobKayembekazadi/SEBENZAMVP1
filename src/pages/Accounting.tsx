
import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const Accounting = () => {
  return (
    <DashboardLayout title="Accounting">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Accounting</h1>
        <p className="text-gray-600">
          Manage your firm's financial records and accounting tasks.
        </p>
      </div>
    </DashboardLayout>
  );
};

export default Accounting;
