import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Logo institucional PUCE (versión horizontal). El PNG es transparente, así que:
 * - sobre fondo claro (navbars blancas) usar `plate={false}` — se ve directo;
 * - sobre fondo azul marino usar la placa blanca (por defecto) para que resalte.
 * Se dimensiona por ALTURA (el ancho se ajusta solo). Asset: `public/puce.png`.
 */
export function PuceLogo({
  className,
  height = 36,
  plate = true,
}: {
  className?: string;
  height?: number;
  plate?: boolean;
}) {
  const img = (
    <Image
      src="/puce.png"
      alt="PUCE"
      width={500}
      height={180}
      className="w-auto object-contain"
      style={{ height }}
      priority
    />
  );

  if (!plate) {
    return <span className={cn("inline-flex items-center", className)}>{img}</span>;
  }

  return (
    <span className={cn("inline-flex items-center rounded-md bg-white px-4 py-2", className)}>
      {img}
    </span>
  );
}
