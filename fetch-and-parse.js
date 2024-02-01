// import the required modules
import fetch from 'node-fetch';
import { writeFileSync } from 'fs';
import RSSParser from 'rss-parser';

// create a new RSS parser instance
const parser = new RSSParser();

// define the RSS feed URLs to fetch
const feedURLs = [
  "https://www.wired.com/feed/rss",
  "https://www.nytimes.com/svc/collections/v1/publish/https://www.nytimes.com/section/technology/rss.xml",
  "https://feeds.feedburner.com/TechCrunch/"
];

// define an async function to fetch and parse the RSS feeds
async function fetchAndParseRSSFeeds(feedURLs) {
  // create an empty array to store the parsed items
  let items = [];

  // loop through the feed URLs
  for (let url of feedURLs) {
    // fetch the RSS feed from the URL
    const response = await fetch(url);
    // get the text content of the response
    const text = await response.text();
    // parse the text content into a JSON object
    const feed = await parser.parseString(text);
    // push the feed items into the array
    items.push(...feed.items);
  }

  // return the array of items
  return items;
}

// define a function to sort the items by date
function sortByDate(items) {
  // use the Array.sort method to compare the pubDate property of each item
  return items.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
}

// define the file path to write the JSON data
const filePath = "feeds.json";

// call the async function to fetch and parse the RSS feeds
fetchAndParseRSSFeeds(feedURLs)
  .then(items => {
    // sort the items by date
    const sortedItems = sortByDate(items);
    // convert the sorted items into a JSON string
    const json = JSON.stringify(sortedItems, null, 2);
    // write the JSON string to the file
    writeFileSync(filePath, json);
    // log a success message
    console.log(`Successfully wrote ${sortedItems.length} items to ${filePath}`);
  })
  .catch(error => {
    // log any error
    console.error(error);
  });
