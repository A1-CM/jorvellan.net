# Jorvellan Project Plan

## Product direction

Jorvellan is an enterprise operations product for AI process discovery and workflow intelligence. It gives teams a structured place to document business processes, map workflow stages, record performance observations, track bottlenecks and improvements, and review suggested insights.

The first release is a Laravel application with a React frontend and SQL database. Product data and any AI suggestions are reviewable records. The initial product scope does not include live process mining from enterprise systems, automated monitoring of production workflows, live AI inference, or automatic workflow execution.

## Build sequence

Build and refine one page at a time. Complete the marketing site before moving on to authenticated product pages.

### Phase 1: Marketing site

The current root page is a single-page marketing draft. Its sections establish the content and visual direction. Refine and deliver the marketing site as these distinct, navigable pages in this order:

1. **Home (`/`)** — concise product positioning, the operational problem, core value, a product-preview entry point, and a clear contact call to action.
2. **Product (`/product`)** — product showcase and proposed technical direction. Present the current process intelligence concept and application preview; describe NVIDIA NeMo, NIM, RAPIDS, and Triton only as proposed options for a future phase.
3. **Features (`/features`)** — process registry, workflow mapping, performance observations, bottleneck and improvement tracking, insight review, dashboards, search, and activity history. Keep sample interface data clearly labeled as illustrative.
4. **About (`/about`)** — introduce Jorvellan, its enterprise operations focus, company background, and the founder using the supplied company information.
5. **Contact (`/contact`)** — provide the supplied company locations and contact numbers, and a clear way to start an enterprise discussion.
6. **How it works (`/how-it-works`)** — explain the workflow from documenting a process through mapping stages, recording observations, reviewing insights, and tracking improvements.
7. **Terms (`/terms`)** — publish the terms governing use of the website and product.
8. **Privacy Policy (`/privacy`)** — explain what personal information is collected, why it is used, how it is handled, and how people can contact Jorvellan about privacy.

Each page should have a consistent header and footer, responsive layout, descriptive page title and metadata, working navigation, and calls to action appropriate to that page. Reuse the current draft's useful content and design elements, while keeping each page focused on its own purpose. Draft legal copy from the available product facts only; mark assumptions for Jorvellan review before publication.

### Phase 2: Authenticated application

After the marketing pages are complete, build the application in this order:

1. Authentication, organization membership, and role-based access for Administrator, Process Manager, Analyst, and Reviewer.
2. Process registry and documentation, including ownership, department, category, status, version, and review dates.
3. Workflow mapping with stages, tasks, dependencies, owners, expected durations, and stage status.
4. Operations dashboard with process summaries, delayed stages, unresolved bottlenecks, pending improvements, insight reviews, and recent activity.
5. Performance observations and bottleneck records, using manually entered or seeded data.
6. Improvement opportunity tracking with priority, owner, target date, status, and outcome.
7. AI insight registry using seeded demo records initially, with reviewer actions to edit, approve, or reject suggestions.
8. Search, filtering, activity history, and seeded realistic demonstration data.

## Content and claim rules

- Clearly distinguish current application capabilities from proposed future capabilities.
- Label all sample dashboard figures, process records, workflow stages, and insights as illustrative or demo data.
- Do not imply live integrations, process mining, production monitoring, AI inference, or automatic execution are available.
- Describe NVIDIA NeMo, NIM, RAPIDS, and Triton as proposed architectural options only. Do not imply NVIDIA integration, certification, or endorsement.
- Keep AI-assisted observations subject to human review and approval.
- Do not add customer logos, testimonials, performance results, or pricing that have not been supplied and approved.

## Project setup and deployment

- Framework: Laravel 13 with React 19 and Vite.
- PHP requirement: exactly 8.5.12 in Composer and deployment workflows.
- Deployment origin: `https://jorvellan.net`.
- cPanel deployment and rollback use the shared `A1-CM/.github` toolkit. GitHub cPanel variables and secrets belong to the `production` environment.
- Keep private Laravel code and `.env` outside the domain document root, and preserve the deployment toolkit's release and rollback behavior.

## Page-by-page completion checklist

Before moving to the next page:

- Confirm the page matches its purpose and the product direction above.
- Check desktop and mobile layouts, navigation, links, and calls to action.
- Check that demo content and future capabilities are labeled accurately.
- Build the production frontend bundle after implementation changes.

## Current status

- Laravel + React project scaffold: in place.
- Marketing pages now have separate routes for Home, Product, Features, About, Contact, How it works, Terms, and Privacy Policy, with shared site navigation and page-specific titles and descriptions.
- The Product page presents the product preview and proposed NVIDIA options; features and workflow pages distinguish the initial concept from future integrations and automation.
- Terms and Privacy Policy are explicitly marked as drafts for Jorvellan review. Confirm actual hosting logs, analytics, cookies, data retention, processors, legal entity details, governing law, and privacy request methods before publication.
- Authenticated application: not started.
