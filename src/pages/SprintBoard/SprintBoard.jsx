import React, { useState, useCallback } from 'react';
import { DndContext, closestCenter, DragOverlay, useSensor, useSensors, PointerSensor, KeyboardSensor, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTaskStore } from '../../store';
import { useToast } from '../../lib/toast';
import { Badge, PRIORITY_LABELS } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal, FormGroup, FormRow, Select } from '../../components/ui/Modal';
import { Plus, Calendar, GripVertical, Trash2, Edit3, MoreVertical, Clock, Settings } from 'lucide-react';
import styles from './SprintBoard.module.css';

const COLUMNS = [
  { id: 'backlog',    label: 'Backlog',     emoji: '📋', color: '#374151' },
  { id: 'inprogress', label: 'In Progress', emoji: '🔄', color: '#7c3aed' },
  { id: 'review',    label: 'In Review',   emoji: '👁️', color: '#2563eb' },
  { id: 'done',      label: 'Done',        emoji: '✅', color: '#059669' },
];

const CATEGORIES = ['Gameplay', 'Art & Assets', 'Engine / Tech', 'QA / Bugs', 'Narrative', 'Audio', 'UI / UX', 'Other'];
const ASSIGNEES = ['Captain', 'Maya', 'Alex', 'Jake', 'Sam', 'Layla', 'Ryan', 'Nina'];

const EMPTY_TASK = { title: '', description: '', priority: 'medium', category: 'Gameplay', assignee: 'Captain', dueDate: '', tags: '', column: 'backlog' };

// ── Sortable Card ─────────────────────────────────────────────────────────────
function KanbanCard({ task, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.column !== 'done';

  return (
    <div ref={setNodeRef} style={style} className={styles.card} {...attributes}>
      <div className={styles.cardHeader}>
        <span className={styles.dragHandle} {...listeners}>
          <GripVertical size={14} />
        </span>
        <div className={styles.cardActions}>
          <button className={styles.cardActionBtn} onClick={() => onEdit(task)} title="Edit task"><Edit3 size={12} /></button>
          <button className={styles.cardActionBtn} onClick={() => onDelete(task.id)} title="Delete task"><Trash2 size={12} /></button>
        </div>
      </div>
      <p className={styles.cardTitle}>{task.title}</p>
      {task.description && <p className={styles.cardDesc}>{task.description.slice(0, 90)}{task.description.length > 90 ? '…' : ''}</p>}
      <div className={styles.cardMeta}>
        <Badge label={PRIORITY_LABELS[task.priority] || task.priority} variant={task.priority} size="xs" />
        <span className={styles.cardCat}>{task.category}</span>
      </div>
      <div className={styles.cardFooter}>
        {task.dueDate && (
          <span className={`${styles.cardDue} ${isOverdue ? styles.cardDueOverdue : ''}`}>
            <Clock size={10} />
            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
        <div className={styles.cardAssignee} title={task.assignee}>
          {task.assignee?.[0] || '?'}
        </div>
      </div>
    </div>
  );
}

// ── Droppable Column Body ──────────────────────────────────────────────────────
function ColumnBody({ id, children, className }) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={className}>
      {children}
    </div>
  );
}

export default function SprintBoard() {
  const { tasks, addTask, updateTask, deleteTask, moveTask, reorderTasks, sprintName, sprintGoal, sprintStart, sprintEnd, updateSprint } = useTaskStore();
  const { addToast } = useToast();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showSprintModal, setShowSprintModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [formData, setFormData] = useState({ ...EMPTY_TASK });
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  const [sprintForm, setSprintForm] = useState({ sprintName, sprintGoal, sprintStart, sprintEnd });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const filteredTasks = tasks.filter(t => {
    if (filterAssignee !== 'all' && t.assignee !== filterAssignee) return false;
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    return true;
  });

  const getColTasks = (col) => filteredTasks.filter(t => t.column === col);

  const handleDragStart = ({ active }) => setActiveId(active.id);

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null);
    if (!over) return;
    const taskId = active.id;
    
    // Detect if dropped on a column header or background
    const col = COLUMNS.find(c => c.id === over.id);
    if (col) {
      const activeTask = tasks.find(t => t.id === taskId);
      if (activeTask && activeTask.column !== col.id) {
        moveTask(taskId, col.id);
        addToast(`Task moved to ${col.label}`, 'success');
      }
      return;
    }
    
    // Dropped on another card
    const targetTask = tasks.find(t => t.id === over.id);
    if (targetTask) {
      const activeTask = tasks.find(t => t.id === taskId);
      if (activeTask) {
        const targetColLabel = COLUMNS.find(c => c.id === targetTask.column)?.label;
        const columnsChanged = activeTask.column !== targetTask.column;
        
        reorderTasks(taskId, over.id);
        
        if (columnsChanged) {
          addToast(`Task moved to ${targetColLabel}`, 'success');
        }
      }
    }
  };

  const handleSave = () => {
    if (!formData.title.trim()) { addToast('Task title is required.', 'error'); return; }
    if (editingTask) {
      updateTask(editingTask.id, { ...formData, tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean) });
      addToast('Task updated.', 'success');
    } else {
      addTask({ ...formData, tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean) });
      addToast('Task created.', 'success');
    }
    setShowAddModal(false);
    setEditingTask(null);
    setFormData({ ...EMPTY_TASK });
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({ ...task, tags: (task.tags || []).join(', ') });
    setShowAddModal(true);
  };

  const handleDelete = (id) => {
    deleteTask(id);
    addToast('Task deleted.', 'warning');
  };

  const handleSprintSave = () => {
    updateSprint(sprintForm);
    setShowSprintModal(false);
    addToast('Sprint updated.', 'success');
  };

  const activeTask = activeId ? tasks.find(t => t.id === activeId) : null;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerInfo}>
          <h1 className={styles.pageTitle}>{sprintName}</h1>
          <p className={styles.sprintGoal}>{sprintGoal}</p>
          <div className={styles.sprintDates}>
            <Calendar size={12} />
            {sprintStart} → {sprintEnd}
          </div>
        </div>
        <div className={styles.headerActions}>
          <Button variant="ghost" size="md" icon={Settings} onClick={() => setShowSprintModal(true)}>
            Sprint Settings
          </Button>
          <Button variant="primary" size="md" icon={Plus} onClick={() => { setEditingTask(null); setFormData({ ...EMPTY_TASK }); setShowAddModal(true); }}>
            Add Task
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <label className={styles.filterLabel}>Assignee:</label>
        <select value={filterAssignee} onChange={e => setFilterAssignee(e.target.value)} className={styles.filterSelect}>
          <option value="all">All</option>
          {ASSIGNEES.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <label className={styles.filterLabel}>Priority:</label>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className={styles.filterSelect}>
          <option value="all">All</option>
          {['critical','high','medium','low'].map(p => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
        </select>
        {(filterAssignee !== 'all' || filterPriority !== 'all') && (
          <button className={styles.clearFilters} onClick={() => { setFilterAssignee('all'); setFilterPriority('all'); }}>
            Clear filters
          </button>
        )}
      </div>

      {/* Board */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className={styles.board}>
          {COLUMNS.map(col => {
            const colTasks = getColTasks(col.id);
            return (
              <div key={col.id} className={styles.column}>
                <div className={styles.colHeader} id={col.id}>
                  <div className={styles.colLeft}>
                    <span className={styles.colEmoji}>{col.emoji}</span>
                    <span className={styles.colLabel}>{col.label}</span>
                    <span className={styles.colCount} style={{ background: col.color + '22', color: col.color, border: `1px solid ${col.color}44` }}>
                      {colTasks.length}
                    </span>
                  </div>
                  <button className={styles.colAdd} onClick={() => { setFormData({ ...EMPTY_TASK, column: col.id }); setEditingTask(null); setShowAddModal(true); }} title={`Add to ${col.label}`}>
                    <Plus size={14} />
                  </button>
                </div>
                <ColumnBody id={col.id} className={styles.colBody}>
                  <SortableContext items={colTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    {colTasks.map(task => (
                      <KanbanCard key={task.id} task={task} onEdit={handleEdit} onDelete={handleDelete} />
                    ))}
                  </SortableContext>
                  {colTasks.length === 0 && (
                    <div className={styles.colEmpty}>
                      <span>No tasks</span>
                    </div>
                  )}
                </ColumnBody>
              </div>
            );
          })}
        </div>
        <DragOverlay>
          {activeTask && (
            <div className={`${styles.card} ${styles.cardDragging}`}>
              <p className={styles.cardTitle}>{activeTask.title}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Add/Edit Task Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setEditingTask(null); setFormData({ ...EMPTY_TASK }); }}
        title={editingTask ? 'Edit Task' : 'New Task'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setShowAddModal(false); setEditingTask(null); }}>Cancel</Button>
            <Button variant="primary" onClick={handleSave}>{editingTask ? 'Save Changes' : 'Create Task'}</Button>
          </>
        }
      >
        <FormGroup label="Title" required>
          <input value={formData.title} onChange={e => setFormData(f => ({ ...f, title: e.target.value }))} placeholder="What needs to be done?" autoFocus />
        </FormGroup>
        <FormGroup label="Description">
          <textarea value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} placeholder="Provide context, acceptance criteria, or relevant notes…" rows={3} />
        </FormGroup>
        <FormRow>
          <FormGroup label="Priority" required>
            <Select value={formData.priority} onChange={e => setFormData(f => ({ ...f, priority: e.target.value }))}>
              <option value="critical">🔴 Critical</option>
              <option value="high">🟠 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </Select>
          </FormGroup>
          <FormGroup label="Category">
            <Select value={formData.category} onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
          </FormGroup>
        </FormRow>
        <FormRow>
          <FormGroup label="Assignee">
            <Select value={formData.assignee} onChange={e => setFormData(f => ({ ...f, assignee: e.target.value }))}>
              {ASSIGNEES.map(a => <option key={a} value={a}>{a}</option>)}
            </Select>
          </FormGroup>
          <FormGroup label="Due Date">
            <input type="date" value={formData.dueDate} onChange={e => setFormData(f => ({ ...f, dueDate: e.target.value }))} />
          </FormGroup>
        </FormRow>
        <FormRow>
          <FormGroup label="Column">
            <Select value={formData.column} onChange={e => setFormData(f => ({ ...f, column: e.target.value }))}>
              {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </Select>
          </FormGroup>
          <FormGroup label="Tags" hint="Comma-separated — e.g. combat, GAS, animation">
            <input value={formData.tags} onChange={e => setFormData(f => ({ ...f, tags: e.target.value }))} placeholder="combat, GAS, animation…" />
          </FormGroup>
        </FormRow>
      </Modal>

      {/* Sprint Settings Modal */}
      <Modal
        isOpen={showSprintModal}
        onClose={() => setShowSprintModal(false)}
        title="Sprint Settings"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowSprintModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSprintSave}>Save Sprint</Button>
          </>
        }
      >
        <FormGroup label="Sprint Name" required>
          <input value={sprintForm.sprintName} onChange={e => setSprintForm(f => ({ ...f, sprintName: e.target.value }))} placeholder="e.g. Sprint 5" />
        </FormGroup>
        <FormGroup label="Sprint Goal">
          <textarea value={sprintForm.sprintGoal} onChange={e => setSprintForm(f => ({ ...f, sprintGoal: e.target.value }))} placeholder="What is this sprint trying to achieve?" rows={2} />
        </FormGroup>
        <FormRow>
          <FormGroup label="Start Date">
            <input type="date" value={sprintForm.sprintStart} onChange={e => setSprintForm(f => ({ ...f, sprintStart: e.target.value }))} />
          </FormGroup>
          <FormGroup label="End Date">
            <input type="date" value={sprintForm.sprintEnd} onChange={e => setSprintForm(f => ({ ...f, sprintEnd: e.target.value }))} />
          </FormGroup>
        </FormRow>
      </Modal>
    </div>
  );
}
