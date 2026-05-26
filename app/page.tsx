import { TippSystem } from '@/components/tipp-system'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Nicht eingeloggt → zum Login
  if (!user) redirect("/login")

  return (
    <div>
      <p>Eingeloggt als: {user.email}</p>
      <form action="/auth/logout" method="POST">
        <button type="submit">Logout</button>
      </form>
      {/*WM26 */}
    </div>
  )
}
