import { Suspense } from "react";
import { BackupSettings } from "@/features/backup/components/BackupSettings/BackupSettings";
import { BedtimeSettings } from "@/features/bedtime/components/BedtimeSettings/BedtimeSettings";
import { getBedtimeSettings } from "@/features/bedtime/server/bedtime";
import { NotificationSettings } from "@/features/notifications/components/NotificationSettings/NotificationSettings";
import { countPushDevices } from "@/features/notifications/server/push";
import { ChildrenSettings } from "@/features/parent/components/ChildrenSettings/ChildrenSettings";
import { ParentOnly } from "@/features/parent/components/ParentOnly/ParentOnly";
import { isParent } from "@/features/parent/server/auth";
import { getChild, listChildren } from "@/shared/server/child";
import { Loading } from "@/shared/ui/Loading/Loading";
import { PageLayout } from "@/shared/ui/PageLayout/PageLayout";

export const metadata = { title: "Settings · Pixel Quests" };

async function SettingsLoader() {
  if (!(await isParent())) return <ParentOnly />;
  const child = await getChild();
  const [bedtime, devices, children] = await Promise.all([
    getBedtimeSettings(child.id),
    countPushDevices(),
    listChildren(),
  ]);

  return (
    <PageLayout title="Settings">
      <ChildrenSettings kids={children} currentId={child.id} />
      <BedtimeSettings settings={bedtime} childName={child.name} />
      <NotificationSettings
        publicKey={process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ""}
        devices={devices}
        childName={child.name}
      />
      <BackupSettings />
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
