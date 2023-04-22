import type { Component } from 'solid-js'

import Box from './components/Box'
import Dropdown from './components/Dropdown'

import styles from './App.module.css'

const App: Component = () => {
  return (
    <div class={styles.App}>
      <Box horizontal>
        <span>Horizontal</span>
        <span>Box</span>
      </Box>
      <Box>
        <Dropdown options={[]} />
      </Box>
    </div>
  )
}

export default App
