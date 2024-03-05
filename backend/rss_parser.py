import feedparser
import json
from datetime import datetime

# Define the RSS feed URLs
feed_urls = [
    "http://feeds.bbci.co.uk/news/technology/rss.xml",
    "https://www.theguardian.com/uk/technology/rss",
    "https://www.wired.com/feed/rss",
    "https://techcrunch.com/feed/"
]

# Create an empty list to store the articles
articles = []

element_id = 0

# Iterate through the feed URLs
for feed_url in feed_urls:
    # Parse the feed using feedparser
    feed = feedparser.parse(feed_url)
    # Iterate through the feed entries
    for entry in feed.entries:
        # Create a dictionary to store the article details
        element_id += 1
        article = {
            "source": feed.feed.title,
            "link": entry.link,
            "author": entry.get("author", "Unknown"),
            "description": entry.summary,
            "categories": [category['term'] for category in entry.get('tags', [])],
            "pubDate": entry.get("published", "Unknown"),
            "media_content": entry.get("media_content", [{}])[0].get("url", "No image"),
            "media_credit": entry.get("media_credit", "Unknown"),
            "title": entry.title,
            "element_id": element_id
        }
        # Append the article to the list
        articles.append(article)

def parse_date(date_string):
    # Define a list of date formats to try
    date_formats = [
        '%a, %d %b %Y %H:%M:%S %z',  # Format with timezone offset
        '%a, %d %b %Y %H:%M:%S %Z',  # Format with timezone name
        # Add more formats here as needed
    ]
    
      # Try to parse the date using each format
    for date_format in date_formats:
        try:
            # Parse the date and convert it to a timezone-naive datetime object
            parsed_date = datetime.strptime(date_string, date_format)
            # If the parsed date is offset-aware, convert it to offset-naive
            if parsed_date.tzinfo is not None:
                return parsed_date.replace(tzinfo=None)
            return parsed_date
        except ValueError:
            continue
    # If all formats fail, return None or raise an exception
    return None

# sort articles
articles.sort(key=lambda x: parse_date(x["pubDate"]), reverse=True)


# Define the JSON file name
json_file = "articles.json"

# Open the JSON file in write mode
with open(json_file, "w") as f:
    # Dump the sorted articles list into the JSON file
    json.dump(articles, f, indent=4)

# Print a success message
print(f"Successfully saved and sorted {len(articles)} articles to {json_file}")
