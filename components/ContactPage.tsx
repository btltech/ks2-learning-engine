import React, { useEffect, useState } from 'react';
import InfoPage from './InfoPage';
import { RADIUS, SHADOWS } from '../constants';
import { submitContactForm } from '../services/contactFormService';
import { TurnstileWidget } from './TurnstileWidget';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    userType: 'parent' as 'parent' | 'teacher' | 'admin' | 'other',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnstileSiteKey, setTurnstileSiteKey] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');

  useEffect(() => {
    let cancelled = false;
    void fetch('/api/public-config')
      .then((response) => response.json())
      .then((data) => {
        if (!cancelled && typeof data?.turnstileSiteKey === 'string') {
          setTurnstileSiteKey(data.turnstileSiteKey);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (turnstileSiteKey && !turnstileToken) {
      setError('Please complete the CAPTCHA.');
      return;
    }
    setSubmitting(true);
    setError(null);
    
    try {
      await submitContactForm({ ...formData, turnstileToken });
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        userType: 'parent',
        subject: '',
        message: ''
      });
      setTurnstileToken('');
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <InfoPage 
      title="Contact Us" 
      emoji="📧"
      lastUpdated="August 10, 2026"
    >
      <div className="prose max-w-none">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Get in Touch</h2>
        <p className="text-gray-700 mb-6">
          Adults can use this form for support, feedback, privacy, accessibility or safeguarding concerns.
        </p>

        <div className={`bg-amber-50 border-l-4 border-amber-500 ${RADIUS.card} p-4 mb-6`}>
          <p className="font-bold text-amber-950">Are you under 13?</p>
          <p className="text-amber-900 mt-1">
            Ask a parent, teacher or another trusted adult to contact us with you. Do not enter your surname, school,
            address, phone number, passwords, parent code or PIN in this form.
          </p>
        </div>

        {submitted && (
          <div className={`bg-green-50 border-l-4 border-green-500 ${RADIUS.card} p-4 mb-6`} role="status" aria-live="polite">
            <p className="font-bold text-green-900">✅ Message Sent!</p>
            <p className="text-green-700">We aim to reply within two working days. Urgent safety concerns are prioritised.</p>
          </div>
        )}

        {error && (
          <div className={`bg-red-50 border-l-4 border-red-500 ${RADIUS.card} p-4 mb-6`} role="alert">
            <p className="font-bold text-red-900">❌ Error</p>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <div>
            <label htmlFor="contact-name" className="block text-sm font-bold text-gray-900 mb-1">
              Your Name *
            </label>
            <input
              type="text"
              id="contact-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className={`w-full px-4 py-2 border border-gray-300 ${RADIUS.button} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`}
            />
          </div>

          <div>
            <label htmlFor="contact-email" className="block text-sm font-bold text-gray-900 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              id="contact-email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={`w-full px-4 py-2 border border-gray-300 ${RADIUS.button} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`}
            />
          </div>

          <div>
            <label htmlFor="contact-user-type" className="block text-sm font-bold text-gray-900 mb-1">
              I am a...
            </label>
            <select
              id="contact-user-type"
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              className={`w-full px-4 py-2 border border-gray-300 ${RADIUS.button} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`}
            >
              <option value="parent">Parent</option>
              <option value="teacher">Teacher</option>
              <option value="admin">School Administrator</option>
              <option value="other">Other adult</option>
            </select>
          </div>

          <div>
            <label htmlFor="contact-subject" className="block text-sm font-bold text-gray-900 mb-1">
              Subject *
            </label>
            <input
              type="text"
              id="contact-subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className={`w-full px-4 py-2 border border-gray-300 ${RADIUS.button} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`}
            />
          </div>

          <div>
            <label htmlFor="contact-message" className="block text-sm font-bold text-gray-900 mb-1">
              Message *
            </label>
            <textarea
              id="contact-message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={6}
              className={`w-full px-4 py-2 border border-gray-300 ${RADIUS.button} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`}
            />
          </div>

          <p className="text-sm text-gray-600">
            We store the message to answer your enquiry and send a notification through Resend. Read our{' '}
            <a href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</a>. Please include only
            the information needed for us to help.
          </p>

          {turnstileSiteKey && (
            <div>
              <p className="block text-sm font-bold text-gray-900 mb-2" id="contact-security-check">Security check</p>
              <div aria-labelledby="contact-security-check">
                <TurnstileWidget siteKey={turnstileSiteKey} onToken={setTurnstileToken} />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className={`bg-blue-600 text-white px-6 py-3 ${RADIUS.button} font-bold hover:bg-blue-700 motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${SHADOWS.secondary} disabled:bg-gray-400 disabled:cursor-not-allowed`}
          >
            {submitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>

        <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">Other Ways to Reach Us</h3>
        <div className="space-y-3">
          <div className={`${RADIUS.card} ${SHADOWS.secondary} p-4 bg-white`}>
            <p className="font-bold text-gray-900">📧 General Support</p>
            <a href="mailto:support@demiwuraks2.co.uk" className="text-blue-600 hover:underline">support@demiwuraks2.co.uk</a>
          </div>
          <div className={`${RADIUS.card} ${SHADOWS.secondary} p-4 bg-white`}>
            <p className="font-bold text-gray-900">🛡️ Safeguarding Concerns</p>
            <a href="mailto:safeguarding@demiwuraks2.co.uk" className="text-blue-600 hover:underline">safeguarding@demiwuraks2.co.uk</a>
            <p className="text-sm text-red-700 mt-1">If a child is in immediate danger, call 999. Do not wait for an email response.</p>
          </div>
          <div className={`${RADIUS.card} ${SHADOWS.secondary} p-4 bg-white`}>
            <p className="font-bold text-gray-900">🔒 Privacy & Data</p>
            <a href="mailto:privacy@demiwuraks2.co.uk" className="text-blue-600 hover:underline">privacy@demiwuraks2.co.uk</a>
          </div>
        </div>
      </div>
    </InfoPage>
  );
};

export default ContactPage;
