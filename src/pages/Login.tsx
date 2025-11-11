import { supabase } from '../lib/supabaseClient'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'

export default function Login() {
  return (
    <div style={{maxWidth: 420, margin: '64px auto', padding: 16}}>
      <h2 style={{textAlign:'center', marginBottom:16}}>Đăng nhập ATS</h2>
      <Auth 
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={[]}   // chỉ dùng login qua email
        view="sign_in"
      />
    </div>
  )
}
