import { programV11 } from './program-v11.js';

const updates: Record<string, { title?: string; description: string; location?: string }> = {
  ceremonie: {
    description: 'Le grand moment est arrivé ! Retrouvez-nous pour célébrer notre union et partager cette cérémonie de mariage.',
    location: 'Espace extérieur',
  },
  'grand-jeu': {
    description: 'Un jeu surprise pour découvrir si vous connaissez vraiment vos mariés favoris !',
    location: 'Espace extérieur',
  },
  restauration: {
    description: 'Les stands ouvrent leurs portes ! Composez votre repas selon vos envies et dégustez-le à votre rythme, où vous voulez. Ici, chacun choisit son menu, son horaire et son coin préféré.',
    location: 'Stands de nourriture',
  },
  bal: {
    description: 'Place à la danse ! L’équipe Lip-sync challenge ouvre le bal avec une chorégraphie pour lancer la soirée.',
    location: 'Chapiteau principal',
  },
  'annees-80-90-2000': {
    title: 'DJ Set - Années 80, 90 et 2000',
    description: 'Vos tubes préférés des années 80, 90 et 2000, mixés par votre plus beau DJ. Préparez-vous à chanter et à danser !',
    location: 'Chapiteau principal',
  },
  'reprise-annees-80-90-2000': {
    title: 'DJ Set - Années 80, 90 et 2000',
    description: 'Vos tubes préférés des années 80, 90 et 2000, mixés par votre plus beau DJ. Préparez-vous à chanter et à danser !',
    location: 'Chapiteau principal',
  },
  'surprise-dj-set': {
    description: 'Les mariés prennent les platines ! Au programme, un DJ set de folie et une sélection de tubes pour vous faire danser.',
    location: 'Chapiteau principal',
  },
  'free-playlist': {
    description: 'C’est VOTRE moment ! Vos musiques, votre vibe : faites résonner les morceaux qui vous ressemblent.',
    location: 'Chapiteau principal',
  },
  rock: {
    title: 'DJ Set - Rock’n’Roll',
    description: 'Les meilleurs titres rock, punk rock et metal, réunis juste pour vous. Venez donner de la voix !',
    location: 'Chapiteau principal',
  },
  'techno-dj-set': {
    title: 'DJ Set Techno des mariés',
    description: 'Vos mariés préférés reviennent aux platines pour un DJ set techno déchaîné. Gardez un peu d’énergie, ça va secouer !',
    location: 'Chapiteau principal',
  },
  rave: {
    title: 'DJ Set techno',
    description: 'La techno prend toute sa place ! De la tech house au hardcore en passant par la bounce, il y en aura pour tous les goûts.',
    location: 'Chapiteau principal',
  },
  'coupure-du-son': {
    description: 'Il est temps de couper les enceintes. Il nous reste encore une heure pour terminer la soirée tranquillement et profiter des derniers instants ensemble.',
  },
  fermeture: {
    description: 'Il est l’heure d’aller dormir ! Merci d’avoir fait vibrer cette journée avec nous. Rentrez bien et faites de beaux rêves.',
  },
};

export const programV12 = programV11.map(moment => ({ ...moment, ...updates[moment.id] }));
