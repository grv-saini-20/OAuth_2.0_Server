import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import store from './../store'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom'
import { RouterProvider } from 'react-router'
import LoginPage from './pages/LoginPage'
import Callback from './pages/CallbackPage'
import HomePage from './pages/HomePage'



const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />} >,
    <Route path="/login" element={<LoginPage />} />
    <Route path="/home" element={<HomePage />} />
    <Route path="/callback" element={<Callback />} />
    </Route>
  )
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
)
