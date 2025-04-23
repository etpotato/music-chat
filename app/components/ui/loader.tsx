import { cn } from "~/lib/utils";

export function Loader({
  className,
  size = "sm",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <svg
      className={cn(
        "block",
        {
          ["w-8 h-8"]: size === "sm",
          ["w-16 h-16"]: size === "md",
          ["w-32 h-32"]: size === "lg",
        },
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
    >
      <circle
        fill="none"
        strokeOpacity="1"
        stroke="#000000"
        strokeWidth=".5"
        cx="100"
        cy="100"
        r="0"
      >
        <animate
          attributeName="r"
          calcMode="spline"
          dur="1"
          values="1;80"
          keyTimes="0;1"
          keySplines="0 .2 .5 1"
          repeatCount="indefinite"
        ></animate>
        <animate
          attributeName="stroke-width"
          calcMode="spline"
          dur="1"
          values="0;25"
          keyTimes="0;1"
          keySplines="0 .2 .5 1"
          repeatCount="indefinite"
        ></animate>
        <animate
          attributeName="stroke-opacity"
          calcMode="spline"
          dur="1"
          values="1;0"
          keyTimes="0;1"
          keySplines="0 .2 .5 1"
          repeatCount="indefinite"
        ></animate>
      </circle>
    </svg>
  );
}
