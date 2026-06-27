-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "idx_purchase_stripe_payment_id_unique"
ON "Purchase" ("stripePaymentId")
WHERE "stripePaymentId" IS NOT NULL;
