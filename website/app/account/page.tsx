import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export default async function account() {
  const supabase = createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/error')
  }

  async function logout() { 
    const { error } = await supabase.auth.signOut()
  }

  return (
    <>
    <p>Hello {data.user.email}</p>
    <button onClick={logout}>Sign Out</button>
    </>
    
  )
    
  
  

}