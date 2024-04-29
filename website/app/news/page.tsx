import NewsFilter from "@/components/NewsFilter";
import { Source } from "@/types/source.type";
import Link from "next/link";

//Define what types the subcategories of Post are
type Post = {
  source: string;
  link: string;
  author: string;
  description: string;
  categories: string;
  pubDate: string;
  media_content: string;
  media_credit: string;
  title: string;
  element_id: number;
}

//function to change the dateformat to basically timeAgo
function timeAgo(dateString: string): string {
  const past = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  } else if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  } else if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  } else {
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  }
}


type NewsProps = {
  searchParams: {
    source: Source | undefined;
  };
};


const sourceToHuman = {
  theguardian: "Technology | The Guardian",
  bbcnews: "BBC News",
  techcrunch: "TechCrunch",
  wired: "Wired"
};

async function News({ searchParams: { source } }: NewsProps) { 

  const posts = await getPosts();

  return (
    <div className="flex flex-col min-h-screen items-center justify-center">
      
      <Link href="/">Go back to home</Link>
      <NewsFilter value={source}/>

      <div className="flex flex-row flex-wrap items-center justify-center">
        {posts ? (
          posts.filter((post) => !!source ? source !== "all" ? post.source === sourceToHuman[source] : true : true).map((post) => (
            <div
              key={post.element_id}
              className="m-4 w-96 rounded-md flex flex-col justify-center"
            >
              <div>
                <a className="text-lg font-bold" href={post.link} target="_blank" rel="noopener noreferrer" style={{ cursor: 'pointer' }}>{post.title}</a>
                <p className="font-extralight">Source: {post.source}</p>
                <p className="font-extralight">{timeAgo(post.pubDate)}</p>
              </div>
            </div>
          ))
        ) : (
          <p>Loading...</p>
        )}
      </div>

      
    </div>
  );
}

async function getPosts() {
  const res = await fetch('https://bucket-tech-news.s3.eu-north-1.amazonaws.com/articles.json', { next: { revalidate: 1800 } })
  const posts: Post[] = await res.json()
  
  
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data')
  }

  return posts
}



export default News;