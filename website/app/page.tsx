import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';

export default async function Home() {
  const supabase = createClient();

  const { data } = await supabase.auth.getUser();
  const userAuthenticated = data?.user;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      {userAuthenticated ? ( // Conditional rendering for user links
        <>
          <Link className="absolute right-6 top-4" href="/account">
            Account
          </Link>
        </>
      ) : (
        <Link className="absolute right-6 top-4" href="/login">
          Login
        </Link>
      )}
      <div className="flex-col relative flex place-items-center before:absolute before:h-[300px] before:w-full sm:before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full sm:after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1]">
        <p className="text-[72px]">technify</p>
        <p>Your Tech-News aggregator. Free and Open Source.
        </p>
        <Link className="text-indigo-400 underline" href="/news">
          Show me the News
        </Link>
      </div>
    </main>
  );
}
