# 部署

兩條路共用同一個 image（根目錄的 `Dockerfile`），差別只在環境變數與 nginx 放在哪裡。

## 環境變數

| 變數 | 何時用 | 說明 |
|---|---|---|
| `SITE_URL` | 建置 | 正式網址，例如 `https://yujun.com.tw`。canonical、sitemap、OG、JSON-LD 都用它 |
| `CONTENT_SOURCE` | 建置＋執行 | `local`：讀 image 內的 `content/`，建置時產生靜態頁<br>`api`：讀 GEO 公開 API，請求時渲染、資料快取 60 秒 |
| `NEXT_PUBLIC_GEO_PUBLIC_URL` | 建置 | `api` 模式才需要。GEO 的公開網址，圖片 `/uploads/...` 從這裡取 |
| `GEO_API_URL` | 執行 | `api` 模式才需要。伺服器端呼叫 GEO 的位址，同機時是 `http://backend:8000` |
| `STORE_SLUG` | 執行 | GEO 上的品牌 slug（宥涒是 `enjoy-no1`）。未設定時為 `yujun`，對應本機 content/store.json |
| `REVALIDATE_SECRET` | 執行 | 放在別台機器時設定。GEO 呼叫 `/api/revalidate/` 要帶 `x-revalidate-secret` 標頭 |

## 本機用 docker 試跑

```bash
docker build --build-arg SITE_URL=http://localhost:3000 -t yujun-web .
docker run --rm -p 3000:3000 yujun-web
```

## 放在 GEO 正式機

見 `docker-compose.geo-host.yml` 與 `nginx.geo-host.conf`：加一個 `yujun_web` 服務到 GEO 的 compose，
GEO 的 nginx 加一個宥涒網域的 server 區塊。**定案前不要套用**，這兩個檔案只是範例。

## 放在獨立 VM

見 `docker-compose.standalone.yml` 與 `nginx.standalone.conf`。
