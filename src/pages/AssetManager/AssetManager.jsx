import React, { useState, useMemo } from 'react';
import { useAssetStore } from '../../store';
import { useToast } from '../../lib/toast';
import { Badge, TYPE_LABELS, STATUS_LABELS, PRIORITY_LABELS } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal, FormGroup, FormRow } from '../../components/ui/Modal';
import { Plus, Search, Filter, Trash2, Edit3, ChevronUp, ChevronDown } from 'lucide-react';
import styles from './AssetManager.module.css';

const TYPES = ['mesh','texture','audio','blueprint','animation','vfx'];
const STATUSES = ['integrated','in-progress','planned'];
const PRIORITIES = ['critical','high','medium','low'];
const OWNERS = ['Captain','Maya','Alex','Jake','Sam','Layla','Ryan','Nina'];
const EMPTY = { name:'', type:'mesh', status:'planned', owner:'Alex', priority:'medium', fileSize:'—', polyCount:'—', notes:'' };

export default function AssetManager() {
  const { assets, addAsset, updateAsset, deleteAsset } = useAssetStore();
  const { addToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  const filtered = useMemo(() => {
    let res = assets.filter(a => {
      if (filterType !== 'all' && a.type !== filterType) return false;
      if (filterStatus !== 'all' && a.status !== filterStatus) return false;
      if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.owner.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    res = [...res].sort((a, b) => {
      const va = a[sortKey] || ''; const vb = b[sortKey] || '';
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });
    return res;
  }, [assets, search, filterType, filterStatus, sortKey, sortDir]);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const handleSave = () => {
    if (!form.name.trim()) { addToast('Asset name is required.', 'error'); return; }
    if (editingAsset) { updateAsset(editingAsset.id, form); addToast('Asset updated.', 'success'); }
    else { addAsset(form); addToast('Asset added.', 'success'); }
    setShowModal(false); setEditingAsset(null); setForm({ ...EMPTY });
  };

  const handleEdit = (a) => { setEditingAsset(a); setForm({ ...a }); setShowModal(true); };
  const handleDelete = (id) => { deleteAsset(id); addToast('Asset deleted.', 'warning'); };

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return null;
    return sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Asset Manager</h1>
          <p className={styles.subtitle}>{assets.length} assets tracked — {assets.filter(a=>a.status==='integrated').length} integrated</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => { setEditingAsset(null); setForm({ ...EMPTY }); setShowModal(true); }}>Add Asset</Button>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={13} className={styles.searchIcon} />
          <input className={styles.searchInput} placeholder="Search by name or owner…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className={styles.pills}>
          {['all', ...TYPES].map(t => (
            <button key={t} className={`${styles.pill} ${filterType === t ? styles.pillActive : ''}`} onClick={() => setFilterType(t)}>
              {t === 'all' ? 'All' : TYPE_LABELS[t]}
            </button>
          ))}
        </div>
        <select className={styles.sel} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              {[['name','Asset Name'],['type','Type'],['status','Status'],['owner','Owner'],['priority','Priority'],['fileSize','Size'],['updatedAt','Updated']].map(([key, label]) => (
                <th key={key} className={styles.th} onClick={() => handleSort(key)}>
                  <span style={{ display:'flex', alignItems:'center', gap:4, cursor:'pointer', userSelect:'none' }}>
                    {label} <SortIcon col={key} />
                  </span>
                </th>
              ))}
              <th className={styles.th}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={8} className={styles.emptyCell}>No assets match your filters.</td></tr>
            )}
            {filtered.map(a => (
              <tr key={a.id} className={styles.row}>
                <td className={styles.td}>
                  <span className={styles.assetName}>{a.name}</span>
                  {a.notes && <span className={styles.assetNotes}>{a.notes.slice(0, 50)}{a.notes.length > 50 ? '…' : ''}</span>}
                </td>
                <td className={styles.td}><Badge label={TYPE_LABELS[a.type] || a.type} variant={a.type} size="xs" /></td>
                <td className={styles.td}><Badge label={STATUS_LABELS[a.status] || a.status} variant={a.status} size="xs" dot /></td>
                <td className={styles.td}><span className={styles.owner}>{a.owner}</span></td>
                <td className={styles.td}><Badge label={PRIORITY_LABELS[a.priority] || a.priority} variant={a.priority} size="xs" /></td>
                <td className={styles.td}><span className={styles.mono}>{a.fileSize}</span></td>
                <td className={styles.td}><span className={styles.date}>{a.updatedAt ? new Date(a.updatedAt).toLocaleDateString() : '—'}</span></td>
                <td className={styles.td}>
                  <div className={styles.rowActions}>
                    <button className={styles.actionBtn} onClick={() => handleEdit(a)} title="Edit"><Edit3 size={13} /></button>
                    <button className={styles.actionBtn} onClick={() => handleDelete(a.id)} title="Delete"><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditingAsset(null); }} title={editingAsset ? 'Edit Asset' : 'Add Asset'} size="lg"
        footer={<><Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button><Button variant="primary" onClick={handleSave}>{editingAsset ? 'Save' : 'Add Asset'}</Button></>}
      >
        <FormGroup label="Asset Name" required hint="Use UE5 naming convention: SM_, T_, ABP_, SFX_, BP_, NS_"><input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="e.g. SM_Rock_Desert_01" autoFocus /></FormGroup>
        <FormRow>
          <FormGroup label="Type"><select value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))}>{TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}</select></FormGroup>
          <FormGroup label="Status"><select value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))}>{STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}</select></FormGroup>
        </FormRow>
        <FormRow>
          <FormGroup label="Owner"><select value={form.owner} onChange={e => setForm(f => ({...f, owner: e.target.value}))}>{OWNERS.map(o => <option key={o} value={o}>{o}</option>)}</select></FormGroup>
          <FormGroup label="Priority"><select value={form.priority} onChange={e => setForm(f => ({...f, priority: e.target.value}))}>{PRIORITIES.map(p => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}</select></FormGroup>
        </FormRow>
        <FormRow>
          <FormGroup label="File Size" hint="e.g. 12.4 MB or — if not yet produced"><input value={form.fileSize} onChange={e => setForm(f => ({...f, fileSize: e.target.value}))} placeholder="12.4 MB" /></FormGroup>
          <FormGroup label="Poly Count / Resolution"><input value={form.polyCount} onChange={e => setForm(f => ({...f, polyCount: e.target.value}))} placeholder="~480K (Nanite)" /></FormGroup>
        </FormRow>
        <FormGroup label="Notes"><textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} placeholder="Integration notes, LOD info, dependencies…" rows={2} /></FormGroup>
      </Modal>
    </div>
  );
}
