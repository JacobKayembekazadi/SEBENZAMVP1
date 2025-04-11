
import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const Expenses = () => {
  return (
    <DashboardLayout title="Expenses">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Expenses</h1>
        <p className="text-gray-600">
          Track and manage your business expenses.
        </p>
      </div>
    </DashboardLayout>
  );
};

export default Expenses;
