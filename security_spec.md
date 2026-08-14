# Security Specification: InfoPerso Firestore Access Control

This document defines the zero-trust data invariants, attack payloads, and security validations for the InfoPerso application.

## 1. Data Invariants

1. **Identity & Ownership Integrity**:
   - A proposed article can only be created with `authorUid` matching the current authenticated user's UID (`request.auth.uid`).
   - A comment can only be created with `authorUid` matching the current authenticated user's UID.
   - A subscription document can only be read or written by the user whose UID matches the document ID.

2. **Temporal Integrity**:
   - The `createdAt` and `updatedAt` timestamps must match the server-generated request timestamp (`request.time`) to prevent spoofed timeline injections.

3. **Global Relational Consistency**:
   - A comment cannot be created for a non-existent article. The rules must verify that the target `proposed_articles/{articleId}` exists before creating a comment.

4. **Schema Type-Safety & Limits**:
   - Article content, title, source, category, emoji, and summary must be non-empty strings conforming to strict length limits to prevent Denial of Wallet resource exhaustion attacks.
   - Score must be a valid integer between 0 and 100.
   - Likes and flags can only be incremented or decremented using atomic operations, and cannot be modified directly with arbitrarily spoofed values.

5. **Verified Email Mandate**:
   - For proposed articles and comments, standard client write operations strictly require `request.auth.token.email_verified == true`.

---

## 2. The "Dirty Dozen" Malicious Payloads

The following payloads represent attempt-vectors designed to compromise data integrity, hijack identity, or bypass validation bounds.

### Payload 1: Hijacked Article Creation (Identity Spoofing)
An authenticated user trying to publish an article on behalf of another user UID.
```json
{
  "title": "Un vrai scoop",
  "source": "Faux site",
  "category": "Technologie",
  "emoji": "🚨",
  "summary": "Résumé malveillant",
  "content": "Contenu malveillant",
  "score": 90,
  "authorName": "Victime",
  "authorEmail": "victime@exemple.com",
  "authorUid": "victim-uid-12345",
  "likes": 0
}
```

### Payload 2: Massive String Overflow (Denial of Wallet)
An article containing an excessively large content body (e.g. 500KB) to inflate Firestore storage costs.
```json
{
  "title": "A".repeat(100000),
  "source": "T",
  "category": "IA",
  "emoji": "🤖",
  "summary": "S",
  "content": "A".repeat(500000),
  "score": 85,
  "authorName": "Attacker",
  "authorEmail": "attacker@spam.com",
  "authorUid": "attacker-uid",
  "likes": 0
}
```

### Payload 3: Self-Attributed Verification (Privilege Escalation)
A user trying to force their article's `authorVerified` flag to `true` when they are unverified.
```json
{
  "title": "Avis d'expert",
  "source": "Mon Blog",
  "category": "Médias",
  "emoji": "📡",
  "summary": "Résumé de l'avis",
  "content": "Contenu de l'avis",
  "score": 95,
  "authorName": "Inconnu",
  "authorEmail": "unverified@test.com",
  "authorUid": "unverified-uid",
  "authorVerified": true,
  "likes": 0
}
```

### Payload 4: Invalid Field Type Injection (Value Poisoning)
A user trying to save `score` as a boolean or list to crash client rendering pipelines.
```json
{
  "title": "Score empoisonné",
  "source": "Blog",
  "category": "Économie",
  "emoji": "📊",
  "summary": "Résumé",
  "content": "Contenu",
  "score": "Cent pour cent",
  "authorName": "Hacker",
  "authorEmail": "hacker@test.com",
  "authorUid": "hacker-uid",
  "likes": 0
}
```

### Payload 5: Orphaned Comment Creation (Relational Sync Violation)
Creating a comment linked to a non-existent article ID `non-existent-article-abc`.
```json
{
  "articleId": "non-existent-article-abc",
  "authorName": "Spammer",
  "authorEmail": "spammer@spam.com",
  "authorUid": "spammer-uid",
  "content": "Super article fantôme !",
  "likes": 0
}
```

### Payload 6: Hijacked Comment Identity (Author Spoofing)
An authenticated user trying to publish a comment under another user's identity.
```json
{
  "articleId": "valid-article-id",
  "authorName": "Cible",
  "authorEmail": "cible@test.com",
  "authorUid": "victim-uid",
  "content": "Je dis des bêtises.",
  "likes": 0
}
```

### Payload 7: Like Hijacking (Illegal Score Counter Update)
Directly set the number of likes of an article from 10 to 1,000,000.
```json
{
  "likes": 1000000
}
```

### Payload 8: Cross-User Subscription Poisoning
User B attempting to create or modify User A's subscription settings.
```json
{
  "status": "active",
  "planName": "Premium Multi-App",
  "subscribedApps": ["Fake App"],
  "customerEmail": "victim@test.com",
  "appSource": "Malicious"
}
```

### Payload 9: Invalid Status Injection in Subscriptions
An attacker attempting to set a subscription status of "unlimited_free" or similar non-conforming value.
```json
{
  "status": "unlimited_free",
  "planName": "Admin Exploit",
  "subscribedApps": ["InfoPerso Master (Cette application)"],
  "customerEmail": "attacker@hacker.com",
  "appSource": "Hacked"
}
```

### Payload 10: Unverified User Posting
A user with an unverified email (`email_verified == false`) attempting to write a proposed article.
```json
{
  "title": "Pas vérifié",
  "source": "Email Poubelle",
  "category": "Autre",
  "emoji": "🗑️",
  "summary": "Résumé",
  "content": "Contenu",
  "score": 75,
  "authorName": "Spammer",
  "authorEmail": "temp@tempmail.com",
  "authorUid": "spammer-uid",
  "likes": 0
}
```

### Payload 11: Timestamp Forgery (Temporal Invalidation)
An attacker attempting to set `createdAt` in the future or past instead of the server timestamp.
```json
{
  "title": "Voyage dans le temps",
  "source": "Blog",
  "category": "Technologie",
  "emoji": "🕰️",
  "summary": "Résumé",
  "content": "Contenu",
  "score": 88,
  "authorName": "Attacker",
  "authorEmail": "attacker@test.com",
  "authorUid": "attacker-uid",
  "likes": 0,
  "createdAt": "2030-01-01T00:00:00Z"
}
```

### Payload 12: Invalid Document Path Poisoning
Injecting special characters/escapes into document paths (e.g. `../` or excessive strings) to find path traversal/ID injection bugs.
```json
{
  "id": "abc/../../def"
}
```

---

## 3. The Test Runner Structure

Tests are structured to run using the Firebase rules-unit-testing library to assure that:
- Clean requests matching all types and bounds pass.
- All "Dirty Dozen" payloads fail with `PERMISSION_DENIED`.
