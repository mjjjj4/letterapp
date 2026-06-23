export default function Home() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Welcome to LetterApp</h1>
      <p>A simple app for managing letters and correspondence.</p>
      <nav>
        <ul>
          <li><a href="/login">Login</a></li>
          <li><a href="/signup">Sign Up</a></li>
        </ul>
      </nav>
    </div>
  )
}
