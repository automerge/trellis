import { createStore } from 'redux'

const initialState = {}
initialState.lists = [
  {
    id: 1,
    title: "icebox"
  },
  {
    id: 2,
    title: "active"
  },
  {
    id: 3,
    title: "done"
  }
]

initialState.cards = [
  {
    id: 1,
    listId: 1,
    title: "Rewrite everything in Crystal"
  },
  {
    id: 2,
    listId: 1,
    title: "Solve AGI"
  },
  {
    id: 3,
    listId: 2,
    title: "Add more 'pop' to the landing page"
  },
  {
    id: 4,
    listId: 3,
    title: "Rewrite everything in Go"
  }
]

let store = createStore((state = initialState, action) => {
  return state
})

export default store
