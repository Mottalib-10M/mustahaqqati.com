# Contribuer à مستحقاتي (sa-baremes-publics)

Site statique en arabe seul (`dir="rtl"`), Astro 6 + îlots React. Port local 5638.

## Une page = un fichier

Chaque page de contenu est un fichier `src/content/pages/<id>.ts` qui exporte `definePage({...})`
(type dans `src/lib/guide-types.ts`). Le nom du fichier est l'`id`. Le fichier porte : groupe, ordre,
outil (`tool`, page outil) ou mini-outil (`mini`), pages liées, clés de sources, slug latin, `nav`, `card`,
`title` (50 à 60 caractères, terme-clé en tête), `description` (150 à 160), `h1`, `intro`, `resume`
(bloc citable de 120 mots ou plus, un paragraphe), `faqs` (3 à 8 questions, réponses de 40 à 90 mots,
jamais reprises d'une autre page) et `body` (HTML).

Aucun chiffre officiel n'est tapé dans une page : il vient du fichier de paramètres par les aides de
`src/lib/helpers.ts` (`h.g(8, 1)`, `h.m(...)`, `h.SC.transportFor(...)`, `h.EOS.eos(...)`, `h.CA.ca(...)`,
`h.PEN.newLawPension(...)`, `h.src('boeLabor')`, `h.a('id', 'texte')`).

## Paramètres et sources

`scripts/data/build-params.py` écrit `src/data/params-2026.json` et vérifie chaque barème contre la
dernière case publiée. Sources : copie de l'IAU et de la PSAU du سلم الموظفين (أمر 4097/م ب, 1432/6/25),
PDF du ministère de l'Éducation pour les enseignants (en vigueur le 1441/11/10), لائحة الحقوق والمزايا
المالية, نظام العمل (art. 2, 84 à 88) et les lois de retraite sur laws.boe.gov.sa. حساب المواطن : aucune
règle publiée ; les paramètres reproduisent les réponses du calculateur officiel relevées le 2026-10-20
et sont présentés comme une estimation. Le barème militaire n'est pas publié (pas de copie officielle à jour).

## Contrôles

```
export NODE_PATH=$(npm root -g):$PWD/node_modules
npx vitest run          # moteur + règles d'écriture de chaque page
npm run check           # build + contrôles de la trame
```

Règles : pas de tiret cadratin, chiffres latins (`ar-SA-u-nu-latn`), dates hégiriennes Umm al-Qura avec
la date grégorienne, aucun formulaire, aucun lien vers un prêteur ou un cabinet, jamais se présenter comme
une administration. Une hausse annoncée mais non publiée s'écrit « à venir » et n'entre pas dans les calculs.

## Pages

| groupe | id |
|---|---|
| rawatib | sullam-rawatib-almuwazafin, alalawa-alsanawiya, badal-alnaql, badal-alintidab |
| maratib | maratib-1-3, maratib-4-6, maratib-7-8, maratib-9-10, maratib-11-15 |
| muallimin | sullam-rawatib-almuallimin, musaid-muallim, muallim-mumaris, muallim-mutaqaddim, muallim-khabir |
| khidma | nihayat-alkhidma, istiqala, ajr-nihayat-alkhidma, nihayat-khidma-almaraa, alquwwa-alqahira, jadwal-nihayat-alkhidma |
| muwatin | hasibat-hisab-almuwatin, alhadd-almani, fard-mustaqil, usra-kabira, aldam-aladafi |
| taqaud | hasibat-altaqaud, nizam-altaminat-aljadid, altaqaud-almubakkir, almarhala-alintiqaliya, altaqaud-almadani, nisab-alishtirak, alhadd-aladna-lilmaash |
