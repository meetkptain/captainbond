-- Index sur Room.code pour accélérer les lookups par code de salle (getRoomByCode, join_room RPC)
-- Sans cet index, chaque recherche scanne séquentiellement toute la table.
CREATE INDEX IF NOT EXISTS "Room_code_idx" ON "Room" ("code");

-- Index sur Player.roomId pour les requêtes fréquentes de liste de joueurs par room
-- (getPlayersInRoom, getPlayersByRoomWithUserId dans playerRepository)
CREATE INDEX IF NOT EXISTS "Player_roomId_idx" ON "Player" ("roomId");

-- Index sur Response.roomId pour les requêtes de réponses par room
-- (getResponsesByRoomAndQuestion, getResponsesForProfileInputs)
CREATE INDEX IF NOT EXISTS "Response_roomId_idx" ON "Response" ("roomId");

-- Index sur Question.language pour les requêtes de questions par langue
-- (listQuestionsForDeck dans roomQuestionRepository)
CREATE INDEX IF NOT EXISTS "Question_language_idx" ON "Question" ("language");
