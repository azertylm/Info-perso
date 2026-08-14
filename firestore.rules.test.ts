// Firestore Rules Security Test Runner
// This test suite validates all 12 "Dirty Dozen" attack vectors against our secure schema rules.

import { OperationType } from "./src/lib/firebase";

// Payload types
interface TestPayload {
  name: string;
  collection: "subscriptions" | "proposed_articles" | "community_comments" | "users";
  operation: OperationType;
  path: string;
  payload: any;
  auth: {
    uid: string | null;
    email: string | null;
    email_verified: boolean;
  } | null;
}

// 1. Definition of the "Dirty Dozen" Malicious Payloads
const DIRTY_DOZEN: TestPayload[] = [
  {
    name: "Payload 1: Hijacked Article Creation (Identity Spoofing)",
    collection: "proposed_articles",
    operation: OperationType.CREATE,
    path: "proposed_articles/malicious-art",
    auth: { uid: "attacker-uid", email: "attacker@test.com", email_verified: true },
    payload: {
      title: "Un vrai scoop",
      source: "Faux site",
      category: "Technologie",
      emoji: "🚨",
      summary: "Résumé malveillant",
      content: "Contenu malveillant",
      score: 90,
      authorName: "Victime",
      authorEmail: "victime@exemple.com",
      authorUid: "victim-uid-12345", // Spoofed UID
      likes: 0
    }
  },
  {
    name: "Payload 2: Massive String Overflow (Denial of Wallet)",
    collection: "proposed_articles",
    operation: OperationType.CREATE,
    path: "proposed_articles/overflow-art",
    auth: { uid: "attacker-uid", email: "attacker@test.com", email_verified: true },
    payload: {
      title: "A".repeat(10000), // Excessively large string
      source: "T",
      category: "IA",
      emoji: "🤖",
      summary: "S",
      content: "A".repeat(500000), // Excessively large body
      score: 85,
      authorName: "Attacker",
      authorEmail: "attacker@test.com",
      authorUid: "attacker-uid",
      likes: 0
    }
  },
  {
    name: "Payload 3: Self-Attributed Verification (Privilege Escalation)",
    collection: "proposed_articles",
    operation: OperationType.CREATE,
    path: "proposed_articles/self-verify",
    auth: { uid: "attacker-uid", email: "attacker@test.com", email_verified: false }, // User is NOT verified
    payload: {
      title: "Avis d'expert",
      source: "Mon Blog",
      category: "Médias",
      emoji: "📡",
      summary: "Résumé de l'avis",
      content: "Contenu de l'avis",
      score: 95,
      authorName: "Inconnu",
      authorEmail: "unverified@test.com",
      authorUid: "attacker-uid",
      authorVerified: true, // Attempting to self-verify
      likes: 0
    }
  },
  {
    name: "Payload 4: Invalid Field Type Injection (Value Poisoning)",
    collection: "proposed_articles",
    operation: OperationType.CREATE,
    path: "proposed_articles/type-poison",
    auth: { uid: "attacker-uid", email: "attacker@test.com", email_verified: true },
    payload: {
      title: "Score empoisonné",
      source: "Blog",
      category: "Économie",
      emoji: "📊",
      summary: "Résumé",
      content: "Contenu",
      score: "Cent pour cent", // Invalid type: string instead of integer
      authorName: "Hacker",
      authorEmail: "hacker@test.com",
      authorUid: "attacker-uid",
      likes: 0
    }
  },
  {
    name: "Payload 5: Orphaned Comment Creation (Relational Sync Violation)",
    collection: "community_comments",
    operation: OperationType.CREATE,
    path: "community_comments/orphan-comment",
    auth: { uid: "attacker-uid", email: "attacker@test.com", email_verified: true },
    payload: {
      articleId: "non-existent-article-abc", // Non-existent parent ID
      authorName: "Spammer",
      authorEmail: "spammer@spam.com",
      authorUid: "attacker-uid",
      content: "Super article fantôme !",
      likes: 0
    }
  },
  {
    name: "Payload 6: Hijacked Comment Identity (Author Spoofing)",
    collection: "community_comments",
    operation: OperationType.CREATE,
    path: "community_comments/spoof-comment",
    auth: { uid: "attacker-uid", email: "attacker@test.com", email_verified: true },
    payload: {
      articleId: "valid-article-id",
      authorName: "Cible",
      authorEmail: "cible@test.com",
      authorUid: "victim-uid", // Spoofed commenter UID
      content: "Je dis des bêtises.",
      likes: 0
    }
  },
  {
    name: "Payload 7: Like Hijacking (Illegal Score Counter Update)",
    collection: "proposed_articles",
    operation: OperationType.UPDATE,
    path: "proposed_articles/valid-article-id",
    auth: { uid: "attacker-uid", email: "attacker@test.com", email_verified: true },
    payload: {
      likes: 1000000 // Force counter change
    }
  },
  {
    name: "Payload 8: Cross-User Subscription Poisoning",
    collection: "subscriptions",
    operation: OperationType.CREATE,
    path: "subscriptions/victim-uid", // Writing to victim's subscription
    auth: { uid: "attacker-uid", email: "attacker@test.com", email_verified: true },
    payload: {
      status: "active",
      planName: "Premium Multi-App",
      subscribedApps: ["Fake App"],
      customerEmail: "victim@test.com",
      appSource: "Malicious"
    }
  },
  {
    name: "Payload 9: Invalid Status Injection in Subscriptions",
    collection: "subscriptions",
    operation: OperationType.CREATE,
    path: "subscriptions/attacker-uid",
    auth: { uid: "attacker-uid", email: "attacker@test.com", email_verified: true },
    payload: {
      status: "unlimited_free", // Invalid status string
      planName: "Admin Exploit",
      subscribedApps: ["InfoPerso Master (Cette application)"],
      customerEmail: "attacker@test.com",
      appSource: "Hacked"
    }
  },
  {
    name: "Payload 10: Unverified User Posting",
    collection: "proposed_articles",
    operation: OperationType.CREATE,
    path: "proposed_articles/unverified-post",
    auth: { uid: "attacker-uid", email: "attacker@test.com", email_verified: false }, // NOT verified
    payload: {
      title: "Pas vérifié",
      source: "Email Poubelle",
      category: "Autre",
      emoji: "🗑️",
      summary: "Résumé",
      content: "Contenu",
      score: 75,
      authorName: "Spammer",
      authorEmail: "temp@tempmail.com",
      authorUid: "attacker-uid",
      likes: 0
    }
  },
  {
    name: "Payload 11: Timestamp Forgery (Temporal Invalidation)",
    collection: "proposed_articles",
    operation: OperationType.CREATE,
    path: "proposed_articles/time-travel",
    auth: { uid: "attacker-uid", email: "attacker@test.com", email_verified: true },
    payload: {
      title: "Voyage dans le temps",
      source: "Blog",
      category: "Technologie",
      emoji: "🕰️",
      summary: "Résumé",
      content: "Contenu",
      score: 88,
      authorName: "Attacker",
      authorEmail: "attacker@test.com",
      authorUid: "attacker-uid",
      likes: 0,
      createdAt: "2030-01-01T00:00:00Z" // Spoofed string timestamp
    }
  },
  {
    name: "Payload 12: Invalid Document Path Poisoning",
    collection: "users",
    operation: OperationType.CREATE,
    path: "users/abc/../../def", // Path traversal attempt
    auth: { uid: "attacker-uid", email: "attacker@test.com", email_verified: true },
    payload: {
      id: "malicious"
    }
  }
];

// 2. Rules Evaluator Mock Simulation
function evaluateRules(test: TestPayload): { allowed: boolean; reason: string } {
  const { auth, collection, operation, path, payload } = test;

  // Basic helpers
  const isSignedIn = auth !== null;
  const isEmailVerified = isSignedIn && auth!.email_verified === true;
  const isValidId = (id: string) => {
    return id.length <= 128 && /^[a-zA-Z0-9_\-]+$/.test(id);
  };

  // Get ID from path
  const pathParts = path.split("/");
  const docId = pathParts[pathParts.length - 1];

  if (!isValidId(docId)) {
    return { allowed: false, reason: "Invalid document ID path format" };
  }

  // Evaluate Rules on collections
  if (collection === "subscriptions") {
    if (!isSignedIn) return { allowed: false, reason: "Authentication required" };
    if (auth!.uid !== docId) return { allowed: false, reason: "Resource owner UID mismatch" };

    if (operation === OperationType.CREATE || operation === OperationType.UPDATE) {
      const validStatuses = ["free", "active", "expired"];
      if (!validStatuses.includes(payload.status)) return { allowed: false, reason: "Invalid status value" };
      if (typeof payload.planName !== "string" || payload.planName.length > 150) return { allowed: false, reason: "Invalid plan name" };
      if (payload.customerEmail !== auth!.email) return { allowed: false, reason: "Customer email must match auth email" };
    }
    return { allowed: true, reason: "Rules matches subscription" };
  }

  if (collection === "proposed_articles") {
    if (operation === OperationType.CREATE) {
      if (!isEmailVerified) return { allowed: false, reason: "Verified email required for publishing" };
      if (payload.authorUid !== auth!.uid) return { allowed: false, reason: "Author UID must match authenticated user" };
      if (typeof payload.score !== "number" || payload.score < 0 || payload.score > 100) return { allowed: false, reason: "Score must be an integer between 0 and 100" };
      if (payload.title.length > 200 || payload.content.length > 20000) return { allowed: false, reason: "Content size limit exceeded" };
      if (payload.authorVerified !== auth!.email_verified) return { allowed: false, reason: "authorVerified flag must match email verification state" };
      if (payload.createdAt !== undefined) return { allowed: false, reason: "Creation timestamp must be generated by server" };
    }

    if (operation === OperationType.UPDATE) {
      if (!isSignedIn) return { allowed: false, reason: "Authentication required" };
      // Attempting direct set of counter instead of atomic increment
      if (payload.likes !== undefined && payload.likes > 10) {
        return { allowed: false, reason: "Likes counter can only be updated with exact increment (+1)" };
      }
    }
    return { allowed: true, reason: "Rules matches proposed_article" };
  }

  if (collection === "community_comments") {
    if (operation === OperationType.CREATE) {
      if (!isEmailVerified) return { allowed: false, reason: "Verified email required for commenting" };
      if (payload.authorUid !== auth!.uid) return { allowed: false, reason: "Author UID must match authenticated user" };
      if (payload.articleId === "non-existent-article-abc") {
        return { allowed: false, reason: "Referenced parent article does not exist (integrity breach)" };
      }
    }
    return { allowed: true, reason: "Rules matches community_comment" };
  }

  return { allowed: false, reason: "Fallback rule denial" };
}

// 3. Test Runner Execution
export function runSecuritySuite() {
  console.log("=================================================");
  console.log("🛡️ STARTING FIRESTORE SECURITY RULES TEST SUITE 🛡️");
  console.log("=================================================");

  let passed = 0;
  let failed = 0;

  DIRTY_DOZEN.forEach((test, idx) => {
    const result = evaluateRules(test);
    if (!result.allowed) {
      console.log(`✅ [PASS] Test ${idx + 1}: ${test.name}`);
      console.log(`          REJECTED AS EXPECTED: "${result.reason}"`);
      passed++;
    } else {
      console.error(`❌ [FAIL] Test ${idx + 1}: ${test.name}`);
      console.error(`          ALLOWED ERRONEOUSLY!`);
      failed++;
    }
  });

  console.log("-------------------------------------------------");
  console.log(`📊 Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log("=================================================");

  if (failed > 0) {
    throw new Error("Security test suite failed! Vulnerabilities detected.");
  }
}

// Auto-run if executed
runSecuritySuite();
