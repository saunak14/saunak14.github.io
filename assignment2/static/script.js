function sendData() {
  event.preventDefault();
  const name = document.getElementById("stock").value;

  var url = new URL(window.location.href + "submit");
  url.searchParams.set("stock", name);

  fetch(url.toString(), { method: "GET" })
    .then(response => response.json())
    .then(data => {
      if (data.error_page) {
        var template = `
        <main class="error-container">
        <div class="error">
            Error : No record has been found, please enter a valid symbol
        </div>
    </main>
        `
      }
      else {
        var template = `
      <nav class="nav-buttons">
        <button class="nav-button active" id="company-nav">Company</button>
        <button class="nav-button" id="stock-summary-nav">Stock Summary</button>
        <button class="nav-button" id="charts-nav">Charts</button>
        <button class="nav-button" id="latest-news-nav">Latest News</button>
    </nav>

    <main class="company content-div" id="company">
        <div class="logo">
            <img src="${data.logo}" alt="">
        </div>
        <table>
            <tbody>
                <tr>
                    <td class="table-key top-row">Company Name</td>
                    <td class="table-value top-row">${data.name}</td>
                </tr>
                <tr>
                    <td class="table-key">Stock Ticker Symbol</td>
                    <td class="table-value">${data.ticker}</td>
                </tr>
                <tr>
                    <td class="table-key">Stock Exchange Code</td>
                    <td class="table-value">${data.exchange}</td>
                </tr>
                <tr>
                    <td class="table-key">Company Start Date</td>
                    <td class="table-value">${data.ipo}</td>
                </tr>
                <tr>
                    <td class="table-key">Category</td>
                    <td class="table-value">${data.finnhubIndustry}</td>
                </tr>
            </tbody>
        </table>
    </main>

     <main class="stock-summary content-div hidden" id="stock-summary">
        <table>
            <tbody>
                <tr>
                    <td class="table-key top-row">Stock Ticker Symbol</td>
                    <td class="table-value top-row">${data.ticker}</td>
                </tr>
                <tr>
                    <td class="table-key">Trading Day</td>
                    <td class="table-value">${data.date}</td>
                </tr>
                <tr>
                    <td class="table-key">Previous Closing Price</td>
                    <td class="table-value">${data.pc}</td>
                </tr>
                <tr>
                    <td class="table-key">Opening Price</td>
                    <td class="table-value">${data.o}</td>
                </tr>
                <tr>
                    <td class="table-key">High Price</td>
                    <td class="table-value">${data.h}</td>
                </tr>
                <tr>
                    <td class="table-key">Low Price</td>
                    <td class="table-value">${data.l}</td>
                </tr>
                <tr>
                    <td class="table-key">Change</td>
                    <td class="table-value">${data.d}
      `
      if(data.d < 0) {
        template = template + `
        <img class="arrow" src="/static/imgs/RedArrowDown.png" alt="">
        `
      }
      else {
        template = template + `
        <img class="arrow" src="/static/imgs/GreenArrowUp.png" alt="">
        `
      }

      template = template + `
      </td>
                </tr>
                <tr>
                    <td class="table-key">Change Percent</td>
                    <td class="table-value">${data.dp}
      `
      if(data.d < 0) {
        template = template + `
        <img class="arrow" src="/static/imgs/RedArrowDown.png" alt="">
        `
      }
      else {
        template = template + `
        <img class="arrow" src="/static/imgs/GreenArrowUp.png" alt="">
        `
      }

      template = template + `
      </td>
                </tr>
            </tbody>
        </table>

        <section class="recommendation-trends-container">
            <div class="recommendation-trends">
                <div class="strong-sell-text">Strong Sell</div>
                <div class="recommendation-number strong-sell">${data.strongSell}</div>
                <div class="recommendation-number sell">${data.sell}</div>
                <div class="recommendation-number hold">${data.hold}</div>
                <div class="recommendation-number buy">${data.buy}</div>
                <div class="recommendation-number strong-buy">${data.strongBuy}</div>
                <div class="strong-buy-text">Strong Buy</div>
            </div>

            <div class="recommendation-trends-text">Recommendation Trends</div>
        </section>
    </main>

    <main class="charts content-div hidden" id="charts">
        <div id="chart-content" class="chart-content"></div>
    </main>

    <main class="latest-news content-div hidden" id="latest-news">
        <div id="latest-news-content" class="latest-news-content">
      `

      for(const news of data.company_news) {
        template = template + `
        <div class="news-block">
                    <div class="news-image-container"><img src="${news.image}" alt="" class="news-image"></div>
                    <div class="news-content">
                        <div class="news-lines"><b>${news.headline}</b></div>
                        <div class="news-lines">${news.date}</div>
                        <div class="news-lines"><a href="${news.url}" target="_blank">See Original Post</a></div>
                    </div>
                </div>
        `
      }

      template = template + `
      </div>
    </main>
      `
      }
      
      document.getElementById("response").innerHTML = template;
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