<template>
  <div
    v-if="(!multiple && (fichiersJoints.length === 0)) || multiple"
    class="dropbox">
    <input type="file"
      :multiple="multiple"
      :name="uploadFieldName"
      :disabled="isUploading"
      @change="filesChange($event.target.name, $event.target.files);
      fileCount = $event.target.files.length"
      class="input-file">
    <p v-if="isInitial">
      Glissez {{ multiple ? 'vos' : 'votre' }}
      fichier{{ multiple ? 's' : '' }} ici
      <br>ou<br/>cliquez pour parcourir
    </p>
    <p v-if="isUploading">
      Chargement de {{ fileCount }} fichiers...
    </p>
  </div>
  <div
    class="fichiersCharges"
    v-if="fichiersJoints.length > 0">
    Fichier{{ fichiersJoints.length > 1 ? 's' : '' }}
    chargé{{ fichiersJoints.length > 1 ? 's' : '' }}:
    <table>
      <thead>
        <tr>
          <th>

          </th>
          <th>
            Nom du fichier
          </th>
          <th v-if="description">
            Description
          </th>
          <th>
            Taille
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(fichier, i) in fichiersJoints"
          :key="`fichier-${i}`"
          :class="{ encours: suppression.indexOf(i) >= 0 }"
          >
          <td>
            <a @click="supprimerFichierJoint(i)" style="cursor:pointer;">❌</a>
          </td>
          <td>
            <a target="_blank"
              :href="`${apiUrl}/fichiers/telechargement/${fichier.id}/${fichier.nom}`">
              {{ fichier.nom }}
            </a>
          </td>
          <td v-if="description">
            <span v-if="fichier.encours">transfert en cours</span>
            <input
              class="descriptionFichier"
              v-if="!fichier.encours"
              v-model="uploadedFiles[fichier.nom].description" />
          </td>
          <td>
            {{ fichier.size }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <!-- <p>
    {{ JSON.stringify(fichiersInitiaux) }}
  </p> -->
  <!--
  <p>
    {{ JSON.stringify(fichiersJointsParent) }}
  </p>
  <p>
    {{ JSON.stringify(fichiersJoints) }}
  </p>
  <p>
    {{ JSON.stringify(uploadedFiles) }}
  </p> -->
</template>

<script>
import {
  defineComponent,
  computed,
  ref,
  onMounted,
  watch,
  inject,
} from 'vue';
import useModelWrapper from '@/utils/modelWrapper';

export default defineComponent({
  name: 'FichiersJoints',
  props: {
    reset: {
      type: Number,
      default: Date.now(),
    },
    fichiersInitiaux: {
      type: Array,
      default: () => [],
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    description: {
      type: Boolean,
      default: true,
    },
    modelValue: Array,
    lien: {
      type: Object,
      default: () => ({
        type: '',
        id: '',
      }),
    },
  },
  setup(props, { emit }) {
    // const { multiple } = props;
    const toast = inject('$toast');
    const axios = inject('$axios');
    const suppression = ref([]);
    const apiUrl = process.env.VUE_APP_API_URL;
    const uploadedFiles = ref({});
    const uploadFieldName = ref('hihi');
    const fileCount = ref(0);
    const STATUS_INITIAL = 0;
    const STATUS_UPLOADING = 1;
    const STATUS_UPLOADED = 2;
    const currentStatus = ref(null);
    const isInitial = computed(() => currentStatus.value === STATUS_INITIAL);
    const isUploading = computed(() => currentStatus.value === STATUS_UPLOADING);
    const isUploaded = computed(() => currentStatus.value === STATUS_UPLOADED);

    const fichiersJointsParent = useModelWrapper(props, emit);

    async function traiterFichier(i) {
      return new Promise((resolve, reject) => {
        if (i.size > 5000000) {
          toast(`⚠️ Fichier trop gros: ${i.name}`, {
            type: 'error',
          });
          reject(new Error({ name: i.name, erreur: 'Fichier trop gros' }));
        } else if (uploadedFiles.value[i.name]) {
          // console.log(`UPLOADING: ${i.name}`);
          if (uploadedFiles.value[i.name].statut === STATUS_UPLOADING) {
            reject(new Error('Fichier en cours d\'envoi'));
          }
          if (uploadedFiles.value[i.name].statut === STATUS_UPLOADED) {
            reject(new Error('Fichier déjà envoyé'));
          }
        } else {
          uploadedFiles.value[i.name] = {};
          uploadedFiles.value[i.name].statut = STATUS_UPLOADING;
          uploadedFiles.value[i.name].size = i.size;
          const formData = new FormData();
          formData.append('file', i);
          axios.post(
            `${process.env.VUE_APP_API_URL}/fichiers/envoi`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            },
          )
            .then((msg) => {
              uploadedFiles.value[i.name].description = i.name;
              uploadedFiles.value[i.name].id = msg.data.id;
              uploadedFiles.value[i.name].uuid = msg.data.uuid;
              uploadedFiles.value[i.name].size = msg.data.size;
              uploadedFiles.value[i.name].type = msg.data.type;
              uploadedFiles.value[i.name].statut = STATUS_UPLOADED;
              // console.log(JSON.stringify(uploadedFiles.value));
              resolve(msg);
            })
            .catch((e) => {
              let err = 'Erreur serveur';
              if (e.response) {
                err += `: ${e.response.data}`;
              }
              // console.log(err);
              reject(new Error({ name: i.name, erreur: err }));
            });
        }
      });
    }

    async function filesChange(fieldName, fileList) {
      if (!fileList.length) return;
      currentStatus.value = STATUS_UPLOADING;
      await Promise.allSettled(Array.from(fileList, (x) => traiterFichier(x)))
        .then(() => {
          currentStatus.value = STATUS_INITIAL;
          // console.log(r);
        });
    }

    function formatBytes(bytes, decimals = 2) {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return `${parseFloat((bytes / (k ** i)).toFixed(dm))} ${sizes[i]}`;
    }

    const fichiersJoints = computed(() => {
      const tab = Object.entries(uploadedFiles.value).map(
        ([key, value]) => ({
          id: value.id,
          uuid: value.uuid,
          nom: key,
          description: value.description,
          size: formatBytes(value.size),
          type: value.type,
          encours: value.statut === STATUS_UPLOADING,
        }),
      );
      // fichiersJointsParent.value = [...tab];
      return tab;
    });

    async function supprimerFichierJoint(i) {
      const t = fichiersJoints.value[i].id;
      if (suppression.value.indexOf(t) >= 0) {
        toast(`⚠️ Suppression déjà en cours: ${fichiersJoints.value[i].nom}`, {
          type: 'error',
        });
        return false;
      }
      suppression.value.push(t);
      await axios.post(
        `${process.env.VUE_APP_API_URL}/fichiers/supprimer`,
        {
          id: fichiersJoints.value[i].id,
          nom: fichiersJoints.value[i].nom,
          uuid: fichiersJoints.value[i].uuid,
          lien: props.lien,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
        .then(() => {
          delete uploadedFiles.value[fichiersJoints.value[i].nom];
          try {
            suppression.value = suppression.value.filter((x) => x !== t);
          } catch (err) {
            toast(`⚠️ ${err}`, {
              type: 'error',
            });
          }
          return true;
        })
        .catch((e) => {
          toast(`⚠️ ${e.response.data}`, {
            type: 'error',
          });
          return false;
        });
      return true;
    }

    // pour charger les fichiers initiaux si jamais il y en a
    function chargerFichiersInitiaux() {
      if (props.fichiersInitiaux && props.fichiersInitiaux.length > 0) {
        props.fichiersInitiaux.forEach((item) => {
          uploadedFiles.value[item.nom] = {
            statut: STATUS_UPLOADED,
            id: item.id,
            uuid: item.uuid,
            description: item.description,
            size: item.size,
            type: item.type,
          };
        });
      }
    }

    // il est possible que les fichiers arrivent après
    watch(() => props.fichiersInitiaux, () => {
      chargerFichiersInitiaux();
    });

    // si on met un reset, les fichiers s'effacent
    watch(() => props.reset, () => {
      uploadedFiles.value = {};
    });

    watch(fichiersJoints, (newValue) => {
      fichiersJointsParent.value = [...newValue];
    });

    chargerFichiersInitiaux();

    onMounted(async () => {
      currentStatus.value = STATUS_INITIAL;
    });

    return {
      suppression,
      fichiersJointsParent,
      apiUrl,
      currentStatus,
      uploadedFiles,
      fichiersJoints,
      uploadFieldName,
      isUploading,
      isInitial,
      isUploaded,
      fileCount,
      filesChange,
      supprimerFichierJoint,
    };
  },
});
</script>

<style scoped>
@keyframes fade {
  from { opacity: 1.0; }
  50% { opacity: 0.4; }
  to { opacity: 1.0; }
}

.enCours {
  animation:fade 1000ms infinite;
}
.dropbox {
  outline: 2px dashed grey;
  outline-offset: -10px;
  background: lightcyan;
  color: dimgray;
  padding: 10px 10px;
  min-height: 200px;
  position: relative;
  cursor: pointer;
  width: 90%;
  margin: 0 auto;
}

.input-file {
  opacity: 0;
  width: 100%;
  height: 100%;
  position: absolute;
  cursor: pointer;
  left: 0;
  top: 0;
}

.dropbox:hover {
  background: lightblue;
}

.dropbox p {
  font-size: 1.2em;
  text-align: center;
  padding: 50px 0;
}

.fichiersCharges, .fichiersCharges table {
  width: 100%;
}

.descriptionFichier {
  width: 100%;
}
</style>
