import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../css/app.css';

const sampleProcesses = [
    { name: 'Customer onboarding', department: 'Customer operations', stages: 8, status: 'Needs review', tone: 'amber' },
    { name: 'Invoice to payment', department: 'Finance', stages: 6, status: 'Active', tone: 'green' },
    { name: 'Supplier approval', department: 'Procurement', stages: 7, status: 'Bottleneck', tone: 'rose' },
];

function Arrow() {
    return <span className="arrow" aria-hidden="true">↗</span>;
}

function Brand({ light = false, current = false }) {
    return <a className={`brand${light ? ' brand-light' : ''}`} href="/" aria-label="Jorvellan home" aria-current={current ? 'page' : undefined}>jorvellan<span>.</span></a>;
}

function SectionHeading({ eyebrow, title, text }) {
    return (
        <div className="section-heading">
            <p className="eyebrow">{eyebrow}</p>
            <h2>{title}</h2>
            {text && <p className="section-copy">{text}</p>}
        </div>
    );
}

function DashboardPreview() {
    const [tab, setTab] = useState('overview');

    return (
        <div className="dashboard-frame">
            <div className="dashboard-chrome">
                <div className="dashboard-brand"><span className="dashboard-symbol">J</span>jorvellan</div>
                <span className="dashboard-crumb">Workspace <i>/</i> {tab === 'overview' ? 'Operations overview' : tab === 'map' ? 'Workflow map' : 'Insight review'}</span>
                <span className="dashboard-user"><i>?</i><b>AO</b></span>
            </div>
            <div className="dashboard-content">
                <aside className="dashboard-sidebar" aria-label="Product preview navigation">
                    <small>WORKSPACE</small>
                    <button type="button" className={tab === 'overview' ? 'preview-tab active' : 'preview-tab'} onClick={() => setTab('overview')}><span>⌂</span>Overview</button>
                    <button type="button" className={tab === 'map' ? 'preview-tab active' : 'preview-tab'} onClick={() => setTab('map')}><span>⌘</span>Workflow maps</button>
                    <button type="button" className={tab === 'insights' ? 'preview-tab active' : 'preview-tab'} onClick={() => setTab('insights')}><span>✳</span>Insight review <i>3</i></button>
                    <div className="preview-organization"><b>JO</b><span>Jorvellan Ops<small>Operations team</small></span><i>⌄</i></div>
                </aside>
                <div className="dashboard-main">
                    <div className="dashboard-heading"><div><small>SAMPLE VIEW · OPERATIONS</small><h3>{tab === 'overview' ? 'Operations overview' : tab === 'map' ? 'Customer onboarding' : 'Insight review'}</h3><p>Explore a sample of how process information can be organized.</p></div><button type="button">This month <span>⌄</span></button></div>
                    {tab === 'overview' && <>
                        <div className="dashboard-stats">
                            <article><strong>24</strong><span>Documented processes</span><small>Across 6 departments</small></article>
                            <article><strong>08</strong><span>Stages under review</span><small>Across 5 workflows</small></article>
                            <article><strong>06</strong><span>Open improvements</span><small>Recorded opportunities</small></article>
                            <article><strong>03</strong><span>Insights to review</span><small>Human review required</small></article>
                        </div>
                        <div className="sample-table">
                            <div className="sample-table-title"><b>Process registry</b><span>Illustrative records</span></div>
                            {sampleProcesses.map((process) => <div className="sample-row" key={process.name}><b><i>{process.name.slice(0, 1)}</i><span>{process.name}<small>{process.department}</small></span></b><span>{process.stages} stages</span><span><i className={`state-dot ${process.tone}`} />{process.status}</span></div>)}
                        </div>
                    </>}
                    {tab === 'map' && <div className="sample-map"><div className="sample-map-title"><small>CUSTOMER OPERATIONS</small><span className="sample-state">Active process</span></div>{[['01', 'Request received', 'Complete'], ['02', 'Initial review', 'Complete'], ['03', 'Manager approval', 'In review'], ['04', 'Final confirmation', 'Waiting']].map(([number, name, status]) => <div className="sample-stage" key={number}><i>{number}</i><b>{name}</b><span>{status}</span></div>)}</div>}
                    {tab === 'insights' && <div className="sample-insights"><div className="sample-map-title"><small>INSIGHT REGISTER</small><span className="sample-state review">3 for review</span></div>{[['Approval handoff', 'Supplier approval · Stage 4', 'High'], ['Repeated data entry', 'Customer onboarding · Stage 2', 'Medium'], ['Review queue variation', 'Invoice to payment · Stage 5', 'Review']].map(([name, detail, priority]) => <div className="sample-insight" key={name}><i>✳</i><b>{name}<small>{detail}</small></b><span>{priority}</span></div>)}</div>}
                    <p className="sample-disclaimer"><i>i</i> Illustrative demo records. No live enterprise data or AI inference is connected.</p>
                </div>
            </div>
        </div>
    );
}

const marketingPages = {
    product: { eyebrow: 'THE JORVELLAN WORKSPACE', title: <>A clearer view of<br />how operations work.</>, intro: 'Bring process records, workflow stages, observations and improvement actions together in one structured workspace.', action: 'Explore features', actionHref: '/features' },
    features: { eyebrow: 'CAPABILITIES', title: <>The details behind<br />better operations.</>, intro: 'A connected set of records helps teams understand process ownership, workflow movement and improvement activity.' },
    about: { eyebrow: 'ABOUT JORVELLAN', title: <>Make complex work<br />easier to understand.</>, intro: 'Jorvellan is focused on helping enterprise operations teams document how work moves and coordinate thoughtful process improvement.' },
    contact: { eyebrow: 'CONTACT', title: <>Start a conversation<br />about your operations.</>, intro: 'Tell us what your teams are trying to make clearer. Reach Jorvellan at either of our listed offices.' },
    'how-it-works': { eyebrow: 'A PRACTICAL IMPROVEMENT LOOP', title: <>From process knowledge<br />to considered action.</>, intro: 'Jorvellan organizes a repeatable way to document, map, review and improve business processes.' },
    terms: { eyebrow: 'WEBSITE TERMS', title: <>Terms of use</>, intro: 'These draft terms describe the intended use of the Jorvellan website and its informational materials.' },
    privacy: { eyebrow: 'YOUR INFORMATION', title: <>Privacy policy</>, intro: 'This draft explains the intended handling of information when you visit the Jorvellan marketing website or contact the company.' },
};

function AddressCards() {
    return <div className="address-grid"><article className="info-card"><p className="eyebrow">SRI LANKA</p><h3>Jorvellan (Pvt) Ltd</h3><p>3rd Floor, No. 186, Nawala Road<br />Nawala, Sri Jayawardenepura Kotte<br />Sri Lanka</p><a href="tel:+94112346789">+94 11 234 6789 <Arrow /></a></article><article className="info-card"><p className="eyebrow">UNITED STATES</p><h3>Jorvellan Inc</h3><p>Suite 520, 5th Floor<br />680 Folsom Street<br />San Francisco, CA 94107</p><a href="tel:+14155550148">+1 415-555-0148 <Arrow /></a></article></div>;
}

function MarketingPage({ page }) {
    const content = marketingPages[page];
    if (page === 'terms' || page === 'privacy') {
        return <main className="legal-page"><section className="page-hero legal-hero"><div className="site-container"><p className="eyebrow">{content.eyebrow}</p><h1>{content.title}</h1><p>{content.intro}</p><div className="draft-notice">Draft for Jorvellan legal review · Confirm details before publication</div></div></section><article className="legal-copy site-container">
            {page === 'terms' ? <><h2>1. About this website</h2><p>This website is operated by Jorvellan. It provides general information about Jorvellan and its proposed AI process discovery and workflow intelligence product. The product materials describe a concept and may include illustrative interface examples; they are not a promise that a feature is currently available.</p><h2>2. Acceptable use</h2><p>You may use the website for lawful informational and business purposes. Do not interfere with the website, attempt unauthorized access, introduce malicious code, or use its content in a way that violates applicable law or another person’s rights.</p><h2>3. Intellectual property</h2><p>Unless stated otherwise, website text, visual design and Jorvellan marks are owned by or used with permission by Jorvellan. You may view and share links to the public website. No other licence is granted by these draft terms.</p><h2>4. Information and availability</h2><p>We aim to keep website information useful and current, but it is provided for general information and may change. The website is provided without a commitment to uninterrupted availability. Nothing here forms a product subscription, service-level commitment, or professional advice.</p><h2>5. Contact and updates</h2><p>Questions about these terms can be directed to either Jorvellan office listed on the <a href="/contact">Contact page</a>. These draft terms should be reviewed and completed by Jorvellan before publication, including governing law, entity details, and any future product-specific terms.</p></> : <><h2>1. Who this policy covers</h2><p>This draft applies to the Jorvellan marketing website at jorvellan.net and information you choose to provide when contacting the company. A future account-based product will require a separate, complete description of its data practices before it collects account or workflow data.</p><h2>2. Information and use</h2><p>If you contact Jorvellan by telephone, the company may receive the number you call from and information you choose to share during the discussion. That information may be used to respond to you and manage the business inquiry. The website host may also process basic technical request and security information needed to deliver and protect the site. Confirm actual logs, analytics, cookies and retention settings before publication.</p><h2>3. Sharing and retention</h2><p>Jorvellan may use service providers that host or secure the website, subject to arrangements that should be described here once confirmed. This draft does not establish a retention period or identify all providers, transfers, or legal bases. Jorvellan should complete those details based on its actual operations.</p><h2>4. Your questions and requests</h2><p>For a privacy question or request, contact Jorvellan by phone using the details on the <a href="/contact">Contact page</a> and identify the information and request involved. The appropriate process and available rights depend on applicable law and should be confirmed by Jorvellan before publication.</p><h2>5. Changes and review</h2><p>We may update this policy as the website or services change. This page is a draft, not a representation that all legal disclosure requirements have been assessed. The company should verify applicable privacy obligations and provide any required request methods and notices before launch.</p></>}
        </article></main>;
    }

    return <main className="marketing-page">
        <section className={`page-hero page-hero-${page}`}><div className="site-container page-hero-grid"><div><p className="eyebrow">{content.eyebrow}</p><h1>{content.title}</h1><p className="page-lede">{content.intro}</p>{content.action && <a className="button button-mint" href={content.actionHref}>{content.action}<Arrow /></a>}</div><div className={`page-hero-art page-hero-art-${page}`} aria-hidden="true">
            {page === 'product' && <><div className="page-art-orbit orbit-one"/><div className="page-art-orbit orbit-two"/><span>J</span><small>OPERATIONS<br />INTELLIGENCE</small><i>01</i><b>02</b></>}
            {page === 'features' && <div className="hero-capability-list"><span><i>01</i> Process registry</span><span><i>02</i> Workflow maps</span><span><i>03</i> Insight review</span></div>}
            {page === 'about' && <div className="hero-founder-mark"><span>J</span><small>FOUNDED<br /><b>21 AUG 2023</b></small></div>}
            {page === 'contact' && <div className="hero-office-list"><span><i>SL</i><b>Sri Lanka<small>Colombo office</small></b></span><span><i>US</i><b>United States<small>San Francisco office</small></b></span></div>}
            {page === 'how-it-works' && <ol className="hero-flow-list"><li>Document</li><li>Map</li><li>Review</li><li>Improve</li></ol>}
        </div></div></section>
        {page === 'product' && <><section className="section-space"><div className="site-container"><SectionHeading eyebrow="A PRODUCT CONCEPT" title="One operational picture, built from reviewable records." text="Jorvellan is being shaped around the records teams need to understand process ownership, how work moves and where improvement efforts stand."/><div className="product-showcase"><DashboardPreview /></div><div className="detail-grid"><article className="info-card"><span>01 / UNDERSTAND</span><h3>Process registry</h3><p>Keep owners, departments, versions, categories and review dates together.</p></article><article className="info-card"><span>02 / CONNECT</span><h3>Workflow context</h3><p>Describe stages, tasks, dependencies and handoffs across teams.</p></article><article className="info-card"><span>03 / IMPROVE</span><h3>Reviewable actions</h3><p>Record observations, improvement opportunities and human-reviewed insights.</p></article></div></div></section><section className="tech-section section-space"><div className="site-container"><SectionHeading eyebrow="PROPOSED TECHNICAL DIRECTION" title="An architecture to explore as the product evolves." text="These are options for future research and design, not current integrations or product capabilities."/><div className="tech-grid">{[['NVIDIA NeMo','Potential model development and evaluation tooling.'],['NVIDIA NIM','A possible approach to serving models in a future architecture.'],['NVIDIA RAPIDS','Potential GPU-accelerated data exploration components.'],['NVIDIA Triton','A possible inference-serving option to evaluate.']].map(([name,desc])=><article className="tech-card" key={name}><small>PROPOSED OPTION</small><h3>{name}</h3><p>{desc}</p></article>)}</div><p className="scope-note">No NVIDIA integration, certification, endorsement, live AI inference or automated workflow execution is represented as available.</p></div></section></>}
        {page === 'features' && <section className="section-space"><div className="site-container"><div className="detail-grid feature-detail-grid">{[['Process registry','Organize process owners, departments, categories, status, versions and review dates.'],['Workflow maps','Describe stages, tasks, dependencies, expected durations and responsible owners.'],['Performance observations','Keep manually recorded duration, completion and recurring issue observations with their context.'],['Bottlenecks and improvements','Track potential causes, priority, owners, target dates, status and outcomes.'],['Insight review','Keep suggested observations reviewable, with a human decision before adoption.'],['Operations dashboard','Bring process summaries, delayed stages and pending work into an overview.'],['Search and filters','Find process and workflow records by their recorded details.'],['Activity history','Retain a record of process and improvement changes for teams to review.']].map(([title,desc],i)=><article className="info-card feature-detail" key={title}><span>0{i+1}</span><h3>{title}</h3><p>{desc}</p></article>)}</div><p className="scope-note">This is a product concept. Live process mining, system integrations, automated monitoring, live AI inference and automatic workflow execution are not included in the initial scope.</p></div></section>}
        {page === 'how-it-works' && <section className="section-space"><div className="site-container"><div className="process-steps">{[['01','Document','Create a process record with its owner, purpose, department and version.'],['02','Map','Describe the stages, tasks, dependencies and handoffs involved.'],['03','Observe','Add performance notes and record delays or recurring issues using available information.'],['04','Review','Assess potential insights and improvement opportunities with the people responsible.'],['05','Improve','Assign actions, track their status and record what changed or was learned.']].map(([number,title,desc])=><article key={number}><i>{number}</i><div><h3>{title}</h3><p>{desc}</p></div></article>)}</div><p className="scope-note">The initial concept uses information entered by people or prepared as sample data. It does not connect to enterprise systems or automatically monitor or change live workflows.</p></div></section>}
        {page === 'about' && <section className="section-space"><div className="site-container about-detail"><div><SectionHeading eyebrow="OUR FOCUS" title="Help teams see the work behind the work." text="Jorvellan is building toward a structured operational workspace where process knowledge, workflow details and improvement decisions can stay connected."/><p className="page-lede">The goal is to give operations teams and process improvement practitioners a shared, reviewable place to understand processes and coordinate change.</p></div><div className="about-facts"><div><small>FOUNDER</small><strong>Aadhirayan Thamilini</strong></div><div><small>FOUNDED</small><strong>21 August 2023</strong></div><div><small>COMPANY</small><strong>Jorvellan (Pvt) Ltd · Sri Lanka<br/>Jorvellan Inc · United States</strong></div></div></div><div className="site-container"><AddressCards /></div></section>}
        {page === 'contact' && <section className="section-space"><div className="site-container"><p className="page-lede contact-lede">Reach us by phone to discuss process discovery, workflow visibility or enterprise operations improvement.</p><AddressCards /><div className="contact-followup"><h2>What would you like to make clearer?</h2><p>Our team welcomes conversations about process documentation, handoffs, bottlenecks and improvement priorities. Call either office above to get started.</p></div></div></section>}
        <section className="page-cta"><div className="site-container"><div><p className="eyebrow eyebrow-light">JORVELLAN · ENTERPRISE OPERATIONS</p><h2>Make the next improvement easier to see.</h2></div><a className="button button-mint" href="/contact">Talk with Jorvellan <Arrow /></a></div></section>
    </main>;
}

function App() {
    const page = document.getElementById('app')?.dataset.page || 'home';
    const [menuOpen, setMenuOpen] = useState(false);
    const menuButtonRef = useRef(null);
    const headerRef = useRef(null);
    const closeMenu = () => setMenuOpen(false);
    const navigationItems = [
        { page: 'home', label: 'Home', href: '/' },
        { page: 'product', label: 'Product', href: page === 'home' ? '#product' : '/product' },
        { page: 'features', label: 'Features', href: page === 'home' ? '#features' : '/features' },
        { page: 'how-it-works', label: 'How it works', href: page === 'home' ? '#how-it-works' : '/how-it-works' },
        { page: 'about', label: 'About', href: page === 'home' ? '#about' : '/about' },
    ];

    useEffect(() => {
        function handleEscape(event) {
            if (menuOpen && event.key === 'Escape') {
                setMenuOpen(false);
                menuButtonRef.current?.focus();
            }
        }

        function handleOutsideClick(event) {
            if (menuOpen && !headerRef.current?.contains(event.target)) {
                setMenuOpen(false);
            }
        }

        document.addEventListener('keydown', handleEscape);
        document.addEventListener('pointerdown', handleOutsideClick);
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('pointerdown', handleOutsideClick);
        };
    }, [menuOpen]);

    return (
        <div className="site" id="top">
            <header className="site-header" ref={headerRef}>
                <div className="nav-shell">
                    <Brand current={page === 'home'} />
                    <button ref={menuButtonRef} className={`mobile-menu-toggle${menuOpen ? ' is-open' : ''}`} type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={() => setMenuOpen(!menuOpen)}><span /><span /></button>
                    <nav id="primary-navigation" className={menuOpen ? 'main-nav open' : 'main-nav'} aria-label="Main navigation">
                        {navigationItems.map((item) => <a key={item.page} className={page === item.page ? 'is-current' : undefined} href={item.href} aria-current={page === item.page ? 'page' : undefined} onClick={closeMenu}>{item.label}</a>)}
                    </nav>
                    <a className={`nav-contact${page === 'contact' ? ' is-current' : ''}`} href={page === 'home' ? '#contact' : '/contact'} aria-current={page === 'contact' ? 'page' : undefined} onClick={closeMenu}>Contact <Arrow /></a>
                </div>
            </header>

            {page === 'home' ? <main>
                <section className="home-hero">
                    <div className="hero-grid-pattern" aria-hidden="true" />
                    <div className="hero-container site-container">
                        <div className="hero-copy">
                            <p className="hero-kicker"><span /> AI PROCESS DISCOVERY & WORKFLOW INTELLIGENCE</p>
                            <h1>When work spans<br />teams, context<br /><em>gets lost.</em></h1>
                            <p className="hero-description">Jorvellan brings process records, workflow stages, observations and improvement actions into one structured workspace your team can review together.</p>
                            <div className="hero-buttons"><a className="button button-mint" href="#product">See the workspace <Arrow /></a><a className="button button-outline" href="#how-it-works">How it works <span aria-hidden="true">↓</span></a></div>
                            <div className="hero-assurance"><span>✓</span> A product concept built around clear records and human review.</div>
                        </div>
                        <div className="hero-visual" aria-hidden="true">
                            <div className="visual-ring ring-a" /><div className="visual-ring ring-b" /><div className="visual-ring ring-c" />
                            <div className="visual-core"><b>J</b><span>OPERATIONS<br />INTELLIGENCE</span></div>
                            <div className="visual-node node-a"><i>01</i><span>Process<br />registry</span></div>
                            <div className="visual-node node-b"><i>02</i><span>Workflow<br />stages</span></div>
                            <div className="visual-node node-c"><i>03</i><span>Performance<br />signals</span></div>
                            <div className="visual-node node-d"><i>04</i><span>Improvement<br />actions</span></div>
                            <span className="visual-label">Make the moving parts<br />easier to see.</span>
                        </div>
                    </div>
                    <div className="hero-bottom site-container"><span>BUILT FOR ENTERPRISE OPERATIONS</span><a href="#product">Discover Jorvellan <i>↓</i></a></div>
                </section>

                <section className="problem-section section-space">
                    <div className="site-container">
                        <SectionHeading eyebrow="THE OPERATIONAL CHALLENGE" title={<>A process can cross teams<br />without a shared picture.</>} text="Ownership, workflow stages, performance notes and improvement actions can end up in separate places. Jorvellan brings those details into a structured workspace people can review together." />
                        <div className="problem-grid">
                            <article><span>01 · RECORDS</span><h3>Process context gets separated</h3><p>Owners, departments and current versions are harder to connect to day-to-day work.</p></article>
                            <article><span>02 · HANDOFFS</span><h3>Workflow gaps stay unclear</h3><p>Stages, tasks and dependencies can be difficult to trace across teams.</p></article>
                            <article><span>03 · FOLLOW-THROUGH</span><h3>Improvement loses its trail</h3><p>Observations, proposed actions, owners and outcomes need a shared record.</p></article>
                        </div>
                    </div>
                </section>

                <section className="product-section section-space" id="product">
                    <div className="site-container">
                        <div className="product-intro">
                            <SectionHeading eyebrow="INTRODUCING JORVELLAN" title={<>One reviewable workspace<br />for how work moves.</>} text="Connect process ownership to workflow stages, performance observations and improvement actions. The sample below illustrates the product concept; it contains no live enterprise data." />
                            <a className="inline-link" href="/product">Explore the product <Arrow /></a>
                        </div>
                        <div className="preview-annotation-bar" aria-label="Workspace areas illustrated in the sample">
                            <span><i>01</i><b>Process context</b><small>Owner · version</small></span>
                            <span><i>02</i><b>Workflow movement</b><small>Stages · handoffs</small></span>
                            <span><i>03</i><b>Reviewed improvement</b><small>Observations · actions</small></span>
                        </div>
                        <div className="preview-caption"><span><i /> PRODUCT CONCEPT PREVIEW · ILLUSTRATIVE SAMPLE DATA</span><span>Explore the sample workspace tabs</span></div>
                        <DashboardPreview />
                    </div>
                </section>

                <section className="feature-section section-space" id="features">
                    <div className="site-container">
                        <div className="feature-heading-row"><SectionHeading eyebrow="ONE CONNECTED WORKSPACE" title={<>From process records<br />to improvement actions.</>} text="Bring the essential parts of process improvement into view, with a clear record at each step." /><a className="inline-link feature-all-link" href="/features">See all features <Arrow /></a></div>
                        <div className="feature-grid">
                            <article className="feature-card"><span className="feature-icon icon-teal">▤</span><small>DOCUMENT</small><h3>Process registry</h3><p>Record owners, departments, categories, status, versions and review dates.</p><a href="/features">Explore features <Arrow /></a></article>
                            <article className="feature-card"><span className="feature-icon icon-blue">⌘</span><small>MAP</small><h3>Workflow visibility</h3><p>Describe stages, tasks, dependencies and the people responsible for handoffs.</p><a href="/features">Explore features <Arrow /></a></article>
                            <article className="feature-card"><span className="feature-icon icon-gold">↗</span><small>IMPROVE</small><h3>Actions with context</h3><p>Connect bottlenecks and improvement opportunities to owners and outcomes.</p><a href="/features">Explore features <Arrow /></a></article>
                        </div>
                    </div>
                </section>

                <section className="how-section section-space" id="how-it-works">
                    <div className="site-container how-layout">
                        <div className="how-intro"><p className="eyebrow eyebrow-light">A PRACTICAL IMPROVEMENT LOOP</p><h2>Make the work visible.<br /><em>Move forward together.</em></h2><p>Jorvellan supports a structured way to document process knowledge, understand the flow and keep improvement decisions reviewable.</p><a className="inline-link link-light" href="/how-it-works">See how it works <Arrow /></a></div>
                        <div className="how-steps">
                            <article><i>01</i><div><h3>Document</h3><p>Capture the process, its owner and the current version.</p></div></article>
                            <article><i>02</i><div><h3>Map</h3><p>Describe stages, tasks, dependencies and handoffs.</p></div></article>
                            <article><i>03</i><div><h3>Review</h3><p>Review observations and possible insights with people who know the process.</p></div></article>
                            <article><i>04</i><div><h3>Improve</h3><p>Assign actions, review suggestions and record outcomes.</p></div></article>
                        </div>
                    </div>
                </section>

                <section className="about-section section-space" id="about">
                    <div className="site-container about-layout">
                        <div className="about-mark" aria-hidden="true"><span>J</span><i /><b /></div>
                        <div className="about-copy"><p className="eyebrow">ABOUT JORVELLAN</p><h2>Built for the people<br />who make operations better.</h2><p>Jorvellan is developing a clearer, more structured way for organizations to understand their processes and coordinate improvement work across teams.</p><p className="about-founder">Founded by <strong>Aadhirayan Thamilini</strong><span>21 August 2023 · Sri Lanka and United States</span></p><a className="inline-link" href="/about">More about Jorvellan <Arrow /></a></div>
                    </div>
                </section>

                <section className="contact-section" id="contact">
                    <div className="site-container contact-banner"><div><p className="eyebrow eyebrow-light">START A CONVERSATION</p><h2>Let’s make process<br />improvement clearer.</h2><p>Talk with our team about process discovery, workflow visibility and your operations goals.</p></div><div className="contact-actions"><a href="tel:+94112346789">Sri Lanka <strong>+94 11 234 6789</strong><Arrow /></a><a href="tel:+14155550148">United States <strong>+1 415-555-0148</strong><Arrow /></a><a className="contact-more" href="/contact">Contact Jorvellan <Arrow /></a></div></div>
                </section>
            </main> : <MarketingPage page={page} />}

            <footer className="site-footer">
                <div className="site-container footer-top">
                    <div className="footer-brand"><Brand light current={page === 'home'} /><p>AI process discovery & workflow intelligence<br />for enterprise operations.</p></div>
                    <div className="footer-link-group"><p>EXPLORE</p><nav aria-label="Product navigation"><a href="/product" aria-current={page === 'product' ? 'page' : undefined}>Product</a><a href="/features" aria-current={page === 'features' ? 'page' : undefined}>Features</a><a href="/how-it-works" aria-current={page === 'how-it-works' ? 'page' : undefined}>How it works</a></nav></div>
                    <div className="footer-link-group"><p>JORVELLAN</p><nav aria-label="Company navigation"><a href="/about" aria-current={page === 'about' ? 'page' : undefined}>About</a><a href="/contact" aria-current={page === 'contact' ? 'page' : undefined}>Contact</a></nav></div>
                    <div className="footer-link-group"><p>INFORMATION</p><nav className="legal-links" aria-label="Legal navigation"><a className={page === 'terms' ? 'is-current' : undefined} href="/terms" aria-current={page === 'terms' ? 'page' : undefined}>Terms</a><a className={page === 'privacy' ? 'is-current' : undefined} href="/privacy" aria-current={page === 'privacy' ? 'page' : undefined}>Privacy policy</a></nav></div>
                </div>
                <div className="site-container footer-bottom"><span>© 2026 Jorvellan</span><span>Proposed product concept · Sample data is illustrative</span><a href="#top">Back to top <span aria-hidden="true">↑</span></a></div>
            </footer>
        </div>
    );
}

createRoot(document.getElementById('app')).render(<App />);
