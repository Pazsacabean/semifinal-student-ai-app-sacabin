import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="bg-indigo-700 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex space-x-6">
        <Link to="/" className="font-bold hover:underline">Home</Link>
        <Link to="/students" className="hover:underline">Students</Link>
        <Link to="/subjects" className="hover:underline">Subjects</Link>
        <Link to="/grades" className="hover:underline">Grades</Link>
      </div>
    </nav>
  )
}