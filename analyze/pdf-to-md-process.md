# PDF → Markdown 変換プロセス解析

## 全体フロー

```
[ブラウザ]                    [Next.js Server Action]              [外部サービス]

1. ファイル選択/D&D
   ↓
2. バリデーション
   (PDF判定, 20MB上限)
   ↓
3. FileReader で Base64変換
   ↓
4. Server Action 呼出  ──→  5. S3アップロード ──────→  AWS S3
   (processPdfWithMistral)      (Base64→Buffer変換)      (temp-ocr/{uuid}_{name})
                               ↓
                             6. 署名付きURL取得 ←────  S3 Presigned URL (1h有効)
                               ↓
                             7. Mistral OCR呼出  ──→  Mistral AI
                                model: mistral-ocr-latest    (OCR処理)
                                document_url: 署名付きURL
                                includeImageBase64: true
                               ↓
                             8. S3からファイル削除 ──→  AWS S3 (cleanup)
                               ↓
9. OCRResponse受信  ←────── return { result, error }
   ↓
10. レンダリング
    - "result"タブ: ReactMarkdown + remark-gfm + remark-math + rehype-katex
    - "text"タブ: 生markdownテキスト表示
    - 画像: page.images[].imageBase64 をマジックバイトで形式判定→インライン表示
   ↓
11. エクスポート(任意)
    - ZIP: main.md + 画像ファイル (JSZip → FileSaver)
    - MDのみ: 全ページ結合した .md をBlobダウンロード
```

## 各ステップの詳細

### Step 1-3: クライアント側の前処理

**ファイル**: `app/[lang]/page.tsx`

- **react-dropzone** でD&DまたはファイルピッカーからPDFを受け取る
- `isValidFileType()` でMIME typeが `application/pdf` か検証
- `isValidFileSize()` で20MB以下か検証
- `FileReader.readAsDataURL()` でBase64文字列に変換し、`data:...;base64,`プレフィックスを除去

### Step 4-8: サーバー側のOCR処理

**ファイル**: `app/action/mistral.ts`, `app/action/s3.ts`

**なぜS3を経由するか**: Mistral OCR APIは `document_url` でPDFのURLを受け取る設計。ブラウザから直接PDFバイナリを送れないため、一時的にS3に置いて署名付きURLを渡す。

1. **S3アップロード**: Base64→Buffer変換 → `PutObjectCommand` で `temp-ocr/{uuid}_{filename}` に格納
2. **署名付きURL生成**: `getSignedUrl()` で1時間有効のURLを生成
3. **Mistral OCR呼出**: `client.ocr.process()` に `mistral-ocr-latest` モデルと署名付きURLを渡す。`includeImageBase64: true` でPDF内の画像もBase64で返却させる
4. **S3クリーンアップ**: `finally`ブロックで必ず `DeleteObjectCommand` を実行（成功・失敗に関わらず）

### Step 9-10: OCR結果の構造とレンダリング

Mistralが返す `OCRResponse` の構造:

```typescript
OCRResponse {
  pages: OCRPageObject[]   // ページごとの結果
}

OCRPageObject {
  index: number            // ページ番号(0始まり)
  markdown: string         // そのページのMarkdownテキスト
  images: OCRImageObject[] // ページ内の画像
}

OCRImageObject {
  id: string               // 画像ID (markdownの![](id)と対応)
  imageBase64: string      // Base64エンコード画像データ
}
```

**Markdownレンダリング** (`app/components/OcrResultView.tsx`):

- `ReactMarkdown` に `remarkMath` + `rehypeKatex` (数式) + `remarkGfm` (テーブル等) を適用
- **画像の解決**: markdown内の `![alt](filename)` の `filename` を `page.images[].id` とマッチさせ、対応する `imageBase64` をインライン `<img src="data:...">` として表示
- **画像形式の自動判定** (`getImageFormat()`): Base64の先頭バイト（マジックバイト）から JPEG/PNG/GIF/WebP を判別

### Step 11: エクスポート

**ファイル**: `app/action/downloadHelper.ts`

- **ZIP**: 全ページの `markdown` を結合した `main.md` + 各ページの `images` を実バイナリファイルとしてZIPに格納（JSZip → FileSaver）
- **MDのみ**: 全ページのmarkdownを結合して単一の `.md` ファイルとしてBlobダウンロード

## 重要なポイント

- **PDFの「変換」はすべてMistral AI側で行われる** — このアプリはPDFのパース・テキスト抽出を一切行わず、Mistral OCR APIに丸投げしている
- **画像の扱いが二段階** — Mistralが返すmarkdown中の画像参照IDと、同じレスポンス内のBase64画像データを**クライアント側で突合**してインライン表示する
- **S3は純粋な中継地点** — アップロード→URL生成→OCR完了→即削除の一時利用のみ
