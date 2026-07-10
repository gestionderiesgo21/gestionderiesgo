import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Logo institucional PUCE en una placa blanca (el archivo tiene fondo blanco y
 * las franjas de la app son azul marino). El asset vive en `public/puce.png`.
 */
export function PuceLogo({
  className,
  size = 40,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <span className={cn("inline-flex items-center rounded-md bg-white p-1.5", className)}>
      <Image
        src="/puce.png"
        alt="PUCE"
        width={size}
        height={size}
        className="object-contain"
        priority
      />
    </span>
  );
}
