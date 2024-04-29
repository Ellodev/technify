import Link from 'next/link';


export default async function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <Link className="absolute right-6 top-4 underline" href="/login">
          Login
      </Link>
      <div className="flex-col relative flex place-items-center">
        <p className="text-[72px]">technify</p>
        <p>Your Tech-News aggregator. Free and <a href="https://github.com/Ellodev/technify" className="underline">Open Source</a>.
        </p>
        <Link className="underline text-indigo-400" href="/news">Bring me to the News.</Link>
      </div>
    </main>
  );
}
