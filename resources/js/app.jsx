import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../css/app.css';

const COOKIE_CONSENT_STORAGE_KEY = 'jorvellan.cookie-consent.v1';

function readCookieConsent() {
    try {
        const savedChoice = JSON.parse(window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY) || 'null');
        return ['all', 'essential'].includes(savedChoice?.choice) ? savedChoice.choice : null;
    } catch {
        return null;
    }
}

const sampleProcesses = [
    { name: 'Customer onboarding', department: 'Customer operations', stages: 8, status: 'Needs review', tone: 'amber' },
    { name: 'Invoice to payment', department: 'Finance', stages: 6, status: 'Active', tone: 'green' },
    { name: 'Supplier approval', department: 'Procurement', stages: 7, status: 'Bottleneck', tone: 'rose' },
];

let turnstileScriptPromise;

function loadTurnstileScript() {
    if (window.turnstile) {
        return Promise.resolve();
    }

    if (!turnstileScriptPromise) {
        turnstileScriptPromise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
            script.async = true;
            script.defer = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    return turnstileScriptPromise;
}

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

function WorkspaceAnnotations() {
    return <div className="preview-annotation-bar" aria-label="Workspace areas illustrated in the sample">
        <span><i>01</i><b>Process context</b><small>Owner · version</small></span>
        <span><i>02</i><b>Workflow movement</b><small>Stages · handoffs</small></span>
        <span><i>03</i><b>Reviewed improvement</b><small>Observations · actions</small></span>
    </div>;
}

const featureGroups = [
    {
        number: '01',
        label: 'DOCUMENT + MAP',
        title: 'Establish a shared process view.',
        intro: 'Give teams a consistent starting point for understanding responsibilities and how work moves.',
        items: [
            ['Process registry', 'Record owner, department, category, status, version and review date so teams can find the right process definition.'],
            ['Workflow maps', 'Describe stages, tasks, dependencies, expected durations and owners to make handoffs easier to follow.'],
        ],
    },
    {
        number: '02',
        label: 'OBSERVE + PRIORITIZE',
        title: 'Make recorded issues easier to discuss.',
        intro: 'Bring manually entered observations and improvement work into a useful operational view.',
        items: [
            ['Performance observations', 'Add duration, completion or recurring issue notes with the process context attached.'],
            ['Bottlenecks and improvements', 'Track a potential cause, its priority, an owner, target date, status and outcome.'],
            ['Operations dashboard', 'Review process summaries, delayed stages and pending work from one overview.'],
        ],
    },
    {
        number: '03',
        label: 'REVIEW + FOLLOW THROUGH',
        title: 'Keep decisions with the people responsible.',
        intro: 'Make suggested insights reviewable and leave a useful trail as the team follows up.',
        items: [
            ['Insight review', 'Let a person assess and decide whether a suggested observation belongs in the process record.'],
            ['Search and filters', 'Find process and workflow records by their recorded details.'],
            ['Activity history', 'See a record of process and improvement changes for teams to review.'],
        ],
    },
];

const workflowSteps = [
    ['01', 'Document', 'Capture the process purpose, owner, department and current version.'],
    ['02', 'Map', 'Describe stages, tasks, dependencies, expected duration and handoffs.'],
    ['03', 'Observe', 'Add available performance notes and recurring issues using recorded information.'],
    ['04', 'Review together', 'People assess observations and potential insights before acting on them.'],
    ['05', 'Track improvement', 'Assign an owner and status, then record the outcome or what the team learned.'],
];

const marketingPages = {
    product: { eyebrow: 'THE JORVELLAN WORKSPACE', title: <>A clearer view of<br />work in motion.</>, intro: 'Bring process records, workflow stages, observations and improvement actions together in one structured workspace.', action: 'Open your workspace', actionHref: '/dashboard' },
    features: { eyebrow: 'CAPABILITIES', title: <>Connected capabilities<br />for process improvement.</>, intro: 'See how process records, manually recorded observations and human review can support a clearer improvement workflow.' },
    about: { eyebrow: 'ABOUT JORVELLAN', title: <>Process clarity<br />starts with people.</>, intro: 'Jorvellan exists to help enterprise operations teams make process knowledge easier to understand, review and improve.' },
    contact: { eyebrow: 'CONTACT', title: <>Start a conversation<br />about your operations.</>, intro: 'Choose the office closest to your team, call directly, or send a note to our support team.' },
    'how-it-works': { eyebrow: 'A PEOPLE-LED IMPROVEMENT FLOW', title: <>From process record<br />to tracked improvement.</>, intro: 'Move from documenting and mapping work to recording observations, reviewing them together and tracking what changes.' },
    terms: { eyebrow: 'WEBSITE TERMS', title: <>Terms of use</>, intro: 'These terms explain the use of the Jorvellan website, illustrative product materials, and simulated checkout.' },
    privacy: { eyebrow: 'YOUR INFORMATION', title: <>Privacy policy</>, intro: 'This policy explains the information Jorvellan receives through its website, contact form, and simulated checkout.' },
};

function AddressCards() {
    const offices = [
        {
            country: 'Sri Lanka',
            company: 'Jorvellan (Pvt) Ltd',
            address: <>3rd Floor, No. 186, Nawala Road<br />Nawala, Sri Jayawardenepura Kotte<br />Sri Lanka</>,
            mapUrl: 'https://www.google.com/maps/search/?api=1&query=3rd+Floor%2C+No.+186%2C+Nawala+Road%2C+Nawala%2C+Sri+Jayawardenepura+Kotte%2C+Sri+Lanka',
            phone: '+94 11 234 6789',
            phoneUrl: 'tel:+94112346789',
        },
        {
            country: 'United States',
            company: 'Jorvellan Inc.',
            address: <>Suite 520, 5th Floor<br />680 Folsom Street<br />San Francisco, CA 94107</>,
            mapUrl: 'https://www.google.com/maps/search/?api=1&query=Suite+520%2C+5th+Floor%2C+680+Folsom+Street%2C+San+Francisco%2C+CA+94107',
            phone: '+1 415-555-0148',
            phoneUrl: 'tel:+14155550148',
        },
    ];

    return <div className="address-grid">{offices.map((office) => <article className="info-card office-card" key={office.country}>
        <p className="eyebrow">{office.country.toUpperCase()} OFFICE</p>
        <h3>{office.company}</h3>
        <a className="office-address" href={office.mapUrl} target="_blank" rel="noreferrer" aria-label={`Open ${office.country} office address in Google Maps`}><span>{office.address}</span><small>Open in Google Maps <span aria-hidden="true">↗</span></small></a>
        <a className="office-phone" href={office.phoneUrl} aria-label={`Call ${office.country} office at ${office.phone}`}>{office.phone}<Arrow /></a>
    </article>)}</div>;
}

function MarketingPage({ page, portalData = {} }) {
    const content = marketingPages[page];
    const [contactVerified, setContactVerified] = useState(false);
    if (page === 'terms' || page === 'privacy') {
        return <main className="legal-page"><section className="page-hero legal-hero"><div className="site-container"><p className="eyebrow">{content.eyebrow}</p><h1>{content.title}</h1><p>{content.intro}</p><div className="draft-notice">Draft for Jorvellan legal review · Confirm details before publication</div></div></section><article className="legal-copy site-container">
            <p className="legal-updated">Last updated: 11 November 2026 · Jorvellan is a product concept; these pages should receive jurisdiction-specific legal review before launch.</p>
            {page === 'terms' ? <>
                <h2>1. Who operates the website</h2><p>The Jorvellan website is operated by Jorvellan, with company entities Jorvellan (Pvt) Ltd in Sri Lanka and Jorvellan Inc. in the United States. Jorvellan was founded on 21 August 2023. Contact details for both offices appear below and on the <a href="/contact">Contact page</a>.</p>
                <h2>2. Website and product materials</h2><p>The website provides company information and describes a process discovery and workflow intelligence product for enterprise operations. Marketing screenshots and sample records are illustrative. Account holders can create and manage actual workspace records for their own use; those records are not connected to external enterprise systems.</p>
                <h2>3. Personal workspace</h2><p>A registered account receives a private personal workspace. You are responsible for information you add, maintaining accurate records, and keeping your credentials secure. Workspaces are not shared with other users and currently have no organization or team roles. Rule-based reminders identify records that may need attention; they do not create or change records automatically. The workspace does not connect to enterprise systems or perform live monitoring, AI inference, or workflow execution.</p>
                <h2>4. Draft pricing and simulated checkout</h2><p>Pricing displayed on the site is draft pricing for discussion and is not an offer to sell or a binding subscription quote. The checkout is a simulation that creates a demo record only. It does not contact a bank, card network, processor, or payment gateway, authorize or charge a card, create an enforceable paid subscription, or automatically renew a service. Any real commercial service would require separate written terms and an actual payment arrangement. Do not use a real card.</p>
                <h2>5. Permitted use</h2><p>You may use the public website for lawful informational and business purposes. You agree not to misuse the site, probe or bypass access controls, disrupt service, introduce malicious code, scrape or overload the service, misrepresent sample information as real, or infringe another person’s rights.</p>
                <h2>6. Intellectual property</h2><p>Unless identified otherwise, Jorvellan owns or is authorized to use the website text, brand marks, layout and original visual materials. You may view the website and share links to it. No ownership transfer or broader licence is granted. Third-party names and marks remain the property of their owners; their mention does not imply affiliation or endorsement.</p>
                <h2>7. Availability and changes</h2><p>We may update, suspend or remove website pages or workspace features. We aim to keep materials useful but do not promise that they will always be complete, current, uninterrupted, or error-free. We may revise these terms by publishing an updated version and date on this page.</p>
                <h2>8. No professional advice or service commitment</h2><p>Website content and replies from the AI website assistant are general information that may be incomplete or inaccurate, not legal, financial, security, operational or other professional advice. Teams should independently validate process information and obtain appropriate advice before making decisions. The workspace and product descriptions do not create a service-level commitment, implementation obligation, warranty, or customer relationship.</p>
                <h2>9. Third-party websites</h2><p>The site may link to third-party websites, including map services. Those services are operated by others and are governed by their own terms and privacy practices. Jorvellan does not control or endorse all content on linked sites.</p>
                <h2>10. Responsibility and governing law</h2><p>To the extent permitted by applicable law, Jorvellan is not responsible for indirect or consequential loss arising from use of this informational website or its workspace records. Nothing in these terms limits liability that cannot legally be limited or excludes rights that cannot be excluded. The governing law and contracting entity for any future paid service will be stated in separate service terms. These website terms do not choose a governing law for a future customer agreement.</p>
                <h2>11. Contact</h2><p>Questions about these terms: <a href="mailto:support@jorvellan.net">support@jorvellan.net</a>. Sri Lanka: Jorvellan (Pvt) Ltd, 3rd Floor, No. 186, Nawala Road, Nawala, Sri Jayawardenepura Kotte, Sri Lanka; +94 11 234 6789. United States: Jorvellan Inc., Suite 520, 5th Floor, 680 Folsom Street, San Francisco, CA 94107, USA; +1 415-555-0148.</p>
            </> : <>
                <h2>1. About this policy</h2><p>This policy describes information handled through jorvellan.net, account registration and sign-in, personal workspaces, the contact form, and simulated checkout. Workspace records are stored in the application database and associated with the account that created them.</p>
                <h2>2. Who is responsible</h2><p>Jorvellan operates through Jorvellan (Pvt) Ltd in Sri Lanka and Jorvellan Inc. in the United States. The relevant Jorvellan entity handles website inquiries and coordinates a response. For questions about the entity responsible for a particular interaction, contact <a href="mailto:support@jorvellan.net">support@jorvellan.net</a>.</p>
                <h2>3. Information you provide</h2><p>Account registration collects your name and email address, and stores a password hash; Google sign-in also receives a Google account identifier and basic profile information. Workspace records you add, including process details, workflow stages, observations, improvement actions and activity history, are stored and scoped to your account. The contact form asks for your name, email address and message; company, phone and subject are optional. Simulated checkout collects name, email and optional company information. The AI website assistant sends the messages and recent conversation you provide to Groq to generate replies; chat history stays in the current page and is not saved to a Jorvellan database. Avoid submitting sensitive information to the public chat.</p>
                <h2>4. Simulated card information</h2><p>Paid-plan demo checkout asks for a card number, expiry date and security code only to validate the format and demonstrate a successful flow. No payment processor or bank is contacted and no charge or authorization occurs. The application records only a simulated status, amount, card brand and last four digits. The full card number, expiry date and security code are not saved in the application database or session. Use the provided 4242 test card pattern or another Luhn-valid test number; do not enter a real card.</p>
                <h2>5. How we use information</h2><p>We use account information to provide sign-in, account recovery, optional email verification and workspace access. Workspace data is used to display and organize records you enter, create activity history and show rule-based reminders for records that may need review. These rules do not create content or change records automatically. Contact details and messages are used to respond to inquiries and maintain an inquiry record. Simulated checkout information supports the no-charge confirmation flow. Cloudflare Turnstile may process technical and browser signals to help distinguish people from automated traffic. We do not use workspace data to make automated decisions about you.</p>
                <h2>6. Cookies, logs and security</h2><p>The site uses the session and security mechanisms needed for navigation, form protection, validation feedback and the simulated checkout confirmation. Your browser stores your cookie choice locally so you can change it later. The web host and application may process technical request data, such as IP address, browser details, timestamps and error records, to deliver and secure the site. Cloudflare provides Turnstile verification under its own privacy terms; see <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noreferrer">Cloudflare’s Privacy Policy</a>. No analytics or advertising cookies are currently enabled.</p>
                <h2>7. Email and AI service providers</h2><p>Contact messages are stored in the application database and sent to support@jorvellan.net through the configured email service. Chat questions and recent conversation context are sent to Groq to generate replies; Jorvellan does not intentionally store chat transcripts. Groq says inference requests are not retained by default but may be temporarily logged for service reliability or abuse investigation. See <a href="https://console.groq.com/docs/your-data" target="_blank" rel="noreferrer">Groq’s API data controls</a> and <a href="https://groq.com/privacy-policy" target="_blank" rel="noreferrer">Privacy Policy</a> for current provider practices. Hosting, infrastructure and email providers may also process information on Jorvellan’s behalf to operate the site.</p>
                <h2>8. Retention</h2><p>Account and workspace records are kept in the application database while the account remains available. Contact and simulated checkout records are retained as needed to handle inquiries, operate the website, maintain business records, protect the service, or meet legal obligations. Contact support to request account or record deletion; a fixed retention schedule has not been set.</p>
                <h2>9. International handling</h2><p>Jorvellan has offices in Sri Lanka and the United States. Depending on the hosting and email configuration, information may be handled in either country or in other locations used by service providers. Contact us for details relevant to a particular inquiry.</p>
                <h2>10. Your choices and requests</h2><p>You may contact us to ask about, correct or request deletion of information you submitted. Applicable rights and response timelines vary by location and law. We may need to verify your request and retain limited records when required or permitted by law. Send requests to <a href="mailto:support@jorvellan.net">support@jorvellan.net</a> or use the <a href="/contact">contact form</a>.</p>
                <h2>11. Children</h2><p>This business website and operations product concept are intended for business audiences, not children. Do not submit information about a child through the site.</p>
                <h2>12. Changes and contact details</h2><p>We may update this policy when the site or its data handling changes. The latest version and effective date will appear on this page. Privacy questions: <a href="mailto:support@jorvellan.net">support@jorvellan.net</a>. Sri Lanka: Jorvellan (Pvt) Ltd, 3rd Floor, No. 186, Nawala Road, Nawala, Sri Jayawardenepura Kotte, Sri Lanka; +94 11 234 6789. United States: Jorvellan Inc., Suite 520, 5th Floor, 680 Folsom Street, San Francisco, CA 94107, USA; +1 415-555-0148.</p>
            </>}
        </article></main>;
    }

    return <main className="marketing-page">
        <section className={`page-hero page-hero-${page}`}><div className="site-container page-hero-grid"><div><p className="eyebrow">{content.eyebrow}</p><h1>{content.title}</h1><p className="page-lede">{content.intro}</p>{content.action && <a className="button button-mint" href={content.actionHref}>{content.action}<Arrow /></a>}</div>{page !== 'contact' && <div className={`page-hero-art page-hero-art-${page}`} aria-hidden="true">
            {page === 'product' && <><div className="page-art-orbit orbit-one"/><div className="page-art-orbit orbit-two"/><span>J</span><small>OPERATIONS<br />INTELLIGENCE</small></>}
            {page === 'features' && <div className="hero-capability-list"><span>Process registry</span><span>Workflow maps</span><span>Insight review</span></div>}
            {page === 'about' && <div className="hero-founder-mark"><span>J</span><small>FOUNDED<br /><b>21 AUG 2023</b></small></div>}
            {page === 'how-it-works' && <div className="hero-flow-list"><span>Document</span><span>Map</span><span>Observe</span><span>Review</span><span>Improve</span></div>}
        </div>}</div></section>
        {page === 'product' && <>
            <section className="section-space product-concept-section"><div className="site-container">
                <SectionHeading eyebrow="PRODUCT CONCEPT · ILLUSTRATIVE SAMPLE DATA" title="One workspace for the records behind a process." text="This proposed workspace shows how ownership, workflow stages, observations and improvement actions could be reviewed together. Every record and figure in the preview is illustrative." />
                <WorkspaceAnnotations />
                <div className="preview-caption"><span><i /> PRODUCT CONCEPT PREVIEW · SAMPLE DATA</span><span>Explore the sample workspace tabs</span></div>
                <div className="product-showcase"><DashboardPreview /></div>
                <div className="detail-grid product-records"><article className="info-card"><span>01 / UNDERSTAND</span><h3>Process context</h3><p>Keep ownership, departments and versions attached to the process definition.</p></article><article className="info-card"><span>02 / CONNECT</span><h3>Workflow movement</h3><p>Describe stages, tasks, dependencies and handoffs across teams.</p></article><article className="info-card"><span>03 / IMPROVE</span><h3>Human-reviewed actions</h3><p>Record observations and improvement opportunities with accountable owners.</p></article></div>
                <div className="product-demo-cta"><div><p className="eyebrow">YOUR PRIVATE WORKSPACE</p><h2>Start with your own process records.</h2><p>Create a personal workspace, document a process and build its workflow map as your team learns.</p></div><a className="button button-mint" href="/dashboard">Open your workspace <Arrow /></a></div>
                <div className="product-pricing-link"><span>Evaluating a future plan?</span><a className="inline-link" href="/pricing">See draft pricing <Arrow /></a></div>
            </div></section>
            <section className="tech-section section-space"><div className="site-container"><SectionHeading eyebrow="PROPOSED PRODUCT STACK" title="AI process discovery for enterprise operations." text="A possible technical direction for a future phase, using NVIDIA NeMo, NIM, RAPIDS and Triton. These are research options, not current integrations or capabilities in the Jorvellan concept." /><div className="tech-grid">{[['NVIDIA NeMo','A potential option for future model development and evaluation.'],['NVIDIA NIM','A possible model-serving approach to assess in a later architecture.'],['NVIDIA RAPIDS','Potential components for future accelerated data exploration.'],['NVIDIA Triton','A possible inference-serving option to evaluate in a future phase.']].map(([name,desc])=><article className="tech-card" key={name}><small>PROPOSED OPTION · NOT INTEGRATED</small><h3>{name}</h3><p>{desc}</p></article>)}</div><p className="scope-note">Jorvellan does not currently represent any NVIDIA integration, certification or endorsement, live AI inference, or automated workflow execution.</p></div></section>
        </>}
        {page === 'features' && <section className="section-space feature-groups-section"><div className="site-container"><div className="feature-group-grid">{featureGroups.map((group) => <article className="feature-group" key={group.number}><div className="feature-group-heading"><span>{group.number}</span><p className="eyebrow">{group.label}</p><h2>{group.title}</h2><p className="feature-group-intro">{group.intro}</p></div><ul>{group.items.map(([title, description]) => <li key={title}><h3>{title}</h3><p>{description}</p></li>)}</ul></article>)}</div><p className="scope-note">Jorvellan is a product concept. Records and observations are entered or prepared as sample data; live process mining, integrations, automatic monitoring, live AI inference and automatic workflow execution are not included.</p></div></section>}
        {page === 'how-it-works' && <section className="section-space workflow-section"><div className="site-container"><SectionHeading eyebrow="A CONNECTED, PEOPLE-LED FLOW" title="Each step gives the next one useful context." text="Start from documented process information, add a clear map and observations, then let the people responsible review potential improvements and track follow-through."/><ol className="workflow-flow">{workflowSteps.map(([number, title, description]) => <li key={number}><span className="workflow-step-number">{number}</span><div><h3>{title}</h3><p>{description}</p></div></li>)}</ol><p className="scope-note">The initial concept uses information entered by people or prepared as sample data. It does not connect to enterprise systems or automatically monitor live workflows. Any suggested insight requires human review.</p></div></section>}
        {page === 'about' && <section className="section-space about-purpose-section"><div className="site-container about-detail"><div className="about-purpose"><SectionHeading eyebrow="OUR PURPOSE" title="Help teams understand how work moves, then improve it together." text="Jorvellan focuses on making process knowledge easier to document, connect and review, so operations teams can discuss changes with a shared understanding."/><p className="about-founder">Founded by <strong>Aadhirayan Thamilini</strong></p><p className="about-origin">Jorvellan was founded on 21 August 2023, with company entities in Sri Lanka and the United States.</p></div><div className="about-facts"><div><small>FOUNDED</small><strong>21 August 2023</strong></div><div><small>SRI LANKA ENTITY</small><strong>Jorvellan (Pvt) Ltd</strong></div><div><small>UNITED STATES ENTITY</small><strong>Jorvellan Inc.</strong></div></div></div><div className="site-container about-offices"><SectionHeading eyebrow="OUR LOCATIONS" title="Two offices, one shared purpose." text="Reach the office nearest to your team for a conversation about Jorvellan."/><AddressCards /></div></section>}
        {page === 'contact' && <section className="section-space"><div className="site-container"><p className="page-lede contact-lede">Choose a location below to open the address in a map or call the office directly.</p><AddressCards /><div className="contact-layout"><div className="contact-followup"><h2>Send a note to our team</h2><p>Tell us what your team is trying to understand or improve. We’ll route your note to Jorvellan Support.</p><a className="contact-support-email" href="mailto:support@jorvellan.net">support@jorvellan.net <Arrow /></a><p className="contact-data-note">Your message and the details you submit are stored so our team can respond. See our <a href="/privacy">Privacy Policy</a>.</p></div><form className="contact-form" action="/contact" method="post">
            <input type="hidden" name="_token" value={document.querySelector('meta[name="csrf-token"]')?.content || ''} />
            {portalData.contactSuccess && <p className="form-notice success" role="status">{portalData.contactSuccess}</p>}
            {portalData.contactDeliveryError && <p className="form-notice error" role="alert">{portalData.contactDeliveryError}</p>}
            {Object.keys(portalData.errors || {}).length > 0 && <p className="form-notice error" role="alert">Please check the highlighted fields and try again.</p>}
            <div className="form-field-pair"><label>Your name<input name="name" autoComplete="name" defaultValue={portalData.old?.name || ''} required maxLength="120" aria-invalid={Boolean(portalData.errors?.name)} /><FieldErrors errors={portalData.errors} name="name" /></label><label>Work email<input name="email" type="email" autoComplete="email" defaultValue={portalData.old?.email || ''} required maxLength="190" aria-invalid={Boolean(portalData.errors?.email)} /><FieldErrors errors={portalData.errors} name="email" /></label></div>
            <div className="form-field-pair"><label>Company <span>Optional</span><input name="company" autoComplete="organization" defaultValue={portalData.old?.company || ''} maxLength="160" /><FieldErrors errors={portalData.errors} name="company" /></label><label>Phone <span>Optional</span><input name="phone" type="tel" autoComplete="tel" defaultValue={portalData.old?.phone || ''} maxLength="40" /><FieldErrors errors={portalData.errors} name="phone" /></label></div>
            <label>Subject <span>Optional</span><input name="subject" defaultValue={portalData.old?.subject || ''} maxLength="180" /><FieldErrors errors={portalData.errors} name="subject" /></label>
            <label>How can we help?<textarea name="message" minLength="20" maxLength="6000" required rows="6" aria-invalid={Boolean(portalData.errors?.message)}>{portalData.old?.message || ''}</textarea><FieldErrors errors={portalData.errors} name="message" /></label>
            <label className="form-consent"><input name="privacy_acknowledged" type="checkbox" value="1" required /><span>I agree that Jorvellan may use these details to respond to my inquiry. <a href="/privacy">Privacy Policy</a>.</span></label>
            <TurnstileField enabled={portalData.turnstileEnabled} siteKey={portalData.turnstileSiteKey} action="contact" error={portalData.errors?.turnstile?.[0]} onVerified={setContactVerified} />
            <button className="button button-mint" type="submit" disabled={!portalData.turnstileEnabled || !contactVerified}>Send message <Arrow /></button>
        </form></div></div></section>}
        <section className="page-cta"><div className="site-container"><div><p className="eyebrow eyebrow-light">JORVELLAN · ENTERPRISE OPERATIONS</p><h2>Make the next improvement easier to see.</h2></div><a className="button button-mint" href="/contact">Talk with Jorvellan <Arrow /></a></div></section>
    </main>;
}

function formatPrice(cents, currency = 'USD') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(cents / 100);
}

function FieldErrors({ errors, name }) {
    return errors?.[name]?.[0] ? <small className="field-error">{errors[name][0]}</small> : null;
}

function TurnstileField({ enabled, siteKey, action, error, onVerified }) {
    const widgetRef = useRef(null);
    const statusRef = useRef(null);

    useEffect(() => {
        if (!enabled || !siteKey || !widgetRef.current) {
            return undefined;
        }

        let widgetId;
        let disposed = false;
        const setStatus = (message, verified = false) => {
            if (statusRef.current) {
                statusRef.current.textContent = message;
                statusRef.current.classList.toggle('is-complete', verified);
            }
            onVerified(verified);
        };

        loadTurnstileScript().then(() => {
            if (disposed || !widgetRef.current) {
                return;
            }

            widgetId = window.turnstile.render(widgetRef.current, {
                sitekey: siteKey,
                action,
                theme: 'light',
                size: 'flexible',
                callback: () => setStatus('Security check complete.', true),
                'expired-callback': () => setStatus('Security check expired. Complete it again to continue.'),
                'error-callback': (errorCode) => {
                    const code = String(errorCode ?? '').replace(/[^0-9]/g, '').slice(0, 12);
                    setStatus(`Security check could not load${code ? ` (code ${code})` : ''}. Refresh the page or try another network.`);
                },
            });
        }).catch(() => {
            setStatus('Security check could not load. Refresh the page or try another network.');
        });

        return () => {
            disposed = true;
            if (widgetId !== undefined && window.turnstile) {
                window.turnstile.remove(widgetId);
            }
        };
    }, [action, enabled, onVerified, siteKey]);

    if (!enabled || !siteKey) {
        return <div className="turnstile-unavailable" role="status">Security verification is being configured. You can reach us at <a href="mailto:support@jorvellan.net">support@jorvellan.net</a>.</div>;
    }

    return <div className="turnstile-field">
        <div className="cf-turnstile" ref={widgetRef} />
        <p className="turnstile-status" ref={statusRef} role="status" aria-live="polite"><span className="turnstile-spinner" aria-hidden="true" />Loading security check…</p>
        {error && <small className="field-error">{error}</small>}
    </div>;
}

function PortalScreen({ page, data }) {
    const processes = data.processes || [];
    const [section, setSection] = useState('overview');
    const [selectedProcess, setSelectedProcess] = useState(processes[0]?.name || '');
    const [checkoutVerified, setCheckoutVerified] = useState(false);

    if (page === 'pricing') {
        return <main className="portal-page"><section className="portal-hero"><div className="site-container"><p className="eyebrow">DRAFT PLAN OPTIONS</p><h1>Choose a starting point.</h1><p>These proposed monthly prices are illustrative planning figures. Checkout is a no-charge simulation; no paid service is activated.</p><span className="simulation-note">Draft pricing · For discussion only · No payment processing</span></div></section><section className="site-container pricing-grid-section"><div className="pricing-grid">{(data.plans || []).map((plan) => <article className={`pricing-card${plan.slug === 'team' ? ' featured' : ''}`} key={plan.id}><p className="eyebrow">{plan.audience}</p><h2>{plan.name}</h2><p className="pricing-summary">{plan.summary}</p><p className="price-line"><strong>{formatPrice(plan.price_cents, plan.currency)}</strong>{plan.price_cents > 0 && <span> / month</span>}</p><ul>{plan.features.map((feature) => <li key={feature}><i aria-hidden="true">✓</i>{feature}</li>)}</ul><a className="button button-mint" href={`/checkout/${plan.slug}`}>{plan.is_demo ? 'Open demo' : 'Try simulated checkout'} <Arrow /></a><small className="plan-simulation">No real payment. Plan and price are drafts.</small></article>)}</div><p className="pricing-footnote">Prices are draft USD figures for concept review, not an offer or active subscription. A real product and commercial terms are not available through this demo.</p></section></main>;
    }

    if (page === 'checkout' || page === 'checkout-complete') {
        if (page === 'checkout-complete') {
            const subscription = data.subscription;
            return <main className="portal-page"><section className="portal-hero"><div className="site-container"><p className="eyebrow">SIMULATION COMPLETE</p><h1>Your demo flow is ready.</h1><p>No payment was processed. This confirmation records a simulated plan selection for demonstration purposes.</p></div></section><section className="site-container success-wrap"><article className="success-card"><span className="success-mark">✓</span><h2>{subscription.plan.name} demo selected</h2><p>Confirmation reference <strong>{subscription.reference}</strong></p><p>{subscription.customer_name} · {subscription.customer_email}</p><div className="no-charge-callout">No charge · No authorization · No payment gateway · No recurring billing</div><a className="button button-mint" href="/dashboard">Open your workspace <Arrow /></a></article></section></main>;
        }

        const plan = data.plan;
        const errors = data.errors || {};
        const old = data.old || {};
        const hasPaymentFields = !plan.is_demo;
        return <main className="portal-page"><section className="portal-hero checkout-hero"><div className="site-container"><p className="eyebrow">SIMULATED CHECKOUT · {plan.name.toUpperCase()}</p><h1>Review your demo selection.</h1><p>This is a demonstration flow. It creates a database record but never requests a charge or card authorization.</p></div></section><section className="site-container checkout-layout"><form className="checkout-form" action={`/checkout/${plan.slug}`} method="post">
            <input type="hidden" name="_token" value={document.querySelector('meta[name="csrf-token"]')?.content || ''} />
            <div className="checkout-section-heading"><span>01</span><div><h2>Your details</h2><p>Used for this simulated confirmation only.</p></div></div>
            <div className="form-field-pair"><label>Full name<input name="customer_name" autoComplete="name" defaultValue={old.customer_name || ''} required maxLength="120" /> <FieldErrors errors={errors} name="customer_name" /></label><label>Work email<input name="customer_email" type="email" autoComplete="email" defaultValue={old.customer_email || ''} required maxLength="190" /> <FieldErrors errors={errors} name="customer_email" /></label></div>
            <label>Company <span>Optional</span><input name="company" autoComplete="organization" defaultValue={old.company || ''} maxLength="160" /></label>
            {hasPaymentFields && <><div className="checkout-section-heading"><span>02</span><div><h2>Card details</h2><p>Format validation only. Nothing is authorized or charged.</p></div></div><div className="no-charge-callout">Simulation only · Do not use a real card · Test number 4242 4242 4242 4242 is supported.</div>
                <label>Card number<input name="card_number" inputMode="numeric" autoComplete="cc-number" placeholder="4242 4242 4242 4242" required maxLength="37" aria-invalid={Boolean(errors.card_number)} /> <FieldErrors errors={errors} name="card_number" /></label>
                <div className="form-field-pair"><label>Expiry date<input name="card_expiry" inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" required maxLength="5" aria-invalid={Boolean(errors.card_expiry)} /> <FieldErrors errors={errors} name="card_expiry" /></label><label>Security code<input name="card_cvc" inputMode="numeric" autoComplete="cc-csc" placeholder="CVC" required maxLength="4" aria-invalid={Boolean(errors.card_cvc)} /> <FieldErrors errors={errors} name="card_cvc" /></label></div>
            </>}
            {errors.agree && <p className="field-error">{errors.agree[0]}</p>}
            <label className="form-consent"><input name="agree" type="checkbox" value="1" required /><span>I understand this is a no-charge simulation and does not create a paid subscription. Read the <a href="/terms">Terms of Use</a> and <a href="/privacy">Privacy Policy</a>.</span></label>
            <TurnstileField enabled={data.turnstileEnabled} siteKey={data.turnstileSiteKey} action="checkout" error={errors.turnstile?.[0]} onVerified={setCheckoutVerified} />
            <button className="button button-mint" type="submit" disabled={!data.turnstileEnabled || !checkoutVerified}>{plan.is_demo ? 'Open the demo' : 'Complete simulated checkout'} <Arrow /></button>
            <a className="back-link" href="/pricing">← Back to draft plans</a>
        </form><aside className="order-summary"><p className="eyebrow">ORDER SUMMARY</p><h2>{plan.name}</h2><p>{plan.summary}</p><div className="summary-total"><span>Draft plan price</span><strong>{formatPrice(plan.price_cents, plan.currency)}{plan.price_cents > 0 && <small> / month</small>}</strong></div><p className="summary-disclaimer">This amount is illustrative. The simulation does not bill or authorize a payment method. No card information is stored beyond brand and last four digits.</p><a href="/privacy">Read the privacy policy</a></aside></section></main>;
    }

    const stats = data.stats || {};
    const currentProcess = processes.find((process) => process.name === selectedProcess) || processes[0];
    const sections = [['overview', 'Overview'], ['processes', 'Process registry'], ['maps', 'Workflow maps'], ['observations', 'Observations'], ['actions', 'Improvement actions']];

    return <main className="portal-page dashboard-page"><div className="site-container dashboard-intro"><div><p className="eyebrow">READ-ONLY · DATABASE-BACKED SAMPLE</p><h1>Operations workspace</h1><p>Explore fictional process data, workflow steps, observations and improvement work. Records are loaded from this application’s database.</p></div><a className="button button-outline" href="/product">Back to product <Arrow /></a></div><div className="site-container dashboard-shell"><aside className="workspace-nav"><b className="workspace-logo">J <span>JORVELLAN DEMO</span></b><p>WORKSPACE</p>{sections.map(([key, label]) => <button type="button" className={section === key ? 'active' : ''} onClick={() => setSection(key)} key={key}>{label}</button>)}<div className="workspace-nav-note">Illustrative data only<br />No live customer records</div></aside><div className="workspace-content"><div className="workspace-topline"><div><small>JORVELLAN OPERATIONS · SAMPLE</small><h2>{sections.find(([key]) => key === section)?.[1]}</h2></div><span className="demo-badge">DEMO DATA</span></div>
        {section === 'overview' && <><div className="metric-grid">{[['Processes', stats.processes, 'across sample teams'], ['Workflow stages', stats.stages, 'connected to process records'], ['Needs review', stats.reviews, 'observations awaiting people'], ['Open actions', stats.actions_open, `${stats.actions_late} past due`]].map(([label, value, note]) => <article className="metric-card" key={label}><small>{label}</small><strong>{value ?? 0}</strong><span>{note}</span></article>)}</div><div className="workspace-panel"><div className="panel-heading"><div><h3>Process portfolio</h3><p>Owners, operating teams and review state</p></div><span>{stats.departments} departments</span></div><ProcessTable processes={processes} onSelect={(name) => { setSelectedProcess(name); setSection('maps'); }} /></div><div className="workspace-two-col"><div className="workspace-panel"><div className="panel-heading"><div><h3>Recent observations</h3><p>Human review is required</p></div><button type="button" onClick={() => setSection('observations')}>View all</button></div><ObservationList observations={(data.observations || []).slice(0, 4)} /></div><div className="workspace-panel"><div className="panel-heading"><div><h3>Improvement actions</h3><p>Assigned follow-through</p></div><button type="button" onClick={() => setSection('actions')}>View all</button></div><ActionList actions={(data.actions || []).slice(0, 4)} /></div></div></>}
        {section === 'processes' && <div className="workspace-panel"><div className="panel-heading"><div><h3>Process registry</h3><p>Each record includes a purpose, owner, risk level, version and review date.</p></div></div><ProcessTable processes={processes} onSelect={(name) => { setSelectedProcess(name); setSection('maps'); }} /></div>}
        {section === 'maps' && <div className="workspace-panel map-panel"><label className="process-select">Choose a process<select value={currentProcess?.name || ''} onChange={(event) => setSelectedProcess(event.target.value)}>{processes.map((process) => <option key={process.name}>{process.name}</option>)}</select></label>{currentProcess && <><div className="map-process-meta"><p>{currentProcess.department} · Owner: {currentProcess.owner}</p><h3>{currentProcess.name}</h3><p>{currentProcess.purpose}</p></div><div className="stage-list">{currentProcess.stages.map((stage, index) => <article className="stage-card" key={`${currentProcess.name}-${stage.name}`}><span className="stage-index">{String(index + 1).padStart(2, '0')}</span><div><h4>{stage.name}</h4><p>{stage.team} · {stage.status}</p>{stage.handoff_note && <small>{stage.handoff_note}</small>}</div><span className="stage-duration">{stage.observed_minutes} min<small>sample observed</small></span></article>)}</div><p className="chart-disclaimer">Recorded sample durations are illustrative observations, not measurements from a live system.</p></>}</div>}
        {section === 'observations' && <div className="workspace-panel"><div className="panel-heading"><div><h3>Observation register</h3><p>{stats.observations} sample notes · All require team review</p></div></div><ObservationList observations={data.observations || []} detailed /></div>}
        {section === 'actions' && <div className="workspace-panel"><div className="panel-heading"><div><h3>Improvement tracker</h3><p>Proposed actions with owners, priorities and due dates.</p></div></div><ActionList actions={data.actions || []} detailed /></div>}
        <p className="dashboard-data-note">Sample data is fictional. Jorvellan currently does not connect to enterprise systems, perform live monitoring or run AI inference. Dashboard figures are calculated from the demo database.</p>
    </div></div></main>;
}

function ProcessTable({ processes, onSelect }) {
    return <div className="responsive-table"><table><thead><tr><th>Process</th><th>Owner</th><th>Risk</th><th>Status</th><th>Review date</th><th></th></tr></thead><tbody>{processes.map((process) => <tr key={process.name}><td><strong>{process.name}</strong><small>{process.department} · v{process.version}</small></td><td>{process.owner}</td><td><span className={`priority-pill ${process.risk.toLowerCase()}`}>{process.risk}</span></td><td>{process.status}</td><td>{process.last_reviewed}</td><td><button type="button" className="table-action" onClick={() => onSelect(process.name)}>Open map</button></td></tr>)}</tbody></table></div>;
}

function ObservationList({ observations, detailed = false }) {
    return <div className="record-list">{observations.map((observation) => <article className="record-item" key={observation.title}><span className={`priority-pill ${observation.priority.toLowerCase()}`}>{observation.priority}</span><div><h4>{observation.title}</h4><p>{observation.process}{observation.stage ? ` · ${observation.stage}` : ''} · {observation.category}</p>{detailed && <p className="record-detail">{observation.detail}</p>}</div><small>{observation.observed_on}</small></article>)}</div>;
}

function ActionList({ actions, detailed = false }) {
    return <div className="record-list">{actions.map((action) => <article className="record-item action-item" key={action.title}><span className={`action-state ${action.status.toLowerCase().replaceAll(' ', '-')}`}>{action.status}</span><div><h4>{action.title}</h4><p>{action.process} · {action.owner} · Due {action.due_on}</p>{detailed && <><p className="record-detail">{action.description}</p>{action.outcome && <p className="action-outcome">Outcome recorded: {action.outcome}</p>}</>}</div><span className={`priority-pill ${action.priority.toLowerCase()}`}>{action.priority}</span></article>)}</div>;
}

const workspaceNavigation = [
    ['/dashboard', 'Overview'],
    ['/processes', 'Processes'],
    ['/observations', 'Observations'],
    ['/improvements', 'Improvements'],
    ['/search', 'Search'],
    ['/activity', 'Activity'],
];

function CsrfInput() {
    return <input type="hidden" name="_token" value={document.querySelector('meta[name="csrf-token"]')?.content || ''} />;
}

function FormErrors({ errors = {} }) {
    const messages = Object.values(errors).flat();
    return messages.length ? <div className="workspace-errors" role="alert">{messages.map((message, index) => <p key={`${index}-${message}`}>{message}</p>)}</div> : null;
}

function WorkspaceShell({ page, data, children }) {
    const user = data.user || {};
    return <main className="workspace-app">
        <header className="workspace-app-header"><a className="workspace-app-brand" href="/dashboard"><span>J</span>jorvellan</a><form action="/search" method="get" className="workspace-quick-search"><input aria-label="Search workspace" name="q" placeholder="Search your workspace" /><button type="submit" aria-label="Search">⌕</button></form><div className="workspace-account"><span>{user.name || 'Your workspace'}</span><form action="/logout" method="post"><CsrfInput /><button type="submit">Sign out</button></form></div></header>
        <div className="workspace-app-layout"><aside className="workspace-app-nav"><p>YOUR WORKSPACE</p>{workspaceNavigation.map(([href, label]) => <a href={href} key={href} className={page === href || (href === '/processes' && page.startsWith('process')) || (href === '/observations' && page.startsWith('observation')) || (href === '/improvements' && page.startsWith('improvement')) ? 'is-current' : undefined} aria-current={page === href ? 'page' : undefined}><span aria-hidden="true">{({ Overview: '◫', Processes: '▤', Observations: '◎', Improvements: '↗', Search: '⌕', Activity: '◷' })[label]}</span>{label}</a>)}<div className="workspace-nav-help"><strong>Need a starting point?</strong><span>Add one process, then build its stages as you learn.</span><a href="/processes/create">Create a process <Arrow /></a></div></aside><section className="workspace-app-main">
            {!user.email_verified_at && <div className="verification-notice"><span>Your account is ready. Email verification is optional, but helps protect account recovery.</span><form action="/email/verification-notification" method="post"><CsrfInput /><button type="submit">Send verification email</button></form></div>}
            {data.status && <p className="workspace-status" role="status">{data.status}</p>}
            {children}
        </section></div>
    </main>;
}

function AuthScreen({ page, data }) {
    const [password, setPassword] = useState(data.old?.password || '');
    const strengthChecks = [password.length >= 12, /[a-z]/.test(password) && /[A-Z]/.test(password), /\d/.test(password), /[^A-Za-z0-9]/.test(password)];
    const strength = strengthChecks.filter(Boolean).length;
    const reset = page === 'reset-password';
    const register = page === 'register';
    const forgot = page === 'forgot-password';
    const verify = page === 'verify-email';
    const title = register ? 'Create your workspace' : reset ? 'Choose a new password' : forgot ? 'Reset your password' : verify ? 'Verify your email' : 'Welcome back';
    return <main className="auth-page"><a className="auth-brand" href="/"><span>J</span>jorvellan</a><section className="auth-card"><p className="eyebrow">JORVELLAN WORKSPACE</p><h1>{title}</h1><p className="auth-intro">{register ? 'Start with a private space for your process records and improvement work.' : verify ? 'Email verification is optional. Your workspace is available while you decide.' : forgot ? 'We’ll send a secure link if an account matches that email address.' : 'Sign in to continue to your private workspace.'}</p>
        <FormErrors errors={{ ...(data.errors || {}), ...(data.errors?.google ? { google: data.errors.google } : {}) }} />
        {data.status && <p className="workspace-status" role="status">{data.status}</p>}
        {verify ? <><form action="/email/verification-notification" method="post"><CsrfInput /><button className="button button-mint auth-submit" type="submit">Send verification email</button></form><a className="auth-text-link" href="/dashboard">Continue to your workspace</a></> : forgot ? <form action="/forgot-password" method="post" className="auth-form"><CsrfInput /><label>Email address<input name="email" type="email" autoComplete="email" defaultValue={data.old?.email || ''} required /><FieldErrors errors={data.errors} name="email" /></label><button className="button button-mint auth-submit" type="submit">Send reset link <Arrow /></button></form> : <>
            {!reset && <form action="/auth/google" method="get"><button className="google-auth-button" type="submit"><span>G</span>Continue with Google</button></form>}
            {!reset && <div className="auth-divider"><span>or use your email</span></div>}
            <form action={register ? '/register' : reset ? '/reset-password' : '/login'} method="post" className="auth-form">
                <CsrfInput />
                {reset && <><input type="hidden" name="token" value={data.token || ''} /><input type="hidden" name="email" value={data.email || data.old?.email || ''} /></>}
                {register && <label>Your name<input name="name" autoComplete="name" defaultValue={data.old?.name || ''} required maxLength="120" /><FieldErrors errors={data.errors} name="name" /></label>}
                {!reset && <label>Email address<input name="email" type="email" autoComplete="email" defaultValue={data.old?.email || ''} required /><FieldErrors errors={data.errors} name="email" /></label>}
                {reset && <label>Email address<input name="email_display" type="email" autoComplete="email" defaultValue={data.email || data.old?.email || ''} required onChange={(event) => { const hidden = event.currentTarget.form.elements.email; hidden.value = event.target.value; }} /><FieldErrors errors={data.errors} name="email" /></label>}
                <label>Password<input name="password" type="password" autoComplete={register ? 'new-password' : reset ? 'new-password' : 'current-password'} value={register || reset ? password : undefined} onChange={register || reset ? (event) => setPassword(event.target.value) : undefined} required minLength={register || reset ? 12 : undefined} /><FieldErrors errors={data.errors} name="password" /></label>
                {(register || reset) && <><div className="password-strength" aria-live="polite"><div className="password-strength-meter" data-strength={strength}><span style={{ width: `${strength * 25}%` }} /></div><small>{password.length === 0 ? 'Use at least 12 characters' : strength < 2 ? 'Add more variety' : strength < 4 ? 'Good start' : 'Strong password'}</small></div><label>Confirm password<input name="password_confirmation" type="password" autoComplete="new-password" required minLength="12" /><FieldErrors errors={data.errors} name="password_confirmation" /></label></>}
                {!register && !reset && <label className="remember-choice"><input type="checkbox" name="remember" value="1" />Keep me signed in</label>}
                <button className="button button-mint auth-submit" type="submit">{register ? 'Create account' : reset ? 'Update password' : 'Sign in'} <Arrow /></button>
            </form>
            {!register && !reset && <a className="auth-text-link" href="/forgot-password">Forgot password?</a>}
        </>}
        <div className="auth-bottom">{register ? <>Already have an account? <a href="/login">Sign in</a></> : !verify && <>New to Jorvellan? <a href="/register">Create an account</a></>}</div>
        <a className="auth-home-link" href="/">← Back to Jorvellan</a>
    </section></main>;
}

function EmptyState({ title, text, href, action }) {
    return <div className="workspace-empty"><span aria-hidden="true">✳</span><h3>{title}</h3><p>{text}</p>{href && <a className="button button-mint" href={href}>{action} <Arrow /></a>}</div>;
}

function WorkspaceScreen({ page, data }) {
    if (page === 'dashboard') {
        const stats = data.stats || {};
        return <WorkspaceShell page={page} data={data}><div className="workspace-page-heading"><div><p className="eyebrow">YOUR OPERATIONS</p><h1>Workspace overview</h1><p>A clear view of the process records and follow-up work you maintain.</p></div><a href="/processes/create" className="button button-mint">Add a process <Arrow /></a></div>
            <div className="workspace-metrics">{[['Processes', stats.processes], ['Workflow stages', stats.stages], ['Observations to review', stats.reviews], ['Open actions', stats.actions_open]].map(([label, value]) => <article key={label}><small>{label}</small><strong>{value ?? 0}</strong></article>)}</div>
            {data.empty ? <EmptyState title="Your workspace starts here" text="Create a process record to capture its purpose and owner. You can add workflow stages and observations whenever you’re ready." href="/processes/create" action="Create your first process" /> : <>
                {!!data.prompts?.length && <section className="workspace-section"><div className="workspace-section-heading"><div><h2>Items to review</h2><p>These reminders come from records in your workspace. Nothing is changed automatically.</p></div></div><div className="review-prompt-grid">{data.prompts.map((prompt, index) => <article key={`${prompt.type}-${index}`}><small>{prompt.type.replaceAll('_', ' ')}</small><h3>{prompt.title}</h3><p>{prompt.detail}</p><div>{prompt.observation_id ? <a href={`/observations/${prompt.observation_id}/edit`}>Review observation</a> : prompt.action_id ? <a href={`/improvements/${prompt.action_id}/edit`}>Review action</a> : <a href={`/processes/${prompt.process_id}`}>Review process</a>}<a href={`/observations/create?process_record_id=${prompt.process_id}${prompt.stage_id ? `&workflow_stage_id=${prompt.stage_id}` : ''}`}>Add observation</a><a href={`/improvements/create?process_record_id=${prompt.process_id}`}>Plan action</a></div></article>)}</div></section>}
                <section className="workspace-section"><div className="workspace-section-heading"><div><h2>Your process portfolio</h2><p>Process records, with their related workflow stages.</p></div><a href="/processes">View all <Arrow /></a></div><div className="workspace-process-cards">{data.processes.map((process) => <a href={`/processes/${process.id}`} key={process.id}><span>{process.category || 'Process'}</span><h3>{process.name}</h3><p>{process.department} · {process.stages} stages</p><small>{process.status}</small></a>)}</div></section>
                <section className="workspace-section"><div className="workspace-section-heading"><div><h2>Recent activity</h2><p>Changes you made in this workspace.</p></div><a href="/activity">View history <Arrow /></a></div><ActivityList activities={data.activities || []} /></section>
            </>}
        </WorkspaceShell>;
    }

    if (page === 'process-list') return <WorkspaceShell page={page} data={data}><div className="workspace-page-heading"><div><p className="eyebrow">WORKSPACE RECORDS</p><h1>Processes</h1><p>Document and maintain the processes you want to understand.</p></div><a className="button button-mint" href="/processes/create">Add a process <Arrow /></a></div><form className="workspace-filter" method="get" action="/processes"><input name="q" placeholder="Search name or department" defaultValue={data.filters?.q || ''} /><select name="status" defaultValue={data.filters?.status || ''}><option value="">All statuses</option>{['Active', 'Needs review', 'In progress', 'Paused', 'Archived'].map((status) => <option key={status}>{status}</option>)}</select><button className="button button-outline">Filter</button></form>{data.processes?.data?.length ? <div className="workspace-record-grid">{data.processes.data.map((process) => <article key={process.id}><div><small>{process.category || 'Process'} · {process.department}</small><h2><a href={`/processes/${process.id}`}>{process.name}</a></h2><p>{process.purpose}</p></div><span>{process.status}</span><small>{process.workflow_stages_count} stages · {process.observations_count} observations · {process.improvement_actions_count} actions</small><div className="record-card-actions"><a href={`/processes/${process.id}`}>Open</a><a href={`/processes/${process.id}/edit`}>Edit</a></div></article>)}</div> : <EmptyState title="No matching processes" text="Create your first process record, or adjust the search filters." href="/processes/create" action="Add a process" />}</WorkspaceShell>;

    if (page === 'process-form') {
        const record = data.process || {};
        const editing = data.mode === 'edit';
        const action = editing ? `/processes/${record.id}` : '/processes';
        return <WorkspaceShell page={page} data={data}><div className="workspace-page-heading"><div><p className="eyebrow">PROCESS REGISTRY</p><h1>{editing ? 'Edit process' : 'Create a process'}</h1><p>Capture the basic context your team needs to review this work.</p></div></div><form className="workspace-form" action={action} method="post"><CsrfInput />{editing && <input type="hidden" name="_method" value="PUT" />}<FormErrors errors={data.errors} /><div className="workspace-form-grid"><label>Process name<input name="name" required maxLength="160" defaultValue={data.old?.name ?? record.name ?? ''} /><FieldErrors errors={data.errors} name="name" /></label><label>Category<input name="category" required maxLength="100" placeholder="e.g. Finance, Customer operations" defaultValue={data.old?.category ?? record.category ?? ''} /><FieldErrors errors={data.errors} name="category" /></label><label>Department<input name="department" required maxLength="120" defaultValue={data.old?.department ?? record.department ?? ''} /><FieldErrors errors={data.errors} name="department" /></label><label>Process owner<input name="owner" required maxLength="120" defaultValue={data.old?.owner ?? record.owner ?? ''} /><FieldErrors errors={data.errors} name="owner" /></label><label>Status<select name="status" defaultValue={data.old?.status ?? record.status ?? 'Active'}>{['Active', 'Needs review', 'In progress', 'Paused', 'Archived'].map((value) => <option key={value}>{value}</option>)}</select></label><label>Risk level<select name="risk_level" defaultValue={data.old?.risk_level ?? record.risk_level ?? 'Medium'}>{['Low', 'Medium', 'High'].map((value) => <option key={value}>{value}</option>)}</select></label><label>Last reviewed<input type="date" name="last_reviewed_at" defaultValue={data.old?.last_reviewed_at ?? record.last_reviewed_at?.slice?.(0, 10) ?? ''} /></label><label className="span-full">Purpose and scope<textarea name="purpose" rows="5" required maxLength="5000" defaultValue={data.old?.purpose ?? record.purpose ?? ''} /><FieldErrors errors={data.errors} name="purpose" /></label></div><div className="workspace-form-actions"><a className="button button-outline" href={editing ? `/processes/${record.id}` : '/processes'}>Cancel</a><button className="button button-mint" type="submit">{editing ? 'Save changes' : 'Create process'} <Arrow /></button></div></form></WorkspaceShell>;
    }

    if (page === 'process-detail') {
        const process = data.process;
        const stages = process.workflow_stages || [];
        return <WorkspaceShell page={page} data={data}><div className="workspace-page-heading"><div><p className="eyebrow">{process.category || 'PROCESS'} · {process.department}</p><h1>{process.name}</h1><p>{process.purpose}</p></div><div className="heading-actions"><a className="button button-outline" href={`/processes/${process.id}/edit`}>Edit process</a><a className="button button-mint" href={`/processes/${process.id}/stages/create`}>Add stage <Arrow /></a></div></div><div className="process-detail-meta"><span>Owner <strong>{process.owner}</strong></span><span>Status <strong>{process.status}</strong></span><span>Risk <strong>{process.risk_level}</strong></span><span>Version <strong>{process.version}</strong></span><span>Last reviewed <strong>{process.last_reviewed_at || 'Not set'}</strong></span></div><section className="workspace-section"><div className="workspace-section-heading"><div><h2>Workflow stages</h2><p>Ordered stages, their tasks and the stage each one depends on.</p></div></div>{stages.length ? <div className="stage-record-list">{stages.map((stage) => <article key={stage.id}><span className="stage-record-index">{String(stage.position).padStart(2, '0')}</span><div><h3>{stage.name}</h3><p>{stage.owner_team || 'No team assigned'} · {stage.status}</p>{stage.task_details && <p>{stage.task_details}</p>}{stage.dependency && <small>Depends on: {stage.dependency.name}</small>}{stage.handoff_note && <small>{stage.handoff_note}</small>}</div><div className="record-card-actions"><a href={`/processes/${process.id}/stages/${stage.id}/edit`}>Edit</a><DeleteForm action={`/processes/${process.id}/stages/${stage.id}`} label="Delete" /></div></article>)}</div> : <EmptyState title="No stages recorded" text="Add the first stage to begin mapping this process." href={`/processes/${process.id}/stages/create`} action="Add a stage" />}</section><section className="workspace-section"><div className="workspace-section-heading"><div><h2>Observations and actions</h2><p>Review notes and the follow-up connected to this process.</p></div><div className="heading-actions"><a href={`/observations/create?process_record_id=${process.id}`}>Add observation</a><a href={`/improvements/create?process_record_id=${process.id}`}>Plan improvement</a></div></div><div className="workspace-related-grid"><div><h3>Observations</h3>{process.observations?.map((item) => <a className="related-record" href={`/observations/${item.id}`} key={item.id}>{item.title}<small>{item.review_status} · {item.priority}</small></a>)}</div><div><h3>Improvement actions</h3>{process.improvement_actions?.map((item) => <a className="related-record" href={`/improvements/${item.id}`} key={item.id}>{item.title}<small>{item.status} · {item.priority}</small></a>)}</div></div></section><DeleteForm action={`/processes/${process.id}`} label="Delete this process" /></WorkspaceShell>;
    }

    if (page === 'stage-form') {
        const process = data.process;
        const stage = data.stage || {};
        const editing = Boolean(stage.id);
        const action = editing ? `/processes/${process.id}/stages/${stage.id}` : `/processes/${process.id}/stages`;
        return <WorkspaceShell page={page} data={data}><div className="workspace-page-heading"><div><p className="eyebrow">{process.name}</p><h1>{editing ? 'Edit workflow stage' : 'Add workflow stage'}</h1><p>Describe the work in this stage and any preceding-stage dependency.</p></div></div><form className="workspace-form" action={action} method="post"><CsrfInput />{editing && <input type="hidden" name="_method" value="PUT" />}<FormErrors errors={data.errors} /><div className="workspace-form-grid"><label>Stage name<input name="name" required defaultValue={data.old?.name ?? stage.name ?? ''} /></label><label>Position<input name="position" type="number" min="1" required defaultValue={data.old?.position ?? stage.position ?? ((process.workflow_stages?.length || 0) + 1)} /></label><label>Responsible team or role<input name="owner_team" defaultValue={data.old?.owner_team ?? stage.owner_team ?? ''} /></label><label>Status<select name="status" defaultValue={data.old?.status ?? stage.status ?? 'Not started'}>{['Not started', 'In progress', 'Complete', 'Blocked', 'Waiting'].map((value) => <option key={value}>{value}</option>)}</select></label><label>Depends on<select name="depends_on_stage_id" defaultValue={data.old?.depends_on_stage_id ?? stage.depends_on_stage_id ?? ''}><option value="">No dependency</option>{(process.workflow_stages || []).filter((item) => item.id !== stage.id).map((item) => <option value={item.id} key={item.id}>{item.position}. {item.name}</option>)}</select><small>Select a preceding stage.</small><FieldErrors errors={data.errors} name="depends_on_stage_id" /></label><label>Expected duration (minutes)<input name="expected_minutes" type="number" min="0" defaultValue={data.old?.expected_minutes ?? stage.expected_minutes ?? ''} /></label><label className="span-full">Task details<textarea name="task_details" rows="5" defaultValue={data.old?.task_details ?? stage.task_details ?? ''} /></label><label className="span-full">Handoff notes<textarea name="handoff_note" rows="3" defaultValue={data.old?.handoff_note ?? stage.handoff_note ?? ''} /></label></div><div className="workspace-form-actions"><a className="button button-outline" href={`/processes/${process.id}`}>Cancel</a><button className="button button-mint">{editing ? 'Save stage' : 'Add stage'} <Arrow /></button></div></form></WorkspaceShell>;
    }

    if (page === 'observation-list' || page === 'improvement-list') {
        const observations = page === 'observation-list';
        const records = observations ? data.observations?.data : data.improvements?.data;
        const base = observations ? '/observations' : '/improvements';
        return <WorkspaceShell page={page} data={data}><div className="workspace-page-heading"><div><p className="eyebrow">WORKSPACE REVIEW</p><h1>{observations ? 'Observations' : 'Improvement actions'}</h1><p>{observations ? 'Record what you notice and keep review status visible.' : 'Track owners, priorities, due dates and recorded outcomes.'}</p></div><a className="button button-mint" href={`${base}/create`}>{observations ? 'Add observation' : 'Plan an action'} <Arrow /></a></div><form className="workspace-filter" method="get" action={base}>{observations ? <select name="review_status" defaultValue={data.filters?.review_status || ''}><option value="">All review states</option>{['needs_review', 'accepted', 'declined'].map((value) => <option key={value} value={value}>{value.replaceAll('_', ' ')}</option>)}</select> : <><select name="status" defaultValue={data.filters?.status || ''}><option value="">All statuses</option>{['Planned', 'In progress', 'In review', 'Complete', 'Cancelled'].map((value) => <option key={value}>{value}</option>)}</select><select name="due" defaultValue={data.filters?.due || ''}><option value="">Any due date</option><option value="overdue">Overdue</option></select></>}<button className="button button-outline">Filter</button></form>{records?.length ? <div className="workspace-record-grid">{records.map((item) => <article key={item.id}><div><small>{item.process_record?.name || 'Process'}{item.workflow_stage ? ` · ${item.workflow_stage.name}` : ''}</small><h2><a href={`${base}/${item.id}`}>{item.title}</a></h2><p>{observations ? item.detail : item.description}</p></div><span>{observations ? item.review_status?.replaceAll('_', ' ') : item.status}</span><small>{observations ? `${item.category} · ${item.priority} · ${item.observed_on}` : `${item.owner} · ${item.priority} · Due ${item.due_on || 'not set'}`}</small><div className="record-card-actions"><a href={`${base}/${item.id}`}>Open</a><a href={`${base}/${item.id}/edit`}>Edit</a></div></article>)}</div> : <EmptyState title={`No ${observations ? 'observations' : 'improvement actions'} yet`} text={observations ? 'Add observations as you review a process. You decide which ones need follow-up.' : 'Create a follow-up action from a reviewed opportunity or process need.'} href={`${base}/create`} action={observations ? 'Add observation' : 'Plan an action'} />}</WorkspaceShell>;
    }

    if (page === 'observation-form' || page === 'improvement-form') return <RecordForm page={page} data={data} />;
    if (page === 'observation-detail' || page === 'improvement-detail') return <RecordDetail page={page} data={data} />;
    if (page === 'activity') return <WorkspaceShell page={page} data={data}><div className="workspace-page-heading"><div><p className="eyebrow">YOUR WORKSPACE</p><h1>Activity history</h1><p>Review changes made to your process records, observations and actions.</p></div></div><ActivityList activities={data.activities?.data || []} /></WorkspaceShell>;
    if (page === 'search') return <WorkspaceShell page={page} data={data}><div className="workspace-page-heading"><div><p className="eyebrow">FIND A RECORD</p><h1>Search workspace</h1><p>Search process titles, descriptions, observations and actions.</p></div></div><form className="workspace-filter search-form" action="/search" method="get"><input name="q" autoFocus placeholder="Search your records" defaultValue={data.term || ''} /><button className="button button-mint">Search <Arrow /></button></form>{!data.term ? <EmptyState title="What are you looking for?" text="Enter a word or phrase to search records in your workspace." /> : <div className="workspace-record-grid">{[...(data.processes || []).map((item) => ({ ...item, kind: 'Process', url: `/processes/${item.id}`, text: item.department })), ...(data.observations || []).map((item) => ({ ...item, kind: 'Observation', url: `/observations/${item.id}`, text: item.process_record?.name })), ...(data.actions || []).map((item) => ({ ...item, kind: 'Improvement', url: `/improvements/${item.id}`, text: item.process_record?.name }))].map((item) => <article key={`${item.kind}-${item.id}`}><small>{item.kind} · {item.text}</small><h2><a href={item.url}>{item.name || item.title}</a></h2><p>{item.purpose || item.detail || item.description}</p></article>)}</div>}</WorkspaceShell>;
    return <WorkspaceShell page="dashboard" data={data}><EmptyState title="Page not found" text="Choose a workspace area from the navigation." href="/dashboard" action="Go to overview" /></WorkspaceShell>;
}

function ActivityList({ activities }) {
    return activities?.length ? <div className="activity-list">{activities.map((activity, index) => <article key={activity.id || `${activity.summary}-${index}`}><span aria-hidden="true">◷</span><div><p>{activity.summary}</p><small>{activity.created_at}</small></div></article>)}</div> : <EmptyState title="No activity yet" text="Changes you make to workspace records will appear here." />;
}

function DeleteForm({ action, label }) {
    return <form method="post" action={action} className="inline-delete-form" onSubmit={(event) => { if (!window.confirm('Delete this record? Related workspace items may also be removed.')) event.preventDefault(); }}><CsrfInput /><input type="hidden" name="_method" value="DELETE" /><button type="submit">{label}</button></form>;
}

function RecordForm({ page, data }) {
    const observation = page === 'observation-form';
    const record = observation ? data.observation || {} : data.improvement || {};
    const editing = Boolean(record.id);
    const base = observation ? '/observations' : '/improvements';
    const action = editing ? `${base}/${record.id}` : base;
    return <WorkspaceShell page={page} data={data}><div className="workspace-page-heading"><div><p className="eyebrow">{observation ? 'PROCESS REVIEW' : 'FOLLOW-THROUGH'}</p><h1>{editing ? `Edit ${observation ? 'observation' : 'improvement action'}` : observation ? 'Add an observation' : 'Plan an improvement action'}</h1></div></div><form className="workspace-form" action={action} method="post"><CsrfInput />{editing && <input type="hidden" name="_method" value="PUT" />}<FormErrors errors={data.errors} /><div className="workspace-form-grid"><label className="span-full">Process<select name="process_record_id" required defaultValue={data.old?.process_record_id ?? record.process_record_id ?? data.prefill?.process_record_id ?? ''}><option value="">Choose a process</option>{(data.processes || []).map((process) => <option value={process.id} key={process.id}>{process.name}</option>)}</select><FieldErrors errors={data.errors} name="process_record_id" /></label>{observation ? <><label>Workflow stage<select name="workflow_stage_id" defaultValue={data.old?.workflow_stage_id ?? record.workflow_stage_id ?? data.prefill?.workflow_stage_id ?? ''}><option value="">Process-level observation</option>{(data.processes || []).flatMap((process) => process.workflow_stages?.map((stage) => <option value={stage.id} key={stage.id}>{process.name} · {stage.name}</option>) || [])}</select><small>Choose a stage from the selected process, or keep this at process level.</small><FieldErrors errors={data.errors} name="workflow_stage_id" /></label><label>Category<input name="category" required defaultValue={data.old?.category ?? record.category ?? ''} /></label><label>Priority<select name="priority" defaultValue={data.old?.priority ?? record.priority ?? 'Medium'}>{['Low', 'Medium', 'High', 'Critical'].map((value) => <option key={value}>{value}</option>)}</select></label><label>Review state<select name="review_status" defaultValue={data.old?.review_status ?? record.review_status ?? 'needs_review'}>{[['needs_review', 'Needs review'], ['accepted', 'Accepted'], ['declined', 'Declined']].map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><label>Observed on<input type="date" name="observed_on" required defaultValue={data.old?.observed_on ?? record.observed_on ?? new Date().toISOString().slice(0, 10)} /></label><label className="span-full">Title<input name="title" required maxLength="180" defaultValue={data.old?.title ?? record.title ?? ''} /><FieldErrors errors={data.errors} name="title" /></label><label className="span-full">Observation<textarea name="detail" rows="5" required defaultValue={data.old?.detail ?? record.detail ?? ''} /><FieldErrors errors={data.errors} name="detail" /></label></> : <><label className="span-full">Related observation<select name="process_observation_id" defaultValue={data.old?.process_observation_id ?? record.process_observation_id ?? data.prefill?.process_observation_id ?? ''}><option value="">No linked observation</option>{(data.processes || []).flatMap((process) => process.observations?.map((item) => <option value={item.id} key={item.id}>{process.name} · {item.title}</option>) || [])}</select><FieldErrors errors={data.errors} name="process_observation_id" /></label><label>Owner<input name="owner" required defaultValue={data.old?.owner ?? record.owner ?? ''} /></label><label>Priority<select name="priority" defaultValue={data.old?.priority ?? record.priority ?? 'Medium'}>{['Low', 'Medium', 'High', 'Critical'].map((value) => <option key={value}>{value}</option>)}</select></label><label>Status<select name="status" defaultValue={data.old?.status ?? record.status ?? 'Planned'}>{['Planned', 'In progress', 'In review', 'Complete', 'Cancelled'].map((value) => <option key={value}>{value}</option>)}</select></label><label>Due date<input type="date" name="due_on" defaultValue={data.old?.due_on ?? record.due_on ?? ''} /></label><label className="span-full">Title<input name="title" required maxLength="180" defaultValue={data.old?.title ?? record.title ?? ''} /><FieldErrors errors={data.errors} name="title" /></label><label className="span-full">Description<textarea name="description" rows="5" required defaultValue={data.old?.description ?? record.description ?? ''} /><FieldErrors errors={data.errors} name="description" /></label><label className="span-full">Outcome<textarea name="outcome" rows="3" defaultValue={data.old?.outcome ?? record.outcome ?? ''} /></label></>}</div><div className="workspace-form-actions"><a className="button button-outline" href={record.process_record_id ? `/processes/${record.process_record_id}` : observation ? '/observations' : '/improvements'}>Cancel</a><button className="button button-mint">{editing ? 'Save changes' : observation ? 'Record observation' : 'Create action'} <Arrow /></button></div></form></WorkspaceShell>;
}

function RecordDetail({ page, data }) {
    const observation = page === 'observation-detail';
    const record = observation ? data.observation : data.improvement;
    const base = observation ? '/observations' : '/improvements';
    return <WorkspaceShell page={page} data={data}><div className="workspace-page-heading"><div><p className="eyebrow">{record.process_record?.name}</p><h1>{record.title}</h1><p>{observation ? record.detail : record.description}</p></div><div className="heading-actions"><a className="button button-outline" href={`${base}/${record.id}/edit`}>Edit</a><DeleteForm action={`${base}/${record.id}`} label="Delete" /></div></div><div className="process-detail-meta"><span>{observation ? 'Category' : 'Owner'} <strong>{observation ? record.category : record.owner}</strong></span><span>Priority <strong>{record.priority}</strong></span><span>{observation ? 'Review state' : 'Status'} <strong>{observation ? record.review_status?.replaceAll('_', ' ') : record.status}</strong></span><span>{observation ? 'Observed' : 'Due'} <strong>{observation ? record.observed_on : record.due_on || 'Not set'}</strong></span></div>{!observation && record.outcome && <section className="workspace-section"><h2>Outcome</h2><p>{record.outcome}</p></section>}</WorkspaceShell>;
}

function CookieConsentBanner({ choice, onSave }) {
    if (choice) {
        return null;
    }

    return <section className="cookie-consent" aria-labelledby="cookie-consent-title" aria-describedby="cookie-consent-description">
        <div className="cookie-consent-copy">
            <span className="cookie-consent-icon" aria-hidden="true">◉</span>
            <div>
                <h2 id="cookie-consent-title">Your privacy choices</h2>
                <p id="cookie-consent-description">We use essential session and security storage. Analytics and advertising cookies are not currently enabled. Your choice is saved in this browser. <a href="/privacy">Privacy policy</a></p>
            </div>
        </div>
        <div className="cookie-consent-actions">
            <button className="cookie-button cookie-button-secondary" type="button" onClick={() => onSave('essential')}>Only necessary</button>
            <button className="cookie-button cookie-button-primary" type="button" onClick={() => onSave('all')}>Accept all</button>
        </div>
    </section>;
}

function SiteChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hi, I’m Jorvellan’s site assistant. Ask me about the product concept, features, demo, draft pricing, or how to contact us.' },
    ]);
    const [draft, setDraft] = useState('');
    const [isSending, setIsSending] = useState(false);
    const inputRef = useRef(null);
    const messagesRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight });
        }
    }, [isOpen, messages, isSending]);

    useEffect(() => {
        function closeOnEscape(event) {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        }

        document.addEventListener('keydown', closeOnEscape);
        return () => document.removeEventListener('keydown', closeOnEscape);
    }, []);

    async function sendMessage(event) {
        event.preventDefault();
        const content = draft.trim();
        if (!content || isSending) {
            return;
        }

        const nextMessages = [...messages, { role: 'user', content }].slice(-8);
        setMessages(nextMessages);
        setDraft('');
        setIsSending(true);

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                },
                body: JSON.stringify({ messages: nextMessages }),
            });
            let result;
            try {
                result = await response.json();
            } catch {
                throw new Error('The assistant is temporarily unavailable. Please try again or contact Jorvellan Support.');
            }
            if (!response.ok || typeof result.reply !== 'string') {
                throw new Error(result.message || 'The assistant could not answer right now.');
            }

            setMessages((currentMessages) => [...currentMessages, { role: 'assistant', content: result.reply }].slice(-8));
        } catch (error) {
            setMessages((currentMessages) => [...currentMessages, {
                role: 'assistant',
                content: error instanceof Error ? error.message : 'The assistant is temporarily unavailable. Please try again or contact Jorvellan Support.',
            }].slice(-8));
        } finally {
            setIsSending(false);
        }
    }

    return <>
        {isOpen && <section id="site-chat-panel" className="site-chat-panel" aria-label="Jorvellan website assistant">
            <header className="site-chat-header"><div><span className="site-chat-avatar" aria-hidden="true">J</span><span><strong>Jorvellan assistant</strong><small>Website guide · AI responses</small></span></div><button type="button" className="site-chat-close" onClick={() => setIsOpen(false)} aria-label="Close chat">×</button></header>
            <div className="site-chat-messages" ref={messagesRef} aria-live="polite" aria-relevant="additions text">
                {messages.map((message, index) => <p className={`site-chat-message ${message.role}`} key={`${message.role}-${index}`}>{message.content}</p>)}
                {isSending && <p className="site-chat-message assistant site-chat-typing" role="status">Thinking…</p>}
            </div>
            <p className="site-chat-disclosure">AI answers may be incomplete. Messages are sent to Groq to generate replies. Please don’t share sensitive information.</p>
            <form className="site-chat-form" onSubmit={sendMessage}>
                <textarea ref={inputRef} value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={1500} rows={2} placeholder="Ask about Jorvellan…" aria-label="Your message" required disabled={isSending} />
                <button type="submit" disabled={!draft.trim() || isSending} aria-label="Send message">Send <span aria-hidden="true">↗</span></button>
            </form>
        </section>}
        <button className={`site-chat-launcher${isOpen ? ' is-open' : ''}`} type="button" aria-expanded={isOpen} aria-controls="site-chat-panel" onClick={() => setIsOpen(!isOpen)}>
            <span aria-hidden="true">{isOpen ? '×' : '✳'}</span>{isOpen ? 'Close' : 'Ask Jorvellan'}
        </button>
    </>;
}

function App() {
    const appRoot = document.getElementById('app');
    const page = appRoot?.dataset.page || 'home';
    const portalData = JSON.parse(appRoot?.dataset.props || '{}');
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeHomeSection, setActiveHomeSection] = useState('home');
    const [cookieChoice, setCookieChoice] = useState(readCookieConsent);
    const menuButtonRef = useRef(null);
    const headerRef = useRef(null);
    const closeMenu = () => setMenuOpen(false);
    const saveCookieChoice = (choice) => {
        try {
            window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify({ choice, savedAt: new Date().toISOString() }));
        } catch {
            // The banner still closes for this visit if browser storage is unavailable.
        }
        setCookieChoice(choice);
    };
    const reopenCookieSettings = () => setCookieChoice(null);
    useEffect(() => {
        if (page !== 'home') {
            return undefined;
        }

        const sectionIds = ['features', 'how-it-works', 'about'];
        const updateActiveSection = () => {
            const activationLine = window.scrollY + (headerRef.current?.offsetHeight || 0) + 120;
            let activeSection = 'home';

            for (const sectionId of sectionIds) {
                const section = document.getElementById(sectionId);
                const sectionTop = section ? section.getBoundingClientRect().top + window.scrollY : Number.POSITIVE_INFINITY;
                if (sectionTop <= activationLine) {
                    activeSection = sectionId;
                }
            }

            setActiveHomeSection(activeSection);
        };

        updateActiveSection();
        window.addEventListener('scroll', updateActiveSection, { passive: true });
        window.addEventListener('resize', updateActiveSection);

        return () => {
            window.removeEventListener('scroll', updateActiveSection);
            window.removeEventListener('resize', updateActiveSection);
        };
    }, [page]);
    const navigationItems = [
        { page: 'home', label: 'Home', href: '/', active: page === 'home' && activeHomeSection === 'home' },
        { page: 'features', label: 'Features', href: page === 'home' ? '#features' : '/features', active: page === 'home' ? activeHomeSection === 'features' : page === 'features' },
        { page: 'how-it-works', label: 'How it works', href: page === 'home' ? '#how-it-works' : '/how-it-works', active: page === 'home' ? activeHomeSection === 'how-it-works' : page === 'how-it-works' },
        { page: 'about', label: 'About', href: page === 'home' ? '#about' : '/about', active: page === 'home' ? activeHomeSection === 'about' : page === 'about' },
        { page: 'pricing', label: 'Pricing', href: '/pricing' },
        { page: 'contact', label: 'Contact', href: '/contact' },
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

    if (['login', 'register', 'forgot-password', 'reset-password', 'verify-email'].includes(page)) {
        return <AuthScreen page={page} data={portalData} />;
    }

    if (['dashboard', 'process-list', 'process-form', 'process-detail', 'stage-form', 'observation-list', 'observation-form', 'observation-detail', 'improvement-list', 'improvement-form', 'improvement-detail', 'search', 'activity'].includes(page)) {
        return <WorkspaceScreen page={page} data={portalData} />;
    }

    return (
        <div className="site" id="top">
            <header className="site-header" ref={headerRef}>
                <div className="nav-shell">
                    <Brand current={page === 'home'} />
                    <button ref={menuButtonRef} className={`mobile-menu-toggle${menuOpen ? ' is-open' : ''}`} type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={() => setMenuOpen(!menuOpen)}><span /><span /></button>
                    <nav id="primary-navigation" className={menuOpen ? 'main-nav open' : 'main-nav'} aria-label="Main navigation">
                        {navigationItems.map((item) => <a key={item.page} className={item.active ?? page === item.page ? 'is-current' : undefined} href={item.href} aria-current={item.active ?? page === item.page ? (page === 'home' && item.page !== 'home' ? 'location' : 'page') : undefined} onClick={closeMenu}>{item.label}</a>)}
                        <a className="nav-signin" href="/login" onClick={closeMenu}>Sign in</a>
                    </nav>
                    <a className={`nav-product${page === 'product' ? ' is-current' : ''}`} href="/product" aria-current={page === 'product' ? 'page' : undefined} onClick={closeMenu}>Explore product <Arrow /></a>
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
                        <WorkspaceAnnotations />
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
            </main> : ['pricing', 'checkout', 'checkout-complete'].includes(page) ? <PortalScreen page={page} data={portalData} /> : <MarketingPage page={page} portalData={portalData} />}

            <footer className="site-footer">
                <div className="site-container footer-top">
                    <div className="footer-brand"><Brand light current={page === 'home'} /><p>Jorvellan (Pvt) Ltd · Sri Lanka<br />Jorvellan Inc. · United States<br /><a href="mailto:support@jorvellan.net">support@jorvellan.net</a></p></div>
                    <div className="footer-link-group"><p>EXPLORE</p><nav aria-label="Product navigation"><a href="/product" aria-current={page === 'product' ? 'page' : undefined}>Product</a><a href="/features" aria-current={page === 'features' ? 'page' : undefined}>Features</a><a href="/how-it-works" aria-current={page === 'how-it-works' ? 'page' : undefined}>How it works</a><a href="/pricing" aria-current={page === 'pricing' ? 'page' : undefined}>Draft pricing</a><a href="/dashboard">Your workspace</a><a href="/register">Create account</a></nav></div>
                    <div className="footer-link-group"><p>JORVELLAN</p><nav aria-label="Company navigation"><a href="/about" aria-current={page === 'about' ? 'page' : undefined}>About</a><a href="/contact" aria-current={page === 'contact' ? 'page' : undefined}>Contact</a></nav></div>
                    <div className="footer-link-group"><p>INFORMATION</p><nav className="legal-links" aria-label="Legal navigation"><a className={page === 'terms' ? 'is-current' : undefined} href="/terms" aria-current={page === 'terms' ? 'page' : undefined}>Terms</a><a className={page === 'privacy' ? 'is-current' : undefined} href="/privacy" aria-current={page === 'privacy' ? 'page' : undefined}>Privacy policy</a><button className="footer-cookie-settings" type="button" onClick={reopenCookieSettings}>Cookie settings</button></nav></div>
                </div>
                <div className="site-container footer-bottom"><span>© 2026 Jorvellan</span><span>Proposed product concept · Sample data is illustrative</span><a href="#top">Back to top <span aria-hidden="true">↑</span></a></div>
            </footer>
            <CookieConsentBanner choice={cookieChoice} onSave={saveCookieChoice} />
            <SiteChatWidget />
        </div>
    );
}

createRoot(document.getElementById('app')).render(<App />);
