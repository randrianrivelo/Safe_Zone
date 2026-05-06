# Base de Données — Smart Safe Zone 2035

## Technologie
PostgreSQL 14

## Fichiers
- `init.sql` → Créer toutes les tables
- `seed.sql` → Insérer les données de test
- `reset.sql` → Remettre à zéro les données

## Comment utiliser

### Dans SQL Shell (psql)
```bash
\c smart_safezone
\i database/init.sql
\i database/seed.sql