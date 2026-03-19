import { Suspense, lazy } from "react";

const DotLottieReact = lazy(() =>
  import("@lottiefiles/dotlottie-react").then((mod) => ({
    default: mod.DotLottieReact,
  }))
);

interface LottiePlayerProps {
  src: string;
  className?: string;
}

export default function LottiePlayer({ src, className }: LottiePlayerProps) {
  return (
    <Suspense
      fallback={
        <div
          className={`animate-pulse rounded-lg bg-gray-100 ${className ?? "h-[450px] w-[450px]"}`}
        />
      }
    >
      <DotLottieReact src={src} autoplay loop className={className} />
    </Suspense>
  );
}
