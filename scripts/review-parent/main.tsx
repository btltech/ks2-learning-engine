import React from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import '../../tailwind.css';
import '@fontsource/fredoka/600.css';
import '@fontsource/fredoka/700.css';
import '@fontsource/atkinson-hyperlegible/400.css';
import '@fontsource/atkinson-hyperlegible/700.css';
import '../../components/sunny/sunny.css';
import { UISettingsProvider } from '../../context/UISettingsContext';
import Header from '../../components/Header';
import ParentHome from '../../components/ParentHomeView';
import ParentDashboard from '../../components/ParentDashboard';
import Monitoring from '../../components/ParentMonitoringDashboard';
import Activity from '../../components/ParentActivityLog';
import Struggle from '../../components/StruggleAlert';
import Notifications from '../../components/ProgressNotifications';
import { children, parent } from './fixtures';
const query = new URLSearchParams(location.search), screen = query.get('screen') || 'monitoring';
const noop = () => {};
localStorage.setItem('ks2_ui_mode_manual', 'true');
localStorage.setItem('ks2_ui_settings', JSON.stringify({ mode: 'standard', largerText: query.has('large'), reducedAnimations: query.has('motion'), highContrast: query.get('theme') === 'contrast' }));
const theme = query.get('theme');
if (theme === 'dark' || theme === 'calm') document.documentElement.classList.add('appearance-' + theme);
const content = screen === 'home' ? <ParentHome onOpenParentMonitoring={noop} onOpenAnalytics={noop} onSwitchToChild={noop} />
  : screen === 'dashboard' ? <ParentDashboard onClose={noop} />
  : screen === 'activity' ? <Activity childId={children[0].id} childName={children[0].name} childData={children[0] as any} />
  : screen === 'struggle' ? <Struggle intervention={{ type: 'parent_alert', message: 'Sample Learner could use support with fractions. Take a moment to review this topic together.' }} onDismiss={noop} onAccept={noop} />
  : screen === 'notifications' ? <Notifications notifications={[{ id: 'review-note', type: 'warning', title: 'Review sample', message: 'A synthetic learning progress notification.', timestamp: new Date(), dismissible: true }]} onDismiss={noop} />
  : <Monitoring onLogout={noop} />;
createRoot(document.getElementById('root')!).render(<MemoryRouter initialEntries={['/parent-monitoring' + (query.get('tab') ? '?tab=' + query.get('tab') : '')]}><UISettingsProvider userAge={35}>
  {screen === 'home' && <Header user={parent as any} onHomeClick={noop} onOpenStore={noop} onOpenParentDashboard={noop} onOpenLeaderboard={noop} onOpenProgress={noop} onOpenUISettings={noop} onLogout={noop} />}
  {screen === 'monitoring' ? content : <main className={'review-parent-shell' + (screen === 'notifications' ? ' clear-path-parent' : '')} style={{ maxWidth: 1240, margin: '0 auto', padding: screen === 'home' ? 0 : 24 }}>{screen !== 'home' && <h1 className="sr-only">Synthetic parent review</h1>}{content}</main>}
</UISettingsProvider></MemoryRouter>);
