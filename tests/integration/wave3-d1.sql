PRAGMA foreign_keys = ON;

CREATE TABLE wave3_assertions (
  name TEXT PRIMARY KEY,
  passed INTEGER NOT NULL CHECK (passed = 1)
);

INSERT INTO users (id,email,name,active,created_at,updated_at) VALUES
  ('seller-a','seller-a@test.local','Vendedor A',1,'2026-09-14T00:00:00Z','2026-09-14T00:00:00Z'),
  ('seller-b','seller-b@test.local','Vendedor B',1,'2026-09-14T00:00:00Z','2026-09-14T00:00:00Z');
INSERT INTO roles (id,user_id,role,created_at) VALUES
  ('role-a','seller-a','vendedor','2026-09-14T00:00:00Z'),
  ('role-b','seller-b','vendedor','2026-09-14T00:00:00Z');
INSERT INTO leads (id,name,email,normalized_email,phone,normalized_phone,stage,consent_version,consent_at,dedupe_key,created_at,updated_at) VALUES
  ('lead-inbox','Lead Inbox','lead@test.local','lead@test.local','81999990001','+5581999990001','NOVO','test','2026-09-14T00:00:00Z','dedupe-inbox','2026-09-14T00:00:00Z','2026-09-14T00:00:00Z');
INSERT INTO conversations (id,lead_id,channel,external_id,mode,human_active,agent_processing_token,agent_processing_started_at,created_at,updated_at) VALUES
  ('conversation-1','lead-inbox','whatsapp','5581999990001','AGENT',0,'agent-token','2026-09-14T00:00:00Z','2026-09-14T00:00:00Z','2026-09-14T00:00:00Z');

-- Claim humano pausa o modo imediatamente, mas preserva o lease até o agente observar a pausa.
UPDATE conversations SET mode='HUMAN',human_active=1,claimed_by='seller-a',claimed_at='2026-09-14T00:01:00Z',agent_paused_at='2026-09-14T00:01:00Z'
  WHERE id='conversation-1' AND claimed_by IS NULL;
INSERT INTO wave3_assertions VALUES ('claim-pauses-agent',(
  SELECT mode='HUMAN' AND human_active=1 AND claimed_by='seller-a' AND agent_processing_token='agent-token' FROM conversations WHERE id='conversation-1'
));

-- Enquanto o lease existe, nenhuma mensagem humana entra na fila.
INSERT INTO messages (id,conversation_id,actor_id,direction,type,body,status,created_at)
  SELECT 'message-blocked','conversation-1','seller-a','OUT','text','Olá','SEND_PENDING','2026-09-14T00:01:00Z'
  FROM conversations WHERE id='conversation-1' AND mode='HUMAN' AND claimed_by='seller-a' AND agent_processing_token IS NULL;
INSERT INTO wave3_assertions VALUES ('manual-blocked-during-agent',(SELECT count(*)=0 FROM messages WHERE id='message-blocked'));

-- Após o agente reconhecer a pausa, somente o responsável consegue responder.
UPDATE conversations SET agent_processing_token=NULL,agent_processing_started_at=NULL WHERE id='conversation-1' AND agent_processing_token='agent-token';
INSERT INTO messages (id,conversation_id,actor_id,direction,type,body,status,created_at)
  SELECT 'message-owner','conversation-1','seller-a','OUT','text','Olá','SEND_PENDING','2026-09-14T00:02:00Z'
  FROM conversations WHERE id='conversation-1' AND mode='HUMAN' AND claimed_by='seller-a' AND agent_processing_token IS NULL;
INSERT INTO messages (id,conversation_id,actor_id,direction,type,body,status,created_at)
  SELECT 'message-other','conversation-1','seller-b','OUT','text','Olá','SEND_PENDING','2026-09-14T00:02:00Z'
  FROM conversations WHERE id='conversation-1' AND mode='HUMAN' AND claimed_by='seller-b' AND agent_processing_token IS NULL;
INSERT INTO wave3_assertions VALUES ('only-owner-replies',(
  SELECT (SELECT count(*) FROM messages WHERE id='message-owner')=1 AND (SELECT count(*) FROM messages WHERE id='message-other')=0
));

-- Primeiro atendimento muda o lead uma única vez.
UPDATE leads SET stage='EM_ATENDIMENTO' WHERE id='lead-inbox' AND stage='NOVO';
INSERT INTO pipeline_history (id,lead_id,from_stage,to_stage,actor_id,reason,created_at)
  SELECT 'history-first','lead-inbox','NOVO','EM_ATENDIMENTO','seller-a','Primeiro atendimento humano','2026-09-14T00:02:00Z' WHERE changes()=1;
UPDATE leads SET stage='EM_ATENDIMENTO' WHERE id='lead-inbox' AND stage='NOVO';
INSERT INTO pipeline_history (id,lead_id,from_stage,to_stage,actor_id,reason,created_at)
  SELECT 'history-duplicate','lead-inbox','NOVO','EM_ATENDIMENTO','seller-a','Duplicado','2026-09-14T00:03:00Z' WHERE changes()=1;
INSERT INTO wave3_assertions VALUES ('first-attendance-once',(
  SELECT stage='EM_ATENDIMENTO' AND (SELECT count(*) FROM pipeline_history WHERE lead_id='lead-inbox')=1 FROM leads WHERE id='lead-inbox'
));

-- Release devolve o controle somente sem lease e sem opt-out.
UPDATE conversations SET mode='AGENT',human_active=0,claimed_by=NULL,released_at='2026-09-14T00:04:00Z' WHERE id='conversation-1' AND agent_processing_token IS NULL AND opted_out_at IS NULL;
INSERT INTO wave3_assertions VALUES ('release-to-agent',(
  SELECT mode='AGENT' AND human_active=0 AND claimed_by IS NULL FROM conversations WHERE id='conversation-1'
));
UPDATE conversations SET mode='HUMAN',human_active=1,opted_out_at='2026-09-14T00:05:00Z' WHERE id='conversation-1';
UPDATE conversations SET mode='AGENT',human_active=0 WHERE id='conversation-1' AND agent_processing_token IS NULL AND opted_out_at IS NULL;
INSERT INTO wave3_assertions VALUES ('optout-blocks-agent',(
  SELECT mode='HUMAN' AND opted_out_at IS NOT NULL FROM conversations WHERE id='conversation-1'
));

SELECT name,passed FROM wave3_assertions ORDER BY name;
