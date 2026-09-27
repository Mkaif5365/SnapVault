import type { Metadata } from "next"
import { LegalPage, LegalSection, LEGAL_CONTACT_EMAIL } from "@/components/legal/LegalPage"

export const metadata: Metadata = {
  title: "Privacy Policy | SnapVault",
  description: "What SnapVault collects, where it is stored, and who can see it.",
}

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="SnapVault is a disposable camera for events. Hosts create a vault, guests take photos and videos in their browser, and everything stays hidden until the host's reveal time. This page explains what we collect to make that work, where it is stored, and who can see it."
    >
      <LegalSection title="What we collect">
        <p><strong>Hosts</strong> (people who create events):</p>
        <ul>
          <li>Your email address, and a password if you sign up with email. Passwords are stored hashed by our authentication provider, never in plain text.</li>
          <li>If you use Google sign-in: your Google account email address, name and profile picture. We request only the basic <code>openid</code>, <code>email</code> and <code>profile</code> scopes.</li>
          <li>The events you create: name, description, reveal time, photo limit and event code.</li>
        </ul>
        <p><strong>Guests</strong> (people who join an event):</p>
        <ul>
          <li>The name you type when joining. It is shown to the host and attached to the photos you take.</li>
          <li>The photos and videos you capture or upload, with the time they were added.</li>
          <li>A random guest ID and your name, saved in your own browser (localStorage) so you stay joined when you come back.</li>
        </ul>
        <p>Guests do not need an account, and we do not ask guests for an email address.</p>
      </LegalSection>

      <LegalSection title="How we use it">
        <ul>
          <li>To sign hosts in and show them their events.</li>
          <li>To let guests join an event, take photos, and see the gallery after the reveal time.</li>
          <li>To show hosts who joined, how many shots were taken, and who took them.</li>
        </ul>
        <p>We do not sell your data, use it for advertising, or share it with data brokers. SnapVault has no analytics, advertising or tracking scripts.</p>
      </LegalSection>

      <LegalSection title="Google user data">
        <p>
          If you sign in with Google, we use your Google email, name and profile picture only to create and identify your host account. We do not use Google user data for advertising, do not sell it, and do not transfer it to anyone except the service providers listed below that run the sign-in itself.
          Our use of information received from Google APIs adheres to the{" "}
          <a href="https://developers.google.com/terms/api-services-user-data-policy" className="text-ink-100 underline decoration-white/20 underline-offset-4 hover:decoration-flare-500">
            Google API Services User Data Policy
          </a>
          , including the Limited Use requirements.
        </p>
      </LegalSection>

      <LegalSection title="Where it is stored">
        <ul>
          <li><strong>Supabase</strong> stores accounts, events, guest names and photo records (database and authentication).</li>
          <li><strong>Telegram</strong> stores the photo and video files themselves, in a private chat controlled by the SnapVault operator through the Telegram Bot API.</li>
          <li>Files larger than 4 MB pass through a private <strong>Supabase Storage</strong> bucket for a few seconds on their way to Telegram, and are deleted from it immediately after.</li>
          <li><strong>Vercel</strong> hosts the website and runs the server code.</li>
        </ul>
        <p>These providers process data on our behalf and may store it in countries other than yours.</p>
      </LegalSection>

      <LegalSection title="Who can see photos and videos">
        <ul>
          <li><strong>Before the reveal time:</strong> only the host of the event.</li>
          <li><strong>After the reveal time:</strong> anyone who has the event code or link, including all guests. Only share your event code with people you want to see the gallery.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Cookies and local storage">
        <p>
          We use cookies only to keep hosts signed in. Guests' names and guest IDs are kept in the browser's local storage on their own device. We do not use advertising or tracking cookies.
        </p>
      </LegalSection>

      <LegalSection title="Keeping and deleting data">
        <ul>
          <li>Hosts can delete individual photos and videos, remove or kick guests, and delete whole events from the dashboard. This removes them from SnapVault.</li>
          <li>Copies of files may remain in the Telegram storage chat after deletion in the app. To have files removed completely, or to delete your account, email{" "}
            <a href={`mailto:${LEGAL_CONTACT_EMAIL}`} className="text-ink-100 underline decoration-white/20 underline-offset-4 hover:decoration-flare-500">{LEGAL_CONTACT_EMAIL}</a>{" "}
            and we will do it within 30 days.
          </li>
          <li>Guests can ask the event host, or email us, to have their photos removed.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Children">
        <p>SnapVault is not directed at children under 13, and hosts must be at least 13 years old (or older where local law requires).</p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>If we change this policy, we will update the effective date at the top of this page. Significant changes will be shown on the site before they take effect.</p>
      </LegalSection>
    </LegalPage>
  )
}
