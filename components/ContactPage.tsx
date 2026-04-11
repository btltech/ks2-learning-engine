import React, { useState } from 'react';
import InfoPage from './InfoPage';
import { RADIUS, SHADOWS } from '../constants';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    userType: 'parent',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, send to backend
    console.log('Contact form:', formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <InfoPage 
      title="Contact Us" 
      emoji="📧"
      lastUpdated="April 11, 2026"
    >
      <div className="prose max-w-none">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Get in Touch</h2>
        <p className="text-gray-700 mb-6">
          Have questions, feedback, or need support? We'd love to hear from you!
        </p>

        {submitted && (
          <div className={`bg-green-50 border-l-4 border-green-500 ${RADIUS.card} p-4 mb-6`}>
            <p className="font-bold text-green-900">✅ Message Sent!</p>
            <p className="text-green-700">We'll get back to you within 24 hours.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">
              Your Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className={`w-full px-4 py-2 border border-gray-300 ${RADIUS.button} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={`w-full px-4 py-2 border border-gray-300 ${RADIUS.button} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">
              I am a...
            </label>
            <select
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              className={`w-full px-4 py-2 border border-gray-300 ${RADIUS.button} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`}
            >
              <option value="parent">Parent</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
              <option value="admin">School Administrator</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">
              Subject *
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className={`w-full px-4 py-2 border border-gray-300 ${RADIUS.button} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">
              Message *
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={6}
              className={`w-full px-4 py-2 border border-gray-300 ${RADIUS.button} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`}
            />
          </div>

          <button
            type="submit"
            className={`bg-blue-600 text-white px-6 py-3 ${RADIUS.button} font-bold hover:bg-blue-700 motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${SHADOWS.secondary}`}
          >
            Send Message
          </button>
        </form>

        <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">Other Ways to Reach Us</h3>
        <div className="space-y-3">
          <div className={`${RADIUS.card} ${SHADOWS.secondary} p-4 bg-white`}>
            <p className="font-bold text-gray-900">📧 General Support</p>
            <a href="mailto:support@ks2learning.com" className="text-blue-600 hover:underline">support@ks2learning.com</a>
          </div>
          <div className={`${RADIUS.card} ${SHADOWS.secondary} p-4 bg-white`}>
            <p className="font-bold text-gray-900">🛡️ Safeguarding Concerns</p>
            <a href="mailto:safeguarding@ks2learning.com" className="text-blue-600 hover:underline">safeguarding@ks2learning.com</a>
            <p className="text-sm text-red-600 mt-1">24-hour response for urgent concerns</p>
          </div>
          <div className={`${RADIUS.card} ${SHADOWS.secondary} p-4 bg-white`}>
            <p className="font-bold text-gray-900">🔒 Privacy & Data</p>
            <a href="mailto:privacy@ks2learning.com" className="text-blue-600 hover:underline">privacy@ks2learning.com</a>
          </div>
        </div>
      </div>
    </InfoPage>
  );
};

export default ContactPage;
