-- =====================================================================
-- SMK: access control and finance integrity
--
-- Fixes found in review:
--  1. Nobody was ever given a role, so no one could create projects.
--     -> The first account becomes admin; admins approve everyone else.
--  2. Anyone who signed up could read every project, invoice and payment.
--     -> Reading data now requires an approved role.
--  3. Site supervisors could insert expenses already marked "approved",
--     and managers could approve their own expenses.
--  4. Invoice totals were trusted from the browser; invoice numbers could
--     repeat; payments never updated invoice status.
--  5. Assigned users could rewrite any field of a task, not just status.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Helper functions
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id)
$$;

CREATE OR REPLACE FUNCTION public.is_manager(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin', 'project_manager')
  )
$$;

REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_manager(uuid) FROM anon;

-- ---------------------------------------------------------------------
-- 1. Bootstrap an administrator
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), NEW.email))
  ON CONFLICT (user_id) DO NOTHING;

  -- The very first account on a fresh system becomes the administrator.
  -- Everyone after that waits for an administrator to grant a role.
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Backfill any missing profiles.
INSERT INTO public.profiles (user_id, full_name)
SELECT u.id, COALESCE(NULLIF(u.raw_user_meta_data->>'full_name', ''), u.email)
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = u.id);

-- Existing systems with no administrator: promote the oldest account.
-- CHECK after running: SELECT * FROM public.user_roles;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role)
    SELECT id, 'admin'::public.app_role FROM auth.users ORDER BY created_at LIMIT 1
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Admin-only role management. Passing NULL removes access.
CREATE OR REPLACE FUNCTION public.set_user_role(_user_id uuid, _role public.app_role)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only administrators can change who has access.' USING ERRCODE = '42501';
  END IF;
  IF _user_id = auth.uid() AND _role IS DISTINCT FROM 'admin'::public.app_role THEN
    RAISE EXCEPTION 'You can''t remove your own administrator access. Ask another administrator.';
  END IF;

  DELETE FROM public.user_roles WHERE user_id = _user_id;
  IF _role IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, _role);
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.set_user_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_user_role(uuid, public.app_role) TO authenticated;

-- ---------------------------------------------------------------------
-- 2. Only approved staff can read company data
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users and staff can view roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Staff can view profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR (public.is_staff(auth.uid()) AND (public.is_staff(user_id) OR public.has_role(auth.uid(), 'admin')))
  );

DROP POLICY IF EXISTS "Authenticated users can view projects" ON public.projects;
CREATE POLICY "Staff can view projects" ON public.projects
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can view tasks" ON public.project_tasks;
CREATE POLICY "Staff can view tasks" ON public.project_tasks
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can view budgets" ON public.project_budgets;
CREATE POLICY "Staff can view budgets" ON public.project_budgets
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can view team" ON public.team_members;
CREATE POLICY "Staff can view team" ON public.team_members
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can view documents" ON public.project_documents;
CREATE POLICY "Staff can view documents" ON public.project_documents
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can upload documents" ON public.project_documents;
CREATE POLICY "Staff can upload documents" ON public.project_documents
  FOR INSERT TO authenticated
  WITH CHECK (public.is_staff(auth.uid()) AND auth.uid() = uploaded_by);

DROP POLICY IF EXISTS "Authenticated users can view expenses" ON public.expenses;
CREATE POLICY "Staff can view expenses" ON public.expenses
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can view invoices" ON public.invoices;
CREATE POLICY "Staff can view invoices" ON public.invoices
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can view payments" ON public.payments;
CREATE POLICY "Staff can view payments" ON public.payments
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

-- ---------------------------------------------------------------------
-- 3. Projects
-- ---------------------------------------------------------------------
ALTER TABLE public.projects ALTER COLUMN created_by SET DEFAULT auth.uid();

ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_budget_nonnegative;
ALTER TABLE public.projects ADD CONSTRAINT projects_budget_nonnegative
  CHECK (budget IS NULL OR budget >= 0) NOT VALID;

ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_dates_ordered;
ALTER TABLE public.projects ADD CONSTRAINT projects_dates_ordered
  CHECK (start_date IS NULL OR end_date IS NULL OR end_date >= start_date) NOT VALID;

-- ---------------------------------------------------------------------
-- 4. Tasks: managers manage, assignees may only move status/progress
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins PMs and assigned can manage tasks" ON public.project_tasks;

CREATE POLICY "Managers can create tasks" ON public.project_tasks
  FOR INSERT TO authenticated WITH CHECK (public.is_manager(auth.uid()));

CREATE POLICY "Managers can delete tasks" ON public.project_tasks
  FOR DELETE TO authenticated USING (public.is_manager(auth.uid()));

CREATE POLICY "Managers and assignees can update tasks" ON public.project_tasks
  FOR UPDATE TO authenticated
  USING (public.is_manager(auth.uid()) OR (assigned_to = auth.uid() AND public.is_staff(auth.uid())))
  WITH CHECK (public.is_manager(auth.uid()) OR (assigned_to = auth.uid() AND public.is_staff(auth.uid())));

CREATE OR REPLACE FUNCTION public.guard_task_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR public.is_manager(auth.uid()) THEN
    RETURN NEW;
  END IF;
  IF (NEW.project_id, NEW.title, NEW.description, NEW.priority, NEW.assigned_to, NEW.due_date)
     IS DISTINCT FROM
     (OLD.project_id, OLD.title, OLD.description, OLD.priority, OLD.assigned_to, OLD.due_date) THEN
    RAISE EXCEPTION 'Only project managers can change task details. You can still update the status.'
      USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_task_update ON public.project_tasks;
CREATE TRIGGER guard_task_update BEFORE UPDATE ON public.project_tasks
  FOR EACH ROW EXECUTE FUNCTION public.guard_task_update();

-- ---------------------------------------------------------------------
-- 5. Expenses: approval workflow that can't be bypassed
-- ---------------------------------------------------------------------
ALTER TABLE public.expenses ALTER COLUMN submitted_by SET DEFAULT auth.uid();

ALTER TABLE public.expenses DROP CONSTRAINT IF EXISTS expenses_status_valid;
ALTER TABLE public.expenses ADD CONSTRAINT expenses_status_valid
  CHECK (status IN ('pending', 'approved', 'rejected')) NOT VALID;

ALTER TABLE public.expenses DROP CONSTRAINT IF EXISTS expenses_amount_positive;
ALTER TABLE public.expenses ADD CONSTRAINT expenses_amount_positive
  CHECK (amount > 0) NOT VALID;

DROP POLICY IF EXISTS "Admins PMs supervisors can create expenses" ON public.expenses;
CREATE POLICY "Managers and supervisors can submit expenses" ON public.expenses
  FOR INSERT TO authenticated
  WITH CHECK (
    (public.is_manager(auth.uid()) OR public.has_role(auth.uid(), 'site_supervisor'))
    AND status = 'pending'
    AND approved_by IS NULL
    AND submitted_by = auth.uid()
  );

CREATE OR REPLACE FUNCTION public.guard_expense_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  is_admin boolean := auth.uid() IS NULL OR public.has_role(auth.uid(), 'admin');
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF OLD.status <> 'pending' AND NOT is_admin THEN
      RAISE EXCEPTION 'This expense was already %. Only an administrator can change that.', OLD.status
        USING ERRCODE = '42501';
    END IF;

    IF NEW.status IN ('approved', 'rejected') THEN
      -- Separation of duties: managers can't decide on their own expenses.
      -- Administrators are exempt so a one-admin company isn't blocked.
      IF NEW.submitted_by = auth.uid() AND NOT is_admin THEN
        RAISE EXCEPTION 'You can''t approve or reject your own expense. Ask another manager.'
          USING ERRCODE = '42501';
      END IF;
      NEW.approved_by := COALESCE(auth.uid(), NEW.approved_by);
    ELSE
      NEW.approved_by := NULL;
    END IF;
  END IF;

  IF OLD.status = 'approved' AND NOT is_admin
     AND (NEW.amount, NEW.project_id, NEW.category) IS DISTINCT FROM (OLD.amount, OLD.project_id, OLD.category) THEN
    RAISE EXCEPTION 'Approved expenses can only be edited by an administrator.' USING ERRCODE = '42501';
  END IF;

  NEW.submitted_by := OLD.submitted_by;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_expense_update ON public.expenses;
CREATE TRIGGER guard_expense_update BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.guard_expense_update();

-- ---------------------------------------------------------------------
-- 6. Invoices: server-side totals, valid statuses, unique numbers
-- ---------------------------------------------------------------------
ALTER TABLE public.invoices ALTER COLUMN created_by SET DEFAULT auth.uid();

ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS invoices_status_valid;
ALTER TABLE public.invoices ADD CONSTRAINT invoices_status_valid
  CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')) NOT VALID;

ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS invoices_amounts_nonnegative;
ALTER TABLE public.invoices ADD CONSTRAINT invoices_amounts_nonnegative
  CHECK (subtotal >= 0 AND tax_amount >= 0) NOT VALID;

CREATE OR REPLACE FUNCTION public.prepare_invoice()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.invoice_number := btrim(NEW.invoice_number);
  NEW.total_amount := COALESCE(NEW.subtotal, 0) + COALESCE(NEW.tax_amount, 0);
  IF NEW.status = 'paid' THEN
    NEW.paid_date := COALESCE(NEW.paid_date, CURRENT_DATE);
  ELSE
    NEW.paid_date := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prepare_invoice ON public.invoices;
CREATE TRIGGER prepare_invoice BEFORE INSERT OR UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.prepare_invoice();

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.invoices GROUP BY btrim(invoice_number) HAVING count(*) > 1
  ) THEN
    RAISE NOTICE 'Duplicate invoice numbers exist. Fix them, then run: CREATE UNIQUE INDEX invoices_invoice_number_key ON public.invoices (invoice_number);';
  ELSE
    CREATE UNIQUE INDEX IF NOT EXISTS invoices_invoice_number_key ON public.invoices (invoice_number);
  END IF;
END $$;

-- ---------------------------------------------------------------------
-- 7. Payments: validate links and keep invoice status in sync
-- ---------------------------------------------------------------------
ALTER TABLE public.payments ALTER COLUMN recorded_by SET DEFAULT auth.uid();

ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_type_valid;
ALTER TABLE public.payments ADD CONSTRAINT payments_type_valid
  CHECK (payment_type IN ('incoming', 'outgoing')) NOT VALID;

ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_amount_positive;
ALTER TABLE public.payments ADD CONSTRAINT payments_amount_positive
  CHECK (amount > 0) NOT VALID;

CREATE OR REPLACE FUNCTION public.check_payment()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.invoice_id IS NOT NULL THEN
    IF NEW.payment_type <> 'incoming' THEN
      RAISE EXCEPTION 'Only money received from a client can be linked to an invoice.';
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM public.invoices WHERE id = NEW.invoice_id AND project_id = NEW.project_id
    ) THEN
      RAISE EXCEPTION 'That invoice belongs to a different project.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS check_payment ON public.payments;
CREATE TRIGGER check_payment BEFORE INSERT OR UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.check_payment();

CREATE OR REPLACE FUNCTION public.sync_invoice_payment_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  ids uuid[] := ARRAY[]::uuid[];
BEGIN
  IF TG_OP IN ('INSERT', 'UPDATE') AND NEW.invoice_id IS NOT NULL THEN
    ids := ids || NEW.invoice_id;
  END IF;
  IF TG_OP IN ('UPDATE', 'DELETE') AND OLD.invoice_id IS NOT NULL THEN
    ids := ids || OLD.invoice_id;
  END IF;
  IF cardinality(ids) = 0 THEN
    RETURN NULL;
  END IF;

  UPDATE public.invoices i
  SET status = CASE
                 WHEN t.received >= i.total_amount AND i.total_amount > 0 THEN 'paid'
                 WHEN i.status = 'paid' THEN 'sent'
                 ELSE i.status
               END,
      paid_date = CASE
                    WHEN t.received >= i.total_amount AND i.total_amount > 0 THEN t.last_payment
                    ELSE NULL
                  END
  FROM (
    SELECT inv.id,
           COALESCE(SUM(pm.amount), 0) AS received,
           MAX(pm.payment_date) AS last_payment
    FROM public.invoices inv
    LEFT JOIN public.payments pm
      ON pm.invoice_id = inv.id AND pm.payment_type = 'incoming'
    WHERE inv.id = ANY (ids)
    GROUP BY inv.id
  ) t
  WHERE i.id = t.id AND i.status <> 'cancelled';

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS sync_invoice_payment_status ON public.payments;
CREATE TRIGGER sync_invoice_payment_status AFTER INSERT OR UPDATE OR DELETE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.sync_invoice_payment_status();

-- ---------------------------------------------------------------------
-- 8. Indexes for the queries the app runs
-- ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS project_tasks_project_id_idx ON public.project_tasks (project_id);
CREATE INDEX IF NOT EXISTS project_tasks_assigned_to_idx ON public.project_tasks (assigned_to);
CREATE INDEX IF NOT EXISTS project_budgets_project_id_idx ON public.project_budgets (project_id);
CREATE INDEX IF NOT EXISTS team_members_user_id_idx ON public.team_members (user_id);
CREATE INDEX IF NOT EXISTS expenses_project_id_idx ON public.expenses (project_id);
CREATE INDEX IF NOT EXISTS expenses_status_idx ON public.expenses (status);
CREATE INDEX IF NOT EXISTS invoices_project_id_idx ON public.invoices (project_id);
CREATE INDEX IF NOT EXISTS payments_project_id_idx ON public.payments (project_id);
CREATE INDEX IF NOT EXISTS payments_invoice_id_idx ON public.payments (invoice_id);
