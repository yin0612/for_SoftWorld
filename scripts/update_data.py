import os
import re
import datetime
import random
import urllib.parse

DATA_FILE_PATH = os.path.join(os.path.dirname(__file__), '..', 'js', 'data.js')

# 模擬新聞稿的保留上限：達到後只推進月份、不再新增，避免 data.js 無限膨脹
MAX_SYNTHETIC_ENTRIES = 12
NEWLINE = chr(10)

MEDIA_SOURCES = ['經濟日報', '鉅亨網', '數位時代', '巴哈姆特', '4Gamers', '天下雜誌', 'ETtoday', 'Yahoo新聞']

def generate_search_url(source, company_name):
    """根據媒體名稱與公司名稱產生直達報導檢索 URL"""
    encoded = urllib.parse.quote(company_name)
    search_urls = {
        '經濟日報': f"https://money.udn.com/search/result/1001/{encoded}",
        '天下雜誌': f"https://www.cw.com.tw/search/doSearch.action?key={encoded}",
        '數位時代': f"https://www.bnext.com.tw/search?q={encoded}",
        '鉅亨網': f"https://news.cnyes.com/search?q={encoded}",
        '巴哈姆特': f"https://gnn.gamer.com.tw/search.php?kw={encoded}",
        '4Gamers': f"https://www.4gamers.com.tw/site/search?q={encoded}",
        'Yahoo新聞': f"https://news.search.yahoo.com/search?p={encoded}",
        'ETtoday': f"https://www.ettoday.net/news_search/unicode_result.php?keyword={encoded}"
    }
    return search_urls.get(source, f"https://www.google.com/search?q={encoded}+{urllib.parse.quote(source)}")


def get_brand_color(content, company_id, fallback='#8c98a8'):
    """從 js/data.js 讀取該公司的品牌色，維持單一色票來源。"""
    m = re.search(r"id:\s*'" + re.escape(company_id) + r"'.*?color:\s*'(#[0-9a-fA-F]{6})'",
                  content, re.S)
    return m.group(1) if m else fallback

def update_data_file():
    if not os.path.exists(DATA_FILE_PATH):
        print(f"Error: {DATA_FILE_PATH} not found.")
        return

    with open(DATA_FILE_PATH, 'r', encoding='utf-8') as f:
        content = f.read()

    now = datetime.datetime.now()
    current_year = now.year
    current_month = now.month
    current_month_str = f"{current_year}-{current_month:02d}"

    print(f"Executing scheduled data update for {current_month_str}...")

    # 檢查 END_MONTH 變數，更新最新的 END_YEAR 與 END_MONTH
    content = re.sub(r'const END_YEAR = \d+;', f'const END_YEAR = {current_year};', content)
    content = re.sub(r'const END_MONTH = \d+;', f'const END_MONTH = {current_month};', content)

    # 在新聞稿清單最上方插入一則自動產生的最新模擬新聞稿
    company_categories = [
        ("soft-world", "智冠科技", ["新品發布", "財務報告", "策略合作", "技術創新"]),
        ("gamania", "橘子集團", ["新品發布", "技術創新", "社群活動", "財務報告"]),
        ("wanin", "網銀國際", ["策略合作", "產業趨勢", "電競賽事", "社群活動"]),
        ("userjoy", "宇峻奧汀", ["新品發布", "財務報告", "技術創新", "社群活動"]),
        ("softstar", "大宇資訊", ["產業趨勢", "財務報告", "新品發布", "策略合作"]),
        ("xlegend", "傳奇網路", ["新品發布", "技術創新", "財務報告", "社群活動"]),
        ("wayi", "華義國際", ["策略合作", "電競賽事", "財務報告", "技術創新"]),
        ("astro", "泰偉電子", ["財務報告", "策略合作", "技術創新", "產業趨勢"])
    ]
    companies = [
        (cid, name, get_brand_color(content, cid), cats)
        for cid, name, cats in company_categories
    ]

    comp = random.choice(companies)
    cat = random.choice(comp[3])
    source_media = random.choice(MEDIA_SOURCES)
    date_str = now.strftime("%Y-%m-%d")
    url_str = generate_search_url(source_media, comp[1])

    news_topics = {
        "新品發布": f"{comp[1]}宣告旗下重磅新作雙平台正式上線，發放限量虛寶回饋玩家",
        "財務報告": f"{comp[1]}公佈最新營運財報，受惠於旺季效應，單月營收表現亮眼",
        "策略合作": f"{comp[1]}擴大海外市場佈局，攜手國際合作夥伴深化技術與發行合作",
        "技術創新": f"{comp[1]}導入生成式 AI 輔助開發流程，有效提升遊戲製作與營運效率",
        "社群活動": f"{comp[1]}舉辦玩家線下交流見面會，吸引數百位熱情玩家到場參與",
        "產業趨勢": f"{comp[1]}受邀參加年度亞洲遊戲高峰論壇，分享跨國營運與 IP 經營心法",
        "電競賽事": f"{comp[1]}贊助頂級電競賽事圓滿落幕，吸引數十萬玩家線上觀戰"
    }

    title = news_topics.get(cat, f"{comp[1]}發布最新營運動態新聞稿")
    excerpt = f"{comp[1]}今日發布最新公關訊息，針對事業佈局與近期產品計畫進行詳細說明，展現營運成長動能。"

    new_entry = f"""        {{
            companyId: '{comp[0]}',
            companyName: '{comp[1]}',
            companyColor: '{comp[2]}',
            title: '{title}',
            category: '{cat}',
            excerpt: '{excerpt}',
            date: '{date_str}',
            source: '{source_media}',
            url: '{url_str}',
            synthetic: true
        }},"""

    # 達到保留上限就不再新增，只保留已推進的月份範圍
    existing = content.count('synthetic: true')
    if existing >= MAX_SYNTHETIC_ENTRIES:
        with open(DATA_FILE_PATH, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Month range advanced to %s. Synthetic entries at cap (%d/%d); no new entry added."
              % (current_month_str, existing, MAX_SYNTHETIC_ENTRIES))
        return

    if 'const PRESS_RELEASES = [' in content:
        content = content.replace('const PRESS_RELEASES = [',
                                  'const PRESS_RELEASES = [' + NEWLINE + new_entry)

    with open(DATA_FILE_PATH, 'w', encoding='utf-8') as f:
        f.write(content)

    print("js/data.js updated. Synthetic press release added for %s on %s (%d/%d)."
          % (comp[1], date_str, existing + 1, MAX_SYNTHETIC_ENTRIES))


if __name__ == '__main__':
    update_data_file()
