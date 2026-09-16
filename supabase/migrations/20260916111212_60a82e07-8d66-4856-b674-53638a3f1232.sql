-- Trigger and internal functions: not meant to be called via the API at all
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.guard_task_update() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.guard_expense_update() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.prepare_invoice() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.check_payment() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.sync_invoice_payment_status() FROM PUBLIC, anon, authenticated;

-- Role-check helpers: used inside policies, so signed-in users keep EXECUTE, anon loses it
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

REVOKE ALL ON FUNCTION public.is_staff(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.is_manager(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_manager(uuid) TO authenticated;