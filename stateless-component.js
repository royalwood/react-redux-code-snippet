// @flow

import React from 'react'
import { Button } from 'react-formal'
import Spinner from 'components/Spinner'

type Props = {
  messages: Object,
  hint: string | HTMLElement,
  text: string | HTMLElement,
  isLoading: boolean,
  disabled: boolean
}

const AuthButton = ({ messages, hint, text, isLoading, disabled }: Props) => {
  const content = <div>{hint && <span className='button__hint'>{hint} </span>}{text}</div>
  const hasValidationErrors = messages && !!Object.keys(messages).length
  return (
    <Button
      className='button large expanded'
      type='submit'
      disabled={disabled || hasValidationErrors}
    >{isLoading ? <Spinner /> : content}</Button>
  )
}

export default AuthButton
