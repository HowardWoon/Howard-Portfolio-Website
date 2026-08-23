import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { Mail, MailOpen, CalendarDays, ArrowUpRight, Check, Trash2, X } from 'lucide-react';
import { requireAdminUser } from '@/lib/admin-auth';
import { markAsRead, markAsUnread, deleteMessage } from './actions';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type ContactMessage = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
};

export default async function MessagesPage() {
  await requireAdminUser();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    { auth: { persistSession: false } }
  );

  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('is_read', { ascending: true })
    .order('created_at', { ascending: false });

  const messages = (data ?? []) as ContactMessage[];
  const unreadCount = messages.filter((message) => !message.is_read).length;

  return (
    <section className="space-y-6">
      <div className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="muted-label mb-2">Inbox</p>
            <h1 className="text-3xl font-semibold text-white">Contact messages</h1>
            <p className="mt-3 text-sm leading-7 text-fog-500">
              Review incoming leads and inquiries submitted through the public contact form.
            </p>
          </div>
          <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-fog-500">
            {unreadCount} unread
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {messages.length === 0 ? (
          <div className="glass-panel rounded-[2rem] p-8 text-center text-fog-500">
            {error ? 'Failed to load messages or Supabase is not configured.' : 'No contact submissions yet.'}
          </div>
        ) : (
          messages.map((message) => (
            <article key={message.id} className={`glass-panel rounded-[2rem] p-6 sm:p-7 transition-all ${!message.is_read ? 'border-amber-500/30 bg-[#0E121B]' : 'opacity-80'}`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    {message.is_read ? (
                      <MailOpen className="h-4 w-4 text-fog-500" />
                    ) : (
                      <Mail className="h-4 w-4 text-amber-400" />
                    )}
                    <h2 className="text-xl font-semibold text-white">{message.name}</h2>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs uppercase tracking-[0.24em] text-fog-500">
                      {message.is_read ? 'Read' : 'Unread'}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-fog-500 flex items-center gap-2">
                    <a href={`mailto:${message.email}`} className="transition hover:text-white font-mono">
                      {message.email}
                    </a>
                    {message.subject && (
                      <>
                        <span>•</span>
                        <span className="text-amber-400/80 font-mono">"{message.subject}"</span>
                      </>
                    )}
                  </p>
                </div>
                <p className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-fog-500">
                  <CalendarDays className="h-4 w-4" />
                  {new Date(message.created_at).toLocaleString()}
                </p>
              </div>

              <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-fog-100 p-4 rounded-xl bg-black/40 border border-white/5 font-sans">
                {message.message}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
                <Link
                  href={`mailto:${message.email}?subject=Re:%20Howard%20Portfolio%20Inquiry`}
                  className="pill-button pill-button-primary bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30"
                >
                  <ArrowUpRight className="h-4 w-4" />
                  <span>Reply</span>
                </Link>

                <form action={message.is_read ? markAsUnread.bind(null, message.id) : markAsRead.bind(null, message.id)}>
                  <button type="submit" className="pill-button bg-white/[0.04] text-white hover:bg-white/10">
                    {message.is_read ? (
                      <>
                        <X className="h-4 w-4" />
                        <span>Mark Unread</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 text-emerald-400" />
                        <span>Mark Read</span>
                      </>
                    )}
                  </button>
                </form>

                <form action={deleteMessage.bind(null, message.id)}>
                  <button type="submit" className="pill-button bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20 ml-auto">
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </button>
                </form>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}