import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, createRoutesFromElements , Route} from 'react-router-dom'
import { RouterProvider } from 'react-router'
import Login from './pages/Login'
import Register from './pages/Register'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    </Route>
  )
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
