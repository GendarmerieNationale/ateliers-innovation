<template>
  <div
    class="bouton bouton-petit"
    @click="afficherDroits">
    <div class="boutonLogo">
      <account-key/>
      <span>
        Droits
      </span>
    </div>
  </div>

  <transition name="fade">
    <div
      class="overlay"
      v-if="afficherDroitsDialog"
      >
      <div
        class="fondOverlay"
        @click="afficherDroitsDialog = false">
      </div>
      <div class="contenuFormulaireOverlay">
        <h3>
          Droits
        </h3>
        <div>
          <p>
            {{ droits.introduction }}
          </p>
          <table
            class="tableau">
            <thead>
              <tr>
                <th>
                  Droit
                </th>
                <th>
                  <span
                    class="tooltip"
                    data-tooltip="Qui a le droit? chanterait Maurice">
                    Qui est autorisé?
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  class="pleineLigne"
                  colspan="2">
                  Droits par défaut
                </td>
              </tr>
              <tr
                v-for="(droit, i) in droits.defaut"
                :key="`droit-defaut-${i}`">
                <td
                  class="gauche">
                  {{ droit.libelle }}
                </td>
                <td
                  class="gauche">
                  <ul
                    v-if="droit.contenu instanceof Array">
                    <li
                      v-for="(ligne, j) in droit.contenu"
                      :key="`ligne-${i}-${j}`">
                      {{ ligne }}
                    </li>
                  </ul>
                  <span
                    v-else>
                    {{ droit.contenu }}
                  </span>
                </td>
              </tr>
              <tr>
                <td
                  class="pleineLigne"
                  colspan="2">
                  Droits paramétrables
                </td>
              </tr>
              <tr
                v-for="(droit, i) in droits.parametrables"
                :key="`droit-parametrables-${i}`">
                <td
                  class="gauche">
                  {{ droit.libelle }}
                </td>
                <td>
                  <ul
                    v-if="droit.complement">
                    <li>
                      {{ droit.complement }}
                    </li>
                  </ul>
                  <ul
                    v-if="droitsDonnes[droit.cle]?.unite?.length">
                    <u>Unités:</u>
                    <li
                      v-for="(code, i) in droitsDonnes[droit.cle].unite"
                      :key="`unite-ajouterUniteDemandeuse-${i}`">
                      <qui-est-ce
                        :nigendEnvoye="code"
                        type="unites"
                        :key="`unite-${code}`">
                      </qui-est-ce>
                    </li>
                  </ul>
                  <ul v-if="droitsDonnes[droit.cle]?.nigend?.length">
                    <u>Personnes:</u>
                    <li
                      v-for="(code, i) in droitsDonnes[droit.cle].nigend"
                      :key="`personne-ajouterUniteDemandeuse-${i}`">
                      <qui-est-ce
                        :nigendEnvoye="code"
                        :key="`personnes-${code}`">
                      </qui-est-ce>
                    </li>
                  </ul>
                </td>
              </tr>
            </tbody>
          </table>
          <fieldset
            v-if="administrateurDroits">
            <legend>
              {{ droits.nom }}
            </legend>
            Uniquement pour les administrateurs.
            <droits-tableau
              :categorie="type"
              :droits="droits.parametrables.map((d) => d.cle)" />
          </fieldset>
          <div>
            <span
              @click="afficherDroitsDialog = false"
              class="bouton bouton-petit">
              Fermer
            </span>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import {
  toRefs,
  ref,
  onMounted,
  inject,
  getCurrentInstance,
} from 'vue';
import {
  AccountKey,
} from 'mdue';
import DroitsTableau from '@/components/admin/DroitsTableau.vue';
import QuiEstCe from '@/components/QuiEstCe.vue';

export default {
  name: 'Droits',
  components: {
    AccountKey,
    DroitsTableau,
    QuiEstCe,
  },
  props: {
    type: {
      type: String,
      default: '',
    },
    racine: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    // eslint-disable-next-line
    const { type, racine } = toRefs(props);
    const afficherDroitsDialog = ref(false);
    const droits = ref({});
    const droitsDonnes = ref({});
    const axios = inject('$axios');
    const toast = inject('$toast');
    const internalInstance = getCurrentInstance();
    const { emitter } = internalInstance.appContext.config.globalProperties;
    const administrateurDroits = ref(false);

    import(`@/components/${racine.value}${type.value}/droits.js`)
      .then((d) => {
        droits.value = { ...d.droits };
      })
      .catch((e) => {
        console.log(e);
      });

    async function chargerAdministrateur() {
      await axios.get(`${process.env.VUE_APP_API_URL}/droits/administration/${type.value}`)
        .then((res) => {
          administrateurDroits.value = res.data;
        })
        .catch((e) => {
          toast(`⚠️ ${e.response.data.msg}`, {
            type: 'error',
          });
        });
    }

    async function chargerDroits() {
      await axios.get(`${process.env.VUE_APP_API_URL}/droits/recap/${type.value}/autorisation`)
        .then((res) => {
          res.data.forEach((droit) => {
            if (droitsDonnes.value[droit.action]) {
              droitsDonnes.value[droit.action][droit.type] = (droitsDonnes.value[droit.action][droit.type] || []).concat(droit.identifiant);
            } else {
              droitsDonnes.value[droit.action] = {
                [droit.type]: [droit.identifiant],
              };
            }
          });
        })
        .catch((e) => {
          console.log(e.response.data.msg);
        });
    }

    onMounted(async () => {
      await chargerDroits();
      await chargerAdministrateur();
      emitter.on('droitAjoute', ({
        categorie,
        data, type: typeAjoute, action, autorisation,
      }) => {
        if (categorie === type.value && autorisation) {
          if (droitsDonnes.value[action]) {
            droitsDonnes.value[action][typeAjoute] = (droitsDonnes.value[action][typeAjoute] || []).concat(data.identifiant);
          } else {
            droitsDonnes.value[action] = {
              [typeAjoute]: [data.identifiant],
            };
          }
        }
      });
      emitter.on('droitSupprime', ({
        categorie,
        type: typeAjoute, action, identifiant,
      }) => {
        if (categorie === type.value) {
          droitsDonnes.value[action][typeAjoute] = [...droitsDonnes.value[action][typeAjoute].filter((x) => x !== identifiant)];
        }
      });
    });

    function afficherDroits() {
      afficherDroitsDialog.value = true;
    }

    return {
      afficherDroits,
      afficherDroitsDialog,
      droits,
      droitsDonnes,
      administrateurDroits,
    };
  },
};
</script>

<style scoped>
ul {
  list-style-type: circle !important;
}
</style>
