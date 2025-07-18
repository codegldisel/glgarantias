#!/usr/bin/env python3
"""
Script para inserir os dados refinados no Supabase
"""

import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
import os
from datetime import datetime

# Configuração do banco de dados
DB_CONFIG = {
    'host': 'db.yvkdquddiwnnzydasfbi.supabase.co',
    'port': 5432,
    'database': 'postgres',
    'user': 'postgres',
    'password': 'Edu23Tata23!'
}

def connect_to_db():
    """Conecta ao banco de dados Supabase"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except Exception as e:
        print(f"Erro ao conectar ao banco: {e}")
        return None

def insert_refined_data():
    """Insere os dados refinados no Supabase"""
    
    # Ler o arquivo CSV
    csv_path = '/home/ubuntu/glgarantias/data/refined_data.csv'
    
    if not os.path.exists(csv_path):
        print(f"Arquivo não encontrado: {csv_path}")
        return False
    
    try:
        # Carregar dados
        df = pd.read_csv(csv_path)
        print(f"Carregados {len(df)} registros do CSV")
        
        # Conectar ao banco
        conn = connect_to_db()
        if not conn:
            return False
        
        cursor = conn.cursor()
        
        # Limpar tabela existente
        cursor.execute("DELETE FROM ordens_servico")
        print("Tabela ordens_servico limpa")
        
        # Preparar dados para inserção
        insert_data = []
        for _, row in df.iterrows():
            # Converter data para formato correto
            data_ordem = datetime.strptime(row['data_ordem'], '%d/%m/%Y').date()
            
            insert_data.append((
                row['numero_ordem'],
                data_ordem,
                row['status'],
                row['defeito_texto_bruto'],
                row['mecanico_responsavel'],
                row['modelo_motor'],
                row['modelo_veiculo_motor'],
                row['fabricante_motor'],
                row['dia_servico'],
                row['mes_servico'],
                row['ano_servico'],
                float(row['total_pecas']),
                float(row['total_servico']),
                float(row['total_geral'])
            ))
        
        # SQL de inserção
        insert_sql = """
        INSERT INTO ordens_servico (
            numero_ordem, data_ordem, status, defeito_texto_bruto,
            mecanico_responsavel, modelo_motor, modelo_veiculo_motor,
            fabricante_motor, dia_servico, mes_servico, ano_servico,
            total_pecas, total_servico, total_geral
        ) VALUES %s
        """
        
        # Executar inserção em lotes
        execute_values(cursor, insert_sql, insert_data, page_size=100)
        
        # Commit das alterações
        conn.commit()
        print(f"Inseridos {len(insert_data)} registros com sucesso!")
        
        # Verificar inserção
        cursor.execute("SELECT COUNT(*) FROM ordens_servico")
        count = cursor.fetchone()[0]
        print(f"Total de registros na tabela: {count}")
        
        cursor.close()
        conn.close()
        
        return True
        
    except Exception as e:
        print(f"Erro durante a inserção: {e}")
        if conn:
            conn.rollback()
            conn.close()
        return False

if __name__ == "__main__":
    print("Iniciando inserção dos dados refinados...")
    success = insert_refined_data()
    
    if success:
        print("✅ Dados inseridos com sucesso!")
    else:
        print("❌ Falha na inserção dos dados")

