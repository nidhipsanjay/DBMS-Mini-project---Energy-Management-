import React, { useEffect, useState } from "react";

const TableViewer = ({ title, endpoint }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:5000/api/${endpoint}`)
      .then((res) => res.json())
      .then(setData)
      .catch(console.error);
  }, [endpoint]);

  if (data.length === 0) return <p>Loading {title}...</p>;

  const headers = Object.keys(data[0]);

  return (
    <div className="table-responsive mt-4">
      <h3>{title}</h3>
      <table className="table table-bordered table-striped">
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              {headers.map((h) => (
                <td key={h}>{row[h]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableViewer;
