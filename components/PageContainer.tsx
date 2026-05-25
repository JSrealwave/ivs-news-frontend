import type { ReactNode } from "react";

type PageContainerProps = {
  children: ReactNode;
  className?: string;
};

/** Shared horizontal layout shell — edge-to-edge with modest horizontal padding only. */
export function SiteContainer({ children, className = "" }: PageContainerProps) {
  return (
    <div
      className={`w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 ${className}`}
    >
      {children}
    </div>
  );
}

/** Page content wrapper with standard vertical spacing. */
export function PageContainer({ children, className = "" }: PageContainerProps) {
  return (
    <SiteContainer className={`py-8 sm:py-10 lg:py-12 ${className}`}>
      {children}
    </SiteContainer>
  );
}
