import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Logo institucional PUCE (versión horizontal) en una placa blanca: el archivo
 * tiene fondo blanco y las franjas de la app son azul marino. Se dimensiona por
 * ALTURA (el ancho se ajusta solo). El asset vive en `public/puce.png`.
 */
export function PuceLogo({
  className,
  height = 36,
}: {
  className?: string;
  height?: number;
}) {
  return (
    <span className={cn("inline-flex items-center rounded-md bg-white px-4 py-2", className)}>
      <Image
        src="/puce.png"
        alt="PUCE"
        width={500}
        height={180}
        className="w-auto object-contain"
        style={{ height }}
        priority
      />
    </span>
  );
}
