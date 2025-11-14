import { useEffect, useState } from 'react'

function App() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null)
  const [recent, setRecent] = useState([])

  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const validate = () => {
    if (!form.name.trim()) return 'Please enter your name.'
    if (!form.email.trim()) return 'Please enter your email.'
    // basic email check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Please enter a valid email.'
    if (!form.message.trim() || form.message.trim().length < 5) return 'Message should be at least 5 characters.'
    return null
  }

  const submit = async (e) => {
    e.preventDefault()
    const err = validate()
    if (err) {
      setStatus({ type: 'error', message: err })
      return
    }
    setLoading(true)
    setStatus(null)
    try {
      const res = await fetch(`${baseUrl}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          subject: form.subject.trim() || undefined,
          message: form.message.trim(),
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.detail || `Request failed: ${res.status}`)
      }
      const data = await res.json()
      setStatus({ type: 'success', message: 'Thanks for reaching out! Your message has been sent.' })
      setForm({ name: '', email: '', subject: '', message: '' })
      // refresh recent list
      fetchRecent()
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Something went wrong. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const fetchRecent = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/contact?limit=5`)
      if (res.ok) {
        const data = await res.json()
        setRecent(Array.isArray(data) ? data : [])
      }
    } catch (e) {
      // ignore
    }
  }

  useEffect(() => {
    fetchRecent()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Contact Us</h1>
          <p className="text-gray-600 mb-6">Have a question or feedback? Send us a message and we'll get back to you.</p>
          {status && (
            <div className={`mb-4 rounded p-3 text-sm ${
              status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {status.message}
            </div>
          )}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-2"
                placeholder="Your full name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-2"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject (optional)</label>
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-2"
                placeholder="How can we help?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={5}
                className="w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-2"
                placeholder="Write your message here..."
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 rounded-md text-white font-semibold transition-colors ${
                loading ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Sending...' : 'Send Message'}
            </button>
            <a
              href="/test"
              className="block text-center text-sm text-gray-500 hover:text-gray-700"
            >
              Check backend & database status
            </a>
          </form>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent messages</h2>
          {recent.length === 0 ? (
            <p className="text-gray-500 text-sm">No messages yet. Be the first to say hi!</p>
          ) : (
            <ul className="space-y-4">
              {recent.map((r) => (
                <li key={r.id} className="border border-gray-200 rounded-md p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-800">{r.name}</span>
                    <span className="text-xs text-gray-500">{r.email}</span>
                  </div>
                  {r.subject && (
                    <p className="text-sm text-gray-700 font-medium">{r.subject}</p>
                  )}
                  <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{r.message}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
