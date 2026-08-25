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

  return (
    <div className="mt-8 pt-8 border-t border-white/5">
      <div className="flex items-center gap-4 mb-6">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
          FIELD ARCHIVE // {String(records.length).padStart(2, '0')} RECORDS
        </span>
        <div className="flex-1 h-[1px] bg-white/5"></div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4">
        
        {/* HERO IMAGE */}
        {records[0] && (
          <div 
            onClick={() => setSelectedIndex(0)}
            className="group relative md:col-span-7 xl:col-span-8 aspect-video md:aspect-auto md:min-h-[400px] bg-black rounded-xl overflow-hidden cursor-pointer border border-white/5 hover:border-amber-400/50 transition-colors"
          >
            <Image
              src={records[0].image}
              alt={records[0].caption}
              fill
              className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
            />
            {/* Hero Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-6">
              <div className="text-[10px] font-mono text-amber-400 mb-1">FIELD RECORD // {records[0].recordId}</div>
              <div className="text-sm sm:text-base font-mono font-bold text-white uppercase tracking-wider">{records[0].category}</div>
            </div>
          </div>
        )}

        {/* SUPPORTING IMAGES */}
        <div className="md:col-span-5 xl:col-span-4 grid grid-cols-2 md:grid-cols-1 gap-3 md:gap-4">
          {records.slice(1, 3).map((record, idx) => (
            <div 
              key={record.id}
              onClick={() => setSelectedIndex(idx + 1)}
              className="group relative aspect-square md:aspect-video bg-black rounded-xl overflow-hidden cursor-pointer border border-white/5 hover:border-white/20 transition-colors"
            >
              <Image
                src={record.image}
                alt={record.caption}
                fill
                className="object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent flex flex-col justify-end p-4">
                <div className="text-[10px] font-mono text-neutral-400 group-hover:text-amber-400 transition-colors">{record.recordId} // {record.category}</div>
              </div>
            </div>
          ))}
        </div>

        {/* BOTTOM ROW (if more than 3 photos) */}
        {records.length > 3 && (
          <div className="md:col-span-12 grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
            {records.slice(3).map((record, idx) => (
              <div 
                key={record.id}
                onClick={() => setSelectedIndex(idx + 3)}
                className="group relative aspect-square bg-black rounded-xl overflow-hidden cursor-pointer border border-white/5 hover:border-white/20 transition-colors"
              >
                <Image
                  src={record.image}
                  alt={record.caption}
                  fill
                  className="object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent flex flex-col justify-end p-4">
                  <div className="text-[10px] font-mono text-neutral-400 group-hover:text-amber-400 transition-colors hidden sm:block">{record.recordId} // {record.category}</div>
                  <div className="text-[10px] font-mono text-neutral-400 group-hover:text-amber-400 transition-colors sm:hidden">{record.recordId}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Viewer Modal */}
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