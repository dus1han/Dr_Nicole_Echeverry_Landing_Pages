import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { site } from '@/content/site';
import { AuroraBackground } from '@/components/effects/AuroraBackground';

/**
 * Root index.
 *
 * A lightweight directory of the campaign landing pages — replaceable with a
 * real homepage later without touching any campaign page.
 */
export default function Home() {
  return (
    <main className="grain relative flex min-h-screen items-center overflow-hidden bg-blush-50">
      <AuroraBackground />

      <div className="container-page relative z-10 py-24">
        <Image
          src="/logo/logo-plum.png"
          alt={site.doctor.name}
          width={800}
          height={450}
          priority
          className="h-28 w-auto"
        />

        <h1 className="mt-10 max-w-3xl font-display text-[clamp(2.25rem,5vw,3.75rem)] font-bold leading-[1.05] tracking-[-0.02em] text-plum-800">
          {site.doctor.credentials} in {site.clinic.city}
        </h1>

        <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
          Explore the treatments below to learn more and book a private consultation.
        </p>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:max-w-3xl">
          {site.landingPages
            .filter((page) => page.live)
            .map((page) => (
              <li key={page.slug}>
                <Link
                  href={`/${page.slug}`}
                  className="group flex items-center justify-between gap-4 rounded-[var(--radius-md)] border border-blush-200 bg-white/80 px-6 py-5 shadow-[var(--shadow-sm)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card)]"
                >
                  <span className="font-display text-xl font-semibold text-plum-800">
                    {page.title}
                  </span>
                  <ArrowRight
                    className="h-5 w-5 shrink-0 text-rose-500 transition-transform duration-300 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
        </ul>
      </div>
    </main>
  );
}
