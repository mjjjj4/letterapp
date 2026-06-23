import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

export default function CreateCapsule() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    deliver_at: '',
    age: '',
    city: '',
    favorite_song: '',
    favorite_show: '',
    future_vision: '',
    personality_words: '',
  })

  const [file, setFile] = useState(null)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error) {
          console.error('Auth error:', error)
          router.push('/login')
          return
        }

        if (!user) {
          console.warn('No user found, redirecting to login')
          router.push('/login')
          return
        }

        console.log('User authenticated:', user.id)
        setUser(user)
        setLoading(false)
      } catch (err) {
        console.error('Error checking user:', err)
        router.push('/login')
      }
    }
    checkUser()
  }, [router])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      const validTypes = ['image/jpeg', 'image/png', 'video/mp4']
      if (!validTypes.includes(selectedFile.type)) {
        setError('Only JPG, PNG, and MP4 files are allowed')
        return
      }
      setFile(selectedFile)
      setError('')
    }
  }

  const uploadFile = async (file, userId) => {
    if (!file) return null

    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`

    try {
      const { error: uploadError } = await supabase.storage
        .from('capsule-files')
        .upload(fileName, file)

      if (uploadError) {
        // If bucket doesn't exist, just warn but continue
        if (uploadError.message.includes('not found')) {
          console.warn('Storage bucket not set up yet. File will not be saved.')
          return null
        }
        throw uploadError
      }

      return fileName
    } catch (err) {
      console.warn(`File upload warning: ${err.message}. Continuing without file.`)
      return null
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    // Validate form fields
    if (!formData.title || !formData.message || !formData.deliver_at) {
      setError('Title, message, and delivery date are required')
      setSubmitting(false)
      return
    }

    try {
      // Check if user exists and is authenticated
      if (!user || !user.id) {
        console.error('User object:', user)
        setError('Authentication error: You must be logged in to create a capsule')
        setSubmitting(false)
        return
      }

      console.log('Creating capsule for user:', user.id)

      let filePath = null
      if (file) {
        filePath = await uploadFile(file, user.id)
      }

      const capsuleData = {
        user_id: user.id,
        title: formData.title,
        message: formData.message,
        deliver_at: formData.deliver_at,
        status: 'draft',
        age: formData.age ? parseInt(formData.age) : null,
        city: formData.city || null,
        favorite_song: formData.favorite_song || null,
        favorite_show: formData.favorite_show || null,
        future_vision: formData.future_vision || null,
        personality_words: formData.personality_words ? formData.personality_words.split(',').map(w => w.trim()) : null,
      }

      console.log('Capsule data being inserted:', capsuleData)

      const { data, error: insertError } = await supabase
        .from('capsules')
        .insert([capsuleData])
        .select()

      if (insertError) {
        console.error('Supabase insert error:', insertError)
        throw new Error(`Failed to save capsule: ${insertError.message}`)
      }

      console.log('Capsule created successfully:', data)
      router.push('/dashboard')
    } catch (err) {
      console.error('Error in handleSubmit:', err)
      setError(err.message || 'Failed to create capsule. Please check the console for details.')
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div style={styles.loading}>Loading...</div>
  }

  return (
    <div style={styles.container}>
      <div style={styles.navbar}>
        <h1 style={styles.navTitle}>The Letter</h1>
        <button onClick={() => router.push('/dashboard')} style={styles.backButton}>
          ← Back to Dashboard
        </button>
      </div>

      <div style={styles.formContainer}>
        <h2 style={styles.title}>Create New Time Capsule</h2>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Required Fields */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Essential Details</h3>

            <div style={styles.formGroup}>
              <label style={styles.label}>Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Give your capsule a title..."
                style={styles.input}
                required
                disabled={submitting}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Message *</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Write your message to your future self..."
                style={{...styles.input, ...styles.textarea, minHeight: '200px'}}
                required
                disabled={submitting}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Delivery Date *</label>
              <input
                type="date"
                name="deliver_at"
                value={formData.deliver_at}
                onChange={handleInputChange}
                style={styles.input}
                required
                disabled={submitting}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Photo or Video (Optional)</label>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.mp4"
                style={styles.input}
                disabled={submitting}
              />
              {file && <p style={styles.fileSelected}>Selected: {file.name}</p>}
            </div>
          </div>

          {/* Optional Snapshot Fields */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Snapshot of You (Optional)</h3>

            <div style={styles.formRow}>
              <div style={{...styles.formGroup, flex: 1}}>
                <label style={styles.label}>Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  style={styles.input}
                  disabled={submitting}
                />
              </div>

              <div style={{...styles.formGroup, flex: 1}}>
                <label style={styles.label}>City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  style={styles.input}
                  disabled={submitting}
                />
              </div>
            </div>

            <div style={styles.formRow}>
              <div style={{...styles.formGroup, flex: 1}}>
                <label style={styles.label}>Favorite Song</label>
                <input
                  type="text"
                  name="favorite_song"
                  value={formData.favorite_song}
                  onChange={handleInputChange}
                  style={styles.input}
                  disabled={submitting}
                />
              </div>

              <div style={{...styles.formGroup, flex: 1}}>
                <label style={styles.label}>Favorite Show</label>
                <input
                  type="text"
                  name="favorite_show"
                  value={formData.favorite_show}
                  onChange={handleInputChange}
                  style={styles.input}
                  disabled={submitting}
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Future Vision</label>
              <textarea
                name="future_vision"
                value={formData.future_vision}
                onChange={handleInputChange}
                placeholder="What do you hope for your future?"
                style={{...styles.input, ...styles.textarea, minHeight: '120px'}}
                disabled={submitting}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Personality Words (comma-separated)</label>
              <input
                type="text"
                name="personality_words"
                value={formData.personality_words}
                onChange={handleInputChange}
                placeholder="e.g., creative, ambitious, kind"
                style={styles.input}
                disabled={submitting}
              />
            </div>
          </div>

          <div style={styles.buttonGroup}>
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              style={styles.cancelButton}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={styles.submitButton}
              disabled={submitting}
            >
              {submitting ? 'Creating Capsule...' : 'Create Capsule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    fontFamily: 'Arial, sans-serif',
  },
  navbar: {
    backgroundColor: 'white',
    padding: '20px 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  navTitle: {
    fontSize: '28px',
    margin: 0,
    color: '#333',
  },
  backButton: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  formContainer: {
    maxWidth: '800px',
    margin: '40px auto',
    padding: '40px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: '28px',
    color: '#333',
    marginTop: 0,
    marginBottom: '30px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  section: {
    paddingBottom: '20px',
    borderBottom: '1px solid #eee',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
    marginTop: 0,
    marginBottom: '20px',
  },
  formGroup: {
    marginBottom: '20px',
  },
  formRow: {
    display: 'flex',
    gap: '20px',
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  textarea: {
    fontFamily: 'Arial, sans-serif',
    resize: 'vertical',
  },
  fileSelected: {
    fontSize: '12px',
    color: '#28a745',
    marginTop: '5px',
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '20px',
    fontSize: '14px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'flex-end',
  },
  submitButton: {
    padding: '12px 30px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  cancelButton: {
    padding: '12px 30px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  loading: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    color: '#666',
    fontFamily: 'Arial, sans-serif',
  },
}
