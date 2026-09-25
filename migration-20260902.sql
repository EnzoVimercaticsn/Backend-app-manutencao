USE DBpendencias;

ALTER TABLE pendencias
    ADD COLUMN IF NOT EXISTS pen_data_inicial DATE NULL,
    ADD COLUMN IF NOT EXISTS pra_cod INT NULL;

ALTER TABLE prazos
    ADD COLUMN IF NOT EXISTS pra_vezes_adi INT NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS datas (
    dat_cod INT AUTO_INCREMENT PRIMARY KEY,
    data_prazo DATE NOT NULL,
    pra_cod INT NOT NULL,
    dat_vezes_adi INT NOT NULL DEFAULT 0
);
