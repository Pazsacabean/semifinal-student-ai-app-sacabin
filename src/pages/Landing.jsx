export default function Landing() {
  const currentYear = new Date().getFullYear()

  return (
    <div className="max-w-3xl mx-auto text-center py-12 space-y-10">
      {/* Profile / First Year Section */}
      <div>
        <img
          src="/profile.png"
          alt="Paz Sacabin"
          className="w-32 h-32 rounded-full mx-auto shadow-lg mb-6"
        />     
      </div>
      <div className="border-l-4 border-purple-500 pl-6 text-left">
        <h3 className="text-xl font-semibold text-purple-600 mb-2">First Year</h3>
        
        <p className="text-gray-700">
          My first-year journey in IT began with curiosity. Starting with the basics of programming —
          the excitement of creating my first "Hello World" program, my first HTML and CSS file, and my
          very first web design.
        </p>
      </div>

      {/* Second Year Section */}
      <div className="border-l-4 border-purple-500 pl-6 text-left">
        <h3 className="text-xl font-semibold text-purple-600 mb-2">Second Year</h3>
        <p className="text-gray-700">
          During my second year, I created my first SQL database. It was confusing at first, but I learned a lot.
          I also began exploring database management, even if I’m still improving.
        </p>
      </div>

      {/* Third Year Section */}
      <div className="border-l-4 border-green-500 pl-6 text-left">
        <h3 className="text-xl font-semibold text-green-600 mb-2">Third Year</h3>
        <p className="text-gray-700 mb-4">
          Now in my third year, I’m learning to use modern tools like React and AI.
          This Student Grade Management System showcases my progress — combining web design, databases,
          and AI to build useful projects.
        </p>

        {/* About Project */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-semibold text-indigo-700 mb-3">About This Project</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>Full CRUD for Students, Subjects, and Grades</li>
            <li>AI-powered performance insights using Google Gemini</li>
            <li>PDF report generation for easy sharing</li>
            <li>Built with React, Vite, Tailwind CSS, and Supabase</li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <footer className="pt-10 border-t border-gray-200 text-gray-600 text-sm">
        <p>
          © {currentYear} <span className="font-semibold text-gray-800">Paz Sacabin</span>. All rights reserved.
        </p>
        <p className="mt-2">
          Built with ❤️ using <span className="font-medium text-indigo-600">React</span> &{" "}
          <span className="font-medium text-sky-500">Tailwind CSS</span>.
        </p>
      </footer>
    </div>
  )
}