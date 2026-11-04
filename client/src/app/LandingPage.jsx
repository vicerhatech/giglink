import { PublicFooter, PublicHeader } from "./PublicShell";
import { Link } from "react-router-dom";
import { EventPreviews } from "./ExplorePage";
import "./public-refresh.css";

const customerSteps = [
  ["01", "Describe your event", "Create a gig with the date, talent needed, and the songs applicants should prepare."],
  ["02", "Review real audition demos", "Watch the requested demo videos and choose the people who fit your event."],
  ["03", "Build your event team", "Accept the people who fit your event. Their exact venue details stay protected until then."],
];

const talentSteps = [
  ["01", "Set up your profile", "Share your role, instruments, and experience so customers understand your sound."],
  ["02", "Find fitting gigs", "Browse available Free and Paid opportunities and see the details you need to apply."],
  ["03", "Submit your best work", "Send one video for each requested song or sample (1–3 in total), then track the host’s decision."],
];

function Arrow() {
  return <span aria-hidden="true" className="landing-arrow">→</span>;
}

export function BookingGuide() {
  return (
    <>
        <section className="how-section" id="how-it-works">
          <div className="journeys">
            <article className="journey" id="for-customers">
              <div className="journey-heading"><span className="journey-label">For customers</span><h2>Bring the right people into the room.</h2></div>
              <ol>
                {customerSteps.map(([number, title, text]) => <li key={number}><span>{number}</span><div><h4>{title}</h4><p>{text}</p></div></li>)}
              </ol>
              <Link to="/register?role=customer" className="text-link">Plan your next gig <Arrow /></Link>
            </article>
            <article className="journey journey-dark" id="for-talents">
              <div className="journey-heading"><span className="journey-label">For talent</span><h2>Put your performance in front of the right host.</h2></div>
              <ol>
                {talentSteps.map(([number, title, text]) => <li key={number}><span>{number}</span><div><h4>{title}</h4><p>{text}</p></div></li>)}
              </ol>
              <Link to="/register?role=talent" className="text-link">Explore your path <Arrow /></Link>
            </article>
          </div>
        </section>

        <section className="feature-section" id="why-giglink">
          <div className="feature-intro">
            <p className="eyebrow">Built around the booking process</p>
            <h2>Everything has a purpose.</h2>
            <p>GigLink keeps the focus on the information that helps hosts choose and performers apply with confidence.</p>
          </div>
          <div className="feature-list">
            <article><span>01</span><h3>Specific audition requests</h3><p>Ask for 1–3 songs or performance samples per role. Applicants send one matching video for each request.</p></article>
            <article><span>02</span><h3>Free and Paid gig types</h3><p>Hosts can post the opportunity that fits their event, with Paid gigs showing the intended talent fee range.</p></article>
            <article><span>03</span><h3>Location stays protected</h3><p>Exact event location is released to a talent only after their application has been accepted.</p></article>
            <article><span>04</span><h3>Decisions that stay visible</h3><p>Talents can follow their application status while customers manage applicants for each role.</p></article>
          </div>
        </section>

        <section className="closing-section" id="get-started">
          <div>
            <p className="eyebrow">Ready when your event is</p>
            <h2>Make the next live set a better fit.</h2>
          </div>
          <div className="closing-actions">
            <Link className="button button-light" to="/register?role=customer">Post as a customer <Arrow /></Link>
            <Link className="button button-outline-light" to="/register?role=talent">Join as talent <Arrow /></Link>
          </div>
        </section>
    </>
  );
}

export function LandingPage() {
  return <div className="site-page"><PublicHeader /><main>
    <section className="home-hero public-container">
      <div><p className="eyebrow">Good people. Great live music.</p><h1>The right sound.<br /><em>The right people.</em><br />Your next event.</h1><p className="home-lede">Bring your event to life with instrumentalists and backup vocalists. Share a clear brief, hear their audition demos, and build a team that fits.</p><div className="home-actions"><Link className="button button-primary" to="/register?role=customer">Find talent <Arrow /></Link><Link className="button button-secondary" to="/explore">Explore events <Arrow /></Link></div><p className="home-caption">A place for event hosts, instrumentalists, and backup vocalists.</p></div>
      <div className="sound-stage" aria-label="Live music illustration"><span className="stage-label">MADE FOR THE LIVE MOMENT</span><div className="sound-bars" aria-hidden="true">{[34, 62, 90, 52, 110, 76, 42, 92, 60].map((height, i) => <i key={i} style={{ "--bar-height": `${height}px` }} />)}</div><div className="stage-copy"><span>From the first note</span><strong>to the last encore.</strong></div><div className="stage-ticket"><span>YOUR NEXT EVENT</span><strong>A sound worth gathering for.</strong><span>Instrumentalists · Backup vocalists</span></div></div>
    </section>
    <section className="occasion-band"><div className="public-container"><p className="eyebrow">Whatever brings you together</p><div className="occasion-list">{["Wedding receptions", "Worship gatherings", "Corporate events", "Private celebrations"].map((item) => <span key={item}>{item}</span>)}</div></div></section>
    <section className="home-section public-container"><div className="home-heading"><div><p className="eyebrow">Find your sound</p><h2>Different roles.<br />One memorable performance.</h2></div><p>Put together the musical lineup your event needs. Every gig specifies the musicians needed, how many people to hire, and what applicants should play or sing.</p></div><div className="role-cards">{[["01", "Keys & piano", "Set the mood, carry the melody, and fill the room."], ["02", "Strings & rhythm", "Find guitar, bass, and percussion roles for the right groove."], ["03", "Backup vocals", "Add harmony, texture, and the voices that bring a set together."]].map(([n, title, copy]) => <Link to="/explore" className="role-card" key={n}><span>{n} / THE LINEUP</span><h3>{title}</h3><p>{copy}</p><b>Explore opportunities ↗</b></Link>)}</div></section>
    <section className="home-section home-events"><div className="public-container"><div className="home-heading"><div><p className="eyebrow">On the board</p><h2>Your next live moment<br />could start here.</h2></div><Link className="text-link" to="/explore">View all events <Arrow /></Link></div><EventPreviews compact /></div></section>
    <section className="home-section public-container"><div className="home-heading"><div><p className="eyebrow">Less guesswork. More clarity.</p><h2>Know the brief.<br />Hear the fit.</h2></div><p>GigLink puts the important details in one place so both sides can make a better-informed choice.</p></div><div className="principle-grid">{[["A brief with purpose", "See the date, musician needed, and 1–3 songs or samples to prepare before applying."], ["Auditions you can compare", "Watch matching performance demos from each applicant, alongside their profile."], ["Private until it matters", "Exact venue details are shared only with talent whose own application has been accepted."], ["A decision you can follow", "Track pending, accepted, rejected, and withdrawn applications from your workspace."]].map(([title, copy], i) => <article key={title}><span>0{i + 1}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></section>
    <section className="home-section public-container audience-grid"><article><p className="eyebrow">For event hosts</p><h2>Make room for<br />the right talent.</h2><p>Create a Free or Paid gig, set your lineup, and review demos at your own pace. Posting fees are separate from any talent compensation.</p><Link className="button button-primary" to="/register?role=customer">Plan your next gig <Arrow /></Link></article><article><p className="eyebrow">For performers</p><h2>Your talent deserves<br />the right stage.</h2><p>Build your profile, find suitable roles, and show what you can do with the requested songs. Free gigs remain available without a subscription.</p><Link className="button button-secondary" to="/register?role=talent">Join as talent <Arrow /></Link></article></section>
    <section className="home-section public-container home-faq"><div><p className="eyebrow">Before you get started</p><h2>A few good<br />questions.</h2><Link className="text-link" to="/help">Visit the help centre <Arrow /></Link></div><div className="faq-list"><details><summary>What does Free or Paid mean?<span>+</span></summary><p>Paid gigs include a talent compensation range with a minimum of ₦25,000. Free gigs do not collect a compensation range. Posting fees are ₦5,000 for Free gigs and ₦10,000 for Paid gigs.</p></details><details><summary>Can I look around before joining?<span>+</span></summary><p>Yes. Explore shows public event previews. Sign up as talent to access eligible opportunities and apply through your workspace.</p></details><details><summary>How do the auditions work?<span>+</span></summary><p>The host requests 1–3 songs or performance samples for each role. Send one video per request so they can hear how you fit.</p></details><details><summary>Where can I learn the full process?<span>+</span></summary><p>Our <Link to="/how-it-works">How it works guide</Link> walks through posting, applying, review, and acceptance for both roles.</p></details></div></section>
    <section className="home-final"><div className="public-container"><p className="eyebrow">The next great set starts with a connection</p><h2>Let’s make something<br /><em>worth hearing.</em></h2><div className="home-actions"><Link className="button button-light" to="/register?role=customer">I’m hiring talent <Arrow /></Link><Link className="button button-outline-light" to="/register?role=talent">I’m looking for gigs <Arrow /></Link></div></div></section>
  </main><PublicFooter /></div>;
}
