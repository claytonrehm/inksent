-- Free-text "anything else" field from the notary application
alter table notaries add column if not exists notes text;
