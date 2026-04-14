interface KpiCardProps {
  label: string
  value: string
  icon: React.ReactNode
  variant?: 'default' | 'primary' | 'success' | 'error'
}

const variants = {
  default: {
    card: 'bg-card border border-border',
    label: 'text-text-muted',
    value: 'text-text-primary',
    icon: 'bg-surface text-text-secondary',
  },
  primary: {
    card: 'bg-primary border border-primary',
    label: 'text-white/70',
    value: 'text-white',
    icon: 'bg-white/10 text-white',
  },
  success: {
    card: 'bg-card border border-border',
    label: 'text-text-muted',
    value: 'text-success',
    icon: 'bg-success/10 text-success',
  },
  error: {
    card: 'bg-card border border-border',
    label: 'text-text-muted',
    value: 'text-error',
    icon: 'bg-error-bg text-error',
  },
}

export default function KpiCard({ label, value, icon, variant = 'default' }: KpiCardProps) {
  const styles = variants[variant]

  return (
    <div className={`${styles.card} rounded-2xl shadow-sm px-4 py-4 flex items-center gap-3`}>
      <div className={`${styles.icon} w-10 h-10 rounded-xl flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className={`text-[11px] font-body font-medium uppercase tracking-wide ${styles.label}`}>
          {label}
        </p>
        <p className={`text-xl font-display font-black mt-0.5 leading-none ${styles.value}`}>
          {value}
        </p>
      </div>
    </div>
  )
}
