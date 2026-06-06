import React, { useState, useMemo } from 'react';
import { useCharacterStore } from '../../store';
import { useToast } from '../../lib/toast';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal, FormGroup, FormRow } from '../../components/ui/Modal';
import { Plus, Search, Edit3, Trash2, Users, Image } from 'lucide-react';
import styles from './Characters.module.css';

const ROLES = ['Protagonist','Companion','Main Antagonist','Faction Leader','NPC','Minor Character'];
const ARCHETYPES = ['Enforcer / Hacker','Oracle / Mentor','Authoritarian / Idealist','Shadow Operative','Sage','Rogue','Healer','Scout','Other'];
const FACTIONS = ['Neutral','Iron Veil','The Architects','Revivalists','Free Collective','NEXUS Council'];
const STATUSES = ['Concept','Blocked','In Progress','Review','Final'];
const COLORS = ['#7c3aed','#2563eb','#dc2626','#059669','#0891b2','#d97706','#9333ea','#db2777'];

const PRELOADED_AVATARS = [
  { name: 'Kael Voss', path: '/avatars/kael.png' },
  { name: 'Sil', path: '/avatars/sil.png' },
  { name: 'ARIA', path: '/avatars/aria.png' },
  { name: 'Vex', path: '/avatars/vex.png' },
];

const EMPTY = { name:'', role:'NPC', archetype:'Other', status:'Concept', description:'', personality:'', abilities:'', voiceActor:'TBD', model:'TBD', factionAffinity:'Neutral', avatar:'/avatars/kael.png', color:'#7c3aed' };

export default function Characters() {
  const { characters, addCharacter, updateCharacter, deleteCharacter } = useCharacterStore();
  const { addToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editingChar, setEditingChar] = useState(null);
  const [viewingChar, setViewingChar] = useState(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => characters.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.role.toLowerCase().includes(search.toLowerCase())
  ), [characters, search]);

  const handleSave = () => {
    if (!form.name.trim()) { addToast('Character name is required.', 'error'); return; }
    const abilitiesArr = typeof form.abilities === 'string' ? form.abilities.split(',').map(a => a.trim()).filter(Boolean) : form.abilities;
    if (editingChar) { updateCharacter(editingChar.id, { ...form, abilities: abilitiesArr }); addToast('Character updated.', 'success'); }
    else { addCharacter({ ...form, abilities: abilitiesArr }); addToast('Character created.', 'success'); }
    setShowModal(false); setEditingChar(null); setForm({ ...EMPTY });
  };

  const handleEdit = (c) => { setEditingChar(c); setForm({ ...c, abilities: Array.isArray(c.abilities) ? c.abilities.join(', ') : c.abilities }); setShowModal(true); };
  const handleDelete = (id) => { deleteCharacter(id); setViewingChar(null); addToast('Character deleted.', 'warning'); };

  const viewing = viewingChar ? characters.find(c => c.id === viewingChar) : null;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Characters</h1>
          <p className={styles.subtitle}>{characters.length} characters — protagonist, companions, antagonists, NPCs</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => { setEditingChar(null); setForm({ ...EMPTY }); setShowModal(true); }}>Add Character</Button>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={13} className={styles.searchIcon} />
          <input className={styles.searchInput} placeholder="Search characters…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className={styles.grid}>
        {filtered.map(c => (
          <div key={c.id} className={`${styles.card} glass-card`} onClick={() => setViewingChar(c.id)} tabIndex={0} role="button">
            <div className={styles.cardTop}>
              {c.avatar || c.emoji ? (
                <img src={c.avatar || `/avatars/kael.png`} alt={c.name} className={styles.cardAvatarImg} />
              ) : (
                <div className={styles.avatarPlaceholder}><Users size={24} /></div>
              )}
              <div className={styles.cardOverlay} style={{ background: `linear-gradient(to top, rgba(10,10,20,0.95) 0%, transparent 80%)` }} />
              <span className={styles.cardRole} style={{ '--char-color': c.color }}>{c.role}</span>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.cardName}>{c.name}</div>
              <div className={styles.cardArchetype}>{c.archetype}</div>
              <p className={styles.cardDesc}>{c.description?.slice(0, 80)}{c.description?.length > 80 ? '…' : ''}</p>
              <div className={styles.cardMeta}>
                <Badge label={c.status} variant={c.status === 'Final' ? 'integrated' : c.status === 'In Progress' ? 'in-progress' : 'planned'} size="xs" />
                <span className={styles.cardFaction} style={{ color: c.color }}>{c.factionAffinity}</span>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className={styles.empty}><Users size={32} strokeWidth={1.5}/><p>No characters yet. Create your first!</p></div>
        )}
      </div>

      {/* View Detail Modal */}
      <Modal isOpen={!!viewing} onClose={() => setViewingChar(null)} title={viewing?.name || ''} size="lg"
        footer={<>
          <Button variant="danger" size="sm" icon={Trash2} onClick={() => handleDelete(viewing.id)}>Delete</Button>
          <div style={{ flex: 1 }} />
          <Button variant="ghost" onClick={() => setViewingChar(null)}>Close</Button>
          <Button variant="primary" icon={Edit3} onClick={() => { setViewingChar(null); handleEdit(viewing); }}>Edit</Button>
        </>}
      >
        {viewing && (
          <div>
            <div className={styles.detailHeader}>
              <img src={viewing.avatar || `/avatars/kael.png`} alt={viewing.name} className={styles.detailAvatarImg} style={{ borderColor: viewing.color }} />
              <div className={styles.detailMetaInfo}>
                <div className={styles.detailRole} style={{ color: viewing.color }}>{viewing.role} · {viewing.archetype}</div>
                <div className={styles.detailFaction}>{viewing.factionAffinity} faction · {viewing.status}</div>
              </div>
            </div>
            {viewing.description && <><strong className={styles.detailSec}>Description</strong><p className={styles.detailText}>{viewing.description}</p></>}
            {viewing.personality && <><strong className={styles.detailSec}>Personality</strong><p className={styles.detailText}>{viewing.personality}</p></>}
            {viewing.abilities?.length > 0 && (
              <><strong className={styles.detailSec}>Abilities</strong>
              <div className={styles.abilitiesList}>{(Array.isArray(viewing.abilities) ? viewing.abilities : viewing.abilities?.split(',')).map(a => <span key={a} className={styles.abilityTag}>{a.trim()}</span>)}</div></>
            )}
            <div className={styles.detailMeta}>
              <span><strong>Voice:</strong> {viewing.voiceActor}</span>
              <span><strong>Model:</strong> {viewing.model}</span>
            </div>
          </div>
        )}
      </Modal>

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditingChar(null); }} title={editingChar ? 'Edit Character' : 'New Character'} size="lg"
        footer={<><Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button><Button variant="primary" onClick={handleSave}>{editingChar ? 'Save' : 'Create'}</Button></>}
      >
        <FormRow>
          <FormGroup label="Name" required><input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="Character name" autoFocus /></FormGroup>
          <FormGroup label="Role"><select value={form.role} onChange={e => setForm(f => ({...f, role: e.target.value}))}>{ROLES.map(r => <option key={r} value={r}>{r}</option>)}</select></FormGroup>
        </FormRow>
        <FormRow>
          <FormGroup label="Archetype"><select value={form.archetype} onChange={e => setForm(f => ({...f, archetype: e.target.value}))}>{ARCHETYPES.map(a => <option key={a} value={a}>{a}</option>)}</select></FormGroup>
          <FormGroup label="Status"><select value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))}>{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select></FormGroup>
        </FormRow>
        <FormRow>
          <FormGroup label="Faction Affinity"><select value={form.factionAffinity} onChange={e => setForm(f => ({...f, factionAffinity: e.target.value}))}>{FACTIONS.map(fa => <option key={fa} value={fa}>{fa}</option>)}</select></FormGroup>
          <FormGroup label="Accent Color">
            <div style={{display:'flex', gap:6, flexWrap:'wrap', marginTop: 8}}>
              {COLORS.map(c => <button key={c} type="button" style={{width:22, height:22, borderRadius:'50%', background:c, border: form.color === c ? '2.5px solid white' : '2.5px solid transparent', cursor:'pointer'}} onClick={() => setForm(f => ({...f, color: c}))} />)}
            </div>
          </FormGroup>
        </FormRow>

        <FormGroup label="Avatar Portrait">
          <div className={styles.avatarPickerGrid}>
            {PRELOADED_AVATARS.map(av => (
              <button
                key={av.path}
                type="button"
                className={`${styles.avatarPickerOption} ${form.avatar === av.path ? styles.avatarPickerOptionActive : ''}`}
                onClick={() => setForm(f => ({ ...f, avatar: av.path }))}
              >
                <img src={av.path} alt={av.name} className={styles.avatarPickerImg} />
                <span className={styles.avatarPickerName}>{av.name}</span>
              </button>
            ))}
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label className={styles.fieldLabel} style={{ fontSize: 11, marginBottom: 4 }}>Custom Avatar Image URL</label>
              <input
                className={styles.input}
                value={form.avatar || ''}
                onChange={e => setForm(f => ({ ...f, avatar: e.target.value }))}
                placeholder="https://example.com/custom_avatar.jpg or base64 data..."
              />
            </div>
            <div style={{ flexShrink: 0 }}>
              <Button
                type="button"
                variant="ghost"
                icon={Image}
                onClick={() => document.getElementById('char-avatar-file').click()}
              >
                Upload File
              </Button>
              <input
                id="char-avatar-file"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setForm(f => ({ ...f, avatar: reader.result }));
                      addToast('Image uploaded successfully', 'success');
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>
          </div>
        </FormGroup>

        <FormGroup label="Description"><textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} placeholder="Who is this character? Background, motivation, role in the story…" rows={3} /></FormGroup>
        <FormGroup label="Personality"><textarea value={form.personality} onChange={e => setForm(f => ({...f, personality: e.target.value}))} placeholder="How do they think, speak, behave?" rows={2} /></FormGroup>
        <FormRow>
          <FormGroup label="Abilities" hint="Comma-separated"><input value={form.abilities} onChange={e => setForm(f => ({...f, abilities: e.target.value}))} placeholder="Neural Hack, Blink Dash…" /></FormGroup>
          <FormGroup label="Voice Actor"><input value={form.voiceActor} onChange={e => setForm(f => ({...f, voiceActor: e.target.value}))} placeholder="TBD" /></FormGroup>
        </FormRow>
      </Modal>
    </div>
  );
}
