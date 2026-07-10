"use client";

import { LogOut } from "lucide-react";
import { logout } from "@/lib/actions/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function iniciales(nombre: string) {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function UserMenu({ nombre, rolLabel }: { nombre: string; rolLabel: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-3 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium leading-tight">{nombre}</p>
          <p className="text-xs text-muted-foreground">{rolLabel}</p>
        </div>
        <Avatar className="h-9 w-9 border">
          <AvatarFallback className="bg-brand-navy text-xs font-semibold text-white">
            {iniciales(nombre)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="font-medium">{nombre}</div>
          <div className="text-xs font-normal text-muted-foreground">{rolLabel}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <form action={logout}>
          <button type="submit" className="w-full">
            <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
              <LogOut className="text-destructive" />
              Cerrar sesión
            </DropdownMenuItem>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
