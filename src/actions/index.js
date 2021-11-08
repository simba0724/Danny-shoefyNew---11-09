export const CONNECT_WALLET = 'CONNECT_WALLET'

let nextTodoId = 0;

export function connectWallet(text) {
   return {
      type: CONNECT_WALLET,
      id: nextTodoId++,
      text
   };
}