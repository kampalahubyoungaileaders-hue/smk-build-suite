# SMK Build Suite — polish and review notes

## Before you deploy

1. **Apply the new database migration.** The app now expects
   `supabase/migrations/20260916120000_access_control_and_finance_rules.sql`.
   In Lovable this happens when you sync the repo; otherwise run `supabase db push`
   or paste the file into the Supabase SQL editor.
   - On an existing system, the oldest account is promoted to **admin**.
   - On a fresh system, the first account to sign up becomes admin.
   - Everyone else signs up, sees a "waiting for access" screen, and an admin grants a role on the **Team** page.
2. **Check `src/content/company.ts`.** The stats (50+ projects, 15+ engineers, 200+ workers) and the three
   testimonials are placeholders carried over from the old site. Replace them with real figures and real,
   permission-given client quotes.
3. **`.env` is committed** with the Supabase URL and anon key. The anon key is designed to be public, so this is not
   a leak by itself, but it is now only safe because of the row-level security added in the migration. Consider
   adding `.env` to `.gitignore` if you move off Lovable.

## Management system review — what was wrong

| # | Problem | Impact | Fix |
|---|---------|--------|-----|
| 1 | No way to give anyone a role | Nobody could create projects; the system was unusable | Admin bootstrap + `set_user_role()` + Team page approvals |
| 2 | Every table readable by any signed-up account | A stranger could sign up and read all projects, invoices and payments | All reads require a staff role |
| 3 | Expenses could be created as "approved"; managers could approve their own | Approval step was meaningless | Server forces `pending`, blocks self-approval, locks approved amounts |
| 4 | Invoice totals trusted from the browser; duplicate numbers; payments never marked invoices paid | Wrong receivables | Totals computed in the database, unique numbers, automatic paid/unpaid status |
| 5 | Task assignees could rewrite any field | Titles, dates, assignees could be changed by anyone assigned | Non-managers may only change status and progress |
| 6 | Dashboard counted completed projects as "active" and all tasks as "open"; budget used included rejected expenses | Misleading numbers | Metrics corrected; only approved spend counts |
| 7 | Dates shifted a day in some timezones; tasks due today shown as overdue | Wrong deadlines | Date helpers in `src/lib/format.ts` |
| 8 | Deletes had no confirmation; no password reset | Easy data loss; locked-out staff | Confirm dialogs; reset flow and Account page |
| 9 | CSV export broke on commas and allowed spreadsheet formula injection | Corrupt / unsafe reports | Escaped, Excel-safe export |

The migration was tested on PostgreSQL 16 with 24 scenarios run as different users (stranger, supervisor,
project manager, assignee, admin).

## Design

- Logo cut out of its white JPEG box into transparent colour and white versions (`src/components/brand/Logo.tsx`).
- The theme used brand red as the shadcn `accent` colour, which is the hover background for menus and selects.
  That caused red-on-red and invisible text. Red now has its own token (`smk-red`).
- Photos converted to WebP (11 MB → 1 MB). Dashboard is code-split so website visitors download about half as much.
- Real page title, description, favicon and social share image.
