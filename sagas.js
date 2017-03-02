// @flow

// Rules on how to organize this file: https://github.com/erikras/ducks-modular-redux

import { fromJS } from 'immutable'
import { takeLatest } from 'redux-saga'
import { call, put, select } from 'redux-saga/effects'
import request, { authRequest } from 'utils/request'
import { API_URL, REQUESTED, SUCCEDED, FAILED } from '~/constants'
import type { Action, State } from 'types/common'

// ------------------------------------
// Constants
// ------------------------------------
const PASSWORD_RECOVERY = 'FA/Auth/PASSWORD_RECOVERY'
const PASSWORD_RECOVERY_RESEND_SMS = 'FA/Auth/PASSWORD_RECOVERY_RESEND_SMS'
const BUILD_PASSWORD_RECOVERY_MODEL = 'FA/Auth/BUILD_PASSWORD_RECOVERY_MODEL'

// ------------------------------------
// Actions
// ------------------------------------
export const buildPasswordRecoveryModel = (query: Object, password: string) => ({
  type: BUILD_PASSWORD_RECOVERY_MODEL,
  payload: query,
  meta: password
})

export const requestPasswordRecovery = (code: string) => ({
  type: PASSWORD_RECOVERY + REQUESTED,
  payload: code
})
const passwordRecoverySucceded = () => ({
  type: PASSWORD_RECOVERY + SUCCEDED
})
const passwordRecoveryFailed = error => ({
  type: PASSWORD_RECOVERY + FAILED,
  payload: error
})

export const requestPasswordRecoveryResendSMS = () => ({
  type: PASSWORD_RECOVERY_RESEND_SMS + REQUESTED
})
const passwordRecoveryResendSMSSucceded = () => ({
  type: PASSWORD_RECOVERY_RESEND_SMS + SUCCEDED
})
const passwordRecoveryResendSMSFailed = error => ({
  type: PASSWORD_RECOVERY_RESEND_SMS + FAILED,
  payload: error
})

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = fromJS({
  isLoading: false,
  showSuccessMessage: false
})

export const reducer = (state: State = initialState, { type, payload, meta }: Action) => {
  switch (type) {
    case BUILD_PASSWORD_RECOVERY_MODEL:
      return state
        .mergeIn(['model'], {
          ReactivationGuid: payload.id,
          NewPassword: meta
        })
        .set('errorText', null)

    case PASSWORD_RECOVERY + REQUESTED:
      return state
        .mergeIn(['model'], { SmsCode: payload })
        .set('isLoading', true)
        .set('errorText', null)
    case PASSWORD_RECOVERY + SUCCEDED:
      return state
        .set('isLoading', false)
        .set('showSuccessMessage', true)
    case PASSWORD_RECOVERY + FAILED:
      return state
        .set('isLoading', false)
        .set('errorText', payload)

    case PASSWORD_RECOVERY_RESEND_SMS + REQUESTED:
      return state
        .set('isLoading', true)
    case PASSWORD_RECOVERY_RESEND_SMS + SUCCEDED:
      return state
        .set('isLoading', false)
    case PASSWORD_RECOVERY_RESEND_SMS + FAILED:
      return state
        .set('isLoading', false)
        .set('errorText', payload)

    default:
      return state
  }
}

// ------------------------------------
// Selectors
// ------------------------------------
const getPasswordRecoveryModel = state => state.getIn(['forgotPasswordRecover', 'model'])
const getPasswordRecoverId = state => state.getIn(['forgotPasswordRecover', 'model', 'ReactivationGuid'])

const passwordRecoveryRequest = data => authRequest(data, `${API_URL}/password/recover`)

// ------------------------------------
// Sagas
// ------------------------------------
function* passwordRecoveryWatcher (): Generator<Function, void, void> {
  yield takeLatest(PASSWORD_RECOVERY + REQUESTED, passwordRecoverySaga)
}
function* passwordRecoverySaga () {
  try {
    const passwordRecoveryModel = yield select(getPasswordRecoveryModel)
    const { Status, StatusAsUserFriendlyMessage } = yield call(passwordRecoveryRequest, passwordRecoveryModel)
    switch (Status) {
      case 0:
        yield put(passwordRecoverySucceded())
        break
      case 1:
        yield put(passwordRecoveryFailed(
          `Something went wrong. Please try again or contact your support helpdesk.
          Message: ${StatusAsUserFriendlyMessage}`
        ))
        break
      case 2: case 3:
        yield put(passwordRecoveryFailed(StatusAsUserFriendlyMessage))
        break
      default:
        yield put(passwordRecoveryFailed(
          `Unhandled passwordRecoveryRequest status ${Status}:
          ${StatusAsUserFriendlyMessage}.`
        ))
    }
  } catch (error) {
    yield put(passwordRecoveryFailed(error))
  }
}

function* passwordRecoveryResendSMSWatcher (): Generator<Function, void, void> {
  yield takeLatest(PASSWORD_RECOVERY_RESEND_SMS + REQUESTED, passwordRecoveryResendSMSSaga)
}
function* passwordRecoveryResendSMSSaga () {
  try {
    const passwordRecoverId = yield select(getPasswordRecoverId)
    yield call(request, { url: `${API_URL}/password/recover/resendsms?model.passwordRecoverId=${passwordRecoverId}` })
    yield put(passwordRecoveryResendSMSSucceded())
  } catch (error) {
    yield put(passwordRecoveryResendSMSFailed(error))
  }
}

export default [
  passwordRecoveryWatcher,
  passwordRecoveryResendSMSWatcher
]
