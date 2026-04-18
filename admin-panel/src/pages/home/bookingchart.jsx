import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const BookingsChart = ({ data }) => {
  const chartData = data.map((d) => ({
    date: d.date,
    bookings: d.count,
  }));

  return (
    <div className="p-6  shadow bg-slate-800/40 border border-slate-700/50 rounded-3xl  backdrop-blur-xl relative overflow-hidden  text-white ">

      <h2 className="text-lg font-semibold mb-4">Bookings (Last 7 Days)</h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="bookings"
            stroke="#2563eb"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BookingsChart;
