PRAGMA foreign_keys = ON;

CREATE TABLE wave4_assertions (name TEXT PRIMARY KEY,passed INTEGER NOT NULL CHECK (passed=1));

INSERT INTO users (id,email,name,active,created_at,updated_at) VALUES
 ('admin','marketing@newwed.com.br','Admin',1,'2026-09-14T00:00:00Z','2026-09-14T00:00:00Z'),
 ('manager','contato@gruponewwed.com.br','Gestora',1,'2026-09-14T00:00:00Z','2026-09-14T00:00:00Z'),
 ('seller','vendas@newwed.com.br','Vendedora',1,'2026-09-14T00:00:00Z','2026-09-14T00:00:00Z');
INSERT INTO roles (id,user_id,role,created_at) VALUES
 ('r-admin','admin','admin','2026-09-14T00:00:00Z'),('r-manager','manager','gestor','2026-09-14T00:00:00Z'),('r-seller','seller','vendedor','2026-09-14T00:00:00Z');
INSERT INTO editions (id,slug,name,destination,starts_at,ends_at,status,capacity,created_at,updated_at) VALUES
 ('edition','wave4','FAMTOUR Wave 4','Recife','2026-10-01','2026-10-03','OPEN',10,'2026-09-14T00:00:00Z','2026-09-14T00:00:00Z');
INSERT INTO price_batches (id,edition_id,name,amount_cents,installment_count,active,created_at,updated_at) VALUES
 ('price','edition','Lote',100000,12,1,'2026-09-14T00:00:00Z','2026-09-14T00:00:00Z');
INSERT INTO leads (id,name,email,normalized_email,phone,normalized_phone,edition_id,stage,consent_version,consent_at,dedupe_key,request_id,created_at,updated_at) VALUES
 ('lead-assigned','Lead atribuído','a@test.local','a@test.local','1','1','edition','PAGO','test','2026-09-14T00:00:00Z','d-a','req-assigned','2026-09-14T00:00:00Z','2026-09-14T00:00:00Z'),
 ('lead-fallback','Lead fallback','b@test.local','b@test.local','2','2','edition','PAGO','test','2026-09-14T00:00:00Z','d-b','req-fallback','2026-09-14T00:00:00Z','2026-09-14T00:00:00Z');
INSERT INTO assignments (id,lead_id,user_id,assigned_by,active,created_at) VALUES ('assignment','lead-assigned','seller','admin',1,'2026-09-14T00:00:00Z');
INSERT INTO checkouts (id,lead_id,edition_id,price_batch_id,method,amount_cents,status,financial_status,idempotency_key,authorized_by,request_id,created_at,updated_at) VALUES
 ('checkout-assigned','lead-assigned','edition','price','PIX',100000,'PAID','PAID','idem-assigned','admin','req-assigned','2026-09-14T00:00:00Z','2026-09-14T00:00:00Z'),
 ('checkout-fallback','lead-fallback','edition','price','PIX',100000,'PAID','PAID','idem-fallback','admin','req-fallback','2026-09-14T00:00:00Z','2026-09-14T00:00:00Z');

-- O pagamento repetido mantém uma notificação, dois canais e um único e-mail na outbox.
INSERT OR IGNORE INTO notifications (id,type,entity_type,entity_id,title,body,dedupe_key,request_id,created_at) VALUES
 ('n-assigned','CHECKOUT_PAID','checkout','checkout-assigned','Pagamento confirmado','Lead atribuído pagou','checkout.paid:checkout-assigned','req-assigned','2026-09-14T00:01:00Z');
INSERT OR IGNORE INTO notifications (id,type,entity_type,entity_id,title,body,dedupe_key,request_id,created_at) VALUES
 ('n-duplicate','CHECKOUT_PAID','checkout','checkout-assigned','Pagamento confirmado','Duplicado','checkout.paid:checkout-assigned','req-other','2026-09-14T00:02:00Z');
INSERT OR IGNORE INTO notification_recipients (id,notification_id,user_id,channel,delivery_status,created_at,updated_at) VALUES
 ('nr-in','n-assigned','seller','IN_APP','SENT','2026-09-14T00:01:00Z','2026-09-14T00:01:00Z'),
 ('nr-email','n-assigned','seller','EMAIL','PENDING','2026-09-14T00:01:00Z','2026-09-14T00:01:00Z');
INSERT OR IGNORE INTO notification_recipients (id,notification_id,user_id,channel,delivery_status,created_at,updated_at) VALUES
 ('nr-email-duplicate','n-assigned','seller','EMAIL','PENDING','2026-09-14T00:02:00Z','2026-09-14T00:02:00Z');
INSERT OR IGNORE INTO outbox_events (id,type,aggregate_id,dedupe_key,payload_json,request_id,created_at) VALUES
 ('email-outbox','notification.email','n-assigned','notification.email:n-assigned:seller','{}','req-assigned','2026-09-14T00:01:00Z');
INSERT OR IGNORE INTO outbox_events (id,type,aggregate_id,dedupe_key,payload_json,request_id,created_at) VALUES
 ('email-outbox-duplicate','notification.email','n-assigned','notification.email:n-assigned:seller','{}','req-other','2026-09-14T00:02:00Z');
INSERT INTO wave4_assertions VALUES ('paid-deduplication',(SELECT count(*)=1 FROM notifications WHERE dedupe_key='checkout.paid:checkout-assigned'));
INSERT INTO wave4_assertions VALUES ('assigned-recipient',(SELECT count(*)=2 FROM notification_recipients WHERE notification_id='n-assigned' AND user_id='seller'));
INSERT INTO wave4_assertions VALUES ('single-email-outbox',(SELECT count(*)=1 FROM outbox_events WHERE dedupe_key='notification.email:n-assigned:seller'));

-- Sem responsável, gestores e administradores recebem os dois canais.
INSERT INTO notifications (id,type,entity_type,entity_id,title,body,dedupe_key,request_id,created_at) VALUES
 ('n-fallback','CHECKOUT_PAID','checkout','checkout-fallback','Pagamento confirmado','Lead fallback pagou','checkout.paid:checkout-fallback','req-fallback','2026-09-14T00:03:00Z');
INSERT INTO notification_recipients (id,notification_id,user_id,channel,delivery_status,created_at,updated_at) VALUES
 ('nr-fa-i','n-fallback','admin','IN_APP','SENT','2026-09-14T00:03:00Z','2026-09-14T00:03:00Z'),
 ('nr-fa-e','n-fallback','admin','EMAIL','PENDING','2026-09-14T00:03:00Z','2026-09-14T00:03:00Z'),
 ('nr-fm-i','n-fallback','manager','IN_APP','SENT','2026-09-14T00:03:00Z','2026-09-14T00:03:00Z'),
 ('nr-fm-e','n-fallback','manager','EMAIL','PENDING','2026-09-14T00:03:00Z','2026-09-14T00:03:00Z');
INSERT INTO wave4_assertions VALUES ('fallback-recipients',(SELECT count(*)=4 FROM notification_recipients WHERE notification_id='n-fallback'));

-- Tarefas guardam prioridade, prazo, responsável e conclusão auditável.
INSERT INTO activities (id,lead_id,type,title,actor_id,assigned_to,priority,due_at,created_at,updated_at) VALUES
 ('task','lead-assigned','TASK','Retornar','admin','seller','URGENT','2026-09-14T08:00:00Z','2026-09-14T00:00:00Z','2026-09-14T00:00:00Z');
UPDATE activities SET completed_at='2026-09-14T09:00:00Z',completed_by='seller',updated_at='2026-09-14T09:00:00Z' WHERE id='task';
INSERT INTO wave4_assertions VALUES ('task-lifecycle',(SELECT priority='URGENT' AND assigned_to='seller' AND completed_by='seller' AND completed_at IS NOT NULL FROM activities WHERE id='task'));

-- O bucket reinicia ao expirar e não armazena a identidade original.
INSERT INTO rate_limit_buckets (key,scope,window_started_at,count,expires_at,updated_at) VALUES
 ('public.lead:hash','public.lead','2026-09-14T00:00:00Z',5,'2026-09-14T00:01:00Z','2026-09-14T00:00:30Z');
INSERT INTO rate_limit_buckets (key,scope,window_started_at,count,expires_at,updated_at) VALUES
 ('public.lead:hash','public.lead','2026-09-14T00:02:00Z',1,'2026-09-14T00:03:00Z','2026-09-14T00:02:00Z')
 ON CONFLICT(key) DO UPDATE SET window_started_at=excluded.window_started_at,count=1,expires_at=excluded.expires_at,updated_at=excluded.updated_at;
INSERT INTO wave4_assertions VALUES ('rate-window-reset',(SELECT count=1 AND key NOT LIKE '%test.local%' FROM rate_limit_buckets WHERE key='public.lead:hash'));
INSERT INTO wave4_assertions VALUES ('request-correlation',(SELECT c.request_id=l.request_id AND n.request_id=c.request_id FROM checkouts c JOIN leads l ON l.id=c.lead_id JOIN notifications n ON n.entity_id=c.id WHERE c.id='checkout-assigned'));

SELECT name,passed FROM wave4_assertions ORDER BY name;
