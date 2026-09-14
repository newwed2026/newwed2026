PRAGMA foreign_keys = ON;

CREATE TABLE wave2_assertions (
  name TEXT PRIMARY KEY,
  passed INTEGER NOT NULL CHECK (passed = 1)
);

INSERT INTO users (id,email,name,active,created_at,updated_at) VALUES
  ('user-admin','admin@test.local','Admin',1,'2026-09-14T00:00:00Z','2026-09-14T00:00:00Z');
INSERT INTO roles (id,user_id,role,created_at) VALUES ('role-admin','user-admin','admin','2026-09-14T00:00:00Z');

INSERT INTO editions (id,slug,name,destination,starts_at,ends_at,status,capacity,created_at,updated_at) VALUES
  ('edition-last','last-seat','Última vaga','Recife','2026-10-01','2026-10-03','OPEN',1,'2026-09-14T00:00:00Z','2026-09-14T00:00:00Z'),
  ('edition-release','release-seat','Liberação','Natal','2026-11-01','2026-11-03','OPEN',2,'2026-09-14T00:00:00Z','2026-09-14T00:00:00Z');
INSERT INTO availability (edition_id,reserved,sold,version,updated_at) VALUES
  ('edition-last',0,0,1,'2026-09-14T00:00:00Z'),
  ('edition-release',2,0,1,'2026-09-14T00:00:00Z');
INSERT INTO price_batches (id,edition_id,name,amount_cents,installment_count,active,created_at,updated_at) VALUES
  ('price-last','edition-last','Lote único',10001,12,1,'2026-09-14T00:00:00Z','2026-09-14T00:00:00Z'),
  ('price-release','edition-release','Lote único',20000,12,1,'2026-09-14T00:00:00Z','2026-09-14T00:00:00Z');

INSERT INTO leads (id,name,email,normalized_email,phone,normalized_phone,edition_id,stage,consent_version,consent_at,dedupe_key,created_at,updated_at) VALUES
  ('lead-a','Lead A','a@test.local','a@test.local','81999990001','+5581999990001','edition-last','QUALIFICADO','test','2026-09-14T00:00:00Z','dedupe-a','2026-09-14T00:00:00Z','2026-09-14T00:00:00Z'),
  ('lead-b','Lead B','b@test.local','b@test.local','81999990002','+5581999990002','edition-last','QUALIFICADO','test','2026-09-14T00:00:00Z','dedupe-b','2026-09-14T00:00:00Z','2026-09-14T00:00:00Z'),
  ('lead-c','Lead C','c@test.local','c@test.local','81999990003','+5581999990003','edition-release','QUALIFICADO','test','2026-09-14T00:00:00Z','dedupe-c','2026-09-14T00:00:00Z','2026-09-14T00:00:00Z'),
  ('lead-d','Lead D','d@test.local','d@test.local','81999990004','+5581999990004','edition-release','QUALIFICADO','test','2026-09-14T00:00:00Z','dedupe-d','2026-09-14T00:00:00Z','2026-09-14T00:00:00Z');

-- Duas tentativas disputam a última vaga; somente a primeira cria checkout.
UPDATE availability SET reserved=reserved+1,version=version+1 WHERE edition_id='edition-last' AND reserved+sold<1;
INSERT INTO checkouts (id,lead_id,edition_id,price_batch_id,method,amount_cents,status,idempotency_key,authorized_by,expires_at,created_at,updated_at)
  SELECT 'checkout-a','lead-a','edition-last','price-last','PIX',10001,'CREATING','idem-a','user-admin','2026-09-18T02:59:59.999Z','2026-09-14T00:00:00Z','2026-09-14T00:00:00Z' WHERE changes()=1;
UPDATE availability SET reserved=reserved+1,version=version+1 WHERE edition_id='edition-last' AND reserved+sold<1;
INSERT INTO checkouts (id,lead_id,edition_id,price_batch_id,method,amount_cents,status,idempotency_key,authorized_by,expires_at,created_at,updated_at)
  SELECT 'checkout-b','lead-b','edition-last','price-last','PIX',10001,'CREATING','idem-b','user-admin','2026-09-18T02:59:59.999Z','2026-09-14T00:00:00Z','2026-09-14T00:00:00Z' WHERE changes()=1;
INSERT INTO wave2_assertions VALUES ('last-seat',(
  SELECT reserved=1 AND sold=0 AND (SELECT count(*) FROM checkouts WHERE edition_id='edition-last')=1 FROM availability WHERE edition_id='edition-last'
));

-- A mesma chave de outbox só existe uma vez.
INSERT OR IGNORE INTO outbox_events (id,type,aggregate_id,dedupe_key,payload_json,attempts,created_at) VALUES
  ('event-a','checkout.create','checkout-a','checkout.create:checkout-a','{}',0,'2026-09-14T00:00:00Z');
INSERT OR IGNORE INTO outbox_events (id,type,aggregate_id,dedupe_key,payload_json,attempts,created_at) VALUES
  ('event-duplicate','checkout.create','checkout-a','checkout.create:checkout-a','{}',0,'2026-09-14T00:00:00Z');
INSERT INTO wave2_assertions VALUES ('outbox-deduplication',(SELECT count(*)=1 FROM outbox_events WHERE dedupe_key='checkout.create:checkout-a'));

-- Primeira confirmação converte reserva em venda; repetição não altera estoque.
UPDATE availability SET reserved=reserved-1,sold=sold+1,version=version+1 WHERE edition_id='edition-last'
  AND EXISTS (SELECT 1 FROM checkouts WHERE id='checkout-a' AND status!='PAID');
UPDATE checkouts SET status='PAID',financial_status='PAID',reservation_released_at='2026-09-14T01:00:00Z',paid_at='2026-09-14T01:00:00Z'
  WHERE id='checkout-a' AND changes()=1;
UPDATE availability SET reserved=reserved-1,sold=sold+1,version=version+1 WHERE edition_id='edition-last'
  AND EXISTS (SELECT 1 FROM checkouts WHERE id='checkout-a' AND status!='PAID');
INSERT INTO wave2_assertions VALUES ('payment-deduplication',(
  SELECT reserved=0 AND sold=1 FROM availability WHERE edition_id='edition-last'
));

-- Estorno libera a venda apenas uma vez.
UPDATE availability SET sold=max(0,sold-1),version=version+1 WHERE edition_id='edition-last'
  AND EXISTS (SELECT 1 FROM checkouts WHERE id='checkout-a' AND status='PAID');
UPDATE checkouts SET status='REFUNDED',financial_status='REFUNDED',refunded_at='2026-09-14T02:00:00Z' WHERE id='checkout-a' AND status!='REFUNDED';
UPDATE availability SET sold=max(0,sold-1),version=version+1 WHERE edition_id='edition-last'
  AND EXISTS (SELECT 1 FROM checkouts WHERE id='checkout-a' AND status='PAID');
INSERT INTO wave2_assertions VALUES ('refund-deduplication',(
  SELECT sold=0 FROM availability WHERE edition_id='edition-last'
));

INSERT INTO checkouts (id,lead_id,edition_id,price_batch_id,method,amount_cents,status,idempotency_key,authorized_by,expires_at,created_at,updated_at) VALUES
  ('checkout-c','lead-c','edition-release','price-release','PIX',20000,'PENDING','idem-c','user-admin','2026-09-13T02:59:59.999Z','2026-09-12T00:00:00Z','2026-09-12T00:00:00Z'),
  ('checkout-d','lead-d','edition-release','price-release','PIX',20000,'SENT','idem-d','user-admin','2026-09-18T02:59:59.999Z','2026-09-14T00:00:00Z','2026-09-14T00:00:00Z');

-- Expiração e cancelamento liberam suas reservas separadamente.
UPDATE checkouts SET status='OVERDUE',financial_status='OVERDUE',reservation_released_at='2026-09-14T03:00:00Z' WHERE id='checkout-c' AND reservation_released_at IS NULL;
UPDATE availability SET reserved=max(0,reserved-1),version=version+1 WHERE edition_id='edition-release' AND changes()=1;
UPDATE checkouts SET status='CANCELLED',reservation_released_at='2026-09-14T03:00:00Z',cancelled_at='2026-09-14T03:00:00Z' WHERE id='checkout-d' AND reservation_released_at IS NULL;
UPDATE availability SET reserved=max(0,reserved-1),version=version+1 WHERE edition_id='edition-release' AND changes()=1;
INSERT INTO wave2_assertions VALUES ('expiration-cancellation-release',(
  SELECT reserved=0 AND sold=0 FROM availability WHERE edition_id='edition-release'
));

SELECT name,passed FROM wave2_assertions ORDER BY name;
