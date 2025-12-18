import React from "react";
import Papa from "papaparse";

export default function DatasetUploader({ onLoaded }) {
  const inputRef = React.useRef(null);

  function parseFile(file) {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (res) => {
        const rows = Array.isArray(res.data) ? res.data : [];
        const headers = res.meta?.fields ?? Object.keys(rows?.[0] ?? {});
        onLoaded({ rows, headers, fileName: file.name, errors: res.errors ?? [] });
      },
      error: (err) => {
        onLoaded({ rows: [], headers: [], fileName: file.name, errors: [err] });
      }
    });
  }

  function onPick(e) {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
  }

  function onDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) parseFile(file);
  }

  return (
    <div
      className="dropzone"
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      <div>
        <div style={{ fontWeight: 600 }}>Upload a CSV dataset</div>
        <div className="small">Tip: first row must contain headers (column names).</div>
      </div>

      <div className="row">
        <button onClick={() => inputRef.current?.click()} className="secondary">
          Choose CSV
        </button>
        <button
          onClick={() => {
            // Demo dataset
            const demo = `month,sales,profit,region
Jan,120,32,North
Feb,150,45,North
Mar,90,18,South
Apr,180,55,West
May,210,60,West
Jun,160,42,East
Jul,190,50,East
Aug,240,80,North
Sep,170,44,South
Oct,220,70,West
Nov,260,95,North
Dec,300,110,North`;
            const file = new File([demo], "demo.csv", { type: "text/csv" });
            parseFile(file);
          }}
        >
          Load Demo
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        style={{ display: "none" }}
        onChange={onPick}
      />
    </div>
  );
}
