import type { Metadata } from "next";
import Link from "next/link";

import { PageContainer } from "../../components/PageContainer";
import {
  CONTACT_EMAIL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SUBSCRIBE_URL,
} from "../../lib/site";

export const metadata: Metadata = {
  title: "About",
  description: SITE_DESCRIPTION,
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      <PageContainer className="pb-16">
        <article className="max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            About {SITE_NAME}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-zinc-300">
            A free weekday brief on AI and edge video — for integrators, MSPs,
            consultants, and technical buyers who specify and deploy intelligent
            video surveillance.
          </p>

          <section className="mt-10 space-y-4 text-base leading-relaxed text-zinc-300">
            <h2 className="text-xl font-semibold tracking-tight text-white">
              How items are selected
            </h2>
            <p>
              Each brief is a short, source-linked digest of what changed:
              products, deployments, silicon, regulation, and research that
              affect edge AI video. We summarize public material and link the
              source. We do not run a test lab, publish rankings, or sell
              featured listings.
            </p>
          </section>

          <section className="mt-10 space-y-4 text-base leading-relaxed text-zinc-300">
            <h2 className="text-xl font-semibold tracking-tight text-white">
              Disclosure
            </h2>
            <p>
              The editor works in intelligent video surveillance, including
              Realwave (an ePlus company). That is stated here so you can judge
              independence. Coverage is not a paid review and is not affiliated
              with the vendors we mention unless a source says so.
            </p>
          </section>

          <section className="mt-10 space-y-4 text-base leading-relaxed text-zinc-300">
            <h2 className="text-xl font-semibold tracking-tight text-white">
              Contact
            </h2>
            <p>
              Email{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-zinc-100 underline decoration-zinc-600 underline-offset-4 hover:decoration-zinc-300"
              >
                {CONTACT_EMAIL}
              </a>
              . Suggest a provider or a source the same way.
            </p>
            <p className="flex flex-wrap gap-3 pt-2">
              <a
                href={SUBSCRIBE_URL}
                className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
              >
                Get the weekday brief
              </a>
              <Link
                href="/briefs"
                className="inline-flex items-center rounded-full border border-zinc-600 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
              >
                Browse briefs
              </Link>
            </p>
          </section>
        </article>
      </PageContainer>
    </div>
  );
}
