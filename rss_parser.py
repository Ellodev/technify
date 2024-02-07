# Import the feedparser library
import feedparser
# Import the json library
import json

# Define the RSS feed URL
feed_urls = [
    "http://feeds.bbci.co.uk/news/technology/rss.xml",
    "https://www.theguardian.com/uk/technology/rss",
    "https://www.wired.com/feed/rss",
    "https://techcrunch.com/feed/"
]

# Create an empty list to store the articles
articles = []

# Iterate through the feed URLs
for feed_url in feed_urls:
    # Parse the feed using feedparser
    feed = feedparser.parse(feed_url)
    # Iterate through the feed entries
    for entry in feed.entries:
        # Create a dictionary to store the article details
        article = {}
        # Get the source, link, author, and description from the entry
        article["source"] = feed.feed.title
        article["link"] = entry.link
        try:
            article["author"] = entry.author
        except (KeyError, AttributeError):
            article["author"] = "Unknown"
            print(f"Could not find the author for {entry.link}")

        article["description"] = entry.summary
        # Append the article to the list
        articles.append(article)

# Define the JSON file name
json_file = "articles.json"

# Open the JSON file in write mode
with open(json_file, "w") as f:
    # Dump the articles list into the JSON file
    json.dump(articles, f, indent=4)

# Print a success message
print(f"Successfully saved {len(articles)} articles to {json_file}")
