import React from 'react';
import { createRoot } from 'react-dom/client';
import '../css/app.css';

function App() {
    return (
        <main className="landing">
            <nav className="navigation">
                <a className="brand" href="#home">jorvellan<span>.</span></a>
                <a className="nav-link" href="mailto:hello@jorvellan.net">Let’s talk <span aria-hidden="true">↗</span></a>
            </nav>
            <section className="hero" id="home">
                <div className="hero-copy">
                    <p className="eyebrow"><span /> Independent by design</p>
                    <h1>Ideas with<br />room to <em>grow.</em></h1>
                    <p className="intro">A thoughtful digital home for the next chapter. Jorvellan is taking shape—built around clear thinking, useful work, and a little curiosity.</p>
                    <a className="primary-link" href="mailto:hello@jorvellan.net">Start a conversation <span aria-hidden="true">↗</span></a>
                </div>
                <div className="hero-art" aria-hidden="true">
                    <div className="sun" />
                    <div className="orbit orbit-one" /><div className="orbit orbit-two" />
                    <div className="orb orb-one" /><div className="orb orb-two" /><div className="orb orb-three" />
                    <div className="art-caption">A new perspective<br />is already in motion.</div>
                </div>
            </section>
            <footer><span>JORVELLAN · 2026</span><span>Made for what comes next.</span></footer>
        </main>
    );
}

createRoot(document.getElementById('app')).render(<App />);
