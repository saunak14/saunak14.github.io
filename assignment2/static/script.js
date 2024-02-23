function sendData() {
  event.preventDefault();
  const name = document.getElementById("stock").value;

  var url = new URL(window.location.href + "submit");
  url.searchParams.set("stock", name);

  fetch(url.toString(), { method: "GET" })
    .then(response => response.text())
    .then(data => {
      document.getElementById("response").innerHTML = data;
      addEventListeners();
      fetchChartData(name);
    })
    .catch(error => {
      console.error("Error sending data:", error);
    });
}

function clearInput() {
  const inputField = document.getElementById("stock");
  inputField.value = "";
  const responseDiv = document.getElementById("response");
  responseDiv.innerHTML = "";
}

function addEventListeners() {
  const navLinks = document.querySelectorAll('nav button');
  const contentDivs = document.querySelectorAll('.content-div');

  navLinks.forEach(button => {
    button.addEventListener('click', (event) => {
      // Hide all content divs
      contentDivs.forEach(div => {
        div.classList.add('hidden');
      });

      // Show the corresponding content div
      const targetId = button.getAttribute('id').replace('-nav', '');
      const targetDiv = document.getElementById(targetId);
      targetDiv.classList.remove('hidden');

      // Add the .active class to the clicked button
      button.classList.add('active');

      // Remove the .active class from other nav buttons
      navLinks.forEach(otherLink => {
        if (otherLink !== button) {
          otherLink.classList.remove('active');
        }
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  addEventListeners();
});

function fetchChartData(name) {
  let chartData = {
    dates: [],
    prices: [],
    volumes: []
  };
  var url = new URL(window.location.href + "getGraph");
  url.searchParams.set("stock", name);
  fetch(url.toString(), { method: "GET" })
    .then(response => response.json())
    .then(data => {
      data.results.forEach(result => {
          chartData.dates.push(result.t);
          chartData.prices.push(result.c);
          chartData.volumes.push(result.v);
      });
      createGraph(chartData, name);
  });
}

function createGraph(chartData, name) {
  const today = new Date();
  const todayString = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
  endDate = chartData.dates[chartData.dates.length - 1];
  let maxVolume = Math.max(...chartData.volumes);
  Highcharts.stockChart('chart-content', {
      chart: {
          height: 600,
          width: 950,
          spacingRight: 0
      },
      rangeSelector: {
          inputEnabled: false,
          allButtonsEnabled: true,
          buttons: [
              {
                  type: 'day',
                  count: 7,
                  text: '7d'
              },
              {
                  type: 'day',
                  count: 15,
                  text: '15d'
              },
              {
                  type: 'month',
                  count: 1,
                  text: '1m'
              },
              {
                  type: 'month',
                  count: 3,
                  text: '3m'
              },
              {
                  type: 'month',
                  count: 6,
                  text: '6m'
              }
          ],
          selected: 4
      },
      title: {
          text: `Stock Price ${name} ${todayString}`,
          style: {
              color: '#000000'
          }
      }
      , subtitle: {
          text: `<a href="https://polygon.io/" target="_blank">Source: polygon.io</a>`,
          style: {
              textDecoration: 'underline',
              color: 'blue'
          }
      },
      navigator: {
          series: {
              accessibility: {
                  exposeAsGroupOnly: true
              }
          }
      },
      series: [
          {
              pointPlacement: 'on',
              name: 'Stock Price',
              data: chartData.prices.map((price, index) => [new Date(chartData.dates[index]).getTime(), price]),
              type: 'area',
              threshold: null,
              tooltip: {
                  valueDecimals: 2
              },
              fillColor: {
                  linearGradient: {
                      x1: 0,
                      y1: 0,
                      x2: 0,
                      y2: 1
                  },
                  stops: [
                      [0, Highcharts.getOptions().colors[0]],
                      [1, Highcharts.color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                  ]
              }
          },
          {
              pointPlacement: 'on',
              name: 'Volume',
              data: chartData.volumes.map((volume, index) => [new Date(chartData.dates[index]).getTime(), volume]),
              yAxis: 1,
              type: 'column',
              color: '#000000',
              pointWidth: 4,
              tooltip: {
                  valueDecimals: 0
              },
              states: {
                  hover: {
                      color: Highcharts.color('#000000').brighten(0.1).get()
                  }
              }
          }
      ],
      yAxis: [

          {
              labels: {
                  format: '{value}',
                  style: {
                      color: '#000000'
                  }
              },
              title: {
                  text: 'Stock Price',
                  style: {
                      color: '#808080'
                  }
              },
              opposite: false
          },
          {
              title: {
                  text: 'Volume',
                  style: {
                      color: '#808080'
                  }
              },
              labels: {
                  formatter: function () {
                      return this.value / 1000000 + 'M';
                  },
                  format: '{value}',
                  style: {
                      color: '#000000'
                  }
              },
              opposite: true,
              max: maxVolume*2
          }
      ],
      xAxis: {
          categories: chartData.dates,
          labels: {
              style: {
                  color: '#000000'
              }
          }
      }
  });
}