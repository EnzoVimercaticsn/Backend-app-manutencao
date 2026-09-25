USE DBpendencias;

ALTER TABLE pendencias
    ADD COLUMN IF NOT EXISTS pen_data_inicial DATE NULL,
    ADD COLUMN IF NOT EXISTS pra_cod INT NULL,
    ADD COLUMN IF NOT EXISTS pen_solicitacao_conclusao VARCHAR(20) NULL,
    ADD COLUMN IF NOT EXISTS pen_prova_conclusao LONGTEXT NULL,
    ADD COLUMN IF NOT EXISTS pen_solicitada_por INT NULL,
    ADD COLUMN IF NOT EXISTS pen_solicitada_em DATETIME NULL;

ALTER TABLE prazos
    ADD COLUMN IF NOT EXISTS pra_vezes_adi INT NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS datas (
    dat_cod INT AUTO_INCREMENT PRIMARY KEY,
    data_prazo DATE NOT NULL,
    pra_cod INT NOT NULL,
    dat_vezes_adi INT NOT NULL DEFAULT 0
);
