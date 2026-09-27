import type { Metadata } from "next"
import Link from "next/link"
import { LegalPage, LegalSection, LEGAL_CONTACT_EMAIL } from "@/components/legal/LegalPage"

export const metadata: Metadata = {
  title: "Terms of Service | SnapVault",
  description: "The rules for using SnapVault as a host or a guest.",
}

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      intro="These terms apply to everyone who uses SnapVault, whether you host an event or join one as a guest. By using SnapVault you agree to them."
    >
      <LegalSection title="The service">
        <p>
          SnapVault lets a host create an event vault with a reveal time and a photo limit. Guests join with a code or link, take photos and short videos in their browser, and the gallery opens for everyone at the reveal time. SnapVault is currently free to use.
        </p>
      </LegalSection>

      <LegalSection title="Hosts">
        <ul>
          <li>You are responsible for your account and for keeping your password safe.</li>
          <li>You decide who gets your event code. Anyone with the code can join before the reveal and view the gallery after it.</li>
          <li>You are responsible for making sure guests are comfortable being photographed and for how you use the photos and videos from your event.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Guests">
        <ul>
          <li>The name you enter is shown to the host and attached to your photos.</li>
          <li>Only capture or upload content you have the right to share, and respect the people around you.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Your content">
        <p>
          You keep ownership of the photos and videos you add. You give SnapVault permission to store, process and display that content only as needed to run the service: keeping it in the vault, showing it to the host, and showing it to everyone with the event code after the reveal time.
        </p>
      </LegalSection>

      <LegalSection title="What is not allowed">
        <ul>
          <li>Illegal content, content that exploits minors, or content that harasses, threatens or invades someone&apos;s privacy.</li>
          <li>Content you do not have the rights to share.</li>
          <li>Trying to access vaults, accounts or data that are not yours, or disrupting the service.</li>
        </ul>
        <p>We may remove content or close accounts that break these rules.</p>
      </LegalSection>

      <LegalSection title="Limits">
        <ul>
          <li>Each upload can be up to 20 MB. Videos recorded in the camera can be up to 45 seconds.</li>
          <li>Each event has a photo limit set by its host.</li>
        </ul>
      </LegalSection>

      <LegalSection title="No warranty">
        <p>
          SnapVault is provided as is. We work to keep it running and your photos safe, but we cannot promise it will always be available or that content will never be lost. Keep your own copies of anything important; hosts can download the whole roll as a ZIP.
        </p>
      </LegalSection>

      <LegalSection title="Liability">
        <p>
          To the extent the law allows, SnapVault is not liable for indirect or consequential losses, or for content that hosts or guests add to a vault.
        </p>
      </LegalSection>

      <LegalSection title="Privacy">
        <p>
          How we handle personal data is described in our{" "}
          <Link href="/privacy" className="text-ink-100 underline decoration-white/20 underline-offset-4 hover:decoration-flare-500">Privacy Policy</Link>.
        </p>
      </LegalSection>

      <LegalSection title="Changes and contact">
        <p>
          We may update these terms and will change the effective date when we do. Questions about these terms go to{" "}
          <a href={`mailto:${LEGAL_CONTACT_EMAIL}`} className="text-ink-100 underline decoration-white/20 underline-offset-4 hover:decoration-flare-500">{LEGAL_CONTACT_EMAIL}</a>.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
