import { useEffect, useState } from "react" ;
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { API_BASE } from "../config.js";

const RANGES = [
  { value: "month", label: "Last Month" },
  { value: "6months", label: "Last 6 Months" },
  { value: "year", label: "Last Year" },
];

export default function StatsPage() {
  const [range, setRange] = useState("month");
  const [data,  setData ] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/articles/stats/${range}`)
      .then(response => response.json())
      .then(setData)
      .catch(console.error);
  }, [range]);

  return (
    <div className="stats">
      <div className="range-container">
        {RANGES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setRange(value)}
            className={`range-btn${range === value ? " active" : ""}`}
          >
          {label}
          </button>
        ))}
      </div>

      <div className="chart-wrapper">
        {data.length === 0 ? (
          <p>No reading data for this period.</p>
        ) : (
          <LineChart width={900} height={420} data={data}>
            <Line type="monotone" dataKey="count" strokeWidth={2} />
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis allowDecimals={false} />
            <Tooltip />
          </LineChart>
        )}
      </div>
    </div>
  );
}
