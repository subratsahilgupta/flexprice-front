import './App.css'
import { RouterProvider } from 'react-router-dom'
import { MainRouter } from './core/routes/Routes'
import { AuthProvider } from './core/auth/AuthProvider'

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={MainRouter} />
    </AuthProvider>
  )
}