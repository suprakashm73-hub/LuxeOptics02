import { AdminTabs } from '@/components/admin-tabs';
import { HelplineForm } from '@/components/admin-forms';
import { requireAdmin } from '@/lib/auth';
import { getHelpline } from '@/lib/repo';

export default async function AdminSettings() {
  await requireAdmin();
  const helpline = await getHelpline();
  return (
    <>
      <p className="eyebrow">STORE MANAGEMENT</p>
      <h1 className="panel-title">Helpline</h1>
      <AdminTabs />
      <HelplineForm current={helpline} />
      <p className="muted">This number appears in the customer support section.</p>
    </>
  );
}
