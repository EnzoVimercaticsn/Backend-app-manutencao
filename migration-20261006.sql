USE DBpendencias;

ALTER TABLE pendencias
    ADD COLUMN IF NOT EXISTS pen_motivo_reprovacao VARCHAR(2000) NULL;

ALTER TABLE usuario
    MODIFY COLUMN uso_matric VARCHAR(50) NOT NULL;

ALTER TABLE pendencias
        MODIFY COLUMN pen_solicitada_por VARCHAR(50) NULL,
        ADD COLUMN IF NOT EXISTS pen_decidida_em DATETIME NULL;

UPDATE pendencias
SET pen_decidida_em = COALESCE(pen_solicitada_em, NOW())
WHERE pen_solicitacao_conclusao IN ('aprovada', 'reprovada')
    AND pen_decidida_em IS NULL;