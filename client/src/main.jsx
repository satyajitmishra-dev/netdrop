import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import './index.css'
import App from './App.jsx'
import { store } from './store/store'
import { WebRTCProvider } from './context/WebRTCContext.jsx'
import { HistoryProvider } from './context/HistoryContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <WebRTCProvider>
        <HistoryProvider>
          <App />
        </HistoryProvider>
      </WebRTCProvider>
    </Provider>
  </StrictMode>,
)

