export const LOGIN_SUCCESS = "LOGIN_SUCCESS";
export const loginAction = payload => ({ type: LOGIN_SUCCESS, payload });

export const LOGOUT_SUCCESS = "LOGOUT_SUCCESS";
export const logoutAction = () => ({ type: LOGOUT_SUCCESS });
