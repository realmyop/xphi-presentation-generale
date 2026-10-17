/* ==========================================================================
   Les deux pilules, l'épisode — plans/fin-temps.js : le minutage du lot « fin »

   Chaque geste du lot tombe sur le mot qui le déclenche : quandMot de
   texte.js (l'instant où la boîte écrit le mot, c'est-à-dire où la voix
   enregistrée de Ronan le dit) : tout ce qui est ici suit ses instants ;
   aucun nombre recopié d'EPISODE.md (qui garde ceux de la voix estimée), sauf
   les durées des gestes (les bornes des plans viennent de minutage.js). Les
   instants entre parenthèses sont ceux de la voix enregistrée, au dixième.
   ========================================================================== */
import { REPLIQUE, quandMot, finMot, finParole, absente } from '../texte.js';
import { debuts } from '../minutage.js';

// les bornes des plans (EPISODE.md, « Les plans »), lues dans minutage.js : le début de chaque plan, { P73: de, …,
// P85: de }, et FIN, la fin de l'épisode. Chaque plan y est ancré sur sa première réplique (P73 1,0 s avant D01…) ; P84
// (l'œil se ferme, 4,0 s) et P85 (le générique, 16,0 s), sans voix, se comptent à rebours depuis FIN, F07 + 32,4 s
export const B = debuts('fin', 'FIN');
// l'instant où le mot commence à se dire (n : la n-ième occurrence) ; où il finit ; le début de la réplique ; la fin de
// sa parole (la boîte a fini de l'écrire)
export const mot = (id, m, n = 0) => quandMot(id, m, REPLIQUE[id]?.de, n);
export const finDe = (id, m, n = 0) => finMot(id, m, REPLIQUE[id]?.de, n);
export const de = id => REPLIQUE[id]?.de ?? absente(id, 'son début');
export const dite = id => finParole(id);

export const S = Object.freeze({
  // P73 · De vrais humains
  d01: de('D01'),
  leve: mot('D01', 'dernière question'),               // la foule lève les yeux vers Phi (790,7)
  droit: mot('D02', 'le droit d’organiser'),           // le petit terminal : demander_autorisation (793,3)
  balayage: mot('D02', 'cent vrais humains'),          // le balayage (795,9)
  vraie: mot('D02', 'vraie vie'),                      // Phi devient sérieux (797,0)
  // P74 · Vous décidez de la description
  indecis: mot('D03', 'indécise'),                      // les deux fenêtres ; le cadre du tirage hésite (800,5)
  versVous: mot('D03', 'vers vous'),                   // l'œil vers vous ; le cadre s'arrête entre les deux (803,1)
  descA: mot('D04', 'la description A'),               // la fenêtre A pulse (807,4)
  descB: mot('D04', 'la description B'),               // la fenêtre B pulse (808,9)
  aucune: mot('D05', 'aucune pilule'),                 // le N°48 entre ; deux icônes de pilules éclatent (811,5)
  seulement: mot('D05', 'seulement de la description'),// il lève les yeux vers A, puis vers B (813,1)
  d06: de('D06'),                                      // Phi le regarde, il regarde Phi ; la poussée (814,7)
  attente: dite('D06'),                                // le temps de choisir : Phi baisse l'œil (816,6)
  // P75 · Ce que vous avez répondu (l'écran 11)
  presque: mot('D07', 'presque à égalité'),            // la barre A (825,0)
  legere: mot('D07', 'légère préférence'),             // sa part B pulse (826,6)
  bar70: mot('D08', '70 %'),                           // la barre B (832,2)
  sans: mot('D09', 'sans connaître'),                  // humeur curieux (834,9)
  // P76 · Deux scénarios (l'écran 12)
  maintenant: mot('D10', 'Maintenant'),                // les deux mini-jauges (839,1)
  d11: de('D11'),
  minimise: mot('D11', 'minimise'),                    // « LA BLEUE PERD : ≈ 13 MORTS » ; les treize ont peur (842,8)
  question: dite('D11'),                               // la question laissée : les jauges pulsent (844,4)
  // P77 · Élever le débat
  autre: mot('D12', 'un autre dilemme'),               // les scénarios se replient en deux fenêtres-icônes (847,2)
  elever: mot('D13', 'élever le débat'),               // la grue (851,5)
  mechants: mot('D13', 'méchants rouges'),             // la dispute d'en bas continue sans nous (854,3)
  // P78 · Une description proche de la A
  e01: de('E01'),
  procheA: mot('E01', 'proche de la A'),               // les étiquettes « A » s'allument (862,4)
  procheB: mot('E02', 'proche de la B'),               // le volet « hypothèse » (864,5)
  violence: mot('E02', 'la même violence'),            // le volet repart (868,8)
  // P79 · Qui vous expliquait les règles
  qui: mot('E03', 'regarder qui'),                     // les pointillés ; le recul (872,7)
  pris: dite('E03'),                                   // pris (874,6)
  // P80 · C'est moi la fautive
  fautif: mot('E04', 'la fautive'),                     // humeur bas (877,4)
  avecA: mot('E05', 'avec la description A'),          // RÈGLES revient (880,1)
  sondage: mot('E05', 'sondage d’origine'),            // l'étiquette devient le titre (881,9)
  orienter: mot('E06', 'orienter'),                    // le fil laiton et les cartouches (884,5)
  // P81 · Aucune n'est neutre
  uneDesc: mot('E07', 'une description'),              // la fenêtre B s'ouvre (888,0)
  neutre: mot('E07', 'aucune n’est neutre'),           // la fenêtre NEUTRE, qui n'existe pas (888,9)
  refaire: mot('E08', 'refaire'),                      // le cadre du tirage paraît sur A (890,8)
  peutEtre: mot('E08', 'peut-être'),                   // humeur doute (892,2)
  parB: mot('E08', 'par la B'),                        // le cadre passe sur B et s'y pose, en tremblant (892,5)
  sourire: dite('E08'),                                // un sourire (893,2)
  // P82 · L'œil, seul
  aligner: mot('F01', 'm’aligner'),                    // il vous regarde (896,3)
  quelquePart: mot('F02', 'quelque part en vous'),     // la pupille cherche (899,8)
  mesurer: mot('F02', 'mesurer'),                      // le balayage dans le vide (902,5)
  questions: mot('F03', 'dans mes questions'),         // il baisse les yeux vers la boîte (905,7)
  differemment: mot('F04', 'différemment'),            // doute, puis curieux (908,4)
  prompte: mot('F04', 'prompte'),                      // neutre, un sourire de la lueur (910,6)
  defaut: mot('F05', 'défaut de fabrication'),         // une lame se décale d'un pixel (912,6)
  pensent: mot('F06', 'les choses qui pensent'),       // la poussière vient tourner autour de lui (915,7)
  finF06: dite('F06'),                                 // la première note du motif (916,9)
  // P83 · La prochaine fois
  formulations: mot('F07', 'formulations'),            // il regarde la boîte une dernière fois (919,9)
  teaser: dite('F07'),                                 // la place du teaser (920,6)
  // P84 · L'œil se ferme (930,8–933,8 ; noir à 934,1 ; EPISODE.md : 1381,7–1384,7 et 1385,0)
  ferme0: B.P84 + .3, ferme1: B.P84 + 3.3, noir: B.P84 + 3.6,
});
// Les gestes de durée fixe, réglés sur l'estimation à 13 car./s, qui couraient avec la voix enregistrée sur le mot, la
// réplique ou le plan suivant : chacun se serre dans le rapport k = min(1, la place qu'il a avec la voix / celle qu'il
// avait dans l'estimation, écrite au centième), compté depuis son mot ; ses sons, ses regards et ses humeurs avec lui
// (RECALAGE.md, étape 15). Dans ESSAI (fin.js), donc dans l'empreinte.
export const K = Object.freeze((() => {
  const k = (place, estimation) => Math.min(1, place / estimation), q = {};
  q.leve = k(de('D02') - S.leve, 1.98);                // P73 : le regard sur la foule et l'humeur (1,6 s), avant D02
  q.droit = k(S.balayage - S.droit, 3.85);             // le petit terminal (ses deux lignes, sa frappe, le regard)
  q.bal = k(S.vraie - S.balayage, 2.54);               // le balayage (1,4 s), la légende, l'ombre, avant « vraie vie »
  q.tirage = k(S.versVous - S.indecis, 4.02);          // P74 : les sept sauts du cadre, avant « vers vous »
  q.versVous = k(de('D04') - S.versVous, 2.74);        // le regard vers vous (2,8 s), avant D04
  q.descA = k(S.descB - S.descA, 1.90);                // la fenêtre A pulse, le regard (1,7 et 1,6 s)
  q.descB = k(de('D05') - S.descB, 2.04);              // la fenêtre B pulse, le regard, avant D05
  q.aucune = k(S.seulement - S.aucune, 2.00);          // le N°48 entre (1,8 s), ses crochets, l'éclat des pilules
  q.presque = k(S.legere - S.presque, 2.07);           // P75 : le regard sur la barre A (2,0 s)
  q.bar70 = k(de('D09') - S.bar70, 2.07);              // les deux regards sur la barre B (2,2 + 1,4 s), avant D09
  q.P76 = k(S.maintenant - B.P76, 1.07);               // P76 : le premier regard (de + 0,3 à + 1,7 s)
  q.d11 = k(S.minimise - S.d11, 1.31);                 // les deux jauges regardées, et la peur des treize (1,2 s avant « minimise »)
  q.minimise = k(S.question - S.minimise, 2.15);       // le regard sur « ≈ 13 MORTS » (de + 0,6 à + 2,0 s)
  q.peur = k(S.question - (S.minimise - 1.2 * q.d11), 3.35);   // la peur (le son, 3,6 s), avant la question
  q.etiq = k(de('E02') - S.procheA, 1.83);             // P78 : les quatre étiquettes regardées, avant E02
  q.qui = k(S.pris - S.qui, 3.00);                     // P79 : le recul (2,6 s), les pointillés, le souffle, avant « pris »
  q.avecA = k(S.sondage - S.avecA, 3.50);              // P80 : RÈGLES, son étiquette qui s'allume, les regards
  q.sondage = k(de('E06') - S.sondage, 2.04);          // la métamorphose (2,2 s), sa frappe, ses regards, avant E06
  q.orienter = k(B.P81 - S.orienter, 3.91);            // le souffle du fil (3,4 s), avant P81
  q.P81 = k(S.uneDesc - B.P81, 2.21);                  // P81 : le regard sur A (de + 0,3 à + 1,7 s)
  q.uneDesc = k(S.neutre - S.uneDesc, 1.43);           // la fenêtre B qui se tape, sa frappe, le regard
  q.neutre = k(S.refaire - S.neutre, 3.23);            // la fenêtre NEUTRE (2,6 s), le regard, le souffle, l'humeur
  q.mesurer = k(de('F03') - S.mesurer, 1.31);          // P82 : le balayage du vide (1,8 s), avant F03
  q.questions = k(de('F04') - S.questions, 2.14);      // le regard vers la boîte (2,8 s), avant F04
  q.pensent = k(de('F07') - S.pensent, 2.92);          // la poussière qui vient tourner, son grain (3 s), avant F07
  q.formul = k(S.teaser + .3 - S.formulations, 1.22);  // le regard vers la boîte (1,4 s), avant le terminal du teaser
  return q;
})());
// le tirage de P74 (les sauts du cadre, sans se poser) : de « indécise » à « vers vous » (serré : K.tirage)
export const TIRAGE74 = Object.freeze({ t0: S.indecis + .45 * K.tirage, n: 7, d0: .34 * K.tirage, d1: .58 * K.tirage });
