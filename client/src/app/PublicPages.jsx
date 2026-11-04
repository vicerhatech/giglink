import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { PublicFooter, PublicHeader, PublicPage } from "./PublicShell";
import { BookingGuide } from "./LandingPage";

const helpGroups = [
  { id: "getting-started", title: "Getting started", items: [
    ["What is GigLink?", "GigLink connects event hosts with instrumentalists and backup vocalists. Hosts post gigs, performers send demo videos, and hosts choose who to hire."],
    ["Which account should I choose?", "Choose Customer / Event host if you are organising an event. Choose Talent if you play an instrument or sing backup vocals and want to apply for gigs."],
    ["Can I browse without an account?", "Yes. Explore shows public event previews. Create a Talent account to see the gigs available to you and apply. Exact event locations are never shown in public previews."],
  ] },
  { id: "hosting", title: "Posting a gig", items: [
    ["What does a role mean?", "A role is the musician or vocalist you need, such as Guitar or Backup vocalist. Set how many people you need for that role. Add another role if you also need a different instrument or type of performer."],
    ["How many songs or samples should I ask for?", "Request 1–3 songs or performance samples for each role. One is enough to get started. Add a second or third only if it helps you choose. Give each request a clear, different title."],
    ["What can I request as a performance sample?", "You can name a song, or describe a short piece of evidence such as ‘A 60-second jazz improvisation’ or ‘A harmony demonstration.’ Applicants upload one demo video for every request."],
    ["Why is my gig still a draft?", "Creating a gig saves a private, unpaid draft. Open My Gigs, select the gig, and use the pay-and-publish button. The gig becomes public only after the server verifies the posting payment."],
  ] },
  { id: "applying", title: "Applying for gigs", items: [
    ["How many videos do I need to send?", "Send exactly the number the host requested: 1, 2, or 3. Each video must match a different requested song or sample. You do not need extra videos when the host asks for only one."],
    ["Can I change or withdraw an application?", "You can withdraw a pending application in My Applications. If the role is still available and you have no pending or accepted application for it, Reapply lets you make a new application. Your old withdrawn application stays in your history."],
    ["How will I know if I was chosen?", "Check My Applications. Pending means the host has not decided yet. Accepted means you were chosen; Rejected means you were not chosen. Withdrawn means you removed your application."],
  ] },
  { id: "payments", title: "Fees and subscriptions", items: [
    ["What is the difference between Free and Paid gigs?", "Paid gigs show the amount the host plans to pay the performer, starting at ₦25,000. Free gigs do not include a performer payment range. Both types have a separate posting fee."],
    ["How much does posting cost?", "The posting fee is ₦5,000 for a Free gig or ₦10,000 for a Paid gig. It is separate from the performer’s fee. Payments in this demo use Paystack Test Mode."],
    ["When do I need a Talent subscription?", "After your first accepted Paid gig, you need an active ₦5,000 subscription to browse new Paid gigs. Each verified subscription lasts 30 days. Free gigs and gigs you have already been accepted for remain accessible."],
    ["Does GigLink pay the performer?", "No. The payment range on a Paid gig describes the host’s intended compensation. GigLink does not hold that money or make performer payouts in this demo."],
  ] },
  { id: "privacy", title: "Privacy and account help", items: [
    ["When can I see the exact venue?", "Only after your own application for that gig is accepted. Being able to see a public preview or having a pending application does not reveal the venue."],
    ["Where can I update my details?", "Use Settings to update your name and phone number. Talent can edit their musical background and upload a profile photo in Profile. Email changes are not currently supported."],
    ["What if something is not working?", "Try refreshing and signing in again. If a payment or upload fails, keep the error message and the gig title so the project team can investigate. Never share your password, access token, or payment credentials."],
  ] },
];

export function AboutPage() {
  return <PublicPage eyebrow="About GigLink" title="Good music starts with the right connection.">
    <p className="support-lede">We make it easier for event hosts to find instrumentalists and backup vocalists—and for performers to find work that suits their sound.</p>
    <section className="about-story"><div><p className="eyebrow">Why we’re here</p><h2>Less back-and-forth.<br />More confidence.</h2></div><div><p>Booking live music involves more than a name and a profile photo. You need to know what the event calls for and hear how a performer fits.</p><p>GigLink brings the event details, the musicians needed, and the audition requests into one clear brief. Hosts can ask for 1–3 songs or performance samples, then review matching videos before choosing their team.</p></div></section>
    <section className="support-card-grid"><article><span>FOR EVENT HOSTS</span><h2>Build your lineup.</h2><p>Tell performers about your event, choose the roles you need, and review applications in one place.</p><Link className="text-link" to="/register?role=customer">Join as an event host →</Link></article><article><span>FOR PERFORMERS</span><h2>Show what you do.</h2><p>Share your experience, find a suitable role, and send the requested demo videos to show your skills.</p><Link className="text-link" to="/register?role=talent">Join as talent →</Link></article></section>
    <section className="about-values"><p className="eyebrow">What matters here</p><h2>Clear requests. Fair comparisons. Private details.</h2><div className="support-card-grid three"><article><h3>Start small</h3><p>One song or sample can be enough. Request up to three when a little more context helps.</p></article><article><h3>Know what to expect</h3><p>See the gig type, the requested performance, and the status of your application.</p></article><article><h3>Protect the venue</h3><p>Exact locations are shared with accepted performers, not with everyone browsing.</p></article></div></section>
    <aside className="support-banner"><div><h2>Want to see the whole process?</h2><p>Follow the steps from posting a gig to choosing your musicians.</p></div><Link className="button button-primary" to="/how-it-works">How it works →</Link></aside>
  </PublicPage>;
}

export function HowItWorksPage() {
  return <div className="site-page"><PublicHeader /><main className="booking-guide"><div className="public-container guide-intro"><p className="eyebrow">How it works</p><h1>From your event to your lineup.</h1><p>Hosting an event? Tell people who you need and what you’d like to hear. Looking for a gig? Pick a role, send your demos, and follow the host’s decision.</p><nav className="guide-paths" aria-label="Choose a walkthrough"><a href="#for-customers">I’m hosting an event ↓</a><a href="#for-talents">I’m looking for gigs ↓</a></nav></div><BookingGuide /></main><PublicFooter /></div>;
}

export function HelpPage() {
  const [search, setSearch] = useState("");
  const { hash } = useLocation();
  const [openGroup, setOpenGroup] = useState(() => hash.slice(1) || null);
  useEffect(() => { if (hash) { setSearch(""); setOpenGroup(hash.slice(1)); } }, [hash]);
  const query = search.trim().toLocaleLowerCase();
  const groups = helpGroups.map((group) => ({ ...group, items: group.items.filter(([question, answer]) => `${group.title} ${question} ${answer}`.toLocaleLowerCase().includes(query)) })).filter((group) => group.items.length);
  return <PublicPage eyebrow="Help centre" title="A little help, right when you need it.">
    <p className="support-lede">Find a quick answer about posting a gig, applying, fees, or your account.</p>
    <div className="help-search"><label htmlFor="help-search">What do you need help with?</label><div><input id="help-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Try “demo videos”, “posting fee”, or “venue”" />{search && <button type="button" onClick={() => setSearch("")}>Clear</button>}</div></div>
    <p className="help-results" role="status">{query ? `${groups.reduce((total, group) => total + group.items.length, 0)} answers found` : "Select a topic to see its questions, or search for an answer."}</p>
    <div className="help-layout"><aside><h2>Need the walkthrough?</h2><p>See what to do next, whether you are hiring or applying.</p><Link className="text-link" to="/how-it-works">How it works →</Link></aside><div>{groups.length ? groups.map((group) => {
      const expanded = Boolean(query) || openGroup === group.id;
      return <section className="help-group help-category" key={group.id} id={group.id}><h2><button className="help-category-toggle" type="button" aria-expanded={expanded} aria-controls={`questions-${group.id}`} onClick={() => { setSearch(""); setOpenGroup(expanded ? null : group.id); }}><span>{group.title}<small>{group.items.length} questions</small></span><span className="help-category-icon" aria-hidden="true">{expanded ? "−" : "+"}</span></button></h2>{expanded && <div className="faq-list" id={`questions-${group.id}`}>{group.items.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div>}</section>;
    }) : <div className="public-state"><h2>No matching answers yet.</h2><p>Try a shorter word or clear your search to see all topics.</p><button className="button button-secondary" onClick={() => setSearch("")}>Show all topics</button></div>}</div></div>
    <aside className="support-banner"><div><h2>Still need a hand?</h2><p>Find the next step on our contact page.</p></div><Link className="button button-secondary" to="/contact">Contact us →</Link></aside>
  </PublicPage>;
}

export function ContactPage() {
  return <PublicPage eyebrow="Contact us" title="Let’s get you back to making music.">
    <p className="support-lede">Choose what you need help with. These are the quickest places to start.</p>
    <section className="support-card-grid three"><article><span>YOUR ACCOUNT</span><h2>Profile or sign-in?</h2><p>Find where to update your details and what to do when something is not working.</p><Link className="text-link" to="/help#privacy">Account help →</Link></article><article><span>YOUR NEXT GIG</span><h2>Posting or applying?</h2><p>Understand roles, audition requests, and how to follow an application.</p><Link className="text-link" to="/help#applying">Application help →</Link></article><article><span>FEES & ACCESS</span><h2>A payment question?</h2><p>Check posting fees, Talent subscriptions, and access to Paid gigs.</p><Link className="text-link" to="/help#payments">Payment help →</Link></article></section>
    <section className="contact-team"><div><p className="eyebrow">Contact the project team</p><h2>Need someone to look into it?</h2><p>A support email or message service has not been connected to this demo yet. Please use the contact channel provided by the person who shared GigLink with you.</p></div><aside><h3>What to include</h3><ul><li>The page you were using.</li><li>The gig title, if it concerns an event.</li><li>What you expected and what happened.</li><li>The error message or a screenshot with private details hidden.</li></ul><p>Never send passwords, sign-in tokens, or payment credentials.</p></aside></section>
    <aside className="support-banner"><div><h2>Just getting started?</h2><p>Our short guide explains the steps for hosts and performers.</p></div><Link className="button button-primary" to="/how-it-works">See how it works →</Link></aside>
  </PublicPage>;
}

export function PrivacyPage() {
  return <PublicPage eyebrow="Privacy" title="Your details, handled with care."><div className="legal-copy"><p>This page explains how the GigLink demo uses your information. It is a product guide, not a legal policy.</p><h2>Your account and profile</h2><p>Your account details, musical background, gig details, and demo-video references help hosts and performers use GigLink.</p><h2>Exact event locations</h2><p>Exact locations are kept private. Only the host, an administrator, or a performer whose own application is accepted can access the exact venue.</p><h2>Videos and payments</h2><p>Demo videos and profile photos use the configured media provider. Payments in this demo use Paystack Test Mode.</p><h2>Need help?</h2><p>Visit <Link to="/contact">Contact us</Link> for guidance on reaching the project team. Do not share passwords or payment credentials.</p></div></PublicPage>;
}

export function TermsPage() {
  return <PublicPage eyebrow="Terms" title="Using the GigLink demo."><div className="legal-copy"><p>These notes explain the intended use of this demo. They are not legal advice or production terms.</p><h2>What GigLink does</h2><p>GigLink helps event hosts share gigs and choose performers. It does not hold performer fees, make payouts, or arrange refunds.</p><h2>Be clear and honest</h2><p>Hosts should describe their event accurately and request 1–3 songs or performance samples per role. Performers should submit their own video for every requested song or sample and describe their skills honestly.</p><h2>Fees and subscriptions</h2><p>Posting and subscription payments use Paystack Test Mode. Posting becomes public only after the server verifies payment.</p><h2>Your account</h2><p>You are responsible for activity on your account. Administrators can suspend or reactivate accounts through the app’s account management tools.</p></div></PublicPage>;
}
