create table public.asignaturas (
  nombre text not null,
  constraint asignaturas_pkey primary key (nombre)
) TABLESPACE pg_default;

create table public.autores (
  autor_id uuid not null default extensions.uuid_generate_v4 (),
  nombre text not null,
  email text not null,
  constraint autores_pkey primary key (autor_id),
  constraint autores_email_key unique (email)
) TABLESPACE pg_default;

create table public.criterios (
  criterio_id uuid not null default extensions.uuid_generate_v4 (),
  rubrica_id uuid not null,
  name text not null,
  weight numeric null,
  constraint criterios_pkey primary key (criterio_id),
  constraint criterios_rubrica_id_name_key unique (rubrica_id, name),
  constraint criterios_rubrica_id_fkey foreign KEY (rubrica_id) references rubricas (rubrica_id) on delete CASCADE
) TABLESPACE pg_default;

create table public.enlaces (
  enlace_id uuid not null default extensions.uuid_generate_v4 (),
  ovc_id bigint not null,
  descripcion text null,
  url text not null,
  constraint enlaces_pkey primary key (enlace_id),
  constraint enlaces_ovc_id_fkey foreign KEY (ovc_id) references ovc (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.etiquetas (
  nombre text not null,
  constraint etiquetas_pkey primary key (nombre)
) TABLESPACE pg_default;

create table public.evaluaciones (
  evaluacion_id uuid not null default extensions.uuid_generate_v4 (),
  ovc_id bigint not null,
  evaluator_name text null,
  evaluator_id text null,
  rubrica_id uuid not null,
  subject text null,
  percentage numeric null,
  feedback text null,
  calculated_grade numeric null,
  timestamp timestamp with time zone null,
  constraint evaluaciones_pkey primary key (evaluacion_id),
  constraint evaluaciones_ovc_id_fkey foreign KEY (ovc_id) references ovc (id) on delete CASCADE,
  constraint evaluaciones_rubrica_id_fkey foreign KEY (rubrica_id) references rubricas (rubrica_id) on delete RESTRICT
) TABLESPACE pg_default;

create table public.evaluacionpuntajes (
  eval_puntaje_id uuid not null default extensions.uuid_generate_v4 (),
  evaluacion_id uuid not null,
  criterio_id uuid not null,
  score_value numeric not null,
  constraint evaluacionpuntajes_pkey primary key (eval_puntaje_id),
  constraint evaluacionpuntajes_evaluacion_id_criterio_id_key unique (evaluacion_id, criterio_id),
  constraint evaluacionpuntajes_criterio_id_fkey foreign KEY (criterio_id) references criterios (criterio_id) on delete RESTRICT,
  constraint evaluacionpuntajes_evaluacion_id_fkey foreign KEY (evaluacion_id) references evaluaciones (evaluacion_id) on delete CASCADE
) TABLESPACE pg_default;

create table public.kanbancolumnas (
  id text not null,
  nombre_columna text not null,
  orden_columna integer null,
  constraint kanbancolumnas_pkey primary key (id),
  constraint kanbancolumnas_orden_columna_key unique (orden_columna)
) TABLESPACE pg_default;

create table public.niveles (
  nivel_id uuid not null default extensions.uuid_generate_v4 (),
  criterio_id uuid not null,
  name text not null,
  score numeric not null,
  description text null,
  constraint niveles_pkey primary key (nivel_id),
  constraint niveles_criterio_id_name_key unique (criterio_id, name),
  constraint niveles_criterio_id_score_key unique (criterio_id, score),
  constraint niveles_criterio_id_fkey foreign KEY (criterio_id) references criterios (criterio_id) on delete CASCADE
) TABLESPACE pg_default;

create table public.ovc (
  id bigint not null,
  titulo text not null,
  descripcion text null,
  imagen_dataurl text null,
  semestre text null,
  licencia text null,
  archivo text null,
  fecha_creacion timestamp with time zone null,
  constraint ovc_pkey primary key (id)
) TABLESPACE pg_default;

create table public.ovcasignaturas (
  ovc_id bigint not null,
  asignatura_nombre text not null,
  constraint ovcasignaturas_pkey primary key (ovc_id, asignatura_nombre),
  constraint ovcasignaturas_asignatura_nombre_fkey foreign KEY (asignatura_nombre) references asignaturas (nombre) on delete CASCADE,
  constraint ovcasignaturas_ovc_id_fkey foreign KEY (ovc_id) references ovc (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.ovcautores (
  ovc_id bigint not null,
  autor_id uuid not null,
  rol text not null,
  participacion integer null,
  constraint ovcautores_pkey primary key (ovc_id, autor_id, rol),
  constraint ovcautores_autor_id_fkey foreign KEY (autor_id) references autores (autor_id) on delete CASCADE,
  constraint ovcautores_ovc_id_fkey foreign KEY (ovc_id) references ovc (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.ovcetiquetas (
  ovc_id bigint not null,
  etiqueta_nombre text not null,
  constraint ovcetiquetas_pkey primary key (ovc_id, etiqueta_nombre),
  constraint ovcetiquetas_etiqueta_nombre_fkey foreign KEY (etiqueta_nombre) references etiquetas (nombre) on delete CASCADE,
  constraint ovcetiquetas_ovc_id_fkey foreign KEY (ovc_id) references ovc (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.ovcrelaciones (
  relacion_id uuid not null default extensions.uuid_generate_v4 (),
  ovc_origen_id bigint not null,
  ovc_destino_id bigint not null,
  tipo_relacion text null,
  constraint ovcrelaciones_pkey primary key (relacion_id),
  constraint ovcrelaciones_ovc_origen_id_ovc_destino_id_tipo_relacion_key unique (ovc_origen_id, ovc_destino_id, tipo_relacion),
  constraint ovcrelaciones_ovc_destino_id_fkey foreign KEY (ovc_destino_id) references ovc (id) on delete CASCADE,
  constraint ovcrelaciones_ovc_origen_id_fkey foreign KEY (ovc_origen_id) references ovc (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.rubricas (
  rubrica_id uuid not null default extensions.uuid_generate_v4 (),
  title text not null,
  constraint rubricas_pkey primary key (rubrica_id),
  constraint rubricas_title_key unique (title)
) TABLESPACE pg_default;

create table public.subtareas (
  id text not null,
  task_id text not null,
  description text not null,
  completed boolean null default false,
  constraint subtareas_pkey primary key (id),
  constraint subtareas_task_id_fkey foreign KEY (task_id) references tareas (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.tareas (
  id text not null,
  ovc_id bigint not null,
  description text not null,
  due_date date null,
  assignee text null,
  color text null,
  column_id text not null,
  orden integer null,
  constraint tareas_pkey primary key (id),
  constraint tareas_column_id_fkey foreign KEY (column_id) references kanbancolumnas (id) on delete RESTRICT,
  constraint tareas_ovc_id_fkey foreign KEY (ovc_id) references ovc (id) on delete CASCADE
) TABLESPACE pg_default;