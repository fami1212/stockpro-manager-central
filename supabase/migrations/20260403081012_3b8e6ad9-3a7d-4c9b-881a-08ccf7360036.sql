
-- Insert Basique plan if not exists
INSERT INTO subscription_plans (name, display_name, description, price_monthly, price_yearly, currency, sort_order, is_active, has_ai_access, has_full_ai, max_products, max_sales, features, allowed_modules)
VALUES (
  'basique', 'Basique', 'Modules essentiels pour gérer votre activité',
  4900, 49000, 'XOF', 1, true, false, false, 100, 500,
  '["Gestion de stock", "Ventes", "Clients", "Export basique"]'::jsonb,
  '["dashboard", "stock", "sales", "clients", "settings", "export"]'::jsonb
)
ON CONFLICT DO NOTHING;

-- Update Trial plan
UPDATE subscription_plans SET
  price_monthly = 0,
  price_yearly = 0,
  max_products = 20,
  max_sales = 50,
  has_ai_access = false,
  has_full_ai = false,
  sort_order = 0,
  features = '["Accès limité 4 jours", "20 produits max", "50 ventes max"]'::jsonb,
  allowed_modules = '["dashboard", "stock", "sales", "clients", "settings"]'::jsonb
WHERE name = 'trial';

-- Update Pro plan
UPDATE subscription_plans SET
  price_monthly = 14900,
  price_yearly = 149000,
  max_products = 1000,
  max_sales = 5000,
  has_ai_access = true,
  has_full_ai = false,
  sort_order = 2,
  display_name = 'Pro',
  description = 'Pour les entreprises en croissance avec gestion avancée',
  features = '["Tous les modules Basique", "Achats & Fournisseurs", "Factures", "Promotions", "Retours", "IA basique"]'::jsonb,
  allowed_modules = '["dashboard", "stock", "sales", "clients", "purchases", "suppliers", "invoices", "promotions", "returns", "export", "settings"]'::jsonb
WHERE name = 'pro';

-- Update Premium plan
UPDATE subscription_plans SET
  price_monthly = 29900,
  price_yearly = 299000,
  max_products = NULL,
  max_sales = NULL,
  has_ai_access = true,
  has_full_ai = true,
  sort_order = 3,
  display_name = 'Premium',
  description = 'Accès complet avec IA avancée et rapports intelligents',
  features = '["Tous les modules Pro", "IA avancée", "Rapports intelligents", "Analyses prédictives", "Produits illimités"]'::jsonb,
  allowed_modules = '["dashboard", "stock", "sales", "clients", "purchases", "suppliers", "invoices", "promotions", "returns", "export", "reports", "settings"]'::jsonb
WHERE name = 'premium';
