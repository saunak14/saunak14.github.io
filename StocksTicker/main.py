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
          data["error_page"] = True
          return data

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

    data["company_news"] = company_news
    data["error_page"] = False
    return data
    
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