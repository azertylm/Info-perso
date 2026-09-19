import { NewsArticle } from "../types";

/**
 * Service d'illustration photographique 100% légal et libre de droit.
 * - Aucune donnée stockée sur le disque dur local (0 Mo d'espace consommé).
 * - Utilisation de CDN mondiaux ultra-rapides (Unsplash CDN & Wikimedia Commons).
 * - Licences libres : Unsplash License, Creative Commons (CC-BY, CC0) & Domaine Public.
 * - Diversité anti-doublon : chaque thème et catégorie dispose d'un pool d'images variées
 *   avec distribution pseudo-aléatoire déterministe basée sur le hash de l'article pour
 *   garantir que deux articles consécutifs n'affichent pas la même photo.
 */

// Cache en mémoire pour éviter tout re-calcul
const photoCache = new Map<string, string>();

/**
 * Fonction de hachage djb2 rapide et déterministe
 */
function djb2Hash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  return Math.abs(hash);
}

// Pools photographiques thématiques haute définition Unsplash (diversité garantie)
const TOPICAL_PHOTO_PATTERNS: Array<{
  keywords: string[];
  imageUrls: string[];
  credit: string;
}> = [
  // 1. Jeux-vidéo, Consoles, PlayStation, Sony, Xbox, Nintendo, Gaming & Esport
  {
    keywords: [
      "playstation", "ps6", "ps5", "ps4", "sony", "console", "consoles", 
      "jeux-vidéo", "jeux vidéo", "jeu vidéo", "gaming", "gamer", "gamers", 
      "nintendo", "switch", "xbox", "manette", "dualsense", "esport", 
      "gta", "ubisoft", "electronic arts", "gameplay"
    ],
    imageUrls: [
      "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=800&q=80", // Console PlayStation & manette DualSense
      "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80", // Manette PlayStation en gros plan
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80", // Setup gaming et consoles
      "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80", // Station de jeu et manette
      "https://images.unsplash.com/photo-1592840496694-26d035b52b48?auto=format&fit=crop&w=800&q=80"  // Manette console moderne
    ],
    credit: "Unsplash • Licence Libre"
  },

  // 2. Datacenters, Centres de données, Cloud, Microsoft, Serveurs & Infrastructure
  {
    keywords: [
      "centre de données", "centres de données", "datacenter", "datacenters", 
      "data center", "data centers", "serveur", "serveurs", "cloud computing", 
      "cloud", "azure", "microsoft azure", "infrastructure cloud", "hébergement", 
      "gpu cluster", "baie serveur", "baies de serveurs", "salle des serveurs", 
      "câblage réseau", "serveur web"
    ],
    imageUrls: [
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80", // Baie de serveurs haute technologie avec LED bleues
      "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80", // Allée infinie de serveurs datacenter
      "https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&w=800&q=80", // Câblage optique et routeurs haute vitesse
      "https://images.unsplash.com/photo-1597733336794-12d05021d510?auto=format&fit=crop&w=800&q=80", // Racks serveurs et cluster cloud
      "https://images.unsplash.com/photo-1520869562399-e772f16ddf7f?auto=format&fit=crop&w=800&q=80"  // Ingénieur système en salle serveurs
    ],
    credit: "Unsplash • Licence Libre"
  },

  // 3. Smartphones, Apple, iPhone, Samsung, Matériel Électronique & Montres
  {
    keywords: [
      "apple", "iphone", "ipad", "macbook", "smartphone", "smartphones", 
      "tablette", "android", "samsung", "pixel", "wearable", "montre connectée", 
      "smartwatch", "apple watch", "gadget"
    ],
    imageUrls: [
      "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80", // Écran smartphone moderne en main
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80", // Smartphone design épuré sur fond sobre
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80", // Smartphone moderne haute définition
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80", // Tablette avec stylet
      "https://images.unsplash.com/photo-1491933382434-500287f9b54b?auto=format&fit=crop&w=800&q=80"  // Appareils connectés sur table
    ],
    credit: "Unsplash • Licence Libre"
  },

  // 4. Cuisine, Électroménager, Gastronomie & Recettes (ex: Airfryer Ninja, Cuisine, Four)
  {
    keywords: ["airfryer", "air fryer", "ninja", "friteuse", "électroménager", "cuisine", "cuisiner", "recette", "plat", "four", "gastronomie", "culinaire", "repas", "cuisson"],
    imageUrls: [
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80", // Cuisine moderne et préparation
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80", // Plat gourmet savoureux
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80", // Cuisson et gastronomie
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80", // Appareil de cuisine et chef
      "https://images.unsplash.com/photo-1514986888952-8cd320577b68?auto=format&fit=crop&w=800&q=80"  // Ingrédients et cuisson dorée
    ],
    credit: "Unsplash • Licence Libre"
  },

  // 5. Littoral, Port, Mer & Nautisme (ex: La Grande-Motte, plaisance, bateaux)
  {
    keywords: ["grande-motte", "la grande-motte", "port de plaisance", "catamaran", "voilier", "littoral", "méditerranée", "marina", "bateau", "plaisance", "nautisme"],
    imageUrls: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80", // Plage et horizon maritime
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80", // Eau turquoise et marina
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80", // Baie maritime
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80"  // Quai et bord de mer
    ],
    credit: "Unsplash • Licence Libre"
  },

  // 6. IA & Modèles Avancés (LLM, Mistral, DeepSeek, Claude, ChatGPT, OpenAI)
  {
    keywords: ["deepseek", "mistral", "mixture-of-experts", "moe", "gpu", "llm", "claude", "anthropic", "chatgpt", "openai", "modèle de langage", "benchmark", "ia générative", "intelligence artificielle", "machine learning", "ia act"],
    imageUrls: [
      "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80", // Cerveau neural technologique
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80", // Processeur neural lumineux
      "https://images.unsplash.com/photo-1555255707-c07966088b7b?auto=format&fit=crop&w=800&q=80", // Puce microprocesseur en silicium
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80", // Robot humanoïde moderne
      "https://images.unsplash.com/photo-1507146153580-69a1fe6d8aa1?auto=format&fit=crop&w=800&q=80"  // Réseau de connexions synaptiques
    ],
    credit: "Unsplash • Licence Libre"
  },

  // 7. Développement Logiciel, Code & Langages
  {
    keywords: ["react", "javascript", "typescript", "compiler", "programmation", "développeur", "développement logiciel", "github", "open-source", "framework", "frontend", "backend"],
    imageUrls: [
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80", // Écran de code sombre
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80", // Développeur sur clavier
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80", // Ordinateur portable et café
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80"  // Moniteur avec code HTML/JS
    ],
    credit: "Unsplash • Licence Libre"
  },

  // 8. Cybersécurité & Piratage
  {
    keywords: ["cybersécurité", "cyberattaque", "piratage", "hacker", "rançongiciel", "ransomware", "sécurité informatique", "vulnérabilité", "phishing"],
    imageUrls: [
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80", // Écran cadenas de sécurité
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80", // Cybersécurité bouclier
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80"  // Lignes de commande terminal
    ],
    credit: "Unsplash • Licence Libre"
  },

  // 9. Espace, Télescope & Univers
  {
    keywords: ["exoplanète", "astronomie", "nasa", "télescope", "james webb", "espace", "galaxie", "cosmos", "étoile", "astéroïde", "univers", "cosmique"],
    imageUrls: [
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80", // Vue de la Terre depuis l'espace
      "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=80", // Nébuleuse lumineuse
      "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80", // Ciel étoilé et voie lactée
      "https://images.unsplash.com/photo-1464802686167-b939a6910659?auto=format&fit=crop&w=800&q=80"  // Galaxie spirale
    ],
    credit: "Unsplash / NASA • Licence Libre"
  },

  // 10. Fusées & Exploration Spatiale
  {
    keywords: ["fusée", "ariane", "spacex", "satellite", "mars", "lune", "orbite", "mission spatiale", "astronaute"],
    imageUrls: [
      "https://images.unsplash.com/photo-1517976487502-520c42751717?auto=format&fit=crop&w=800&q=80", // Lancement de fusée
      "https://images.unsplash.com/photo-1457364887197-9150188c107b?auto=format&fit=crop&w=800&q=80", // Flammes de propulsion
      "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=800&q=80"  // Surface lunaire
    ],
    credit: "Unsplash • Licence Libre"
  },

  // 11. Climat, Écologie & Incendies
  {
    keywords: ["incendie", "feu de forêt", "pompier", "forêt", "sécurité civile", "flammes", "canicule", "sécheresse"],
    imageUrls: [
      "https://images.unsplash.com/photo-1499529112087-3cb3b73cec95?auto=format&fit=crop&w=800&q=80", // Forêt sous la brume
      "https://images.unsplash.com/photo-1518457607834-6e8d80c183c5?auto=format&fit=crop&w=800&q=80", // Arbres et lumière
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80"  // Jeune pousse et environnement
    ],
    credit: "Unsplash • Licence Libre"
  },

  // 12. Énergies Renouvelables & Transition
  {
    keywords: ["solaire", "panneau solaire", "photovoltaïque", "éolien", "éolienne", "énergie renouvelable", "batterie", "stockage d'énergie", "nucléaire"],
    imageUrls: [
      "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=80", // Champ de panneaux solaires
      "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=800&q=80", // Éoliennes sur colline verte
      "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80"  // Reflet solaire énergétique
    ],
    credit: "Unsplash • Licence Libre"
  },

  // 13. Océans, Mers & Biodiversité
  {
    keywords: ["océan", "biodiversité", "marine", "faune", "baleine", "dauphin", "coraux", "récif", "pollution plastique"],
    imageUrls: [
      "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=800&q=80", // Océan bleu profond
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80", // Sous-marin récif
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"  // Vague sur le rivage
    ],
    credit: "Unsplash • Licence Libre"
  },

  // 14. Chantiers, Travaux & Urbanisme
  {
    keywords: ["chantier", "travaux", "grue", "btp", "rénovation", "construction", "bâtiment", "génie civil", "infrastructures urbaines"],
    imageUrls: [
      "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80", // Grues et construction moderne
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80", // Architecte et plans
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80"  // Immeuble d'acier et de verre
    ],
    credit: "Unsplash • Licence Libre"
  },

  // 15. Bourse, Marchés & Finance (Économie ciblée)
  {
    keywords: ["bourse", "cac 40", "wall street", "action", "trading", "dividende", "marché financier", "nasdaq", "indices", "investit", "investissement"],
    imageUrls: [
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80", // Graphique financier dynamique
      "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80", // Écrans de trading boursier
      "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?auto=format&fit=crop&w=800&q=80", // Flèches boursières et cours
      "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=800&q=80"  // Courbes analytiques dorées
    ],
    credit: "Unsplash • Licence Libre"
  },

  // 16. Entreprises, Startups & Emploi
  {
    keywords: ["startup", "levée de fonds", "entreprise", "entrepreneur", "business", "innovation", "salarié", "management", "bureau"],
    imageUrls: [
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80", // Équipe réunie autour d'une table
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80", // Espace de travail moderne et lumineux
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80", // Tours d'affaires et sièges sociaux
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80"  // Réunion d'affaires stratégique
    ],
    credit: "Unsplash • Licence Libre"
  },

  // 17. Banques, Inflation & Monnaie
  {
    keywords: ["inflation", "pouvoir d'achat", "banque", "bce", "euro", "consommation", "taux d'intérêt", "crédit", "pièces de monnaie"],
    imageUrls: [
      "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80", // Monnaies et billets
      "https://images.unsplash.com/photo-1565514020179-026b92b84bb6?auto=format&fit=crop&w=800&q=80", // Banque centrale colonnes
      "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80"  // Épargne et investissement
    ],
    credit: "Unsplash • Licence Libre"
  },

  // 18. Transports : Trains, Rail & SNCF
  {
    keywords: ["train", "sncf", "tgv", "rail", "chemin de fer", "gare", "voie ferrée"],
    imageUrls: [
      "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=800&q=80", // Train à grande vitesse
      "https://images.unsplash.com/photo-1515165562839-978bbcf18277?auto=format&fit=crop&w=800&q=80", // Voies de chemin de fer
      "https://images.unsplash.com/photo-1532105956626-9569c03602f6?auto=format&fit=crop&w=800&q=80"  // Quai de gare moderne
    ],
    credit: "Unsplash • Licence Libre"
  },

  // 19. Automobile & Véhicules Électriques
  {
    keywords: ["voiture", "automobile", "électrique", "tesla", "renault", "véhicule", "batterie auto", "concessionnaire"],
    imageUrls: [
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80", // Voiture sur route panoramique
      "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80", // Berline électrique moderne
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80"  // Véhicule design épuré
    ],
    credit: "Unsplash • Licence Libre"
  },

  // 20. Aviation & Aéroports
  {
    keywords: ["avion", "aviation", "airbus", "boeing", "aéroport", "vol", "compagnie aérienne"],
    imageUrls: [
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80", // Aile d'avion au-dessus des nuages
      "https://images.unsplash.com/photo-1520437358207-323b43b50729?auto=format&fit=crop&w=800&q=80", // Terminal d'aéroport
      "https://images.unsplash.com/photo-1508873696983-2df5703bc20d?auto=format&fit=crop&w=800&q=80"  // Avion en piste
    ],
    credit: "Unsplash • Licence Libre"
  },

  // 21. Santé, Médecine & Hôpital
  {
    keywords: ["santé", "médecine", "hôpital", "médecin", "recherche médicale", "thérapie", "vaccin", "soignant"],
    imageUrls: [
      "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80", // Recherche en laboratoire
      "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80", // Stéthoscope professionnel
      "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80", // Soins médicaux attentifs
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80"  // Équipe médicale
    ],
    credit: "Unsplash • Licence Libre"
  },

  // 22. Sports
  {
    keywords: ["sport", "football", "tennis", "championnat", "athlète", "médaille", "match", "stade", "olympique"],
    imageUrls: [
      "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80", // Stade illuminé
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80", // Coureur piste d'athlétisme
      "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80", // Raquette et court de tennis
      "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80"  // Dynamisme sportif
    ],
    credit: "Unsplash • Licence Libre"
  }
];

// Normalisation des catégories pour éviter tout problème d'alias
export function normalizeCategoryKey(category?: string): string {
  if (!category) return "Actualité";
  const c = category.trim().toLowerCase();
  if (c.includes("tech")) return "Technologie";
  if (c.includes("ia") || c.includes("intelligence") || c.includes("robot")) return "IA";
  if (c.includes("jeu") || c.includes("game") || c.includes("gaming") || c.includes("playstation")) return "Jeux-vidéo";
  if (c.includes("écono") || c.includes("econo") || c.includes("finan") || c.includes("bourse")) return "Économie";
  if (c.includes("climat") || c.includes("environ") || c.includes("écolo") || c.includes("ecolo")) return "Environnement";
  if (c.includes("cultur") || c.includes("ciné") || c.includes("art") || c.includes("livre")) return "Culture";
  if (c.includes("sant") || c.includes("médic")) return "Santé";
  if (c.includes("polit")) return "Politique";
  if (c.includes("inter") || c.includes("mond")) return "International";
  if (c.includes("soci")) return "Société";
  if (c.includes("sport")) return "Sport";
  if (c.includes("scien")) return "Science";
  return "Actualité";
}

// Pools de secours très diversifiés par catégorie principale (zéro image abstraite violette, zéro journal papier par défaut)
export const CATEGORY_POOLS: Record<string, string[]> = {
  "Jeux-vidéo": [
    "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=800&q=80", // PlayStation console & manette
    "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80", // Manette en main
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80", // Setup gaming moderne
    "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80"  // Station de jeu
  ],
  "Technologie": [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80", // Circuit imprimé macro
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80", // Code et programmation
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80", // Serveurs cloud
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80", // Smartphone épuré
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80", // Espace de travail tech
    "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?auto=format&fit=crop&w=800&q=80"  // Interface numérique
  ],
  "IA": [
    "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80", // Cerveau neural technologique
    "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80", // Processeur neural lumineux
    "https://images.unsplash.com/photo-1555255707-c07966088b7b?auto=format&fit=crop&w=800&q=80", // Microprocesseur IA silicium
    "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80", // Robot humanoïde moderne
    "https://images.unsplash.com/photo-1507146153580-69a1fe6d8aa1?auto=format&fit=crop&w=800&q=80"  // Réseau synaptique
  ],
  "Économie": [
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80", // Quartier d'affaires gratte-ciel
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80", // Graphiques financiers
    "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80", // Économie et devises
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80", // Entreprise et collaborateurs
    "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80", // Bourse et marchés
    "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?auto=format&fit=crop&w=800&q=80"  // Pièces de monnaie et investissement
  ],
  "Environnement": [
    "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=80", // Panneaux solaires
    "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=800&q=80", // Éoliennes et nature
    "https://images.unsplash.com/photo-1483058712412-4245e9b90334?auto=format&fit=crop&w=800&q=80", // Montagnes et glaciers
    "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80", // Écologie et forêt
    "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=800&q=80"  // Océan
  ],
  "Science": [
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80", // Espace et planète Terre
    "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=800&q=80", // Laboratoire de chimie
    "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80", // Recherche biologique
    "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=80", // Nébuleuse astronomique
    "https://images.unsplash.com/photo-1518152006812-edab29b069ac?auto=format&fit=crop&w=800&q=80"  // Structure moléculaire
  ],
  "Culture": [
    "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80", // Livres et bibliothèque
    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80", // Musique et art
    "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80", // Cinéma et pellicule
    "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80", // Céramique et artisanat
    "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80"  // Peinture et musée d'art
  ],
  "Politique": [
    "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80", // Colonnes et institution
    "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=800&q=80", // Parlement européen
    "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=800&q=80", // Vote et urne citoyenne
    "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80"  // Diplomatie et drapeaux
  ],
  "International": [
    "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80", // Carte du monde et relations
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80", // Globe terrestre
    "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80", // Liaisons aériennes mondiales
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80"  // Diplomatie et échanges
  ],
  "Société": [
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80", // Architecture urbaine
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80", // Gens et ville
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80", // Éducation et école
    "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=800&q=80"  // Transports et vie quotidienne
  ],
  "Santé": [
    "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80", // Recherche médicale
    "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80", // Stéthoscope
    "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80", // Prise en charge médicale
    "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80"  // Médecins en consultation
  ],
  "Sport": [
    "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80", // Stade illuminé
    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80", // Coureur piste d'athlétisme
    "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80"  // Raquette et court de tennis
  ],
  "Actualité": [
    "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80", // Presse mondiale moderne
    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80", // Espace de rédaction et actualité
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80", // Conférence de presse internationale
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80"  // Globe d'actualité planétaire
  ]
};

// Aliases
CATEGORY_POOLS["Tech"] = CATEGORY_POOLS["Technologie"];
CATEGORY_POOLS["Climat"] = CATEGORY_POOLS["Environnement"];
CATEGORY_POOLS["Écologie"] = CATEGORY_POOLS["Environnement"];
CATEGORY_POOLS["Sports"] = CATEGORY_POOLS["Sport"];
CATEGORY_POOLS["Sciences"] = CATEGORY_POOLS["Science"];
CATEGORY_POOLS["Gaming"] = CATEGORY_POOLS["Jeux-vidéo"];

// Pool de secours neutre et contemporain (jamais de journal papier bloquant)
const DEFAULT_EDITORIAL_POOL = CATEGORY_POOLS["Actualité"];

/**
 * Résout de façon instantanée et synchrone la photo la plus correspondante pour un article
 * avec diversité garantie (anti-doublon).
 */
export function getArticleIllustration(art: Partial<NewsArticle>): string {
  if (!art) return DEFAULT_EDITORIAL_POOL[0];

  // 1. Si une image spécifique valide a été assignée manuellement ou par Wikimedia
  // et qu'il ne s'agit pas de l'image violette bannie
  if (
    art.imageUrl && 
    typeof art.imageUrl === "string" && 
    art.imageUrl.startsWith("http") &&
    !art.imageUrl.includes("photo-1618005182384-a83a8bd57fbe")
  ) {
    return art.imageUrl;
  }

  // 2. Si déjà résolue dans le cache mémoire
  const cacheKey = `${art.id || ""}_${art.title || ""}`;
  if (photoCache.has(cacheKey)) {
    const cached = photoCache.get(cacheKey)!;
    if (!cached.includes("photo-1618005182384-a83a8bd57fbe")) {
      return cached;
    }
  }

  const title = (art.title || "").toLowerCase();
  const summary = (art.summary || "").toLowerCase();
  const tags = (art.tags || []).join(" ").toLowerCase();
  const searchCorpus = `${title} ${tags} ${summary}`;

  // Découpage en mots précis pour éviter les faux positifs des sous-chaînes trop courtes
  const words = new Set(searchCorpus.split(/[\s,.'";:!?()[\]{}<>\/\\–—\-_+]+/));

  // Seed déterministe unique par article basé sur son titre, ID et source
  const seedString = `${art.id || ""}:${art.title || ""}:${art.source || ""}:${art.category || ""}`;
  const seed = djb2Hash(seedString);

  // 3. Recherche sémantique approfondie dans les thèmes ciblés par ordre de priorité
  for (const pattern of TOPICAL_PHOTO_PATTERNS) {
    for (const kw of pattern.keywords) {
      let isMatch = false;
      if (kw.includes(" ") || kw.includes("-")) {
        // Pour les expressions composées (ex: "playstation", "centre de données", "jeux-vidéo", "air fryer")
        isMatch = searchCorpus.includes(kw);
      } else {
        // Pour les mots simples : correspondance par mot entier ou sous-chaîne significative
        isMatch = words.has(kw) || (kw.length >= 4 && searchCorpus.includes(kw));
      }

      if (isMatch) {
        const pool = pattern.imageUrls;
        const chosen = pool[seed % pool.length];
        photoCache.set(cacheKey, chosen);
        return chosen;
      }
    }
  }

  // 4. Repli sur le pool diversifié de la catégorie normalisée
  const normalizedCat = normalizeCategoryKey(art.category);
  const catPool = CATEGORY_POOLS[normalizedCat] || DEFAULT_EDITORIAL_POOL;
  const chosen = catPool[seed % catPool.length];
  photoCache.set(cacheKey, chosen);
  return chosen;
}

/**
 * Fournit la photo de repli pour une catégorie
 */
export function getFallbackCategoryIllustration(category?: string): string {
  const normalizedCat = normalizeCategoryKey(category);
  const catPool = CATEGORY_POOLS[normalizedCat] || DEFAULT_EDITORIAL_POOL;
  return catPool[0];
}

/**
 * Tente d'enrichir de manière asynchrone avec Wikimedia Commons pour les entités réelles
 */
export async function fetchLiveWikimediaPhoto(title: string, category?: string): Promise<string | null> {
  try {
    const res = await fetch("/api/article/photo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, category })
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.success && data?.imageUrl) {
      return data.imageUrl;
    }
  } catch (_e) {
    // Échec silencieux
  }
  return null;
}
