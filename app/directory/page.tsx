import type { Metadata } from "next";

import DirectoryPageClient from "../../components/DirectoryPageClient";
import directoryFallback from "../../data/directory-providers.json";
import type { DirectoryData, DirectoryProvider } from "../../lib/directory";
import { preferLocalProviderLogoUrl } from "../../lib/local-provider-logos";
import { getDirectoryProviders } from "../../lib/providers";

function enrichProviderLogo(provider: DirectoryProvider): DirectoryProvider {
  return {
    ...provider,
    logoUrl: preferLocalProviderLogoUrl(
      provider.logoUrl,
      provider.name,
      provider.website,
    ),
  };
}

export const metadata: Metadata = {
  title: "Provider Directory | IVS News",
  description:
    "Browse video analytics, VMS, facial recognition, LPR, and edge AI providers in the intelligent video surveillance ecosystem.",
};

export const revalidate = 3600;

const fallbackData = directoryFallback as DirectoryData;

export default async function DirectoryPage() {
  const result = await getDirectoryProviders();

  const useStatic =
    result.source === "static" || result.providers.length === 0;

  const providers = (useStatic ? fallbackData.providers : result.providers).map(
    enrichProviderLogo,
  );
  const updatedAt = useStatic ? fallbackData.updatedAt : result.updatedAt;
  const loadError =
    useStatic && result.loadError
      ? `Showing cached directory (${providers.length} providers). ${result.loadError}`
      : null;

  return (
    <DirectoryPageClient
      providers={providers}
      updatedAt={updatedAt}
      loadError={loadError}
      dataSource={useStatic ? "static" : "supabase"}
    />
  );
}
