import React from "react";
import DatasetUploader from "./components/DatasetUploader.jsx";
import ChartsPanel from "./components/ChartsPanel.jsx";
import DataPreview from "./components/DataPreview.jsx";
import { inferColumnTypes } from "./utils";

export default function App() {
  const [dataset, setDataset] = React.useState({
    rows: [],
    headers: [],
    fileName: ""
  });

  const [types, setTypes] = React.useState({ numeric: [], categorical: [], all: [] });

  // visualization controls
  const [xCol, setXCol] = React.useState("");
  const [yCol, setYCol] = React.useState("");
  const [categoryCol, setCategoryCol] = React.useState("");

  const [lineEnabled, setLineEnabled] = React.useState(true);
  const [barEnabled, setBarEnabled] = React.useState(true);
  const [pieEnabled, setPieEnabled] = React.useState(true);
  const [scatterEnabled, setScatterEnabled] = React.useState(false);

  const [maxRows, setMaxRows] = React.useState(1000);

  function onLoaded(payload) {
    const rows = payload.rows ?? [];
    const headers = payload.headers ?? [];
    setDataset({ rows, headers, fileName: payload.fileName ?? "" });

    const inferred = inferColumnTypes(rows, headers);
    setTypes(inferred);

    // smart defaults
    const defaultY = inferred.numeric[0] ?? headers[0] ?? "";
    const defaultX = inferred.categorical[0] ?? headers[0] ?? "";
    const defaultCat = inferred.categorical[0] ?? headers[0] ?? "";

    setYCol(defaultY);
    setXCol(defaultX);
    setCategoryCol(defaultCat);

    // enable scatter only if x is numeric too
    setScatterEnabled(inferred.numeric.includes(defaultX));
  }

  const hasData = dataset.rows.length > 0 && dataset.headers.length > 0;

  React.useEffect(() => {
    // If user changes xCol, auto toggle scatter if x and y numeric
    const xIsNumeric = types.numeric.includes(xCol);
    const yIsNumeric = types.numeric.includes(yCol);
    if (xIsNumeric && yIsNumeric) {
      // allow scatter; don't force it on
    } else {
      setScatterEnabled(false);
    }
  }, [xCol, yCol, types.numeric]);

  return (
    <div className="container">
      <div className="header">
        <div>
          <h2 style={{ margin: 0 }}>React + Chart.js Data Visualizer</h2>
          <div className="small">
            Upload CSV → pick columns → see multiple charts. {dataset.fileName ? `(${dataset.fileName})` : ""}
          </div>
        </div>
      </div>

      <div className="grid">
        <div className="card">
          <DatasetUploader onLoaded={onLoaded} />

          <div style={{ height: 12 }} />

          <div className="controls">
            <div style={{ fontWeight: 600 }}>Visualization settings</div>

            <div className="row">
              <label>
                X column
                <select value={xCol} onChange={(e) => setXCol(e.target.value)} disabled={!hasData}>
                  {dataset.headers.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </label>

              <label>
                Y column (numeric recommended)
                <select value={yCol} onChange={(e) => setYCol(e.target.value)} disabled={!hasData}>
                  {dataset.headers.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </label>
            </div>

            <label>
              Category column (for Pie aggregation)
              <select value={categoryCol} onChange={(e) => setCategoryCol(e.target.value)} disabled={!hasData}>
                {dataset.headers.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </label>

            <div className="row">
              <label>
                Max rows (performance)
                <input
                  type="text"
                  value={String(maxRows)}
                  onChange={(e) => setMaxRows(Number(e.target.value.replace(/\D/g, "")) || 1000)}
                  disabled={!hasData}
                />
              </label>

              <label>
                Detected numeric columns
                <input type="text" value={types.numeric.join(", ")} readOnly />
              </label>
            </div>

            <div className="row">
              <button onClick={() => setLineEnabled(v => !v)} disabled={!hasData}>
                {lineEnabled ? "Disable Line" : "Enable Line"}
              </button>
              <button onClick={() => setBarEnabled(v => !v)} disabled={!hasData}>
                {barEnabled ? "Disable Bar" : "Enable Bar"}
              </button>
            </div>

            <div className="row">
              <button onClick={() => setPieEnabled(v => !v)} disabled={!hasData}>
                {pieEnabled ? "Disable Pie" : "Enable Pie"}
              </button>
              <button
                onClick={() => setScatterEnabled(v => !v)}
                disabled={!hasData || !(types.numeric.includes(xCol) && types.numeric.includes(yCol))}
              >
                {scatterEnabled ? "Disable Scatter" : "Enable Scatter"}
              </button>
            </div>

            <div className="small">
              Scatter is enabled only when **both X and Y are numeric**.
            </div>
          </div>
        </div>

        <div className="card" style={{ display: "grid", gap: 16 }}>
          {!hasData ? (
            <div className="small">Upload a CSV or load the demo to start.</div>
          ) : (
            <>
              <ChartsPanel
                rows={dataset.rows}
                xCol={xCol}
                yCol={yCol}
                categoryCol={categoryCol}
                lineEnabled={lineEnabled}
                barEnabled={barEnabled}
                pieEnabled={pieEnabled}
                scatterEnabled={scatterEnabled}
                maxRows={maxRows}
              />

              <div>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Data preview</div>
                <DataPreview headers={dataset.headers} rows={dataset.rows} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
