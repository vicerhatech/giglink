import { Link } from "react-router-dom";
import { PublicPage } from "./PublicShell";

const faqItems = [
  ["What does it cost to post a gig?", "A Free gig requires a ₦5,000 posting fee before it is published. A Paid gig requires a ₦10,000 posting fee before publication."],
  ["What is the difference between Free and Paid gigs?", "Free and Paid identify the type of opportunity. Paid gigs show the talent payment range set by the customer; GigLink does not hold or pay that talent fee in this MVP."],
  ["Why can’t I see every Paid gig?", "A talent can browse Paid gigs until they receive their first accepted Paid gig. After that, Paid gig browsing requires an active ₦5,000 monthly subscription. Free gigs remain visible."],
  ["When is an event location shared?", "Exact event location is kept off normal talent browsing responses. It becomes available only after that talent’s own application is accepted."],
  ["Why do I need three audition demos?", "Each position includes exactly three requested audition songs. An application needs one demo video for every requested song so the customer can review a consistent set."],
  ["What happens when I withdraw an application?", "You can withdraw a pending application. A withdrawn application is no longer active for that position. Accepted applications cannot be withdrawn in this MVP."],
];

export function AboutPage() {
  return <PublicPage eyebrow="About GigLink" title="A more practical way to book live event talent."><div className="prose-grid"><section><h2>Built for the details that matter.</h2><p>GigLink is a marketplace for event hosts looking for instrumentalists and backup vocalists, and for performers looking for suitable opportunities.</p><p>Instead of vague requests and guesswork, each position has a clear brief and three requested audition songs. Hosts can review like-for-like demos before deciding who to accept.</p></section><aside className="side-note"><span>Our focus</span><strong>Clear gig briefs, thoughtful auditions, and protected event details.</strong></aside></div></PublicPage>;
}

export function HowItWorksPage() {
  return <PublicPage eyebrow="How it works" title="From event brief to accepted application."><div className="steps-page"><section><span>For customers</span><h2>Set the brief. Review the work. Choose with confidence.</h2><ol><li><b>01</b><p>Create a Free or Paid gig draft with the roles, slots, date, and exact location.</p></li><li><b>02</b><p>Set three audition songs for every position, then publish after the posting fee is verified.</p></li><li><b>03</b><p>Review applications and their demos, then accept or reject applicants for each position.</p></li></ol></section><section className="steps-dark"><span>For talent</span><h2>Find a role. Show the requested songs. Track the result.</h2><ol><li><b>01</b><p>Complete your talent profile and browse the gigs available to you.</p></li><li><b>02</b><p>Choose a position and upload one demo for each of its three requested songs.</p></li><li><b>03</b><p>Track your application status. Accepted applicants receive the exact event location.</p></li></ol></section></div></PublicPage>;
}

export function HelpPage() {
  return <PublicPage eyebrow="Help centre" title="Answers for customers and talent."><div className="faq-list">{faqItems.map(([question, answer]) => <details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</div><div className="page-cta"><p>Looking for the booking process?</p><Link to="/how-it-works">See how GigLink works →</Link></div></PublicPage>;
}

export function PrivacyPage() {
  return <PublicPage eyebrow="Privacy" title="How this MVP handles your information."><div className="legal-copy"><p>This page describes the intended privacy approach for the GigLink MVP. It is a product explanation, not a legal policy or compliance statement.</p><h2>Information used in GigLink</h2><p>Account details, talent profile information, gig details, application notes, and audition-video references are used to operate the marketplace flow.</p><h2>Event location</h2><p>Exact location is treated as sensitive. It is available to the owning customer and administrators, and to a talent only after that talent has an accepted application for the gig.</p><h2>Videos and payments</h2><p>Audition videos are uploaded through the server to the configured media provider. Posting-fee and subscription demonstrations use Paystack Test Mode in this MVP.</p><h2>Questions</h2><p>If a support channel is configured for your GigLink deployment, use the contact route provided by your project administrator.</p></div></PublicPage>;
}

export function TermsPage() {
  return <PublicPage eyebrow="Terms" title="Using GigLink in the MVP demo."><div className="legal-copy"><p>These plain-language MVP terms describe the intended use of GigLink for the project demo. They are not legal advice or a substitute for production terms.</p><h2>Marketplace role</h2><p>GigLink helps customers post opportunities and helps talent submit audition applications. Talent fees shown on Paid gigs are informational; GigLink does not process talent payouts or hold funds in escrow.</p><h2>Accurate submissions</h2><p>Customers should provide accurate gig briefs. Talent should submit their own three requested-song demos and should not misrepresent their experience or role.</p><h2>Payments and subscriptions</h2><p>Posting fees and talent subscriptions are demonstrated through Paystack Test Mode. A gig is published only after server-side verification of its posting payment.</p><h2>Account access</h2><p>Users are responsible for activity on their accounts. Accounts may be suspended through the administration flow described in the MVP.</p></div></PublicPage>;
}

export function ContactPage() {
  return <PublicPage eyebrow="Contact" title="Support details for this demo."><div className="contact-panel"><h2>A support channel has not been configured yet.</h2><p>This GigLink MVP does not publish a support email address. Ask your project administrator for the contact method configured for your deployment.</p><Link className="button button-primary" to="/help">Browse help topics →</Link></div></PublicPage>;
}
