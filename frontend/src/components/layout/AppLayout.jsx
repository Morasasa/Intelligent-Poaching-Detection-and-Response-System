import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

/**
 * AppLayout - Main authenticated layout wrapper.
 * Combines collapsible sidebar + topbar + main content area.
 * All authenticated pages should use this as wrapping layout.
 */
export default function AppLayout({ children, title, subtitle, actions }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="flex h-screen bg-forest-950 overflow-hidden">
            {/* Sidebar */}
            <Sidebar
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(v => !v)}
            />

            {/* Main area */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                {/* Top bar */}
                <Topbar title={title} subtitle={subtitle} actions={actions} />

                {/* Scrollable content area */}
                <main className="flex-1 overflow-auto relative">
                    {/* Ambient background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-forest-800/5 via-transparent to-transparent pointer-events-none" />
                    <div className="relative z-10">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
