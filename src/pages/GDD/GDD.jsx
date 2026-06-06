import React, { useEffect, useCallback, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import CharacterCount from '@tiptap/extension-character-count';
import { useGDDStore } from '../../store';
import { Bold, Italic, Strikethrough, Code, Heading1, Heading2, Heading3, List, ListOrdered, Quote, Minus, CheckSquare, Table as TableIcon, Highlighter, Save, Download, Clock } from 'lucide-react';
import styles from './GDD.module.css';

const SECTIONS = [
  { key: 'overview', label: '📖 Overview', icon: '📖' },
  { key: 'pillars', label: '🏛️ Design Pillars', icon: '🏛️' },
  { key: 'mechanics', label: '⚙️ Core Mechanics', icon: '⚙️' },
];

// ── Slash Command Menu ────────────────────────────────────────────────────────
const SLASH_COMMANDS = [
  { label: 'Heading 1', desc: 'Large section heading', icon: 'H1', action: (e) => e.chain().focus().toggleHeading({ level: 1 }).run() },
  { label: 'Heading 2', desc: 'Medium subsection heading', icon: 'H2', action: (e) => e.chain().focus().toggleHeading({ level: 2 }).run() },
  { label: 'Heading 3', desc: 'Small subsection heading', icon: 'H3', action: (e) => e.chain().focus().toggleHeading({ level: 3 }).run() },
  { label: 'Bullet List', desc: 'Unordered list', icon: '•', action: (e) => e.chain().focus().toggleBulletList().run() },
  { label: 'Numbered List', desc: 'Ordered list', icon: '1.', action: (e) => e.chain().focus().toggleOrderedList().run() },
  { label: 'Task List', desc: 'Checklist items', icon: '☑', action: (e) => e.chain().focus().toggleTaskList().run() },
  { label: 'Blockquote', desc: 'Pull quote or callout', icon: '"', action: (e) => e.chain().focus().toggleBlockquote().run() },
  { label: 'Code Block', desc: 'Monospace code', icon: '<>', action: (e) => e.chain().focus().toggleCodeBlock().run() },
  { label: 'Table', desc: 'Insert 3×3 table', icon: '⊞', action: (e) => e.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
  { label: 'Divider', desc: 'Horizontal rule', icon: '—', action: (e) => e.chain().focus().setHorizontalRule().run() },
];

function SlashMenu({ editor, query, pos, onSelect, onClose }) {
  const filtered = SLASH_COMMANDS.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase()) ||
    c.desc.toLowerCase().includes(query.toLowerCase())
  );
  if (!filtered.length) return null;
  return (
    <div className={styles.slashMenu} style={{ top: pos.y + 24, left: pos.x }}>
      <div className={styles.slashMenuLabel}>Block commands</div>
      {filtered.map((cmd, i) => (
        <button key={i} className={styles.slashItem} onClick={() => { cmd.action(editor); onClose(); }}>
          <span className={styles.slashIcon}>{cmd.icon}</span>
          <div>
            <div className={styles.slashLabel}>{cmd.label}</div>
            <div className={styles.slashDesc}>{cmd.desc}</div>
          </div>
        </button>
      ))}
    </div>
  );
}

export default function GDD() {
  const { sections, updateSectionContent, lastSaved } = useGDDStore();
  const [activeSection, setActiveSection] = useState('overview');
  const [saveStatus, setSaveStatus] = useState('saved');
  const [slashPos, setSlashPos] = useState(null);
  const [slashQuery, setSlashQuery] = useState('');
  const [showSlash, setShowSlash] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Start writing… Type "/" for block commands' }),
      Highlight.configure({ multicolor: true }),
      Typography,
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow, TableCell, TableHeader,
      CharacterCount,
    ],
    content: sections[activeSection] || '',
    onUpdate: ({ editor }) => {
      setSaveStatus('unsaved');
      updateSectionContent(activeSection, editor.getHTML());
      setSaveStatus('saved');
    },
    editorProps: {
      handleKeyDown(view, event) {
        if (event.key === '/') {
          const { from } = view.state.selection;
          const coords = view.coordsAtPos(from);
          setSlashPos({ x: coords.left, y: coords.top });
          setSlashQuery('');
          setShowSlash(true);
        }
        if (showSlash) {
          if (event.key === 'Escape') { setShowSlash(false); return false; }
          if (event.key !== 'Backspace') setSlashQuery(q => q + event.key.slice(-1));
          else setSlashQuery(q => q.slice(0, -1));
        }
        return false;
      },
    },
  });

  // Switch sections
  useEffect(() => {
    if (editor) {
      editor.commands.setContent(sections[activeSection] || '');
    }
  }, [activeSection, editor]);

  const exportMarkdown = () => {
    if (!editor) return;
    const html = editor.getHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `GDD_${activeSection}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!editor) return null;

  const charCount = editor.storage.characterCount?.characters() || 0;
  const wordCount = editor.storage.characterCount?.words() || 0;

  return (
    <div className={styles.page}>
      {/* Sidebar TOC */}
      <aside className={styles.toc}>
        <div className={styles.tocTitle}>Contents</div>
        {SECTIONS.map(s => (
          <button
            key={s.key}
            className={`${styles.tocItem} ${activeSection === s.key ? styles.tocItemActive : ''}`}
            onClick={() => setActiveSection(s.key)}
          >
            {s.label}
          </button>
        ))}
        <div className={styles.tocDivider} />
        <button className={styles.tocAddSection} onClick={() => alert('Custom sections coming — add your own GDD chapter here.')}>
          + Add Section
        </button>
      </aside>

      {/* Editor */}
      <div className={styles.editorWrap}>
        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.toolbarGroup}>
            <ToolBtn icon={Bold} title="Bold (⌘B)" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} />
            <ToolBtn icon={Italic} title="Italic (⌘I)" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} />
            <ToolBtn icon={Strikethrough} title="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} />
            <ToolBtn icon={Code} title="Inline code" active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()} />
            <ToolBtn icon={Highlighter} title="Highlight" active={editor.isActive('highlight')} onClick={() => editor.chain().focus().toggleHighlight().run()} />
          </div>
          <div className={styles.toolbarSep} />
          <div className={styles.toolbarGroup}>
            <ToolBtn icon={Heading1} title="Heading 1" active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} />
            <ToolBtn icon={Heading2} title="Heading 2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
            <ToolBtn icon={Heading3} title="Heading 3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />
          </div>
          <div className={styles.toolbarSep} />
          <div className={styles.toolbarGroup}>
            <ToolBtn icon={List} title="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} />
            <ToolBtn icon={ListOrdered} title="Numbered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
            <ToolBtn icon={CheckSquare} title="Task list" active={editor.isActive('taskList')} onClick={() => editor.chain().focus().toggleTaskList().run()} />
            <ToolBtn icon={Quote} title="Blockquote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} />
            <ToolBtn icon={Minus} title="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()} />
            <ToolBtn icon={TableIcon} title="Table" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} />
          </div>
          <div className={styles.toolbarRight}>
            <span className={styles.saveStatus}>
              {saveStatus === 'saved' ? <><Clock size={11} /> Saved</> : <><Clock size={11} /> Saving…</>}
            </span>
            <button className={styles.exportBtn} onClick={exportMarkdown} title="Export as HTML">
              <Download size={13} /> Export
            </button>
          </div>
        </div>

        {/* Editor content */}
        <div className={styles.editorContent}>
          <EditorContent editor={editor} className={styles.editor} />
        </div>

        {/* Status bar */}
        <div className={styles.statusBar}>
          <span>{wordCount} words · {charCount} characters</span>
          {lastSaved && <span>Last saved: {new Date(lastSaved).toLocaleTimeString()}</span>}
        </div>
      </div>

      {/* Slash command menu */}
      {showSlash && slashPos && (
        <SlashMenu
          editor={editor}
          query={slashQuery}
          pos={slashPos}
          onClose={() => setShowSlash(false)}
        />
      )}
    </div>
  );
}

function ToolBtn({ icon: Icon, title, active, onClick }) {
  return (
    <button
      className={`${styles.toolBtn} ${active ? styles.toolBtnActive : ''}`}
      onClick={onClick}
      title={title}
      type="button"
    >
      <Icon size={14} strokeWidth={2} />
    </button>
  );
}
