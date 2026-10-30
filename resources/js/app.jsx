import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../css/app.css';

const processRows = [
    { name: 'Customer onboarding', team: 'Customer operations', stages: 8, status: 'Needs review', tone: 'amber' },
    { name: 'Invoice to payment', team: 'Finance', stages: 6, status: 'Active', tone: 'green' },
    { name: 'Supplier approval', team: 'Procurement', stages: 7, status: 'Bottleneck', tone: 'rose' },
];

const insightRows = [
    { label: 'Approval handoff', detail: 'Supplier approval · Stage 4', priority: 'High', tone: 'rose' },
    { label: 'Repeated data entry', detail: 'Customer onboarding · Stage 2', priority: 'Medium', tone: 'amber' },
    { label: 'Review queue variation', detail: 'Invoice to payment · Stage 5', priority: 'Review', tone: 'blue' },
];

function Brand({ light = false }) {
    return <a className={`brand${light ? ' brand-light' : ''}`} href="#top" aria-label="Jorvellan home">jorvellan<span className="brand-mark">.</span></a>;
}

function Arrow({ diagonal = true }) {
    return <span aria-hidden="true" className="arrow">{diagonal ? '↗' : '→'}</span>;
}

function SectionIntro({ eyebrow, title, children, light = false }) {
    return (
        <div className={`section-intro${light ? ' section-intro-light' : ''}`}>
            <p className="eyebrow">{eyebrow}</p>
            <h2>{title}</h2>
            {children && <p className="section-lede">{children}</p>}
        </div>
    );
}

function StatCard({ value, label, trend, tone }) {
    return (
        <article className="stat-card">
            <div className={`stat-spark ${tone}`} aria-hidden="true"><span /><span /><span /><span /><span /></div>
            <span className="stat-value">{value}</span>
            <span className="stat-label">{label}</span>
            <span className="stat-trend">{trend}</span>
        </article>
    );
}

function ProcessTable() {
    return (
        <div className="table-wrap">
            <div className="table-heading"><span>Process registry</span><button type="button" className="table-filter">All processes <span>⌄</span></button></div>
            <div className="process-table" role="table" aria-label="Illustrative process registry">
                <div className="process-row process-head" role="row"><span>PROCESS</span><span>OWNER</span><span>STAGES</span><span>STATUS</span></div>
                {processRows.map((process) => (
                    <div className="process-row" role="row" key={process.name}>
                        <span className="process-name"><span className="process-icon">{process.name.slice(0, 1)}</span><span>{process.name}<small>{process.team}</small></span></span>
                        <span className="process-owner"><span className="avatar">{process.team.slice(0, 1)}</span>{process.team}</span>
                        <span className="stage-count">{process.stages} stages</span>
                        <span><i className={`status-dot ${process.tone}`} />{process.status}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function WorkflowMap() {
    const stages = [
        ['01', 'Request received', 'Complete', 'done'],
        ['02', 'Initial review', 'Complete', 'done'],
        ['03', 'Manager approval', 'In review', 'active'],
        ['04', 'Final confirmation', 'Waiting', 'waiting'],
    ];

    return (
        <div className="map-view">
            <div className="map-title"><div><span className="mini-eyebrow">CUSTOMER OPERATIONS</span><h3>Customer onboarding</h3></div><span className="tag tag-green">Active process</span></div>
            <div className="stage-list">
                {stages.map(([number, label, status, state]) => (
                    <div className={`stage-item ${state}`} key={number}>
                        <span className="stage-number">{number}</span><span className="stage-line" />
                        <div className="stage-copy"><strong>{label}</strong><span>{status}</span></div>
                        <span className="stage-menu" aria-hidden="true">···</span>
                    </div>
                ))}
            </div>
            <p className="preview-caption">Example workflow stages shown for demonstration.</p>
        </div>
    );
}

function InsightReview() {
    return (
        <div className="insight-view">
            <div className="insight-toolbar"><div><span className="mini-eyebrow">INSIGHT REGISTER</span><h3>Review queue</h3></div><span className="tag tag-amber">3 for review</span></div>
            <div className="insight-list">
                {insightRows.map((insight, index) => (
                    <article className="insight-row" key={insight.label}>
                        <span className={`insight-mark ${insight.tone}`}>{index === 0 ? '!' : '↗'}</span>
                        <div className="insight-copy"><strong>{insight.label}</strong><span>{insight.detail}</span></div>
                        <span className={`priority ${insight.tone}`}>{insight.priority}</span>
                    </article>
                ))}
            </div>
            <p className="preview-caption">Illustrative records. Suggestions are reviewed by people before they are adopted.</p>
        </div>
    );
}

function ProductPreview() {
    const [activeView, setActiveView] = useState('overview');

    return (
        <div className="product-window">
            <div className="window-topbar">
                <div className="window-brand"><span className="window-symbol">J</span><span>jorvellan</span></div>
                <div className="window-crumb">Workspace <span>/</span> Operations overview</div>
                <div className="window-profile"><span className="profile-ring">?</span><span className="avatar avatar-user">AO</span></div>
            </div>
            <div className="window-body">
                <aside className="window-sidebar" aria-label="Preview navigation">
                    <span className="sidebar-label">WORKSPACE</span>
                    <button type="button" className={activeView === 'overview' ? 'sidebar-item active' : 'sidebar-item'} onClick={() => setActiveView('overview')}><span>⌂</span>Overview</button>
                    <button type="button" className={activeView === 'map' ? 'sidebar-item active' : 'sidebar-item'} onClick={() => setActiveView('map')}><span>⌘</span>Workflow maps</button>
                    <button type="button" className={activeView === 'insights' ? 'sidebar-item active' : 'sidebar-item'} onClick={() => setActiveView('insights')}><span>✳</span>Insight review<span className="sidebar-count">3</span></button>
                    <span className="sidebar-label sidebar-spaced">ORGANIZATION</span>
                    <div className="sidebar-static"><span>▦</span>Process registry</div>
                    <div className="sidebar-static"><span>◷</span>Activity history</div>
                    <div className="sidebar-account"><span className="avatar avatar-org">JO</span><span>Jorvellan Ops<small>Operations team</small></span><span className="sidebar-chevron">⌄</span></div>
                </aside>
                <div className="window-main">
                    <div className="window-heading"><div><span className="mini-eyebrow">SAMPLE VIEW · MONDAY, 14 OCTOBER</span><h2>{activeView === 'overview' ? 'Operations overview' : activeView === 'map' ? 'Workflow map' : 'Insight review'}</h2><p>A clearer view of how work moves across your organization.</p></div><button type="button" className="window-action">This month <span>⌄</span></button></div>
                    {activeView === 'overview' && <>
                        <div className="stat-grid">
                            <StatCard value="24" label="Documented processes" trend="Across 6 departments" tone="mint" />
                            <StatCard value="08" label="Stages under review" trend="Across 5 workflows" tone="blue" />
                            <StatCard value="06" label="Open improvements" trend="2 target this month" tone="gold" />
                            <StatCard value="03" label="Insights to review" trend="Human review required" tone="lilac" />
                        </div>
                        <ProcessTable />
                    </>}
                    {activeView === 'map' && <WorkflowMap />}
                    {activeView === 'insights' && <InsightReview />}
                    <div className="demo-notice"><span>i</span> Preview uses illustrative demo records. No live operational data or AI inference is connected.</div>
                </div>
            </div>
        </div>
    );
}

function App() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const closeMenu = () => setMobileMenuOpen(false);

    return (
        <div className="site" id="top">
            <header className="site-header">
                <div className="nav-shell">
                    <Brand />
                    <button className="mobile-menu-button" type="button" aria-expanded={mobileMenuOpen} aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}><span /><span /></button>
                    <nav className={mobileMenuOpen ? 'main-nav open' : 'main-nav'} aria-label="Main navigation">
                        <a href="#platform" onClick={closeMenu}>Platform</a>
                        <a href="#capabilities" onClick={closeMenu}>Capabilities</a>
                        <a href="#solutions" onClick={closeMenu}>Use cases</a>
                        <a href="#approach" onClick={closeMenu}>Our approach</a>
                    </nav>
                    <a className="nav-cta" href="#contact">Talk to our team <Arrow /></a>
                </div>
            </header>

            <main>
                <section className="hero-section">
                    <div className="hero-glow" aria-hidden="true" />
                    <div className="hero-grid site-container">
                        <div className="hero-copy">
                            <p className="hero-kicker"><span className="kicker-line" /> AI PROCESS DISCOVERY & WORKFLOW INTELLIGENCE</p>
                            <h1>Make the way<br />work flows <em>visible.</em></h1>
                            <p className="hero-description">Bring process documentation, workflow stages, performance signals and improvement work into one operational picture.</p>
                            <div className="hero-actions"><a className="button button-primary" href="#platform">Explore the platform <Arrow /></a><a className="button button-quiet" href="#contact">Discuss your operations <Arrow /></a></div>
                            <div className="hero-note"><span className="note-check">✓</span> A structured workspace for people improving how work gets done.</div>
                        </div>
                        <div className="hero-orbit" aria-hidden="true">
                            <div className="orbit-halo halo-one" /><div className="orbit-halo halo-two" /><div className="orbit-halo halo-three" />
                            <div className="orbit-center"><span className="center-mark">J</span><span>PROCESS<br />INTELLIGENCE</span></div>
                            <span className="orbit-node node-registry"><b>01</b><span>Process<br />registry</span></span>
                            <span className="orbit-node node-workflow"><b>02</b><span>Workflow<br />stages</span></span>
                            <span className="orbit-node node-signals"><b>03</b><span>Performance<br />signals</span></span>
                            <span className="orbit-node node-improve"><b>04</b><span>Improvement<br />work</span></span>
                            <span className="orbit-caption">A connected view<br />of operational work</span>
                        </div>
                    </div>
                    <div className="hero-bottom site-container"><span>BUILT FOR ENTERPRISE OPERATIONS</span><span>Discover <i>↓</i></span></div>
                </section>

                <section className="platform-section section-pad" id="platform">
                    <div className="site-container">
                        <SectionIntro eyebrow="THE JORVELLAN WORKSPACE" title={<>From process records<br />to a clearer next step.</>}>
                            See how processes are documented, how their stages connect, and where teams are recording delays and improvement opportunities.
                        </SectionIntro>
                        <div className="preview-legend"><span><i className="legend-dot dot-illustrative" /> Illustrative product preview</span><span>Use the left navigation to explore</span></div>
                        <ProductPreview />
                        <p className="under-preview">Sample records shown for demonstration. Jorvellan does not connect to live enterprise systems in this proposed product phase.</p>
                    </div>
                </section>

                <section className="capabilities-section section-pad" id="capabilities">
                    <div className="site-container">
                        <SectionIntro eyebrow="A SHARED OPERATIONAL PICTURE" title={<>Structure the details.<br />Spot what deserves attention.</>}>
                            Give process owners and improvement teams a consistent place to describe the work, capture what they observe, and follow changes through review.
                        </SectionIntro>
                        <div className="capability-grid">
                            <article className="capability-card"><span className="card-index">01 / DOCUMENT</span><span className="capability-icon icon-registry">▤</span><h3>Process registry</h3><p>Keep owners, departments, categories, status and review dates together in a searchable process record.</p><span className="capability-foot">OWNERSHIP · VERSION · REVIEW</span></article>
                            <article className="capability-card"><span className="card-index">02 / MAP</span><span className="capability-icon icon-map">⌘</span><h3>Workflow stages</h3><p>Lay out stages, tasks and dependencies. Make handoffs and stage ownership easier to discuss.</p><span className="capability-foot">STAGES · TASKS · DEPENDENCIES</span></article>
                            <article className="capability-card"><span className="card-index">03 / OBSERVE</span><span className="capability-icon icon-performance">⌁</span><h3>Performance signals</h3><p>Record planned and observed duration, completion patterns, delays and recurring issues.</p><span className="capability-foot">DURATION · COMPLETION · DELAYS</span></article>
                            <article className="capability-card"><span className="card-index">04 / IMPROVE</span><span className="capability-icon icon-improve">↗</span><h3>Bottlenecks & actions</h3><p>Track potential causes and improvement ideas with an owner, priority, target date and outcome.</p><span className="capability-foot">CAUSE · PRIORITY · OUTCOME</span></article>
                            <article className="capability-card"><span className="card-index">05 / REVIEW</span><span className="capability-icon icon-insight">✳</span><h3>Insight review</h3><p>Keep suggested observations linked to their process. Let a reviewer edit, approve or reject them.</p><span className="capability-foot">HUMAN REVIEW · TRACEABLE DECISIONS</span></article>
                            <article className="capability-card"><span className="card-index">06 / LEARN</span><span className="capability-icon icon-history">◷</span><h3>Change history</h3><p>Follow process updates and improvement activity over time, with a record people can revisit.</p><span className="capability-foot">SEARCH · FILTERS · ACTIVITY</span></article>
                        </div>
                    </div>
                </section>

                <section className="method-section section-pad" id="approach">
                    <div className="site-container method-layout">
                        <div className="method-lead"><p className="eyebrow eyebrow-light">A PRACTICAL OPERATING RHYTHM</p><h2>Understand the work.<br /><em>Improve it together.</em></h2><p>Jorvellan is designed to support a disciplined improvement loop. Teams bring the process knowledge; the workspace helps keep it visible and reviewable.</p><a href="#contact" className="text-link text-link-light">Talk through your use case <Arrow /></a></div>
                        <div className="method-steps">
                            <article className="method-step"><span>01</span><div><h3>Document</h3><p>Capture the process, owner, department and current version.</p></div><b>↗</b></article>
                            <article className="method-step"><span>02</span><div><h3>Map</h3><p>Describe stages, tasks, dependencies and handoffs.</p></div><b>↗</b></article>
                            <article className="method-step"><span>03</span><div><h3>Review</h3><p>Record performance observations, bottlenecks and proposed insights.</p></div><b>↗</b></article>
                            <article className="method-step"><span>04</span><div><h3>Improve</h3><p>Assign actions, track decisions and revisit outcomes.</p></div><b>↗</b></article>
                        </div>
                    </div>
                </section>

                <section className="solutions-section section-pad" id="solutions">
                    <div className="site-container">
                        <SectionIntro eyebrow="MADE FOR THE PEOPLE BEHIND THE PROCESS" title={<>A useful view for every<br />improvement conversation.</>}>
                            Bring operational detail and improvement decisions closer together, across teams that need a shared understanding of how work moves.
                        </SectionIntro>
                        <div className="solutions-grid">
                            <article className="solution-card solution-featured"><span className="solution-symbol">↗</span><p>01 / OPERATIONS LEADERS</p><h3>See where attention<br />may be needed.</h3><span>Bring active processes, recorded delays, open improvements and pending reviews into one working view.</span></article>
                            <article className="solution-card"><span className="solution-symbol">⌘</span><p>02 / PROCESS ANALYSTS</p><h3>Keep process knowledge<br />structured.</h3><span>Maintain consistent process records, stage maps, dependencies and review history.</span></article>
                            <article className="solution-card"><span className="solution-symbol">◎</span><p>03 / TRANSFORMATION TEAMS</p><h3>Move improvement<br />work forward.</h3><span>Connect bottlenecks to proposed actions, accountable owners, priorities and outcomes.</span></article>
                            <article className="solution-card"><span className="solution-symbol">✳</span><p>04 / REVIEWERS</p><h3>Keep people in<br />the decision loop.</h3><span>Review, edit, approve or reject suggested insights with traceable process context.</span></article>
                        </div>
                    </div>
                </section>

                <section className="architecture-section section-pad">
                    <div className="site-container architecture-layout">
                        <div className="architecture-copy">
                            <p className="eyebrow">A GROUNDED TECHNICAL FOUNDATION</p>
                            <h2>Built around clear records<br />and accountable review.</h2>
                            <p>The proposed application architecture pairs a responsive Laravel web application with a SQL data layer and role-based access. Process data stays structured, while suggested insights remain reviewable records.</p>
                            <div className="architecture-tags"><span>Laravel / PHP</span><span>SQL database</span><span>Role-based access</span><span>Responsive web app</span></div>
                        </div>
                        <div className="architecture-diagram" aria-label="Proposed application architecture">
                            <div className="architecture-layer layer-people"><span className="layer-icon">◎</span><span><b>Operations teams</b><small>Managers · Analysts · Reviewers</small></span></div>
                            <span className="connector connector-one" aria-hidden="true">↓</span>
                            <div className="architecture-layer layer-app"><span className="layer-icon">J</span><span><b>Jorvellan workspace</b><small>Registry · Workflow · Review · History</small></span></div>
                            <span className="connector connector-two" aria-hidden="true">↓</span>
                            <div className="architecture-layer layer-data"><span className="layer-icon">▤</span><span><b>Structured SQL records</b><small>Processes · Stages · Signals · Actions</small></span></div>
                            <p>PROPOSED APPLICATION ARCHITECTURE</p>
                        </div>
                    </div>
                </section>

                <section className="ai-section section-pad">
                    <div className="site-container ai-shell">
                        <div className="ai-intro"><p className="eyebrow eyebrow-light">A FUTURE TECHNOLOGY DIRECTION</p><h2>AI can assist the work.<br /><em>People stay accountable.</em></h2><p>NVIDIA technologies are being considered for a future phase of process documentation and insight generation. They are proposed options, not current integrations.</p></div>
                        <div className="ai-tech-grid">
                            <article><span>01</span><h3>NeMo</h3><p>Proposed foundation for language-model-assisted process documentation and insight generation.</p><small>PROPOSED OPTION</small></article>
                            <article><span>02</span><h3>NIM</h3><p>Potential deployment option for supported AI inference services in a future architecture.</p><small>PROPOSED OPTION</small></article>
                            <article><span>03</span><h3>RAPIDS</h3><p>Potential GPU-accelerated processing option for structured process data.</p><small>PROPOSED OPTION</small></article>
                            <article><span>04</span><h3>Triton</h3><p>Potential model-serving option for compatible AI workloads.</p><small>PROPOSED OPTION</small></article>
                        </div>
                        <p className="ai-disclaimer">No live AI inference, process mining from enterprise systems, automated monitoring or workflow execution is represented here. NVIDIA and its technologies are referenced only as proposed architectural options; no integration, certification or endorsement is implied.</p>
                    </div>
                </section>

                <section className="governance-section section-pad">
                    <div className="site-container governance-layout">
                        <div><p className="eyebrow">ENTERPRISE READINESS STARTS WITH GOVERNANCE</p><h2>Visible decisions.<br /><em>Reviewable changes.</em></h2><p className="governance-copy">Process improvement works best when people can understand what changed, who reviewed it and what happened next.</p></div>
                        <div className="governance-list">
                            <div><span className="governance-check">✓</span><span><b>Role-based access</b><small>Administrator, Process Manager, Analyst and Reviewer roles.</small></span></div>
                            <div><span className="governance-check">✓</span><span><b>Human review for AI suggestions</b><small>Reviewers can edit, approve or reject suggested observations.</small></span></div>
                            <div><span className="governance-check">✓</span><span><b>Process change history</b><small>Keep process updates and improvement activity traceable.</small></span></div>
                            <div><span className="governance-check">✓</span><span><b>Structured, validated records</b><small>Keep ownership, priorities and outcomes clear and consistent.</small></span></div>
                        </div>
                    </div>
                </section>

                <section className="contact-section" id="contact">
                    <div className="site-container contact-layout">
                        <div><p className="eyebrow eyebrow-light">START WITH THE WAY WORK HAPPENS</p><h2>Let’s make your<br />processes <em>clearer.</em></h2><p>Talk with Jorvellan about process discovery, workflow visibility or your operations improvement goals.</p></div>
                        <div className="contact-details">
                            <div className="contact-office"><span>COLOMBO · SRI LANKA</span><b>Jorvellan (Pvt) Ltd</b><a href="tel:+94112346789">+94 11 234 6789 <Arrow /></a><small>3rd Floor, No. 186, Nawala Road<br />Nawala, Sri Jayawardenepura Kotte</small></div>
                            <div className="contact-office"><span>SAN FRANCISCO · UNITED STATES</span><b>Jorvellan Inc.</b><a href="tel:+14155550148">+1 415-555-0148 <Arrow /></a><small>Suite 520, 5th Floor, 680 Folsom Street<br />San Francisco, CA 94107</small></div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="site-footer">
                <div className="site-container footer-main"><Brand light /><p>AI process discovery & workflow intelligence<br />for enterprise operations.</p><a href="#top" className="back-top">Back to top ↑</a></div>
                <div className="site-container footer-bottom"><span>© 2026 Jorvellan. All rights reserved.</span><span>Founded 21 August 2023 · Sri Lanka & United States</span><span>Proposed product concept</span></div>
            </footer>
        </div>
    );
}

createRoot(document.getElementById('app')).render(<App />);
