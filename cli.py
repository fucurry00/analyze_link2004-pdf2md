#!/usr/bin/env python3
"""CLI entry point for pdf2md conversion."""

from __future__ import annotations

import sys
from pathlib import Path

from pdf2md import convert_image_to_markdown, convert_pdf_to_markdown

IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".tiff", ".tif"}

USAGE = """\
Usage: python extracted/cli.py <input-file> [options]

Options:
  -o, --output <file>   Write output to file instead of stdout
  --no-images           Disable image base64 extraction
  -h, --help            Show this help message

Examples:
  python extracted/cli.py document.pdf
  python extracted/cli.py document.pdf -o output.md
  python extracted/cli.py photo.png -o output.md --no-images"""


def parse_args(argv: list[str]) -> tuple[str, str | None, bool]:
    """Parse CLI arguments. Returns (input_file, output_file, include_images)."""
    args = argv[1:]  # skip script path
    input_file = ""
    output_file: str | None = None
    include_images = True

    i = 0
    while i < len(args):
        arg = args[i]
        if arg in ("-h", "--help"):
            print(USAGE, file=sys.stderr)
            sys.exit(0)
        elif arg == "--no-images":
            include_images = False
        elif arg in ("-o", "--output"):
            i += 1
            if i >= len(args):
                print("Error: --output requires a file path", file=sys.stderr)
                sys.exit(1)
            output_file = args[i]
        elif arg.startswith("-"):
            print(f"Error: Unknown option: {arg}", file=sys.stderr)
            print(USAGE, file=sys.stderr)
            sys.exit(1)
        else:
            input_file = arg
        i += 1

    if not input_file:
        print("Error: No input file specified", file=sys.stderr)
        print(USAGE, file=sys.stderr)
        sys.exit(1)

    return input_file, output_file, include_images


def main() -> None:
    input_file, output_file, include_images = parse_args(sys.argv)

    path = Path(input_file).resolve()
    if not path.exists():
        print(f"Error: File not found: {path}", file=sys.stderr)
        sys.exit(1)

    ext = path.suffix.lower()
    is_image = ext in IMAGE_EXTENSIONS

    print(f"Processing: {path.name}", file=sys.stderr)

    if is_image:
        result = convert_image_to_markdown(path, include_image_base64=include_images)
    else:
        result = convert_pdf_to_markdown(path, include_image_base64=include_images)

    print(f"Done: {len(result.pages)} page(s) processed", file=sys.stderr)

    if output_file:
        out_path = Path(output_file).resolve()
        out_path.write_text(result.markdown, encoding="utf-8")
        print(f"Written to: {out_path}", file=sys.stderr)
    else:
        sys.stdout.write(result.markdown)


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
