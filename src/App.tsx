import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ReputationDetailPage from './pages/ReputationDetailPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/reputation/detail" element={<ReputationDetailPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App