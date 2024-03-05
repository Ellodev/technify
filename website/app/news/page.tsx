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
        const response = await fetch('http://127.0.0.1:5000/articles');
        const fetchedData: NewsItem[] = await response.json();
        setData(fetchedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-row flex-wrap min-h-screen items-center justify-center">
      <h1>Tech News Feed</h1>
      {data ? (
        data.map((element) => (
          <div key={element.id} className="m-4 bg-slate-600 w-96 rounded-md flex items-center flex-col justify-center">
            {element.media_content !== "No image" ? (
              <Image
                className="rounded-md m-2"
                src={element.media_content}
                width={500}
                height={300}
                alt={`Image for: ${element.title}`}
              />
            ) : (
              <Image
                className="rounded-md m-2"
                src="https://images.unsplash.com/photo-1709456136012-59707ec6217d?q=80&w=1375&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt={`Image for: ${element.title}`}
                width={500}
                height={300}
              />
            )}
            <div>
              <p className="text-lg">{element.title}</p>
              <p>Author: {element.author}</p>
              <p>Source: {element.source}</p>
              <a href={element.link} target="_blank" rel="noopener noreferrer">{element.link}</a>
              <p>{element.pubDate}</p>
            </div>
          </div>
        ))
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}