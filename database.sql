CREATE DATABASE IF NOT EXISTS DBpendencias;
USE DBpendencias;

CREATE TABLE IF NOT EXISTS pendencias (
    pen_cod INT AUTO_INCREMENT PRIMARY KEY,
    pen_local VARCHAR(255) NOT NULL,
    pen_data_da_verifi DATE NOT NULL,
    pen_area VARCHAR(255) NOT NULL,
    pen_desc VARCHAR(1000),
    pen_item_con VARCHAR(500),
    pen_descumprimento_legis VARCHAR(1000)
);

CREATE TABLE IF NOT EXISTS prazos (
    pra_cod INT AUTO_INCREMENT PRIMARY KEY,
    pra_prazo DATE NOT NULL,
    pra_observacao VARCHAR(1000),
    pra_responsavel VARCHAR(255),
    pra_status BOOLEAN
);

CREATE TABLE IF NOT EXISTS usuario (
    uso_matric INT PRIMARY KEY,
    uso_nome VARCHAR(255) NOT NULL,
    uso_senha VARCHAR(255) NOT NULL,
    uso_is_adm BOOLEAN NOT NULL DEFAULT FALSE,
    uso_empresa VARCHAR(255)
);
