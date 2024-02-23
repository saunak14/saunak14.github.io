import requests
from datetime import datetime, date
from dateutil.relativedelta import relativedelta
from flask import Flask, request

app = Flask(__name__)
finnhub_url = "https://finnhub.io/api/v1"
finnhub_key = "cn5e1r1r01qocjm1mnt0cn5e1r1r01qocjm1mntg"
polygon_url = "https://api.polygon.io/v2"
polygon_key = "KsY8TN9bNE9j8TKwpWMIGGumRy6ZyQRe"

@app.route("/")
def index():
    return app.send_static_file('index.html')

@app.route('/submit', methods=['GET'])
def handle_form():
  if request.method == 'GET':
    name = request.args.get('stock')
    data = {}
    params = {}
    params["symbol"] = name
    params["token"] = finnhub_key

    # Profile2 API
    finnhub_company_profile2 = "/stock/profile2"
    url = finnhub_url + finnhub_company_profile2

    response = requests.get(url, params)
    if response.status_code == 200:
       data = response.json()
       if len(data) == 0:
          return f"""
<main class="error-container">
        <div class="error">
            Error : No record has been found, please enter a valid symbol
        </div>
    </main>          
"""

    # Quote API
    finnhub_quote = "/quote"
    url = finnhub_url + finnhub_quote

    response = requests.get(url, params)
    if response.status_code == 200:
       new_data = response.json()
       data.update(new_data)

       #Convert unix timestamp to readable date
       last_date = datetime.fromtimestamp(data["t"])
       data["date"] = last_date.strftime("%d %B, %Y")
    # Recommendation API
    finnhub_recommendation = "/stock/recommendation"
    url = finnhub_url + finnhub_recommendation
    response = requests.get(url, params)
    if response.status_code == 200:
       new_datas = response.json()
       data.update(new_datas[0])

    finnhub_news = "/company-news"
    url = finnhub_url + finnhub_news

    today = date.today()
    one_month_ago = today - relativedelta(days=30)
    one_month_ago_formatted_date = one_month_ago.strftime("%Y-%m-%d")
    today_formatted_date = today.strftime("%Y-%m-%d")
    params["from"] = one_month_ago_formatted_date
    params["to"] = today_formatted_date
    response = requests.get(url, params)
    if response.status_code == 200:
       new_datas = response.json()
       fields_non_empty = ["image", "url", "headline", "datetime"]
       data_count = 0
       company_news = []
       for new_data in new_datas:
          if not any(new_data[field] is None or new_data[field] == "" for field in fields_non_empty):
            date_posted = datetime.fromtimestamp(new_data["datetime"])
            new_data["date"] = date_posted.strftime("%B %d, %Y")
            
            company_news.append(new_data)
            data_count +=1
            if data_count >=5:
               break
    template = f"""
    <nav class="nav-buttons">
        <button class="nav-button active" id="company-nav">Company</button>
        <button class="nav-button" id="stock-summary-nav">Stock Summary</button>
        <button class="nav-button" id="charts-nav">Charts</button>
        <button class="nav-button" id="latest-news-nav">Latest News</button>
    </nav>

    <main class="company content-div" id="company">
        <div class="logo">
            <img src="{data['logo']}" alt="">
        </div>
        <table>
            <tbody>
                <tr>
                    <td class="table-key top-row">Company Name</td>
                    <td class="table-value top-row">{data['name']}</td>
                </tr>
                <tr>
                    <td class="table-key">Stock Ticker Symbol</td>
                    <td class="table-value">{data['ticker']}</td>
                </tr>
                <tr>
                    <td class="table-key">Stock Exchange Code</td>
                    <td class="table-value">{data['exchange']}</td>
                </tr>
                <tr>
                    <td class="table-key">Company Start Date</td>
                    <td class="table-value">{data['ipo']}</td>
                </tr>
                <tr>
                    <td class="table-key">Category</td>
                    <td class="table-value">{data['finnhubIndustry']}</td>
                </tr>
            </tbody>
        </table>
    </main>

     <main class="stock-summary content-div hidden" id="stock-summary">
        <table>
            <tbody>
                <tr>
                    <td class="table-key top-row">Stock Ticker Symbol</td>
                    <td class="table-value top-row">{data['ticker']}</td>
                </tr>
                <tr>
                    <td class="table-key">Trading Day</td>
                    <td class="table-value">{data['date']}</td>
                </tr>
                <tr>
                    <td class="table-key">Previous Closing Price</td>
                    <td class="table-value">{data['pc']}</td>
                </tr>
                <tr>
                    <td class="table-key">Opening Price</td>
                    <td class="table-value">{data['o']}</td>
                </tr>
                <tr>
                    <td class="table-key">High Price</td>
                    <td class="table-value">{data['h']}</td>
                </tr>
                <tr>
                    <td class="table-key">Low Price</td>
                    <td class="table-value">{data['l']}</td>
                </tr>
                <tr>
                    <td class="table-key">Change</td>
                    <td class="table-value">{data['d']}
    """
    if data['d'] < 0:
       template += """
        <img class="arrow" src="/static/imgs/RedArrowDown.png" alt="">
    """
    else:
       template += """
        <img class="arrow" src="/static/imgs/GreenArrowUp.png" alt="">
    """
    
    template+= f"""
</td>
                </tr>
                <tr>
                    <td class="table-key">Change Percent</td>
                    <td class="table-value">{data['dp']}
"""
    if data['d'] < 0:
       template += """
        <img class="arrow" src="/static/imgs/RedArrowDown.png" alt="">
    """
    else:
       template += """
        <img class="arrow" src="/static/imgs/GreenArrowUp.png" alt="">
    """

    template +=f"""
</td>
                </tr>
            </tbody>
        </table>

        <section class="recommendation-trends-container">
            <div class="recommendation-trends">
                <div class="strong-sell-text">Strong Sell</div>
                <div class="recommendation-number strong-sell">{data['strongSell']}</div>
                <div class="recommendation-number sell">{data['sell']}</div>
                <div class="recommendation-number hold">{data['hold']}</div>
                <div class="recommendation-number buy">{data['buy']}</div>
                <div class="recommendation-number strong-buy">{data['strongBuy']}</div>
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
"""
    for news in company_news:
       template += f"""
<div class="news-block">
                    <div class="news-image-container"><img src="{news['image']}" alt="" class="news-image"></div>
                    <div class="news-content">
                        <div class="news-lines"><b>{news['headline']}</b></div>
                        <div class="news-lines">{news['date']}</div>
                        <div class="news-lines"><a href="{news['url']}" target="_blank">See Original Post</a></div>
                    </div>
                </div>       
"""
    template += """
</div>
    </main>
"""
    return template
    # return render_template("stock-info.html", error_page = False, data=data, company_news=company_news)
  
@app.route('/getGraph', methods=['GET'])
def get_graph():
   name = request.args.get('stock')
# Aggregate bars API
   today = date.today()
   six_months_ago = today - relativedelta(months=6, days=1)
   six_months_ago_formatted_date = six_months_ago.strftime("%Y-%m-%d")
   today_formatted_date = today.strftime("%Y-%m-%d")
   polygon_aggregate = f"/aggs/ticker/{name}/range/1/day/{six_months_ago_formatted_date}/{today_formatted_date}?adjusted=true&sort=asc&apiKey={polygon_key}"
   url = polygon_url + polygon_aggregate
   response = requests.get(url)
   if response.status_code == 200:
      chart_data = response.json()
      for result in chart_data["results"]:
         #Convert unix timestamp to readable date
         last_date = datetime.fromtimestamp(result["t"]/1000)
         result["date"] = last_date.strftime("%Y/%m/%d")
      return chart_data

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8080, debug=True)