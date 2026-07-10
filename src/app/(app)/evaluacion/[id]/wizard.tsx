"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Save, Send, Plus, Trash2, ShieldAlert } from "lucide-react";
import { calcularIndice, type CatalogoComponente } from "@/lib/calculo";
import { guardarEvaluacion, enviarEvaluacion } from "@/lib/actions/evaluacion";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Pregunta = { codigo: string; texto: string };
type Variable = {
  codigo: string;
  nombre: string;
  refLogird: string | null;
  refLootugs: string | null;
  refCootad: string | null;
  preguntas: Pregunta[];
};
type Componente = { codigo: string; nombre: string; peso: number; variables: Variable[] };
type EventoCat = { id: string; nombre: string; categoria: string; subcategoria: string };
type EventoVal = {
  cantidad: number;
  amenaza: number;
  vulnerabilidad: number;
  exposicion: number;
  mitigacion: number;
};

const ESCALA = [
  { v: 1, label: "Bajo" },
  { v: 2, label: "Medio" },
  { v: 3, label: "Alto" },
];

const selectCls =
  "border-input focus-visible:border-primary focus-visible:ring-primary/20 h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px]";

export default function EvaluacionWizard(props: {
  evaluacionId: string;
  estado: string;
  soloLectura: boolean;
  canton: string;
  periodo: number;
  componentes: Componente[];
  eventosCatalogo: EventoCat[];
  initialRespuestas: Record<string, number>;
  initialEventos: Record<string, EventoVal>;
}) {
  const router = useRouter();
  const [respuestas, setRespuestas] = useState<Record<string, number>>(props.initialRespuestas);
  const [eventos, setEventos] = useState<Record<string, EventoVal>>(props.initialEventos);
  const [paso, setPaso] = useState(0);
  const [pending, startTransition] = useTransition();
  const readonly = props.soloLectura;

  const pasoAmenazas = props.componentes.length;
  const pasoResumen = props.componentes.length + 1;

  const catalogoCalc: CatalogoComponente[] = useMemo(
    () =>
      props.componentes.map((c) => ({
        codigo: c.codigo,
        peso: c.peso,
        variables: c.variables.map((v) => ({
          codigo: v.codigo,
          preguntas: v.preguntas.map((p) => p.codigo),
        })),
      })),
    [props.componentes]
  );

  const resultado = useMemo(
    () =>
      calcularIndice({
        componentes: catalogoCalc,
        respuestas,
        eventos: Object.values(eventos),
      }),
    [catalogoCalc, respuestas, eventos]
  );

  const setResp = (codigo: string, valor: number) =>
    setRespuestas((r) => ({ ...r, [codigo]: valor }));

  const guardar = () =>
    startTransition(async () => {
      const res = await guardarEvaluacion(props.evaluacionId, {
        respuestas: Object.entries(respuestas).map(([codigo, valor]) => ({ codigo, valor })),
        eventos: Object.entries(eventos).map(([eventoId, e]) => ({ eventoId, ...e })),
      });
      if (res.ok) {
        toast.success("Borrador guardado correctamente.");
        router.refresh();
      } else {
        toast.error("Error al guardar.");
      }
    });

  const enviar = () =>
    startTransition(async () => {
      const res = await guardarEvaluacion(props.evaluacionId, {
        respuestas: Object.entries(respuestas).map(([codigo, valor]) => ({ codigo, valor })),
        eventos: Object.entries(eventos).map(([eventoId, e]) => ({ eventoId, ...e })),
      });
      if (!res.ok) {
        toast.error("Error al guardar.");
        return;
      }
      const env = await enviarEvaluacion(props.evaluacionId);
      if (!env.ok) {
        toast.error(env.error || "No se pudo enviar.");
        return;
      }
      toast.success("¡Evaluación enviada!");
      router.push("/dashboard");
    });

  const avance = (resultado.preguntasRespondidas / resultado.totalPreguntas) * 100;

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{props.canton}</h1>
            {props.estado === "ENVIADA" ? (
              <Badge className="border-green-200 bg-green-100 text-green-800">Enviada</Badge>
            ) : (
              <Badge className="border-amber-200 bg-amber-100 text-amber-800">Borrador</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Autoevaluación GIRD · Periodo {props.periodo}
            {readonly && props.estado !== "ENVIADA" ? " · Solo lectura" : ""}
          </p>
        </div>
        <div className="flex items-center divide-x rounded-xl border bg-card shadow-sm">
          <Metric label="IDM-GIRD" value={resultado.idmGird.toFixed(3)} accent />
          <Metric label="Ajustado" value={resultado.idmGirdAjustado.toFixed(3)} />
          <Metric
            label="Avance"
            value={`${resultado.preguntasRespondidas}/${resultado.totalPreguntas}`}
          />
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-primary transition-all" style={{ width: `${avance}%` }} />
      </div>

      {/* Stepper */}
      <div className="flex flex-wrap gap-1.5">
        {props.componentes.map((c, i) => (
          <StepBtn key={c.codigo} active={paso === i} onClick={() => setPaso(i)} title={c.nombre}>
            {c.codigo}
          </StepBtn>
        ))}
        <StepBtn active={paso === pasoAmenazas} onClick={() => setPaso(pasoAmenazas)}>
          Amenazas
        </StepBtn>
        <StepBtn active={paso === pasoResumen} onClick={() => setPaso(pasoResumen)}>
          Resumen
        </StepBtn>
      </div>

      {/* Contenido del paso */}
      {paso < pasoAmenazas && (
        <ComponentePaso
          componente={props.componentes[paso]}
          respuestas={respuestas}
          setResp={setResp}
          readonly={readonly}
        />
      )}
      {paso === pasoAmenazas && (
        <AmenazasPaso
          catalogo={props.eventosCatalogo}
          eventos={eventos}
          setEventos={setEventos}
          readonly={readonly}
          cti={resultado.cti}
        />
      )}
      {paso === pasoResumen && <Resumen componentes={props.componentes} resultado={resultado} />}

      {/* Acciones */}
      <div className="sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card/95 px-4 py-3 shadow-lg backdrop-blur">
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => setPaso((p) => Math.max(0, p - 1))}
            disabled={paso === 0}
          >
            <ChevronLeft className="h-4 w-4" /> Anterior
          </Button>
          <Button
            variant="secondary"
            onClick={() => setPaso((p) => Math.min(pasoResumen, p + 1))}
            disabled={paso === pasoResumen}
          >
            Siguiente <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        {!readonly && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={guardar} disabled={pending}>
              <Save className="h-4 w-4" /> {pending ? "Guardando…" : "Guardar borrador"}
            </Button>
            <Button
              onClick={enviar}
              disabled={pending || !resultado.completo}
              title={resultado.completo ? "" : "Responde las 275 preguntas para enviar"}
            >
              <Send className="h-4 w-4" /> Enviar evaluación
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="px-4 py-2 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("text-lg font-semibold tabular-nums", accent && "text-primary")}>{value}</p>
    </div>
  );
}

function StepBtn({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      {children}
    </button>
  );
}

function ComponentePaso({
  componente,
  respuestas,
  setResp,
  readonly,
}: {
  componente: Componente;
  respuestas: Record<string, number>;
  setResp: (c: string, v: number) => void;
  readonly: boolean;
}) {
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold tracking-tight">{componente.nombre}</h2>
      {componente.variables.map((v) => {
        const refs = [
          v.refLogird && `LOGIRD ${v.refLogird}`,
          v.refLootugs && `LOOTUGS ${v.refLootugs}`,
          v.refCootad && `COOTAD ${v.refCootad}`,
        ].filter(Boolean) as string[];
        return (
          <Card key={v.codigo}>
            <CardHeader>
              <CardTitle className="text-base font-medium">
                <span className="text-muted-foreground">{v.codigo}. </span>
                {v.nombre}
              </CardTitle>
              {refs.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {refs.map((r) => (
                    <Badge key={r} variant="secondary" className="font-normal">
                      {r}
                    </Badge>
                  ))}
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {v.preguntas.map((p) => (
                <div
                  key={p.codigo}
                  className="flex flex-col gap-2 border-t pt-3 first:border-t-0 first:pt-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <p className="text-sm">
                    <span className="text-muted-foreground">{p.codigo} </span>
                    {p.texto}
                  </p>
                  <div className="flex shrink-0 gap-1">
                    {ESCALA.map((o) => {
                      const sel = respuestas[p.codigo] === o.v;
                      return (
                        <button
                          key={o.v}
                          disabled={readonly}
                          onClick={() => setResp(p.codigo, o.v)}
                          className={cn(
                            "min-w-16 rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-60",
                            sel
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-accent"
                          )}
                        >
                          {o.v} · {o.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function AmenazasPaso({
  catalogo,
  eventos,
  setEventos,
  readonly,
  cti,
}: {
  catalogo: EventoCat[];
  eventos: Record<string, EventoVal>;
  setEventos: React.Dispatch<React.SetStateAction<Record<string, EventoVal>>>;
  readonly: boolean;
  cti: number;
}) {
  const [nuevo, setNuevo] = useState("");
  const disponibles = catalogo.filter((e) => !(e.id in eventos));

  const agregar = () => {
    if (!nuevo) return;
    setEventos((s) => ({
      ...s,
      [nuevo]: { cantidad: 1, amenaza: 1, vulnerabilidad: 1, exposicion: 1, mitigacion: 1 },
    }));
    setNuevo("");
  };
  const quitar = (id: string) =>
    setEventos((s) => {
      const c = { ...s };
      delete c[id];
      return c;
    });
  const upd = (id: string, campo: keyof EventoVal, valor: number) =>
    setEventos((s) => ({ ...s, [id]: { ...s[id], [campo]: valor } }));

  const nombre = (id: string) => catalogo.find((e) => e.id === id)?.nombre ?? id;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <ShieldAlert className="h-5 w-5 text-primary" />
            Amenazas / eventos del cantón
          </h2>
          <p className="text-sm text-muted-foreground">
            Registra los eventos ocurridos. Escalas 1–10. Ajusta el coeficiente CTI del índice.
          </p>
        </div>
        <div className="rounded-xl border bg-card px-4 py-2 text-center shadow-sm">
          <p className="text-xs text-muted-foreground">CTI</p>
          <p className="text-lg font-semibold tabular-nums text-primary">{cti.toFixed(4)}</p>
        </div>
      </div>

      {!readonly && (
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-64 flex-1 space-y-2">
            <Label>Agregar evento</Label>
            <select className={selectCls} value={nuevo} onChange={(e) => setNuevo(e.target.value)}>
              <option value="">— Selecciona un evento —</option>
              {disponibles.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombre} ({e.categoria})
                </option>
              ))}
            </select>
          </div>
          <Button onClick={agregar} disabled={!nuevo}>
            <Plus className="h-4 w-4" /> Agregar
          </Button>
        </div>
      )}

      <Card className="overflow-hidden py-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Evento</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Amenaza</TableHead>
              <TableHead>Vulnerab.</TableHead>
              <TableHead>Exposición</TableHead>
              <TableHead>Mitigación</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.keys(eventos).length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-6 text-center text-muted-foreground">
                  Sin eventos registrados (CTI = 0.8).
                </TableCell>
              </TableRow>
            )}
            {Object.entries(eventos).map(([id, e]) => (
              <TableRow key={id}>
                <TableCell className="font-medium">{nombre(id)}</TableCell>
                {(["cantidad", "amenaza", "vulnerabilidad", "exposicion", "mitigacion"] as const).map(
                  (campo) => (
                    <TableCell key={campo}>
                      <Input
                        type="number"
                        min={0}
                        step="0.1"
                        disabled={readonly}
                        value={e[campo]}
                        onChange={(ev) => upd(id, campo, parseFloat(ev.target.value) || 0)}
                        className="h-8 w-20"
                      />
                    </TableCell>
                  )
                )}
                <TableCell>
                  {!readonly && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => quitar(id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function Resumen({
  componentes,
  resultado,
}: {
  componentes: Componente[];
  resultado: ReturnType<typeof calcularIndice>;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold tracking-tight">Resumen de resultados</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <ResumenTile label="IDM-GIRD" value={resultado.idmGird.toFixed(3)} accent />
        <ResumenTile label="CTI (amenazas)" value={resultado.cti.toFixed(3)} />
        <ResumenTile label="IDM-GIRD ajustado" value={resultado.idmGirdAjustado.toFixed(3)} />
      </div>
      <Card className="overflow-hidden py-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Componente</TableHead>
              <TableHead>Peso</TableHead>
              <TableHead>Puntaje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {componentes.map((c) => (
              <TableRow key={c.codigo}>
                <TableCell>
                  {c.codigo}. {c.nombre}
                </TableCell>
                <TableCell className="tabular-nums text-muted-foreground">
                  {c.peso.toFixed(4)}
                </TableCell>
                <TableCell className="font-medium tabular-nums">
                  {(resultado.puntajesComponente[c.codigo] ?? 0).toFixed(3)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function ResumenTile({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <Card>
      <CardContent className="py-6 text-center">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={cn("text-3xl font-bold tabular-nums", accent ? "text-primary" : "text-foreground")}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
