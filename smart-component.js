// @flow

import React, { Component } from 'react'
import Helmet from 'react-helmet'
import Auth from 'components/Auth'
import NoAccount from 'components/Auth/NoAccount'
import Form, { Field } from 'react-formal'
import Message from 'components/ValidationMessage'
import yup from 'yup'
import AuthButton from 'components/AuthButton'
import { defineMessages, injectIntl, FormattedMessage } from 'react-intl'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import { requestPasswordRequiredCheck, requestSignIn } from './sagas'

type Props = {
    intl: Object,
    router: Object,
    requestPasswordRequiredCheck: Function,
    requestSignIn: Function,
    passwordRequired: boolean,
    isLoading: boolean,
    errorText?: string
  }

class SignIn extends Component {
  props: Props

  state = {
    model: {
      username: '',
      password: ''
    }
  }

  handleChange = (model) => {
    const email = yup.string().email().required()
    if (model.username !== this.state.model.username) {
      email.isValid(model.username, (err, value) => {
        if (err) console.log(err.stack)
        if (value) {
          this.props.requestPasswordRequiredCheck(model.username)
        }
      })
    }
    this.setState({ model })
  }

  render () {
    const { intl: { formatMessage }, passwordRequired, requestSignIn, router, isLoading, errorText } = this.props
    const { model } = this.state
    const { title } = defineMessages({
      title: {
        id: 'containers.SignIn.title',
        defaultMessage: 'Sign In'
      }
    })
    const schema = yup.object({
      username: yup.string().required(),
      password: yup.string()
    })
    return (
      <Auth
        footer={<NoAccount />}
        errorText={errorText}
      >
        <Helmet title={formatMessage(title)} />
        <h5>
          <FormattedMessage
            id='containers.SignIn.header'
            defaultMessage='Hello! Welcome back.'
          />
        </h5>
        <p>
          <FormattedMessage
            id='containers.SignIn.text'
            defaultMessage='Sign into your account:'
          />
        </p>
        <Form
          className='auth__form'
          schema={schema}
          value={model}
          onChange={model => this.handleChange(model)}
          onSubmit={() => requestSignIn(router.location.query, model)}
        >
          <div className='formGroup'>
            <label htmlFor='username'>
              <FormattedMessage
                id='containers.SignIn.usernameInputLabel'
                defaultMessage='email/username'
              />
            </label>
            <Field
              className='auth__iconInput auth__iconInput--user input large'
              id='username'
              name='username'
              placeholder={formatMessage({
                id: 'containers.SignIn.usernameInputPlaceholder',
                defaultMessage: 'Enter your email or username'
              })}
            />
            <Message for='username' />
          </div>
          {passwordRequired && <div className='formGroup'>
            <div className='row'>
              <div className='column'>
                <label htmlFor='password'>
                  <FormattedMessage
                    id='containers.SignIn.passwordInputLabel'
                    defaultMessage='password'
                    />
                </label>
              </div>
              <div className='shrink column'>
                <label className='last'><Link to='/forgot-password'><strong>
                  <FormattedMessage
                    id='containers.SignIn.forgotPassword'
                    defaultMessage='Forgot password'
                    />
                </strong></Link></label>
              </div>
            </div>
            <Field
              className='auth__iconInput auth__iconInput--password input large'
              type='password'
              id='password'
              name='password'
              placeholder={formatMessage({
                id: 'containers.SignIn.passwordInputPlaceholder',
                defaultMessage: 'Enter password'
              })}
              />
            <Message for='password' />
          </div>}
          <AuthButton
            text={formatMessage({
              id: 'containers.SignIn.buttonText',
              defaultMessage: 'Sign In'
            })}
            isLoading={isLoading}
          />
        </Form>
      </Auth>
    )
  }
}

const mapStateToProps = (state) => ({
  passwordRequired: state.getIn(['signIn', 'passwordRequired']),
  isLoading: state.getIn(['signIn', 'isLoading']),
  errorText: state.getIn(['signIn', 'errorText'])
})
const mapDispatchToProps = (dispatch) => ({
  requestPasswordRequiredCheck: (email) => dispatch(requestPasswordRequiredCheck(email)),
  requestSignIn: (query, model) => dispatch(requestSignIn(query, model))
})

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(SignIn))
