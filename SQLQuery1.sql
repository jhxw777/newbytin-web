------ ARQUIVO: setup-database.sql
IF DB_ID('LoginDB') IS NULL
    CREATE DATABASE LoginDB;
GO
USE LoginDB;
GO


IF OBJECT_ID('dbo.Loggig', 'U') IS NOT NULL
    DROP TABLE dbo.Loggig;
GO


CREATE TABLE Loggig (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Nome NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    Senha NVARCHAR(64) NOT NULL, 
    Telefone NVARCHAR(20),
    TipoUsuario NVARCHAR(20) NOT NULL DEFAULT 'Usuario', 
    Logado BIT NOT NULL DEFAULT 0,
    Acesso NVARCHAR(20) NOT NULL DEFAULT 'Usuário', 
    FotoPerfil NVARCHAR(MAX) NULL,
    DataCadastro DATETIME DEFAULT GETDATE()
);
GO

--

INSERT INTO Loggig (Nome, Email, Senha, Telefone, TipoUsuario, Logado, Acesso)
VALUES
('Jonathan Sobires', 'jonathansobires@newbytin.com', 'adm123', '(11)90000-0000', 'Administrador', 0, 'Administrador'),
('Igor Oliveira', 'igoroliveira@newbytin.com', 'adm123', '(11)90000-0000', 'Administrador', 0, 'Administrador'),
('Ana Vitória', 'anavitoria@newbytin.com', 'adm123', '(11)90000-0000', 'Administrador', 0, 'Administrador'),
('Daniel Borges', 'danielborges@newbytin.com', 'adm123', '(11)90000-0000', 'Administrador', 0, 'Administrador'),
('Gustavo Sizino', 'gustavosizino@newbytin.com', 'adm123', '(11)90000-0000', 'Administrador', 0, 'Administrador'),
('Jonathan', 'usuario@newbytin.com', 'adm123', '(11)98888-8888', 'Usuario', 0, 'Usuário'); -- "1234"
GO


IF OBJECT_ID('dbo.Chamados', 'U') IS NOT NULL
    DROP TABLE dbo.Chamados;
GO

CREATE TABLE Chamados (
    IdChamado INT IDENTITY(1,1) PRIMARY KEY,
    NumeroChamado NVARCHAR(50) NOT NULL UNIQUE,
    DataAbertura DATETIME DEFAULT GETDATE(),
    DataFechamento DATETIME NULL,
    Status NVARCHAR(20) DEFAULT 'Aberto',
    Prioridade NVARCHAR(20) DEFAULT 'Média',
    TipoProblema NVARCHAR(100),
    Descricao NVARCHAR(MAX),
    SetorSolicitante NVARCHAR(100),
    NomeSolicitante NVARCHAR(100),
    EmailSolicitante NVARCHAR(100),
    TelefoneSolicitante NVARCHAR(50),
    TecnicoResponsavel NVARCHAR(100),
    SolucaoAplicada NVARCHAR(MAX),
    Observacoes NVARCHAR(MAX)
);
GO

INSERT INTO Chamados
(NumeroChamado, Status, Prioridade, TipoProblema, Descricao, NomeSolicitante, EmailSolicitante)
VALUES
('CH-2025-0001', 'Aberto', 'Média', 'Servidor', 'Servidor caiu', 'Jonathan', 'sobiresjonathan@gmail.com');

GO



CREATE TABLE Notificacoes (
    Id INT IDENTITY PRIMARY KEY,
    EmailDestino NVARCHAR(100),
    Titulo NVARCHAR(200),
    Mensagem NVARCHAR(MAX),
    Lida BIT DEFAULT 0,
    DataEnvio DATETIME DEFAULT GETDATE()
);
INSERT INTO Notificacoes (EmailDestino, Titulo, Mensagem, Lida, DataEnvio)
VALUES ('sobiresjonathan@gmail.com', 'Teste', 'Mensagem Teste', 0, GETDATE());
GO

SELECT '✅ Banco LoginDB configurado com sucesso!' AS Status;
GO

 
 DELETE FROM Conversations
WHERE Id NOT IN (SELECT MIN(Id) FROM Conversations GROUP BY ChamadoId);
SELECT * FROM NOTIFICACOES
SELECT * FROM Loggig