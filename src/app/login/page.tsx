"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { useFormStatus } from "react-dom";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { login, type FormState } from "@/lib/actions/auth";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" size="lg" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="animate-spin" /> Ingresando…
        </>
      ) : (
        "Ingresar"
      )}
    </Button>
  );
}

function LoginForm() {
  const [state, formAction] = useActionState<FormState, FormData>(login, undefined);
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/dashboard";
  const pendiente = params.get("pendiente") === "1";

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="redirect" value={redirect} />
      {pendiente && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <CheckCircle2 className="h-4 w-4 !text-green-600" />
          <AlertDescription className="text-green-800">
            Cuenta creada. Un administrador debe aprobarla antes de que puedas ingresar.
          </AlertDescription>
        </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="tu.correo@gadm.gob.ec"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <PasswordInput
          id="password"
          name="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
        />
      </div>
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

export default function LoginPage() {
  return (
    <AuthShell title="Iniciar sesión" subtitle="Ingresa tus credenciales para continuar.">
      <Suspense fallback={<p className="text-sm text-muted-foreground">Cargando…</p>}>
        <LoginForm />
      </Suspense>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="font-medium text-primary hover:underline">
          Regístrate
        </Link>
      </p>
    </AuthShell>
  );
}
