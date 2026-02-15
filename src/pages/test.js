// pages/test.js
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client' // Adjust path if necessary

export default function TestPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function testConnection() {
      // Replace 'profiles' with a table name that exists in your database
      const { data, error } = await supabase.from('profile').select('*').limit(1)

      if (error) {
        console.error('❌ Connection Failed:', error)
        setError(error.message)
      } else {
        console.log('✅ Connection Successful! Data:', data)
        setData(data)
      }
    }

    testConnection()
  }, [])

  return (
    <div style={{ padding: 20 }}>
      <h1>Supabase Local Connection Test</h1>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {data && <p style={{ color: 'green' }}>✅ Successfully connected!</p>}
      {!data && !error && <p>Testing connection...</p>}
    </div>
  )
}