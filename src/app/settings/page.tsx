import { Suspense } from "react";
import { BedtimeSettings } from "@/features/bedtime/components/BedtimeSettings/BedtimeSettings";
import { getBedtimeSettings } from "@/features/bedtime/server/bedtime";
import { NotificationSettings } from "@/features/notifications/components/NotificationSettings/NotificationSettings";
import { countPushDevices } from "@/features/notifications/server/push";
import { ParentOnly } from "@/features/parent/components/ParentOnly/ParentOnly";
import { isParent } from "@/features/parent/server/auth";
import { Loading } from "@/shared/ui/Loading/Loading";
import { PageLayout } from "@/shared/ui/PageLayout/PageLayout";

export const metadata = { title: "Settings · Pixel Quests" };

async function SettingsLoader() {
  if (!(await isParent())) return <ParentOnly />;
  const [bedtime, devices] = await Promise.all([getBedtimeSettings(), countPushDevices()]);

  return (
    <PageLayout title="Settings">
      <BedtimeSettings settings={bedtime} />
      <NotificationSettings publicKey={process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ""} devices={devices} />
    </PageLayout>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<Loading>Loading...</Loading>}>
      <SettingsLoader />
    </Suspense>
  );
}
