'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

const contactCategories = [
  { value: 'general', label: 'General Inquiry', icon: '💬' },
  { value: 'technical', label: 'Technical Support', icon: '🔧' },
  { value: 'billing', label: 'Billing & Payments', icon: '💳' },
  { value: 'account', label: 'Account Issues', icon: '👤' },
  { value: 'gig', label: 'Gig Related', icon: '🎯' },
  { value: 'partnership', label: 'Business Partnership', icon: '🤝' },
  { value: 'feedback', label: 'Feedback & Suggestions', icon: '💡' },
  { value: 'report', label: 'Report Abuse', icon: '⚠️' }
];

const priorityLevels = [
  { value: 'LOW', label: 'Low Priority', color: 'text-green-600', bg: 'bg-green-50' },
  { value: 'MEDIUM', label: 'Medium Priority', color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { value: 'HIGH', label: 'High Priority', color: 'text-orange-600', bg: 'bg-orange-50' },
  { value: 'URGENT', label: 'Urgent', color: 'text-red-600', bg: 'bg-red-50' }
];

export default function ContactPage() {
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState<ContactForm>({
    name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '',
    email: user?.email || '',
    subject: '',
    category: 'general',
    message: '',
    priority: 'MEDIUM'
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof ContactForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return 'Name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Invalid email format';
    if (!formData.subject.trim()) return 'Subject is required';
    if (!formData.message.trim()) return 'Message is required';
    if (formData.message.length < 10) return 'Message must be at least 10 characters';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.post('/api/support/contact', {
        ...formData,
        userId: user?.id || null,
        timestamp: new Date().toISOString()
      });
      
      if (response.success) {
        setSubmitted(true);
      } else {
        setError('Failed to send message. Please try again.');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="page-container min-h-screen pt-16">
          <div className="content-container py-8">
            <div className="mx-auto max-w-2xl">
              <div className="card-glass p-8 text-center">
                <div className="mb-6">
                  <div className="mx-auto mb-4 h-16 w-16 rounded-none bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center">
                    <span className="text-2xl">✅</span>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Message Sent Successfully!
                  </h1>
                  <p className="text-gray-600">
                    Thank you for contacting us. We'll get back to you within 24 hours.
                  </p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-none p-4 mb-6">
                  <h3 className="font-semibold text-blue-800 mb-2">What happens next?</h3>
                  <ul className="text-blue-700 text-sm space-y-1">
                    <li>• You'll receive a confirmation email shortly</li>
                    <li>• Our support team will review your message</li>
                    <li>• We'll respond within 24 hours (urgent issues within 2 hours)</li>
                    <li>• Check your spam folder if you don't see our reply</li>
                  </ul>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '',
                        email: user?.email || '',
                        subject: '',
                        category: 'general',
                        message: '',
                        priority: 'MEDIUM'
                      });
                    }}
                    className="btn-secondary"
                  >
                    Send Another Message
                  </button>
                  <Link href="/dashboard" className="btn-primary">
                    Back to Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="page-container min-h-screen pt-16">
        <div className="content-container py-8">
          <div className="mx-auto max-w-4xl">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-heading mb-4 text-4xl font-bold">
                Contact Us
              </h1>
              <p className="text-muted text-lg max-w-2xl mx-auto">
                Have a question or need help? We're here to assist you. Send us a message and we'll get back to you as soon as possible.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Contact Information */}
              <div className="lg:col-span-1">
                <div className="card-glass p-3 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Get in Touch
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-none flex items-center justify-center">
                        <span className="text-xl">📧</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Email</p>
                        <p className="text-gray-600 text-sm">support@50brains.com</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-none flex items-center justify-center">
                        <span className="text-xl">💬</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Live Chat</p>
                        <p className="text-gray-600 text-sm">Available 9 AM - 6 PM EST</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-none flex items-center justify-center">
                        <span className="text-xl">📍</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Address</p>
                        <p className="text-gray-600 text-sm">[Company Address]<br />City, State ZIP</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="card-glass p-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Quick Help
                  </h3>
                  
                  <div className="space-y-3">
                    <Link href={"/help/faq" as any} className="flex items-center space-x-2 text-gray-600 hover:text-brand-primary transition-colors">
                      <span className="text-sm">❓</span>
                      <span className="text-sm">Frequently Asked Questions</span>
                    </Link>

                    <Link href={"/help/getting-started" as any} className="flex items-center space-x-2 text-gray-600 hover:text-brand-primary transition-colors">
                      <span className="text-sm">🚀</span>
                      <span className="text-sm">Getting Started Guide</span>
                    </Link>
                    
                    <Link href={"/help/tutorials" as any} className="flex items-center space-x-2 text-gray-600 hover:text-brand-primary transition-colors">
                      <span className="text-sm">📺</span>
                      <span className="text-sm">Video Tutorials</span>
                    </Link>
                    
                    <Link href={"/terms" as any} className="flex items-center space-x-2 text-gray-600 hover:text-brand-primary transition-colors">
                      <span className="text-sm">📄</span>
                      <span className="text-sm">Terms of Service</span>
                    </Link>
                    
                    <Link href={"/privacy" as any} className="flex items-center space-x-2 text-gray-600 hover:text-brand-primary transition-colors">
                      <span className="text-sm">🔒</span>
                      <span className="text-sm">Privacy Policy</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-2">
                <div className="card-glass p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    Send us a Message
                  </h3>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name and Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="input w-full"
                          placeholder="Your full name"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="input w-full"
                          placeholder="your.email@example.com"
                          required
                        />
                      </div>
                    </div>

                    {/* Category and Priority */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category *
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) => handleInputChange('category', e.target.value)}
                          className="input w-full"
                          required
                        >
                          {contactCategories.map((cat) => (
                            <option key={cat.value} value={cat.value}>
                              {cat.icon} {cat.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Priority Level
                        </label>
                        <select
                          value={formData.priority}
                          onChange={(e) => handleInputChange('priority', e.target.value as ContactForm['priority'])}
                          className="input w-full"
                        >
                          {priorityLevels.map((priority) => (
                            <option key={priority.value} value={priority.value}>
                              {priority.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subject *
                      </label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        className="input w-full"
                        placeholder="Brief description of your inquiry"
                        required
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message *
                      </label>
                      <textarea
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        rows={6}
                        className="input w-full resize-none"
                        placeholder="Please provide as much detail as possible about your inquiry..."
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Minimum 10 characters ({formData.message.length}/10)
                      </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-none p-4">
                        <p className="text-red-600 text-sm">❌ {error}</p>
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        * Required fields
                      </p>
                      
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary flex items-center space-x-2"
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-none animate-spin"></div>
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <span>Send Message</span>
                            <span>📤</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Response Time Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-none p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">📞 Urgent Issues</h4>
                    <p className="text-blue-700 text-sm">
                      For urgent matters, we respond within 2 hours during business hours.
                    </p>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-none p-4">
                    <h4 className="font-semibold text-green-800 mb-2">⏰ Standard Response</h4>
                    <p className="text-green-700 text-sm">
                      Most inquiries receive a response within 24 hours.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
