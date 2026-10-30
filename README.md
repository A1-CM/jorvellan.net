# Jorvellan

Jorvellan is a Laravel 13 application with a React 19 frontend, built with Vite. Its public deployment URL is `https://jorvellan.net`.

## Requirements

- PHP 8.5.12 with SQLite, mbstring, fileinfo, and OpenSSL extensions
- Composer 2
- Node.js 22 or newer
- SQLite with FTS support

## Local setup

From the project directory:

~~~bash
composer install
npm install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate
~~~

Run Laravel and Vite in separate terminals:

~~~bash
php artisan serve
npm run dev
~~~

Open `http://localhost:8000`. The React entry point is `resources/js/app.jsx`; the Laravel route and Blade root view provide the app shell.

## cPanel deployment

The deployment follows the LogicStrand cPanel release workflow and shared `A1-CM/.github` toolkit, pinned at `v1.0.8`. The app code and `.env` stay outside the domain document root. The deployer publishes only the Laravel public entry point and built assets, prepares a private release, runs migrations, and checks `/up`. On failed health checks it restores the prior public files. The manual rollback workflow restores one of the seven retained releases. Database migrations are forward-only.

### GitHub setup

Create a GitHub Actions environment named **production**. Add these environment variables there:

| Variable | Value |
| --- | --- |
| `CPANEL_HOST` | cPanel hostname, without `https://` or a port; HTTPS port 2083 must be reachable |
| `CPANEL_USERNAME` | cPanel account username |
| `CPANEL_HOME` | Absolute cPanel home, such as `/home/username` |
| `CPANEL_DOMAIN` | Optional hosted domain override; defaults to `jorvellan.net` |
| `CPANEL_PUBLIC_DIR` | Optional document root override; defaults to `auto` |
| `CPANEL_HEALTH_PATH` | Optional health path; defaults to `/up` |
| `CPANEL_ALLOW_INDEX_REPLACE` | Optional `true` only if replacing an unrelated existing `index.php` is approved |
| `CPANEL_DB_NAME`, `CPANEL_DB_USER` | Optional database name/user overrides |
| `DB_HOST`, `DB_PORT` | Optional database connection overrides; defaults are `localhost:3306` |
| `MAIL_HOST`, `MAIL_PORT`, `MAIL_SCHEME` | Optional SMTP overrides; defaults are `mail.<domain>`, `465`, and `smtps` |

Add `CPANEL_API_TOKEN` as a **production environment secret**. It needs cPanel API permissions to manage files, MySQL databases and users, and email accounts. Put optional application settings in `APP_ENV_EXTRA` as a production environment secret containing newline-separated `KEY=value` entries. Do not store deployment settings as repository variables; the deploy and rollback jobs bind the `production` environment directly.

The deployment URL is set to `https://jorvellan.net` in both workflows and `.env.example`. Pushes to `main` deploy automatically. The workflow can also be run manually to choose a document root or permit replacement of an existing unrelated `index.php`. Before first deployment, confirm in cPanel that the selected document root belongs to this domain and is not shared with another live site.

The first deploy generates and stores private Laravel, database, and mailbox credentials under `CPANEL_HOME/jorvellan-deploy-state.json` with owner-only permissions. Back up this file securely and do not delete or rename it. Keep the private `jorvellan-app` directory outside the public document root. cPanel needs PHP 8.5.12 with PDO MySQL, mbstring, fileinfo, and OpenSSL, plus MySQL/MariaDB with InnoDB full-text support.

### Rollback

Run **Roll back Jorvellan on cPanel**, select `steps_back` from 1 to 7, and optionally select a public directory. The workflow checks `/up` and restores the previous live files if the health check fails. It does not reverse database migrations; keep old releases compatible with the current schema.

## Checks

~~~bash
php artisan test
npm run build
~~~
