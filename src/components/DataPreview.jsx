import React from "react";

export default function DataPreview({ headers, rows, limit = 12 }) {
  const slice = rows.slice(0, limit);

  return (
    <div className="tableWrap">
      <table>
        <thead>
          <tr>
            {headers.map((h) => <th key={h}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {slice.map((r, idx) => (
            <tr key={idx}>
              {headers.map((h) => <td key={h}>{String(r[h] ?? "")}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
