import feedparser
import json
from datetime import datetime
import boto3

# Define the RSS feed URLs
feed_urls = [
    "http://feeds.bbci.co.uk/news/technology/rss.xml",
    "https://www.theguardian.com/uk/technology/rss",
    "https://www.wired.com/feed/rss",
    "https://techcrunch.com/feed/"
]

# Define the S3 bucket and key where the JSON file will be stored
s3_bucket = "bucket-tech-news"
s3_key = "articles.json"

# Create an S3 client
s3 = boto3.client("s3")

# Define the Lambda handler function
def handler(event, context):
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

    # Sort the articles by date
    articles.sort(key=lambda x: parse_date(x["pubDate"]), reverse=True)

    # Convert the articles list to a JSON string
    articles_json = json.dumps(articles, indent=4)

    # Upload the JSON string to S3
    s3.put_object(Bucket=s3_bucket, Key=s3_key, Body=articles_json)

    # Print a success message
    print(f"Successfully saved and sorted {len(articles)} articles to {s3_bucket}/{s3_key}")

# Define a helper function to parse the date string
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
