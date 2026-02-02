--
-- PostgreSQL database schema
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';
SET default_table_access_method = heap;

--
-- SEQUENCE: users_id_seq
--
CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- TABLE: users
--
CREATE TABLE public.users (
    id integer NOT NULL DEFAULT nextval('public.users_id_seq'::regclass),
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password text NOT NULL,

    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,

    is_activated boolean DEFAULT false,
    activation_token text,

    reset_password_token text,
    reset_password_expires timestamp without time zone,

    first_name text,
    last_name text,
    phone text,
    address text,
    avatar text,
    birth_date date,
    gender text,

    change_password_token text,
    change_password_expires timestamp without time zone,

    change_email_token text,
    change_email_expires timestamp without time zone,

    pending_email text,
    pending_password text
);

--
-- PRIMARY KEY
--
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);

--
-- UNIQUE CONSTRAINTS
--
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);

--
-- INDEXES (optional but recommended)
--
CREATE INDEX idx_users_activation_token
    ON public.users (activation_token);

CREATE INDEX idx_users_reset_password_token
    ON public.users (reset_password_token);

CREATE INDEX idx_users_change_password_token
    ON public.users (change_password_token);

CREATE INDEX idx_users_change_email_token
    ON public.users (change_email_token);
