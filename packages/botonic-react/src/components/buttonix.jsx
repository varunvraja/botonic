export function hello() {
  console.log('hello buttonix')
  console.log('how are you?')
  const rand = Boolean(Math.round(Math.random()))
  if (rand) {
    console.log('true')
  } else {
    console.log('false')
  }
}

export function bye() {
  console.log('bye buttonix')
  console.log('see ya!')
}
