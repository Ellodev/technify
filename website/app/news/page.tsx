'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface NewsItem {
  // Define the type of each sub-element here
  source: string;
  link: string;
  author: string;
  description: string;
  categories: string;
  pubDate: string;
  media_content: string; // Change "media_content" to "mediaContent" if necessary (case sensitivity)
  media_credit: string;
}

export default function News() {
  const [data, setData] = useState<NewsItem[] | null>(null);

  useEffect(() => {
    const fetchMyData = async () => {
      const response = await fetch('http://127.0.0.1:5000/articles');
      const fetchedData: NewsItem[] = await response.json();
      setData(fetchedData);
    };

    fetchMyData();
  }, []);

  return (
    <div>
      <h1>Tech News Feed</h1>
      {data && (
        <ul>
          {data.map((element) => (
            <li>
              <p>Source: {element.source}</p>
              <p>Link: <a href={element.link}>{element.link}</a></p>
              <p>Author: {element.author}</p>
              <p>Description: {element.description}</p>
              <p>Categories: {element.categories}</p>
              <p>PubDate: {element.pubDate}</p>
              {element.media_content !== "No image" && ( // Ensure case-sensitivity
          <Image
            src={element.media_content} // Ensure case-sensitivity
            alt="My Remote Image"
            width={500}
            height={300}
          />
        )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
