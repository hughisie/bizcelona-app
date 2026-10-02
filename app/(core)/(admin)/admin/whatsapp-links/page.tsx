'use client';
import { useEffect, useState } from 'react';
import { AdminNav } from '../AdminNav';

type Link = { id: string; group_name: string; public_url: string; actual_whatsapp_url: string; is_active: boolean };

export default function WhatsAppLinksPage() {
  const [rows, setRows] = useState<Link[]>([]);
  const [form, setForm] = useState({ group_name: '', public_url: '', actual_whatsapp_url: '', is_active: true });
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const r = await fetch('/api/admin/whatsapp-links'); const j = await r.json();
    if (j.ok) setRows(j.data);
  }
  useEffect(() => { load(); }, []);

  async function create() {
    setMsg(null);
    const r = await fetch('/api/admin/whatsapp-links', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(form),
    });
    const j = await r.json();
    if (!j.ok) { setMsg(j.error ?? 'Error'); return; }
    setForm({ group_name: '', public_url: '', actual_whatsapp_url: '', is_active: true });
    load();
  }

  async function toggle(id: string, is_active: boolean) {
    await fetch(`/api/admin/whatsapp-links/${id}`, {
      method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ is_active }),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm('Delete this link?')) return;
    await fetch(`/api/admin/whatsapp-links/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div className="min-h-screen bg-beige">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <AdminNav active="whatsapp"/>
        <h1 className="text-2xl font-bold text-navy">WhatsApp links</h1>

        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-navy">Add link</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <input placeholder="Group name" className="rounded-md border border-gray-300 px-3 py-2 text-sm" value={form.group_name} onChange={(e) => setForm({ ...form, group_name: e.target.value })}/>
            <input placeholder="Public URL segment (e.g. founders)" className="rounded-md border border-gray-300 px-3 py-2 text-sm" value={form.public_url} onChange={(e) => setForm({ ...form, public_url: e.target.value })}/>
            <input placeholder="Actual chat.whatsapp.com URL" className="rounded-md border border-gray-300 px-3 py-2 text-sm col-span-2" value={form.actual_whatsapp_url} onChange={(e) => setForm({ ...form, actual_whatsapp_url: e.target.value })}/>
          </div>
          <div className="mt-3 flex gap-3 items-center">
            <button onClick={create} className="px-4 py-2 bg-saffron text-navy font-semibold rounded-md text-sm">Add</button>
            {msg && <span className="text-sm text-red-600">{msg}</span>}
          </div>
        </div>

        <div className="mt-6 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-beige text-left">
              <tr><th className="px-4 py-2">Group</th><th className="px-4 py-2">Public URL</th><th className="px-4 py-2">Target</th><th className="px-4 py-2">Active</th><th></th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-gray-100">
                  <td className="px-4 py-2">{r.group_name}</td>
                  <td className="px-4 py-2 font-mono text-xs">/{r.public_url}</td>
                  <td className="px-4 py-2 text-xs text-gray-500 truncate max-w-xs">{r.actual_whatsapp_url}</td>
                  <td className="px-4 py-2"><input type="checkbox" checked={r.is_active} onChange={(e) => toggle(r.id, e.target.checked)}/></td>
                  <td className="px-4 py-2 text-right"><button onClick={() => remove(r.id)} className="text-red-600 text-xs underline">Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
