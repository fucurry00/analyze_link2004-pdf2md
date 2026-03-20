// .env.localファイルから環境変数を読み込む
require("dotenv").config({ path: ".env.local" });

// テスト用のタイムアウト値を設定（APIリクエストに時間がかかる場合があるため）
jest.setTimeout(30000);
