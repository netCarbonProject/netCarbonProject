import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const IndustryUsageChart = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const parseCSV = (csvText) => {
      const [headerLine, ...lines] = csvText.trim().split("\n");
      const headers = headerLine.split(",");
      return lines.map(line => {
        const values = line.split(",");
        const entry = {};
        headers.forEach((header, i) => {
          entry[header.trim()] = isNaN(values[i]) ? values[i].trim() : parseFloat(values[i]);
        });
        return entry;
      });
    };
    fetch("/frontend/src/components/charts/data/industry_usage.csv")
      .then(res => res.text())
      .then(csv => {
        const data = parseCSV(csv);
        const labels = data.map(d => d["업종"]);
        const values = data.map(d => d["전력사용량"]);

        new Chart(canvasRef.current, {
          type: "bar",
          data: {
            labels,
            datasets: [{
              label: "전력 사용량 (kWh)",
              data: values,
              backgroundColor: "rgba(255, 159, 64, 0.6)"
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                ticks: {
                  maxRotation: 45,
                  minRotation: 45,
                  font: { size: 10 }
                }
              }
            }
          }
        });
      });
  }, []);

  return <canvas ref={canvasRef} style={{ height: "200px" }} />;
};

export default IndustryUsageChart;
