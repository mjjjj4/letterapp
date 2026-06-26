import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { supabase } from '../lib/supabase'
import SiteNav from '../components/SiteNav'
import SiteFooter from '../components/SiteFooter'

const WINE = '#952323'
const CREAM = '#FFE6E1'
const BLUSH = '#EDBFC6'
const CHARCOAL = '#393232'
const F = { serif: "'Lora','Georgia',serif", sans: "'Inter',Arial,sans-serif" }

export default function CreateCapsule() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    age: '',
    city: '',
    favorite_song: '',
    favorite_show: '',
    future_vision: '',
    personality_words: '',
  })
  const [file, setFile] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error || !user) { router.push('/'); return }
      setUser(user)
      setLoading(false)
    })
  }, [router])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    const f = e.target.files[0]
    if (!f) return
    const valid = ['image/jpeg', 'image/png', 'video/mp4']
    if (!valid.includes(f.type)) { setError('Only JPG, PNG, and MP4 files are allowed'); return }
    setFile(f)
    setError('')
  }

  const uploadFile = async (f, userId) => {
    if (!f) return null
    const ext = f.name.split('.').pop()
    const path = `${userId}/${Date.now()}.${ext}`
    try {
      const { error: uploadError } = await supabase.storage.from('capsule-files').upload(path, f)
      if (uploadError) {
        if (uploadError.message.includes('not found')) { console.warn('Storage bucket not set up yet.'); return null }
        throw uploadError
      }
      return path
    } catch (err) {
      console.warn(`File upload warning: ${err.message}`)
      return null
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    if (!formData.title || !formData.message) {
      setError('Title and message are required')
      setSubmitting(false)
      return
    }
    try {
      if (!user?.id) { setError('Authentication error. Please sign in again.'); setSubmitting(false); return }
      const filePath = file ? await uploadFile(file, user.id) : null
      const capsuleData = {
        user_id: user.id,
        title: formData.title,
        message: formData.message,
        deliver_at: '2099-12-31',
        status: 'draft',
        age: formData.age ? parseInt(formData.age) : null,
        city: formData.city || null,
        favorite_song: formData.favorite_song || null,
        favorite_show: formData.favorite_show || null,
        future_vision: formData.future_vision || null,
        personality_words: formData.personality_words
          ? formData.personality_words.split(',').map(w => w.trim())
          : null,
      }
      const { error: insertError } = await supabase.from('capsules').insert([capsuleData]).select()
      if (insertError) throw new Error(`Failed to save capsule: ${insertError.message}`)
      router.push('/dashboard')
    } catch (err) {
      setError(err.message || 'Failed to create capsule.')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: CREAM }}>
        <p style={{ fontFamily: F.sans, fontSize: 16, color: '#888' }}>Loading…</p>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Create Capsule — The Letter</title>
      </Head>

      <SiteNav />

      <div style={s.page}>
        <div style={s.container}>

          <div style={s.header}>
            <h1 style={s.pageTitle}>Write your capsule</h1>
            <p style={s.pageSub}>Tell your future self everything they need to remember about today.</p>
          </div>

          {error && <div style={s.error}>{error}</div>}

          <form onSubmit={handleSubmit} style={s.form}>

            {/* Essential */}
            <div style={s.section}>
              <h2 style={s.sectionTitle}>Essential details</h2>

              <div style={s.field}>
                <label style={s.label}>Title <span style={s.req}>*</span></label>
                <input
                  type="text" name="title" value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Give your capsule a title…"
                  style={s.input} maxLength={100} required disabled={submitting}
                />
                <p style={{ ...s.hint, color: formData.title.length >= 90 ? '#dc3545' : '#aaa' }}>
                  {formData.title.length}/100 characters
                </p>
              </div>

              <div style={s.field}>
                <label style={s.label}>Message <span style={s.req}>*</span></label>
                <textarea
                  name="message" value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Write your message to your future self…"
                  style={{ ...s.input, ...s.textarea }}
                  required disabled={submitting}
                />
              </div>

              <div style={s.field}>
                <label style={s.label}>Photo or video <span style={s.opt}>(optional)</span></label>
                <input
                  type="file" onChange={handleFileChange}
                  accept=".jpg,.jpeg,.png,.mp4"
                  style={{ ...s.input, padding: '10px 14px' }}
                  disabled={submitting}
                />
                {file && <p style={s.fileOk}>✓ {file.name}</p>}
              </div>
            </div>

            {/* Snapshot */}
            <div style={s.section}>
              <h2 style={s.sectionTitle}>Snapshot of you <span style={s.opt}>(optional)</span></h2>
              <p style={s.sectionSub}>These details will surprise your future self.</p>

              <div style={s.row}>
                <div style={{ ...s.field, flex: 1 }}>
                  <label style={s.label}>Age</label>
                  <input type="number" name="age" value={formData.age} onChange={handleInputChange} style={s.input} disabled={submitting} />
                </div>
                <div style={{ ...s.field, flex: 1 }}>
                  <label style={s.label}>City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleInputChange} style={s.input} disabled={submitting} />
                </div>
              </div>

              <div style={s.row}>
                <div style={{ ...s.field, flex: 1 }}>
                  <label style={s.label}>Favorite song</label>
                  <input type="text" name="favorite_song" value={formData.favorite_song} onChange={handleInputChange} style={s.input} disabled={submitting} />
                </div>
                <div style={{ ...s.field, flex: 1 }}>
                  <label style={s.label}>Favorite show</label>
                  <input type="text" name="favorite_show" value={formData.favorite_show} onChange={handleInputChange} style={s.input} disabled={submitting} />
                </div>
              </div>

              <div style={s.field}>
                <label style={s.label}>Future vision</label>
                <textarea
                  name="future_vision" value={formData.future_vision}
                  onChange={handleInputChange}
                  placeholder="What do you hope for your future?"
                  style={{ ...s.input, ...s.textareaSm }}
                  disabled={submitting}
                />
              </div>

              <div style={s.field}>
                <label style={s.label}>Personality words</label>
                <input
                  type="text" name="personality_words" value={formData.personality_words}
                  onChange={handleInputChange}
                  placeholder="e.g., creative, ambitious, kind"
                  style={s.input} disabled={submitting}
                />
                <p style={s.hint}>Comma-separated</p>
              </div>
            </div>

            <div style={s.actions}>
              <button type="button" onClick={() => router.push('/dashboard')} style={s.cancelBtn} disabled={submitting}>
                Cancel
              </button>
              <button type="submit" style={{ ...s.submitBtn, opacity: submitting ? 0.65 : 1 }} disabled={submitting}>
                {submitting ? 'Saving…' : 'Save capsule'}
              </button>
            </div>

          </form>
        </div>
      </div>

      <SiteFooter />
    </>
  )
}

const s = {
  page: { minHeight: 'calc(100vh - 64px)', backgroundColor: CREAM, padding: '0 0 80px' },
  container: { maxWidth: 720, margin: '0 auto', padding: '40px 20px 0' },

  header: { marginBottom: 32 },
  pageTitle: { fontFamily: F.serif, fontSize: 32, fontWeight: 700, color: CHARCOAL, marginBottom: 8 },
  pageSub: { fontFamily: F.sans, fontSize: 15, color: '#888', lineHeight: 1.5 },

  form: { display: 'flex', flexDirection: 'column', gap: 0 },
  section: {
    backgroundColor: '#fff', borderRadius: 14, padding: '28px 28px 8px',
    marginBottom: 20, border: `1px solid ${BLUSH}`,
  },
  sectionTitle: {
    fontFamily: F.serif, fontSize: 20, fontWeight: 700,
    color: CHARCOAL, marginBottom: 6,
  },
  sectionSub: { fontFamily: F.sans, fontSize: 13, color: '#aaa', marginBottom: 20 },
  opt: { fontFamily: F.sans, fontSize: 13, color: '#bbb', fontWeight: 400 },
  req: { color: WINE },

  field: { marginBottom: 20 },
  row: { display: 'flex', gap: 16, flexWrap: 'wrap' },
  label: { fontFamily: F.sans, fontSize: 13, fontWeight: 600, color: CHARCOAL, display: 'block', marginBottom: 6 },
  input: {
    width: '100%', padding: '11px 14px',
    border: `1.5px solid ${BLUSH}`, borderRadius: 8,
    fontSize: 14, fontFamily: F.sans, outline: 'none',
    backgroundColor: '#fff', boxSizing: 'border-box',
  },
  textarea: { minHeight: 200, resize: 'vertical', fontFamily: F.sans },
  textareaSm: { minHeight: 100, resize: 'vertical', fontFamily: F.sans },
  hint: { fontFamily: F.sans, fontSize: 12, color: '#aaa', margin: '4px 0 0', textAlign: 'right' },
  fileOk: { fontFamily: F.sans, fontSize: 12, color: '#10b981', margin: '6px 0 0' },

  error: {
    backgroundColor: '#fdf2f2', color: '#8a2323',
    padding: '12px 16px', borderRadius: 8,
    fontSize: 13, marginBottom: 20, fontFamily: F.sans,
  },

  actions: { display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 },
  cancelBtn: {
    padding: '12px 24px', backgroundColor: 'transparent', color: '#888',
    border: `1px solid ${BLUSH}`, borderRadius: 8, fontSize: 14, fontFamily: F.sans,
  },
  submitBtn: {
    padding: '12px 32px', backgroundColor: WINE, color: '#fff',
    border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, fontFamily: F.sans,
  },
}
