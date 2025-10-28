// src/lib/ai.js
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)

export async function analyzeStudentPerformance(subjectName, studentsWithGrades) {
  // Calculate final grade if missing (average of all terms)
  const dataForPrompt = studentsWithGrades.map(s => {
    const prelim = parseFloat(s.prelim) || 0
    const midterm = parseFloat(s.midterm) || 0
    const semifinal = parseFloat(s.semifinal) || 0
    const final = parseFloat(s.final) || ((prelim + midterm + semifinal) / 3)
    const passed = final >= 75
    return { ...s, final, passed }
  })

  const passedNames = dataForPrompt.filter(s => s.passed).map(s => s.name)
  const failedNames = dataForPrompt.filter(s => !s.passed).map(s => s.name)

  // Fallback if AI fails
  const fallback = {
    analysis: `Performance summary for ${subjectName}: ${passedNames.length} students passed, ${failedNames.length} students failed.`,
    passedStudents: passedNames,
    failedStudents: failedNames
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `
You are an academic assistant. Analyze the following student performance data for the subject: "${subjectName}".

Rules:
- Return ONLY a valid JSON object.
- Do NOT include markdown, explanations, or extra text.
- Use double quotes for strings.
- Final grade >= 75 means "passed", otherwise "failed".

Data format: { "name": "string", "prelim": number, "midterm": number, "semifinal": number, "final": number }

Data:
${JSON.stringify(dataForPrompt, null, 2)}

Respond with this exact structure:
{
  "analysis": "A 2-3 sentence summary of overall class performance.",
  "passedStudents": ["Name 1", "Name 2"],
  "failedStudents": ["Name 3"]
}
`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text().trim()

    // Try to extract JSON if wrapped in markdown
    let cleanResponse = responseText
    if (responseText.startsWith('```json')) {
      cleanResponse = responseText.split('```json')[1].split('```')[0].trim()
    } else if (responseText.startsWith('```')) {
      cleanResponse = responseText.split('```')[1].trim()
    }

    const parsed = JSON.parse(cleanResponse)
    return parsed
  } catch (error) {
    console.error('Gemini AI Error:', error)
    return fallback // ✅ Always return usable data
  }
}