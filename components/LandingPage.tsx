import React from 'react';
import { useNavigate } from 'react-router-dom';

const SUBJECTS = [
  { emoji: '🔢', name: 'Maths', color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', desc: 'Times tables, fractions, algebra & more' },
  { emoji: '📖', name: 'English', color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', desc: 'Reading, writing, grammar & spelling' },
  { emoji: '🔬', name: 'Science', color: 'from-green-500 to-green-600', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', desc: 'Biology, physics, chemistry & experiments' },
  { emoji: '🏛️', name: 'History', color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', desc: 'Ancient civilisations to modern Britain' },
  { emoji: '🌍', name: 'Geography', color: 'from-teal-500 to-teal-600', bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', desc: 'Maps, capitals, climate & ecosystems' },
  { emoji: '💻', name: 'Computing', color: 'from-indigo-500 to-indigo-600', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', desc: 'Coding, algorithms & digital skills' },
  { emoji: '🎨', name: 'Art & Design', color: 'from-pink-500 to-pink-600', bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', desc: 'Artists, techniques & creative projects' },
  { emoji: '🎵', name: 'Music', color: 'from-rose-500 to-rose-600', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', desc: 'Notes, rhythm, composers & theory' },
];

const FEATURES = [
  {
    icon: '🤖',
    title: 'AI-Powered Practice',
    desc: 'Personalised questions that adapt to your child\'s level — harder when they\'re flying, easier when they need support.',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    icon: '📊',
    title: 'Parent Dashboard',
    desc: 'See exactly which topics your child is mastering and where they need a little more help — in real time.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: '🏆',
    title: 'Streaks & Rewards',
    desc: 'Daily streaks, badges, a leaderboard and avatar customisation keep children motivated to come back every day.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: '🎮',
    title: 'Mini-Games',
    desc: 'Times Table Sprint, History Match, Science Sorter and more — learning disguised as fun.',
    color: 'from-green-500 to-teal-500',
  },
  {
    icon: '🔊',
    title: 'Voice & Spelling Bee',
    desc: 'Read-aloud questions and a Spelling Bee mode help children who learn better by listening.',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    icon: '📅',
    title: 'SATs Preparation',
    desc: 'Dedicated SATs practice mode aligned to the Year 6 National Curriculum so pupils arrive confident.',
    color: 'from-rose-500 to-red-500',
  },
];

const STEPS = [
  { step: '1', title: 'Parent signs up free', desc: 'Takes under 1 minute. You get a unique 6-character parent code.', emoji: '👋' },
  { step: '2', title: 'Child joins with the code', desc: 'No email needed for your child. Just their name, age and your code.', emoji: '🧒' },
  { step: '3', title: 'Start learning!', desc: 'Pick a subject, complete quizzes, earn stars and unlock games.', emoji: '🚀' },
];

const STATS = [
  { value: '12+', label: 'KS2 subjects covered' },
  { value: '7–11', label: 'Age range (Years 3–6)' },
  { value: '100%', label: 'Free to join' },
  { value: '🇬🇧', label: 'UK curriculum aligned' },
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen overflow-x-hidden">

      {/* ───────────────── HERO ───────────────── */}
      <section aria-labelledby="hero-heading" className="relative pt-10 pb-20 px-4 text-center overflow-hidden">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 bg-blue-200 opacity-30 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -top-16 -right-24 w-80 h-80 bg-purple-200 opacity-30 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-40 bg-indigo-100 opacity-40 rounded-full blur-3xl" />

        <div className="relative max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white border border-indigo-200 rounded-full px-4 py-1.5 text-sm font-semibold text-indigo-600 shadow-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse" />
            Free for UK primary school families
          </div>

          {/* Headline */}
          <h1 id="hero-heading" className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight mb-6">
            The learning app
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              your child will love
            </span>
          </h1>

          {/* Tagline */}
          <p className="text-xl sm:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            AI-powered quizzes, games and progress tracking for{' '}
            <strong className="text-gray-800">UK children aged 7–11</strong>.{' '}
            Covers all KS2 subjects. Completely free.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button
              onClick={() => navigate('/login?mode=register')}
              className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transform transition-all"
            >
              Get Started Free 🚀
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-10 py-4 bg-white text-gray-700 text-lg font-semibold rounded-2xl shadow border border-gray-200 hover:bg-gray-50 hover:shadow-md transition-all"
            >
              Sign In
            </button>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {STATS.map(s => (
              <div key={s.label} className="bg-white bg-opacity-80 backdrop-blur rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="text-2xl font-extrabold text-indigo-600">{s.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── SUBJECTS GRID ───────────────── */}
      <section aria-labelledby="subjects-heading" className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 id="subjects-heading" className="text-3xl sm:text-4xl font-extrabold text-center text-gray-900 mb-3">
            Every KS2 subject covered
          </h2>
          <p className="text-center text-gray-500 mb-12 text-lg">
            From Maths and English to Music and Computing — all in one place.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {SUBJECTS.map(subj => (
              <div
                key={subj.name}
                className={`${subj.bg} ${subj.border} border rounded-2xl p-5 flex flex-col items-start gap-2 hover:shadow-md transition-shadow`}
              >
                <span className="text-3xl">{subj.emoji}</span>
                <span className={`font-bold text-base ${subj.text}`}>{subj.name}</span>
                <span className="text-xs text-gray-500 leading-snug">{subj.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── FEATURES ───────────────── */}
      <section aria-labelledby="features-heading" className="py-16 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-5xl mx-auto">
          <h2 id="features-heading" className="text-3xl sm:text-4xl font-extrabold text-center text-gray-900 mb-3">
            Built for real learning
          </h2>
          <p className="text-center text-gray-500 mb-12 text-lg">
            Not just another worksheet app.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div
                key={f.title}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col gap-3"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-2xl shadow-sm`}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-gray-900 text-lg">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── HOW IT WORKS ───────────────── */}
      <section aria-labelledby="how-it-works-heading" className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 id="how-it-works-heading" className="text-3xl sm:text-4xl font-extrabold text-center text-gray-900 mb-3">
            Up and running in 3 steps
          </h2>
          <p className="text-center text-gray-500 mb-12 text-lg">
            No subscription. No credit card. Just learning.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {STEPS.map((s, i) => (
              <div key={s.step} className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-extrabold shadow-lg">
                    {s.step}
                  </div>
                  <span className="absolute -top-1 -right-1 text-2xl">{s.emoji}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="hidden sm:block absolute top-8 left-full w-full h-0.5 bg-indigo-100" />
                )}
                <h3 className="font-bold text-gray-900 text-lg mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── TRUST ───────────────── */}
      <section aria-labelledby="trust-heading" className="py-16 px-4 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 id="trust-heading" className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
            Built around safe, focused learning
          </h2>
          <p className="text-gray-600 text-lg mb-10">Clear learning goals for children, useful progress information for adults.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-left">
            <div className="bg-white rounded-2xl border border-indigo-100 p-6 shadow-sm">
              <div className="text-2xl mb-3">🔐</div>
              <h3 className="font-bold text-gray-900 mb-2">Family-led access</h3>
              <p className="text-sm text-gray-600">Children can use a parent code rather than needing their own email account.</p>
            </div>
            <div className="bg-white rounded-2xl border border-indigo-100 p-6 shadow-sm">
              <div className="text-2xl mb-3">🎯</div>
              <h3 className="font-bold text-gray-900 mb-2">Purposeful practice</h3>
              <p className="text-sm text-gray-600">Questions, explanations and revision are organised around KS2 learning topics.</p>
            </div>
            <div className="bg-white rounded-2xl border border-indigo-100 p-6 shadow-sm">
              <div className="text-2xl mb-3">♿</div>
              <h3 className="font-bold text-gray-900 mb-2">Different ways to learn</h3>
              <p className="text-sm text-gray-600">Voice, read-aloud and visual settings help children learn in the way that suits them.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── WHO IS IT FOR ───────────────── */}
      <section aria-labelledby="audience-heading" className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 id="audience-heading" className="text-3xl sm:text-4xl font-extrabold text-center text-gray-900 mb-12">
            Designed for everyone in the classroom
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-6 text-center">
              <div className="text-4xl mb-3">🧒</div>
              <h3 className="font-bold text-blue-800 text-xl mb-2">Children (7–11)</h3>
              <p className="text-blue-700 text-sm">Quizzes, games, streaks, avatars and badges keep learning exciting every day.</p>
            </div>
            <div className="rounded-2xl border-2 border-purple-200 bg-purple-50 p-6 text-center">
              <div className="text-4xl mb-3">👨‍👩‍👧</div>
              <h3 className="font-bold text-purple-800 text-xl mb-2">Parents</h3>
              <p className="text-purple-700 text-sm">Progress tools and parent codes help families support learning safely.</p>
            </div>
            <div className="rounded-2xl border-2 border-green-200 bg-green-50 p-6 text-center">
              <div className="text-4xl mb-3">👩‍🏫</div>
              <h3 className="font-bold text-green-800 text-xl mb-2">Teachers</h3>
              <p className="text-green-700 text-sm">Quiz activities and SATs practice can support homework and lesson starters.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── FINAL CTA ───────────────── */}
      <section aria-labelledby="cta-heading" className="py-20 px-4 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <div className="text-5xl mb-6">🎓</div>
          <h2 id="cta-heading" className="text-3xl sm:text-4xl font-extrabold mb-4 leading-tight">
            Give your child the best start.
            <br />It's completely free.
          </h2>
          <p className="text-indigo-200 text-lg mb-10">
            Create a free account and explore focused KS2 practice at your child’s pace.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/login?mode=register')}
              className="px-10 py-4 bg-white text-indigo-700 text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transform transition-all"
            >
              Create Free Account 🚀
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-10 py-4 bg-white bg-opacity-20 backdrop-blur text-white text-lg font-semibold rounded-2xl border border-white border-opacity-40 hover:bg-opacity-30 transition-all"
            >
              Sign In
            </button>
          </div>
          <p className="text-indigo-300 text-sm mt-6">
            No credit card · No subscription · No ads
          </p>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
