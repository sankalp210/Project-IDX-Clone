// src/App.jsx
import { Routers } from './Router.jsx'
import './App.css'
import { useAuthStore } from './store/authStore'
import { useEffect } from 'react'

function App() {
  const { initializeAuth } = useAuthStore()

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  return <Routers />
}

export default App