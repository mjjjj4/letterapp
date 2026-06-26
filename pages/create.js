import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { supabase } from '../lib/supabase'
import SiteNav from '../components/SiteNav'
import SiteFooter from '../components/SiteFooter'

const MAROON = '#4D0000'
const WINE = '#8A2323'
const CREAM = '#FFFBF5'
const BORDER = 'rgba(77, 0, 0, 0.15)'
const INK = '#3A2418'
const MUTED = '#7A6A5A'
const F = { serif: "'Playfair Display','Georgia',serif", sans: "'Inter',Arial,sans-serif" }

export default function CreateCapsule() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [editCapsuleId, setEditCapsuleId] = useState(null)

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

  // Auth check
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error || !user) { router.push('/'); return }
      setUser(user)
      setLoading(false)
    })
  }, [router])

  // Load existing capsule once router is ready and user is authenticated
  useEffect(() => {
    if (!router.isReady || !user) return
    const { id, mode } = router.query
    if (mode === 'edit' && id) {
      setEditMode(true)
      setEditCapsuleId(id)
      loadCapsuleForEdit(id)
    }
  }, [router.isReady, user]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadCapsuleForEdit = async (capsuleId) => {
    const { data, error } = await supabase
      .from('capsules')
      .select('*')
      .eq('id', capsuleId)
      .eq('status', 'draft')
      .single()

    if (error || !data) {
      setError('Could not load this capsule for editing. It may no longer be a draft.')
      return
    }

    setFormData({
      title: data.title || '',
      message: data.message || '',
      age: data.age != null ? String(data.age) : '',
      city: data.city || '',
      favorite_song: data.favorite_song || '',
      favorite_show: data.favorite_show || '',
      future_vision: data.future_vision || '',
      personality_words: Array.isArray(data.personality_words)
        ? data.personality_words.join(', ')
        : (data.personality_words || ''),
    })
  }

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

      const capsuleData = {
        title: formData.title,
        message: formData.message,
        age: formData.age ? parseInt(formData.age) : null,
        city: formData.city || null,
        favorite_song: formData.favorite_song || null,
        favorite_show: formData.favorite_show || null,
        future_vision: formData.future_vision || null,
        personality_words: formData.personality_words
          ? formData.personality_words.split(',').map(w => w.trim()).filter(Boolean)
          : null,
      }

      if (editMode && editCapsuleId) {
        const { error: updateError } = await supabase
          .from('capsules')
          .update(capsuleData)
          .eq('id', editCapsuleId)
          .eq('status', 'draft')
        if (updateError) throw new Error(`Failed to update: ${updateError.message}`)
      } else {
        const filePath = file ? await uploadFile(file, user.id) : null
        const { error: insertError } = await supabase
          .from('capsules')
          .insert([{
            ...capsuleData,
            user_id: user.id,
            deliver_at: '2099-12-31',
            status: 'draft',
            ...(filePath ? { file_path: filePath } : {}),
          }])
          .select()
        if (insertError) throw new Error(`Failed to save capsule: ${insertError.message}`)
      }

      router.push('/dashboard')
    } catch (err) {
      setError(err.message || 'Failed to save capsule.')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: CREAM }}>
        <p style={{ fontFamily: F.sans, fontSize: 16, color: MUTED }}>Loading…</p>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{editMode ? 'Edit Capsule' : 'Create Capsule'} — The Letter</title>
      </Head>

      <SiteNav />

      <div style={s.page}>
        <div style={s.container}>

          <div style={s.header}>
            {editMode && (
              <button onClick={() => router.push('/dashboard')} style={s.backLink}>
                ← Back to dashboard
              </button>
            )}
            <h1 style={s.pageTitle}>
              {editMode ? 'Edit your capsule' : 'Write your capsule'}
            </h1>
            <p style={s.pageSub}>
              {editMode
                ? 'Update any details below, then save when you\'re done.'
                : 'Tell your future self everything they need to remember about today.'}
            </p>
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
                <p style={{ ...s.hint, color: formData.title.length >= 90 ? '#dc3545' : MUTED }}>
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
                {submitting ? 'Saving…' : editMode ? 'Update Draft' : 'Save capsule'}
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
  backLink: {
    display: 'inline-block', marginBottom: 16,
    fontFamily: F.sans, fontSize: 13, color: MUTED,
    background: 'none', border: 'none', padding: 0, cursor: 'pointer',
  },
  pageTitle: { fontFamily: F.serif, fontSize: 32, fontWeight: 600, color: MAROON, marginBottom: 8 },
  pageSub: { fontFamily: F.sans, fontSize: 15, color: MUTED, lineHeight: 1.5 },

  form: { display: 'flex', flexDirection: 'column', gap: 0 },
  section: {
    backgroundColor: CREAM, borderRadius: 10, padding: '28px 28px 8px',
    marginBottom: 20, border: `1px solid ${BORDER}`,
  },
  sectionTitle: {
    fontFamily: F.serif, fontSize: 20, fontWeight: 600,
    color: MAROON, marginBottom: 6,
  },
  sectionSub: { fontFamily: F.sans, fontSize: 13, color: MUTED, marginBottom: 20 },
  opt: { fontFamily: F.sans, fontSize: 13, color: MUTED, fontWeight: 400 },
  req: { color: WINE },

  field: { marginBottom: 20 },
  row: { display: 'flex', gap: 16, flexWrap: 'wrap' },
  label: { fontFamily: F.sans, fontSize: 13, fontWeight: 600, color: INK, display: 'block', marginBottom: 6 },
  input: {
    display: 'block', width: '100%', padding: '11px 14px',
    border: `1.5px solid ${BORDER}`, borderRadius: 8,
    fontSize: 14, fontFamily: F.sans, outline: 'none',
    backgroundColor: CREAM, boxSizing: 'border-box',
  },
  textarea: { minHeight: 200, resize: 'vertical', fontFamily: F.sans },
  textareaSm: { minHeight: 100, resize: 'vertical', fontFamily: F.sans },
  hint: { fontFamily: F.sans, fontSize: 12, color: MUTED, margin: '4px 0 0', textAlign: 'right' },
  fileOk: { fontFamily: F.sans, fontSize: 12, color: '#10b981', margin: '6px 0 0' },

  error: {
    backgroundColor: '#fdf2f2', color: '#8a2323',
    padding: '12px 16px', borderRadius: 8,
    fontSize: 13, marginBottom: 20, fontFamily: F.sans,
  },

  actions: { display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 },
  cancelBtn: {
    padding: '12px 24px', backgroundColor: 'transparent', color: MUTED,
    border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 14, fontFamily: F.sans,
  },
  submitBtn: {
    padding: '12px 32px', backgroundColor: WINE, color: CREAM,
    border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, fontFamily: F.sans,
  },
}
