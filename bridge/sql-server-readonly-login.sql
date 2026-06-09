-- ============================================================
-- TOP ROLEPLAY · Fase 10 · Login SQL Server de SOLO LECTURA para los puentes
-- ============================================================
-- Ejecutar en SSMS conectado a la instancia DESKTOP-ERMNM26\TOPSERVER,
-- con un usuario administrador (p. ej. sa), en una "New Query".
--
-- Crea un login dedicado "top_bridge" que SOLO puede hacer SELECT sobre:
--   · gamedb.dbo.character        (puente sync-characters.mjs)
--   · gamedb.dbo.guild            (nombre de clan en sync-characters.mjs)
--   · AccountServer.dbo.account_login  (puente sync-online.mjs)
--
-- No puede escribir, borrar ni leer nada mas. Cambia la password de abajo
-- por una tuya antes de ejecutar, y pon ese mismo par en C:\top_roleplay\.env.local:
--   BRIDGE_GAMEDB_USER=top_bridge
--   BRIDGE_GAMEDB_PASSWORD=la_password_que_pongas_aqui
-- ============================================================

-- 1) Crear el LOGIN a nivel de servidor (autenticacion SQL).
--    >>> CAMBIA 'CAMBIA_ESTA_PASSWORD' por una password fuerte tuya. <<<
IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = N'top_bridge')
BEGIN
    CREATE LOGIN [top_bridge]
        WITH PASSWORD = N'CAMBIA_ESTA_PASSWORD',
             CHECK_POLICY = OFF;
END
GO

-- 2) Permisos en la base gamedb (character + guild).
USE [gamedb];
GO
IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'top_bridge')
BEGIN
    CREATE USER [top_bridge] FOR LOGIN [top_bridge];
END
GO
-- Solo SELECT sobre las dos tablas concretas (no toda la base).
GRANT SELECT ON OBJECT::dbo.[character] TO [top_bridge];
GRANT SELECT ON OBJECT::dbo.[guild]     TO [top_bridge];
GO

-- 3) Permisos en la base AccountServer (account_login).
USE [AccountServer];
GO
IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'top_bridge')
BEGIN
    CREATE USER [top_bridge] FOR LOGIN [top_bridge];
END
GO
GRANT SELECT ON OBJECT::dbo.[account_login] TO [top_bridge];
GO

-- 4) (Opcional) Verificar que el login puede leer:
--    EXECUTE AS LOGIN = 'top_bridge';
--    SELECT COUNT(*) FROM gamedb.dbo.[character];
--    SELECT COUNT(*) FROM AccountServer.dbo.account_login WHERE login_status <> 0;
--    REVERT;
-- ============================================================
