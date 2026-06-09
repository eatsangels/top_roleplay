-- Adapts the public TOP ROLEPLAY CMS to the final Cops vs Gangs theme.
-- Apply after public-full-cms-migration.sql. Idempotent and safe to reapply.

do $$
begin
  if to_regclass('public.public_sections') is null
    or to_regclass('public.public_content') is null
  then
    raise exception using
      message = 'Falta instalar el CMS público de TOP ROLEPLAY.',
      hint = 'Ejecuta primero supabase/public-full-cms-migration.sql y después vuelve a ejecutar cops-vs-gangs-theme-migration.sql.';
  end if;
end;
$$;

update public.public_sections
set
  title = 'Navegación de la ciudad',
  description = 'Enlaces principales adaptados a la temática Cops vs Gangs.',
  metadata = '{"source":"cops_vs_gangs_theme"}'::jsonb
where key = 'navigation';

update public.public_sections
set
  title = 'Una ciudad viva en conflicto',
  description = 'Presentación del mundo urbano, sus facciones y territorios.',
  metadata = '{"anchor":"mundo","eyebrow":"La ciudad de TOP ROLEPLAY","tags":["Policía","Bandas","Civiles"]}'::jsonb
where key = 'world';

update public.public_sections
set
  title = 'Sistemas de la ciudad',
  description = 'Sistemas públicos de conflicto, economía y progresión.',
  metadata = '{"anchor":"sistemas","eyebrow":"Sistemas TOP ROLEPLAY","headline":"Cada acción cambia el equilibrio de la ciudad"}'::jsonb
where key = 'systems';

update public.public_sections
set
  title = 'Caminos de personaje',
  description = 'Facciones, profesiones e identidades para cada jugador.',
  metadata = '{"eyebrow":"Tu identidad en TOP ROLEPLAY","headline":"Elige tu lugar en la ciudad"}'::jsonb
where key = 'character_paths';

update public.public_sections
set
  title = 'Conflictos activos en la ciudad',
  description = 'Redadas, cargamentos, fugas y guerras territoriales cambian el control de la ciudad en tiempo real.',
  metadata = '{"anchor":"eventos","eyebrow":"Centro de operaciones","headline":"Conflictos activos en la ciudad"}'::jsonb
where key = 'events_public';

with themed(section_key, key, title, subtitle, body, icon, data) as (
  values
    ('navigation', 'inicio', 'Inicio', null, null, null, '{}'::jsonb),
    ('navigation', 'mundo', 'Ciudad', null, null, null, '{}'::jsonb),
    ('navigation', 'sistemas', 'Conflicto', null, null, null, '{}'::jsonb),
    ('navigation', 'ranking', 'TOP', null, null, null, '{}'::jsonb),
    ('navigation', 'eventos', 'Operaciones', null, null, null, '{}'::jsonb),
    ('navigation', 'descargas', 'Jugar', null, null, null, '{}'::jsonb),
    ('navigation', 'comunidad', 'Comunidad', null, null, null, '{}'::jsonb),
    ('world', 'world_card', 'La ciudad de TOP ROLEPLAY', null, 'Distritos disputados, negocios legales, mercados clandestinos y operaciones que cambian el mapa cada día.', 'Map', '{}'::jsonb),
    ('world', 'legend_text', 'Una ciudad viva en conflicto.', 'Policía, Bandas y Civiles', 'Empiezas como civil y construyes tu camino. Puedes proteger la ciudad, dominar sus territorios, negociar desde las sombras o prosperar sin jurar lealtad a nadie.', null, '{"tags":["Policía","Bandas","Civiles"]}'::jsonb),
    ('systems', 'roleplay_con_consecuencia', 'Territorios Dinámicos', null, 'Las facciones disputan distritos que otorgan control, recursos y ventajas estratégicas.', 'Map', '{}'::jsonb),
    ('systems', 'economia_de_puerto', 'Wanted y Arrestos', null, 'Los delitos elevan tu nivel de búsqueda; la policía investiga, persigue, arresta y encarcela.', 'Shield', '{}'::jsonb),
    ('systems', 'conflicto_naval_pvp', 'Contrabando y Economía', null, 'Comercio legal, mercado negro, cargamentos ilegales y negocios controlados por jugadores.', 'Gem', '{}'::jsonb),
    ('systems', 'misiones_de_staff', 'Eventos Automáticos', null, 'Redadas, guerras territoriales, cargamentos y fugas activan conflictos emergentes.', 'Zap', '{}'::jsonb),
    ('systems', 'exploracion_pirata', 'Progresión por Facción', null, 'Rangos, reputación y permisos especiales recompensan tu impacto en cada facción.', 'Trophy', '{}'::jsonb),
    ('systems', 'comunidad_viva', 'Roleplay y Comunidad', null, 'Historias compartidas, consecuencias persistentes y soporte para crear escenas memorables.', 'MessageCircle', '{}'::jsonb),
    ('character_paths', 'argent_police_force', 'Policía', null, 'Protege distritos, investiga delitos, ejecuta redadas y asciende dentro de la fuerza.', 'Shield', '{}'::jsonb),
    ('character_paths', 'sea_shadow_syndicate', 'Banda Roja', null, 'Construye reputación criminal, controla territorios y compite por el dominio de la ciudad.', 'Skull', '{}'::jsonb),
    ('character_paths', 'abyssal_reavers', 'Banda Azul', null, 'Organiza operaciones, defiende tu zona y disputa los recursos más valiosos.', 'Swords', '{}'::jsonb),
    ('character_paths', 'crimson_tide_outlaws', 'Civil y Comerciante', null, 'Crea negocios, genera empleo y prospera entre facciones sin abandonar tu independencia.', 'Users', '{}'::jsonb),
    ('character_paths', 'iron_skull_brotherhood', 'Informante', null, 'Convierte rumores e inteligencia en poder, protección o dinero.', 'MessageCircle', '{}'::jsonb),
    ('character_paths', 'civil_comerciante', 'Transportista', null, 'Mueve recursos legales o clandestinos y decide cuánto riesgo estás dispuesto a aceptar.', 'Map', '{}'::jsonb),
    ('parallax_chapters', 'capitulo_i', 'Empiezas como civil. La ciudad decidirá quién llegas a ser.', 'TOP ROLEPLAY · Capítulo I', null, 'Users', '{}'::jsonb),
    ('parallax_chapters', 'capitulo_ii', 'Elige una facción, crea alianzas y disputa el control de los territorios.', 'TOP ROLEPLAY · Capítulo II', null, 'Shield', '{}'::jsonb),
    ('parallax_chapters', 'capitulo_iii', 'Cada arresto, negocio y conquista cambia el equilibrio de poder.', 'TOP ROLEPLAY · Capítulo III', null, 'Swords', '{}'::jsonb),
    ('parallax_chapters', 'capitulo_iv', 'Tu reputación puede convertirte en objetivo, autoridad o leyenda.', 'TOP ROLEPLAY · Capítulo IV', null, 'Trophy', '{}'::jsonb),
    ('gallery_public', 'puerto_negro', 'Centro de la Ciudad', null, 'El punto donde convergen civiles, negocios y facciones.', null, '{}'::jsonb),
    ('gallery_public', 'islas_perdidas', 'Territorios', null, 'Distritos cuyo control modifica el equilibrio de poder.', null, '{}'::jsonb),
    ('gallery_public', 'batallas', 'Redadas', null, 'Operaciones policiales contra objetivos de alto riesgo.', null, '{}'::jsonb),
    ('gallery_public', 'personajes', 'Bandas', null, 'Organizaciones que compiten por reputación y control.', null, '{}'::jsonb),
    ('gallery_public', 'eventos', 'Policía', null, 'La fuerza que investiga, persigue y protege la ciudad.', null, '{}'::jsonb),
    ('gallery_public', 'mazmorras', 'Mercado Negro', null, 'Una economía clandestina para quienes aceptan sus riesgos.', null, '{}'::jsonb),
    ('faq_public', 'eventos_semanales', '¿Hay eventos dinámicos?', null, 'Sí. Hay guerras territoriales, redadas policiales, cargamentos ilegales y fugas de prisión.', null, '{}'::jsonb),
    ('faq_public', 'unirse_clan', '¿Puedo unirme a una facción?', null, 'Sí. Empiezas como civil y podrás construir los requisitos y la reputación necesarios para unirte a una facción.', null, '{}'::jsonb),
    ('footer_public', 'brand', 'TOP ROLEPLAY', null, 'Una ciudad viva donde policías, bandas y civiles construyen el conflicto, la economía y cada historia.', null, '{}'::jsonb),
    ('footer_public', 'quick_inicio', 'Inicio', null, null, null, '{}'::jsonb),
    ('footer_public', 'quick_mundo', 'Ciudad', null, null, null, '{}'::jsonb),
    ('footer_public', 'quick_sistemas', 'Conflicto', null, null, null, '{}'::jsonb),
    ('footer_public', 'quick_ranking', 'TOP', null, null, null, '{}'::jsonb),
    ('footer_public', 'quick_eventos', 'Operaciones', null, null, null, '{}'::jsonb)
)
update public.public_content content
set
  title = themed.title,
  subtitle = themed.subtitle,
  body = themed.body,
  icon = coalesce(themed.icon, content.icon),
  data = case when themed.data = '{}'::jsonb then content.data else themed.data end
from themed
join public.public_sections section on section.key = themed.section_key
where content.section_id = section.id
  and content.key = themed.key;

insert into public.site_settings (key, value)
values (
  'public_config',
  '{
    "heroEyebrow": "Cops vs Gangs · Guerra de Territorios",
    "heroTagline": "Policía, bandas y civiles compiten por escribir la historia de una ciudad viva.",
    "heroDescription": "Empieza como civil, elige tu camino y cambia el equilibrio entre facciones mediante territorios, redadas, contrabando, negocios y reputación.",
    "discordUrl": "https://discord.com",
    "serverStatus": "TOP ROLEPLAY online"
  }'::jsonb
)
on conflict (key) do update
set value = excluded.value;

update public.events
set
  name = case slug
    when 'guerra-de-clanes' then 'Guerra Territorial'
    when 'torneo-pvp' then 'Redada Policial'
    when 'caza-del-tesoro' then 'Cargamento Ilegal'
    when 'boss-mundial' then 'Fuga de Prisión'
    else name
  end,
  description = case slug
    when 'guerra-de-clanes' then 'Policía y bandas disputan el control de un distrito estratégico.'
    when 'torneo-pvp' then 'Una operación policial busca desmantelar una base criminal activa.'
    when 'caza-del-tesoro' then 'Un cargamento clandestino cruza la ciudad y todas las facciones buscan interceptarlo.'
    when 'boss-mundial' then 'Prisioneros de alto riesgo intentan escapar mientras la policía asegura la zona.'
    else description
  end,
  rewards = case slug
    when 'guerra-de-clanes' then 'Control de zona, reputación y bonos de facción'
    when 'torneo-pvp' then 'Recompensas por arresto y control policial'
    when 'caza-del-tesoro' then 'Dinero, contrabando y puntos territoriales'
    when 'boss-mundial' then 'Reputación policial o criminal'
    else rewards
  end,
  event_type = case slug
    when 'guerra-de-clanes' then 'Territorio'
    when 'torneo-pvp' then 'Operación policial'
    when 'caza-del-tesoro' then 'Contrabando'
    when 'boss-mundial' then 'Emergencia'
    else event_type
  end
where slug in ('guerra-de-clanes', 'torneo-pvp', 'caza-del-tesoro', 'boss-mundial');

notify pgrst, 'reload schema';
