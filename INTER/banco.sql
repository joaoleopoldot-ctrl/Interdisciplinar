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

-- 3. Tabela MetaEstudo (Metas gerais, ligadas a Aluno e/ou Disciplina)
CREATE TABLE MetaEstudo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    status VARCHAR(50),
    prazo DATE,
    tipo VARCHAR(50),
    aluno_id INT,
    disciplina_id INT,
    FOREIGN KEY (aluno_id) REFERENCES Alunos(id) ON DELETE CASCADE,
    FOREIGN KEY (disciplina_id) REFERENCES Disciplinas(id) ON DELETE CASCADE
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

-- 5. Tabela Agendamentos (Eventos de estudo, ligadas a Disciplinas)
CREATE TABLE Agendamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inicio DATETIME NOT NULL,
    fim DATETIME NOT NULL,
    status VARCHAR(50),
    obs TEXT,
    disciplina_id INT,
    FOREIGN KEY (disciplina_id) REFERENCES Disciplinas(id) ON DELETE CASCADE
);

-- 6. Tabela SessaoEstudo (Detalhes do que foi feito em um Agendamento)
CREATE TABLE SessaoEstudo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    resumo TEXT,
    agendamento_id INT,
    FOREIGN KEY (agendamento_id) REFERENCES Agendamentos(id) ON DELETE CASCADE
);