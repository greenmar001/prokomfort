import Link from "next/link";

type Crumb = { title: string; href?: string };

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <div className="breadcrumbs">
      {items.map((c, i) => (
        <span key={i}>
          {c.href ? <Link href={c.href}>{c.title}</Link> : <span>{c.title}</span>}
          {i < items.length - 1 ? <span className="sep">/</span> : null}
        </span>
      ))}
    </div>
  );
}
