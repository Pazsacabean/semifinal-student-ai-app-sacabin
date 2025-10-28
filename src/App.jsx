import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Students from './pages/Students'
import Subjects from './pages/Subjects'
import Grades from './pages/Grades'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/students" element={<Students />} />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/grades" element={<Grades />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}