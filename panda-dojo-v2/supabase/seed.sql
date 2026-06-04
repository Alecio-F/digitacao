insert into public.achievements (id, title, description, icon, xp_reward)
values
('first-training', 'Primeiro Passo', 'Concluiu o primeiro treino no Dojo.', '🐾', 25),
('precision-90', 'Foco de Bambu', 'Alcançou 90% ou mais de precisão.', '🎯', 40),
('precision-95', 'Toque Preciso', 'Alcançou 95% ou mais de precisão.', '🏅', 60),
('new-record', 'Recorde do Dojo', 'Bateu um novo recorde pessoal.', '⚡', 80),
('three-trainings', 'Rotina de Aprendiz', 'Registrou pelo menos 3 treinos.', '📜', 35),
('seven-trainings', 'Disciplina Arcade', 'Registrou pelo menos 7 treinos.', '🔥', 70),
('master-asdf', 'Mestre ASDF', 'Concluiu Teclas Base com medalha de ouro.', '⌨️', 100),
('daily-routine', 'Rotina do Dojo', 'Completou uma missão diária.', '🌿', 50),
('map-explorer', 'Explorador do Mapa', 'Iniciou 3 fases diferentes do Mapa do Dojo.', '🗺️', 45),
('arcade-first', 'Arcade Inicial', 'Jogou Panda Keys pela primeira vez.', '🎮', 25),
('strong-combo', 'Combo Forte', 'Alcançou um combo alto em treino.', '💥', 60)
on conflict (id) do nothing;
