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
    product: { eyebrow: 'THE JORVELLAN WORKSPACE', title: <>A clearer view of<br />work in motion.</>, intro: 'Bring process records, workflow stages, observations and improvement actions together in one structured workspace.', action: 'Explore features', actionHref: '/features' },
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
                <h2>2. Website and product materials</h2><p>The website provides company information and describes a proposed AI process discovery and workflow intelligence product for enterprise operations. Product screens, processes, measurements, observations, plans and prices shown in the demo are illustrative. They do not represent real customer records, measured performance, a currently available production service, or a commitment to deliver a feature.</p>
                <h2>3. Demo workspace</h2><p>The demo workspace is a read-only demonstration populated with fictional sample records. It is available for evaluation and discussion only. Do not submit confidential, personal, regulated, or live business information to the demo. The demo is not connected to enterprise systems and does not perform live process mining, AI inference, monitoring, recommendations, or workflow execution.</p>
                <h2>4. Draft pricing and simulated checkout</h2><p>Pricing displayed on the site is draft pricing for discussion and is not an offer to sell or a binding subscription quote. The checkout is a simulation that creates a demo record only. It does not contact a bank, card network, processor, or payment gateway, authorize or charge a card, create an enforceable paid subscription, or automatically renew a service. Any real commercial service would require separate written terms and an actual payment arrangement. Do not use a real card.</p>
                <h2>5. Permitted use</h2><p>You may use the public website for lawful informational and business purposes. You agree not to misuse the site, probe or bypass access controls, disrupt service, introduce malicious code, scrape or overload the service, misrepresent sample information as real, or infringe another person’s rights.</p>
                <h2>6. Intellectual property</h2><p>Unless identified otherwise, Jorvellan owns or is authorized to use the website text, brand marks, layout and original visual materials. You may view the website and share links to it. No ownership transfer or broader licence is granted. Third-party names and marks remain the property of their owners; their mention does not imply affiliation or endorsement.</p>
                <h2>7. Availability and changes</h2><p>We may update, suspend or remove website pages or the demo. We aim to keep materials useful but do not promise that they will always be complete, current, uninterrupted, or error-free. We may revise these terms by publishing an updated version and date on this page.</p>
                <h2>8. No professional advice or service commitment</h2><p>Website content and replies from the AI website assistant are general information that may be incomplete or inaccurate, not legal, financial, security, operational or other professional advice. Teams should independently validate process information and obtain appropriate advice before making decisions. The demo and product descriptions do not create a service-level commitment, implementation obligation, warranty, or customer relationship.</p>
                <h2>9. Third-party websites</h2><p>The site may link to third-party websites, including map services. Those services are operated by others and are governed by their own terms and privacy practices. Jorvellan does not control or endorse all content on linked sites.</p>
                <h2>10. Responsibility and governing law</h2><p>To the extent permitted by applicable law, Jorvellan is not responsible for indirect or consequential loss arising from use of this informational website or its sample data. Nothing in these terms limits liability that cannot legally be limited or excludes rights that cannot be excluded. The governing law and contracting entity for any future paid service will be stated in separate service terms. These website terms do not choose a governing law for a future customer agreement.</p>
                <h2>11. Contact</h2><p>Questions about these terms: <a href="mailto:support@jorvellan.net">support@jorvellan.net</a>. Sri Lanka: Jorvellan (Pvt) Ltd, 3rd Floor, No. 186, Nawala Road, Nawala, Sri Jayawardenepura Kotte, Sri Lanka; +94 11 234 6789. United States: Jorvellan Inc., Suite 520, 5th Floor, 680 Folsom Street, San Francisco, CA 94107, USA; +1 415-555-0148.</p>
            </> : <>
                <h2>1. About this policy</h2><p>This policy describes information handled through jorvellan.net, its contact form, and its simulated checkout. It does not describe a future production SaaS service, which will need a separate product privacy notice before real customer or workflow data is collected.</p>
                <h2>2. Who is responsible</h2><p>Jorvellan operates through Jorvellan (Pvt) Ltd in Sri Lanka and Jorvellan Inc. in the United States. The relevant Jorvellan entity handles website inquiries and coordinates a response. For questions about the entity responsible for a particular interaction, contact <a href="mailto:support@jorvellan.net">support@jorvellan.net</a>.</p>
                <h2>3. Information you provide</h2><p>The contact form asks for your name, email address and message; company, phone and subject are optional. If you choose a plan in the simulated checkout, we collect your name, email and company if provided, and create a simulated subscription record. If you use the AI website assistant, the messages and recent conversation you send are transmitted to Groq to generate replies. Chat history stays in the current page and is not saved to a Jorvellan database. Do not submit confidential or sensitive information in a message or chat.</p>
                <h2>4. Simulated card information</h2><p>Paid-plan demo checkout asks for a card number, expiry date and security code only to validate the format and demonstrate a successful flow. No payment processor or bank is contacted and no charge or authorization occurs. The application records only a simulated status, amount, card brand and last four digits. The full card number, expiry date and security code are not saved in the application database or session. Use the provided 4242 test card pattern or another Luhn-valid test number; do not enter a real card.</p>
                <h2>5. How we use information</h2><p>We use contact details and message content to respond to your inquiry, route it to the support team, maintain an inquiry record and protect the website. Simulated checkout information is used to display the demo confirmation and understand aggregate interest in draft plans. Cloudflare Turnstile may process technical and browser signals when you open a page with a protected form and complete the security check to help distinguish people from automated traffic. We do not use the demo to make automated decisions about you.</p>
                <h2>6. Cookies, logs and security</h2><p>The site uses the session and security mechanisms needed for navigation, form protection, validation feedback and the simulated checkout confirmation. Your browser stores your cookie choice locally so you can change it later. The web host and application may process technical request data, such as IP address, browser details, timestamps and error records, to deliver and secure the site. Cloudflare provides Turnstile verification under its own privacy terms; see <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noreferrer">Cloudflare’s Privacy Policy</a>. No analytics or advertising cookies are currently enabled.</p>
                <h2>7. Email and AI service providers</h2><p>Contact messages are stored in the application database and sent to support@jorvellan.net through the configured email service. Chat questions and recent conversation context are sent to Groq to generate replies; Jorvellan does not intentionally store chat transcripts. Groq says inference requests are not retained by default but may be temporarily logged for service reliability or abuse investigation. See <a href="https://console.groq.com/docs/your-data" target="_blank" rel="noreferrer">Groq’s API data controls</a> and <a href="https://groq.com/privacy-policy" target="_blank" rel="noreferrer">Privacy Policy</a> for current provider practices. Hosting, infrastructure and email providers may also process information on Jorvellan’s behalf to operate the site.</p>
                <h2>8. Retention</h2><p>Contact and simulated checkout records are kept in the application database. They should be retained only as long as needed to handle the inquiry, operate the demo, maintain business records, protect the service, or meet legal obligations. A fixed deletion schedule has not been set for this demo, so contact support for a record-specific request.</p>
                <h2>9. International handling</h2><p>Jorvellan has offices in Sri Lanka and the United States. Depending on the hosting and email configuration, information may be handled in either country or in other locations used by service providers. Contact us for details relevant to a particular inquiry.</p>
                <h2>10. Your choices and requests</h2><p>You may contact us to ask about, correct or request deletion of information you submitted. Applicable rights and response timelines vary by location and law. We may need to verify your request and retain limited records when required or permitted by law. Send requests to <a href="mailto:support@jorvellan.net">support@jorvellan.net</a> or use the <a href="/contact">contact form</a>.</p>
                <h2>11. Children</h2><p>This business website and operations product concept are intended for business audiences, not children. Do not submit information about a child through the site.</p>
                <h2>12. Changes and contact details</h2><p>We may update this policy when the site or its data handling changes. The latest version and effective date will appear on this page. Privacy questions: <a href="mailto:support@jorvellan.net">support@jorvellan.net</a>. Sri Lanka: Jorvellan (Pvt) Ltd, 3rd Floor, No. 186, Nawala Road, Nawala, Sri Jayawardenepura Kotte, Sri Lanka; +94 11 234 6789. United States: Jorvellan Inc., Suite 520, 5th Floor, 680 Folsom Street, San Francisco, CA 94107, USA; +1 415-555-0148.</p>
            </>}
        </article></main>;
    }

    return <main className="marketing-page">
        <section className={`page-hero page-hero-${page}`}><div className="site-container page-hero-grid"><div><p className="eyebrow">{content.eyebrow}</p><h1>{content.title}</h1><p className="page-lede">{content.intro}</p>{content.action && <a className="button button-mint" href={content.actionHref}>{content.action}<Arrow /></a>}</div><div className={`page-hero-art page-hero-art-${page}`} aria-hidden="true">
            {page === 'product' && <><div className="page-art-orbit orbit-one"/><div className="page-art-orbit orbit-two"/><span>J</span><small>OPERATIONS<br />INTELLIGENCE</small><i>01</i><b>02</b></>}
            {page === 'features' && <div className="hero-capability-list"><span><i>01</i> Process registry</span><span><i>02</i> Workflow maps</span><span><i>03</i> Insight review</span></div>}
            {page === 'about' && <div className="hero-founder-mark"><span>J</span><small>FOUNDED<br /><b>21 AUG 2023</b></small></div>}
            {page === 'contact' && <div className="hero-office-list"><span><i>SL</i><b>Sri Lanka<small>Colombo office</small></b></span><span><i>US</i><b>United States<small>San Francisco office</small></b></span></div>}
            {page === 'how-it-works' && <ol className="hero-flow-list"><li>Document</li><li>Map</li><li>Observe</li><li>Review</li><li>Improve</li></ol>}
        </div></div></section>
        {page === 'product' && <>
            <section className="section-space product-concept-section"><div className="site-container">
                <SectionHeading eyebrow="PRODUCT CONCEPT · ILLUSTRATIVE SAMPLE DATA" title="One workspace for the records behind a process." text="This proposed workspace shows how ownership, workflow stages, observations and improvement actions could be reviewed together. Every record and figure in the preview is illustrative." />
                <WorkspaceAnnotations />
                <div className="preview-caption"><span><i /> PRODUCT CONCEPT PREVIEW · SAMPLE DATA</span><span>Explore the sample workspace tabs</span></div>
                <div className="product-showcase"><DashboardPreview /></div>
                <div className="detail-grid product-records"><article className="info-card"><span>01 / UNDERSTAND</span><h3>Process context</h3><p>Keep ownership, departments and versions attached to the process definition.</p></article><article className="info-card"><span>02 / CONNECT</span><h3>Workflow movement</h3><p>Describe stages, tasks, dependencies and handoffs across teams.</p></article><article className="info-card"><span>03 / IMPROVE</span><h3>Human-reviewed actions</h3><p>Record observations and improvement opportunities with accountable owners.</p></article></div>
                <div className="product-demo-cta"><div><p className="eyebrow">DATABASE-BACKED SAMPLE</p><h2>Open the operations demo.</h2><p>Explore sample processes, workflow stages, review observations and improvement actions from a connected demo database.</p></div><a className="button button-mint" href="/dashboard/demo">Explore demo workspace <Arrow /></a></div>
                <div className="product-pricing-link"><span>Evaluating a future plan?</span><a className="inline-link" href="/pricing">See draft pricing <Arrow /></a></div>
            </div></section>
            <section className="tech-section section-space"><div className="site-container"><SectionHeading eyebrow="PROPOSED · FUTURE-FACING TECHNICAL DIRECTION" title="Possible tools for a later product phase." text="These options are subjects for future research. They are not current integrations or capabilities in the Jorvellan concept." /><div className="tech-grid">{[['NVIDIA NeMo','A potential option for future model development and evaluation.'],['NVIDIA NIM','A possible model-serving approach to assess in a later architecture.'],['NVIDIA RAPIDS','Potential components for future accelerated data exploration.'],['NVIDIA Triton','A possible inference-serving option to evaluate in a future phase.']].map(([name,desc])=><article className="tech-card" key={name}><small>PROPOSED OPTION · NOT INTEGRATED</small><h3>{name}</h3><p>{desc}</p></article>)}</div><p className="scope-note">Jorvellan does not currently represent any NVIDIA integration, certification or endorsement, live AI inference, or automated workflow execution.</p></div></section>
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
            return <main className="portal-page"><section className="portal-hero"><div className="site-container"><p className="eyebrow">SIMULATION COMPLETE</p><h1>Your demo flow is ready.</h1><p>No payment was processed. This confirmation records a simulated plan selection for demonstration purposes.</p></div></section><section className="site-container success-wrap"><article className="success-card"><span className="success-mark">✓</span><h2>{subscription.plan.name} demo selected</h2><p>Confirmation reference <strong>{subscription.reference}</strong></p><p>{subscription.customer_name} · {subscription.customer_email}</p><div className="no-charge-callout">No charge · No authorization · No payment gateway · No recurring billing</div><a className="button button-mint" href="/dashboard/demo">Explore the sample workspace <Arrow /></a></article></section></main>;
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
    const navigationItems = [
        { page: 'home', label: 'Home', href: '/' },
        { page: 'product', label: 'Product', href: page === 'home' ? '#product' : '/product' },
        { page: 'features', label: 'Features', href: page === 'home' ? '#features' : '/features' },
        { page: 'how-it-works', label: 'How it works', href: page === 'home' ? '#how-it-works' : '/how-it-works' },
        { page: 'about', label: 'About', href: page === 'home' ? '#about' : '/about' },
        { page: 'pricing', label: 'Pricing', href: '/pricing' },
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
            </main> : ['dashboard', 'pricing', 'checkout', 'checkout-complete'].includes(page) ? <PortalScreen page={page} data={portalData} /> : <MarketingPage page={page} portalData={portalData} />}

            <footer className="site-footer">
                <div className="site-container footer-top">
                    <div className="footer-brand"><Brand light current={page === 'home'} /><p>Jorvellan (Pvt) Ltd · Sri Lanka<br />Jorvellan Inc. · United States<br /><a href="mailto:support@jorvellan.net">support@jorvellan.net</a></p></div>
                    <div className="footer-link-group"><p>EXPLORE</p><nav aria-label="Product navigation"><a href="/product" aria-current={page === 'product' ? 'page' : undefined}>Product</a><a href="/features" aria-current={page === 'features' ? 'page' : undefined}>Features</a><a href="/how-it-works" aria-current={page === 'how-it-works' ? 'page' : undefined}>How it works</a><a href="/pricing" aria-current={page === 'pricing' ? 'page' : undefined}>Draft pricing</a><a href="/dashboard/demo">Demo workspace</a></nav></div>
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
