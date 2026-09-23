"use client";

import { useState } from "react";
import Image from "next/image";
import { ARCHIVE_DATA } from "./field-archive-data";
import { FieldRecordViewer } from "./field-record-viewer";

interface FieldArchiveProps {
  archiveId: string;
}

export function FieldArchive({ archiveId }: FieldArchiveProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const records = ARCHIVE_DATA[archiveId];

  if (!records || records.length === 0) return null;

  const tileBase =
    "group relative bg-paper-deep rounded-2xl overflow-hidden cursor-pointer border-3 border-ink shadow-brutal-sm transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-brutal focus-visible:-translate-y-1";

  return (
    <div className="mt-8 pt-8 border-t-2 border-dashed border-ink">
      <div className="flex items-center gap-4 mb-6">
        <span className="nb-tag bg-pop-mint">
          FIELD ARCHIVE // {String(records.length).padStart(2, '0')} RECORDS
        </span>
        <div className="flex-1 h-[3px] bg-ink rounded-full" />
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4">

        {/* HERO IMAGE */}
        {records[0] && (
          <button
            type="button"
            onClick={() => setSelectedIndex(0)}
            className={`${tileBase} md:col-span-7 xl:col-span-8 aspect-video md:aspect-auto md:min-h-[400px] text-left`}
          >
            <Image
              src={records[0].image}
              alt={records[0].caption}
              fill
              sizes="(max-width: 768px) 100vw, 60vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Hero Label (sticker) */}
            <div className="absolute left-4 bottom-4 right-4 flex flex-col items-start gap-1.5">
              <div className="nb-tag bg-white text-[0.7rem]">FIELD RECORD // {records[0].recordId}</div>
              <div className="max-w-full [overflow-wrap:anywhere] font-display text-base sm:text-lg font-extrabold text-ink uppercase bg-pop-yellow border-3 border-ink rounded-xl px-3 py-1 shadow-brutal-xs">{records[0].category}</div>
            </div>
          </button>
        )}

        {/* SUPPORTING IMAGES */}
        <div className="md:col-span-5 xl:col-span-4 grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-1 gap-3 md:gap-4">
          {records.slice(1, 3).map((record, idx) => (
            <button
              type="button"
              key={record.id}
              onClick={() => setSelectedIndex(idx + 1)}
              className={`${tileBase} aspect-video min-[480px]:aspect-square md:aspect-video text-left`}
            >
              <Image
                src={record.image}
                alt={record.caption}
                fill
                sizes="(max-width: 768px) 50vw, 30vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute left-3 bottom-3 right-3">
                <div className="nb-tag bg-white text-[0.7rem] max-w-full">{record.recordId}{" // "}{record.category}</div>
              </div>
            </button>
          ))}
        </div>

        {/* BOTTOM ROW (if more than 3 photos) */}
        {records.length > 3 && (
          <div className="md:col-span-12 grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
            {records.slice(3).map((record, idx) => (
              <button
                type="button"
                key={record.id}
                onClick={() => setSelectedIndex(idx + 3)}
                className={`${tileBase} aspect-square text-left`}
              >
                <Image
                  src={record.image}
                  alt={record.caption}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute left-3 bottom-3 right-3">
                  {/* full caption only where the square tiles are wide enough (it was cropped on phones/tablets) */}
                  <div className="nb-tag bg-white text-[0.7rem] hidden xl:inline-flex">{record.recordId}{" // "}{record.category}</div>
                  <div className="nb-tag bg-white text-[0.7rem] xl:hidden">{record.recordId}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Viewer Modal (portaled to <body>) */}
      {selectedIndex !== null && (
        <FieldRecordViewer
          records={records}
          currentIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onNavigate={setSelectedIndex}
        />
      )}
    </div>
  );
}
