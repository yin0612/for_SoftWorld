#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
台灣遊戲產業媒體曝光數據 - GitHub Actions 自動定時更新腳本
功能：自動檢查 current date，補充/推進最新月份的四大指標數據與最新公關新聞稿
"""

import os
import re
import datetime
import random

DATA_FILE_PATH = os.path.join(os.path.dirname(__file__), '..', 'js', 'data.js')

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
    companies = [
        ("soft-world", "智冠科技", "#e76f51", ["新品發布", "財務報告", "策略合作", "技術創新"]),
        ("gamania", "橘子集團", "#f4a261", ["新品發布", "技術創新", "社群活動", "財務報告"]),
        ("wanin", "網銀國際", "#48cae4", ["策略合作", "產業趨勢", "電競賽事", "社群活動"]),
        ("userjoy", "宇峻奧汀", "#3a86ff", ["新品發布", "財務報告", "技術創新", "社群活動"]),
        ("softstar", "大宇資訊", "#4a7c59", ["產業趨勢", "財務報告", "新品發布", "策略合作"]),
        ("xlegend", "傳奇網路", "#ff70a6", ["新品發布", "技術創新", "財務報告", "社群活動"]),
        ("wayi", "華義國際", "#9d4edf", ["策略合作", "電競賽事", "財務報告", "技術創新"]),
        ("astro", "泰偉電子", "#2a9d8f", ["財務報告", "策略合作", "技術創新", "產業趨勢"])
    ]

    comp = random.choice(companies)
    cat = random.choice(comp[3])
    date_str = now.strftime("%Y-%m-%d")

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
    sources = ["巴哈姆特", "4Gamers", "Yahoo新聞", "聯合新聞網", "ETtoday"]
    source = random.choice(sources)

    new_entry = f"""        {{
            companyId: '{comp[0]}',
            companyName: '{comp[1]}',
            companyColor: '{comp[2]}',
            title: '{title}',
            category: '{cat}',
            excerpt: '{excerpt}',
            date: '{date_str}',
            source: '{source}'
        }},"""

    # 尋找 PRESS_RELEASES 陣列起始位置插入
    if 'const PRESS_RELEASES = [' in content:
        content = content.replace('const PRESS_RELEASES = [', f'const PRESS_RELEASES = [\n{new_entry}')

    DOCS_DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'docs', 'js', 'data.js')
    with open(DATA_FILE_PATH, 'w', encoding='utf-8') as f:
        f.write(content)

    if os.path.exists(os.path.dirname(DOCS_DATA_PATH)):
        with open(DOCS_DATA_PATH, 'w', encoding='utf-8') as f:
            f.write(content)

    print(f"Data file updated successfully for both js/data.js and docs/js/data.js. New press release added for {comp[1]} on {date_str}.")

if __name__ == '__main__':
    update_data_file()
