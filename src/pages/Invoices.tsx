
import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const Invoices = () => {
  return (
    <DashboardLayout title="Invoices">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Invoices</h1>
        <p className="text-gray-600">
          Manage and create invoices for your clients.
        </p>
      </div>
    </DashboardLayout>
  );
};

export default Invoices;
