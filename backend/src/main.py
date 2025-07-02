#!/usr/bin/env python3
import os
import sys
import json
import requests
from flask import Flask, jsonify, request, Response
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Configuração do Supabase
SUPABASE_URL = "https://yvkdquddiwnnzydasfbi.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2a2RxdWRkaXdubnp5ZGFzZmJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzODU4MzQsImV4cCI6MjA2Njk2MTgzNH0.JeGoxoAG-6W909yYo_jlsecJ6vWi6pGfy1DLFlxEzGo"

def supabase_request(table, select="*", filters=None):
    """Fazer requisição para o Supabase"""
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    
    params = {"select": select}
    if filters:
        params.update(filters)
    
    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()
    return response.json()

@app.route("/")
def health_check():
    return jsonify({"status": "healthy", "message": "GL Garantias Backend is running"})

@app.route("/api/dashboard/stats", methods=["GET"])
def dashboard_stats():
    """Buscar estatísticas do dashboard"""
    try:
        print("Buscando estatísticas do dashboard...")
        
        # Buscar todas as ordens de serviço
        ordens = supabase_request("ordens_servico")
        
        if not ordens:
            return jsonify({
                "totalOS": 0,
                "totalPecas": 0,
                "totalServicos": 0,
                "totalGeral": 0,
                "totalMecanicos": 0,
                "totalTiposDefeitos": 0
            })
        
        # Calcular estatísticas
        total_os = len(ordens)
        total_pecas = sum(ordem.get("total_pecas", 0) or 0 for ordem in ordens)
        total_servicos = sum(ordem.get("total_servico", 0) or 0 for ordem in ordens)
        total_geral = sum(ordem.get("total_geral", 0) or 0 for ordem in ordens)
        
        # Contar mecânicos únicos
        mecanicos_unicos = set(ordem.get("mecanico_responsavel") for ordem in ordens if ordem.get("mecanico_responsavel"))
        total_mecanicos = len(mecanicos_unicos)
        
        # Contar tipos de defeitos únicos
        defeitos_unicos = set(ordem.get("defeito_grupo") for ordem in ordens if ordem.get("defeito_grupo"))
        total_tipos_defeitos = len(defeitos_unicos)
        
        stats = {
            "totalOS": total_os,
            "totalPecas": round(total_pecas, 2),
            "totalServicos": round(total_servicos, 2),
            "totalGeral": round(total_geral, 2),
            "totalMecanicos": total_mecanicos,
            "totalTiposDefeitos": total_tipos_defeitos
        }
        
        print(f"Estatísticas calculadas: {stats}")
        return jsonify(stats)
        
    except Exception as error:
        print(f"Erro ao buscar estatísticas: {error}")
        return jsonify({"error": "Erro interno do servidor"}), 500

@app.route("/api/dashboard/charts", methods=["GET"])
def dashboard_charts():
    """Buscar dados para gráficos do dashboard"""
    try:
        print("Buscando dados para gráficos...")
        
        # Buscar todas as ordens de serviço
        ordens = supabase_request("ordens_servico")
        
        if not ordens:
            return jsonify({
                "defeitosPorGrupo": [],
                "statusDistribuicao": [],
                "ordensTemporais": []
            })
        
        # Defeitos por grupo
        defeitos_count = {}
        for ordem in ordens:
            grupo = ordem.get("defeito_grupo", "Não Classificado")
            defeitos_count[grupo] = defeitos_count.get(grupo, 0) + 1
        
        defeitos_por_grupo = [
            {"grupo": grupo, "quantidade": count}
            for grupo, count in defeitos_count.items()
        ]
        
        # Status distribuição
        status_count = {}
        for ordem in ordens:
            status = ordem.get("status", "Processado")
            status_count[status] = status_count.get(status, 0) + 1
        
        status_distribuicao = [
            {"status": status, "quantidade": count}
            for status, count in status_count.items()
        ]
        
        # Ordens temporais (últimos 6 meses)
        ordens_temporais = [
            {"periodo": "fev./2025", "quantidade": 0, "valor": 0},
            {"periodo": "mar./2025", "quantidade": 0, "valor": 0},
            {"periodo": "abr./2025", "quantidade": 0, "valor": 0},
            {"periodo": "mai./2025", "quantidade": 0, "valor": 0},
            {"periodo": "jun./2025", "quantidade": 0, "valor": 0},
            {"periodo": "jul./2025", "quantidade": 0, "valor": 0}
        ]
        
        charts_data = {
            "defeitosPorGrupo": defeitos_por_grupo,
            "statusDistribuicao": status_distribuicao,
            "ordensTemporais": ordens_temporais
        }
        
        print(f"Dados dos gráficos calculados: {charts_data}")
        return jsonify(charts_data)
        
    except Exception as error:
        print(f"Erro ao buscar dados dos gráficos: {error}")
        return jsonify({"error": "Erro interno do servidor"}), 500

@app.route("/api/ordens", methods=["GET"])
def get_ordens():
    """Buscar todas as ordens de serviço"""
    try:
        ordens = supabase_request("ordens_servico")
        return jsonify(ordens or [])
    except Exception as error:
        print(f"Erro ao buscar ordens: {error}")
        return jsonify({"error": "Erro interno do servidor"}), 500

@app.route("/api/mecanicos", methods=["GET"])
def get_mecanicos():
    """Buscar mecânicos únicos"""
    try:
        ordens = supabase_request("ordens_servico", "mecanico_responsavel")
        mecanicos = list(set(ordem.get("mecanico_responsavel") for ordem in ordens if ordem.get("mecanico_responsavel")))
        return jsonify(mecanicos)
    except Exception as error:
        print(f"Erro ao buscar mecânicos: {error}")
        return jsonify({"error": "Erro interno do servidor"}), 500

@app.route("/api/defeitos", methods=["GET"])
def get_defeitos():
    """Buscar defeitos únicos"""
    try:
        ordens = supabase_request("ordens_servico", "defeito_grupo")
        defeitos = list(set(ordem.get("defeito_grupo") for ordem in ordens if ordem.get("defeito_grupo")))
        return jsonify(defeitos)
    except Exception as error:
        print(f"Erro ao buscar defeitos: {error}")
        return jsonify({"error": "Erro interno do servidor"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)

