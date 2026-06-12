import React, { Component } from 'react'
import './footer.css'

export default class Footer extends Component {
  render() {
    return (
      <footer className="footer">
        <span>© {new Date().getFullYear()} ISV Toolkit - iOnetech - Desarrollado por Matias Peñaloza</span>
      </footer>
    )
  }
}
