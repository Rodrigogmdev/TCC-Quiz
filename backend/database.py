from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 1. caminho do banco de dados SQLite
SQLALCHEMY_DATABASE_URL = "sqlite:///./quiz.db"

# 2. conexão com SQLAlchemy
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# 3. fábrica de sessões para interagir com o banco
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. classe Base que  modelos da tabela irão herdar
Base = declarative_base()