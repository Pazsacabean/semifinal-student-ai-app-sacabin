import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { analyzeStudentPerformance } from '../lib/ai'
import { PDFViewer } from '@react-pdf/renderer'
import toast from 'react-hot-toast'

// --- PDF Report Component ---
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12, fontFamily: 'Helvetica' },
  title: { fontSize: 20, textAlign: 'center', marginBottom: 20 },
  section: { marginBottom: 15 },
  row: { flexDirection: 'row', borderBottom: '1pt solid #ddd', padding: '5 0' },
  cell: { width: '25%', fontSize: 10 }
})

function AiReportPDF({ report, subjectName, students }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>AI Performance Report: {subjectName}</Text>
        <View style={styles.section}>
          <Text>{report.analysis}</Text>
        </View>
        <View style={styles.section}>
          <Text style={{ fontWeight: 'bold' }}>Passed Students:</Text>
          {report.passedStudents.map((name, i) => (
            <Text key={i}>✅ {name}</Text>
          ))}
        </View>
        <View style={styles.section}>
          <Text style={{ fontWeight: 'bold' }}>Failed Students:</Text>
          {report.failedStudents.map((name, i) => (
            <Text key={i}>❌ {name}</Text>
          ))}
        </View>
        <View style={styles.section}>
          <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Grade Details:</Text>
          <View style={styles.row}>
            <Text style={styles.cell}>Name</Text>
            <Text style={styles.cell}>Prelim</Text>
            <Text style={styles.cell}>Midterm</Text>
            <Text style={styles.cell}>Final</Text>
          </View>
          {students.map((s, i) => (
            <View key={i} style={styles.row}>
              <Text style={styles.cell}>{s.name}</Text>
              <Text style={styles.cell}>{s.prelim || 0}</Text>
              <Text style={styles.cell}>{s.midterm || 0}</Text>
              <Text style={styles.cell}>{s.final || 0}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  )
}

// --- Main Component ---
export default function Grades() {
  const [subjects, setSubjects] = useState([])
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [studentsWithGrades, setStudentsWithGrades] = useState([])
  const [aiReport, setAiReport] = useState(null)
  const [loading, setLoading] = useState(false)

  // Load subjects on mount
  useEffect(() => {
    const fetchSubjects = async () => {
      const { data, error } = await supabase.from('subjects').select('*')
      if (error) {
        console.error('Error loading subjects:', error)
        toast.error('Failed to load subjects')
      } else {
        setSubjects(data)
      }
    }
    fetchSubjects()
  }, [])

  // Load grades for selected subject
  async function loadGrades(subjectId, subjectName) {
    setLoading(true)
    try {
      // 1. Get grades for this subject
      const { data: grades, error: gradesError } = await supabase
        .from('grades')
        .select('id, student_id, prelim, midterm, semifinal, final')
        .eq('subject_id', subjectId)

      if (gradesError) throw gradesError

      if (grades.length === 0) {
        setStudentsWithGrades([])
        setSelectedSubject({ id: subjectId, name: subjectName })
        setLoading(false)
        return
      }

      // 2. Get all students referenced in these grades
      const studentIds = [...new Set(grades.map(g => g.student_id))]
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id, first_name, last_name')
        .in('id', studentIds)

      if (studentsError) throw studentsError

      // 3. Merge grades with student names
      const enriched = grades.map(g => {
        const student = students.find(s => s.id === g.student_id)
        return {
          id: g.id,
          name: student ? `${student.first_name} ${student.last_name}` : 'Unknown Student',
          prelim: g.prelim || '',
          midterm: g.midterm || '',
          semifinal: g.semifinal || '',
          final: g.final || ''
        }
      })

      setStudentsWithGrades(enriched)
      setSelectedSubject({ id: subjectId, name: subjectName })

    } catch (error) {
      console.error('Load grades error:', error)
      toast.error('Failed to load grades')
    }
    setLoading(false)
  }

  // Save individual grade field on blur
  async function saveGrade(gradeId, field, value) {
    const numValue = value === '' ? null : parseFloat(value)
    const { error } = await supabase
      .from('grades')
      .update({ [field]: numValue })
      .eq('id', gradeId)

    if (error) {
      console.error('Save error:', error)
      toast.error('Failed to save grade')
    } else {
      // Optimistically update local state
      setStudentsWithGrades(prev =>
        prev.map(g => g.id === gradeId ? { ...g, [field]: value } : g)
      )
      toast.success('Grade saved!')
    }
  }

  // Generate AI Report
  async function generateReport() {
    if (!selectedSubject) return toast.error('Please select a subject')
    if (studentsWithGrades.length === 0) return toast.error('No grades to analyze')

    const dataForAI = studentsWithGrades.map(s => ({
    name: s.name,
    prelim: parseFloat(s.prelim) || 0,
    midterm: parseFloat(s.midterm) || 0,
    semifinal: parseFloat(s.semifinal) || 0,
    final: parseFloat(s.final) || 0
    }))

    try {
      const report = await analyzeStudentPerformance(selectedSubject.name, dataForAI)
      setAiReport(report)
    } catch (err) {
      console.error('AI error:', err)
      toast.error('AI analysis failed')
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Grades Management</h1>

      {/* Subject Selector */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">Select Subject</label>
        <select
          onChange={(e) => {
            const subj = subjects.find(s => s.id === e.target.value)
            if (subj) loadGrades(subj.id, subj.subject_name)
          }}
          className="border p-2 rounded w-full max-w-xs"
        >
          <option value="">-- Choose a subject --</option>
          {subjects.map(s => (
            <option key={s.id} value={s.id}>
              {s.subject_code} - {s.subject_name}
            </option>
          ))}
        </select>
      </div>

      {/* Loading */}
      {loading && <p className="text-indigo-600">Loading grades...</p>}

      {/* Grades Table */}
      {studentsWithGrades.length > 0 && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Grades for {selectedSubject?.name}</h2>
            <button
              onClick={generateReport}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Generate AI Report
            </button>
          </div>

          <div className="bg-white rounded shadow overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">Student</th>
                  <th className="p-3 text-left">Prelim</th>
                  <th className="p-3 text-left">Midterm</th>
                  <th className="p-3 text-left">Semi-Final</th>
                  <th className="p-3 text-left">Final</th>
                </tr>
              </thead>
              <tbody>
                {studentsWithGrades.map((s) => (
                  <tr key={s.id} className="border-b">
                    <td className="p-3">{s.name}</td>
                    <td className="p-3">
                      <input
                        type="number"
                        step="0.01"
                        value={s.prelim}
                        onChange={e => setStudentsWithGrades(prev =>
                          prev.map(item => item.id === s.id ? { ...item, prelim: e.target.value } : item)
                        )}
                        onBlur={e => saveGrade(s.id, 'prelim', e.target.value)}
                        className="border rounded w-20 p-1"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        step="0.01"
                        value={s.midterm}
                        onChange={e => setStudentsWithGrades(prev =>
                          prev.map(item => item.id === s.id ? { ...item, midterm: e.target.value } : item)
                        )}
                        onBlur={e => saveGrade(s.id, 'midterm', e.target.value)}
                        className="border rounded w-20 p-1"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        step="0.01"
                        value={s.semifinal}
                        onChange={e => setStudentsWithGrades(prev =>
                          prev.map(item => item.id === s.id ? { ...item, semifinal: e.target.value } : item)
                        )}
                        onBlur={e => saveGrade(s.id, 'semifinal', e.target.value)}
                        className="border rounded w-20 p-1"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        step="0.01"
                        value={s.final}
                        onChange={e => setStudentsWithGrades(prev =>
                          prev.map(item => item.id === s.id ? { ...item, final: e.target.value } : item)
                        )}
                        onBlur={e => saveGrade(s.id, 'final', e.target.value)}
                        className="border rounded w-20 p-1"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AI Report PDF Viewer */}
      {aiReport && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">AI Analysis Report</h2>
          <div className="border rounded h-96">
            <PDFViewer width="100%" height="100%">
              <AiReportPDF
                report={aiReport}
                subjectName={selectedSubject.name}
                students={studentsWithGrades}
              />
            </PDFViewer>
          </div>
        </div>
      )}
    </div>
  )
}
