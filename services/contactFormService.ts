/**
 * Contact Form Service
 * Routes form submissions through /api/contact (Cloudflare Pages Function)
 * which saves to Firestore AND sends an admin email notification via Resend.
 */

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
 * Submit a contact form message via the server-side /api/contact endpoint.
 * The endpoint saves the submission to Firestore and sends an admin email.
 */
export async function submitContactForm(formData: ContactFormData): Promise<void> {
  let resp: Response;
  try {
    resp = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
  } catch {
    throw new Error('Network error. Please check your connection and try again, or email us at support@demiwuraks2.co.uk');
  }

  if (!resp.ok) {
    let message = 'Failed to submit. Please try again or email support@demiwuraks2.co.uk';
    try {
      const data = await resp.json();
      if (typeof data?.error === 'string') message = data.error;
    } catch { /* ignore */ }
    throw new Error(message);
  }
}

/**
 * Get all contact submissions (admin only)
 * This would be called from admin console to view submissions
 */
export async function getContactSubmissions(): Promise<ContactSubmission[]> {
  // Placeholder for future admin console integration
  return [];
}
