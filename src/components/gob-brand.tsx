import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Lockup institucional "Gobierno del Ecuador" (escudo + wordmark), al estilo de los
 * portales oficiales (presidencia.gob.ec).
 *
 * El escudo vive en `public/escudo.svg` — reemplaza ese archivo por el escudo oficial.
 */
export function GobEcuador({
  className,
  invert = true,
}: {
  className?: string;
  invert?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Image src="/escudo.svg" alt="Escudo del Ecuador" width={26} height={30} priority />
      <div
        className={cn(
          "text-[13px] font-bold uppercase leading-[1.05] tracking-tight",
          invert ? "text-white" : "text-foreground"
        )}
      >
        Gobierno<br />del Ecuador
      </div>
    </div>
  );
}
