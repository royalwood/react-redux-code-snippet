import React from 'react'
import { shallow, render } from 'enzyme'
import AuthButton from '../AuthButton'
import Spinner from 'components/Spinner'

describe('<AuthButton />', () => {
  it('should render <Spinner /> if `isLoading` prop is provided', () => {
    const renderedComponent = shallow(
      <AuthButton
        text='Some text'
        isLoading
      />
    )
    expect(renderedComponent.find(Spinner).length).toEqual(1)
  })

  it('should not render <Spinner /> if `isLoading` prop is not provided', () => {
    const renderedComponent = shallow(
      <AuthButton
        text='Some text'
      />
    )
    expect(renderedComponent.find(Spinner).length).toEqual(0)
  })

  it('should be disabled if messages object has keys', () => {
    const renderedComponent = render(
      <AuthButton
        text='Some text'
        messages={{ foo: 'bar' }}
      />
    )
    expect(renderedComponent.find('button').prop('disabled')).toEqual(true)
  })

  it('should not be disabled if messages object has no keys', () => {
    const renderedComponent = render(
      <AuthButton
        text='Some text'
        messages={{}}
      />
    )
    expect(renderedComponent.find('button').prop('disabled')).toEqual(false)
  })

  it('should render provided text', () => {
    const renderedComponent = render(
      <AuthButton
        text='Some text'
      />
    )
    expect(renderedComponent.text()).toContain('Some text')
  })

  it('should render provided hint', () => {
    const renderedComponent = render(
      <AuthButton
        text='Some text'
        hint='Some hint'
      />
    )
    expect(renderedComponent.text()).toContain('Some hint')
  })

  it('should render hint wrapper if provided', () => {
    const renderedComponent = shallow(
      <AuthButton
        text='Some text'
        hint='Some hint'
      />
    )
    expect(renderedComponent.find('.button__hint').length).toEqual(1)
  })
})
