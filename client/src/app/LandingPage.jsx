import { PublicFooter, PublicHeader } from "./PublicShell";

const customerSteps = [
  ["01", "Describe your event", "Create a gig with the date, talent needed, and the songs applicants should prepare."],
  ["02", "Review real audition demos", "Compare three requested-song videos from each applicant before making a decision."],
  ["03", "Build your event team", "Accept the people who fit your event. Their exact venue details stay protected until then."],
];

const talentSteps = [
  ["01", "Set up your profile", "Share your role, instruments, and experience so customers understand your sound."],
  ["02", "Find fitting gigs", "Browse available Free and Paid opportunities and see the details you need to apply."],
  ["03", "Submit your best work", "Record the three requested songs, send your application, and track the outcome."],
];

function Arrow() {
  return <span aria-hidden="true" className="landing-arrow">→</span>;
}

export function LandingPage() {
  return (
    <div className="site-page">
      <PublicHeader />

      <main id="top">
        <section className="hero-section">
          <div className="hero-copy">
            <p className="eyebrow">For live events that need the right sound</p>
            <h1>Find the right instrumentalist or backup vocalist for your next event.</h1>
            <p className="hero-lede">GigLink brings event hosts and talented performers together through clear briefs, song-specific auditions, and straightforward decisions.</p>
            <div className="hero-actions" aria-label="Choose your path">
              <a className="button button-primary" href="#for-customers">I’m hiring talent <Arrow /></a>
              <a className="button button-secondary" href="#for-talents">I’m looking for gigs <Arrow /></a>
            </div>
            <p className="hero-note">For instrumentalists and backup vocalists.</p>
          </div>

          <div className="event-brief" aria-label="Example GigLink event brief">
            <div className="brief-topline"><span>EVENT BRIEF</span><span className="brief-dot" /></div>
            <div className="brief-title-block">
              <p>Live music for</p>
              <h2>An evening reception</h2>
            </div>
            <div className="brief-rule" />
            <div className="brief-grid">
              <div><span>Looking for</span><strong>Keyboard · Bass<br />Backup vocals</strong></div>
              <div><span>Audition</span><strong>3 requested songs</strong></div>
              <div><span>Event type</span><strong>Private event</strong></div>
              <div><span>Applications</span><strong>Reviewed by host</strong></div>
            </div>
            <div className="brief-footer"><span>GIGLINK</span><span>LIVE MUSIC, WELL MATCHED</span></div>
          </div>
        </section>

        <section className="intro-band" aria-label="GigLink overview">
          <p>Clear requests. Relevant auditions. Better-informed choices.</p>
          <div className="intro-rule" />
          <span>Made for the practical work of booking live music.</span>
        </section>

        <section className="how-section" id="how-it-works">
          <div className="section-heading">
            <p className="eyebrow">How it works</p>
            <h2>A clearer way to book or find live music work.</h2>
          </div>
          <div className="journeys">
            <article className="journey" id="for-customers">
              <div className="journey-heading"><span className="journey-label">For customers</span><h3>Bring the right people into the room.</h3></div>
              <ol>
                {customerSteps.map(([number, title, text]) => <li key={number}><span>{number}</span><div><h4>{title}</h4><p>{text}</p></div></li>)}
              </ol>
              <a href="#get-started" className="text-link">Plan your next gig <Arrow /></a>
            </article>
            <article className="journey journey-dark" id="for-talents">
              <div className="journey-heading"><span className="journey-label">For talent</span><h3>Put your performance in front of the right host.</h3></div>
              <ol>
                {talentSteps.map(([number, title, text]) => <li key={number}><span>{number}</span><div><h4>{title}</h4><p>{text}</p></div></li>)}
              </ol>
              <a href="#get-started" className="text-link">Explore your path <Arrow /></a>
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
            <article><span>01</span><h3>Specific audition requests</h3><p>Every position asks for three songs, giving applicants a clear brief and customers demos they can compare.</p></article>
            <article><span>02</span><h3>Free and Paid gig types</h3><p>Hosts can post the opportunity that fits their event, with Paid gigs showing the intended talent fee range.</p></article>
            <article><span>03</span><h3>Location stays protected</h3><p>Exact event location is released to a talent only after their application has been accepted.</p></article>
            <article><span>04</span><h3>Decisions that stay visible</h3><p>Talents can follow their application status while customers manage applicants for each position.</p></article>
          </div>
        </section>

        <section className="closing-section" id="get-started">
          <div>
            <p className="eyebrow">Ready when your event is</p>
            <h2>Make the next live set a better fit.</h2>
          </div>
          <div className="closing-actions">
            <a className="button button-light" href="#for-customers">Post as a customer <Arrow /></a>
            <a className="button button-outline-light" href="#for-talents">Join as talent <Arrow /></a>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
