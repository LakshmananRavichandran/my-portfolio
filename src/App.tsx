import { useEffect, useRef, useState } from 'react';
import './App.css';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const totalFrames = 64;
    const images: HTMLImageElement[] = [];
    let loadedCount = 0;
    
    const onImageLoad = () => {
      loadedCount++;
      if (loadedCount === totalFrames + 1) setLoaded(true);
    };
    
    const onImageError = (e: Event) => {
      console.error('Failed to load image', e.target);
      // Still increment to prevent infinite loading
      loadedCount++;
      if (loadedCount === totalFrames + 1) setLoaded(true);
    };
    
    for (let i = 0; i < totalFrames; i++) {
      const img = new Image();
      img.src = `/frames/${i.toString().padStart(2, '0')}.webp`;
      img.onload = onImageLoad;
      img.onerror = onImageError;
      images.push(img);
    }
    
    const centerImg = new Image();
    centerImg.src = '/frames/center.webp';
    centerImg.onload = onImageLoad;
    centerImg.onerror = onImageError;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;
    
    let animationFrameId: number;
    let targetAngle = 0;
    let currentAngle = 0;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let inDeadzone = true;
    
    const render = () => {
      if (loadedCount < totalFrames + 1) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      
      const imgW = 1920;
      const imgH = 1080;
      const scale = Math.max(width / imgW, height / imgH);
      const drawW = imgW * scale;
      const drawH = imgH * scale;
      const drawX = (width - drawW) / 2;
      const drawY = (height - drawH) / 2;
      
      const faceCx = drawX + 960 * scale;
      const faceCy = drawY + 450 * scale;
      
      const dx = mouseX - faceCx;
      // Use scrollY to adjust mouse Y relative to the canvas in the hero section
      const dy = (mouseY + window.scrollY) - faceCy; 
      const dist = Math.hypot(dx, dy);
      
      const deadzoneRadius = Math.min(width, height) * 0.12;
      inDeadzone = dist < deadzoneRadius;
      
      if (!inDeadzone) {
        let angle = Math.atan2(dy, dx);
        
        // --- CALIBRATION SETTINGS ---
        // If the character looks in the wrong direction, tweak these values:
        const ANGLE_OFFSET = 0; // Try Math.PI/2, Math.PI, or -Math.PI/2 if it's offset by 90/180 degrees
        const INVERT_ROTATION = false; // Set to true if the character looks left when you move right
        // ----------------------------
        
        if (INVERT_ROTATION) {
          angle = -angle;
        }
        angle += ANGLE_OFFSET;
        
        if (angle < 0) angle += Math.PI * 2;
        targetAngle = angle;
      }
      
      let diff = targetAngle - currentAngle;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      
      currentAngle += diff * 0.26;
      while (currentAngle < 0) currentAngle += Math.PI * 2;
      while (currentAngle >= Math.PI * 2) currentAngle -= Math.PI * 2;
      
      const maxFrames = 64;
      let frameIndex = Math.round((currentAngle / (Math.PI * 2)) * maxFrames) % maxFrames;
      
      ctx.fillStyle = '#ee0607';
      ctx.fillRect(0, 0, width, height);
      
      const imgToDraw = inDeadzone ? centerImg : images[frameIndex];
      try {
        if (imgToDraw && imgToDraw.complete && imgToDraw.naturalWidth > 0) {
          ctx.drawImage(imgToDraw, drawX, drawY, drawW, drawH);
        } else {
          // If the target frame is missing, try drawing center or just leave bg
          if (centerImg.complete && centerImg.naturalWidth > 0) {
            ctx.drawImage(centerImg, drawX, drawY, drawW, drawH);
          }
        }
      } catch (e) {
        console.warn('Failed to draw frame', e);
      }
      
      animationFrameId = requestAnimationFrame(render);
    };
    
    render();
    
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
        const target = e.target as HTMLElement;
        const isInteractive = target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('a') || target.closest('button');
        if (isInteractive) {
          cursorRef.current.classList.add('interactive');
        } else {
          cursorRef.current.classList.remove('interactive');
        }
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="app-container">
      {/* Custom magnetic cursor */}
      <div ref={cursorRef} className="custom-cursor">
        <div className="cursor-dot"></div>
        <div className="cursor-ring"></div>
      </div>
      
      {!loaded && <div className="loader">Loading Environment...</div>}

      {/* Navigation */}
      <header className="floating-header">
        <div className="nav-container">
          <div className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <div className={`bar ${isMobileMenuOpen ? 'open' : ''}`}></div>
            <div className={`bar ${isMobileMenuOpen ? 'open' : ''}`}></div>
          </div>
          <nav className={`nav-pill ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            <a onClick={() => scrollToSection('home')}>Home</a>
            <a onClick={() => scrollToSection('work')}>Work</a>
            <a onClick={() => scrollToSection('about')}>About</a>
            <a href="/resume.pdf" target="_blank" rel="noreferrer">Resume</a>
            <a onClick={() => scrollToSection('contact')}>Contact</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="hero-section">
        <canvas ref={canvasRef} className="bg-canvas" />
        <div className="hero-content">
          <h2 className="greeting">Hi, I'm</h2>
          <h1 className="name">Lakshmanan</h1>
          <h3 className="title">Tech Builder</h3>
          <p className="bio">
            VLSI student and hands-on tech builder passionate about robotics, embedded systems, Edge AI, and VLSI.
          </p>
          <div className="actions">
            <a href="/resume.pdf" target="_blank" rel="noreferrer" className="btn-resume">
              Resume 
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-arrow"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </a>
            <button onClick={() => scrollToSection('contact')} className="btn-talk">Let's Talk</button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="content-section dark-section">
        <div className="section-container">
          <h2 className="section-title">Hello, wanna know about me?</h2>
          <div className="about-grid">
            <div className="about-text">
              <p>I'm Lakshmanan Ravichandran, a VLSI Design & Technology student and hands-on tech builder based in Chennai.</p>
              <p>I'm pursuing a B.E. in Electronics and Communication Engineering, specializing in VLSI Design & Technology, while exploring robotics and intelligent systems.</p>
              <p>I enjoy building systems that connect software with the physical world. From robotics and embedded systems to Edge AI, control systems and VLSI, I like learning by actually building and experimenting.</p>
              <p>Currently, I'm working on a 3-DOF robotic arm and exploring control systems including PID and ADRC.</p>
              <p>I'm interested in creative, problem-solving work where I can design, experiment, and bring ideas to life through technology.</p>
            </div>
            <div className="hardware-tags">
              {['Robotics', 'Embedded Systems', 'VLSI', 'PCB Design', 'Microcontrollers', 'Sensors', 'Control Systems', 'Edge AI', 'FPGA / EDA'].map(tag => (
                <span key={tag} className="tech-tag">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Education & Experience */}
      <section id="resume" className="content-section dark-section">
        <div className="section-container split-layout">
          <div className="timeline-col">
            <h2 className="section-title">Education</h2>
            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-dot"></div>
                <h3>B.E. Electronics and Communication Engineering</h3>
                <h4>Specialization: VLSI Design & Technology</h4>
                <p className="timeline-org">R.M.K. Engineering College</p>
                <p className="timeline-date">2024 – 2028</p>
                <p className="timeline-desc">CGPA: 7.89</p>
              </div>
              <div className="timeline-item">
                <div className="timeline-dot"></div>
                <h3>Higher Secondary Certificate</h3>
                <p className="timeline-org">Vijayantha Model School</p>
                <p className="timeline-desc">88%</p>
              </div>
              <div className="timeline-item">
                <div className="timeline-dot"></div>
                <h3>Secondary School Certificate</h3>
                <p className="timeline-org">Vijayantha Model School</p>
                <p className="timeline-desc">86%</p>
              </div>
            </div>
          </div>

          <div className="timeline-col">
            <h2 className="section-title">Experience</h2>
            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-dot"></div>
                <h3>Research Intern</h3>
                <p className="timeline-org">NIT Tiruchirappalli — ICE Department</p>
                <p className="timeline-date">Summer 2026</p>
                <p className="timeline-desc">Worked on a 3-DOF robotic arm project with Active Disturbance Rejection Control (ADRC) under faculty supervision. Built PC-based servo control with GUI and serial communication. Worked with closed-loop PID positioning using ADC feedback. Worked toward converting the PID controller into an ADRC-based controller.</p>
              </div>
              <div className="timeline-item">
                <div className="timeline-dot"></div>
                <h3>Online Intern</h3>
                <p className="timeline-org">CODSOFT</p>
                <p className="timeline-date">2024</p>
                <p className="timeline-desc">Studied industrial automation systems including PLC, HMI, batching plant and extrusion. Learned preventive maintenance workflows and industrial safety standards.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Work / Projects */}
      <section id="work" className="content-section dark-section projects-section">
        <div className="section-container">
          <h2 className="section-title">Selected Work</h2>
          
          <div className="project-card featured">
            <div className="project-content">
              <div className="project-badge">1st Prize — WE Hack, VIT Vellore</div>
              <h3 className="project-title">Autonomous Edge-AI Environmental Inspection Rover</h3>
              <p className="project-desc">An autonomous environmental inspection rover built using Raspberry Pi, on-device machine learning, TF-Luna LiDAR and environmental sensors.</p>
              <div className="project-tech">
                {['Raspberry Pi', 'Edge AI', 'Machine Learning', 'TF-Luna LiDAR', 'Environmental Sensors', 'Robotics'].map(t => <span key={t}>{t}</span>)}
              </div>
              <p className="project-achievement">Achievement: 1st Prize, ₹70,000 cash prize</p>
            </div>
            <div className="project-visual">
              <img src="/projects/edge-ai-rover.jpg" alt="Autonomous Edge-AI Environmental Inspection Rover" />
            </div>
          </div>

          <div className="project-grid">
            <div className="project-card">
              <div className="project-visual">
                <img src="/projects/robotic-arm.jpg" alt="3-DOF Robotic Arm" />
              </div>
              <div className="project-content">
                <h3 className="project-title">3-DOF Robotic Arm</h3>
                <p className="project-desc">A servo-based 3-DOF robotic arm developed with PC-based GUI control, serial communication and closed-loop PID positioning, with work toward ADRC-based control.</p>
                <div className="project-tech">
                  {['Vega Aries V3', 'PCA9685', 'Servo Motors', 'PID Control', 'ADRC', 'ADC Feedback', 'GUI', 'Serial Communication'].map(t => <span key={t}>{t}</span>)}
                </div>
              </div>
            </div>

            <div className="project-card abstract-visual-card">
              <div className="project-visual abstract-visual">
                <div className="circuit-pattern"></div>
                <div className="waveform"></div>
                <div className="code-snippet">module analyzer(input clk...</div>
              </div>
              <div className="project-content">
                <h3 className="project-title">Verilog Analyzer + STA Timing + Power Estimator</h3>
                <p className="project-desc">An offline browser-based tool for Verilog analysis, static timing analysis and power estimation.</p>
                <div className="project-tech">
                  {['Verilog', 'Static Timing Analysis', 'Power Estimation', 'HTML', 'JavaScript'].map(t => <span key={t}>{t}</span>)}
                </div>
              </div>
            </div>

            <div className="project-card abstract-visual-card">
              <div className="project-visual abstract-visual study-ai-visual">
                <div className="ai-nodes"></div>
              </div>
              <div className="project-content">
                <h3 className="project-title">Study AI</h3>
                <p className="project-desc">An AI-powered learning platform with quizzes, flashcards and progress tracking, developed during the Envision Hackathon.</p>
                <div className="project-tech">
                  {['AI', 'Learning Platform', 'Quizzes', 'Flashcards', 'Progress Tracking'].map(t => <span key={t}>{t}</span>)}
                </div>
                <a href="https://github.com/priyadharshini-sip/study-ai" target="_blank" rel="noreferrer" className="project-link">View on GitHub</a>
              </div>
            </div>

            <div className="project-card abstract-visual-card">
              <div className="project-visual abstract-visual line-tracer-visual">
                <div className="path-line"></div>
              </div>
              <div className="project-content">
                <h3 className="project-title">Line Tracer Robot</h3>
                <p className="project-desc">A line-following robot using sensors for path tracking and motor control.</p>
                <div className="project-tech">
                  {['Sensors', 'Motor Control', 'Embedded Systems', 'Robotics'].map(t => <span key={t}>{t}</span>)}
                </div>
              </div>
            </div>

            <div className="project-card">
              <div className="project-visual">
                <img src="/projects/obstacle-bot.jpg" alt="Obstacle Avoidance Bot" />
              </div>
              <div className="project-content">
                <div className="project-badge">2nd Prize</div>
                <h3 className="project-title">Obstacle Avoidance Bot</h3>
                <p className="project-desc">A Raspberry Pi and TF-Luna LiDAR based robot designed for real-time obstacle detection and navigation.</p>
                <div className="project-tech">
                  {['Raspberry Pi', 'TF-Luna LiDAR', 'Sensors', 'Robotics', 'Navigation'].map(t => <span key={t}>{t}</span>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="content-section dark-section">
        <div className="section-container">
          <h2 className="section-title">Skills</h2>
          <div className="skills-grid">
            <div className="skill-category">
              <h3>Programming</h3>
              <div className="skill-tags">{['C', 'C++', 'Java', 'Verilog', 'SystemVerilog'].map(s => <span key={s}>{s}</span>)}</div>
            </div>
            <div className="skill-category">
              <h3>Web & DB</h3>
              <div className="skill-tags">{['HTML', 'JavaScript', 'React.js', 'MySQL'].map(s => <span key={s}>{s}</span>)}</div>
            </div>
            <div className="skill-category">
              <h3>Hardware & EDA</h3>
              <div className="skill-tags">{['PCB Designing', 'Cadence Virtuoso', 'Vivado (Xilinx)', 'MATLAB'].map(s => <span key={s}>{s}</span>)}</div>
            </div>
            <div className="skill-category">
              <h3>Embedded</h3>
              <div className="skill-tags">{['Raspberry Pi', 'Arduino', 'ESP32', 'Vega Aries V3'].map(s => <span key={s}>{s}</span>)}</div>
            </div>
            <div className="skill-category">
              <h3>Protocols & Concepts</h3>
              <div className="skill-tags">{['VLSI Design Flow', 'Digital Logic', 'I2C', 'UART', 'ADC', 'Embedded Systems'].map(s => <span key={s}>{s}</span>)}</div>
            </div>
            <div className="skill-category">
              <h3>Control & AI</h3>
              <div className="skill-tags">{['PID Control', 'ADRC', 'Edge AI', 'Machine Learning Basics'].map(s => <span key={s}>{s}</span>)}</div>
            </div>
            <div className="skill-category">
              <h3>Sensors & Hardware</h3>
              <div className="skill-tags">{['TF-Luna LiDAR', 'Servo Motors', 'DC Motors', 'Motor Drivers', 'Microcontrollers'].map(s => <span key={s}>{s}</span>)}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements & Info */}
      <section className="content-section dark-section">
        <div className="section-container split-layout">
          <div className="timeline-col">
            <h2 className="section-title">Achievements</h2>
            <div className="achievement-list">
              <div className="achievement-card">
                <h4>WE Hack — VIT Vellore (1st Prize)</h4>
                <p>Autonomous Edge-AI Environmental Inspection Rover (₹70,000 cash prize)</p>
              </div>
              <div className="achievement-card">
                <h4>Envision Hackathon 2024–2025</h4>
                <p>Developed Study AI, an AI-powered student learning support platform.</p>
              </div>
              <div className="achievement-card">
                <h4>IEEE Student Member</h4>
                <p>Active IEEE member focused on emerging technologies, technical events and practical solutions.</p>
              </div>
              <div className="achievement-card">
                <h4>Workshops & Conferences</h4>
                <p>Attended a workshop at VIT Chennai on RHP Pearl and a conference at Dhanalakshmi Srinivasan.</p>
              </div>
            </div>
          </div>
          <div className="timeline-col">
            <h2 className="section-title">Interests & Languages</h2>
            <div className="info-block">
              <h3>Interests</h3>
              <div className="skill-tags">{['Robotics', 'Technology', 'Art & Craft', 'Building Things', 'Creative Problem Solving'].map(s => <span key={s}>{s}</span>)}</div>
            </div>
            <div className="info-block">
              <h3>Languages</h3>
              <ul className="lang-list">
                <li><strong>Tamil:</strong> Fluent</li>
                <li><strong>English:</strong> Fluent</li>
                <li><strong>Japanese:</strong> Intermediate</li>
              </ul>
            </div>
            <div className="info-block">
              <h3>Volunteering</h3>
              <p>NGO Volunteer: Participated in NGO volunteer work involving care and welfare activities.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="content-section dark-section contact-section">
        <div className="section-container">
          <h2 className="section-title">Let's build something.</h2>
          <p className="contact-desc">Have an idea, project, collaboration, or opportunity in mind? Let's talk.</p>
          
          <div className="contact-grid">
            <div className="contact-details">
              <div className="contact-item">
                <span className="label">Email</span>
                <a href="mailto:lakshmananr2k6@gmail.com">lakshmananr2k6@gmail.com</a>
              </div>
              <div className="contact-item">
                <span className="label">Phone</span>
                <a href="tel:+918778581190">+91 8778581190</a>
              </div>
              <div className="contact-item">
                <span className="label">Location</span>
                <span>Chennai, India</span>
              </div>
              <div className="contact-item">
                <span className="label">LinkedIn</span>
                <a href="https://www.linkedin.com/in/lakshmananravichandran" target="_blank" rel="noreferrer">LinkedIn Profile</a>
              </div>
            </div>
            
            <form className="contact-form" onSubmit={(e) => { e.preventDefault(); alert("Thanks for reaching out! Since there is no backend configured, please use the provided email address to contact me directly."); }}>
              <input type="text" placeholder="Name" required />
              <input type="email" placeholder="Email" required />
              <textarea placeholder="Message" rows={5} required></textarea>
              <button type="submit" className="btn-submit">Send Message</button>
            </form>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>Lakshmanan Ravichandran</h3>
            <p>Tech Builder</p>
            <p className="footer-niche">Robotics • Embedded Systems • Edge AI • VLSI</p>
            <p className="footer-location">Chennai, India</p>
          </div>
          <div className="footer-links">
            <a href="https://www.linkedin.com/in/lakshmananravichandran" target="_blank" rel="noreferrer">LinkedIn</a>
            <a href="https://github.com/lakshmananravichandran" target="_blank" rel="noreferrer">GitHub</a>
            <a href="mailto:lakshmananr2k6@gmail.com">Email</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Lakshmanan Ravichandran</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
