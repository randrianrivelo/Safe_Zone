@echo off
REM Script pour initialiser la base de données MySQL
REM Assurez-vous que MySQL est installé et en cours d'exécution

echo.
echo ========================================
echo Smart Safe Zone - Database Setup
echo ========================================
echo.

REM Vérifier si mysql est disponible
mysql --version >nul 2>&1
if errorlevel 1 (
    echo ❌ MySQL Client n'est pas installé ou pas accessible
    echo Veuillez installer MySQL depuis https://dev.mysql.com/downloads/mysql/
    echo ou ajouter mysql aux variables d'environnement PATH
    pause
    exit /b 1
)

echo 📋 Configuration de la base de données
echo.
set /p MYSQL_USER="Entrez votre utilisateur MySQL (défaut: root): "
if "%MYSQL_USER%"=="" set MYSQL_USER=root

set /p MYSQL_PORT="Entrez le port MySQL (défaut: 3306): "
if "%MYSQL_PORT%"=="" set MYSQL_PORT=3306

set /p MYSQL_PASSWORD="Entrez votre mot de passe MySQL (si nécessaire, appuyez sur Entrée si aucun): "

echo.
echo 🔄 Début de l'initialisation de la base de données...
echo.

REM Créer la base et les tables
if "%MYSQL_PASSWORD%"=="" (
    mysql -u %MYSQL_USER% -h localhost -P %MYSQL_PORT% < database\init.sql
) else (
    mysql -u %MYSQL_USER% -p%MYSQL_PASSWORD% -h localhost -P %MYSQL_PORT% < database\init.sql
)

if errorlevel 1 (
    echo ❌ Erreur lors de l'initialisation de la base de données
    pause
    exit /b 1
)

echo ✅ Base de données créée avec succès
echo.
echo 🌱 Insertion des données de test...
echo.

REM Insérer les données de test
if "%MYSQL_PASSWORD%"=="" (
    mysql -u %MYSQL_USER% -h localhost -P %MYSQL_PORT% smart_safezone < database\seed.sql
) else (
    mysql -u %MYSQL_USER% -p%MYSQL_PASSWORD% -h localhost -P %MYSQL_PORT% smart_safezone < database\seed.sql
)

if errorlevel 1 (
    echo ❌ Erreur lors de l'insertion des données
    pause
    exit /b 1
)

echo ✅ Données de test insérées avec succès
echo.
echo 📝 Veuillez mettre à jour le fichier .env avec vos identifiants MySQL:
echo    - DATABASE_USER=%MYSQL_USER%
echo    - DATABASE_PASSWORD=votre_mot_de_passe
echo    - DATABASE_HOST=localhost
echo    - DATABASE_PORT=%MYSQL_PORT%
echo.
echo ✨ Configuration terminée!
echo.
pause
