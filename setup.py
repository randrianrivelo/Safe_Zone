"""
Fichier pour lancer l'application avec les commandes principales
"""
import os
import sys
import subprocess
from pathlib import Path


def setup_database():
    """Initialiser la base de données"""
    print("\n" + "="*50)
    print("📋 Installation de la base de données")
    print("="*50 + "\n")
    
    db_dir = Path(__file__).parent / "database"
    
    if sys.platform == "win32":
        setup_file = db_dir / "setup.bat"
        if setup_file.exists():
            os.startfile(str(setup_file))
        else:
            print("❌ setup.bat non trouvé")
    else:
        setup_file = db_dir / "setup.sh"
        if setup_file.exists():
            subprocess.run(["bash", str(setup_file)])
        else:
            print("❌ setup.sh non trouvé")


def install_backend_deps():
    """Installer les dépendances backend"""
    print("\n" + "="*50)
    print("📦 Installation des dépendances backend")
    print("="*50 + "\n")
    
    backend_dir = Path(__file__).parent / "backend"
    requirements = backend_dir / "requirements.txt"
    
    if requirements.exists():
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", str(requirements)])
    else:
        print("❌ requirements.txt non trouvé")


def install_frontend_deps():
    """Installer les dépendances frontend"""
    print("\n" + "="*50)
    print("📦 Installation des dépendances frontend")
    print("="*50 + "\n")
    
    frontend_dir = Path(__file__).parent / "frontend"
    os.chdir(str(frontend_dir))
    
    if sys.platform == "win32":
        subprocess.run(["npm", "install"], shell=True)
    else:
        subprocess.run(["npm", "install"])


def run_backend():
    """Lancer le serveur backend"""
    print("\n" + "="*50)
    print("🚀 Démarrage du serveur backend")
    print("="*50 + "\n")
    
    backend_dir = Path(__file__).parent / "backend"
    
    if sys.platform == "win32":
        run_file = backend_dir / "run.bat"
        if run_file.exists():
            os.startfile(str(run_file))
        else:
            print("❌ run.bat non trouvé")
    else:
        run_file = backend_dir / "run.sh"
        if run_file.exists():
            subprocess.run(["bash", str(run_file)])
        else:
            print("❌ run.sh non trouvé")


def run_frontend():
    """Lancer le serveur frontend"""
    print("\n" + "="*50)
    print("🚀 Démarrage du serveur frontend")
    print("="*50 + "\n")
    
    frontend_dir = Path(__file__).parent / "frontend"
    os.chdir(str(frontend_dir))
    
    if sys.platform == "win32":
        subprocess.run(["npm", "run", "dev"], shell=True)
    else:
        subprocess.run(["npm", "run", "dev"])


def main():
    """Menu principal"""
    print("\n")
    print("╔" + "="*48 + "╗")
    print("║" + " "*48 + "║")
    print("║" + "  Smart Safe Zone - Setup Assistant".center(48) + "║")
    print("║" + " "*48 + "║")
    print("╚" + "="*48 + "╝")
    print("\n")
    
    options = {
        "1": ("Initialiser la base de données", setup_database),
        "2": ("Installer dépendances backend", install_backend_deps),
        "3": ("Installer dépendances frontend", install_frontend_deps),
        "4": ("Lancer le backend", run_backend),
        "5": ("Lancer le frontend", run_frontend),
    }
    
    for key, (desc, _) in options.items():
        print(f"  {key} - {desc}")
    
    print(f"  0 - Quitter")
    print()
    
    choice = input("Choisissez une option (0-5): ").strip()
    
    if choice == "0":
        print("\n👋 Au revoir!\n")
        sys.exit(0)
    
    if choice in options:
        _, func = options[choice]
        func()
        input("\nAppuyez sur Entrée pour continuer...")
        main()
    else:
        print("\n❌ Option invalide\n")
        input("Appuyez sur Entrée pour continuer...")
        main()


if __name__ == "__main__":
    main()
