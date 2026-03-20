"""PDF/画像からMarkdownへの変換コア機能。Mistral OCR APIを直接利用、S3不要。"""

from __future__ import annotations

import base64
import os
from dataclasses import dataclass, field
from pathlib import Path

from mistralai import Mistral


@dataclass
class ImageData:
    id: str
    image_base64: str | None = None


@dataclass
class Page:
    index: int
    markdown: str
    images: list[ImageData] = field(default_factory=list)


@dataclass
class ConvertResult:
    pages: list[Page]
    markdown: str


MIME_TYPES: dict[str, str] = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".bmp": "image/bmp",
    ".tiff": "image/tiff",
    ".tif": "image/tiff",
}


def _get_client(api_key: str | None = None) -> Mistral:
    key = api_key or os.environ.get("MISTRAL_API_KEY")
    if not key:
        raise RuntimeError(
            "MISTRAL_API_KEY is not set. Pass it via api_key or set the environment variable."
        )
    return Mistral(api_key=key)


def _ocr_response_to_result(ocr_response: object) -> ConvertResult:
    pages: list[Page] = []
    for i, page in enumerate(getattr(ocr_response, "pages", []) or []):
        images: list[ImageData] = []
        for img in getattr(page, "images", []) or []:
            img_b64 = getattr(img, "image_base64", None)
            images.append(ImageData(id=getattr(img, "id", ""), image_base64=img_b64))
        pages.append(Page(
            index=getattr(page, "index", i),
            markdown=getattr(page, "markdown", ""),
            images=images,
        ))
    markdown = "\n\n".join(p.markdown for p in pages)
    return ConvertResult(pages=pages, markdown=markdown)


def convert_pdf_to_markdown(
    pdf_path: str | Path,
    *,
    include_image_base64: bool = True,
    api_key: str | None = None,
) -> ConvertResult:
    """Convert a PDF file to Markdown using Mistral OCR.

    Reads the file, encodes as base64 data URL, and sends directly to Mistral — no S3 needed.
    """
    path = Path(pdf_path).resolve()
    b64 = base64.b64encode(path.read_bytes()).decode("ascii")
    data_url = f"data:application/pdf;base64,{b64}"

    client = _get_client(api_key)
    ocr_response = client.ocr.process(
        model="mistral-ocr-latest",
        document={"type": "document_url", "document_url": data_url},
        include_image_base64=include_image_base64,
    )
    return _ocr_response_to_result(ocr_response)


def convert_image_to_markdown(
    image_path: str | Path,
    *,
    include_image_base64: bool = True,
    api_key: str | None = None,
) -> ConvertResult:
    """Convert an image file to Markdown using Mistral OCR.

    Supported formats: PNG, JPG, GIF, WebP, BMP, TIFF.
    """
    path = Path(image_path).resolve()
    ext = path.suffix.lower()
    mime_type = MIME_TYPES.get(ext)
    if not mime_type:
        supported = ", ".join(MIME_TYPES.keys())
        raise ValueError(f"Unsupported image format: {ext}. Supported: {supported}")

    b64 = base64.b64encode(path.read_bytes()).decode("ascii")
    data_url = f"data:{mime_type};base64,{b64}"

    client = _get_client(api_key)
    ocr_response = client.ocr.process(
        model="mistral-ocr-latest",
        document={"type": "image_url", "image_url": data_url},
        include_image_base64=include_image_base64,
    )
    return _ocr_response_to_result(ocr_response)
