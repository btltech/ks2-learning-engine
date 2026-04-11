/**
 * Contact Form Service
 * Handles submission of contact form messages to Firestore
 */

import { db, collection, addDoc } from './firebase';

export interface ContactFormData {
  name: string;
  email: string;
  userType: 'parent' | 'teacher' | 'student' | 'admin' | 'other';
  subject: string;
  message: string;
}

export interface ContactSubmission extends ContactFormData {
  submittedAt: number;
  status: 'new' | 'in-progress' | 'resolved';
  ipAddress?: string;
}

/**
 * Submit a contact form message
 */
export async function submitContactForm(formData: ContactFormData): Promise<void> {
  try {
    const submission: ContactSubmission = {
      ...formData,
      submittedAt: Date.now(),
      status: 'new'
    };

    await addDoc(collection(db, 'contactSubmissions'), submission);
  } catch (error) {
    console.error('Error submitting contact form:', error);
    throw new Error('Failed to submit contact form. Please try again or email us directly at support@demiwuraks2.co.uk');
  }
}

/**
 * Get all contact submissions (admin only)
 * This would be called from admin console to view submissions
 */
export async function getContactSubmissions(): Promise<ContactSubmission[]> {
  // This function would require auth check for admin role
  // Placeholder for future admin console integration
  return [];
}
