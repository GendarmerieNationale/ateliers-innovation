<template>
  <div
    v-if="consignes.length > 0"
    class="consignes">
      <fieldset
        class="consigneImprimante"
        v-for="consigne in consignes"
        :key="`consigne-${consigne.imprimante}-${nom}`">
        <legend>{{ consigne.imprimante }}</legend>
        <p>
          <label>Technologie:</label> {{ consigne.technologie }}
        </p>
        <p>
          <label>Matériaux:</label> {{ consigne.materiaux }}
        </p>
        <table
          class="tableau">
          <thead>
            <tr>
              <th
                colspan="2">
                Paramètres
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(valeur, param) in consigne.parametres"
              :key="`param-${consigne.imprimante}-${nom}-${param}`">
              <td>
                {{ paramsClairs[param] }}
              </td>
              <td>
                <i>{{ valeur }}</i>
              </td>
            </tr>
          </tbody>
        </table>
      </fieldset>
  </div>
  <div
    v-else
    class="msg erreur">
    Pas de consigne d'impression trouvée pour ce fichier
  </div>
</template>

<script>
import {
  inject,
  toRefs,
  onMounted,
  ref,
} from 'vue';

export default {
  name: 'GendfablabImpression',
  props: {
    id: {
      type: Number,
      default: 0,
    },
    nom: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    // eslint-disable-next-line
    const { id, nom } = toRefs(props);
    const axios = inject('$axios');
    const toast = inject('$toast');
    const consignes = ref([]);
    const paramsClairs = {
      buse: 'Buse',
      temperatureExtrudeur: 'Température de l\'extrudeur',
      hauteurCouche: 'Hauteur de la couche',
      temperaturePlateau: 'Température du plateau',
      vitesse: 'Vitesse',
      pourcentageRemplissage: 'Pourcentage de remplissage',
      geometrieRemplissage: 'Géométrie de remplissage',
      epaisseurCoque: 'Épaisseur de la coque',
      vitesseVentilateur: 'Vitesse du ventilateur',
      impressionAvecSupports: 'Impression avec supports',
      adherence: 'Adhérence',
      parametresParticuliers: 'Paramètres particuliers',
    };

    async function chargerConsignes() {
      await axios.get(
        `${process.env.VUE_APP_API_URL}/outils/communautes/gendfablab/impression/${id.value}/${nom.value}`,
      )
        .then((res) => {
          consignes.value = [...res.data.impression];
        })
        .catch((e) => {
          toast(`⚠️ ${e.response.data.msg}`, {
            type: 'error',
          });
        });
    }

    onMounted(async () => {
      await chargerConsignes();
    });

    return {
      consignes,
      paramsClairs,
    };
  },
};
</script>

<style scoped>
.consignes {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
}

.consigneImprimante {
  background-color: #fffb;
  max-width: 30%;
}

.consigneImprimante legend {
  font-weight: bold;
}

.consigneImprimante label {
  font-weight: bold;
}
</style>
