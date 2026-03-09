type SectionHeaderProps = {
  badge: string;
  title: string;
  description: string;
};

export function SectionHeader(props: SectionHeaderProps) {
  return (
    <div className="space-y-3">
      <span className="badge badge-primary badge-outline">{props.badge}</span>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">{props.title}</h2>
        <p className="max-w-3xl text-sm leading-6 text-base-content/70">
          {props.description}
        </p>
      </div>
    </div>
  );
}
