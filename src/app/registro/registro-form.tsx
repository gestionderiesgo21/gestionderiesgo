"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, AlertCircle, Info } from "lucide-react";
import { registro, type FormState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

type CantonOpt = { id: string; label: string };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" size="lg" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="animate-spin" /> Creando cuenta…
        </>
      ) : (
        "Crear cuenta"
      )}
    </Button>
  );
}

export default function RegistroForm({ cantones }: { cantones: CantonOpt[] }) {
  const [state, formAction] = useActionState<FormState, FormData>(registro, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre completo</Label>
        <Input id="nombre" name="nombre" required placeholder="Nombres y apellidos" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="tu.correo@gadm.gob.ec"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="Mínimo 8 caracteres"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cantonId">Cantón (GADM)</Label>
        <select
          id="cantonId"
          name="cantonId"
          required
          defaultValue=""
          className="border-input focus-visible:border-primary focus-visible:ring-primary/20 flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px]"
        >
          <option value="" disabled>
            — Selecciona tu cantón —
          </option>
          {cantones.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <Alert className="border-amber-200 bg-amber-50 text-amber-900">
        <Info className="h-4 w-4 !text-amber-600" />
        <AlertDescription className="text-amber-900">
          Tu cuenta quedará pendiente de aprobación por un administrador antes de poder ingresar.
        </AlertDescription>
      </Alert>

      {state?.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      <SubmitButton />
    </form>
  );
}
