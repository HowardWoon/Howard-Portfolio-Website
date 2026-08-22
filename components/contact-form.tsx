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
    <form onSubmit={submitForm} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="relative">
          <input
            id="name"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-5 pb-4 pt-6 text-white outline-none transition focus-within:border-primary peer"
            placeholder=" "
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            required
          />
          <label htmlFor="name" className="absolute left-5 top-4 text-xs font-bold uppercase tracking-widest text-muted transition-all peer-focus:-translate-y-2 peer-focus:scale-90 peer-focus:text-primary peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:scale-90 peer-[:not(:placeholder-shown)]:text-muted">
            Name
          </label>
        </div>
        <div className="relative">
          <input
            id="email"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-5 pb-4 pt-6 text-white outline-none transition focus-within:border-primary peer"
            placeholder=" "
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
          <label htmlFor="email" className="absolute left-5 top-4 text-xs font-bold uppercase tracking-widest text-muted transition-all peer-focus:-translate-y-2 peer-focus:scale-90 peer-focus:text-primary peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:scale-90 peer-[:not(:placeholder-shown)]:text-muted">
            Email
          </label>
        </div>
      </div>

      <div className="relative">
        <textarea
          id="message"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-5 pb-4 pt-6 text-white outline-none transition focus-within:border-primary min-h-[150px] resize-none peer"
          placeholder=" "
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          required
        />
        <label htmlFor="message" className="absolute left-5 top-4 text-xs font-bold uppercase tracking-widest text-muted transition-all peer-focus:-translate-y-2 peer-focus:scale-90 peer-focus:text-primary peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:scale-90 peer-[:not(:placeholder-shown)]:text-muted">
          Message
        </label>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-2">
        <p className="text-xs font-bold uppercase tracking-widest text-muted font-jetbrains">Securely powered by Supabase.</p>
        <button type="submit" className="pill-button pill-button-primary">
          <Mail className="h-4 w-4" />
          <span>{status === 'sending' ? 'Sending...' : status === 'sent' ? 'Message Sent' : 'Send Message'}</span>
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>
      {error ? <p className="text-sm font-bold text-red-500 uppercase tracking-widest">{error}</p> : null}
    </form>
  );
}
