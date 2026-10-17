/* ==========================================================================
   Les deux pilules, l'épisode — plans/ecarts-temps.js : le minutage du lot « ecarts »

   Les bornes des plans, lues dans minutage.js, et les instants de chaque
   geste, calés sur leur mot par quandMot de texte.js : le jour où la voix de
   Ronan est posée, tout suit. Les seuls nombres écrits ici sont des durées de
   geste (« la boîte s'ouvre en 0,3 s »), jamais l'instant d'un mot ni une
   borne recopiés d'EPISODE.md. Les places de Phi, plan par plan.
   ========================================================================== */
import { REPLIQUE, quandMot, finParole, absente } from '../texte.js';
import { bornes } from '../minutage.js';

// les bornes des plans (EPISODE.md, « Les plans »), lues dans minutage.js : { P61: [de, a], …, P72: [de, a] }, sans LOT
// (ecarts.js le lit). Chaque plan y est ancré sur sa première réplique, que l'image précède parfois (P63 avant Q04…) ;
// P61, la devinette sans voix, dure 5,6 s, jusqu'à Q01. Les gestes posés sur BORNES suivent ces répliques, pas un mot
export const BORNES = (({ LOT, ...plans }) => Object.freeze(plans))(bornes('ecarts'));

// l'instant où la voix estimée dit ce mot (son premier caractère) ; le début de la réplique s'il manquait, sa place si
// la réplique a disparu (texte.js le dit dans la console, et verifie() aussi)
export const mot = (id, m) => quandMot(id, m, REPLIQUE[id]?.de);
export const de = id => REPLIQUE[id]?.de ?? absente(id, 'son début');

export const S = Object.freeze((() => {
  const s = {};
  // ---- P61 · la devinette (sans voix) : trois lignes tapées, puis le compte à rebours jusqu'à la voix
  s.p61 = BORNES.P61[0];
  s.lignes = [s.p61 + .2, s.p61 + 1.0, s.p61 + 1.8];
  s.compteD = 3;
  s.compte = de('Q01') - s.compteD;
  // ---- P62 · genre, politique (l'écran 09, pas 0 et 1)
  s.efface = de('Q01');                       // « Les deux groupes » : la boîte s'efface
  s.femmes = mot('Q01', '43 %');
  s.hommes = mot('Q01', '32 %');
  s.pol = mot('Q02', 'Plus on se situe');      // les cinq barres, en cascade
  // (s.pente, le trait qui joint leurs sommets une fois montées, 2,1 s après, est à la fin de S : serré par kPol)
  s.c39 = mot('Q03', '39 %');
  s.c23 = mot('Q03', '23 %');
  // ---- P63 · l'Europe à mesurer
  s.p63 = BORNES.P63[0];
  s.fenetre = s.p63 + .45;                      // la fenêtre PAYS s'ouvre pendant que la terre se pose
  s.q04 = de('Q04');
  s.finQ04 = finParole('Q04');
  // les cinq pays du script, dans son ordre, 2 s chacun, à partir de la fin de « D'un pays à l'autre : »
  s.pays = [0, 1, 2, 3, 4].map(k => s.finQ04 + .4 + 2 * k);
  // ---- P64 · tous les écarts (l'écran 10)
  s.p64 = BORNES.P64[0];
  s.ecarts = mot('Q05', 'Ces écarts');          // femmes / hommes, gauche / droite poussent
  s.desc = mot('Q05', 'la description A ou B'); // la barre de la description file
  s.c11 = mot('Q06', 'Onze');
  s.c16 = mot('Q06', 'seize');
  s.c53 = mot('Q06', 'cinquante-trois');
  // ---- P65 · les messages, floutés
  s.p65 = BORNES.P65[0];
  s.revenons = de('N01');
  s.detestent = mot('N02', 'se détestent-ils');
  s.autant = mot('N02', 'autant');
  // ---- P66 · Nietzsche
  s.p66 = BORNES.P66[0];
  s.terminal = de('N03') + .2;                  // « > ouvrir généalogie_de_la_morale »
  s.calcul = s.terminal + 1.6;                   // le portrait se calcule, rangée par rangée…
  s.nom = mot('N04', 'Nietzsche');               // … jusqu'à son nom
  s.bon = mot('N04', '« bon »');
  s.contraires = mot('N04', 'deux contraires');
  s.mauvais = mot('N04', '« mauvais »');
  s.mechant = mot('N04', '« méchant »');
  // ---- P67 · le mauvais, le méchant
  s.p67 = BORNES.P67[0];
  s.rate = mot('N05', 'celui qui rate');        // il saute… et rate
  s.trompe = mot('N05', 'qui se trompe');
  s.plaint = mot('N06', 'on le plaint');         // ses voisins s'approchent, l'un tend la main
  s.veut = mot('N07', 'veut du mal');            // la bulle de pensée
  s.blame = mot('N08', 'on le blâme');           // ses voisins s'écartent et le montrent du doigt
  // ---- P68 · bon / mauvais, bon / méchant
  s.p68 = BORNES.P68[0];
  s.rouges = de('N09');
  s.premier = mot('N09', 'premier sens');
  s.correct = mot('N10', 'le choix correct');
  s.trompes = mot('N10', 'se sont trompés');
  s.betes = mot('N11', 'un peu bêtes');
  s.regrettent = mot('N11', 'regrettent');
  s.bleus = de('N12');
  s.second = mot('N12', 'second sens');
  s.bien = mot('N12', 'le bien de tous');
  s.faute = mot('N13', 'faute morale');
  // ---- P69 · une insulte
  s.p69 = BORNES.P69[0];
  s.blament = mot('N14', 'Les bleus blâment');
  s.plaignent = mot('N14', 'les rouges plaignent');
  s.insulte = mot('N14', 'comme une insulte');
  // ---- P70 · un virus saisonnier : quatre vagues (la première, « interminable », dure jusqu'à la deuxième)
  s.p70 = BORNES.P70[0];
  s.vagues = [s.p70 + .2, mot('N15', 'refait surface'), mot('N15', 'régulièrement'), mot('N16', 'virus saisonnier')];
  s.saisonnier = mot('N16', 'saisonnier');
  // ---- P71 · avant tout, la description
  s.p71 = BORNES.P71[0];
  s.sondage = de('N17');
  s.kant = mot('N18', 'Kant');
  s.proba = mot('N18', 'probabilités');
  s.avantTout = mot('N19', 'avant tout');
  s.cause = mot('N19', 'à cause de la description');
  s.lue = mot('N19', 'lue en premier');
  // ---- P72 · de très loin
  s.p72 = BORNES.P72[0];
  s.loin = mot('N20', 'de très loin');
  s.important = mot('N20', 'le plus important');
  // ---- les gestes de durée fixe, réglés sur l'estimation à 13 car./s, qui couraient avec la voix enregistrée sur le
  // mot, la réplique ou le plan suivant : chacun se serre dans le rapport k = min(1, la place qu'il a avec la voix / celle
  // qu'il avait dans l'estimation, écrite au centième) ; ses sons et ses regards avec lui (RECALAGE.md, étape 14)
  s.kFemmes = Math.min(1, (s.hommes - s.femmes) / 4.53);      // le témoin FEMMES lève les yeux (2,8 s), avant « 32 % »
  s.kHommes = Math.min(1, (s.pol - s.hommes) / 2.92);         // le témoin HOMMES (2,8 s), le regard sur sa barre (1,9 s)
  s.kPol = Math.min(1, (s.c39 - s.pol) / 4.64);               // la cascade politique, ses témoins, la pente, avant « 39 % »
  s.pente = s.pol + 2.1 * s.kPol;                             // le trait qui joint leurs sommets (une fois montées)
  s.kNoms = Math.min(1, (s.ecarts - s.p64) / 1.07);           // les cinq noms qui glissent de la carte (1,14 s), avant « Ces écarts »
  s.kDesc = Math.min(1, (s.c11 - s.desc) / 2.39);             // la barre de la description, son regard, son souffle
  s.kMechant = Math.min(1, (s.p67 - s.mechant) / 1.63);       // Nietzsche regarde « BON » jusqu'à « méchant » + 1,2 s
  s.kPlaint = Math.min(1, (de('N07') - s.plaint) / 1.60);     // les voisins s'approchent, la main, il lève les yeux
  s.kVeut = Math.min(1, (de('N08') - s.veut) / 1.52);         // le regard sur la bulle de pensée, son envol
  s.kBien = Math.min(1, (de('N13') - s.bien) / 1.88);         // les anneaux du signal, leurs notes, le regard
  // les regards du sursaut (celui qui reçoit, puis l'autre : 1,1 + 0,9 s depuis tRecu − 0,1, ecarts-morale.js : tCroise
  // = « comme une insulte » − 0,45 s, D_CROISE = 1,3 s) passaient déjà la coupe de P70 dans l'estimation (de 0,47 s) : ils
  // se serrent sur la place qu'ils ont jusqu'à elle (la place sur la durée du geste)
  s.kRecu = Math.min(1, (s.p70 - (s.insulte - .45 + 1.3 - .1)) / 2.0);
  // les trois vagues régulières (de proche en proche, la tenue, l'effacement, le reflux), d'un même k pour rester les mêmes
  s.kVague = Math.min(1, (s.vagues[2] - s.vagues[1]) / 2.52, (s.vagues[3] - s.vagues[2]) / 2.84, (s.p71 - s.vagues[3]) / 2.03);
  // les pointillés de Kant (avant « probabilités ») et du « % » (avant N19), et leurs regards, d'un même k
  s.kKant = Math.min(1, (s.proba - s.kant) / 1.19, (de('N19') - s.proba) / 1.69);
  s.kLoin = Math.min(1, (s.important - s.loin) / 1.92);       // le regard au bout de la longue barre, avant « le plus important »
  return s;
})());

// les places de Phi (EPISODE.md, plan par plan) : { x, y, taille }
export const OEIL = Object.freeze({
  resultats: Object.freeze({ x: 1790, y: 120, taille: 120 }),   // les écrans de Thibaut (P61–P62, P64, P72)
  carte: Object.freeze({ x: 1560, y: 84, taille: 100 }),        // la carte (OEIL_COIN de film-pilules/plans/europe.js)
  filet: Object.freeze({ x: 960, y: 90, taille: 100 }),         // au sommet du filet (P65, P68–P69)
  nietzsche: Object.freeze({ x: 1180, y: 280, taille: 180 }),   // entre les mots et la fenêtre NIETZSCHE (P66–P67)
  vagues: Object.freeze({ x: 1700, y: 120, taille: 110 }),      // en haut à droite (P70)
  colonnes: Object.freeze({ x: 960, y: 90, taille: 90 }),       // au sommet du filet des colonnes du tirage (P71)
});
