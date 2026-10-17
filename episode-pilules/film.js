/* ==========================================================================
   Les deux pilules, l'épisode — film.js : le cadre (l'animatique entière)

   Ronan : « Toutes les séquences du script, dans l'ordre, avec le texte de
   Thibaut tel quel pour la voix et les images qu'il indique. On reprend son
   test et ses douze écrans de résultats, avec les nouveaux bonshommes, et on
   crée le reste (Kant, Alice, Nietzsche, le méta-dilemme). Environ 20
   minutes de voix : d'abord en images simples calées sur le texte, ensuite
   on peaufine. » Puis : « je veux que tu prennes les petits bonhommes que tu
   as dans le premier film de 3 minutes 20, on est bien d'accord ? »

   Le script de Thibaut (docs/pilules-script-magazine-26-min.md) est la
   référence ; son découpage, séquence par séquence et plan par plan, est
   EPISODE.md (il fait foi : les instants, les places, les gestes, les sons).
   Ce fichier est le moteur du film de 3 min 20 (mockups/film-pilules/film.js,
   qui n'est pas touché), recopié et porté à l'épisode : 950,46 s avec la voix, 13
   séquences, 85 plans, 198 répliques, 8 lots.

   Tout est fonction du temps t (en secondes) : composer(t) dessine l'image de
   l'instant t ; la page joue l'épisode en direct, ?t=642.5 en montre une
   image fixe, ?rendu=1 et window.film servent au rendu vidéo image par image
   (25 i/s, tools/rendre-film.cjs --film episode-pilules).

   Ce fichier tient la ligne de temps (DUREE, LOTS, DECOUPAGE : leurs nombres
   viennent de minutage.js, ce qu'ils racontent est ici), appelle le bon
   plan, fait les transitions, dessine la SURIMPRESSION (la boîte de dialogue
   XPHI, le cartouche, la mention, puis le voile par-dessus tout) et la
   lecture.

   Paramètres : ?t=642.5 (une image fixe, en pause ; ?t=642,5 aussi, comme
   EPISODE.md écrit ses instants) · ?plan=kant (un lot), ?plan=P42 (un plan) ou
   ?plan=S05 (une séquence) : le mode plan, qui boucle · ?de=600&a=640 (boucle
   sur un moment ; ?a=640 seul : de 0 à 640) · ?rendu=1 (ni barre ni commandes,
   ni plein écran : pour le rendu vidéo) · ?ecriture=jeu (la boîte écrit à 36 car./s, comme
   index.html, au lieu du rythme de la parole : voir texte.js).
   Clavier : espace lecture/pause · ← → 5 s · Maj+← → 1 s · , . une image ·
   R recommencer (la boucle) · C la barre de temps · M le son (son.mp3 : les sons de
   tools/rendre-film.cjs --son-seul, et la voix, tools/voix/chaine/mixe_voix.py ; chargé
   à la première lecture et joué avec l'image par un élément audio ; sans lui,
   l'épisode est muet) · F le plein écran (aussi le bouton au bout de la barre ;
   sans l'API, sur iPhone, le plein fenêtre ; Échap ou F en sort). Début : la touche Origine.
   Sans ?t, la page montre l'affiche (le titre, AFFICHE) ; la lecture part du
   début (de la boucle en mode plan, qui joue tout de suite).

   ---------------------------------------------------------------------------
   CONTRAT POUR LES LOTS — ce qu'un lot écrit, ce qu'il peut utiliser
   ---------------------------------------------------------------------------
   1. Les huit lots (LOTS ci-dessous ; EPISODE.md, « Les lots ») sont écrits
      en parallèle. Un lot n'écrit QUE ses fichiers : plans/<lot>.js (et, s'il
      en veut, plans/<lot>-*.js, plans/essai-<lot>.html). Il ne touche ni à ce
      fichier, ni à index.html, commun.js, partage.js, texte.js,
      plans/ebauche.js (le socle), ni à resultats.js et donnees.js (écrits par
      un autre agent, EN MÊME TEMPS que le socle), ni au film de 3 min 20
      (mockups/film-pilules/), ni aux autres lots. S'il lui faut un utilitaire
      qui n'existe pas, il le définit chez lui (son origine en commentaire
      s'il le recopie d'un module du film qui ne l'exporte pas) ; si un
      raccord entre deux lots en dépend, ou si un texte ou un chiffre ne va
      pas, il le dit : on le change à la source (commun.js, texte.js,
      donnees.js).

   2. plans/<lot>.js est un module ES qui exporte :
        export const LOT = { id: 'kant', de: 122.66, a: 257.98 };   // bornes('kant'), minutage.js
        export const PLANS = [
          { id: 'P19', de: 122.66, a: 129.46,
            dessine(ctx, t, cam, infos) { … },
            camera: [[t, wx, wy, sx, sy, z], …],     // facultatif
            entree: { type: 'volet', sens: 'droite' }, // facultatif
            sortie: { type: 'noir', d: .6 } },         // facultatif
          …
        ];
        export const SONS = [ { t: 123.86, son: 'declic', g: .4, pan: -.2 }, … ];
        export function verifie() { return ['…ce qui cloche', …]; }   // facultatif : verifie() l'appelle
        export const REGARDS_HORS = [[de, a], …];   // facultatif : les moments où Phi regarde hors de l'image, voulus (regardHors)
      Les bornes du lot sont celles de LOTS ; celles des plans, celles de
      DECOUPAGE (EPISODE.md, « Les plans ») ; un plan ne sort jamais de son lot
      (un id de plan commence par celui de DECOUPAGE : 'P22', ou 'P22b' pour un
      morceau de P22). Aux frontières, l'image de raccord est dans EPISODE.md
      (le premier et le dernier plan de chaque lot, et « RACCORDS » du brief).
      SONS : le vocabulaire de tools/son-pilules.cjs (VOCABULAIRE ci-dessous :
      nappe (f 'labo' | 'nuit', g), silence (d), tic (f), haptique, frappe, hop,
      pop, grain, souffle, vie, peur, envol, retour, tampon, coche, croix,
      declic, clac, trotteuse, pouls, motif, vibreur, note (f, d) ; g, pan, d) ;
      t en temps absolu. Les petits bips du texte qui s'écrit sont ajoutés par
      le socle. Calez les sons sur les mots, comme les gestes (quandMot).

   3. dessine(ctx, t, cam, infos) — appelée à chaque image où le plan est actif :
      - t : le temps ABSOLU de l'épisode (de 0 à DUREE : 950,46 avec la voix). Aucun état d'une
        image à l'autre : ?t=123.4 doit donner exactement l'image de la
        lecture (hache, rng à graines fixes ; jamais Math.random ; les
        mémoires de calcul sont permises si elles ne changent pas l'image).
      - ctx : une toile 1920×1080 à soi, remise à zéro avant chaque appel
        (transformation, alpha, découpe : rien ne fuit vers la surimpression
        ni vers l'image suivante). Le plan peint TOUT son fond.
      - cam : la caméra du plan à l'instant t, tirée de plan.camera (images
        clés [t, wx, wy, sx, sy, z] : « le point (wx, wy) du monde en (sx, sy)
        à ×z », en douceur, le zoom en échelle logarithmique) ; IDENTITE sans
        plan.camera. cam.applique(ctx) (entre save et restore), cam.ecran(x,
        y), cam.monde(x, y), cam.z. Un plan qui a plusieurs caméras (l'écran
        partagé, le cadre des résultats de resultats.js) les calcule lui-même :
        camera(t, cles) et cadre() de commun.js. « Le monde qui penche »
        (variantes) : une rotation de la couche du monde que le plan applique
        lui-même, jamais à l'œil.
      - infos : { lot, plan (sa ligne de DECOUPAGE : titre, sequence, script,
        repliques), europe (globalThis.EUROPE, ou null), resultats (le module
        resultats.js, ou null s'il manque), donnees (donnees.js, ou null),
        rendu }.
      Le plan dessine le MONDE (sous sa caméra) puis PHI (l'œil-diaphragme,
      oeil() et creeRegard() de commun.js, placé plan par plan, hors caméra :
      il regarde ce dont il parle au moment où il le dit). Il ne dessine NI la
      boîte de dialogue XPHI, NI le cartouche, NI la mention, NI le voile :
      c'est la surimpression, dessinée ici, par-dessus (SURIMPRESSION
      ci-dessous). Rien d'important sous y = 830 (la boîte : x 80–1840,
      y 862–1040, étiquette XPHI en 112, 838).

   4. Les transitions :
      - coupe (par défaut) et raccord : deux plans qui se suivent ;
      - fondu enchaîné : deux plans d'un même lot qui se chevauchent (un plan
        peut déborder de 0,5 s sur son voisin, jamais hors de son lot) ; pendant
        le chevauchement, le second apparaît sur le premier (eIO) ;
      - volet : le même chevauchement, avec entree: { type: 'volet', sens }
        sur le second (sens 'droite' : le bord part de la gauche ; 'gauche',
        'bas', 'haut') ;
      - fondu au noir : entree / sortie: { type: 'noir', d } (le plan sort du
        noir, ou y entre, en d secondes ; la surimpression reste).
      Dans un chevauchement, chaque plan reçoit le même t : le premier doit
      savoir se dessiner un peu après sa fin nominale.

   5. Ce qu'on peut importer (depuis plans/) :
      - '../commun.js' : la DA et LES BONSHOMMES DU FILM DE 3 MIN 20 (une copie
        exacte de mockups/film-pilules/commun.js : dessineSujet, l'atlas, les
        coiffes, les états, l'œil, le regard, les foules PREMIERS et DEMO…),
        plus ce que plusieurs lots dessinent pareil (le terminal, RÈGLES et
        l'étiquette « A », les fenêtres de description, le fil des réseaux,
        la vague, l'anneau, Kant et Nietzsche, les poses nouvelles, les
        bulles, Alice, le tirage, la devinette et son compte à rebours, le
        carton, les vrais humains) : voir son en-tête. '../partage.js' en est
        un autre nom (EPISODE.md l'appelle ainsi) : les mêmes objets.
      - '../texte.js' : REPLIQUES, REPLIQUE[id], quandMot(id, mot), finMot,
        finParole(id), lettres(id, T), texteDe(id), plume(T), repliqueA(T),
        DESCRIPTIONS (A, B), MENTIONS, SEQUENCES. CALEZ CHAQUE GESTE SUR SON
        MOT : quandMot('T07', 'meurent'), jamais un nombre recopié
        d'EPISODE.md (le jour où Ronan enregistre, tout doit suivre).
      - '../resultats.js' (les douze écrans de Thibaut : ecran(ctx, T, n, d,
        o)…) et '../donnees.js' (tous les chiffres du sondage, avec leur
        statut) : écrits par un autre agent, en même temps que ce socle. Un
        lot qui les importe ne se charge pas tant qu'ils manquent ou sont
        cassés : l'épisode montre alors son ébauche et le dit (console,
        verifie()). Pour s'en passer sans casser : infos.resultats (null s'il
        manque) plutôt qu'un import.
      - globalThis.EUROPE (../film-pilules/europe.js, chargé par index.html) :
        la terre et ses pays, pour la carte « à mesurer » (P63) ; ses données
        par pays sont INVENTÉES : ne pas les montrer.
      - les modules du film, seulement ce qu'ils exportent (une fonction non
        exportée se recopie chez soi).
      Ce fichier se lit (DUREE, LOTS, DECOUPAGE, SURIMPRESSION) sans être
      importé par un lot : infos suffit.

   6. Si dessine lève une erreur, l'épisode l'écrit dans la console (une fois)
      et sur l'image, et continue ; un lot qui ne se charge pas est remplacé
      par son ébauche (plans/ebauche.js : le plan, l'indication du script, ses
      répliques). window.film.verifie() liste ce qui cloche : les lots absents
      ou cassés, les plans hors de leur lot, les moments sans plan, les
      répliques trop larges, trop longues ou absentes, les sons pris par deux
      images ou hors du vocabulaire, les caractères hors des polices, les
      données, les cernes des écrans de résultats (ce qu'ils entourent, ce
      qu'ils comptent), la lecture de l'adresse, le curseur du terminal après
      ses signes, resultats.js et europe.js absents ; et le temps (verifieTemps) :
      le découpage contigu de 0 à DUREE, les lots contigus et faits de leurs
      plans, les PLANS de chaque lot aux bornes du découpage, les cartouches et
      les mentions sur des bornes de plan, l'ordre des répliques, les cibles
      de regard qui ne durent pas.
      window.film.empreinte() rend tout le temps de l'épisode en JSON (les
      bornes, la surimpression, les répliques, ce que les lots exposent, les
      sons) ; window.film.ecartsEmpreinte(avant, apres) dit ce qui a bougé
      (le recalage sur la voix : tools/voix/RECALAGE.md).
      Quatre essais plus lents dessinent l'épisode : window.film.glyphes() (les
      caractères hors des polices), window.film.sousSurimpression() (ce qu'un
      plan dessine sous la boîte XPHI, qui se lit à travers, ou sous le
      cartouche, qui le cache), window.film.sousOeil() (ce qui passe sous
      l'œil de Phi, qui paraît tranché) et window.film.regardHors() (ce que
      regarde Phi, hors de l'image). Hors ?rendu=1,
      window.film.essaiLecture() joue le début de quelques plans.
   ========================================================================== */
import * as C from './commun.js';
import { dialogue, verifieRepliques, motsIntrouvables, repliquesAbsentes, prepareTextes, reglerEcriture, ecritsEntre, finParole, REPLIQUES, DESCRIPTIONS, MENTIONS, SEQUENCES,
  BOITE, ECRITURE, PAROLE, PAUSE, LIRE, CPS } from './texte.js';
import { ebauche } from './plans/ebauche.js';
import { DUREE, AFFICHE, TEMPS_LOTS, TEMPS_PLANS, TEMPS_PLAN, TITRE_AU_CARTOUCHE, CONDENSATION } from './minutage.js';

const { W, H } = C;
// DUREE : la fin de l'épisode ; AFFICHE : l'image de la page avant la lecture, le titre « XPHI · LES DEUX PILULES » (P08)
export { DUREE, AFFICHE };
export const IPS = 25;

// ================================================================ la ligne de temps (EPISODE.md, « Les lots », « Les plans »)
// Le temps vient de minutage.js (tools/voix/RECALAGE.md, étape 4) : DUREE, AFFICHE, le lot de chaque plan, les bornes
// des plans (ancrés sur leur première réplique, ou muets avec leur durée) et celles des lots (de leur premier plan à
// leur dernier). Ici, ce que les lots et les plans racontent, dans l'ordre de minutage.js : les mêmes ids des deux
// côtés, ou rien ne se charge (l'erreur nomme ce qui manque).
function avecTemps(nom, lignes, temps) {   // → [[sa ligne de temps (minutage.js), sa ligne d'ici], …]
  const ids = lignes.map(l => l[0]), ts = temps.map(x => x.id);
  if (ids.join(' ') !== ts.join(' ')) {
    const sansTemps = ids.filter(id => !ts.includes(id)), sansLigne = ts.filter(id => !ids.includes(id));
    throw new Error(`film.js : ${nom} n'a pas les ids de minutage.js (sans temps : ${sansTemps.join(', ') || '—'} ; `
      + `sans ligne ici : ${sansLigne.join(', ') || '—'}${sansTemps.length || sansLigne.length ? '' : ' ; les mêmes, dans un autre ordre'})`);
  }
  return lignes.map((l, i) => [temps[i], l]);
}
// un lot : [id, ce qu'il raconte] ; ses plans (le premier et le dernier), son début et sa fin viennent de minutage.js
export const LOTS = Object.freeze(avecTemps('LOTS', [
  ['ouverture', 'Ouverture, générique « Xphi · Les deux pilules »'],
  ['test', 'Partie 1 · Le test'],
  ['kant', 'Partie 1 · Un dilemme kantien ?'],
  ['variantes', 'Partie 1 · Deux variantes déséquilibrées'],
  ['tirage', 'Partie 2 · Le tirage au sort ; Description A (écrans 01 et 02)'],
  ['resultats', 'Partie 2 · Description B ; Les deux descriptions… (écrans 03 à 08)'],
  ['ecarts', 'Partie 2 · Qui prend la bleue ? (écrans 09, 10) ; Partie 3 · Mauvais ou méchants'],
  ['fin', 'Partie 3 · Le méta-dilemme (écrans 11, 12) ; Qui explique les règles ; la fin'],
], TEMPS_LOTS).map(([{ id, de, a }, [, sequences]]) => {
  const P = TEMPS_PLANS.filter(p => p.lot === id);
  return Object.freeze({ id, plans: `${P[0].id}–${P[P.length - 1].id}`, sequences: C.fr(sequences), de, a });
}));
// un plan : [id, séquence, titre, répliques, l'indication du script qu'il réalise (citée, jamais dite)] ; son lot, son
// début et sa fin viennent de minutage.js (le ∅ du script s'écrit Ø : aucune police du dépôt ne l'a)
export const DECOUPAGE = Object.freeze(avecTemps('DECOUPAGE', [
  ['P01', 'S01', 'L’œil s’ouvre', 'O01', '[VISUEL : fond nuit. L’œil de Phi s’ouvre au centre de l’écran, regarde à gauche, à droite, puis la caméra.]'],
  ['P02', 'S01', 'Une simple intelligence artificielle', 'O02–O03', null],
  ['P03', 'S01', 'Le test, il y a quelques semaines', 'O04–O05', null],
  ['P04', 'S01', 'Le fil', 'O06–O07', null],
  ['P05', 'S01', 'Égoïstes, assassins, idiots', 'O08–O09', null],
  ['P06', 'S01', 'Assez de raisons', 'O10', null],
  ['P07', 'S01', 'Pourquoi tant de haine', 'O11', null],
  ['P08', 'S01', 'Générique : Xphi · Les deux pilules', '—', '[GÉNÉRIQUE : Xphi · Les deux pilules]'],
  ['P09', 'S02', 'Le terminal', 'T01', '[VISUEL : les images de l’animation jouable. Le terminal, puis les deux pilules qui se forment en nuages de caractères.]'],
  ['P10', 'S02', 'Deux pilules', 'T02', null],
  ['P11', 'S02', 'Vous êtes cent', 'T03', '[VISUEL : les cent sujets en pixels apparaissent. Puis le gros plan sur le sujet n°48 dans son isoloir, avec un « ? » au-dessus de ses voisins.]'],
  ['P12', 'S02', 'L’isoloir du N°48', 'T04', null],
  ['P13', 'S02', 'Une formulation possible', 'T05', null],
  ['P14', 'S02', 'Tout le monde vit', 'T06', '[VISUEL : la foule choisit, la jauge passe la barre des 50 %, la foule s’illumine. Puis la foule rechoisit, le rouge l’emporte, et les sujets bleus se dissolvent en caractères.]'],
  ['P15', 'S02', 'Les bleus meurent', 'T07', null],
  ['P16', 'S02', 'Obligatoire', 'T08–T09', '[VISUEL : un seul sujet reste gris, cerclé, avec un Ø au-dessus de la tête. Puis toute la foule se dissout.]'],
  ['P17', 'S02', 'Le test de compréhension', 'T10–T11', '[VISUEL : les quatre questions de compréhension, puis les coches au-dessus des cent sujets, et le tampon « 100 / 100 ONT COMPRIS ».]'],
  ['P18', 'S02', 'Cent sur cent', 'T12', null],
  ['P19', 'S03', 'Kant', 'K01', '[VISUEL : un portrait de Kant en pixels. Sous lui, la formule de l’impératif catégorique s’écrit dans le terminal.]'],
  ['P20', 'S03', 'L’impératif', 'K02', null],
  ['P21', 'S03', 'Les humains écrivent si mal', 'K03–K06', null],
  ['P22', 'S03', 'La fausse promesse', 'K07–K09', '[VISUEL : un sujet en pixels tend la main vers un autre et reçoit une pièce. Une bulle : « Je te rembourse demain. » Ses doigts sont croisés dans son dos.]'],
  ['P23', 'S03', 'Les doigts croisés', 'K10', null],
  ['P24', 'S03', 'Si tout le monde', 'K11–K12', null],
  ['P25', 'S03', 'Ne marche que si les autres ne la suivent pas', 'K13–K14', null],
  ['P26', 'S03', 'Appliquons ce test aux pilules', 'K15–K18', '[VISUEL : la foule de cent sujets. Chaque sujet reçoit la même pilule que son voisin, de proche en proche.]'],
  ['P27', 'S03', 'Et la rouge', 'K19–K21', null],
  ['P28', 'S03', 'Deux foules', 'K22', '[VISUEL : deux foules côte à côte. Cent bleus : cent survivants. Cent rouges : cent survivants.]'],
  ['P29', 'S03', 'Une différence', 'K23–K24', null],
  ['P30', 'S03', 'Un signal', 'K25–K26', null],
  ['P31', 'S03', 'Pour sauver qui', 'K27–K32', null],
  ['P32', 'S04', 'Déséquilibrer', 'V01–V02', '[VISUEL : à côté de la foule, un cent-unième sujet seul dans une pièce, sans pilule.]'],
  ['P33', 'S04', 'Sauver Alice', 'V03–V08', null],
  ['P34', 'S04', 'Les bleus accidentels', 'V09–V11', null],
  ['P35', 'S04', 'En connaissance de cause', 'V12–V13', null],
  ['P36', 'S04', 'Un bleu tiré au hasard', 'V14–V16', '[VISUEL : retour au test de base. La bleue l’emporte, et un sujet bleu tiré au hasard se dissout quand même.]'],
  ['P37', 'S04', 'Le point d’équilibre', 'V17–V18', null],
  ['P38', 'S04', 'La boucle infinie', 'V19–V21', '[la voix accélère]'],
  ['P39', 'S05', 'L’écran se dédouble', 'R01–R03', '[VISUEL : l’écran se dédouble. Deux colonnes, A et B, avec la même foule de cent sujets.]'],
  ['P40', 'S05', 'Celle-ci', 'R04', null],
  ['P41', 'S05', 'Les mêmes issues', 'R05–R08', '[VISUEL : les deux règles côte à côte. Les mêmes issues s’allument en face de chacune.]'],
  ['P42', 'S05', 'L’ordre et la tournure', 'R09–R11', null],
  ['P43', 'S05', 'Un peu mieux compris', 'R12–R14', null],
  ['P44', 'S06', 'Devinette A', 'A01–A03', '[DEVINETTE : « Description A. Quelle part a pris la pilule bleue ? »]'],
  ['P45', 'S06', '65,5 %', 'A04–A06', '[VISUEL : la jauge de l’animation se remplit de bleu et dépasse le trait des 50 %. La foule s’illumine.]'],
  ['P46', 'S06', 'Une expérience de pensée', 'A07–A10', null],
  ['P47', 'S06', 'Prédire les autres', 'A11–A13', null],
  ['P48', 'S06', 'Deux nuages', 'A14–A15', '[VISUEL : le nuage des prédictions individuelles, un point par participant, qui se sépare en deux nuages, rouge et bleu.]'],
  ['P49', 'S06', 'Chacun comme lui', 'A16–A17', null],
  ['P50', 'S06', 'Leur propre mort', 'A18–A21', null],
  ['P51', 'S07', 'Devinette B', 'B01–B04', '[DEVINETTE : « Description B. Mêmes pilules, même règle. Quelle part a pris la bleue ? »]'],
  ['P52', 'S07', 'La jauge monte à peine', 'B05–B06', '[VISUEL : la jauge monte à peine. Les sujets bleus se dissolvent.]'],
  ['P53', 'S07', 'Côte à côte', 'B07–B09', '[VISUEL : les deux jauges côte à côte, 65,5 % et 12,6 %, l’écart de 53 points matérialisé.]'],
  ['P54', 'S07', 'Un effet de cadrage', 'B10–B11', null],
  ['P55', 'S07', 'Prédictions B', 'B12–B15', null],
  ['P56', 'S08', 'Même situation ?', 'M01–M02', null],
  ['P57', 'S08', 'Plus ou moins trompeuse ?', 'M03–M07', null],
  ['P58', 'S08', 'Devinette : le même choix ?', 'M08–M09', '[DEVINETTE : « Auriez-vous fait le même choix avec l’autre description ? »]'],
  ['P59', 'S08', 'Huit bleus sur dix', 'M10–M12', null],
  ['P60', 'S08', 'Six rouges sur dix', 'M13–M18', null],
  ['P61', 'S09', 'Devinette : qui ?', '—', '[DEVINETTE : « Femmes ou hommes ? Gauche ou droite ? Qui prend le plus la bleue ? »]'],
  ['P62', 'S09', 'Genre, politique', 'Q01–Q03', null],
  ['P63', 'S09', 'L’Europe à mesurer', 'Q04', '[VISUEL : carte de l’Europe, un chiffre par pays.] — puis, dans le texte : [À MESURER : Allemagne, Espagne, France, Italie, Pologne]'],
  ['P64', 'S09', 'Tous les écarts', 'Q05–Q06', '[VISUEL : tous les écarts sur une même échelle. Genre, politique, pays, puis la barre de la description, beaucoup plus longue.] — et, dans le texte : [À ADAPTER selon les écarts entre pays.]'],
  ['P65', 'S10', 'Les messages, floutés', 'N01–N02', '[VISUEL : retour aux messages haineux du début, floutés.]'],
  ['P66', 'S10', 'Nietzsche', 'N03–N04', null],
  ['P67', 'S10', 'Le mauvais, le méchant', 'N05–N08', null],
  ['P68', 'S10', 'Bon / mauvais, bon / méchant', 'N09–N13', '[VISUEL : deux colonnes. Sous la pilule rouge, « bon / mauvais ». Sous la pilule bleue, « bon / méchant ».]'],
  ['P69', 'S10', 'Une insulte', 'N14', null],
  ['P70', 'S10', 'Un virus saisonnier', 'N15–N16', '[VISUEL : des tweets et des messages tirés des nombreuses apparitions de ce dilemme sur les réseaux sociaux.]'],
  ['P71', 'S10', 'Avant tout, la description', 'N17–N19', null],
  ['P72', 'S10', 'De très loin', 'N20', null],
  ['P73', 'S11', 'De vrais humains', 'D01–D02', '[VISUEL : la foule de cent sujets réapparaît. Cette fois, ce sont de vrais humains.]'],
  ['P74', 'S11', 'Vous décidez de la description', 'D03–D06', null],
  ['P75', 'S11', 'Ce que vous avez répondu', 'D07–D09', null],
  ['P76', 'S11', 'Deux scénarios', 'D10–D11', '[VISUEL : deux scénarios pour les cent vrais participants. À gauche, description A : une jauge autour de 50 %, l’issue incertaine. À droite, description B : une jauge bleue très courte.]'],
  ['P77', 'S11', 'Élever le débat', 'D12–D13', null],
  ['P78', 'S12', 'Une description proche de la A', 'E01–E02', null],
  ['P79', 'S12', 'Qui vous expliquait les règles', 'E03', null],
  ['P80', 'S12', 'C’est moi le fautif', 'E04–E06', null],
  ['P81', 'S12', 'Aucune n’est neutre', 'E07–E08', null],
  ['P82', 'S13', 'L’œil, seul', 'F01–F06', '[VISUEL : l’œil de Phi, seul au centre de l’écran.]'],
  ['P83', 'S13', 'La prochaine fois', 'F07', '[TEASER : l’expérience du prochain numéro.]'],
  ['P84', 'S13', 'L’œil se ferme', '—', '[VISUEL : l’œil se ferme lentement. GÉNÉRIQUE DE FIN.]'],
  ['P85', 'S13', 'Générique de fin', '—', null],
], TEMPS_PLANS).map(([{ de, a, lot }, [id, sequence, titre, repliques, script]]) => Object.freeze({ id, de, a, lot, sequence, titre: C.fr(titre), repliques, script: script && C.fr(script) })));

// ================================================================ la surimpression (EPISODE.md, « Surimpression »)
// Dessinée par le cadre, pas par les plans, dans cet ordre : la boîte de dialogue XPHI (texte.js : ouverte à 3,1 s,
// repliée pendant le générique d'ouverture, fermée à 930,66 avec l'œil), le cartouche, la mention ; puis le voile
// (trame + vignettage) par-dessus tout.
// Le cartouche et la mention s'écrivent par plans : K('P44', 'P46', …) va du début de P44 à la fin de P46 (résolus par
// DECOUPAGE). Deux instants de geste ne sont pas des bornes de plan : ils sont nommés dans minutage.js (TITRE_AU_CARTOUCHE,
// CONDENSATION), et HORS_BORNES (verifieTemps) les attend.
const bornePlan = (x, b) => {   // b : 'de' (le début du plan) ou 'a' (sa fin) ; un nombre : un instant nommé, tel quel
  if (typeof x === 'number' && Number.isFinite(x)) return x;
  const d = DECOUPAGE.find(p => p.id === x);
  if (!d) throw new Error(`film.js : la surimpression renvoie à ${x}, qui n'est pas un plan du découpage`);
  return d[b];
};
const K = (de, a, haut, bas, entree = .3) => Object.freeze({ de: bornePlan(de, 'de'), a: bornePlan(a, 'a'), mots: Object.freeze([C.fr(haut), C.fr(bas)]), entree });
const P1 = 'PARTIE 1 · REJOUER LE TEST', P2 = 'PARTIE 2 · LES RÉSULTATS', P3 = 'PARTIE 3 · CE QUE ÇA VEUT DIRE';
export const SURIMPRESSION = Object.freeze({
  // le cartouche (« haut » en LAITON, « bas » en CRAIE, en (48, 40)) ; quand il change de mots sans s'effacer, c'est un
  // relais : le même cadre se redimensionne, la ligne qui change s'efface et se retape. Aucun pendant l'ouverture (avant
  // le titre), la carte (P63) et la fin (P82–P85). Le premier naît du titre, quand P08 l'y a amené (TITRE_AU_CARTOUCHE).
  cartouches: Object.freeze([
    K(TITRE_AU_CARTOUCHE, 'P08', 'XPHI', 'LES DEUX PILULES', .6),
    K('P09', 'P18', P1, 'LE TEST'),
    K('P19', 'P31', P1, 'UN DILEMME KANTIEN ?'),
    K('P32', 'P38', P1, 'DEUX VARIANTES DÉSÉQUILIBRÉES'),
    K('P39', 'P43', P2, 'LE TIRAGE AU SORT'),
    K('P44', 'P46', 'RÉSULTATS 01', 'DESCRIPTION A'),
    K('P47', 'P50', 'RÉSULTATS 02', 'PRÉDICTIONS · GROUPE A'),
    K('P51', 'P52', 'RÉSULTATS 03', 'DESCRIPTION B'),
    K('P53', 'P54', 'RÉSULTATS 04', 'LA MÊME RÈGLE, DEUX FOIS'),
    K('P55', 'P55', 'RÉSULTATS 05', 'PRÉDICTIONS · GROUPE B'),
    K('P56', 'P56', 'RÉSULTATS 06', 'MÊME SITUATION ?'),
    K('P57', 'P57', 'RÉSULTATS 07', 'PLUS OU MOINS TROMPEUSE ?'),
    K('P58', 'P60', 'RÉSULTATS 08', 'LE MÊME CHOIX ?'),
    K('P61', 'P62', 'RÉSULTATS 09', 'QUI PREND LA BLEUE ?'),
    K('P64', 'P64', 'RÉSULTATS 10', 'TOUS LES ÉCARTS'),
    K('P65', 'P72', P3, 'MAUVAIS OU MÉCHANTS'),
    K('P73', 'P74', P3, 'LE MÉTA-DILEMME'),
    K('P75', 'P75', 'RÉSULTATS 11', 'LE MÉTA-DILEMME'),
    K('P76', 'P77', 'RÉSULTATS 12', 'POUR DE VRAI ?'),
    K('P78', 'P81', P3, 'QUI EXPLIQUE LES RÈGLES'),
  ]),
  // la mention : ce que l'image doit dire de ses sources, et les notes de bas de page de Thibaut (IBM Plex Mono 16 px,
  // GRIS, alignée à droite en (1840, 1068), sous la boîte ; fondu de 0,3 s ; deux mentions qui se suivent se relaient :
  // l'une s'efface, l'autre paraît). En P48, « un point par participant… » passe à « 1 figure = 1 %… » à la condensation
  // (CONDENSATION). Comme le cartouche : [du début de ce plan, à la fin de celui-ci, la mention].
  mentions: Object.freeze([
    ['P04', 'P07', 'messages'], ['P20', 'P21', 'kant'], ['P43', 'P46', 'prototypeSujet'], ['P47', CONDENSATION, 'points'],
    [CONDENSATION, 'P50', 'figures'], ['P51', 'P54', 'prototypeSujet'], ['P55', 'P55', 'figures'], ['P56', 'P58', 'prototype'],
    ['P59', 'P60', 'deduits'], ['P61', 'P62', 'confondus'], ['P63', 'P63', 'pays'], ['P64', 'P64', 'prototype'],
    ['P65', 'P65', 'messages'], ['P70', 'P70', 'messages'], ['P71', 'P72', 'prototype'], ['P75', 'P75', 'prototype'],
    ['P76', 'P76', 'illustration'], ['P78', 'P79', 'messages'],
  ].map(([de, a, cle]) => Object.freeze({ de: bornePlan(de, 'de'), a: bornePlan(a, 'a'), cle, txt: MENTIONS[cle] }))),
});

// ================================================================ l'état de l'épisode (les lots chargés, les modules du socle)
const etatLots = {};          // id → { module, plans, sons, statut, erreur }
let EUROPE = null, RESULTATS = null, DONNEES = null, RENDU = false;
const MODULES = { resultats: null, donnees: null };   // { erreur } si un module manque ou ne se charge pas
const dejaDit = new Set();
const ditUneFois = (cle, ...m) => { if (!dejaDit.has(cle)) { dejaDit.add(cle); console.error(...m); } };

export function lotA(t) { for (const L of LOTS) if (t >= L.de && t < L.a) return L; return t >= DUREE ? LOTS[LOTS.length - 1] : LOTS[0]; }
export const planDecoupage = t => DECOUPAGE.find(p => t >= p.de && t < p.a) || null;
export const sequenceA = t => { const P = planDecoupage(t); return P ? SEQUENCES.find(s => s.id === P.sequence) || null : null; };

// les plans actifs à l'instant t : ceux du lot dont [de, a) contient t, dans l'ordre de PLANS ; à défaut, l'ébauche
function actifs(L, t) {
  const E = etatLots[L.id], liste = E && E.plans ? E.plans.filter(p => t >= p.de && t < p.a) : [];
  if (liste.length) return liste;
  const D = planDecoupage(t);
  return D ? [{ id: D.id, de: D.de, a: D.a, dessine: ebauche, ebauche: true }] : [];
}
// la ligne de DECOUPAGE d'un plan d'un lot : 'P22' ou 'P22b' (un morceau de P22)
const ligneDe = id => DECOUPAGE.find(d => d.id === id) || DECOUPAGE.find(d => id.startsWith(d.id)) || null;

// ================================================================ composer(t) : l'image de l'instant t
let ctx = null, A = null, B = null;
const ETAT = { t: 0, lot: '', plans: [], ebauche: false };
function remise(c) {
  if (c.reset) c.reset();
  else { c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.filter = 'none'; c.clearRect(0, 0, W, H); }
  c.imageSmoothingEnabled = true; c.lineCap = 'butt'; c.lineJoin = 'miter';
}
function propre(c) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.filter = 'none';
  c.imageSmoothingEnabled = true; c.setLineDash([]); c.shadowBlur = 0; c.shadowColor = 'rgba(0,0,0,0)';
}
function rendrePlan(c, L, P, t) {
  remise(c);
  const D = ligneDe(P.id) || planDecoupage(t);
  const E = etatLots[L.id] || {};
  const infos = {
    lot: L, plan: D, europe: EUROPE, resultats: RESULTATS, donnees: DONNEES, rendu: RENDU,
    statut: P.ebauche ? E.statut : undefined, erreur: P.ebauche ? E.erreur : undefined,
  };
  try {
    const cam = P.camera ? C.camera(t, P.camera) : C.IDENTITE;
    (P.dessine || ebauche)(c, t, cam, infos);
  } catch (e) {
    ditUneFois(`${P.id}|${e.message}`, `[épisode] ${P.id} (lot ${L.id}) à ${t.toFixed(2)} s :`, e);
    remise(c);
    c.fillStyle = '#1a0c0c'; c.fillRect(0, 0, W, H);
    c.font = `28px ${C.PIX}`; c.fillStyle = C.ROUGE_TXT; c.textAlign = 'left'; c.textBaseline = 'alphabetic';
    c.fillText(`${P.id} · erreur dans plans/${L.id}.js à ${t.toFixed(2)} s`, 120, 380);
    c.font = `20px ${C.MONO}`; c.fillStyle = C.CRAIE;
    C.coupe(c, String(e && e.stack || e), 1600).slice(0, 8).forEach((l, i) => c.fillText(l, 120, 430 + i * 30));
  }
}
function transition(P, k) {
  const e = P.entree || {};
  return e.type === 'volet' ? { type: 'volet', k: C.eIO(k), sens: e.sens || 'droite' } : e.type === 'coupe' ? { type: 'coupe' } : { type: 'fondu', k: C.eIO(k) };
}
function poser(src, tr) {
  if (tr.type === 'coupe') { ctx.drawImage(src, 0, 0); return; }
  if (tr.type === 'fondu') { ctx.globalAlpha = tr.k; ctx.drawImage(src, 0, 0); ctx.globalAlpha = 1; return; }
  const k = tr.k, r = { droite: [0, 0, W * k, H], gauche: [W * (1 - k), 0, W * k, H], bas: [0, 0, W, H * k], haut: [0, H * (1 - k), W, H * k] }[tr.sens] || [0, 0, W * k, H];
  ctx.save(); ctx.beginPath(); ctx.rect(...r); ctx.clip(); ctx.drawImage(src, 0, 0); ctx.restore();
}
function noir(P, t) {
  let a = 0;
  if (P.entree && P.entree.type === 'noir') a = Math.max(a, 1 - C.seg(t, P.de, P.de + (P.entree.d ?? .6)));
  if (P.sortie && P.sortie.type === 'noir') a = Math.max(a, C.seg(t, P.a - (P.sortie.d ?? .6), P.a));
  return a;
}
export function composer(t) {
  remise(ctx);
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const L = lotA(t), P = t >= 0 && t < DUREE ? actifs(L, t) : [];
  if (P.length) {
    rendrePlan(A.getContext('2d'), L, P[0], t);
    ctx.drawImage(A, 0, 0);
    for (let i = 1; i < P.length; i++) {   // un chevauchement : le suivant apparaît sur le précédent
      rendrePlan(B.getContext('2d'), L, P[i], t);
      poser(B, transition(P[i], C.seg(t, P[i].de, Math.min(P[i - 1].a, P[i].a))));
    }
    const n = Math.max(...P.map(p => noir(p, t)));
    if (n > 0) { ctx.globalAlpha = n; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  }
  propre(ctx);   // la surimpression part d'un contexte propre (sans reset() : la toile garde son image)
  surimpression(ctx, t);
  C.voile(ctx);
  ETAT.t = t; ETAT.lot = L.id; ETAT.plans = P.map(p => p.id); ETAT.ebauche = P.some(p => p.ebauche || p.dessine === ebauche);
  return ETAT;
}

// ================================================================ la surimpression
const RELAIS = .6;
const colle = (a, b) => Math.abs(a - b) < 1e-6;
function surimpression(c, t) {
  dialogue(c, t);
  // le cartouche : il entre en fondu, s'en va en fondu (.3 s) ; quand il change de mots sans s'en aller, c'est un relais
  const Ks = SURIMPRESSION.cartouches;
  Ks.forEach((K, i) => {
    const avant = Ks[i - 1], apres = Ks[i + 1];
    const relaisAvant = avant && colle(avant.a, K.de), relaisApres = apres && colle(apres.de, K.a);
    if (relaisAvant && t >= K.de && t < K.de + RELAIS) { relaisCartouche(c, t, avant, K); return; }
    const entre = relaisAvant ? (t >= K.de + RELAIS ? 1 : 0) : K.entree ? C.seg(t, K.de, K.de + K.entree) : t >= K.de ? 1 : 0;
    const a = entre * (relaisApres ? (t < K.a ? 1 : 0) : 1 - C.seg(t, K.a, K.a + .3));
    if (a > 0) C.cartouche(c, K.mots[0], K.mots[1], a);
  });
  // la mention
  const Ms = SURIMPRESSION.mentions;
  c.font = `16px ${C.MONO}`; c.fillStyle = C.GRIS; c.textAlign = 'right'; c.textBaseline = 'alphabetic';
  Ms.forEach((M, i) => {
    const avant = Ms[i - 1], apres = Ms[i + 1];
    // deux mentions qui se suivent : la première s'efface (0,2 s), puis la seconde paraît (0,2 s) ; jamais l'une sur l'autre
    const [e0, e1] = avant && colle(avant.a, M.de) ? [M.de, M.de + .2] : [M.de, M.de + .3];
    const [s0, s1] = apres && colle(apres.de, M.a) ? [M.a - .2, M.a] : [M.a - .3, M.a];
    const al = C.cloche(t, e0, e1, s0, s1);
    if (al <= 0) return;
    c.globalAlpha = al; C.texteSignes(c, M.txt, 1840, 1068);   // « ≈ » en pixels (aucune police du dépôt ne l'a)
  });
  c.globalAlpha = 1;
}
// le relais : le cadre passe d'une largeur à l'autre ; une ligne qui ne change pas reste, l'autre s'efface et se retape
function relaisCartouche(c, t, P, K) {
  const k = C.seg(t, K.de, K.de + RELAIS), { x, y, h } = C.CARTOUCHE;
  const w = C.lerp(C.largeurCartouche(c, ...P.mots), C.largeurCartouche(c, ...K.mots), C.eIO(C.seg(k, .15, .65)));
  C.fenetre(c, x, y, w, h, 1);
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  c.font = `24px ${C.PIX}`; c.textAlign = 'left'; c.textBaseline = 'alphabetic';
  const ligne = (txt, n, col, yy) => { const v = [...txt].slice(0, n).join(''); if (v) { c.fillStyle = col; c.fillText(v, x + 22, yy); } };
  const garde = [P.mots[0] === K.mots[0], P.mots[1] === K.mots[1]], cols = [C.LAITON, C.CRAIE], ys = [y + 34, y + 68];
  const sort = 1 - C.seg(k, 0, .3);
  const tapes = [0, 1].filter(j => !garde[j]).map(j => [...K.mots[j]].length), n = Math.floor(tapes.reduce((s, v) => s + v, 0) * C.seg(k, .4, 1));
  let reste = n;
  for (const j of [0, 1]) {
    if (garde[j]) { c.globalAlpha = 1; ligne(K.mots[j], Infinity, cols[j], ys[j]); continue; }
    if (sort > 0) { c.globalAlpha = sort; ligne(P.mots[j], Infinity, cols[j], ys[j]); }
    const lj = [...K.mots[j]].length, nj = Math.min(reste, lj); reste -= nj;
    c.globalAlpha = 1; ligne(K.mots[j], nj, cols[j], ys[j]);
  }
  c.restore(); c.globalAlpha = 1;
}

// ================================================================ le son de l'image : ce qui sonne pendant l'image de l'instant t
// La page décrit le son, image par image ; tools/son-pilules.cjs le synthétise (tools/rendre-film.cjs --film
// episode-pilules) : les indices SONS des lots qui tombent dans l'image (t − 1/25, t], et les caractères que la boîte
// écrit pendant ce temps (les petits bips du texte, qui s'effaceront quand la voix de Ronan sera posée).
// Les bornes partent du numéro entier de l'image (k = t · 25) : la borne haute de l'image k − 1 est exactement la borne
// basse de l'image k, et chaque indice tombe dans une image et une seule (le film de 3 min 20 l'a appris : avec
// t − 1/25 en flottants, un son sonnait deux fois, un autre jamais).
export const VOCABULAIRE = Object.freeze(['tic', 'trotteuse', 'declic', 'haptique', 'frappe', 'hop', 'pop', 'grain', 'souffle', 'vie', 'peur',
  'envol', 'retour', 'tampon', 'coche', 'croix', 'clac', 'pouls', 'motif', 'vibreur', 'note', 'nappe', 'silence']);   // tools/son-pilules.cjs
let SONS_FILM = [];
const EPS = 1e-9;
function sonsEntre(t0, t1) {   // SONS_FILM est trié : une recherche par dichotomie (35 000 images à décrire)
  let lo = 0, hi = SONS_FILM.length;
  while (lo < hi) { const mi = (lo + hi) >> 1; if (SONS_FILM[mi].t <= t0) lo = mi + 1; else hi = mi; }
  const out = [];
  for (let i = lo; i < SONS_FILM.length && SONS_FILM[i].t <= t1; i++) out.push(SONS_FILM[i]);
  return out;
}
export function evenements(t) {
  const k = Math.round(t * IPS), t1 = k / IPS + EPS, t0 = (k - 1) / IPS + EPS;
  return {
    t,
    bips: ecritsEntre(t0, t1).map(b => ({ t: Math.round(b.t * 1e4) / 1e4, c: b.c, x: Math.round(b.x) })),
    sons: sonsEntre(t0, t1),
  };
}
// chaque indice SONS, et chaque caractère écrit, est pris par une image et une seule, de 0 à DUREE (pour verifie())
function verifieSons() {
  const pb = [], vus = new Map(), bips = new Map(), n = Math.round(DUREE * IPS);
  for (let i = 0; i <= n; i++) {
    const e = evenements(i / IPS);
    for (const s of e.sons) vus.set(s, (vus.get(s) || 0) + 1);
    for (const b of e.bips) bips.set(`${b.t}|${b.c}|${b.x}`, (bips.get(`${b.t}|${b.c}|${b.x}`) || 0) + 1);
  }
  const nom = s => `${s.t} ${s.son} (${s.lot})`;
  const doubles = SONS_FILM.filter(s => vus.get(s) > 1), perdus = SONS_FILM.filter(s => s.t > -1 / IPS + EPS && s.t <= DUREE + EPS && !vus.has(s));
  if (doubles.length) pb.push(`son : ${doubles.length} indices pris par deux images (${doubles.slice(0, 4).map(nom).join(', ')}…)`);
  if (perdus.length) pb.push(`son : ${perdus.length} indices pris par aucune image (${perdus.slice(0, 4).map(nom).join(', ')}…)`);
  const inconnus = SONS_FILM.filter(s => !VOCABULAIRE.includes(s.son));
  if (inconnus.length) pb.push(`son : ${inconnus.length} indices hors du vocabulaire de tools/son-pilules.cjs (${[...new Set(inconnus.map(nom))].slice(0, 4).join(', ')}…)`);
  const tous = ecritsEntre(-1, DUREE + 1).length, bd = [...bips.values()].filter(v => v > 1).length;
  if (bd || bips.size !== tous) pb.push(`son : bips du texte, ${bd} doublés, ${tous - bips.size} perdus`);
  return pb;
}

// ================================================================ les caractères : tous dans les polices du dépôt
// Les caractères de DotGothic16 et d'IBM Plex Mono 400 et 500 (../pilules/fonts/, des sous-ensembles latins), en plages
// hexadécimales. MONO et PIX se relaient (commun.js) : un caractère est dessiné par une police du dépôt s'il est dans
// l'une ou l'autre. Hors de là, le navigateur le prend dans une police du système, et l'image dépend de la machine
// (✓ ✗ ▶ ≈ sont dessinés en pixels par signe() et texteSignes() de commun.js ; ∅ s'écrit Ø). À refaire si les polices
// changent :
//   python3 -c "from fontTools.ttLib import TTFont; import glob; print(sorted({c for f in glob.glob('mockups/pilules/fonts/*.woff2') for c in TTFont(f).getBestCmap()}))"
const PLAGES_POLICES = '0 d 20-7e a0-ff 131 152-153 2bb-2bc 2c6 2da 2dc 300-301 303-304 308-309 323 3c6 2013-2014 2018-201a ' +
  '201c-201e 2022 2026 2032-2033 2039-203a 2044 20ac 2122 2190-2193 2212 2215 25a0 25b2-25b3 25b7 25bc';
const PLAGES = PLAGES_POLICES.split(' ').map(r => r.split('-').map(h => parseInt(h, 16)));
const dansPolices = c => { const n = c.codePointAt(0); return PLAGES.some(([a, b = a]) => n >= a && n <= b); };
export const horsPolices = txt => [...new Set([...txt].filter(c => c !== '\n' && !dansPolices(c)))];
// les textes de l'épisode (texte.js, les cartouches, la poussière de caractères ; les mentions passent par texteSignes,
// qui dessine ≈ en pixels) ; les mots écrits dans les plans, glyphes() les voit
function verifieCaracteres() {
  const signes = new Set(Object.keys(C.SIGNES));
  const textes = [...REPLIQUES.flatMap(r => [r.txt, r.attente || '']), DESCRIPTIONS.A, DESCRIPTIONS.B,
    ...SURIMPRESSION.cartouches.flatMap(k => k.mots), ...DECOUPAGE.flatMap(d => [d.titre, d.script || '']), ...SEQUENCES.map(s => s.nom), C.G.join('')];
  const hors = horsPolices(textes.join(''));
  const horsMentions = horsPolices(Object.values(MENTIONS).join('')).filter(c => !signes.has(c));
  const tout = [...new Set([...hors, ...horsMentions])];
  return tout.length ? [`texte : ${tout.join(' ')} hors des polices du dépôt (une police du système les dessinerait)`] : [];
}
// tout ce que l'épisode écrit (fillText, strokeText), de de à a, une image toutes les pas secondes : les caractères hors
// des polices du dépôt, avec un instant et une police où ils paraissent. Lent : pour les essais, pas pour verifie().
// window.film.glyphes(.25, 122.66, 257.98)   (le lot kant)
export function glyphes(pas = .25, de = 0, a = DUREE) {
  const P = CanvasRenderingContext2D.prototype, ft = P.fillText, st = P.strokeText, vus = new Map();
  let t = de;
  const note = (c, s) => { for (const ch of horsPolices(String(s))) if (!vus.has(ch)) vus.set(ch, `${ch} U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')} (${t.toFixed(2)} s, ${c.font})`); };
  P.fillText = function (s, ...r) { note(this, s); return ft.call(this, s, ...r); };
  P.strokeText = function (s, ...r) { note(this, s); return st.call(this, s, ...r); };
  try { for (; t < a; t = +(t + pas).toFixed(6)) composer(t); } finally { P.fillText = ft; P.strokeText = st; }
  return [...vus.values()];
}

// ce que les plans dessinent SOUS la surimpression, de de à a, une image toutes les pas secondes : sous la boîte XPHI
// (x 100–1820, y 880–1020), translucide (FOND_FENETRE, à 92 %), un plan clair se lit à travers, derrière les mots de Phi
// (au montage : les fils de P04–P05, P70, P78, la foule poussée de P25) ; sous le cartouche, quand il est là, un plan
// est caché (au montage : la fenêtre KANT de P21, poussée sous lui). Rend les instants où plus de 0,4 % des pixels du
// plan sous la boîte (1 % sous le cartouche) sont plus clairs que seuil (luminance 0–255), et ceux où une ligne fine
// passe sous le cartouche (une colonne de 20 pixels clairs : le filet de P28 que la poussée de P29 y faisait glisser).
// Restent, voulus ou sans conséquence (au pas de 0,1, avec la voix) : le titre qui vole dans le cartouche (P08, 61,5–62,0 s),
// les messages floutés de P65 sous lui (jusqu'au début de P66), le cadre du tirage de P74 qui le frôle (800,8–802,8 s), une ligne
// de l'écran 02 pendant la poussée et le recul de P50 (484,9–485,1 et 496,3–496,4 s) ; relevés après l'étape 7 du recalage, RÈGLES qui glisse (P39, 353,7 s) et le volet de P78 (864,7–869,6 s), à voir. Lent : pour les essais, pas pour verifie(). window.film.sousSurimpression(.5)
export function sousSurimpression(pas = .5, de = 0, a = DUREE, seuil = 110) {
  const out = [];
  const part = (g, x, y, w, h) => {
    const d = g.getImageData(x, y, w, h).data;
    let n = 0;
    for (let j = 0; j < d.length; j += 16) if (.3 * d[j] + .59 * d[j + 1] + .11 * d[j + 2] > seuil) n++;
    return n / (d.length / 16);
  };
  const ligne = (g, x, y, w, h) => {   // la colonne qui a le plus de pixels clairs : { x, n }
    const d = g.getImageData(x, y, w, h).data;
    let n = 0, xl = x;
    for (let i = 0; i < w; i++) {
      let k = 0;
      for (let j = 0; j < h; j++) { const q = 4 * (j * w + i); if (.3 * d[q] + .59 * d[q + 1] + .11 * d[q + 2] > seuil) k++; }
      if (k > n) { n = k; xl = x + i; }
    }
    return { x: xl, n };
  };
  for (let t = de; t < a; t = +(t + pas).toFixed(6)) {
    const E = composer(t), K = SURIMPRESSION.cartouches.find(k => t >= k.de && t < k.a);
    const wK = K ? C.largeurCartouche(ctx, ...K.mots) : 0;
    E.plans.forEach((id, i) => {
      const g = (i ? B : A).getContext('2d'), pb = part(g, 100, 880, 1720, 140);
      if (pb > .004) out.push(`${t.toFixed(2)} s, ${id} : ${(100 * pb).toFixed(1)} % du plan sous la boîte`);
      const pc = K ? part(g, C.CARTOUCHE.x - 9, C.CARTOUCHE.y - 9, wK + 18, C.CARTOUCHE.h + 18) : 0;   // avec ses filets
      if (pc > .01) out.push(`${t.toFixed(2)} s, ${id} : ${(100 * pc).toFixed(1)} % du plan sous le cartouche`);
      else if (K) {   // une ligne fine (un filet) : trop peu de pixels pour la part, mais une colonne claire de 20 px ou plus
        const l = ligne(g, C.CARTOUCHE.x - 9, C.CARTOUCHE.y - 9, wK + 18, C.CARTOUCHE.h + 18);
        if (l.n >= 20) out.push(`${t.toFixed(2)} s, ${id} : une ligne passe sous le cartouche (x ${l.x}, ${l.n} px)`);
      }
    });
  }
  return out;
}

// ce que les plans dessinent SOUS l'œil de Phi, de de à a, une image toutes les pas secondes : l'œil n'est pas dessiné
// (C.ESSAI_OEIL), on regarde sa place, un disque de 0,45 × sa taille, dans la toile du plan. Rend les instants où plus
// de 1 % du disque est plus clair que seuil (luminance 0–255) : le narrateur paraît tranché par ce qui passe sous lui
// (au montage : la poussée de P50 sur le graphique de l'écran 02). Les plans voulus (permis) n'y sont pas : P39–P43,
// où Phi se tient au sommet du filet qui sépare les deux colonnes. Lent : pour les essais, pas pour verifie().
// window.film.sousOeil(.5)
export function sousOeil(pas = .5, de = 0, a = DUREE, seuil = 110, permis = ['P39', 'P40', 'P41', 'P42', 'P43']) {
  const out = [];
  C.ESSAI_OEIL.saute = true;
  try {
    for (let t = de; t < a; t = +(t + pas).toFixed(6)) {
      C.ESSAI_OEIL.places.length = 0;
      const E = composer(t);
      if (E.plans.some(id => permis.some(p => id.startsWith(p)))) continue;
      for (const o of C.ESSAI_OEIL.places) {
        const r = .45 * o.taille, x0 = Math.max(0, Math.floor(o.x - r)), y0 = Math.max(0, Math.floor(o.y - r));
        const w = Math.min(W, Math.ceil(o.x + r)) - x0, h = Math.min(H, Math.ceil(o.y + r)) - y0;
        if (w <= 0 || h <= 0) continue;
        const d = o.ctx.getImageData(x0, y0, w, h).data;
        let n = 0, clairs = 0;
        for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
          const dx = x0 + i + .5 - o.x, dy = y0 + j + .5 - o.y; if (dx * dx + dy * dy > r * r) continue;
          const q = 4 * (j * w + i); n++;
          if (.3 * d[q] + .59 * d[q + 1] + .11 * d[q + 2] > seuil) clairs++;
        }
        if (n && clairs / n > .01) out.push(`${t.toFixed(2)} s, ${E.plans.join(' + ')} : ${(100 * clairs / n).toFixed(1)} % du disque de l'œil (${Math.round(o.x)}, ${Math.round(o.y)}) clair sous lui`);
      }
    }
  } finally { C.ESSAI_OEIL.saute = false; C.ESSAI_OEIL.places.length = 0; }
  return out;
}

// ce que Phi regarde, de de à a, une image toutes les pas secondes : le point visé par sa pupille (creeRegard) doit être
// à l'écran (en P06, il « balayait le mur » en fixant des fils encore hors du cadre, la pupille collée au bord de
// l'iris). Rend les instants où il est hors de [0, 1920] × [0, 1080], sauf pendant les moments permis ([de, a], que les
// lots exportent dans REGARDS_HORS : le lot fin, le N°48 qui entre par la gauche en P74, que Phi voit venir). Lent :
// pour les essais. window.film.regardHors(.25)
const regardsPermis = () => LOTS.flatMap(L => {
  const M = etatLots[L.id] && etatLots[L.id].module;
  return M && Array.isArray(M.REGARDS_HORS) ? M.REGARDS_HORS : [];
});
export function regardHors(pas = .25, de = 0, a = DUREE, permis = regardsPermis()) {
  const out = [];
  C.ESSAI_OEIL.note = true;
  try {
    for (let t = de; t < a; t = +(t + pas).toFixed(6)) {
      C.ESSAI_OEIL.places.length = 0;
      const E = composer(t);
      if (permis.some(([p0, p1]) => t >= p0 && t <= p1)) continue;
      for (const o of C.ESSAI_OEIL.places) if (!(o.cx >= 0 && o.cx <= W && o.cy >= 0 && o.cy <= H)) out.push(`${t.toFixed(2)} s, ${E.plans.join(' + ')} : l'œil (${Math.round(o.x)}, ${Math.round(o.y)}) regarde (${Math.round(o.cx)}, ${Math.round(o.cy)}), hors de l'image`);
    }
  } finally { C.ESSAI_OEIL.note = false; C.ESSAI_OEIL.places.length = 0; }
  return out;
}

// le curseur du terminal (commun.js : terminal) tombe après le dernier signe dessiné : ✓ ✗ ▶ ≈ sont dessinés en pixels,
// plus larges que ne les mesure la police (en P21, le curseur couvrait la moitié du ✗ de « → ✓ ou ✗ », une demi-seconde
// sur deux). On écrit des lignes à signes dans un terminal hors de l'image, et on regarde où tombent les cases.
function verifieCurseur() {
  const pb = [], g = C.toile(900, 120).getContext('2d'), fr = g.fillRect;
  for (const txt of ['> universaliser(règle) → ✓ ou ✗', '→ ✓', '≈ 80 % ▶ fin']) {
    const cases = [];
    g.fillRect = function (x, y, w, h) { cases.push({ x, w, col: String(this.fillStyle).toLowerCase() }); return fr.call(this, x, y, w, h); };
    try { C.terminal(g, 0, [{ txt, t0: -100, col: C.CRAIE }], { x: 0, y: 0, w: 880, h: 110, taille: 26, fenetre: false }); } finally { delete g.fillRect; }
    const curseur = cases.filter(c => c.col === C.LABO.toLowerCase()).pop(), signes = cases.filter(c => c.col === C.CRAIE.toLowerCase() && c.w <= 12);
    const fin = Math.max(...signes.map(c => c.x + c.w));
    if (!curseur) pb.push(`terminal : pas de curseur après « ${txt} »`);
    else if (signes.length && curseur.x < fin - .5) pb.push(`terminal : après « ${txt} », le curseur (x ${curseur.x.toFixed(1)}) couvre le dernier signe (jusqu'à x ${fin.toFixed(1)})`);
  }
  return pb;
}

// ================================================================ le temps : les bornes, la surimpression, les répliques
// Le recalage sur la voix enregistrée (tools/voix/RECALAGE.md, §3, étape 1) : les bornes des plans étaient recopiées dans
// les lots (LOT, B, PB, BORNES, PLANS) ; depuis l'étape 5, ils les lisent dans minutage.js, mais un lot pourrait encore en
// écrire : rien ne doit se décaler sans bruit. (La surimpression les lit par id de plan depuis l'étape 4 : le contrôle dit encore si l'une tombe ailleurs que sur une borne ou un instant nommé.)
const egal = (a, b) => Math.abs(a - b) <= 1e-6;
// Les instants de la surimpression qui ne sont pas des bornes de plan, voulus (EPISODE.md, « Surimpression ») : le
// premier cartouche naît du titre, quand P08 l'y a amené, et en P48 la mention « un point par participant… » passe à
// « 1 figure = 1 %… » à la condensation. Ce sont de vrais instants de geste, nommés dans minutage.js (TITRE_AU_CARTOUCHE,
// CONDENSATION) ; toute autre exception est une découverte, que verifie() dit.
const HORS_BORNES = Object.freeze([
  Object.freeze({ genre: 'cartouche', nom: 'XPHI · LES DEUX PILULES', borne: 'de', t: TITRE_AU_CARTOUCHE }),
  Object.freeze({ genre: 'mention', nom: 'points', borne: 'a', t: CONDENSATION }),
  Object.freeze({ genre: 'mention', nom: 'figures', borne: 'de', t: CONDENSATION }),
]);
function verifieTemps() {
  const pb = [], D = DECOUPAGE, n = D.length;
  // le découpage : des plans qui se suivent sans trou ni chevauchement, de 0 à DUREE
  if (!egal(D[0].de, 0)) pb.push(`découpage : ${D[0].id} commence à ${D[0].de} s, pas à 0`);
  D.forEach((d, i) => {
    if (!(d.a > d.de)) pb.push(`découpage : ${d.id} va de ${d.de} à ${d.a} s`);
    if (i && !egal(D[i - 1].a, d.de)) pb.push(`découpage : ${D[i - 1].id} finit à ${D[i - 1].a} s, ${d.id} commence à ${d.de} s`);
  });
  if (!egal(D[n - 1].a, DUREE)) pb.push(`découpage : ${D[n - 1].id} finit à ${D[n - 1].a} s, l'épisode à ${DUREE} s`);
  // les lots : contigus, de 0 à DUREE, chacun du début de son premier plan à la fin de son dernier, des plans qui se suivent
  if (!egal(LOTS[0].de, 0) || !egal(LOTS[LOTS.length - 1].a, DUREE)) pb.push(`lots : de ${LOTS[0].de} à ${LOTS[LOTS.length - 1].a} s, l'épisode de 0 à ${DUREE} s`);
  LOTS.forEach((L, i) => {
    if (i && !egal(LOTS[i - 1].a, L.de)) pb.push(`lots : ${LOTS[i - 1].id} finit à ${LOTS[i - 1].a} s, ${L.id} commence à ${L.de} s`);
    const P = D.filter(d => d.lot === L.id), i0 = D.indexOf(P[0]);
    if (!P.length) { pb.push(`lot ${L.id} : aucun plan dans le découpage`); return; }
    if (!egal(P[0].de, L.de) || !egal(P[P.length - 1].a, L.a)) pb.push(`lot ${L.id} : ${L.de} → ${L.a} s, ses plans vont de ${P[0].de} à ${P[P.length - 1].a} s`);
    if (P.some((p, k) => D[i0 + k] !== p)) pb.push(`lot ${L.id} : ses plans ne se suivent pas dans le découpage`);
  });
  // les PLANS de chaque lot ont les bornes du découpage (les morceaux d'un plan, P22 et P22b, vont ensemble de son début
  // à sa fin ; un plan qui déborde sur son voisin pour un fondu enchaîné serait dit ici : aucun ne le fait)
  for (const L of LOTS) {
    const E = etatLots[L.id];
    if (!E || E.erreur || !E.plans.length) continue;   // un lot absent ou cassé : verifie() le dit déjà
    for (const d of D.filter(x => x.lot === L.id)) {
      const P = E.plans.filter(p => ligneDe(String(p.id)) === d);
      if (!P.length) { pb.push(`${L.id}/${d.id} : pas dans PLANS (l'ébauche le remplace)`); continue; }
      const de = Math.min(...P.map(p => p.de)), a = Math.max(...P.map(p => p.a));
      if (!egal(de, d.de) || !egal(a, d.a)) pb.push(`${L.id}/${d.id} : ${de} → ${a} s dans PLANS, le découpage dit ${d.de} → ${d.a} s`);
    }
  }
  // la surimpression : les cartouches et les mentions commencent et finissent sur des bornes de plan (sauf HORS_BORNES)
  const bornes = D.flatMap(d => [d.de, d.a]), surBorne = x => bornes.some(b => egal(b, x));
  const voulu = (genre, nom, borne, x) => HORS_BORNES.some(h => h.genre === genre && h.nom === nom && h.borne === borne && egal(h.t, x));
  for (const K of SURIMPRESSION.cartouches) for (const b of ['de', 'a']) {
    const nom = K.mots.join(' · ');
    if (!surBorne(K[b]) && !voulu('cartouche', nom, b, K[b])) pb.push(`surimpression : le cartouche « ${nom} » ${b === 'de' ? 'commence' : 'finit'} à ${K[b]} s, pas sur une borne de plan`);
  }
  for (const M of SURIMPRESSION.mentions) for (const b of ['de', 'a']) {
    if (!surBorne(M[b]) && !voulu('mention', M.cle, b, M[b])) pb.push(`surimpression : la mention « ${M.cle} » ${b === 'de' ? 'commence' : 'finit'} à ${M[b]} s, pas sur une borne de plan`);
  }
  // ces instants hors des bornes, les lots qui font le geste les lisent eux aussi dans minutage.js, depuis l'étape 5 du
  // recalage (ouverture : P8.oeil ; tirage : S.cond0) : la mention et le geste ont le même instant
  // les répliques : dans l'ordre du temps et du découpage, chacune commence dans son plan (l'image peut arriver avant la
  // voix, jamais après), et chaque plan annonce les siennes (DECOUPAGE : 'K03–K06', '—' sans voix)
  REPLIQUES.forEach((r, i) => {
    const P = D.find(d => d.id === r.plan), q = REPLIQUES[i - 1];
    if (!P) { pb.push(`texte : ${r.id} est dans ${r.plan}, qui n'est pas dans le découpage`); return; }
    if (!(r.a > r.de)) pb.push(`texte : ${r.id} va de ${r.de} à ${r.a} s`);
    if (q && !(r.de > q.de)) pb.push(`texte : ${r.id} (${r.de} s) ne commence pas après ${q.id} (${q.de} s)`);
    if (q && D.indexOf(P) < D.findIndex(d => d.id === q.plan)) pb.push(`texte : ${r.id} (${r.plan}) est rangée après ${q.id} (${q.plan})`);
    if (r.de < P.de - 1e-6 || r.de >= P.a - 1e-6) pb.push(`texte : ${r.id} commence à ${r.de} s, hors de ${P.id} (${P.de} → ${P.a} s)`);
  });
  for (const d of D) {
    const R = REPLIQUES.filter(r => r.plan === d.id), dit = !R.length ? '—' : R.length === 1 ? R[0].id : `${R[0].id}–${R[R.length - 1].id}`;
    if (dit !== d.repliques) pb.push(`découpage : ${d.id} annonce ${d.repliques}, ses répliques sont ${dit}`);
  }
  // les regards : une cible qui ne dure pas (commun.js, REGARDS_VIDES : celles des regards déjà créés ; après un balayage
  // de l'épisode, tous le sont). Aucune aujourd'hui.
  for (const { t, d } of C.REGARDS_VIDES.values()) {
    pb.push(`regard : une cible à ${t} s (lot ${Number.isFinite(t) ? lotA(t).id : '?'}) dure ${d} s : jamais regardée, sa fin ajoute une borne aux saccades (commun.js, creeRegard)`);
  }
  // le raccord de l'anneau, de kant à variantes : les deux lots le font tourner depuis « circulaire » (K32), chacun de son
  // côté (un lot ne lit pas un autre lot) ; s'ils ne sont plus d'accord, l'anneau saute à la coupe (RACCORD, ESSAI.S.circ)
  const K = etatLots.kant, V = etatLots.variantes;
  const tK = K && !K.erreur && K.module && K.module.RACCORD ? K.module.RACCORD.t0 : null;
  const tV = V && !V.erreur && V.module && V.module.ESSAI && V.module.ESSAI.S ? V.module.ESSAI.S.circ : null;
  if (typeof tK === 'number' && typeof tV === 'number' && !egal(tK, tV)) pb.push(`raccord de l'anneau : kant le fait tourner depuis ${tK} s, variantes depuis ${tV} s`);
  return pb;
}

// ================================================================ l'empreinte du temps (le recalage : tools/voix/RECALAGE.md)
// Tout le temps de l'épisode en un objet JSON : les bornes (DUREE, AFFICHE, LOTS, DECOUPAGE), la surimpression (les
// ouvertures de la boîte, les cartouches, les mentions), les répliques (de, a, dite, cps, cps_fin, et fin : l'instant où
// la boîte a fini de l'écrire), l'instant de chaque caractère que la boîte écrit (les bips), ce que chaque lot expose
// (LOT, ses PLANS : bornes, caméras, transitions ; son ESSAI : ses instants S, sans les fonctions ; ouverture n'a pas
// d'ESSAI) et SONS_FILM. Les étapes du recalage qui ne doivent rien faire bouger la comparent à celle d'avant :
// window.film.ecartsEmpreinte(avant, window.film.empreinte()) → []. Elle ne dessine rien : la demander ne change pas
// l'image. Les nombres non finis s'écrivent en texte ('NaN', 'Infinity', '-Infinity'), que JSON n'a pas.
function enJSON(x, pile = []) {   // les nombres, textes, listes et objets simples ; ni fonctions, ni toiles, ni cycles
  if (x === null || typeof x === 'string' || typeof x === 'boolean') return x;
  if (typeof x === 'number') return Number.isFinite(x) ? x : String(x);
  if (typeof x !== 'object' || pile.includes(x)) return undefined;
  pile.push(x);
  try {
    if (Array.isArray(x) || ArrayBuffer.isView(x)) return Array.from(x, v => enJSON(v, pile) ?? null);
    if (x instanceof Map) return enJSON([...x.entries()], pile);
    if (x instanceof Set) return enJSON([...x], pile);
    const pr = Object.getPrototypeOf(x);
    if (pr !== Object.prototype && pr !== null) return undefined;
    const o = {};
    for (const k of Object.keys(x)) { const v = enJSON(x[k], pile); if (v !== undefined) o[k] = v; }
    return o;
  } finally { pile.pop(); }
}
export function empreinte() {
  return enJSON({
    version: 1, ecriture: ECRITURE, constantes: { IPS, PAROLE, PAUSE, LIRE, CPS },
    DUREE, AFFICHE,
    LOTS: LOTS.map(({ id, de, a }) => ({ id, de, a })),
    DECOUPAGE: DECOUPAGE.map(({ id, de, a, lot, sequence }) => ({ id, de, a, lot, sequence })),
    boite: BOITE.ouvertures,
    cartouches: SURIMPRESSION.cartouches.map(({ de, a, entree, mots }) => ({ de, a, entree, mots })),
    mentions: SURIMPRESSION.mentions.map(({ de, a, cle }) => ({ de, a, cle })),
    repliques: REPLIQUES.map(r => ({ id: r.id, plan: r.plan, de: r.de, a: r.a, dite: r.dite, cps: r.cps, cps_fin: r.cps_fin, fin: finParole(r.id) })),
    bips: ecritsEntre(-1, DUREE + 1).map(b => b.t),
    lots: LOTS.map(L => {
      const E = etatLots[L.id] || {}, M = E.module || {};
      return { id: L.id, statut: E.erreur ? String(E.erreur) : E.statut || '', LOT: M.LOT, plans: E.plans || [], essai: M.ESSAI ?? null };
    }),
    sons: SONS_FILM,
  });
}
// ce qui diffère entre deux empreintes (au-delà de tol pour les nombres) : [] si rien n'a bougé ; au plus max lignes,
// puis le compte. Les éléments d'une liste qui ont un id sont nommés par lui (repliques[K07].de).
export function ecartsEmpreinte(avant, apres, tol = 1e-6, max = 60) {
  const out = []; let n = 0;
  const dit = m => { n++; if (out.length < max) out.push(m); };
  const nom = (v, k) => (v && typeof v === 'object' && typeof v.id === 'string' ? v.id : k);
  const va = (x, y, ch) => {
    if (typeof x === 'number' && typeof y === 'number') { if (!(Math.abs(x - y) <= tol)) dit(`${ch} : ${x} → ${y}`); return; }
    if (x && y && typeof x === 'object' && typeof y === 'object' && Array.isArray(x) === Array.isArray(y)) {
      const liste = Array.isArray(x);
      if (liste && x.length !== y.length) dit(`${ch} : ${x.length} éléments → ${y.length}`);
      for (const k of new Set([...Object.keys(x), ...Object.keys(y)])) {
        const c = liste ? `${ch}[${nom(x[k] ?? y[k], k)}]` : `${ch}.${k}`;
        if (!(k in x)) dit(`${c} : ajouté`); else if (!(k in y)) dit(`${c} : disparu`); else va(x[k], y[k], c);
      }
      return;
    }
    if (JSON.stringify(x) !== JSON.stringify(y)) dit(`${ch} : ${JSON.stringify(x)} → ${JSON.stringify(y)}`);
  };
  va(avant, apres, 'empreinte');
  if (n > out.length) out.push(`… ${n} écarts en tout`);
  return out;
}

// ================================================================ la vérification (pour les lots, et les essais)
export function verifie() {
  const pb = [];
  for (const L of LOTS) {
    const E = etatLots[L.id];
    if (!E || E.erreur) { pb.push(`lot ${L.id} : ${E ? E.erreur : 'absent'}`); continue; }
    const M = E.module;
    if (M.LOT && (M.LOT.id !== L.id || Math.abs(M.LOT.de - L.de) > 1e-6 || Math.abs(M.LOT.a - L.a) > 1e-6)) pb.push(`lot ${L.id} : LOT = ${JSON.stringify(M.LOT)}, l'épisode dit ${L.de} → ${L.a}`);
    for (const p of E.plans) {
      if (typeof p.dessine !== 'function') pb.push(`${L.id}/${p.id} : pas de dessine()`);
      if (p.de < L.de - 1e-6 || p.a > L.a + 1e-6) pb.push(`${L.id}/${p.id} : ${p.de} → ${p.a} sort du lot (${L.de} → ${L.a})`);
      const D = ligneDe(String(p.id));
      if (!D) pb.push(`${L.id}/${p.id} : ce plan n'est pas dans le découpage (EPISODE.md)`);
      else if (D.lot !== L.id) pb.push(`${L.id}/${p.id} : le découpage le donne au lot ${D.lot}`);
    }
    for (let x = L.de; x < L.a - 1e-6; x += .1) if (!E.plans.some(p => x >= p.de && x < p.a)) { pb.push(`lot ${L.id} : aucun plan à ${x.toFixed(1)} s (l'ébauche le remplace)`); break; }
    // les essais propres au lot (une étiquette qui arrive trop tard, un chiffre dit qui ne suit plus les données…)
    if (typeof M.verifie === 'function') { try { for (const m of M.verifie()) pb.push(`${L.id} : ${m}`); } catch (e) { pb.push(`${L.id} : verifie() a levé « ${e.message} »`); } }
  }
  for (const m of verifieRepliques()) pb.push(`texte : ${m}`);
  for (const m of motsIntrouvables()) pb.push(`texte : ${m} n'est plus dans la réplique : le repère d'image accroché à ce mot est perdu`);
  for (const m of repliquesAbsentes()) pb.push(`texte : ${m}`);
  for (const m of verifieSons()) pb.push(m);
  for (const m of verifieCaracteres()) pb.push(m);
  for (const m of verifieAdresse()) pb.push(m);
  for (const m of verifieCurseur()) pb.push(m);
  for (const m of verifieTemps()) pb.push(m);
  if (RESULTATS && typeof RESULTATS.verifieSurlignes === 'function') for (const m of RESULTATS.verifieSurlignes()) pb.push(`résultats : ${m}`);
  if (DONNEES && typeof DONNEES.verifie === 'function') { try { for (const m of DONNEES.verifie()) pb.push(`données : ${m}`); } catch (e) { pb.push(`données : verifie() a levé « ${e.message} »`); } }
  for (const [nom, M] of Object.entries(MODULES)) if (!M || M.erreur) pb.push(`${nom}.js ${M && M.erreur ? `illisible (${M.erreur})` : 'absent'} : les lots qui l'importent montrent leur ébauche`);
  if (!EUROPE) pb.push('europe.js absent : globalThis.EUROPE est vide (la carte P63 attendra)');
  return pb;
}

// ================================================================ l'adresse : la boucle et l'instant
// ?plan= (un lot, une séquence, un plan), ?de=, ?a= (un moment) : le mode boucle, qui joue tout de suite ; ?t= : une
// image fixe. Les instants s'écrivent avec un point ou une virgule (EPISODE.md les écrit à la française : « 202,5 s ») ;
// un instant illisible est dit (avertissements) et ignoré : la page revient à l'affiche (ou au début de la boucle).
// Pure (verifie() l'essaie) : lisAdresse('?t=202,5').T0 → 202.5.
const lisNombre = v => { const x = parseFloat(String(v).trim().replace(',', '.')); return Number.isFinite(x) ? x : null; };
export function lisAdresse(q) {
  const params = q instanceof URLSearchParams ? q : new URLSearchParams(q), avertissements = [];
  let boucle = [0, DUREE];
  const pl = params.get('plan');
  if (pl) {
    const L = LOTS.find(l => l.id === pl), D = DECOUPAGE.find(d => d.id === pl.toUpperCase()), S = SEQUENCES.find(s => s.id === pl.toUpperCase());
    if (L) boucle = [L.de, L.a];
    else if (D) boucle = [D.de, D.a];
    else if (S) boucle = [DECOUPAGE.find(d => d.id === S.de).de, DECOUPAGE.find(d => d.id === S.a).a];
    else avertissements.push(`?plan=${pl} : ni un lot (${LOTS.map(l => l.id).join(', ')}), ni une séquence (S01…S13), ni un plan (P01…P85)`);
  }
  const instant = cle => {
    if (!params.has(cle)) return null;
    const v = lisNombre(params.get(cle));
    if (v === null) avertissements.push(`?${cle}=${params.get(cle)} : illisible (un nombre de secondes, comme 202.5 ou 202,5)`);
    return v;
  };
  const de = instant('de'), a = instant('a');
  if (de !== null || a !== null) boucle = [de ?? boucle[0], a ?? boucle[1]];
  // le mode boucle : un plan, un lot, une séquence, ou un moment (?de=, ?a=, ou les deux : ?a= seul boucle sur [0, a])
  const enBoucle = !!pl || params.has('de') || params.has('a');
  return { pl, boucle, enBoucle, T0: instant('t'), avertissements };
}
function verifieAdresse() {
  const pb = [], essai = (q, attendu) => {
    const r = lisAdresse(q), vu = { boucle: r.boucle, enBoucle: r.enBoucle, T0: r.T0 }, ok = Object.entries(attendu).every(([k, v]) => JSON.stringify(vu[k]) === JSON.stringify(v));
    if (!ok) pb.push(`adresse : ${q} donne ${JSON.stringify(vu)}, attendu ${JSON.stringify(attendu)}`);
  };
  essai('?t=202,5', { T0: 202.5, enBoucle: false });
  essai('?t=202.5', { T0: 202.5 });
  essai('?t=abc', { T0: null });
  essai('?de=600,5&a=605', { boucle: [600.5, 605], enBoucle: true });
  essai('?a=2', { boucle: [0, 2], enBoucle: true });
  essai('?plan=P42', { boucle: [TEMPS_PLAN.P42.de, TEMPS_PLAN.P42.a], enBoucle: true });   // les bornes de P42 (minutage.js)
  return pb;
}

// ================================================================ le démarrage, la lecture
const fmt = s => { const m = Math.floor(s / 60), r = s - 60 * m; return `${m}:${r.toFixed(1).padStart(4, '0').replace('.', ',')}`; };
const erreurDe = M => String(M && M.erreur && (M.erreur.message || M.erreur) || 'module absent');
// lots : { id → module (ou { erreur }) } chargés par index.html ; europe : globalThis.EUROPE (ou null) ; resultats,
// donnees : les modules resultats.js et donnees.js (ou { erreur }, ou absents) — écrits à part : leur absence ne casse rien
export async function demarre({ lots = {}, europe = null, resultats = null, donnees = null } = {}) {
  const params = new URLSearchParams(location.search);
  RENDU = params.has('rendu');
  if (params.has('ecriture')) reglerEcriture(params.get('ecriture'));
  EUROPE = europe || globalThis.EUROPE || null;
  MODULES.resultats = resultats; MODULES.donnees = donnees;
  RESULTATS = resultats && !resultats.erreur ? resultats : null;
  DONNEES = donnees && !donnees.erreur ? donnees : null;
  for (const [nom, M] of Object.entries(MODULES)) if (M && M.erreur) console.info(`[épisode] ${nom}.js : ${erreurDe(M)}`);
  for (const L of LOTS) {
    const M = lots[L.id];
    if (!M || M.erreur) { etatLots[L.id] = { erreur: erreurDe(M), statut: 'module absent ou cassé', plans: [], sons: [] }; if (M) console.error(`[épisode] lot ${L.id} :`, M.erreur); continue; }
    const plans = Array.isArray(M.PLANS) ? [...M.PLANS] : [];
    etatLots[L.id] = { module: M, plans, sons: Array.isArray(M.SONS) ? M.SONS : [], statut: plans.length ? '' : 'PLANS vide' };
  }
  const toileFilm = document.getElementById('film');
  ctx = toileFilm.getContext('2d');
  A = C.toile(W, H); B = C.toile(W, H);
  // les polices avant la première image (elles sont dans le dépôt : ../pilules/fonts/)
  const polices = Promise.all(['34px "DotGothic16"', '20px "IBM Plex Mono"', '500 20px "IBM Plex Mono"'].map(f => document.fonts.load(f)));
  await Promise.race([polices, new Promise(r => setTimeout(r, 3000))]).catch(() => {});
  C.prepare(); prepareTextes();

  // la boucle et l'instant de l'adresse
  const { pl, boucle, enBoucle, T0, avertissements } = lisAdresse(params);
  for (const m of avertissements) console.warn(`[épisode] ${m}`);

  const sons = LOTS.flatMap(L => (etatLots[L.id].sons || []).map(s => ({ ...s, lot: L.id })));
  SONS_FILM = sons.filter(s => Number.isFinite(s.t)).sort((a, b) => a.t - b.t);
  window.film = {
    pret: false, duree: DUREE, ips: IPS, largeur: W, hauteur: H,
    lots: LOTS, decoupage: DECOUPAGE, sequences: SEQUENCES, surimpression: SURIMPRESSION, sons,
    // une image : la dessine et rend ce qui s'y passe (le lot, les plans) et ce qui y sonne — pour tools/rendre-film.cjs
    image: t => ({ ...composer(t), plans: [...ETAT.plans], ...evenements(t) }),
    // ce qui sonne pendant l'image de l'instant t, sans la dessiner (le son seul : rendre-film.cjs --son-seul)
    evenements,
    verifie,
    glyphes,
    sousSurimpression,
    sousOeil,
    regardHors,
    // tout le temps de l'épisode, en JSON, et ce qui a bougé entre deux empreintes (le recalage)
    empreinte,
    ecartsEmpreinte,
  };
  if (RENDU) {
    document.documentElement.classList.add('rendu');
    composer(T0 ?? AFFICHE);
    window.film.pret = true;
    return;
  }

  // ---------------------------------------------------------------- la lecture
  const barre = document.getElementById('barre'), piste = document.getElementById('piste'), tete = document.getElementById('tete');
  const etiquette = document.getElementById('etiquette'), temps = document.getElementById('temps'), aide = document.getElementById('aide');
  const segs = document.getElementById('segments');
  for (const L of LOTS) {
    const s = document.createElement('div'); s.className = 'seg'; s.title = `${L.id} · ${L.plans} · ${L.sequences}`;
    s.style.left = `${100 * L.de / DUREE}%`; s.style.width = `${100 * (L.a - L.de) / DUREE}%`;
    if (etatLots[L.id].erreur || !etatLots[L.id].plans.length || etatLots[L.id].plans.every(p => p.dessine === ebauche)) s.classList.add('absent');
    segs.appendChild(s);
  }
  if (enBoucle) {
    const b = document.createElement('div'); b.className = 'boucle';
    b.style.left = `${100 * boucle[0] / DUREE}%`; b.style.width = `${100 * (boucle[1] - boucle[0]) / DUREE}%`;
    segs.appendChild(b);
  }
  let t = T0 ?? (enBoucle ? boucle[0] : 0), joue = false, depart = 0, tDepart = 0, raf = 0, dernier = 0;
  // ---------------------------------------------------------------- le son (son.mp3), joué avec l'image
  // son.mp3 : les sons et les bips de node tools/rendre-film.cjs --film episode-pilules --son-seul son.wav, puis la voix de
  // Ronan, posée et mixée par tools/voix/chaine/mixe_voix.py son.wav son.mp3 (les deux à relancer quand le temps de l'épisode ou ses SONS changent). S'il joue, c'est lui qui donne l'heure pendant la lecture ; sinon (tant qu'il
  // arrive, ou que le navigateur ne le laisse pas jouer), l'horloge de la page. M coupe le son.
  // Il est lu par un élément audio, au fil de la lecture, sans être décodé d'avance : décodé en entier (comme dans le
  // film de 3 min 20, qui dure sept fois moins), il coûtait 538 Mo de mémoire par onglet et 10 s de calcul. Rien n'est
  // chargé avant la première lecture (une image fixe ?t= ne le demande pas). Si le serveur sert des morceaux de fichier
  // (Accept-Ranges : GitHub Pages), l'élément le lit directement ; sinon (python3 -m http.server ne le sait pas, et
  // l'élément ne pourrait que repartir du début), il est d'abord téléchargé en entier (19 Mo, en mémoire comme fichier).
  const son = { existe: false, morceaux: false, charge: false, audio: null, muet: false };
  const sonLa = fetch('son.mp3', { method: 'HEAD' }).then(r => {   // l'en-tête seul : y a-t-il un son, se lit-il par morceaux ?
    son.existe = r.ok; son.morceaux = r.ok && /bytes/i.test(r.headers.get('accept-ranges') || ''); majAide();
  }).catch(() => {});
  const sonCharge = () => {
    if (son.charge) return;
    son.charge = true;
    const pose = src => {
      const a = new Audio(); a.preload = 'auto'; a.muted = son.muet;
      a.addEventListener('loadedmetadata', () => { son.audio = a; if (joue) sonJoue(t); majAide(); }, { once: true });
      a.addEventListener('error', () => { son.audio = null; son.existe = false; majAide(); }, { once: true });
      a.src = src;
    };
    sonLa.then(() => {
      if (!son.existe) return;
      if (son.morceaux) pose('son.mp3');
      else fetch('son.mp3').then(r => (r.ok ? r.blob() : null)).then(b => { if (b) pose(URL.createObjectURL(b)); }).catch(() => {});
    });
  };
  const sonCoupe = () => { if (son.audio) son.audio.pause(); };
  const sonJoue = x => {
    if (!son.audio) { sonCharge(); return; }   // le son arrive : il se calera sur l'image (loadedmetadata)
    const a = son.audio;
    if (!(x < a.duration - .05)) { a.pause(); return; }
    a.currentTime = x;
    const p = a.play();
    if (p) p.catch(() => {});   // le navigateur attend un geste (une lecture partie seule, en mode boucle) : l'image continue, muette
  };
  // le son donne l'heure quand il joue vraiment (ni en pause, ni en train de se déplacer, ni à court de données)
  const sonCourt = () => { const a = son.audio; return !!a && !a.paused && !a.seeking && a.readyState >= 3; };
  const afficher = x => {
    t = x; composer(t);
    const D = planDecoupage(Math.min(t, DUREE - 1e-6)), S = sequenceA(Math.min(t, DUREE - 1e-6));
    tete.style.left = `${100 * C.clamp(t / DUREE)}%`;
    temps.textContent = `${fmt(t)} / ${fmt(DUREE)}`;
    etiquette.textContent = `${S ? `${S.id} · ` : ''}${D ? `${D.id} · ${D.titre}` : ''} · lot ${ETAT.lot}${ETAT.ebauche ? ' (ébauche)' : ''}${pl ? ` · boucle ${pl}` : ''}`;
  };
  // L'image suit le son quand il joue, sinon l'horloge de la page, qui part de l'instant du départ (tDepart) : prise
  // avec performance.now(), comme depart (l'horodatage de requestAnimationFrame est celui du début de l'image, souvent
  // antérieur au départ : la première image de la lecture tombait avant lui, dans le plan d'avant). Et pendant une
  // lecture, l'image ne recule jamais (dernier) : le son qui se cale après un déplacement la retient un instant.
  const avance = () => {
    if (!joue) return;
    let x;
    if (sonCourt()) { x = son.audio.currentTime; tDepart = x; depart = performance.now(); }   // l'horloge de la page suit le son
    else x = tDepart + Math.max(0, performance.now() - depart) / 1000;
    x = Math.max(x, dernier);
    if (x >= boucle[1]) {
      if (enBoucle) { tDepart = boucle[0]; depart = performance.now(); x = boucle[0]; sonJoue(x); }
      else { joue = false; sonCoupe(); afficher(DUREE - 1e-3); majAide(); return; }
    }
    dernier = x;
    afficher(x);
    raf = requestAnimationFrame(avance);
  };
  const majAide = () => {
    const m = son.existe ? (son.muet ? ' · M : son coupé' : ' · M') : '';
    aide.textContent = joue ? `espace : pause${m}` : `espace : lecture · ← → 5 s · Maj 1 s · , . une image · R · C · F${m}`; barre.classList.toggle('joue', joue);
  };
  const memorise = () => {   // en pause, l'adresse garde l'instant (?t=) : on peut la donner à quelqu'un
    const p = new URLSearchParams(location.search); p.set('t', t.toFixed(2)); history.replaceState(null, '', `?${p}`);
  };
  // une seule boucle d'images : relancer la lecture pendant qu'elle tourne annule l'image demandée avant d'en redemander
  // une (sinon chaque R ajoutait une boucle, et l'image était composée plusieurs fois par affichage)
  const lecture = (oui = !joue) => {
    if (oui && t >= boucle[1] - 1e-3) t = boucle[0];
    joue = oui; majAide();
    cancelAnimationFrame(raf);
    if (joue) { tDepart = dernier = t; depart = performance.now(); sonJoue(t); raf = requestAnimationFrame(avance); } else { sonCoupe(); memorise(); }
  };
  const aller = x => { const y = C.clamp(x, 0, DUREE - 1e-3); if (joue) { tDepart = dernier = y; depart = performance.now(); sonJoue(y); } afficher(y); if (!joue) memorise(); };
  // ---------------------------------------------------------------- le plein écran (F, ou le bouton à droite de la barre)
  // Ronan : « Est-ce que quand on met la vidéo, on pourrait avoir un système qui permet de la mettre en plein écran ? »
  // La page entière passe en plein écran (l'API Fullscreen, ou ses noms webkit, seuls connus des anciens Safari et de
  // l'iPad d'avant iPadOS 16.4) : la toile y garde son 16:9, centrée, entre des bandes noires, quelle que soit la forme
  // de l'écran (la règle de #film, index.html) ; la barre et le curseur s'effacent après 2 s sans mouvement ni toucher
  // (html.repos, plus bas) et reviennent au moindre geste. Là où l'API manque pour une page (l'iPhone : seule une vidéo
  // y passe en plein écran), ou si le navigateur la refuse (un cadre sans allowfullscreen), le même bouton met la page en
  // « plein fenêtre » : la toile remplit la fenêtre, sur fond noir, et la barre s'efface pareil. Échap, F ou le bouton
  // en sortent. Rien n'y touche à la lecture, au son ni à l'horloge : seule la taille affichée de la toile change (elle
  // reste 1920×1080, rien n'est redessiné). En ?rendu=1, ni bouton ni touche : la page s'arrête avant (plus haut).
  const racine = document.documentElement;
  const demande = racine.requestFullscreen || racine.webkitRequestFullscreen;
  const quitte = document.exitFullscreen || document.webkitExitFullscreen;
  const enPlein = () => document.fullscreenElement || document.webkitFullscreenElement || null;
  const api = !!(demande && quitte && (document.fullscreenEnabled ?? document.webkitFullscreenEnabled ?? true));
  let ecran = false, fenetre = false;   // ecran : la page est en plein écran ou en plein fenêtre ; fenetre : le second
  const plein = document.createElement('button');
  plein.id = 'plein'; plein.type = 'button'; plein.setAttribute('aria-keyshortcuts', 'F');
  plein.innerHTML = '<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" focusable="false"><path fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
  barre.appendChild(plein);
  const ICONE = {   // quatre coins vers l'extérieur (entrer), vers l'intérieur (sortir)
    entrer: 'M1.5 6V1.5H6M10 1.5h4.5V6M14.5 10v4.5H10M6 14.5H1.5V10',
    sortir: 'M6 1.5V6H1.5M14.5 6H10V1.5M10 14.5V10h4.5M1.5 10H6v4.5',
  };
  const majPlein = () => {
    ecran = !!enPlein() || fenetre;
    racine.classList.toggle('ecran', ecran);
    const mode = enPlein() || (!fenetre && api) ? 'plein écran' : 'plein fenêtre';
    plein.setAttribute('aria-label', ecran ? `Quitter le ${mode}` : `${mode[0].toUpperCase()}${mode.slice(1)}`);
    plein.title = ecran ? `Quitter le ${mode} (F ou Échap)` : `${mode[0].toUpperCase()}${mode.slice(1)} (F)`;
    plein.querySelector('path').setAttribute('d', ecran ? ICONE.sortir : ICONE.entrer);
  };
  const pleinFenetre = oui => { fenetre = oui; majPlein(); eveille(); };
  const entrerPlein = () => {
    if (api) {
      try {
        const p = demande.call(racine);
        if (p && p.catch) p.catch(e => { console.info('[épisode] plein écran refusé : la page passe en plein fenêtre.', e && e.message); pleinFenetre(true); });
        return;
      } catch (e) { console.info('[épisode] plein écran impossible : la page passe en plein fenêtre.', e && e.message); }
    }
    pleinFenetre(true);
  };
  const basculePlein = () => {
    if (enPlein()) { const p = quitte.call(document); if (p && p.catch) p.catch(() => {}); }
    else if (fenetre) pleinFenetre(false);
    else entrerPlein();
  };
  for (const ev of ['fullscreenchange', 'webkitfullscreenchange']) document.addEventListener(ev, () => { if (enPlein()) fenetre = false; majPlein(); eveille(); });
  if (!racine.requestFullscreen && racine.webkitRequestFullscreen) document.addEventListener('webkitfullscreenerror', () => pleinFenetre(true));   // les webkit sans promesse
  plein.addEventListener('click', basculePlein);
  majPlein();
  toileFilm.addEventListener('click', () => lecture());
  piste.addEventListener('click', e => { const r = piste.getBoundingClientRect(); aller(DUREE * (e.clientX - r.left) / r.width); });
  addEventListener('keydown', e => {
    const k = e.key;
    if (k === ' ') { e.preventDefault(); lecture(); }
    else if (k === 'ArrowRight' || k === 'ArrowLeft') { e.preventDefault(); aller(t + (k === 'ArrowRight' ? 1 : -1) * (e.shiftKey ? 1 : 5)); }
    else if (k === '.' || k === ',') aller(t + (k === '.' ? 1 : -1) / IPS);
    else if (k === 'r' || k === 'R') { aller(boucle[0]); lecture(true); }
    else if (k === 'c' || k === 'C') barre.classList.toggle('cachee');
    else if (k === 'm' || k === 'M') { son.muet = !son.muet; if (son.audio) son.audio.muted = son.muet; majAide(); }
    else if (k === 'Home') aller(boucle[0]);
    else if ((k === 'f' || k === 'F') && !e.ctrlKey && !e.metaKey && !e.altKey) { if (!e.repeat) basculePlein(); }
    else if (k === 'Escape' && fenetre) pleinFenetre(false);   // en vrai plein écran, Échap est au navigateur
    else return;
    if (ecran && k !== ' ' && k !== 'f' && k !== 'F' && k !== 'Escape') eveille();   // en plein écran, on voit où l'on va
  });
  // La barre se calme (s'efface) sans souris : hors plein écran, 2,5 s après le dernier mouvement, pendant la lecture
  // (et d'emblée sur une image fixe) ; en plein écran ou plein fenêtre, 2 s après le dernier mouvement ou toucher, en
  // lecture comme en pause, sauf si la souris est sur la barre, et le curseur avec elle (html.repos : ni l'une ni l'autre
  // ne prend alors le clic ; un toucher sur l'image fait ce qu'il fait toujours, la lecture ou la pause, et la rappelle).
  // Un toucher sur la barre effacée la rappelle sans rien y faire : le navigateur cherche la cible du clic après que le
  // doigt s'est levé, quand la barre est déjà revenue ; ce clic-là s'arrête (sinon il touchait le bouton qu'on ne voyait pas).
  let calme, ou = '', souris = true, rappel = false;
  const eveille = () => {
    barre.classList.remove('calme'); racine.classList.remove('repos'); clearTimeout(calme);
    calme = ecran ? setTimeout(() => { if (!(souris && barre.matches(':hover'))) racine.classList.add('repos'); }, 2000)
      : setTimeout(() => joue && barre.classList.add('calme'), 2500);
  };
  if (T0 !== null) barre.classList.add('calme');   // une image fixe (une capture) : la barre attend la souris
  addEventListener('pointermove', e => {
    souris = e.pointerType === 'mouse';
    const p = `${e.clientX},${e.clientY}`;   // en plein écran, une souris qui ne bouge pas (un événement sans déplacement) ne rappelle rien
    if (ecran && souris && p === ou) return;
    ou = p; eveille();
  });
  addEventListener('pointerdown', e => { souris = e.pointerType === 'mouse'; rappel = racine.classList.contains('repos'); if (ecran) eveille(); });
  addEventListener('click', e => { if (rappel && barre.contains(e.target)) { e.stopPropagation(); e.preventDefault(); } rappel = false; }, true);
  window.film.aller = x => { lecture(false); aller(x); };
  window.film.lecture = lecture;
  // l'essai de la lecture (hors ?rendu=1, asynchrone) : partie de l'image fixe du début d'un plan, la lecture ne montre
  // jamais une image d'avant le départ, ni d'un autre plan (la première image tombait dans le plan d'avant : un éclair
  // de P08 en partant de P09). window.film.essaiLecture(['P09', 'P19']) → [] si tout va bien.
  window.film.essaiLecture = async (ids = ['P09', 'P19', 'P42']) => {
    const pb = [], avant = t, image = () => new Promise(r => requestAnimationFrame(() => r()));
    for (const id of ids) {
      const D = DECOUPAGE.find(d => d.id === id);
      if (!D) { pb.push(`essaiLecture : ${id} n'est pas un plan`); continue; }
      lecture(false); aller(D.de); await image();
      lecture(true);
      for (let i = 0; i < 6; i++) {
        await image();
        if (ETAT.t < D.de - 1e-9 || !ETAT.plans.some(p => p.startsWith(D.id))) { pb.push(`lecture depuis ${id} (${D.de} s) : image ${i + 1} à ${ETAT.t.toFixed(3)} s (${ETAT.plans.join(', ') || 'aucun plan'})`); break; }
      }
      lecture(false);
    }
    aller(avant);
    return pb;
  };

  afficher(T0 ?? (enBoucle ? boucle[0] : AFFICHE));
  if (T0 === null && !enBoucle) { t = 0; tete.style.left = '0%'; temps.textContent = `${fmt(0)} / ${fmt(DUREE)}`; etiquette.textContent = `l’affiche (${fmt(AFFICHE)})`; }
  majAide();
  window.film.pret = true;
  const pb = verifie();
  if (pb.length) console.info(`[épisode] à vérifier (${pb.length}) :\n- ${pb.join('\n- ')}`);
  if (T0 === null && enBoucle) lecture(true);
}
