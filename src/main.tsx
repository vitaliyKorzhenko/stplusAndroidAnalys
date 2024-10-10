import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
/// <reference path="./components/spreadSheet/gcspread.sheets.d.ts" />


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
