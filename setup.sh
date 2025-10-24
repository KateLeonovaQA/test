#!/bin/bash
# Setup script for Webpage to ePub Converter

echo "=========================================="
echo "Webpage to ePub Converter - Setup"
echo "=========================================="
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.6 or higher."
    exit 1
fi

echo "✓ Python 3 found: $(python3 --version)"
echo ""

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip."
    exit 1
fi

echo "✓ pip3 found"
echo ""

# Install dependencies
echo "Installing dependencies..."
pip3 install -q -r requirements.txt

if [ $? -eq 0 ]; then
    echo "✓ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Usage:"
echo "  python3 webpage_to_epub.py <URL> [options]"
echo ""
echo "Examples:"
echo "  python3 webpage_to_epub.py https://example.com/article"
echo "  python3 webpage_to_epub.py https://example.com/article -o book.epub"
echo "  python3 webpage_to_epub.py https://example.com/article --no-images"
echo ""
echo "For more information, see README.md or run:"
echo "  python3 webpage_to_epub.py --help"
echo ""