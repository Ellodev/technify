import { login, signup } from './actions'

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center">
      <p className='text-xl'>Login/Signup</p>
      <form className='p-24 flex flex-col items-center justify-center'>
      <label htmlFor="email">Email:</label>
      <input id="email" name="email" type="email" required placeholder="email@example.com" className='bg-inherit' />
      <label htmlFor="password">Password:</label>
      <input id="password" name="password" type="password" required placeholder="mysecurepassword" className='bg-inherit' />
      <button formAction={login}>Log in</button>
      <button formAction={signup}>Sign up</button>
      </form>
    </div>
    
  )
}