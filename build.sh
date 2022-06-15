#!/bin/bash
ROUGE='\033[0;31m'
BLEU='\033[0;34m'
VERT='\033[0;32m'
NC='\033[0m'
echo -e "${BLEU}----------------------------------------${NC}"
echo -e "${BLEU}!   CONSTRUCTION DE LA NOUVELLE APPLI   !${NC}"
echo -e "${BLEU}----------------------------------------${NC}"
echo -e "${BLEU}1) CLIENT${NC}"
cd client
npm run build
echo -e "${BLEU}2) SERVEUR${NC}"
cd ../server
npm run bdd
echo -e "${VERT}----------------------------------------${NC}"
echo -e "${VERT}!      NOUVELLE APPLI CONSTRUITE !     !${NC}"
echo -e "${VERT}----------------------------------------${NC}"
