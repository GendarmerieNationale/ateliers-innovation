#!/bin/bash
# on sauvegarde la structure, mais également des données:
# - les différents badges;
# - les rôles que l'on peut avoir dans un projet
pg_dump -s \
  --clean \
  --dbname=postgresql://transformation:transformation@127.0.0.1:5432/transformation > bdd.sql \
  && pg_dump --column-inserts --data-only \
  --table=badges_liste \
  --table=roles_projet \
  --table=communautes.roles_communaute \
  --dbname=postgresql://transformation:transformation@127.0.0.1:5432/transformation >> bdd.sql \
  && exit 1
