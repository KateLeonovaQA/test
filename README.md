# Webpage to ePub Converter

A Python script that converts any webpage into a readable ePub e-book, automatically stripping away ads, navigation menus, and unnecessary formatting while preserving the main content.

## Features

- 🧹 **Clean Content Extraction**: Automatically removes ads, navigation, footers, sidebars, and other clutter
- 📚 **ePub Generation**: Creates properly formatted ePub files compatible with most e-readers
- 🖼️ **Image Support**: Downloads and embeds images from the webpage
- 📝 **Metadata Extraction**: Automatically extracts title, author, and description
- 🎨 **Readable Formatting**: Applies clean, readable styling optimized for e-readers
- ⚙️ **Customizable**: Options to exclude images or specify custom output filenames

## Installation

1. Clone or download this repository
2. Install the required dependencies:

```bash
pip install -r requirements.txt
```

## Requirements

- Python 3.6 or higher
- Dependencies (automatically installed via requirements.txt):
  - requests
  - beautifulsoup4
  - ebooklib
  - html2text
  - lxml

## Usage

### Basic Usage

Convert a webpage to ePub with auto-generated filename:

```bash
python webpage_to_epub.py https://example.com/article
```

### Custom Output Filename

Specify a custom output filename:

```bash
python webpage_to_epub.py https://example.com/article -o my_book.epub
```

### Exclude Images

Convert without downloading images (faster, smaller file size):

```bash
python webpage_to_epub.py https://example.com/article --no-images
```

### Command-Line Options

```
usage: webpage_to_epub.py [-h] [-o OUTPUT] [--no-images] url

Convert any webpage into a readable ePub e-book

positional arguments:
  url                   URL of the webpage to convert

optional arguments:
  -h, --help            show this help message and exit
  -o OUTPUT, --output OUTPUT
                        Output filename (default: auto-generated)
  --no-images           Do not include images in the ePub
```

## How It Works

1. **Fetches the Webpage**: Downloads the HTML content from the provided URL
2. **Extracts Metadata**: Pulls title, author, and description from meta tags
3. **Cleans Content**: Removes unwanted elements:
   - Scripts and styles
   - Navigation menus
   - Headers and footers
   - Sidebars
   - Advertisements
   - Social media widgets
   - Comment sections
   - Related articles sections
4. **Processes Images**: Downloads and embeds images (if enabled)
5. **Generates ePub**: Creates a properly formatted ePub file with:
   - Clean, readable styling
   - Proper metadata
   - Table of contents
   - Embedded images

## Examples

### Convert a Blog Post

```bash
python webpage_to_epub.py https://medium.com/@author/article-title
```

### Convert a News Article

```bash
python webpage_to_epub.py https://www.nytimes.com/2024/01/01/article.html -o news_article.epub
```

### Convert Documentation

```bash
python webpage_to_epub.py https://docs.python.org/3/tutorial/index.html --no-images
```

### Convert a Wikipedia Article

```bash
python webpage_to_epub.py https://en.wikipedia.org/wiki/Python_(programming_language) -o python_wiki.epub
```

## Content Extraction Strategy

The script uses multiple strategies to identify and extract the main content:

1. Looks for semantic HTML5 elements (`<article>`, `<main>`)
2. Searches for common content container classes/IDs
3. Falls back to the entire body if no main content area is found
4. Removes elements matching common ad and navigation patterns

## Styling

The generated ePub includes CSS styling for:

- Readable serif font for body text
- Sans-serif fonts for headings
- Proper line spacing and margins
- Justified text alignment
- Responsive images
- Styled blockquotes and code blocks
- Clean link formatting

## Limitations

- **JavaScript-heavy sites**: Sites that load content dynamically via JavaScript may not work perfectly
- **Paywalled content**: Cannot access content behind paywalls or login requirements
- **Complex layouts**: Very complex page layouts might not convert perfectly
- **Rate limiting**: Some websites may block or rate-limit automated requests

## Troubleshooting

### "Failed to fetch webpage" Error

- Check your internet connection
- Verify the URL is correct and accessible
- Some websites may block automated requests

### Missing Content

- The webpage might use JavaScript to load content
- Try viewing the page source to see if the content is in the HTML
- Some sites may require authentication

### Images Not Loading

- Check if the images are accessible without authentication
- Some images may be blocked by CORS policies
- Use `--no-images` flag if images are causing issues

## Use Cases

- 📖 **Reading Articles Offline**: Save articles for offline reading on your e-reader
- 📚 **Building Personal Library**: Create a collection of web articles in ePub format
- 🎓 **Educational Content**: Convert tutorials and documentation for easier reading
- 📰 **News Archiving**: Save news articles in a clean, readable format
- 🔬 **Research**: Convert research papers and articles for annotation on e-readers

## License

This script is provided as-is for educational and personal use. Please respect website terms of service and copyright when converting content.

## Contributing

Feel free to submit issues, fork the repository, and create pull requests for any improvements.

## Tips for Best Results

1. **Use on article pages**: Works best on pages with clear article content
2. **Avoid homepages**: Homepage layouts are often too complex
3. **Check the output**: Always verify the generated ePub looks correct
4. **Respect copyright**: Only convert content you have the right to access
5. **Test different sites**: Different websites may require adjustments

## Future Enhancements

Potential improvements for future versions:

- Support for multi-page articles
- Better JavaScript rendering support
- Custom CSS styling options
- Batch conversion of multiple URLs
- Support for other e-book formats (MOBI, PDF)
- Configuration file for site-specific rules
- Better handling of complex layouts

---

**Note**: This tool is for personal use. Always respect website terms of service and copyright laws when converting web content.