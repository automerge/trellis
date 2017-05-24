import uuid from './uuid'

export default function() {
  let lists = [  { id: uuid(), title: "This Week" },
                 { id: uuid(), title: "Done" },
                 { id: uuid(), title: "Soon" }      ]

  let cards = [ { id: uuid(),
                  listId: lists[0].id,
                  title: "Hello world",
                  assigned: {} } ]

  return { lists: lists, cards: cards }
}
