USE DBpendencias;

ALTER TABLE pendencias
    ADD COLUMN IF NOT EXISTS pen_observacao_conclusao VARCHAR(2000) NULL;
