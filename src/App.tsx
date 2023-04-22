import type { Component } from 'solid-js'

import Box from './components/Box'
import Dropdown from './components/Dropdown'

import styles from './App.module.css'

const options = [
  { value: 1, label: 'One' },
  { value: 2, label: 'Two' },
  { value: 3, label: 'Three' },
]

const App: Component = () => {
  return (
    <div class={styles.App}>
      <Box horizontal>
        <span>Horizontal</span>
        <span>Box</span>
      </Box>
      <Box>
        <Dropdown options={options} />
      </Box>
    </div>
  )
}

export default App
