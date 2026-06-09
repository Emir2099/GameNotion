import React, { useState } from 'react';
import { useTeamStore } from '../../store';
import { useToast } from '../../lib/toast';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal, FormGroup, FormRow, Select } from '../../components/ui/Modal';
import { Plus, Edit3, Trash2, UsersRound, Mail, Globe, Wifi, WifiOff } from 'lucide-react';
import styles from './Team.module.css';

const DEPARTMENTS = ['Direction','Engineering','Art','Audio','Narrative','QA','Production','Other'];
const TIMEZONES = ['IST','PST','EST','GMT','CET','JST','KST','AEST','MST'];
const COLORS = ['#7c3aed','#2563eb','#0891b2','#059669','#d97706','#dc2626','#9333ea','#db2777'];
const SKILLS_SUGGESTIONS = ['C++','Blueprints','GAS','Nanite','Lumen','MetaSounds','Wwise','Houdini PCG','MetaHuman','Niagara','Game Design','Narrative','QA','Cinematics','Animation'];
const EMPTY = { name:'', initial:'', role:'', department:'Engineering', color:'#7c3aed', online:false, email:'', skills:'', startDate:'', timezone:'IST' };

export default function Team() {
  const { members, addMember, updateMember, deleteMember } = useTeamStore();
  const { addToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [form, setForm] = useState({ ...EMPTY });

  const handleSave = () => {
    if (!form.name.trim() || !form.role.trim()) { addToast('Name and role are required.', 'error'); return; }
    const skillsArr = typeof form.skills === 'string' ? form.skills.split(',').map(s => s.trim()).filter(Boolean) : form.skills;
    const init = form.initial || form.name[0]?.toUpperCase() || '?';
    if (editingMember) { updateMember(editingMember.id, { ...form, initial: init, skills: skillsArr }); addToast('Team member updated.', 'success'); }
    else { addMember({ ...form, initial: init, skills: skillsArr }); addToast('Team member added.', 'success'); }
    setShowModal(false); setEditingMember(null); setForm({ ...EMPTY });
  };

  const handleEdit = (m) => { setEditingMember(m); setForm({ ...m, skills: Array.isArray(m.skills) ? m.skills.join(', ') : m.skills }); setShowModal(true); };
  const handleDelete = (id) => { deleteMember(id); addToast('Member removed.', 'warning'); };

  const byDept = DEPARTMENTS.reduce((acc, d) => { acc[d] = members.filter(m => m.department === d); return acc; }, {});

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Team</h1>
          <p className={styles.subtitle}>{members.length} members · {members.filter(m=>m.online).length} online now</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => { setEditingMember(null); setForm({ ...EMPTY }); setShowModal(true); }}>Add Member</Button>
      </div>

      {DEPARTMENTS.filter(d => byDept[d].length > 0).map(dept => (
        <div key={dept} className={styles.deptSection}>
          <div className={styles.deptHeader}>
            <Badge label={dept} variant={dept} size="xs" />
            <span className={styles.deptCount}>{byDept[dept].length}</span>
          </div>
          <div className={styles.membersGrid}>
            {byDept[dept].map(m => (
              <div key={m.id} className={styles.memberCard}>
                <div className={styles.cardTop}>
                  <div className={styles.memberAvatar} style={{ background: m.color }}>
                    {m.initial}
                    <span className={`${styles.onlineDot} ${m.online ? styles.online : styles.offline}`} />
                  </div>
                  <div className={styles.memberInfo}>
                    <div className={styles.memberName}>{m.name}</div>
                    <div className={styles.memberRole}>{m.role}</div>
                  </div>
                  <div className={styles.memberActions}>
                    <button className={styles.actionBtn} onClick={() => handleEdit(m)} title="Edit"><Edit3 size={13} /></button>
                    <button className={styles.actionBtn} onClick={() => handleDelete(m.id)} title="Remove"><Trash2 size={13} /></button>
                  </div>
                </div>
                <div className={styles.memberMeta}>
                  {m.email && <span><Mail size={11} /> {m.email}</span>}
                  {m.timezone && <span><Globe size={11} /> {m.timezone}</span>}
                  <span className={m.online ? styles.onlineStatus : styles.offlineStatus}>
                    {m.online ? <><Wifi size={11} /> Online</> : <><WifiOff size={11} /> Offline</>}
                  </span>
                </div>
                <div className={styles.skillsList}>
                  {(m.skills || []).slice(0, 4).map(s => (
                    <span key={s} className={styles.skillTag}>{s}</span>
                  ))}
                  {(m.skills || []).length > 4 && <span className={styles.skillMore}>+{m.skills.length - 4}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {members.length === 0 && (
        <div className={styles.empty}><UsersRound size={36} strokeWidth={1.5}/><p>No team members yet. Add your crew!</p></div>
      )}

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditingMember(null); }} title={editingMember ? 'Edit Team Member' : 'Add Team Member'} size="md"
        footer={<><Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button><Button variant="primary" onClick={handleSave}>{editingMember ? 'Save' : 'Add Member'}</Button></>}
      >
        <FormRow>
          <FormGroup label="Full Name" required><input value={form.name} onChange={e => setForm(f=>({...f, name:e.target.value}))} placeholder="Full name" autoFocus /></FormGroup>
          <FormGroup label="Avatar Initial" hint="Auto-set from name"><input value={form.initial} onChange={e => setForm(f=>({...f, initial:e.target.value}))} placeholder="C" maxLength={2} /></FormGroup>
        </FormRow>
        <FormGroup label="Role / Title" required><input value={form.role} onChange={e => setForm(f=>({...f, role:e.target.value}))} placeholder="e.g. Lead Programmer" /></FormGroup>
        <FormRow>
          <FormGroup label="Department"><Select value={form.department} onChange={e => setForm(f=>({...f, department:e.target.value}))}>{DEPARTMENTS.map(d=><option key={d} value={d}>{d}</option>)}</Select></FormGroup>
          <FormGroup label="Timezone"><Select value={form.timezone} onChange={e => setForm(f=>({...f, timezone:e.target.value}))}>{TIMEZONES.map(t=><option key={t} value={t}>{t}</option>)}</Select></FormGroup>
        </FormRow>
        <FormGroup label="Avatar Color">
          <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
            {COLORS.map(c => <button key={c} type="button" style={{width:28, height:28, borderRadius:'50%', background:c, border: form.color === c ? '3px solid white' : '2px solid transparent', cursor:'pointer'}} onClick={() => setForm(f=>({...f, color:c}))} />)}
          </div>
        </FormGroup>
        <FormGroup label="Email"><input type="email" value={form.email} onChange={e => setForm(f=>({...f, email:e.target.value}))} placeholder="user@studio.dev" /></FormGroup>
        <FormGroup label="Skills" hint="Comma-separated"><input value={form.skills} onChange={e => setForm(f=>({...f, skills:e.target.value}))} placeholder="C++, GAS, Blueprints…" /></FormGroup>
        <FormRow>
          <FormGroup label="Start Date"><input type="date" value={form.startDate} onChange={e => setForm(f=>({...f, startDate:e.target.value}))} /></FormGroup>
          <FormGroup label="Online Status">
            <div style={{display:'flex', alignItems:'center', gap:10, height:36}}>
              <label style={{display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:'var(--text-sm)', color:'var(--text-secondary)'}}>
                <input type="checkbox" checked={form.online} onChange={e => setForm(f=>({...f, online:e.target.checked}))} style={{width:16,height:16,accentColor:'var(--brand-500)'}} />
                Mark as online
              </label>
            </div>
          </FormGroup>
        </FormRow>
      </Modal>
    </div>
  );
}
