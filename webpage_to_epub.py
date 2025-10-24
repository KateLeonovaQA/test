#!/usr/bin/env python3
"""
Webpage to ePub Converter
Converts any webpage into a readable ePub e-book, stripping away ads and unnecessary formatting.
"""

import os
import sys
import re
import argparse
from datetime import datetime
from urllib.parse import urljoin, urlparse
import requests
from bs4 import BeautifulSoup
from ebooklib import epub
import html2text


class WebpageToEpubConverter:
    """Converts webpages to ePub format with clean, readable content."""
    
    def __init__(self, url, output_filename=None, include_images=True):
        """
        Initialize the converter.
        
        Args:
            url: The webpage URL to convert
            output_filename: Optional custom output filename
            include_images: Whether to download and include images
        """
        self.url = url
        self.include_images = include_images
        self.output_filename = output_filename or self._generate_filename()
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        
    def _generate_filename(self):
        """Generate a filename based on the URL."""
        parsed = urlparse(self.url)
        domain = parsed.netloc.replace('www.', '')
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        return f"{domain}_{timestamp}.epub"
    
    def fetch_webpage(self):
        """Fetch the webpage content."""
        try:
            response = self.session.get(self.url, timeout=30)
            response.raise_for_status()
            return response.text
        except requests.RequestException as e:
            raise Exception(f"Failed to fetch webpage: {e}")
    
    def clean_content(self, html_content):
        """
        Extract and clean the main content from HTML.
        Removes ads, navigation, footers, and other clutter.
        """
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Try to find the main content area first
        main_content = None
        
        # Look for common content containers
        content_selectors = [
            {'name': 'article'},
            {'name': 'main'},
            {'id': 'content'},
            {'id': 'main-content'},
            {'id': 'article'},
            {'class': 'article'},
            {'class': 'post'},
            {'class': 'entry'},
            {'class': 'content'},
            {'id': 'mw-content-text'},  # Wikipedia specific
        ]
        
        for selector in content_selectors:
            main_content = soup.find(**selector)
            if main_content and len(main_content.get_text(strip=True)) > 100:
                break
        
        # If no main content found, use body
        if not main_content:
            main_content = soup.find('body')
        
        if not main_content:
            main_content = soup
        
        # Now clean the content
        # Remove unwanted elements
        unwanted_tags = [
            'script', 'style', 'nav', 'iframe', 'noscript'
        ]
        for tag in unwanted_tags:
            for element in main_content.find_all(tag):
                element.decompose()
        
        # Remove elements by class/id (common ad and navigation patterns)
        # Be more selective to avoid removing too much content
        unwanted_patterns = [
            r'\bad\b', r'\bads\b', r'advertisement', r'\bbanner\b', 
            r'popup', r'modal', r'\bnav\b', r'navigation',
            r'\bmenu\b', r'social-share', r'\bshare\b',
            r'cookie-banner', r'cookie-notice'
        ]
        
        for pattern in unwanted_patterns:
            # Remove by class
            for element in main_content.find_all(class_=re.compile(pattern, re.I)):
                element.decompose()
            # Remove by id
            for element in main_content.find_all(id=re.compile(pattern, re.I)):
                element.decompose()
        
        # Remove specific Wikipedia elements
        for element in main_content.find_all(class_=re.compile(r'navbox|infobox|sidebar|toc', re.I)):
            element.decompose()
        
        return main_content
    
    def extract_metadata(self, soup):
        """Extract metadata from the webpage."""
        metadata = {
            'title': 'Untitled',
            'author': 'Unknown',
            'description': ''
        }
        
        # Extract title
        title_tag = soup.find('title')
        if title_tag:
            metadata['title'] = title_tag.get_text().strip()
        
        # Try Open Graph title
        og_title = soup.find('meta', property='og:title')
        if og_title and og_title.get('content'):
            metadata['title'] = og_title['content'].strip()
        
        # Extract author
        author_meta = soup.find('meta', attrs={'name': re.compile(r'author', re.I)})
        if author_meta and author_meta.get('content'):
            metadata['author'] = author_meta['content'].strip()
        
        # Try article:author
        og_author = soup.find('meta', property='article:author')
        if og_author and og_author.get('content'):
            metadata['author'] = og_author['content'].strip()
        
        # Extract description
        desc_meta = soup.find('meta', attrs={'name': re.compile(r'description', re.I)})
        if desc_meta and desc_meta.get('content'):
            metadata['description'] = desc_meta['content'].strip()
        
        # Try Open Graph description
        og_desc = soup.find('meta', property='og:description')
        if og_desc and og_desc.get('content'):
            metadata['description'] = og_desc['content'].strip()
        
        return metadata
    
    def download_image(self, img_url):
        """Download an image and return its content."""
        try:
            # Make URL absolute
            absolute_url = urljoin(self.url, img_url)
            response = self.session.get(absolute_url, timeout=10)
            response.raise_for_status()
            return response.content
        except Exception as e:
            print(f"Failed to download image {img_url}: {e}")
            return None
    
    def process_images(self, content_soup, book):
        """Process and embed images in the ePub."""
        if not self.include_images:
            # Remove all images if not including them
            for img in content_soup.find_all('img'):
                img.decompose()
            return content_soup
        
        images = content_soup.find_all('img')
        image_counter = 1
        
        for img in images:
            src = img.get('src')
            if not src:
                img.decompose()
                continue
            
            # Download image
            image_content = self.download_image(src)
            if not image_content:
                img.decompose()
                continue
            
            # Determine image type
            img_ext = 'jpg'
            if src.lower().endswith('.png'):
                img_ext = 'png'
            elif src.lower().endswith('.gif'):
                img_ext = 'gif'
            elif src.lower().endswith('.webp'):
                img_ext = 'webp'
            
            # Create image item
            img_filename = f"image_{image_counter}.{img_ext}"
            img_item = epub.EpubImage()
            img_item.file_name = f"images/{img_filename}"
            img_item.content = image_content
            
            # Add to book
            book.add_item(img_item)
            
            # Update img tag
            img['src'] = f"images/{img_filename}"
            img['alt'] = img.get('alt', f'Image {image_counter}')
            
            image_counter += 1
        
        return content_soup
    
    def convert_to_epub(self):
        """Main conversion method."""
        print(f"Fetching webpage: {self.url}")
        html_content = self.fetch_webpage()
        
        print("Parsing and cleaning content...")
        soup = BeautifulSoup(html_content, 'html.parser')
        metadata = self.extract_metadata(soup)
        clean_content = self.clean_content(html_content)
        
        print("Creating ePub book...")
        book = epub.EpubBook()
        
        # Set metadata
        book.set_identifier(self.url)
        book.set_title(metadata['title'])
        book.set_language('en')
        book.add_author(metadata['author'])
        
        if metadata['description']:
            book.add_metadata('DC', 'description', metadata['description'])
        
        # Process images
        if self.include_images:
            print("Processing images...")
            clean_content = self.process_images(clean_content, book)
        
        # Get the inner HTML content
        content_body = ''.join(str(child) for child in clean_content.children)
        
        # Ensure we have some content
        if not content_body or len(content_body.strip()) < 50:
            raise Exception("Insufficient content extracted from webpage")
        
        # Create chapter
        chapter = epub.EpubHtml(
            title=metadata['title'],
            file_name='content.xhtml',
            lang='en'
        )
        
        # Build the content with proper structure
        chapter_content = f'<h1>{metadata["title"]}</h1>\n{content_body}'
        
        # Add some basic CSS for better readability
        css = '''
        body {
            font-family: Georgia, serif;
            line-height: 1.6;
            margin: 2em;
        }
        h1, h2, h3, h4, h5, h6 {
            font-family: Arial, sans-serif;
            margin-top: 1.5em;
            margin-bottom: 0.5em;
        }
        p {
            margin: 1em 0;
            text-align: justify;
        }
        img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 1em auto;
        }
        blockquote {
            margin: 1em 2em;
            padding-left: 1em;
            border-left: 3px solid #ccc;
            font-style: italic;
        }
        code {
            font-family: monospace;
            background-color: #f4f4f4;
            padding: 0.2em 0.4em;
        }
        pre {
            background-color: #f4f4f4;
            padding: 1em;
            overflow-x: auto;
        }
        a {
            color: #0066cc;
            text-decoration: none;
        }
        '''
        
        style = epub.EpubItem(
            uid="style",
            file_name="style.css",
            media_type="text/css",
            content=css
        )
        book.add_item(style)
        
        # Set chapter content
        chapter.content = chapter_content
        chapter.add_item(style)
        
        # Add chapter to book
        book.add_item(chapter)
        
        # Create table of contents
        book.toc = (chapter,)
        
        # Add navigation files
        book.add_item(epub.EpubNcx())
        book.add_item(epub.EpubNav())
        
        # Define spine
        book.spine = ['nav', chapter]
        
        # Write ePub file
        print(f"Writing ePub file: {self.output_filename}")
        epub.write_epub(self.output_filename, book)
        
        print(f"✓ Successfully created: {self.output_filename}")
        return self.output_filename


def main():
    """Main entry point for the script."""
    parser = argparse.ArgumentParser(
        description='Convert any webpage into a readable ePub e-book',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Examples:
  %(prog)s https://example.com/article
  %(prog)s https://example.com/article -o my_book.epub
  %(prog)s https://example.com/article --no-images
        '''
    )
    
    parser.add_argument(
        'url',
        help='URL of the webpage to convert'
    )
    
    parser.add_argument(
        '-o', '--output',
        help='Output filename (default: auto-generated)',
        default=None
    )
    
    parser.add_argument(
        '--no-images',
        action='store_true',
        help='Do not include images in the ePub'
    )
    
    args = parser.parse_args()
    
    try:
        converter = WebpageToEpubConverter(
            url=args.url,
            output_filename=args.output,
            include_images=not args.no_images
        )
        converter.convert_to_epub()
        return 0
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())