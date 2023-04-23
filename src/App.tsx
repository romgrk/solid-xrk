import { createSignal } from 'solid-js'
import type { Component } from 'solid-js'

import Box from './components/Box'
import Button from './components/Button'
import Dropdown from './components/Dropdown'
import Input from './components/Input'

import styles from './App.module.css'

const options = [
  { value: 1, label: 'One' },
  { value: 2, label: 'Two' },
  { value: 3, label: 'Three' },
]

// Select components:
//  - Dropdown menu (action, submenus)
//  - Dropdown select (button)
//  - Combobox select (input)
//  - Autocomplete

const App: Component = () => {
  const [value, setValue] = createSignal('')

  return (
    <div class={styles.App}>
      <Box horizontal>
        <span>Horizontal</span>
        <span>Box</span>
      </Box>
      <Box>
        <Button.Group>
          <Button>A</Button>
          <Button>B</Button>
          <Button>C</Button>
        </Button.Group>
      </Box>
      <Box>
        <Dropdown options={options} />
      </Box>
      <Box>
        <Dropdown input options={options} />
      </Box>
      <Box vertical>
        <Box>
          <Input
            icon='search'
            iconAfter='paper-airplane'
            placeholder='Search here…'
            value={value()}
            onChange={setValue}
          />
        </Box>
      </Box>
    </div>
  )
}

export default App
