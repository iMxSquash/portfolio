# Checklist de revue manuelle — par catégorie

Liste exhaustive chargée depuis la Phase 2 du SKILL. Chaque section : le **motif à traquer**,
des **commandes de repérage** (adapter au langage détecté), et le **critère de vulnérabilité**.
Traque le motif dangereux, pas le mot-clé. Suis toujours la donnée non fiable jusqu'au sink.

---

## A01 — Broken Access Control (le plus fréquent, le plus grave)

**IDOR / autorisation manquante.** Le contrôle d'accès horizontal (accéder aux données d'un autre user) et vertical (accéder à une action d'un rôle supérieur) est la faille n°1.

```bash
grep -rEn "req\.(params|query|body)\.(id|user_?id|account)|/:id" --include=*.{ts,js,py,go,java,rb,php} . | grep -v node_modules
```

- Toute requête DB filtre par l'identité issue **du token vérifié serveur** (`req.user.id`), jamais d'un id fourni par le client. Un `WHERE id = $paramFromUrl` sans `AND user_id = $fromToken` = IDOR.
- Chaque route mutante/sensible a un middleware d'authz **avant** le handler. Cherche les routes qui l'oublient (comparer route par route).
- Les vérifications de rôle sont côté serveur, jamais seulement dans l'UI. Pas de « sécurité par obscurité » (endpoint caché mais non protégé).
- Élévation via mass assignment : un `User.update(req.body)` qui laisse passer `role`/`isAdmin`/`user_id`. Cherche les affectations en masse d'objets requête vers modèles.
- Path traversal : `req` → `fs.readFile`/`sendFile`/`open(path)` sans normalisation ni allowlist (`../../etc/passwd`).
- CORS trop permissif : `origin: '*'` **avec** `credentials: true`, ou reflet non validé de l'`Origin`.

## A02 — Cryptographic Failures

```bash
grep -rEn "md5|sha1|createCipher\b|DES|RC4|ECB|Math\.random|http://" --include=*.{ts,js,py,go,java,rb,php} . | grep -v node_modules
```

- Mots de passe : hash **lent et salé** (bcrypt/argon2/scrypt/PBKDF2), jamais MD5/SHA1/SHA256 nu. bcrypt ≥ 10 rounds.
- Comparaison de secrets/tokens en **temps constant** (`crypto.timingSafeEqual`, `hmac.compare`), pas `==`.
- Aléa cryptographique (`crypto.randomBytes`, `secrets`) pour tokens/CSRF/mots de passe temporaires — jamais `Math.random`.
- Pas de chiffrement maison ; AES-GCM/ChaCha20 et non ECB. IV/nonce aléatoire et unique.
- Données sensibles en transit : HTTPS forcé (HSTS), pas d'URL `http://` en dur vers des services sensibles.
- Secrets au repos : chiffrés ou dans un gestionnaire (Vault, KMS, secrets du CI), pas dans la DB en clair.

## A03 — Injection

**SQL / NoSQL.**

```bash
grep -rEn "query\(\`|query\('.*\+|execute\(.*%|f\"SELECT|f'SELECT|\.raw\(|\\\$where|\{\s*\\\$" --include=*.{ts,js,py,go,java,rb,php} . | grep -v node_modules
```

- SQL : requêtes **paramétrées** partout (`$1`, `?`, placeholders nommés). Toute concaténation/template avec une entrée = critique. Noms de table/colonne dynamiques → allowlist stricte, jamais l'entrée directe.
- NoSQL (Mongo) : un objet utilisateur passé tel quel dans un filtre permet `{$ne:null}`, `{$gt:''}`. Caster/valider les types avant la requête.
- ORM : attention aux échappatoires (`.raw()`, `sequelize.literal`, `queryRaw`) qui rouvrent l'injection.

**Command / OS injection.**

```bash
grep -rEn "exec\(|execSync|spawn\(|system\(|popen|os\.system|subprocess.*shell=True|child_process|Runtime\.exec|`.*\\\$" --include=*.{ts,js,py,go,java,rb,php} . | grep -v node_modules
```

- Jamais d'entrée utilisateur dans une commande shell. Utiliser les formes tableau d'arguments (`execFile`, `spawn` sans `shell:true`, `subprocess.run([...], shell=False)`).

**Autres injections.** LDAP, XPath, template (SSTI : entrée dans `render_template_string`, `eval` de template), en-têtes (CRLF injection dans les redirections/headers), log injection.

## A04 — Insecure Design

- Logique métier : opérations financières/de points/de quota vérifient les invariants côté serveur (pas de solde négatif, pas de prix venant du client, pas de quantité négative).
- Workflows multi-étapes : impossible de sauter une étape en appelant directement l'endpoint final (ex. valider un paiement sans l'avoir initié).
- Rate limiting / anti-abus sur les fonctions coûteuses ou sensibles (login, reset password, envoi d'email/SMS, endpoints de calcul lourd).
- **Race conditions / TOCTOU** : un check puis une action non atomiques sur une ressource partagée (double-spend de points, double inscription, dépassement de stock). Chercher `check-then-act` sans transaction/verrou (`SELECT` puis `UPDATE` hors transaction, incréments non atomiques).

## A05 — Security Misconfiguration

```bash
grep -rEn "debug\s*=\s*true|DEBUG\s*=|NODE_ENV|app\.use\(helmet|cors\(|X-Powered-By|trust proxy" --include=*.{ts,js,py,go,java,rb,php,env,yml,yaml} . | grep -v node_modules
```

- Mode debug/verbose désactivé en prod ; pas de stack trace renvoyée au client (fuite de chemins, versions, requêtes SQL).
- Headers de sécurité présents : `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options`/frame-ancestors, `Strict-Transport-Security`, `Referrer-Policy`. Bannière serveur masquée (`X-Powered-By` off).
- Endpoints d'admin/debug/actuator/metrics/swagger non exposés publiquement en prod sans auth.
- Défauts durcis : comptes par défaut supprimés, listing de répertoire off, méthodes HTTP inutiles (TRACE) désactivées.
- CORS : origine explicite en allowlist, pas de wildcard avec credentials.
- Uploads : type MIME **et** contenu validés, taille bornée, stockés hors webroot, noms de fichiers régénérés, exécution désactivée sur le dossier.

## A06 — Vulnerable & Outdated Components (supply chain)

- Résultats de `npm/pip/go` audit de la Phase 1 : traiter les CVE **exploitables dans le contexte** (une CVE dans une dép de dev non déployée ≠ une CVE dans une dép runtime exposée).
- Lockfile committé et intègre. Pas de dépendance pointant sur une branche git/URL arbitraire.
- Dépendances récemment ajoutées dans le diff : typosquatting (nom proche d'un package connu), mainteneur inconnu, package quasi vide qui exfiltre à l'install (`postinstall` suspect).

```bash
grep -rEn "\"(preinstall|postinstall|install)\"\s*:" package.json 2>/dev/null
```

## A07 — Identification & Authentication Failures

```bash
grep -rEn "jwt\.(sign|verify)|session|cookie\(|setCookie|bcrypt|passport|OAuth|refresh" --include=*.{ts,js,py,go,java,rb,php} . | grep -v node_modules
```

- **JWT** : algorithme fixé côté serveur (rejeter `alg:none` et la confusion RS256→HS256) ; signature **vérifiée** avant usage ; `exp` court sur l'access token ; payload minimal (id + rôle, pas de PII/secret) ; secret fort (≥ 32 octets aléatoires), hors du code.
- **Cookies de session/refresh** : `HttpOnly`, `Secure`, `SameSite=Strict|Lax`. Refresh token révocable côté serveur (stocké/listé), rotation à l'usage.
- **Login** : réponse identique pour « user inconnu » et « mot de passe faux » (anti-énumération) ; rate-limit + lockout progressif ; MFA si actifs sensibles.
- **Reset password** : token à usage unique, expirant, aléatoire crypto, invalidé après usage ; pas d'oracle d'existence de compte.
- **Fixation de session** : régénérer l'identifiant de session à l'élévation de privilège (post-login).
- Pas de secret/token loggé, pas de token en URL (fuite via referer/logs), jamais en `localStorage` si XSS possible.

## A08 — Software & Data Integrity Failures

```bash
grep -rEn "pickle|yaml\.load\b|unserialize|Marshal\.load|readObject|JSON\.parse\(.*req|eval\(|Function\(|deserialize" --include=*.{ts,js,py,go,java,rb,php} . | grep -v node_modules
```

- **Désérialisation non sûre** : `pickle.loads`, `yaml.load` (sans `SafeLoader`), `unserialize` PHP, Java `readObject` sur données non fiables = RCE. Utiliser des formats de données (JSON) et des loaders sûrs.
- `eval`/`new Function`/`exec` sur de l'entrée = critique.
- Intégrité des mises à jour/CI : artefacts signés, pas de `curl | bash` d'une source non épinglée dans les pipelines.

## A09 — Security Logging & Monitoring Failures

- Les événements de sécurité (login échoué/réussi, changement de privilège, accès refusé, suppression de données) sont journalisés — **sans** logger de secrets, mots de passe, tokens, PII brute ni données GPS nominatives.
- Les erreurs sont capturées côté serveur mais renvoient un message générique au client.
- Pas de log injection (CRLF dans les valeurs loggées).

## A10 — Server-Side Request Forgery (SSRF)

```bash
grep -rEn "fetch\(|axios\.|requests\.(get|post)|http\.get|urllib|HttpClient|file_get_contents|curl_exec" --include=*.{ts,js,py,go,java,rb,php} . | grep -v node_modules
```

- Toute URL sortante construite depuis une entrée utilisateur (webhook, avatar par URL, import distant, proxy) : valider le schéma (`https` only), résoudre et **bloquer les IP internes/privées** (169.254.169.254 métadonnées cloud, 127.0.0.0/8, 10/8, 172.16/12, 192.168/16, `::1`), interdire les redirections vers ces plages, timeouts stricts. Allowlist de domaines si possible.

## Transversal — Entrées & sorties

- **Validation en entrée** : tout body/query/param/header consommé passe par un schéma strict (type, bornes, longueur, enum, format) au plus près du point d'entrée. Fail-closed (rejeter par défaut).
- **Encodage en sortie (XSS)** : donnée réfléchie/stockée rendue dans du HTML → échappée par le moteur de template ; en React, traquer `dangerouslySetInnerHTML` ; jamais `innerHTML`/`document.write` avec de l'entrée. Réponses API en `application/json` avec `nosniff`.
- **Open redirect** : `res.redirect(req.query.next)` sans allowlist.
- **Secrets** : aucun en dur (Phase 1). Fail-fast au démarrage si une variable d'env obligatoire manque. `.env` gitignored.
- **Mass assignment / injection de paramètres** : allowlist des champs modifiables, jamais l'objet requête brut vers l'ORM.

---

## Invariants elwen.dev (portfolio macOS + apps Adobe — Next.js + Supabase)

Ces règles viennent du projet et sont **non négociables** :

### Supabase — la clé `anon` est PUBLIQUE : toute la sécurité vit dans les policies

- **RLS activé sur TOUTES les tables** (`projects`, `artworks`, `videos`, …). Une table sans RLS avec la clé anon = lecture/écriture publique mondiale.
  ```sql
  select tablename from pg_tables where schemaname='public'
    and tablename not in (select tablename from pg_tables t join pg_class c on c.relname=t.tablename where c.relrowsecurity);
  ```
- Policies : lecture publique **uniquement** sur `visible = true` ; INSERT/UPDATE/DELETE réservés à `authenticated`. Vérifier chaque policy réellement déployée (dashboard ou `pg_policies`), pas seulement les fichiers de migration.
- **Inscriptions Supabase Auth DÉSACTIVÉES** (Auth → Sign-ups disabled). C'est LE trou classique de cette archi : policy « écriture pour authenticated » + signups ouverts = n'importe qui crée un compte et modifie le portfolio. À vérifier à chaque audit.
- `service_role` key : **jamais** côté client, jamais en `NEXT_PUBLIC_*`, jamais commitée. Seule la clé anon peut être publique. `grep -rn "service_role\|SUPABASE_SERVICE" src/ .env*`
- Storage : buckets (`logos`, `artworks`) en lecture publique mais **upload/delete authentifié uniquement** (policies du bucket, pas seulement l'UI admin).
- Si des fonctions SQL `SECURITY DEFINER` existent : elles contournent la RLS — auditer leur corps et leurs droits d'exécution.
- Lancer les **advisors Supabase** (dashboard → Advisors, ou MCP `get_advisors`) : ils détectent RLS manquante, policies laxistes, extensions vulnérables.

### Next.js — admin et Server Actions

- `/admin/*` protégé par le middleware **ET** re-vérification de session dans chaque Server Action / Route Handler mutant. Ne jamais dépendre du middleware seul (bypass connu CVE-2025-29927 via `x-middleware-subrequest` — garder Next à jour et considérer le middleware comme une première couche, pas une frontière).
- Chaque Server Action valide ses entrées (schéma strict) et vérifie l'auth **dans l'action** — une Server Action est un endpoint HTTP public, même si aucun bouton ne l'appelle.
- Variables d'env : seul ce qui est réellement public est en `NEXT_PUBLIC_*` (URL Supabase + clé anon). Tout le reste côté serveur uniquement.

### Contenus gérés (backoffice) rendus dans l'UI

- Noms, descriptions, commentaires (`layer_name`, `description`…) : rendus en **texte** (JSX par défaut), jamais `dangerouslySetInnerHTML` sur un champ éditable en base.
- **Upload de logos/œuvres : refuser le SVG** (un SVG peut embarquer du `<script>` = XSS stockée servie par le Storage) — accepter png/webp/jpeg/avif, valider MIME **et** contenu (magic bytes), borner la taille. Si le SVG est indispensable : le sanitiser côté serveur avant stockage.
- `youtube_id` (Premiere Pro) : valider strictement `^[A-Za-z0-9_-]{11}$` avant toute injection dans l'URL d'embed ; utiliser `youtube-nocookie.com`. Une URL YouTube collée dans l'admin ne va jamais telle quelle dans un `src`.

### Iframes (l'OS embarque des sous-domaines)

- `<IframeWindow>` : attribut `sandbox` présent, `allow` minimal. N'ajouter `allow-downloads`/`allow-popups-to-escape-sandbox` que si nécessaire.
- Si `postMessage` est utilisé entre portfolio et sous-domaines : **valider `event.origin`** contre une allowlist exacte (`https://photoshop.elwen.dev`…), jamais `*` en cible d'envoi de données sensibles.
- Nuance `frame-ancestors` : les **sous-domaines** doivent autoriser `https://elwen.dev` (leur raison d'être) — ne pas les « corriger » vers `DENY`. Le **portfolio** lui-même n'a pas vocation à être embarqué : `frame-ancestors 'self'` (anti-clickjacking de l'admin).
- L'admin (`elwen.dev/admin`, `*.elwen.dev/admin`) ne doit jamais être affichable en iframe cross-origin.

### Divers

- Pas de `any` TypeScript aux frontières (entrées de Server Actions, réponses Supabase) : `unknown` + validation.
- Pas de secret/token loggé ; les erreurs Supabase renvoyées au client sont génériques (pas de détail SQL/policy).
