import { combineReducers } from "redux";

import { LOGIN_SUCCESS, LOGOUT_SUCCESS } from "./action";

const appInitialState = {
  isLogin: false
};

const appReducer = (state = appInitialState, { type, payload }) => {
  switch (type) {
    case LOGIN_SUCCESS:
      return {
        isLogin: true,
        info: payload
      };
    case LOGOUT_SUCCESS: {
      return appInitialState;
    }
    default:
      return state;
  }
};

export default combineReducers({
  app: appReducer
});
