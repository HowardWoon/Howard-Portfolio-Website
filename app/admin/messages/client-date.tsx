'use client';

import React, { useEffect, useState } from 'react';

export function ClientDate({ date }: { date: string }) {
  const [formatted, setFormatted] = useState<string>('');

  useEffect(() => {
    setFormatted(new Date(date).toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur' }));
  }, [date]);

  if (!formatted) return <span>{date.substring(0, 10)}</span>;
  return <span>{formatted}</span>;
}
