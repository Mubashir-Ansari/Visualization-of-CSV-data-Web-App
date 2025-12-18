import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  TimeScale
} from "chart.js";
import { Line, Bar, Pie, Scatter } from "react-chartjs-2";
import { groupByCategory, topN, toNumber, COLORS } from "../utils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  TimeScale
);

function commonOptions(title) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: title }
    }
  };
}

export default function ChartsPanel({
  rows,
  xCol,
  yCol,
  categoryCol,
  lineEnabled,
  barEnabled,
  pieEnabled,
  scatterEnabled,
  maxRows = 1000
}) {
  const safeRows = rows.slice(0, maxRows);

  // Line/Bar: x labels + y values (best when x is categorical/time-like)
  const xLabels = safeRows.map((r, i) => String(r[xCol] ?? i));
  const yValues = safeRows.map((r) => toNumber(r[yCol])).filter((v) => v !== null);

  const lineData = {
    labels: xLabels,
    datasets: [{
  label: yCol,
  data: safeRows.map(r => toNumber(r[yCol])),
  borderColor: COLORS[0],
  backgroundColor: COLORS[0] + "33", // transparent fill
  tension: 0.3
}]
  };

  const barData = {
    labels: xLabels,
    datasets: [{ label: yCol, data: safeRows.map((r) => toNumber(r[yCol])), backgroundColor: COLORS[1] + "AA",
borderColor: COLORS[1] }]
  };

  // Pie: aggregate Y by a category column (top N for readability)
  const pieAgg = groupByCategory(safeRows, categoryCol, yCol);
  const pieTop = topN(pieAgg.labels, pieAgg.values, 10);
  const pieData = {
    labels: pieTop.labels,datasets: [{
  data: pieTop.values,
  backgroundColor: pieTop.labels.map(
    (_, i) => COLORS[i % COLORS.length]
  ),
  borderWidth: 1
}]
  };

  // Scatter: requires numeric x and numeric y
  const scatterPoints = safeRows
    .map((r) => {
      const x = toNumber(r[xCol]);
      const y = toNumber(r[yCol]);
      if (x === null || y === null) return null;
      return { x, y };
    })
    .filter(Boolean);

  const scatterData = {datasets: [{
  label: `${yCol} vs ${xCol}`,
  data: scatterPoints,
  backgroundColor: COLORS[2],
  pointRadius: 5
}]
  };

  return (
    <div className="charts">
      {lineEnabled && (
        <div className="chartCard">
          <div className="chartTitle">Line</div>
          <div style={{ height: 320 }}>
            <Line data={lineData} options={commonOptions(`Line: ${yCol} over ${xCol}`)} />
          </div>
          <div className="small">Good for trends over ordered X (time, index, category).</div>
        </div>
      )}

      {barEnabled && (
        <div className="chartCard">
          <div className="chartTitle">Bar</div>
          <div style={{ height: 320 }}>
            <Bar data={barData} options={commonOptions(`Bar: ${yCol} by ${xCol}`)} />
          </div>
          <div className="small">Good for comparing values across categories.</div>
        </div>
      )}

      {pieEnabled && (
        <div className="chartCard">
          <div className="chartTitle">Pie (Aggregated)</div>
          <div style={{ height: 320 }}>
            <Pie data={pieData} options={commonOptions(`${yCol} grouped by ${categoryCol}`)} />
          </div>
          <div className="small">Aggregates Y by category; shows top 10 categories.</div>
        </div>
      )}

      {scatterEnabled && (
        <div className="chartCard">
          <div className="chartTitle">Scatter</div>
          <div style={{ height: 320 }}>
            <Scatter
              data={scatterData}
              options={{
                ...commonOptions(`Scatter: ${yCol} vs ${xCol}`),
                scales: {
                  x: { type: "linear", title: { display: true, text: xCol } },
                  y: { type: "linear", title: { display: true, text: yCol } }
                }
              }}
            />
          </div>
          <div className="small">Works only if X and Y are numeric.</div>
        </div>
      )}
    </div>
  );
}
