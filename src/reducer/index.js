import { combineReducers } from 'redux'
import { Wallet } from '../components/wallet';

const initialState = new Wallet()

function wallet(state = initialState, action) {
   switch (action.type) {
      default:
         return state
   }
}

const todoApp = combineReducers({
   wallet
})

export default todoApp