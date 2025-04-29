import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';



export default async function Home() {
  // Check if user is logged in by looking for an auth token in cookies
  const cookieStore = await cookies();
  console.log("🚀 ~ Home ~ cookieStore:", cookieStore)
  const authToken = cookieStore.get('authToken');
  console.log("🚀 ~ Home ~ authToken:", authToken)

  // Redirect based on authentication status
  if (authToken) {
    // User is logged in, redirect to dashboard
    redirect('/dashboard');
  } else {
    // User is not logged in, redirect to login page
    redirect('/login');
  }
}
