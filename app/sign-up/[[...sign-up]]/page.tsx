import { SignUp } from "@clerk/nextjs";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export default function Page() {
  return (
    <div className="w-full h-screen flex items-center justify-center relative overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute hidden md:block top-60 -left-64 w-96 h-96 bg-primary/10 dark:bg-primary/15 rounded-full blur-3xl animate-pulse will-change-transform"
      />
      <div
        aria-hidden="true"
        className="absolute hidden md:block top-12 -right-64 w-96 h-96 bg-primary/15 dark:bg-primary/10 rounded-full blur-3xl animate-pulse will-change-transform"
      />
      <div
        aria-hidden="true"
        className="absolute hidden lg:block bottom-20 left-1/4 w-72 h-72 bg-accent/20 rounded-full blur-3xl animate-pulse will-change-transform"
      />
      <div
        aria-hidden="true"
        className="absolute hidden lg:block top-1/3 right-1/4 w-64 h-64 bg-secondary/20 rounded-full blur-3xl animate-pulse will-change-transform"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"
      />
      <div className={inter.className}>
        <SignUp />
      </div>
    </div>
  );
}
