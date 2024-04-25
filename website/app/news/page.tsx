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


async function news() {
  const postsData = await getPosts();

  return (
    <div className="flex flex-row flex-wrap min-h-screen items-center justify-center">
      {postsData.posts ? (
        postsData.posts.map((post : Post) => (
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
  );
}

async function getPosts(): Promise<{ posts: Post[] }> {
  try {
    const res = await fetch('https://bucket-tech-news.s3.eu-north-1.amazonaws.com/articles.json');
    const posts = await res.json();
    return { posts } // Return an object with the resolved posts array
  } catch (error) {
    console.error("Error fetching posts:", error);
    return { posts: [] }; // Return an empty array in case of errors
  }
}



export default news