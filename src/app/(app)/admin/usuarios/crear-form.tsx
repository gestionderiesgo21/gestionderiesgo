"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { crearUsuarioAdmin, type AdminState } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const selectCls =
  "border-input focus-visible:border-primary focus-visible:ring-primary/20 h-9 rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px]";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Creando…" : "Crear usuario"}
    </Button>
  );
}

export default function CrearUsuarioForm({ cantones }: { cantones: { id: string; label: string }[] }) {
  const [state, action] = useActionState<AdminState, FormData>(crearUsuarioAdmin, undefined);
  const [rol, setRol] = useState("TECNICO_MUNICIPAL");
  const necesitaCanton = rol === "TECNICO_MUNICIPAL" || rol === "CONSULTOR";

  return (
    <form action={action} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Input name="nombre" placeholder="Nombre completo" required />
        <Input name="email" type="email" placeholder="Correo" required />
        <Input name="password" type="password" placeholder="Contraseña (mín. 8)" required minLength={8} />
        <select name="rol" className={selectCls} value={rol} onChange={(e) => setRol(e.target.value)}>
          <option value="TECNICO_MUNICIPAL">Técnico municipal</option>
          <option value="CONSULTOR">Consultor</option>
          <option value="INVESTIGADOR">Investigador</option>
          <option value="ADMIN">Administrador</option>
        </select>
        <select name="cantonId" className={`${selectCls} lg:col-span-2`} disabled={!necesitaCanton} defaultValue="">
          <option value="">{necesitaCanton ? "— Selecciona cantón —" : "— No aplica —"}</option>
          {cantones.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-3">
        <Submit />
        {state?.error && (
          <span className="flex items-center gap-1.5 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" /> {state.error}
          </span>
        )}
        {state?.ok && (
          <span className="flex items-center gap-1.5 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" /> {state.ok}
          </span>
        )}
      </div>
    </form>
  );
}
