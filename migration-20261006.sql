USE DBpendencias;

ALTER TABLE pendencias
    ADD COLUMN IF NOT EXISTS pen_motivo_reprovacao VARCHAR(2000) NULL;