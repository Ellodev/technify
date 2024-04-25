"use client";

import { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Auth } from "@supabase/auth-ui-react";
import { useRouter } from "next/navigation";
import {
    // Import predefined theme
    ThemeSupa,
  } from '@supabase/auth-ui-shared'


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const AuthUI = () => {
  const router = useRouter();
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.push("/account");
      }
    };
    checkSession();
  });

  supabase.auth.onAuthStateChange((event) => {
    if (event == "SIGNED_IN") {
      router.push("/account");
    }
  });

  return (
    <div className="">
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers=""
        theme="dark"
        view="sign_in"
      />
    </div>
  );
};

export default AuthUI;