import { computed } from 'vue';
/* eslint-disable */
export default function useModelWrapper(props, emit, name = 'modelValue') {
  return computed({
    get: () => props[name],
    set: (value) => emit(`update:${name}`, value),
  });
}
/* eslint-enable */
