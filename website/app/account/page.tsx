import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { logout } from './logout'

export default async function account() {
  const supabase = createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/error')
  }

  return (
    <>
    <p>Hello {data.user.email}</p>
    <button onClick={logout}>Sign Out</button>
    </>
  )
}