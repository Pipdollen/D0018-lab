import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app.jsx'
import './global.css'
import { AuthContextProdivder } from './context/authContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthContextProdivder>
      <App />
    </AuthContextProdivder>
  </React.StrictMode>,
)