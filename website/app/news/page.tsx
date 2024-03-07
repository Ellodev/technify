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
  media_content: string;
  media_credit: string;
  title: string;
  id: number;
}

export default function News() {
  const [data, setData] = useState<NewsItem[] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://bucket-tech-news.s3.eu-north-1.amazonaws.com/articles.json');
        const fetchedData: NewsItem[] = await response.json();
        setData(fetchedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleClick = (link: string) => {
    if (link) {
      window.open(link, '_blank'); // Opens the link in a new tab
      // Alternatively, you can use window.location.href = link; to open in the same tab
    }
  };

  return (
    <div className="flex flex-row flex-wrap min-h-screen items-center justify-center">
      {data ? (
        data.map((element) => (
          <div
            key={element.id}
            className="m-4 w-96 rounded-md flex items-center flex-col justify-center"
            onClick={() => handleClick(element.link)}
            style={{ cursor: 'pointer' }}
          >
            <div>
              <p className="text-lg font-bold">{element.title}</p>
              <p className="font-extralight">Source: {element.source}</p>
              <p className="font-extralight">{element.pubDate}</p>
            </div>
          </div>
        ))
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
