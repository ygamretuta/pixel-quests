"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { removeSubscription, saveSubscription, sendTestNotification } from "@/features/notifications/actions";
import { urlBase64ToUint8Array } from "@/features/notifications/lib/applicationServerKey";
import { cx } from "@/shared/lib/css/cx";
import { panelClass } from "@/shared/ui/Panel/panelClass";
import { PixelButton } from "@/shared/ui/PixelButton/PixelButton";
import "./NotificationSettings.css";

type Support = "unknown" | "unsupported" | "needs-install" | "ready";

function readSupport(): Support {
  const capable = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
  if (capable) return "ready";
  // iPhone and iPad only allow web push for apps added to the Home Screen.
  const isApple = /iPhone|iPad|iPod/.test(navigator.userAgent);
  return isApple ? "needs-install" : "unsupported";
}

const subscribeNever = () => () => {};

type NotificationSettingsProps = { publicKey: string; devices: number };

export function NotificationSettings({ publicKey, devices }: NotificationSettingsProps) {
  const support = useSyncExternalStore(subscribeNever, readSupport, () => "unknown" as Support);
  const [subscribed, setSubscribed] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Is this phone already signed up? (Needs the service worker, so it can only be asked after load.)
  useEffect(() => {
    if (support !== "ready") return;
    let cancelled = false;
    void navigator.serviceWorker
      .getRegistration("/sw.js")
      .then((registration) => registration?.pushManager.getSubscription())
      .then((existing) => {
        if (!cancelled) setSubscribed(Boolean(existing));
      })
      .catch(() => {
        if (!cancelled) setSubscribed(false);
      });
    return () => {
      cancelled = true;
    };
  }, [support]);

  async function turnOn() {
    setBusy(true);
    setMessage(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setMessage("Notifications are blocked. Allow them for Pixel Quests in your phone's settings.");
        return;
      }
      await navigator.serviceWorker.register("/sw.js");
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      await saveSubscription(subscription.toJSON() as Parameters<typeof saveSubscription>[0]);
      setSubscribed(true);
      setMessage("On! Tap \"Send test\" to try it.");
    } catch {
      setMessage("Could not turn notifications on. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function turnOff() {
    setBusy(true);
    setMessage(null);
    try {
      const registration = await navigator.serviceWorker.getRegistration("/sw.js");
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) {
        await removeSubscription(subscription.endpoint);
        await subscription.unsubscribe();
      }
      setSubscribed(false);
      setMessage("Notifications are off on this phone.");
    } catch {
      setMessage("Could not turn notifications off. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function test() {
    setBusy(true);
    try {
      const sent = await sendTestNotification();
      setMessage(sent > 0 ? "Sent! It should arrive in a few seconds." : "Nothing was sent. Turn notifications on first.");
    } catch {
      setMessage("Could not send the test.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={cx("notification-settings", panelClass())}>
      <h2 className="notification-settings__title">Notifications</h2>
      <p className="notification-settings__hint">
        Get a message on this phone when she asks for a reward. {devices} {devices === 1 ? "phone is" : "phones are"} signed up.
      </p>

      {support === "needs-install" && (
        <p className="notification-settings__note">
          On iPhone, first add Pixel Quests to your Home Screen (Share, then Add to Home Screen). Open it from
          the new icon, come back to this page, and tap Turn on.
        </p>
      )}
      {support === "unsupported" && (
        <p className="notification-settings__note">This browser can&apos;t receive notifications.</p>
      )}

      {support === "ready" && (
        <div className="notification-settings__buttons">
          {subscribed ? (
            <PixelButton variant="secondary" disabled={busy} onClick={turnOff}>
              Turn off
            </PixelButton>
          ) : (
            <PixelButton disabled={busy || subscribed === null} onClick={turnOn}>
              Turn on
            </PixelButton>
          )}
          <PixelButton variant="secondary" disabled={busy || devices === 0} onClick={test}>
            Send test
          </PixelButton>
        </div>
      )}

      {message && (
        <p className="notification-settings__message" role="status">
          {message}
        </p>
      )}
    </section>
  );
}
