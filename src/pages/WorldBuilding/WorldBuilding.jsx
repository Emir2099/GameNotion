import React, { useState, useMemo } from 'react';
import { useWorldStore } from '../../store';
import { useToast } from '../../lib/toast';
import { Button } from '../../components/ui/Button';
import { Modal, FormGroup, FormRow, Select } from '../../components/ui/Modal';
import { Plus, Search, Edit3, Trash2, Globe } from 'lucide-react';
import styles from './WorldBuilding.module.css';

const CATEGORIES = ['All','Biomes','Factions','Lore','Characters','Economy','Technology','History','Politics'];
const EMPTY = { category:'Lore', title:'', tags:'', content:'<p>Start writing your lore entry here…</p>' };

export default function WorldBuilding() {
  const { entries, addEntry, updateEntry, deleteEntry } = useWorldStore();
  const { addToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [viewingEntry, setViewingEntry] = useState(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');

  const filtered = useMemo(() => entries.filter(e => {
    if (filterCat !== 'All' && e.category !== filterCat) return false;
    if (search && !e.title.toLowerCase().includes(search.toLowerCase()) && !(e.tags||[]).some(t => t.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  }), [entries, search, filterCat]);

  const handleSave = () => {
    if (!form.title.trim()) { addToast('Title is required.', 'error'); return; }
    const tagsArr = typeof form.tags === 'string' ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : form.tags;
    if (editingEntry) { updateEntry(editingEntry.id, { ...form, tags: tagsArr }); addToast('Entry updated.', 'success'); }
    else { addEntry({ ...form, tags: tagsArr }); addToast('Entry created.', 'success'); }
    setShowModal(false); setEditingEntry(null); setForm({ ...EMPTY });
  };

  const handleEdit = (e) => { setEditingEntry(e); setForm({ ...e, tags: Array.isArray(e.tags) ? e.tags.join(', ') : e.tags }); setShowModal(true); };
  const handleDelete = (id) => { deleteEntry(id); setViewingEntry(null); addToast('Entry deleted.', 'warning'); };

  const viewing = viewingEntry ? entries.find(e => e.id === viewingEntry) : null;

  const CAT_COLORS = { Biomes:'#0891b2', Factions:'#dc2626', Lore:'#7c3aed', Characters:'#059669', Economy:'#d97706', Technology:'#2563eb', History:'#9333ea', Politics:'#db2777' };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>World Building</h1>
          <p className={styles.subtitle}>{entries.length} entries — biomes, factions, lore, history</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => { setEditingEntry(null); setForm({ ...EMPTY }); setShowModal(true); }}>Add Entry</Button>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={13} className={styles.searchIcon} />
          <input className={styles.searchInput} placeholder="Search entries and tags…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className={styles.cats}>
          {CATEGORIES.map(c => (
            <button key={c} className={`${styles.cat} ${filterCat === c ? styles.catActive : ''}`} onClick={() => setFilterCat(c)}>{c}</button>
          ))}
        </div>
      </div>

      <div className={styles.grid}>
        {filtered.length === 0 && (
          <div className={styles.empty}><Globe size={32} strokeWidth={1.5}/><p>No world entries found.</p><Button variant="primary" icon={Plus} size="sm" onClick={() => { setForm({ ...EMPTY }); setShowModal(true); }}>Create first entry</Button></div>
        )}
        {filtered.map(e => {
          const cc = CAT_COLORS[e.category] || '#7c3aed';
          return (
            <div key={e.id} className={styles.entryCard} onClick={() => setViewingEntry(e.id)} tabIndex={0} role="button">
              <div className={styles.entryCat} style={{ color: cc, background: cc + '18', borderColor: cc + '33' }}>{e.category}</div>
              <div className={styles.entryTitle}>{e.title}</div>
              <div className={styles.entryTags}>
                {(e.tags || []).map(t => <span key={t} className={styles.entryTag}>{t}</span>)}
              </div>
              <div className={styles.entrySnippet} dangerouslySetInnerHTML={{ __html: e.content?.replace(/<[^>]+>/g, '').slice(0, 100) + '…' }} />
            </div>
          );
        })}
      </div>

      {/* View modal */}
      <Modal isOpen={!!viewing} onClose={() => setViewingEntry(null)} title={viewing?.title || ''} size="xl"
        footer={<>
          <Button variant="danger" size="sm" icon={Trash2} onClick={() => handleDelete(viewing.id)}>Delete</Button>
          <div style={{flex:1}} />
          <Button variant="ghost" onClick={() => setViewingEntry(null)}>Close</Button>
          <Button variant="primary" icon={Edit3} onClick={() => { setViewingEntry(null); handleEdit(viewing); }}>Edit</Button>
        </>}
      >
        {viewing && (
          <div>
            <div style={{ display:'flex', gap: 8, marginBottom: 14, flexWrap:'wrap' }}>
              {(viewing.tags||[]).map(t => <span key={t} className={styles.entryTag}>{t}</span>)}
            </div>
            <div className={styles.richContent} dangerouslySetInnerHTML={{ __html: viewing.content }} />
          </div>
        )}
      </Modal>

      {/* Add/Edit modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditingEntry(null); }} title={editingEntry ? 'Edit Entry' : 'New World Entry'} size="lg"
        footer={<><Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button><Button variant="primary" onClick={handleSave}>{editingEntry ? 'Save' : 'Create'}</Button></>}
      >
        <FormRow>
          <FormGroup label="Category"><Select value={form.category} onChange={e => setForm(f => ({...f, category:e.target.value}))}>{CATEGORIES.filter(c=>c!=='All').map(c=><option key={c} value={c}>{c}</option>)}</Select></FormGroup>
          <FormGroup label="Title" required><input value={form.title} onChange={e => setForm(f => ({...f, title:e.target.value}))} placeholder="Entry title" autoFocus /></FormGroup>
        </FormRow>
        <FormGroup label="Tags" hint="Comma-separated — e.g. Zone 2, Iron Veil, Critical Lore"><input value={form.tags} onChange={e => setForm(f => ({...f, tags:e.target.value}))} placeholder="Zone 2, Iron Veil, Volcanic…" /></FormGroup>
        <FormGroup label="Content" hint="Use Markdown-style formatting in the text area below">
          <textarea value={form.content?.replace(/<[^>]+>/g, '')} onChange={e => setForm(f => ({...f, content: '<p>' + e.target.value.split('\n').join('</p><p>') + '</p>'}))} placeholder="Write your lore entry…" rows={8} style={{fontFamily:'var(--font-mono)', fontSize:13}} />
        </FormGroup>
      </Modal>
    </div>
  );
}
