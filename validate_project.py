"""
Script de vérification du projet - vérifie que tout est installé correctement
"""
import os
import sys
import subprocess
from pathlib import Path


class ProjectValidator:
    """Valide la configuration du projet"""
    
    def __init__(self):
        self.project_root = Path(__file__).parent
        self.issues = []
        self.warnings = []
        self.success = []
    
    def check_python(self):
        """Vérifier que Python est correctement installé"""
        print("🐍 Vérification de Python...")
        try:
            version = sys.version_info
            if version.major >= 3 and version.minor >= 9:
                self.success.append(f"✅ Python {version.major}.{version.minor}.{version.micro}")
                return True
            else:
                self.issues.append(f"❌ Python 3.9+ requis (trouvé: {version.major}.{version.minor})")
                return False
        except Exception as e:
            self.issues.append(f"❌ Erreur Python: {e}")
            return False
    
    def check_mysql(self):
        """Vérifier que MySQL est disponible"""
        print("🗄️ Vérification de MySQL...")
        try:
            result = subprocess.run(["mysql", "--version"], capture_output=True, text=True)
            if result.returncode == 0:
                self.success.append(f"✅ MySQL installé: {result.stdout.strip()}")
                return True
            else:
                self.warnings.append("⚠️ MySQL Client introuvable - à installer manuellement")
                return False
        except FileNotFoundError:
            self.warnings.append("⚠️ MySQL Client introuvable - à installer manuellement")
            return False
    
    def check_nodejs(self):
        """Vérifier que Node.js est disponible"""
        print("📦 Vérification de Node.js...")
        try:
            result = subprocess.run(["npm", "--version"], capture_output=True, text=True)
            if result.returncode == 0:
                self.success.append(f"✅ npm installé: v{result.stdout.strip()}")
                return True
            else:
                self.warnings.append("⚠️ npm introuvable - frontend ne peut pas s'exécuter")
                return False
        except FileNotFoundError:
            self.warnings.append("⚠️ npm introuvable - frontend ne peut pas s'exécuter")
            return False
    
    def check_project_structure(self):
        """Vérifier la structure du projet"""
        print("📁 Vérification de la structure du projet...")
        
        required_dirs = [
            "smart-safezone/backend/app",
            "smart-safezone/backend/database",
            "smart-safezone/frontend/src",
        ]
        
        all_exist = True
        for dir_path in required_dirs:
            full_path = self.project_root / dir_path
            if full_path.exists():
                self.success.append(f"✅ {dir_path}")
            else:
                self.issues.append(f"❌ Dossier manquant: {dir_path}")
                all_exist = False
        
        return all_exist
    
    def check_files(self):
        """Vérifier les fichiers importants"""
        print("📄 Vérification des fichiers...")
        
        required_files = [
            "smart-safezone/backend/requirements.txt",
            "smart-safezone/backend/app/main.py",
            "smart-safezone/backend/app/config.py",
            "smart-safezone/backend/app/database.py",
            "smart-safezone/database/init.sql",
            "smart-safezone/database/seed.sql",
            "smart-safezone/frontend/package.json",
            ".env",
            "README.md",
        ]
        
        all_exist = True
        for file_path in required_files:
            full_path = self.project_root / file_path
            if full_path.exists():
                self.success.append(f"✅ {file_path}")
            else:
                self.issues.append(f"❌ Fichier manquant: {file_path}")
                all_exist = False
        
        return all_exist
    
    def check_python_packages(self):
        """Vérifier les packages Python nécessaires"""
        print("📦 Vérification des packages Python...")
        
        try:
            import fastapi
            self.success.append("✅ FastAPI installé")
        except ImportError:
            self.warnings.append("⚠️ FastAPI non installé - exécuter: pip install fastapi")
        
        try:
            import sqlalchemy
            self.success.append("✅ SQLAlchemy installé")
        except ImportError:
            self.warnings.append("⚠️ SQLAlchemy non installé - exécuter: pip install sqlalchemy")
        
        try:
            import pydantic
            self.success.append("✅ Pydantic installé")
        except ImportError:
            self.warnings.append("⚠️ Pydantic non installé - exécuter: pip install pydantic")
    
    def check_env_file(self):
        """Vérifier le fichier .env"""
        print("🔧 Vérification du fichier .env...")
        
        env_path = self.project_root / "smart-safezone/backend/.env"
        
        if env_path.exists():
            with open(env_path) as f:
                content = f.read()
                if "DATABASE_HOST=localhost" in content:
                    self.success.append("✅ Fichier .env configuré")
                    return True
                else:
                    self.warnings.append("⚠️ .env trouvé mais peut nécessiter une configuration")
                    return True
        else:
            self.issues.append("❌ Fichier .env manquant")
            return False
    
    def validate(self):
        """Exécuter toutes les vérifications"""
        print("\n")
        print("╔" + "="*50 + "╗")
        print("║" + "  Smart Safe Zone - Project Validator".center(50) + "║")
        print("╚" + "="*50 + "╝")
        print()
        
        # Exécuter les vérifications
        self.check_python()
        self.check_mysql()
        self.check_nodejs()
        self.check_project_structure()
        self.check_files()
        self.check_python_packages()
        self.check_env_file()
        
        # Afficher les résultats
        print("\n" + "="*50)
        print("📊 RÉSULTATS DE LA VALIDATION")
        print("="*50 + "\n")
        
        if self.success:
            print("✅ Succès:")
            for msg in self.success:
                print(f"   {msg}")
        
        if self.warnings:
            print("\n⚠️  Avertissements:")
            for msg in self.warnings:
                print(f"   {msg}")
        
        if self.issues:
            print("\n❌ Problèmes:")
            for msg in self.issues:
                print(f"   {msg}")
        
        print("\n" + "="*50)
        
        if not self.issues:
            print("✨ Validation réussie! Le projet est prêt.")
            print("\nProchaines étapes:")
            print("1. cd backend && run.bat (ou run.sh)")
            print("2. Dans un autre terminal: cd frontend && npm run dev")
            print("3. Ouvrir http://localhost:5173")
            return True
        else:
            print("⚠️  Des problèmes doivent être corrigés.")
            return False
        
        print("="*50 + "\n")


if __name__ == "__main__":
    validator = ProjectValidator()
    success = validator.validate()
    sys.exit(0 if success else 1)
