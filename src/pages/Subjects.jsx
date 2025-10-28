import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function Subjects() {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ subject_code: '', subject_name: '', instructor: '' })

  useEffect(() => { fetchSubjects() }, [])

  async function fetchSubjects() {
    setLoading(true)
    const { data, error } = await supabase.from('subjects').select('*')
    if (error) toast.error('Failed to load subjects')
    else setSubjects(data)
    setLoading(false)
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    const { error } = editing
      ? await supabase.from('subjects').update(form).eq('id', editing.id)
      : await supabase.from('subjects').insert([form])
    if (error) toast.error(editing ? 'Update failed' : 'Add failed')
    else {
      toast.success(editing ? 'Updated!' : 'Added!')
      fetchSubjects()
      setForm({ subject_code: '', subject_name: '', instructor: '' })
      setEditing(null)
      setShowModal(false)
    }
    setLoading(false)
  }

  async function handleDelete(id) {
    if (!confirm('Delete?')) return
    const { error } = await supabase.from('subjects').delete().eq('id', id)
    if (error) toast.error('Delete failed')
    else { toast.success('Deleted!'); fetchSubjects() }
  }

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Subjects</h1>
        <button onClick={() => setShowModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded">
          Add Subject
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-white rounded shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
  <thead className="bg-gray-50">
    <tr>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instructor</th>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
    </tr>
  </thead>
  <tbody className="bg-white divide-y divide-gray-200">
    {subjects.map(s => (
      <tr key={s.id} className="hover:bg-gray-50 transition-colors">
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{s.subject_code}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm">{s.subject_name}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm">{s.instructor}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
          <button
            onClick={() => {
              const { id, ...rest } = s;
              setEditing(s);
              setForm(rest);
              setShowModal(true);
            }}
            className="text-indigo-600 hover:text-indigo-900 font-medium"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(s.id)}
            className="text-red-600 hover:text-red-900 font-medium"
          >
            Delete
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-96">
            <h2 className="text-xl mb-4">{editing ? 'Edit Subject' : 'Add Subject'}</h2>
            <form onSubmit={handleSubmit}>
              <input name="subject_code" value={form.subject_code} onChange={handleChange} placeholder="Code" className="border p-2 w-full mb-2" required />
              <input name="subject_name" value={form.subject_name} onChange={handleChange} placeholder="Name" className="border p-2 w-full mb-2" required />
              <input name="instructor" value={form.instructor} onChange={handleChange} placeholder="Instructor" className="border p-2 w-full mb-4" required />
              <div className="flex gap-2">
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">Save</button>
                <button type="button" onClick={() => { setShowModal(false); setEditing(null) }} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}