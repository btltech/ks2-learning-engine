import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightIcon, ClockIcon, EyeIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline';
import { KidButton } from './sunny/KidButton';
import { KidCard } from './sunny/KidCard';
import { Chip } from './sunny/Chip';
import { Owl } from './sunny/Owl';
import { MiraFace } from './sunny/MiraFace';
import { Sparkle } from './sunny/Sparkle';
import { SubjectIcon, type SubjectIconProps } from './sunny/SubjectIcon';
import './LandingPage.css';

const SUBJECTS: { icon: SubjectIconProps['name']; name: string; tint: string; desc: string }[] = [
  { icon: 'maths', name: 'Maths', tint: 'sky', desc: 'Times tables, fractions, algebra & more' },
  { icon: 'english', name: 'English', tint: 'grape', desc: 'Reading, writing, grammar & spelling' },
  { icon: 'science', name: 'Science', tint: 'leaf', desc: 'Biology, physics, chemistry & experiments' },
  { icon: 'languages', name: 'Languages', tint: 'orange', desc: 'Explore words and pronunciation' },
  { icon: 'history', name: 'History', tint: 'gold', desc: 'Ancient civilisations to modern Britain' },
  { icon: 'geography', name: 'Geography', tint: 'teal', desc: 'Maps, capitals, climate & ecosystems' },
  { icon: 'art', name: 'Art & Design', tint: 'bubblegum', desc: 'Artists, techniques & creative projects' },
  { icon: 'music', name: 'Music', tint: 'grape', desc: 'Notes, rhythm, composers & theory' },
  { icon: 'computing', name: 'Computing', tint: 'leaf', desc: 'Coding, algorithms & digital skills' },
];

const LEARNING_WAYS = [
  { title: 'Hear every word', tint: 'gold', icon: SpeakerWaveIcon, text: 'Read-aloud questions and a Spelling Bee mode help children who learn better by listening, with a natural voice option that works on the device.' },
  { title: 'Easy-to-read text', tint: 'grape', icon: null, text: 'A typeface designed for low vision, bigger text and wider spacing help make reading more comfortable.' },
  { title: 'No pressure', tint: 'leaf', icon: ClockIcon, text: 'Personalised practice offers support when children need it. Mistakes are a chance to have another go.' },
  { title: 'See it your way', tint: 'bubblegum', icon: EyeIcon, text: 'High contrast and less movement, with keyboard controls and read-aloud options to help children learn their way.' },
];

const STEPS = [
  { title: 'Pick a topic', pose: 'wave' as const, tint: 'sky', text: 'MiRa suggests what to do next, or children choose a subject themselves.' },
  { title: 'Learn in small steps', pose: 'reading' as const, tint: 'leaf', text: 'Short lessons they can read, listen to, or both, organised around KS2 learning topics.' },
  { title: 'Try a quick quiz', pose: 'hooray' as const, tint: 'bubblegum', text: 'Personalised questions, explanations and revision. Earn stars and unlock games as they learn.' },
];

function Cloud({ className }: { className: string }) {
  return <svg className={className} viewBox="0 0 160 80"><path d="M30 70a24 24 0 0 1 6-47 32 32 0 0 1 58-8 26 26 0 0 1 40 22 22 22 0 0 1-4 33z" fill="#fff" stroke="#172033" strokeWidth="3" strokeLinejoin="round" /></svg>;
}

function AnswerShape({ shape }: { shape: 'triangle' | 'circle' | 'square' | 'star' }) {
  return <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true" focusable="false">
    {shape === 'triangle' && <path d="M13 3 24 23H2Z" fill="#3D8BFF" stroke="#172033" strokeWidth="2" strokeLinejoin="round" />}
    {shape === 'circle' && <circle cx="13" cy="13" r="10" fill="#FF6FB5" stroke="#172033" strokeWidth="2" />}
    {shape === 'square' && <rect x="3" y="3" width="20" height="20" rx="3" fill="#2FC27A" stroke="#172033" strokeWidth="2" />}
    {shape === 'star' && <path d="m13 2 3.4 7 7.6 1.1-5.5 5.4 1.3 7.5-6.8-3.6L6.2 23l1.3-7.5L2 10.1 9.6 9Z" fill="#FFC93C" stroke="#172033" strokeWidth="2" strokeLinejoin="round" />}
  </svg>;
}

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const startLearning = () => navigate('/login?mode=register');
  return (
    <div className="sunny-ui sunny-landing">
      <section aria-labelledby="hero-heading" className="landing-hero">
        <div className="landing-scenery" aria-hidden="true">
          <Cloud className="landing-cloud landing-cloud-one sunny-float" />
          <Cloud className="landing-cloud landing-cloud-two" />
          <Cloud className="landing-cloud landing-cloud-three sunny-float" />
          <Sparkle className="landing-sparkle-one sunny-twinkle" />
          <Sparkle className="landing-sparkle-two sunny-twinkle" />
          <svg className="landing-hills" viewBox="0 0 1200 120" preserveAspectRatio="none"><path d="M0 70 C200 10 380 30 520 60 S820 110 960 50 S1140 30 1200 60 V120 H0Z" fill="#9BE3B5" stroke="#172033" strokeWidth="3" /><path d="M0 100 C250 60 500 80 700 100 S1000 90 1200 80 V120 H0Z" fill="#6FD39A" stroke="#172033" strokeWidth="3" /></svg>
        </div>
        <div className="landing-hero-inner">
          <div className="landing-intro">
            <Chip><span aria-hidden="true">☆</span> For children aged 7 to 11 · Key Stage 2</Chip>
            <h1 id="hero-heading">Learning every child can <span className="landing-sticker landing-sticker-read">read</span>, <span className="landing-sticker landing-sticker-hear">hear</span> and <span className="landing-sticker landing-sticker-enjoy">enjoy</span></h1>
            <p>Short lessons, friendly quizzes and a guide called MiRa, built around the national curriculum. Voice, read-aloud and visual settings help children learn in the way that suits them. Completely free.</p>
            <div className="landing-actions">
              <KidButton size="lg" onClick={startLearning}><ArrowRightIcon aria-hidden="true" /> Start learning</KidButton>
              <KidButton size="lg" variant="white" href="#how-it-works-heading">See how it works</KidButton>
            </div>
          </div>
          <figure className="landing-example" aria-labelledby="example-question">
            <figcaption className="sr-only">An illustration of a maths question and MiRa’s explanation, not an interactive quiz.</figcaption>
            <Owl pose="wave" height={156} className="landing-example-owl" />
            <KidCard className="landing-example-card">
              <div className="landing-example-toolbar"><Chip tint="sky">Maths · Year 4</Chip><span className="landing-listen-badge" aria-hidden="true"><SpeakerWaveIcon /> Listen</span></div>
              <h2 id="example-question">What is one quarter of 20?</h2>
              <ul className="landing-answers" aria-label="Example answers">
                <li><AnswerShape shape="triangle" />4</li>
                <li className="landing-answer-correct"><AnswerShape shape="circle" />5 <span>✓ Correct</span></li>
                <li><AnswerShape shape="square" />10</li>
                <li><AnswerShape shape="star" />80</li>
              </ul>
              <div className="landing-mira"><MiraFace size={48} /><p><strong>MiRa:</strong> Yes! Split 20 into 4 equal groups and each group has 5.</p></div>
            </KidCard>
          </figure>
        </div>
      </section>

      <section className="landing-section landing-learning-ways" aria-labelledby="features-heading">
        <div className="landing-section-intro"><h2 id="features-heading">Made for every way of learning</h2><p>Children learn in different ways. Reading, listening and visual settings help them set the app up the way that works for them.</p></div>
        <ul className="landing-feature-grid">{LEARNING_WAYS.map(({ title, tint, icon: Icon, text }) => <li key={title}><KidCard className="landing-feature"><span className={`landing-feature-icon landing-tint-${tint}`} aria-hidden="true">{Icon ? <Icon /> : 'Aa'}</span><h3>{title}</h3><p>{text}</p></KidCard></li>)}</ul>
      </section>

      <section className="landing-section landing-subjects" aria-labelledby="subjects-heading">
        <KidCard className="landing-subject-banner">
          <div className="landing-subject-heading"><Owl pose="reading" height={94} /><h2 id="subjects-heading">Every Key Stage 2 subject</h2></div>
          <ul className="landing-subject-grid">{SUBJECTS.map(subject => <li key={subject.name} className={`landing-subject-tile landing-tint-${subject.tint}`} title={subject.desc}><SubjectIcon name={subject.icon} size={60} /><span>{subject.name}</span><span className="sr-only">{subject.desc}</span></li>)}</ul>
        </KidCard>
      </section>

      <section className="landing-section landing-session" aria-labelledby="how-it-works-heading">
        <h2 id="how-it-works-heading">How a session works</h2>
        <div className="landing-step-path">
          <svg className="landing-dotted-path" viewBox="0 0 1200 60" preserveAspectRatio="none" aria-hidden="true"><path d="M180 30 C400 -10 500 70 600 30 S820 -10 1020 30" fill="none" stroke="#172033" strokeWidth="5" strokeDasharray="2 18" strokeLinecap="round" /></svg>
          <ol className="landing-steps">{STEPS.map((step, i) => <li key={step.title}><div className={`landing-step-circle landing-tint-${step.tint}`}><Owl pose={step.pose} height={135} /><span>{i + 1}</span></div><h3>{step.title}</h3><p>{step.text}</p></li>)}</ol>
        </div>
        <KidButton size="lg" onClick={startLearning}><ArrowRightIcon aria-hidden="true" /> Start learning</KidButton>
      </section>

      <section className="landing-section landing-grownups" aria-labelledby="audience-heading">
        <h2 id="audience-heading" className="sr-only">Designed for everyone in the classroom</h2>
        <h2 id="trust-heading" className="sr-only">Built around safe, focused learning</h2>
        <KidCard><h3>For parents and carers</h3><p>See which topics your child is mastering and where they need a little more help. Parents create each child profile and private PIN; no child email is needed.</p><p>Parent codes help families support learning safely. Daily streaks, badges, a leaderboard and avatar customisation keep children motivated.</p><KidButton variant="white" onClick={() => navigate('/parent-guide')}><ArrowRightIcon aria-hidden="true" /> Read the parent guide</KidButton></KidCard>
        <KidCard><h3>For teachers</h3><p>Quiz activities and SATs practice aligned to the Year 6 National Curriculum can support homework and lesson starters.</p><p>Times Table Sprint, History Match, Science Sorter and more — learning disguised as fun.</p><KidButton variant="white" onClick={() => navigate('/teacher-guide')}><ArrowRightIcon aria-hidden="true" /> Read the teacher guide</KidButton></KidCard>
      </section>
      <section className="landing-section landing-final-note" aria-labelledby="cta-heading"><h2 id="cta-heading">Give your child the best start. It’s completely free.</h2><p>Create a free account and explore focused KS2 practice at your child’s pace.</p><div className="landing-actions"><KidButton onClick={startLearning}>Create a family account</KidButton><KidButton variant="white" onClick={() => navigate('/login')}>Sign In</KidButton></div><p>No credit card · No subscription · No ads</p></section>
    </div>
  );
};
export default LandingPage;
