import React, { useState } from 'react';
import { useTechStore } from '../../store';
import { Modal, FormGroup, FormRow, Select } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../lib/toast';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import styles from './TechStack.module.css';

const STATUS_COLORS = {
  Active:      { bg: 'rgba(5,150,105,0.12)',  color: '#34d399', border: 'rgba(5,150,105,0.25)' },
  'In Progress': { bg: 'rgba(37,99,235,0.12)',  color: '#60a5fa', border: 'rgba(37,99,235,0.25)' },
  Planned:     { bg: 'rgba(124,58,237,0.10)', color: '#a78bfa', border: 'rgba(124,58,237,0.25)' },
  Evaluating:  { bg: 'rgba(217,119,6,0.12)',  color: '#fbbf24', border: 'rgba(217,119,6,0.25)' },
};

const EMPTY_ITEM = { name: '', desc: '', version: '', status: 'Planned', category: '' };

export default function TechStack() {
  const categories = useTechStore((s) => s.categories);
  const addTechItem = useTechStore((s) => s.addTechItem);
  const updateTechItem = useTechStore((s) => s.updateTechItem);
  const deleteTechItem = useTechStore((s) => s.deleteTechItem);
  const { addToast } = useToast();

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [originalCategory, setOriginalCategory] = useState('');
  const [form, setForm] = useState({ ...EMPTY_ITEM });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setOriginalCategory('');
    setForm({ ...EMPTY_ITEM, category: categories[0]?.category || '' });
    setShowModal(true);
  };

  const handleOpenEdit = (catLabel, item) => {
    setEditingItem(item);
    setOriginalCategory(catLabel);
    setForm({
      name: item.name,
      desc: item.desc || '',
      version: item.version || '',
      status: item.status || 'Planned',
      category: catLabel,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      addToast('Tech item name is required.', 'error');
      return;
    }
    if (!form.category) {
      addToast('Category is required.', 'error');
      return;
    }

    const itemData = {
      name: form.name.trim(),
      desc: form.desc.trim(),
      version: form.version.trim(),
      status: form.status,
    };

    if (editingItem) {
      if (form.category === originalCategory) {
        updateTechItem(originalCategory, editingItem.id, itemData);
      } else {
        deleteTechItem(originalCategory, editingItem.id);
        addTechItem(form.category, itemData);
      }
      addToast('Tech item updated.', 'success');
    } else {
      addTechItem(form.category, itemData);
      addToast('Tech item added.', 'success');
    }

    setShowModal(false);
    setEditingItem(null);
    setOriginalCategory('');
    setForm({ ...EMPTY_ITEM });
  };

  const handleDelete = (catLabel, itemId) => {
    deleteTechItem(catLabel, itemId);
    addToast('Tech item deleted.', 'warning');
  };

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <img src="/unreal_banner.png" alt="Unreal Tech Banner" className={styles.heroBg} />
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <div className={styles.heroHeader}>
            <div>
              <h1 className={styles.title}>Tech Stack</h1>
              <p className={styles.subtitle}>Unreal Engine 5.4 feature set and plugin integration status</p>
            </div>
            <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
              Add Tech Item
            </Button>
          </div>
        </div>
      </div>
      <div className={styles.grid}>
        {categories.map((cat) => (
          <div key={cat.category} className={styles.catCard}>
            <div className={styles.catHeader} style={{ borderColor: cat.color }}>
              <span className={styles.catLabel}>{cat.category}</span>
              <span className={styles.catCount}>{cat.items.length}</span>
            </div>
            <div className={styles.items}>
              {cat.items.map((item) => {
                const sc = STATUS_COLORS[item.status] || STATUS_COLORS.Planned;
                return (
                  <div key={item.id} className={styles.item}>
                    <div className={styles.itemTop}>
                      <span className={styles.itemName}>{item.name}</span>
                      <span className={styles.itemStatus} style={{ background: sc.bg, color: sc.color, borderColor: sc.border }}>
                        {item.status}
                      </span>
                    </div>
                    <p className={styles.itemDesc}>{item.desc}</p>
                    <div className={styles.itemBottom}>
                      <span className={styles.itemVer}>{item.version || '—'}</span>
                      <div className={styles.cardActions}>
                        <button className={styles.actionBtn} onClick={() => handleOpenEdit(cat.category, item)} title="Edit Item">
                          <Edit3 size={11} />
                        </button>
                        <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => handleDelete(cat.category, item.id)} title="Delete Item">
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingItem(null); }}
        title={editingItem ? 'Edit Tech Item' : 'Add Tech Item'}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave}>{editingItem ? 'Save' : 'Add Item'}</Button>
          </>
        }
      >
        <FormGroup label="Item Name" required>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Nanite, Substrate Materials, GAS"
            autoFocus
          />
        </FormGroup>

        <FormRow>
          <FormGroup label="Category" required>
            <Select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            >
              {categories.map((cat) => (
                <option key={cat.category} value={cat.category}>
                  {cat.category}
                </option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup label="Status" required>
            <Select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            >
              <option value="Active">Active</option>
              <option value="In Progress">In Progress</option>
              <option value="Planned">Planned</option>
              <option value="Evaluating">Evaluating</option>
            </Select>
          </FormGroup>
        </FormRow>

        <FormGroup label="Version">
          <input
            value={form.version}
            onChange={(e) => setForm((f) => ({ ...f, version: e.target.value }))}
            placeholder="e.g. 5.4, UE5.4, or —"
          />
        </FormGroup>

        <FormGroup label="Description">
          <textarea
            value={form.desc}
            onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
            placeholder="Briefly describe what this technology is used for..."
            rows={3}
          />
        </FormGroup>
      </Modal>
    </div>
  );
}
