import type { Metadata } from "next";

import DirectoryPageClient from "../../components/DirectoryPageClient";
import directoryFallback from "../../data/directory-providers.json";
import type { DirectoryData } from "../../lib/directory";
import { getDirectoryProviders } from "../../lib/providers";

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

  const providers = useStatic ? fallbackData.providers : result.providers;
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
