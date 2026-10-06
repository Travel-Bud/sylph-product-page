import {
  Banknote,
  BarChart3,
  Bell,
  Building2,
  Calendar,
  ChevronDown,
  FileSpreadsheet,
  FileText,
  Flag,
  LayoutDashboard,
  PanelLeftClose,
  Search,
  Settings,
  Shield,
  SlidersHorizontal,
  Users,
  XCircle,
} from "lucide-react";
import { Bird } from "../bird";

/* The admin shell as application-v2 draws it today (components/custom/navigation): sentence-case groups with
   Insights, Notifications and Approval policy, no breadcrumbs, the org chip and the bell on the right.
   Fictional workspace and person. */
const NAV = [
  {
    sec: "Overview",
    items: [
      { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
      { id: "analytics", label: "Analytics", Icon: BarChart3 },
      { id: "insights", label: "Insights", Icon: Flag },
      { id: "notifications", label: "Notifications", Icon: Bell, badge: { n: "3", tone: "ink" } },
    ],
  },
  {
    sec: "Workflow",
    items: [
      { id: "finance", label: "Finance", Icon: Banknote },
      { id: "reports", label: "Expense reports", Icon: FileText, badge: { n: "2", tone: "amber" } },
      { id: "trips", label: "Trip requests", Icon: Calendar },
      { id: "changes", label: "Change requests", Icon: XCircle },
    ],
  },
  {
    sec: "Configuration",
    items: [
      { id: "policies", label: "Policies", Icon: Shield },
      { id: "approval", label: "Approval policy", Icon: SlidersHorizontal },
      { id: "org", label: "Organization", Icon: Building2 },
      { id: "profiles", label: "Profiles", Icon: Users },
      { id: "templates", label: "Templates", Icon: FileSpreadsheet },
      { id: "setup", label: "Setup", Icon: Settings },
    ],
  },
] as const;

export function Shell({ active, children }: { active: string; children: React.ReactNode }) {
  return (
    <div className="ap-window">
      <aside className="ap-side">
        <div className="ap-logo">
          <Bird />
          Sylph
        </div>
        <div className="ap-search">
          <Search strokeWidth={1.75} />
          Search or jump to...
          <kbd>&#8984;K</kbd>
        </div>
        {NAV.map((g) => (
          <div key={g.sec}>
            <div className="ap-sec">{g.sec}</div>
            {g.items.map((it) => (
              <div key={it.id} className={`ap-item${it.id === active ? " is-on" : ""}`}>
                <it.Icon strokeWidth={1.75} />
                {it.label}
                {"badge" in it && <span className={`ap-badge${it.badge.tone === "ink" ? " ap-badge--ink" : ""}`}>{it.badge.n}</span>}
              </div>
            ))}
          </div>
        ))}
        <div className="ap-foot">
          <div className="ap-collapse">
            <PanelLeftClose strokeWidth={1.75} />
            Collapse
          </div>
          <div className="ap-user">
            <b>DR</b>
            <span>
              Dana Reyes
              <small>Admin &middot; Fieldstone</small>
            </span>
            <ChevronDown strokeWidth={1.75} />
          </div>
        </div>
      </aside>
      <div className="ap-main">
        <div className="ap-top">
          <span className="ap-ws">
            <Building2 strokeWidth={1.75} />
            Fieldstone
          </span>
          <span className="ap-bell">
            <Bell strokeWidth={1.75} />
            <b>3</b>
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}
