import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'
import Login from './pages/Login'

export default function App() {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    // Lấy session hiện tại
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    // Lắng nghe thay đổi đăng nhập / đăng xuất
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  if (loading) return <p style={{textAlign:'center', marginTop:100}}>Đang tải...</p>
  if (!session) return <Login />

  // Nếu đã đăng nhập -> hiển thị giao diện sau login
  return (
    <div style={{maxWidth:600, margin:'60px auto', textAlign:'center'}}>
      <h2>Xin chào {session.user.email}</h2>
      <p>Bạn đã đăng nhập thành công vào hệ thống ATS 🎉</p>
      <button onClick={() => supabase.auth.signOut()}>Đăng xuất</button>
    </div>
  )
}
