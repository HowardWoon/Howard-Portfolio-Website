'use client';

import { useState } from 'react';
import { ArrowUpRight, Mail } from 'lucide-react';

export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('sending');
    setError('');

    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message })
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(payload?.error ?? 'Unable to send message.');
      setStatus('error');
      return;
    }

    setName('');
    setEmail('');
    setMessage('');
    setStatus('sent');
  };

  return (
    <form onSubmit={submitForm} className="glass-panel space-y-4 rounded-3xl p-6 sm:p-8">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="floating-field">
          <input
            id="name"
            className="floating-input"
            placeholder=" "
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            required
          />
          <label htmlFor="name" className="floating-label">
            Name
          </label>
        </div>
        <div className="floating-field">
          <input
            id="email"
            className="floating-input"
            placeholder=" "
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
          <label htmlFor="email" className="floating-label">
            Email
          </label>
        </div>
      </div>

      <div className="floating-field">
        <textarea
          id="message"
          className="floating-input min-h-36 resize-none pt-1"
          placeholder=" "
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          required
        />
        <label htmlFor="message" className="floating-label">
          Message
        </label>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-fog-500">Messages are saved securely and can be reviewed in Supabase.</p>
        <button type="submit" className="pill-button pill-button-primary">
          <Mail className="h-4 w-4" />
          <span>{status === 'sending' ? 'Sending...' : status === 'sent' ? 'Message Sent' : 'Send Message'}</span>
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
    </form>
  );
}
