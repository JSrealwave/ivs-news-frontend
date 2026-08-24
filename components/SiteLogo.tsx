import Image from "next/image";
import Link from "next/link";

export default function SiteLogo({
  compact = false,
}: {
  compact?: boolean;
}) {
  const markH = compact ? 22 : 32;
  const markW = Math.round(markH * (1032 / 658));
  const wordH = compact ? 20 : 28;
  const wordW = Math.round(wordH * (320 / 63));

  return (
    <Link
      href="/"
      className="flex shrink-0 items-center gap-2.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
    >
      <Image
        src="/logo/raven-white-header.png"
        alt=""
        width={markW}
        height={markH}
        className={compact ? "h-[22px] w-auto" : "h-8 w-auto"}
        priority={!compact}
      />
      <Image
        src="/logo/ivs-news-dark-header.png"
        alt="IVS News"
        width={wordW}
        height={wordH}
        className={compact ? "h-5 w-auto" : "h-7 w-auto"}
        priority={!compact}
      />
    </Link>
  );
}
