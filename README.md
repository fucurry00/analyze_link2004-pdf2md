# pdf2md — Extracted Core

PDF/画像からMarkdownへの変換コア機能。Mistral OCR APIを直接利用し、S3依存なし。

## 必要条件

- `MISTRAL_API_KEY` 環境変数
- **TypeScript版**: Node.js 18+
- **Python版**: Python 3.10+

## セットアップ

```bash
# TypeScript版
npm install

# Python版
pip install mistralai
```

---

## TypeScript

### CLI

```bash
npx tsx extracted/cli.ts input.pdf                        # stdout出力
npx tsx extracted/cli.ts input.pdf -o output.md           # ファイル出力
npx tsx extracted/cli.ts input.pdf -o output.md --no-images
npx tsx extracted/cli.ts photo.png -o output.md           # 画像も対応
```

### ライブラリ

```typescript
import { convertPdfToMarkdown, convertImageToMarkdown } from "./extracted/pdf2md.js";

const result = await convertPdfToMarkdown("document.pdf");
console.log(result.markdown);

const imgResult = await convertImageToMarkdown("photo.png", {
  includeImageBase64: false,
});
```

---

## Python

### CLI

```bash
python extracted/cli.py input.pdf                         # stdout出力
python extracted/cli.py input.pdf -o output.md            # ファイル出力
python extracted/cli.py input.pdf -o output.md --no-images
python extracted/cli.py photo.png -o output.md            # 画像も対応
```

### ライブラリ

```python
from extracted.pdf2md import convert_pdf_to_markdown, convert_image_to_markdown

result = convert_pdf_to_markdown("document.pdf")
print(result.markdown)
print(f"{len(result.pages)} pages")

img_result = convert_image_to_markdown("photo.png", include_image_base64=False)

# APIキーを直接渡す
result2 = convert_pdf_to_markdown("document.pdf", api_key="your-api-key")
```

---

## API

両言語とも同じインターフェース。

### `convertPdfToMarkdown` / `convert_pdf_to_markdown`

PDFファイルをMarkdownに変換。

- `pdfPath` / `pdf_path` — PDFファイルのパス
- `includeImageBase64` / `include_image_base64` — 画像Base64データを含めるか（デフォルト: `true`）
- `apiKey` / `api_key` — Mistral APIキー（デフォルト: `MISTRAL_API_KEY`環境変数）

### `convertImageToMarkdown` / `convert_image_to_markdown`

画像ファイルをMarkdownに変換。対応形式: PNG, JPG, GIF, WebP, BMP, TIFF

### 戻り値: `ConvertResult`

```
{
  pages: [{ index, markdown, images: [{ id, image_base64? }] }]
  markdown: string    // 全ページ結合
}
```

## 設計判断

- **S3不要**: Mistral OCR APIはBase64データURLを直接受け取れるため、S3を経由する必要がない
- **環境変数1つ**: `MISTRAL_API_KEY`のみ必要（元アプリはAWS認証情報も必要だった）
- **外部依存最小**: Mistral SDKのみ。CLIの引数パースも標準ライブラリで直接処理
- **TypeScript/Python同一設計**: 同じAPI構造、同じCLIインターフェース
