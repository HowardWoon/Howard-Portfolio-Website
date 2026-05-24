import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { Mail, MailOpen, CalendarDays, ArrowUpRight } from 'lucide-react';
import { requireAdminUser } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type ContactMessage = {
  id: string;
  created_at: string;
  name: string;
  email: string;
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

  const { data } = await supabase
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
            No contact submissions yet.
          </div>
        ) : (
          messages.map((message) => (
            <article key={message.id} className="glass-panel rounded-[2rem] p-6 sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    {message.is_read ? (
                      <MailOpen className="h-4 w-4 text-fog-500" />
                    ) : (
                      <Mail className="h-4 w-4 text-white" />
                    )}
                    <h2 className="text-xl font-semibold text-white">{message.name}</h2>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs uppercase tracking-[0.24em] text-fog-500">
                      {message.is_read ? 'Read' : 'Unread'}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-fog-500">
                    <a href={`mailto:${message.email}`} className="transition hover:text-white">
                      {message.email}
                    </a>
                  </p>
                </div>
                <p className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-fog-500">
                  <CalendarDays className="h-4 w-4" />
                  {new Date(message.created_at).toLocaleString()}
                </p>
              </div>

              <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-fog-100">
                {message.message}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link
                  href={`mailto:${message.email}?subject=Re:%20Howard%20Portfolio%20Inquiry`}
                  className="pill-button pill-button-primary"
                >
                  <ArrowUpRight className="h-4 w-4" />
                  <span>Reply</span>
                </Link>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
