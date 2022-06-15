<template>
  <div
    class="votes"
    :key="`vote-${type}-${voteId}`">
    <span>
      <span
        class="vote"
        :class="{ selectionne: voteUser === 'POSITIF' }"
        @click="e => vote(e.target,voteId,'POSITIF')">
        <thumb-up
          class="lien like" />
      </span>
      {{ votes.POSITIF || 0 }}
    </span>
    <span>
      <span
        class="vote"
        :class="{ selectionne: voteUser === 'NEGATIF' }"
        @click="e => vote(e.target,voteId,'NEGATIF')">
        <thumb-down
          class="lien dislike" />
      </span>
      {{ votes.NEGATIF || 0 }}
    </span>
  </div>
</template>

<script>
import {
  defineComponent,
  onMounted,
  toRefs,
  computed,
  getCurrentInstance,
  ref,
  inject,
} from 'vue';
import { useStore } from 'vuex';
import {
  ThumbUp,
  ThumbDown,
} from 'mdue';

export default defineComponent({
  name: 'Votes',
  components: {
    ThumbUp,
    ThumbDown,
  },
  props: ['voteId', 'type'],
  setup(props) {
    const axios = inject('$axios');
    const store = useStore();
    const internalInstance = getCurrentInstance();
    const { emitter } = internalInstance.appContext.config.globalProperties;
    const connexion = computed(() => store.state.connexion);
    const { voteId, type } = toRefs(props);
    const votes = ref({
      POSITIF: 0,
      NEGATIF: 0,
    });
    const voteUser = ref('');

    async function fetchVotes(idVote, typeVote) {
      const res = await axios.get(`${process.env.VUE_APP_API_URL}/votes/${typeVote}/${idVote}`);
      res.data.forEach((v) => {
        votes.value[v.vote] = +v.nombre;
      });
    }

    async function verifVote(idVote) {
      const res = await axios.get(`${process.env.VUE_APP_API_URL}/votes/verif/${type.value}/${idVote}`);
      if (res.data.length > 0) {
        voteUser.value = res.data[0].vote;
      }
    }

    async function vote(elt, idVote, typeVote) {
      if (!elt.classList.contains('recherche')) {
        elt.classList.toggle('recherche');
        if (connexion.value.connecte) {
          const res = await axios.post(`${process.env.VUE_APP_API_URL}/votes/`, { id: idVote, type: type.value, vote: typeVote });
          // cette variable sert à voir quel est l'impact du vote sur le total
          let deltaVote = 0;
          if (res.data.length > 0) {
            votes.value[typeVote === 'POSITIF' ? 'POSITIF' : 'NEGATIF'] += 1;
            if (typeVote !== voteUser.value && voteUser.value !== '') {
              votes.value[typeVote === 'POSITIF' ? 'NEGATIF' : 'POSITIF'] -= 1;
            } else {
              deltaVote += 1;
            }
          } else {
            votes.value[typeVote === 'POSITIF' ? 'POSITIF' : 'NEGATIF'] -= 1;
            deltaVote -= 1;
          }
          voteUser.value = res.data;
          emitter.emit('actualiseBadge', {
            type: 'democrate',
            valeur: deltaVote,
          });
        } else {
          emitter.emit('popupConnexion');
        }
        elt.classList.toggle('recherche');
      }
    }

    onMounted(async () => {
      fetchVotes(voteId.value, type.value);
      verifVote(voteId.value, type.value);
    });

    return {
      connexion,
      votes,
      vote,
      voteUser,
    };
  },
});
</script>

<style scoped>
.vote {
  cursor: pointer;
}

@keyframes fade {
    from { opacity: 1.0; }
    50% { opacity: 0.2; }
    to { opacity: 1.0; }
}

.votes > span {
  margin: 0 5px;
}

.like, .dislike {
  width: 20px;
}

.selectionne .like {
  filter: invert(39%) sepia(67%) saturate(5710%) hue-rotate(124deg) brightness(98%) contrast(104%);
}

.selectionne .dislike {
  filter: invert(19%) sepia(66%) saturate(5280%) hue-rotate(354deg) brightness(77%) contrast(119%);
}

</style>
