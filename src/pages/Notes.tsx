import React, { useEffect, useState } from 'react';
import { Card, EmptyState } from '@/components/common/Primitives';
import { Button } from '@/components/common/Button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { db } from '@/db/db';
import { generateId } from '@/lib/id';
import { downloadJson } from '@/lib/backup';
import { useToast } from '@/context/ToastContext';
import type { Note } from '@/types';

export default function Notes() {
  const { showToast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const load = async () => {
    const rows = await db.notes.toArray();
    setNotes(rows.sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt.localeCompare(a.updatedAt)));
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!draft.trim()) return;
    const now = new Date().toISOString();
    if (editingId) {
      const existing = await db.notes.get(editingId);
      if (existing) await db.notes.put({ ...existing, content: draft.trim(), updatedAt: now });
    } else {
      const note: Note = { id: generateId('note'), attachTo: { type: 'general' }, content: draft.trim(), pinned: false, createdAt: now, updatedAt: now };
      await db.notes.put(note);
    }
    setDraft('');
    setEditingId(null);
    showToast('Note saved', 'success');
    await load();
  };

  const remove = async () => {
    if (!deleteTarget) return;
    await db.notes.delete(deleteTarget);
    setDeleteTarget(null);
    showToast('Note deleted', 'info');
    await load();
  };

  const togglePin = async (id: string) => {
    const n = await db.notes.get(id);
    if (n) await db.notes.put({ ...n, pinned: !n.pinned });
    await load();
  };

  const exportNotes = () => {
    downloadJson('bsf-ro-rm-notes.json', notes);
    showToast('Notes exported', 'success');
  };

  const filtered = notes.filter((n) => !search.trim() || n.content.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">
          Notes <span className="font-hi text-muted font-normal text-lg">/ नोट्स</span>
        </h1>
        <button onClick={exportNotes} className="text-xs font-semibold text-brand-green2">
          Export
        </button>
      </div>

      <Card>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write a note... / नोट लिखें..."
          rows={3}
          className="w-full bg-transparent outline-none text-sm resize-none"
        />
        <div className="flex justify-end gap-2 mt-2">
          {editingId && (
            <Button size="sm" variant="outline" onClick={() => { setDraft(''); setEditingId(null); }}>
              Cancel
            </Button>
          )}
          <Button size="sm" onClick={save}>
            {editingId ? 'Update Note' : 'Add Note'}
          </Button>
        </div>
      </Card>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search notes / नोट्स खोजें"
        className="w-full p-3 rounded-[11px] border border-line dark:border-white/10 bg-white dark:bg-white/5 text-sm outline-none"
      />

      {filtered.length === 0 ? (
        <EmptyState title="No notes yet" subtitle="Add your first note above." />
      ) : (
        <div className="space-y-2.5">
          {filtered.map((n) => (
            <Card key={n.id}>
              <p className="text-sm whitespace-pre-wrap">{n.content}</p>
              <div className="flex justify-between items-center mt-2.5">
                <button onClick={() => togglePin(n.id)} className="text-xs text-muted">
                  {n.pinned ? '📌 Pinned' : '📍 Pin'}
                </button>
                <div className="flex gap-2">
                  <button
                    className="text-xs font-semibold text-brand-green2"
                    onClick={() => {
                      setDraft(n.content);
                      setEditingId(n.id);
                    }}
                  >
                    Edit
                  </button>
                  <button className="text-xs font-semibold text-red-600" onClick={() => setDeleteTarget(n.id)}>
                    Delete
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete this note?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={remove}
      />
    </div>
  );
}
