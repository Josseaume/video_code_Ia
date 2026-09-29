// Tous les textes et chiffres de la vidéo — à adapter au vrai projet.
// ⚠️ Chiffres fictifs, pour la démonstration.
export const PROJECT = {
  name: ['oise', 'datapark'] as [string, string],
  tagline: 'Campus numérique bas carbone',
  hectares: 12,
  megawatts: 40,
  jobs: 150,
  homesHeated: 8000,
  parisDistance: '50 KM',
  site: {lon: 2.45, lat: 49.4, label: 'Le site'},
  cities: [
    {name: 'Beauvais', lon: 2.08, lat: 49.43, main: true},
    {name: 'Compiègne', lon: 2.83, lat: 49.42, main: true},
    {name: 'Creil', lon: 2.47, lat: 49.26},
    {name: 'Noyon', lon: 3.0, lat: 49.58},
  ],
  milestones: [
    {year: '2026', label: 'Concertation', photo: 'fields1'},
    {year: '2027', label: 'Permis & travaux', photo: 'crane'},
    {year: '2028', label: 'Raccordement', photo: 'power'},
    {year: '2029', label: 'Mise en service', photo: 'servers4'},
  ],
  verbs: ['HÉBERGER', 'CONNECTER', 'CHAUFFER', 'EMPLOYER'],
};
