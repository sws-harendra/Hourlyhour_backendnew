import React, { useEffect, useState } from "react";
import { adminDashboard } from "../../services/dashboard.service";
import DashboardCards from "./dashboardCard";
import BookingsChart from "./bookingchart";

const Home = () => {
  const [data, setData] = useState(null);
  const fetchDashboard = async () => {
    const res = await adminDashboard.getDashboard();
    if (res.data.success) {
      setData(res.data.data);
    }
  };
  useEffect(() => {
    fetchDashboard();
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <div className=" p-6 space-y-6 bg-slate-900">
      <DashboardCards cards={data.cards} />
      <BookingsChart data={data.charts.bookingsByDay} />
    </div>
  );
};

export default Home;
