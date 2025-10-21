'use client';

import React, { useState } from 'react';

export default function FilesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>('');
  const [resultUrl, setResultUrl] = useState<string>('');

  async function upload() {
    try {
      if (!file) {
        setStatus('Выберите файл');
        return;
      }

      setStatus('Загружаю на сервер…');

      // Отправляем файл НАШЕМУ api-роуту, который уже сам грузит в S3
      const res = await fetch(
        `/api/s3/upload?filename=${encodeURIComponent(file.name)}`,
        {
          method: 'POST',
          // важный момент: ставим простой octet-stream, тело — сырой файл
          headers: { 'Content-Type': 'application/octet-stream' },
          body: file,
        }
      );

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        setStatus(`Ошибка загрузки: ${res.status} ${text.slice(0, 200)}`);
        return;
      }

      // ожидаем { ok: true, url?: string }
      const data = await res.json().catch(() => ({} as any));
      setStatus('Готово ✅');
      setResultUrl(data?.url || '');
    } catch (e: any) {
      setStatus(`Ошибка: ${e?.message ?? String(e)}`);
    }
  }

  return (
    <div style={{ padding: 24, color: 'white' }}>
      <h1 style={{ fontWeight: 600, marginBottom: 12 }}>Файлы</h1>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <button
          onClick={upload}
          style={{
            padding: '8px 14px',
            borderRadius: 8,
            border: '1px solid #555',
            background: 'transparent',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          Загрузить
        </button>
      </div>

      <div style={{ marginTop: 12, opacity: 0.85 }}>
        Статус: {status || '—'}
      </div>

      {resultUrl && (
        <div style={{ marginTop: 8 }}>
          Загружено: <a href={resultUrl} target="_blank">{resultUrl}</a>
        </div>
      )}

      <div style={{ marginTop: 20, opacity: 0.6, fontSize: 12 }}>
        Примечание: здесь используется <code>POST /api/s3/upload?filename=…</code> — загрузкой в S3
        занимается сервер (никаких CORS-проблем).
      </div>
    </div>
  );
}
