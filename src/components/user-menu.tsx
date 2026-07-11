import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function iniciales(nombre: string) {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

/** Muestra el usuario actual (nombre, rol y avatar). El cierre de sesión vive en
 *  el botón "Salir" del header. */
export function UserMenu({ nombre, rolLabel }: { nombre: string; rolLabel: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <p className="text-sm font-medium leading-tight">{nombre}</p>
        <p className="text-xs text-muted-foreground">{rolLabel}</p>
      </div>
      <Avatar className="h-9 w-9 border">
        <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
          {iniciales(nombre)}
        </AvatarFallback>
      </Avatar>
    </div>
  );
}
