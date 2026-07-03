# Migrations — Captain Bond

Ce document reference les migrations a appliquer sur la base Supabase.

## Ordre d'application

Appliquer les migrations dans l'ordre numerique via l'editeur SQL Supabase :

```
001_initial_rls.sql                 → RLS + policies
002_initial_rpc.sql                 → Fonctions atomiques
...
20260618_monetization_v2.sql        → Monetisation Stripe (Packs, Subscriptions)
20260703074937_advance_room_round.sql → Room round advancement
20260703100000_couple_killer_features.sql → Features couple P1-P4
```

## Migration couple killer features (P1-P4)

Fichier : `supabase/migrations/20260703100000_couple_killer_features.sql`

Cree les tables :
- `PushSubscription` — abonnements push notifications
- `AudioRecording` — enregistrements vocaux (P5)
- `WeeklyRecapData` — recap hebdo generes par Gemini
- `CoupleHeatmap` — scores confiance par axe
- `ThemeAxisMapping` — mapping theme → axe heatmap
- `TreeProgress` — progression mensuelle arbre de resonance

Et ajoute les colonnes audio a `DailyQuestion` (`user1AudioUrl`, `user2AudioUrl`, `user1AudioTranscription`, `user2AudioTranscription`).

## Verification post-migration

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Verifier que les nouvelles tables apparaissent.
