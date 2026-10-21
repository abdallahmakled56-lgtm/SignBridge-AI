
import './App.css';
import HandDetection from './HandDetection';
import TextToSigns from './TextToSigns';
import VoiceToSigns from './VoiceToSigns';

function App() {
  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">S</div>
          <div>
            <h2>SignBridge</h2>
            <span>AI Communication</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <a href="#overview" className="nav-link active">
            <span>⌂</span> Overview
          </a>
          <a href="#camera" className="nav-link">
            <span>◎</span> Sign Recognition
          </a>
          <a href="#voice" className="nav-link">
            <span>🎙</span> Voice to Signs
          </a>
          <a href="#translator" className="nav-link">
            <span>✦</span> Text to Signs
          </a>
        </nav>

        <div className="sidebar-footer">
          <div className="status-dot"></div>
          <span>Communication without barriers</span>
        </div>
      </aside>

      <main className="main-content" id="overview">
        <header className="topbar">
          <div>
            <p className="eyebrow">ACCESSIBILITY PLATFORM</p>
            <h1>SignBridge AI</h1>
          </div>

          <div className="topbar-badge">
            <span className="status-dot"></span>
            AI Workspace
          </div>
        </header>

        <section className="welcome-banner">
          <div className="welcome-content">
            <span className="banner-label">WELCOME TO SIGNBRIDGE</span>
            <h2>Communication without barriers.</h2>
            <p>
              Connect people through sign recognition,
              voice recognition, and visual communication.
            </p>

            <a href="#voice" className="primary-button">
              Try Voice to Signs →
            </a>
          </div>

          <div className="banner-decoration" aria-hidden="true">
            <div className="decoration-circle circle-one"></div>
            <div className="decoration-circle circle-two"></div>
            <div className="decoration-symbol">S</div>
          </div>
        </section>

        <section className="stats-grid">
          <article className="stat-card">
            <div className="stat-icon blue">◎</div>
            <p>Camera Recognition</p>
            <h3>Live Detection</h3>
            <span>Recognize supported hand signs</span>
          </article>

          <article className="stat-card">
            <div className="stat-icon purple">🎙</div>
            <p>Voice Recognition</p>
            <h3>Speech to Text</h3>
            <span>Speak Arabic using your microphone</span>
          </article>

          <article className="stat-card">
            <div className="stat-icon green">✦</div>
            <p>Visual Signs</p>
            <h3>Text to Signs</h3>
            <span>Display available sign images</span>
          </article>
        </section>

        <section className="section-heading">
          <div>
            <p className="eyebrow">YOUR TOOLS</p>
            <h2>Communication workspace</h2>
          </div>
          <p>Choose a tool to get started.</p>
        </section>

        <section id="camera" className="tool-panel">
          <div className="panel-heading">
            <div className="panel-icon blue">◎</div>
            <div>
              <h2>Sign Recognition</h2>
              <p>Recognize supported hand signs using your camera.</p>
            </div>
          </div>

          <HandDetection />
        </section>

        <section id="voice" className="tool-panel">
          <div className="panel-heading">
            <div className="panel-icon purple">🎙</div>
            <div>
              <h2>Voice to Signs</h2>
              <p>Speak Arabic and view the recognized text.</p>
            </div>
          </div>

          <VoiceToSigns />
        </section>

        <section id="translator" className="tool-panel">
          <div className="panel-heading">
            <div className="panel-icon green">✦</div>
            <div>
              <h2>Text to Signs</h2>
              <p>Display sign images for supported Arabic letters.</p>
            </div>
          </div>

          <TextToSigns />
        </section>

        <footer className="app-footer">
          <div className="brand-icon small">S</div>
          <p>SignBridge AI · Accessible communication for everyone.</p>
        </footer>
      </main>
    </div>
  );
}

export default App;
