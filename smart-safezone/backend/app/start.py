#!/usr/bin/env python
"""
Script de démarrage direct du serveur Smart Safe Zone
"""
import sys
import os

# Ajouter le chemin de l'app
sys.path.insert(0, os.path.dirname(__file__))

# Essayer de lancer l'application
if __name__ == "__main__":
    try:
        # Importer FastAPI
        import uvicorn
        from app.main import app
        
        print("\n" + "="*60)
        print("🚀 Smart Safe Zone - Backend Server")
        print("="*60)
        print("\n📍 Starting server on http://localhost:8000")
        print("📚 Documentation on http://localhost:8000/docs\n")
        print("="*60 + "\n")
        
        # Lancer le serveur
        uvicorn.run(
            app,
            host="0.0.0.0",
            port=8000,
            log_level="info"
        )
    except ImportError as e:
        print(f"\n❌ Import Error: {e}")
        print("\n📦 Installing required packages...")
        os.system("pip install -r requirements.txt")
        print("\n🔄 Retrying...")
        os.execvp(sys.executable, [sys.executable, __file__])
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)
