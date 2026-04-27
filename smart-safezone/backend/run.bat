@echo off
REM Script pour démarrer le serveur FastAPI Smart Safe Zone

cd /d "%~dp0"
cd app

echo.
echo ========================================
echo Smart Safe Zone - Backend Server
echo ========================================
echo.

REM Vérifier si Python est installé
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python n'est pas installé ou pas dans le PATH
    echo Veuillez installer Python depuis python.org
    pause
    exit /b 1
)

REM Vérifier si pip est installé
pip --version >nul 2>&1
if errorlevel 1 (
    echo ❌ pip n'est pas installé
    pause
    exit /b 1
)

REM Installer/mettre à jour les dépendances
echo 📦 Installation des dépendances...
pip install -r ..\requirements.txt

if errorlevel 1 (
    echo ❌ Erreur lors de l'installation des dépendances
    pause
    exit /b 1
)

echo ✅ Dépendances installées avec succès
echo.
echo 🚀 Démarrage du serveur FastAPI...
echo.
echo 📝 Documentation disponible à: http://localhost:8000/docs
echo.

REM Lancer le serveur
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

pause
