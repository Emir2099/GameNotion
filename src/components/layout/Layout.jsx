import React, { useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { HelpPanel } from '../ui/HelpPanel';
import { useAppStore } from '../../store';
import { useTaskStore, useBugStore } from '../../store';
import styles from './Layout.module.css';

export function Layout() {
  const helpPage = useAppStore(s => s.helpPanelPage);
  const closeHelp = useAppStore(s => s.closeHelp);

  const tasks = useTaskStore(s => s.tasks);
  const bugs = useBugStore(s => s.bugs);

  const taskStats = useMemo(() => {
    return {
      total: tasks.length,
      done: tasks.filter(t => t.column === 'done').length,
      inprogress: tasks.filter(t => t.column === 'inprogress').length,
      review: tasks.filter(t => t.column === 'review').length,
      backlog: tasks.filter(t => t.column === 'backlog').length,
    };
  }, [tasks]);

  const bugCounts = useMemo(() => {
    return {
      critical: bugs.filter(b => b.severity === 'critical' && b.status !== 'resolved' && b.status !== 'closed').length,
      high: bugs.filter(b => b.severity === 'high' && b.status !== 'resolved' && b.status !== 'closed').length,
      medium: bugs.filter(b => b.severity === 'medium' && b.status !== 'resolved' && b.status !== 'closed').length,
      low: bugs.filter(b => b.severity === 'low' && b.status !== 'resolved' && b.status !== 'closed').length,
      resolved: bugs.filter(b => b.status === 'resolved' || b.status === 'closed').length,
    };
  }, [bugs]);

  return (
    <div className={styles.root}>
      <Sidebar taskStats={taskStats} bugCounts={bugCounts} />
      <div className={styles.main}>
        <Topbar />
        <main className={styles.content} id="main-content">
          <Outlet />
        </main>
      </div>
      {helpPage !== null && <HelpPanel currentPath={helpPage} onClose={closeHelp} />}
    </div>
  );
}
