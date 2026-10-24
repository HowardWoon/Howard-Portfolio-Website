'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Save } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { SECTIONS } from '@/lib/sections';
import { SECTION_DOORS } from '@/components/tokyo-diorama/engine/doors';
import { buildGalleryContent } from '@/components/tokyo-diorama/gallery/content';
import { saveExhibit, hideBuiltIn } from './actions';

/**
 * Walk-in 3D gallery admin: add an exhibit (a new award, a photo, a project ...) to a room. The picture is read in the
 * browser (its REAL pixel size goes with it), scaled to at most 2000 px, saved as WebP and uploaded straight to the
 * public `gallery` bucket; then the exhibit row is saved. The 3D rooms read it within ~30 s, with no deploy.
 */

const ROOMS = SECTIONS.filter((s) => s.id in SECTION_DOORS);
const field =
  'w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-amber-400/60';
const label = 'block space-y-1 text-xs uppercase tracking-[0.2em] text-fog-500';

async function toWebp(file: File, max = 2000) {
  const bmp = await createImageBitmap(file);
  const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * k);
  c.height = Math.round(bmp.height * k);
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
  bmp.close();
  const blob = await new Promise<Blob | null>((done) => c.toBlob(done, 'image/webp', 0.86));
  if (!blob) throw new Error('This browser could not convert the picture.');
  return { blob, w: c.width, h: c.height };
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'exhibit';

export function ExhibitForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<{ kind: 'idle' | 'busy' | 'ok' | 'error'; text: string }>({
    kind: 'idle',
    text: '',
  });
  return (
    <form
      ref={formRef}
      className="glass-panel grid gap-4 rounded-[2rem] p-6 sm:grid-cols-2 sm:p-8"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        setStatus({ kind: 'busy', text: 'Saving…' });
        try {
          if (!String(form.get('slug') ?? '').trim()) form.set('slug', slugify(String(form.get('title') ?? '')));
          const file = form.get('file');
          if (file instanceof File && file.size > 0) {
            setStatus({ kind: 'busy', text: 'Uploading the picture…' });
            const { blob, w, h } = await toWebp(file);
            const path = `${form.get('room')}/${form.get('slug')}-${Date.now()}.webp`;
            const sb = createSupabaseBrowserClient();
            const up = await sb.storage.from('gallery').upload(path, blob, { contentType: 'image/webp' });
            if (up.error) throw new Error(up.error.message);
            form.set('image_src', sb.storage.from('gallery').getPublicUrl(path).data.publicUrl);
            form.set('image_w', String(w));
            form.set('image_h', String(h));
          }
          form.delete('file');
          const r = await saveExhibit(form);
          if (!r.ok) throw new Error(r.error);
          setStatus({ kind: 'ok', text: 'Saved. It is in the 3D room for the next visitor (about 30 s).' });
          formRef.current?.reset();
        } catch (err) {
          setStatus({ kind: 'error', text: err instanceof Error ? err.message : 'Could not save.' });
        }
      }}
    >
      <div className="sm:col-span-2">
        <p className="muted-label mb-2">3D gallery</p>
        <h2 className="text-2xl font-semibold text-white">Add an exhibit</h2>
        <p className="mt-2 text-sm leading-7 text-fog-500">
          Use the id of a built-in exhibit (listed below) to replace its words or picture. A new id adds a new exhibit;
          the room grows to fit it.
        </p>
      </div>
      <label className={label}>
        <span>Room</span>
        <select name="room" required className={field} defaultValue="honors">
          {ROOMS.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </select>
      </label>
      <label className={label}>
        <span>Kind</span>
        <select name="kind" className={field} defaultValue="honor">
          {['honor', 'project', 'experience', 'custom', 'fact', 'plaque', 'contact'].map((k) => (
            <option key={k}>{k}</option>
          ))}
        </select>
      </label>
      <label className={`${label} sm:col-span-2`}>
        <span>Title *</span>
        <input name="title" required maxLength={200} className={field} />
      </label>
      <label className={label}>
        <span>Id (blank = from the title)</span>
        <input name="slug" maxLength={80} pattern="[A-Za-z0-9_\-]+" className={field} />
      </label>
      <label className={label}>
        <span>Order (lower = earlier)</span>
        <input name="sort_order" type="number" className={field} />
      </label>
      <label className={label}>
        <span>Subtitle (issuer, organisation)</span>
        <input name="subtitle" maxLength={300} className={field} />
      </label>
      <label className={label}>
        <span>Kicker (badge line)</span>
        <input name="kicker" maxLength={120} className={field} />
      </label>
      <label className={label}>
        <span>Meaning (SIGNAL KEY)</span>
        <select name="signal" className={field} defaultValue="">
          <option value="">none</option>
          {['podium', 'qualifier', 'academic', 'leadership', 'ai', 'live', 'industry'].map((k) => (
            <option key={k}>{k}</option>
          ))}
        </select>
      </label>
      <label className={label}>
        <span>Trophy (honours)</span>
        <select name="emblem" className={field} defaultValue="">
          <option value="">by meaning</option>
          {['gold', 'silver', 'bronze', 'star', 'finalist', 'seal', 'ticket', 'badge'].map((k) => (
            <option key={k}>{k}</option>
          ))}
        </select>
      </label>
      <label className={label}>
        <span>Period / date</span>
        <input name="period" maxLength={60} className={field} />
      </label>
      <label className={label}>
        <span>Number (01, 02 …) / figure</span>
        <div className="flex gap-2">
          <input name="number" maxLength={8} placeholder="number" className={field} />
          <input name="value" maxLength={16} placeholder="figure" className={field} />
        </div>
      </label>
      <label className={`${label} sm:col-span-2`}>
        <span>Text (a blank line starts a new paragraph)</span>
        <textarea name="body" rows={4} className={field} />
      </label>
      <label className={label}>
        <span>Highlights (one per line)</span>
        <textarea name="bullets" rows={3} className={field} />
      </label>
      <label className={label}>
        <span>Figures (one per line: Label: Value)</span>
        <textarea name="stats" rows={3} className={field} />
      </label>
      <label className={label}>
        <span>Tags (comma separated)</span>
        <input name="tags" className={field} />
      </label>
      <label className={label}>
        <span>Links (one per line: Label | https://…)</span>
        <textarea name="links" rows={2} className={field} />
      </label>
      <label className={label}>
        <span>Picture (certificate, photo)</span>
        <input name="file" type="file" accept="image/png,image/jpeg,image/webp" className={field} />
      </label>
      <label className={label}>
        <span>Picture description (alt)</span>
        <input name="image_alt" maxLength={300} className={field} />
      </label>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
        <button
          type="submit"
          disabled={status.kind === 'busy'}
          className="pill-button pill-button-primary bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30"
        >
          {status.kind === 'busy' ? <ImagePlus className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          <span>Save exhibit</span>
        </button>
        <p
          role="status"
          className={`text-sm ${status.kind === 'error' ? 'text-red-400' : status.kind === 'ok' ? 'text-emerald-400' : 'text-fog-500'}`}
        >
          {status.text}
        </p>
      </div>
    </form>
  );
}

/** the page's own exhibits, room by room, each with its id (to patch it) and a key to hide it from the 3D room */
export function BuiltInList({ hidden }: { hidden: string[] }) {
  const content = buildGalleryContent();
  return (
    <div className="glass-panel space-y-5 rounded-[2rem] p-6 sm:p-8">
      <div>
        <p className="muted-label mb-2">From the page</p>
        <h2 className="text-2xl font-semibold text-white">Built-in exhibits</h2>
        <p className="mt-2 text-sm leading-7 text-fog-500">
          These come from the website&apos;s own sections; edit them in the code, or patch / hide them here.
        </p>
      </div>
      {Object.values(content).map((room) => (
        <div key={room.id} className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">{room.label}</h3>
          <ul className="grid gap-2">
            {room.exhibits.map((e) => {
              const isHidden = hidden.includes(`${room.id}/${e.id}`);
              return (
                <li
                  key={e.id}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-3 py-2"
                >
                  <code className="text-xs text-amber-300">{e.id}</code>
                  <span className="min-w-0 flex-1 truncate text-sm text-fog-100">{e.title}</span>
                  {isHidden ? (
                    <span className="text-xs uppercase tracking-[0.2em] text-fog-500">hidden</span>
                  ) : (
                    <form action={hideBuiltIn}>
                      <input type="hidden" name="room" value={room.id} />
                      <input type="hidden" name="slug" value={e.id} />
                      <button type="submit" className="pill-button bg-white/[0.04] text-white hover:bg-white/10">
                        Hide in 3D
                      </button>
                    </form>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
