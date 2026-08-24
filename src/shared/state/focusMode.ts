// Estado compartilhado do "modo foco" do quiz.
// O Quiz liga/desliga; o App esconde navbar/rodapé quando ligado.
let focus = false;
const listeners = new Set<() => void>();

export const focusStore = {
  get: () => focus,
  set: (v: boolean) => {
    if (focus !== v) {
      focus = v;
      listeners.forEach((l) => l());
    }
  },
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
};
