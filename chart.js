window.addEventListener('DOMContentLoaded', () => {
  function parseCSV(csvText) {
    const [headerLine, ...lines] = csvText.trim().split('\n');
    const headers = headerLine.split(',');

    return lines.map(line => {
      const values = line.split(',');
      const entry = {};
      headers.forEach((header, i) => {
        entry[header.trim()] = isNaN(values[i]) ? values[i].trim() : parseFloat(values[i]);
      });
      return entry;
    });
  }

  // 업종별 전력 사용량 
  fetch('data/industry_usage.csv')
    .then(res => res.text())
    .then(csv => {
      const data = parseCSV(csv);
      const labels = data.map(d => d['업종']);
      const values = data.map(d => d['전력사용량']);

      new Chart(document.getElementById('industryChart'), {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: '전력 사용량 (kWh)',
            data: values,
            backgroundColor: 'rgba(255, 159, 64, 0.6)'
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

  // 전력 사용량 비교 (고정값 예시)
  new Chart(document.getElementById('usageCompareChart'), {
    type: 'bar',
    data: {
      labels: ['Label', 'Label', 'Label', 'Label', 'Label'],
      datasets: [
        {
          label: 'Value',
          data: [3.58, 3.58, 3.58, 2.81, 2.81],
          backgroundColor: 'rgba(54, 162, 235, 0.6)'
        },
        {
          label: 'Value',
          data: [4.38, 4.38, 4.38, 4.38, 4.38],
          backgroundColor: 'rgba(33, 37, 41, 0.8)'
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          title: {
            display: true,
            text: 'Units of measure'
          }
        }
      }
    }
  });

  // 에너지원별 발전 비율
  fetch('data/energy_sources.csv')
  .then(res => res.text())
  .then(csv => {
    const data = parseCSV(csv);
    const labels = data.map(d => d['에너지원']);
    const values = data.map(d => d['비율']);

    new Chart(document.getElementById('energySourceChart'), {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: [
            '#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b', '#858796', '#5a5c69'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true
      }
    });
  });

  // 신재생에너지 발전 비율 추이
  fetch('data/신재생에너지.csv')
  .then(res => res.text())
  .then(csv => {
    const data = parseCSV(csv);
    const labels = data.map(d => d['신재생에너지']);
    const values = data.map(d => d['비율']);

    new Chart(document.getElementById('renewableChart'), {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: '신재생에너지 발전 비율 (%)',
          data: values,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true,
          tension: 0.4, // 부드러운 곡선
          pointBackgroundColor: 'white',
          pointBorderColor: 'rgba(75, 192, 192, 1)',
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: '#333',
              font: {
                size: 14,
                weight: 'bold'
              }
            }
          },
          tooltip: {
            backgroundColor: '#fff',
            titleColor: '#000',
            bodyColor: '#000',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }
        },
        scales: {
          x: {
            ticks: {
              font: {
                size: 12
              }
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              callback: (val) => `${val}%`,
              font: {
                size: 12
              }
            }
          }
        }
      }
    });
  });

});
