# PDF→Markdown変換コア機能の抽出 — 設計判断

## 抽出の動機

元のpdf2mdアプリはNext.jsサーバーアクション内でS3経由のMistral OCR呼び出しを行っていた。
ローカルCLIやClaude Skillとして使うには、Web/AWS依存を排除したスタンドアロンモジュールが必要。

## 主要な設計判断

### 1. S3依存の完全排除

**元の実装** (`app/action/mistral.ts`):
```
PDF → Base64 → S3アップロード → 署名URL取得 → Mistral OCR(document_url) → S3削除
```

**抽出後** (`extracted/pdf2md.ts`):
```
PDF → Base64 → データURL(data:application/pdf;base64,...) → Mistral OCR(document_url)
```

Mistral OCR APIは`document_url`タイプで`data:`スキームのURLを受け取れる。
元アプリが画像処理で既にこの方式を使っていた（`processImageWithMistral`関数）ことがヒントになった。
PDFでも同じアプローチが可能であり、S3は本質的に不要だった。

### 2. 環境変数の削減

| 元アプリ | 抽出版 |
|---------|--------|
| `MISTRAL_API_KEY` | `MISTRAL_API_KEY` |
| `AWS_REGION` | 不要 |
| `AWS_ACCESS_KEY_ID` | 不要 |
| `AWS_SECRET_ACCESS_KEY` | 不要 |
| `AWS_S3_BUCKET_NAME` | 不要 |

5つ → 1つに削減。セットアップの障壁が大幅に下がる。

### 3. APIの設計

- `ConvertResult`型で`pages`配列（個別ページ情報）と`markdown`文字列（全ページ結合）の両方を返す
- `options.apiKey`で環境変数以外からのキー渡しにも対応（ライブラリとして組み込む場合に有用）
- `options.includeImageBase64`で画像データの有無を制御（帯域・メモリ節約）

### 4. CLIの外部依存ゼロ

引数パースにyargsやcommanderを使わず、`process.argv`を直接処理。
オプションが3つ（`-o`, `--no-images`, `-h`）しかないため、ライブラリは過剰。

### 5. 元アプリとの関係

抽出版は元アプリのコードをコピーしたものではなく、ロジックを再構成したもの。
元アプリの`"use server"`ディレクティブ、S3操作、エラーラッピング（`{ result, error }`パターン）は
Next.jsサーバーアクション固有の設計であり、スタンドアロン利用には不適切なため排除した。
代わりにエラーは通常のthrowで伝播させ、呼び出し側で処理する標準的なパターンを採用。

## ファイル構成

```
extracted/
├── pdf2md.ts    # コア変換関数（convertPdfToMarkdown, convertImageToMarkdown）
├── cli.ts       # CLIエントリポイント
└── README.md    # 使い方ドキュメント
```
