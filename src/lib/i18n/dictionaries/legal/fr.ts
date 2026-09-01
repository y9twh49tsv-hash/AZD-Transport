import type { LegalDictionary } from './de';

/**
 * The legal texts, in French. A reading aid — the German version binds.
 */
export const legalFr: LegalDictionary = {
  disclaimerTitle: 'Provisoire — pas encore vérifié juridiquement',
  disclaimer:
    'Ce texte est un projet sans valeur contraignante, rédigé pour achever techniquement le site. Il ne remplace pas un conseil juridique. Avant le démarrage effectif de l’activité, il doit être vérifié par un avocat et adapté à votre entreprise réelle, à votre assurance et aux règles douanières et de transport applicables.',
  translationNoticeTitle: 'Traduction',
  translationNotice:
    'Cette page est une traduction fournie pour faciliter la compréhension. Seule la version allemande fait foi juridiquement.',
  asOf: 'État : {date}',
  updatedAt: 'pas encore vérifié définitivement',

  terms: {
    title: 'Conditions générales',
    intro: 'Conditions contractuelles des prestations de transport de {brand}.',
    s1Title: '§ 1 Champ d’application',
    s1p: 'Ces conditions s’appliquent à toutes les prestations de transport entre {legalName} (« nous ») et le client, dans le trafic entre l’Allemagne et le Maroc.',
    s2Title: '§ 2 Conclusion du contrat',
    s2p: 'Le contrat est conclu par notre confirmation de la réservation. Le client reçoit un numéro d’envoi permettant de suivre l’envoi.',
    s3Title: '§ 3 Prix',
    s3li1: 'Envois normaux : {perKg} par kilogramme entamé.',
    s3li2: 'Prix minimum par envoi : {minimum}.',
    s3li3: 'Enlèvement chez le client : forfait de {pickup}.',
    s3li4: 'Documents jusqu’à {documentsMax} kg : forfait de {documents}, quel que soit le poids.',
    s3li5:
      'Objets encombrants ou particulièrement lourds : prix forfaitaire individuel après examen des photos, dimensions et poids.',
    s3p: 'Le poids réel constaté à la prise en charge fait foi. S’il diffère de l’indication du client, nous l’en informons avant la poursuite de l’acheminement.',
    s4Title: '§ 4 Obligations du client',
    s4li1: 'informations complètes et véridiques sur le contenu, le poids et le destinataire',
    s4li2: 'emballage adapté au transport',
    s4li3: 'aucune marchandise interdite ou non déclarée (voir la page « Marchandises interdites »)',
    s4li4: 'le destinataire doit être joignable au numéro de téléphone indiqué',
    s5Title: '§ 5 Paiement',
    s5p: 'Le paiement s’effectue actuellement en espèces au dépôt ou à l’enlèvement, par virement, ou sur facture après accord. Le paiement en ligne est en préparation.',
    s6Title: '§ 6 Délais d’acheminement',
    s6todo:
      '[Indiquer des délais réalistes, p. ex. « en règle générale 7 à 12 jours à compter du chargement ». Ne promettre fermement que ce qui peut être tenu.]',
    s6p: 'Les délais indiqués sont des valeurs indicatives sans engagement. Les retards dus à la douane, au ferry ou à un cas de force majeure n’ouvrent pas droit à des dommages-intérêts.',
    s7Title: '§ 7 Responsabilité',
    s7p: 'Les règles de la page « Responsabilité & assurance » s’appliquent.',
    s7todo:
      '[Faire vérifier si et dans quelle mesure la CMR (Convention relative au contrat de transport international de marchandises par route) ou les §§ 407 et suivants du code de commerce allemand s’appliquent.]',
    s8Title: '§ 8 Droit de rétractation des consommateurs',
    s8todo:
      '[Ajouter l’information sur la rétractation. Les contrats de transport comportent des particularités — faire clarifier par un avocat si le § 312g al. 2 du code civil allemand s’applique et, le cas échéant, fournir un formulaire type.]',
    s9Title: '§ 9 Dispositions finales',
    s9p: 'Le droit allemand s’applique. Si une disposition devait être nulle, la validité des autres dispositions n’en serait pas affectée.',
  },

  privacy: {
    title: 'Politique de confidentialité',
    intro: 'Comment nous traitons vos données personnelles — et quels sont vos droits.',
    s1Title: '1. Responsable du traitement',
    s1p: '{legalName}, {street}, {zip} {city}, {country}. E-mail : {email}, téléphone : {phone}.',
    s1todo:
      '[Si un délégué à la protection des données doit être désigné, indiquer ici son nom et ses coordonnées.]',
    s2Title: '2. Quelles données nous traitons',
    s2p: 'Pour traiter un envoi, nous traitons :',
    s2li1: 'prénom et nom de l’expéditeur et du destinataire',
    s2li2: 'adresse de l’expéditeur et du destinataire',
    s2li3: 'numéro de téléphone et adresse e-mail',
    s2li4: 'informations sur l’envoi : poids, nombre de colis, contenu, description',
    s2li5: 'dates d’enlèvement et de livraison ainsi que les mises à jour de statut',
    s2li6: 'statut de paiement et montant',
    s2li7: 'pour les objets encombrants : les photos que vous envoyez',
    s2li8: 'à l’enlèvement et à la livraison : photos de preuve et éventuellement une signature',
    s2after:
      'Nous ne collectons que les données réellement nécessaires au transport. Nous ne traitons pas de données sensibles (par exemple des données de santé).',
    s3Title: '3. Bases juridiques',
    s3li1Law: 'Art. 6, § 1, b) RGPD',
    s3li1: '— exécution du contrat de transport (réservation, enlèvement, transport, livraison, suivi).',
    s3li2Law: 'Art. 6, § 1, c) RGPD',
    s3li2: '— obligations légales, notamment les obligations de conservation commerciales et fiscales ainsi que les exigences douanières.',
    s3li3Law: 'Art. 6, § 1, f) RGPD',
    s3li3: '— intérêt légitime à la sécurité de nos systèmes, à la documentation des remises et à la prévention des abus.',
    s4Title: '4. Destinataires et sous-traitants',
    s4p: 'Nous faisons appel aux prestataires suivants :',
    s4li1: '— hébergement du site et exploitation de l’application.',
    s4li1todo: '[Conclure un contrat de sous-traitance et le confirmer ici.]',
    s4li2: '— base de données, authentification et stockage de fichiers. Localisation des serveurs : région de Francfort (UE).',
    s4li2todo: '[Conclure un contrat de sous-traitance et le confirmer ici.]',
    s4li3: '— envoi des e-mails transactionnels (confirmation de réservation, mises à jour de statut, devis).',
    s4li3todo: '[Conclure un contrat de sous-traitance et le confirmer ici.]',
    s4after:
      'Un transfert vers des pays tiers n’a lieu que sur la base de garanties appropriées (art. 44 et suivants RGPD).',
    s4todo: '[Vérifier et nommer les garanties concrètes.]',
    s5Title: '5. Suivi d’envoi',
    s5p: 'Le suivi public ne montre que le numéro d’envoi, le statut, le trajet, le nombre de colis, le poids total, un éventuel numéro de scellé et l’historique.',
    s5strong:
      'Les adresses, numéros de téléphone, adresses e-mail, prix et notes internes n’y sont jamais affichés.',
    s6Title: '6. Durée de conservation',
    s6p: 'Nous conservons les données d’envoi pendant la durée de l’exécution du contrat, puis dans le cadre des délais légaux de conservation (droit commercial et fiscal, en règle générale 6 ou 10 ans). Les photos de demandes d’objets encombrants qui n’aboutissent pas à un envoi sont supprimées après',
    s6todo: '[fixer un délai, p. ex. 6 mois]',
    s7Title: '7. Vos droits',
    s7li1: 'accès aux données vous concernant (art. 15 RGPD)',
    s7li2: 'rectification des données inexactes (art. 16 RGPD)',
    s7li3: 'effacement (art. 17 RGPD), sauf obligation de conservation contraire',
    s7li4: 'limitation du traitement (art. 18 RGPD)',
    s7li5: 'portabilité des données (art. 20 RGPD)',
    s7li6: 'opposition aux traitements fondés sur des intérêts légitimes (art. 21 RGPD)',
    s7li7: 'réclamation auprès d’une autorité de contrôle (art. 77 RGPD)',
    s7after: 'Un e-mail à {email} suffit pour toute demande.',
    s8Title: '8. Cookies et mesure d’audience',
    s8p: 'Nous n’utilisons que des cookies techniquement nécessaires — en l’occurrence le cookie de session pour les personnes connectées et un cookie qui retient la langue choisie. Il n’y a ni traçage ni analyse publicitaire.',
    s8todo:
      '[À adapter si des outils d’analyse sont introduits plus tard — une solution de consentement serait alors nécessaire.]',
    s9Title: '9. Sécurité des données',
    s9p: 'La transmission est chiffrée via HTTPS. L’accès aux données clients est limité par rôle et en outre appliqué au niveau de la base de données. Les photos et preuves de livraison se trouvent dans des espaces non publics et ne sont accessibles que par des liens signés à durée limitée.',
  },

  shipping: {
    title: 'Conditions d’expédition',
    intro: 'Ce qu’il faut savoir avant d’expédier — bref et pratique.',
    s1Title: 'Ce que nous transportons',
    s1p1: 'Colis, sacs, cartons, effets personnels et, sur accord, objets encombrants comme meubles, appareils ménagers ou vélos. Sont exclus les objets mentionnés sur la page',
    s1p2: '.',
    s2Title: 'Emballage',
    s2li1: 'Utilisez des cartons solides ou des sacs de voyage résistants.',
    s2li2: 'Rembourrez bien les objets fragiles — nous empilons dans le véhicule.',
    s2li3: 'Inscrivez sur chaque colis le nom et le numéro de téléphone du destinataire.',
    s2li4: 'Placez en plus les liquides dans un sac étanche.',
    s3Title: 'Dépôt ou enlèvement',
    s3p: 'Vous pouvez déposer votre envoi chez nous ou le faire enlever chez vous pour un forfait de {pickup}. Lors de l’enlèvement, nous vérifions le poids et le nombre de colis avec vous et documentons la prise en charge.',
    departuresTitle: 'Quand nous partons',
    departuresText:
      'Nous partons dès que le véhicule est suffisamment rempli. Il n’y a donc pas de jours de départ fixes — c’est ce qui permet ce prix, personne ne paie un trajet à moitié vide. Dès que votre envoi est chargé, vous le voyez dans le suivi.',
    s4Title: 'Documents',
    s4p: 'Nous transportons passeports, actes, contrats et procurations comme type d’envoi distinct, au prix forfaitaire de {documents} jusqu’à {documentsMax} kg. Ils doivent être réservés en tant qu’envoi de documents — nous ne pouvons pas les emporter en vrac dans un colis.',
    s5Title: 'Sacs de sécurité et scellés',
    s5p: 'Les envois volumineux sont scellés avec des sacs de sécurité numérotés. Le numéro (p. ex. SEC-583921) est enregistré et visible dans votre suivi. À la remise, vérifiez que le numéro et la fermeture sont intacts.',
    s6Title: 'Livraison',
    s6p: 'Nous livrons à l’adresse indiquée ou convenons d’un lieu de remise. Le destinataire doit être joignable par téléphone. À la remise, nous documentons la livraison par photo et/ou signature.',
    s7Title: 'Douane',
    s7p:
      'Les droits de douane ne sont pas compris dans le prix du transport. Selon la marchandise, des taxes peuvent s’appliquer à l’importation et sont à payer en plus.',
    s7li1: 'Les meubles ne sont acceptés que neufs et dans leur emballage d’origine.',
    s7li2: 'Les appareils électriques doivent être dédouanés.',
    s7li3:
      'D’autres articles peuvent également entraîner des frais de douane. En cas de doute, demandez-nous avant — c’est réglé plus vite qu’à la frontière.',
    s7todo:
      '[Faire compléter les indications douanières par un organisme compétent : quelles quantités sont admises comme effets de déménagement ou cadeaux ? Quels documents le client doit-il fournir ? Qui supporte les éventuels droits ?]',
  },

  liability: {
    title: 'Responsabilité & assurance',
    intro: 'Ce dont nous répondons — et ce que vous devriez couvrir vous-même.',
    s1Title: 'Principe',
    s1p: 'Nous répondons de la perte et de l’endommagement de l’envoi pendant la période où il est sous notre garde.',
    s1todo:
      '[Préciser le cadre de responsabilité : la CMR s’applique-t-elle avec 8,33 DTS par kilogramme, les §§ 407 et suivants du code de commerce allemand avec 8,33 unités de compte par kilogramme, ou une clause contractuelle différente ? À clarifier impérativement avec un avocat.]',
    s2Title: 'Montant maximal par envoi',
    s2todo:
      '[Indiquer un montant maximal concret, en accord avec votre assurance transport, p. ex. « jusqu’à 500 € par envoi ». Sans assurance souscrite, ne mentionner aucun montant ici.]',
    s3Title: 'Objets non assurés',
    s3p: 'Il n’existe aucune couverture d’assurance pour les espèces, bijoux, métaux précieux, titres, appareils électroniques sans leur emballage d’origine et denrées périssables. Merci de ne pas confier de tels objets.',
    s4Title: 'Emballage',
    s4p: 'Nous ne pouvons pas répondre des dommages résultant d’un emballage insuffisant par l’expéditeur. Vous trouvez des indications dans les conditions d’expédition.',
    s5Title: 'Déclaration de dommage',
    s5p1: 'Signalez un dommage visible',
    s5strong: 'directement lors de la remise',
    s5p2: 'et faites-le noter sur le procès-verbal de remise. Signalez-nous les dommages cachés dans un délai de',
    s5todo: '[indiquer un délai, p. ex. 7 jours]',
    s5p3: 'avec des photos.',
    s6Title: 'Force majeure',
    s6p: 'Nous ne répondons pas des retards ou dommages dus aux grèves, aux intempéries, aux fermetures de frontières, aux annulations de ferry, aux mesures administratives ou aux contrôles douaniers.',
    s7Title: 'Assurances nécessaires',
    s7todo:
      '[À clarifier avant le début de l’activité et à documenter ici : assurance responsabilité du transporteur, responsabilité civile professionnelle, éventuellement assurance des marchandises transportées, ainsi que l’autorisation selon le § 3 GüKG ou la licence communautaire de l’UE pour le transport routier de marchandises transfrontalier.]',
  },

  imprint: {
    title: 'Mentions légales',
    intro: 'Informations conformément au § 5 DDG (anciennement § 5 TMG).',
    s1Title: 'Fournisseur du service',
    s2Title: 'Contact',
    phone: 'Téléphone',
    email: 'E-mail',
    s3Title: 'Personne habilitée à représenter',
    s4Title: 'Numéro d’identification à la TVA',
    s4todo:
      '[Indiquer le numéro de TVA selon le § 27a de la loi allemande sur la TVA — ou une mention du régime des petites entreprises selon le § 19]',
    s5Title: 'Inscription au registre / autorisation',
    s5todo:
      '[Le cas échéant : indiquer le registre du commerce et le numéro d’immatriculation. Pour le transport routier commercial de marchandises, l’autorisation selon le § 3 GüKG ou la licence communautaire selon le règlement (CE) 1072/2009 doit également être indiquée. Faire vérifier par un avocat quelle autorisation votre modèle d’activité requiert.]',
    s6Title: 'Responsable éditorial',
    s8Title: 'Règlement des litiges de consommation',
    s8p: 'Nous ne sommes ni disposés ni tenus de participer à une procédure de règlement des litiges devant un organisme de médiation de la consommation.',
  },

  prohibited: {
    title: 'Marchandises interdites',
    intro:
      'Nous ne pouvons pas transporter ces objets. Merci de vérifier votre envoi avant de le remettre.',
    s1Title: 'Non autorisé',
    forExample: 'Par exemple : {examples}.',
    s2Title: 'En cas de doute, demandez-nous',
    s2p: 'Vous hésitez sur un objet ? Écrivez-nous à {email} ou appelez le {phone}. Une minute de question vaut mieux qu’un envoi bloqué en douane.',
    s3Title: 'Conséquences en cas de manquement',
    s3p: 'Si un envoi contient des marchandises interdites ou non déclarées, nous pouvons refuser le transport. L’expéditeur répond des dommages, saisies, amendes ou retards qui en résultent.',
    s3todo:
      '[Faire vérifier par un avocat les conséquences juridiques exactes et l’éventuelle prise en charge des frais, puis les préciser ici.]',
    s4Title: 'Cette liste n’est pas exhaustive',
    s4todo:
      '[La liste définitive doit être vérifiée au regard du droit douanier et du droit des transports — en particulier au regard des règles d’importation de l’administration douanière marocaine (ADII), des règles d’exportation allemandes et de la réglementation ADR sur les marchandises dangereuses. Les exigences de votre assurance transport doivent également y être intégrées.]',

    weaponsTitle: 'Armes, munitions et pièces d’armes',
    weaponsExamples: 'armes à feu, munitions, couteaux à caractère d’arme, gaz lacrymogène',
    weaponsNote: '',
    drugsTitle: 'Stupéfiants et substances illégales',
    drugsExamples: 'drogues de toute sorte, préparations non délivrables sur ordonnance',
    drugsNote: '',
    dangerousTitle: 'Marchandises dangereuses et substances facilement inflammables',
    dangerousExamples:
      'essence, gazole, alcool à brûler, bouteilles de gaz et gaz à briquet, feux d’artifice et pyrotechnie, peintures, vernis, solvants, acides et bases',
    dangerousNote:
      'Même des sprays et parfums apparemment inoffensifs comptent parfois comme marchandises dangereuses.',
    batteriesTitle: 'Piles au lithium en vrac et batteries endommagées',
    batteriesExamples:
      'batteries externes sans appareil, batteries gonflées ou endommagées, batteries de vélo électrique',
    batteriesNote: 'Merci de convenir avec nous à l’avance des appareils à batterie intégrée.',
    moneyTitle: 'Espèces, métaux précieux et objets de valeur',
    moneyExamples: 'espèces, lingots d’or et d’argent, bijoux de grande valeur, livrets d’épargne',
    moneyNote:
      'Il n’existe aucune couverture d’assurance pour les objets de valeur — ne les confiez jamais.',
    documentsTitle: 'Pièces d’identité et documents originaux dans un colis normal',
    documentsExamples: 'passeports, cartes d’identité, actes originaux',
    documentsNote:
      'Pas interdits en soi : le type d’envoi « Documents » existe précisément pour ces papiers, à prix forfaitaire. Ils ne doivent pas voyager en vrac dans un colis.',
    perishableTitle: 'Denrées périssables et animaux vivants',
    perishableExamples: 'viande et poisson frais, produits laitiers, plantes, animaux vivants',
    perishableNote: 'Les aliments emballés de longue conservation sont possibles sur accord.',
    counterfeitTitle: 'Marchandises contrefaites et non déclarées',
    counterfeitExamples:
      'contrefaçons de marques, cigarettes non taxées, alcool destiné à la revente',
    counterfeitNote: '',
    medicalTitle: 'Médicaments sur ordonnance sans justificatif',
    medicalExamples: 'médicaments en quantités commerciales, ordonnances de stupéfiants',
    medicalNote: 'Merci de déclarer à l’avance les petites quantités pour usage personnel.',
  },
};
