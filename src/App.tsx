import type { Component } from 'solid-js'

import Box from './components/Box'
import Dropdown from './components/Dropdown'
import Input from './components/Input'

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
      <Box>
        <Input
          icon='search'
          iconAfter='paper-airplane'
          placeholder='Search here…'
        />
      </Box>
    </div>
  )
}

export default App
