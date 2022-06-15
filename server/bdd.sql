--
-- PostgreSQL database dump
--

-- Dumped from database version 12.11 (Ubuntu 12.11-1.pgdg20.04+1)
-- Dumped by pg_dump version 12.11 (Ubuntu 12.11-1.pgdg20.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE ONLY public.projets_historique DROP CONSTRAINT projet_etranger;
ALTER TABLE ONLY public.projets_objectifs DROP CONSTRAINT projet_etranger;
ALTER TABLE ONLY public.role_dans_projet DROP CONSTRAINT projet_etranger;
ALTER TABLE ONLY public.projets_liens_entites DROP CONSTRAINT projet_etranger;
ALTER TABLE ONLY public.projets_objectifs DROP CONSTRAINT objectif_etranger;
ALTER TABLE ONLY public.role_dans_projet DROP CONSTRAINT fk_role_projet;
ALTER TABLE ONLY public.fichiers_joints DROP CONSTRAINT fichier_etranger;
ALTER TABLE ONLY adi.repertoires_resultats DROP CONSTRAINT repertoire_etranger;
ALTER TABLE ONLY adi.repertoires_liens_campagnes DROP CONSTRAINT repertoire_etranger;
ALTER TABLE ONLY adi.repertoires_resultats DROP CONSTRAINT projet_etranger;
ALTER TABLE ONLY adi.votes DROP CONSTRAINT projet_etranger;
ALTER TABLE ONLY adi.participation_campagne DROP CONSTRAINT projet_etranger;
ALTER TABLE ONLY adi.historique DROP CONSTRAINT projet_etranger;
ALTER TABLE ONLY adi.commentaires DROP CONSTRAINT projet_etranger;
ALTER TABLE ONLY adi.candidats DROP CONSTRAINT projet_etranger;
ALTER TABLE ONLY adi.repertoires_liens_campagnes DROP CONSTRAINT campagne_etranger;
DROP INDEX public.role_actif_unique;
ALTER TABLE ONLY public.votes DROP CONSTRAINT votes_pkey;
ALTER TABLE ONLY public.roles_projet DROP CONSTRAINT roles_projet_pkey;
ALTER TABLE ONLY public.role_dans_projet DROP CONSTRAINT role_dans_projet_pkey;
ALTER TABLE ONLY public.projets_visibilite DROP CONSTRAINT projets_visibilite_pkey;
ALTER TABLE ONLY public.projets_types_objectifs DROP CONSTRAINT projets_types_objectifs_pkey;
ALTER TABLE ONLY public.projets DROP CONSTRAINT projets_pkey1;
ALTER TABLE ONLY public.projets_objectifs DROP CONSTRAINT projets_objectifs_pkey;
ALTER TABLE ONLY public.projets_liens_omnibus DROP CONSTRAINT projets_liens_omnibus_pkey;
ALTER TABLE ONLY public.projets_liens_motscles DROP CONSTRAINT projets_liens_motscles_pkey;
ALTER TABLE ONLY public.projets_liens_entites DROP CONSTRAINT projets_liens_entites_pkey;
ALTER TABLE ONLY public.projets_historique DROP CONSTRAINT projets_historique_pkey;
ALTER TABLE ONLY public.partages DROP CONSTRAINT partages_pkey;
ALTER TABLE ONLY public.motscles_domaines DROP CONSTRAINT motscles_domaines_pkey;
ALTER TABLE ONLY public.mots_cles DROP CONSTRAINT mots_cles_pkey;
ALTER TABLE ONLY public.liens_projets DROP CONSTRAINT liens_projets_pkey;
ALTER TABLE ONLY public.liens_profils_sujets DROP CONSTRAINT liens_profils_sujets_pkey;
ALTER TABLE ONLY public.fichiers DROP CONSTRAINT id_unique;
ALTER TABLE ONLY public.historique DROP CONSTRAINT historique_pkey;
ALTER TABLE ONLY public.fichiers DROP CONSTRAINT fichiers_pkey;
ALTER TABLE ONLY public.fichiers_joints DROP CONSTRAINT fichiers_joints_pkey;
ALTER TABLE ONLY public.droits DROP CONSTRAINT droits_pkey;
ALTER TABLE ONLY adi.votes DROP CONSTRAINT votes_pkey;
ALTER TABLE ONLY adi.repertoires_resultats DROP CONSTRAINT repertoires_resultats_pkey;
ALTER TABLE ONLY adi.repertoires DROP CONSTRAINT repertoires_pkey;
ALTER TABLE ONLY adi.repertoires_liens_campagnes DROP CONSTRAINT repertoires_liens_campagnes_pkey;
ALTER TABLE ONLY adi.participation_campagne DROP CONSTRAINT participation_campagne_pkey;
ALTER TABLE ONLY adi.historique DROP CONSTRAINT historique_pkey;
ALTER TABLE ONLY adi.config DROP CONSTRAINT config_pkey;
ALTER TABLE ONLY adi.commentaires DROP CONSTRAINT commentaires_pkey;
ALTER TABLE ONLY adi.categories_votes DROP CONSTRAINT categories_votes_pkey;
ALTER TABLE ONLY adi.categories_campagne DROP CONSTRAINT categories_campagne_pkey;
ALTER TABLE ONLY adi.candidats DROP CONSTRAINT candidats_pkey;
ALTER TABLE ONLY adi.candidats_adp DROP CONSTRAINT candidats_adp_pkey;
ALTER TABLE ONLY adi.campagnes_votes DROP CONSTRAINT campagne_votes_pkey;
ALTER TABLE ONLY adi.avis DROP CONSTRAINT avis_pkey;
ALTER TABLE ONLY adi.ateliers_adp DROP CONSTRAINT ateliers_adp_pkey;
ALTER TABLE public.votes ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.roles_projet ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.role_dans_projet ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.projets_types_objectifs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.projets_objectifs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.projets_liens_entites ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.projets_historique ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.projets ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.profils ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.partages ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.motscles_domaines ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.mots_cles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.liens_projets ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.historique ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.fichiers_joints ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.fichiers ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.droits ALTER COLUMN id DROP DEFAULT;
ALTER TABLE adi.votes ALTER COLUMN id DROP DEFAULT;
ALTER TABLE adi.repertoires ALTER COLUMN id DROP DEFAULT;
ALTER TABLE adi.historique ALTER COLUMN id DROP DEFAULT;
ALTER TABLE adi.commentaires ALTER COLUMN id DROP DEFAULT;
ALTER TABLE adi.categories_votes ALTER COLUMN id DROP DEFAULT;
ALTER TABLE adi.campagnes_votes ALTER COLUMN id DROP DEFAULT;
ALTER TABLE adi.avis ALTER COLUMN id DROP DEFAULT;
ALTER TABLE adi.ateliers_adp ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE public.votes_id_seq;
DROP TABLE public.votes;
DROP SEQUENCE public.roles_projet_id_seq;
DROP TABLE public.roles_projet;
DROP SEQUENCE public.role_dans_projet_id_seq;
DROP TABLE public.role_dans_projet;
DROP SEQUENCE public.ref_droits_id_seq;
DROP TABLE public.ref_droits;
DROP TABLE public.projets_visibilite;
DROP SEQUENCE public.projets_types_objectifs_id_seq;
DROP TABLE public.projets_types_objectifs;
DROP SEQUENCE public.projets_objectifs_id_seq;
DROP TABLE public.projets_objectifs;
DROP TABLE public.projets_liens_omnibus;
DROP TABLE public.projets_liens_motscles;
DROP SEQUENCE public.projets_liens_entites_id_seq;
DROP TABLE public.projets_liens_entites;
DROP SEQUENCE public.projets_id_seq1;
DROP SEQUENCE public.projets_historique_id_seq;
DROP TABLE public.projets_historique;
DROP TABLE public.projets;
DROP SEQUENCE public.profils_id_seq;
DROP TABLE public.profils;
DROP SEQUENCE public.portraits_id_seq;
DROP TABLE public.portraits;
DROP SEQUENCE public.partages_id_seq;
DROP TABLE public.partages;
DROP SEQUENCE public.mots_cles_id_seq;
DROP TABLE public.mots_cles;
DROP SEQUENCE public.liens_projets_id_seq;
DROP TABLE public.liens_projets;
DROP SEQUENCE public.historique_id_seq;
DROP TABLE public.historique;
DROP SEQUENCE public.fichiers_joints_id_seq;
DROP TABLE public.fichiers_joints;
DROP SEQUENCE public.fichiers_id_seq;
DROP TABLE public.fichiers;
DROP SEQUENCE public.droits_id_seq;
DROP TABLE public.droits;
DROP SEQUENCE public.domaines_motscles_id_seq;
DROP TABLE public.motscles_domaines;
DROP SEQUENCE adi.votes_id_seq;
DROP TABLE adi.votes;
DROP TABLE adi.repertoires_resultats;
DROP TABLE adi.repertoires_liens_campagnes;
DROP SEQUENCE adi.repertoires_id_seq;
DROP TABLE adi.repertoires;
DROP TABLE adi.participation_campagne;
DROP SEQUENCE adi.historique_id_seq;
DROP TABLE adi.historique;
DROP TABLE adi.config;
DROP SEQUENCE adi.commentaires_id_seq;
DROP TABLE adi.commentaires;
DROP SEQUENCE adi.categories_votes_id_seq;
DROP TABLE adi.categories_votes;
DROP TABLE adi.categories_campagne;
DROP TABLE adi.candidats_adp;
DROP TABLE adi.candidats;
DROP SEQUENCE adi.campagne_votes_id_seq;
DROP TABLE adi.campagnes_votes;
DROP SEQUENCE adi.avis_id_seq;
DROP TABLE adi.avis;
DROP SEQUENCE adi.ateliers_adp_id_seq;
DROP TABLE adi.ateliers_adp;
DROP SCHEMA referentiels_sir;
DROP SCHEMA adi;
--
-- Name: adi; Type: SCHEMA; Schema: -; Owner: transformation
--

CREATE SCHEMA adi;


ALTER SCHEMA adi OWNER TO transformation;

CREATE SCHEMA referentiels_sir;


ALTER SCHEMA referentiels_sir OWNER TO transformation;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ateliers_adp; Type: TABLE; Schema: adi; Owner: transformation
--

CREATE TABLE adi.ateliers_adp (
    id integer NOT NULL,
    nom text
);


ALTER TABLE adi.ateliers_adp OWNER TO transformation;

--
-- Name: ateliers_adp_id_seq; Type: SEQUENCE; Schema: adi; Owner: transformation
--

CREATE SEQUENCE adi.ateliers_adp_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE adi.ateliers_adp_id_seq OWNER TO transformation;

--
-- Name: ateliers_adp_id_seq; Type: SEQUENCE OWNED BY; Schema: adi; Owner: transformation
--

ALTER SEQUENCE adi.ateliers_adp_id_seq OWNED BY adi.ateliers_adp.id;


--
-- Name: avis; Type: TABLE; Schema: adi; Owner: transformation
--

CREATE TABLE adi.avis (
    id integer NOT NULL,
    id_projet integer NOT NULL,
    code_unite text,
    type_avis text,
    explication text,
    avis boolean,
    date timestamp without time zone,
    auteur text
);


ALTER TABLE adi.avis OWNER TO transformation;

--
-- Name: avis_id_seq; Type: SEQUENCE; Schema: adi; Owner: transformation
--

CREATE SEQUENCE adi.avis_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE adi.avis_id_seq OWNER TO transformation;

--
-- Name: avis_id_seq; Type: SEQUENCE OWNED BY; Schema: adi; Owner: transformation
--

ALTER SEQUENCE adi.avis_id_seq OWNED BY adi.avis.id;


--
-- Name: campagnes_votes; Type: TABLE; Schema: adi; Owner: transformation
--

CREATE TABLE adi.campagnes_votes (
    id integer NOT NULL,
    debut timestamp without time zone,
    fin timestamp without time zone,
    description text,
    date_creation timestamp without time zone DEFAULT now(),
    titre text,
    date_publication_resultats timestamp without time zone
);


ALTER TABLE adi.campagnes_votes OWNER TO transformation;

--
-- Name: campagne_votes_id_seq; Type: SEQUENCE; Schema: adi; Owner: transformation
--

CREATE SEQUENCE adi.campagne_votes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE adi.campagne_votes_id_seq OWNER TO transformation;

--
-- Name: campagne_votes_id_seq; Type: SEQUENCE OWNED BY; Schema: adi; Owner: transformation
--

ALTER SEQUENCE adi.campagne_votes_id_seq OWNED BY adi.campagnes_votes.id;


--
-- Name: candidats; Type: TABLE; Schema: adi; Owner: transformation
--

CREATE TABLE adi.candidats (
    id_projet integer NOT NULL,
    date_inscription timestamp without time zone DEFAULT now(),
    objectif text,
    benefices text,
    statut text DEFAULT 'NOUVEAU'::text
);


ALTER TABLE adi.candidats OWNER TO transformation;

--
-- Name: candidats_adp; Type: TABLE; Schema: adi; Owner: transformation
--

CREATE TABLE adi.candidats_adp (
    id_projet integer NOT NULL,
    date_inscription timestamp without time zone,
    objectif text,
    benefices text,
    accepte boolean,
    laureat boolean,
    fdr boolean,
    place integer,
    annee_adp integer,
    id_atelier integer,
    id_categorie integer,
    motif_rejet text
);


ALTER TABLE adi.candidats_adp OWNER TO transformation;

--
-- Name: categories_campagne; Type: TABLE; Schema: adi; Owner: transformation
--

CREATE TABLE adi.categories_campagne (
    id_categorie integer NOT NULL,
    id_campagne integer NOT NULL
);


ALTER TABLE adi.categories_campagne OWNER TO transformation;

--
-- Name: categories_votes; Type: TABLE; Schema: adi; Owner: transformation
--

CREATE TABLE adi.categories_votes (
    id integer NOT NULL,
    nom text
);


ALTER TABLE adi.categories_votes OWNER TO transformation;

--
-- Name: categories_votes_id_seq; Type: SEQUENCE; Schema: adi; Owner: transformation
--

CREATE SEQUENCE adi.categories_votes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE adi.categories_votes_id_seq OWNER TO transformation;

--
-- Name: categories_votes_id_seq; Type: SEQUENCE OWNED BY; Schema: adi; Owner: transformation
--

ALTER SEQUENCE adi.categories_votes_id_seq OWNED BY adi.categories_votes.id;


--
-- Name: commentaires; Type: TABLE; Schema: adi; Owner: transformation
--

CREATE TABLE adi.commentaires (
    id integer NOT NULL,
    type text,
    contenu text,
    auteur text,
    date timestamp without time zone DEFAULT now(),
    id_projet integer
);


ALTER TABLE adi.commentaires OWNER TO transformation;

--
-- Name: commentaires_id_seq; Type: SEQUENCE; Schema: adi; Owner: transformation
--

CREATE SEQUENCE adi.commentaires_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE adi.commentaires_id_seq OWNER TO transformation;

--
-- Name: commentaires_id_seq; Type: SEQUENCE OWNED BY; Schema: adi; Owner: transformation
--

ALTER SEQUENCE adi.commentaires_id_seq OWNED BY adi.commentaires.id;


--
-- Name: config; Type: TABLE; Schema: adi; Owner: transformation
--

CREATE TABLE adi.config (
    nigend integer NOT NULL,
    popup_explications boolean DEFAULT true
);


ALTER TABLE adi.config OWNER TO transformation;

--
-- Name: TABLE config; Type: COMMENT; Schema: adi; Owner: transformation
--

COMMENT ON TABLE adi.config IS 'Pour retenir les éléments liés aux utilisateurs';


--
-- Name: historique; Type: TABLE; Schema: adi; Owner: transformation
--

CREATE TABLE adi.historique (
    id integer NOT NULL,
    id_projet integer NOT NULL,
    date timestamp without time zone DEFAULT now(),
    contenu json
);


ALTER TABLE adi.historique OWNER TO transformation;

--
-- Name: historique_id_seq; Type: SEQUENCE; Schema: adi; Owner: transformation
--

CREATE SEQUENCE adi.historique_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE adi.historique_id_seq OWNER TO transformation;

--
-- Name: historique_id_seq; Type: SEQUENCE OWNED BY; Schema: adi; Owner: transformation
--

ALTER SEQUENCE adi.historique_id_seq OWNED BY adi.historique.id;


--
-- Name: participation_campagne; Type: TABLE; Schema: adi; Owner: transformation
--

CREATE TABLE adi.participation_campagne (
    id_projet integer NOT NULL,
    id_campagne integer NOT NULL,
    id_categorie integer,
    date_ajout timestamp without time zone DEFAULT now()
);


ALTER TABLE adi.participation_campagne OWNER TO transformation;

--
-- Name: repertoires; Type: TABLE; Schema: adi; Owner: transformation
--

CREATE TABLE adi.repertoires (
    id integer NOT NULL,
    nom text,
    date_creation timestamp without time zone DEFAULT now(),
    createur text
);


ALTER TABLE adi.repertoires OWNER TO transformation;

--
-- Name: repertoires_id_seq; Type: SEQUENCE; Schema: adi; Owner: transformation
--

CREATE SEQUENCE adi.repertoires_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE adi.repertoires_id_seq OWNER TO transformation;

--
-- Name: repertoires_id_seq; Type: SEQUENCE OWNED BY; Schema: adi; Owner: transformation
--

ALTER SEQUENCE adi.repertoires_id_seq OWNED BY adi.repertoires.id;


--
-- Name: repertoires_liens_campagnes; Type: TABLE; Schema: adi; Owner: transformation
--

CREATE TABLE adi.repertoires_liens_campagnes (
    id_repertoire integer NOT NULL,
    id_campagne integer NOT NULL
);


ALTER TABLE adi.repertoires_liens_campagnes OWNER TO transformation;

--
-- Name: repertoires_resultats; Type: TABLE; Schema: adi; Owner: transformation
--

CREATE TABLE adi.repertoires_resultats (
    id_repertoire integer NOT NULL,
    id_projet integer NOT NULL,
    place integer,
    laureat boolean
);


ALTER TABLE adi.repertoires_resultats OWNER TO transformation;

--
-- Name: votes; Type: TABLE; Schema: adi; Owner: transformation
--

CREATE TABLE adi.votes (
    votant text NOT NULL,
    id_campagne integer NOT NULL,
    id_categorie integer,
    id_projet integer,
    date timestamp without time zone DEFAULT now(),
    id integer NOT NULL
);


ALTER TABLE adi.votes OWNER TO transformation;

--
-- Name: votes_id_seq; Type: SEQUENCE; Schema: adi; Owner: transformation
--

CREATE SEQUENCE adi.votes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE adi.votes_id_seq OWNER TO transformation;

--
-- Name: votes_id_seq; Type: SEQUENCE OWNED BY; Schema: adi; Owner: transformation
--

ALTER SEQUENCE adi.votes_id_seq OWNED BY adi.votes.id;

--
-- Name: motscles_domaines; Type: TABLE; Schema: public; Owner: transformation
--

CREATE TABLE public.motscles_domaines (
    id integer NOT NULL,
    id_mot_cle integer NOT NULL,
    actif boolean,
    domaine text NOT NULL
);


ALTER TABLE public.motscles_domaines OWNER TO transformation;

--
-- Name: domaines_motscles_id_seq; Type: SEQUENCE; Schema: public; Owner: transformation
--

CREATE SEQUENCE public.domaines_motscles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.domaines_motscles_id_seq OWNER TO transformation;

--
-- Name: domaines_motscles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: transformation
--

ALTER SEQUENCE public.domaines_motscles_id_seq OWNED BY public.motscles_domaines.id;

--
-- Name: droits; Type: TABLE; Schema: public; Owner: transformation
--

CREATE TABLE public.droits (
    id integer NOT NULL,
    type text,
    identifiant text,
    id_droit text,
    contenu json,
    action text,
    autorisation boolean DEFAULT false,
    "precision" json DEFAULT '{}'::json
);


ALTER TABLE public.droits OWNER TO transformation;

--
-- Name: droits_id_seq; Type: SEQUENCE; Schema: public; Owner: transformation
--

CREATE SEQUENCE public.droits_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.droits_id_seq OWNER TO transformation;

--
-- Name: droits_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: transformation
--

ALTER SEQUENCE public.droits_id_seq OWNED BY public.droits.id;


--
-- Name: fichiers; Type: TABLE; Schema: public; Owner: transformation
--

CREATE TABLE public.fichiers (
    uuid uuid NOT NULL,
    nom text,
    date timestamp without time zone DEFAULT now(),
    statut text,
    id integer NOT NULL,
    type text,
    taille integer,
    profils integer[],
    sujetsinteret integer[],
    motscles integer[],
    projets integer[],
    proprietaire text
);


ALTER TABLE public.fichiers OWNER TO transformation;

--
-- Name: fichiers_id_seq; Type: SEQUENCE; Schema: public; Owner: transformation
--

CREATE SEQUENCE public.fichiers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.fichiers_id_seq OWNER TO transformation;

--
-- Name: fichiers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: transformation
--

ALTER SEQUENCE public.fichiers_id_seq OWNED BY public.fichiers.id;


--
-- Name: fichiers_joints; Type: TABLE; Schema: public; Owner: transformation
--

CREATE TABLE public.fichiers_joints (
    id integer NOT NULL,
    nom_table text NOT NULL,
    id_dans_table integer NOT NULL,
    id_fichier integer NOT NULL,
    description_fichier text,
    auteur text,
    date timestamp without time zone DEFAULT now(),
    "precision" text
);


ALTER TABLE public.fichiers_joints OWNER TO transformation;

--
-- Name: fichiers_joints_id_seq; Type: SEQUENCE; Schema: public; Owner: transformation
--

CREATE SEQUENCE public.fichiers_joints_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.fichiers_joints_id_seq OWNER TO transformation;

--
-- Name: fichiers_joints_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: transformation
--

ALTER SEQUENCE public.fichiers_joints_id_seq OWNED BY public.fichiers_joints.id;


--
-- Name: historique; Type: TABLE; Schema: public; Owner: transformation
--

CREATE TABLE public.historique (
    id integer NOT NULL,
    nom_table text,
    nom_colonne text,
    nigend integer,
    horaire timestamp without time zone
);


ALTER TABLE public.historique OWNER TO transformation;

--
-- Name: historique_id_seq; Type: SEQUENCE; Schema: public; Owner: transformation
--

CREATE SEQUENCE public.historique_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.historique_id_seq OWNER TO transformation;

--
-- Name: historique_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: transformation
--

ALTER SEQUENCE public.historique_id_seq OWNED BY public.historique.id;


--
-- Name: liens_projets; Type: TABLE; Schema: public; Owner: transformation
--

CREATE TABLE public.liens_projets (
    id integer NOT NULL,
    id_projet1 integer,
    id_projet2 integer,
    type_lien text,
    etat_lien text
);


ALTER TABLE public.liens_projets OWNER TO transformation;

--
-- Name: liens_projets_id_seq; Type: SEQUENCE; Schema: public; Owner: transformation
--

CREATE SEQUENCE public.liens_projets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.liens_projets_id_seq OWNER TO transformation;

--
-- Name: liens_projets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: transformation
--

ALTER SEQUENCE public.liens_projets_id_seq OWNED BY public.liens_projets.id;

--
-- Name: mots_cles; Type: TABLE; Schema: public; Owner: transformation
--

CREATE TABLE public.mots_cles (
    id integer NOT NULL,
    code_mot text,
    mot text NOT NULL
);


ALTER TABLE public.mots_cles OWNER TO transformation;

--
-- Name: mots_cles_id_seq; Type: SEQUENCE; Schema: public; Owner: transformation
--

CREATE SEQUENCE public.mots_cles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.mots_cles_id_seq OWNER TO transformation;

--
-- Name: mots_cles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: transformation
--

ALTER SEQUENCE public.mots_cles_id_seq OWNED BY public.mots_cles.id;


--
-- Name: partages; Type: TABLE; Schema: public; Owner: transformation
--

CREATE TABLE public.partages (
    id integer NOT NULL,
    auteur text,
    id_partage integer,
    type text,
    date timestamp without time zone DEFAULT now(),
    commentaire text
);


ALTER TABLE public.partages OWNER TO transformation;

--
-- Name: partages_id_seq; Type: SEQUENCE; Schema: public; Owner: transformation
--

CREATE SEQUENCE public.partages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.partages_id_seq OWNER TO transformation;

--
-- Name: partages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: transformation
--

ALTER SEQUENCE public.partages_id_seq OWNED BY public.partages.id;


--
-- Name: profil_perso; Type: TABLE; Schema: public; Owner: transformation
--

CREATE TABLE public.profil_perso (
    nigend text NOT NULL,
    id_profil integer,
    sujets_interet integer[],
    premiere_connexion timestamp without time zone,
    derniere_connexion timestamp without time zone,
    notifications boolean DEFAULT false
);


ALTER TABLE public.profil_perso OWNER TO transformation;

--
-- Name: projets; Type: TABLE; Schema: public; Owner: transformation
--

CREATE TABLE public.projets (
    id integer NOT NULL,
    nom text,
    date_creation timestamp without time zone DEFAULT now(),
    presentation text DEFAULT ''::text NOT NULL,
    visibilite text DEFAULT 'PUBLIC'::text,
    benefices text DEFAULT ''::text NOT NULL,
    origine text DEFAULT ''::text NOT NULL,
    communication text DEFAULT ''::text NOT NULL,
    objectifs text DEFAULT ''::text,
    budget text DEFAULT ''::text
);


ALTER TABLE public.projets OWNER TO transformation;

--
-- Name: COLUMN projets.visibilite; Type: COMMENT; Schema: public; Owner: transformation
--

COMMENT ON COLUMN public.projets.visibilite IS 'Pour savoir si un projet est public, privé ou semi-privé';


--
-- Name: projets_historique; Type: TABLE; Schema: public; Owner: transformation
--

CREATE TABLE public.projets_historique (
    id integer NOT NULL,
    id_projet integer,
    date timestamp without time zone,
    description text,
    auteur text,
    statut text,
    type text
);


ALTER TABLE public.projets_historique OWNER TO transformation;

--
-- Name: projets_historique_id_seq; Type: SEQUENCE; Schema: public; Owner: transformation
--

CREATE SEQUENCE public.projets_historique_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.projets_historique_id_seq OWNER TO transformation;

--
-- Name: projets_historique_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: transformation
--

ALTER SEQUENCE public.projets_historique_id_seq OWNED BY public.projets_historique.id;


--
-- Name: projets_id_seq1; Type: SEQUENCE; Schema: public; Owner: transformation
--

CREATE SEQUENCE public.projets_id_seq1
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.projets_id_seq1 OWNER TO transformation;

--
-- Name: projets_id_seq1; Type: SEQUENCE OWNED BY; Schema: public; Owner: transformation
--

ALTER SEQUENCE public.projets_id_seq1 OWNED BY public.projets.id;


--
-- Name: projets_liens_entites; Type: TABLE; Schema: public; Owner: transformation
--

CREATE TABLE public.projets_liens_entites (
    id_projet integer NOT NULL,
    type_entite text NOT NULL,
    id_entite integer NOT NULL,
    description text,
    type_partenariat text DEFAULT 'autre'::text NOT NULL,
    statut text DEFAULT 'REALISE'::text,
    id integer NOT NULL
);


ALTER TABLE public.projets_liens_entites OWNER TO transformation;

--
-- Name: projets_liens_entites_id_seq; Type: SEQUENCE; Schema: public; Owner: transformation
--

CREATE SEQUENCE public.projets_liens_entites_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.projets_liens_entites_id_seq OWNER TO transformation;

--
-- Name: projets_liens_entites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: transformation
--

ALTER SEQUENCE public.projets_liens_entites_id_seq OWNED BY public.projets_liens_entites.id;


--
-- Name: projets_liens_motscles; Type: TABLE; Schema: public; Owner: transformation
--

CREATE TABLE public.projets_liens_motscles (
    id_projet integer NOT NULL,
    id_motcle integer NOT NULL
);


ALTER TABLE public.projets_liens_motscles OWNER TO transformation;

--
-- Name: projets_liens_omnibus; Type: TABLE; Schema: public; Owner: transformation
--

CREATE TABLE public.projets_liens_omnibus (
    id_projet integer NOT NULL,
    id_omnibus integer NOT NULL,
    type text NOT NULL
);


ALTER TABLE public.projets_liens_omnibus OWNER TO transformation;

--
-- Name: projets_objectifs; Type: TABLE; Schema: public; Owner: transformation
--

CREATE TABLE public.projets_objectifs (
    id integer NOT NULL,
    id_projet integer NOT NULL,
    description text,
    evaluation text,
    id_objectif integer,
    autre_objectif text
);


ALTER TABLE public.projets_objectifs OWNER TO transformation;

--
-- Name: projets_objectifs_id_seq; Type: SEQUENCE; Schema: public; Owner: transformation
--

CREATE SEQUENCE public.projets_objectifs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.projets_objectifs_id_seq OWNER TO transformation;

--
-- Name: projets_objectifs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: transformation
--

ALTER SEQUENCE public.projets_objectifs_id_seq OWNED BY public.projets_objectifs.id;


--
-- Name: projets_types_objectifs; Type: TABLE; Schema: public; Owner: transformation
--

CREATE TABLE public.projets_types_objectifs (
    id integer NOT NULL,
    nom text,
    actif boolean DEFAULT true
);


ALTER TABLE public.projets_types_objectifs OWNER TO transformation;

--
-- Name: projets_types_objectifs_id_seq; Type: SEQUENCE; Schema: public; Owner: transformation
--

CREATE SEQUENCE public.projets_types_objectifs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.projets_types_objectifs_id_seq OWNER TO transformation;

--
-- Name: projets_types_objectifs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: transformation
--

ALTER SEQUENCE public.projets_types_objectifs_id_seq OWNED BY public.projets_types_objectifs.id;


--
-- Name: projets_visibilite; Type: TABLE; Schema: public; Owner: transformation
--

CREATE TABLE public.projets_visibilite (
    id_projet integer NOT NULL,
    type_visibilite text NOT NULL,
    identifiant text NOT NULL,
    "precision" text NOT NULL,
    date_creation timestamp without time zone DEFAULT now(),
    date_traitement timestamp without time zone
);


ALTER TABLE public.projets_visibilite OWNER TO transformation;

--
-- Name: COLUMN projets_visibilite.type_visibilite; Type: COMMENT; Schema: public; Owner: transformation
--

COMMENT ON COLUMN public.projets_visibilite.type_visibilite IS 'S''agit-il d''un code unité ou d''un NIGEND?';


--
-- Name: COLUMN projets_visibilite.identifiant; Type: COMMENT; Schema: public; Owner: transformation
--

COMMENT ON COLUMN public.projets_visibilite.identifiant IS 'Code unité ou NIGEND';


--
-- Name: COLUMN projets_visibilite."precision"; Type: COMMENT; Schema: public; Owner: transformation
--

COMMENT ON COLUMN public.projets_visibilite."precision" IS 'S''agit-il d''une demande en cours, autorisée, refusée ou donnée d''office?';

--
-- Name: ref_droits; Type: TABLE; Schema: public; Owner: transformation
--

CREATE TABLE public.ref_droits (
    id integer NOT NULL,
    nom text,
    "precision" text
);


ALTER TABLE public.ref_droits OWNER TO transformation;

--
-- Name: ref_droits_id_seq; Type: SEQUENCE; Schema: public; Owner: transformation
--

CREATE SEQUENCE public.ref_droits_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ref_droits_id_seq OWNER TO transformation;

--
-- Name: ref_droits_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: transformation
--

ALTER SEQUENCE public.ref_droits_id_seq OWNED BY public.ref_droits.id;


--
-- Name: role_dans_projet; Type: TABLE; Schema: public; Owner: transformation
--

CREATE TABLE public.role_dans_projet (
    id integer NOT NULL,
    personne text,
    unite text,
    id_role integer,
    date_debut timestamp without time zone DEFAULT now(),
    id_projet integer,
    date_fin timestamp without time zone,
    precision_autre text,
    debut_par text,
    fin_par text
);


ALTER TABLE public.role_dans_projet OWNER TO transformation;

--
-- Name: TABLE role_dans_projet; Type: COMMENT; Schema: public; Owner: transformation
--

COMMENT ON TABLE public.role_dans_projet IS 'Ensemble des rôles des membres d''un projet, avec historisation';


--
-- Name: role_dans_projet_id_seq; Type: SEQUENCE; Schema: public; Owner: transformation
--

CREATE SEQUENCE public.role_dans_projet_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.role_dans_projet_id_seq OWNER TO transformation;

--
-- Name: role_dans_projet_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: transformation
--

ALTER SEQUENCE public.role_dans_projet_id_seq OWNED BY public.role_dans_projet.id;


--
-- Name: roles_projet; Type: TABLE; Schema: public; Owner: transformation
--

CREATE TABLE public.roles_projet (
    id integer NOT NULL,
    nom text,
    actif boolean DEFAULT true
);


ALTER TABLE public.roles_projet OWNER TO transformation;

--
-- Name: roles_projet_id_seq; Type: SEQUENCE; Schema: public; Owner: transformation
--

CREATE SEQUENCE public.roles_projet_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.roles_projet_id_seq OWNER TO transformation;

--
-- Name: roles_projet_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: transformation
--

ALTER SEQUENCE public.roles_projet_id_seq OWNED BY public.roles_projet.id;

--
-- Name: votes; Type: TABLE; Schema: public; Owner: transformation
--

CREATE TABLE public.votes (
    id integer NOT NULL,
    type text NOT NULL,
    idvote integer NOT NULL,
    vote text,
    date timestamp without time zone DEFAULT now(),
    votant text NOT NULL
);


ALTER TABLE public.votes OWNER TO transformation;

--
-- Name: votes_id_seq; Type: SEQUENCE; Schema: public; Owner: transformation
--

CREATE SEQUENCE public.votes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.votes_id_seq OWNER TO transformation;

--
-- Name: votes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: transformation
--

ALTER SEQUENCE public.votes_id_seq OWNED BY public.votes.id;

--
-- Name: photos; Type: TABLE; Schema: referentiels_sir; Owner: transformation
--

CREATE TABLE referentiels_sir.photos (
    nigend text NOT NULL,
    photo text DEFAULT 1,
    date_maj timestamp without time zone,
    empreinte text
);


ALTER TABLE referentiels_sir.photos OWNER TO transformation;

--
-- Name: ateliers_adp id; Type: DEFAULT; Schema: adi; Owner: transformation
--

ALTER TABLE ONLY adi.ateliers_adp ALTER COLUMN id SET DEFAULT nextval('adi.ateliers_adp_id_seq'::regclass);


--
-- Name: avis id; Type: DEFAULT; Schema: adi; Owner: transformation
--

ALTER TABLE ONLY adi.avis ALTER COLUMN id SET DEFAULT nextval('adi.avis_id_seq'::regclass);


--
-- Name: campagnes_votes id; Type: DEFAULT; Schema: adi; Owner: transformation
--

ALTER TABLE ONLY adi.campagnes_votes ALTER COLUMN id SET DEFAULT nextval('adi.campagne_votes_id_seq'::regclass);


--
-- Name: categories_votes id; Type: DEFAULT; Schema: adi; Owner: transformation
--

ALTER TABLE ONLY adi.categories_votes ALTER COLUMN id SET DEFAULT nextval('adi.categories_votes_id_seq'::regclass);


--
-- Name: commentaires id; Type: DEFAULT; Schema: adi; Owner: transformation
--

ALTER TABLE ONLY adi.commentaires ALTER COLUMN id SET DEFAULT nextval('adi.commentaires_id_seq'::regclass);


--
-- Name: historique id; Type: DEFAULT; Schema: adi; Owner: transformation
--

ALTER TABLE ONLY adi.historique ALTER COLUMN id SET DEFAULT nextval('adi.historique_id_seq'::regclass);


--
-- Name: repertoires id; Type: DEFAULT; Schema: adi; Owner: transformation
--

ALTER TABLE ONLY adi.repertoires ALTER COLUMN id SET DEFAULT nextval('adi.repertoires_id_seq'::regclass);


--
-- Name: votes id; Type: DEFAULT; Schema: adi; Owner: transformation
--

ALTER TABLE ONLY adi.votes ALTER COLUMN id SET DEFAULT nextval('adi.votes_id_seq'::regclass);

--
-- Name: droits id; Type: DEFAULT; Schema: public; Owner: transformation
--

ALTER TABLE ONLY public.droits ALTER COLUMN id SET DEFAULT nextval('public.droits_id_seq'::regclass);

--
-- Name: fichiers id; Type: DEFAULT; Schema: public; Owner: transformation
--

ALTER TABLE ONLY public.fichiers ALTER COLUMN id SET DEFAULT nextval('public.fichiers_id_seq'::regclass);


--
-- Name: fichiers_joints id; Type: DEFAULT; Schema: public; Owner: transformation
--

ALTER TABLE ONLY public.fichiers_joints ALTER COLUMN id SET DEFAULT nextval('public.fichiers_joints_id_seq'::regclass);

--
-- Name: liens_projets id; Type: DEFAULT; Schema: public; Owner: transformation
--

ALTER TABLE ONLY public.liens_projets ALTER COLUMN id SET DEFAULT nextval('public.liens_projets_id_seq'::regclass);

--
-- Name: mots_cles id; Type: DEFAULT; Schema: public; Owner: transformation
--

ALTER TABLE ONLY public.mots_cles ALTER COLUMN id SET DEFAULT nextval('public.mots_cles_id_seq'::regclass);


--
-- Name: motscles_domaines id; Type: DEFAULT; Schema: public; Owner: transformation
--

ALTER TABLE ONLY public.motscles_domaines ALTER COLUMN id SET DEFAULT nextval('public.domaines_motscles_id_seq'::regclass);


--
-- Name: partages id; Type: DEFAULT; Schema: public; Owner: transformation
--

ALTER TABLE ONLY public.partages ALTER COLUMN id SET DEFAULT nextval('public.partages_id_seq'::regclass);

--
-- Name: projets id; Type: DEFAULT; Schema: public; Owner: transformation
--

ALTER TABLE ONLY public.projets ALTER COLUMN id SET DEFAULT nextval('public.projets_id_seq1'::regclass);


--
-- Name: projets_historique id; Type: DEFAULT; Schema: public; Owner: transformation
--

ALTER TABLE ONLY public.projets_historique ALTER COLUMN id SET DEFAULT nextval('public.projets_historique_id_seq'::regclass);


--
-- Name: projets_liens_entites id; Type: DEFAULT; Schema: public; Owner: transformation
--

ALTER TABLE ONLY public.projets_liens_entites ALTER COLUMN id SET DEFAULT nextval('public.projets_liens_entites_id_seq'::regclass);


--
-- Name: projets_objectifs id; Type: DEFAULT; Schema: public; Owner: transformation
--

ALTER TABLE ONLY public.projets_objectifs ALTER COLUMN id SET DEFAULT nextval('public.projets_objectifs_id_seq'::regclass);


--
-- Name: projets_types_objectifs id; Type: DEFAULT; Schema: public; Owner: transformation
--

ALTER TABLE ONLY public.projets_types_objectifs ALTER COLUMN id SET DEFAULT nextval('public.projets_types_objectifs_id_seq'::regclass);

--
-- Name: role_dans_projet id; Type: DEFAULT; Schema: public; Owner: transformation
--

ALTER TABLE ONLY public.role_dans_projet ALTER COLUMN id SET DEFAULT nextval('public.role_dans_projet_id_seq'::regclass);


--
-- Name: roles_projet id; Type: DEFAULT; Schema: public; Owner: transformation
--

ALTER TABLE ONLY public.roles_projet ALTER COLUMN id SET DEFAULT nextval('public.roles_projet_id_seq'::regclass);

--
-- Name: votes id; Type: DEFAULT; Schema: public; Owner: transformation
--

ALTER TABLE ONLY public.votes ALTER COLUMN id SET DEFAULT nextval('public.votes_id_seq'::regclass);

--
-- Name: ateliers_adp ateliers_adp_pkey; Type: CONSTRAINT; Schema: adi; Owner: transformation
--

ALTER TABLE ONLY adi.ateliers_adp
    ADD CONSTRAINT ateliers_adp_pkey PRIMARY KEY (id);


--
-- Name: avis avis_pkey; Type: CONSTRAINT; Schema: adi; Owner: transformation
--

ALTER TABLE ONLY adi.avis
    ADD CONSTRAINT avis_pkey PRIMARY KEY (id);


--
-- Name: campagnes_votes campagne_votes_pkey; Type: CONSTRAINT; Schema: adi; Owner: transformation
--

ALTER TABLE ONLY adi.campagnes_votes
    ADD CONSTRAINT campagne_votes_pkey PRIMARY KEY (id);


--
-- Name: candidats_adp candidats_adp_pkey; Type: CONSTRAINT; Schema: adi; Owner: transformation
--

ALTER TABLE ONLY adi.candidats_adp
    ADD CONSTRAINT candidats_adp_pkey PRIMARY KEY (id_projet);


--
-- Name: candidats candidats_pkey; Type: CONSTRAINT; Schema: adi; Owner: transformation
--

ALTER TABLE ONLY adi.candidats
    ADD CONSTRAINT candidats_pkey PRIMARY KEY (id_projet);


--
-- Name: categories_campagne categories_campagne_pkey; Type: CONSTRAINT; Schema: adi; Owner: transformation
--

ALTER TABLE ONLY adi.categories_campagne
    ADD CONSTRAINT categories_campagne_pkey PRIMARY KEY (id_categorie, id_campagne);


--
-- Name: categories_votes categories_votes_pkey; Type: CONSTRAINT; Schema: adi; Owner: transformation
--

ALTER TABLE ONLY adi.categories_votes
    ADD CONSTRAINT categories_votes_pkey PRIMARY KEY (id);


--
-- Name: commentaires commentaires_pkey; Type: CONSTRAINT; Schema: adi; Owner: transformation
--

ALTER TABLE ONLY adi.commentaires
    ADD CONSTRAINT commentaires_pkey PRIMARY KEY (id);


--
-- Name: config config_pkey; Type: CONSTRAINT; Schema: adi; Owner: transformation
--

ALTER TABLE ONLY adi.config
    ADD CONSTRAINT config_pkey PRIMARY KEY (nigend);


--
-- Name: historique historique_pkey; Type: CONSTRAINT; Schema: adi; Owner: transformation
--

ALTER TABLE ONLY adi.historique
    ADD CONSTRAINT historique_pkey PRIMARY KEY (id);


--
-- Name: participation_campagne participation_campagne_pkey; Type: CONSTRAINT; Schema: adi; Owner: transformation
--

ALTER TABLE ONLY adi.participation_campagne
    ADD CONSTRAINT participation_campagne_pkey PRIMARY KEY (id_projet, id_campagne);


--
-- Name: repertoires_liens_campagnes repertoires_liens_campagnes_pkey; Type: CONSTRAINT; Schema: adi; Owner: transformation
--

ALTER TABLE ONLY adi.repertoires_liens_campagnes
    ADD CONSTRAINT repertoires_liens_campagnes_pkey PRIMARY KEY (id_repertoire, id_campagne);


--
-- Name: repertoires repertoires_pkey; Type: CONSTRAINT; Schema: adi; Owner: transformation
--

ALTER TABLE ONLY adi.repertoires
    ADD CONSTRAINT repertoires_pkey PRIMARY KEY (id);


--
-- Name: repertoires_resultats repertoires_resultats_pkey; Type: CONSTRAINT; Schema: adi; Owner: transformation
--

ALTER TABLE ONLY adi.repertoires_resultats
    ADD CONSTRAINT repertoires_resultats_pkey PRIMARY KEY (id_repertoire, id_projet);


--
-- Name: votes votes_pkey; Type: CONSTRAINT; Schema: adi; Owner: transformation
--

ALTER TABLE ONLY adi.votes
    ADD CONSTRAINT votes_pkey PRIMARY KEY (id);

--
-- Name: droits droits_pkey; Type: CONSTRAINT; Schema: public; Owner: transformation
--

ALTER TABLE ONLY public.droits
    ADD CONSTRAINT droits_pkey PRIMARY KEY (id);

--
-- Name: fichiers_joints fichiers_joints_pkey; Type: CONSTRAINT; Schema: public; Owner: transformation
--

ALTER TABLE ONLY public.fichiers_joints
    ADD CONSTRAINT fichiers_joints_pkey PRIMARY KEY (nom_table, id_dans_table, id_fichier);


--
-- Name: fichiers fichiers_pkey; Type: CONSTRAINT; Schema: public; Owner: transformation
--

ALTER TABLE ONLY public.fichiers
    ADD CONSTRAINT fichiers_pkey PRIMARY KEY (uuid);


--
-- Name: fichiers id_unique; Type: CONSTRAINT; Schema: public; Owner: transformation
--

ALTER TABLE ONLY public.fichiers
    ADD CONSTRAINT id_unique UNIQUE (id);


--
-- Name: liens_projets liens_projets_pkey; Type: CONSTRAINT; Schema: public; Owner: transformation
--

ALTER TABLE ONLY public.liens_projets
    ADD CONSTRAINT liens_projets_pkey PRIMARY KEY (id);

--
-- Name: mots_cles mots_cles_pkey; Type: CONSTRAINT; Schema: public; Owner: transformation
--

ALTER TABLE ONLY public.mots_cles
    ADD CONSTRAINT mots_cles_pkey PRIMARY KEY (mot);


--
-- Name: motscles_domaines motscles_domaines_pkey; Type: CONSTRAINT; Schema: public; Owner: transformation
--

ALTER TABLE ONLY public.motscles_domaines
    ADD CONSTRAINT motscles_domaines_pkey PRIMARY KEY (id_mot_cle, domaine);


--
-- Name: partages partages_pkey; Type: CONSTRAINT; Schema: public; Owner: transformation
--

ALTER TABLE ONLY public.partages
    ADD CONSTRAINT partages_pkey PRIMARY KEY (id);

--
-- Name: profils profils_pkey; Type: CONSTRAINT; Schema: public; Owner: transformation
--

ALTER TABLE ONLY public.profils
    ADD CONSTRAINT profils_pkey PRIMARY KEY (id);


--
-- Name: projets_historique projets_historique_pkey; Type: CONSTRAINT; Schema: public; Owner: transformation
--

ALTER TABLE ONLY public.projets_historique
    ADD CONSTRAINT projets_historique_pkey PRIMARY KEY (id);


--
-- Name: projets_liens_entites projets_liens_entites_pkey; Type: CONSTRAINT; Schema: public; Owner: transformation
--

ALTER TABLE ONLY public.projets_liens_entites
    ADD CONSTRAINT projets_liens_entites_pkey PRIMARY KEY (id);


--
-- Name: projets_liens_motscles projets_liens_motscles_pkey; Type: CONSTRAINT; Schema: public; Owner: transformation
--

ALTER TABLE ONLY public.projets_liens_motscles
    ADD CONSTRAINT projets_liens_motscles_pkey PRIMARY KEY (id_projet, id_motcle);


--
-- Name: projets_liens_omnibus projets_liens_omnibus_pkey; Type: CONSTRAINT; Schema: public; Owner: transformation
--

ALTER TABLE ONLY public.projets_liens_omnibus
    ADD CONSTRAINT projets_liens_omnibus_pkey PRIMARY KEY (id_projet, type, id_omnibus);


--
-- Name: projets_objectifs projets_objectifs_pkey; Type: CONSTRAINT; Schema: public; Owner: transformation
--

ALTER TABLE ONLY public.projets_objectifs
    ADD CONSTRAINT projets_objectifs_pkey PRIMARY KEY (id);


--
-- Name: projets projets_pkey1; Type: CONSTRAINT; Schema: public; Owner: transformation
--

ALTER TABLE ONLY public.projets
    ADD CONSTRAINT projets_pkey1 PRIMARY KEY (id);


--
-- Name: projets_types_objectifs projets_types_objectifs_pkey; Type: CONSTRAINT; Schema: public; Owner: transformation
--

ALTER TABLE ONLY public.projets_types_objectifs
    ADD CONSTRAINT projets_types_objectifs_pkey PRIMARY KEY (id);


--
-- Name: projets_visibilite projets_visibilite_pkey; Type: CONSTRAINT; Schema: public; Owner: transformation
--

ALTER TABLE ONLY public.projets_visibilite
    ADD CONSTRAINT projets_visibilite_pkey PRIMARY KEY (id_projet, type_visibilite, identifiant, "precision");

--
-- Name: role_dans_projet role_dans_projet_pkey; Type: CONSTRAINT; Schema: public; Owner: transformation
--

ALTER TABLE ONLY public.role_dans_projet
    ADD CONSTRAINT role_dans_projet_pkey PRIMARY KEY (id);


--
-- Name: roles_projet roles_projet_pkey; Type: CONSTRAINT; Schema: public; Owner: transformation
--

ALTER TABLE ONLY public.roles_projet
    ADD CONSTRAINT roles_projet_pkey PRIMARY KEY (id);

--
-- Name: votes votes_pkey; Type: CONSTRAINT; Schema: public; Owner: transformation
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_pkey PRIMARY KEY (type, idvote, votant);


--
-- Name: photos photos_fir_pkey; Type: CONSTRAINT; Schema: referentiels_sir; Owner: transformation
--

ALTER TABLE ONLY referentiels_sir.photos
    ADD CONSTRAINT photos_fir_pkey PRIMARY KEY (nigend);


--
-- Name: role_actif_unique; Type: INDEX; Schema: public; Owner: transformation
--

CREATE UNIQUE INDEX role_actif_unique ON public.role_dans_projet USING btree (personne, id_role, id_projet) WHERE (date_fin IS NULL);


--
-- Name: repertoires_liens_campagnes campagne_etranger; Type: FK CONSTRAINT; Schema: adi; Owner: transformation
--

ALTER TABLE ONLY adi.repertoires_liens_campagnes
    ADD CONSTRAINT campagne_etranger FOREIGN KEY (id_campagne) REFERENCES adi.campagnes_votes(id) ON DELETE CASCADE;


--
-- Name: candidats projet_etranger; Type: FK CONSTRAINT; Schema: adi; Owner: transformation
--

ALTER TABLE ONLY adi.candidats
    ADD CONSTRAINT projet_etranger FOREIGN KEY (id_projet) REFERENCES public.projets(id) ON DELETE CASCADE;


--
-- Name: commentaires projet_etranger; Type: FK CONSTRAINT; Schema: adi; Owner: transformation
--

ALTER TABLE ONLY adi.commentaires
    ADD CONSTRAINT projet_etranger FOREIGN KEY (id_projet) REFERENCES public.projets(id) ON DELETE CASCADE;


--
-- Name: historique projet_etranger; Type: FK CONSTRAINT; Schema: adi; Owner: transformation
--

ALTER TABLE ONLY adi.historique
    ADD CONSTRAINT projet_etranger FOREIGN KEY (id_projet) REFERENCES public.projets(id) ON DELETE CASCADE;


--
-- Name: participation_campagne projet_etranger; Type: FK CONSTRAINT; Schema: adi; Owner: transformation
--

ALTER TABLE ONLY adi.participation_campagne
    ADD CONSTRAINT projet_etranger FOREIGN KEY (id_projet) REFERENCES public.projets(id) ON DELETE CASCADE;


--
-- Name: votes projet_etranger; Type: FK CONSTRAINT; Schema: adi; Owner: transformation
--

ALTER TABLE ONLY adi.votes
    ADD CONSTRAINT projet_etranger FOREIGN KEY (id_projet) REFERENCES public.projets(id) ON DELETE CASCADE;


--
-- Name: repertoires_resultats projet_etranger; Type: FK CONSTRAINT; Schema: adi; Owner: transformation
--

ALTER TABLE ONLY adi.repertoires_resultats
    ADD CONSTRAINT projet_etranger FOREIGN KEY (id_projet) REFERENCES public.projets(id) ON DELETE CASCADE;


--
-- Name: repertoires_liens_campagnes repertoire_etranger; Type: FK CONSTRAINT; Schema: adi; Owner: transformation
--

ALTER TABLE ONLY adi.repertoires_liens_campagnes
    ADD CONSTRAINT repertoire_etranger FOREIGN KEY (id_repertoire) REFERENCES adi.repertoires(id) ON DELETE CASCADE;


--
-- Name: repertoires_resultats repertoire_etranger; Type: FK CONSTRAINT; Schema: adi; Owner: transformation
--

ALTER TABLE ONLY adi.repertoires_resultats
    ADD CONSTRAINT repertoire_etranger FOREIGN KEY (id_repertoire) REFERENCES adi.repertoires(id) ON DELETE CASCADE;

--
-- Name: fichiers_joints fichier_etranger; Type: FK CONSTRAINT; Schema: public; Owner: transformation
--

ALTER TABLE ONLY public.fichiers_joints
    ADD CONSTRAINT fichier_etranger FOREIGN KEY (id_fichier) REFERENCES public.fichiers(id) ON DELETE CASCADE;


--
-- Name: role_dans_projet fk_role_projet; Type: FK CONSTRAINT; Schema: public; Owner: transformation
--

ALTER TABLE ONLY public.role_dans_projet
    ADD CONSTRAINT fk_role_projet FOREIGN KEY (id_role) REFERENCES public.roles_projet(id);


--
-- Name: projets_objectifs objectif_etranger; Type: FK CONSTRAINT; Schema: public; Owner: transformation
--

ALTER TABLE ONLY public.projets_objectifs
    ADD CONSTRAINT objectif_etranger FOREIGN KEY (id_objectif) REFERENCES public.projets_types_objectifs(id) ON DELETE SET NULL;


--
-- Name: projets_liens_entites projet_etranger; Type: FK CONSTRAINT; Schema: public; Owner: transformation
--

ALTER TABLE ONLY public.projets_liens_entites
    ADD CONSTRAINT projet_etranger FOREIGN KEY (id_projet) REFERENCES public.projets(id) ON DELETE CASCADE;


--
-- Name: role_dans_projet projet_etranger; Type: FK CONSTRAINT; Schema: public; Owner: transformation
--

ALTER TABLE ONLY public.role_dans_projet
    ADD CONSTRAINT projet_etranger FOREIGN KEY (id_projet) REFERENCES public.projets(id) ON DELETE CASCADE;


--
-- Name: projets_objectifs projet_etranger; Type: FK CONSTRAINT; Schema: public; Owner: transformation
--

ALTER TABLE ONLY public.projets_objectifs
    ADD CONSTRAINT projet_etranger FOREIGN KEY (id_projet) REFERENCES public.projets(id) ON DELETE CASCADE;


--
-- Name: projets_historique projet_etranger; Type: FK CONSTRAINT; Schema: public; Owner: transformation
--

ALTER TABLE ONLY public.projets_historique
    ADD CONSTRAINT projet_etranger FOREIGN KEY (id_projet) REFERENCES public.projets(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

--
-- PostgreSQL database dump
--

-- Dumped from database version 12.11 (Ubuntu 12.11-1.pgdg20.04+1)
-- Dumped by pg_dump version 12.11 (Ubuntu 12.11-1.pgdg20.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: roles_projet; Type: TABLE DATA; Schema: public; Owner: transformation
--

INSERT INTO public.roles_projet (id, nom, actif) VALUES (1, 'chef', true);
INSERT INTO public.roles_projet (id, nom, actif) VALUES (2, 'développeur', true);
INSERT INTO public.roles_projet (id, nom, actif) VALUES (3, 'concepteur', true);

--
-- Name: roles_projet_id_seq; Type: SEQUENCE SET; Schema: public; Owner: transformation
--

SELECT pg_catalog.setval('public.roles_projet_id_seq', 3, true);


--
-- PostgreSQL database dump complete
--
