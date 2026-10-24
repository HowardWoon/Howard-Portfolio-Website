import { Eye, EyeOff, Trash2 } from 'lucide-react';
import { requireAdminUser } from '@/lib/admin-auth';
import { createServiceRoleClient, hasServiceRole } from '@/lib/supabase/route';
import { ConfirmSubmitButton } from '../messages/confirm-submit-button';
import { deleteExhibit, togglePublished } from './actions';
import { BuiltInList, ExhibitForm } from './exhibit-form';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Item = {
  id: string;
  room: string;
  slug: string;
  kind: string;
  title: string;
  hidden: boolean;
  published: boolean;
  image: { src?: string } | null;
  updated_at: string;
};

/** Walk-in 3D gallery: the exhibits added outside the code (sql/002_gallery.sql), live on the site within ~30 s */
export default async function GalleryAdminPage() {
  await requireAdminUser();
  const { data, error } = hasServiceRole()
    ? await createServiceRoleClient()
        .from('gallery_items')
        .select('id, room, slug, kind, title, hidden, published, image, updated_at')
        .order('room')
        .order('sort_order', { ascending: true, nullsFirst: false })
        .order('created_at')
        .limit(500)
    : { data: null, error: { message: 'not configured' } };
  const items = (data ?? []) as Item[];
  const hidden = items.filter((i) => i.hidden && i.published).map((i) => `${i.room}/${i.slug}`);

  return (
    <section className="space-y-6">
      <div className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <p className="muted-label mb-2">3D gallery</p>
        <h1 className="text-3xl font-semibold text-white">Rooms behind the street doors</h1>
        <p className="mt-3 text-sm leading-7 text-fog-500">
          Every room shows the website&apos;s own data first. Exhibits saved here are added on top (or replace / hide a
          built-in one with the same id). No deploy needed.
        </p>
        {error && (
          <p className="mt-3 text-sm text-red-400">
            Supabase is not configured or sql/002_gallery.sql has not been run yet ({error.message}).
          </p>
        )}
      </div>

      <ExhibitForm />

      <div className="glass-panel space-y-3 rounded-[2rem] p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-white">Saved exhibits</h2>
        {items.length === 0 ? (
          <p className="text-sm text-fog-500">Nothing saved yet.</p>
        ) : (
          <ul className="grid gap-2">
            {items.map((i) => (
              <li
                key={i.id}
                className={`flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-3 py-2 ${i.published ? '' : 'opacity-60'}`}
              >
                <code className="text-xs text-amber-300">
                  {i.room}/{i.slug}
                </code>
                <span className="min-w-0 flex-1 truncate text-sm text-fog-100">
                  {i.hidden ? '(hides a built-in exhibit)' : i.title}
                </span>
                <span className="text-xs uppercase tracking-[0.2em] text-fog-500">{i.kind}</span>
                <form action={togglePublished.bind(null, i.id, !i.published)}>
                  <button type="submit" className="pill-button bg-white/[0.04] text-white hover:bg-white/10">
                    {i.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span>{i.published ? 'Unpublish' : 'Publish'}</span>
                  </button>
                </form>
                <form action={deleteExhibit.bind(null, i.id)}>
                  <ConfirmSubmitButton
                    message={`Delete ${i.room}/${i.slug}? Its uploaded picture is deleted too.`}
                    className="pill-button bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </ConfirmSubmitButton>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>

      <BuiltInList hidden={hidden} />
    </section>
  );
}
