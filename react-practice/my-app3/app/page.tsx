import React from 'react';
import './HomePage.css';

export default function HomePage() {
  return (
    <div className="homepage">
      <header className="header">
        <h1>Welcome to Post_It!</h1>
        <p>Your one-stop solution for all your sticky notes needs.</p>
      </header>
      <main className="main-content">
        <section className="features card">
          <h2>Features</h2>
          <ul>
            <li>Create and manage notes easily</li>
            <li>Organize your tasks efficiently</li>
            <li>Access your notes from anywhere</li>
          </ul>
        </section>
        <section className="get-started card">
          <h2>Get Started</h2>
          <p>Sign up now and start organizing your life with Post_It!</p>
          <button className="signup-button">Sign Up</button>
        </section>
      </main>
      <footer className="footer">
        <p>&copy; 2025 Post_It. All rights reserved.</p>
      </footer>
    </div>
  );
}
