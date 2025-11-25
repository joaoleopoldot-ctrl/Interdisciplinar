CREATE DATABASE StudyFlow;
USE StudyFlow;

-- 1. Tabela Alunos
CREATE TABLE Alunos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    telefone VARCHAR(20)
);

-- 2. Tabela Disciplinas (Alunos 1:N Disciplinas)
CREATE TABLE Disciplinas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    aluno_id INT,
    FOREIGN KEY (aluno_id) REFERENCES Alunos(id) ON DELETE CASCADE
);

-- 3. Tabela MetaEstudo (Alunos 1:N Metas / Disciplinas 1:N Metas)
-- Nota: No desenho parece ligar tanto a Aluno quanto a Disciplina.
CREATE TABLE MetaEstudo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    status VARCHAR(50),
    prazo DATE,
    tipo VARCHAR(50),
    aluno_id INT,
    disciplina_id INT,
    FOREIGN KEY (aluno_id) REFERENCES Alunos(id),
    FOREIGN KEY (disciplina_id) REFERENCES Disciplinas(id)
);

-- 4. Tabela Tarefas (Disciplinas 1:N Tarefas)
CREATE TABLE Tarefas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descricao TEXT NOT NULL,
    prioridade ENUM('Baixa', 'Média', 'Alta') DEFAULT 'Média',
    prazo DATE,
    status ENUM('Pendente', 'Em andamento', 'Concluída') DEFAULT 'Pendente',
    disciplina_id INT,
    FOREIGN KEY (disciplina_id) REFERENCES Disciplinas(id) ON DELETE CASCADE
);

-- 5. Tabela Agendamentos (Disciplinas 1:N Agendamentos)
CREATE TABLE Agendamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inicio DATETIME NOT NULL,
    fim DATETIME NOT NULL,
    status VARCHAR(50),
    obs TEXT,
    disciplina_id INT,
    FOREIGN KEY (disciplina_id) REFERENCES Disciplinas(id) ON DELETE CASCADE
);

-- 6. Tabela SessaoEstudo (Agendamentos 1:N SessaoEstudo)
-- Obs: Registra o que foi estudado
CREATE TABLE SessaoEstudo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    resumo TEXT,
    agendamento_id INT,
    FOREIGN KEY (agendamento_id) REFERENCES Agendamentos(id) ON DELETE CASCADE
);

-- 7. Tabela Materiais (SessaoEstudo 1:N Materiais)
CREATE TABLE Materiais (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(50),
    obs TEXT,
    referencia VARCHAR(255),
    sessao_estudo_id INT,
    FOREIGN KEY (sessao_estudo_id) REFERENCES SessaoEstudo(id) ON DELETE CASCADE
);