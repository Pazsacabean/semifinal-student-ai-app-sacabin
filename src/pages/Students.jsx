import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function Students() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [form, setForm] = useState({
    student_number: '',
    first_name: '',
    last_name: '',
    course: '',
    year_level: 1
  })

  useEffect(() => {
    fetchStudents()
  }, [])

  async function fetchStudents() {
    setLoading(true)
    const { data, error } = await supabase.from('students').select('*').order('created_at', { ascending: false })
    if (error) toast.error('Failed to load students')
    else setStudents(data)
    setLoading(false)
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    let error
    if (editingStudent) {
      ({ error } = await supabase
        .from('students')
        .update(form)
        .eq('id', editingStudent.id))
    } else {
      ({ error } = await supabase.from('students').insert([form]))
    }

    if (error) {
      toast.error(editingStudent ? 'Failed to update' : 'Failed to add student')
    } else {
      toast.success(editingStudent ? 'Student updated!' : 'Student added!')
      fetchStudents()
      resetForm()
    }
    setLoading(false)
  }

  function resetForm() {
    setForm({ student_number: '', first_name: '', last_name: '', course: '', year_level: 1 })
    setEditingStudent(null)
    setShowModal(false)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this student?')) return
    const { error } = await supabase.from('students').delete().eq('id', id)
    if (error) toast.error('Failed to delete')
    else {
      toast.success('Deleted!')
      fetchStudents()
    }
  }

  function startEdit(student) {
    setEditingStudent(student)
    setForm({ ...student })
    setShowModal(true)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Students</h1>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Add Student
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((s) => (
                <tr key={s.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{s.student_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{s.first_name} {s.last_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{s.course}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{s.year_level}</td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <button
                      onClick={() => startEdit(s)}
                      className="text-indigo-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {students.length === 0 && <p className="text-center py-6 text-gray-500">No students yet.</p>}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingStudent ? 'Edit Student' : 'Add Student'}
            </h2>
            <form onSubmit={handleSubmit}>
              <input
                name="student_number"
                value={form.student_number}
                onChange={handleChange}
                placeholder="Student Number"
                className="border p-2 w-full mb-3 rounded"
                required
              />
              <input
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                placeholder="First Name"
                className="border p-2 w-full mb-3 rounded"
                required
              />
              <input
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                placeholder="Last Name"
                className="border p-2 w-full mb-3 rounded"
                required
              />
              <input
                name="course"
                value={form.course}
                onChange={handleChange}
                placeholder="Course"
                className="border p-2 w-full mb-3 rounded"
                required
              />
              <select
                name="year_level"
                value={form.year_level}
                onChange={handleChange}
                className="border p-2 w-full mb-4 rounded"
              >
                {[1, 2, 3, 4].map((y) => (
                  <option key={y} value={y}>Year {y}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingStudent ? 'Update' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-300 px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}