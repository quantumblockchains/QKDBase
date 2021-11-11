export const generateRandomBinaryArray = (length: number) =>
  new Array(length).fill(1).map(() => (Math.random() >= .5) ? 1 : 0);