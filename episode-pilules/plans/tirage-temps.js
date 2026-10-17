/* ==========================================================================
   Les deux pilules, l'épisode — plans/tirage-temps.js : le minutage du lot « tirage »

   Chaque geste des plans P39–P50 tombe sur son mot : quandMot (texte.js),
   l'instant où la boîte écrit le mot, c'est-à-dire où la voix enregistrée de
   Ronan le dit. Les nombres d'EPISODE.md (ceux de la voix estimée) ne sont
   pas recopiés : le commentaire de chaque ligne dit, au dixième, ce que
   calcule ce fichier avec la voix enregistrée (et bougera avec une coupe).
   Les bornes des plans (B) viennent de minutage.js : chaque plan y
   suit sa première réplique (son début, ou une avance sur lui), et non un mot.
   ========================================================================== */
import { sautsTirage } from '../commun.js';
import { REPLIQUES, REPLIQUE, quandMot, finParole, absente } from '../texte.js';
import { debuts, CONDENSATION } from '../minutage.js';
const mot = (id, m, n = 0) => quandMot(id, m, REPLIQUE[id]?.de, n);
const de = id => REPLIQUE[id]?.de ?? absente(id, 'son début');
const fin = id => finParole(id), suivante = id => { const i = REPLIQUES.indexOf(REPLIQUE[id]); return i < 0 ? absente(id, 'la réplique qui la suit') : REPLIQUES[i + 1]?.de ?? REPLIQUES[i].a; };   // le début de la réplique qui suit id

// les bornes des plans (EPISODE.md, « Les plans »), lues dans minutage.js : le début de chaque plan, { P39: de, …,
// P50: de }, et sous la clé fin, la fin du lot (le début du lot resultats). Chaque plan y est ancré sur sa première
// réplique, que l'image précède parfois (P39 avant R01, P44 avant A01…) : les gestes posés sur B suivent cette
// réplique, pas un mot (tools/voix/RECALAGE-a-reprendre.md, pour l'étape 7)
export const B = debuts('tirage', 'fin');

export const S = (() => {
  const s = {};
  // ---------------------------------------------------------------- P39 · l'écran se dédouble
  s.foule = B.P39;                                        // la foule du test paraît en fondu (0,4 s), sous l'œil
  s.dedouble1 = Math.max(B.P39 + 1.2, de('R01'));         // 348,1 : chaque sujet s'est doublé, les copies sont posées
  s.dedouble0 = s.dedouble1 - 1;                          // 347,1
  s.tirage = mot('R01', 'tiré au sort');                  // 349,2 : le cadre laiton saute d'une grille à l'autre
  s.kTirage = Math.min(1, (de('R02') - s.tirage) / 4.86); s.sauts = sautsTirage(s.tirage, 8, .12 * s.kTirage, .6 * s.kTirage);   // huit sauts qui ralentissent (serrés : voir kTirage, plus bas) ; le neuvième instant : entre les deux
  s.entre = s.sauts[8];                                   // il s'arrête ENTRE les deux grilles (pas de clac)
  s.moitie = mot('R02', 'Une moitié');                    // Phi regarde la grille de gauche
  s.regles = mot('R02', 'celle que je viens');            // 353,2 : RÈGLES revient, en haut à droite
  s.kRegles = Math.min(1, (de('R03') - s.regles) / 3.30); s.glisse0 = s.regles + .25 * s.kRegles; s.glisse1 = s.glisse0 + .9 * s.kRegles;   // elle glisse sur la colonne de gauche (serré : kRegles, plus bas)
  s.morph = s.glisse1 - .05 * s.kRegles;                  // ses règles se défont et se recomposent en la description A
  s.etiq0 = Math.max(mot('R02', 'rappeler'), s.morph + .7 * s.kRegles);   // l'étiquette « A » grandit…
  s.etiq1 = s.etiq0 + .6 * s.kRegles;                     // … et devient le titre (un declic)
  s.titre1 = s.etiq1 + .4 * s.kRegles;                    // « DESCRIPTION A » écrit
  s.fenB = mot('R03', 'celle-ci');                        // 356,2 : la fenêtre B s'ouvre, vide
  // ---------------------------------------------------------------- P40 · celle-ci (R04, lue)
  s.r04 = de('R04'); s.r04fin = fin('R04');
  s.mourez = mot('R04', 'vous mourez');                   // 358,2 : doute
  s.rien = mot('R04', 'il ne vous arrive rien');          // 361,6 : neutre
  // ---------------------------------------------------------------- P41 · les mêmes issues
  s.p41 = B.P41;                                          // les grilles baissent, le filet s'efface
  s.k41 = Math.min(1, (fin('R05') - B.P41) / 2.15); s.demonte0 = B.P41 + .25 * s.k41; s.demonte1 = s.demonte0 + .9 * s.k41;   // les descriptions se démontent en morceaux (serré : k41, plus bas)
  s.issues = B.P41 + .5 * s.k41;                          // les deux issues paraissent
  s.verif0 = fin('R05'); s.verif1 = de('R06');            // 367,0–369,6 : le temps de vérifier, en silence
  s.egal = mot('R06', 'exactement');                      // 370,9 : « = »
  s.issue1 = mot('R07', 'tout le monde vit');             // 374,7 : l'issue 1 s'allume
  s.issue2 = mot('R08', 'Sinon');                         // 375,7 : l'issue 2 s'allume
  s.meurent = mot('R08', 'meurent');                      // 377,1 : ses bleus partent en caractères
  s.vivent = mot('R08', 'vivent');                        // 378,7 : ses rouges lèvent les bras
  // ---------------------------------------------------------------- P42 · l'ordre et la tournure
  s.ordre = mot('R09', 'l\'ordre');                       // 380,7 : les morceaux de B prennent l'ordre de A
  s.tournure = mot('R09', 'la tournure');                 // 381,1 : les mots qui diffèrent pulsent
  s.kTournure = Math.min(1, (de('R10') - s.tournure) / 2.41); s.ordreRetour = Math.max(fin('R09') - .3, s.tournure + 1.3 * s.kTournure);   // ils reviennent à leur place (kTournure : plus bas)
  s.titreA = mot('R10', 'la description A');              // 383,3
  s.titreB = mot('R10', 'la description B');              // 385,1
  s.plusTard = mot('R11', 'Plus tard');                   // 386,9 : issues et fils s'effacent, les grilles reviennent
  s.autre = mot('R11', 'l\'autre description');           // 388,5 : chaque grille regarde l'autre fenêtre
  s.premier = mot('R11', 'en premier');                   // 392,1 : « lue en premier »
  // ---------------------------------------------------------------- P43 · un peu mieux compris
  s.compris = mot('R12', 'mieux compris');                // 394,3 : ✓ LABO au-dessus de chacun
  s.neufQuatre = mot('R13', '9,4 %');                     // 397,2 : neuf ✗ à gauche, et un dixième à 40 %
  s.septUn = mot('R14', '7,1 %');                         // 402,7 : sept ✗ à droite, et un huitième à 10 %
  s.reexplique = fin('R14') + .1;                         // 403,9 : les fenêtres pulsent (on leur a réexpliqué)
  s.corrige = s.reexplique + .3;                          // les ✗ redeviennent des ✓
  // ---------------------------------------------------------------- P44 · devinette A (écran 01, pas 0)
  s.d0 = B.P44;
  s.compte0 = fin('A02'); s.compte1 = de('A03');          // 411,7–416,2 : le compte à rebours, en silence
  s.insout = mot('A03', 'insoutenable');                  // 418,2 : plisse, parfaitement immobile
  s.suspense = fin('A03');                                // 418,8 : trois pouls graves
  // ---------------------------------------------------------------- P45 · 65,5 % (pas 1 et 2)
  s.d1 = de('A04') - 2.6;                                 // 420,0 : la jauge se remplit (sa boîte « 65,5 % » à la voix)
  s.d2 = mot('A05', 'tout le monde survit');              // 429,3 : la vie, le tampon
  s.felic = mot('A06', 'Félicitations');                  // 430,5 : Phi vous regarde
  s.chers = mot('A06', 'chers humains');                  // 431,2 : les cent se tournent vers Phi ; grand
  // ---------------------------------------------------------------- P46 · une expérience de pensée
  s.pensee = mot('A07', 'expérience de pensée');          // 434,0 : la bulle sort de l'œil
  s.vraies = mot('A08', 'vraies pilules');                // 436,1 : son contour tremble
  s.haute = mot('A08', 'aussi haute');                    // 439,4 : le fantôme de la jauge
  s.autor = mot('A09', 'l\'autorisation');                // 441,3 : le petit terminal
  s.malheur = mot('A09', 'malheureusement');              // 443,2 : « refusé » ; Phi vous regarde
  s.refuse = s.malheur - .3;
  s.inassouvie = mot('A10', 'inassouvie');                // 445,6 : la bulle éclate
  // ---------------------------------------------------------------- P47 · prédire les autres (écran 02)
  s.e0 = B.P47;
  s.predire = mot('A11', 'prédire');                      // 449,3 : la pluie des 2 222 points
  s.moy = mot('A12', '60,7');                             // 452,8 : « MOYENNE DES PRÉDICTIONS 60,7 % »
  s.pres = mot('A12', 'très près');                       // 454,9 : le tireté réel et la moyenne clignotent
  s.feliciter = mot('A13', 'féliciter');                  // 456,7 : grand
  s.ravise = mot('A13', 'ravisée');                        // 457,9 : plisse ; poussée ×1 → ×1,3 dans le nuage
  // ---------------------------------------------------------------- P48 · deux nuages
  s.cond1 = de('A14') - .2;                               // 463,0 : condensés en bonshommes
  s.cond0 = CONDENSATION;                                 // 462,0 : la condensation, 1 s avant cond1 (minutage.js ; la mention change, film.js)
  s.sep0 = s.cond0 - 1.2;                                 // 460,8 : chaque point prend sa couleur, le nuage se sépare
  s.moyR = mot('A14', '25 %');                            // 464,9 : « ROUGES : MOYENNE 25 % »
  s.zero = mot('A14', '0 %');                             // 467,8 : la pile à 0 % cernée
  s.moyB = mot('A15', '80 %');                            // 471,1 : « BLEUS : MOYENNE 80 % »
  s.cent = mot('A15', 'beaucoup');                        // 472,5 : la pile à 100 % s'illumine
  // ---------------------------------------------------------------- P49 · chacun comme lui
  s.gros = de('A16');                                     // 474,2 : deux gros plans, le reflet de leur couleur
  s.cligne = fin('A16');                                  // 476,2 : ils clignent, chacun à son rythme
  s.retour = mot('A17', 'sens opposés') - .25;            // 478,7 : retour au graphique, deux flèches
  s.hasard = mot('A17', 'presque par hasard');            // 481,2 : la moyenne retombe comme un dé
  // ---------------------------------------------------------------- P50 · leur propre mort
  s.intrigue = mot('A18', 'intriguée');                    // 483,9 : curieux
  s.pousse0 = de('A18') + .2; s.pousse1 = s.pousse0 + 4;  // la poussée ×1 → ×2,2 sur les bleus sous 50 %
  s.sous50 = mot('A19', 'moins de 50 %');                 // 487,9 : les trois cernés
  s.mort = mot('A20', 'leur propre mort');                // 491,7 : leurs fantômes, qui partent en caractères
  s.quandMeme = mot('A20', 'quand même');                 // 493,6 : ils lèvent les yeux vers Phi
  s.perplexe = mot('A21', 'perplexe');                    // 496,2 : doute, un long clignement
  s.recul0 = de('A21') + .3; s.recul1 = B.fin - .4;       // le retour ×1 : l'écran 02 entier pour la coupe
  // ---------------------------------------------------------------- les gestes de durée fixe, serrés sur la voix
  // Réglés sur l'estimation à 13 car./s, ils débordaient sur le mot, la réplique ou le plan suivant avec la voix
  // enregistrée. Chacun se serre dans le même rapport (k ≤ 1 : la place qu'il a jusqu'à son repère, sur celle qu'il avait
  // dans l'estimation, écrite ici), ses sons et ses regards avec lui. Quatre sont plus haut, sur la ligne de ce qu'ils
  // serrent : kTirage (P39, les sauts du tirage et les éclats, jusqu'à R02), kRegles (P39, RÈGLES qui glisse et devient
  // la description A, jusqu'à R03), k41 (P41, le démontage et les issues, jusqu'à la fin de R05, le temps de vérifier),
  // kTournure (P42, les mots qui pulsent et le retour de l'ordre, jusqu'à R10).
  s.kMoitie = Math.min(1, (s.regles - s.moitie) / 2.43);            // P39 : le regard sur la grille de gauche, avant RÈGLES
  s.kIssue1 = Math.min(1, (s.issue2 - s.issue1) / 2.03);            // P41 : l'issue 1 allumée, sa vie, avant « Sinon »
  s.kIssue2 = Math.min(1, (s.meurent - s.issue2) / 2.45);           // P41 : l'issue 2, avant « meurent »
  s.kMeurent = Math.min(1, (s.vivent - s.meurent) / 2.74);          // P41 : ses bleus qui partent, l'envol, avant « vivent »
  s.kOrdre = Math.min(1, (s.tournure - s.ordre) / .77);             // P42 : les morceaux de B dans l'ordre de A, avant « la tournure »
  s.kPremier = Math.min(1, (B.P43 - s.premier) / 1.55);             // P42 : « lue en premier », avant P43 (R12)
  s.kSept = Math.min(1, (s.reexplique - s.septUn) / 1.72);          // P43 : les ✗ de droite et leur regard, avant qu'on leur réexplique
  s.k45 = Math.min(1, (s.felic - s.d2) / 2.28);                     // P45 : la vie de « tout le monde survit », avant « Félicitations »
  s.kFelic = Math.min(1, (B.P46 - s.felic) / 2.73);                 // P45 : Phi vous regarde, avant P46 (A07)
  s.kFantome = Math.min(1, (s.autor - s.haute) / 2.81);             // P46 : le fantôme de la jauge et son regard, avant « l'autorisation »
  s.kMalheur = Math.min(1, (suivante('A09') - s.malheur) / 1.87);   // P46 : vous, sur « malheureusement », avant A10
  s.kPluie = Math.min(1, (suivante('A11') - s.predire) / 3.78);     // P47 : la pluie des points et son regard, avant A12
  s.kPres = Math.min(1, (suivante('A12') - s.pres) / 2.60);         // P47 : le réel et la moyenne qui clignotent, avant A13
  s.kZero = Math.min(1, (suivante('A14') - s.zero) / 1.57);         // P48 : la pile à 0 %, ses lignes et son regard, avant A15
  s.kMoyB = Math.min(1, (s.cent - s.moyB) / 1.84);                  // P48 : le regard sur la moyenne des bleus, avant « beaucoup »
  s.kCent = Math.min(1, (B.P49 - s.cent) / 2.70);                   // P48 : la pile à 100 %, son regard, avant les gros plans
  s.kGros = Math.min(1, (s.cligne - s.gros) / 3.92);                // P49 : les pouls des gros plans, avant le clignement (la fin de A16)
  s.kHasard = Math.min(1, (B.P50 - s.hasard) / 2.16);               // P49 : le regard sur la moyenne qui retombe, avant P50
  s.kSous50 = Math.min(1, (s.mort - s.sous50) / 5.81);              // P50 : les trois, un par un, avant « leur propre mort »
  s.kMort = Math.min(1, (suivante('A20') - s.mort) / 4.60);         // P50 : leurs fantômes et leur envol, avant A21
  return Object.freeze(s);
})();
