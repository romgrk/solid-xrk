let nextId = 1

export default function uniqueId() {
  return `x${nextId++}`
}
