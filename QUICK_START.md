# Quick Start Guide

## Installation

```bash
# Install dependencies
pip install -r requirements.txt
```

## Basic Usage

### Convert a webpage (simplest form)
```bash
python webpage_to_epub.py https://example.com/article
```

### Specify output filename
```bash
python webpage_to_epub.py https://example.com/article -o my_book.epub
```

### Convert without images (faster, smaller)
```bash
python webpage_to_epub.py https://example.com/article --no-images
```

## Common Use Cases

### 1. Save a Blog Post
```bash
python webpage_to_epub.py https://medium.com/@author/article-title -o blog_post.epub
```

### 2. Convert Documentation
```bash
python webpage_to_epub.py https://docs.python.org/3/tutorial/ --no-images
```

### 3. Save News Articles
```bash
python webpage_to_epub.py https://www.example-news.com/article -o news.epub
```

### 4. Wikipedia Articles
```bash
python webpage_to_epub.py https://en.wikipedia.org/wiki/Topic -o topic.epub
```

## Python API Usage

```python
from webpage_to_epub import WebpageToEpubConverter

# Basic conversion
converter = WebpageToEpubConverter(url="https://example.com/article")
converter.convert_to_epub()

# With options
converter = WebpageToEpubConverter(
    url="https://example.com/article",
    output_filename="my_book.epub",
    include_images=False
)
converter.convert_to_epub()
```

## Tips

1. **Best for article pages**: Works best on pages with clear article content
2. **Check output**: Always verify the generated ePub looks correct
3. **Use --no-images for speed**: Skip images if you just want the text
4. **Respect copyright**: Only convert content you have rights to access

## Troubleshooting

### Problem: "Failed to fetch webpage"
- Check your internet connection
- Verify the URL is accessible in a browser
- Some sites may block automated requests

### Problem: "Insufficient content extracted"
- The page might be JavaScript-heavy
- Try viewing the page source to check if content is in HTML
- Some pages may not be suitable for conversion

### Problem: Images not loading
- Use `--no-images` flag to skip images
- Some images may require authentication
- Check if images are accessible directly

## Output

The script creates an ePub file that can be opened with:
- E-readers (Kindle, Kobo, Nook)
- Reading apps (Apple Books, Google Play Books)
- Desktop software (Calibre, Adobe Digital Editions)
- Browser extensions (EPUBReader)

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check [example_usage.py](example_usage.py) for code examples
- Customize the script for your specific needs