"use client";

import { Button } from "@/components/ui/button";

/** Botón "Guardar" del formulario de edición de usuario. Pide confirmación si el
 *  cambio va a desactivar la cuenta (acción con impacto: el usuario no podrá entrar). */
export function GuardarUsuarioBtn() {
  return (
    <Button
      type="submit"
      variant="secondary"
      size="sm"
      onClick={(e) => {
        const form = (e.currentTarget as HTMLElement).closest("form");
        const activo = form?.querySelector('input[name="activo"]');
        if (activo instanceof HTMLInputElement && !activo.checked) {
          const ok = window.confirm(
            "Vas a desactivar a este usuario. No podrá iniciar sesión. ¿Continuar?"
          );
          if (!ok) e.preventDefault();
        }
      }}
    >
      Guardar
    </Button>
  );
}
