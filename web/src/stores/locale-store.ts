// import { Dispatch } from 'redux';
// import { Clips } from './clips';

// export namespace LocaleStore {
//   // Define the type for the state
//   export type State = string;

//   // Enum for action types
//   enum ActionType {
//     SET = 'SET_LOCALE',
//   }

//   // Interface for the set action
//   interface SetAction {
//     type: ActionType.SET;
//     locale: string;
//   }

//   // Union type for all possible actions
//   export type Action = SetAction;

//   // Action creators
//   export const actions = {
//     set:
//       (locale: string) =>
//       (dispatch: Dispatch<SetAction>) => {
//         // Access the current state directly from the store
//         console.log(
//           "Refilling cache"
//         )
//         Clips.actions.refillCache(locale)

//         dispatch({
//           type: ActionType.SET,
//           locale,
//         });
//       },
//   };

//   // Reducer function
//   export function reducer(state: State = 'en', action: Action): State {
//     switch (action.type) {
//       case ActionType.SET:
//         return action.locale;

//       default:
//         return state;
//     }
//   }


//   export const selectors = {
//     locale: (state: { locale: State }) => state.locale,
//   };
// }
