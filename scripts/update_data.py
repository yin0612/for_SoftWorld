import os
def update_data_file():
    # 日期窗口改在瀏覽器端從今天動態計算，真實文章由 Cloudflare Worker 寫入 D1。
    # 保留此入口以相容既有 GitHub Actions，但不再修改展示資料或產生文章。
    print("No repository data change: the monitoring window is computed dynamically at runtime.")

if __name__ == '__main__':
    update_data_file()
