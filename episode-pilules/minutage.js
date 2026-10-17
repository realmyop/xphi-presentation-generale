/* ==========================================================================
   Les deux pilules, l'épisode — minutage.js : tout le temps de l'épisode, d'une seule source

   Le plan de recalage sur la voix enregistrée (tools/voix/RECALAGE.md, § 2.1,
   étape 2). Aujourd'hui, les débuts des répliques et les bornes des plans sont
   des secondes écrites à la main (texte.js, film.js, et leurs copies dans les
   lots). Ici, elles se déduisent de trois choses, écrites une fois.

   1. Les répliques, dans l'ordre (DITES) : pour chacune, sa durée de parole et
      le silence qui la suit. La première commence à ORIGINE, puis :
        de(suivante) = de + parole + silence
        a            = de(suivante), ou de + parole + tenue pour un silence
                       voulu (la réplique s'efface « tenue » secondes après la
                       parole : 1,2 s, sauf O11, A02, B04 et M18, nommées)
      La parole, c'est la voix enregistrée (voix.js, VOIX : la durée du fichier
      final de la réplique), depuis l'étape 7 ; une réplique sans enregistrement
      garde son estimation, « dite » (13 car./s, EPISODE.md). dite reste
      l'estimation, écrite ici seulement : texte.js la reprend telle quelle dans
      le champ dite de REPLIQUES, pour les outils, et la voix dans le champ voix.
      Les silences sont ceux d'avant la voix, inchangés (Ronan : « il faut que tu
      resynchronises par rapport à ce qui s'affiche dans le texte ») : la voix
      commence quand son texte commence à s'écrire, et tout le reste suit.
   2. Le découpage relatif (DECOUPE), lot par lot, plan par plan. Un plan est
      soit ANCRÉ sur une réplique (sa première), que l'image précède de
      « avance » secondes (0 si rien n'est dit : l'image peut arriver avant la
      voix, jamais après) :
        de(plan) = de(ancre) − avance
      soit MUET, avec sa durée : il finit là où commence le plan suivant (ou
      l'épisode, pour le dernier) :
        de(plan) = de(plan suivant) − duree
      Et toujours a(plan) = de(plan suivant) : la fin d'un plan ne dépend
      jamais de la fin de sa réplique (26 répliques débordent sur le plan
      suivant, K06, M09, N20…, et c'est voulu). La fin de l'épisode (DUREE) est
      ancrée sur la dernière réplique (FIN) ; un lot va du début de son premier
      plan à la fin de son dernier ; l'affiche (AFFICHE) est un instant de P08.
   3. Des aides pour les lots : bornes('kant') rend { LOT, P19: [de, a], … },
      la forme de PB (kant), BORNES (resultats, ecarts-temps) et du B
      d'ouverture ; debuts('tirage', 'fin') rend { P39: 346.68, …, fin: 498.18 },
      celle du B de variantes, tirage-temps et fin-temps.

   Les avances, les silences, les tenues et les durées ont été calculés une
   fois sur les nombres d'avant le recalage (texte.js, film.js) : avec dite
   pour parole, ce fichier les REDONNE EXACTEMENT (étapes 2 à 6). Depuis
   l'étape 7, la parole est la voix, et les débuts et les bornes bougent :
   ecartsMinutage(ref) dit de combien, contre les modules ou contre une
   empreinte (window.film.empreinte(), ou celle d'avant le recalage,
   /__banc/empreinte-avant.json sur le banc). Un module qui lit ce
   fichier ne prouve plus rien (texte.js, depuis l'étape 3, pour les
   répliques) : c'est la référence figée qui compte. Chaque instant est
   arrondi au millionième de seconde, ce qui retombe sur le nombre même du
   littéral : sans cela, 12,6 + 6,5 + 0,6 donnerait 19,700000000000003 et non
   19,7 (163 débuts sur 198 s'en écarteraient ainsi d'un rien, assez pour
   qu'une image tombée pile sur une borne change de plan).

   De l'arithmétique pure : un seul import, voix.js (des objets de nombres), ni
   toile, ni fetch, rien du navigateur.
   Node le lit comme le navigateur : les outils (tools/coupes-episode.cjs,
   texte-film-pilules.cjs, rendre-film.cjs) importent film.js et texte.js, et
   texte.js l'importe. Une ancre qui n'existe pas (une réplique coupée, sans
   que le plan ait changé d'ancre) lève une erreur au chargement, qui la nomme.

   Qui le lit. Depuis l'étape 3 : texte.js (les de, a et dite des répliques,
   et les ouvertures de la boîte ; la voix depuis l'étape 7) ;
   tools/voix/chaine/repliques.py, comme du
   texte (ORIGINE, TENUE, DITES), qui refait en Python le chaînage de
   TEMPS_REPLIQUES et s'arrête si ce code change : un changement ici (un
   plancher de silence, une autre parole) est à reporter là. Depuis l'étape 4 :
   film.js (DUREE, AFFICHE, les bornes de LOTS et de DECOUPAGE, et les deux
   instants de la surimpression qui ne sont pas des bornes de plan). Depuis
   l'étape 5 : les huit lots, leurs bornes (bornes, debuts). Depuis l'étape 7, la
   parole est la voix enregistrée (VOIX), que repliques.py lit aussi dans voix.js.
   ========================================================================== */
import { VOIX } from './voix.js';

// au millionième de seconde : une somme de durées décimales retombe exactement sur le nombre décimal qu'elle vaut
const arrondi = x => Math.round(x * 1e6) / 1e6;
const gele = o => Object.freeze(o);

// ================================================================ les répliques : l'ordre, la parole, le silence qui suit
export const ORIGINE = 3.6;   // le début de O01 : l'œil s'ouvre, regarde à gauche, à droite, puis vous (P01)
export const TENUE = 1.2;     // un silence voulu : la réplique reste écrite 1,2 s après la parole (son « a »)

// [id, { dite, silence, tenue? }] : dite, la parole estimée (13 car./s, EPISODE.md ; texte.js la reprend telle quelle
// dans REPLIQUES), qui ne sert de parole qu'à une réplique sans voix enregistrée ; silence, de la fin de la parole au
// début de la suivante ; tenue (silence voulu), de la fin de la parole à la fin de l'affichage (sinon, la réplique reste
// écrite jusqu'au début de la suivante). La dernière n'a pas de silence. Les silences et les tenues sont ceux d'avant
// la voix enregistrée, inchangés depuis l'étape 7 : ils comptent depuis la fin du fichier de la voix.
const DITES = gele([
  // S01 · Ouverture
  ['O01', { dite: 1.4, silence: .5 }],
  ['O02', { dite: 6.7, silence: .4 }],
  ['O03', { dite: 6.5, silence: .6 }],
  ['O04', { dite: 8.2, silence: .4 }],
  ['O05', { dite: 5.7, silence: 1.0 }],
  ['O06', { dite: 4.7, silence: .4 }],
  ['O07', { dite: 7.8, silence: .5 }],
  ['O08', { dite: 4.8, silence: .3 }],
  ['O09', { dite: 9.0, silence: .6 }],
  ['O10', { dite: 5.0, silence: .6 }],
  ['O11', { dite: 10.5, silence: 11.4, tenue: 1.0 }],   // s'efface quand la boîte se replie, au début du générique (P08)
  // S02 · Partie 1 · Le test
  ['T01', { dite: 3.1, silence: .3 }],
  ['T02', { dite: 6.3, silence: .6 }],
  ['T03', { dite: 5.5, silence: .5 }],
  ['T04', { dite: 4.9, silence: 1.2 }],
  ['T05', { dite: 4.8, silence: .5 }],
  ['T06', { dite: 5.2, silence: 1.2 }],
  ['T07', { dite: 9.0, silence: 1.5 }],
  ['T08', { dite: 2.7, silence: .6 }],
  ['T09', { dite: 4.4, silence: 2.8, tenue: TENUE }],
  ['T10', { dite: 5.2, silence: .4 }],
  ['T11', { dite: 6.7, silence: .4 }],
  ['T12', { dite: 11.4, silence: 3.0, tenue: TENUE }],
  // S03 · Partie 1 · Un dilemme kantien ?
  ['K01', { dite: 6.4, silence: 1.0 }],
  ['K02', { dite: 9.8, silence: 1.2 }],
  ['K03', { dite: 4.3, silence: .4 }],
  ['K04', { dite: 4.7, silence: .4 }],
  ['K05', { dite: 8.0, silence: 2.0 }],
  ['K06', { dite: 5.4, silence: 1.8 }],
  ['K07', { dite: 1.7, silence: .4 }],
  ['K08', { dite: 5.8, silence: .3 }],
  ['K09', { dite: 5.5, silence: .4 }],
  ['K10', { dite: 7.4, silence: .8 }],
  ['K11', { dite: 4.3, silence: .4 }],
  ['K12', { dite: 7.5, silence: .5 }],
  ['K13', { dite: 9.8, silence: .4 }],
  ['K14', { dite: 10.5, silence: .8 }],
  ['K15', { dite: 2.4, silence: .4 }],
  ['K16', { dite: 8.8, silence: .5 }],
  ['K17', { dite: 9.4, silence: .4 }],
  ['K18', { dite: 2.4, silence: .7 }],
  ['K19', { dite: 6.9, silence: .5 }],
  ['K20', { dite: 3.8, silence: .3 }],
  ['K21', { dite: 4.8, silence: 2.8, tenue: TENUE }],
  ['K22', { dite: 4.0, silence: .4 }],
  ['K23', { dite: 8.5, silence: .4 }],
  ['K24', { dite: 5.1, silence: .7 }],
  ['K25', { dite: 7.2, silence: .4 }],
  ['K26', { dite: 8.4, silence: 1.0 }],
  ['K27', { dite: 1.7, silence: .6 }],
  ['K28', { dite: 2.1, silence: .4 }],
  ['K29', { dite: 4.2, silence: .6 }],
  ['K30', { dite: 7.6, silence: .2 }],
  ['K31', { dite: 2.5, silence: .6 }],
  ['K32', { dite: 5.1, silence: 1.1 }],
  // S04 · Partie 1 · Deux variantes déséquilibrées
  ['V01', { dite: 9.3, silence: .4 }],
  ['V02', { dite: 4.8, silence: .6 }],
  ['V03', { dite: 3.5, silence: .5 }],
  ['V04', { dite: 5.2, silence: .3 }],
  ['V05', { dite: 5.0, silence: .6 }],
  ['V06', { dite: 4.4, silence: .4 }],
  ['V07', { dite: 1.1, silence: .6 }],
  ['V08', { dite: 3.3, silence: 1.2 }],
  ['V09', { dite: 9.3, silence: .4 }],
  ['V10', { dite: 8.4, silence: .4 }],
  ['V11', { dite: 7.2, silence: .4 }],
  ['V12', { dite: 6.6, silence: .4 }],
  ['V13', { dite: 8.6, silence: 1.2 }],
  ['V14', { dite: 9.2, silence: .7 }],
  ['V15', { dite: 6.4, silence: .3 }],
  ['V16', { dite: 6.9, silence: .7 }],
  ['V17', { dite: 6.3, silence: .4 }],
  ['V18', { dite: 6.6, silence: .4 }],
  ['V19', { dite: 12.1, silence: 0 }],                  // V20 enchaîne sans reprendre son souffle : la boucle
  ['V20', { dite: 3.8, silence: 1.8 }],
  ['V21', { dite: 4.2, silence: 2.8, tenue: TENUE }],
  // S05 · Partie 2 · Le tirage au sort
  ['R01', { dite: 6.2, silence: .4 }],
  ['R02', { dite: 5.4, silence: .4 }],
  ['R03', { dite: 2.7, silence: .4 }],
  ['R04', { dite: 13.6, silence: .7 }],
  ['R05', { dite: 2.2, silence: 2.6, tenue: TENUE }],
  ['R06', { dite: 4.2, silence: .4 }],
  ['R07', { dite: 3.6, silence: .4 }],
  ['R08', { dite: 6.1, silence: .4 }],
  ['R09', { dite: 4.4, silence: .4 }],
  ['R10', { dite: 5.7, silence: .4 }],
  ['R11', { dite: 10.8, silence: .6 }],
  ['R12', { dite: 4.5, silence: .5 }],
  ['R13', { dite: 8.7, silence: .4 }],
  ['R14', { dite: 2.8, silence: 2.0 }],
  // S06 · Partie 2 · Description A : la bleue l’emporte
  ['A01', { dite: 4.5, silence: .5 }],
  ['A02', { dite: 4.7, silence: 4.5, tenue: 1.1 }],     // « Je vous laisse quelques secondes » : la fin d'EPISODE.md (630,0 ; 412,8 avec la voix)
  ['A03', { dite: 4.4, silence: 3.8, tenue: TENUE }],
  ['A04', { dite: 4.7, silence: .4 }],
  ['A05', { dite: 4.7, silence: .4 }],
  ['A06', { dite: 2.2, silence: .6 }],
  ['A07', { dite: 4.5, silence: .5 }],
  ['A08', { dite: 7.2, silence: .4 }],
  ['A09', { dite: 5.6, silence: .4 }],
  ['A10', { dite: 2.3, silence: 1.8 }],
  ['A11', { dite: 5.6, silence: .5 }],
  ['A12', { dite: 7.5, silence: .3 }],
  ['A13', { dite: 7.0, silence: 3.0, tenue: TENUE }],
  ['A14', { dite: 10.8, silence: .5 }],
  ['A15', { dite: 8.2, silence: .4 }],
  ['A16', { dite: 3.9, silence: 1.2 }],
  ['A17', { dite: 7.5, silence: .7 }],
  ['A18', { dite: 1.8, silence: .3 }],
  ['A19', { dite: 8.1, silence: .4 }],
  ['A20', { dite: 6.5, silence: .4 }],
  ['A21', { dite: 3.2, silence: 2.1 }],
  // S07 · Partie 2 · Description B : la bleue s’effondre
  ['B01', { dite: 4.2, silence: .3 }],
  ['B02', { dite: 5.4, silence: .4 }],
  ['B03', { dite: 8.6, silence: .4 }],
  ['B04', { dite: 6.2, silence: 7.7, tenue: 1.3 }],     // avant la jauge de P52 : la fin d'EPISODE.md (784,0 ; 516,74 avec la voix)
  ['B05', { dite: .2, silence: 1.6 }],
  ['B06', { dite: 4.8, silence: 1.8 }],
  ['B07', { dite: 4.8, silence: .4 }],
  ['B08', { dite: 5.3, silence: .4 }],
  ['B09', { dite: 7.3, silence: .6 }],
  ['B10', { dite: 3.8, silence: .5 }],
  ['B11', { dite: 6.7, silence: 1.8 }],
  ['B12', { dite: 5.5, silence: .3 }],
  ['B13', { dite: 9.0, silence: .4 }],
  ['B14', { dite: 5.2, silence: .4 }],
  ['B15', { dite: 2.6, silence: 1.6 }],
  // S08 · Partie 2 · Les deux descriptions disent-elles la même chose ?
  ['M01', { dite: 9.5, silence: .4 }],
  ['M02', { dite: 9.4, silence: .6 }],
  ['M03', { dite: 7.2, silence: .4 }],
  ['M04', { dite: 2.8, silence: .5 }],
  ['M05', { dite: 9.2, silence: .3 }],
  ['M06', { dite: 7.7, silence: .4 }],
  ['M07', { dite: 5.3, silence: 1.0 }],
  // M08–M18 : dite les comptait à 16 car./s (texte.js, cps) dans la fenêtre de l'ancien M08–M16 (910,1 → 978,8 avant
  // le recalage) ; Ronan les dit à son débit, et les silences de 0,2 s qui les séparent restent (602,74 → 653,92 avec la voix)
  ['M08', { dite: 7.1, silence: 3.0, tenue: TENUE }],
  ['M09', { dite: 6.8, silence: .2 }],
  ['M10', { dite: 9.4, silence: .2 }],
  ['M11', { dite: 7.9, silence: .2 }],
  ['M12', { dite: 7.8, silence: .3 }],
  ['M13', { dite: 2.0, silence: .2 }],
  ['M14', { dite: 8.5, silence: .2 }],
  ['M15', { dite: 2.8, silence: .3 }],
  ['M16', { dite: 5.1, silence: .3 }],
  ['M17', { dite: 3.0, silence: .2 }],
  ['M18', { dite: 2.6, silence: 5.8, tenue: .6 }],      // reste écrite 0,4 s après la coupe vers P61 (653,92 ; 978,8 avant la voix), comme l'ancienne M16
  // S09 · Partie 2 · Qui prend la bleue ?
  ['Q01', { dite: 9.5, silence: .4 }],
  ['Q02', { dite: 3.9, silence: .4 }],
  ['Q03', { dite: 9.3, silence: 1.8 }],
  ['Q04', { dite: 1.6, silence: 13.0 }],                // puis l'attente « [à mesurer : …] », écrite sans voix (texte.js)
  ['Q05', { dite: 6.9, silence: .4 }],
  ['Q06', { dite: 11.2, silence: 1.8 }],
  // S10 · Partie 3 · Mauvais ou méchants
  ['N01', { dite: 2.4, silence: .4 }],
  ['N02', { dite: 3.8, silence: .5 }],
  ['N03', { dite: 4.5, silence: .4 }],
  ['N04', { dite: 9.2, silence: .6 }],
  ['N05', { dite: 3.7, silence: .4 }],
  ['N06', { dite: 2.5, silence: .5 }],
  ['N07', { dite: 3.1, silence: .3 }],
  ['N08', { dite: 1.3, silence: 1.4 }],
  ['N09', { dite: 4.5, silence: .5 }],
  ['N10', { dite: 4.6, silence: .4 }],
  ['N11', { dite: 9.5, silence: .8 }],
  ['N12', { dite: 6.9, silence: .4 }],
  ['N13', { dite: 5.0, silence: .4 }],
  ['N14', { dite: 9.2, silence: 1.6 }],
  ['N15', { dite: 10.2, silence: .4 }],
  ['N16', { dite: 2.3, silence: .8 }],
  ['N17', { dite: 5.2, silence: .3 }],
  ['N18', { dite: 9.2, silence: .5 }],
  ['N19', { dite: 7.8, silence: .6 }],
  ['N20', { dite: 7.9, silence: 2.2 }],
  // S11 · Partie 3 · Le méta-dilemme
  ['D01', { dite: 4.3, silence: .4 }],
  ['D02', { dite: 11.5, silence: .9 }],
  ['D03', { dite: 7.8, silence: .4 }],
  ['D04', { dite: 8.0, silence: .4 }],
  ['D05', { dite: 5.9, silence: .4 }],
  ['D06', { dite: 3.3, silence: 4.1 }],
  ['D07', { dite: 11.8, silence: .4 }],
  ['D08', { dite: 6.8, silence: .4 }],
  ['D09', { dite: 6.8, silence: 1.6 }],
  ['D10', { dite: 4.7, silence: .4 }],
  ['D11', { dite: 3.5, silence: 2.6 }],
  ['D12', { dite: 5.7, silence: .4 }],
  ['D13', { dite: 7.3, silence: 2.4 }],
  // S12 · Partie 3 · Qui explique les règles
  ['E01', { dite: 9.9, silence: .4 }],
  ['E02', { dite: 9.8, silence: .4 }],
  ['E03', { dite: 8.2, silence: 1.0 }],
  ['E04', { dite: 3.4, silence: .4 }],
  ['E05', { dite: 8.2, silence: .4 }],
  ['E06', { dite: 5.6, silence: .6 }],
  ['E07', { dite: 5.4, silence: .4 }],
  ['E08', { dite: 4.4, silence: 2.4 }],
  // S13 · Partie 3 · La fin
  ['F01', { dite: 3.5, silence: .6 }],
  ['F02', { dite: 6.7, silence: .5 }],
  ['F03', { dite: 6.4, silence: .6 }],
  ['F04', { dite: 6.3, silence: .6 }],
  ['F05', { dite: 3.7, silence: .6 }],
  ['F06', { dite: 4.8, silence: 1.2 }],
  ['F07', { dite: 4.4, tenue: TENUE }],
].map(([id, d]) => gele([id, gele(d)])));

// la voix enregistrée d'une réplique (voix.js : la durée du fichier final, en secondes), ou null si elle n'en a pas
const voix = id => VOIX[id] ?? null;
// la durée de parole d'une réplique : sa voix enregistrée, sinon son estimation (dite).
// tools/voix/chaine/repliques.py refait ce chaînage en Python et vérifie que ce code (voix, parole, TEMPS_REPLIQUES,
// arrondi) est resté celui qu'il recopie : le changer ici, c'est le changer là aussi.
export const parole = (id, d) => voix(id) ?? d.dite;

// les répliques, dans l'ordre : { id, de, a, dite, voix, parole, silence, tenue } (voix, silence et tenue : null s'il
// n'y en a pas)
export const TEMPS_REPLIQUES = (() => {
  const R = [];
  let t = ORIGINE;
  DITES.forEach(([id, d], i) => {
    const p = parole(id, d), dernier = i === DITES.length - 1;
    if (!dernier && !(typeof d.silence === 'number')) throw new Error(`minutage.js : ${id} n'a pas de silence (seule la dernière réplique s'en passe)`);
    if (dernier && !(typeof d.tenue === 'number')) throw new Error(`minutage.js : ${id}, la dernière réplique, n'a pas de tenue (rien ne la suit)`);
    R.push({ id, de: t, dite: d.dite, voix: voix(id), parole: p, silence: d.silence ?? null, tenue: d.tenue ?? null });
    if (!dernier) t = arrondi(t + p + d.silence);
  });
  return gele(R.map((r, i) => gele({
    id: r.id, de: r.de, a: r.tenue !== null ? arrondi(r.de + r.parole + r.tenue) : R[i + 1].de,
    dite: r.dite, voix: r.voix, parole: r.parole, silence: r.silence, tenue: r.tenue,
  })));
})();
export const TEMPS_REPLIQUE = gele(Object.fromEntries(TEMPS_REPLIQUES.map(r => [r.id, r])));

// ================================================================ le découpage relatif : chaque plan, ancré ou muet
// { ancre, avance } : l'image arrive avance secondes avant la voix de l'ancre (0 si rien n'est dit) ;
// { duree } : un plan sans voix, qui finit où commence le plan suivant.
const DECOUPE = gele({
  ouverture: gele({
    P01: { ancre: 'O01', avance: 3.6 },   // l'œil s'ouvre avant de parler
    P02: { ancre: 'O02' },
    P03: { ancre: 'O04' },
    P04: { ancre: 'O06' },
    P05: { ancre: 'O08' },
    P06: { ancre: 'O10' },
    P07: { ancre: 'O11' },
    P08: { duree: 7.6 },                  // le générique « Xphi · Les deux pilules »
  }),
  test: gele({
    P09: { ancre: 'T01', avance: 2.8 },
    P10: { ancre: 'T02' },
    P11: { ancre: 'T03' },
    P12: { ancre: 'T04' },
    P13: { ancre: 'T05' },
    P14: { ancre: 'T06' },
    P15: { ancre: 'T07' },
    P16: { ancre: 'T08' },
    P17: { ancre: 'T10', avance: .8 },
    P18: { ancre: 'T12' },
  }),
  kant: gele({
    P19: { ancre: 'K01', avance: 1.2 },
    P20: { ancre: 'K02' },
    P21: { ancre: 'K03' },
    P22: { ancre: 'K07', avance: .8 },
    P23: { ancre: 'K10' },
    P24: { ancre: 'K11' },
    P25: { ancre: 'K13' },
    P26: { ancre: 'K15' },
    P27: { ancre: 'K19' },
    P28: { ancre: 'K22', avance: 2.4 },
    P29: { ancre: 'K23' },
    P30: { ancre: 'K25' },
    P31: { ancre: 'K27' },
  }),
  variantes: gele({
    P32: { ancre: 'V01' },
    P33: { ancre: 'V03' },
    P34: { ancre: 'V09', avance: .6 },
    P35: { ancre: 'V12' },
    P36: { ancre: 'V14', avance: .6 },
    P37: { ancre: 'V17' },
    P38: { ancre: 'V19' },
  }),
  tirage: gele({
    P39: { ancre: 'R01', avance: 1.4 },
    P40: { ancre: 'R04' },
    P41: { ancre: 'R05' },
    P42: { ancre: 'R09' },
    P43: { ancre: 'R12' },
    P44: { ancre: 'A01', avance: 1.0 },
    P45: { ancre: 'A04', avance: 2.6 },
    P46: { ancre: 'A07' },
    P47: { ancre: 'A11', avance: 1.0 },
    P48: { ancre: 'A14', avance: 2.4 },
    P49: { ancre: 'A16' },
    P50: { ancre: 'A18' },
  }),
  resultats: gele({
    P51: { ancre: 'B01', avance: 1.0 },
    P52: { ancre: 'B05', avance: 4.4 },   // la jauge monte à peine, puis « Ah. »
    P53: { ancre: 'B07', avance: 1.0 },
    P54: { ancre: 'B10' },
    P55: { ancre: 'B12', avance: 1.0 },
    P56: { ancre: 'M01', avance: 1.0 },
    P57: { ancre: 'M03' },
    P58: { ancre: 'M08' },
    P59: { ancre: 'M10', avance: 2.1 },
    P60: { ancre: 'M13', avance: .6 },
  }),
  ecarts: gele({
    P61: { duree: 5.6 },                  // la devinette « Qui ? »
    P62: { ancre: 'Q01' },
    P63: { ancre: 'Q04', avance: 1.2 },
    P64: { ancre: 'Q05', avance: 1.0 },
    P65: { ancre: 'N01', avance: 1.0 },
    P66: { ancre: 'N03' },
    P67: { ancre: 'N05' },
    P68: { ancre: 'N09', avance: .8 },
    P69: { ancre: 'N14' },
    P70: { ancre: 'N15', avance: .6 },
    P71: { ancre: 'N17' },
    P72: { ancre: 'N20' },
  }),
  fin: gele({
    P73: { ancre: 'D01', avance: 1.0 },
    P74: { ancre: 'D03' },
    P75: { ancre: 'D07', avance: .8 },
    P76: { ancre: 'D10', avance: 1.0 },
    P77: { ancre: 'D12' },
    P78: { ancre: 'E01', avance: .8 },
    P79: { ancre: 'E03' },
    P80: { ancre: 'E04' },
    P81: { ancre: 'E07' },
    P82: { ancre: 'F01', avance: 1.4 },
    P83: { ancre: 'F07' },
    P84: { duree: 4.0 },                  // l'œil se ferme
    P85: { duree: 16.0 },                 // le générique de fin
  }),
});
// la fin de l'épisode : 32,4 s après le début de F07 (sa parole, le teaser, l'œil qui se ferme, le générique de fin)
const FIN = gele({ ancre: 'F07', apres: 32.4 });

const debutDe = (id, qui) => {
  const r = TEMPS_REPLIQUE[id];
  if (!r) throw new Error(`minutage.js : ${qui} est ancré sur ${id}, qui n'est pas dans les répliques`);
  return r.de;
};
export const DUREE = arrondi(debutDe(FIN.ancre, 'la fin de l\'épisode') + FIN.apres);

// les plans, dans l'ordre : { id, lot, de, a, ancre, avance, duree } (ancre et avance, ou duree : null pour l'autre genre)
export const TEMPS_PLANS = (() => {
  const P = Object.entries(DECOUPE).flatMap(([lot, plans]) => Object.entries(plans).map(([id, p]) => ({ id, lot, ...p })));
  for (const p of P) {
    if ((typeof p.ancre === 'string') === (typeof p.duree === 'number')) throw new Error(`minutage.js : ${p.id} doit être ancré (ancre) ou muet (duree), pas les deux ni aucun`);
  }
  const de = [];
  for (let i = P.length - 1; i >= 0; i--) {   // à rebours : un plan muet se règle sur le début du suivant
    const p = P[i], suivant = i + 1 < P.length ? de[i + 1] : DUREE;
    de[i] = p.ancre ? arrondi(debutDe(p.ancre, p.id) - (p.avance ?? 0)) : arrondi(suivant - p.duree);
  }
  return gele(P.map((p, i) => gele({
    id: p.id, lot: p.lot, de: de[i], a: i + 1 < P.length ? de[i + 1] : DUREE,
    ancre: p.ancre ?? null, avance: p.ancre ? p.avance ?? 0 : null, duree: p.ancre ? null : p.duree,
  })));
})();
export const TEMPS_PLAN = gele(Object.fromEntries(TEMPS_PLANS.map(p => [p.id, p])));

// les lots, dans l'ordre : { id, de, a }, du début de leur premier plan à la fin de leur dernier
export const TEMPS_LOTS = gele(Object.keys(DECOUPE).map(id => {
  const P = TEMPS_PLANS.filter(p => p.lot === id);
  return gele({ id, de: P[0].de, a: P[P.length - 1].a });
}));

// l'image de la page avant la lecture : le titre « XPHI · LES DEUX PILULES », posé, 5,4 s après le début du générique
// (P08, ouverture.js : la nuit devient le laboratoire jusqu'à +5,0 ; le titre glisse au cartouche à la fin − 1,8)
export const AFFICHE = arrondi(TEMPS_PLAN.P08.de + 5.4);

// deux instants de geste où la surimpression change (film.js, SURIMPRESSION), sans être des bornes de plan (EPISODE.md,
// « Surimpression ») ; les lots ouverture et tirage, qui font le geste, les lisent ici :
// - le titre « XPHI · LES DEUX PILULES » est arrivé au cartouche, 1,2 s avant la fin du générique (P08, sans voix) : le
//   premier cartouche paraît là (ouverture.js, P8.oeil, quand le titre a fini de glisser et que l'œil glisse) ;
// - la condensation de P48, 1,2 s avant la voix de A14 : les deux nuages se condensent en bonshommes, et la mention
//   « un point par participant… » passe à « 1 figure = 1 %… » (tirage-temps.js, S.cond0, 1 s avant S.cond1 : A14 − 0,2).
export const TITRE_AU_CARTOUCHE = arrondi(TEMPS_PLAN.P08.a - 1.2);
export const CONDENSATION = arrondi(debutDe('A14', 'la condensation de P48') - 1.2);

// ================================================================ les aides pour les lots
// bornes('kant') → { LOT: { id, de, a }, P19: [de, a], … } : la forme de PB (kant), de BORNES (resultats, ecarts-temps)
// et du B d'ouverture ; un plan est actif de de (inclus) à a (exclu)
export function bornes(lot) {
  const L = TEMPS_LOTS.find(l => l.id === lot);
  if (!L) throw new Error(`minutage.js : il n'y a pas de lot « ${lot} » (${TEMPS_LOTS.map(l => l.id).join(', ')})`);
  return gele({
    LOT: gele({ id: L.id, de: L.de, a: L.a }),
    ...Object.fromEntries(TEMPS_PLANS.filter(p => p.lot === lot).map(p => [p.id, gele([p.de, p.a])])),
  });
}
// debuts('tirage', 'fin') → { P39: 346.68, …, P50: 482.82, fin: 498.18 } : le début de chaque plan du lot, et la fin du lot
// sous la clé cleFin s'il en faut une (la forme du B de variantes, sans fin ; de tirage-temps, 'fin' ; de fin-temps, 'FIN')
export function debuts(lot, cleFin = null) {
  const { LOT, ...plans } = bornes(lot);
  const o = Object.fromEntries(Object.entries(plans).map(([id, [de]]) => [id, de]));
  if (cleFin) o[cleFin] = LOT.a;
  return gele(o);
}

// ================================================================ la comparaison avec les nombres écrits à la main
// ref : les nombres à retrouver, sous la forme de window.film.empreinte() (ou de /__banc/empreinte-avant.json, celle
// d'avant le recalage), ou les modules eux-mêmes : { DUREE, AFFICHE, LOTS, DECOUPAGE, repliques (ou REPLIQUES), lots }.
// Chaque champ est facultatif ; lots (de l'empreinte) : [{ id, LOT, plans }], les bornes que chaque lot expose.
// Rend { valeurs (les nombres comparés), exacts (égaux au bit près), ecarts (au-delà de tol : ce qui bougerait),
// approches (à tol près, mais pas au bit près), absents (un id d'un côté et pas de l'autre, un lot qui diffère) }.
// Tout est juste quand ecarts, approches et absents sont vides : exacts = valeurs.
export function ecartsMinutage(ref = {}, tol = 1e-6) {
  const out = { valeurs: 0, exacts: 0, ecarts: [], approches: [], absents: [] };
  const nombre = (nom, attendu, calcule) => {
    out.valeurs++;
    if (calcule === attendu) { out.exacts++; return; }
    if (typeof attendu === 'number' && typeof calcule === 'number' && Math.abs(calcule - attendu) <= tol) out.approches.push(`${nom} : ${attendu}, minutage.js ${calcule}`);
    else out.ecarts.push(`${nom} : ${attendu}, minutage.js ${calcule}`);
  };
  // deux listes d'objets à id : les mêmes ids, dans le même ordre, et les mêmes nombres
  const listes = (nom, attendus, calcules, champs, autres = []) => {
    if (!Array.isArray(attendus)) return;
    const ids = l => l.map(x => x.id).join(' ');
    if (ids(attendus) !== ids(calcules)) out.absents.push(`${nom} : ${attendus.length} ids attendus, ${calcules.length} dans minutage.js, ou un autre ordre`);
    const parId = new Map(calcules.map(x => [x.id, x]));
    for (const x of attendus) {
      const y = parId.get(x.id);
      if (!y) { out.absents.push(`${nom}[${x.id}] : pas dans minutage.js`); continue; }
      for (const c of champs) nombre(`${nom}[${x.id}].${c}`, x[c], y[c]);
      for (const c of autres) if (c in x && x[c] !== y[c]) out.absents.push(`${nom}[${x.id}].${c} : ${x[c]}, minutage.js ${y[c]}`);
    }
  };
  if ('DUREE' in ref) nombre('DUREE', ref.DUREE, DUREE);
  if ('AFFICHE' in ref) nombre('AFFICHE', ref.AFFICHE, AFFICHE);
  listes('LOTS', ref.LOTS, TEMPS_LOTS, ['de', 'a']);
  listes('DECOUPAGE', ref.DECOUPAGE, TEMPS_PLANS, ['de', 'a'], ['lot']);
  listes('repliques', ref.repliques ?? ref.REPLIQUES, TEMPS_REPLIQUES, ['de', 'a', 'dite']);
  // ce que chaque lot expose : son LOT, et les bornes de ses PLANS (les morceaux d'un plan, P22 et P22b, vont ensemble)
  if (Array.isArray(ref.lots)) for (const L of ref.lots) {
    const B = TEMPS_LOTS.some(l => l.id === L.id) ? bornes(L.id) : null;
    if (!B) { out.absents.push(`lots[${L.id}] : pas de tel lot dans minutage.js`); continue; }
    if (L.LOT) { nombre(`lots[${L.id}].LOT.de`, L.LOT.de, B.LOT.de); nombre(`lots[${L.id}].LOT.a`, L.LOT.a, B.LOT.a); }
    const ids = Object.keys(B).filter(k => k !== 'LOT'), vus = new Set();
    for (const p of L.plans || []) {
      const id = ids.find(k => String(p.id) === k) || ids.find(k => String(p.id).startsWith(k));
      if (!id) { out.absents.push(`lots[${L.id}].plans[${p.id}] : pas un plan du lot dans minutage.js`); continue; }
      vus.add(id);
    }
    for (const id of vus) {
      const P = (L.plans || []).filter(p => String(p.id) === id || String(p.id).startsWith(id));
      nombre(`lots[${L.id}].plans[${id}].de`, Math.min(...P.map(p => p.de)), B[id][0]);
      nombre(`lots[${L.id}].plans[${id}].a`, Math.max(...P.map(p => p.a)), B[id][1]);
    }
    if (L.plans && L.plans.length) for (const id of ids) if (!vus.has(id)) out.absents.push(`lots[${L.id}].plans : ${id} manque`);
  }
  return out;
}
