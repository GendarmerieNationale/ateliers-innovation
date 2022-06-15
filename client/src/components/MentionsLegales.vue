<template>
  <div class="mentionsLegales">
    <h2>Mentions Légales</h2>
    <section>
    <p>
      <b><u>Editeur</u></b>
    </p>
    <p>
      Service de la Transformation de la Gendarmerie Nationale<br/>
      4 rue Claude Bernard - 92130 ISSY-LES-MOULINEAUX
    </p>
    <p>
      <u>Directeur de publication</u> : Sandrine GUEBIN.
    </p>
  </section>

  <section>
    <p>
      <b><u>Hébergeur</u></b>
    </p>
    <p>
      STIG - Service du traitement de l'information Gendarmerie
      <br/>ROSNY-SOUS-BOIS
    </p>
  </section>

  <section>
    <p>
      <b><u>Réutilisation des données</u></b>
    </p>
    <p>
      Le code source du présent site est libre et accessible sur
      <a href="https://omnibus-pic.gendarmerie.fr/service-de-la-transformation">Omnibus</a>.
    </p>
  </section>

  <section>
    <p>
      <b><u>Protection des données</u></b>
    </p>
    <p>
      <b>Finalités</b>
    </p>
    <p>
      Ce site peut être amené à traiter des données à caractère personnel afin de poursuivre plusieurs finalités. À ce titre,
      il est conforme aux exigences de la loi n° 78-17 dite informatique et libertés et toutes les mesures de sécurité sont mises
      en oeuvre afin de garantir la confidentialité, l'intégrité et la disponibilité du traitement de vos données. Les traitements de données à caractère personnel sont nécessaires afin de poursuivre les finalités suivantes :
      <ul>
        <li>
          Assurer le suivi des formations : le site répertorie l'ensemble des formations dans l'enseignement supérieur
          suivis par les personnels de la GN ainsi que les sujets d'étude choisis;
        </li>
        <li>
          Assurer le suivi et la gestion des innovateurs : le site répertorie l'ensemble des innovations proposées afin de permettre
          à tout personnel de pouvoir en bénéficier;
        </li>
        <li>
          Animation de la communauté GENDFABLAB : le site permet à la communauté d'échanger et de partager l'ensemble de leurs créations;
        </li>
        <li>
          Permettre des rencontres (professionnelles ;-)) entre les personnels de la DGGN : la fonctionnalité LA PAUSE offre la possibilité de rencontrer, à l'aveugle,
          des personnes travaillant sur le site afin de favoriser les échanges entre les services;
        </li>
        <li>
          Animation de la communauté des veilleurs : permet de répertorier les idées de sujet d'étude proposées par des personnels de l'institution
          afin de favoriser la mise en relation et le travail collaboratif.
        </li>
      </ul>
    </p>
    <p>
      <b>Données concernées</b>
    </p>
    <p>
      Nom, prénom, NIGEND, grade, unité d'affectation et de manière facultative votre photographie présente dans votre FIR
    </p>
    <p>
      <b>Durée de conservation</b>
    </p>
    <p>
      Les données sont conservées jusqu'à la rupture de votre lien avec la Gendarmerie (en général, votre radiation des cadres). À l'issue,
      les données identifiantes (nom, prénom, NIGEND) sont anonymisées et les données restantes conservées (liste des innovations, des études suivies etc)
      afin de permettre la réalisation de statistiques et des études d'anticipation.
    </p>
    <p>
      <b>Vos droits</b>
    </p>
    <p>
      Vous pouvez exercer vos droits de rectification, modification et effacement, directement auprès du Service de la transformation
      en écrivant à l'adresse suivante : <a href="mailto:st.dggn@gendarmerie.interieur.gouv.fr?subject=Exercice%des%droits">st.dggn@gendarmerie.interieur.gouv.fr</a>.
    </p>
  </section>
  </div>
</template>

<script>

export default {
  name: 'MentionsLegales',
  setup() {
  },
};
</script>

<style scoped>
.mentionsLegales {
  font-size: 1.2em;
  font-family: 'Caviar Dreams';
  text-align: justify;
}

.mentionsLegales h2 {
  font-family: 'Champagne & Limousines';
  font-variant: small-caps;
}

.mentionsLegales p {
  text-align: justify;
  text-indent: 2em;
}
</style>
