import { ExternalLink } from "lucide-react";
import type { DirectoryProvider } from "../lib/directory";
import { preferLocalProviderLogoUrl } from "../lib/local-provider-logos";
import ProviderLogo from "./ProviderLogo";

const categoryColors: Record<string, string> = {
  "Facial Recognition": "bg-violet-500/15 text-violet-300 ring-violet-500/30",
  "LPR/OCR": "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  "Object Recognition": "bg-sky-500/15 text-sky-300 ring-sky-500/30",
  VMS: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  "Edge AI Hardware": "bg-orange-500/15 text-orange-300 ring-orange-500/30",
};

function categoryClass(category: string) {
  return (
    categoryColors[category] ??
    "bg-zinc-700/40 text-zinc-300 ring-zinc-600/50"
  );
}

export default function ProviderCard({ provider }: { provider: DirectoryProvider }) {
  const logoUrl = preferLocalProviderLogoUrl(
    provider.logoUrl,
    provider.name,
    provider.website,
  );

  return (
    <article className="flex h-full flex-col rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-sm transition hover:border-zinc-700 hover:bg-zinc-900">
      <div className="mb-4 flex items-start gap-3">
        <ProviderLogo
          name={provider.name}
          logoUrl={logoUrl}
          website={provider.website}
          size={52}
        />
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold leading-snug text-zinc-50">
            {provider.name}
          </h2>
        </div>
      </div>
      <div className="mb-3 flex flex-wrap gap-2">
        {provider.categories.map((cat) => (
          <span
            key={cat}
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${categoryClass(cat)}`}
          >
            {cat}
          </span>
        ))}
      </div>
      <p className="mb-5 flex-1 text-sm leading-relaxed text-zinc-400">
        {provider.description}
      </p>
      <a
        href={provider.website}
        target="_blank"
        rel="noopener noreferrer"
        data-ivs-entity="provider"
        data-ivs-id={provider.id}
        className="inline-flex w-fit items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
      >
        Visit Site
        <ExternalLink size={16} aria-hidden />
      </a>
    </article>
  );
}
