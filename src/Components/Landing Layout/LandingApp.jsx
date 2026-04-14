import React from 'react'
import LandingHeader from './LandingHeader'
import LandingFooter from './LandingFooter'
import { Outlet } from 'react-router-dom'
import ScrollToHash from './ScrollToHash'

function LandingApp() {
  return (
    <>
    <ScrollToHash/>
    <LandingHeader/>
      <Outlet/>
    <LandingFooter/>
    </>
  )
}

export default LandingApp
