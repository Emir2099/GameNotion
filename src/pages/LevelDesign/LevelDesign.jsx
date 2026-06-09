import React, { useState } from 'react';
import { useLevelStore } from '../../store';
import { useToast } from '../../lib/toast';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal, FormGroup, FormRow, Select } from '../../components/ui/Modal';
import { Plus, Edit3, Trash2, Map, Users, Package } from 'lucide-react';
import styles from './LevelDesign.module.css';

const STATUS_OPTS = [
  { val: 'planned', label: '📋 Planned', color: '#7c3aed' },
  { val: 'whitebox', label: '📦 Whitebox', color: '#d97706' },
  { val: 'in-progress', label: '🔄 In Progress', color: '#2563eb' },
  { val: 'done', label: '✅ Done', color: '#059669' },
];
const BIOMES = ['Urban Megacity','Volcanic Desert','Urban Wetlands','Glacial Mountain','Underground Industrial','Quantum Void','Forest','Tundra','Coastal'];
const DESIGNERS = ['Captain','Maya','Alex','Jake','Sam','Layla','Ryan','Nina'];
const EMPTY = { number:'', name:'', biome:'Urban Megacity', size:'', status:'planned', progress:0, description:'', assetCount:0, actorCount:0, designer:'Captain', notes:'' };

export default function LevelDesign() {
  const { levels, addLevel, updateLevel, deleteLevel } = useLevelStore();
  const { addToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editingLevel, setEditingLevel] = useState(null);
  const [viewingLevel, setViewingLevel] = useState(null);
  const [form, setForm] = useState({ ...EMPTY });

  const handleSave = () => {
    if (!form.name.trim()) { addToast('Level name is required.', 'error'); return; }
    if (editingLevel) { updateLevel(editingLevel.id, form); addToast('Level updated.', 'success'); }
    else { addLevel(form); addToast('Level added.', 'success'); }
    setShowModal(false); setEditingLevel(null); setForm({ ...EMPTY });
  };

  const handleEdit = (l) => { setEditingLevel(l); setForm({ ...l }); setShowModal(true); };
  const handleDelete = (id) => { deleteLevel(id); setViewingLevel(null); addToast('Level deleted.', 'warning'); };

  const viewing = viewingLevel ? levels.find(l => l.id === viewingLevel) : null;
  const statusColor = (status) => STATUS_OPTS.find(s => s.val === status)?.color || '#374151';

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Level Design</h1>
          <p className={styles.subtitle}>{levels.length} levels · {levels.filter(l=>l.status==='done').length} complete · {levels.filter(l=>l.status==='in-progress').length} in production</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => { setEditingLevel(null); setForm({ ...EMPTY }); setShowModal(true); }}>Add Level</Button>
      </div>

      <div className={styles.levels}>
        {levels.map(l => {
          const sc = statusColor(l.status);
          return (
            <div key={l.id} className={styles.levelCard} onClick={() => setViewingLevel(l.id)} tabIndex={0} role="button">
              <div className={styles.levelNum} style={{ background: sc + '22', color: sc, borderColor: sc + '44' }}>
                {l.number || levels.indexOf(l)+1}
              </div>
              <div className={styles.levelInfo}>
                <div className={styles.levelName}>{l.name}</div>
                <div className={styles.levelMeta}>
                  <span>{l.biome}</span>
                  {l.size && <><span className={styles.dot}>·</span><span>{l.size}</span></>}
                  {l.designer && <><span className={styles.dot}>·</span><span>Lead: {l.designer}</span></>}
                </div>
                <div className={styles.progressWrap}>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${l.progress}%`, background: sc }} />
                  </div>
                  <span className={styles.progressPct}>{l.progress}%</span>
                </div>
              </div>
              <div className={styles.levelRight}>
                <Badge
                  label={STATUS_OPTS.find(s => s.val === l.status)?.label || l.status}
                  variant={l.status}
                  size="xs"
                />
                <div className={styles.levelStats}>
                  <span><Package size={11} /> {l.assetCount}</span>
                  <span><Users size={11} /> {l.actorCount}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* View modal */}
      <Modal isOpen={!!viewing} onClose={() => setViewingLevel(null)} title={`Level ${viewing?.number} — ${viewing?.name}`} size="lg"
        footer={<>
          <Button variant="danger" size="sm" icon={Trash2} onClick={() => handleDelete(viewing.id)}>Delete</Button>
          <div style={{flex:1}} />
          <Button variant="ghost" onClick={() => setViewingLevel(null)}>Close</Button>
          <Button variant="primary" icon={Edit3} onClick={() => { setViewingLevel(null); handleEdit(viewing); }}>Edit</Button>
        </>}
      >
        {viewing && (
          <div>
            <div className={styles.viewGrid}>
              {[['Biome', viewing.biome],['Size', viewing.size||'—'],['Designer', viewing.designer],['Status', STATUS_OPTS.find(s=>s.val===viewing.status)?.label],['Assets', viewing.assetCount],['Actors / NPCs', viewing.actorCount]].map(([k,v]) => (
                <div key={k} className={styles.viewItem}>
                  <span className={styles.viewKey}>{k}</span>
                  <span className={styles.viewVal}>{v}</span>
                </div>
              ))}
            </div>
            <div className={styles.viewProgress}>
              <span className={styles.viewKey}>Production Progress — {viewing.progress}%</span>
              <div className={styles.progressBar} style={{height:8, marginTop:8}}>
                <div className={styles.progressFill} style={{width:`${viewing.progress}%`, background: statusColor(viewing.status)}} />
              </div>
            </div>
            {viewing.description && <><strong className={styles.viewKey} style={{display:'block',marginTop:14,marginBottom:6}}>Description</strong><p className={styles.viewDesc}>{viewing.description}</p></>}
            {viewing.notes && <><strong className={styles.viewKey} style={{display:'block',marginTop:14,marginBottom:6}}>Notes</strong><p className={styles.viewDesc}>{viewing.notes}</p></>}
          </div>
        )}
      </Modal>

      {/* Add/Edit modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditingLevel(null); }} title={editingLevel ? 'Edit Level' : 'New Level'} size="lg"
        footer={<><Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button><Button variant="primary" onClick={handleSave}>{editingLevel ? 'Save' : 'Add Level'}</Button></>}
      >
        <FormRow>
          <FormGroup label="Number / ID" hint="e.g. 01, 02A"><input value={form.number} onChange={e => setForm(f=>({...f, number:e.target.value}))} placeholder="01" style={{width:'100%'}} /></FormGroup>
          <FormGroup label="Level Name" required><input value={form.name} onChange={e => setForm(f=>({...f, name:e.target.value}))} placeholder="NEXUS Central — Tutorial Zone" autoFocus /></FormGroup>
        </FormRow>
        <FormRow>
          <FormGroup label="Biome"><Select value={form.biome} onChange={e => setForm(f=>({...f, biome:e.target.value}))}>{BIOMES.map(b => <option key={b} value={b}>{b}</option>)}</Select></FormGroup>
          <FormGroup label="Size"><input value={form.size} onChange={e => setForm(f=>({...f, size:e.target.value}))} placeholder="18 km²" /></FormGroup>
        </FormRow>
        <FormRow>
          <FormGroup label="Status"><Select value={form.status} onChange={e => setForm(f=>({...f, status:e.target.value}))}>{STATUS_OPTS.map(s=><option key={s.val} value={s.val}>{s.label}</option>)}</Select></FormGroup>
          <FormGroup label="Lead Designer"><Select value={form.designer} onChange={e => setForm(f=>({...f, designer:e.target.value}))}>{DESIGNERS.map(d=><option key={d} value={d}>{d}</option>)}</Select></FormGroup>
        </FormRow>
        <FormGroup label={`Progress — ${form.progress}%`}>
          <input type="range" min={0} max={100} value={form.progress} onChange={e => setForm(f=>({...f, progress:parseInt(e.target.value)}))} style={{width:'100%', accentColor:'var(--brand-500)'}} />
        </FormGroup>
        <FormRow>
          <FormGroup label="Asset Count"><input type="number" min={0} value={form.assetCount} onChange={e => setForm(f=>({...f, assetCount:parseInt(e.target.value)||0}))} /></FormGroup>
          <FormGroup label="Actor / NPC Count"><input type="number" min={0} value={form.actorCount} onChange={e => setForm(f=>({...f, actorCount:parseInt(e.target.value)||0}))} /></FormGroup>
        </FormRow>
        <FormGroup label="Description"><textarea value={form.description} onChange={e => setForm(f=>({...f, description:e.target.value}))} placeholder="What is this level about? Key gameplay beats, narrative purpose, environmental identity…" rows={3} /></FormGroup>
        <FormGroup label="Notes"><textarea value={form.notes} onChange={e => setForm(f=>({...f, notes:e.target.value}))} placeholder="Current blockers, next steps, team notes…" rows={2} /></FormGroup>
      </Modal>
    </div>
  );
}
