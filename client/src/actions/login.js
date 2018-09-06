import axios from "axios";

export const LOGIN_SUCCESS = "LOGIN_SUCCESS";
const setUserInformation = user => ({
  type: LOGIN_SUCCESS,
  user
});

export const LOGIN_FAILURE = "LOGIN_FAILURE";
const setLoginError = message => ({
  type: LOGIN_FAILURE,
  message
});

export const loginUser = (email, password) => {
  return dispatch => {};
};
