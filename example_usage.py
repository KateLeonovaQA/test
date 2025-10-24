#!/usr/bin/env python3
"""
Example usage of the Webpage to ePub Converter
Demonstrates different ways to use the converter
"""

from webpage_to_epub import WebpageToEpubConverter

def example_basic_conversion():
    """Basic conversion with auto-generated filename"""
    print("Example 1: Basic Conversion")
    print("-" * 50)
    
    converter = WebpageToEpubConverter(
        url="https://en.wikipedia.org/wiki/Python_(programming_language)"
    )
    output_file = converter.convert_to_epub()
    print(f"Created: {output_file}\n")


def example_custom_filename():
    """Conversion with custom output filename"""
    print("Example 2: Custom Filename")
    print("-" * 50)
    
    converter = WebpageToEpubConverter(
        url="https://en.wikipedia.org/wiki/Machine_learning",
        output_filename="machine_learning_guide.epub"
    )
    output_file = converter.convert_to_epub()
    print(f"Created: {output_file}\n")


def example_without_images():
    """Conversion without images for smaller file size"""
    print("Example 3: Without Images")
    print("-" * 50)
    
    converter = WebpageToEpubConverter(
        url="https://en.wikipedia.org/wiki/Artificial_intelligence",
        output_filename="ai_text_only.epub",
        include_images=False
    )
    output_file = converter.convert_to_epub()
    print(f"Created: {output_file}\n")


def example_batch_conversion():
    """Convert multiple webpages"""
    print("Example 4: Batch Conversion")
    print("-" * 50)
    
    urls = [
        "https://en.wikipedia.org/wiki/Python_(programming_language)",
        "https://en.wikipedia.org/wiki/JavaScript",
        "https://en.wikipedia.org/wiki/Java_(programming_language)"
    ]
    
    for url in urls:
        try:
            converter = WebpageToEpubConverter(url=url, include_images=False)
            output_file = converter.convert_to_epub()
            print(f"✓ Created: {output_file}")
        except Exception as e:
            print(f"✗ Failed to convert {url}: {e}")
    
    print()


def example_error_handling():
    """Demonstrate error handling"""
    print("Example 5: Error Handling")
    print("-" * 50)
    
    # Try to convert an invalid URL
    try:
        converter = WebpageToEpubConverter(
            url="https://this-url-does-not-exist-12345.com"
        )
        converter.convert_to_epub()
    except Exception as e:
        print(f"Expected error caught: {e}")
    
    print()


if __name__ == "__main__":
    print("=" * 50)
    print("Webpage to ePub Converter - Usage Examples")
    print("=" * 50)
    print()
    
    # Run examples (commented out to avoid actually running them)
    # Uncomment the examples you want to try
    
    # example_basic_conversion()
    # example_custom_filename()
    # example_without_images()
    # example_batch_conversion()
    # example_error_handling()
    
    print("Examples completed!")
    print("\nTo run these examples, uncomment the function calls above.")
    print("Or use the command-line interface:")
    print("  python webpage_to_epub.py <URL> [options]")