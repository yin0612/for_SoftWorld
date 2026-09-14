import os
import re
import datetime

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

    # 文章資料改由監測 Worker 寫入 D1。此腳本只維護展示資料的時間窗，
    # 絕不再產生或偽裝新聞內容，避免模擬資料混入真實監測結果。
    print("Advanced display date range only; no synthetic news was created.")

    with open(DATA_FILE_PATH, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Data file update completed successfully.")

if __name__ == '__main__':
    update_data_file()
